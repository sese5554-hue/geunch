import{once}from'node:events';import{createServer}from'vite';import{chromium}from'@playwright/test';import type{Express}from'express';import fs from'node:fs';
export async function openBrowser(app:Express,setOrigin:(origin:string)=>void){
 const api=app.listen(0,'127.0.0.1');await once(api,'listening');const address=api.address();if(!address||typeof address==='string')throw Error('Missing API address');
 const apiBase='http://127.0.0.1:'+address.port;
 const web=await createServer({server:{port:0,strictPort:false,proxy:{'/api':apiBase}}});
 let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined;
 const close=async()=>{await browser?.close();await web.close();api.closeAllConnections();await new Promise<void>(resolve=>api.close(()=>resolve()));};
 try{await web.listen();const webAddress=web.httpServer!.address();if(!webAddress||typeof webAddress==='string')throw Error('Missing browser address');const base='http://127.0.0.1:'+webAddress.port;setOrigin(base);browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||(process.platform==='win32'?'chrome':undefined)});const page=await browser.newPage({viewport:{width:390,height:844}});fs.mkdirSync('docs/screenshots',{recursive:true});return{page,base,apiBase,close};}catch(error){await close();throw error;}
}
