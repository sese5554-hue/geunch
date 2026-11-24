import {randomUUID} from 'node:crypto';
import {Router} from 'express';
import type{Pool}from'mariadb';
import{draftSchema,type DraftInput,type VehicleDraft}from'../shared/vehicles';
import{sessionToken,type Sessions}from'./runtime';
export interface DraftStore {create(owner:string,input:DraftInput):Promise<VehicleDraft>;find(id:string,owner:string):Promise<VehicleDraft|null>}
export class MariaDrafts implements DraftStore {
  constructor(private pool:Pool){}
  async create(owner:string,input:DraftInput):Promise<VehicleDraft>{
    const record:VehicleDraft={...input,id:randomUUID(),status:'DRAFT',createdAt:new Date().toISOString()};
    await this.pool.query("INSERT INTO vehicles(id,owner_id,name,year,plate,neighborhood,status,created_at) VALUES(?,?,?,?,?,?,'DRAFT',?)",[record.id,owner,input.name,input.year,input.plate,input.neighborhood,new Date(record.createdAt)]);return record;
  }
  async find(id:string,owner:string):Promise<VehicleDraft|null>{const rows=await this.pool.query('SELECT id,name,year,plate,neighborhood,status,created_at FROM vehicles WHERE id=? AND owner_id=?',[id,owner]);const row=rows[0];return row?{id:row.id,name:row.name,year:row.year,plate:row.plate,neighborhood:row.neighborhood,status:row.status,createdAt:new Date(row.created_at).toISOString()}:null;}
}
export function draftRoutes(store?:DraftStore,sessions?:Sessions){
  const routes=Router();
  routes.use('/vehicles',async(req,res,next)=>{
    const user=await sessions?.resolve(sessionToken(req));
    if(!user){res.status(401).json({message:'로그인한 뒤 차량을 등록해 주세요.'});return;}
    if(user.role!=='host'){res.status(403).json({message:'차량을 빌려주는 계정으로 로그인해 주세요.'});return;}
    res.locals.user=user;res.setHeader('Cache-Control','no-store');next();
  });
  routes.post('/vehicles',async(req,res)=>{
    const result=draftSchema.safeParse(req.body);if(!result.success){res.status(400).json({message:result.error.issues[0].message});return;}
    if(!store){res.status(503).json({message:'저장할 수 없습니다. 다시 시도해 주세요.'});return;}
    try{res.status(201).json(await store.create(res.locals.user.id,result.data));}
    catch(error){if((error as{code?:string}).code==='ER_DUP_ENTRY'){res.status(409).json({message:'이미 등록된 차량번호입니다.'});return;}throw error;}
  });
  routes.get('/vehicles/:id',async(req,res)=>{
    if(!/^[0-9a-f-]{36}$/.test(String(req.params.id))){res.status(404).json({message:'차량을 찾을 수 없습니다.'});return;}
    if(!store){res.status(503).json({message:'차량 정보를 불러오지 못했습니다.'});return;}
    const record=await store.find(String(req.params.id),res.locals.user.id);
    if(!record){res.status(404).json({message:'차량을 찾을 수 없습니다.'});return;}res.json(record);
  });
  return routes;
}
