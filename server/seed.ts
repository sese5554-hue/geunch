import 'dotenv/config';import{createPool}from'./runtime';
if(process.env.DEV_SEED!=='true'||process.env.NODE_ENV==='production')throw Error('개발용 예시 자료를 넣으려면 개발 환경에서 DEV_SEED=true를 설정해 주세요.');
const pool=createPool();try{const samples=[['10000000-0000-4000-8000-000000000001','아반떼 (개발용)',2022,'성수동','휘발유',5,40000,'PUBLISHED'],['10000000-0000-4000-8000-000000000002','캐스퍼 (개발용)',2023,'성수동','휘발유',4,30000,'PUBLISHED'],['10000000-0000-4000-8000-000000000003','등록 중 차량 (개발용)',2024,'성수동','전기',5,10000,'DRAFT']];for(const sample of samples)await pool.query('INSERT IGNORE INTO vehicles(id,name,year,neighborhood,fuel,seats,daily_price,status) VALUES(?,?,?,?,?,?,?,?)',sample);
console.log('개발용 예시 자료 준비 완료');}finally{await pool.end();}
