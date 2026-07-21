// Shared DOM wiring for the ISBN validator. Language-neutral; all strings come
// from the page's #tool-i18n JSON blob.
import { validateIsbn } from './isbn-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);
const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

const form = document.getElementById('isbn-form');
const field = document.getElementById('isbn-field');
const input = document.getElementById('isbn-input');
const box = document.getElementById('result-box');
const headline = document.getElementById('result-headline');
const note = document.getElementById('result-note');
const info = document.getElementById('result-info');

const row = (label, value, mono) =>
  `<li><span>${label}</span><span class="value${mono ? ' mono' : ''}">${value}</span></li>`;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  field.classList.remove('has-error');
  const res = validateIsbn(input.value);

  if (res.valid) {
    box.className = 'result-box is-valid';
    headline.textContent = fmt(S.validHeadline, { type: res.type });
    note.textContent = res.type === 'ISBN-10' ? S.validNote10 : S.validNote13;
    info.innerHTML =
      row(S.labelType, res.type, false) +
      (res.isbn13 ? row(S.labelIsbn13, res.isbn13, true) : '');
    box.hidden = false;
    return;
  }

  box.className = 'result-box is-invalid';
  headline.textContent = S.invalidHeadline;
  info.innerHTML = '';

  if (res.error === 'empty') {
    field.classList.add('has-error');
    document.getElementById('isbn-error').textContent = S.err.empty;
    box.hidden = true;
    return;
  }
  let msg = S.err[res.error];
  if (res.error === 'length') msg = fmt(msg, { length: res.length });
  note.textContent = msg;
  box.hidden = false;
});
