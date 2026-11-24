import 'dotenv/config';
import {createApp} from './app';
import{createPool,MariaSessions}from'./runtime';import{MariaProfiles}from'./profile';
const pool=createPool();await pool.query('SELECT 1');
const server=createApp({profiles:new MariaProfiles(pool),sessions:new MariaSessions(pool),developmentLogin:process.env.DEV_LOGIN==='true',origin:process.env.WEB_ORIGIN}).listen(Number(process.env.PORT||3014),'127.0.0.1');
function stop(){server.closeAllConnections();server.close(()=>{void pool.end();});}process.once('SIGINT',stop);process.once('SIGTERM',stop);
