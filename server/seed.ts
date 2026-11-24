import 'dotenv/config';import{createPool}from'./runtime';
if(process.env.DEV_SEED!=='true'||process.env.NODE_ENV==='production')throw Error('개발용 예시 자료를 넣으려면 개발 환경에서 DEV_SEED=true를 설정해 주세요.');
const pool=createPool();try{await pool.query("INSERT IGNORE INTO users(id,name,phone,role) VALUES('demo-host','개발 호스트','01000000001','host')");
console.log('개발용 예시 자료 준비 완료');}finally{await pool.end();}
