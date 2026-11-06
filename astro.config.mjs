import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import SITES from './src/sites.json' with { type: 'json' };

// Какой из двух сайтов собирать — см. src/site.ts.
const site = process.env.SITE ?? 'calc';
if (!(site in SITES)) throw new Error(`SITE=${site}: ожидается ${Object.keys(SITES).join(' или ')}`);

export default defineConfig({
  site: SITES[site].url,
  publicDir: `public/${site}`,
  outDir: `dist/${site}`,
  trailingSlash: 'always',
  build: { format: 'directory' },
  // На Cloudflare корень редиректит public/{site}/_redirects (настоящий 302).
  // Этот редирект нужен для astro dev/preview: при сборке Astro кладёт в dist/index.html
  // страницу с meta refresh, которую Cloudflare не отдаёт, потому что _redirects срабатывает раньше.
  redirects: { '/': { status: 302, destination: '/en/' } },
  integrations: [preact(), sitemap()],
});
