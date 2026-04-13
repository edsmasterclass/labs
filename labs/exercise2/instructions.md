# Exercise 2: Block Development - Enhancements & Variations

**Duration**: 20 minutes

---

<details>
<summary><strong>Quick navigation</strong></summary>

- [Prerequisites](#prerequisites)
- **Background** (please read — expand below, or jump: [What you'll learn](#what-youll-learn) · [Why this matters](#why-this-matters) · [How block decoration works](#how-block-decoration-works) · [Block anatomy](#block-anatomy) · [Current Cards block](#current-cards-block))
- **Exercise steps**
  - [Step 1: Create a Test Page with Cards Blocks](#step-1-create-a-test-page-with-cards-blocks)
  - [Step 2: Test the page (Cards w/Images + eyebrow sample)](#step-2-test-the-page-cards-w-images-eyebrow-sample)
  - [Step 3: Implement Eyebrow Enhancement](#step-3-implement-eyebrow-enhancement)
  - [Step 4: Test Eyebrow Enhancement](#step-4-test-eyebrow-enhancement)
  - [Step 5: Implement List Variation](#step-5-implement-list-variation)
  - [Step 6: Test List Variation](#step-6-test-list-variation)
  - [Step 7: Implement View Switcher Variation](#step-7-implement-view-switcher-variation)
  - [Step 8: Test View Switcher Variation](#step-8-test-view-switcher-variation)
  - [Step 9: Commit Your Changes](#step-9-commit-your-changes)
- **After the steps** (please read — expand below, or jump: [CSS scoping](#understanding-css-scoping) · [Mobile-first CSS](#mobile-first-css) · [Real-world applications](#real-world-applications) · [Key takeaways](#key-takeaways))
- [Verification Checklist](#verification-checklist)
- [References](#references)
- [Solution](#solution)
- [Next Exercise](#next-exercise)

</details>

---

## Prerequisites

**Complete [SETUP.md](../SETUP.md) if not already done.** Exercises can be done in sequence or independently; if independent, ensure SETUP is done and you have the items below.

**Required:**
- **Feature branch** — From the repository root, run `git branch`. The line with `*` should be your personal branch: first initial + last name, all lowercase (e.g. `jsmith`). If you are on `main` or any other branch, create and switch to yours:
  ```bash
  git checkout -b jsmith
  ```
  Replace `jsmith` with your branch name. See [SETUP.md — Step 2: Create Feature Branch](../SETUP.md#step-2-create-feature-branch).
- Verify the local dev server is accessible at [http://localhost:3000](http://localhost:3000); if not, start it with `aem up` from the project root in a terminal ([SETUP Step 6](../SETUP.md#step-6-start-development-server)).
- Code editor open with the repository
- Exercise 1 completed (if doing in sequence)

---

<details>
<summary><strong>Background</strong> (please read — concepts before the hands-on steps)</summary>

## What You'll Learn

- How the block decoration lifecycle works
- How to enhance a block by detecting content patterns (eyebrow from `<em>`)
- How to implement a block variation (list layout)
- How to write mobile-first responsive CSS
- The difference between a block **enhancement** and a block **variation**

---

## Why This Matters

In Exercise 1, you created content as an author. Now you'll see the developer side - writing the code that transforms authored content into styled, interactive components.

**The Block Contract**: Authors create tables with a specific structure. Developers write JavaScript to decorate (transform) that HTML into the final presentation.

There are two ways to extend a block's capabilities:

**Block Enhancements** make the block smarter by detecting content patterns:
- Authors use familiar formatting (bold, italic, links) in their content
- The block recognizes these patterns and renders them specially
- No extra configuration needed — it just works

**Block Variations** can be used to change the block's layout via a class:
- Authors add variation names in parentheses: `Cards (List)`
- CSS/JS targets the variation class for a different presentation
- Same block codebase → multiple layouts

**Real-world scenario**: A Cards block can detect italic text and render it as an eyebrow label (enhancement), or switch to a single-column list layout (variation).

---

## How Block Decoration Works

Read this as a **conceptual pipeline** — build real tables and code in DA.live and your editor, not by pasting from this page.

**1. Authoring in DA.live**  
The author inserts a **Cards** block and fills it like a table: a header row names the block (**Cards**), then each content row is one card — typically an image in one area and body copy in another (e.g. italic label such as *Speaker*, then name and title). Exact layout comes from the block template in DA.live.

**2. EDS output (HTML before your `decorate()` runs)**  
EDS turns that into a root element (e.g. `div.cards`) with nested `div`s, `picture`, and paragraphs — including `<em>` where the author used italics. Below is **illustration-only** HTML so you can picture the shape of the DOM (do not paste into DA.live):

```html
<!-- Reference only — pipeline shape, not a copy target -->
<div class="cards">
  <div>
    <div><picture><!-- image --></picture></div>
    <div>
      <p><em>Speaker</em></p>
      <p>John Doe</p>
      <p>Senior Developer</p>
    </div>
  </div>
</div>
```

**3. Your `decorate(block)` function**  
Your JavaScript receives that root node. For the Cards exercise you classify inner `div`s (image vs body), find `<em>` in the body when you add the eyebrow enhancement, extract it, and reshape nodes (for example wrapping rows in `ul` / `li`).

**4. HTML after decoration**  
After `decorate()` runs, the tree looks more like the final UI — e.g. list markup, eyebrow `div`, classified image/body wrappers. Again **reference only**:

```html
<!-- Reference only — after decoration -->
<div class="cards">
  <ul>
    <li>
      <div class="cards-card-image"><picture><!-- image --></picture></div>
      <div class="cards-card-body">
        <div class="cards-card-eyebrow">Speaker</div>
        <p>John Doe</p>
        <p>Senior Developer</p>
      </div>
    </li>
  </ul>
</div>
```

**5. CSS**  
Project CSS targets classes on that decorated structure (scoped under `.cards`, etc.).

**Reference**: [Exploring Blocks](https://www.aem.live/docs/exploring-blocks)

---

## Block Anatomy

Every block has **`blocks/<blockname>/<blockname>.js`** and **`blocks/<blockname>/<blockname>.css`** — same base name for both files. The **`.js`** file holds decoration logic (required); the **`.css`** file holds styles (required).

For **Cards**, `<blockname>` is `cards`, so you have **`cards.js`** and **`cards.css`**:

```
blocks/
  cards/
    cards.js      - Decoration logic (required)
    cards.css     - Styles (required)
```

**Entrypoint**: The runtime calls the default export of each block’s `.js` file. That export must be a `decorate(block)` function — same pattern for every block. EDS passes the block’s root DOM element; your code transforms it.

**Naming convention**: Folder and file names must match the block name exactly (e.g. `cards` → `cards/cards.js`).

**Variation classes**: In DA.live, authors add a variation by putting extra text in the table header after the block name in parentheses — for example the header reads **Cards (List)**. EDS adds both class names on the root element, so in the DOM you typically see **`class="cards list"`** (or equivalent) on the block wrapper. Your CSS/JS can target the combined selector **`.cards.list`** for variation-specific behavior.

**Reference**: [Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)

---

## Current Cards Block

The repository already has a Cards block. **Open `blocks/cards/cards.js` in your editor** and follow along there — the snippet below is **for reading only** (do not paste it into DA.live; it belongs in the repo file).

**File**: `blocks/cards/cards.js`

```javascript
// Reference only — canonical source is blocks/cards/cards.js in the repo
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    );
  });
  block.replaceChildren(ul);
}
```

**What it does**:
- Creates `<ul>` list
- Each row becomes `<li>` (each card)
- Classifies content as image or body
- Replaces each image with a responsive, size-optimized `<picture>` via [createOptimizedPicture()](../../scripts/aem.js) in `aem.js`
- Replaces original block content

**File**: `blocks/cards/cards.css` - Uses CSS Grid for responsive layout.

</details>

---

## Step 1: Create a Test Page with Cards Blocks

**In DA.live**, create a draft page at **`/drafts/<your-name>/cards-test`** (first initial + last name, lowercase — same folder pattern as [Exercise 1](../exercise1/instructions.md)).

1. Open the project’s **drafts** folder: [da.live/#/edsmasterclass/labs/drafts](https://da.live/#/edsmasterclass/labs/drafts)
2. In that view, go into your personal subfolder **`<your-name>`** (first initial + last name, lowercase). Create the folder here if it does not exist yet — same pattern as [Exercise 1](../exercise1/instructions.md).
3. **New** → **Document**, name it **`cards-test`**.

**Follow this order on `cards-test`** (headings first, then blocks from the **Sidekick** library):

4. Add an **H1**: **Cards Test Page**.
5. Add an **H2**: **Cards With Images**.
6. Insert **Cards w/Images**: open the **DA Sidekick** → **Library** → **Blocks** → expand **Cards** → choose **Cards w/Images**. That inserts the cards table into the page.
7. Add an **H2**: **Cards with Eyebrow**.
8. Insert **Cards with Eyebrows**: open the **DA Sidekick** → **Library** → **Blocks** → expand **Cards** → choose **Cards with Eyebrows**. Place it under **Cards with Eyebrow**.
9. In that eyebrow block, look at the **second column** of the sample cards: notice the italic phrases *performance* and *Authoring made easy as 1, 2, 3* (and similar). In Step 3, code will turn those into eyebrow labels instead of inline italics.

**Preview vs refresh in this exercise**

- **DA.live content** (headings, blocks, editing table cells): after each change, click **Preview** in the Sidekick and check `http://localhost:3000/drafts/<your-name>/cards-test`.
- **`blocks/cards/` code** (`cards.js`, `cards.css`): save in your editor, then **refresh the browser** on that same URL so localhost loads the updated block files.

  ![Cards Block and Variants in DA.live](images/cards-block-1.gif)

DA.live auto-saves. **Preview** now, then continue to Step 2.

---

## Step 2: Test the page (Cards w/Images + eyebrow sample)

**Open** (or **Preview** from DA.live): `http://localhost:3000/drafts/<your-name>/cards-test`

**Test on desktop and mobile**: Use Chrome DevTools responsive view — open DevTools (F12 or Cmd+Option+I), toggle the device toolbar (Cmd+Shift+M / Ctrl+Shift+M) to switch to responsive mode, then resize the viewport or pick a device preset to verify layout at different widths. Use this for all test steps in this exercise.

**You should see**:
- A **Cards w/Images** block — cards in a responsive grid
- Under **Cards with Eyebrow**: italic snippets such as *performance* and *Authoring made easy as 1, 2, 3* still showing **inline** in the card body (not as a separate eyebrow label yet)

  ![Cards Block and Variants in DA.live](images/cards-block-2.gif)

**Why?** The eyebrow enhancement isn’t implemented yet. We’ll add it in the next step. After later **code** edits, **refresh** the browser to pick up `cards.js` / `cards.css`; after **DA.live** edits, use **Preview** again.

---

## Step 3: Implement Eyebrow Enhancement

The eyebrow adds a label above card content. Authors simply **italicize** the label text in the card body, and the block automatically detects and extracts it as the eyebrow. No variation class needed — this is a smart default behavior.

**Author structure** (each row = one card, 2 columns):
- Column 1: Image
- Column 2: Body text — italicize the eyebrow label (e.g., *Speaker*)

**How it works**: In DA.live, italic text becomes `<em>` in HTML. The block finds `<em>` in each card's body, extracts it, and renders it as an eyebrow label. If there's no `<em>`, nothing changes — the card renders normally.

### Update JavaScript

**File**: `blocks/cards/cards.js`

Leave the **`import`** line at the top of the file unchanged. Replace only the whole **`export default function decorate(block) { ... }`** (from `export default` through the closing `}` of that function) with:

```javascript
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });

    // Detect italic text in body and extract as eyebrow label
    const body = li.querySelector('.cards-card-body');
    const em = body?.querySelector('em');
    if (em) {
      const eyebrow = document.createElement('div');
      eyebrow.className = 'cards-card-eyebrow';
      eyebrow.textContent = em.textContent;
      const p = em.closest('p');
      if (p) p.remove();
      else em.remove();
      body.prepend(eyebrow);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    );
  });
  block.replaceChildren(ul);
}
```

**What changed**:
- After classifying divs, looks for `<em>` in each card's body
- If found, extracts the italic text as the eyebrow label
- Removes the `<p>` containing the `<em>` from the body
- Prepends an eyebrow div at the top of the card body
- No variation class needed — works automatically on any Cards block
- Cards without italic text are unaffected

### Add Eyebrow Styles

**File**: `blocks/cards/cards.css`

Add at the end of the file:

```css
.cards .cards-card-eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  color: var(--brand-1);
}
```

**Key points**:
- `.cards .cards-card-eyebrow` — scoped to the block, no variation class needed
- All selectors start with `.cards` (proper scoping)

**Save** `cards.js` and `cards.css`, then **refresh** the browser on your **`cards-test`** URL before Step 4.

---

## Step 4: Test Eyebrow Enhancement

**Refresh** the browser on: `http://localhost:3000/drafts/<your-name>/cards-test` (code changed in Step 3).

**You should see**:
- Under **Cards with Eyebrow**, each card shows an uppercase label (e.g. **PERFORMANCE**, **AUTHORING MADE EASY AS 1, 2, 3**, or similar) at the top of the body — styled smaller, brand color
- The italic sample text is no longer inline — it’s been extracted into the eyebrow
- The **Cards With Images** block is unchanged (no italic labels there = no eyebrow behavior)

  ![Cards Block and Variants in DA.live](images/cards-block-3.png)
---

## Step 5: Implement List Variation

The list variation displays cards in a single column with centered text. Authors opt in by writing **`Cards (List)`** in the block’s **table header row** (the first row of the block table).

**There is no separate “Cards (List)” snippet to insert from the library in this flow.** In DA.live, open **`cards-test`** and edit the **first** **Cards w/Images** block you added in Step 1: in the header row, change the block name so it includes the list variation — e.g. **`Cards (List)`** or, if the header still reflects the template name, add **`(List)`** in parentheses on that same heading row so EDS adds the `list` class (same pattern as `| Cards (List) |` in the source table).

**Preview** after editing the header so localhost shows the new layout before Step 6.

  ![Cards Block and Variants in DA.live](images/cards-block-4.png)

### Add List Styles

**File**: `blocks/cards/cards.css`

Add at the end of the file:

```css
/* List layout — used by Cards (List) variant and View Switcher toggle */
.cards.list > ul {
  grid-template-columns: 1fr;
}

.cards.list .cards-card-body {
  text-align: center;
}
```

**What this does**:
- Forces single column layout (overrides default grid)
- Centers body text
- Images stay full-width (inherited from base styles)

**No JavaScript needed** - this variation is CSS-only!

**Save** `cards.css` and **refresh** the browser on **`cards-test`** so the list rules apply. (You already **Preview**’d after editing the block header in DA.live.)

---

## Step 6: Test List Variation

**Refresh** the browser on: `http://localhost:3000/drafts/<your-name>/cards-test` (you added **list** CSS in Step 5).

**You should see**:
- The **Cards With Images** section (now **`Cards (List)`**) in a **single column**
- Cards full width with full-width images; body text **centered**
- **Cards with Eyebrow** unchanged by this CSS (still uses grid unless you also add `(List)` there — don’t, for this step)

![Cards Block and Variants in DA.live](images/cards-block-5.png)
---

## Step 7: Implement View Switcher Variation

Now let's add a variation that combines **JavaScript and CSS**. The view switcher adds toggle buttons that let users switch between grid and list views on the fly.

**Add a new block (do not reuse the first Cards block)**: In DA.live, open **`cards-test`**. Add an **H2** (e.g. **View Switcher** or **Stacked cards**). **Sidekick** → **Library** → **Blocks** → **Cards** → insert **Stacked cards with view switcher** (name in the library may vary slightly). That adds a **new** Cards block on the page — **not** the **Cards w/Images** / **Cards (List)** block from Step 1 and **not** your **Cards with Eyebrow** block. The inserted table’s header row should look like **`Cards (List, View Switcher)`** (or equivalent), so the block already has both the **list** and **view-switcher** variation classes. **Preview** before Step 8.

  ![Cards Block and Variants in DA.live](images/cards-block-6.png)

**This is different from Step 5 list-only**: Step 5 edits the **first** block to a fixed **Cards (List)** layout. Here, the **stacked / view-switcher** block lets the **end user** toggle grid vs list with buttons.

### Update JavaScript

**File**: `blocks/cards/cards.js`

Add this code at the end of the `decorate` function, **after** `block.replaceChildren(ul)`:

```javascript
  if (block.classList.contains('view-switcher')) {
    const toolbar = document.createElement('div');
    toolbar.className = 'cards-toolbar';

    const isList = block.classList.contains('list');

    const gridBtn = document.createElement('button');
    gridBtn.textContent = 'Grid';
    gridBtn.className = `cards-toolbar-btn${isList ? '' : ' active'}`;

    const listBtn = document.createElement('button');
    listBtn.textContent = 'List';
    listBtn.className = `cards-toolbar-btn${isList ? ' active' : ''}`;

    gridBtn.addEventListener('click', () => {
      block.classList.remove('list');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    });

    listBtn.addEventListener('click', () => {
      block.classList.add('list');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    });

    toolbar.append(gridBtn, listBtn);
    block.prepend(toolbar);
  }
```

**What this does**:
- Checks for the `view-switcher` variation class
- Detects whether `list` is already on the block (e.g. `Cards (List, View Switcher)`) and highlights the correct default button
- Grid button removes the `list` class → grid layout
- List button adds the `list` class → single column layout (same CSS as `Cards (List)`)
- Active button is highlighted

### Add View Switcher Styles

**File**: `blocks/cards/cards.css`

Add the toolbar styles at the end of the file:

```css
/* View switcher toolbar — hidden on narrow viewports, shown from 600px up */
.cards.view-switcher .cards-toolbar {
  display: none;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 1rem;
}

@media (width >= 600px) {
  .cards.view-switcher .cards-toolbar {
    display: flex;
  }
}

.cards.view-switcher .cards-toolbar-btn {
  background: transparent;
  border: 1px solid rgb(255 255 255 / 20%);
  color: var(--muted);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease, color 0.2s ease;
}

.cards.view-switcher .cards-toolbar-btn:hover {
  border-color: rgb(255 255 255 / 40%);
}

.cards.view-switcher .cards-toolbar-btn.active {
  background: var(--brand-1);
  color: white;
  border-color: var(--brand-1);
}
```

**Key insight**: The view switcher toggles the `list` class — the same class used by `Cards (List)`. No duplicate layout CSS needed. When the user clicks "List", the `.cards.list` styles from Step 5 kick in automatically.

**Save** `cards.js` and `cards.css`, then **refresh** the browser before Step 8.

---

## Step 8: Test View Switcher Variation

**Refresh** the browser on: `http://localhost:3000/drafts/<your-name>/cards-test` (code changed in Step 7).

**Note**: The Grid/List toolbar is hidden on narrow viewports and appears at 600px width and up. Use Chrome DevTools responsive view at ≥600px to see and use the buttons.

**You should see** (on the **Stacked cards with view switcher** / **`Cards (List, View Switcher)`** block):
- A toolbar with **Grid** and **List** buttons (top right) at desktop/tablet width
- **List** is the correct default highlight if the block was inserted with **`Cards (List, View Switcher)`** — try **Grid** to switch to the multi-column layout, then **List** again for single column + centered text
- Toggling updates only **this** block; your **Cards w/Images** / **Cards (List)** and **Cards with Eyebrow** sections stay as you left them

![Cards Block and Variants in DA.live](images/cards-block-7.png)

---

## Step 9: Commit Your Changes

```bash
# Run linting
npm run lint

# Add changes
git add blocks/cards/

# Commit
git commit -m "feat: add eyebrow enhancement, list and view-switcher variations to cards block"

# Push
git push origin jsmith
```

Replace `jsmith` with your branch name.

---

<details>
<summary><strong>After the steps</strong> (please read — CSS patterns, examples, and takeaways)</summary>

## Understanding CSS Scoping

**Critical rule**: All block styles must be scoped to the block.

**Bad (global selector)**:
```css
.card-title {
  font-size: 20px;
}
```

**Why bad?** Could conflict with other blocks using `.card-title`.

**Good (scoped to block)**:
```css
.cards .card-title {
  font-size: 20px;
}
```

**Better (scoped to variation, when applicable)**:
```css
.cards.list .card-title {
  font-size: 20px;
}
```

**Reserved classes**: Avoid `.cards-container` and `.cards-wrapper` - these are used by section decoration.

---

## Mobile-First CSS

The cards block uses responsive design without media queries:

```css
grid-template-columns: repeat(auto-fill, minmax(257px, 1fr));
```

**How it works**:
- `auto-fill`: Creates as many columns as fit
- `minmax(257px, 1fr)`: Each column is minimum 257px wide
- Result: Automatically responsive!

**When to use media queries**: Only when you need different layouts at specific breakpoints.

```css
/* Mobile first - default */
.cards > ul {
  gap: 16px;
}

/* Tablet and up */
@media (min-width: 600px) {
  .cards > ul {
    gap: 24px;
  }
}
```

**Standard breakpoints**: 600px (tablet), 900px (small desktop), 1200px (large desktop)

---

## Real-World Applications

**Use Case 1: Event Speakers** (enhancement)
- Author italicizes "Speaker" in card body → eyebrow label appears automatically
- Displays speaker bio with consistent labeling, no special configuration

**Use Case 2: Sponsor Logos** (variation)
- Use list variation for a single-column sponsor list
- Clean, full-width layout

**Use Case 3: Product Catalog** (variation with interactivity)
- Use view-switcher variation so users can toggle between grid and list views
- Combine with eyebrow enhancement for category labels

---

## Key Takeaways

- **Enhancements** detect content patterns (like `<em>`) and render them specially — no variant class needed
- **Variations** use CSS classes (added by authors in parentheses) for different layouts
- Variations can be CSS-only (list) or require JavaScript (view-switcher)
- JavaScript decorates HTML structure, CSS styles it
- Always scope CSS to the block (`.blockname .selector`)
- Reuse CSS classes across variations — view-switcher toggles the same `list` class
- Enhancements and variations can be combined — they're independent features

</details>

---

## Verification Checklist

- [ ] Created **`cards-test`** with **Cards w/Images** → **Cards with Eyebrow**; **Cards (List)** on the **first** block only; **separate** **Stacked cards with view switcher** block (**`Cards (List, View Switcher)`**)
- [ ] Implemented eyebrow enhancement (JavaScript + CSS) — works on any Cards block
- [ ] Implemented list variation (CSS only) — requires `Cards (List)` class
- [ ] Implemented view-switcher variation (JavaScript + CSS) — works on the stacked block with **`view-switcher`** (and **`list`**) classes, e.g. **`Cards (List, View Switcher)`**
- [ ] View-switcher toggles between grid and list views using the same `list` class
- [ ] Tested in Chrome DevTools responsive view (desktop and mobile)
- [ ] Understand the difference between enhancements and variations
- [ ] Understand how to reuse CSS classes across variations
- [ ] Committed and pushed changes

---

## References

- [Exploring Blocks](https://www.aem.live/docs/exploring-blocks)
- [Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
- [Component Model Definitions](https://www.aem.live/developer/component-model-definitions)

---

## Solution

The complete solution for this exercise is available on the [answers branch](https://github.com/edsmasterclass/labs/tree/answers). The same branch contains solutions for all lab exercises.

---

## Next Exercise

**Exercise 3**: Dynamic Cards - You'll build a block that fetches data from external sources (Sheets and Workers), learning how to integrate dynamic data into EDS blocks.
