import fs from 'node:fs';
import {launch,out,sleep} from './recheck-env.mjs';
const browser=await launch(),page=await browser.newPage(),results=[];
await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});
const go=async(route)=>{await page.goto('http://localhost:4321/'+route,{waitUntil:'networkidle0'});await page.waitForFunction(()=>![...document.querySelectorAll('astro-island[client]')].some(e=>e.hasAttribute('ssr')));};
const fill=async(sel,value)=>{await page.$eval(sel,(e,v)=>{e.value=v;e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));},String(value));await sleep(50);};
const run=async(name,fn)=>{try{results.push({name,...await fn()});}catch(e){results.push({name,pass:false,error:e.message});}fs.writeFileSync(out+'/evidence/extra-browser.json',JSON.stringify(results,null,2));console.log(name,results.at(-1).pass);};
for(const [route,input,expected] of [['security/base64','   ','ICAg'],['security/url-encode','\t \n','%09%20%0A'],['text/case-converter','   ','   ']])await run('whitespace-'+route,async()=>{
  await go('ru/'+route+'/');await fill('#tc-in',input);const actual=await page.$eval('#tc-out',e=>e.value);
  return {pass:actual===expected,input,expected,actual};
});
for(const lang of ['ru','en','es','de','pt'])await run('compute-error-and-recovery-'+lang,async()=>{
  await go(lang+'/finance/break-even/');await fill('#in-price',1);await fill('#in-variable',2);
  const message=await page.$eval('.calc-error',e=>e.innerText);
  await fill('#in-price',20);const cleared=await page.$('.calc-error')===null;
  return {pass:message.length>10&&cleared,message,cleared};
});
await page.evaluate(()=>localStorage.setItem('qdbp:units','metric'));
for(const lang of ['ru','en','es','de','pt'])for(const [route,values]of [
  ['dates/age-calculator',{'birth':lang==='en'?'12/31/2030':['ru','de'].includes(lang)?'31.12.2030':'31/12/2030'}],
  ['finance/early-repayment',{months:12,after:24}],
  ['construction/wallpaper',{rollLength:0.5}],
  ['finance/fuel-cost',{economy:0}],
])await run('domain-error-'+route+'-'+lang,async()=>{
  await go(lang+'/'+route+'/');for(const [name,value]of Object.entries(values))await fill('#in-'+name,value);
  const text=await page.$eval('.calc-error',e=>e.innerText);return {pass:text.length>5&&!text.startsWith('errors.'),text};
});
await page.evaluateOnNewDocument(()=>{
  window.recheckDownloads=[];
  const old=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){if(this.download&&this.href.startsWith('blob:')){const name=this.download;fetch(this.href).then(r=>r.arrayBuffer()).then(bytes=>window.recheckDownloads.push({name,bytes:[...new Uint8Array(bytes)]}));}return old.call(this);};
});
await run('jpeg-metadata-after-first-scan',async()=>{
  const src=fs.readFileSync(out+'/evidence/low-quality-private-comment.jpg');
  if(src.at(-2)!==255||src.at(-1)!==217)throw Error('JPEG fixture EOI');
  const secret=Buffer.from('RECHECK_PRIVATE_AFTER_SCAN'),seg=Buffer.concat([Buffer.from([255,254,0,secret.length+2]),secret]);
  const fixture=Buffer.concat([src.subarray(0,-2),seg,src.subarray(-2)]),file=out+'/evidence/after-scan-private-comment.jpg';fs.writeFileSync(file,fixture);
  await go('ru/images/compress-image/');await(await page.$('input[type=file]')).uploadFile(file);await page.waitForSelector('.file-row button');
  await page.$eval('.file-row button',e=>e.click());await page.waitForFunction(()=>window.recheckDownloads.length>0);
  const d=await page.evaluate(()=>window.recheckDownloads.at(-1)),bytes=Buffer.from(d.bytes);fs.writeFileSync(out+'/evidence/after-scan-downloaded.jpg',bytes);
  const dimensions=await page.evaluate(async bytes=>{const b=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/jpeg'}));return {width:b.width,height:b.height};},d.bytes);
  return {pass:!bytes.includes(secret),privateCommentRetained:bytes.includes(secret),inputBytes:fixture.length,downloadBytes:bytes.length,downloadName:d.name,dimensions};
});
await run('exif-metadata-after-first-scan',async()=>{
  await go('ru/images/exif/');await(await page.$('input[type=file]')).uploadFile(out+'/evidence/after-scan-private-comment.jpg');await page.waitForSelector('.exif-card button');
  await page.$eval('.exif-card button',e=>e.click());await page.waitForFunction(()=>window.recheckDownloads.length>0);
  const d=await page.evaluate(()=>window.recheckDownloads.at(-1)),bytes=Buffer.from(d.bytes);fs.writeFileSync(out+'/evidence/after-scan-exif-downloaded.jpg',bytes);
  return {pass:!bytes.includes(Buffer.from('RECHECK_PRIVATE_AFTER_SCAN')),privateCommentRetained:bytes.includes(Buffer.from('RECHECK_PRIVATE_AFTER_SCAN')),downloadName:d.name,downloadBytes:bytes.length};
});
const upload=async(...paths)=>{await(await page.$('input[type=file]')).uploadFile(...paths);await sleep(30);};
const hold=async()=>page.evaluate(()=>{
  window.decodeActive=0;window.decodeMax=0;window.decodeReleases=[];const old=window.createImageBitmap;
  window.createImageBitmap=async(...args)=>{window.decodeActive++;window.decodeMax=Math.max(window.decodeMax,window.decodeActive);await new Promise(r=>window.decodeReleases.push(r));try{return await old(...args);}finally{window.decodeActive--;}};
});
const fixture=out+'/evidence/fixture.png';
await run('batch-one-add-global-limit',async()=>{
  await go('ru/images/resize-image/');await hold();await upload(fixture,fixture,fixture,fixture);
  const active=await page.evaluate(()=>window.decodeActive);await page.evaluate(()=>window.decodeReleases.splice(0).forEach(r=>r()));
  return {pass:active<=2,active};
});
await run('batch-two-adds-global-limit',async()=>{
  await go('ru/images/resize-image/');await hold();await upload(fixture,fixture);await upload(fixture,fixture);
  const active=await page.evaluate(()=>window.decodeActive);await page.evaluate(()=>window.decodeReleases.splice(0).forEach(r=>r()));
  return {pass:active<=2,active,expectedMaximum:2};
});
await run('batch-options-change-global-limit',async()=>{
  await go('ru/images/resize-image/');await hold();await upload(fixture,fixture);await fill('#rs-width',400);await sleep(350);
  const active=await page.evaluate(()=>window.decodeActive);await page.evaluate(()=>window.decodeReleases.splice(0).forEach(r=>r()));
  return {pass:active<=2,active,expectedMaximum:2};
});
await run('batch-add-during-options-debounce',async()=>{
  await go('ru/images/resize-image/');await upload(fixture);await page.waitForSelector('.file-row button');
  await fill('#rs-width',400);await upload(fixture);await sleep(1500);
  const state=await page.$$eval('.file-row',es=>es.map(e=>({text:e.innerText,download:!!e.querySelector('button')})));
  await page.screenshot({path:out+'/evidence/batch-stuck-after-add.png',fullPage:true});
  return {pass:state.length===2&&state.every(s=>s.download),state};
});
await run('batch-add-during-options-debounce-still-pending-after-five-seconds',async()=>{
  await sleep(5000);const state=await page.$$eval('.file-row',es=>es.map(e=>({text:e.innerText,download:!!e.querySelector('button')})));
  return {pass:state.every(s=>s.download),state};
});
await run('number-base-mobile-input-font',async()=>{
  await go('ru/math/number-base/');const value=await page.$eval('#nb-target',e=>({font:getComputedStyle(e).fontSize,coarse:matchMedia('(pointer: coarse)').matches,width:innerWidth}));
  await page.screenshot({path:out+'/evidence/number-base-small-field.png',fullPage:true});return {pass:parseFloat(value.font)>=16,...value};
});
await run('mobile-fields-16px',async()=>{
  await go('de/text/line-tools/');const fields=await page.$$eval('.tool textarea,.tool input[type=text]',es=>es.map(e=>({id:e.id,size:parseFloat(getComputedStyle(e).fontSize)})));
  return {pass:fields.every(f=>f.size>=16),fields};
});
await browser.close();console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.pass).length,failures:results.filter(r=>!r.pass)},null,2));
