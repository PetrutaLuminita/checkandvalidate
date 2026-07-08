// Romanian CNP (Cod Numeric Personal) validation core. Language-independent.
//
// Format: S YY MM DD JJ NNN C  (13 digits)
//   S   sex + century of birth
//   YY  year within the century
//   MM  month
//   DD  day
//   JJ  county (judet) of registration
//   NNN sequential number
//   C   control digit
//
// Control digit: multiply the first 12 digits by the fixed weight string
// "279146358279", sum the products, take the sum modulo 11; if the result is
// 10 the control digit is 1, otherwise it equals the result.
// (Verified against the vimishor/cnp-spec reference.)

const CONTROL_WEIGHTS = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];

// First digit S: sex and the century it maps birth years into.
// 7 and 8 are residents (century not encoded by S); 9 is "other".
const SEX_CENTURY = {
  1: { sex: 'M', century: 1900 },
  2: { sex: 'F', century: 1900 },
  3: { sex: 'M', century: 1800 },
  4: { sex: 'F', century: 1800 },
  5: { sex: 'M', century: 2000 },
  6: { sex: 'F', century: 2000 },
  7: { sex: 'M', century: null },
  8: { sex: 'F', century: null },
  9: { sex: null, century: null },
};

// County / Bucharest sector codes. Names are the official Romanian proper
// nouns and stay the same in every language version of the page.
export const COUNTY_CODES = {
  '01': 'Alba', '02': 'Arad', '03': 'Argeș', '04': 'Bacău', '05': 'Bihor',
  '06': 'Bistrița-Năsăud', '07': 'Botoșani', '08': 'Brașov', '09': 'Brăila',
  '10': 'Buzău', '11': 'Caraș-Severin', '12': 'Cluj', '13': 'Constanța',
  '14': 'Covasna', '15': 'Dâmbovița', '16': 'Dolj', '17': 'Galați',
  '18': 'Gorj', '19': 'Harghita', '20': 'Hunedoara', '21': 'Ialomița',
  '22': 'Iași', '23': 'Ilfov', '24': 'Maramureș', '25': 'Mehedinți',
  '26': 'Mureș', '27': 'Neamț', '28': 'Olt', '29': 'Prahova',
  '30': 'Satu Mare', '31': 'Sălaj', '32': 'Sibiu', '33': 'Suceava',
  '34': 'Teleorman', '35': 'Timiș', '36': 'Tulcea', '37': 'Vaslui',
  '38': 'Vâlcea', '39': 'Vrancea', '40': 'București',
  '41': 'București (Sector 1)', '42': 'București (Sector 2)',
  '43': 'București (Sector 3)', '44': 'București (Sector 4)',
  '45': 'București (Sector 5)', '46': 'București (Sector 6)',
  '51': 'Călărași', '52': 'Giurgiu',
};

function computeControlDigit(first12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(first12[i]) * CONTROL_WEIGHTS[i];
  }
  const rem = sum % 11;
  return rem === 10 ? 1 : rem;
}

// Validate a real calendar date. `century` may be null (resident codes 7/8),
// in which case we accept the day/month and cannot pin the exact century, so
// we leave the full year unresolved.
function resolveDate(sDigit, yy, mm, dd) {
  const info = SEX_CENTURY[sDigit];
  let fullYear = null;
  if (info && info.century !== null) {
    fullYear = info.century + yy;
  }

  // Month/day sanity against a concrete year when known; otherwise validate
  // against a leap-safe reference year so Feb 29 is allowed.
  const refYear = fullYear !== null ? fullYear : 2000;
  const d = new Date(refYear, mm - 1, dd);
  const realDate = d.getFullYear() === refYear && d.getMonth() === mm - 1 && d.getDate() === dd;

  return { fullYear, realDate };
}

// error: 'empty' | 'length' | 'digits' | 'sex' | 'date' | 'county' | 'checksum' | null
export function validateCnp(input) {
  const cnp = String(input || '').replace(/\s+/g, '');

  if (!cnp) return { valid: false, error: 'empty' };
  if (!/^\d+$/.test(cnp)) return { valid: false, error: 'digits' };
  if (cnp.length !== 13) return { valid: false, error: 'length', length: cnp.length };

  const sDigit = Number(cnp[0]);
  if (sDigit < 1 || sDigit > 9) return { valid: false, error: 'sex' };

  const yy = Number(cnp.slice(1, 3));
  const mm = Number(cnp.slice(3, 5));
  const dd = Number(cnp.slice(5, 7));
  const jj = cnp.slice(7, 9);

  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return { valid: false, error: 'date', month: mm, day: dd };
  }

  const { fullYear, realDate } = resolveDate(sDigit, yy, mm, dd);
  if (!realDate) {
    return { valid: false, error: 'date', month: mm, day: dd, year: fullYear };
  }

  const county = COUNTY_CODES[jj];
  if (!county) return { valid: false, error: 'county', countyCode: jj };

  const expected = computeControlDigit(cnp.slice(0, 12));
  if (expected !== Number(cnp[12])) {
    return { valid: false, error: 'checksum', expected };
  }

  const info = SEX_CENTURY[sDigit];
  return {
    valid: true,
    error: null,
    sex: info.sex,
    resident: sDigit === 7 || sDigit === 8,
    year: fullYear,
    month: mm,
    day: dd,
    countyCode: jj,
    county,
  };
}
