import fs from 'node:fs';
import crypto from 'node:crypto';
const root='/home/gwer/code/qdbp';
const reviewed=JSON.parse(fs.readFileSync('evidence/language-proofreading.json','utf8'));
const move=s=>s.replaceAll('/repair/','/construction/').replaceAll('/dev/cidr/','/dev/subnet-calculator/').replaceAll('/convert/data-converter/','/convert/data-size-converter/');
const custom=new Set(['L008','L029','L077','L082','L087','L092','L097','L078','L083','L088','L093','L098']);
const results=reviewed.edits.map(e=>{
  const path=move(e.path),source=fs.readFileSync(`${root}/${path}`,'utf8');
  const current=path.endsWith('.json')?e.field.split('.').reduce((v,k)=>v?.[k],JSON.parse(source)):source;
  const exact=path.endsWith('.json')?current===e.after:current.includes(move(e.after));
  const old=path.endsWith('.json')?current===e.before:current.includes(move(e.before));
  return {id:e.id,lang:e.lang,route:move('/'+e.route+'/').slice(1,-1),path,field:e.field,status:exact?'exact':custom.has(e.id)?'custom':e.id==='L025'?'alternative':e.id==='L135'?'declined':old?'unchanged':'unexpected',oldPresent:old,current:exact?undefined:current,before:exact?undefined:e.before,proposed:exact?undefined:e.after};
});
const aggregate=Object.fromEntries([...new Set(results.map(r=>r.status))].map(s=>[s,results.filter(r=>r.status===s).length]));
const paths=[...new Set(results.map(r=>r.path))];
const hashes=Object.fromEntries(paths.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(`${root}/${p}`)).digest('hex')]));
console.log(JSON.stringify({aggregate,results,hashes},null,2));
