// Пост-проверки собранного сайта (см. docs/03-tech.md, раздел 10):
//   1. сверка списка URL с urls.{site}.txt — нельзя молча потерять опубликованную страницу;
//      редирект на другой наш сайт должен вести на страницу из его urls.{site}.txt;
//   2. внутренние ссылки ведут на существующие файлы;
//   3. бюджеты размера (gzip);
//   4. отчёт покрытия переводов (информационно).
// Запуск: node scripts/check-dist.mjs {calc|tools} [--update-urls]
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import SITES from '../src/sites.json' with { type: 'json' };

const SITE = process.argv[2];
if (!(SITE in SITES)) {
  console.error(`Укажите сайт: node scripts/check-dist.mjs {${Object.keys(SITES).join('|')}} [--update-urls]`);
  process.exit(1);
}
const DIST = `dist/${SITE}`;
const urlsFile = (site) => `urls.${site}.txt`;
const URLS_FILE = urlsFile(SITE);
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
// Правила _redirects: `from to [status]`, в from — :placeholder (один сегмент) и * (остаток, в to — :splat).
const redirects = readFileSync(join(DIST, '_redirects'), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [from, to] = l.split(/\s+/);
    const names = [];
    const re = from.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:(\w+)|\*/g, (m, name) => {
      names.push(name ?? 'splat');
      return name ? '([^/]+)' : '(.*)';
    });
    return { from, to, re: new RegExp(`^${re}$`), names };
  });
/** Куда ведёт редирект с этого пути (первое подходящее правило, как у Cloudflare), или null. */
const redirectTarget = (path) => {
  for (const r of redirects) {
    const m = path.match(r.re);
    if (m) return r.names.reduce((to, name, i) => to.replaceAll(`:${name}`, m[i + 1]), r.to);
  }
  return null;
};

// Страницы-заглушки редиректов (Astro `redirects` для dev/preview) — не настоящие страницы.
const htmlFiles = files.filter((f) => f.endsWith('.html') && f !== '/404.html');
const pageUrls = htmlFiles
  .map((f) => f.replace(/index\.html$/, ''))
  .filter((u) => redirectTarget(u) === null)
  .sort();

// 1. urls.txt
if (update) {
  writeFileSync(URLS_FILE, pageUrls.join('\n') + '\n');
  console.log(`${URLS_FILE} обновлён: ${pageUrls.length} URL`);
} else if (!existsSync(URLS_FILE)) {
  errors.push(`нет ${URLS_FILE} — выполните pnpm urls:update`);
} else {
  const known = readFileSync(URLS_FILE, 'utf8').split('\n').filter(Boolean);
  const current = new Set(pageUrls);
  const lost = known.filter((u) => !current.has(u) && redirectTarget(u) === null);
  const added = pageUrls.filter((u) => !known.includes(u));
  for (const u of lost) errors.push(`URL пропал и на него нет редиректа в public/${SITE}/_redirects: ${u}`);
  if (added.length) {
    errors.push(`новые URL (${added.length}), подтвердите через pnpm urls:update:\n      ${added.join('\n      ')}`);
  }
}

// Редиректы на другой наш сайт: цель должна быть его опубликованной страницей.
for (const r of redirects) {
  const other = Object.entries(SITES).find(([id, s]) => id !== SITE && r.to.startsWith(s.url + '/'));
  if (!other) continue;
  const [id, s] = other;
  const known = existsSync(urlsFile(id)) ? new Set(readFileSync(urlsFile(id), 'utf8').split('\n').filter(Boolean)) : new Set();
  const sources = existsSync(URLS_FILE) ? readFileSync(URLS_FILE, 'utf8').split('\n').filter(Boolean) : [];
  let matched = 0;
  for (const u of sources) {
    if (!r.re.test(u)) continue;
    matched++;
    const target = redirectTarget(u);
    if (target?.startsWith(s.url) && !known.has(target.slice(s.url.length))) {
      errors.push(`редирект ${u} → ${target}: такой страницы нет в ${urlsFile(id)}`);
    }
  }
  if (!matched) errors.push(`правило _redirects "${r.from} ${r.to}" не покрывает ни одного URL из ${URLS_FILE}`);
}

// 2. внутренние ссылки
const resolves = (href) => {
  const path = decodeURI(href.split(/[?#]/)[0]);
  // Редирект засчитывается только внутренний: относительная ссылка, уводящая 301 на другой сайт, — ошибка.
  return fileSet.has(path) || fileSet.has(path.replace(/\/?$/, '/') + 'index.html') || !!redirectTarget(path)?.startsWith('/');
};
// Ссылки на другой наш сайт — абсолютные; сверяются с его urls.{site}.txt.
const otherSites = Object.entries(SITES)
  .filter(([id]) => id !== SITE)
  .map(([id, s]) => ({ url: s.url, file: urlsFile(id), known: new Set(existsSync(urlsFile(id)) ? readFileSync(urlsFile(id), 'utf8').split('\n').filter(Boolean) : []) }));
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(join(DIST, file), 'utf8');
  for (const [, href] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    if (!resolves(href)) errors.push(`битая ссылка в ${file}: ${href}`);
  }
  for (const [, href] of html.matchAll(/href="(https:\/\/[^"]*)"/g)) {
    const other = otherSites.find((o) => href.startsWith(o.url + '/'));
    const path = other && href.slice(other.url.length).split(/[?#]/)[0];
    if (other && !other.known.has(path)) errors.push(`ссылка в ${file} на страницу, которой нет в ${other.file}: ${href}`);
  }
}

// 3. бюджеты
// Исключение: обвязка декодера HEIC (libheif-js, LGPL) — сторонний файл как есть, грузится только
// на странице heic-to-jpg и только после выбора первого файла, в первую загрузку страницы не входит.
const UNBUDGETED = /^\/_astro\/libheif[.-][\w-]+\.js$/;
const sizes = [];
for (const file of files) {
  const ext = file.split('.').pop();
  if (!(ext in BUDGET) || UNBUDGETED.test(file)) continue;
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
