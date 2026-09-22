# GitHub Copilot Instructions

This repository's agent instructions live in [AGENTS.md](../AGENTS.md). Read and follow it in full for all work in this repo — it covers the project overview, setup commands, project structure, code style, block development, testing, and the deployment/publishing workflow.

## Quick reference

- **Platform:** Edge Delivery Services (EDS) for AEM Sites. Vanilla ES6+ JavaScript and modern CSS — no build step, no frameworks, no transpiling.
- **Never modify** `scripts/aem.js` (core AEM library).
- **Before committing:** run `npm run lint` (auto-fix with `npm run lint:fix`).
- **Local dev:** `npx -y @adobe/aem-cli up --no-open --forward-browser-logs` serves at `http://localhost:3000`.
- **Blocks** live in `blocks/{name}/{name}.js` + `blocks/{name}/{name}.css`; each exports a default `decorate(block)` function and must be responsive, accessible, and scoped (`.{blockname} .child`).

## Skills

Domain workflows are documented as skills in `.claude/skills/`, each with a `SKILL.md`. Copilot does not auto-execute these, but their descriptions in `AGENTS.md` are authoritative guidance — for any block, CSS, or core-script change, follow the `content-driven-development` workflow, and for page imports/migrations follow `page-import`.
