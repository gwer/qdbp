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
  vite: {
    build: {
      rollupOptions: {
        output: {
          // pdf-lib (~250 КБ gzip) — отдельным файлом с постоянным именем: он грузится только на страницах PDF,
          // в фоне, и исключён из бюджета размера по имени (scripts/check-dist.mjs).
          // fflate (zip) нужен и pdf-lib, и картинкам — своим файлом, иначе архив у картинок тянул бы весь pdf-lib.
          manualChunks: (id) =>
            /node_modules[\\/]\.pnpm[\\/]fflate@/.test(id)
              ? 'fflate'
              : /node_modules[\\/]\.pnpm[\\/](@cantoo\+pdf-lib|culori|node-html-better-parser|html-entities)@/.test(id)
                ? 'pdf-lib'
                : undefined,
        },
      },
    },
  },
});
