// EU VAT number FORMAT validation. Language-independent.
//
// Each EU member state has its own VAT number pattern (a two-letter country
// prefix plus a national part of a fixed shape). This checks that shape only.
// Confirming a VAT number is real and active requires the European Commission's
// official VIES service (https://ec.europa.eu/taxation_customs/vies). Two
// prefixes are not ISO codes: Greece uses EL (not GR), and Northern Ireland
// uses XI.
//
// Patterns verified against published EU VAT format references (VIES-aligned).

// name = country name for display; test = regex for the national part.
export const EU_VAT_PATTERNS = {
  AT: { name: 'Austria', test: /^U\d{8}$/ },
  BE: { name: 'Belgium', test: /^[01]\d{9}$/ },
  BG: { name: 'Bulgaria', test: /^\d{9,10}$/ },
  CY: { name: 'Cyprus', test: /^\d{8}[A-Z]$/ },
  CZ: { name: 'Czechia', test: /^\d{8,10}$/ },
  DE: { name: 'Germany', test: /^\d{9}$/ },
  DK: { name: 'Denmark', test: /^\d{8}$/ },
  EE: { name: 'Estonia', test: /^\d{9}$/ },
  EL: { name: 'Greece', test: /^\d{9}$/ },
  ES: { name: 'Spain', test: /^[A-Z0-9]\d{7}[A-Z0-9]$/ },
  FI: { name: 'Finland', test: /^\d{8}$/ },
  FR: { name: 'France', test: /^[A-Z0-9]{2}\d{9}$/ },
  HR: { name: 'Croatia', test: /^\d{11}$/ },
  HU: { name: 'Hungary', test: /^\d{8}$/ },
  IE: { name: 'Ireland', test: /^(\d{7}[A-Z]{1,2}|\d[A-Z0-9+*]\d{5}[A-Z])$/ },
  IT: { name: 'Italy', test: /^\d{11}$/ },
  LT: { name: 'Lithuania', test: /^(\d{9}|\d{12})$/ },
  LU: { name: 'Luxembourg', test: /^\d{8}$/ },
  LV: { name: 'Latvia', test: /^\d{11}$/ },
  MT: { name: 'Malta', test: /^\d{8}$/ },
  NL: { name: 'Netherlands', test: /^\d{9}B\d{2}$/ },
  PL: { name: 'Poland', test: /^\d{10}$/ },
  PT: { name: 'Portugal', test: /^\d{9}$/ },
  RO: { name: 'Romania', test: /^\d{2,10}$/ },
  SE: { name: 'Sweden', test: /^\d{12}$/ },
  SI: { name: 'Slovenia', test: /^\d{8}$/ },
  SK: { name: 'Slovakia', test: /^\d{10}$/ },
  XI: { name: 'Northern Ireland', test: /^(\d{9}|\d{12})$/ },
};

export function normalizeEuVat(input) {
  return String(input || '').replace(/[\s.\-]/g, '').toUpperCase();
}

// error: 'empty' | 'tooshort' | 'country' | 'pattern' | null
// greekHint: true when the user typed GR instead of EL.
export function validateEuVat(input) {
  const s = normalizeEuVat(input);
  if (!s) return { valid: false, error: 'empty' };
  if (s.length < 3) return { valid: false, error: 'tooshort', normalized: s };

  const prefix = s.slice(0, 2);
  const national = s.slice(2);

  if (!/^[A-Z]{2}$/.test(prefix) || !(prefix in EU_VAT_PATTERNS)) {
    return {
      valid: false,
      error: 'country',
      normalized: s,
      prefix,
      greekHint: prefix === 'GR',
    };
  }

  const country = EU_VAT_PATTERNS[prefix];
  if (!country.test.test(national)) {
    return { valid: false, error: 'pattern', normalized: s, prefix, country: country.name, national };
  }

  return {
    valid: true,
    error: null,
    normalized: s,
    prefix,
    country: country.name,
    national,
    formatted: prefix + ' ' + national,
  };
}
