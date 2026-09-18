// Shared DOM wiring for the SWIFT/BIC checker. Language-neutral; strings come
// from the page's #tool-i18n JSON blob.
import { validateSwift } from './swift-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);
const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

const form = document.getElementById('swift-form');
const field = document.getElementById('swift-field');
const input = document.getElementById('swift-input');
const box = document.getElementById('result-box');
const headline = document.getElementById('result-headline');
const note = document.getElementById('result-note');
const info = document.getElementById('result-info');

const row = (label, value, mono) =>
  `<li><span>${label}</span><span class="value${mono ? ' mono' : ''}">${value}</span></li>`;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  field.classList.remove('has-error');
  const res = validateSwift(input.value);

  if (res.valid) {
    box.className = 'result-box is-valid';
    headline.textContent = S.validHeadline;
    note.textContent = res.primaryOffice ? S.validNotePrimary : S.validNoteBranch;
    info.innerHTML =
      row(S.labelBank, res.bankCode, true) +
      row(S.labelCountry, `${res.countryName} (${res.countryCode})`, false) +
      row(S.labelLocation, res.locationCode, true) +
      row(S.labelBranch, res.branchCode, true);
    box.hidden = false;
    return;
  }

  box.className = 'result-box is-invalid';
  headline.textContent = S.invalidHeadline;
  info.innerHTML = '';

  if (res.error === 'empty') {
    field.classList.add('has-error');
    document.getElementById('swift-error').textContent = S.err.empty;
    box.hidden = true;
    return;
  }
  let msg = S.err[res.error];
  if (res.error === 'length') msg = fmt(msg, { length: res.length });
  if (res.error === 'country') msg = fmt(msg, { cc: res.countryCode });
  note.textContent = msg;
  box.hidden = false;
});
