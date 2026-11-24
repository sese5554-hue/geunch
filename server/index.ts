import 'dotenv/config';
import {createApp} from './app';
import{createPool}from'./runtime';
import{MariaVehicles}from'./vehicles';
const pool=createPool();await pool.query('SELECT 1');
const server=createApp({vehicles:new MariaVehicles(pool)}).listen(Number(process.env.PORT||3012),'127.0.0.1');
function stop(){server.closeAllConnections();server.close(()=>{void pool.end();});}
process.once('SIGINT',stop);process.once('SIGTERM',stop);
