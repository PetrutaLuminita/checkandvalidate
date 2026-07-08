// Shared DOM wiring for the IBAN validator, identical across all three
// languages. Every visible string comes from the JSON blob in #tool-i18n that
// the page renders in its own language, so this file stays language-neutral.
import { validateIban, formatIban } from './iban-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);

const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

const form = document.getElementById('iban-form');
const field = document.getElementById('iban-field');
const input = document.getElementById('iban-input');
const box = document.getElementById('result-box');
const headline = document.getElementById('result-headline');
const note = document.getElementById('result-note');
const info = document.getElementById('result-info');

function row(label, value, mono) {
  return `<li><span>${label}</span><span class="value${mono ? ' mono' : ''}">${value}</span></li>`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  field.classList.remove('has-error');
  const res = validateIban(input.value);

  if (res.valid) {
    box.className = 'result-box is-valid';
    headline.textContent = S.validHeadline;
    note.textContent = fmt(S.validNote, { cc: res.countryCode });
    info.innerHTML =
      row(S.labelCountry, res.countryCode, false) +
      row(S.labelLength, `${res.expectedLength} ${S.charsWord}`, false) +
      row(S.labelFormatted, formatIban(res.normalized), true);
    box.hidden = false;
    return;
  }

  // Invalid: explain exactly which check failed.
  box.className = 'result-box is-invalid';
  headline.textContent = S.invalidHeadline;
  info.innerHTML = '';

  if (res.error === 'empty' || res.error === 'charset') {
    field.classList.add('has-error');
    document.getElementById('iban-error').textContent = S.err[res.error];
    box.hidden = true;
    return;
  }

  let msg = S.err[res.error];
  if (res.error === 'country') msg = fmt(msg, { cc: res.countryCode });
  if (res.error === 'length') msg = fmt(msg, { cc: res.countryCode, expected: res.expectedLength, actual: res.actualLength });
  if (res.error === 'checksum') msg = fmt(msg, { cc: res.countryCode });
  note.textContent = msg;
  box.hidden = false;
});
