function asCurrency(value, currency, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function asPercent(value, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parsePositiveNumber(input) {
  const parsed = Number.parseFloat(input);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function buildResultsMarkup(resultsEl, metrics) {
  resultsEl.textContent = '';
  const list = document.createElement('dl');
  metrics.forEach(({ label, value }) => {
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    description.textContent = value;
    list.append(term, description);
  });
  resultsEl.append(list);
}

function showError(resultsEl, message) {
  resultsEl.textContent = '';
  const error = document.createElement('p');
  error.className = 'roi-calculator-error';
  error.textContent = message;
  resultsEl.append(error);
}

function applyDefaultValues(form, widgetRoot) {
  const defaults = [
    ['investment', widgetRoot.dataset.investment],
    ['finalValue', widgetRoot.dataset.finalvalue],
    ['years', widgetRoot.dataset.years],
  ];

  defaults.forEach(([name, value]) => {
    if (!value) return;
    const input = form.elements.namedItem(name);
    if (!input) return;
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      input.value = String(parsed);
    }
  });
}

export default function decorate(widgetRoot) {
  const form = widgetRoot.querySelector('.roi-calculator-form');
  const resultsEl = widgetRoot.querySelector('.roi-calculator-results');
  if (!form || !resultsEl) return;

  const currency = widgetRoot.dataset.currency || 'USD';
  const locale = widgetRoot.dataset.locale || 'en-US';
  applyDefaultValues(form, widgetRoot);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const investment = parsePositiveNumber(formData.get('investment'));
    const finalValue = parsePositiveNumber(formData.get('finalValue'));
    const yearsRaw = formData.get('years');
    const years = yearsRaw ? parsePositiveNumber(yearsRaw) : null;

    if (investment === null || finalValue === null) {
      showError(resultsEl, 'Please enter valid non-negative numbers for investment and final value.');
      return;
    }

    if (investment === 0) {
      showError(resultsEl, 'Initial investment must be greater than 0.');
      return;
    }

    const profit = finalValue - investment;
    const roi = profit / investment;
    const multiple = finalValue / investment;

    const metrics = [
      { label: 'Net Profit', value: asCurrency(profit, currency, locale) },
      { label: 'ROI', value: asPercent(roi, locale) },
      { label: 'Return Multiple', value: `${multiple.toFixed(2)}x` },
    ];

    if (years !== null && years > 0) {
      const annualized = (multiple ** (1 / years)) - 1;
      metrics.push({ label: 'Annualized ROI', value: asPercent(annualized, locale) });
    }

    buildResultsMarkup(resultsEl, metrics);
  });
}
