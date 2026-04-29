# Product Bus Lab — Plan

**Target duration:** 30 min  
**Audience:** EDS developers evaluating Adobe Commerce / Product Bus  
**Follows:** Exercise 5 (JSON2HTML) — natural progression from "data → pages" to "commerce data → product pages at scale"

---

## Talk Track Coverage

The lab maps directly to the 4 areas of the Edge Commerce e2e talk track:

| Area | Lab treatment |
|---|---|
| **Ingest** — ETL pushes product data to Helix Commerce API | Hands-on: run the generator script, ingest 6 products via bulk API |
| **Index** — Async workers generate index + sitemap + merchant feed | Observe: each student visits *their own* auto-generated `index.json`, `sitemap.xml`, `merchant-center-feed.xml` |
| **Delivery** — Product pages combine Product Bus data + EDS authored enrichment | Hands-on: browse rendered product pages; author an enrichment block in DA.live and see it merge |
| **Buy** — Auth, checkout, orders, client-side cart | Show: instructor demos the API shape; no hands-on in this lab |

---

## Per-Student Isolation (departure from earlier exercises)

Earlier exercises isolate students along two independent axes: **code** by git branch, **content** by DA.live folder (`/drafts/<your-name>/`). Product Bus has neither — the catalog is `(org, site)`-scoped, so a naive lab would have 30 students overwriting each other on the same product paths.

**Solution:** each student gets their own product namespace at the top level — `/products-<branch>/...` — sibling to (not nested inside) a production-style catalog root. This restores two-axis isolation and is also a real production pattern (locale- or brand-scoped sub-catalogs like `/products-en/`, `/products-fr/`).

| Concept | Pattern | Example for student `jsmith` |
|---|---|---|
| Product path | `/products-<branch>/<category>/<slug>` | `/products-jsmith/swag/masterclass-hoodie` |
| Index | `/products-<branch>/index.json` | `/products-jsmith/index.json` |
| Sitemap | `/products-<branch>/sitemap.xml` | `/products-jsmith/sitemap.xml` |
| Merchant feed | `/products-<branch>/merchant-center-feed.xml` | `/products-jsmith/merchant-center-feed.xml` |
| DA.live enrichment | `/products-<branch>/<category>/<slug>` | `/products-jsmith/swag/masterclass-hoodie` |
| Mixer routing | One entry per student | `/products-jsmith/*` → product-pipeline-worker |

**Two-axis isolation restored:**
- **Branch** picks the *code* (blocks/scripts/styles for the rendered page).
- **Path prefix** picks the *data* (which mini-catalog the page reads from).

**What students preview:**
```
https://jsmith--labs--edsmasterclass.aem.page/products-jsmith/swag/masterclass-hoodie
```

This pattern doubles as a teaching point: production sites use the same prefixing convention to scope catalogs by locale, brand, or business unit.

---

## Product Catalog

Pre-built in `helix-product-bus/masterclass/` (adjacent repo):

| Category | Product | Price |
|---|---|---|
| swag | Masterclass Hoodie | $59 USD |
| swag | Developer Sticker Pack | $12 USD |
| swag | Masterclass Desk Kit | $39 USD |
| guides | EDS Block Development Field Guide | $29 USD |
| guides | Cloudflare Workers for AEM Developers | $24 USD |
| guides | Edge Delivery Services: The Complete Reference | $49 USD |

Each student ingests the same 6 products under their own `/products-<branch>/` namespace:

```bash
node generate-products.mjs --api <token> --org edsmasterclass --site labs
```

The script auto-derives `<branch>` from `git branch --show-current` and POSTs products to `/products-<branch>/<category>/<slug>`. A `--prefix` flag overrides the default if needed.

---

## Proposed Lab Structure (30 min)

### Step 1 — Ingest (8 min) · Hands-on

Students run the pre-written generator script against the shared sandbox.

- Review the product payload structure (SKU, path, price, description, custom attributes)
- Confirm the auto-derived prefix matches the student's git branch (`/products-jsmith/`)
- Run `node generate-products.mjs --api <token>`
- Observe the table output and confirmation of 6 products saved
- `GET` one product back from the API to verify storage:
  ```
  https://api.adobecommerce.live/edsmasterclass/sites/labs/catalog/products-jsmith/swag/masterclass-hoodie
  ```

**Key concept:** **Path-as-identity** — the URL path *is* the product's address in Product Bus. SKU is just an attribute. Per-student namespace prefixes give us isolation without per-student sites.

---

### Step 2 — Index (5 min) · Observe

Each student opens their own auto-generated outputs in the browser. No instructor walkthrough required — they each see exactly the 6 products they just ingested.

- `https://main--labs--edsmasterclass.aem.page/products-<branch>/index.json` — query index
- `https://main--labs--edsmasterclass.aem.page/products-<branch>/sitemap.xml` — product sitemap
- `https://main--labs--edsmasterclass.aem.page/products-<branch>/merchant-center-feed.xml` — Google Merchant Center feed

