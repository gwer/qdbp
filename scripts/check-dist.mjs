// Пост-проверки собранного сайта (см. docs/03-tech.md, раздел 10):
//   1. сверка списка URL с urls.txt — нельзя молча потерять опубликованную страницу;
//   2. внутренние ссылки ведут на существующие файлы;
//   3. бюджеты размера (gzip);
//   4. отчёт покрытия переводов (информационно).
// Запуск: node scripts/check-dist.mjs [--update-urls]
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const URLS_FILE = 'urls.txt';
const BUDGET = { html: 50 * 1024, js: 25 * 1024, css: 15 * 1024 };

const errors = [];
const update = process.argv.includes('--update-urls');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(DIST).map((f) => '/' + relative(DIST, f).split('\\').join('/'));
const fileSet = new Set(files);
const htmlFiles = files.filter((f) => f.endsWith('.html') && f !== '/404.html');
const pageUrls = htmlFiles.map((f) => f.replace(/index\.html$/, '')).sort();

// 1. urls.txt
const redirects = new Set(
  readFileSync(join(DIST, '_redirects'), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split(/\s+/)[0]),
);

if (update) {
  writeFileSync(URLS_FILE, pageUrls.join('\n') + '\n');
  console.log(`urls.txt обновлён: ${pageUrls.length} URL`);
} else if (!existsSync(URLS_FILE)) {
  errors.push(`нет ${URLS_FILE} — выполните pnpm urls:update`);
} else {
  const known = readFileSync(URLS_FILE, 'utf8').split('\n').filter(Boolean);
  const current = new Set(pageUrls);
  const lost = known.filter((u) => !current.has(u) && !redirects.has(u));
  const added = pageUrls.filter((u) => !known.includes(u));
  for (const u of lost) errors.push(`URL пропал и на него нет редиректа в public/_redirects: ${u}`);
  if (added.length) {
    errors.push(`новые URL (${added.length}), подтвердите через pnpm urls:update:\n      ${added.join('\n      ')}`);
  }
}

// 2. внутренние ссылки
const resolves = (href) => {
  const path = decodeURI(href.split(/[?#]/)[0]);
  return fileSet.has(path) || fileSet.has(path.replace(/\/?$/, '/') + 'index.html') || redirects.has(path);
};
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(join(DIST, file), 'utf8');
  for (const [, href] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    if (!resolves(href)) errors.push(`битая ссылка в ${file}: ${href}`);
  }
}

// 3. бюджеты
const sizes = [];
for (const file of files) {
  const ext = file.split('.').pop();
  if (!(ext in BUDGET)) continue;
  const gz = gzipSync(readFileSync(join(DIST, file)), { level: 9 }).length;
  sizes.push({ file, ext, gz });
  if (gz > BUDGET[ext]) errors.push(`${file}: ${(gz / 1024).toFixed(1)} КБ gzip > бюджета ${BUDGET[ext] / 1024} КБ`);
}
const top = (ext) =>
  sizes
    .filter((s) => s.ext === ext)
    .sort((a, b) => b.gz - a.gz)
    .slice(0, 3)
    .map((s) => `${s.file} ${(s.gz / 1024).toFixed(1)} КБ`)
    .join(', ');
console.log(`Крупнейшие JS (gzip): ${top('js')}`);
console.log(`Крупнейшие HTML (gzip): ${top('html')}`);

// 4. покрытие переводов: /{lang}/{category}/{tool}/
const toolsByLang = new Map();
const allTools = new Set();
for (const url of pageUrls) {
  const m = url.match(/^\/([^/]+)\/([^/]+\/[^/]+)\/$/);
  if (!m) continue;
  allTools.add(m[2]);
  if (!toolsByLang.has(m[1])) toolsByLang.set(m[1], new Set());
  toolsByLang.get(m[1]).add(m[2]);
}
console.log(`Покрытие переводов (всего инструментов: ${allTools.size}):`);
for (const [lang, set] of [...toolsByLang].sort()) {
  const missing = [...allTools].filter((t) => !set.has(t));
  console.log(`  ${lang}: ${set.size}/${allTools.size}${missing.length ? ` — нет: ${missing.join(', ')}` : ''}`);
}
console.log(`Файлов в dist: ${files.length}`);

if (errors.length) {
  console.error(`\nПроверки не пройдены:\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log('\nПост-проверки пройдены.');
