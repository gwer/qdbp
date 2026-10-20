import fs from 'node:fs';
import path from 'node:path';
import {launch,out,root,inventory,sleep} from './audit.mjs';
const crawl=JSON.parse(fs.readFileSync(out+'/evidence/crawl.json'));
const urls=new Set(crawl.map(p=>`/${p.lang}/${p.route}`));
const issues=[];
for(const p of crawl){
  const d=p.desktop,url=`/${p.lang}/${p.route}`;
  if(d.h1.length!==1)issues.push({url,type:'H1',value:d.h1});
  if(d.canonical!=='https://qdbp.net'+url)issues.push({url,type:'canonical',value:d.canonical});
  for(const a of d.alternates){const route=new URL(a.href).pathname;if(!urls.has(route))issues.push({url,type:'alternate missing',target:route});}
  for(const a of d.links){if(a.href?.startsWith('/')&&!a.href.startsWith('//')&&!urls.has(a.href.split(/[?#]/)[0])&&!a.href.startsWith('/licenses/'))issues.push({url,type:'broken internal link',target:a.href});}
}
const duplicates=[];
for(const lang of ['en','ru','es','de','pt'])for(const key of ['title','description']){
  const m=new Map();for(const p of crawl.filter(p=>p.lang===lang)){const v=p.desktop[key];m.set(v,[...(m.get(v)??[]),p.route])}for(const[v,routes]of m)if(routes.length>1)duplicates.push({lang,key,value:v,routes});
}
const sitemap=fs.readFileSync(root+'/dist/sitemap-0.xml','utf8'),sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const stats={pages:crawl.length,toolPages:crawl.filter(p=>p.type==='tool').length,sitemapURLs:sitemapUrls.length,missingInSitemap:[...urls].filter(u=>!sitemapUrls.includes(u)),extraInSitemap:sitemapUrls.filter(u=>!urls.has(u)),issues,duplicates,metadata: crawl.filter(p=>p.type==='tool'&&(p.desktop.title.length>70||p.desktop.description.length>160)).map(p=>({lang:p.lang,route:p.route,title:p.desktop.title,titleLength:p.desktop.title.length,description:p.desktop.description,descriptionLength:p.desktop.description.length}))};
fs.writeFileSync(out+'/evidence/seo-checks.json',JSON.stringify(stats,null,2));
const browser=await launch(),page=await browser.newPage();
await page.setViewport({width:320,height:740,isMobile:true,hasTouch:true});
const layouts=[];
for(const t of inventory){
  await page.goto(`http://localhost:4321/ru/${t.route}/`,{waitUntil:'load'});await sleep(90);
  const r=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,unlabelled:[...document.querySelectorAll('.tool input,.tool textarea,.tool select')].filter(e=>e.getBoundingClientRect().height>2&&e.type!=='hidden'&&!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>({tag:e.tagName,type:e.type,id:e.id})),tinyText:[...document.querySelectorAll('.tool input[type=text],.tool textarea,.tool select')].map(e=>({id:e.id,font:parseFloat(getComputedStyle(e).fontSize)})).filter(x=>x.font<16),toolTop:document.querySelector('.tool').getBoundingClientRect().top}));
  layouts.push({route:t.route,...r});
}
for(const [route,width,theme]of [['',1440,'light'],['',375,'light'],['images/heic-to-jpg/',375,'dark'],['dev/json-formatter/',375,'light']]){
  await page.setViewport({width,height:900,isMobile:width<600,hasTouch:width<600});
  await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:theme}]);
  await page.goto('http://localhost:4321/ru/'+route,{waitUntil:'networkidle0'});
  await page.screenshot({path:out+`/evidence/${route.replaceAll('/','-')||'home'}-${width}-${theme}.png`});
}
const misc=[];
for(const route of ['/','/ru/missing-review-route/','/ru/math/percent-of','/zz/math/percent-of/','/robots.txt','/sitemap-index.xml']){
  const r=await page.goto('http://localhost:4321'+route,{waitUntil:'networkidle0'});misc.push({route,status:r.status(),finalURL:page.url(),title:await page.title(),body:(await page.$eval('body',e=>e.innerText).catch(()=>''))?.slice(0,200),headers:r.headers()});
}
await page.goto('http://localhost:4321/ru/math/percent-of/',{waitUntil:'networkidle0'});
await page.evaluate(()=>localStorage.setItem('qdbp:units','metric'));
await page.setJavaScriptEnabled(false);
await page.reload({waitUntil:'networkidle0'});
await page.$eval('#in-value',e=>e.value='200');
const noJS=await page.evaluate(()=>({input:document.querySelector('#in-value').value,result:document.querySelector('output').textContent,noscript:[...document.querySelectorAll('noscript')].map(e=>e.textContent)}));
fs.writeFileSync(out+'/evidence/layout-checks.json',JSON.stringify({layouts,misc,noJS},null,2));
await browser.close();
console.log(JSON.stringify({seo:{pages:stats.pages,sitemapURLs:stats.sitemapURLs,issues,duplicates,missing:stats.missingInSitemap,extra:stats.extraInSitemap},overflow:layouts.filter(l=>l.overflow),unlabelled:layouts.filter(l=>l.unlabelled.length),smallFonts:layouts.filter(l=>l.tinyText.length),misc,noJS},null,2));
