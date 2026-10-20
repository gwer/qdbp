import './ts-loader.mjs';
import fs from 'node:fs';
import {inventory,out} from './audit.mjs';
const cases=[];
const add=(route,values,expected,note='')=>cases.push({route,values,expected,note});
add('convert/shoe-size',{size:26,system:'cm'},{eu:41,uk:7.5,usM:8.5,usW:9.5,cm:26},'По опубликованной таблице сервиса; соответствие брендам не подтверждается');
add('dates/add-to-date',{date:'2024-01-31',op:'add',amount:1,unit:'months'},{result:'2024-02-29',days:29});
add('dates/age-calculator',{birth:'2000-02-29',on:'2025-02-28'},{years:25,months:0,days:0,nextBirthday:0},'Правило 28 февраля, заявленное сервисом');
add('dates/countdown',{date:'2030-01-01',time:0},{date:'2030-01-01'});
add('dates/days-between',{from:'2024-02-28',to:'2024-03-01',includeEnd:'no'},{days:2,weekdays:2});
add('dates/days-between',{from:'2024-03-01',to:'2024-03-04',includeEnd:'yes'},{days:4,weekdays:2});
add('dates/time-between',{start:1380,end:60},{duration:120,minutes:120,hours:2,overnight:true});
add('dates/time-calculator',{date:'2024-02-28',time:1410,op:'add',days:0,hours:1,minutes:0},{time:30,date:'2024-02-29',shift:1});
add('dates/unix-timestamp',{ts:0,unit:'s'},{iso:'1970-01-01T00:00:00.000Z'});
add('dates/week-number',{date:'2021-01-01',system:'iso'},{week:53,year:'2020',start:'2020-12-28',end:'2021-01-03'});
add('finance/auto-loan',{price:10000,down:2000,tradeIn:1000,tax:0,fees:0,rate:0,months:10},{financed:7000,payment:700,totalCost:9000});
add('finance/break-even',{fixed:1000,price:30,variable:20},{units:100,revenue:3000,contribution:10,ratio:100/3});
add('finance/compound-interest',{initial:1000,monthly:0,rate:12,years:1,cap:'yearly'},{total:1120,contributed:1000,interest:120});
add('finance/discount',{price:200,percent:25},{final:150,saving:50});
add('finance/early-repayment',{amount:1200,rate:0,months:12,after:2,extra:300,mode:'term'},{savings:0,newPayment:100,newMonths:7,interestAfter:0});
add('finance/electricity-cost',{power:1000,hours:2,tariff:5},{costDay:10,costMonth:300,costYear:3650,kwhDay:2,kwhMonth:60});
add('finance/fuel-cost',{distance:100,unit:'l100km',economy:8,price:2,people:4},{cost:16,perPerson:4,fuel:8});
add('finance/inflation',{amount:1000,rate:10,years:2},{future:1210,power:1000/1.21});
add('finance/loan-calculator',{amount:1200,rate:0,months:12,kind:'annuity'},{payment:100,overpay:0,total:1200});
add('finance/margin',{cost:80,price:100},{margin:20,profit:20,markup:25});
add('finance/markup',{cost:80,percent:25},{price:100,profit:20,margin:20});
add('finance/mortgage',{price:10000,down:20,rate:0,years:1,kind:'annuity'},{principal:8000,downPayment:2000,total:8000,overpay:0});
add('finance/net-salary',{mode:'gross',amount:300000},{yearTax:492000,yearNet:3108000,net:259000});
add('finance/refinance',{balance:1200,rate:0,months:12,newRate:0,newMonths:24,fees:100},{netSavings:-100,monthlySaving:50,newPayment:50,currentPayment:100,breakEven:2},'Снижение платежа не означает окупаемости за срок кредита');
add('finance/roi',{invested:100,returned:121,years:2},{roi:21,cagr:10,profit:21});
add('finance/tip',{bill:100,percent:10,people:2},{perPerson:55,tip:10,total:110,tipPerPerson:5});
add('finance/vat',{amount:120,rate:20,mode:'remove'},{vat:20,net:100,gross:120});
add('health/bmi',{weight:80,height:200},{bmi:20,healthyMin:74,healthyMax:99.6});
add('health/body-fat',{sex:'male',weight:80,height:178,neck:38,waist:86,hip:98},{percent:17.2039245685479},'Проверка арифметики формулы плотности, не медицинская валидация');
add('health/calorie-calculator',{sex:'male',age:30,weight:80,height:180,activity:'sedentary'},{bmr:1780,tdee:2136,loss:1815.6,gain:2456.4});
add('health/due-date',{lmp:'2026-01-01',cycle:28,on:'2026-03-12'},{due:'2026-10-08',age:70,left:210,trimester:1,conception:'2026-01-15'});
add('health/ideal-weight',{sex:'male',height:152.4},{devine:50,robinson:52,miller:56.2,hamwi:48});
add('health/ovulation',{lmp:'2026-01-01',cycle:28},{ovulation:'2026-01-15',fertileStart:'2026-01-10',fertileEnd:'2026-01-16',nextPeriod:'2026-01-29'});
add('health/running-pace',{distance:5,time:1500},{pace:300,speed:12});
add('health/sleep-calculator',{mode:'wake',time:420,fallAsleep:15},{c5:1395,c6:1305,c4:45,c3:135});
add('health/water-intake',{weight:80,exercise:60,climate:'hot'},{total:3.6,glasses:3.6});
add('kitchen/cake-pan',{fromShape:'round',fromA:20,fromB:1,toShape:'round',toA:30,toB:1},{factor:2.25});
add('kitchen/cups-to-grams',{ingredient:'water',amount:2,measure:'ml'},{grams:2});
add('kitchen/oven-temperature',{value:180,scale:'c'},{c:180,f:356,fanC:160,fanF:331});
add('kitchen/yeast',{amount:30,from:'fresh'},{fresh:30,active:12,instant:10});
add('math/add-percent',{value:200,op:'subtract',percent:25},{result:150,part:50});
add('math/fractions',{n1:3,d1:4,op:'divide',n2:1,d2:8},{fraction:'6',mixed:'6',decimal:6});
add('math/percent-change',{from:100,to:80},{change:-20,direction:-1,difference:-20,ratio:0.8});
add('math/percent-of',{percent:12.5,value:80},{result:10});
add('math/proportion',{a:3,b:12,c:6,kind:'inverse'},{x:6});
add('math/what-percent',{part:12.5,whole:50},{percent:25});
add('repair/aerated-blocks',{length:6,height:2,openings:0,blockLength:600,blockHeight:250,blockThickness:300,reserve:0},{blocks:80,volume:3.6,area:12});
add('repair/bricks',{length:2.6,height:3,openings:0,format:'250x120x65',thickness:'half',joint:10,reserve:0},{bricks:400,area:7.8});
add('repair/concrete',{length:5,width:4,thickness:0.1,reserve:0,premixBag:40,mix:'1-2-4',bag:50},{volume:2});
add('repair/laminate',{length:5,width:4,reserve:10,pack:2},{packs:11,area:20,needed:22,bought:22});
add('repair/paint',{length:5,width:4,height:3,openings:4,surface:'walls',coats:2,coverage:10,can:2.5},{area:50,liters:10,cans:4});
add('repair/tiles',{area:10,length:50,width:20,thickness:10,joint:0,reserve:10,perBox:10,adhesive:4},{pieces:110,boxes:11,grout:0,glue:40});
add('repair/wallpaper',{length:5,width:4,height:2.4,openings:0,rollWidth:0.5,rollLength:10,repeat:0},{rolls:9,strips:36,perRoll:4,strip:2.5});

