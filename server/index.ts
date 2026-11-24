import 'dotenv/config';
import {createApp} from './app';
const server=createApp().listen(Number(process.env.PORT||3011),'127.0.0.1');
process.once('SIGINT',()=>server.close());
process.once('SIGTERM',()=>server.close());
