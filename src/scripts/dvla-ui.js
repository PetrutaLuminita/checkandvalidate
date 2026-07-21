// Shared DOM wiring for the UK driving licence decoder. Language-neutral; all
// strings come from the page's #tool-i18n JSON blob.
import { decodeDvla } from './dvla-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);
const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

const form = document.getElementById('dvla-form');
const field = document.getElementById('dvla-field');
const input = document.getElementById('dvla-input');
const box = document.getElementById('result-box');
const headline = document.getElementById('result-headline');
const note = document.getElementById('result-note');
const info = document.getElementById('result-info');
const disclaimer = document.getElementById('result-disclaimer');

const row = (label, value) => `<li><span>${label}</span><span class="value">${value}</span></li>`;

function monthName(month) {
  try {
    return new Intl.DateTimeFormat(S.locale, { month: 'long' }).format(new Date(2000, month - 1, 1));
  } catch {
    return String(month);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  field.classList.remove('has-error');
  const res = decodeDvla(input.value);

  if (res.valid) {
    box.className = 'result-box is-valid';
    headline.textContent = S.validHeadline;
    note.textContent = S.validNote;
    info.innerHTML =
      row(S.labelDob, `${res.day} ${monthName(res.month)}`) +
      row(S.labelYear, fmt(S.yearValue, { year: res.yearTwoDigit })) +
      row(S.labelSex, res.sex === 'F' ? S.sexFemale : S.sexMale);
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
    document.getElementById('dvla-error').textContent = S.err.empty;
    box.hidden = true;
    return;
  }
  let msg = S.err[res.error];
  if (res.error === 'length') msg = fmt(S.err.length, { length: res.length });
  note.textContent = msg;
  box.hidden = false;
});
