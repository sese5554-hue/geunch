import 'dotenv/config';import{createPool}from'./runtime';
if(process.env.DEV_SEED!=='true'||process.env.NODE_ENV==='production')throw Error('개발용 예시 자료를 넣으려면 개발 환경에서 DEV_SEED=true를 설정해 주세요.');
const pool=createPool();try{await pool.query("INSERT IGNORE INTO users(id,name,phone,role) VALUES('demo-guest','개발 게스트','01000000002','guest')");await pool.query("INSERT IGNORE INTO verifications(user_id,kind,status,expires_at,development) VALUES('demo-guest','identity','verified',NULL,TRUE),('demo-guest','neighborhood','verified','2026-01-01',TRUE),('demo-guest','license','pending',NULL,TRUE)");
console.log('개발용 예시 자료 준비 완료');}finally{await pool.end();}
