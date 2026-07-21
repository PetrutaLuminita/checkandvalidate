// UK (GB) VAT number validation core. Language-independent.
//
// A standard GB VAT number is 9 digits (often written GB123 4567 89). Branch
// traders have a 12-digit variant (the 9-digit number plus a 3-digit branch
// suffix). Government departments (GD) and health authorities (HA) use a short
// GBGDxxx / GBHAxxx form that does NOT use the check-digit maths below.
//
// Check-digit algorithm (HMRC modulus-97, with the newer "9755" variant):
//   1. Multiply the first 7 digits by the weights 8, 7, 6, 5, 4, 3, 2.
//   2. Add the two check digits (positions 8-9) weighted 10 and 1, i.e. add the
//      two-digit check number.
//   3. Take that total modulo 97.
//   4. The number is valid if the result is 0 (the original "97" method) OR 55
//      (the "9755" method used for registrations from late 2009 onward).
// Weights and the 0/55 rule verified against the standard reference
// implementation (python-stdnum) and the known-valid example GB980780684
// (weighted sum 291 = 3 x 97, so result 0).

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 1];

// Strip spaces, an optional leading GB/GBGD/GBHA prefix, and upper-case.
export function normalizeVat(input) {
  let s = String(input || '').toUpperCase().replace(/[\s.\-]/g, '');
  if (s.startsWith('GB')) s = s.slice(2);
  return s;
}

function mod97Checksum(nineDigits) {
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += WEIGHTS[i] * Number(nineDigits[i]);
  return sum % 97;
}

// error: 'empty' | 'format' | 'govhealth' | 'checksum' | null
// method: '97' | '9755' | null  (which rule the number satisfied, when valid)
export function validateVat(input) {
  const s = normalizeVat(input);
  if (!s) return { valid: false, error: 'empty' };

  // Government (GD, 000-499) and health authority (HA, 500-999) numbers use a
  // different, non modulus-97 scheme. Recognise them rather than wrongly
  // failing them, but state we do not run the check-digit test on them.
  const govHealth = s.match(/^(GD|HA)(\d{3})$/);
  if (govHealth) {
    return {
      valid: null,
      error: 'govhealth',
      kind: govHealth[1] === 'GD' ? 'government' : 'health',
      normalized: s,
    };
  }

  if (!/^\d+$/.test(s)) return { valid: false, error: 'format', normalized: s };
  if (s.length !== 9 && s.length !== 12) {
    return { valid: false, error: 'format', normalized: s, length: s.length };
  }

  const core = s.slice(0, 9);
  const branch = s.length === 12 ? s.slice(9) : null;
  const remainder = mod97Checksum(core);

  if (remainder === 0 || remainder === 55) {
    return {
      valid: true,
      error: null,
      method: remainder === 0 ? '97' : '9755',
      normalized: s,
      core,
      branch,
      formatted: 'GB' + core.replace(/(\d{3})(\d{4})(\d{2})/, ' $1 $2 $3').trim() + (branch ? ' ' + branch : ''),
    };
  }

  return { valid: false, error: 'checksum', normalized: s, core, branch };
}
