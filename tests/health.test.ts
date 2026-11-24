import{test}from'node:test';
import assert from'node:assert/strict';
import{once}from'node:events';
import{createApp}from'../server/app';
test('health identifies this project',async()=>{const server=createApp().listen(0,'127.0.0.1');try{await once(server,'listening');const address=server.address();assert.ok(address&&typeof address!=='string');const response=await fetch('http://127.0.0.1:'+address.port+'/api/health');assert.equal(response.status,200);assert.deepEqual(await response.json(),{status:'ok',project:'auth'});}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}});
