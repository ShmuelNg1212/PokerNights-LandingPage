// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Netlify sets URL to the site's main address at build time; link previews need it absolute.
  site: process.env.URL || undefined,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
