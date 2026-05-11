# Exercise 8: DA.live Plugin Development

**Duration**: 30 minutes

---

<details>
<summary><strong>Quick navigation</strong></summary>

- [Prerequisites](#prerequisites)
- **Background** (please read — expand below, or jump: [What you'll learn](#what-youll-learn) · [Why this matters](#why-this-matters) · [Pattern showcase](#pattern-showcase-third-party-embed-conversion) · [How DA.live plugins work](#how-dalive-plugins-work) · [Understanding the DA App SDK](#understanding-the-da-app-sdk) · [Plugin architecture](#plugin-architecture))
- **Exercise steps**
  - [Step 1: Create Plugin HTML](#step-1-create-plugin-html)
  - [Step 1.5: Create Plugin CSS](#step-15-create-plugin-css)
  - [Step 2: Create Plugin JavaScript](#step-2-create-plugin-javascript)
  - [Step 2.5: Create TradingView Block Decorator](#step-25-create-tradingview-block-decorator)
  - [Step 3: Commit Plugin Files](#step-3-commit-plugin-files)
  - [Step 4: Test Plugin Locally First](#step-4-test-plugin-locally-first)
  - [Step 5: Access Plugin on Your Branch](#step-5-access-plugin-on-your-branch)
  - [Step 6: Preview the Page and Verify Widget Rendering](#step-6-preview-the-page-and-verify-widget-rendering)
  - [Step 7: Optional - Register Plugin in Library](#step-7-optional---register-plugin-in-library)
- **After the steps** (please read — [Troubleshooting](#troubleshooting-common-issues) · [Real-world plugin examples](#real-world-plugin-examples) · [Key takeaways](#key-takeaways))
- [Verification Checklist](#verification-checklist)
- [Optional Enhancements](#optional-enhancements)
- [References](#references)
- [Solution](#solution)
- [Congratulations!](#congratulations)

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
- Exercises 1–7 completed (if doing in sequence)
- DA.live access
- **Personal workspace**: `/drafts/jsmith/` (use your name, lowercase)

**Context:** You've been authoring in DA.live (Exercises 1–7); this exercise extends DA.live with custom plugins so authors can insert pre-formatted content from the library.

---

<details>
<summary><strong>Background</strong> (please read — concepts before the hands-on steps)</summary>

## What You'll Learn

- How DA.live plugins work as library integrations
- How to use the DA App SDK (context, token, actions)
- How to insert content into documents programmatically via DA SDK
- How to develop plugins locally and deploy to your branch
- How plugins are accessed through the library palette

---

## Why This Matters

DA.live library plugins extend the authoring experience with custom content insertion capabilities.

**The challenge**: Authors often copy/paste third-party embed codes (widgets, scripts, config JSON), but raw custom HTML in documents is an anti-pattern and hard to maintain.

**The solution**: Build a plugin that accepts supported embed snippets and converts them into structured block content.

**Plugins enable**:
- **Safe embed conversion** - Turn third-party snippets into block rows
- **Integration with external data sources** - Fetch from APIs, databases
- **Automated content generation** - Dynamic content based on rules
- **Streamlined authoring workflows** - Paste once, insert clean content
- **Consistency** - Same structure across all pages
- **Custom tooling** - Build exactly what your authors need

**The pattern**:
```
1. Developer builds plugin (HTML + JavaScript)
2. Plugin uses DA App SDK (context, token, actions)
3. Plugin is committed to Git repository
4. Authors access via library palette in DA.live
5. Plugin inserts content into document via SDK actions
```

**Real-world use cases**:
- **Widget embed converters** - Convert embed snippets into block config
- **Section libraries** - Pre-formatted hero sections, CTAs, footers
- **Product catalog** - Fetch products from PIM, insert as tables
- **Speaker directory** - Insert speaker bio from API
- **Asset browser** - Browse DAM, insert images with correct paths
- **Form builders** - Generate form markup from templates
- **Legal snippets** - Insert disclaimers, copyright notices

---

## Pattern Showcase: Third-Party Embed Conversion

This exercise demonstrates a practical DA pattern: let authors use familiar copy/paste embed workflows while still preventing raw custom HTML from entering the document.

**Workflow**:
1. Author copies a third-party widget embed snippet
2. Plugin parses and validates source + JSON config
3. Plugin converts values into structured block rows
4. DA inserts only block content (not raw embed markup)

**Sample widget source**:
- Company Profile example: `https://www.tradingview.com/widget-docs/widgets/symbol-details/company-profile/`
- TradingView widget catalog: `https://www.tradingview.com/widget-docs/widgets/`

---

## How DA.live Plugins Work

DA.live plugins are HTML + JavaScript applications hosted on your Edge Delivery site that communicate with DA.live via the DA App SDK.

**Architecture**:
```
┌─────────────────────────────────────────────────┐
│            DA.live Editor                       │
│                                                 │
│  ┌───────────────────┐  ┌──────────────────┐  │
│  │  Document Editor  │  │  Library Palette │  │
│  │                   │  │                  │  │
│  │  [Your Content]   │  │  [Plugin loads   │  │
│  │                   │  │   in iframe]     │  │
│  └────────┬──────────┘  └────────┬─────────┘  │
│           │                      │             │
│           │ PostMessage API      │             │
│           │ (via DA App SDK)     │             │
│           └──────────────────────┘             │
└─────────────────────────────────────────────────┘
                       │
                       │ Loads plugin from:
                       │ https://jsmith--labs--edsmasterclass.aem.page/
                       │         tools/plugins/embedwidget/embedwidget.html
                       ▼
           ┌───────────────────────────┐
           │   Your Plugin (iframe)    │
           │                           │
           │  • HTML + JavaScript      │
           │  • Uses DA App SDK        │
           │  • Sends content via SDK  │
           └───────────────────────────┘
```

**How it works**:
1. Plugin is an **HTML page** on your Edge Delivery site
2. Plugin loads in **iframe** within DA.live library palette
3. Plugin uses **DA App SDK** (imported from da.live)
4. SDK provides **PostMessage API** for secure communication
5. SDK gives you: **context** (document info), **token** (auth), **actions** (insert content)
6. Plugin calls `actions.sendText()` or `actions.sendHTML()` to insert content
7. DA.live receives message and inserts into document

**URL Structure**:
- **Your codebase**: `https://jsmith--labs--edsmasterclass.aem.page/tools/plugins/embedwidget/embedwidget.html`
- **DA.live Plugin URL**: `https://da.live/app/edsmasterclass/labs/tools/plugins/embedwidget/embedwidget?ref=jsmith`
- **Local development**: `https://da.live/app/edsmasterclass/labs/tools/plugins/embedwidget/embedwidget?ref=local`

**Key concept**: DA.live loads your plugin HTML from your AEM site into an iframe, then uses PostMessage for secure cross-origin communication.

**Reference**: [Developing Apps and Plugins](https://docs.da.live/developers/guides/developing-apps-and-plugins)

---

## Understanding the DA App SDK

The DA App SDK is the bridge between your plugin and DA.live. It provides three key objects:

### 1. **context** - Document Information

Information about the current document being edited:

```javascript
const { context } = await DA_SDK;

console.log(context.org);      // "edsmasterclass"
console.log(context.repo);     // "labs"
console.log(context.ref);      // "main" or branch name
console.log(context.path);     // "/drafts/jsmith/my-page"
```

**Use cases**:
- Branch-aware plugins (behave differently on main vs feature branches)
- Path-based logic (different templates for different paths)
- Org/repo-aware plugins (multi-tenant plugins)

### 2. **token** - Authentication Token

Authentication token for making authenticated API calls to DA.live Admin API:

```javascript
const { token } = await DA_SDK;

// Use for authenticated API calls
const response = await fetch('https://admin.da.live/source/org/repo/path', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. **actions** - Document Interaction Methods

Methods to insert content into the active document:

```javascript
const { actions } = await DA_SDK;

// Insert plain text (markdown)
await actions.sendText('# Heading\n\nParagraph text');

// Insert HTML
await actions.sendHTML('<div><h1>Heading</h1><p>Paragraph</p></div>');

// Close library palette
await actions.closeLibrary();
```

**Key insight**: You don't manipulate the document directly. You send content to DA.live, and DA.live inserts it.

**Why PostMessage?**: Your plugin runs in an iframe (different origin). PostMessage is the secure way to communicate across origins.

---

## Plugin Architecture

For this exercise, you'll build an **EmbedWidget plugin** with three files:

### Required Files:

1. **HTML file** (`embedwidget.html`)
   - Imports DA App SDK from `https://da.live/nx/utils/sdk.js`
   - Imports your plugin JavaScript
   - Defines UI (embed textarea + insert button)
   - Includes styles

2. **CSS file** (`embedwidget.css`)
   - Styles plugin layout and form controls
   - Keeps the authoring UI clear and readable

3. **JavaScript file** (`embedwidget.js`)
   - Imports DA App SDK
   - Waits for SDK initialization (`await DA_SDK`)
   - Parses and validates supported embed HTML
   - Handles clicks → sends structured block HTML → closes library

### Plugin Structure:

```
tools/
  plugins/
    embedwidget/
      embedwidget.html   ← Loaded by DA.live in iframe
      embedwidget.js     ← Your plugin logic
```

**URL accessed by authors**:
```
https://da.live/app/edsmasterclass/labs/tools/plugins/embedwidget/embedwidget?ref=jsmith
```

This loads your HTML from:
```
https://jsmith--labs--edsmasterclass.aem.page/tools/plugins/embedwidget/embedwidget.html
```

</details>

---

## Step 1: Create Plugin HTML

**File**: `tools/plugins/embedwidget/embedwidget.html`

**NOTE**: You can copy the `embedwidget` plugin from the [answers branch](https://github.com/edsmasterclass/labs/tree/answers/tools/plugins/embedwidget).
 branch in github

Copy this code:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>EmbedWidget</title>
    <link rel="icon" href="data:,">
    <link rel="stylesheet" href="/tools/plugins/embedwidget/embedwidget.css">
    <script src="https://da.live/nx/utils/sdk.js" type="module"></script>
    <script src="/tools/plugins/embedwidget/embedwidget.js" type="module"></script>
  </head>
  <body>
    <main class="plugin-shell">
      <h1>EmbedWidget</h1>
      <p class="plugin-intro">
        Paste a supported embed snippet. The plugin converts it into structured block content
        so no raw custom HTML is inserted into the document.
      </p>

      <label for="embed-code-input">Embed Code</label>
      <textarea
        id="embed-code-input"
        rows="14"
        placeholder="Paste full embed HTML here"
        aria-label="Embed code"
      ></textarea>

      <div class="plugin-actions">
        <button id="insert-block-btn" type="button">Insert Widget Block</button>
      </div>

      <p id="plugin-status" class="plugin-status" role="status" aria-live="polite"></p>
    </main>
  </body>
</html>
```

---

## Step 1.5: Create Plugin CSS

**File**: `tools/plugins/embedwidget/embedwidget.css`

Copy this code:

```css
.plugin-shell {
  box-sizing: border-box;
  padding: 16px;
  margin: 0;
  font-family: adobe-clean, "Segoe UI", sans-serif;
  color: #2c2c2c;
}

.plugin-shell h1 {
  margin: 0 0 10px;
  font-size: 20px;
  line-height: 1.2;
}

.plugin-intro {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.45;
}

.plugin-shell label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
}

#embed-code-input {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #c6c6c6;
  border-radius: 8px;
  padding: 10px 12px;
  resize: vertical;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 13px;
  line-height: 1.4;
}
```

---

## Step 2: Create Plugin JavaScript

**File**: `tools/plugins/embedwidget/embedwidget.js`

Copy this code:

```javascript
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

const TRADINGVIEW_HOST = 's3.tradingview.com';
const SCRIPT_PREFIX = 'embed-widget-';
const DEFAULT_HEIGHT = '500px';

function setStatus(statusEl, message, type = '') {
  statusEl.textContent = message;
  statusEl.className = `plugin-status ${type}`.trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeHeight(config) {
  const { height } = config;
  if (typeof height === 'number' && Number.isFinite(height)) return `${height}px`;
  if (typeof height === 'string' && height.trim()) return height.trim();
  return DEFAULT_HEIGHT;
}

function parseTradingViewEmbedCode(rawEmbedCode) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawEmbedCode, 'text/html');
  const scripts = [...doc.querySelectorAll('script[src]')];
  const tradingViewScript = scripts.find((script) => script.src.includes(TRADINGVIEW_HOST));

  if (!tradingViewScript) throw new Error('No supported widget script found. Paste the full embed snippet.');

  const scriptURL = new URL(tradingViewScript.src);
  if (scriptURL.host !== TRADINGVIEW_HOST) throw new Error('Unsupported script source in embed code.');

  const scriptFilename = scriptURL.pathname.split('/').pop();
  if (!scriptFilename || !scriptFilename.startsWith(SCRIPT_PREFIX)) {
    throw new Error('Unsupported widget type in script URL.');
  }

  const scriptConfigText = tradingViewScript.textContent.trim();
  if (!scriptConfigText) throw new Error('Widget configuration is empty.');

  let config;
  try {
    config = JSON.parse(scriptConfigText);
  } catch {
    throw new Error('Widget config must be valid JSON.');
  }

  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error('Widget config must be a JSON object.');
  }

  return { script: scriptFilename, height: normalizeHeight(config), config };
}

function toTradingViewBlockHTML({ script, height, config }) {
  const safeScript = escapeHtml(script);
  const safeHeight = escapeHtml(height);
  const safeConfig = escapeHtml(JSON.stringify(config, null, 2));

  return `
<table>
  <tbody>
    <tr><td colspan="2"><p>tradingview</p></td></tr>
    <tr><td><p>script</p></td><td><p>${safeScript}</p></td></tr>
    <tr><td><p>height</p></td><td><p>${safeHeight}</p></td></tr>
    <tr><td><p>config</p></td><td><pre><code>${safeConfig}</code></pre></td></tr>
  </tbody>
</table>`.trim();
}

(async function init() {
  const { actions } = await DA_SDK;
  const inputEl = document.getElementById('embed-code-input');
  const insertButton = document.getElementById('insert-block-btn');
  const statusEl = document.getElementById('plugin-status');

  insertButton.addEventListener('click', async () => {
    const rawEmbedCode = inputEl.value.trim();
    if (!rawEmbedCode) {
      setStatus(statusEl, 'Paste an embed snippet first.', 'error');
      return;
    }

    try {
      const parsed = parseTradingViewEmbedCode(rawEmbedCode);
      await actions.sendHTML(toTradingViewBlockHTML(parsed));
      setStatus(statusEl, 'Widget block inserted.', 'success');
      await actions.closeLibrary();
    } catch (error) {
      setStatus(statusEl, error.message || 'Unable to convert embed code.', 'error');
    }
  });
}());
```

**What this does**:
- Imports DA App SDK
- Waits for SDK initialization
- Validates and parses supported embed HTML
- Converts parsed values into structured block table markup
- Uses `actions.sendHTML()` to insert into document
- Uses `actions.closeLibrary()` to close palette

---

## Step 2.5: Create TradingView Block Decorator

The plugin inserts a structured `tradingview` block table, so your site also needs a `tradingview` block to render it.

Create:

- `blocks/tradingview/tradingview.js`
- `blocks/tradingview/tradingview.css`

**NOTE**: You can copy the `tradingview` block from the [answers branch](https://github.com/edsmasterclass/labs/tree/answers/blocks/tradingview).

Use the same pattern you implemented in this repo:
- read block config with `readBlockConfig(block)`
- parse `config` JSON from `<pre><code>`
- inject the TradingView widget script lazily with `IntersectionObserver`
- apply `height` from block config

---

## Step 3: Commit Plugin Files

```bash
# Run linting (HTML files don't need linting)
npm run lint

# Add changes
git add tools/plugins/embedwidget/
git add blocks/tradingview/

# Commit
git commit -m "feat: add DA embedwidget plugin"

# Push
git push origin jsmith
```

Replace `jsmith` with your branch name.

---

## Step 4: Test Plugin Locally First

Before pushing to your branch, test the plugin loads correctly from localhost.

**With your dev server running** (`aem up` or `npx @adobe/aem-cli up`):

**Plugin URL for local testing**:
```
https://da.live/app/edsmasterclass/labs/tools/plugins/embedwidget/embedwidget?ref=local
```

**To Test : EmbedWidget Plugin and TradingView Block**:
1. **Open DA.live**: Go to `https://da.live/edit#/edsmasterclass/labs/drafts/jsmith/` (use your name)
2. **Open any existing page** (or create `/drafts/jsmith/plugin-test`)
3. **Open library**: Click the library icon in the left sidebar (puzzle piece icon)
4. **Load your plugin**: In a new browser tab, navigate to https://da.live/edit?ref=local#/edsmasterclass/labs/drafts/jsmith/plugin-test

5. **Think like an author**: Open the TradingView Company Profile widget page:
   - `https://www.tradingview.com/widget-docs/widgets/symbol-details/company-profile/`
6. **Copy the generated embed HTML** from TradingView
7. **Return to EmbedWidget**: You should see a textarea for embed code and an "Insert Widget Block" button
8. **Paste and insert**: A structured `tradingview` block table should be inserted
9. **Library should close** automatically
10. **Preview** the DA page to see the rendered TradingView widget

**Debugging local issues**:
- Verify `http://localhost:3000` is running
- Check browser console for errors
- Verify file paths: `/tools/plugins/embedwidget/embedwidget.html`
- Check Network tab for failed requests

**How `?ref=local` works**: DA.live fetches your plugin HTML from `http://localhost:3000` instead of the published site. This lets you develop without committing/pushing every change.

---

## Step 5: Access Plugin on Your Branch

Once local testing works, access your plugin from your pushed branch.

**Your plugin URL** (replace `jsmith` with your branch):
```
https://da.live/app/edsmasterclass/labs/tools/plugins/embedwidget/embedwidget?ref=jsmith
```

**To test on your branch**:
1. **Ensure you've pushed** to GitHub (`git push origin jsmith`)
2. **Wait 1-2 minutes** for AEM Code Sync to deploy
3. **Open DA.live** and navigate to any page
4. **Load your plugin URL** with `?ref=jsmith` in a new tab
5. **Plugin loads from**:
   ```
   https://jsmith--labs--edsmasterclass.aem.page/tools/plugins/embedwidget/embedwidget.html
   ```
6. **Test valid and invalid embed snippets** to verify parsing and validation behavior

**Testing checklist**:
- [ ] Valid embed inserts a structured `tradingview` block table
- [ ] Invalid embed shows an error message
- [ ] Library palette closes after successful insertion
- [ ] Inserted table includes `script`, `height`, and `config` rows

## Step 6: Preview the Page and Verify Widget Rendering

After inserting the block in DA, validate that the `tradingview` block decorator renders the actual widget on the page.

1. **Preview** your DA document containing the inserted block (DA.live auto-saves)
2. **Open the preview URL** in your browser (branch or local)
3. **Test on desktop and mobile**: Use Chrome DevTools responsive view (F12 → device toolbar Cmd+Shift+M / Ctrl+Shift+M) to verify the widget layout at different widths.
4. **Verify rendered output**:
   - widget container is visible (not just a raw table)
   - TradingView widget loads in that section
   - configured height is applied
5. **If widget does not render**, check DevTools Console/Network for blocked script or JSON parsing issues

---

## Step 7: Optional - Register Plugin in Library


For production use, plugins should be registered in the site configuration so authors can discover them automatically.

**Note**: For this lab exercise, the plugin has already been added to the DA Library.

**To register your plugin** (instructor may do this):

1. **Edit site config**: Open `https://da.live/config#/edsmasterclass/labs/`
2. **Add to library sheet**:
   | title | path | experience |
   |-------|------|------------|
   | EmbedWidget | https://content.da.live/edsmasterclass/labs/tools/plugins/embedwidget | dialog |

3. Config auto-saves; **publish** the config when ready.

**Once registered**:
- Plugin appears automatically in library palette
- Authors don't need to know the URL
- Works on main branch for production use


---

<details>
<summary><strong>After the steps</strong> (please read — troubleshooting, examples, and takeaways)</summary>

## Troubleshooting Common Issues

### Plugin doesn't load (blank iframe)

**Problem**: Plugin URL shows blank page or 404

**Fixes**:
1. **Check file paths**: Verify files exist at `/tools/plugins/embedwidget/embedwidget.html`
2. **Check dev server**: Ensure `aem up` is running for `?ref=local`
3. **Check branch deployment**: Wait 1-2 minutes after `git push` for Code Sync
4. **Check URL**: Verify `?ref=jsmith` matches your branch name exactly
5. **Open plugin URL directly**: Visit the .aem.page URL in a new tab to see errors

### SDK import fails

**Problem**: Console error: "Failed to import DA_SDK"

**Fixes**:
1. **Check SDK URL**: Must be `https://da.live/nx/utils/sdk.js` (exact case)
2. **Check script type**: Must have `type="module"` in both HTML script tags
3. **Check CORS**: DA.live must be able to load your plugin (check browser console)

### Content doesn't insert

**Problem**: Clicking "Insert Widget Block" does nothing

**Fixes**:
1. **Check console**: Look for JavaScript errors
2. **Verify SDK initialization**: `await DA_SDK` must complete before using `actions`
3. **Verify embed source**: Ensure script host is `s3.tradingview.com`
4. **Verify config JSON**: Ensure the pasted embed contains valid JSON inside the script
5. **Test HTML insertion path**: Try `await actions.sendHTML('<p>test</p>')` first

### Library doesn't close

**Problem**: Library stays open after insertion

**Fixes**:
1. **Check call**: Ensure `await actions.closeLibrary()` is called
2. **Check await**: Must use `await` (it's async)
3. **Check errors**: Look for JavaScript errors preventing execution

### Plugin loads but shows errors

**Problem**: Plugin UI broken or shows JavaScript errors

**Fixes**:
1. **Open browser DevTools**: Check Console tab for errors
2. **Check file paths**: Verify JavaScript import path matches file location
3. **Check pasted embed**: Validate JSON in the embed script body
4. **Test locally first**: Use `?ref=local` to debug before pushing

### Can't access plugin in DA.live

**Problem**: DA.live doesn't let you load plugin URL

**Fixes**:
1. **Check permissions**: Ensure you have access to edsmasterclass/labs
2. **Check URL format**: Must start with `https://da.live/app/`
3. **Check ref parameter**: Must include `?ref=jsmith` or `?ref=local`
4. **Try main branch**: Test with `?ref=main` to isolate branch issues

**Debugging with Browser DevTools**:
1. Open plugin URL in new tab
2. Right-click → Inspect
3. Check Console tab for JavaScript errors
4. Check Network tab for failed requests (SDK, JavaScript files)
5. Check Elements tab to verify HTML structure

---

## Real-World Plugin Examples

### Use Case 1: Speaker Directory Plugin
- **Fetch speaker data** from `/speakers.json` or external API
- **Display list** of speakers with photos and names
- **Click to insert**: Selected speaker bio as formatted table
- **Bonus**: Use `token` to fetch authenticated data from DA.live Admin API

**Example flow**:
```javascript
const { token, actions } = await DA_SDK;

// Fetch speakers with auth
const response = await fetch('/speakers.json', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();

// Display in plugin UI, insert on click
speakers.forEach(speaker => {
  button.onclick = async () => {
    await actions.sendText(`## ${speaker.Name}\n${speaker.Bio}`);
    await actions.closeLibrary();
  };
});
```

### Use Case 2: Section Library Plugin
- **Pre-formatted section layouts**: Hero, CTA, Testimonials, FAQ
- **Click to insert**: Full section markup (with blocks)
- **Variant support**: Multiple designs per section type
- **Use case**: Ensure consistent design system compliance

**Example templates**:
- Hero with centered text + background image
- CTA with button + icon
- Testimonial with quote + photo + name
- FAQ accordion with expandable items

### Use Case 3: DAM Asset Browser
- **Browse DAM** or external asset library (Cloudinary, Bynder)
- **Search and filter** images by tags, categories
- **Insert with proper markdown**: Optimized image syntax
- **Auto-generate alt text**: From asset metadata

**Example flow**:
```javascript
// Fetch assets from DAM
const assets = await fetchFromDAM(token);

// Display thumbnails
assets.forEach(asset => {
  thumbnail.onclick = async () => {
    const markdown = `![${asset.alt}](${asset.url})`;
    await actions.sendText(markdown);
    await actions.closeLibrary();
  };
});
```

### Use Case 4: Product Catalog Plugin
- **Fetch products** from PIM (Product Information Management system)
- **Search by SKU**, name, category
- **Insert as table**: Product specs, price, images
- **E-commerce sites**: Consistent product page structure

### Use Case 5: Form Builder Plugin
- **Select form type**: Contact, Registration, Survey
- **Configure fields**: Name, email, message, etc.
- **Generate markup**: Form block with proper structure
- **Validation rules**: Built into generated code

### Use Case 6: Legal Snippets Library
- **Pre-approved legal text**: Privacy policies, disclaimers, copyright
- **Version controlled**: Always use latest approved version
- **Compliance**: Ensure legal requirements met
- **Multi-language support**: Insert in author's language

### Use Case 7: AI Content Generator
- **Generate content** via OpenAI, Claude, etc.
- **Input**: Title, keywords, tone
- **Output**: Generated paragraphs, summaries
- **Insert directly**: Author can edit after insertion

**Common pattern**:
```javascript
// 1. Fetch/generate data
const data = await fetchData(context, token);

// 2. Display in UI
renderUI(data);

// 3. Handle clicks
buttons.forEach(btn => {
  btn.onclick = async () => {
    const content = formatContent(data);
    await actions.sendText(content);
    await actions.closeLibrary();
  };
});
```

---

## Key Takeaways

- **DA.live plugins** are HTML + JavaScript applications hosted on your Edge Delivery site
- **DA App SDK** (`https://da.live/nx/utils/sdk.js`) provides the interface to DA.live
- **PostMessage API** enables secure cross-origin communication (plugin in iframe)
- **Three SDK objects**: `context` (document info), `token` (auth), `actions` (insert content)
- **Two insertion methods**: `actions.sendText()` (markdown) and `actions.sendHTML()` (HTML)
- **Plugin URL pattern**: `https://da.live/app/{org}/{repo}/{path}?ref={branch}`
- **Local development**: Use `?ref=local` to load from `localhost:3000`
- **Branch testing**: Use `?ref=jsmith` to load from your feature branch
- **Production use**: Register plugins in site config for automatic library discovery
- **Plugin architecture**: HTML (UI) + JavaScript (logic) + SDK (communication)

**Why plugins?**
- **Consistency** - Same conversion rules across all pages
- **Speed** - One-click insertion vs manual copy-paste
- **Integration** - Pull from external systems (APIs, DAMs, PIMs)
- **Automation** - Generate content programmatically
- **Validation** - Enforce structure and rules

**The pattern**: UI → Paste Embed → Parse + Validate → `actions.sendHTML()` → DA.live inserts → `actions.closeLibrary()`

</details>

---

## Verification Checklist

- [ ] **Created plugin files**:
  - `/tools/plugins/embedwidget/embedwidget.html`
  - `/tools/plugins/embedwidget/embedwidget.css`
  - `/tools/plugins/embedwidget/embedwidget.js`
- [ ] **Created block files**:
  - `/blocks/tradingview/tradingview.js`
  - `/blocks/tradingview/tradingview.css`
- [ ] **Tested locally** with `?ref=local` (dev server running)
- [ ] **Plugin loads** in library palette (no errors)
- [ ] **Conversion works**:
  - valid embed inserts the `tradingview` block table
  - invalid embed is rejected with clear messaging
- [ ] **Content inserts correctly** as structured HTML table
- [ ] **Preview rendering works**: inserted block decorates and widget loads on the page
- [ ] **Tested in Chrome DevTools responsive view** (desktop and mobile)
- [ ] **Library closes** automatically after insertion
- [ ] **Committed and pushed** to feature branch (`git push origin jsmith`)
- [ ] **Tested on branch** with `?ref=jsmith` parameter
- [ ] **Understand DA App SDK**:
  - `context` provides document info
  - `token` provides auth for API calls
  - `actions.sendHTML()` inserts block markup
  - `actions.closeLibrary()` closes palette
- [ ] **Understand PostMessage pattern** - Secure iframe communication
- [ ] **Understand URL structure** - `da.live/app/{org}/{repo}/{path}?ref={branch}`
- [ ] **Know how to debug** - Browser DevTools, Console, Network tab
- [ ] **Optional: Understand plugin registration** in site config

---

## Optional Enhancements

If you finish early, try these enhancements to your plugin:

### Enhancement 1: Support More Widget Types

Expand the parser to support additional embed providers and widget classes:
- Additional TradingView widget families
- Other approved providers
- Provider-specific validation rules

```javascript
if (scriptURL.host === 's3.tradingview.com') {
  // current parser branch
}
```

### Enhancement 2: Use Context-Aware Defaults

Use `context` to make inserted config smarter:

```javascript
const { context } = await DA_SDK;

const pageName = context.path.split('/').pop();
config.container_id = `widget-${pageName}`;
```

### Enhancement 3: Fetch Provider Metadata

Fetch supported widget definitions from a JSON file:

```javascript
const response = await fetch('/tools/plugins/embedwidget/supported-widgets.json');
const widgets = await response.json();
// Validate against dynamically fetched definitions
```

### Enhancement 4: Better UI

- Add search/filter for provider and widget type
- Add preview of generated block table
- Add form inputs for customization
- Add validation before insertion

### Enhancement 5: Use `sendHTML()` for Rich Content

Instead of markdown tables, insert rich HTML:

```javascript
const html = `
<div class="widget-preview">
  <table>
    <tr><td>script</td><td>${script}</td></tr>
    <tr><td>height</td><td>${height}</td></tr>
  </table>
</div>
`;
await actions.sendHTML(html);
```

---

## References

- **[Developing Apps and Plugins](https://docs.da.live/developers/guides/developing-apps-and-plugins)** - Official guide
- **[DA App SDK Source](https://da.live/nx/utils/sdk.js)** - SDK code (inspect for advanced usage)
- **[DA.live Documentation](https://docs.da.live/)** - Complete documentation
- **[TradingView Widgets Collection](https://www.tradingview.com/widget-docs/widgets/)** - Sample widget catalog
- **[TradingView Company Profile Widget](https://www.tradingview.com/widget-docs/widgets/symbol-details/company-profile/)** - Example widget used in this lab
- **[da-blog-tools TradingView README](https://raw.githubusercontent.com/aemsites/da-blog-tools/refs/heads/main/tools/plugins/tradingview/README.md)** - Source pattern for embed conversion
- **[PostMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)** - Understanding cross-origin communication

---

## Solution

The complete solution for this exercise (embedwidget plugin, tradingview block) is on the [answers branch](https://github.com/edsmasterclass/labs/tree/answers). The same branch contains solutions for all lab exercises.

---

## Congratulations!

You've completed all 8 exercises of EDS Masterclass Labs.

You now know how to:
- Author content in DA.live
- Build blocks with enhancements and variations
- Fetch data from external sources
- Use query index with auto-blocking
- Generate pages from JSON templates
- Integrate with third-party systems via Edge Workers
- Architect multi-site solutions with shared code
- Apply multi-brand theming from a single codebase
- Build DA.live plugins for content insertion

**Next steps**:
- Review your work
- Run `npm run lint` one final time
- Create pull request with before/after URLs
- Share Lighthouse scores (target: 100)

Thank you for participating in EDS Masterclass Labs!