const defs=new Map();
for(const t of inventory){const {def}=await import(t.dir+'/tool.ts');defs.set(t.route,def)}
const results=cases.map(c=>{
  try{const actual=defs.get(c.route).compute(c.values);const failed=Object.entries(c.expected).filter(([k,v])=>typeof v==='number'?typeof actual[k]!=='number'||Math.abs(actual[k]-v)>Math.max(0.000001,Math.abs(v)*1e-9):actual[k]!==v);return {...c,actual:Object.fromEntries(Object.keys(c.expected).map(k=>[k,actual[k]])),pass:failed.length===0,failed};}
  catch(e){return {...c,pass:false,error:e.message}}
});
const defaults=(d)=>Object.fromEntries(Object.entries(d.inputs).map(([k,s])=>[k,s.type==='date'?(s.default.startsWith('today')?'2026-10-20':s.default==='next-01-01'?'2027-01-01':s.default):s.type==='time'?s.default==='now'?720:Number(s.default.slice(0,2))*60+Number(s.default.slice(3)):s.default]));
const boundaries=[];
for(const [route,d] of defs){
  if(d.kind!=='calculator')continue;
  for(const [field,s] of Object.entries(d.inputs)){
    if(s.showIf)continue;
    const candidates=s.type==='select'?s.options:typeof s.default==='number'?[s.min??0,...s.max!==undefined?[s.max]:[]]:[];
    for(const v of candidates){
      const values={...defaults(d),[field]:v};
      try{const actual=d.compute(values);const bad=Object.entries(actual).filter(([k,v])=>k in d.outputs&&typeof v==='number'&&!Number.isFinite(v));if(bad.length)boundaries.push({route,field,value:v,values,nonFinite:bad});}
      catch(e){boundaries.push({route,field,value:v,values,error:e.message})}
    }
  }
}
const fractions=defs.get('math/fractions');
const precision=[];
for(let a=100000001;a<100000051;a++)for(let b=100000001;b<100000051;b++){
  const n1=a-1,d1=a,n2=b-1,d2=b;
  const gcd=(a,b)=>b===0n?a:gcd(b,a%b);
  let p=BigInt(n1)*BigInt(d2)-BigInt(n2)*BigInt(d1),q=BigInt(d1)*BigInt(d2);let g=gcd(p<0n?-p:p,q);p/=g;q/=g;
  if(p>BigInt(Number.MAX_SAFE_INTEGER)||q>BigInt(Number.MAX_SAFE_INTEGER))continue;
  try{const actual=fractions.compute({n1,d1,n2,d2,op:'subtract'}).fraction;const expected=p.toString().replace('-','−')+(q===1n?'':'/'+q);if(actual!==expected&&precision.length<5)precision.push({n1,d1,n2,d2,op:'subtract',expected,actual});}catch{}
}
fs.writeFileSync(out+'/evidence/compute-checks.json',JSON.stringify({results,boundaries,precision},null,2));
console.log(JSON.stringify({referenceCases:results.length,pass:results.filter(r=>r.pass).length,failures:results.filter(r=>!r.pass),boundaryIssues:boundaries,precision},null,2));
