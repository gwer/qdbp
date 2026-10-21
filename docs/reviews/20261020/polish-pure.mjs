import fs from 'node:fs';
const root='/home/gwer/code/qdbp';
const out='evidence/polish-20261021';fs.mkdirSync(out,{recursive:true});
const mod=p=>import(`${root}/src/pages/[lang]/${p}`);
const rows=[];
function test(name,fn){try{const detail=fn();rows.push({name,...detail});}catch(e){rows.push({name,error:e.stack});}}
const {addWorkdays}=await mod('dates/add-to-date/_tool/tool.ts');
test('workdays-independent-calendar',()=>{
  const mismatches=[];let cases=0;
  const iso=d=>d.toISOString().slice(0,10);
  for(let day=1;day<=31;day++)for(let n=-30;n<=30;n++){
    const d=new Date(Date.UTC(2026,9,day)),start=iso(d);let left=Math.abs(n);
    while(left){d.setUTCDate(d.getUTCDate()+(n<0?-1:1));if(d.getUTCDay()>0&&d.getUTCDay()<6)left--;}
    const expected=iso(d),actual=addWorkdays(start,n);cases++;
    if(actual!==expected)mismatches.push({start,n,expected,actual});
  }
  return{cases,mismatches};
});
const {salaryYear,grossFromNet}=await mod('finance/net-salary/_tool/ndfl.ts');
test('net-salary-discontinuities',()=>{
  const examples=[];
  for(const children of [1,2,3,5])for(let month=1;month<=12;month++){
    const threshold=Math.floor(450000/month);
    const before=salaryYear(threshold,children).net,after=salaryYear(threshold+1,children).net;
    if(after<before){
      for(const target of [Math.floor(before),Math.floor((before+after)/2)]){
        let expected=threshold-10000;
        while(salaryYear(expected,children).net<target&&expected<=threshold+2000)expected++;
        const actual=grossFromNet(target,children);
        if(actual!==expected)examples.push({children,month,threshold,before,after,target,expected,actual,expectedNet:salaryYear(expected,children).net,actualNet:salaryYear(actual,children).net});
      }
    }
  }
  return{examples};
});
const {loan,byYear}=await mod('finance/_shared/loan.ts');
test('loan-invariants',()=>{
  const mismatches=[];let cases=0;
  for(const amount of [1000,100000,5000000])for(const rate of [0,3,20])for(const months of [12,36,240])for(const kind of ['annuity','differentiated'])for(const repeat of ['once','monthly','quarterly','yearly'])for(const mode of ['term','payment']){
    const p={amount,rate,months,kind,prepayments:[{after:3,amount:amount/13,mode,repeat},{after:7,amount:amount/20,mode:'payment',repeat:'once'}]};
    const r=loan(p);cases++;
    const sum=r.schedule.reduce((s,x)=>s+x.payment+(x.extra??0),0);
    const principal=r.schedule.reduce((s,x)=>s+x.principal+(x.extra??0),0);
    if(Math.abs(sum-r.total)>0.011||Math.abs(principal-amount)>0.011||r.schedule.at(-1)?.balance!==0||r.schedule.some(x=>x.principal<0||x.balance<0)||r.overpay<0)mismatches.push({p,r});
  }
  const immediate=loan({amount:100000,rate:10,months:12,kind:'annuity',prepayments:[{after:0,amount:10000,mode:'term',repeat:'once'}]});
  return{cases,mismatches,immediate:{total:immediate.total,extraTotal:immediate.extraTotal,tableTotal:byYear(immediate.schedule).reduce((s,x)=>s+x.paid,0),schedule:immediate.schedule}};
});
const {repairJson,formatJson}=await mod('dev/json-formatter/_tool/json.ts');
test('json-repair-preserves-strings',()=>{
 const examples=[`{a:'he said "hello"',b:True,c:None,}`,`{'path':'C:\\\\temp', 'url':'https://example.com/a//b',}`,`{"number": 1e3, "nested": [False,],}`,`{a:1/* comment */2}`];
 return{examples:examples.map(input=>{try{return{input,output:formatJson(repairJson(input),2)}}catch(e){return{input,error:e.message}}})};
});
const {solve}=await mod('health/running-pace/_tool/tool.ts');
test('running-pace-inverses',()=>{
 const mismatches=[];let cases=0;
 for(const distance of [0.1,5,10,21.0975,42.195])for(const time of [300,3600,18000])for(const unit of ['km','mi']){
  const pace=solve('pace','custom',distance,time,300,unit).pace;
  const input=pace*(unit==='mi'?1.609344:1);
  for(const [find,expected,key]of [['time',time,'time'],['distance',distance,'distance']]){
   const r=solve(find,'custom',distance,time,input,unit);cases++;
   if(Math.abs(r[key]-expected)>1e-8)mismatches.push({distance,time,unit,find,expected,actual:r[key]});
  }
 }
 return{cases,mismatches};
});
fs.writeFileSync(`${out}/pure.json`,JSON.stringify(rows,null,2));
console.log(JSON.stringify(rows.map(r=>({...r,schedule:undefined,mismatches:r.mismatches?.slice(0,12),mismatchCount:r.mismatches?.length,examples:r.examples?.slice(0,10)})),null,2));
