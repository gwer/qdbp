import fs from 'node:fs';
import path from 'node:path';
import puppeteer from '/home/gwer/code/tmp/pdf-gen-bench/server/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';

export const root = '/home/gwer/code/qdbp';
export const out = '/home/gwer/code/qdbp/docs/reviews/20261020';
export const langs = ['en','ru','es','de','pt'];
const pages = path.join(root,'src/pages/[lang]');
export const inventory = [];
for (const cat of fs.readdirSync(pages).sort()) {
  if (!fs.statSync(path.join(pages,cat)).isDirectory()) continue;
  for (const id of fs.readdirSync(path.join(pages,cat)).sort()) {
    const dir = path.join(pages,cat,id,'_tool');
    if (!fs.existsSync(path.join(dir,'tool.ts'))) continue;
    const source = fs.readFileSync(path.join(dir,'tool.ts'),'utf8');
    const translations = Object.fromEntries(langs.filter(l=>fs.existsSync(path.join(dir,`i18n/${l}.json`))).map(l=>[l,JSON.parse(fs.readFileSync(path.join(dir,`i18n/${l}.json`),'utf8'))]));
    inventory.push({cat,id,route:`${cat}/${id}`,kind:source.match(/kind:\s*'([^']+)'/)?.[1],langs:Object.keys(translations),translations,dir});
  }
}
export async function launch() {
  return puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking'],userDataDir:fs.mkdtempSync('/tmp/qdbp-review-chrome-')});
}
export const sleep = ms=>new Promise(r=>setTimeout(r,ms));
export async function inspect(page) {
  return page.evaluate(()=>({
    url:location.href,title:document.title,lang:document.documentElement.lang,
    description:document.querySelector('meta[name=description]')?.content,
    canonical:document.querySelector('link[rel=canonical]')?.href,
    alternates:[...document.querySelectorAll('link[hreflang]')].map(e=>({lang:e.hreflang,href:e.href})),
    h1:[...document.querySelectorAll('h1')].map(e=>e.innerText),
    headings:[...document.querySelectorAll('article h2,article h3')].map(e=>e.innerText),
    content:document.querySelector('article')?.innerText,
    tool:document.querySelector('.tool')?.innerText,
    fields:[...document.querySelectorAll('.tool input,.tool select,.tool textarea')].map(e=>({tag:e.tagName,type:e.type,id:e.id,name:e.name,value:e.value,label:e.labels?.[0]?.innerText,placeholder:e.placeholder,options:e.tagName==='SELECT'?[...e.options].map(o=>({value:o.value,text:o.textContent})):undefined,readonly:e.readOnly,invalid:e.getAttribute('aria-invalid')})),
    links:[...document.querySelectorAll('a[href]')].map(e=>({href:e.getAttribute('href'),text:e.innerText})),
    jsonLd:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>JSON.parse(e.textContent)),
    overflow:document.documentElement.scrollWidth>innerWidth,
    overflowElements:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left < -1)}).slice(0,12).map(e=>({tag:e.tagName,class:e.className,text:e.innerText?.slice(0,120),width:e.getBoundingClientRect().width})),
    smallTargets:[...document.querySelectorAll('.tool button,.tool select,.lang-menu summary')].map(e=>({text:e.innerText?.slice(0,80),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})).filter(e=>e.w<24||e.h<24),
    errors:[...document.querySelectorAll('.field-error,[role=alert]')].map(e=>e.innerText),
    result:document.querySelector('.calc-result')?.innerText,
    bodyHeight:document.body.scrollHeight,
  }));
}

if (process.argv[2]==='inventory') {
  fs.mkdirSync(path.join(out,'evidence'),{recursive:true});
  fs.writeFileSync(path.join(out,'evidence/inventory.json'),JSON.stringify(inventory,null,2));
  console.log(JSON.stringify({tools:inventory.length,languages:Object.fromEntries(langs.map(l=>[l,inventory.filter(t=>t.langs.includes(l)).length])),categories:Object.fromEntries([...new Set(inventory.map(t=>t.cat))].map(c=>[c,inventory.filter(t=>t.cat===c).length]))},null,2));
}

if (process.argv[2]==='crawl') {
  const browser=await launch();
  const routes=langs.flatMap(l=>[{lang:l,route:'',type:'home'},...[...new Set(inventory.map(t=>t.cat))].map(c=>({lang:l,route:c+'/',type:'category'})),...inventory.filter(t=>t.langs.includes(l)).map(t=>({lang:l,route:t.route+'/',type:'tool'}))]);
  let cursor=0,done=0;
  const results=[];
  const start=Date.now();
  await Promise.all(Array.from({length:3},async(_,worker)=>{
    const page=await browser.newPage();
    await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
    while(cursor<routes.length) {
      const job=routes[cursor++], errors=[],requests=[];
      const onError=e=>errors.push(e.message);
      const onRequest=req=>{if(!req.url().startsWith('http://localhost:4321')&&!req.url().startsWith('data:')&&!req.url().startsWith('blob:')) requests.push(req.url())};
      page.on('pageerror',onError);page.on('request',onRequest);
      try {
        const response=await page.goto(`http://localhost:4321/${job.lang}/${job.route}`,{waitUntil:'networkidle0',timeout:60000});
        await page.waitForFunction(()=>![...document.querySelectorAll('astro-island[client]')].some(e=>e.hasAttribute('ssr')),{timeout:15000}).catch(()=>{});
        const desktop=await inspect(page);
        await page.setViewport({width:375,height:812,deviceScaleFactor:1,isMobile:true,hasTouch:true});
        const mobile=await inspect(page);
        results.push({...job,status:response.status(),desktop,mobile:{overflow:mobile.overflow,overflowElements:mobile.overflowElements,smallTargets:mobile.smallTargets,bodyHeight:mobile.bodyHeight},pageErrors:errors,externalRequests:requests});
        if(job.type==='home'&&job.lang==='ru'||job.type==='tool'&&job.lang==='ru'&&['finance/mortgage/','dev/json-formatter/','images/compress-image/','dates/days-between/'].includes(job.route)) {
          await page.screenshot({path:path.join(out,`evidence/${job.lang}-${job.route.replaceAll('/','-')||'home'}-mobile.png`),fullPage:true});
          await page.setViewport({width:1440,height:1000,deviceScaleFactor:1,isMobile:false,hasTouch:false});
          await page.screenshot({path:path.join(out,`evidence/${job.lang}-${job.route.replaceAll('/','-')||'home'}-desktop.png`),fullPage:true});
        }
      } catch(e){results.push({...job,error:e.message})}
      page.off('pageerror',onError);page.off('request',onRequest);
      await page.setViewport({width:1440,height:1000,deviceScaleFactor:1,isMobile:false,hasTouch:false});
      done++;
      fs.writeFileSync(path.join(out,'evidence/crawl.json'),JSON.stringify(results,null,2));
      if(done%20===0) console.log(`${done}/${routes.length} pages; ${Math.round((Date.now()-start)/1000)}s`);
    }
    await page.close();
  }));
  await browser.close();
  console.log(JSON.stringify({total:results.length,failed:results.filter(r=>r.error||r.status!==200).map(r=>({lang:r.lang,route:r.route,error:r.error,status:r.status})),pageErrors:results.filter(r=>r.pageErrors?.length).map(r=>({lang:r.lang,route:r.route,errors:r.pageErrors})),mobileOverflow:results.filter(r=>r.mobile?.overflow).map(r=>({lang:r.lang,route:r.route})),external:results.filter(r=>r.externalRequests?.length)},null,2));
}
