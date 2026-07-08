// Shared DOM wiring for the CNP validator. Language-neutral; all strings come
// from the page's #tool-i18n JSON blob.
import { validateCnp } from './cnp-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);
const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

const form = document.getElementById('cnp-form');
const field = document.getElementById('cnp-field');
const input = document.getElementById('cnp-input');
const box = document.getElementById('result-box');
const headline = document.getElementById('result-headline');
const note = document.getElementById('result-note');
const info = document.getElementById('result-info');
const disclaimer = document.getElementById('result-disclaimer');

function row(label, value) {
  return `<li><span>${label}</span><span class="value">${value}</span></li>`;
}

function formatDate(res) {
  try {
    if (res.year !== null) {
      return new Intl.DateTimeFormat(S.locale, { year: 'numeric', month: 'long', day: 'numeric' })
        .format(new Date(res.year, res.month - 1, res.day));
    }
    return new Intl.DateTimeFormat(S.locale, { month: 'long', day: 'numeric' })
      .format(new Date(2000, res.month - 1, res.day));
  } catch {
    return `${String(res.day).padStart(2, '0')}.${String(res.month).padStart(2, '0')}${res.year !== null ? '.' + res.year : ''}`;
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  field.classList.remove('has-error');
  const res = validateCnp(input.value);

  if (res.valid) {
    let sex = S.sexUnspecified;
    if (res.sex === 'M') sex = S.sexMale;
    else if (res.sex === 'F') sex = S.sexFemale;

    box.className = 'result-box is-valid';
    headline.textContent = S.validHeadline;
    note.textContent = res.resident ? S.residentNote : S.validNote;
    info.innerHTML =
      row(S.labelBirthDate, formatDate(res)) +
      row(S.labelSex, sex) +
      row(S.labelCounty, `${res.county} (${res.countyCode})`);
    disclaimer.textContent = S.disclaimer;
    disclaimer.hidden = false;
    box.hidden = false;
    return;
  }

  box.className = 'result-box is-invalid';
  headline.textContent = S.invalidHeadline;
  info.innerHTML = '';
  disclaimer.hidden = true;

  if (res.error === 'empty') {
    field.classList.add('has-error');
    document.getElementById('cnp-error').textContent = S.err.empty;
    box.hidden = true;
    return;
  }

  let msg = S.err[res.error];
  if (res.error === 'length') msg = fmt(msg, { length: res.length });
  if (res.error === 'county') msg = fmt(msg, { jj: res.countyCode });
  note.textContent = msg;
  box.hidden = false;
});
