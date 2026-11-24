import 'dotenv/config';
import {createApp} from './app';
import{createPool,MariaSessions}from'./runtime';import{MariaDrafts}from'./vehicles';
const pool=createPool();await pool.query('SELECT 1');
const server=createApp({vehicles:new MariaDrafts(pool),sessions:new MariaSessions(pool),developmentLogin:process.env.DEV_LOGIN==='true',origin:process.env.WEB_ORIGIN}).listen(Number(process.env.PORT||3013),'127.0.0.1');
function stop(){server.closeAllConnections();server.close(()=>{void pool.end();});}process.once('SIGINT',stop);process.once('SIGTERM',stop);
