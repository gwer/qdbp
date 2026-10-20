import fs from 'node:fs';
import crypto from 'node:crypto';
import {launch,out,sleep} from './recheck-env.mjs';
const browser=await launch(),page=await browser.newPage();
await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});
const results=[],requests=[],errors=[];
page.on('request',r=>requests.push({url:r.url(),method:r.method(),type:r.resourceType()}));
page.on('pageerror',e=>errors.push(e.message));
await page.evaluateOnNewDocument(()=>{
  window.auditDownloads=[];
  const original=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){
    if(this.download&&this.href.startsWith('blob:')){
      const name=this.download,href=this.href;
      fetch(href).then(r=>r.blob()).then(async b=>window.auditDownloads.push({name,type:b.type,bytes:[...new Uint8Array(await b.arrayBuffer())]}));
    }
    return original.call(this);
  };
});
await page.goto('http://localhost:4321/ru/',{waitUntil:'networkidle0'});
const fixture=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=800;c.height=600;const ctx=c.getContext('2d');
  ctx.fillStyle='#ff0000';ctx.fillRect(400,0,400,600);ctx.fillStyle='#00ff00';ctx.fillRect(0,300,400,300);
  for(let i=0;i<500;i++){ctx.fillStyle=`hsl(${i*13%360} 80% 50%)`;ctx.fillRect(i*37%800,i*43%600,10,10)}
  return {png:c.toDataURL('image/png'),jpeg:c.toDataURL('image/jpeg',0.95),low:c.toDataURL('image/jpeg',0.03)};
});
for(const k of ['png','jpeg'])fs.writeFileSync(out+`/evidence/fixture.${k==='jpeg'?'jpg':'png'}`,Buffer.from(fixture[k].split(',')[1],'base64'));
fs.writeFileSync(out+'/evidence/broken.jpg',Buffer.from('intentionally broken test image'));
// Add a real JPEG comment segment to a canvas JPEG, preserving valid image data.
const jpeg=Buffer.from(fixture.jpeg.split(',')[1],'base64'),comment=Buffer.from('AUDIT_PRIVATE_COMMENT');
const segment=Buffer.concat([Buffer.from([255,254,0,comment.length+2]),comment]);
fs.writeFileSync(out+'/evidence/with-comment.jpg',Buffer.concat([jpeg.subarray(0,2),segment,jpeg.subarray(2)]));
const low=Buffer.from(fixture.low.split(',')[1],'base64');
fs.writeFileSync(out+'/evidence/low-quality-private-comment.jpg',Buffer.concat([low.subarray(0,2),segment,low.subarray(2)]));
fs.writeFileSync(out+'/evidence/fixture (2).png',Buffer.from(fixture.png.split(',')[1],'base64'));
const go=async route=>{await page.goto(`http://localhost:4321/ru/images/${route}/`,{waitUntil:'networkidle0'});await sleep(80)};
const fill=async(s,v)=>{await page.$eval(s,(e,v)=>{e.value=v;e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}))},String(v));await sleep(80)};
const upload=async(...names)=>{const input=await page.$('input[type=file]');await input.uploadFile(...names.map(n=>out+'/evidence/'+n));};
const click=async(text,index=0)=>{await page.evaluate(({text,index})=>{const es=[...document.querySelectorAll('.tool button')].filter(e=>e.innerText.includes(text));if(!es[index])throw Error('Missing button: '+text);es[index].click()},{text,index});await sleep(120)};
const state=async()=>page.evaluate(()=>({text:document.querySelector('.tool').innerText,overflow:document.documentElement.scrollWidth>innerWidth,errors:[...document.querySelectorAll('.field-error')].map(e=>e.innerText),downloads:window.auditDownloads.map(d=>({name:d.name,type:d.type,size:d.bytes.length}))}));
const download=async(text,index=0)=>{
  const n=await page.evaluate(()=>window.auditDownloads.length);await click(text,index);await page.waitForFunction(n=>window.auditDownloads.length>n,{timeout:10000},n);
  const d=await page.evaluate(()=>window.auditDownloads.at(-1));
  fs.writeFileSync(out+'/evidence/output-'+d.name,Buffer.from(d.bytes));
  const dimensions=await page.evaluate(async d=>{try{const b=new Blob([new Uint8Array(d.bytes)],{type:d.type}),im=await createImageBitmap(b);const c=new OffscreenCanvas(im.width,im.height);const ctx=c.getContext('2d');ctx.drawImage(im,0,0);return {width:im.width,height:im.height,pixel:[...ctx.getImageData(100,100,1,1).data]}}catch{return null}},d);
  return {...d,bytes:undefined,sha256:crypto.createHash('sha256').update(Buffer.from(d.bytes)).digest('hex'),dimensions};
};
const run=async(name,action)=>{try{const detail=await action();results.push({name,...detail,state:await state()});}catch(e){results.push({name,pass:false,error:e.message,state:await state().catch(()=>null)})}fs.writeFileSync(out+'/evidence/image-checks.json',JSON.stringify({results,requests,errors},null,2));console.log(name,results.at(-1).pass)};
await run('resize-400x300',async()=>{await go('resize-image');await fill('#rs-width',400);await upload('fixture.png');await page.waitForSelector('.file-row button',{timeout:15000});const d=await download('Скачать');return {pass:d.dimensions?.width===400&&d.dimensions?.height===300,download:d}});
await run('resize-batch-ZIP-duplicate-names',async()=>{await upload('fixture.png');await page.waitForFunction(()=>document.querySelectorAll('.file-row button').length===2);const d=await download('Скачать всё');return {pass:d.type==='application/zip',download:d}});
await run('resize-corrupt-file',async()=>{await go('resize-image');await upload('broken.jpg');await page.waitForSelector('.file-row .field-error');return {pass:(await state()).errors.length>0}});
await run('convert-PNG-to-JPEG-white-background',async()=>{await go('convert-image');await upload('fixture.png');await page.waitForSelector('.file-row button');const d=await download('Скачать');return {pass:d.type==='image/jpeg'&&d.dimensions?.width===800&&d.dimensions?.pixel.slice(0,3).every(x=>x>240),download:d}});
await run('convert-to-WebP',async()=>{await fill('#cv-type','image/webp');await sleep(500);await page.waitForSelector('.file-row button');const d=await download('Скачать');return {pass:d.type==='image/webp',download:d}});
await run('ZIP-preserve-colliding-filenames',async()=>{await go('convert-image');await upload('fixture.png');await upload('fixture.png');await upload('fixture (2).png');await page.waitForFunction(()=>document.querySelectorAll('.file-row button').length===3);const d=await download('Скачать всё');const {unzipSync}=await import('/home/gwer/code/qdbp/node_modules/fflate/esm/index.mjs');const names=Object.keys(unzipSync(new Uint8Array(fs.readFileSync(out+'/evidence/output-'+d.name))));return {pass:names.length===3,names,inputFiles:3,download:d}});
await run('compress-JPEG',async()=>{await go('compress-image');await upload('fixture.jpg');await page.waitForSelector('.file-row button');const d=await download('Скачать');return {pass:d.type==='image/jpeg'&&d.dimensions?.width===800&&d.dimensions?.height===600&&fs.statSync(out+'/evidence/output-'+d.name).size<=jpeg.length,download:d}});
await run('compress-privacy-kept-original',async()=>{await go('compress-image');await upload('low-quality-private-comment.jpg');await page.waitForSelector('.file-row button');const d=await download('Скачать');const bytes=fs.readFileSync(out+'/evidence/output-'+d.name);return {pass:!bytes.includes(comment),metadataCommentPreserved:bytes.includes(comment),originalReturned:bytes.equals(fs.readFileSync(out+'/evidence/low-quality-private-comment.jpg')),download:d}});
await run('image-Base64-roundtrip',async()=>{await go('image-to-base64');await upload('fixture.png');await page.waitForSelector('#b64-out');const data=await page.$eval('#b64-out',e=>e.value);const same=Buffer.from(data.split(',')[1],'base64').equals(fs.readFileSync(out+'/evidence/fixture.png'));await click('Base64 →');await fill('#b64-in',data);await page.waitForSelector('.b64-preview img');const d=await download('Скачать');return {pass:same&&d.type==='image/png',download:d}});
await run('EXIF-remove-JPEG-comment',async()=>{await go('exif');await upload('with-comment.jpg');await page.waitForSelector('.exif-card button');const before=(await state()).text;const d=await download('Скачать');const clean=fs.readFileSync(out+'/evidence/output-'+d.name);return {pass:before.toLowerCase().includes('комментар')&&!clean.includes(comment)&&d.dimensions?.width===800,download:d}});
await run('HEIC-real-decode',async()=>{await go('heic-to-jpg');await upload('example.heic');await page.waitForSelector('.file-row button',{timeout:60000});const d=await download('Скачать');await page.screenshot({path:out+'/evidence/heic-mobile-viewport.png'});return {pass:d.type==='image/jpeg'&&d.dimensions?.width>0,download:d}});
await run('HEIC-corrupt-file-recovery',async()=>{await upload('broken.jpg');await page.waitForSelector('.file-row .field-error');return {pass:(await state()).errors.length>0}});
await run('QR-text-scan',async()=>{await go('qr-generator');await fill('#qr-text','Привет 🌍');const d=await download('Скачать PNG');await page.addScriptTag({content:fs.readFileSync('/home/gwer/code/qdbp/node_modules/jsqr/dist/jsQR.js','utf8')});const payload=await page.evaluate(async()=>{const d=window.auditDownloads.at(-1),im=await createImageBitmap(new Blob([new Uint8Array(d.bytes)],{type:d.type}));const c=new OffscreenCanvas(im.width,im.height),ctx=c.getContext('2d');ctx.drawImage(im,0,0);return jsQR(ctx.getImageData(0,0,im.width,im.height).data,im.width,im.height)?.data});return {pass:payload==='Привет 🌍',payload,download:d}});
await run('QR-WiFi-scan',async()=>{await click('Wi-Fi');await fill('#qr-ssid','Audit;Network');await fill('#qr-pass','secret:123');await download('Скачать PNG');const payload=await page.evaluate(async()=>{const d=window.auditDownloads.at(-1),im=await createImageBitmap(new Blob([new Uint8Array(d.bytes)],{type:d.type}));const c=new OffscreenCanvas(im.width,im.height),ctx=c.getContext('2d');ctx.drawImage(im,0,0);return jsQR(ctx.getImageData(0,0,im.width,im.height).data,im.width,im.height)?.data});return {pass:payload?.includes('S:Audit\\;Network')&&payload?.includes('P:secret\\:123'),payload}});
await run('QR-same-colors',async()=>{await fill('#qr-fg','#ffffff');return {pass:true,acceptedDecision:'F12 declined; no warning expected'}});
fs.writeFileSync(out+'/evidence/image-checks.json',JSON.stringify({results,requests,errors},null,2));
await browser.close();
console.log(JSON.stringify({total:results.length,pass:results.filter(r=>r.pass).length,failures:results.filter(r=>!r.pass),external:requests.filter(r=>!r.url.startsWith('http://localhost:4321')&&!r.url.startsWith('blob:')&&!r.url.startsWith('data:'))},null,2));
