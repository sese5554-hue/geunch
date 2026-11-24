import 'dotenv/config';
import assert from'node:assert/strict';import{randomUUID,createHash}from'node:crypto';
import{expect}from'@playwright/test';
import{createPool,MariaSessions}from'../../server/runtime';
import{MariaProfiles}from'../../server/profile';import{createApp}from'../../server/app';import{openBrowser}from'./runtime';
const pool=createPool(),sessions=new MariaSessions(pool),id='test-'+randomUUID();
const tokens:string[]=[];let browser:Awaited<ReturnType<typeof openBrowser>>|undefined;
try{
  await pool.query("INSERT INTO users(id,name,phone,role) VALUES(?,'확인용 사용자','01012345678','guest')",[id]);
  await pool.query("INSERT INTO verifications(user_id,kind,status,expires_at,development) VALUES(?,'identity','verified',NULL,TRUE),(?,'neighborhood','verified','2020-01-01',TRUE)",[id,id]);
  const options={profiles:new MariaProfiles(pool),sessions,developmentLogin:true,origin:''};
  browser=await openBrowser(createApp(options),origin=>{options.origin=origin;});
  const{page,base,apiBase}=browser;
  assert.equal((await fetch(apiBase+'/api/me')).status,401);
  await page.goto(base);await expect(page.getByRole('heading',{name:'로그인이 필요해요'})).toBeVisible();
  await page.getByRole('button',{name:'개발 게스트로 시작'}).click();await expect(page.getByRole('heading',{name:'개발 게스트님'})).toBeVisible();
  await page.getByRole('button',{name:'로그아웃',exact:true}).click();await expect(page.getByRole('heading',{name:'로그인이 필요해요'})).toBeVisible();
  const token=await sessions.issue(id);tokens.push(token);
  await page.context().addCookies([{name:'geuncha_session',value:token,url:base+'/api',httpOnly:true,sameSite:'Strict'}]);
  await page.reload();await expect(page.getByRole('heading',{name:'확인용 사용자님'})).toBeVisible();await expect(page.getByText('010-****-5678',{exact:true})).toBeVisible();
  const response=await fetch(apiBase+'/api/me?userId=demo-guest',{headers:{Cookie:'geuncha_session='+token}});const profile=await response.json();assert.equal(profile.id,id);assert.equal(JSON.stringify(profile).includes('01012345678'),false);assert.equal(profile.verifications.find((v:{kind:string})=>v.kind==='neighborhood').status,'expired');assert.equal(profile.verifications.find((v:{kind:string})=>v.kind==='license').status,'pending');
  await page.screenshot({path:'docs/screenshots/37-profile.png',fullPage:true});
  await pool.query("UPDATE users SET name='바꾼 이름' WHERE id=?",[id]);
  await page.getByRole('button',{name:'다시 불러오기',exact:true}).click();await expect(page.getByRole('heading',{name:'바꾼 이름님'})).toBeVisible();
  await page.route('**/api/me',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'내 정보를 불러오지 못했습니다.'})}));
  await page.getByRole('button',{name:'다시 불러오기',exact:true}).click();await expect(page.getByRole('alert')).toContainText('내 정보를 불러오지 못했습니다.');
  await page.screenshot({path:'docs/screenshots/37-error.png',fullPage:true});
  await page.unroute('**/api/me');await page.getByRole('button',{name:'다시 불러오기',exact:true}).click();await expect(page.getByRole('heading',{name:'바꾼 이름님'})).toBeVisible();
  await page.getByRole('button',{name:'로그아웃',exact:true}).click();await expect(page.getByRole('heading',{name:'로그인이 필요해요'})).toBeVisible();await expect(page.getByText('010-****-5678',{exact:true})).toHaveCount(0);
  assert.equal((await fetch(apiBase+'/api/me',{headers:{Cookie:'geuncha_session='+token}})).status,401);
  console.log('확인 통과: 로그인 전 안내, 개발 로그인, 실제 DB 내 정보, 전화번호 가림, 인증 만료, 갱신, 실패·재시도, 로그아웃 세션 폐기');
}finally{
  await browser?.close();for(const token of tokens)await pool.query('DELETE FROM sessions WHERE token_hash=?',[createHash('sha256').update(token).digest('hex')]);await pool.query('DELETE FROM users WHERE id=?',[id]);await pool.end();
}
