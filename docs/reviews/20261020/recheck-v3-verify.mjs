import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const assert=(ok,message)=>{if(!ok)throw Error(message);};
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const base='evidence/recheck-v3/evidence/';
const extended=read(base+'extended.json'),old=read(base+'extra-browser.json'),sweep=read(base+'sweep-summary.json'),additional=read('evidence/recheck-v3/jpeg-additional.json');
const log=fs.readFileSync('evidence/recheck-v3-project-check.log','utf8');
assert(/Tests\s+704 passed/.test(log)&&/Test Files\s+95 passed/.test(log)&&log.includes('- 0 errors')&&log.includes('Пост-проверки пройдены.'),'Project check');
assert(extended.length===7&&extended.every(x=>x.pass),'V06 extended scenarios');
assert(old.length===37&&old.every(x=>x.pass),'V01–V05 scenarios');
assert(sweep.pages===536&&!sweep.issues.length&&!sweep.failures.length&&!sweep.smallFontPages.length&&!sweep.missingInSitemap.length&&!sweep.extraInSitemap.length,'Page sweep');
assert(additional.restartCases.total===32&&additional.restartCases.passed===32,'RST combinations');
assert(additional.browserChecks.length===3&&additional.browserChecks.every(x=>x.pass),'Malformed JPEG and recovery');
const preserved={
  'evidence/recheck/evidence/extra-browser.json':'58bb6ad29843063e1e418c3931d57d69a602c76f57b5be349607f2c0676a92b4',
  'evidence/recheck-v2/evidence/extended.json':'cfd6f1bb17cbb8a947f667fd0d299b396a113d391461cf72c0b2cc561c709764',
  'evidence/recheck-v2/evidence/extra-browser.json':'0202b9c0334d4b7995ec36427d5d1a9ae427e85f939d721f93a7bc32db18e473',
};
for(const [p,expected]of Object.entries(preserved))assert(sha(p)===expected,'Previous evidence changed: '+p);
for(const p of ['README.md','11-verification-stage-5.md','12-verification-stage-6.md'])for(const m of fs.readFileSync(p,'utf8').matchAll(/\]\((<[^>]+>|[^)]+)\)/g)){
  const target=m[1].replace(/^<|>$/g,'').replace(/:\d+$/,'');if(target.startsWith('http')||target.startsWith('#'))continue;
  assert(fs.existsSync(path.resolve(path.dirname(p),target)),`Broken link ${p}: ${target}`);
}
const source=['src/ui/files/jpeg.ts','src/ui/files/jpeg.test.ts','src/pages/[lang]/images/exif/_tool/ExifTool.tsx'];
console.log(JSON.stringify({date:'2026-10-20',artifactValidation:'passed',verifiedFindings:['V01','V02','V03','V04','V05','V06'],status:'closed-in-tested-scope',projectTests:{total:704,passed:704,files:95},extendedScenarios:{total:7,passed:7},previousScenarios:{total:37,passed:37},pages:{total:536,issues:0},RSTVariants:{total:32,passed:32},malformedJPEGScenarios:{total:3,passed:3},newFindings:[],sourceHashes:Object.fromEntries(source.map(p=>[p,sha('/home/gwer/code/qdbp/'+p)])),preservedEvidence:preserved,brokenReportLinks:0},null,2));
