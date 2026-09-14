# Lab Setup Instructions

Complete these steps in one go before **Day 1 (AI lab)** and **Day 2 (hands-on exercises)**. Steps 1–7 (including AI coding agent setup) are enough for the AI lab; Steps 8–11 add DA, Sidekick, and EDS for Day 2.

> **Tip:** On GitHub (and most Markdown viewers), links usually open in the **same tab**. **⌘-click** (Mac) or **Ctrl-click** (Windows/Linux) a link to open it in a **new tab** so you can keep this page open.

---

<details>
<summary><strong>Quick navigation</strong></summary>

- [Lab Setup Instructions](#lab-setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone Repository](#step-1-clone-repository)
  - [Step 2: Create Feature Branch](#step-2-create-feature-branch)
  - [Step 3: Install AEM CLI](#step-3-install-aem-cli)
  - [Step 4: Install Dependencies](#step-4-install-dependencies)
  - [Step 5: Run Linting](#step-5-run-linting)
  - [Step 6: Start Development Server](#step-6-start-development-server)
  - [Step 7: AI Coding Agent Setup](#step-7-ai-coding-agent-setup)
  - [Step 8: Understand Your Branch URLs](#step-8-understand-your-branch-urls)
  - [Step 9: Verify DA.live Access](#step-9-verify-dalive-access)
  - [Step 10: Add This Project to Sidekick](#step-10-add-this-project-to-sidekick)
  - [Step 11: Verify EDS, DA Permissions](#step-11-verify-eds-da-permissions)
  - [Ready to Start](#ready-to-start)
  - [Validation Checklist](#validation-checklist)
  - [Git Workflow](#git-workflow)
    - [During exercises:](#during-exercises)
    - [Pull latest changes:](#pull-latest-changes)
  - [Creating a Pull Request](#creating-a-pull-request)
    - [PR Requirements](#pr-requirements)
    - [Steps to Create PR](#steps-to-create-pr)
  - [URL Reference](#url-reference)
  - [Troubleshooting](#troubleshooting)
    - [Port 3000 in use](#port-3000-in-use)
    - [Git push rejected](#git-push-rejected)
    - [DA.live "Permission denied"](#dalive-permission-denied)
    - [AEM CLI not found](#aem-cli-not-found)

</details>

---

## Prerequisites

Before arriving at the lab, ensure the following are installed:

- **[Lab access form](https://main--aem-rockstar-website--adobe.aem.page/en/masterclass/eds-labs-access-request) (do this first)** — Submit your **Adobe ID email** and **GitHub username**. This provisions lab access (including DA.live). Allow time for processing **before** you verify DA in Step 9; if you skip this step, sign-in may work but the project or folders may be unavailable.

  **GitHub organization invitation:** After the form is processed, you will receive an **email** inviting you to join the **`edsmasterclass`** organization on GitHub. **Accept that invitation** (use the link in the email) **before** you `git push` to this repository. If you have not joined the org, **push will fail** even if clone and commits work.

- Git installed
- Node.js v20 or higher
- Code editor (Cursor / Claude Code / VS Code)
- Web browser (Chrome or Edge — required for AEM Sidekick)
- **GitHub CLI** — so your AI coding agent can manage branches and PRs. Install: `brew install gh` (macOS) or `winget install GitHub.cli` (Windows). Then run `gh auth login`.
- **AEM Sidekick browser extension** installed and pinned — [Install from Chrome Web Store](https://chromewebstore.google.com/detail/aem-sidekick/igkmdomcgoebiipaifhmpfjhbjccggml)

![AEM Sidekick in the Chrome Web Store](images/sidekick-chrome-store.png)

![Pin the Sidekick extension so it is visible in your toolbar](images/pin-sidekick-extension.png)

---

### Homebrew (macOS)

[Homebrew](https://brew.sh) is optional but convenient for **Node.js**, **GitHub CLI** (`gh`), and other command-line tools on Mac.

1. **Check if it is already installed:**
   ```bash
   brew -v
   ```
   If you see a version number, skip to [Installing Node.js](#installing-nodejs).

2. **Install Homebrew** (official one-liner from brew.sh):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   Follow the prompts. If macOS asks to install **Xcode Command Line Tools**, accept — Git and build tools often need them too.

3. **Finish PATH setup (especially Apple Silicon):** When the script finishes, it prints **Next steps** — run those commands so `brew` is on your `PATH` (often adding `eval "$(/opt/homebrew/bin/brew shellenv)"` to `~/.zprofile`). **Open a new terminal window**, then verify:
   ```bash
   brew -v
   ```

On **Intel** Macs, Homebrew usually lives under `/usr/local`; the installer’s **Next steps** still apply if `brew` is not found.

---

### Installing Node.js

You need **Node.js v20 or higher** before `npm install` and the AEM CLI steps.

**macOS — with Homebrew:**

```bash
brew install node
node -v   # expect v20.x.x or newer
```

**Other options:** Download the **LTS** installer from [nodejs.org](https://nodejs.org/) (choose v20 or newer), or use another version manager your team prefers.

---

## Step 1: Clone Repository

Clone the repo and **change into the project folder** (the next steps assume your terminal is inside `labs`):

```bash
git clone https://github.com/edsmasterclass/labs.git && cd labs
```

---

## Step 2: Create Feature Branch

Use first initial + last name (e.g., John Smith = `jsmith`)

```bash
git checkout -b jsmith
```

**Important**: Use lowercase, no spaces or special characters.

**Before your first `git push`:** Confirm you **accepted the email invitation** to join the **`edsmasterclass`** GitHub organization (see Prerequisites). Pushes are rejected until you are a member.

---

## Step 3: Install AEM CLI

```bash
npm install -g @adobe/aem-cli
```

Verify:
```bash
aem --version
```

Expected output: Version number (e.g., `16.x.x`)

---

## Step 4: Install Dependencies

```bash
npm install
```

This installs ESLint, Stylelint, and other dev dependencies.

---

## Step 5: Run Linting

Before starting development, verify linting works:

```bash
npm run lint
```

Expected output: No errors (warnings are OK for boilerplate)

**What this checks**:
- ESLint (Airbnb JavaScript style)
- Stylelint (CSS standards)

**Important**: Never commit code with linting errors. Run `npm run lint` before every commit.

---

## Step 6: Start Development Server

The server starts at: http://localhost:3000

**Keep this running** throughout the lab. Open a new terminal for Git commands.

Run **`aem up`** from the repository root for both Day 1 and Day 2. Content comes from EDS/DA; the agent pushes test pages directly to DA via `aem content`.

**Verify**: Open http://localhost:3000 — you should see the EDS Masterclass Labs homepage.

![EDS Masterclass Labs homepage at localhost:3000](images/nyc-masterclass-home.png)

> **Note:**
> If you see a **403 error** when navigating to [http://localhost:3000](http://localhost:3000), check if a `.env` file exists in your project root.
> If not, create a `.env` file containing:
>
> ```
> AEM_PAGES_URL = https://main--labs--edsmasterclass.aem.page
> ```
>
> After saving this file, **restart your local development server** (`aem up`).


---

## Step 6b: Clone Your DA Content Folder

The AI coding agent pushes test content directly to DA.live using `aem content`. Clone your personal drafts folder so the agent has a local working copy to add and push from.

```bash
aem content clone --path /drafts/<yourname>
```

Replace `<yourname>` with your DA folder name (e.g. `jsmith`). This opens a browser login — authenticate with your Adobe ID, then wait for the clone to complete.

> **The folder doesn't need to exist in DA yet.** DA folders are virtual, so cloning a brand-new path reports `Found 0 file(s)` and downloads nothing — that's expected. The clone still creates the local `content/` working copy and saves your auth token; your agent's first `aem content push` creates the folder in DA. (The `content/drafts/<yourname>/` subfolder only appears once a file lands in it.)

> **Token is saved** to `.hlx/.da-token.json` — you only need to authenticate once per session.

---

## Step 7: AI Coding Agent Setup

To get the most from the AI-assisted development lab, set up an AI coding agent and open this project in it. The repo already includes AGENTS.md and skills; your agent will use them automatically.

**Required: AI coding agent** — at least one of:

| Agent | Notes |
|-------|--------|
| **Claude Code** | `npm install -g @anthropic-ai/claude-code` — requires Claude Pro/Team |
| **Cursor** | [cursor.com](https://cursor.com) — enable Agent mode |
| **OpenAI Codex CLI** | `npm install -g @openai/codex` — requires ChatGPT Plus/Pro/Business |
| **GitHub Copilot** | VS Code + Copilot extension — open Chat, use Agent mode |

If you don't have one, you can still follow the demo by watching the instructor.

If you installed GitHub CLI (Prerequisites), your agent can use it for branch management and PRs.

**Optional: Playwright CLI** — lets the agent open localhost, take screenshots, and verify blocks. 

```bash
npm install -g @playwright/cli@latest
playwright-cli install --skills
```

This installs `playwright-cli` and  adds the `playwright-cli` skill to your project's `.claude/skills/` directory so the agent can use it automatically.

---

## Step 8: Understand Your Branch URLs

EDS serves a separate preview and live URL per GitHub branch. The pattern is:

- Preview: `https://{branch}--labs--edsmasterclass.aem.page/`
- Live: `https://{branch}--labs--edsmasterclass.aem.live/`

**Main branch** (always available — use this as your reference throughout the lab):
- Preview: https://main--labs--edsmasterclass.aem.page/
- Live: https://main--labs--edsmasterclass.aem.live/

> Your personal branch URLs (e.g. `jsmith--labs--edsmasterclass.aem.page`) become active after your first `git push` in Exercise 2.

---

## Step 9: Verify DA.live Access

> **Prerequisite:** Complete the [Lab access form](https://main--aem-rockstar-website--adobe.aem.page/en/masterclass/eds-labs-access-request) (see Prerequisites) and allow time for access to be granted before this step.

1. Go to https://da.live/#/edsmasterclass/labs
2. Complete the Sign In process using the Adobe ID provided to obtain access
   > If your Adobe ID is tied to a Personal Account, choose that instead of Corporate Account
3. You should see the project and folder structure

   ![EDS Masterclass Labs homepage at da.live](images/da-nyc-masterclass-home.png)

4. Navigate into `/drafts`
5. Create a folder: `/drafts/<yourname>` (e.g. `/drafts/jsmith`)

   ![Create Folder in DA](images/da-create-folder.png)

6. Inside that folder, choose **New** → **Document** and name it something like `hello` (a simple “Hello” document to prove you can author).
7. Add some text to the document — a short heading or paragraph is enough.
8. **Preview** the page and confirm it opens in the browser at a `.aem.page` URL.
9. **Publish** the page and confirm it is available on `.aem.live`.

**If you cannot access**:
- Confirm you submitted the [Lab access form](https://main--aem-rockstar-website--adobe.aem.page/en/masterclass/eds-labs-access-request) with the **same** Adobe ID and GitHub username you are using for the lab
- Verify you're logged in with your Adobe IMS account
- Ask your instructor to verify permissions — **@mention them in the lab Slack channel** so they can grant or fix access quickly

---

## Step 10: Add This Project to Sidekick

With your dev server running, add the EDS Masterclass Labs project (this repo) to your Sidekick extension so the toolbar appears on your pages.

1. Open [main--labs--edsmasterclass.aem.page](https://main--labs--edsmasterclass.aem.page/) in Chrome or Edge
2. Click the **AEM Sidekick** icon in your browser toolbar
   > If this the first time that you are viewing sidekick extension , go through the overview
3. Click **Add project** from sidekick extension

![Sidekick "Add project" prompt](images/sidekick-add-project.png)

4. Refresh the page — the Sidekick toolbar should appear at the top with **Preview** and **Publish** buttons


**Verify**: Open [localhost:3000/sessions/architecture-deep-dive](http://localhost:3000/sessions/architecture-deep-dive) and confirm the Sidekick toolbar also appears there.

---

## Step 11: Verify EDS, DA Permissions

Your account should be granted a **`publish`-style** role (what the instructor configures), which typically includes:
- `preview:read`, `preview:write` (access to `.aem.page`)
- `live:write` (publish to `.aem.live`)

**Test**: In DA.live, open an existing page (e.g., [sessions/architecture-deep-dive](https://da.live/edit#/edsmasterclass/labs/sessions/architecture-deep-dive)) and click **Preview**. If it opens at `.aem.page`, permissions are correct.

**If preview fails**: Ask your instructor to verify EDS Admin API permissions — **@mention them in the lab Slack channel** with what you tried (page path, Preview vs Publish, any error text).

---

## Ready to Start

- **Day 1**: Once the AI lab checklist is complete, proceed to [AI-Assisted Development](ai-dev/instructions.md).
- **Day 2**: Once the full checklist is complete, proceed to [Exercise 1](exercise1/instructions.md).

**Solutions**: Complete solutions for all lab exercises are on the [answers branch](https://github.com/edsmasterclass/labs/tree/answers). Each exercise also links to this branch in its Solution section.

---

## Validation Checklist

**For AI lab (Day 1)** — before [AI-Assisted Development](ai-dev/instructions.md):

- [ ] Repository cloned
- [ ] Feature branch created (e.g., `jsmith`)
- [ ] AEM CLI installed (`aem --version` works)
- [ ] Dependencies installed (`npm install` completed)
- [ ] Linting runs clean (`npm run lint` no errors)
- [ ] Dev server running: `aem up` — `http://localhost:3000` loads
- [ ] DA content cloned: `aem content clone --path /drafts/<yourname>` — authenticated and `content/.da-config.json` exists (an empty clone reports `Found 0 file(s)`; that's expected — the `drafts/<yourname>/` subfolder appears later)
- [ ] AI coding agent set up (Cursor, Claude Code, Codex, or Copilot) and project opened in it

**For Day 2 exercises** — add these before [Exercise 1](exercise1/instructions.md):

- [ ] [Lab access form](https://main--aem-rockstar-website--adobe.aem.page/en/masterclass/eds-labs-access-request) submitted (Adobe ID + GitHub username); access processed before DA verification
- [ ] **GitHub:** Email invitation to join **`edsmasterclass`** org accepted **before** first `git push` (see Prerequisites)
- [ ] DA.live access verified (project loads, `/drafts/<yourname>/` folder, `hello` page previewed and published)
- [ ] AEM Sidekick extension installed (Chrome/Edge)
- [ ] Sidekick project added — toolbar visible on `localhost:3000`
- [ ] Branch URL pattern understood — `main--` URLs verified as working
- [ ] EDS/DA permissions verified (preview works from DA)
- [ ] Git workflow clear (lint, add, commit, push)
- [ ] PR process understood (test URLs, Lighthouse scores)

---

<details>
<summary><strong>Git Workflow</strong></summary>

## Git Workflow

### During exercises:

After completing each exercise:

```bash
# Run linting first (must pass with no errors)
npm run lint

# Add your changes
git add blocks/block-name/

# Commit with conventional commit message
git commit -m "feat: add block-name block"

# Push to your branch (replace jsmith with your branch name)
git push origin <your-branch>
```

> **Push fails?** Confirm you accepted the **`edsmasterclass`** GitHub org invitation (email after the lab access form). See [Git push rejected](#git-push-rejected).

### Pull latest changes:

```bash
git pull origin main
```

Do this before starting new exercises if instructor made updates.

</details>

---

<details>
<summary><strong>Creating a Pull Request</strong></summary>

## Creating a Pull Request

At the end of the lab, you'll create a PR to merge your work to main.

### PR Requirements

1. **No linting errors**: Run `npm run lint` - must be clean
2. **Test URLs**: Include before/after links showing your changes
   >before : points to main branch and all impacted pages
   >after: point to feature branch and all impacted pages
3. **Lighthouse scores**: 100 on both mobile and desktop on PR (highly recommended)

### Steps to Create PR

**1. Verify linting**:
```bash
npm run lint
```

Fix any errors before proceeding.

**2. Test a page with your changes**:

Pick a page that demonstrates your work (e.g., `/drafts/<your-name>/sessions` from Exercise 4).

**3. Run PageSpeed Insights**:

```
https://developers.google.com/speed/pagespeed/insights/?url=https://<your-branch>--labs--edsmasterclass.aem.page/drafts/<your-name>/sessions
```

**Target**: 100 on both mobile and desktop.

**If scores are low** — troubleshoot in this order before asking for help:

1. **Check what you added, not the boilerplate** — the starter project already scores 100. Low scores are almost always caused by code you introduced.
2. **Images** — avoid committing large images to Git. Use DA.live to upload images (they get optimized automatically) or use external URLs. If you must commit an image, compress it first (< 100 KB).
3. **JavaScript** — keep block JS minimal. Avoid importing large libraries. Use native browser APIs (fetch, DOM) instead of frameworks.
4. **CSS** — put only above-the-fold styles in your block CSS. Avoid `@import` statements in your blocks that are used above-the-fold.
5. **Render-blocking resources** — never add additional `<link>` or `<script>` tags to `head.html` unless absolutely necessary. Use `lazy-styles.css` or `delayed.js` for non-critical resources.
6. **Run PSI again** — scores can vary ±5 points between runs due to network conditions. Run 2-3 times before worrying.
7. **Reference**: [Keeping It 100 — EDS Performance Guide](https://www.aem.live/developer/keeping-it-100)

> **Note on SEO scores**: Preview/development URLs (`.aem.page`) return `x-robots-tag: noindex, nofollow` headers, so PageSpeed Insights will flag SEO issues like "Page is blocked from indexing." **This is expected and not a problem.** These URLs are intentionally excluded from search engines. SEO scores will be full marks on production (`.aem.live`) URLs with proper domain mapping and real content.

**4. Create PR on GitHub**:

Go to: https://github.com/edsmasterclass/labs/pulls

Click "New Pull Request"

**Base**: `main` ← **Compare**: `jsmith` (your branch)

**PR Description Template**:
```
## Summary
Added blocks from lab exercises: page-list, dynamic-cards, etc.

## Test URLs

**Before** (main branch):
https://main--labs--edsmasterclass.aem.live/drafts/<your-name>/sessions

**After** (my branch):
https://jsmith--labs--edsmasterclass.aem.live/drafts/<your-name>/sessions

## Lighthouse Scores

- Mobile: 100
- Desktop: 100

Screenshot: [attach screenshot of PSI results]

## Changes
- Added page-list block (Exercise 4)
- Added dynamic-cards block (Exercise 3)
- Added registration-form block (Exercise 6)
```

Replace `jsmith` and URLs with your actual values.

![Performance Check on PR](images/perfomance-check-pr.png)

**5. Request Review**:

Assign the instructor as a reviewer.

**Important**: Only the PR author (you) should merge after approval. Never merge someone else's PR without asking.

**Reference**: [Development & Collaboration Best Practices](https://www.aem.live/docs/dev-collab-and-good-practices)

</details>

---

<details>
<summary><strong>URL Reference</strong></summary>

## URL Reference

| Environment | URL pattern | When it updates |
|---|---|---|
| Local | `http://localhost:3000/<path>` | Immediately on file save |
| Preview | `https://{branch}--labs--edsmasterclass.aem.page/<path>` | After DA.live Preview or `git push` |
| Live | `https://{branch}--labs--edsmasterclass.aem.live/<path>` | After DA.live Publish |

Use `main` as the branch for the reference site. Use your branch name (e.g. `jsmith`) for your own work — available after your first `git push` in Exercise 2.

</details>

---

<details>
<summary><strong>Troubleshooting</strong></summary>

## Troubleshooting

### Port 3000 in use

```bash
pkill -f aem-cli
aem up
```

### Git push rejected

1. **Not a member of `edsmasterclass` yet:** If you have **not** accepted the **GitHub organization invitation** (email sent after the lab access form), `git push` will fail. Find the invitation email, accept it, then push again. Check spam/junk if you do not see it.

2. **Wrong branch:** Branch may be protected or you may be on `main`. Verify you're on your feature branch:
```bash
git branch
```

Should show `* jsmith` (your branch name).

### DA.live "Permission denied"

Log out and log back in to refresh IMS tokens. If it still fails, **@mention your instructor in the lab Slack channel** so they can confirm your DA / EDS permissions.

### AEM CLI not found

Re-run global install:
```bash
npm install -g @adobe/aem-cli
```

On Mac/Linux, may need `sudo`:
```bash
sudo npm install -g @adobe/aem-cli
```

</details>
