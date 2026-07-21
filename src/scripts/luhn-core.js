// Credit card number check (Luhn / ISO-IEC 7812) plus likely-network detection.
// Language-independent. This only checks that a number is mathematically well
// formed. It cannot tell whether a card is real, active, or has any funds, and
// nothing here contacts a bank or any server.
//
// Luhn algorithm:
//   1. From the rightmost digit moving left, double every second digit.
//   2. If a doubled digit is greater than 9, subtract 9 from it.
//   3. Sum every digit (doubled and untouched).
//   4. The number is valid if that sum is a multiple of 10.

export function normalizeCard(input) {
  return String(input || '').replace(/[\s-]/g, '');
}

export function luhnValid(digits) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

// Likely card network from the leading digits. IIN prefixes and ranges verified
// against the ISO/IEC 7812 summary in Wikipedia's "Payment card number".
// Returns a brand name (not localised) or null when it is not recognised.
export function detectNetwork(n) {
  const d2 = Number(n.slice(0, 2));
  const d3 = Number(n.slice(0, 3));
  const d4 = Number(n.slice(0, 4));

  if (n[0] === '4') return 'Visa';
  if ((d2 >= 51 && d2 <= 55) || (d4 >= 2221 && d4 <= 2720)) return 'Mastercard';
  if (d2 === 34 || d2 === 37) return 'American Express';
  if (n.startsWith('6011') || (d3 >= 644 && d3 <= 649) || d2 === 65) return 'Discover';
  if (d4 >= 3528 && d4 <= 3589) return 'JCB';
  if (d2 === 36 || d2 === 38 || d2 === 39 || (d3 >= 300 && d3 <= 305)) return 'Diners Club';
  if (d2 === 62) return 'UnionPay';
  if (['5018', '5020', '5038', '5893', '6304', '6759', '6761', '6762', '6763'].some((p) => n.startsWith(p))) {
    return 'Maestro';
  }
  return null;
}

// error: 'empty' | 'format' | 'length' | 'luhn' | null
export function validateCard(input) {
  const s = normalizeCard(input);
  if (!s) return { valid: false, error: 'empty' };
  if (!/^\d+$/.test(s)) return { valid: false, error: 'format' };
  // Real card numbers run 12 to 19 digits.
  if (s.length < 12 || s.length > 19) return { valid: false, error: 'length', length: s.length };

  const network = detectNetwork(s);
  const valid = luhnValid(s);
  return {
    valid,
    error: valid ? null : 'luhn',
    normalized: s,
    network,
    length: s.length,
    // Grouped into fours purely for display.
    formatted: s.replace(/(.{4})/g, '$1 ').trim(),
  };
}
