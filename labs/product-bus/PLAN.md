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
| **Index** — Async workers generate index + sitemap + merchant feed | Observe: visit the auto-generated `/index.json`, `/sitemap.xml`, `/merchant-center-feed.xml` URLs |
| **Delivery** — Product pages combine Product Bus data + EDS authored enrichment | Hands-on: browse rendered product pages; author an enrichment block in DA.live and see it merge |
| **Buy** — Auth, checkout, orders, client-side cart | Show: instructor demos the API shape; no hands-on in this lab |

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

Generated via: `node generate-products.mjs --api <token> --org edsmasterclass --site labs`

---

## Proposed Lab Structure (30 min)

### Step 1 — Ingest (8 min) · Hands-on

Students run the pre-written generator script against a shared sandbox org.

- Review the product payload structure (SKU, path, price, description, custom attributes)
- Run `node generate-products.mjs --api <token>`
- Observe the table output and confirmation of 6 products saved
- `GET` one product back from the API to verify storage

**Key concept:** Products are stored by URL path, not SKU. The path IS the product page URL.

**Decision needed:** Token distribution — recommend a shared `edsmasterclass/labs` sandbox with token printed on the lab sheet.

---

### Step 2 — Index (5 min) · Observe

Instructor walks through the auto-generated outputs; students open URLs in browser.

- `/us/en/index.json` — query index (default-index)
- `/us/en/sitemap.xml` — product sitemap
- `/us/en/merchant-center-feed.xml` — Google Merchant Center feed

**Key concept:** Indexing is async — triggered automatically by ingest, no action required. Same products, three formats, zero extra work.

---

### Step 3 — Delivery (12 min) · Hands-on

Students browse rendered product pages, then author enrichment content.

**Part A — Explore rendered output (5 min):**
- Browse a product HTML page: see structured data rendered with JSON-LD
- Append `.json` to the URL: see the raw product data
- Instructor explains the dual source: Product Bus data + authored content from EDS

**Part B — Author enrichment in DA.live (7 min):**
- Open DA.live at the same path as a product page
- Add a 2-3 sentence enrichment block (e.g., "Why we made this" editorial copy)
- Preview and publish
- Reload the product page — see authored content appear alongside structured data

**Key concept:** Product Bus handles commerce data; EDS authors handle editorial voice. One page, two sources, neither team steps on the other.

---

### Step 4 — Buy (5 min) · Show

Instructor demos; no student action required.

- `POST /auth/token` — how authentication works
- Cart payload shape — add-to-cart API structure
- Orders endpoint — brief look at order management
- Client-side cart pattern — how a storefront JS cart integrates

**Key concept:** The "buy" layer is an API layer. The product pages students just built are the top of funnel — cart/checkout sit below them and are swappable (Adobe Commerce, custom, third-party).

---

## Open Questions

1. **Token distribution**: Shared sandbox org (recommended) vs per-student org provisioning?
2. **DA.live access**: Do lab participants have DA.live access to `edsmasterclass/labs` pre-provisioned, or does this need setup?
3. **Pre-ingest**: Should products be pre-ingested before the session (students start at Step 2) to save time, or is running the ingest script part of the experience?
4. **Index creation**: Does the `edsmasterclass/labs` index need to be manually created before ingest, or is this pre-configured in the sandbox?
5. **aem.network routing**: Is mixer routing pre-configured for `/products/*` on the lab site, or do we show that as part of Step 3?

---

## Files To Create

- [ ] `labs/product-bus/instructions.md` — the student-facing lab guide
- [ ] `labs/product-bus/generate-products.mjs` — copy/symlink from `helix-product-bus/masterclass/`
- [ ] `blocks/product-*` — any product listing or detail blocks needed
- [ ] DA.live content stubs at `/products/swag/*` and `/products/guides/*` paths

---

## References

- Product catalog source: `helix-product-bus/masterclass/generate-products.mjs`
- diyFIRE demo reference: `helix-product-bus/diyfire/` (same generator pattern)
- Product Bus API docs: `https://main--helix-website--adobe.aem.page/drafts/dyland/product-bus-api-reference`
- Existing exercises for format reference: `labs/exercise5/instructions.md` (closest in concept)
