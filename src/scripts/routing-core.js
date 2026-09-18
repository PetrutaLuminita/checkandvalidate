// US bank routing number (ABA) validation. Language-independent.
//
// A routing number is 9 digits. The last digit is a check digit chosen so the
// weighted sum below is a multiple of 10:
//   3*(d1+d4+d7) + 7*(d2+d5+d8) + 1*(d3+d6+d9)  mod 10 == 0
//
// The first two digits are the Federal Reserve routing symbol, which maps to a
// region. We surface that as extra information but the pass/fail is the
// checksum. This checks the number's form only; it does not confirm the number
// belongs to an open, active bank.

export function normalizeRouting(input) {
  return String(input || '').replace(/[\s-]/g, '');
}

// First-two-digit ranges defined by the ABA / Federal Reserve.
function routingRegion(d2) {
  const n = Number(d2);
  if (n >= 1 && n <= 12) return 'Federal Reserve Bank (primary)';
  if (n >= 21 && n <= 32) return 'Thrift institution';
  if (n >= 61 && n <= 72) return 'Electronic transaction (ACH)';
  if (n === 80) return "Traveler's cheque";
  return null;
}

function abaChecksumOk(d) {
  const n = (i) => d.charCodeAt(i) - 48;
  const sum =
    3 * (n(0) + n(3) + n(6)) +
    7 * (n(1) + n(4) + n(7)) +
    1 * (n(2) + n(5) + n(8));
  return sum % 10 === 0;
}

// error: 'empty' | 'format' | 'range' | 'checksum' | null
export function validateRouting(input) {
  const s = normalizeRouting(input);
  if (!s) return { valid: false, error: 'empty' };
  if (!/^\d{9}$/.test(s)) return { valid: false, error: 'format', length: s.length };

  const region = routingRegion(s.slice(0, 2));
  if (!region) return { valid: false, error: 'range', normalized: s, prefix: s.slice(0, 2) };
  if (!abaChecksumOk(s)) return { valid: false, error: 'checksum', normalized: s, region };

  return { valid: true, error: null, normalized: s, region };
}
