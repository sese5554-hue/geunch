import 'dotenv/config';import{createPool}from'./runtime';
const pool=createPool();try{await pool.query("CREATE TABLE IF NOT EXISTS vehicles(id CHAR(36) PRIMARY KEY,name VARCHAR(80) NOT NULL,year INT NOT NULL,neighborhood VARCHAR(60) NOT NULL,fuel VARCHAR(20) NOT NULL,seats INT NOT NULL,daily_price INT NOT NULL,status ENUM('DRAFT','PUBLISHED') NOT NULL,INDEX search_area(neighborhood,status)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
console.log('테이블 준비 완료');}finally{await pool.end();}
