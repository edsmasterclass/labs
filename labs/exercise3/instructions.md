# Exercise 3: Dynamic Cards with Data Sources

**Duration**: 25 minutes

---

<details>
<summary><strong>Quick navigation</strong></summary>

- [Prerequisites](#prerequisites)
- **Background** (please read — expand below, or jump: [The Speakers Page](#the-speakers-page) · [What you'll learn](#what-youll-learn) · [Why this matters](#why-this-matters) · [How it works](#how-it-works) · [Understanding Sheets as JSON](#understanding-sheets-as-json))
- **Exercise steps**
  - [Step 1: Copy Speakers Data](#step-1-copy-speakers-data-to-your-workspace)
  - [Step 2: Add Your Personal Data](#step-2-add-your-personal-data)
  - [Step 3: Create Block Files](#step-3-create-block-files)
  - [Step 4: Implement JavaScript](#step-4-implement-javascript)
  - [Step 5: Implement Styles](#step-5-implement-styles)
  - [Step 6: Create Test Page](#step-6-create-test-page)
  - [Step 7: Test Locally](#step-7-test-locally)
  - [Step 8 (Optional): Test Error Handling](#step-8-optional-test-error-handling)
  - [Step 9: Commit Your Changes](#step-9-commit-your-changes)
  - [Step 10: Before You Move On (for Exercise 4)](#step-10-before-you-move-on-for-exercise-4)
- **After the steps** (please read — expand below, or jump: [Performance considerations](#performance-considerations) · [Real-world applications](#real-world-applications) · [Key takeaways](#key-takeaways))
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
- Exercises 1–2 completed (if doing in sequence)

---

<details>
<summary><strong>Background</strong> (please read — context and concepts before the hands-on steps)</summary>

## The Speakers Page

If you've been exploring the site, you may have noticed the **Speakers** link in the navigation leads to a placeholder page at http://localhost:3000/speakers

That page currently says "Coming Soon: Dynamic Speaker Profiles" and mentions this exercise!

The speaker data lives in a **Sheet** at the project root; **Preview** turns it into **`/speakers.json`** (same JSON shape as in this lab, typically several Adobe experts on the shared sheet). In this exercise, you'll build the **dynamic-cards** block that will eventually power that page.

**You'll work in your own drafts folder** to avoid conflicts with other participants, but the block you build is production-ready and reusable.

---

## What You'll Learn

- How to fetch data from external sources in blocks
- How **Preview** turns a Sheet into **JSON** your block can fetch
- How to handle async operations and errors in blocks

---

## Why This Matters

In Exercise 2, you built blocks where authors manually create each card. But what if you need to display:
- 100+ speaker profiles from a database
- Product catalog with pricing that updates daily
- Event listings from an external API

**Manual authoring doesn't scale**. Dynamic blocks solve this by fetching data from external sources.

**The pattern**:
- Content lives in structured data (Sheet, API)
- Block fetches and renders that data
- Update the data once → all pages update automatically

**Real-world scenario**: The NYC Masterclass has a `/speakers` page that currently shows placeholder text. You saw it in the navigation. The speaker data is maintained as a Sheet and exposed as **`/speakers.json`**. Rather than manually authoring cards for each speaker, you'll build a dynamic-cards block that fetches and renders this data automatically.

**What you'll build**: A reusable dynamic-cards block that can fetch speaker data, product catalogs, article listings, or any JSON endpoint and render it as cards.

**Different rhythm from Exercise 2**: In Ex2 you built test content first and committed at the end. Here you implement the **dynamic-cards** block (Steps 3–5), author a **test page** with a manually inserted block (Step 6), verify locally (Step 7), optionally exercise error handling (Step 8), **commit** (Step 9), then copy your Exercise 1 page from drafts to **`/labs/`** or **`/sessions/`** and **publish** (Step 10) so search can find it in Exercise 4.

---

## How It Works

```
1. Events team maintains speakers in a Google Sheet
2. Preview turns the Sheet into JSON (delivered at a `.json` URL)
3. Dynamic Cards block fetches the JSON
4. Block renders cards from data
5. When the sheet updates, all pages show new data
```

In this exercise you'll edit a **Sheet** in DA; **Preview** delivers the same data as **JSON**. The block doesn't care where the JSON comes from. Any URL that returns the same JSON shape will work, whether it's a Cloudflare Worker, a third-party API, or a custom backend. Swap the URL and everything else stays the same.

**Reference**: [Integrations](https://www.aem.live/developer/integrations)

---

## Understanding Sheets as JSON

You work in a **Sheet**. **Preview** turns that sheet into **JSON**, available at a URL like **`…/speakers.json`**.

**Sheet structure**:
```
| Name      | Title              | Company | Bio                    | Image          |
|-----------|--------------------|---------|-----------------------|----------------|
| John Doe  | Senior Developer   | Adobe   | Expert in EDS         | image-url      |
| Jane Smith| Product Manager    | Adobe   | Leading AEM innovation| image-url      |
```

**JSON endpoint**:
```
https://main--labs--edsmasterclass.aem.page/path/to/sheet.json
```

**JSON structure**:
```json
{
  "total": 2,
  "offset": 0,
  "limit": 2,
  "data": [
    {
      "Name": "John Doe",
      "Title": "Senior Developer",
      "Company": "Adobe",
      "Bio": "Expert in EDS",
      "Image": "image-url"
    }
  ]
}
```

**Key insight**: Column names become JSON keys, rows become objects in `data` array.

</details>

---

## Step 1: Copy Speakers Data to Your Workspace

To avoid conflicts with other participants, you'll create your own personal copy of the **speakers** sheet.

**How it works**: **`speakers`** is a **Sheet**. You edit the sheet; **Preview** turns it into JSON and delivers it at **`/drafts/<your-name>/speakers.json`** (for your copy under drafts). Copy the sheet into **`/drafts/<your-name>/`** so **your** rows are what that JSON shows after **Save** and **Preview**.

**In DA.live**:

1. Go to the **labs** project root.
2. Select the **`speakers`** sheet.
3. Use **Copy** from the **pink action bar** at the **bottom** of the screen.
4. Open the project's **drafts** folder: [da.live/#/edsmasterclass/labs/drafts](https://da.live/#/edsmasterclass/labs/drafts).
5. Open your personal subfolder **`<your-name>`** (first initial + last name, lowercase). Create the folder if it does not exist yet — same pattern as [Exercise 1](../exercise1/instructions.md).
6. **Paste** from the same **pink action bar** at the bottom. That places the **speakers** sheet under **`/drafts/<your-name>/`**.
7. **Open** the pasted sheet and click **Preview** so **`/drafts/<your-name>/speakers.json`** is available (replace **`<your-name>`** with your folder).

  ![Copy & Paste Speakers Sheet](images/exercise_3_1.gif)

**Verify**: Open **`http://localhost:3000/drafts/<your-name>/speakers.json`** (dev server running) or the matching **`.aem.page`** URL — you should see JSON with a `data` array.

---

## Step 2: Add Your Personal Data

Make this exercise meaningful by adding yourself as a speaker!

**In DA.live**, open **`/drafts/<your-name>/speakers`** (the **sheet** you pasted in Step 1 — same **`<your-name>`** folder).

**Add a new row** with your information:
- **Name**: Your full name (e.g., "John Smith")
- **Title**: Your job title (e.g., "Senior Developer")  
- **Company**: Your company name (e.g., "Acme Corp")
- **Bio**: Write 2-3 sentences about yourself and your experience
- **Image**: Use `https://i.pravatar.cc/400?img=X` (replace X with a number 1-70 for different avatars)
- **Session**: Leave blank or add "Participant"
- **LinkedIn**: Your LinkedIn URL (optional)

**Optional**: Add another row for a teammate sitting near you.

**Save and Preview** — After you add or change rows, **click Save**, then **Preview** so **`.../speakers.json`** has the new data.

**Verify the sheet JSON** (same data, two ways to open it):

1. **Local dev (quick check)** — Open  
   `http://localhost:3000/drafts/<your-name>/speakers.json`  
   You should see JSON with a `data` array that includes your new row(s) (plus the rows that were already on the copied sheet).

2. **Preview host (optional check)** — The same JSON is also served on preview, for example:

   `https://main--labs--edsmasterclass.aem.page/drafts/<your-name>/speakers.json`

   Replace **`<your-name>`** with your drafts folder (first initial + last name, lowercase), matching Steps 1–2.

   The site’s shared speakers JSON lives at [https://main--labs--edsmasterclass.aem.page/speakers.json](https://main--labs--edsmasterclass.aem.page/speakers.json). Yours is under **`/drafts/<your-name>/speakers.json`**.

---

## Step 3: Create Block Files

In your code editor, create a folder **`dynamic-cards`** under **`blocks/`**, then add the two files below. You should end up with this structure:

```
blocks/
  dynamic-cards/
    dynamic-cards.js
    dynamic-cards.css
```

The block **name** in authoring (Step 6) must match this folder: **`Dynamic Cards`** in the block table header maps to **`dynamic-cards`** on disk.

---

## Step 4: Implement JavaScript

**File**: `blocks/dynamic-cards/dynamic-cards.js`

Copy this code:

```javascript
/**
 * Fetches speaker data and renders cards dynamically
 *
 * Author provides (in block):
 * - Row 1: Data source URL (sheet.json endpoint)
 */
export default async function decorate(block) {
  // Extract data source URL from block content
  const dataSource = block.querySelector('a')?.href;

  if (!dataSource) {
    block.textContent = 'Error: No data source specified';
    return;
  }

  // Show loading state
  block.innerHTML = '<p class="loading">Loading speakers...</p>';

  try {
    // Fetch data from sheet JSON endpoint
    const response = await fetch(dataSource);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const speakers = json.data;

    // Clear loading message
    block.innerHTML = '';

    if (!speakers || speakers.length === 0) {
      block.innerHTML = '<p>No speakers found.</p>';
      return;
    }

    // Create cards container
    const ul = document.createElement('ul');
    ul.className = 'dynamic-cards-list';

    // Generate card for each speaker
    speakers.forEach((speaker) => {
      const li = document.createElement('li');
      li.className = 'dynamic-card';

      li.innerHTML = `
        <div class="dynamic-card-image">
          <img src="${speaker.Image}" alt="${speaker.Name}" loading="lazy">
        </div>
        <div class="dynamic-card-body">
          <h3>${speaker.Name}</h3>
          <p class="dynamic-card-title">${speaker.Title}</p>
          <p class="dynamic-card-company">${speaker.Company}</p>
          <p class="dynamic-card-bio">${speaker.Bio}</p>
        </div>
      `;

      ul.append(li);
    });

    block.append(ul);
  } catch (error) {
    block.innerHTML = `<p class="error">Error loading speakers: ${error.message}</p>`;
    console.error('Dynamic Cards error:', error);
  }
}
```

**What this does**:
1. The block's entrypoint is the default-exported `decorate(block)` function — same as any block; the runtime calls it with the block root element.
2. Extracts data source URL from block content (line 9)
3. Shows loading state while fetching (line 16)
4. Fetches JSON from endpoint (line 20-21)
5. Handles errors gracefully (line 58-61)
6. Generates card HTML for each speaker (line 40-54)
7. Uses `loading="lazy"` for images (line 46)

**Error handling**: If fetch fails, shows user-friendly message and logs to console.

---

## Step 5: Implement Styles

**File**: `blocks/dynamic-cards/dynamic-cards.css`

Copy this code:

```css
.dynamic-cards-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.dynamic-card {
  background-color: var(--card);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: var(--shadow);
  border: 1px solid rgb(255 255 255 / 5%);
}

.dynamic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgb(0 0 0 / 60%);
  border-color: rgb(255 255 255 / 10%);
}

.dynamic-card-image img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

.dynamic-card-body {
  padding: 1.5rem;
}

.dynamic-card-body h3 {
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.dynamic-card-title {
  font-weight: 600;
  color: var(--brand-1);
  margin: 4px 0;
}

.dynamic-card-company {
  font-size: 14px;
  color: var(--muted);
  margin: 4px 0;
}

.dynamic-card-bio {
  font-size: 14px;
  line-height: 1.6;
  color: var(--muted);
  margin-top: 12px;
}

.dynamic-cards .loading,
.dynamic-cards .error {
  padding: 40px 20px;
  text-align: center;
  color: var(--muted);
}

.dynamic-cards .error {
  color: #d93025;
  background: rgb(217 48 37 / 10%);
  border-radius: 8px;
}

@media (width >= 600px) {
  .dynamic-cards-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (width >= 900px) {
  .dynamic-cards-list {
    grid-template-columns: repeat(3, 1fr);
  }

  .dynamic-card-body {
    padding: 2rem;
  }
}
```

**Key points**:
- Matches the dark theme used by the Cards block (uses `var(--card)`, `var(--shadow)`, `var(--brand-1)`, `var(--muted)`)
- Same hover effect (lift + glow) as Cards block
- Responsive grid with breakpoints at 600px and 900px
- All selectors scoped to `.dynamic-card*`
- Loading and error states styled

---

## Step 6: Create Test Page

**In DA.live**, create a page at **`/drafts/<your-name>/speakers-test`** (same **`<your-name>`** folder as in Steps 1–2).

1. Open the project’s **drafts** folder: [da.live/#/edsmasterclass/labs/drafts](https://da.live/#/edsmasterclass/labs/drafts)
2. Open your personal subfolder **`<your-name>`** (first initial + last name, lowercase).
3. **New** → **Document**, name it **`speakers-test`**.
4. Add a **level-1 heading**: **Dynamic Speaker Directory**.
5. Under it, add a short paragraph that explains the page loads speaker data from JSON (write it in your own words, or use something like: this page demonstrates fetching speaker data dynamically from JSON).

**Author the block manually (not from the Block library yet)**  
This block is **new** in your branch, so it is **not** in DA’s Block library until you register it later. **Test it first** by inserting a block table yourself:

1. In the **DA Sidekick**, click **Block**. That inserts a table: first row header **Columns**, second row with **two** cells.
2. Change the **first-row header** text from **Columns** to **`Dynamic Cards`** (must match the **`dynamic-cards`** folder name).
3. Select the **second row**, **both** cells.
4. The Sidekick label **Block** should change to **Edit Block**. Click **Edit Block**, then choose **Merge cells** (it is near the bottom of the menu — about the second option from the bottom). That merges the two cells into one.
5. In the merged cell, type **`/drafts/<your-name>/speakers.json`** (replace **`<your-name>`** with your drafts folder). **Select that text** and use the **link** icon in the toolbar to turn it into a **real hyperlink** (the block code reads `block.querySelector('a')?.href`).
6. **Save**, then **Preview** the page on localhost.

**You should see** the rows from your sheet rendered as speaker cards (everyone’s row count differs depending on what was on the copied sheet and what you added).

![Dynamic Cards Example](images/exercise-3-2.png)

---

## Step 7: Test Locally

**Open**: `http://localhost:3000/drafts/<your-name>/speakers-test`

**Test on desktop and mobile**: Use Chrome DevTools responsive view — open DevTools (F12 or Cmd+Option+I), toggle the device toolbar (Cmd+Shift+M / Ctrl+Shift+M) to switch to responsive mode, then resize the viewport or pick a device preset to verify layout at different widths. Use this for all test steps in this exercise.

**You should see**:
- "Loading speakers..." message briefly
- Speaker cards for every row in your JSON (shared sheet rows + your entries)
- Responsive grid layout
- Hover effect on cards
- Your speaker card in the grid

**Verify your data**:
- Find your speaker card in the grid
- Verify your name, title, company, and bio display correctly
- Check that your avatar image loads

    ![Dynamic Cards Example](images/exercise-3-3.png) 

**Test the data flow**:
1. Keep the page open at `http://localhost:3000/drafts/<your-name>/speakers-test`
2. Go to DA.live and open **`/drafts/<your-name>/speakers`**
3. Edit **your** speaker row — change your bio or title
4. **Save** the sheet, then **Preview** so **`.../speakers.json`** has the new data
5. **Refresh** your local preview of **`speakers-test`** — your changes should appear

**Success criteria**: The **dynamic-cards** block fetches JSON and renders all speakers including your entry.

---

## Step 8 (Optional): Test Error Handling

Skip this section if you are short on time — it is optional for the lab flow.

Quick checks on your **`/drafts/<your-name>/speakers-test`** page in DA.live — same **Dynamic Cards** block as Step 6; you’re only changing the data link (or removing it), then refreshing localhost.

1. **Bad URL** — Point the block’s JSON link at something that will fail (for example `https://invalid-url.com/data.json`). **Save**, refresh the local preview. You should see an **error** message (your block styles it, e.g. red background) instead of cards.
2. **No URL** — Remove the data link so the block has no `href`. **Save**, refresh. You should see **Error: No data source specified** (from your `decorate` logic).
3. **Restore** — Set the link back to **`/drafts/<your-name>/speakers.json`** (as a hyperlink), **Save**, **Preview** the sheet if needed, then refresh **`speakers-test`**; speaker cards should return.

![Dynamic Cards Error Handling Example](images/exercise-3-4.png)

In production, fetches fail, URLs rot, and payloads break — the block should always give clear feedback instead of a blank screen.

---

## Step 9: Commit Your Changes

After you have verified the block on your test page (Steps 6–7), commit the block code so it is in version control.

```bash
# Run linting
npm run lint

# Add changes
git add blocks/dynamic-cards/

# Commit
git commit -m "feat: add dynamic-cards block"

# Push
git push origin jsmith
```

Replace `jsmith` with your branch name.

---

## Step 10: Before You Move On (for Exercise 4)

**Do this now — it takes a few minutes and unlocks Exercise 4.**

Exercise 4 has you search for your own page. The search index only includes **`/sessions/**`** and **`/labs/**`** — not **`/drafts/**`**. Copy your **Exercise 1** page out of drafts so it lives under the right tree, then **publish** it so it can be indexed.

Use the same **`<your-name>`** folder as in Steps 1–2 (first initial + last name, lowercase).

1. In DA.live, open **`/drafts/<your-name>/`** and select your Exercise 1 page (the **lab** or **session** page you created in Ex1 — e.g. `my-lab` or `my-session`).
2. Use **Copy** from the **pink action bar** at the bottom (same pattern as Step 1).
3. Navigate to the destination that matches your page type:
   - **Lab page** → open **`/labs/`**, go into **`/labs/<your-name>/`** (create the folder with **New → Folder** if needed), then **Paste** from the pink bar.
   - **Session page** → open **`/sessions/`**, go into **`/sessions/<your-name>/`** (create the folder if needed), then **Paste** from the pink bar.
4. **Open** the pasted page → **Preview** → **Publish**.

The index updates in the background — by the time you reach Ex4, your page should be findable under **`/labs/`** or **`/sessions/`** as appropriate.

---

<details>
<summary><strong>After the steps</strong> (please read — performance, examples, and takeaways)</summary>

## Performance Considerations

**Loading states**: Always show feedback during async operations
```javascript
block.innerHTML = '<p class="loading">Loading...</p>';
```

**Error handling**: Network requests can fail
```javascript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error();
} catch (error) {
  // Show error to user
}
```

**Lazy loading images**: Use `loading="lazy"` for images below fold
```html
<img loading="lazy" src="...">
```

**Image optimization**: For production, consider rendering images from JSON with [createOptimizedPicture()](../../scripts/aem.js) from `aem.js` to get responsive srcset and format optimization. The exercise uses plain `<img>` for simplicity.

**When to use dynamic blocks**:
- Large datasets (50+ items)
- Frequently updated content
- Shared across multiple pages
- Data from external systems

**When NOT to use**:
- Small, static content (use regular blocks)
- Above-the-fold content (impacts LCP)
- Rarely changing content

---

## Real-World Applications

**Use Case 1: Featured Articles from Query Index**
- Fetch from query-index.json (all published pages)
- Filter by tags (e.g., "featured") or recent publish date
- Display 3 most recent articles tagged "featured"
- Same dynamic-cards block, different data source

**Example**:
```
| Dynamic Cards |
|---------------|
| https://main--yoursite--owner.aem.live/query-index.json?tags=featured&limit=3 |
```

Note: In Exercise 4, you'll learn how query-index.json works and build a dedicated block for it.

**Use Case 2: E-commerce Product Catalog**
- Product data maintained in a Sheet
- Block fetches and renders product cards with pricing
- Update the sheet → all catalog pages update automatically

**Use Case 3: News/Blog Feeds**
- Articles indexed via query-index.json
- Block fetches and displays recent articles
- Filter by topic or tag using query parameters

---

## Key Takeaways

- **Preview** turns a Sheet into **JSON** at a matching **`.json`** URL
- Dynamic blocks fetch data instead of decorating authored content
- The same block works with any JSON endpoint
- Always handle loading states and errors
- Same JSON structure as Sheets - reusable patterns
- Performance: consider placement (below fold preferred)

</details>

---

## Verification Checklist

- [ ] Copied the **speakers** sheet to **`/drafts/<your-name>/`**, opened it, and **Preview**d so **`/drafts/<your-name>/speakers.json`** returns JSON on localhost / preview
- [ ] Added 1–2 personal speaker rows and used **Save** + **Preview** on the sheet so **`.../speakers.json`** has the new data (Step 2)
- [ ] Verified the JSON URL on localhost (`http://localhost:3000/drafts/<your-name>/speakers.json`) after edits
- [ ] Created **`blocks/dynamic-cards/`** with **`dynamic-cards.js`** and **`dynamic-cards.css`**
- [ ] Created **`speakers-test`** with a **manually** inserted **Dynamic Cards** block (merged cell + hyperlink to **`/drafts/<your-name>/speakers.json`**) (Step 6)
- [ ] Block displays speaker cards for all rows in your JSON
- [ ] Tested editing sheet data — **Save**, **Preview** sheet, then refresh test page — changes reflected
- [ ] (Optional) Tested error handling — bad URL, no URL, restore (Step 8)
- [ ] Tested in Chrome DevTools responsive view (desktop and mobile)
- [ ] Understand the sheet-to-JSON data flow
- [ ] Committed and pushed block code (Step 9)
- [ ] Completed Step 10 — copied Exercise 1 page from drafts to **`/labs/<your-name>/`** or **`/sessions/<your-name>/`**, then **Preview**d and **Publish**d for Ex4 search

---

## References

- [Integrations](https://www.aem.live/developer/integrations)
- [DA.live Sheets](https://docs.da.live/administrators/guides/sheets)
- [DA.live API](https://docs.da.live/developers/api)

---

## Solution

The complete solution for this exercise is available on the [answers branch](https://github.com/edsmasterclass/labs/tree/answers). The same branch contains solutions for all lab exercises.

---

## Next Exercise

**Exercise 4**: Extend Search Block from Block Collection — You'll configure and test a Search block that fetches `query-index.json` and renders results using the Cards block. You'll learn how EDS indexes published content, how block composition works, and find your own published page under **`/labs/<your-name>/`** or **`/sessions/<your-name>/`** via live search.
