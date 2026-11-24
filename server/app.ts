import express from 'express';
import helmet from 'helmet';
import{draftRoutes,type DraftStore}from'./vehicles';
import{sessionRoutes,protectChanges,errorHandler,type Sessions}from'./runtime';
export function createApp(options:{vehicles?:DraftStore;sessions?:Sessions;developmentLogin?:boolean;origin?:string}={}){
  const app=express();
  app.use(helmet());
  app.use(express.json({limit:'64kb'}));
  app.use(protectChanges(options.origin||'http://127.0.0.1:5183'));
  app.get('/api/health',(_req,res)=>res.json({status:'ok',project:'host'}));
  app.use('/api',sessionRoutes(options.sessions,options.developmentLogin===true,'demo-host'));
  app.use('/api',draftRoutes(options.vehicles,options.sessions));
  app.use(errorHandler);
  return app;
}
