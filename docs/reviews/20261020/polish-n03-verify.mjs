// Проверка сохранённых артефактов приёмки N03; не запуск сервера/браузера.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='evidence/polish-n03-20261021';
const read=p=>JSON.parse(fs.readFileSync(out+'/'+p,'utf8'));
const browser=read('browser.json'),pure=read('legacy-pure.json'),sweep=read('evidence/sweep-summary.json');
assert.equal(browser.rows.length,41);
assert(browser.rows.every(r=>r.pass&&!r.harnessError&&!r.pageErrors.length));
assert.equal(pure.length,15);
assert(pure.every(r=>r.pass));
assert.deepEqual(browser.errors,[]);
assert.deepEqual(browser.externalRequests,[]);
assert.equal(sweep.pages,536);
assert.equal(sweep.sitemapPages,536);
for(const key of ['failures','issues','missingInSitemap','extraInSitemap','smallFontPages'])assert.deepEqual(sweep[key],[]);
const log=fs.readFileSync('evidence/polish-n03-project-check.log','utf8');
assert.match(log,/Test Files\s+97 passed \(97\)/);
assert.match(log,/Tests\s+794 passed \(794\)/);
assert.match(log,/Пост-проверки пройдены/);
const group=fn=>{const rs=browser.rows.filter(fn);return{total:rs.length,passed:rs.filter(r=>r.pass).length};};
const summary={date:'2026-10-21',head:'4643ef9d0ab056baad6be285f7fd43c673a5e37c',N03:'closed',
 projectCheck:{tests:794,testFiles:97,passed:true},
 pure:{total:15,passed:15},browser:{total:41,passed:41,pageErrors:0,externalRequests:0},
 malformedLegacy:group(r=>r.name.startsWith('legacy-invalid-')),
 validLegacyAndPriority:group(r=>r.name.startsWith('legacy-')&&!r.name.startsWith('legacy-invalid-')),
 N01Regression:group(r=>r.name.startsWith('N01-')),N02Regression:group(r=>r.name==='N02-rounding-note'),
 smoke:{pages:536,sitemapPages:536,issues:0},newFindings:[],
 sourceEdits:false,commitsOrPush:false,
 limits:['Chrome/Linux with mobile emulation, not physical devices','No production verification','Previous deep P01–P10/JPEG independent checks not repeated'],
};
fs.writeFileSync(out+'/verification-summary.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
