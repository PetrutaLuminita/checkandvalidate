// Shared DOM wiring for the ABA routing number validator. Language-neutral.
import { validateRouting } from './routing-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);

const form = document.getElementById('routing-form');
const field = document.getElementById('routing-field');
const input = document.getElementById('routing-input');
const box = document.getElementById('result-box');
const headline = document.getElementById('result-headline');
const note = document.getElementById('result-note');
const info = document.getElementById('result-info');

const row = (label, value, mono) =>
  `<li><span>${label}</span><span class="value${mono ? ' mono' : ''}">${value}</span></li>`;

// Federal Reserve region key -> localized label from the strings blob.
const regionKey = (region) =>
  ({
    'Federal Reserve Bank (primary)': 'regionPrimary',
    'Thrift institution': 'regionThrift',
    'Electronic transaction (ACH)': 'regionAch',
    "Traveler's cheque": 'regionTraveler',
  }[region]);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  field.classList.remove('has-error');
  const res = validateRouting(input.value);

  if (res.valid) {
    box.className = 'result-box is-valid';
    headline.textContent = S.validHeadline;
    note.textContent = S.validNote;
    info.innerHTML = row(S.labelType, S.regions[regionKey(res.region)] || res.region, false);
    box.hidden = false;
    return;
  }

  box.className = 'result-box is-invalid';
  headline.textContent = S.invalidHeadline;
  info.innerHTML = '';

  if (res.error === 'empty') {
    field.classList.add('has-error');
    document.getElementById('routing-error').textContent = S.err.empty;
    box.hidden = true;
    return;
  }
  note.textContent = S.err[res.error];
  box.hidden = false;
});
