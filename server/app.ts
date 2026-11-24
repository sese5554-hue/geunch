import express from 'express';
import helmet from 'helmet';
import { consentRoutes, type ConsentStore } from './consents';
export function createApp(options: { consents?: ConsentStore; origin?: string; secureCookies?: boolean } = {}){
  const app=express();
  app.use(helmet());
  app.use(express.json({limit:'64kb'}));
  app.use((req,res,next)=>{
    if (!['GET','HEAD','OPTIONS'].includes(req.method) && req.headers.origin && req.headers.origin !== (options.origin || 'http://127.0.0.1:5181')) {
      res.status(403).json({message:'이 주소에서는 요청할 수 없습니다.'}); return;
    }
    next();
  });
  app.get('/api/health',(_req,res)=>res.json({status:'ok',project:'auth'}));
  app.use('/api', consentRoutes(options.consents, options.secureCookies));
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(error instanceof SyntaxError ? 400 : 500).json({message:'요청을 처리하지 못했습니다.'});
  });
  return app;
}
