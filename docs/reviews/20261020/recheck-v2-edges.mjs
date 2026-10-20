import './ts-loader.mjs';
import fs from 'node:fs';
import {launch,sleep} from './audit.mjs';
const {stripJpeg}=await import('/home/gwer/code/qdbp/src/ui/files/jpeg.ts');
const base='evidence/recheck-v2/evidence/';
const browser=await launch(),page=await browser.newPage(),results=[];
await page.goto('http://localhost:4321/ru/',{waitUntil:'networkidle0'});
const run=async(name,fn)=>{try{results.push({name,...await fn()});}catch(e){results.push({name,pass:false,error:e.message});}fs.writeFileSync(base+'extended.json',JSON.stringify(results,null,2));console.log(name,results.at(-1).pass);};
const bitmap=async(bytes)=>page.evaluate(async bytes=>{
  const b=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/jpeg'})),c=new OffscreenCanvas(b.width,b.height),ctx=c.getContext('2d');ctx.drawImage(b,0,0);
  const data=ctx.getImageData(0,0,b.width,b.height).data,hash=await crypto.subtle.digest('SHA-256',data);
  return {width:b.width,height:b.height,hash:[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')};
},[...bytes]);
const progressive=fs.readFileSync(base+'progressive-restart.jpg');
await run('real-progressive-restart-JPEG-and-trailer',async()=>{
  const secret=Buffer.from('PRIVATE_PROGRESSIVE'),comment=Buffer.concat([Buffer.from([255,254,0,secret.length+2]),secret]);
  const input=Buffer.concat([progressive.subarray(0,-2),comment,progressive.subarray(-2),secret]);
  const clean=stripJpeg(input,{keepIcc:true,keepOrientation:true});fs.writeFileSync(base+'progressive-clean.jpg',clean);
  const before=await bitmap(input),after=await bitmap(clean);
  return {pass:before.hash===after.hash&&!Buffer.from(clean).includes(secret)&&clean.at(-2)===255&&clean.at(-1)===217,before,after,scans:10,inputBytes:input.length,outputBytes:clean.length};
});
const rst=progressive.indexOf(Buffer.from([255,208]),progressive.indexOf(Buffer.from([255,218])));
if(rst<0)throw Error('Restart fixture missing');
const padded=Buffer.concat([progressive.subarray(0,rst),Buffer.from([255]),progressive.subarray(rst)]);fs.writeFileSync(base+'progressive-filled-restart.jpg',padded);
await run('real-progressive-filled-restart-marker',async()=>{
  const original=await bitmap(progressive),input=await bitmap(padded);let clean,error;
  try{clean=stripJpeg(padded,{keepIcc:true,keepOrientation:true});}catch(e){error=e.message;}
  const output=clean?await bitmap(clean):null;
  return {pass:original.hash===input.hash&&output?.hash===original.hash,original,input,output,error,restartOffset:rst};
});
for(const tool of ['compress-image','exif'])await run('filled-restart-in-browser-'+tool,async()=>{
  const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
  await page.goto('http://localhost:4321/ru/images/'+tool+'/',{waitUntil:'networkidle0'});
  await(await page.$('input[type=file]')).uploadFile(base+'progressive-filled-restart.jpg');await sleep(1000);
  const state=await page.evaluate(()=>({rows:[...document.querySelectorAll('.file-row,.exif-card')].map(e=>e.innerText),errors:[...document.querySelectorAll('.field-error')].map(e=>e.innerText),downloads:[...document.querySelectorAll('.file-row button,.exif-card button')].map(e=>e.innerText)}));
  await page.screenshot({path:base+'filled-restart-'+tool+'.png',fullPage:true});page.off('pageerror',onError);
  return {pass:errors.length===0&&state.errors.length===0&&state.downloads.length>0,pageErrors:errors,...state};
});
const go=async()=>page.goto('http://localhost:4321/ru/images/resize-image/',{waitUntil:'networkidle0'});
const upload=async(...files)=>{await(await page.$('input[type=file]')).uploadFile(...files.map(x=>base+x));await sleep(40);};
const hold=async()=>page.evaluate(()=>{
  window.decodeMax=0;window.decodeActive=0;window.releases=[];const original=window.createImageBitmap;
  window.createImageBitmap=async(...a)=>{window.decodeActive++;window.decodeMax=Math.max(window.decodeMax,window.decodeActive);await new Promise(r=>window.releases.push(r));try{return await original(...a);}finally{window.decodeActive--;}};
});
const drain=async()=>{for(let n=0;n<100;n++){await page.evaluate(()=>window.releases.splice(0).forEach(r=>r()));await sleep(25);const state=await page.evaluate(()=>({active:window.decodeActive,held:window.releases.length,pending:[...document.querySelectorAll('.file-row')].some(e=>e.innerText.includes('Обработка'))}));if(!state.active&&!state.held&&!state.pending)return;}};
const state=async()=>page.evaluate(()=>({max:window.decodeMax,active:window.decodeActive,rows:[...document.querySelectorAll('.file-row')].map(e=>({text:e.innerText,done:!!e.querySelector('button'),error:!!e.querySelector('.field-error')}))}));
await run('two-adds-queue-completes-all-four',async()=>{
  await go();await hold();await upload('fixture.png','fixture.png');await upload('fixture.png','fixture.png');await drain();const s=await state();return {pass:s.max<=2&&s.rows.length===4&&s.rows.every(r=>r.done),...s};
});
await run('clear-with-active-old-generation-then-add',async()=>{
  await go();await hold();await upload('fixture.png','fixture.png');await upload('fixture.png');await page.$eval('#rs-width',e=>{e.value='400';e.dispatchEvent(new Event('input',{bubbles:true}));});await sleep(350);
  await page.$$eval('.tool button',es=>es.find(e=>e.innerText==='Очистить').click());await sleep(40);await upload('fixture.png');await drain();const s=await state();return {pass:s.max<=2&&s.rows.length===1&&s.rows[0].done&&s.rows[0].text.includes('400×300'),...s};
});
await run('failed-file-releases-slot-for-queued-files',async()=>{
  await go();await hold();await upload('broken.jpg','fixture.png','fixture.png','fixture.png');await drain();const s=await state();return {pass:s.max<=2&&s.rows.length===4&&s.rows.filter(r=>r.done).length===3&&s.rows.filter(r=>r.error).length===1,...s};
});
await browser.close();console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.pass).length,failures:results.filter(r=>!r.pass)},null,2));
