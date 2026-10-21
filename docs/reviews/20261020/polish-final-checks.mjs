import fs from 'node:fs';
import {launch,sleep} from './audit.mjs';

const out=process.env.QDBP_POLISH_FINAL_OUT??'evidence/polish-final-20261021';
fs.mkdirSync(out+'/screens',{recursive:true});
const langs=['ru','en','es','de','pt'];
const rows=[],errors=[],externalRequests=[];
const invalid=[
 ['missing','amount=100'],['fractional-month','after=1.5&extra=10000'],
 ['negative-month','after=-1&extra=10000'],['negative-amount','after=12&extra=-5'],
 ['zero-amount','after=12&extra=0'],['bad-mode','after=12&extra=10000&mode=sideways'],
 ['nan','after=12&extra=NaN'],['empty-month','after=&extra=10000'],
 ['blank-month','after=%20%20&extra=10000'],['infinite-amount','after=12&extra=Infinity'],
 ['overflow-amount','after=12&extra=1e309'],
];

if(process.argv.includes('--pure')){
 const {def}=await import('/home/gwer/code/qdbp/src/pages/[lang]/finance/early-repayment/_tool/tool.ts');
 for(const [name,query,expected] of [
  ['valid-payment','after=12&extra=10000&mode=payment','12:10000:payment:once'],
  ['valid-term','after=24&extra=10000&mode=term','24:10000:term:once'],
  ['default-mode','after=12&extra=10000','12:10000:term:once'],
  ['zero-month','after=0&extra=10000','0:10000:term:once'],
  ...invalid.map(([name,query])=>[name,query,undefined]),
 ]){
  const actual=def.legacy(new URLSearchParams(query));
  rows.push({name,query,expected:expected??null,actual,pass:actual.prepay===expected});
 }
 fs.writeFileSync(out+'/legacy-pure.json',JSON.stringify(rows,null,2));
 console.log(JSON.stringify({total:rows.length,passed:rows.filter(r=>r.pass).length,failures:rows.filter(r=>!r.pass)},null,2));
 if(rows.some(r=>!r.pass))process.exitCode=1;
}else{
 const browser=await launch(),page=await browser.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(['POST','PUT','PATCH'].includes(r.method())||/^https?:/.test(r.url())&&!r.url().startsWith('http://localhost:4321'))externalRequests.push({url:r.url(),method:r.method()});});
 await page.evaluateOnNewDocument(()=>{
  window.qaDownloads=[];
  HTMLAnchorElement.prototype.click=function(){if(this.download&&this.href.startsWith('blob:')){const name=this.download;fetch(this.href).then(r=>r.blob()).then(b=>window.qaDownloads.push({name,size:b.size,type:b.type}));}};
 });
 let response;
 async function go(route){response=await page.goto('http://localhost:4321'+route,{waitUntil:'load'});await page.waitForFunction(()=>![...document.querySelectorAll('astro-island[client]')].some(e=>e.hasAttribute('ssr')));await sleep(140);}
 async function set(selector,value){await page.$eval(selector,(e,v)=>{e.value=v;e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));},String(value));}
 async function run(name,fn){const start=errors.length;try{rows.push({name,...await fn(),pageErrors:errors.slice(start)});}catch(e){rows.push({name,pass:false,harnessError:e.stack,pageErrors:errors.slice(start)});}fs.writeFileSync(out+'/browser.json',JSON.stringify({rows,errors,externalRequests},null,2));console.log(name,rows.at(-1).pass);}
 async function readyFiles(){await page.waitForFunction(()=>document.querySelectorAll('.file-row').length===2&&[...document.querySelectorAll('.file-row')].every(e=>e.querySelector('.file-actions')));}
 async function metrics(){return page.evaluate(()=>{
  const box=e=>{if(!e)return null;const b=e.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,right:b.right,bottom:b.bottom,height:b.height};};
  return{innerWidth,documentWidth:document.documentElement.scrollWidth,visualWidth:visualViewport.width,scale:visualViewport.scale,list:box(document.querySelector('.file-list')),files:[...document.querySelectorAll('.file-row')].map(e=>({box:box(e),info:box(e.querySelector('.file-info')),actions:box(e.querySelector('.file-actions')),warning:e.querySelector('.field-error')?.innerText??'',buttons:[...e.querySelectorAll('button')].map(b=>({text:b.innerText,box:box(b)}))}))};
 });}
 function fits(m,width){return m.documentWidth<=width+1&&m.files.length===2&&m.files.every(f=>f.box.width<=m.list.width+1&&f.buttons.every(b=>b.box.x>=-1&&b.box.right<=width+1));}
 for(const name of ['noise','tiny'])fs.copyFileSync('evidence/polish-recheck-20261021/'+name+'.png',out+'/'+name+'.png');
 for(const width of [320,375])for(const lang of langs)await run(`N01-${width}-${lang}`,async()=>{
  await page.setViewport({width,height:950,isMobile:true,hasTouch:true});await go(`/${lang}/images/compress-image/`);
  await(await page.$('input[type=file]')).uploadFile(out+'/noise.png',out+'/tiny.png');await readyFiles();const quality=await metrics();
  await page.select('#cp-by','size');await set('#cp-size',10);await sleep(700);await readyFiles();const warning=await metrics();
  await page.$eval('.file-row',e=>e.scrollIntoView({block:'center'}));await page.screenshot({path:out+`/screens/files-${width}-${lang}.png`});
  await page.$eval('.file-row .file-actions button:last-child',e=>e.click());await page.waitForFunction(()=>window.qaDownloads.length>0);const downloads=await page.evaluate(()=>window.qaDownloads);
  return{pass:fits(quality,width)&&fits(warning,width)&&quality.files.every(f=>!f.warning)&&!!warning.files[0].warning&&!warning.files[1].warning&&downloads[0].size>10000,width,lang,quality,warning,downloads};
 });
 for(const [route,width] of [['compress-image',1440],['convert-image',320],['resize-image',320]])await run(`N01-shared-${route}-${width}`,async()=>{
  await page.setViewport({width,height:950,isMobile:width<600,hasTouch:width<600});await go(`/de/images/${route}/`);
  await(await page.$('input[type=file]')).uploadFile(out+'/noise.png',out+'/tiny.png');await readyFiles();const m=await metrics();return{pass:fits(m,width),width,...m};
 });
 await page.setViewport({width:1440,height:1000,isMobile:false,hasTouch:false});
 const base='amount=100000&rate=10&months=120';
 async function calcState(){return page.evaluate(()=>({
  url:location.href,canonical:document.querySelector('link[rel=canonical]')?.href,
  outputs:[...document.querySelectorAll('.tool .out')].map(e=>e.innerText),
  errors:[...document.querySelectorAll('.tool .calc-error')].map(e=>e.innerText),
  prepayments:[...document.querySelectorAll('.prepay-row')].map(e=>Object.fromEntries([...e.querySelectorAll('input,select')].map(f=>[f.id.split('-').at(-1),f.value]))),
  tables:[...document.querySelectorAll('.tool table')].map(e=>e.textContent),
 }));}
 const sameCalc=(a,b)=>JSON.stringify([a.outputs,a.errors,a.prepayments,a.tables])===JSON.stringify([b.outputs,b.errors,b.prepayments,b.tables]);
 for(const lang of langs)for(const mode of ['term','payment'])await run(`legacy-valid-${lang}-${mode}`,async()=>{
  await go(`/${lang}/finance/early-repayment/?${base}&after=12&extra=10000&mode=${mode}`);const legacy=await calcState(),status=response.status(),redirects=response.request().redirectChain().length;
  await go(`/${lang}/finance/early-repayment/?${base}&prepay=12:10000:${mode}:once`);const modern=await calcState();
  return{pass:sameCalc(legacy,modern)&&!legacy.errors.length&&legacy.prepayments.length===1&&legacy.prepayments[0].repeat==='once'&&legacy.prepayments[0].after==='12'&&legacy.canonical===`https://qdbp.net/${lang}/finance/early-repayment/`&&status===200&&redirects===0,legacy,modern,status,redirects};
 });
 for(const [name,tail,modern] of [
  ['default-mode','after=12&extra=10000','12:10000:term:once'],
  ['zero-month','after=0&extra=10000&mode=term','0:10000:term:once'],
  ['new-priority','after=12&extra=10000&mode=payment&prepay=36:2000:term:once','36:2000:term:once'],
  ['new-list-priority','after=12&extra=10000&mode=payment&prepay=12:500:term:monthly;36:2000:payment:once','12:500:term:monthly;36:2000:payment:once'],
  ['new-invalid-priority','after=12&extra=10000&prepay=bad','bad'],
  ['new-empty-priority','after=12&extra=10000&prepay=',''],
 ])await run(`legacy-${name}`,async()=>{
  await go(`/ru/finance/early-repayment/?${base}&${tail}`);const actual=await calcState();
  await go(`/ru/finance/early-repayment/?${base}&prepay=${modern}`);const expected=await calcState();
  return{pass:sameCalc(actual,expected),actual,expected};
 });
 await go(`/ru/finance/early-repayment/?${base}`);const defaultState=await calcState();
 for(const [name,query]of invalid)await run(`legacy-invalid-${name}`,async()=>{
  await go(`/ru/finance/early-repayment/?${base}&${query}`);const actual=await calcState();
  if(name==='empty-month'||name==='infinite-amount')await(await page.$('.tool')).screenshot({path:out+'/screens/legacy-'+name+'.png'});
  return{pass:sameCalc(actual,defaultState),query,actual,expectedPrepayments:defaultState.prepayments};
 });
 await run('N02-rounding-note',async()=>{
  await go('/ru/finance/net-salary/?mode=gross&amount=33333&children=0');
  const text=await page.$eval('.tool',e=>e.innerText),taxes=await page.$$eval('.tool tbody tr',es=>es.map(e=>e.cells[2]?.innerText)),s=await calcState();
  await(await page.$('.tool')).screenshot({path:out+'/screens/salary-rounding.png'});
  return{pass:text.includes('округления НДФЛ до рубля')&&taxes.includes('4 333,00')&&taxes.includes('4 334,00')&&!s.errors.length,text,taxes,...s};
 });
 await browser.close();
 console.log(JSON.stringify({total:rows.length,passed:rows.filter(r=>r.pass).length,failures:rows.filter(r=>!r.pass).map(r=>({name:r.name,harnessError:r.harnessError})),errors,externalRequests},null,2));
 if(rows.some(r=>!r.pass)||errors.length)process.exitCode=1;
}
