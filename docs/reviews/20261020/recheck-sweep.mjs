import fs from 'node:fs';
import {root,out,launch,sleep,inventory,langs} from './recheck-env.mjs';
const browser=await launch();
const urls=fs.readFileSync(root+'/urls.txt','utf8').split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')).map(s=>s.startsWith('http')?new URL(s).pathname:s);
const known=new Set(urls), rows=[];let cursor=0;
const start=Date.now();
await Promise.all(Array.from({length:3},async()=>{
  const page=await browser.newPage();
  while(cursor<urls.length) {
    const route=urls[cursor++], errors=[];
    const onError=e=>errors.push(e.message);page.on('pageerror',onError);
    try {
      await page.setViewport({width:1440,height:1000,isMobile:false,hasTouch:false});
      const response=await page.goto('http://localhost:4321'+route,{waitUntil:'load',timeout:20000});
      await page.waitForFunction(()=>![...document.querySelectorAll('astro-island[client]')].some(e=>e.hasAttribute('ssr')),{timeout:10000});
      const desktop=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name=description]')?.content,h1:[...document.querySelectorAll('h1')].map(e=>e.innerText),lang:document.documentElement.lang,canonical:document.querySelector('link[rel=canonical]')?.href,alternates:[...document.querySelectorAll('link[hreflang]')].map(e=>({lang:e.hreflang,href:e.href})),links:[...document.querySelectorAll('a[href]')].map(e=>e.getAttribute('href')),outputs:[...document.querySelectorAll('output')].map(e=>e.innerText),computeErrors:[...document.querySelectorAll('.calc-error')].map(e=>e.innerText),overflow:document.documentElement.scrollWidth>innerWidth}));
      await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});await sleep(15);
      const mobile=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,height:document.body.scrollHeight,smallFonts:[...document.querySelectorAll('.tool input[type=text],.tool textarea,.tool select')].filter(e=>e.getBoundingClientRect().height>0&&parseFloat(getComputedStyle(e).fontSize)<16).map(e=>({id:e.id,font:getComputedStyle(e).fontSize})),breadcrumbs:document.querySelector('nav.breadcrumbs')?.getAttribute('aria-label')}));
      let narrow=null;
      if(route.startsWith('/ru/')) {await page.setViewport({width:320,height:740,isMobile:true,hasTouch:true});narrow=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth}));}
      rows.push({route,status:response.status(),desktop,mobile,narrow,pageErrors:errors});
    } catch(e){rows.push({route,error:e.message,pageErrors:errors});}
    page.off('pageerror',onError);
    if(rows.length%50===0){fs.writeFileSync(out+'/evidence/sweep.json',JSON.stringify(rows,null,2));console.log(rows.length+'/'+urls.length);}
  }
  await page.close();
}));
const issues=[];
for(const r of rows)if(!r.error) {
  if(r.status!==200||r.desktop.h1.length!==1||r.desktop.canonical!=='https://qdbp.net'+r.route||r.desktop.overflow||r.mobile.overflow||r.narrow?.overflow||r.pageErrors.length||r.desktop.computeErrors.length)issues.push(r);
  for(const l of r.desktop.links)if(l?.startsWith('/')&&!l.startsWith('//')&&!l.startsWith('/licenses/')&&!known.has(l.split(/[?#]/)[0]))issues.push({route:r.route,brokenLink:l});
  for(const l of r.desktop.alternates)if(!known.has(new URL(l.href).pathname))issues.push({route:r.route,brokenAlternate:l});
}
const sitemap=fs.readFileSync(root+'/dist/sitemap-0.xml','utf8');
const sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const page=await browser.newPage(),shots=[];
for(const [route,width,theme] of [['/ru/',375,'light'],['/ru/',1440,'light'],['/de/text/line-tools/',375,'light'],['/ru/images/compress-image/',375,'dark'],['/ru/math/fractions/',375,'light']]) {
  await page.setViewport({width,height:900,isMobile:width<600,hasTouch:width<600});await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:theme}]);
  await page.goto('http://localhost:4321'+route,{waitUntil:'networkidle0'});
  const name=route.slice(1).replaceAll('/','-')+`${width}-${theme}.png`;await page.screenshot({path:out+'/evidence/'+name,fullPage:true});shots.push(name);
}
const oldPaths=['/ru/repair/','/en/repair/paint/','/ru/dev/cidr/','/ru/convert/data-converter/'],old=[];
for(const route of oldPaths){const r=await page.goto('http://localhost:4321'+route,{waitUntil:'load'});old.push({route,status:r.status(),final:page.url()});}
await browser.close();
const summary={pages:rows.length,elapsedSeconds:(Date.now()-start)/1000,failures:rows.filter(r=>r.error),issues,sitemapPages:sitemapUrls.length,missingInSitemap:urls.filter(u=>!sitemapUrls.includes(u)),extraInSitemap:sitemapUrls.filter(u=>!known.has(u)),smallFontPages:rows.filter(r=>r.mobile?.smallFonts.length).map(r=>({route:r.route,fields:r.mobile.smallFonts})),home:rows.filter(r=>/^\/(en|ru|de|es|pt)\/$/.test(r.route)).map(r=>({route:r.route,height:r.mobile.height})),oldPaths:old,screenshots:shots};
fs.writeFileSync(out+'/evidence/sweep.json',JSON.stringify(rows,null,2));fs.writeFileSync(out+'/evidence/sweep-summary.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
