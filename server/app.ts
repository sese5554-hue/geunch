import express from 'express';
import helmet from 'helmet';
import{profileRoutes,type ProfileStore}from'./profile';
import{sessionRoutes,protectChanges,errorHandler,type Sessions}from'./runtime';
export function createApp(options:{profiles?:ProfileStore;sessions?:Sessions;developmentLogin?:boolean;origin?:string}={}){
  const app=express();
  app.use(helmet());
  app.use(express.json({limit:'64kb'}));
  app.use(protectChanges(options.origin||'http://127.0.0.1:5184'));
  app.get('/api/health',(_req,res)=>res.json({status:'ok',project:'shared'}));
  app.use('/api',sessionRoutes(options.sessions,options.developmentLogin===true,'demo-guest'));
  app.use('/api',profileRoutes(options.profiles,options.sessions));
  app.use(errorHandler);
  return app;
}
