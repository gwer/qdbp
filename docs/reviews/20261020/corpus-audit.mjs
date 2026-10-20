import fs from 'node:fs';
import {inventory,out,langs} from './audit.mjs';
const flatten=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='string'?[[p+k,v]]:flatten(v,p+k+'.'));
const rows=[],flags=[];
for(const t of inventory){
  const ref=new Map(flatten(t.translations.ru));
  for(const l of t.langs){
    const dict=new Map(flatten(t.translations[l])),content=fs.readFileSync(t.dir+`/content/${l}.md`,'utf8');
    const pluralForm=/\.(zero|one|two|few|many|other)$/;
    const missing=[...ref.keys()].filter(k=>!dict.has(k)&&!pluralForm.test(k)),extra=[...dict.keys()].filter(k=>!ref.has(k)&&!pluralForm.test(k));
    const placeholderMismatch=[];
    for(const[k,v]of dict){if(!ref.has(k))continue;const vars=x=>[...x.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join(',');if(vars(v)!==vars(ref.get(k)))placeholderMismatch.push(k)}
    const cyrillic=l!=='ru'&&/[А-Яа-яЁё]/.test(content);
    rows.push({route:t.route,lang:l,title:t.translations[l].title,description:t.translations[l].description,words:content.trim().split(/\s+/).length,headings:[...content.matchAll(/^##+ (.+)$/gm)].map(m=>m[1]),keys:dict.size,missing,extra,placeholderMismatch,cyrillic});
    if(missing.length||extra.length||placeholderMismatch.length||cyrillic)flags.push(rows.at(-1));
  }
}
fs.writeFileSync(out+'/evidence/corpus-audit.json',JSON.stringify({rows,flags},null,2));
const csv=rows.map(r=>[r.route,r.lang,r.title,r.description,r.words,r.keys,r.missing.join(';'),r.placeholderMismatch.join(';')].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','));
fs.writeFileSync(out+'/evidence/content-inventory.csv','route,lang,title,description,words,keys,missing_keys,placeholder_mismatch\n'+csv.join('\n')+'\n');
console.log(JSON.stringify({files:rows.length,flags:flags.map(f=>({route:f.route,lang:f.lang,missing:f.missing,extra:f.extra,placeholderMismatch:f.placeholderMismatch,cyrillic:f.cyrillic}))},null,2));
