import express from 'express';
import helmet from 'helmet';
import {vehicleRoutes,type VehicleStore} from './vehicles';
import {errorHandler} from './runtime';
export function createApp(options:{vehicles?:VehicleStore}={}){
  const app=express();
  app.use(helmet());
  app.use(express.json({limit:'64kb'}));
  app.get('/api/health',(_req,res)=>res.json({status:'ok',project:'guest'}));
  app.use('/api',vehicleRoutes(options.vehicles));
  app.use(errorHandler);
  return app;
}
