import './ts-loader.mjs';
import fs from 'node:fs';
import {formatInput,formatNumber} from '/home/gwer/code/qdbp/src/lib/format.ts';
import {parseNumber} from '/home/gwer/code/qdbp/src/lib/parse.ts';
import {weekday,weekdaysBetween,addDays,addMonths,diffYMD,isoWeek} from '/home/gwer/code/qdbp/src/lib/date.ts';
import {uniqueNames} from '/home/gwer/code/qdbp/src/ui/files/download.ts';
import {zonedToUtc,utcToZoned} from '/home/gwer/code/qdbp/src/lib/timezone.ts';
import {fractions} from '/home/gwer/code/qdbp/src/pages/[lang]/math/fractions/_tool/tool.ts';
import {countText} from '/home/gwer/code/qdbp/src/pages/[lang]/text/word-counter/_tool/count.ts';
const checks=[];
const test=(name,fn)=>{try{checks.push({name,pass:true,...fn()});}catch(e){checks.push({name,pass:false,error:e.message});}};
const assert=(value,description)=>{if(!value)throw Error(description);};
test('all-weekdays-1900-through-2100',()=>{
  let n=0;for(let date='1900-01-01';date<'2101-01-01';date=addDays(date,1)){
    const d=new Date(date+'T00:00:00Z');assert(weekday(date)===(d.getUTCDay()+6)%7,date);n++;
  }return {cases:n};
});
test('calendar-month-end-identities',()=>{
  let n=0;
  for(let year=1996;year<=2030;year++)for(let month=1;month<=12;month++)for(const day of [28,29,30,31]){
    const date=`${year}-${String(month).padStart(2,'0')}-${day}`;
    if(new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)continue;
    for(const offset of [0,1,2,6,11,12,13,24,36,49]) {
      const to=addMonths(date,offset),d=diffYMD(date,to);
      assert(d.years*12+d.months===offset&&d.days===0,`${date} => ${to}: ${JSON.stringify(d)}`);n++;
    }
  }return {cases:n};
});
test('formatted-input-roundtrips-and-malformed-groups',()=>{
  let n=0;for(const lang of ['en','ru','es','de','pt'])for(const value of [0,1,-1,0.5,-0.5,1.234567,1234.567,1234567.89,999999999.123]){
    const formatted=formatInput(lang,value),parsed=parseNumber(formatted,lang);assert(parsed!==null&&Math.abs(parsed-value)<1e-7,`${lang} ${formatted} -> ${parsed}`);n++;
  }
  for(const lang of ['en','ru','es','de','pt'])for(const text of ['1.2.3','1,23,4','1234.567.890','12,34.56','1.23,45'])assert(parseNumber(text,lang)===null,`${lang}: ${text}`);
  return {cases:n};
});
test('unique-filenames-permutations',()=>{
  let n=0;const names=['a.jpg','a.jpg','a (2).jpg','a (3).jpg','a (2).jpg','a','a','.jpg','.jpg','a.b.c','a.b.c'];
  for(let i=0;i<names.length;i++){
    const permutation=[...names.slice(i),...names.slice(0,i)],actual=uniqueNames(permutation);assert(new Set(actual).size===permutation.length,JSON.stringify(actual));n++;
  }return {cases:n};
});
test('DST-gaps-and-overlaps-plus-date-line',()=>{
  const cases=[['America/New_York','2026-03-08',150,'2026-03-08T07:30:00.000Z'],['America/New_York','2026-11-01',90,'2026-11-01T05:30:00.000Z'],['Europe/Berlin','2026-03-29',150,'2026-03-29T01:30:00.000Z'],['Europe/Berlin','2026-10-25',150,'2026-10-25T00:30:00.000Z'],['Australia/Lord_Howe','2026-10-04',135,'2026-10-03T15:45:00.000Z'],['Australia/Lord_Howe','2026-04-05',105,'2026-04-04T14:45:00.000Z'],['Pacific/Apia','2011-12-30',720,'2011-12-30T22:00:00.000Z']];
  for(const [zone,date,minutes,expected]of cases){const actual=new Date(zonedToUtc(zone,date,minutes)).toISOString();assert(actual===expected,`${zone}: ${actual} != ${expected}`);}return {cases:cases.length};
});
test('fraction-precision-and-zero-format',()=>{
  const actual=fractions(100000000,100000001,'subtract',100000017,100000018);assert(actual.fraction==='−1/588235405882354',JSON.stringify(actual));for(const l of ['en','ru','es','de','pt'])assert(!formatNumber(l,actual.decimal).startsWith('-'),l);return {actual};
});
test('hyphenated-words-across-locales',()=>{
  const rows=[];for(const lang of ['en','ru','es','de','pt'])for(const value of ['из-за','well-known','well‐known','well‑known','hello-world-again','hello - world']){
    const actual=countText(value,lang).words,expected=value==='hello - world'?2:1;assert(actual===expected,`${lang} ${value}: ${actual}`);rows.push({lang,value,words:actual});
  }return {cases:rows.length};
});
console.log(JSON.stringify({total:checks.length,passed:checks.filter(c=>c.pass).length,checks},null,2));
