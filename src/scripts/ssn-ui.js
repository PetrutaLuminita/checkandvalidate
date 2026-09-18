// Shared DOM wiring for the SSN format validator. Language-neutral. Privacy is
// paramount: everything runs locally and nothing is sent anywhere.
import { validateSsn } from './ssn-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);
const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

const form = document.getElementById('ssn-form');
const field = document.getElementById('ssn-field');
const input = document.getElementById('ssn-input');
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
  const res = validateSsn(input.value);

  if (res.valid) {
    box.className = 'result-box is-valid';
    headline.textContent = S.validHeadline;
    note.textContent = S.validNote;
    info.innerHTML = row(S.labelFormatted, res.formatted, true);
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
    document.getElementById('ssn-error').textContent = S.err.empty;
    box.hidden = true;
    return;
  }
  let msg = S.err[res.error];
  if (res.error === 'area') msg = fmt(msg, { area: res.area });
  note.textContent = msg;
  box.hidden = false;
});
