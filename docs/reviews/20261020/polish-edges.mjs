import fs from 'node:fs';
import {launch,sleep} from './audit.mjs';
const out='evidence/polish-20261021';
const browser=await launch(),page=await browser.newPage(),rows=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function go(route){await page.goto('http://localhost:4321'+route,{waitUntil:'load'});await page.waitForFunction(()=>![...document.querySelectorAll('astro-island[client]')].some(e=>e.hasAttribute('ssr')));await sleep(80);}
async function set(selector,value){await page.$eval(selector,(e,v)=>{e.value=v;e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));},String(value));await sleep(50);}
async function text(){return page.$eval('.tool',e=>e.innerText);}
async function record(name,fn){try{rows.push({name,...await fn()});}catch(e){rows.push({name,harnessError:e.stack});}fs.writeFileSync(out+'/edges.json',JSON.stringify({rows,errors},null,2));console.log(name);}
for(const lang of ['ru','en','es','de','pt'])await record('base64-url-safe-corrected-'+lang,async()=>{
 await go(`/${lang}/security/base64/`);await page.$$eval('.calc-options button',es=>es[1].click());await set('#tc-in','Привет 🌍 / +');const encoded=await page.$eval('#tc-out',e=>e.value);
 await page.$eval('.tool .actions button:last-child',e=>e.click());await sleep(50);const decoded=await page.$eval('#tc-out',e=>e.value);return{encoded,decoded,ok:decoded==='Привет 🌍 / +'};
});
for(const [route,params]of [
 ['construction/tiles',{surface:'walls',roomLength:5,roomWidth:4,wallHeight:3,openings:4}],
 ['construction/tiles',{surface:'floor',roomLength:5,roomWidth:4}],
 ['construction/concrete',{shape:'strip',stripLength:20,stripWidth:0.4,stripHeight:1}],
 ['construction/concrete',{shape:'columns',diameter:0.4,depth:2,count:4}],
 ['finance/compound-interest',{initial:0,monthly:100,rate:0,years:3,increase:10}],
 ['finance/discount',{find:'original',sale:75,percent:25}],
 ['finance/discount',{find:'percent',price:200,sale:150}],
 ['finance/margin',{find:'price',cost:80,target:20}],
 ['finance/markup',{find:'cost',price:100,percent:25}],
 ['math/add-percent',{value:1200,percent:20,op:'remove'}],
 ['health/due-date',{method:'conception',conception:'2026-01-15',on:'2026-03-12'}],
 ['health/due-date',{method:'ivf3',transfer:'2026-01-18',on:'2026-03-12'}],
 ['health/due-date',{method:'ivf5',transfer:'2026-01-20',on:'2026-03-12'}],
 ['dates/unix-timestamp',{direction:'toTs',date:'2026-01-01',time:'00:00',zone:'utc'}],
 ['dates/time-between',{start:'09:00',end:'18:00',pause:'01:00'}],
 ['convert/data-size-converter',{v:100,from:'mbit',to:'MB'}],
 ])for(const lang of ['ru','en','es','de','pt'])await record('reference-'+lang+'-'+route+'-'+JSON.stringify(params),async()=>{
  await go(`/${lang}/${route}/?${new URLSearchParams(params)}`);return{outputs:await page.$$eval('.out',es=>es.map(e=>e.innerText)),errors:await page.$$eval('.field-error,.calc-error',es=>es.map(e=>e.innerText)),fields:await page.$$eval('.tool input,.tool select',es=>es.filter(e=>e.getBoundingClientRect().height).map(e=>({id:e.id,value:e.value}))),text:await text()};
 });
await record('prepayment-state-url',async()=>{
 await go('/ru/finance/mortgage/');await page.evaluate(()=>[...document.querySelectorAll('.tool button')].find(e=>e.innerText.includes('Добавить досрочное')).click());
 await set('#in-prepay-0-after','24');await set('#in-prepay-0-amount','100000,50');await set('#in-prepay-0-repeat','monthly');
 const before={url:page.url(),text:await text()};await page.reload({waitUntil:'load'});await sleep(200);const restored=await page.$$eval('.prepay input,.prepay select',es=>es.map(e=>({id:e.id,value:e.value})));
 await set('#in-prepay-0-amount','');const invalid={url:page.url(),text:await text()};await set('#in-prepay-0-amount','100000');return{before,restored,invalid,recovered:await text()};
});
await record('subnet-selection-mismatch',async()=>{await go('/ru/dev/subnet-calculator/');await page.select('#cidr-split','26');await set('#cidr-in','10.0.0.0/8');return{value:await page.$eval('#cidr-split',e=>e.value),rows:await page.$$eval('.tool table',es=>es.map(e=>({rows:e.rows.length,first:e.rows[1]?.innerText}))),more:await page.$$eval('.tool .muted',es=>es.map(e=>e.innerText))};});
await record('chart-stale-hover-index',async()=>{await page.setViewport({width:1440,height:1000});await go('/ru/finance/compound-interest/');await set('#in-years','20');const chart=await page.$('.chart svg'),b=await chart.boundingBox();await page.mouse.move(b.x+b.width-12,b.y+80);await sleep(50);await set('#in-years','1');return{text:await text(),tip:await page.$eval('.chart-tip',e=>e.innerText).catch(()=>null)};});
await record('compress-300-kb-and-compare',async()=>{
 await go('/ru/images/compress-image/');await page.select('#cp-by','size');await set('#cp-size','300');await page.evaluate(async()=>{
 const c=document.createElement('canvas');c.width=1200;c.height=800;const ctx=c.getContext('2d'),im=ctx.createImageData(c.width,c.height);let s=123456;for(let i=0;i<im.data.length;i+=4){s=(s*1664525+1013904223)>>>0;im.data[i]=s&255;im.data[i+1]=(s>>>8)&255;im.data[i+2]=(s>>>16)&255;im.data[i+3]=255;}ctx.putImageData(im,0,0);const b=await new Promise(r=>c.toBlob(r,'image/png'));const dt=new DataTransfer();dt.items.add(new File([b],'qa-noise.png',{type:'image/png'}));const input=document.querySelector('input[type=file]');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));
 window.__qaSizes=[];const original=URL.createObjectURL.bind(URL);URL.createObjectURL=b=>{window.__qaSizes.push(b.size);return original(b);};
 });await page.waitForFunction(()=>document.querySelector('.file-actions button'));await sleep(100);
 const sizes=await page.evaluate(()=>window.__qaSizes),result=await text();await page.evaluate(()=>[...document.querySelectorAll('.tool button')].find(e=>e.innerText==='Сравнить').click());await sleep(80);await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});await sleep(80);await(await page.$('.tool')).screenshot({path:out+'/screens/compress-tool-mobile.png'});return{sizes,result};
});
for(const route of ['/ru/finance/mortgage/?prepay=24:50000:term:monthly;48:100000:payment:once','/ru/finance/early-repayment/','/ru/health/bmi/','/ru/health/body-fat/','/ru/health/due-date/?method=ivf5','/ru/health/calorie-calculator/','/ru/math/fractions/?w1=1&w2=2','/ru/random/random-picker/']){
 await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:'dark'}]);await go(route);await(await page.$('.tool')).screenshot({path:out+'/screens/'+route.split('/')[3]+'-tool-mobile.png'});
}
await browser.close();console.log(JSON.stringify({cases:rows.length,errors,harnessErrors:rows.filter(r=>r.harnessError)},null,2));
