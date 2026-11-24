import{useEffect,useRef,useState}from'react';
import{api,ApiError}from'./api';import{statusLabels,verificationLabels,type Profile as UserProfile}from'../shared/profile';
type Session={user:{id:string;role:string}|null;developmentLogin:boolean};
export function Profile(){
  const[profile,setProfile]=useState<UserProfile|null>(null),[session,setSession]=useState<Session|null>(null);
  const[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  const pending=useRef(false);
  useEffect(()=>{
    const controller=new AbortController();setLoading(true);setError('');setProfile(null);
    (async()=>{const current=await api<Session>('/session',{signal:controller.signal});if(controller.signal.aborted)return;setSession(current);if(current.user){const value=await api<UserProfile>('/me',{signal:controller.signal});if(!controller.signal.aborted)setProfile(value);}})()
      .catch(reason=>{if(controller.signal.aborted)return;if(reason instanceof ApiError&&reason.status===401)setSession(current=>current?{...current,user:null}:null);else setError(reason instanceof Error?reason.message:'내 정보를 불러오지 못했습니다.');})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[retry]);
  useEffect(()=>{const refresh=()=>{if(!pending.current)setRetry(value=>value+1);};window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh);},[]);
  async function changeSession(path:string){if(pending.current)return;pending.current=true;setBusy(true);setError('');try{await api(path,{method:'POST'});setProfile(null);setRetry(value=>value+1);}catch(reason){setError((reason as Error).message);}finally{pending.current=false;setBusy(false);}}
  return <main className="page"><a href="/" className="brand">근차 <span>MY</span></a>
    <header><p className="eyebrow">마이페이지</p><h1>내 정보</h1><p>내 정보와 인증 상태를 확인하세요.</p></header>
    {loading&&<p role="status">내 정보를 불러오고 있어요.</p>}
    {error&&<div role="alert" className="message error">{error}<button className="secondary" onClick={()=>setRetry(value=>value+1)}>다시 불러오기</button></div>}
    {!loading&&!error&&session&&!session.user&&<section className="card"><h2>로그인이 필요해요</h2><p>로그인하면 내 정보와 인증 상태를 볼 수 있어요.</p>{session.developmentLogin&&<><p className="hint">개발 계정으로 기능을 확인할 수 있어요.</p><button disabled={busy} onClick={()=>void changeSession('/dev/session')}>개발 게스트로 시작</button></>}</section>}
    {!loading&&profile&&<><section className="card"><div className="row"><h2>{profile.name}님</h2><span className="badge">{profile.activeRole==='host'?'호스트':'게스트'}</span></div><p>{profile.phone}</p><button className="secondary" onClick={()=>setRetry(value=>value+1)}>다시 불러오기</button></section>
      <section className="card"><h2>인증 상태</h2>{profile.verifications.map(item=><div className="verification" key={item.kind}><span>{verificationLabels[item.kind]}{item.development&&<small className="muted"> · 개발용</small>}</span><strong>{statusLabels[item.status]}</strong></div>)}</section>
      <button className="secondary" disabled={busy} onClick={()=>void changeSession('/logout')}>로그아웃</button>
    </>}
  </main>;
}
