import 'dotenv/config';import{createPool}from'./runtime';
const pool=createPool();try{await pool.query("CREATE TABLE IF NOT EXISTS users(id VARCHAR(64) PRIMARY KEY,name VARCHAR(80) NOT NULL,phone VARCHAR(20) NOT NULL,role ENUM('guest','host') NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
await pool.query("CREATE TABLE IF NOT EXISTS sessions(token_hash CHAR(64) PRIMARY KEY,user_id VARCHAR(64) NOT NULL,expires_at DATETIME(3) NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
await pool.query("CREATE TABLE IF NOT EXISTS verifications(user_id VARCHAR(64) NOT NULL,kind ENUM('identity','neighborhood','license') NOT NULL,status ENUM('pending','verified') NOT NULL,expires_at DATETIME(3) NULL,development BOOLEAN NOT NULL DEFAULT TRUE,PRIMARY KEY(user_id,kind),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
console.log('테이블 준비 완료');}finally{await pool.end();}
