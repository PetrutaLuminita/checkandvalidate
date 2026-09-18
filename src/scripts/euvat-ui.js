// Shared DOM wiring for the EU VAT format validator. Language-neutral.
import { validateEuVat } from './euvat-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);
const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

const form = document.getElementById('euvat-form');
const field = document.getElementById('euvat-field');
const input = document.getElementById('euvat-input');
const box = document.getElementById('result-box');
const headline = document.getElementById('result-headline');
const note = document.getElementById('result-note');
const info = document.getElementById('result-info');
const disclaimer = document.getElementById('result-disclaimer');

const row = (label, value, mono) =>
  `<li><span>${label}</span><span class="value${mono ? ' mono' : ''}">${value}</span></li>`;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  field.classList.remove('has-error');
  const res = validateEuVat(input.value);

  if (res.valid) {
    box.className = 'result-box is-valid';
    headline.textContent = S.validHeadline;
    note.textContent = S.validNote;
    info.innerHTML =
      row(S.labelCountry, `${res.country} (${res.prefix})`, false) +
      row(S.labelFormatted, res.formatted, true);
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
    document.getElementById('euvat-error').textContent = S.err.empty;
    box.hidden = true;
    return;
  }
  let msg = S.err[res.error];
  if (res.error === 'country') msg = res.greekHint ? S.err.greek : fmt(S.err.country, { cc: res.prefix });
  if (res.error === 'pattern') msg = fmt(S.err.pattern, { country: res.country });
  note.textContent = msg;
  box.hidden = false;
});
