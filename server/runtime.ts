import mariadb, {type Pool} from 'mariadb';
import {randomBytes,createHash} from 'node:crypto';
import {Router,type Request,type RequestHandler,type ErrorRequestHandler} from 'express';
export interface SessionUser {id:string;role:'host'|'guest'}
export interface Sessions {issue(userId:string):Promise<string>;resolve(token:string):Promise<SessionUser|null>;revoke(token:string):Promise<void>}
const hash=(token:string)=>createHash('sha256').update(token).digest('hex');
export function sessionToken(req:Request){const value=req.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith('geuncha_session='))?.slice(16);return value&&/^[a-f0-9]{64}$/.test(value)?value:'';}
export class MariaSessions implements Sessions {
  constructor(private pool:Pool){}
  async issue(userId:string){const token=randomBytes(32).toString('hex');await this.pool.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)',[hash(token),userId,new Date(Date.now()+8*3600000)]);return token;}
  async resolve(token:string):Promise<SessionUser|null>{if(!token)return null;const rows=await this.pool.query('SELECT u.id,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP(3)',[hash(token)]);return rows[0]?{id:rows[0].id,role:rows[0].role}:null;}
  async revoke(token:string){if(token)await this.pool.query('DELETE FROM sessions WHERE token_hash=?',[hash(token)]);}
}
export function createPool(){if(!process.env.DB_PASSWORD)throw Error('Set DB_PASSWORD in .env');return mariadb.createPool({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3307),user:process.env.DB_USER||'geuncha',password:process.env.DB_PASSWORD,database:process.env.DB_NAME,connectionLimit:5,timezone:'Z',connectTimeout:5000});}
export const protectChanges=(origin:string|(()=>string)):RequestHandler=>(req,res,next)=>{if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.origin&&req.headers.origin!==(typeof origin==='function'?origin():origin)){res.status(403).json({message:'이 주소에서는 요청할 수 없습니다.'});return;}next();};
export function sessionRoutes(sessions:Sessions|undefined,developmentLogin:boolean,userId:string){
 const routes=Router();
 routes.get('/session',async(req,res)=>{const token=sessionToken(req);res.setHeader('Cache-Control','no-store');res.json({user:token&&sessions?await sessions.resolve(token):null,developmentLogin:developmentLogin&&process.env.NODE_ENV!=='production'});});
 routes.post('/dev/session',async(_req,res)=>{if(!developmentLogin||process.env.NODE_ENV==='production'){res.status(404).json({message:'사용할 수 없는 기능입니다.'});return;}if(!sessions){res.status(503).json({message:'로그인 정보를 불러올 수 없습니다.'});return;}const token=await sessions.issue(userId);res.cookie('geuncha_session',token,{httpOnly:true,sameSite:'strict',secure:false,path:'/api',maxAge:8*3600000});res.status(204).end();});
 routes.post('/logout',async(req,res)=>{if(sessions)await sessions.revoke(sessionToken(req));res.clearCookie('geuncha_session',{path:'/api',httpOnly:true,sameSite:'strict'});res.status(204).end();});
 return routes;
}
export const errorHandler:ErrorRequestHandler=(error,_req,res,_next)=>{res.status(error instanceof SyntaxError?400:503).json({message:error instanceof SyntaxError?'입력 내용을 확인해 주세요.':'잠시 연결할 수 없습니다. 다시 시도해 주세요.'});};
