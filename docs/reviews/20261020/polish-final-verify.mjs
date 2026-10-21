// Проверка сохранённых артефактов этой приёмки, не повторный запуск браузера.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const out='evidence/polish-final-20261021';
const read=p=>JSON.parse(fs.readFileSync(out+'/'+p,'utf8'));
const browser=read('browser.json'),pure=read('legacy-pure.json'),sweep=read('evidence/sweep-summary.json');
const head=execFileSync('git',['-C','/home/gwer/code/qdbp','rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.equal(head,'7bd8b7047c1ca320327d5ea57d4d099b3ce1f60b');
const known=['empty-month','blank-month','infinite-amount','overflow-amount'];
assert.equal(browser.rows.length,41);
assert.deepEqual(browser.rows.filter(r=>!r.pass).map(r=>r.name),known.map(s=>'legacy-invalid-'+s));
assert.deepEqual(pure.filter(r=>!r.pass).map(r=>r.name),known);
assert.equal(pure.length,15);
assert.deepEqual(browser.errors,[]);
assert.deepEqual(browser.externalRequests,[]);
assert(browser.rows.every(r=>!r.harnessError&&!r.pageErrors.length));
assert.equal(sweep.pages,536);
for(const key of ['failures','issues','missingInSitemap','extraInSitemap','smallFontPages'])assert.deepEqual(sweep[key],[]);
assert.equal(sweep.sitemapPages,536);
const checkLog=fs.readFileSync('evidence/polish-final-project-check.log','utf8');
assert.match(checkLog,/Test Files\s+97 passed \(97\)/);
assert.match(checkLog,/Tests\s+794 passed \(794\)/);
assert.match(checkLog,/Пост-проверки пройдены/);
const group=fn=>{const a=browser.rows.filter(fn);return{total:a.length,passed:a.filter(r=>r.pass).length};};
const summary={date:'2026-10-21',head,scope:'N01/N02 and legacy URL compatibility; not a new exhaustive review',
 N01:{status:'closed',...group(r=>r.name.startsWith('N01-'))},
 N02:{status:'closed',...group(r=>r.name==='N02-rounding-note')},
 legacy:{validAndPriority:group(r=>r.name.startsWith('legacy-')&&!r.name.startsWith('legacy-invalid-')),invalid:group(r=>r.name.startsWith('legacy-invalid-'))},
 browser:{total:41,passed:37,pageErrors:0,externalRequests:0},pure:{total:15,passed:11},
 projectCheck:{tests:794,testFiles:97,passed:true},smoke:{pages:536,sitemapPages:536,issues:0},
 findings:[{id:'N03',priority:'P3',title:'Malformed legacy values: blank after coerced to 0; non-finite extra accepted',cases:known}],
 acceptance:{N01:true,N02:true,validLegacyLinks:true,newPrepayPriority:true,allMalformedLegacyValuesIgnored:false},
 unchanged:'Application source, commits, remote and deployment; prior evidence preserved',
 limits:['Chrome/Linux mobile emulation, not physical mobile devices','No production or remote branch fetch','Prior deep P01–P10/JPEG checks not repeated; current changes targeted plus full smoke'],
};
fs.writeFileSync(out+'/verification-summary.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
