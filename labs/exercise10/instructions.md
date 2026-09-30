# Exercise 10: Build a Repoless ROI Calculator Widget

**Duration**: 35–45 minutes

---

## Prerequisites

- Complete [SETUP.md](../SETUP.md)
- Be on your personal feature branch
- Local server available at `http://localhost:3000`
- Recommended: complete Exercises 1–9 first
- Familiarity with `scripts/scripts.js` and block/widget loading concepts

---

## What You'll Learn

- How widgets differ from blocks in AEM Edge Delivery Services
- How to implement a practical app-style widget under `/widgets`
- How to auto-hydrate `/widgets/*.html` links at runtime
- How to pass defaults and formatting via query params
- How to test with Experience Workspace content

---

## Why This Matters

Blocks are excellent for repeated authored content structures.  
Widgets are better for application-like components (calculators, mini-tools, utility UIs) where behavior is primary and authoring is minimal.

This exercise shows how to deliver a reusable business tool with a simple authoring experience: a single widget URL.

---

## Exercise Steps

### Step 1: Create your branch

```bash
git checkout demo-exercise9
git checkout -b demo-exercise10-roi-widget
```

---

### Step 2: Create widget files

Create this structure:

- `widgets/roi-calculator/roi-calculator.html`
- `widgets/roi-calculator/roi-calculator.css`
- `widgets/roi-calculator/roi-calculator.js`

The widget should provide:
- Initial Investment
- Final Value
- Period (Years)
- Calculate button
- Results area (Net Profit, ROI, Return Multiple, Annualized ROI)

---

### Step 3: Add runtime widget hydration

Update `scripts/scripts.js` so it:

1. Finds links containing `/widgets/` ending in `.html`
2. Replaces single-link paragraphs with a widget host container
3. Fetches widget HTML
4. Loads the widget CSS and JS from the same widget base path
5. Passes URL query params as `data-*` attributes to the widget root element

---

### Step 4: Implement ROI logic

In `widgets/roi-calculator/roi-calculator.js`, implement:

- Validation for non-negative numeric input
- Formula outputs:
  - Net Profit = Final Value − Initial Investment
  - ROI = Net Profit / Initial Investment
  - Return Multiple = Final Value / Initial Investment
  - Annualized ROI when years > 0
- User-friendly error messages
- Currency/percentage formatting via `Intl.NumberFormat`

---

### Step 5: Support URL-driven defaults

Support these query params:

- `currency` (default: `USD`)
- `locale` (default: `en-US`)
- `investment` (optional prefill)
- `finalValue` (optional prefill)
- `years` (optional prefill)

Example:

```text
/widgets/roi-calculator/roi-calculator.html?currency=INR&locale=en-IN&investment=10000&finalValue=12600&years=2
```

---

### Step 6: Create and test a page in Experience Workspace

Use the same authoring approach as earlier exercises:

1. Create a new page in your Experience Workspace site.
2. Add heading/body content.
3. Add a single-link paragraph pointing to the widget URL:

```text
/widgets/roi-calculator/roi-calculator.html?currency=INR&locale=en-IN&investment=10000&finalValue=12600&years=2
```

4. Preview (and publish if required by your workflow).
5. Open the preview URL and verify:
   - Widget renders
   - Defaults are prefilled
   - Currency symbol and locale formatting are correct
   - Calculations work

---

### Step 7: Validate locally (optional fallback)

If Experience Workspace preview is temporarily blocked, validate using local drafts page:

- `http://localhost:3000/drafts/tmp/roi-widget-preview`

---

### Step 8: Lint and commit

```bash
npm run lint
git add scripts/scripts.js widgets/roi-calculator/roi-calculator.html widgets/roi-calculator/roi-calculator.css widgets/roi-calculator/roi-calculator.js
git commit -m "feat(widget): add ROI calculator widget"
```

---

## Verification Checklist

- [ ] Widget files are under `/widgets/roi-calculator/`
- [ ] A `/widgets/...html` link auto-renders the widget
- [ ] `currency` and `locale` influence formatting correctly
- [ ] `investment`, `finalValue`, and `years` prefill correctly
- [ ] ROI metrics are correct
- [ ] No console errors
- [ ] `npm run lint` passes

---

## Key Takeaways

- Widgets are ideal for app-like use cases
- URL-based insertion keeps authoring simple
- Query params make one widget reusable in many contexts
- Widgets complement (not replace) block-based authoring
