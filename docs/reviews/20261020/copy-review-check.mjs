// Verify saved editorial artifacts against the current source. No writes.
import fs from 'node:fs';
import crypto from 'node:crypto';
const root='/home/gwer/code/qdbp';
const langs=['en','ru','es','de','pt'];
const data=JSON.parse(fs.readFileSync('evidence/language-proofreading.json','utf8'));
const files=langs.flatMap(l=>JSON.parse(fs.readFileSync(`evidence/language-coverage-${l}.json`,'utf8')).files);
let rows=0;
for(const l of langs) {
  const text=fs.readFileSync(`evidence/language-proofreading-${l}.md`,'utf8');
  const count=text.split('\n').filter(s=>/^\| L\d{3} \/ P[23] \|/.test(s)).length;
  rows+=count;
  if(count!==data.totals[l].proposals)throw Error(`Row count ${l}`);
}
const params=s=>[...s.matchAll(/\{([a-zA-Z]\w*)\}/g)].map(m=>m[1]).sort().join(',');
for(const e of data.edits) {
  const source=fs.readFileSync(`${root}/${e.path}`,'utf8');
  const found=e.path.endsWith('.json')
    ? e.field.split('.').reduce((v,k)=>v[k],JSON.parse(source))===e.before
    : source.includes(e.before);
  if(!found)throw Error(`Source changed ${e.id}`);
  if(params(e.before)!==params(e.after))throw Error(`Parameters changed ${e.id}`);
}
for(const f of files) {
  const hash=crypto.createHash('sha256').update(fs.readFileSync(`${root}/${f.path}`)).digest('hex');
  if(hash!==f.sha256)throw Error(`Stale coverage ${f.path}`);
}
const docs=['README.md','03-content-and-localization.md','07-methodology.md','09-language-proofreading.md',...langs.map(l=>`evidence/language-proofreading-${l}.md`)];
for(const path of docs)for(const m of fs.readFileSync(path,'utf8').matchAll(/(?<!\\)\]\(([^)]+)\)/g)) {
  if(m[1].startsWith('http')||m[1].startsWith('#'))continue;
  const target=new URL(m[1],new URL(path,`file://${process.cwd()}/`));
  if(!fs.existsSync(target))throw Error(`Broken local link ${path}: ${m[1]}`);
}
if(rows!==data.edits.length||files.length!==1007||new Set(files.map(f=>f.path)).size!==1007)throw Error('Coverage count');
console.log(JSON.stringify({valid:true,coverageFiles:files.length,proposals:data.edits.length,tableRows:rows,affectedFiles:new Set(data.edits.map(e=>e.path)).size,optionalP3:data.edits.filter(e=>e.priority==='P3').length,brokenLocalLinks:0},null,2));
