import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://qdbp.net',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // На Cloudflare корень редиректит public/_redirects (настоящий 302).
  // Этот редирект нужен для astro dev/preview: при сборке Astro кладёт в dist/index.html
  // страницу с meta refresh, которую Cloudflare не отдаёт, потому что _redirects срабатывает раньше.
  redirects: { '/': { status: 302, destination: '/en/' } },
  integrations: [preact(), sitemap()],
});
