# Exercise 7: Repoless Multi-Site & Multi-Brand

**Duration**: 30 minutes

---

<details>
<summary><strong>Quick navigation</strong></summary>

- [Prerequisites](#prerequisites)
- **Background** (please read — expand below, or jump: [What you'll learn](#what-youll-learn) · [Why this matters](#why-this-matters) · [Understanding Repoless](#understanding-repoless) · [How it works](#how-it-works))
- **Exercise steps**
  - [Step 1: Clone the Site Configuration (or request one)](#step-1-clone-the-site-configuration-or-request-one)
  - [Step 2: Create Your Content Folder](#step-2-create-your-content-folder)
  - [Step 3: Copy Content from NYC Masterclass](#step-3-copy-content-from-nyc-masterclass)
  - [Step 4: Preview Your Site](#step-4-preview-your-site)
  - [Step 5: Verify Repoless is Working](#step-5-verify-repoless-is-working)
  - [Step 6: Customize Your Content](#step-6-customize-your-content)
  - [Step 7: Multi-Brand Theming](#step-7-multi-brand-theming)
  - [Step 8: Explore Other Participants' Sites](#step-8-explore-other-participants-sites)
- **After the steps** (please read — [Key benefits of Repoless](#key-benefits-of-repoless) · [Real-world applications](#real-world-applications) · [Key takeaways](#key-takeaways))
- [Verification Checklist](#verification-checklist)
- [Reference Implementation](#reference-implementation)
- [References](#references)
- [Next Exercise](#next-exercise)
- [Solution](#solution)

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
- Exercises 1–6 completed (if doing in sequence)
- DA.live access
- AEM Sidekick logged in (for Site Admin tool auth)
- **Personal workspace**: your own site `edsmasterclass/jsmith-mc` (use your name, lowercase)
- **Org Admin for this lab**: if you need a site cloned or permissions adjusted, contact **murugull@adobe.com** (Slack, Microsoft Teams, or email), as described in [Step 1](#step-1-clone-the-site-configuration-or-request-one).

---

<details>
<summary><strong>Background</strong> (please read — concepts before the hands-on steps)</summary>

## What You'll Learn

- How repoless architecture works in Edge Delivery Services
- How to share code across multiple sites (one codebase, many sites)
- How site configuration cloning works in Site Admin (self-service for Org Admins, or by request for everyone else)
- How to use DA.live Traverse and Import tools to copy content
- How to create your own branded site in minutes
- How multi-brand theming works with body class selectors and CSS custom properties
- How Configuration Service manages code and content separation

---

## Why This Matters

**The scenario**: NYC Masterclass is successful. You need to launch personal regional events or client sites with the same functionality.

**The problem**: Do you duplicate the entire codebase for each site? Fork the repo? Copy all blocks?

**The repoless solution**:
- **One code repository** (blocks, scripts, styles) - `edsmasterclass/labs`
- **Multiple sites** with different content - Each person's site in DA.live
- **Configuration Service** manages which code repo each site uses
- **Code updates** to `labs` apply to all sites automatically
- **Zero code duplication** - Launch new sites in minutes

**Multi-brand theming**:
- Same code, different visual identities per site
- CSS custom properties scoped to body classes
- Theme applied via metadata — no code changes needed per site

**Benefits**:
- Maintain code once → all sites get updates instantly
- Launch new sites in minutes (not hours or days)
- Consistent functionality and quality across sites
- Bug fixes apply everywhere automatically
- Each site can have its own visual identity

---

## Understanding Repoless

### Traditional Model (Without Repoless)
```
NYC Masterclass
├── GitHub: edsmasterclass/labs (code)
└── DA.live: edsmasterclass/labs (content)

Boston Masterclass
├── GitHub: edsmasterclass/boston-mc (code - DUPLICATED!)
└── DA.live: edsmasterclass/boston-mc (content)

Chicago Masterclass  
├── GitHub: edsmasterclass/chicago-mc (code - DUPLICATED!)
└── DA.live: edsmasterclass/chicago-mc (content)
```

**Problem**: Update the hero block? Must change 3 GitHub repositories. Bug fix? Deploy to 3 places.

### Repoless Model (With Configuration Service)
```
CODE (ONE place)
GitHub: edsmasterclass/labs
├── blocks/
├── scripts/
└── styles/

CONTENT (MANY places)
DA.live Projects (each uses labs code):
├── edsmasterclass/labs (NYC content)
├── edsmasterclass/boston-mc (Boston content)
├── edsmasterclass/chicago-mc (Chicago content)
└── edsmasterclass/jsmith-mc (YOUR content)
```

**Solution**: Update hero block once in `labs` → all 4 sites get it instantly.

**Reference**: [Repoless Architecture](https://www.aem.live/docs/repoless)

---

## How It Works

### The Configuration Service

Each site in DA.live can specify:

1. **Content Source**: Where content lives (always the DA.live project itself)
2. **Code Source**: Where code lives (can point to a different GitHub repo)
3. **Site Settings**: Permissions, custom configuration

**Example**: Your site `edsmasterclass/jsmith-mc`
- Content from: `edsmasterclass/jsmith-mc` in DA.live (YOUR pages)
- Code from: `edsmasterclass/labs` in GitHub (SHARED blocks/scripts)

### What Gets Loaded From Where

When someone visits `https://main--jsmith-mc--edsmasterclass.aem.page/`:

1. EDS checks `jsmith-mc` configuration → sees code source is `labs`
2. Gets **content** (index.html) from `edsmasterclass/jsmith-mc` in DA.live
3. Gets **code** (hero.js, hero.css, scripts.js) from `edsmasterclass/labs` in GitHub
4. Combines them → your page with your content, shared functionality

**Reference**: [Configuration Service Setup](https://www.aem.live/docs/config-service-setup)

</details>

---

## Step 1: Clone the Site Configuration (or request one)

The Site Admin tool is how new site entries are created in the Configuration Service. **Cloning a site requires Org Admin permissions** on the organization. In this lab, most participants are **not** provisioned as Org Admins, so the **Clone site** / **clone site config** action on the site card is **disabled** for them.

### High-level flow (everyone)

1. **Get a cloned site configuration** — either you self-clone (Org Admins only) or an Org Admin does it for you.
2. **Get admin permissions** on *your* cloned site so you can open it in Site Admin and adjust settings for the rest of the exercise.
3. **Change the content path** (or equivalent site settings) so preview/production load **your** DA.live content folder (`edsmasterclass/<your-site>`).
4. **Leave the code path as-is** — keep the shared code source pointing at **`edsmasterclass/labs`** (GitHub) so the exercise stays repoless.

If an Org Admin created the site for you, they should grant you the access you need to complete steps 2–4 yourself; if anything is still wrong after that, follow up with the same contact.

### If you are not an Org Admin (typical lab path)

1. **Request a clone** from an Org Admin: **murugull@adobe.com** (use your class Slack channel, Microsoft Teams, or email—whichever the instructors asked you to use).

   Include at least:
   - **Organization**: `edsmasterclass`
   - **Source site to clone**: `labs`
   - **New site name**: `jsmith-mc` (first initial + last name + `-mc`, all lowercase) — e.g. John Smith → `jsmith-mc`, Sarah Johnson → `sjohnson-mc`
   - Ask to be granted **admin (or equivalent) on the new site’s configuration** so you can verify paths in Site Admin.

2. Wait until you are told the site exists and you have access, then continue from [Step 2](#step-2-create-your-content-folder). You can still open Site Admin to **list** sites and inspect your site once you have permissions.

### If you are an Org Admin (self-service)

1. Open **Site Admin**: [https://tools.aem.live/tools/site-admin/index.html](https://tools.aem.live/tools/site-admin/index.html)

2. **IMPORTANT**: You must be logged in via AEM Sidekick extension first.

3. In the form:
   - **Organization**: `edsmasterclass`
   - Click **List** to load the existing configuration

4. Clone the configuration for `labs` to create your new site (three dots on the site card → **clone site config**):
   - **New site name**: `jsmith-mc` (your first initial + last name + `-mc`)

5. Confirm the clone.

6. Ensure **participants who requested the clone** receive **admin permissions on the cloned site** (not only on the org) so they can complete the exercise.

**What this step achieves**: A new site entry in the Configuration Service that inherits from `labs`, including the **code** source pointed at the shared **`labs`** repository. After you or an admin align **content** with your DA folder (see high-level flow above), your previews load your content with shared code — the repoless pattern used in the rest of this exercise.

---

## Step 2: Create Your Content Folder

Now create a place for your site's content in DA.live.

1. Go to DA.live: [https://da.live/#/edsmasterclass](https://da.live/#/edsmasterclass)

2. You should see the `edsmasterclass` org with its existing sites (including `labs`)

3. Create a new folder called `jsmith-mc` (your name)

**Result**: You now have an empty content folder at `edsmasterclass/jsmith-mc`.

**If your site was cloned by an Org Admin**: In Site Admin, open **your** site’s configuration and confirm **content** resolves to this DA path (`edsmasterclass/jsmith-mc` — same as your site name in the exercise). **Leave the code source** pointed at the shared **`labs`** repository; do not repoint code to a fork unless an instructor tells you to.

---

## Step 3: Copy Content from NYC Masterclass

Instead of creating content from scratch, use the DA.live tools to copy all existing content from the NYC Masterclass site.

### 3a: Traverse the Source Site

1. Open the **Traverse** tool: [https://da.live/apps/traverse](https://da.live/apps/traverse)

2. Enter the source site path: `edsmasterclass/labs`

3. Run the traverse — this crawls the site and builds a list of all content pages and assets

4. Wait for it to complete

5. Hit `Copy List` to grab all the page URLs

### 3b: Import Content to Your Site

1. Open the **Import** tool: [https://da.live/apps/import](https://da.live/apps/import)

2. Paste all the URLs gathered from the traverse tool into the `By URL` field.

3. In the `Into` section, enter the org `edsmasterclass` and your site name: `jsmith-mc`

4. Run the import — this copies all content (pages, images, metadata) to your site

5. Wait for it to complete

6. When the import finishes, click the **Copy Success** button to copy all the successfully imported URLs to your clipboard — you'll need these in the next step

### 3c: Preview & Publish All Content

Imported content needs to be previewed and published before it's available on your site.

1. Open the **Bulk Operations** tool: [https://da.live/apps/bulk](https://da.live/apps/bulk)

2. Paste the URLs you copied from the import tool

3. Run **Preview** to generate preview versions of all pages

4. Wait for it to complete, then run **Publish** to make all pages live

**Result**: Your site now has a full copy of all NYC Masterclass content, previewed and published.

---

## Step 4: Preview Your Site

1. Open your site: `https://main--jsmith-mc--edsmasterclass.aem.page/`

2. **Test on desktop and mobile**: Use Chrome DevTools responsive view (F12 → device toolbar Cmd+Shift+M / Ctrl+Shift+M) to verify the site at different widths.

3. **You should see**: The full NYC Masterclass homepage — same hero, same cards, same styling

**What's happening**:
- **Content** is coming from `edsmasterclass/jsmith-mc` (your DA.live folder)
- **Code** is coming from `edsmasterclass/labs` (shared GitHub repo)
- The site looks identical to NYC because you copied the content and share the code

---

## Step 5: Verify Repoless is Working

Prove that code is loading from the shared repository, not your site.

1. On your site (`https://main--jsmith-mc--edsmasterclass.aem.page/`), open browser **DevTools** (F12)

2. Go to the **Network** tab

3. Refresh the page

4. Filter by **JS** or **CSS** and look at the file URLs

**You should see**:
```
https://main--labs--edsmasterclass.aem.page/blocks/hero/hero.js
https://main--labs--edsmasterclass.aem.page/scripts/scripts.js  
https://main--labs--edsmasterclass.aem.page/styles/styles.css
```

**KEY OBSERVATION**: URLs say `labs`, NOT `jsmith-mc`!

**This proves**:
- Your **content** comes from `edsmasterclass/jsmith-mc` (your DA.live project)
- Your **code** comes from `edsmasterclass/labs` (shared GitHub repo)
- **Repoless is working!**

---

## Step 6: Customize Your Content

Now make the site yours by editing content. This proves that each site's content is independent.

1. In DA.live, navigate to your site: [https://da.live/#/edsmasterclass/jsmith-mc](https://da.live/#/edsmasterclass/jsmith-mc)

2. Open the homepage (`index`)

3. Change the `<h1>` to: **Jsmith's Masterclass** (use your name)

4. DA.live auto-saves. Click **Preview** to see the page.

**Verify**:
- Your site (`jsmith-mc`) shows YOUR heading
- NYC site (`labs`) still shows the original heading
- Both sites have identical styling, blocks, and functionality

**This proves**: Content is completely independent between sites while all code is shared.

---

## Step 7: Multi-Brand Theming

Your site works, but it looks identical to NYC Masterclass. In a real multi-brand setup, each site needs its own visual identity. You'll add a custom theme using **body class selectors** — one of the simplest approaches to multi-brand theming.

**Reference**: [Multi-Brand EDS Implementation Using Repoless](https://main--helix-website--adobe.aem.page/drafts/ravuthu/multi-brand-eds-implementation-using-repoless#option-1-single-file-with-body-class-selectors)

### How Themes Work

1. Authors set a `theme` value in page metadata (e.g., `theme: masterclass`)
2. The `decorateTemplateAndTheme()` function in `aem.js` reads this value and adds it as a class on `<body>`
3. CSS rules scoped to `body.masterclass` apply the visual identity
4. Different sites set different theme values → different visual identities from the same CSS file

The NYC Masterclass site currently uses `theme: masterclass`, which produces the orange/purple gradient. You'll create your own theme.

### 7a: Set Your Theme via the Metadata Sheet

In AEM Edge Delivery Services, **bulk metadata** lets you set default metadata values for all pages on a site using a spreadsheet. This is how you apply a theme site-wide without editing every page individually.

1. In DA.live, navigate to your site: [https://da.live/#/edsmasterclass/jsmith-mc](https://da.live/#/edsmasterclass/jsmith-mc)

2. Open the **sheet** called `metadata` at the root of your site

3. Set up the sheet with these columns and values:

| URL | theme |
|-----|-------|
| `/**` | `jsmith` |

- The `URL` column uses glob patterns to match pages — `/**` matches every page on the site
- The `theme` column sets the metadata value that `decorateTemplateAndTheme()` reads

4. DA.live auto-saves. **Preview** the metadata sheet so it becomes available as JSON.

**What this does**: Every page on your site now has `theme: jsmith` in its metadata. The `decorateTemplateAndTheme()` function in `aem.js` reads this value and adds `class="jsmith"` to the `<body>` element. No page-level editing needed — one sheet controls the entire site.

> **Tip**: Bulk metadata is a powerful tool beyond theming. You can set any metadata key (title, description, og:image, template, etc.) for groups of pages using URL patterns like `/blog/**` or `/events/**`.

### 7b: Add Your Theme CSS

On your branch, add a new theme in `styles/styles.css`. Add this **after** the existing `body.masterclass` rule:

```css
body.jsmith {
  --brand-1: #06b6d4;
  --brand-2: #2563eb;
  background: radial-gradient(1200px 600px at 80% -10%, #06b6d4 0%, transparent 60%),
              radial-gradient(900px 600px at 10% 10%, #2563eb 0%, transparent 60%),
              linear-gradient(180deg, var(--masterclass-bg-2), var(--masterclass-bg-1) 55%);
  background-attachment: fixed;
  color: var(--ink);
}
```

> **Use your name** as the class name (e.g., `body.sjohnson`, `body.kwang`). Pick any colors you like!

**What this does**:
- Overrides `--brand-1` (accent color used in cards, links, eyebrows) from orange to cyan
- Overrides `--brand-2` (secondary accent) from purple to blue
- Changes the background gradient to match the new brand colors
- All blocks that use `var(--brand-1)` and `var(--brand-2)` automatically pick up the new colors

### 7c: Test Locally

Before pushing, test your theme locally. Use the `--pagesUrl` flag to tell the local dev server to load **content** from your new site while using your **local code**:

```bash
aem up --pagesUrl https://main--jsmith-mc--edsmasterclass.aem.page/
```

Replace `jsmith-mc` with your site name.

Open `http://localhost:3000/` and **you should see**:
- Your site's content (your custom heading from Step 6)
- Your new theme colors applied (cyan/blue instead of orange/purple)
- The full site running with your local code + your remote content

**This is a key repoless development pattern**: run local code against any site's content for testing.

> **Pro tip**: You can run both sites in parallel by using the `--port` flag. In one terminal run the original site (`aem up`) on the default port 3000, and in another run your new site on a different port:
> ```bash
> aem up --port 3001 --pagesUrl https://main--jsmith-mc--edsmasterclass.aem.page/
> ```
> Now compare `http://localhost:3000/` (original) and `http://localhost:3001/` (your theme) side by side.

### 7d: Push Your Changes

```bash
git add styles/styles.css
git commit -m "feat: add personal theme for jsmith-mc"
git push origin jsmith
```

Replace `jsmith` with your branch name.

### 7e: Verify Your Theme

Open your site: `https://jsmith--jsmith-mc--edsmasterclass.aem.page/`

**You should see**:
- Your custom heading ("Jsmith's Masterclass")
- Your custom brand colors (cyan/blue instead of orange/purple)
- Same blocks, same layout, same functionality — your content with your visual identity

**Compare with NYC**: Open `https://main--labs--edsmasterclass.aem.page/` side by side. Same codebase, different content, different brand.

If this was a real project, at this point, you'd raise a pull request to merge `jsmith` into `main` and once completed, you'd have a basic multi-brand setup powered by a singular codebase.

### Why This Approach Works

From the [multi-brand theming guide](https://main--helix-website--adobe.aem.page/drafts/ravuthu/multi-brand-eds-implementation-using-repoless#option-1-single-file-with-body-class-selectors):

> The simplest approach is to define all brand variables in one file, scoped by body class.

```
styles/styles.css
├── :root { ... }              ← Shared base variables
├── body.masterclass { ... }   ← NYC Masterclass theme (orange/purple)
├── body.jsmith { ... }        ← Your theme (cyan/blue)
├── body.sjohnson { ... }      ← Another participant's theme
└── ...                        ← Add more themes as needed
```

Each site's metadata controls which theme class is applied. **No code changes needed** to launch a new brand — just set the metadata and add a CSS rule.

---

## Step 8: Explore Other Participants' Sites

Ask other participants to share their site URLs and compare.

**What you'll notice**:
- All sites have different content (names, headings)
- All sites have different brand colors (if they completed the theming step)
- All sites use the same blocks and functionality
- All sites load code from `labs` (check DevTools Network tab)

**Result**: Multiple unique branded sites from one codebase!

---

<details>
<summary><strong>After the steps</strong> (please read — benefits, examples, and takeaways)</summary>

## Key Benefits of Repoless

**For developers**:
- Fix bug once → all sites get fix instantly
- Add feature once → all sites get feature immediately
- One codebase to maintain (not 10 or 100)
- Centralized testing and quality control
- No code duplication or version drift

**For content authors**:
- Each site has own DA.live project (zero conflicts)
- No code complexity (pure content authoring)
- Full editorial control per site
- Site-specific branding via metadata

**For organizations**:
- Launch new sites in minutes (not days or weeks)
- Consistent functionality and quality across all sites
- Reduced maintenance overhead (1x effort, Nx sites)
- Scale to hundreds or thousands of sites effortlessly

---

## Real-World Applications

**Use Case 1: Multi-Region Events (Like This Masterclass!)**
- Code: Event site template (blocks, navigation, forms)
- Sites: NYC, Boston, Austin, London, Tokyo, Dubai
- Theme: City-specific colors and branding per site
- Content: Local speakers, sessions, sponsors per site
- Result: Launch 6 events in 6 cities in 1 hour

**Use Case 2: Multi-Brand E-Commerce**
- Code: E-commerce platform (product display, cart, checkout)
- Sites: Brand A, Brand B, Brand C (3 fashion brands)
- Theme: Colors, logo, typography per brand via body class selectors
- Content: Products, categories, campaigns per brand
- Result: Consistent shopping experience, brand-specific identity

**Use Case 3: Department Microsites**
- Code: Company template (hero, cards, forms)
- Sites: Marketing, Sales, Engineering, HR, Legal
- Theme: Department colors and style via metadata
- Content: Department-specific pages, resources, team
- Result: Cohesive company presence, departmental autonomy

**Use Case 4: Franchise Network**
- Code: Restaurant template (menu, locations, reservations)
- Sites: 500+ franchise locations (each has own site)
- Theme: Regional variations (shared base, local overrides)
- Content: Local photos, events, staff bios per location
- Result: Consistent brand experience, local customization at scale

---

## Key Takeaways

- **Repoless** separates code from content — one codebase, many sites
- **Site Admin** clones site configurations (Org Admins) or **Org Admins clone on request**; you then align **content** with your DA folder and keep **code** on `labs`
- **DA.live tools** (Traverse + Import) copy content between sites instantly
- **Configuration Service** manages which code each site uses
- **Multi-brand theming** uses body class selectors + CSS custom properties
- **Theme metadata** controls which visual identity a site uses — no code changes needed
- **Code updates** apply to all sites automatically
- **Scale** from 1 site to 1000+ sites with the same codebase

</details>

---

## Verification Checklist

- [ ] Have a `jsmith-mc` site config cloned from `labs` (self-service in Site Admin **or** requested via **murugull@adobe.com** / class Slack or Teams)
- [ ] Can open your site in Site Admin and confirm **content** → your DA folder; **code** → shared `labs`
- [ ] Created content folder in DA.live (`edsmasterclass/jsmith-mc`)
- [ ] Copied content using Traverse and Import tools
- [ ] Previewed your site and saw it working
- [ ] **Tested in Chrome DevTools responsive view** (desktop and mobile)
- [ ] Verified code loading from `labs` (DevTools Network tab)
- [ ] Customized the homepage heading (content independence)
- [ ] Created metadata sheet in DA.live to set theme site-wide
- [ ] Added theme CSS in `styles/styles.css` with body class selector
- [ ] Pushed changes and previewed your custom brand colors
- [ ] Compared your site with other participants' sites
- [ ] Understand how one codebase serves many branded sites

---

## Reference Implementation

A working implementation of this exercise is available for the site `ukhalid-mc`.

- Site: [https://answers--ukhalid-mc--edsmasterclass.aem.page/](https://answers--ukhalid-mc--edsmasterclass.aem.page/)
- Metadata sheet: [https://da.live/sheet#/edsmasterclass/ukhalid-mc/metadata](https://da.live/sheet#/edsmasterclass/ukhalid-mc/metadata)

---

## References

- [Repoless Architecture](https://www.aem.live/docs/repoless)
- [Configuration Service Setup](https://www.aem.live/docs/config-service-setup)
- [Multi-Brand Theming (Option 1)](https://main--helix-website--adobe.aem.page/drafts/ravuthu/multi-brand-eds-implementation-using-repoless#option-1-single-file-with-body-class-selectors)
- [Site Admin Tool](https://tools.aem.live/tools/site-admin/index.html)
- [Admin API](https://www.aem.live/docs/admin.html)

---

## Next Exercise

**Exercise 8**: [DA.live Plugin Development](../exercise8/instructions.md) — Extend authoring with a plugin + block pair (e.g. turning third-party embeds into structured content).

---

## Solution

The complete solution for this exercise is available on the [answers branch](https://github.com/edsmasterclass/labs/tree/answers). The same branch contains solutions for all lab exercises.
