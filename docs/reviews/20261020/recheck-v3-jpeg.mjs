import './ts-loader.mjs';
import fs from 'node:fs';
import {launch,sleep} from './audit.mjs';
const {stripJpeg}=await import('/home/gwer/code/qdbp/src/ui/files/jpeg.ts');
const dir='evidence/recheck-v3/evidence/';
const source=fs.readFileSync(dir+'progressive-restart.jpg');
const clean=Buffer.from(stripJpeg(source,{keepIcc:true,keepOrientation:true}));
const restartCases=[];
for(let marker=0xd0;marker<=0xd7;marker++)for(const fill of [0,1,2,8]){
  const at=clean.indexOf(Buffer.from([255,marker]),clean.indexOf(Buffer.from([255,218])));
  if(at<0)throw Error('Missing RST fixture');
  const input=Buffer.concat([clean.subarray(0,at),Buffer.alloc(fill,255),clean.subarray(at)]);
  try {const actual=Buffer.from(stripJpeg(input,{keepIcc:true,keepOrientation:true}));restartCases.push({marker:'RST'+(marker-0xd0),fill,pass:actual.equals(input)});}
  catch(e){restartCases.push({marker:'RST'+(marker-0xd0),fill,pass:false,error:e.message});}
}
const low=fs.readFileSync(dir+'low-quality-private-comment.jpg');
const broken=Buffer.concat([low.subarray(0,-2),Buffer.from([255,254,255,255]),low.subarray(-2)]);
fs.writeFileSync(dir+'broken-after-scan.jpg',broken);
const browser=await launch(),page=await browser.newPage(),checks=[];
await page.evaluateOnNewDocument(()=>{
  window.savedDownloads=[];const old=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){if(this.download&&this.href.startsWith('blob:')){const name=this.download;fetch(this.href).then(r=>r.arrayBuffer()).then(bytes=>window.savedDownloads.push({name,bytes:[...new Uint8Array(bytes)]}));}return old.call(this);};
});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const run=async(name,fn)=>{try{checks.push({name,...await fn()});}catch(e){checks.push({name,pass:false,error:e.message});}};
const snapshot=()=>page.evaluate(()=>({errors:[...document.querySelectorAll('.exif-card p')].map(e=>e.innerText).filter(s=>s.includes('Не удалось разобрать')),cards:document.querySelectorAll('.exif-card').length,downloadButtons:document.querySelectorAll('.exif-card button').length}));
await run('broken-JPEG-is-reported-without-render-exception',async()=>{
  await page.goto('http://localhost:4321/ru/images/exif/',{waitUntil:'networkidle0'});await(await page.$('input[type=file]')).uploadFile(dir+'broken-after-scan.jpg');
  await page.waitForFunction(()=>[...document.querySelectorAll('.exif-card p')].some(e=>e.innerText.includes('Не удалось разобрать')));const state=await snapshot();return {pass:errors.length===0&&state.errors.length===1&&state.downloadButtons===0,...state,pageErrors:[...errors]};
});
await run('adding-valid-JPEG-after-broken-file-recovers',async()=>{
  await(await page.$('input[type=file]')).uploadFile(dir+'progressive-filled-restart.jpg');await page.waitForSelector('.exif-card button');const state=await snapshot();return {pass:errors.length===0&&state.cards===2&&state.errors.length===1&&state.downloadButtons===1,...state,pageErrors:[...errors]};
});
await run('download-and-option-toggle-after-broken-file',async()=>{
  await page.$$eval('.checks input',es=>es.forEach(e=>e.click()));await sleep(100);await page.$eval('.exif-card button',e=>e.click());await page.waitForFunction(()=>window.savedDownloads.length===1);
  const d=await page.evaluate(()=>window.savedDownloads[0]);fs.writeFileSync(dir+'mixed-batch-clean.jpg',Buffer.from(d.bytes));
  const dimensions=await page.evaluate(async bytes=>{const b=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/jpeg'}));return {width:b.width,height:b.height};},d.bytes);
  return {pass:errors.length===0&&dimensions.width===800&&dimensions.height===600,dimensions,pageErrors:[...errors],bytes:d.bytes.length};
});
await page.screenshot({path:dir+'broken-and-valid-exif.png',fullPage:true});await browser.close();
console.log(JSON.stringify({restartCases:{total:restartCases.length,passed:restartCases.filter(r=>r.pass).length,results:restartCases},browserChecks:checks},null,2));
