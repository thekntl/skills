---
name: kntl-setup
description: "Configure a product repo for the kntl skills: conventions file and CLAUDE.md pointer, resolved tool access paths, and permission allowlist at project start; the stack questionnaire and setups after the POC; the grilling reminder hook on request."
disable-model-invocation: true
---

# KNTL Setup

Writes the per-repo files every kntl skill reads: `docs/agents/kntl-conventions.md`, `docs/agents/kntl-stack.md`, `.claude/settings.json`. Prompt-driven like `/setup-matt-pocock-skills`: explore, present findings, lead with the recommended answer so the owner can accept it in a word, confirm, write. Owner-facing wording follows `docs/agents/kntl-conventions.md` (read `assets/kntl-conventions.md` until it is copied).

Three branches, picked by the argument: `machine` → the machine half, steps 1–5, at project start, from the `/kntl` preflight; `stack` → the stack half, steps 6–8, after `/kntl-poc`; `grilling-hook` → step 9, any time. No argument → `machine` while either docs file is absent, else `stack`. A re-run refreshes the branch's `Ready?` cells and keeps the owner's hand edits to `docs/agents/*.md`.

Every branch closes in Turkish by naming the files changed. After a few sessions `/fewer-permission-prompts` adds the patterns the allowlist missed.

## Machine half

1. **Explore.** Read, then summarise present / absent / unreachable: `git remote -v`; `CLAUDE.md` and `AGENTS.md` with their `## Agent skills` block; `docs/agents/issue-tracker.md` (absent → say "Önce `/setup-matt-pocock-skills` çalıştırılmalı." and stop); `docs/agents/kntl-*.md`; `.claude/settings.json`; platform signals (`*.xcodeproj` or `Package.swift`, `package.json` or `go.mod`, `build.gradle*`); the MCP server roster and host CLIs, checked as [references/access-paths.md](references/access-paths.md) says. Done when every item has a finding and the platform set is fixed.
2. **Conventions.** New file → show `assets/kntl-conventions.md` and copy it to `docs/agents/kntl-conventions.md` on the owner's word; existing file → show the diff against the asset and apply only what the owner accepts, so their edits survive. Done when the file exists and the owner has seen every line or every difference.
3. **Access paths.** Write `docs/agents/kntl-stack.md` from `assets/kntl-stack.md`, or refresh the Machine level rows of the existing file in place: those rows (GitHub, platform toolchain, browser, design inspiration, design tool) carry the resolved path and `Ready?` value per access-paths.md; provider rows read `pending POC`. The GitHub row is mandatory in every project: `host gh, authorised as <login>`. Done when each Machine level row has an access path and a `Ready?` value, and every `missing` row carries its install step.
4. **Permissions.** Build the allowlist from `assets/settings.allowlist.json`: `common`, one block per platform found, then `mcp`, with every `<server>` placeholder replaced by its roster name and `<owner>/<slug>` by the GitHub remote. Show it once, take one confirmation, merge into `permissions.allow` / `permissions.deny` of `.claude/settings.json` keeping existing entries. `git push` is on the list with its force forms denied; the asset's `about` names what still slips, and an owner who wants every push blocked at the shell → call the Skill tool with `git-guardrails-claude-code`. Done when `jq` parses the file and it holds every confirmed pattern.
5. **Pointer and hand-off.** Show the block below, take the owner's edits, then place it inside the `## Agent skills` section of `CLAUDE.md` (else `AGENTS.md`; neither → ask which to create; section absent → append it), updating the two sub-blocks in place when present and leaving the surrounding text as the owner wrote it:

   ```markdown
   ### KNTL conventions

   How to talk to the owner and write issues, PRs, and commits here. Read `docs/agents/kntl-conventions.md` before any owner-facing message, issue, PR, or commit.

   ### KNTL stack

   Chosen tools and the resolved access path per capability. Read `docs/agents/kntl-stack.md` before reaching for any external tool or service.
   ```

   Close with the files written, "Üç oturumu böyle aç: `<codename> · Ana` (çalışma), `<codename> · Akış` (`/kntl-status pin`), `<codename> · Ticket'lar` (`/kntl-explain pin`)", the next command (`/kntl-design`), and the offer "Grilling turlarında tur biçimini harness hatırlatsın istersen: `/kntl-setup grilling-hook`". Done when the two sub-blocks appear exactly once, both docs files exist, and the closing message names the three sessions.

## Stack half

6. **Read the POC.** The POC ticket on the map (`kntl:app-shell`, the proof) is closed by its merged PR. Absent or still open → refresh the `Ready?` cell of every Machine level row per access-paths.md, say "Sağlayıcı anketi `/kntl-poc` bitince." and stop. Closed → read `docs/agents/kntl-stack.md` and the `## Dependencies` comment on the POC ticket; copy each dependency line under `## POC dependencies` with the category row it maps to, and the `backend:` line when present. Done when the POC ticket is closed and every copied line names a row.
7. **Questionnaire.** Call the Skill tool with `kntl-grilling`; it supplies the round format and the ledger. Ask one question per row of [references/stack-defaults.md](references/stack-defaults.md), the default marked as the recommendation, the backend question keyed on step 6's `backend:` line. Design inspiration and design tool were settled by step 3: show them under `Önceden karara bağlı`, take one confirmation, and write the ledger id back into their Machine level rows; re-ask only when the row reads `missing` or the owner objects. Mandatory rows: design inspiration, analytics, payment, crash, backend/data; MMP, email, support, identity when the product needs them. Done when every mandatory and applicable row has a choice, its alternatives considered, and a ledger id beside the choice.
8. **Readiness and setups.** Resolve each chosen tool's access path and `Ready?` per access-paths.md. Human-only steps (accounts, keys) → call the Skill tool with `wizard` once, one stage per not-ready tool, and record the script path in every row it serves as `wizard: <path>`; Owner-only items per the conventions file stay `owner:`. Extend the allowlist with the chosen providers' read tools the way step 4 confirms. Write `kntl-stack.md`. Done when every row shows choice, alternatives, access path, and a `Ready?` value, and the owner has the wizard path to run.

## Grilling hook

9. **Install.** Copy `assets/grilling-reminder.sh` to `.claude/hooks/grilling-reminder.sh`, `chmod +x` it, and merge the `UserPromptSubmit` entry printed in the script's header into `.claude/settings.json`. While `docs/kntl/.grilling` exists (`/kntl-grilling` sets and clears it) every prompt gets the round skeleton injected. Done when the hook file is executable, `jq` parses the settings file, and the hook entry is present.
