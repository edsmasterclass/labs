# Product Bus — Commerce at the Edge

**Duration**: 30 minutes

---

<details>
<summary><strong>Quick navigation</strong></summary>

- [Prerequisites](#prerequisites)
- **Background** (please read — expand below, or jump: [What you'll learn](#what-youll-learn) · [Why this matters](#why-this-matters) · [The four areas](#the-four-areas))
- **Exercise steps**
  - [Step 1: Ingest — Push Products to the Catalog](#step-1-ingest--push-products-to-the-catalog)
  - [Step 2: Index — Observe the Auto-Generated Feeds](#step-2-index--observe-the-auto-generated-feeds)
  - [Step 3: Delivery — Browse and Enrich Product Pages](#step-3-delivery--browse-and-enrich-product-pages)
  - [Step 4: Buy — The API Layer (Instructor Demo)](#step-4-buy--the-api-layer-instructor-demo)
- **After the steps** (please read — [Real-world applications](#real-world-applications) · [Key takeaways](#key-takeaways))
- [Verification Checklist](#verification-checklist)
- [Troubleshooting Common Issues](#troubleshooting-common-issues)
- [References](#references)
- [Next Exercise](#next-exercise)

</details>

---

## Prerequisites

**Complete [SETUP.md](../SETUP.md) if not already done.**

**Required:**
- **Feature branch** — Your branch name is your product namespace prefix. Run `git branch` — the line with `*` should be your personal branch (e.g. `jsmith`). If not:
  ```bash
  git checkout -b jsmith
  ```
- Dev server running at [http://localhost:3000](http://localhost:3000) — if not, start it:
  ```bash
  aem up
  ```
- Code editor open with the repository
- **API token** — printed on the lab sheet (provided by instructor)
- Node.js 18+ installed (`node --version`)

**What's already set up for you**:

| Component | Status |
|---|---|
| **Product Bus API** (`api.adobecommerce.live`) | Live — accepts your ingest |
| **Mixer routing** — `/products-*/**` → pipeline | Configured for `edsmasterclass/labs` |
| **Indexer** — auto-generates feeds per namespace | Configured |
| **product-grid block** — renders a card grid from index JSON | On `answers` branch |

---

<details>
<summary><strong>Background</strong> (please read)</summary>

## What You'll Learn

- How to push a product catalog into Adobe's Product Bus with a single script
- How Product Bus auto-generates an index, sitemap, and Google Merchant Center feed from your catalog
- How product pages combine **structured commerce data** (from Product Bus) with **authored editorial content** (from DA.live) at the same URL path
- How per-namespace prefixes isolate catalogs by student, locale, or brand — the same pattern production sites use for `/products-en/` vs `/products-fr/`

---

## Why This Matters

Traditional commerce setups require separate systems for product data, page rendering, and editorial authoring — and synchronizing them is painful. Product Bus collapses that into a single model:

- **One path** is the product's identity. `/products-jsmith/swag/masterclass-hoodie` is both the API address and the page URL.
- **Two sources** merge automatically. Product Bus provides structured data; DA.live provides editorial voice. Neither team steps on the other.
- **Three output formats** are generated for free. Every catalog root gets an index JSON, a sitemap, and a Merchant Center feed — no extra work.

---

## The Four Areas

Product Bus is organized into four areas, and this lab covers all of them:

| Area | What it does | This lab |
|---|---|---|
| **Ingest** | ETL pushes product data to the API | Hands-on: run the generator script |
| **Index** | Async workers generate index + feeds | Observe: your auto-generated feeds |
| **Delivery** | Product pages = Product Bus data + EDS enrichment | Hands-on: browse pages + author enrichment |
| **Buy** | Auth, cart, orders — client-side integration | Show: instructor demo |

</details>

---

## Step 1: Ingest — Push Products to the Catalog

*~8 minutes*

The generator script creates 6 products across two categories — swag and developer guides — and pushes them to Product Bus under your own namespace prefix derived from your git branch.

### 1a. Preview what will be ingested

From the repo root, run a dry-run first to confirm your prefix:

```bash
node labs/product-bus/generate-products.mjs --dry-run
```

You should see a table like this (your branch name in the prefix):

```
EDS Masterclass — Product Bus Payloads  [prefix: products-jsmith]

+------------------------------------------------+---------------------------------------------------+
| Name                                           | Path                                              |
+------------------------------------------------+---------------------------------------------------+
| Masterclass Hoodie                             | /products-jsmith/swag/masterclass-hoodie          |
| Developer Sticker Pack                         | /products-jsmith/swag/developer-sticker-pack      |
| Masterclass Desk Kit                           | /products-jsmith/swag/masterclass-desk-kit        |
| EDS Block Development Field Guide              | /products-jsmith/guides/eds-block-...             |
| Cloudflare Workers for AEM Developers          | /products-jsmith/guides/cloudflare-...            |
| Edge Delivery Services: The Complete Reference | /products-jsmith/guides/edge-...                  |
+------------------------------------------------+---------------------------------------------------+
```

**Key concept**: The URL path *is* the product's identity in Product Bus. The prefix `/products-jsmith/` is your isolated namespace — no other student's products will overlap with yours.

### 1b. Ingest the products

Replace `<token>` with the API token from the lab sheet:

```bash
node labs/product-bus/generate-products.mjs --api <token>
```

Expected output:

```
Creating indexes...
  ✓ /products-jsmith/index.json (HTTP 200)
  ✓ /products-jsmith/swag/index.json (HTTP 200)
  ✓ /products-jsmith/guides/index.json (HTTP 200)

Calling bulk API: POST https://api.adobecommerce.live/edsmasterclass/sites/labs/catalog/*
Ingesting 6 products (1 batch(es))...
  Batch 1: ✓ 6 product(s) saved (HTTP 200)

Done. 6 saved, 0 failed.
```

### 1c. Verify one product was stored

Open this URL in your browser (replace `jsmith` with your branch name):

```
https://main--labs--edsmasterclass.aem.network/products-jsmith/swag/masterclass-hoodie
```

You should see the full product JSON including name, price, images, and attributes.

---

## Step 2: Index — Observe the Auto-Generated Feeds

*~5 minutes*

### 2a. Peek under the hood — site configuration

Before you look at the feeds, open the site's config to see what's wired up:

```
https://main--labs--edsmasterclass.aem.network/config.json
```

Look for two sections:

- **`mixerConfig`** — the routing rule that sends `/products-*/**` requests to the Product Bus pipeline worker. One pattern covers every student namespace.
- **`productIndexerConfig`** — tells the indexer which fields to include in the generated feeds, and which catalog roots to watch.

This is the entire infrastructure configuration for Product Bus on this site. No per-student setup required — your namespace was covered the moment you picked a branch name.

### 2b. Open the auto-generated feeds

Indexing happens automatically after ingest — no action required. Open each of these in your browser (replace `jsmith` with your branch):

**Query indexes** — power product listing grids (one per scope):
```
https://main--labs--edsmasterclass.aem.network/products-jsmith/index.json
https://main--labs--edsmasterclass.aem.network/products-jsmith/swag/index.json
https://main--labs--edsmasterclass.aem.network/products-jsmith/guides/index.json
```

**Product sitemap** — for search engines:
```
https://main--labs--edsmasterclass.aem.network/products-jsmith/sitemap.xml
```

**Google Merchant Center feed** — for shopping ads:
```
https://main--labs--edsmasterclass.aem.network/products-jsmith/merchant-center-feed.xml
```

> **Note**: Feeds may take 30–60 seconds to generate after ingest. If you see a 404, wait a moment and refresh.

**Key concept**: You get scoped indexes, a sitemap, and a Merchant Center feed from a single ingest. The indexer scopes itself to your namespace — and to sub-paths like `/swag` — automatically.

---

## Step 3: Delivery — Browse and Enrich Product Pages

*~12 minutes*

### Part A: Explore a rendered product page (~5 min)

Open a product detail page on your branch (replace `jsmith` with your branch):

```
https://jsmith--labs--edsmasterclass.aem.network/products-jsmith/swag/masterclass-hoodie
```

You should see a fully rendered product page with:
- Product name, price, and image
- Description and attributes
- JSON-LD structured data (right-click → View Page Source → search `application/ld+json`)

Now append `.json` to the URL to see the raw product data:

```
https://jsmith--labs--edsmasterclass.aem.network/products-jsmith/swag/masterclass-hoodie.json
```

**Key concept**: The pipeline worker renders product pages at the edge — combining Product Bus data with any authored content at the same path. Right now there is no authored content, so you're seeing pure Product Bus output.

---

### Part B: Add product grid listing pages (~4 min)

The `product-grid` block renders a responsive card grid from any index JSON. Copy it to your branch from the answers branch:

```bash
git checkout answers -- blocks/product-grid
```

Create three pages in DA.live (replace `jsmith` with your branch in all paths):

**`/products-jsmith`** — all products:

| product-grid |
|---|
| /products-jsmith/index.json |

**`/products-jsmith/swag`** — swag only:

| product-grid |
|---|
| /products-jsmith/swag/index.json |

**`/products-jsmith/guides`** — guides only:

| product-grid |
|---|
| /products-jsmith/guides/index.json |

Preview and publish all three. Open them on your branch:

```
https://jsmith--labs--edsmasterclass.aem.network/products-jsmith
https://jsmith--labs--edsmasterclass.aem.network/products-jsmith/swag
https://jsmith--labs--edsmasterclass.aem.network/products-jsmith/guides
```

**Key concept**: The same block, pointed at different index URLs, scopes the grid automatically. This is how production sites build locale or category landing pages — one block, many scopes.

---

### Part C: Author enrichment on a product page (~3 min)

Open DA.live and navigate to `/products-jsmith/swag/masterclass-hoodie`. This is the same path as the product page — any content you author here **merges automatically** with the Product Bus data when the page is rendered.

Add a short paragraph of editorial copy — for example:

> **Why we made this**
>
> We wanted something developers would actually wear. The Masterclass Hoodie is what happens when you ask engineers to design event merch: no logos plastered everywhere, just one small embroidered mark and a skyline on the back.

Preview and publish. Reload the product page on your branch:

```
https://jsmith--labs--edsmasterclass.aem.network/products-jsmith/swag/masterclass-hoodie
```

Your authored content should appear on the page alongside the structured product data.

**Key concept**: Product Bus handles commerce data; DA.live handles editorial voice. One page, two sources — and the merge happens automatically at the same URL path. Neither the commerce team nor the content team needs to coordinate.

---

## Step 4: Buy — The API Layer (Instructor Demo)

*~5 minutes — no student action required*

The instructor will walk through the buy-side API shape:

- `POST /auth/token` — how authentication works
- Cart payload structure — add-to-cart API
- Orders endpoint — order management
- Client-side cart pattern — how a storefront integrates

**Key concept**: The buy layer is a set of APIs. The product pages you just built are the top of the funnel — the cart and checkout sit below them and are swappable (Adobe Commerce, custom, or third-party).

---

<details>
<summary><strong>After the steps</strong></summary>

## Real-World Applications

The patterns in this lab are exactly what production commerce sites use:

**Namespace prefixes for isolation**
`/products-en/`, `/products-fr/`, `/products-de/` — one site, multiple catalogs, one mixer routing rule per locale. You just built the same pattern with per-student prefixes.

**Path-as-identity**
The product's URL path is its primary key. Changing a product's URL is a deliberate, meaningful operation — not an accidental re-keying of some internal ID.

**Editorial + commerce merge**
Marketing authors product stories in DA.live without ever touching the commerce system. The commerce team updates pricing without ever touching DA.live. Both updates land on the same product page automatically.

---

## Key Takeaways

- **Path = identity** — In Product Bus, where a product lives *is* its address. The SKU is just an attribute.
- **Namespace prefixes scale** — The same pattern that gives 30 students isolation today gives a global brand locale isolation in production.
- **Indexing is free** — Every catalog root auto-generates index JSON, sitemap, and Merchant Center feed. Zero configuration per namespace.
- **Two-source pages** — Product Bus data and DA.live authored content merge at the same path. Neither system owns the page exclusively.
- **Buy is an API layer** — The commerce funnel (cart, checkout, orders) integrates below the product pages you built. The pages are the top of the funnel.

</details>

---

## Verification Checklist

- [ ] Dry-run shows correct prefix (`products-<your-branch>`) for all 6 products
- [ ] Ingest succeeds: 3 indexes created, `6 saved, 0 failed`
- [ ] `GET` one product from the API returns full JSON
- [ ] `/products-<branch>/index.json` shows all 6 products
- [ ] `/products-<branch>/swag/index.json` shows 3 swag products
- [ ] `/products-<branch>/guides/index.json` shows 3 guide products
- [ ] `sitemap.xml` lists all 6 product URLs
- [ ] `merchant-center-feed.xml` is present
- [ ] Product detail page renders at `/products-<branch>/swag/masterclass-hoodie`
- [ ] Appending `.json` to the product URL returns raw product data
- [ ] All-products grid at `/products-<branch>` renders all 6 cards
- [ ] Swag grid at `/products-<branch>/swag` renders 3 cards
- [ ] Guides grid at `/products-<branch>/guides` renders 3 cards
- [ ] Clicking a card navigates to the correct product detail page
- [ ] Authored enrichment appears on the product detail page alongside structured data

---

## Troubleshooting Common Issues

**Wrong prefix in dry-run output**

The script reads your current git branch. Confirm you're on your personal branch:
```bash
git branch --show-current
```
If it shows `main` or another branch, switch first:
```bash
git checkout jsmith
```
Or override the prefix manually:
```bash
node labs/product-bus/generate-products.mjs --dry-run --prefix jsmith
```

**Ingest returns HTTP 401**

The API token on the lab sheet has expired or is incorrect. Ask the instructor for a fresh token.

**Product GET returns 404**

Wait 5–10 seconds after ingest and retry — the write may not have propagated yet.

**index.json is 404 after ingest**

The indexer runs asynchronously. Wait 30–60 seconds and refresh. If still missing after 2 minutes, let the instructor know.

**Product page shows 404**

- Confirm the mixer routing is active: `/products-*/**` should be in the site's `config.json`
- Confirm you're using your branch URL: `https://<branch>--labs--edsmasterclass.aem.page/...`
- Confirm the product was successfully ingested (check the API GET in Step 1c)

**Product page renders but authored enrichment doesn't appear**

- Confirm you **published** the document in DA.live (Preview alone is not enough)
- Confirm the DA.live path matches the product path exactly — `/products-jsmith/swag/masterclass-hoodie` (no trailing slash, lowercase)
- Hard refresh: Cmd+Shift+R / Ctrl+Shift+R

**product-grid block not found after `git checkout answers`**

Ask the instructor to confirm the `answers` branch has the `blocks/product-grid/` directory committed.

**Product grid shows "Unable to load products right now"**

Open DevTools → Network and check the request to `index.json`. Common causes:
- The index hasn't finished generating yet (wait and refresh)
- The path in the block points to the wrong namespace — confirm it matches your branch prefix exactly

---

## References

- [Product Bus API reference](https://main--helix-website--adobe.aem.page/drafts/dyland/product-bus-api-reference)
- [EDS Markup Reference](https://www.aem.live/developer/markup-sections-blocks)
- [diyFIRE end-to-end demo](https://demo.bbird.live) — reference implementation of the same pattern

---

## Next Exercise

This is the final hands-on lab. The instructor will close with a Q&A on the buy-side API layer and next steps for your own Product Bus implementation.
