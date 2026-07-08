// Shared DOM wiring for the DNI/NIE calculator. Two modes: calculate the check
// letter for a number, or validate a full document that already has its letter.
// Language-neutral; all strings come from the page's #tool-i18n JSON blob.
import { calculateLetter, validateFull } from './dni-core.js';

const S = JSON.parse(document.getElementById('tool-i18n').textContent);
const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

const form = document.getElementById('dni-form');
const field = document.getElementById('dni-field');
const input = document.getElementById('dni-input');
const label = document.getElementById('dni-label');
const hint = document.getElementById('dni-hint');
const submit = document.getElementById('dni-submit');
const errorEl = document.getElementById('dni-error');
const btnCalc = document.getElementById('mode-calc');
const btnValidate = document.getElementById('mode-validate');
const box = document.getElementById('result-box');
const headline = document.getElementById('result-headline');
const note = document.getElementById('result-note');
const info = document.getElementById('result-info');

let mode = 'calc';

function row(label, value, mono) {
  return `<li><span>${label}</span><span class="value${mono ? ' mono' : ''}">${value}</span></li>`;
}

function applyMode(next) {
  mode = next;
  const m = S.modes[mode];
  label.textContent = m.label;
  hint.textContent = m.hint;
  submit.textContent = m.submit;
  btnCalc.setAttribute('aria-pressed', String(mode === 'calc'));
  btnValidate.setAttribute('aria-pressed', String(mode === 'validate'));
  field.classList.remove('has-error');
  box.hidden = true;
  input.value = '';
  input.focus();
}

btnCalc.addEventListener('click', () => applyMode('calc'));
btnValidate.addEventListener('click', () => applyMode('validate'));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  field.classList.remove('has-error');

  if (mode === 'calc') {
    const res = calculateLetter(input.value);
    if (!res.ok) {
      field.classList.add('has-error');
      errorEl.textContent = res.error === 'empty' ? S.err.emptyCalc : S.err.formatCalc;
      box.hidden = true;
      return;
    }
    box.className = 'result-box is-valid';
    headline.textContent = fmt(S.calc.headline, { letter: res.letter });
    note.textContent = '';
    info.innerHTML =
      row(S.calc.typeLabel, res.type, false) +
      row(S.calc.letterLabel, res.letter, true) +
      row(S.calc.fullLabel, res.full, true);
    box.hidden = false;
    return;
  }

  // validate mode
  const res = validateFull(input.value);
  if (!res.ok) {
    field.classList.add('has-error');
    errorEl.textContent = res.error === 'empty' ? S.err.emptyValidate : S.err.formatValidate;
    box.hidden = true;
    return;
  }
  info.innerHTML =
    row(S.validate.typeLabel, res.type, false) +
    row(S.validate.numberLabel, res.number, true) +
    row(S.validate.expectedLabel, res.expectedLetter, true);
  if (res.valid) {
    box.className = 'result-box is-valid';
    headline.textContent = S.validate.validHeadline;
    note.textContent = fmt(S.validate.validNote, { letter: res.expectedLetter, number: res.number, type: res.type });
  } else {
    box.className = 'result-box is-invalid';
    headline.textContent = S.validate.invalidHeadline;
    note.textContent = fmt(S.validate.invalidNote, { expected: res.expectedLetter, given: res.givenLetter, number: res.number });
  }
  box.hidden = false;
});
