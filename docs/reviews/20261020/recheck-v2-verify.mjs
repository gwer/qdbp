// Validate round-2 evidence without changing application code or round-1 artifacts.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root='/home/gwer/code/qdbp';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const base='evidence/recheck-v2/evidence/';
const assert=(ok,message)=>{if(!ok)throw Error(message);};
const log=fs.readFileSync('evidence/recheck-v2-project-check.log','utf8');
assert(/Tests\s+704 passed/.test(log)&&/Test Files\s+95 passed/.test(log)&&log.includes('- 0 errors')&&log.includes('Пост-проверки пройдены.'),'Project check');
const original=read(base+'extra-browser.json'),sweep=read(base+'sweep-summary.json'),images=read(base+'image-checks.json'),edges=read(base+'extended.json');
assert(original.length===37&&original.every(x=>x.pass),'Original V01–V05 scenarios');
assert(sweep.pages===536&&!sweep.issues.length&&!sweep.failures.length&&!sweep.smallFontPages.length&&!sweep.missingInSitemap.length&&!sweep.extraInSitemap.length,'Page sweep');
assert(images.results.length===15&&images.results.every(x=>x.pass),'File checks');
const knownFailure=new Set(['real-progressive-filled-restart-marker','filled-restart-in-browser-compress-image','filled-restart-in-browser-exif']);
assert(edges.length===7&&edges.every(x=>x.pass!==knownFailure.has(x.name)),'Extended checks differ from recorded result');
const bitmaps=edges.find(x=>x.name==='real-progressive-filled-restart-marker');
assert(bitmaps.original.hash===bitmaps.input.hash,'Fixture raster changed');
const changes=['src/ui/files/jpeg.ts','src/ui/files/jpeg.test.ts','src/ui/files/ImageBatch.tsx','src/ui/TextConverter.tsx','src/styles/global.css'];
const hashes=Object.fromEntries(changes.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex')]));
for(const p of ['README.md','10-verification-after-work.md','11-verification-stage-5.md'])for(const m of fs.readFileSync(p,'utf8').matchAll(/\]\((<[^>]+>|[^)]+)\)/g)){
  const target=m[1].replace(/^<|>$/g,'').replace(/:\d+$/,'');if(target.startsWith('http')||target.startsWith('#'))continue;
  assert(fs.existsSync(path.resolve(path.dirname(p),target)),`Broken link ${p}: ${target}`);
}
console.log(JSON.stringify({date:'2026-10-20',artifactValidation:'passed',originalFindings:{V01:'closed',V02:'closed',V03:'closed',V04:'closed',V05:'closed'},newFindings:[{id:'V06',priority:'P2',description:'Valid JPEG fill byte before restart marker breaks imageData parser'}],projectCheck:{tests:704,testFiles:95,passed:true},originalScenarios:{total:37,passed:37},sweep:{pages:536,issues:0,smallFontPages:0},fileScenarios:{validated:14,documentedDecisionOnly:1},extendedScenarios:{total:7,passed:4,failed:3,distinctNewFindings:1},sourceHashes:hashes,oldArtifactDirectory:'evidence/recheck (preserved)',brokenReportLinks:0},null,2));
