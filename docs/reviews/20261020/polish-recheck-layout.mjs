import fs from 'node:fs';
import {launch,sleep} from './audit.mjs';
const out='evidence/polish-recheck-20261021',browser=await launch(),page=await browser.newPage(),rows=[];
const metrics=()=>page.evaluate(()=>{const box=e=>{const b=e.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,right:b.right,height:b.height,scroll:e.scrollWidth,client:e.clientWidth,minWidth:getComputedStyle(e).minWidth};};return{viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,visualViewport:{width:visualViewport.width,scale:visualViewport.scale},tool:box(document.querySelector('.tool')),files:[...document.querySelectorAll('.file-row')].map(e=>({box:box(e),info:box(e.querySelector('.file-info')),actions:box(e.querySelector('.file-actions')),buttons:[...e.querySelectorAll('button')].map(b=>({text:b.innerText,box:box(b)}))}))};});
for(const width of [320,375,414,1440]){
 await page.setViewport({width,height:900,isMobile:width<600,hasTouch:width<600});await page.goto('http://localhost:4321/ru/images/compress-image/',{waitUntil:'networkidle0'});
 await(await page.$('input[type=file]')).uploadFile(out+'/noise.png');await page.waitForFunction(()=>document.querySelector('.file-actions'));
 const quality=await metrics();await page.select('#cp-by','size');await page.$eval('#cp-size',e=>{e.value='10';e.dispatchEvent(new Event('input',{bubbles:true}));});await sleep(700);await page.waitForFunction(()=>document.querySelector('.file-actions'));
 const warning=await metrics();await page.$eval('.file-row',e=>e.scrollIntoView({block:'center'}));await page.screenshot({path:out+'/screens/warning-viewport-'+width+'.png'});
 let diagnosticWrap=null;
 if(width<600){await page.addStyleTag({content:'@media(max-width:600px){.file-row{min-width:0;flex-wrap:wrap}.file-actions{flex-basis:100%;justify-content:flex-start}}'});await sleep(70);await page.evaluate(()=>scrollTo(0,scrollY));diagnosticWrap=await metrics();await page.screenshot({path:out+'/screens/diagnostic-wrap-'+width+'.png'});}
 rows.push({width,quality,warning,diagnosticWrap});
}
fs.writeFileSync(out+'/layout.json',JSON.stringify(rows,null,2));await browser.close();console.log(JSON.stringify(rows,null,2));
