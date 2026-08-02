import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static, multilingual build. Every language (including English) gets an
// explicit URL prefix (/en/, /ro/, /es/) thanks to prefixDefaultLocale, so
// the three versions stay symmetrical instead of treating English as an
// unprefixed default.
//
// The sitemap is a plain list of every generated URL, which naturally covers
// all three locale variants of every page. We deliberately do NOT use the
// sitemap integration's i18n auto-linking, because that assumes each locale
// shares the same path with only the prefix swapped. Our slugs are localized
// per language (e.g. /en/cnp-validator vs /ro/validator-cnp), so the reciprocal
// hreflang relationships are declared explicitly in each page's <head> instead.
export default defineConfig({
  site: 'https://checkandvalidate.com',
  // One URL per page, with NO trailing slash, site-wide (e.g. /es/validador-iban
  // and /es, never /es/validador-iban/ or /es/). This keeps canonical tags,
  // internal links, and the generated sitemap all in the same form, and
  // vercel.json ("trailingSlash": false) 308-redirects the slash variant to it
  // so a page is never reachable at two URLs.
  trailingSlash: 'never',
  i18n: {
    locales: ['en', 'ro', 'es'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      // Do NOT let Astro emit its own "/" handler. Astro's auto redirect (and a
      // hand-written index.astro) both produce a 200 HTML stub with a noindex
      // meta tag, which Google excludes from indexing. Instead the bare root is
      // handled by a real server-side 301 redirect to /en in vercel.json, so
      // link equity for checkandvalidate.com passes straight to the homepage.
      redirectToDefaultLocale: false,
    },
  },
  integrations: [sitemap()],
});
