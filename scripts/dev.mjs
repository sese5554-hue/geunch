import{spawn}from'node:child_process';
const children=[['node_modules/tsx/dist/cli.mjs','watch','server/index.ts'],['node_modules/vite/bin/vite.js']].map(args=>spawn(process.execPath,args,{stdio:'inherit',windowsHide:true}));
function stop(){for(const child of children)child.kill();}
process.once('SIGINT',stop);process.once('SIGTERM',stop);
for(const child of children)child.once('exit',code=>{stop();process.exitCode=code??1;});
