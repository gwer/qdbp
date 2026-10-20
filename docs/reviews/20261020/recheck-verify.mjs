// Validate the saved acceptance evidence. Does not run or modify application code.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const base='evidence/recheck/evidence/';
const sweep=load(base+'sweep-summary.json'), browser=load(base+'browser-checks.json'), image=load(base+'image-checks.json'), extra=load(base+'extra-browser.json'), compute=load(base+'compute-checks.json'), proof=load('evidence/recheck-proofreading.json'), properties=load('evidence/recheck-properties.json');
const assert=(condition,message)=>{if(!condition)throw Error(message);};
const projectLog=fs.readFileSync('evidence/recheck-project-check.log','utf8');
assert(/Tests\s+703 passed/.test(projectLog)&&/Test Files\s+95 passed/.test(projectLog)&&projectLog.includes('- 0 errors')&&projectLog.includes('Пост-проверки пройдены.'),'Saved project check log');
assert(sweep.pages===536&&!sweep.issues.length&&!sweep.failures.length&&!sweep.missingInSitemap.length&&!sweep.extraInSitemap.length,'Sweep');
assert(browser.results.length===116&&browser.results.every(r=>r.pass),'Interactive');
assert(image.results.length===15&&image.results.every(r=>r.pass),'Images');
assert(compute.results.length===53&&compute.results.every(r=>r.pass)&&compute.precisionCases===2500&&compute.precisionFailures===0,'Compute');
assert(proof.aggregate.exact===124&&proof.aggregate.custom===12&&proof.aggregate.alternative===1&&proof.aggregate.declined===1,'Proofreading');
assert(properties.total===7&&properties.passed===7,'Properties');
const expectedFailures=new Set(['whitespace-security/base64','whitespace-security/url-encode','whitespace-text/case-converter','jpeg-metadata-after-first-scan','exif-metadata-after-first-scan','batch-two-adds-global-limit','batch-options-change-global-limit','batch-add-during-options-debounce','batch-add-during-options-debounce-still-pending-after-five-seconds','number-base-mobile-input-font']);
assert(extra.length===37&&extra.filter(r=>!r.pass).length===10,'Extra checks');
for(const r of extra)assert(r.pass!==expectedFailures.has(r.name),'Unexpected extra outcome '+r.name);
for(const [p,expected]of Object.entries(proof.hashes))assert(crypto.createHash('sha256').update(fs.readFileSync('/home/gwer/code/qdbp/'+p)).digest('hex')===expected,'Source changed during verification: '+p);
for(const p of ['README.md','10-verification-after-work.md'])for(const m of fs.readFileSync(p,'utf8').matchAll(/\]\((<[^>]+>|[^)]+)\)/g)) {
  const target=m[1].replace(/^<|>$/g,'').replace(/:\d+$/,'');
  if(target.startsWith('http')||target.startsWith('#'))continue;
  assert(fs.existsSync(path.resolve(path.dirname(p),target)),`Broken artifact link ${p}: ${target}`);
}
console.log(JSON.stringify({date:'2026-10-20',artifactValidation:'passed',acceptance:'needs-followup',confirmedIssues:['V01','V02','V03','V04','V05'],projectCheck:{tests:703,testFiles:95,exitCode:0},pages:536,interactive:{total:116,passed:116},fileChecks:{validated:14,documentedDecisionOnly:1},compute:{total:53,passed:53,fractionPairs:2500,fractionFailures:0},additional:{total:37,passed:27,failed:10,distinctIssues:5},proofreading:proof.aggregate,sourceHashesVerified:Object.keys(proof.hashes).length,propertiesPassed:7,brokenArtifactLinks:0},null,2));
