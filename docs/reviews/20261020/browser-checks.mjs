import fs from 'node:fs';
import {launch,out,sleep,inspect,inventory} from './audit.mjs';
const browser=await launch(),page=await browser.newPage();
await page.setViewport({width:1440,height:1000});
const previous=process.argv.includes('--resume')?JSON.parse(fs.readFileSync(out+'/evidence/browser-checks.json')):null;
const redo=['diff-reference','timezone-reference','timezone-DST-gap'];
const results=previous?previous.results.filter(r=>!r.error&&!redo.includes(r.name)):[],requests=previous?.requests??[];
page.on('request',r=>requests.push({url:r.url(),method:r.method(),type:r.resourceType()}));
const go=async route=>{await page.goto(`http://localhost:4321/ru/${route}/`,{waitUntil:'networkidle0'});await sleep(80)};
const fill=async(selector,value)=>{await page.$eval(selector,(e,v)=>{if(e.tagName==='SELECT'&&![...e.options].some(o=>o.value===v))throw Error('Test requested nonexistent option '+v);e.value=v;e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));},String(value));await sleep(35)};
const snap=async()=>page.evaluate(()=>({url:location.href,text:document.querySelector('.tool')?.innerText,outputs:[...document.querySelectorAll('.tool output')].map(e=>e.innerText),textareas:[...document.querySelectorAll('.tool textarea')].map(e=>e.value),errors:[...document.querySelectorAll('.field-error,[role=alert]')].map(e=>e.innerText),invalid:[...document.querySelectorAll('[aria-invalid=true]')].map(e=>e.id),overflow:document.documentElement.scrollWidth>innerWidth}));
const record=async(name,route,action,check)=>{if(previous&&results.some(r=>r.name===name&&r.route===route))return;try{await go(route);await action();await sleep(100);const actual=await snap();const pass=check?await check(actual):true;results.push({name,route,pass,actual});}catch(e){results.push({name,route,pass:false,error:e.message})}fs.writeFileSync(out+'/evidence/browser-checks.json',JSON.stringify({results,requests},null,2));};
const clickText=async text=>page.evaluate(t=>{const e=[...document.querySelectorAll('.tool button')].find(e=>e.textContent.includes(t));if(!e)throw Error('Button not found: '+t);e.click()},text);
const definitions=JSON.parse(fs.readFileSync(out+'/evidence/definitions.json'));
for(const c of JSON.parse(fs.readFileSync(out+'/evidence/compute-checks.json')).results){
  await record('reference-inputs',c.route,async()=>{
    const d=definitions.find(d=>d.route===c.route);
    const entries=Object.entries(c.values).sort(([a],[b])=>(d.inputs[a].type==='select'?-1:0)-(d.inputs[b].type==='select'?-1:0));
    for(const [name,value]of entries){
      const s=d.inputs[name];let raw=value;
      if(s.type==='date')raw=value.split('-').reverse().join('.');
      if(s.type==='time')raw=`${Math.floor(value/60).toString().padStart(2,'0')}:${(value%60).toString().padStart(2,'0')}`;
      if(s.type==='duration')raw=`${Math.floor(value/60)}:${(value%60).toString().padStart(2,'0')}`;
      if(s.showIf&&!await page.$('#in-'+name))continue;
      await fill('#in-'+name,raw);
    }
    await sleep(80);
  },a=>a.outputs.some(x=>x!=='—')&&!a.errors.length);
}
console.log('Calculator reference UI checks finished');
const conv=[['length-converter',1,'in','cm',2.54],['weight-converter',1,'lb','kg',0.45359237],['volume-converter',1,'galUk','l',4.54609],['area-converter',1,'ha','m2',10000],['temperature-converter',32,'f','c',0],['speed-converter',36,'kmh','ms',10],['pressure-converter',1,'atm','pa',101325],['energy-converter',1,'kwh','j',3600000],['data-converter',1,'gib','b',1073741824],['fuel-consumption',10,'kml','l100',10]];
for(const[id,value,from,to,expected]of conv)await record('unit-reference','convert/'+id,async()=>{await fill('#cv-value',value);await fill('#cv-from',from);await fill('#cv-to',to);},a=>Math.abs(Number(a.outputs[0].replaceAll(/\s/g,'').replace(',','.'))-expected)<=Math.max(1e-7,expected*1e-7));

