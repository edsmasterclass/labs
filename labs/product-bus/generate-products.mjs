/**
 * Generate Product Bus PUT payloads for the EDS NYC Masterclass lab site.
 *
 * Two categories, 3 products each:
 *   /products/swag/*    — branded merchandise (physical, open access)
 *   /products/guides/*  — developer reference guides (PDF + print)
 *
 * Usage:
 *   node generate-products.mjs [options]
 *
 * Options:
 *   --api <token>           Call the Product Bus bulk API to ingest all products
 *   --org <org>             Organization slug          (default: edsmasterclass)
 *   --site <site>           Site slug                  (default: labs)
 *   --prefix <prefix>       Catalog root prefix        (default: current git branch)
 *                           Products land at /products-<prefix>/<category>/<slug>
 *   --dry-run               Write JSON and print payloads, but skip the API call
 *                           (this is the default when --api is omitted)
 *
 * Output:
 *   masterclass-products.json  — array of Product Bus PUT payloads (one per product)
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const apiToken = (() => {
  const i = process.argv.indexOf('--api');
  return i !== -1 ? process.argv[i + 1] : null;
})();

const org = (() => {
  const i = process.argv.indexOf('--org');
  return i !== -1 ? process.argv[i + 1] : 'edsmasterclass';
})();

const site = (() => {
  const i = process.argv.indexOf('--site');
  return i !== -1 ? process.argv[i + 1] : 'labs';
})();

const dryRun = process.argv.includes('--dry-run') || !apiToken;

const prefix = (() => {
  const i = process.argv.indexOf('--prefix');
  if (i !== -1) return process.argv[i + 1];
  try {
    return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf-8' }).trim();
  } catch {
    return 'main';
  }
})();

// Images — replace with actual hosted assets before going live.
// Using placehold.co for lab/demo purposes.
const IMG = {
  hoodie:   'https://placehold.co/800x600/002060/ffffff?text=Masterclass+Hoodie',
  stickers: 'https://placehold.co/800x600/eb1000/ffffff?text=Developer+Sticker+Pack',
  deskkit:  'https://placehold.co/800x600/1473e6/ffffff?text=Masterclass+Desk+Kit',
  blocks:   'https://placehold.co/800x600/002060/ffffff?text=EDS+Block+Dev+Field+Guide',
  workers:  'https://placehold.co/800x600/f38020/ffffff?text=Cloudflare+Workers+for+AEM',
  complete: 'https://placehold.co/800x600/eb1000/ffffff?text=EDS+Complete+Reference',
};

const SITE_BASE_URL = `https://${prefix}--labs--edsmasterclass.aem.page`;
const API_BASE_URL = 'https://api.adobecommerce.live';

// ---------------------------------------------------------------------------
// Product catalog definition
// ---------------------------------------------------------------------------

/** @type {Array<{category: string, products: object[]}>} */
const catalog = [
  {
    category: 'swag',
    products: [
      {
        sku: 'masterclass-hoodie',
        image: IMG.hoodie,
        name: 'Masterclass Hoodie',
        shortDescription: 'Limited-edition pullover hoodie from the Adobe EDS Masterclass 2026.',
        description: `
<h2>Wear the Build</h2>
<p>The official Masterclass 2026 hoodie. Midweight French terry, pre-shrunk, with the Adobe Edge Delivery Services wordmark embroidered on the chest and a city skyline graphic on the back.</p>
<p>Limited run — printed only for event attendees and lab participants. Once they're gone, they're gone.</p>
<h3>Details</h3>
<ul>
  <li>80% cotton / 20% polyester midweight French terry</li>
  <li>Embroidered chest logo, screen-printed back graphic</li>
  <li>Unisex sizing XS–3XL</li>
  <li>Colorway: Midnight Navy with Adobe Red accents</li>
  <li>Machine washable, tumble dry low</li>
</ul>
<div class="table no-header">
  <table>
    <tbody>
      <tr><td><strong>Material</strong></td><td>80% cotton / 20% polyester</td></tr>
      <tr><td><strong>Sizes</strong></td><td>XS, S, M, L, XL, 2XL, 3XL</td></tr>
      <tr><td><strong>Color</strong></td><td>Midnight Navy / Adobe Red</td></tr>
      <tr><td><strong>Delivery</strong></td><td>Ships within 5–7 business days</td></tr>
    </tbody>
  </table>
</div>
        `.trim(),
        metaTitle: 'Masterclass Hoodie — Adobe EDS Masterclass 2026 Limited Edition',
        metaDescription: 'Official limited-edition hoodie from the Adobe Edge Delivery Services Masterclass 2026. Embroidered chest logo, city skyline back print. Unisex XS–3XL.',
        metaKeyword: 'Adobe EDS hoodie, Masterclass swag, Edge Delivery Services merch, developer hoodie 2026',
        prices: { regular: { amount: 59.00, currency: 'USD' }, final: { amount: 59.00, currency: 'USD' } },
        attributes: [
          { name: 'material', label: 'Material', value: '80% cotton / 20% polyester' },
          { name: 'sizes', label: 'Sizes', value: 'XS, S, M, L, XL, 2XL, 3XL' },
          { name: 'color', label: 'Color', value: 'Midnight Navy / Adobe Red' },
          { name: 'delivery', label: 'Delivery', value: 'Ships within 5–7 business days' },
        ],
      },
      {
        sku: 'developer-sticker-pack',
        image: IMG.stickers,
        name: 'Developer Sticker Pack',
        shortDescription: '20-sticker set covering EDS, Cloudflare Workers, DA.live, and the full AEM stack.',
        description: `
<h2>Sticker Your Stack</h2>
<p>A curated set of 20 die-cut vinyl stickers for developers who build on Adobe Edge Delivery Services. Laptop-safe, weatherproof, and just the right amount of nerdy.</p>
<h3>What's in the pack</h3>
<ul>
  <li>Adobe Edge Delivery Services logo (2 sizes)</li>
  <li>Cloudflare Workers orange swirl</li>
  <li>DA.live wordmark</li>
  <li>"Lighthouse 100" achievement badge</li>
  <li>EDS block anatomy diagram (mini poster sticker)</li>
  <li>Masterclass 2026 event badge</li>
  <li>...and 13 more hand-drawn dev jokes and icons</li>
</ul>
<p>All stickers are UV-resistant vinyl with a matte finish. Safe for laptops, water bottles, and monitor bezels.</p>
<div class="table no-header">
  <table>
    <tbody>
      <tr><td><strong>Count</strong></td><td>20 stickers</td></tr>
      <tr><td><strong>Finish</strong></td><td>Matte vinyl, UV-resistant</td></tr>
      <tr><td><strong>Sizes</strong></td><td>2 cm – 10 cm (varies per design)</td></tr>
      <tr><td><strong>Delivery</strong></td><td>Ships within 3–5 business days</td></tr>
    </tbody>
  </table>
</div>
        `.trim(),
        metaTitle: 'Developer Sticker Pack — Adobe EDS, Cloudflare Workers & AEM Stack (20 Stickers)',
        metaDescription: '20 die-cut vinyl stickers for EDS developers. Covers Adobe Edge Delivery Services, Cloudflare Workers, DA.live, Lighthouse 100 badge, and more. Matte, UV-resistant.',
        metaKeyword: 'Adobe EDS stickers, developer sticker pack, Cloudflare Workers sticker, AEM sticker, laptop stickers developer',
        prices: { regular: { amount: 12.00, currency: 'USD' }, final: { amount: 12.00, currency: 'USD' } },
        attributes: [
          { name: 'count', label: 'Count', value: '20 stickers' },
          { name: 'finish', label: 'Finish', value: 'Matte vinyl, UV-resistant' },
          { name: 'sizes', label: 'Sizes', value: '2 cm – 10 cm (varies per design)' },
          { name: 'delivery', label: 'Delivery', value: 'Ships within 3–5 business days' },
        ],
      },
      {
        sku: 'masterclass-desk-kit',
        image: IMG.deskkit,
        name: 'Masterclass Desk Kit',
        shortDescription: 'Ceramic mug, softcover notebook, and pen — all in a branded gift box.',
        description: `
<h2>Equip Your Build Station</h2>
<p>Everything you need to fuel a long coding session, all in one box. The Masterclass Desk Kit is a curated set of everyday essentials with the EDS aesthetic — minimal, fast, built to last.</p>
<h3>What's included</h3>
<ul>
  <li><strong>Ceramic mug (12 oz)</strong> — "Ships in Seconds" tagline, dishwasher safe</li>
  <li><strong>Softcover notebook (A5)</strong> — dot-grid, 120 pages, lay-flat binding, EDS branding on cover</li>
  <li><strong>Ballpoint pen</strong> — matte black barrel with Adobe Red clip, smooth blue ink</li>
  <li><strong>Sticker bonus</strong> — 3 exclusive stickers included (not in the Sticker Pack)</li>
</ul>
<p>Packaged in a rigid gift box with tissue paper. Ships flat-rate, ready to gift.</p>
<div class="table no-header">
  <table>
    <tbody>
      <tr><td><strong>Includes</strong></td><td>Mug, notebook, pen, 3 stickers</td></tr>
      <tr><td><strong>Mug capacity</strong></td><td>12 oz ceramic, dishwasher safe</td></tr>
      <tr><td><strong>Notebook</strong></td><td>A5 dot-grid, 120 pages</td></tr>
      <tr><td><strong>Delivery</strong></td><td>Ships within 5–7 business days</td></tr>
    </tbody>
  </table>
</div>
        `.trim(),
        metaTitle: 'Masterclass Desk Kit — Mug, Notebook & Pen for Adobe EDS Developers',
        metaDescription: 'Adobe EDS Masterclass desk gift set: 12 oz ceramic mug, A5 dot-grid notebook, ballpoint pen, and 3 exclusive stickers. Packaged in a branded gift box.',
        metaKeyword: 'Adobe developer gift set, EDS desk kit, masterclass merch, developer mug notebook, masterclass gift',
        prices: { regular: { amount: 39.00, currency: 'USD' }, final: { amount: 39.00, currency: 'USD' } },
        attributes: [
          { name: 'includes', label: 'Includes', value: 'Mug, notebook, pen, 3 stickers' },
          { name: 'mug_capacity', label: 'Mug capacity', value: '12 oz ceramic, dishwasher safe' },
          { name: 'notebook', label: 'Notebook', value: 'A5 dot-grid, 120 pages' },
          { name: 'delivery', label: 'Delivery', value: 'Ships within 5–7 business days' },
        ],
      },
    ],
  },
  {
    category: 'guides',
    products: [
      {
        sku: 'eds-block-development-field-guide',
        image: IMG.blocks,
        name: 'EDS Block Development Field Guide',
        shortDescription: 'The practitioner\'s handbook for building, testing, and shipping EDS blocks.',
        description: `
<h2>Everything You Need to Build Better Blocks</h2>
<p>The EDS Block Development Field Guide is a compact, no-fluff reference for developers who build on Adobe Edge Delivery Services. Whether you're writing your first block or refactoring a block library for a large enterprise site, this guide covers the patterns and pitfalls that matter.</p>
<p>Structured as a field guide rather than a tutorial — jump to the section you need, find the pattern, ship the code.</p>
<h3>What's covered</h3>
<ul>
  <li>Block anatomy: decoration lifecycle, eager vs lazy vs delayed phases</li>
  <li>Content modeling: tables in DA.live, metadata, and query index design</li>
  <li>Performance: Core Web Vitals, LCP optimization, font loading strategies</li>
  <li>CSS patterns: scoping, custom properties, mobile-first breakpoints</li>
  <li>Testing blocks with Playwright and the AEM CLI</li>
  <li>Repoless multi-site: sharing blocks across brands with the Configuration Service</li>
  <li>AI-assisted development with Claude Code and AGENTS.md</li>
</ul>
<div class="table no-header">
  <table>
    <tbody>
      <tr><td><strong>Format</strong></td><td>PDF &amp; print (perfect bound)</td></tr>
      <tr><td><strong>Pages</strong></td><td>220</td></tr>
      <tr><td><strong>Language</strong></td><td>English</td></tr>
      <tr><td><strong>Edition</strong></td><td>2026 (updated for EDS v8)</td></tr>
    </tbody>
  </table>
</div>
        `.trim(),
        metaTitle: 'EDS Block Development Field Guide — Adobe Edge Delivery Services 2026 Edition',
        metaDescription: 'The practitioner\'s handbook for building EDS blocks. Covers block anatomy, content modeling, Core Web Vitals, CSS patterns, Playwright testing, and AI-assisted development.',
        metaKeyword: 'EDS block development, Adobe Edge Delivery guide, AEM block patterns, EDS developer handbook, block collection guide',
        prices: { regular: { amount: 29.00, currency: 'USD' }, final: { amount: 29.00, currency: 'USD' } },
        attributes: [
          { name: 'format', label: 'Format', value: 'PDF & print (perfect bound)' },
          { name: 'pages', label: 'Pages', value: '220' },
          { name: 'language', label: 'Language', value: 'English' },
          { name: 'edition', label: 'Edition', value: '2026 (updated for EDS v8)' },
        ],
      },
      {
        sku: 'cloudflare-workers-for-aem-developers',
        image: IMG.workers,
        name: 'Cloudflare Workers for AEM Developers',
        shortDescription: 'Build edge functions, form handlers, and API middleware for EDS sites with Cloudflare Workers.',
        description: `
<h2>Extend EDS at the Edge</h2>
<p>Cloudflare Workers are the natural extension point for Adobe Edge Delivery Services — and this guide teaches you to use them well. From your first <code>wrangler deploy</code> to production-grade middleware patterns, every concept is grounded in real EDS use cases.</p>
<p>Written specifically for developers who know EDS but are new to Cloudflare Workers. No prior Cloudflare experience required.</p>
<h3>Topics covered</h3>
<ul>
  <li>Workers fundamentals: fetch handler, Request/Response, environment bindings</li>
  <li>Wrangler CLI: local dev, secrets, environments, and deploy pipelines</li>
  <li>Form handling and webhook forwarding (Slack, HubSpot, Marketo patterns)</li>
  <li>Secure API proxying: hiding third-party credentials from the browser</li>
  <li>helix-mixer deep dive: pattern-based routing and backend configuration</li>
  <li>KV and R2 storage for edge-cached product data and media</li>
  <li>Durable Objects: session state and real-time features at the edge</li>
  <li>Observability: Workers Analytics, tail workers, and error tracking</li>
</ul>
<div class="table no-header">
  <table>
    <tbody>
      <tr><td><strong>Format</strong></td><td>PDF &amp; print (perfect bound)</td></tr>
      <tr><td><strong>Pages</strong></td><td>185</td></tr>
      <tr><td><strong>Language</strong></td><td>English</td></tr>
      <tr><td><strong>Edition</strong></td><td>2026 (Cloudflare Workers v3)</td></tr>
    </tbody>
  </table>
</div>
        `.trim(),
        metaTitle: 'Cloudflare Workers for AEM Developers — Edge Functions for Adobe EDS Sites',
        metaDescription: 'Build edge functions, API middleware, and form handlers for EDS with Cloudflare Workers. Covers Wrangler CLI, KV, R2, Durable Objects, and helix-mixer routing.',
        metaKeyword: 'Cloudflare Workers AEM, EDS edge functions, helix-mixer guide, Wrangler CLI tutorial, Adobe EDS Cloudflare',
        prices: { regular: { amount: 24.00, currency: 'USD' }, final: { amount: 24.00, currency: 'USD' } },
        attributes: [
          { name: 'format', label: 'Format', value: 'PDF & print (perfect bound)' },
          { name: 'pages', label: 'Pages', value: '185' },
          { name: 'language', label: 'Language', value: 'English' },
          { name: 'edition', label: 'Edition', value: '2026 (Cloudflare Workers v3)' },
        ],
      },
      {
        sku: 'edge-delivery-services-complete-reference',
        image: IMG.complete,
        name: 'Edge Delivery Services: The Complete Reference',
        shortDescription: 'The definitive desk reference for the full Adobe EDS platform — authoring to delivery.',
        description: `
<h2>One Book. The Whole Platform.</h2>
<p>Edge Delivery Services: The Complete Reference is the most comprehensive resource available for teams building on Adobe EDS. It covers every layer of the stack — from DA.live authoring to Cloudflare edge delivery — in a format designed for daily use by developers, architects, and content leads alike.</p>
<p>Organized by role and use case rather than by API surface. Skip to your team's section; share the whole book with everyone.</p>
<h3>What's inside</h3>
<ul>
  <li><strong>Part 1 — Authoring</strong>: DA.live, content tables, metadata, sidekick, preview/publish pipeline</li>
  <li><strong>Part 2 — Block Development</strong>: anatomy, decoration, CSS conventions, performance, testing</li>
  <li><strong>Part 3 — Data &amp; APIs</strong>: Sheets → JSON, query index, JSON2HTML, Product Bus ingestion and rendering</li>
  <li><strong>Part 4 — Edge &amp; Infrastructure</strong>: helix-mixer routing, Cloudflare Workers, repoless config, CDN strategy</li>
  <li><strong>Part 5 — Operations</strong>: cache invalidation, monitoring, deployment pipelines, incident response</li>
  <li><strong>Appendices</strong>: Block cheat sheet, API reference quick cards, Lighthouse audit checklist</li>
</ul>
<div class="table no-header">
  <table>
    <tbody>
      <tr><td><strong>Format</strong></td><td>PDF &amp; print (hardcover)</td></tr>
      <tr><td><strong>Pages</strong></td><td>480</td></tr>
      <tr><td><strong>Language</strong></td><td>English</td></tr>
      <tr><td><strong>Edition</strong></td><td>2026 (covers EDS v8 + Product Bus v2)</td></tr>
    </tbody>
  </table>
</div>
        `.trim(),
        metaTitle: 'Edge Delivery Services: The Complete Reference — Adobe EDS 2026 Edition',
        metaDescription: 'The definitive 480-page reference for Adobe Edge Delivery Services. Covers DA.live authoring, block development, Product Bus, helix-mixer, Cloudflare Workers, and operations.',
        metaKeyword: 'Adobe Edge Delivery Services book, EDS complete guide, AEM EDS reference 2026, helix developer handbook, Product Bus guide',
        prices: { regular: { amount: 49.00, currency: 'USD' }, final: { amount: 49.00, currency: 'USD' } },
        attributes: [
          { name: 'format', label: 'Format', value: 'PDF & print (hardcover)' },
          { name: 'pages', label: 'Pages', value: '480' },
          { name: 'language', label: 'Language', value: 'English' },
          { name: 'edition', label: 'Edition', value: '2026 (covers EDS v8 + Product Bus v2)' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Build Product Bus payloads
// ---------------------------------------------------------------------------

const products = catalog.flatMap(({ category, products: categoryProducts }) =>
  categoryProducts.map((p) => {
    const path = `/products-${prefix}/${category}/${p.sku}`;
    const images = p.image ? [{ url: p.image, label: p.name }] : [];

    return {
      sku: p.sku,
      name: p.name,
      path,
      url: `${SITE_BASE_URL}${path}`,
      urlKey: p.sku,
      type: 'simple',
      availability: 'InStock',
      description: p.description,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      images,
      price: {
        currency: 'USD',
        regular: p.prices.regular.amount.toFixed(2),
        final: p.prices.final.amount.toFixed(2),
      },
      custom: Object.fromEntries(p.attributes.map(({ name, value }) => [name, value])),
    };
  }),
);

// ---------------------------------------------------------------------------
// Table summary
// ---------------------------------------------------------------------------

const nameWidth = Math.max(4, ...products.map((p) => p.name.length));
const pathWidth = Math.max(4, ...products.map((p) => p.path.length));
const priceWidth = 10;

const sep = `+-${'-'.repeat(nameWidth)}-+-${'-'.repeat(pathWidth)}-+-${'-'.repeat(priceWidth)}-+`;
const row = (name, path, price) =>
  `| ${name.padEnd(nameWidth)} | ${path.padEnd(pathWidth)} | ${price.padEnd(priceWidth)} |`;

console.log(`\nEDS Masterclass — Product Bus Payloads  [prefix: products-${prefix}]\n`);
console.log(sep);
console.log(row('Name', 'Path', 'Price (USD)'));
console.log(sep);
for (const p of products) {
  const price = `$${p.price.final}`;
  console.log(row(p.name, p.path, price));
}
console.log(sep);
console.log(`\n${products.length} products across ${catalog.length} categories.\n`);

// ---------------------------------------------------------------------------
// Write JSON output
// ---------------------------------------------------------------------------

const outFile = resolve(__dirname, 'masterclass-products.json');
writeFileSync(outFile, JSON.stringify(products, null, 2), 'utf-8');
console.log(`Wrote ${products.length} Product Bus payloads → ${outFile}`);

// ---------------------------------------------------------------------------
// Call the bulk API (if --api token provided)
// ---------------------------------------------------------------------------

if (dryRun) {
  if (!apiToken) {
    console.log('\nNo --api token provided. Run with --api <token> to ingest into the Product Bus.');
  }
} else {
  const endpoint = `${API_BASE_URL}/${org}/sites/${site}/catalog/*`;
  console.log(`\nCalling bulk API: POST ${endpoint}`);
  console.log(`Ingesting ${products.length} products (${Math.ceil(products.length / 50)} batch(es))...`);

  const BATCH_SIZE = 50;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    // eslint-disable-next-line no-await-in-loop
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(batch),
    });

    if (res.ok) {
      const body = await res.json();
      const saved = body.products ?? (body.product ? [body.product] : []);
      successCount += saved.length;
      console.log(`  Batch ${batchNum}: ✓ ${saved.length} product(s) saved (HTTP ${res.status})`);
    } else {
      failCount += batch.length;
      const errText = await res.text();
      console.error(`  Batch ${batchNum}: ✗ HTTP ${res.status} — ${errText}`);
    }
  }

  console.log(`\nDone. ${successCount} saved, ${failCount} failed.`);
}
