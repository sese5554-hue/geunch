import 'dotenv/config';import{createPool}from'./runtime';
const pool=createPool();try{await pool.query("CREATE TABLE IF NOT EXISTS users(id VARCHAR(64) PRIMARY KEY,name VARCHAR(80) NOT NULL,phone VARCHAR(20) NOT NULL,role ENUM('guest','host') NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
await pool.query("CREATE TABLE IF NOT EXISTS sessions(token_hash CHAR(64) PRIMARY KEY,user_id VARCHAR(64) NOT NULL,expires_at DATETIME(3) NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
await pool.query("CREATE TABLE IF NOT EXISTS vehicles(id CHAR(36) PRIMARY KEY,owner_id VARCHAR(64) NOT NULL,name VARCHAR(80) NOT NULL,year INT NOT NULL,plate VARCHAR(20) NOT NULL UNIQUE,neighborhood VARCHAR(60) NOT NULL,status ENUM('DRAFT','PUBLISHED') NOT NULL,created_at DATETIME(3) NOT NULL,FOREIGN KEY(owner_id) REFERENCES users(id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
console.log('테이블 준비 완료');}finally{await pool.end();}