await record('privacy-URL-request','health/bmi',async()=>{await fill('#in-weight',81);await fill('#in-height',181);await page.reload({waitUntil:'networkidle0'});},a=>a.url.includes('weight=81')&&a.url.includes('height=181'));
await record('age-leap-birthday','dates/age-calculator',async()=>{await fill('#in-birth','29.02.2000');await fill('#in-on','28.02.2025');await page.screenshot({path:out+'/evidence/bug-age.png'});},a=>a.outputs[0]==='25');
await record('fractions-precision','math/fractions',async()=>{for(const[k,v]of Object.entries({n1:100000000,d1:100000001,n2:100000017,d2:100000018,op:'subtract'}))await fill('#in-'+k,v);},a=>a.outputs[0]==='−1/588235405882354');
await record('silent-business-validation','finance/break-even',async()=>{await fill('#in-price',900);await page.screenshot({path:out+'/evidence/bug-silent-errors.png'});},a=>a.errors.length>0);
await record('fractions-divide-by-zero','math/fractions',async()=>{await fill('#in-op','divide');await fill('#in-n2',0);},a=>a.errors.length>0);
await record('refinance-misleading-payback','finance/refinance',async()=>{for(const[k,v]of Object.entries({balance:1200,rate:0,months:12,newRate:0,newMonths:24,fees:100}))await fill('#in-'+k,v);},a=>a.text.includes('2 месяца'));
await record('local-number-ambiguous','math/percent-of',async()=>{await fill('#in-percent','10');await fill('#in-value','1.2.3');},a=>a.errors.length>0);
await record('base64-Unicode','security/base64',async()=>{await fill('#tc-in','Привет 🌍');},a=>a.textareas[1]==='0J/RgNC40LLQtdGCIPCfjI0=');
await record('base64-invalid','security/base64',async()=>{await clickText('Декодировать');await fill('#tc-in','%%%');},a=>a.errors.length>0);
await record('url-encode','security/url-encode',async()=>{await fill('#tc-in','a b&=é');},a=>a.textareas[1]==='a%20b%26%3D%C3%A9');
await record('caesar-cipher','security/caesar-cipher',async()=>{await fill('#cc-in','ABC xyz');},a=>a.textareas[1]==='DEF abc');
await record('morse-SOS','security/morse-code',async()=>{await fill('#tc-in','SOS');},a=>a.textareas[1].replaceAll(/\s/g,'')==='...---...');
await record('hash-abc','security/hash',async()=>{await fill('#hash-in','abc');await sleep(100);},a=>a.text.includes('900150983cd24fb0d6963f7d28e17f72')&&a.text.includes('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'));
await record('password-regenerate','security/password-generator',async()=>{const before=await page.$eval('.mono-out',e=>e.innerText);await clickText('Сгенерировать');await sleep(50);const after=await page.$eval('.mono-out',e=>e.innerText);results.push({name:'password-value',route:'security/password-generator',pass:before!==after&&after.length===16,actual:{before,after}});},a=>a.text.length>0);
await record('uuid-v4','security/uuid',async()=>{},a=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(a.textareas[0]));
await record('case-converter','text/case-converter',async()=>{await fill('#tc-in','Hello Мир');},a=>a.textareas[1]==='HELLO МИР');
await record('line-dedup','text/line-tools',async()=>{await fill('#tc-in','a\nb\na');},a=>a.textareas[1]==='a\nb');
await record('translit-passport','text/transliteration',async()=>{await fill('#tc-in','Юрий Щукин');},a=>a.textareas[1]==='Iurii Shchukin');
await record('word-counter','text/word-counter',async()=>{await fill('#wc-text','Hello world!\nПривет мир.');},a=>a.outputs[0]==='4'&&a.outputs[3]==='2'&&a.outputs[4]==='2');
await record('lorem-5-words','text/lorem-ipsum',async()=>{await fill('#li-unit','words');await fill('#li-count','5');},a=>a.textareas[0].trim().split(/\s+/).length===5);
await record('recipe-fractions','kitchen/recipe-scaler',async()=>{await fill('#rs-from','2');await fill('#rs-to','4');await fill('#rs-in','1/2 л молока\n2 яйца');},a=>a.textareas[1]==='1 л молока\n4 яйца');
await record('average-reference','math/average',async()=>{await fill('#avg-text','1 2 3 3');},a=>a.outputs[0]==='2,25'&&a.outputs[1]==='2,5'&&a.outputs[2]==='3');
await record('number-base-bigint','math/number-base',async()=>{await fill('#nb-input','9007199254740993');},a=>a.outputs[2]==='9007199254740993');
await record('roman-canonical','math/roman-numerals',async()=>{await fill('#rn-input','MCMXCIV');},a=>a.outputs[0]==='1 994'||a.outputs[0]==='1994');
await record('random-fixed-range','math/random-number',async()=>{await fill('#rnd-from','7');await fill('#rnd-to','7');await clickText('Сгенерировать');},a=>a.outputs[0]==='7');
await record('dice-single','random/dice-roller',async()=>{await fill('#dr-count','1');await fill('#dr-sides','6');await clickText('Бросить');},a=>/Сумма|Итого/.test(a.text));
await record('picker-one','random/random-picker',async()=>{await fill('#rp-list','Only');await clickText('Выбрать');},a=>a.text.includes('Only'));
await record('teams-unique','random/team-generator',async()=>{await fill('#tg-list','Alice\nBob\nCharlie\nDiana');await fill('#tg-teams','2');await clickText('Разделить');},a=>['Alice','Bob','Charlie','Diana'].every(n=>a.text.includes(n)));
await record('json-formatter-reference','dev/json-formatter',async()=>{await fill('#tc-in','{"b":2,"a":1}');},a=>a.textareas[1]==='{\n  "b": 2,\n  "a": 1\n}');
await record('json-large-integer','dev/json-formatter',async()=>{await fill('#tc-in','{"id":9007199254740993}');},a=>a.textareas[1].includes('9007199254740993'));
await record('JWT-untrusted','dev/jwt-decoder',async()=>{await fill('#jwt-in','eyJhbGciOiJub25lIn0.eyJleHAiOjB9.');},a=>a.text.includes('Подпись не проверяется')&&a.text.includes('истёк'));
await record('CIDR-31','dev/cidr',async()=>{await fill('#cidr-in','192.0.2.0/31');},a=>a.text.includes('192.0.2.1')&&a.text.includes('2'));
await record('color-reference','dev/color-converter',async()=>{await fill('#color-in','#ff0000');},a=>a.text.includes('rgb(255 0 0)')&&a.text.includes('#ff0000'));
await record('diff-reference','dev/text-diff',async()=>{await fill('#diff-a','a\nb');await fill('#diff-b','a\nc');},a=>a.text.includes('Добавлено строк: 1')&&a.text.includes('Удалено строк: 1'));
await record('regex-timeout','dev/regex-tester',async()=>{await fill('#rx-pattern','(a+)+$');await fill('#rx-text','a'.repeat(40)+'!');await sleep(2300);},a=>a.errors.some(e=>e.includes('2')));
await record('regex-recovery','dev/regex-tester',async()=>{await fill('#rx-pattern','a+');await fill('#rx-text','aa bb aaa');await sleep(150);},a=>a.text.includes('2 совпадения'));
await record('timezone-DST-gap','dates/timezone-converter',async()=>{await fill('#tz-from','America/New_York');await fill('#tz-date','08.03.2026');await fill('#tz-time','02:30');await sleep(100);await page.screenshot({path:out+'/evidence/bug-timezone-gap.png'});},a=>a.text.includes('GMT\t07:30'));
await record('timezone-reference','dates/timezone-converter',async()=>{await fill('#tz-from','UTC');await fill('#tz-date','01.01.2026');await fill('#tz-time','12:00');},a=>a.text.includes('GMT\t12:00')&&a.text.includes('19:00'));
await record('picker-two','random/random-picker',async()=>{await fill('#rp-list','Alice\nBob');await clickText('Выбрать');},async()=>await page.$$eval('.picked li',es=>es.length===1&&['Alice','Bob'].includes(es[0].innerText)));
await record('word-counter-hyphen-documentation','text/word-counter',async()=>{await fill('#wc-text','из-за');},a=>a.outputs[0]==='1');
await record('historical-weekdays','dates/days-between',async()=>{await fill('#in-from','27.12.1969');await fill('#in-to','29.12.1969');},a=>a.outputs[2]==='0');
await record('historical-ISO-week','dates/week-number',async()=>{await fill('#in-date','28.12.1969');await fill('#in-system','iso');},a=>a.outputs[0]==='52'&&a.outputs[1]==='1969');
await record('calories-under-18','health/calorie-calculator',async()=>{await fill('#in-age','15');},a=>a.errors.length>0);
await record('units-preserve-scenario','health/bmi',async()=>{const before=await snap();await clickText('Американские');await sleep(100);const after=await snap();results.push({name:'units-before-after',route:'health/bmi',pass:before.outputs[0]===after.outputs[0],actual:{before:before.outputs,after:after.outputs}});},a=>a.outputs[0]==='22,9');
await record('large-average-handles-150k','math/average',async()=>{await fill('#avg-text',Array.from({length:150000},(_,i)=>i).join('\n'));await sleep(150);},a=>a.outputs[0]==='74 999,5');
await record('copy-clipboard','security/base64',async()=>{await browser.defaultBrowserContext().overridePermissions('http://localhost:4321',['clipboard-read','clipboard-write']);await fill('#tc-in','hello');await clickText('Копировать');},async()=>await page.evaluate(()=>navigator.clipboard.readText())==='aGVsbG8=');
await record('uuid-v7','security/uuid',async()=>{await clickText('v7');},a=>/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(a.textareas[0]));
await record('password-no-sets','security/password-generator',async()=>{await page.$$eval('.checks input',(es)=>es.slice(0,4).forEach(e=>e.click()));},a=>a.text.includes('Выберите')&&a.text.includes('—'));

for(const [route,field]of [['health/bmi','#in-weight'],['math/percent-of','#in-value'],['finance/mortgage','#in-price']]){
  await record('blank-validation',route,async()=>{await fill(field,'');},a=>a.errors.length>0&&a.invalid.length>0);
}
// Confirm the HTTP request caused by refreshing an automatically parameterized calculator URL.
const privacyRequests=requests.filter(r=>r.type==='document'&&r.url.includes('health/bmi')&&r.url.includes('weight=81'));
fs.writeFileSync(out+'/evidence/browser-checks.json',JSON.stringify({results,privacyRequests,requests},null,2));
await browser.close();
console.log(JSON.stringify({total:results.length,pass:results.filter(r=>r.pass).length,failures:results.filter(r=>!r.pass).map(r=>({name:r.name,route:r.route,error:r.error})),privacyRequests},null,2));
