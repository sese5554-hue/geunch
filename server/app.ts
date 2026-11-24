import express from 'express';
import helmet from 'helmet';
export function createApp(){
  const app=express();
  app.use(helmet());
  app.use(express.json({limit:'64kb'}));
  app.get('/api/health',(_req,res)=>res.json({status:'ok',project:'guest'}));
  return app;
}
