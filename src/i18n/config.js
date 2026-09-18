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

// The interactive tools, in the order they appear across the site (homepage
// grid, header, footer, related tools). Grouped loosely: bank and payment
// numbers, then tax/VAT numbers, then identity documents, then other. `name` is
// the H1 / link text per language, `desc` is the short blurb used on the
// homepage grid and card links.
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
    id: 'swift',
    slugs: { en: 'swift-bic-validator', ro: 'validator-swift-bic', es: 'validador-swift-bic' },
    name: {
      en: 'SWIFT / BIC Code Checker',
      ro: 'Verificator cod SWIFT/BIC',
      es: 'Verificador de código SWIFT/BIC',
    },
    desc: {
      en: 'Check the structure of a SWIFT/BIC code and its country, and break it into its bank, location, and branch parts. Format only, no bank lookup.',
      ro: 'Verifică structura unui cod SWIFT/BIC și țara lui și îl împarte în codul băncii, locație și sucursală. Doar format, fără căutare în bancă.',
      es: 'Comprueba la estructura de un código SWIFT/BIC y su país, y lo divide en las partes de banco, localidad y oficina. Solo formato, sin consultar el banco.',
    },
  },
  {
    id: 'uk-vat',
    slugs: { en: 'uk-vat-validator', ro: 'validator-tva-uk', es: 'validador-iva-uk' },
    name: {
      en: 'UK VAT Number Validator',
      ro: 'Validator TVA britanic',
      es: 'Validador de IVA británico',
    },
    desc: {
      en: 'Check a UK VAT number with the HMRC modulus-97 check digit algorithm, including the newer 9755 variant.',
      ro: 'Verifică un număr de TVA britanic cu algoritmul modulo 97 al HMRC, inclusiv varianta mai nouă 9755.',
      es: 'Comprueba un número de IVA británico con el algoritmo módulo 97 de HMRC, incluida la variante más nueva 9755.',
    },
  },
  {
    id: 'euvat',
    slugs: { en: 'eu-vat-validator', ro: 'validator-tva-ue', es: 'validador-iva-ue' },
    name: {
      en: 'EU VAT Number Validator',
      ro: 'Validator număr TVA UE',
      es: 'Validador de número de IVA de la UE',
    },
    desc: {
      en: 'Check the format of a VAT number for any EU country (plus Northern Ireland). Format check only; confirm it is active with VIES.',
      ro: 'Verifică formatul unui număr de TVA pentru orice țară din UE (plus Irlanda de Nord). Doar verificare de format; confirmă-l ca activ cu VIES.',
      es: 'Comprueba el formato de un número de IVA de cualquier país de la UE (más Irlanda del Norte). Solo formato; confírmalo como activo con VIES.',
    },
  },
  {
    id: 'ein',
    slugs: { en: 'ein-validator', ro: 'validator-ein', es: 'validador-ein' },
    name: {
      en: 'US EIN Format Validator',
      ro: 'Validator format EIN (SUA)',
      es: 'Validador de formato de EIN (EE. UU.)',
    },
    desc: {
      en: 'Check that a US EIN has the NN-NNNNNNN format and a valid IRS prefix, plus a guide on how to find your EIN.',
      ro: 'Verifică dacă un EIN american are formatul NN-NNNNNNN și un prefix IRS valid, plus un ghid despre cum îți găsești EIN-ul.',
      es: 'Comprueba que un EIN de EE. UU. tenga el formato NN-NNNNNNN y un prefijo válido del IRS, además de una guía para encontrar tu EIN.',
    },
  },
  {
    id: 'credit-card',
    slugs: { en: 'credit-card-validator', ro: 'validator-card-credit', es: 'validador-tarjeta-credito' },
    name: {
      en: 'Credit Card Number Validator',
      ro: 'Validator număr card de credit',
      es: 'Validador de número de tarjeta de crédito',
    },
    desc: {
      en: 'Check whether a card number is mathematically valid with the Luhn algorithm and see its likely network. Nothing is ever sent anywhere.',
      ro: 'Verifică dacă un număr de card este valid matematic cu algoritmul Luhn și vezi rețeaua lui probabilă. Nimic nu este trimis vreodată nicăieri.',
      es: 'Comprueba si un número de tarjeta es matemáticamente válido con el algoritmo de Luhn y descubre su red probable. Nada se envía nunca a ningún sitio.',
    },
  },
  {
    id: 'routing',
    slugs: { en: 'routing-number-validator', ro: 'validator-numar-routing', es: 'validador-numero-routing' },
    name: {
      en: 'US Routing Number (ABA) Validator',
      ro: 'Validator număr de routing (ABA, SUA)',
      es: 'Validador de número de ruta (ABA, EE. UU.)',
    },
    desc: {
      en: 'Validate a US bank routing number with the 9-digit ABA checksum, and see its Federal Reserve region.',
      ro: 'Validează un număr de routing bancar american cu suma de control ABA de 9 cifre și vezi regiunea Federal Reserve.',
      es: 'Valida un número de ruta bancaria de EE. UU. con la suma de control ABA de 9 dígitos y descubre su región de la Reserva Federal.',
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
    id: 'uk-licence',
    slugs: {
      en: 'uk-driving-licence-decoder',
      ro: 'decodor-permis-conducere-uk',
      es: 'decodificador-carnet-conducir-uk',
    },
    name: {
      en: 'UK Driving Licence Decoder',
      ro: 'Decodor permis de conducere britanic',
      es: 'Decodificador de carnet de conducir británico',
    },
    desc: {
      en: 'Decode the date of birth and sex embedded in a 16-character UK driving licence number, and check its structure.',
      ro: 'Decodează data nașterii și sexul din numărul de permis de conducere britanic de 16 caractere și verifică-i structura.',
      es: 'Descifra la fecha de nacimiento y el sexo del número de carnet de conducir británico de 16 caracteres y comprueba su estructura.',
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
  {
    id: 'ssn',
    slugs: { en: 'ssn-format-validator', ro: 'validator-format-ssn', es: 'validador-formato-ssn' },
    name: {
      en: 'US SSN Format Validator',
      ro: 'Validator format SSN (SUA)',
      es: 'Validador de formato de SSN (EE. UU.)',
    },
    desc: {
      en: 'Check whether a US SSN has a valid structure (area, group, and serial rules). Format only, private, no lookup of any person.',
      ro: 'Verifică dacă un SSN american are o structură validă (reguli de zonă, grup și serie). Doar format, privat, fără căutarea vreunei persoane.',
      es: 'Comprueba si un SSN de EE. UU. tiene una estructura válida (reglas de área, grupo y serie). Solo formato, privado, sin buscar a ninguna persona.',
    },
  },
  {
    id: 'isbn',
    slugs: { en: 'isbn-validator', ro: 'validator-isbn', es: 'validador-isbn' },
    name: {
      en: 'ISBN Validator',
      ro: 'Validator ISBN',
      es: 'Validador de ISBN',
    },
    desc: {
      en: 'Validate an ISBN-10 or ISBN-13 check digit, and convert a valid ISBN-10 into its ISBN-13 form.',
      ro: 'Validează cifra de control a unui ISBN-10 sau ISBN-13 și convertește un ISBN-10 valid în forma ISBN-13.',
      es: 'Valida el dígito de control de un ISBN-10 o ISBN-13 y convierte un ISBN-10 válido a su forma ISBN-13.',
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
