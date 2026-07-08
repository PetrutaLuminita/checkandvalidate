// IBAN validation core. Language-independent so all three localized pages
// share the exact same algorithm and can never drift apart.
//
// Algorithm (ISO 7064 mod-97, ISO 13616):
//   1. Normalize: strip spaces, uppercase.
//   2. Length check: total length must equal the fixed length registered for
//      the two-letter country code.
//   3. Move the first four characters (country code + check digits) to the end.
//   4. Replace each letter with two digits: A=10, B=11, ... Z=35.
//   5. The IBAN is valid iff that big number mod 97 === 1.
//
// The per-country length table is taken from the ISO 13616 / SWIFT IBAN
// registry (as published on the IBAN registry and Wikipedia's IBAN article).

export const IBAN_LENGTHS = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28,
  BA: 20, BE: 16, BG: 22, BH: 22, BI: 27, BR: 29, BY: 28,
  CH: 21, CR: 22, CY: 28, CZ: 24,
  DE: 22, DJ: 27, DK: 18, DO: 28,
  EE: 20, EG: 29, ES: 24,
  FI: 18, FK: 18, FO: 18, FR: 27,
  GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28,
  HN: 28, HR: 21, HU: 28,
  IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27,
  JO: 30,
  KW: 30, KZ: 20,
  LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, LY: 25,
  MC: 27, MD: 24, ME: 22, MK: 19, MN: 20, MR: 27, MT: 31, MU: 30,
  NI: 28, NL: 18, NO: 15,
  OM: 23,
  PK: 24, PL: 28, PS: 29, PT: 25,
  QA: 29,
  RO: 24, RS: 22, RU: 33,
  SA: 24, SC: 31, SD: 18, SE: 24, SI: 19, SK: 24, SM: 27, SO: 23, ST: 25, SV: 28,
  TL: 23, TN: 24, TR: 26,
  UA: 29,
  VA: 22, VG: 24,
  XK: 20,
  YE: 30,
};

export function normalizeIban(input) {
  return String(input || '').replace(/\s+/g, '').toUpperCase();
}

// mod-97 over a very long digit string, computed in chunks so it never
// overflows JavaScript's safe integer range.
function mod97(numericString) {
  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + (numericString.charCodeAt(i) - 48)) % 97;
  }
  return remainder;
}

// Returns a structured result so the UI can explain exactly which check failed.
// error is one of: 'empty' | 'charset' | 'country' | 'length' | 'checksum' | null
export function validateIban(input) {
  const normalized = normalizeIban(input);

  if (!normalized) {
    return { valid: false, error: 'empty', normalized };
  }
  if (!/^[A-Z0-9]+$/.test(normalized)) {
    return { valid: false, error: 'charset', normalized };
  }

  const countryCode = normalized.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(countryCode) || !(countryCode in IBAN_LENGTHS)) {
    return { valid: false, error: 'country', normalized, countryCode };
  }

  const expectedLength = IBAN_LENGTHS[countryCode];
  if (normalized.length !== expectedLength) {
    return {
      valid: false,
      error: 'length',
      normalized,
      countryCode,
      expectedLength,
      actualLength: normalized.length,
    };
  }

  // Rearrange, convert letters to numbers, mod-97.
  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  let numeric = '';
  for (const ch of rearranged) {
    if (ch >= '0' && ch <= '9') numeric += ch;
    else numeric += (ch.charCodeAt(0) - 55).toString(); // 'A'(65) -> 10
  }

  if (mod97(numeric) !== 1) {
    return { valid: false, error: 'checksum', normalized, countryCode, expectedLength };
  }

  return { valid: true, error: null, normalized, countryCode, expectedLength };
}

// Group into blocks of four for readable display: RO49 AAAA 1B31 ...
export function formatIban(normalized) {
  return normalized.replace(/(.{4})/g, '$1 ').trim();
}
