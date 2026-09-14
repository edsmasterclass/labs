# AI-Assisted Development

**Duration**: 60 minutes
**Format**: Instructor demo — follow along with your own AI coding agent

---

**Quick navigation**
- **Context**
  - [What You'll Learn](#what-youll-learn)
- **Demo**
  - [Experience Modernization Agent](#part-1-experience-modernization-agent)
  - [Orient the Agent](#part-2-orient)
  - [Build: Speakers (One-Shot)](#step-4-build-a-speakers-block-one-shot)
  - [Build: Schedule (Plan Mode)](#step-5-build-a-schedule-block-plan-mode)
  - [Code Review](#step-6-agent-code-review)
- [Key Takeaways](#key-takeaways)

---

## Prerequisites

**Complete [Lab Setup](../SETUP.md) through Step 7 before starting.**

- AI coding agent installed and authenticated (Claude Code, Cursor, Codex CLI, or GitHub Copilot)
- Dev server running: `aem up`
- `localhost:3000` open in browser
- Terminal visible alongside editor

> **No agent set up?** You can follow along by watching the instructor's demo. The concepts and prompting patterns transfer to any AI coding tool.

---

## What You'll Learn

- How AI coding agents work with Edge Delivery Services
- How to use an AI agent to orient yourself in an unfamiliar codebase and research before building
- Two approaches to building blocks: one-shot vs plan mode
- How to use an agent for code review
- How context (AGENTS.md, skills, prompts) shapes agent output

---

## Part 1: Experience Modernization Agent

*10 minutes — Demo Only*

The [Experience Modernization Agent](https://aemcoder.adobe.io/) is Adobe's AI-powered console for modernizing web experiences with Edge Delivery Services. It connects to your GitHub repo and provides a built-in code editor with preview — all in the browser.

**Demo setup:** The site at https://main--aemcoder-lab--shsteimer.aem.live/ already has content imported from [wknd-adventures.com](https://wknd-adventures.com/) — the index page, header, and footer are live. The agent is connected to its GitHub repo with full read/write access.

**Prompt:** Use [**1.1** from Prompts.md](Prompts.md#11--rebrand-the-site)

The task: rebrand from WKND Adventures to Rockstar Adventures, taking design inspiration from [rockstar.adobeevents.com/en/masterclass](https://rockstar.adobeevents.com/en/masterclass).

**What to look for:**
- The agent reads the existing codebase — styles, blocks, import scripts — to understand the starting point
- It fetches the reference site to extract brand colors, typography, and layout patterns
- It updates CSS custom properties, color tokens, and font choices to match the new brand
- It replaces WKND content references (copy, nav labels) with Rockstar equivalents
- It touches multiple files in a single pass — this is cross-concern work, not just one block
- It checks its own output for accessibility and visual consistency before finishing

**The contrast with Parts 2–4:** This is a *retheme* — the agent interprets design intent from a URL and applies it across the whole codebase. Parts 2–4 show a different mode: building net-new blocks from scratch with the Content Driven Development workflow.

**More info:** The full AEMCoder lab from Summit is at https://adobelabs.dev/brand-visibility/l335/ — it covers the agent in more depth and is a good reference if you want to explore further after the session.

---

### Step 2: Bulk Import + Rebrand

**Prompt:** Use [**1.2** from Prompts.md](Prompts.md#12--bulk-import-and-rebrand-remaining-pages)

One prompt to import the rest of wknd-adventures.com and apply the new brand across all of it.

**What to look for:**
- The agent crawls the source site to discover all remaining pages
- It runs the import in bulk — multiple pages in a single pass rather than one at a time
- It applies the Rockstar Adventures brand to the imported content as it goes, not as a separate step
- The result is a fully themed site, not a raw import that still needs cleanup

---

## Part 2: Orient

*10 minutes*

Before building anything, it can be helpful to use the agent to orient yourself in the project. These three steps show examples of how to explore an unfamiliar codebase and research existing solutions.

---

### Step 1: What Does the Agent Know?

Ask the agent what it knows about this project and what tools it has.

**Prompt:** Use [**2.1** from Prompts.md](Prompts.md#21--what-do-you-know-about-this-project)

**What to look for:**
- The agent describes the tech stack, project structure, and coding conventions — it read AGENTS.md
- It surfaces available skills and explains when you'd use them
- Key skills to note:
  - `content-driven-development` — the workflow for building blocks
  - `block-collection-and-party` — research tool for finding reference implementations
  - `docs-search` — searches AEM documentation
- Everything the agent knows here is project-level — a different project would produce a completely different response

---

### Step 2: Code Comprehension + Documentation

Ask the agent to tour the project's blocks and check them against AEM best practices.

**Prompt:** Use [**2.2** from Prompts.md](Prompts.md#22--code-comprehension--documentation)

**What to look for:**
- The agent reads local block files to explain what each one does
- It fetches AEM documentation from aem.live to identify gaps and best practices
- It links to relevant docs — students can follow the links later
- The agent pulled from multiple sources (local code + external docs) without being told which tools to use

---

### Step 3: Research Before You Build

Before building new blocks, check if reference implementations already exist.

**Prompt:** Use [**2.3** from Prompts.md](Prompts.md#23--research-before-you-build)

**What to look for:**
- The agent reaches for the block-collection-and-party skill on its own — you didn't tell it to
- It searches for speakers and schedule references and reports what it finds
- It maps existing blocks to your needs (e.g., "cards" as a starting point for speakers)
- Even if there's no exact match, the agent researched before proposing to build from scratch

---

## Part 3: Build

*30 minutes (15 minutes per block)*

Two blocks, same Content Driven Development (CDD) workflow, different levels of control. The CDD skill orchestrates the full process: content model, test content, implementation, and validation.

---

### Step 4: Build a Speakers Block (One-Shot)

Hand the agent the goal and let it run the workflow. It decides the content model, creates test content, writes JS and CSS, and validates. The agent may pause to confirm decisions along the way — that's normal. Use your best judgement: approve and let it continue, or steer if something looks off.

**Prompt:** Use [**3.1** from Prompts.md](Prompts.md#31--speakers-block-one-shot)

**What happens:**
1. The agent invokes the CDD skill
2. It designs a content model (how authors will structure the block)
3. It creates test content and pushes it to DA via `aem content`
4. It implements `blocks/speakers/speakers.js` and `blocks/speakers/speakers.css`
5. It validates — linting, self-review

**When it finishes**, open the previewed page on `.aem.page` to see the result.

**What to evaluate:**
- Does the content model make sense for authors?
- Does the block render correctly?
- What looks right? What would you question?

---

### Step 5: Build a Schedule Block (Plan Mode)

Same CDD workflow, but this time you review the plan before any code is written. This is a good approach for complex tasks or unfamiliar territory.

**Prompt:** Use [**3.2** from Prompts.md](Prompts.md#32--schedule-block-plan-mode)

The agent will propose a content model and approach before writing any code. Review it — does the content model make sense for authors? Would you change anything? Approve (or steer) before letting it proceed with the full CDD workflow.

**When it finishes**, open the previewed page on `.aem.page` to see the result.

---

## Part 4: Review

*10 minutes*

### Step 6: Agent Code Review

The agent built both blocks — now ask it to review its own work against project conventions.

**Prompt:** Use [**4.1** from Prompts.md](Prompts.md#41--code-review)

**What to look for:**
- The agent reads both blocks and compares them
- It flags inconsistencies (naming, structure, CSS patterns) between the two blocks
- It checks against AGENTS.md conventions (CSS scoping, responsive design, accessibility)
- It fixes what it finds — refresh the browser to see updates
- This works on any code, not just code the agent wrote — you can also point it at a PR link to review teammate code

---

## References

- [AEM Edge Delivery Documentation](https://www.aem.live/docs/)
- [Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
- [AI Coding Agents for EDS](https://www.aem.live/developer/ai-coding-agents)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
