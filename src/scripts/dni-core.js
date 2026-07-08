// Spanish DNI / NIE check-letter core. Language-independent.
//
// DNI: 8 digits + 1 check letter.
// NIE: leading letter (X, Y or Z) + 7 digits + 1 check letter.
//
// Check letter: replace a NIE's leading letter with a digit (X=0, Y=1, Z=2),
// read the resulting 8 digits as an integer, take it modulo 23, and index into
// the fixed reference string "TRWAGMYFPDXBNJZSQVHLCKE". The letters I, N-with-
// tilde, O and U are intentionally absent to avoid confusion with digits.
// (Verified against public DNI/NIF references.)

const LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';
const NIE_PREFIX = { X: '0', Y: '1', Z: '2' };

export function normalize(input) {
  return String(input || '').replace(/[\s-]+/g, '').toUpperCase();
}

// Convert a DNI/NIE body (no check letter, or with it, either way we only read
// the numeric part) into the integer used for the modulo operation. Returns
// null if the body is not a well-formed DNI or NIE number part.
function toNumberPart(body) {
  if (/^\d{8}$/.test(body)) {
    return { type: 'DNI', numeric: Number(body), prefix: null };
  }
  const nieMatch = body.match(/^([XYZ])(\d{7})$/);
  if (nieMatch) {
    const numeric = Number(NIE_PREFIX[nieMatch[1]] + nieMatch[2]);
    return { type: 'NIE', numeric, prefix: nieMatch[1] };
  }
  return null;
}

export function letterFor(numeric) {
  return LETTERS[numeric % 23];
}

// CALCULATE mode: given a number without its check letter (8-digit DNI, or
// X/Y/Z + 7 digits NIE), return the correct letter and the full document.
// error: 'empty' | 'format' | null
export function calculateLetter(input) {
  const s = normalize(input);
  if (!s) return { ok: false, error: 'empty' };

  const parsed = toNumberPart(s);
  if (!parsed) return { ok: false, error: 'format' };

  const letter = letterFor(parsed.numeric);
  return {
    ok: true,
    error: null,
    type: parsed.type,
    number: s,
    letter,
    full: s + letter,
  };
}

// VALIDATE mode: given a full DNI/NIE including its check letter, confirm the
// letter is correct.
// error: 'empty' | 'format' | null
export function validateFull(input) {
  const s = normalize(input);
  if (!s) return { ok: false, error: 'empty' };

  const dni = s.match(/^(\d{8})([A-Z])$/);
  const nie = s.match(/^([XYZ]\d{7})([A-Z])$/);
  const match = dni || nie;
  if (!match) return { ok: false, error: 'format' };

  const body = match[1];
  const givenLetter = match[2];
  const parsed = toNumberPart(body);
  // body is guaranteed well-formed by the regex above.
  const expected = letterFor(parsed.numeric);

  return {
    ok: true,
    error: null,
    type: parsed.type,
    number: body,
    givenLetter,
    expectedLetter: expected,
    valid: givenLetter === expected,
  };
}
