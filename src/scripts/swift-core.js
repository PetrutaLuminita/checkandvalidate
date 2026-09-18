// SWIFT / BIC code format validation (ISO 9362). Language-independent.
//
// A BIC is 8 or 11 characters:
//   Positions 1-4   Bank / institution code (letters)
//   Positions 5-6   Country code (ISO 3166-1 alpha-2 letters)
//   Positions 7-8   Location code (letters or digits)
//   Positions 9-11  Branch code (letters or digits), optional; 8-char BICs are
//                   the primary office (implicitly XXX)
//
// This checks the STRUCTURE and that the country code is a real ISO country.
// It does NOT confirm the bank exists; that needs the official SWIFT directory.

import { ISO_COUNTRIES } from './iso-countries.js';

export function normalizeSwift(input) {
  return String(input || '').replace(/\s+/g, '').toUpperCase();
}

// error: 'empty' | 'length' | 'format' | 'country' | null
export function validateSwift(input) {
  const s = normalizeSwift(input);
  if (!s) return { valid: false, error: 'empty' };
  if (s.length !== 8 && s.length !== 11) {
    return { valid: false, error: 'length', length: s.length };
  }
  // 4 letters, 2 letters, 2 alphanumerics, optional 3 alphanumerics.
  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(s)) {
    return { valid: false, error: 'format', normalized: s };
  }
  const countryCode = s.slice(4, 6);
  if (!(countryCode in ISO_COUNTRIES)) {
    return { valid: false, error: 'country', normalized: s, countryCode };
  }
  return {
    valid: true,
    error: null,
    normalized: s,
    bankCode: s.slice(0, 4),
    countryCode,
    countryName: ISO_COUNTRIES[countryCode],
    locationCode: s.slice(6, 8),
    branchCode: s.length === 11 ? s.slice(8, 11) : 'XXX',
    primaryOffice: s.length === 8,
  };
}
