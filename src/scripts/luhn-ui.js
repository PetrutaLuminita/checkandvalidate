// Shared DOM wiring for the credit card (Luhn) validator. Language-neutral; all
// strings come from the page's #tool-i18n JSON blob. Nothing here sends the
// number anywhere: validateCard runs entirely in the browser.
import { validateCard } from './luhn-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);
const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

const form = document.getElementById('cc-form');
const field = document.getElementById('cc-field');
const input = document.getElementById('cc-input');
const box = document.getElementById('result-box');
const headline = document.getElementById('result-headline');
const note = document.getElementById('result-note');
const info = document.getElementById('result-info');

const row = (label, value, mono) =>
  `<li><span>${label}</span><span class="value${mono ? ' mono' : ''}">${value}</span></li>`;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  field.classList.remove('has-error');
  const res = validateCard(input.value);

  if (res.valid) {
    box.className = 'result-box is-valid';
    headline.textContent = S.validHeadline;
    note.textContent = S.validNote;
    info.innerHTML =
      row(S.labelNetwork, res.network || S.networkUnknown, false) +
      row(S.labelLength, fmt(S.lengthValue, { n: res.length }), false);
    box.hidden = false;
    return;
  }

  box.className = 'result-box is-invalid';
  headline.textContent = S.invalidHeadline;
  info.innerHTML = '';

  if (res.error === 'empty') {
    field.classList.add('has-error');
    document.getElementById('cc-error').textContent = S.err.empty;
    box.hidden = true;
    return;
  }
  let msg = S.err[res.error];
  if (res.error === 'length') msg = fmt(msg, { length: res.length });
  note.textContent = msg;
  box.hidden = false;
});
