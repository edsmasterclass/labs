# EDS Masterclass Labs: Lab Guide

**Theme**: Build pages and features for a Masterclass event series that can scale to future meetup sites.

**Sample content**: Sessions, speakers, agendas, and multi-city events used in these exercises are **fictitious**. They exist only to give you realistic pages and data to build against, not real public schedules or commitments.

> **Tip:** On GitHub (and most Markdown viewers), links usually open in the **same tab**. **⌘-click** (Mac) or **Ctrl-click** (Windows/Linux) a link to open it in a **new tab** so you can keep this page open.

---

## Before You Begin

**Complete setup**: [SETUP.md](SETUP.md) for Git, development environment, and access verification.

**Solutions**: Complete solutions for code-oriented exercises are on the [answers branch](https://github.com/edsmasterclass/labs/tree/answers). Those exercises link to it from their **Solution** section; Exercise 1 is authoring-only in Experience Workspace (no solution block there).

**Your environment**:
- Repository: https://github.com/edsmasterclass/labs
- Branch: `jsmith` (your first initial + last name). URLs for **your** code on Preview / Live look like `https://<branch>--labs--edsmasterclass.aem.page/` and `https://<branch>--labs--edsmasterclass.aem.live/`. They work only **after** that branch is pushed to GitHub ([SETUP Step 8](SETUP.md#step-8-understand-your-branch-urls), [Exercise 2](exercise2/instructions.md)). Until then, use `localhost:3000` and `main--` preview in the exercises.
- Local: verify [http://localhost:3000](http://localhost:3000). If not, follow [SETUP Step 6](SETUP.md#step-6-start-development-server). Day 2 exercises use `aem up`; the Day 1 AI lab uses `aem up --html-folder drafts`.

---

**Introduction**: EDS overview, architecture, lab objectives

**Exercise 1**: [Authoring Your First Page](exercise1/instructions.md)

**What you'll learn**:
- How to **manage content in Experience Workspace** (authoring model, tables → blocks)
- The **Preview** vs **Publish** workflow and what each environment represents
- How to **read document transformations** across source, `.md`, and `.plain.html`

**What you'll build**:
- Your **personal workspace** under `/drafts/<your-name>/`
- Your **first authored page** from a Session or Lab template
- A full **Preview → Publish** pass so you see content on `.aem.page` and `.aem.live`

**Key takeaway**: Authoring in Experience Workspace and delivery through EDS are connected by a clear pipeline. Follow the same content through each stage and the mental model clicks.

---

**Exercise 2**: [Block Development - Enhancements & Variations](exercise2/instructions.md)

**What you'll learn**:
- How **developer code** turns authored blocks into rendered experiences (**decoration**)
- Two ways to extend a block: **enhancements** (content patterns) vs **variations** (layout / author-chosen variants)
- Why **block-scoped, responsive CSS** matters for maintainability

**What you'll build**:
- **Draft test pages** that exercise the Cards block
- **Code changes** on your branch that add real behavior, not just static markup

**Key takeaway**: One block can stay one “contract” for authors while developers layer behavior underneath.

---

**Exercise 3**: [Dynamic Cards with Data Sources](exercise3/instructions.md)

**What you'll learn**:
- When **data** should drive the page instead of curated rows
- How **data** (e.g. Sheets → JSON) connects to the front end
- **Loading and failure** as first-class UX, not only the happy path

**What you'll build**:
- A **dynamic-cards** block wired to data you own in drafts
- A small **proof** that changing data changes the page without re-authoring every card

**Key takeaway**: Separate “what the data says” from “how the block renders it” and you can scale lists, catalogs, and directories.

---

**Exercise 4**: [Extend Search Block from Block Collection](exercise4/instructions.md)

**What you'll learn**:
- How **published site content** becomes a **search index**, and what never gets indexed
- How to **start from Block Collection** instead of inventing search from scratch
- How **composition** lets one block reuse another’s rendering

**What you'll build**:
- A **search** experience in your project
- A **discoverable** page in the indexed area of the site so search can actually find *your* work

**Key takeaway**: Search is “read the index, filter in the browser,” plus thoughtful reuse of existing blocks.

---

**Exercise 5**: [JSON2HTML - Generate Pages from Data](exercise5/instructions.md)

**What you'll learn**:
- The idea of **many URLs from one dataset** (list + detail) without authoring each page by hand
- How **templates + a worker + edge cache** fit together as a system
- Why **Sidekick Update** matters when data, not code, changed

**What you'll build**:
- **Confidence** in the pipeline by changing data and seeing new pages appear
- The **event** block on your branch so generated HTML still feels like a polished site

**Key takeaway**: Treat rows in a sheet like records in a database and let the platform generate pages at scale.

---

**Exercise 6**: [Third-Party Integrations with Edge Workers](exercise6/instructions.md)

**What you'll learn**:
- Why the **browser is the wrong place for secrets** when calling external APIs
- How an **Edge Worker** sits between your site and systems like Slack (or any HTTP API)
- How to keep authors and visitors **informed** while async work runs

**What you'll build**:
- A **feedback block** that collects input and POSTs to a worker
- An **end-to-end path** you can trace from the page to a third-party system

**Key takeaway**: Integrations are a trust boundary. Blocks collect; workers protect credentials and connect to external systems.

---

**Exercise 7**: [Repoless Multi-Site & Multi-Brand](exercise7/instructions.md)  
*Site Admin “clone site” requires Org Admin. If it is disabled for you, Step 1 explains how to request a clone and permissions.*

**What you'll learn**:
- **Repoless** as “many sites, one codebase” via configuration, not copy-paste repos
- How **content** and **code** can live in different places yet assemble into one experience
- **Multi-brand** as theming and metadata, not necessarily new repositories

**What you'll build**:
- A **second site** in Experience Workspace that reuses this project’s code
- **Evidence** (e.g. in DevTools) that shared scripts and styles really come from the shared repo

**Key takeaway**: Scale out sites and brands by separating *where content lives* from *where code lives*.

---

**Exercise 8**: [Experience Workspace Plugin Development](exercise8/instructions.md)

**What you'll learn**:
- How **plugins extend authoring** without polluting documents with raw embeds
- The split between **author experience** (paste, dialog) and **delivery** (clean block markup)
- How **local vs branch** loading speeds up plugin development

**What you'll build**:
- A **plugin + block pair** that turns messy third-party snippets into structured content
- A workflow authors could actually use week after week

**Key takeaway**: Plugins are the guardrail that keeps “easy for authors” and “safe for the site” aligned.

---

**Exercise 9**: [Product Bus - Commerce at the Edge](product-bus/instructions.md)

**What you'll learn**:
- How to ingest a product catalog and expose it through Product Bus endpoints
- How product data, index feeds, and authored content align on the same URL path
- How commerce and editorial teams can work independently while the page experience stays unified

**What you'll build**:
- A namespaced product catalog for your branch
- Product pages that merge structured commerce data with authored content
- A practical mental model for scaling product data across locales, brands, and teams

**Key takeaway**: Product Bus separates concerns cleanly. Commerce owns structured data, authors own storytelling, and Edge Delivery assembles both at delivery time.

---

**Exercise 10**: [Service-Booking Widget Development](exercise10/instructions.md)

**What you'll learn**:
- How widgets differ from authored blocks and bring their own HTML
- How a single authored link loads an application feature
- How to fetch availability, validate input, and submit bookings to a hosted API

**What you'll build**:
- A service-booking widget with a local-time calendar, available times, and demo booking confirmation
- Integration with a pre-deployed Cloudflare Worker API and D1 persistence; own-account deployment is optional

**Setup**: Use the pre-deployed [booking Worker](exercise10/worker/README.md). Learners create their own widget and authored test page using the copy-paste examples and complete demo reference in the instructions; no Cloudflare login, local booking server, or author-supplied API URL is needed.

**Key takeaway**: Keep content-focused blocks in the authoring library and self-contained application features in widgets. See [Exercise 10](exercise10/instructions.md) for the service-booking workflow and hosted demo limitations.

---

**Go-Live Discussion**: Production readiness checklist

---

## Resources

**Solutions**: [answers branch](https://github.com/edsmasterclass/labs/tree/answers), reference implementations for code-oriented exercises (Exercise 1 is Experience Workspace authoring only).

**Documentation**:
- [Developer Tutorial](https://www.aem.live/developer/tutorial)
- [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)
- [David's Model](https://www.aem.live/docs/davidsmodel)
- [Experience Workspace Docs](https://www.aem.live/docs/ew/authoring)
- [AEM.live Docs](https://www.aem.live/)
- [Repoless](https://www.aem.live/docs/repoless)
- [Widgets](https://www.aem.live/docs/widgets)
- [Integrations](https://www.aem.live/developer/integrations)
- [Indexing Reference](https://www.aem.live/docs/indexing-reference)
- [JSON2HTML](https://www.aem.live/developer/json2html)
- [Product Bus Docs](https://docs.adobecommerce.live/)

**Tools**:
- [Site Admin](https://tools.aem.live/tools/site-admin/index.html)
- [Index Admin](https://tools.aem.live/tools/index-admin/index.html)
- [JSON2HTML Simulator](https://tools.aem.live/tools/json2html-simulator/index.html)
- [EDS Admin Tools](https://tools.aem.live/)

**APIs**:
- [EDS Admin API](https://www.aem.live/docs/admin.html)
- [Experience Workspace / DA API](https://docs.da.live/developers/api)

---

## Troubleshooting

**Dev server issues**: See [SETUP.md](SETUP.md)
**Permission errors**: Verify IMS group membership, re-login to Experience Workspace
**Pages not indexing**: Check published to `.aem.live`, wait 5-10 minutes
**Blocks not loading**: Check browser console, verify file paths

---

## After the Lab

- Build your own EDS project
- Explore [Block Collection](https://www.aem.live/developer/block-collection)
- Join [Discord Community](https://discord.gg/adobe-aem)
- Review [Go-Live Checklist](https://www.aem.live/docs/go-live-checklist)
