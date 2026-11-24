import 'dotenv/config';
import {createApp} from './app';
import {createPool} from './database';
import {MariaConsentStore} from './consents';
const pool=createPool();
await pool.query('SELECT 1');
const server=createApp({consents:new MariaConsentStore(pool),origin:process.env.WEB_ORIGIN,secureCookies:process.env.NODE_ENV==='production'}).listen(Number(process.env.PORT||3011),'127.0.0.1');
function stop(){server.closeAllConnections();server.close(()=>{void pool.end();});}
process.once('SIGINT',stop);
process.once('SIGTERM',stop);
