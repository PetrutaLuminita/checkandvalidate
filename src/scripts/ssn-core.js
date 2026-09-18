// US SSN (Social Security Number) STRUCTURAL format validation.
// Language-independent.
//
// IMPORTANT: This checks the shape of the 9 digits only. It performs no lookup,
// sends nothing anywhere, and cannot and does not confirm that an SSN was ever
// issued or belongs to any person. It is a format sanity check, nothing more.
//
// Structure AAA-GG-SSSS:
//   Area (first 3):   not 000, not 666, not 900-999
//   Group (middle 2): not 00
//   Serial (last 4):  not 0000

export function normalizeSsn(input) {
  return String(input || '').replace(/[\s-]/g, '');
}

// error: 'empty' | 'format' | 'area' | 'group' | 'serial' | null
export function validateSsn(input) {
  const s = normalizeSsn(input);
  if (!s) return { valid: false, error: 'empty' };
  if (!/^\d{9}$/.test(s)) return { valid: false, error: 'format', length: s.length };

  const area = Number(s.slice(0, 3));
  const group = Number(s.slice(3, 5));
  const serial = Number(s.slice(5, 9));
  const formatted = `${s.slice(0, 3)}-${s.slice(3, 5)}-${s.slice(5, 9)}`;

  if (area === 0 || area === 666 || area >= 900) {
    return { valid: false, error: 'area', normalized: s, formatted, area: s.slice(0, 3) };
  }
  if (group === 0) return { valid: false, error: 'group', normalized: s, formatted };
  if (serial === 0) return { valid: false, error: 'serial', normalized: s, formatted };

  return { valid: true, error: null, normalized: s, formatted };
}
