// Read-only text extraction for editorial review. No application files are changed.
import fs from 'node:fs';
const inventory = JSON.parse(fs.readFileSync('evidence/inventory.json', 'utf8'));
const [category, start = '0', end = '100'] = process.argv.slice(2);
const tools = inventory.filter(t => t.cat === category).slice(Number(start), Number(end));
const flatten = (o, prefix = '') => Object.entries(o).flatMap(([k, v]) =>
  typeof v === 'string' ? [[prefix + k, v]] : flatten(v, prefix + k + '.'));
for (const t of tools) {
  console.log(`\n=== ${t.route} ===`);
  for (const lang of t.langs) {
    const dir = `${t.dir}`;
    console.log(`\n--- ${lang}: i18n/${lang}.json ---`);
    console.log(flatten(JSON.parse(fs.readFileSync(`${dir}/i18n/${lang}.json`, 'utf8'))).map(([k,v]) => `${k}: ${v}`).join('\n'));
    console.log(`--- ${lang}: content/${lang}.md ---`);
    console.log(fs.readFileSync(`${dir}/content/${lang}.md`, 'utf8'));
  }
}
