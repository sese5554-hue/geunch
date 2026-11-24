import 'dotenv/config';
import { createPool } from './database';
const pool = createPool();
try {
  await pool.query(`CREATE TABLE IF NOT EXISTS consents (
    id CHAR(36) PRIMARY KEY,
    version VARCHAR(32) NOT NULL,
    choices_json JSON NOT NULL,
    saved_at DATETIME(3) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  console.log('약관 동의 테이블 준비 완료');
} finally { await pool.end(); }
