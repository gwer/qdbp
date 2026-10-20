import fs from 'node:fs';
import './ts-loader.mjs';
import {launch,inventory,out} from './audit.mjs';
const browser=await launch();
const page=await browser.newPage();
await page.goto('http://localhost:4321/ru/',{waitUntil:'networkidle0'});
const defs=[];
for(const tool of inventory){
  const {def:d}=await import(tool.dir+'/tool.ts');
  const def={kind:d.kind,inputs:d.inputs,outputs:d.outputs,compute:d.compute?.toString()};
  defs.push({route:tool.route,...def});
}
fs.writeFileSync(out+'/evidence/definitions.json',JSON.stringify(defs,null,2));
console.log(defs.filter(d=>d.kind==='calculator').map(d=>`${d.route} | ${Object.entries(d.inputs).map(([k,v])=>`${k}=${v.default}${v.type==='select'?'['+v.options.join(',')+']':''}`).join('; ')} | ${Object.keys(d.outputs).join(',')}`).join('\n'));
await page.setViewport({width:1440,height:1000});
await page.goto('http://localhost:4321/ru/finance/mortgage/',{waitUntil:'networkidle0'});
await page.screenshot({path:out+'/evidence/mortgage-desktop-viewport.png'});
await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});
await page.screenshot({path:out+'/evidence/mortgage-mobile-viewport.png'});
await page.setViewport({width:320,height:700,isMobile:true,hasTouch:true});
console.log('320px',await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,width:document.documentElement.scrollWidth})));
await browser.close();
