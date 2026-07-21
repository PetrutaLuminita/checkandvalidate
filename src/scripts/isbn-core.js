// ISBN-10 and ISBN-13 validation, plus ISBN-10 to ISBN-13 conversion.
// Language-independent.
//
// ISBN-10: 10 characters. The last may be a digit or X (worth 10). Multiply the
//   digits by 10, 9, 8, ... 1, sum them, and the number is valid if the sum is
//   divisible by 11.
// ISBN-13: 13 digits, checked like an EAN-13 barcode. Multiply the digits
//   alternately by 1 and 3 (first by 1), sum them, and the number is valid if
//   the sum is divisible by 10.
// Conversion: take the first 9 digits of a valid ISBN-10, prefix 978, and
//   recompute the ISBN-13 check digit.

export function normalizeIsbn(input) {
  return String(input || '').replace(/[\s-]/g, '').toUpperCase();
}

export function isbn10Valid(s) {
  if (!/^\d{9}[\dX]$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const c = s[i];
    const v = c === 'X' ? 10 : c.charCodeAt(0) - 48;
    sum += v * (10 - i);
  }
  return sum % 11 === 0;
}

export function isbn13Valid(s) {
  if (!/^\d{13}$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += (s.charCodeAt(i) - 48) * (i % 2 === 0 ? 1 : 3);
  }
  return sum % 10 === 0;
}

// Convert a valid ISBN-10 to its ISBN-13. Assumes the input is a valid ISBN-10.
export function isbn10To13(s) {
  const core = '978' + s.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += (core.charCodeAt(i) - 48) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return core + check;
}

// error: 'empty' | 'format' | 'length' | 'check10' | 'check13' | null
export function validateIsbn(input) {
  const s = normalizeIsbn(input);
  if (!s) return { valid: false, error: 'empty' };
  if (!/^[\dX]+$/.test(s)) return { valid: false, error: 'format' };

  if (s.length === 10) {
    if (!/^\d{9}[\dX]$/.test(s)) return { valid: false, error: 'format', type: 'ISBN-10' };
    const valid = isbn10Valid(s);
    return {
      valid,
      error: valid ? null : 'check10',
      type: 'ISBN-10',
      normalized: s,
      isbn13: valid ? isbn10To13(s) : null,
    };
  }

  if (s.length === 13) {
    if (!/^\d{13}$/.test(s)) return { valid: false, error: 'format', type: 'ISBN-13' };
    const valid = isbn13Valid(s);
    return { valid, error: valid ? null : 'check13', type: 'ISBN-13', normalized: s };
  }

  return { valid: false, error: 'length', length: s.length };
}
