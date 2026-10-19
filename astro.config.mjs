import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://qdbp.net',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [preact(), sitemap()],
});
