# Exercise 1: Authoring Your First Page

**Duration**: 20 minutes

---

<details>
<summary><strong>Quick navigation</strong></summary>

- [Prerequisites](#prerequisites)
- **Background** (please read — expand the section below, or jump: [What you'll learn](#what-youll-learn) · [DA.live & tables → blocks](#dalive-the-authoring-tool) · [Before you start](#before-you-start))
- **Exercise steps**
  - [Step 1: Create Your Page](#step-1-create-your-page)
  - [Step 2: Start From a Template](#step-2-start-from-a-template)
  - [Step 3: Update Your Content](#step-3-update-your-content)
  - [Step 4: Update Metadata](#step-4-update-metadata)
  - [Step 5: Preview](#step-5-preview)
  - [Step 6: Inspect the Content Transformation](#step-6-inspect-the-content-transformation)
  - [Step 7: Publish](#step-7-publish)
- [Verification Checklist](#verification-checklist)
- [References](#references)
- [Next Exercise](#next-exercise)

</details>

---

## Prerequisites

**Complete [SETUP.md](../SETUP.md) before starting this exercise.** Exercises can be done in sequence or independently; if independent, ensure SETUP is done and you have the items below.

**Required:**
- Verify the local dev server is accessible at [http://localhost:3000](http://localhost:3000); if not, start it with `aem up` from the project root in a terminal ([SETUP Step 6](../SETUP.md#step-6-start-development-server)).
- DA.live access verified: [da.live/#/edsmasterclass/labs](https://da.live/#/edsmasterclass/labs)
- Personal folder exists at `/drafts/<your-name>/` (first initial + last name, all lowercase — e.g. John Smith → `jsmith`)
- AEM Sidekick installed and this project added — toolbar is visible when you open `localhost:3000`

> **Your personal `jsmith--labs--edsmasterclass.aem.page` URL does not exist yet.**
> It becomes active only after your first `git push` in Exercise 2.
> In this exercise, use `localhost:3000` and the `main--` URLs shown below.

---

<details>
<summary><strong>Background</strong> (please read — concepts & warm-up before the hands-on steps)</summary>

## What You'll Learn

- How to author content in **DA.live** — the browser-based editor purpose-built for EDS
- How a table in DA.live becomes a decorated block on the rendered page
- How **Preview** and **Publish** update `.aem.page` and `.aem.live` respectively
- How to inspect your content at each transformation stage: document source, `.md`, `.plain.html`

---

## DA.live: The Authoring Tool

This lab uses **DA.live** — a purpose-built, browser-based document editor for EDS. It is not Google Docs, Microsoft Word, or SharePoint. DA.live gives authors a familiar word-processor experience in the browser, but the underlying format is clean semantic HTML.

**The key pattern — tables become blocks:**

A table authored in DA.live:

```
| Hero                   |
|------------------------|
| Welcome to Masterclass |
```

Becomes this HTML after EDS processes it:

```html
<div class="hero">
  <div><div>Welcome to Masterclass</div></div>
</div>
```

The table header (`Hero`) becomes the CSS class. Developers write `blocks/hero/hero.js` and `blocks/hero/hero.css` to decorate it. Authors never write CSS class names — the table structure *is* the contract between author and developer.

**The content pipeline:**

```
DA.live editor
     │
     │  Save
     ▼
Preview (.aem.page) ── code from main GitHub branch
     │                  content from DA.live
     │  Publish
     ▼
Live (.aem.live) ──── same code, same content (promoted to production)
```

For a full overview of EDS authoring: [aem.live/docs/authoring](https://www.aem.live/docs/authoring)

---

## Before You Start

Spend 2 minutes reviewing an existing page before creating your own. Open these side-by-side:

- **In DA.live** (author's view): [sessions/architecture-deep-dive](https://da.live/edit#/edsmasterclass/labs/sessions/architecture-deep-dive)
- **Rendered** (visitor's view): [localhost:3000/sessions/architecture-deep-dive](http://localhost:3000/sessions/architecture-deep-dive)

Notice how the tables you see in DA.live become the styled components on the rendered page. That transformation is what this exercise is about.

</details>

---

## Step 1: Create Your Page

1. Go to [da.live/#/edsmasterclass/labs](https://da.live/#/edsmasterclass/labs)
2. Navigate into `/drafts/<your-name>/`
3. Click **New** → **Document**
4. Name it `my-session` or `my-lab`

![DA.live drafts folder showing personal workspace](images/browse-drafts-folder.png)

---

## Step 2: Start From a Template

DA.live provides **session** and **lab** templates for this project. Using a template inserts all the required blocks and sections pre-populated with placeholder content — you fill in the details rather than building from scratch.

In the page editor:

1. Type `/` to open the slash command menu

   ![Slash command menu in DA.live](images/slash-command-in-da.png)

2. Select **Library**

  ![Select Library option from the menu in DA.live](images/slash-command-select-library.png)

> **If you do not see Templates or Blocks after you open Library**, your account may not have library access in DA.live yet. **@mention your instructor in the lab Slack channel** and include your **Adobe ID email** (the one you used on the [lab access form](https://main--aem-rockstar-website--adobe.aem.live/en/masterclass/nyc-setup)) so they can verify or fix permissions. Confirm you submitted that form with the **same** Adobe ID and GitHub username you use in the lab — see [SETUP.md — Step 9: Verify DA.live Access](../SETUP.md#step-9-verify-dalive-access).

3. Select **Templates**

  ![Select Templates option](images/select-template.png)

4. Choose **Session** or **Lab** depending on what you are creating

   ![Session and Lab template options](images/use-session-lab-template.png)

The template inserts a Hero block, content sections, and a Metadata block — all with placeholder text.

  ![How to insert a template in DA](images/how-to-insert-a-template-da.gif)  

> **Didn't find a template?** You can also insert individual blocks via the **Blocks Library**:
> Type `/` → select **Blocks** → browse and insert any block with placeholder content pre-filled.
>
> ![Block Library plugin in DA.live](images/block-library-plugin.png)
>
> Or insert a table manually with `/table` and type the block name in row 1.

---

## Step 3: Update Your Content

With the template inserted, replace each placeholder **in DA.live** — edit the real blocks on the page. Do not try to paste Markdown tables or `##` lines from this page; use DA’s editor (headings, lists, links, and the table cells as they already appear).

**Hero block** (table at the top):

1. Leave the block name row as **Hero** (same as the template).
2. In the title row, replace the placeholder with your session or lab title (type normally in the cell).
3. In the link row, keep a link whose **text** is **View Schedule**. Set the link URL to the schedule page (copy the line below and paste it into the link URL field if DA asks for the address):

```text
https://main--labs--edsmasterclass.aem.page/schedule
```

![Hero block in DA.live editor](images/my-session-top.png)

**Content sections** (below the Hero — headings and bullets already come from the template):

1. Find the **Session Overview** heading. Under it, replace the placeholder with two or three sentences describing your session or lab.
2. Find the **What You'll Learn** heading. Replace the three placeholder bullets with your own learning objectives (edit each list item in place).

> **Tip**: Type `/` anywhere in the document to explore other available insert options — headings, images, links, dividers, and more.

---

## Step 4: Update Metadata

The template includes a Metadata block at the bottom of the page. Fill in the placeholder values **in the table cells in DA.live** (edit each cell like normal text). **It must remain the last element on the page.**

**For a session**, update these rows (names are in the first column, your values in the second):

- **Title** — your session title, then ` - NYC Masterclass` (or follow the template wording).
- **Description** — a short description for SEO.
- **speaker-name** — speaker name.
- **category** — e.g. `technical` (or another value your template suggests).
- **session-level** — one of `beginner`, `intermediate`, or `advanced`.

**For a lab**, update these rows:

- **Title** — `Lab: ` plus your lab title and ` - NYC Masterclass` (or follow the template).
- **Description** — a short description for SEO.
- **instructor-name** — instructor name.
- **category** — e.g. `development`, `authoring`, or `configuration` as appropriate.
- **difficulty** — one of `beginner`, `intermediate`, or `advanced`.

![Metadata block at the bottom of the page in DA.live](images/my-session-bottom.png)

---

## Step 5: Preview

1. Click **Preview** (in DA.live)

Your page is now available at:

**Local** — uses your local code files + DA.live content:
```
http://localhost:3000/drafts/jsmith/my-session
```

**Main preview** — uses main branch code + DA.live content, accessible without a running dev server:
```
https://main--labs--edsmasterclass.aem.page/drafts/jsmith/my-session
```

> **Note**: There is no `jsmith--` preview URL yet. That becomes available after `git push origin jsmith` in Exercise 2. Until then, `localhost:3000` is your working environment.

Open your page on `localhost:3000`. Compare it against the reference live site:
[main--labs--edsmasterclass.aem.live](https://main--labs--edsmasterclass.aem.live/)

---

## Step 6: Inspect the Content Transformation

This is the core learning step. Your page exists in multiple representations simultaneously. Follow the order below: document source (author HTML), then **`.md`** (storage view), then **`.plain.html`** (EDS block HTML before browser decoration).

### Document Source — what the author wrote

With your page open at `http://localhost:3000/drafts/jsmith/my-session` (replace `jsmith` and the path with yours), use either path below to open **View document source**:

**Option 1 — Sidekick on the page:** When the Sidekick toolbar is visible on the page, use it and choose **View document source**.

![Sidekick "View document source" option](images/view-doc-source-sidekick.png)

**Option 2 — Extensions menu (Chrome / Edge):** If the on-page Sidekick toolbar is not showing, click the **Extensions** icon (puzzle piece) in the browser toolbar → in the list, find **AEM Sidekick** → click the **⋮** (More actions) next to it → **View document source**.

![View document source from AEM Sidekick via the Extensions menu](images/view-doc-source-extensions-menu.png)

**What you see**: Raw HTML from DA.live — tables are still `<table>` elements, no `class="hero"`, no block structure. This is exactly what the author wrote.

---

### `.md` — the content as Markdown

Open in a new tab. Available on both local and the main preview environment:

```
http://localhost:3000/drafts/jsmith/my-session.md
https://main--labs--edsmasterclass.aem.page/drafts/jsmith/my-session.md
```

**What you see**: Your content as Markdown — tables, headings, and lists in plain text format. This is the storage format EDS uses internally.

---

### `.plain.html` — what EDS processes

Next, open **`.plain.html`** in a new tab (same environments as above):

```
http://localhost:3000/drafts/jsmith/my-session.plain.html
https://main--labs--edsmasterclass.aem.page/drafts/jsmith/my-session.plain.html
```

**What you see**: EDS has transformed your Hero table into block divs:

```html
<div class="hero">
  <div><div>Your Session Title</div></div>
  <div><div><a href="...">View Schedule</a></div></div>
</div>
```

The Metadata table is gone — EDS has processed it into `<head>` tags. This `.plain.html` is what JavaScript receives when `decorate(block)` is called.

---

### The transformation at a glance

| What you open | What it shows |
|---|---|
| Document Source (Sidekick) | Raw DA.live HTML — what the author wrote, unprocessed |
| `…/my-session.md` | Markdown — the storage format |
| `…/my-session.plain.html` | EDS-processed HTML — tables become `<div class="blockname">`, Metadata → `<head>` |
| `localhost:3000/…` | Fully rendered page — `.plain.html` decorated by JavaScript and CSS |

---

## Step 7: Publish

Your content moves from preview (`.aem.page`) to production (`.aem.live`). Use **either** path below.

**Option 1 — From DA.live:** In the DA.live editor, click **Publish** and wait for the confirmation banner.

**Option 2 — From AEM Sidekick while previewing on `.aem.page`:**

1. Open your page in the browser so the URL is on **`.aem.page`** — for example:  
   `https://main--labs--edsmasterclass.aem.page/drafts/<your-name>/my-session` (same pattern as in Step 5; replace `<your-name>`).
2. With **AEM Sidekick** visible on that tab, use **Publish** and complete the flow.
3. **Observe the URL:** after a successful publish, the address should switch from **`.aem.page`** to **`.aem.live`** for the same content path.
4. **Observe Sidekick:** toolbar options and actions often **differ** between preview (`.aem.page`) and live (`.aem.live`) — note what changed after publish.

Your page is now on the **live** environment. Verify all three representations are accessible:

```
https://main--labs--edsmasterclass.aem.live/drafts/jsmith/my-session
https://main--labs--edsmasterclass.aem.live/drafts/jsmith/my-session.md
https://main--labs--edsmasterclass.aem.live/drafts/jsmith/my-session.plain.html
```

**What happened**: The EDS Admin API promoted your content from `.aem.page` (preview) to `.aem.live` (production). The `.plain.html` and `.md` are identical across both environments — the only difference is *when* content appears: after Preview vs. after Publish.

> **When does your `jsmith--` live URL appear?**
> `https://jsmith--labs--edsmasterclass.aem.live/...` becomes active after you push your feature branch in Exercise 2. Content on `.aem.live` is the same regardless of branch — only the *code* (blocks, scripts, styles) differs between `main--` and `jsmith--`.

---

## Verification Checklist

- [ ] Page created in DA.live under `/drafts/<your-name>/`
- [ ] Hero block renders at the top with title and schedule link
- [ ] Content (overview, objectives) appears below the Hero
- [ ] Metadata is the last element on the page
- [ ] Page visible at `http://localhost:3000/drafts/<your-name>/my-session`
- [ ] **Document source** viewed via Sidekick — tables visible, no `class="hero"`
- [ ] **`.md`** opened on `localhost:3000` (and optionally on `main--`) — content confirmed
- [ ] **`.plain.html`** opened on `localhost:3000` — Hero table is now `<div class="hero">`
- [ ] **`.plain.html`** opened on `main--labs--edsmasterclass.aem.page` — matches local
- [ ] Page published via DA.live
- [ ] All three representations accessible on `main--labs--edsmasterclass.aem.live`

---

## References

- [AEM Authoring](https://www.aem.live/docs/authoring)
- [AEM Sidekick](https://www.aem.live/docs/sidekick)
- [Markup, Sections, Blocks](https://www.aem.live/developer/markup-sections-blocks)

---

## Next Exercise

**Exercise 2**: Block Development — You'll read the existing `blocks/cards/cards.js` to understand how EDS transforms the `.plain.html` you just inspected into styled, interactive components. Then you'll create test content in DA.live and push your first commit — which is also when your personal `jsmith--` preview URL comes to life.
