import fs from 'node:fs';
const root='/home/gwer/code/qdbp',out='evidence/polish-recheck-20261021';fs.mkdirSync(out,{recursive:true});
const mod=p=>import(`${root}/src/pages/[lang]/${p}`),rows=[];
const test=(name,fn)=>{try{rows.push({name,...fn()});}catch(e){rows.push({name,pass:false,error:e.stack});}};
const {addWorkdays}=await mod('dates/add-to-date/_tool/tool.ts');
test('P03-independent-calendar',()=>{
 const mismatches=[];let cases=0;
 for(let day=1;day<=31;day++)for(let n=-30;n<=30;n++){
  const d=new Date(Date.UTC(2026,9,day)),start=d.toISOString().slice(0,10);let left=Math.abs(n);
  while(left){d.setUTCDate(d.getUTCDate()+Math.sign(n));if(d.getUTCDay()>0&&d.getUTCDay()<6)left--;}
  const expected=d.toISOString().slice(0,10),actual=addWorkdays(start,n);cases++;if(actual!==expected)mismatches.push({start,n,expected,actual});
 }
 return{pass:mismatches.length===0,cases,mismatches};
});
const {salaryYear,grossFromNet}=await mod('finance/net-salary/_tool/ndfl.ts');
// Independent whole-ruble annual model; integer tax cents avoid floating-point half-ruble boundaries.
const deduction=c=>(c>0?1400:0)+(c>1?2800:0)+Math.max(0,c-2)*6000;
const brackets=[[0,13],[2400000,15],[5000000,18],[20000000,20],[50000000,22]];
function annualNet(g,c){const months=Math.min(12,Math.floor(450000/g)),taxable=Math.max(0,g*12-deduction(c)*months);let cents=0;for(let i=0;i<brackets.length;i++){const [from,rate]=brackets[i],to=brackets[i+1]?.[0]??Infinity;if(taxable>from)cents+=(Math.min(taxable,to)-from)*rate;}return g*12-Math.floor((cents+50)/100);}
test('P05-independent-global-minimum',()=>{
 const examples=[],mismatches=[];let cases=0,scanned=0;
 for(const children of [0,1,2,3,5,20]){
  const targets=new Set([1,32000,35000,39500,40000,44300,56000,65341,90000,195285]);
  for(let k=1;k<=12;k++){const edge=Math.floor(450000/k);for(const g of [edge,edge+1])for(const diff of [-2,0,2])targets.add(Math.max(1,Math.floor(annualNet(g,children)/12)+diff));}
  const sorted=[...targets].sort((a,b)=>a-b);let next=0;
  for(let g=1;g<=600000&&next<sorted.length;g++){
   scanned++;const net=annualNet(g,children);
   while(next<sorted.length&&net>=sorted[next]*12){const target=sorted[next++],actual=grossFromNet(target,children);cases++;if(actual!==g)mismatches.push({children,target,expected:g,actual,expectedNet:net/12,actualNet:salaryYear(actual,children).net});if(target===65341)examples.push({children,target,expected:g,actual,yearTax:salaryYear(actual,children).yearTax});}
  }
  if(next!==sorted.length)mismatches.push({children,unresolved:sorted.slice(next)});
 }
 return{pass:mismatches.length===0,cases,scanned,mismatches,examples};
});
test('P05-previous-66-counterexamples',()=>{
 const previous=JSON.parse(fs.readFileSync('evidence/polish-20261021/pure.json','utf8')).find(r=>r.name==='net-salary-discontinuities').examples;
 const mismatches=previous.map(p=>({...p,actual:grossFromNet(p.target,p.children)})).filter(p=>p.actual!==p.expected);return{pass:mismatches.length===0,cases:previous.length,mismatches};
});
const {loan,byYear}=await mod('finance/_shared/loan.ts');
test('P06-initial-extra-and-total-invariants',()=>{
 let cases=0;const mismatches=[],examples=[];
 for(const amount of [1000,100000,5000000])for(const rate of [0,3,20])for(const months of [12,36,240])for(const kind of ['annuity','differentiated'])for(const repeat of ['once','monthly','quarterly','yearly'])for(const mode of ['term','payment'])for(const part of [0.1,1,1.1]){
  const values={amount,rate,months,kind,prepayments:[{after:0,amount:amount*part,mode,repeat},{after:7,amount:amount/20,mode:'payment',repeat:'once'}]},r=loan(values),years=byYear(r.schedule,r.initialExtra);cases++;
  const sum=r.initialExtra+r.schedule.reduce((s,x)=>s+x.payment+(x.extra??0),0),yearSum=years.reduce((s,x)=>s+x.paid,0),principal=r.initialExtra+r.schedule.reduce((s,x)=>s+x.principal+(x.extra??0),0);
  if(Math.abs(sum-r.total)>0.011||Math.abs(yearSum-r.total)>0.011||Math.abs(principal-amount)>0.011||r.schedule.some(x=>x.principal<0||x.balance<0))mismatches.push({values,total:r.total,sum,yearSum,principal});
 }
 for(const extra of [10000,100000,110000]){const r=loan({amount:100000,rate:10,months:12,kind:'annuity',prepayments:[{after:0,amount:extra,mode:'term',repeat:'once'}]});examples.push({extra,total:r.total,initialExtra:r.initialExtra,years:byYear(r.schedule,r.initialExtra),months:r.schedule.length});}
 return{pass:mismatches.length===0,cases,mismatches,examples};
});
const {fitToSize}=await mod('images/compress-image/_tool/target.ts');
const enc=async q=>new Blob([new Uint8Array(Math.round(1000+q*100000))]);
for(const max of [1000,50000,200000]){const r=await fitToSize(enc,max);rows.push({name:'P01-fit-'+max,pass:r.fits===(r.blob.size<=max),size:r.blob.size,fits:r.fits,max});}
fs.writeFileSync(out+'/pure.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows,null,2));if(rows.some(r=>!r.pass))process.exitCode=1;
