import fs from 'node:fs';
import cp from 'node:child_process';
const root='/home/gwer/code/qdbp',base='b3ba6c5';
const paths=cp.execFileSync('git',['diff','--name-only',base,'HEAD','--','*.json','*.md'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(p=>p.startsWith('src/'));
const flatten=(o,p='',r={})=>{for(const[k,v]of Object.entries(o)){const key=p?`${p}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,key,r);else r[key]=v;}return r;};
const rows=[];
for(const path of paths){const now=fs.readFileSync(`${root}/${path}`,'utf8');const old=cp.execFileSync('git',['show',`${base}:${path}`],{cwd:root,encoding:'utf8'});
 if(path.endsWith('.json')){const a=flatten(JSON.parse(old)),b=flatten(JSON.parse(now));for(const[key,value]of Object.entries(b))if(JSON.stringify(value)!==JSON.stringify(a[key]))rows.push({path,key,before:a[key],after:value});}
 else {const diff=cp.execFileSync('git',['diff','--unified=0',base,'HEAD','--',path],{cwd:root,encoding:'utf8'});rows.push({path,added:diff.split('\n').filter(l=>l.startsWith('+')&&!l.startsWith('+++')).map(l=>l.slice(1))});}
}
fs.mkdirSync('evidence/polish-20261021',{recursive:true});
fs.writeFileSync('evidence/polish-20261021/copy-delta.json',JSON.stringify(rows,null,2));
for(const lang of ['ru','en','es','de','pt']){
const selected=rows.filter(r=>r.path.endsWith(`/${lang}.json`)||r.path.endsWith(`/${lang}.md`));
const text=selected.map(r=>`${r.path.replace('src/pages/[lang]/','')} ${r.key??''}\n${r.after??r.added.join('\n')}\n`).join('\n');
fs.writeFileSync(`evidence/polish-20261021/copy-${lang}.txt`,text);
let last='';const compact=[];
for(const r of selected){const group=r.path.replace('src/pages/[lang]/','').replace(/\/_tool\/(content|i18n)\/.*$/,'').replace('src/i18n/ui/'+lang+'.json','common');if(group!==last){compact.push('\n## '+group);last=group;}compact.push(r.key?`${r.key}: ${r.after}`:r.added.join('\n'));}
fs.writeFileSync(`evidence/polish-20261021/compact-${lang}.txt`,compact.join('\n'));
}
console.log({changedFiles:paths.length,changedStrings:rows.filter(r=>r.key).length,contentFiles:rows.filter(r=>r.added).length});
