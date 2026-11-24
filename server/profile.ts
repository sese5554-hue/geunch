import{Router}from'express';import type{Pool}from'mariadb';
import{maskPhone,verificationStatus,type Profile,type Verification}from'../shared/profile';
import{sessionToken,type Sessions}from'./runtime';
export interface ProfileStore{find(id:string):Promise<Profile|null>}
export class MariaProfiles implements ProfileStore{
  constructor(private pool:Pool){}
  async find(id:string):Promise<Profile|null>{
    const users=await this.pool.query('SELECT id,name,phone,role FROM users WHERE id=?',[id]);const user=users[0];if(!user)return null;
    const rows=await this.pool.query('SELECT kind,status,expires_at,development FROM verifications WHERE user_id=?',[id]);
    const byKind=new Map<string,Record<string,any>>(rows.map((row:Record<string,any>)=>[row.kind,row]));
    const verifications:Verification[]=(['identity','neighborhood','license']as const).map(kind=>{const row=byKind.get(kind);return{kind,status:row?verificationStatus(row.status,row.expires_at?new Date(row.expires_at):null):'pending',development:!!row?.development};});
    return{id:user.id,name:user.name,phone:maskPhone(user.phone),activeRole:user.role,verifications};
  }
}
export function profileRoutes(store?:ProfileStore,sessions?:Sessions){const routes=Router();routes.get('/me',async(req,res)=>{
  res.setHeader('Cache-Control','no-store');const user=await sessions?.resolve(sessionToken(req));
  if(!user){res.status(401).json({message:'로그인한 뒤 내 정보를 확인해 주세요.'});return;}
  if(!store){res.status(503).json({message:'내 정보를 불러올 수 없습니다.'});return;}
  const profile=await store.find(user.id);if(!profile){res.status(401).json({message:'계정 정보를 확인할 수 없습니다. 다시 로그인해 주세요.'});return;}res.json(profile);
});return routes;}
