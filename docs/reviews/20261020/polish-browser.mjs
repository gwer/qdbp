import fs from 'node:fs';
import crypto from 'node:crypto';
import {launch,sleep} from './audit.mjs';
const out='evidence/polish-20261021';fs.mkdirSync(out+'/screens',{recursive:true});
const browser=await launch(),page=await browser.newPage(),rows=[];
const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(['POST','PUT','PATCH'].includes(r.method())||/^https?:/.test(r.url())&&!r.url().startsWith('http://localhost:4321'))requests.push({url:r.url(),method:r.method()});});
await page.setViewport({width:1440,height:1000});
async function goto(route){await page.goto('http://localhost:4321'+route,{waitUntil:'load'});await page.waitForFunction(()=>![...document.querySelectorAll('astro-island[client]')].some(e=>e.hasAttribute('ssr')));await sleep(80);}
async function set(selector,value){await page.$eval(selector,(el,v)=>{el.value=v;el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));},String(value));await sleep(65);}
async function click(text){await page.evaluate(text=>{const b=[...document.querySelectorAll('.tool button')].find(e=>e.innerText.trim()===text);if(!b)throw Error('No button '+text);b.click();},text);await sleep(65);}
async function snapshot(){return page.evaluate(()=>({url:location.href,outputs:[...document.querySelectorAll('.out')].map(e=>e.innerText),text:document.querySelector('.tool')?.innerText,errors:[...document.querySelectorAll('.field-error,.calc-error')].map(e=>e.innerText),overflow:document.documentElement.scrollWidth>innerWidth}));}
async function record(name,fn){const start=errors.length;try{rows.push({name,...await fn(),pageErrors:errors.slice(start)});}catch(e){rows.push({name,harnessError:e.stack,pageErrors:errors.slice(start)});}fs.writeFileSync(out+'/browser.json',JSON.stringify({rows,requests},null,2));console.log(name);}
async function shot(name){await page.screenshot({path:`${out}/screens/${name}.png`,fullPage:true});}
async function injectNoise(){return page.evaluate(async()=>{const c=document.createElement('canvas');c.width=1200;c.height=800;const ctx=c.getContext('2d'),im=ctx.createImageData(c.width,c.height);let s=123456;for(let i=0;i<im.data.length;i+=4){s=(s*1664525+1013904223)>>>0;im.data[i]=s&255;im.data[i+1]=(s>>>8)&255;im.data[i+2]=(s>>>16)&255;im.data[i+3]=255;}ctx.putImageData(im,0,0);const b=await new Promise(r=>c.toBlob(r,'image/png'));const f=new File([b],'qa-noise.png',{type:'image/png'}),dt=new DataTransfer();dt.items.add(f);const input=document.querySelector('input[type=file]');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));return{bytes:b.size,width:c.width,height:c.height};});}
for(const lang of ['ru','en','es','de','pt']){
 await record('base64-roundtrip-'+lang,async()=>{
  await goto(`/${lang}/security/base64/`);await set('#tc-in','Привет 🌍 / +');
  const buttons=await page.$$eval('.tool .calc-options button',es=>es.map(e=>e.innerText));await click(buttons.at(-1));
  const encoded=await page.$eval('#tc-out',e=>e.value);
  await page.$eval('.tool .actions button:last-child',e=>e.click());await sleep(50);
  const decoded=await page.$eval('#tc-out',e=>e.value);return{encoded,decoded,ok:decoded==='Привет 🌍 / +'};
 });
 await record('json-repair-'+lang,async()=>{
  await goto(`/${lang}/dev/json-formatter/`);await page.$eval('.calc-options button:last-child',e=>e.click());await set('#tc-in',`{name:'Привет', active:True, a:[1,2,], /*ok*/ none:None,}`);
  const output=await page.$eval('#tc-out',e=>e.value);return{output,ok:JSON.parse(output).name==='Привет'};
 });
}
await record('workdays-weekend',async()=>{await goto('/ru/dates/add-to-date/?date=2026-10-17&amount=5&unit=workdays');return snapshot();});
await record('timezone-now-selected-zone',async()=>{
 await page.emulateTimezone('Europe/Lisbon');await goto('/ru/dates/timezone-converter/?from=Asia/Tokyo&to=UTC');await click('Сейчас');
 const actual=await page.$eval('#tz-time',e=>e.value),state=await snapshot();
 const expected=await page.evaluate(()=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()));
 await shot('timezone-now');return{actual,expected,...state};
});
await record('random-picker-edit-during-spin',async()=>{
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await goto('/ru/random/random-picker/');await set('#rp-list','Alice\nBob\nCarol');await click('Выбрать');await set('#rp-list','New A\nNew B\nNew C');await sleep(4200);
 const beforeRemove=await snapshot();const winner=await page.$eval('.picked',e=>e.innerText).catch(()=>null);
 const b=await page.$$eval('.tool button',es=>es.map(e=>e.innerText).find(s=>s.includes('Убрать')));if(b)await click(b);
 const afterRemove=await page.$eval('#rp-list',e=>e.value);await shot('picker-stale-winner');return{winner,beforeRemove,afterRemove};
});
await record('loan-prepay-zero',async()=>{
 await goto('/ru/finance/loan-calculator/?amount=100000&rate=10&months=12&prepay=0:10000:term:once');
 await page.$$eval('.tool details',es=>es.forEach(e=>e.open=true));return snapshot();
});
await record('salary-inverse',async()=>{await goto('/ru/finance/net-salary/?mode=net&amount=65341&children=1');return snapshot();});
await record('compress-impossible-target',async()=>{
 await goto('/ru/images/compress-image/');await page.evaluate(()=>{window.__qaBlobs=[];const original=URL.createObjectURL.bind(URL);URL.createObjectURL=b=>{window.__qaBlobs.push({size:b.size,type:b.type});return original(b);};});
 await page.select('#cp-by','size');await set('#cp-size','10');const source=await injectNoise();await page.waitForFunction(()=>document.querySelector('.file-actions button'));await sleep(100);
 const files=await page.evaluate(()=>window.__qaBlobs);await shot('compress-target-exceeded');return{source,files,...await snapshot()};
});
await record('compress-attainable-target-compare',async()=>{
 await set('#cp-size','200');await sleep(2000);await page.waitForFunction(()=>document.querySelector('.file-actions button'));
 const state=await snapshot();await click('Сравнить');await page.waitForSelector('.compare-stack img');await sleep(80);
 const compare=await page.$$eval('.compare-stack img',es=>es.map(e=>({alt:e.alt,width:e.width,height:e.height,naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight})));await shot('compress-compare-desktop');
 await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});await shot('compress-compare-mobile');return{compare,...state};
});
await record('resize-exact-cover',async()=>{
 await goto('/ru/images/resize-image/');await page.select('#rs-mode','cover');await set('#rs-width','320');await set('#rs-height','180');await injectNoise();await page.waitForFunction(()=>document.querySelector('.file-actions button'));return snapshot();
});
await record('hash-file-known-digest',async()=>{
 await goto('/ru/security/hash/');await page.evaluate(()=>{const dt=new DataTransfer();dt.items.add(new File(['abc'],'abc.txt',{type:'text/plain'}));const input=document.querySelector('input[type=file]');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));});
 await set('#hash-expected',crypto.createHash('sha256').update('abc').digest('hex'));await sleep(100);return snapshot();
});
await record('jwt-valid-and-bad-secret',async()=>{
 await goto('/ru/dev/jwt-decoder/');await set('#jwt-secret','qdbp');await sleep(150);const good=await snapshot();await set('#jwt-secret','wrong');await sleep(150);return{good,bad:await snapshot()};
});
await record('subnet-split-stale-prefix',async()=>{
 await goto('/ru/dev/subnet-calculator/');await page.select('#cidr-split','26');await set('#cidr-in','10.0.0.0/8');return snapshot();
});
// Every new calculator mode plus expanded tables, desktop/mobile and both themes.
const routes=[
 '/finance/mortgage/?prepay=24:50000:term:monthly;48:100000:payment:once',
 '/finance/early-repayment/?prepay=24:50000:term:monthly;48:100000:payment:once',
 '/finance/compound-interest/?growth=10','/finance/discount/?find=original','/finance/margin/?find=price',
 '/finance/markup/?find=cost','/finance/break-even/?profit=10000','/finance/refinance/?newMonths=600',
 '/finance/auto-loan/?owed=100000','/finance/tip/?round=10',
 '/construction/tiles/?mode=walls','/construction/concrete/?mode=strip','/construction/laminate/?layout=diagonal',
 '/construction/wallpaper/?repeat=64&match=drop','/construction/bricks/',
 '/health/bmi/','/health/body-fat/?sex=female','/health/calorie-calculator/',
 '/health/due-date/?method=ivf5','/health/ovulation/','/health/running-pace/?find=time&race=half',
 '/health/running-pace/?find=distance','/dates/week-number/?system=us','/math/fractions/?w1=1&w2=2',
 '/kitchen/cups-to-grams/','/kitchen/cake-pan/','/convert/data-size-converter/?from=Mbit&to=MB&v=100',
 ];
