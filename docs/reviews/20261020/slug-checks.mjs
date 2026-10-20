// Read-only checks of the review snapshot and proposed URL mapping.
// Run from this review directory: node slug-checks.mjs
import fs from 'node:fs';
import path from 'node:path';

const project = path.resolve('../../..');
const source = path.join(project, 'src/pages/[lang]');
const inventory = JSON.parse(fs.readFileSync('evidence/inventory.json', 'utf8'));
const report = fs.readFileSync('08-slugs-and-url-policy.md', 'utf8');
const languages = ['en', 'ru', 'es', 'de', 'pt'];
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const categories = [...new Set(inventory.map(t => t.cat))].sort();
const replacements = {
  'convert/data-converter': 'convert/data-size-converter',
  'dev/cidr': 'dev/subnet-calculator',
  'finance/net-salary': 'finance/russia-net-salary',
};
const targetRoute = t => replacements[t.route] ?? t.route.replace(/^repair\//, 'construction/');
const rows = section => [...section.matchAll(/^\| `([^`]+)` \|/gm)].map(m => m[1]);
const categoryRows = rows(report.split('## Все категории\n')[1].split('### Пограничные инструменты')[0]);
const toolRows = rows(report.split('## Полная матрица инструментов\n')[1].split('## Оговорки по границам задач')[0]);
const currentUrls = new Set(languages.map(l => `/${l}/`));
const proposedUrls = new Set(currentUrls);
const mapping = [];
const ids = new Set();
const proposedIds = new Set();
const proposedRoutes = new Set();

const sourceCategories = fs.readdirSync(source).filter(c => fs.existsSync(path.join(source, c, '_category/category.ts'))).sort();
check(JSON.stringify(sourceCategories) === JSON.stringify(categories), 'Source categories differ from inventory');
for (const cat of categories) {
  check(slug.test(cat), `Invalid category slug: ${cat}`);
  check(categoryRows.filter(r => r === cat).length === 1, `Category report coverage: ${cat}`);
  const dest = cat === 'repair' ? 'construction' : cat;
  check(slug.test(dest), `Invalid destination category: ${dest}`);
  for (const lang of languages) {
    check(fs.existsSync(path.join(source, cat, '_category/i18n', `${lang}.json`)), `Missing category language: ${cat}/${lang}`);
    const from = `/${lang}/${cat}/`, to = `/${lang}/${dest}/`;
    currentUrls.add(from); proposedUrls.add(to);
    if (from !== to) mapping.push({ from, to, type: 'category' });
  }
  const actual = fs.readdirSync(path.join(source, cat)).filter(id => fs.existsSync(path.join(source, cat, id, '_tool/tool.ts'))).sort();
  const expected = inventory.filter(t => t.cat === cat).map(t => t.id).sort();
  check(JSON.stringify(actual) === JSON.stringify(expected), `Source tools differ from inventory: ${cat}`);
}

for (const t of inventory) {
  check(t.route === `${t.cat}/${t.id}`, `Inconsistent path: ${t.route}`);
  check(slug.test(t.id), `Invalid tool slug: ${t.route}`);
  check(!ids.has(t.id), `Duplicate tool ID: ${t.id}`); ids.add(t.id);
  check(toolRows.filter(r => r === t.route).length === 1, `Tool report coverage: ${t.route}`);
  const dest = targetRoute(t), destId = dest.split('/')[1];
  check(dest.split('/').every(s => slug.test(s)), `Invalid destination: ${dest}`);
  check(!proposedRoutes.has(dest), `Duplicate destination: ${dest}`); proposedRoutes.add(dest);
  check(!proposedIds.has(destId), `Duplicate destination ID: ${destId}`); proposedIds.add(destId);
  const actualLangs = languages.filter(l => fs.existsSync(path.join(source, t.route, '_tool/i18n', `${l}.json`)) && fs.existsSync(path.join(source, t.route, '_tool/content', `${l}.md`)));
  check(JSON.stringify(actualLangs) === JSON.stringify(t.langs), `Source languages differ: ${t.route}`);
  for (const lang of t.langs) {
    const from = `/${lang}/${t.route}/`, to = `/${lang}/${dest}/`;
    currentUrls.add(from); proposedUrls.add(to);
    if (from !== to) mapping.push({ from, to, type: 'tool' });
  }
}

for (const m of mapping) check(!currentUrls.has(m.to), `Destination occupied by an existing URL: ${m.to}`);
const frozen = new Set(fs.readFileSync(path.join(project, 'urls.txt'), 'utf8').split(/\r?\n/).filter(Boolean));
check(currentUrls.size === frozen.size && [...currentUrls].every(u => frozen.has(u)), 'Inventory and urls.txt differ');
check(proposedUrls.size === currentUrls.size, 'Page count changed');
check(toolRows.length === inventory.length, 'Unexpected tool rows in report');
check(categoryRows.length === categories.length, 'Unexpected category rows in report');
const result = {
  date: '2026-10-20',
  scope: 'Read-only inventory, slug syntax, report coverage and proposed mapping; not HTTP redirect tests',
  categories: categories.length,
  tools: inventory.length,
  languageToolPages: inventory.reduce((n, t) => n + t.langs.length, 0),
  currentPages: currentUrls.size,
  proposedPages: proposedUrls.size,
  toolsWithChangedPath: inventory.filter(t => targetRoute(t) !== t.route).length,
  affectedUrls: mapping.length,
  errors,
  mapping,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
