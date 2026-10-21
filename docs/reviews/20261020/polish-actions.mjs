import fs from 'node:fs';
import {launch,sleep} from './audit.mjs';
const out='evidence/polish-20261021',browser=await launch(),page=await browser.newPage(),rows=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.evaluateOnNewDocument(()=>{
 window.qaDownloads=[];
 HTMLAnchorElement.prototype.click=function(){if(this.download&&this.href.startsWith('blob:')){const name=this.download;fetch(this.href).then(r=>r.blob()).then(async b=>window.qaDownloads.push({name,type:b.type,bytes:[...new Uint8Array(await b.arrayBuffer())]}));}};
});
async function go(route){await page.goto('http://localhost:4321'+route,{waitUntil:'load'});await page.waitForFunction(()=>![...document.querySelectorAll('astro-island[client]')].some(e=>e.hasAttribute('ssr')));await sleep(80);}
async function set(selector,value){await page.$eval(selector,(e,v)=>{e.value=v;e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));},String(value));await sleep(50);}
async function click(text){await page.evaluate(text=>{const b=[...document.querySelectorAll('.tool button')].find(e=>e.innerText.trim()===text);if(!b)throw Error('No button '+text);b.click();},text);await sleep(80);}
async function run(name,fn){try{rows.push({name,...await fn()});}catch(e){rows.push({name,harnessError:e.stack});}fs.writeFileSync(out+'/actions.json',JSON.stringify({rows,errors},null,2));console.log(name);}
await run('morse-clear-while-playing',async()=>{
 await go('/ru/security/morse-code/');await page.evaluate(()=>{window.qaAudio=[];const Old=window.AudioContext;window.AudioContext=new Proxy(Old,{construct(target,args){const a=Reflect.construct(target,args);window.qaAudio.push(a);return a;}});});
 await set('#tc-in','SOS SOS SOS SOS SOS');await click('▶ Прослушать');await sleep(100);const before=await page.evaluate(()=>window.qaAudio.map(a=>({state:a.state,time:a.currentTime})));
 await set('#tc-in','');await sleep(600);const after=await page.evaluate(()=>({audio:window.qaAudio.map(a=>({state:a.state,time:a.currentTime})),buttons:[...document.querySelectorAll('.tool button')].map(b=>b.innerText)}));await page.screenshot({path:out+'/screens/morse-no-stop.png'});return{before,after};
});
await run('team-size-larger-than-list',async()=>{
 await go('/ru/random/team-generator/');await set('#tg-list','Alice\nBob\nCarol\nDave\nEva\nFred');await set('#tg-by','size');await set('#tg-size','10');await click('Разделить');return{groups:await page.$$eval('.teams ul',es=>es.map(e=>e.innerText)),text:await page.$eval('.tool',e=>e.innerText)};
});
await run('time-break-correct-query-units',async()=>{await go('/ru/dates/time-between/?start=09:00&end=18:00&pause=60');return{outputs:await page.$$eval('.out',es=>es.map(e=>e.innerText))};});
await run('password-batch-and-clear',async()=>{
 await go('/ru/security/password-generator/');await set('#pw-count','');const empty=await page.$eval('#pw-count',e=>e.value);await set('#pw-count','100');await page.$eval('#pw-count',e=>e.blur());await sleep(100);const passwords=await page.$eval('.pw-list',e=>e.innerText.split('\n'));return{empty,count:passwords.length,valid:passwords.every(p=>p.length===16),unique:new Set(passwords).size};
});
await run('uuid-10000-download',async()=>{
 await go('/ru/security/uuid/');await set('#uuid-count','10000');await page.$eval('#uuid-count',e=>e.blur());await sleep(150);const list=await page.$eval('.tool textarea',e=>e.value.split('\n'));await click('Скачать .txt');await page.waitForFunction(()=>window.qaDownloads.length);const d=await page.evaluate(()=>window.qaDownloads[0]);return{count:list.length,unique:new Set(list).size,valid:list.every(s=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(s)),downloadBytes:d.bytes.length,downloadLines:new TextDecoder().decode(new Uint8Array(d.bytes)).trim().split('\n').length};
});
for(const [kind,fields,expected]of [
 ['Визитка',{'#qr-first':'Мария','#qr-last':'Smith;Jones','#qr-phone':'+1 (234) 567-89','#qr-email':'maria@example.com','#qr-org':'R&D, Inc','#qr-url':'https://example.com'},'BEGIN:VCARD'],
 ['E-mail',{'#qr-to':'qa@example.com','#qr-subject':'Привет & test','#qr-body':'Line 1\nLine 2'},'mailto:qa@example.com?subject='],
 ['Звонок',{'#qr-phone':'+1 (234) 567-89'},'tel:+123456789'],
 ['SMS',{'#qr-phone':'+1 (234) 567-89','#qr-body':'Привет: hello'},'SMSTO:+123456789:Привет: hello'],
 ])await run('qr-scan-'+kind,async()=>{
 await go('/ru/images/qr-generator/');await click(kind);for(const[k,v]of Object.entries(fields))await set(k,v);await click('Скачать PNG');await page.waitForFunction(()=>window.qaDownloads.length);
 await page.addScriptTag({content:fs.readFileSync('/home/gwer/code/qdbp/node_modules/jsqr/dist/jsQR.js','utf8')});
 const payload=await page.evaluate(async()=>{const d=window.qaDownloads[0],im=await createImageBitmap(new Blob([new Uint8Array(d.bytes)],{type:d.type}));const c=new OffscreenCanvas(im.width,im.height),ctx=c.getContext('2d');ctx.drawImage(im,0,0);return jsQR(ctx.getImageData(0,0,im.width,im.height).data,im.width,im.height)?.data;});return{payload,ok:payload?.startsWith(expected)};
});
for(const lang of ['ru','en','es','de','pt'])for(const [route,fields]of [['finance/discount',{'#in-find':'original','#in-percent':'100'}],['finance/margin',{'#in-find':'price','#in-target':'100'}]])await run('domain-'+lang+'-'+route,async()=>{
 await go(`/${lang}/${route}/`);for(const [k,v]of Object.entries(fields))await set(k,v);const invalid=await page.$$eval('.field-error,.calc-error',es=>es.map(e=>e.innerText));await set(Object.keys(fields).at(-1),'20');const recovered=await page.$$eval('.field-error,.calc-error',es=>es.map(e=>e.innerText));return{invalid,recovered};
});
await run('old-early-parameters-versus-new',async()=>{
 await go('/ru/finance/early-repayment/?amount=100000&rate=10&months=60&after=12&extra=10000&mode=term');const old=await page.$$eval('.prepay input',es=>es.map(e=>e.value));await go('/ru/finance/early-repayment/?amount=100000&rate=10&months=60&prepay=12:10000:term:once');const current=await page.$$eval('.prepay input',es=>es.map(e=>e.value));return{old,current};
});
await browser.close();console.log(JSON.stringify({cases:rows.length,errors,harnessErrors:rows.filter(r=>r.harnessError)},null,2));
