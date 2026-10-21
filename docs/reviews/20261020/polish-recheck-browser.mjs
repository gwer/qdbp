import fs from 'node:fs';
import {launch,sleep} from './audit.mjs';
const out='evidence/polish-recheck-20261021';fs.mkdirSync(out+'/screens',{recursive:true});
const browser=await launch(),page=await browser.newPage(),rows=[],errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(['POST','PUT','PATCH'].includes(r.method())||/^https?:/.test(r.url())&&!r.url().startsWith('http://localhost:4321'))requests.push({url:r.url(),method:r.method()});});
await page.evaluateOnNewDocument(()=>{
 Date.now=()=>Date.UTC(2026,9,20,22,53,0);try{localStorage.setItem('qdbp:clock','24');}catch{/* Chrome may also run this diagnostic hook in an opaque initial document. */}
 window.qaDownloads=[];HTMLAnchorElement.prototype.click=function(){if(this.download&&this.href.startsWith('blob:')){const name=this.download;fetch(this.href).then(r=>r.blob()).then(async b=>window.qaDownloads.push({name,size:b.size,type:b.type,bytes:[...new Uint8Array(await b.arrayBuffer())]}));}};
});
await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});
async function go(route){await page.goto('http://localhost:4321'+route,{waitUntil:'load'});await page.waitForFunction(()=>![...document.querySelectorAll('astro-island[client]')].some(e=>e.hasAttribute('ssr')));await sleep(120);}
async function set(selector,value){await page.$eval(selector,(e,v)=>{e.value=v;e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));},String(value));await sleep(70);}
async function click(text){await page.evaluate(text=>{const b=[...document.querySelectorAll('.tool button')].find(e=>e.innerText.trim()===text);if(!b)throw Error('No button '+text);b.click();},text);await sleep(70);}
async function state(){return page.evaluate(()=>({url:location.href,text:document.querySelector('.tool')?.innerText,outputs:[...document.querySelectorAll('.out')].map(e=>e.innerText),warnings:[...document.querySelectorAll('.field-error,.calc-error')].map(e=>e.innerText),overflow:document.documentElement.scrollWidth>innerWidth}));}
async function run(name,fn){const start=errors.length;try{rows.push({name,...await fn(),pageErrors:errors.slice(start)});}catch(e){rows.push({name,pass:false,harnessError:e.stack,pageErrors:errors.slice(start)});}fs.writeFileSync(out+'/browser.json',JSON.stringify({rows,errors,requests},null,2));console.log(name,rows.at(-1).pass);}
await go('/ru/images/compress-image/');
const fixtures=await page.evaluate(async()=>{
 const c=document.createElement('canvas');c.width=1200;c.height=800;const ctx=c.getContext('2d'),im=ctx.createImageData(c.width,c.height);let s=123456;
 for(let i=0;i<im.data.length;i+=4){s=(s*1664525+1013904223)>>>0;im.data[i]=s&255;im.data[i+1]=(s>>>8)&255;im.data[i+2]=(s>>>16)&255;im.data[i+3]=255;}ctx.putImageData(im,0,0);const noise=c.toDataURL('image/png');c.width=c.height=20;c.getContext('2d').fillRect(0,0,20,20);return{noise,tiny:c.toDataURL('image/png')};
});
for(const name of ['noise','tiny'])fs.writeFileSync(out+'/'+name+'.png',Buffer.from(fixtures[name].split(',')[1],'base64'));
for(const lang of ['ru','en','es','de','pt'])await run('P01-warning-download-'+lang,async()=>{
 await go(`/${lang}/images/compress-image/`);await page.select('#cp-by','size');await set('#cp-size','10');await(await page.$('input[type=file]')).uploadFile(out+'/noise.png',out+'/tiny.png');
 await page.waitForFunction(()=>document.querySelectorAll('.file-row').length===2&&[...document.querySelectorAll('.file-row')].every(e=>e.querySelector('.file-actions')));
 const files=await page.$$eval('.file-row',es=>es.map(e=>({text:e.innerText,warning:e.querySelector('.field-error')?.innerText??'',buttons:e.querySelectorAll('button').length})));
 await page.$eval('.file-row .file-actions button:last-child',e=>e.click());await page.waitForFunction(()=>window.qaDownloads.length>0);const download=await page.evaluate(()=>{const d=window.qaDownloads[0];return{name:d.name,size:d.size,type:d.type};});
 await(await page.$('.tool')).screenshot({path:out+'/screens/limit-warning-'+lang+'.png'});
 await set('#cp-size','300');await sleep(1300);await page.waitForFunction(()=>[...document.querySelectorAll('.file-row')].every(e=>e.querySelector('.file-actions')));const after=await page.$$eval('.file-row .field-error',es=>es.map(e=>e.innerText));
 await page.select('#cp-by','quality');await sleep(500);const qualityWarnings=await page.$$eval('.file-row .field-error',es=>es.map(e=>e.innerText));
 return{pass:files[0].warning.length>20&&!files[0].warning.includes('{')&&!files[1].warning&&download.size>10000&&after.length===0&&qualityWarnings.length===0,files,download,after,qualityWarnings};
});
await run('P02-cancel-on-list-edit',async()=>{
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await go('/ru/random/random-picker/');await set('#rp-list','Alice\nBob\nCarol');await click('Выбрать');await set('#rp-list','New A\nNew B\nNew C');await sleep(4200);
 const winner=await page.$('.picked'),list=await page.$eval('#rp-list',e=>e.value),enabled=await page.$$eval('.tool button',es=>!es.find(e=>e.innerText==='Выбрать').disabled);return{pass:!winner&&list==='New A\nNew B\nNew C'&&enabled,list,winner:!!winner,enabled};
});
await run('P02-cancel-on-count-change',async()=>{
 await click('Выбрать');await set('#rp-count','2');await click('Выбрать');await sleep(4200);const winners=await page.$$eval('.picked li',es=>es.map(e=>e.innerText));return{pass:winners.length===2&&winners.every(w=>w.startsWith('New ')),winners};
});
await run('P02-reduced-motion-and-remove',async()=>{
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await set('#rp-count','1');await click('Выбрать');await sleep(50);const winner=await page.$eval('.picked',e=>e.innerText);await click('Убрать выбранных из списка');const left=await page.$eval('#rp-list',e=>e.value.split('\n'));return{pass:left.length===2&&!left.includes(winner)&&left.every(s=>s.startsWith('New ')),winner,left};
});
for(const [op,expected]of [['add','23 октября'],['subtract','12 октября']])await run('P03-browser-'+op,async()=>{await go(`/ru/dates/add-to-date/?date=2026-10-17&amount=5&unit=workdays&op=${op}`);const s=await state();return{pass:s.outputs[0].includes(expected),...s};});
await page.emulateTimezone('Europe/Lisbon');
for(const lang of ['ru','en','es','de','pt'])await run('P04-init-and-now-'+lang,async()=>{
 await go(`/${lang}/dates/timezone-converter/?from=Asia/Tokyo&to=UTC`);const initial=await page.$eval('#tz-time',e=>e.value),date=await page.$eval('#tz-date',e=>e.value),utc=await page.$eval('.tz-table',e=>e.innerText);
 await set('#tz-time','01:00');await page.$eval('.tool .actions button',e=>e.click());await sleep(70);const now=await page.$eval('#tz-time',e=>e.value),nowDate=await page.$eval('#tz-date',e=>e.value);
 const q=new URL(page.url()).searchParams;return{pass:initial==='07:53'&&now==='07:53'&&q.get('date')==='2026-10-21'&&q.get('time')==='07:53'&&utc.includes('22:53'),initial,date,utc,now,nowDate,url:page.url()};
});
await run('P04-now-in-12-hour-mode',async()=>{
 await page.$$eval('.calc-options button',es=>es[1].click());await page.$eval('.tool .actions button',e=>e.click());await sleep(80);const time=await page.$eval('#tz-time',e=>e.value),q=new URL(page.url()).searchParams;return{pass:time==='7:53'&&q.get('time')==='07:53',time,url:page.url()};
});
await run('P05-inverse-and-deduction-note',async()=>{await go('/ru/finance/net-salary/?mode=net&amount=65341&children=1');const s=await state();return{pass:s.outputs.some(x=>x.includes('75 000,00'))&&s.outputs[0].includes('65 341,00')&&!s.text.includes('Доход за год больше 2,4 млн ₽, поэтому'),...s};});
await run('additional-salary-rounding-note',async()=>{await go('/ru/finance/net-salary/?mode=gross&amount=33333&children=0');await(await page.$('.tool')).screenshot({path:out+'/screens/salary-rounding-note.png'});return{...await state(),taxes:await page.$$eval('.tool tbody tr',es=>es.map(e=>e.cells[2]?.innerText))};});
for(const [route,params]of [['loan-calculator','amount=100000&rate=10&months=12'],['early-repayment','amount=100000&rate=10&months=12'],['mortgage','price=125000&down=20&rate=10&years=1']])for(const extra of [10000,100000])await run('P06-zero-'+route+'-'+extra,async()=>{
 await go(`/ru/finance/${route}/?${params}&prepay=0:${extra}:term:once`);await page.$$eval('.tool details',es=>es.forEach(e=>e.open=true));const tables=await page.$$eval('.tool table',es=>es.map(e=>({headers:[...e.querySelectorAll('th')].map(e=>e.innerText),rows:[...e.tBodies[0].rows].map(tr=>[...tr.cells].map(e=>e.innerText))})));
 const table=tables.at(-1),first=table?.rows[0],s=await state();const pass=route==='mortgage'?first?.[1]===(extra===10000?'104 470,58':'100 000,00')&&first?.[4]===(extra===10000?'10 000,00':'100 000,00'):first?.[0]==='0'&&first?.[4]===(extra===10000?'10 000,00':'100 000,00')&&first?.[5]===(extra===10000?'90 000,00':'0,00');
 await(await page.$('.tool')).screenshot({path:out+'/screens/zero-'+route+'-'+extra+'.png'});return{pass:!!pass,...s,tables};
});
await run('P07-prefix-changes-and-recovery',async()=>{
 await go('/ru/dev/subnet-calculator/');await page.select('#cidr-split','26');await set('#cidr-in','10.0.0.0/8');const after={selected:await page.$eval('#cidr-split',e=>e.value),tables:await page.$$eval('.tool table',es=>es.length)};
 await set('#cidr-in','bad');const invalid=await state();await set('#cidr-in','10.0.0.0/31');await page.select('#cidr-split','32');const split=await state();await set('#cidr-in','10.0.0.0/32');const controls=await page.$('#cidr-split'),tables=await page.$$eval('.tool table',es=>es.length);
 return{pass:after.selected==='0'&&after.tables===1&&invalid.warnings.length>0&&split.text.includes('10.0.0.1/32')&&!controls&&tables===1,after,invalid:invalid.warnings,splitText:split.text,tables};
});
for(const action of ['clear','change','invalid'])await run('P08-stop-'+action,async()=>{
 await go('/ru/security/morse-code/');await page.evaluate(()=>{window.qaAudio=[];const Old=window.AudioContext;window.AudioContext=new Proxy(Old,{construct(target,args){const ac=Reflect.construct(target,args);window.qaAudio.push(ac);return ac;}});});
 await set('#tc-in','SOS SOS SOS SOS SOS');await click('▶ Прослушать');await sleep(150);
 if(action==='clear')await set('#tc-in','');if(action==='change')await set('#tc-in','ABC ABC ABC');if(action==='invalid'){await page.$$eval('.calc-options button',es=>es[1].click());await set('#tc-in','not morse');}
 await sleep(250);const contexts=await page.evaluate(()=>window.qaAudio.map(a=>({state:a.state,time:a.currentTime})));return{pass:contexts.length===1&&contexts[0].state==='closed',contexts,...await state()};
});
for(const size of [1,2,6,10])await run('P09-team-size-'+size,async()=>{
 await go('/ru/random/team-generator/');await set('#tg-list','A\nB\nC\nD\nE\nF');await set('#tg-by','size');await set('#tg-size',size);await click('Разделить');const groups=await page.$$eval('.teams ul',es=>es.map(e=>[...e.children].map(e=>e.innerText)));return{pass:groups.length===Math.ceil(6/size)&&groups.flat().length===6&&new Set(groups.flat()).size===6&&groups.every(g=>g.length<=size),groups};
});
await run('P10-hover-shrink-and-regrow',async()=>{
 await page.setViewport({width:1440,height:1000,isMobile:false,hasTouch:false});await go('/ru/finance/compound-interest/');await set('#in-years','20');const box=await(await page.$('.chart svg')).boundingBox();await page.mouse.move(box.x+box.width-12,box.y+80);await sleep(80);const before=await page.$eval('.chart-tip',e=>e.innerText);await set('#in-years','1');const tip=await page.$('.chart-tip'),s=await state();await set('#in-years','20');const back=await page.$eval('.chart-tip',e=>e.innerText).catch(()=>null);return{pass:before.length>0&&!tip&&!s.text.includes('не число')&&!back?.includes('не число'),before,tipAfter:!!tip,back};
});
await browser.close();console.log(JSON.stringify({total:rows.length,passed:rows.filter(r=>r.pass===true).length,failures:rows.filter(r=>r.pass===false),observations:rows.filter(r=>r.pass===undefined).map(r=>r.name),errors,requests},null,2));
