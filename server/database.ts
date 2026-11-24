import mariadb from 'mariadb';

export function createPool() {
  if (!process.env.DB_PASSWORD) throw new Error('DB_PASSWORD를 .env에 설정해 주세요.');
  return mariadb.createPool({
    host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3311),
    user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'geuncha_auth_rebuild', connectionLimit: 5,
    timezone: 'Z', connectTimeout: 5000,
  });
}
