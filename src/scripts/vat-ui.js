// Shared DOM wiring for the UK VAT validator. Language-neutral; all strings
// come from the page's #tool-i18n JSON blob.
import { validateVat } from './vat-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);
const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

const form = document.getElementById('vat-form');
const field = document.getElementById('vat-field');
const input = document.getElementById('vat-input');
const box = document.getElementById('result-box');
const headline = document.getElementById('result-headline');
const note = document.getElementById('result-note');
const info = document.getElementById('result-info');

const row = (label, value, mono) =>
  `<li><span>${label}</span><span class="value${mono ? ' mono' : ''}">${value}</span></li>`;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  field.classList.remove('has-error');
  const res = validateVat(input.value);

  // Government / health authority numbers: neither pass nor fail the check-digit
  // test, so show a neutral informational result.
  if (res.error === 'govhealth') {
    box.className = 'result-box';
    headline.textContent = S.govHealthHeadline;
    note.textContent = res.kind === 'government' ? S.govNote : S.healthNote;
    info.innerHTML = '';
    box.hidden = false;
    return;
  }

  if (res.valid) {
    box.className = 'result-box is-valid';
    headline.textContent = S.validHeadline;
    note.textContent = res.method === '97' ? S.validNoteStandard : S.validNoteNew;
    info.innerHTML =
      row(S.labelFormatted, res.formatted, true) +
      row(S.labelMethod, res.method === '97' ? S.methodStandard : S.methodNew, false) +
      (res.branch ? row(S.labelBranch, res.branch, true) : '');
    box.hidden = false;
    return;
  }

  box.className = 'result-box is-invalid';
  headline.textContent = S.invalidHeadline;
  info.innerHTML = '';

  if (res.error === 'empty') {
    field.classList.add('has-error');
    document.getElementById('vat-error').textContent = S.err.empty;
    box.hidden = true;
    return;
  }
  let msg = S.err[res.error];
  if (res.error === 'format' && res.length) msg = fmt(S.err.format, { length: res.length });
  note.textContent = msg;
  box.hidden = false;
});