**Key concept:** Indexing is async and free — triggered automatically by ingest, no action required. Same products, three formats, zero extra work. Each catalog root gets its own feeds.

---

### Step 3 — Delivery (12 min) · Hands-on

Students browse rendered product pages, then author enrichment content.

**Part A — Explore rendered output (5 min):**
- Browse a product HTML page: see structured data rendered with JSON-LD
  ```
  https://jsmith--labs--edsmasterclass.aem.page/products-jsmith/swag/masterclass-hoodie
  ```
- Append `.json` to the URL: see the raw product data
- Instructor explains the dual source: Product Bus data + authored content from EDS

**Part B — Author enrichment in DA.live (7 min):**
- Open DA.live at the matching path: `/products-<branch>/swag/masterclass-hoodie`
- Add a 2-3 sentence enrichment block (e.g., "Why we made this" editorial copy)
- Preview and publish
- Reload the product page — see authored content appear alongside structured data

**Key concept:** Product Bus handles commerce data; EDS authors handle editorial voice. One page, two sources, neither team steps on the other — and the merge happens at the same path.

---

### Step 4 — Buy (5 min) · Show

Instructor demos; no student action required.

- `POST /auth/token` — how authentication works
- Cart payload shape — add-to-cart API structure
- Orders endpoint — brief look at order management
- Client-side cart pattern — how a storefront JS cart integrates

**Key concept:** The "buy" layer is an API layer. The product pages students just built are the top of the funnel — cart/checkout sit below them and are swappable (Adobe Commerce, custom, third-party).

---

## Pre-Lab Setup (instructor)

These items must be configured **before** the session. They are not student-facing tasks.

- [ ] **Sandbox** — `edsmasterclass/labs` exists with Product Bus enabled
- [ ] **Mixer routing** — register one `/products-<branch>/*` entry per attendee in `helix-mixer` config (one entry per student name from the lab roster)
- [ ] **Indexer** — confirm `helix-product-indexer` emits per-namespace feeds at `/products-<branch>/index.json`, `sitemap.xml`, `merchant-center-feed.xml` (see Open Questions if not)
- [ ] **DA.live access** — students provisioned for `edsmasterclass/labs` (typically already covered by SETUP.md Step 9)
- [ ] **API token** — shared token printed on the lab sheet, scoped only to the `labs` site

---

## Open Questions

1. **Token distribution** — confirm a shared sandbox token is acceptable. Per-student namespaces remove collision risk, so this is now low-risk; recommend printing on the lab sheet.
2. **Indexer per-namespace feeds** — verify `helix-product-indexer` auto-emits feeds per catalog root (`/products-<branch>/index.json` etc.). If it doesn't today, this is the only blocker for the per-student-feed teaching moment in Step 2 — and is plausibly a capability worth shipping for Agilent (May 2026) anyway.
3. **Generator script auto-prefix** — confirm the design: default prefix from `git branch --show-current`, `--prefix` flag as override.

---

## Files To Create

- [ ] `labs/product-bus/instructions.md` — student-facing lab guide (use `labs/exercise5/instructions.md` as the format reference)
- [ ] `labs/product-bus/generate-products.mjs` — adapt from `helix-product-bus/masterclass/`, add `--prefix` flag with git-branch auto-detection (TDD per project convention)
- [ ] `blocks/product-*` — any product listing or detail blocks needed; committed on the `answers` branch and copied by students per the existing exercise pattern (TDD)
- [ ] DA.live content stubs at `/products-<branch>/swag/*` and `/products-<branch>/guides/*` paths (or instruct students to author from scratch)

---

## References

**Live demos:**
- diyFIRE end-to-end reference: https://demo.bbird.live
- diyFIRE generator source: `helix-product-bus/diyfire/generate-products.mjs` (same pattern as the masterclass catalog)

**Source repos:**
- `helix-product-bus` — commerce monorepo (Workers): `helix-commerce-api`, `helix-product-pipeline`, `helix-product-pipeline-worker`, `helix-product-indexer`, `helix-product-shared`
- `helix-mixer` — aem.network routing (per-student mixer entries live here)
- `helix-html-pipeline` — EDS Markdown → HTML rendering (relevant to the authored-enrichment merge)
- `helix-admin` — publish/preview/cache operations

**Product Bus docs:**
- API reference: https://main--helix-website--adobe.aem.page/drafts/dyland/product-bus-api-reference

**Related labs:**
- `labs/exercise5/instructions.md` — closest in concept (data → pages); use as format reference

**Strategic context:**
- This lab also serves as a teaching artifact for the patterns Agilent (VIP, May 2026 launch) will use — particularly the namespace-prefixed catalog model.
