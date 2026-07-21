// UK (DVLA) driving licence number decoder. Language-independent.
//
// The DVLA driver number is 16 characters and encodes the holder's surname,
// date of birth, sex, and initials, plus a computer check. Layout (verified
// against public DVLA-format references):
//
//   Positions 1-5   First five letters of the surname (padded with 9s if
//                   shorter). NOT decoded here: the surname cannot be
//                   reconstructed or verified from these letters.
//   Position  6     Decade digit of the birth year (e.g. 8 for 198x).
//   Positions 7-8   Birth month. For female holders 50 is added, so the month
//                   is 01-12 for men and 51-62 for women.
//   Positions 9-10  Day of birth.
//   Position  11    Final digit of the birth year (units).
//   Positions 12-13 First-name initials (second is 9 if only one forename).
//   Positions 14-16 Computer-generated check characters. IMPORTANT: DVLA does
//                   NOT publish the algorithm behind these, so they cannot be
//                   validated mathematically. This decoder therefore checks the
//                   STRUCTURE and decodes the date of birth and sex only.
//
// Note on the year: the number stores only two year digits (decade + unit), so
// the century (19xx vs 20xx) is not encoded and cannot be determined for
// certain. We surface the two-digit year and say so.

// Structural pattern for the 16 characters.
const PATTERN = /^[A-Z][A-Z9]{4}\d{6}[A-Z][A-Z9][A-Z0-9]{3}$/;

export function normalizeDvla(input) {
  return String(input || '').toUpperCase().replace(/[\s-]/g, '');
}

// error: 'empty' | 'length' | 'format' | 'month' | 'day' | null
export function decodeDvla(input) {
  const s = normalizeDvla(input);
  if (!s) return { valid: false, error: 'empty' };
  if (s.length !== 16) return { valid: false, error: 'length', length: s.length };
  if (!PATTERN.test(s)) return { valid: false, error: 'format', normalized: s };

  const decade = s[5];
  const monthRaw = Number(s.slice(6, 8));
  const day = Number(s.slice(8, 10));
  const yearUnit = s[10];

  const female = monthRaw >= 51 && monthRaw <= 62;
  const month = female ? monthRaw - 50 : monthRaw;
  if (month < 1 || month > 12) return { valid: false, error: 'month', normalized: s };
  if (day < 1 || day > 31) return { valid: false, error: 'day', normalized: s };

  return {
    valid: true,
    error: null,
    normalized: s,
    sex: female ? 'F' : 'M',
    day,
    month,
    yearTwoDigit: `${decade}${yearUnit}`,
    initials: s.slice(11, 13), // surfaced only to show the structure, not a name
  };
}
