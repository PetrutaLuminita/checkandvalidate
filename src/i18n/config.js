// Single source of truth for the site's languages, tools, and static pages.
//
// Every tool and static page has a STABLE id that never changes, plus a
// per-locale slug and name. Because the slugs are localized (not just a shared
// path with a swapped prefix), this registry is what lets us build reciprocal
// hreflang tags and a language switcher that jumps to the SAME page in another
// language rather than dumping the visitor on a foreign homepage.

// Display order of the language switcher (Romanian intentionally last).
// defaultLocale stays 'en' and drives x-default; order here is cosmetic.
export const locales = ['en', 'es', 'ro'];
export const defaultLocale = 'en';

export const localeNames = {
  en: 'English',
  ro: 'Română',
  es: 'Español',
};

// The three interactive tools, in the order they appear across the site
// (homepage grid, header, footer, related tools). IBAN first, then the Spanish
// DNI/NIE, then the Romanian CNP. `name` is the H1 / link text per language,
// `desc` is the short blurb used on the homepage grid and card links.
export const tools = [
  {
    id: 'iban',
    slugs: { en: 'iban-validator', ro: 'validator-iban', es: 'validador-iban' },
    name: {
      en: 'European IBAN Validator',
      ro: 'Validator IBAN european',
      es: 'Validador de IBAN europeo',
    },
    desc: {
      en: 'Validate an IBAN with the mod-97 checksum and the official per-country length, and see exactly which check failed.',
      ro: 'Validează un IBAN cu algoritmul mod-97 și cu lungimea oficială pe țară și vezi exact ce verificare a eșuat.',
      es: 'Valida un IBAN con el algoritmo mod-97 y la longitud oficial por país, y descubre exactamente qué comprobación ha fallado.',
    },
  },
  {
    id: 'dni-nie',
    slugs: { en: 'dni-nie-calculator', ro: 'calculator-dni-nie', es: 'calculadora-dni-nie' },
    name: {
      en: 'Spanish DNI/NIE Calculator',
      ro: 'Calculator DNI/NIE spaniol',
      es: 'Calculadora de DNI/NIE español',
    },
    desc: {
      en: 'Work out the check letter for a Spanish DNI or NIE, or confirm whether the letter on an existing document is correct.',
      ro: 'Calculează litera de control pentru un DNI sau NIE spaniol sau verifică dacă litera de pe un document existent este corectă.',
      es: 'Calcula la letra de un DNI o NIE español, o comprueba si la letra de un documento ya emitido es correcta.',
    },
  },
  {
    id: 'cnp',
    slugs: { en: 'cnp-validator', ro: 'validator-cnp', es: 'validador-cnp' },
    name: {
      en: 'Romanian CNP Validator',
      ro: 'Validator CNP românesc',
      es: 'Validador de CNP rumano',
    },
    desc: {
      en: 'Check the structure and control digit of a Romanian CNP, and read back the birth date, sex, and county it encodes.',
      ro: 'Verifică structura și cifra de control a unui CNP românesc și află data nașterii, sexul și județul codificate în el.',
      es: 'Comprueba la estructura y el dígito de control de un CNP rumano y muestra la fecha de nacimiento, el sexo y el condado que codifica.',
    },
  },
];

// About / Contact / Privacy / Terms. `nav` is the visible link label.
export const staticPages = [
  {
    id: 'about',
    slugs: { en: 'about', ro: 'despre', es: 'acerca-de' },
    nav: { en: 'About', ro: 'Despre', es: 'Acerca de' },
  },
  {
    id: 'contact',
    slugs: { en: 'contact', ro: 'contact', es: 'contacto' },
    nav: { en: 'Contact', ro: 'Contact', es: 'Contacto' },
  },
  {
    id: 'privacy',
    slugs: { en: 'privacy-policy', ro: 'politica-de-confidentialitate', es: 'politica-de-privacidad' },
    nav: { en: 'Privacy Policy', ro: 'Politică de confidențialitate', es: 'Política de privacidad' },
  },
  {
    id: 'terms',
    slugs: { en: 'terms', ro: 'termeni-si-conditii', es: 'terminos-y-condiciones' },
    nav: { en: 'Terms', ro: 'Termeni și condiții', es: 'Términos y condiciones' },
  },
];

export function getTool(id) {
  return tools.find((t) => t.id === id);
}

export function getStaticPage(id) {
  return staticPages.find((p) => p.id === id);
}

export function homePath(locale) {
  // No trailing slash, matching every other URL on the site (see the
  // trailingSlash setting in astro.config.mjs and vercel.json).
  return `/${locale}`;
}

export function toolPath(id, locale) {
  return `/${locale}/${getTool(id).slugs[locale]}`;
}

export function staticPath(id, locale) {
  return `/${locale}/${getStaticPage(id).slugs[locale]}`;
}

// Given a page descriptor, return { en, ro, es } relative paths for the same
// page in every language. Used for both hreflang tags and the language
// switcher. `kind` is 'home' | 'tool' | 'static'; `id` is required for the
// last two.
export function alternatesFor(kind, id) {
  const out = {};
  for (const locale of locales) {
    if (kind === 'home') out[locale] = homePath(locale);
    else if (kind === 'tool') out[locale] = toolPath(id, locale);
    else if (kind === 'static') out[locale] = staticPath(id, locale);
  }
  return out;
}

export function relatedTools(currentId, locale, count = 2) {
  return tools
    .filter((t) => t.id !== currentId)
    .slice(0, count)
    .map((t) => ({ name: t.name[locale], href: toolPath(t.id, locale) }));
}
