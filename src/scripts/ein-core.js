// US EIN (Employer Identification Number) format validation.
// Language-independent.
//
// An EIN is 9 digits written NN-NNNNNNN. The first two digits are the "EIN
// prefix", which identifies the IRS campus or method (online, SBA) that
// assigned it. Only a published set of prefixes is in use. This checks the
// FORMAT and prefix only; it does NOT confirm the EIN is registered to a
// business, which is not something a format check can do.
//
// Valid prefix set compiled from the IRS campus prefix table plus the
// internet-assigned and SBA prefixes (per the IRS and Wikipedia's EIN article).

export const VALID_EIN_PREFIXES = new Set([
  '01', '02', '03', '04', '05', '06',
  '10', '11', '12', '13', '14', '15', '16',
  '20', '21', '22', '23', '24', '25', '26', '27',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '48',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
  '60', '61', '62', '63', '64', '65', '66', '67', '68',
  '71', '72', '73', '74', '75', '76', '77',
  '80', '81', '82', '83', '84', '85', '86', '87', '88',
  '90', '91', '92', '93', '94', '95', '98', '99',
]);

export function normalizeEin(input) {
  return String(input || '').replace(/[\s-]/g, '');
}

// error: 'empty' | 'format' | 'prefix' | null
export function validateEin(input) {
  const s = normalizeEin(input);
  if (!s) return { valid: false, error: 'empty' };
  if (!/^\d{9}$/.test(s)) return { valid: false, error: 'format', length: s.length };

  const prefix = s.slice(0, 2);
  const formatted = `${prefix}-${s.slice(2)}`;
  if (!VALID_EIN_PREFIXES.has(prefix)) {
    return { valid: false, error: 'prefix', normalized: s, formatted, prefix };
  }
  return { valid: true, error: null, normalized: s, formatted, prefix };
}