for(const lang of ['ru','en','es','de','pt'])for(const route of routes){
 await record('expanded-'+lang+route,async()=>{
  await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:'dark'}]);await goto('/'+lang+route);
  await page.$$eval('.tool details',es=>es.forEach(e=>e.open=true));await sleep(30);
  const mobile=await snapshot();
  const fields=await page.$$eval('.tool input[type=text],.tool select',es=>es.filter(e=>e.getBoundingClientRect().height).map(e=>({id:e.id,value:e.value,options:e.tagName==='SELECT'?[...e.options].map(o=>o.value):undefined})));
  const tables=await page.$$eval('.tool .table-wrap',es=>es.map(e=>({width:e.clientWidth,scroll:e.scrollWidth,rows:e.querySelectorAll('tr').length})));
  if(lang==='ru'&&['mortgage','early-repayment','bmi','due-date','calorie-calculator','fractions','compound-interest','body-fat'].some(s=>route.includes('/'+s+'/')))await shot(route.split('/')[2]+'-mobile-dark');
  await page.setViewport({width:1440,height:1000,isMobile:false,hasTouch:false});const desktop=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth}));
  return{mobile,desktop,fields,tables};
 });
}
fs.writeFileSync(out+'/browser.json',JSON.stringify({rows,requests},null,2));await browser.close();console.log(JSON.stringify({cases:rows.length,harnessErrors:rows.filter(r=>r.harnessError).map(r=>({name:r.name,error:r.harnessError})),pageErrors:errors,requests},null,2));
