---
name: kntl
description: "Launch a solo indie product the KNTL way: preflight, launch map, the die's seven faces, and which kntl-* skill to reach for next. Run with no arguments on an existing project to resume."
disable-model-invocation: true
---

# KNTL

Router for building and launching a solo indie product (Apple platforms, web, Android) on top of Matt Pocock's skills. Talk to the owner in Turkish; write code, issues, PRs and commits in English. The owner checks two things, does it work and is it what I asked, so every message answers those first and keeps internals below the fold. The full rules live in `docs/agents/kntl-conventions.md`; read it whenever it exists.

## Preflight

Stop at the first failure and say what is missing:

1. Pocock skills present: `grilling`, `wayfinder`, `implement`, `code-review`, `to-tickets`, `setup-matt-pocock-skills` (skill list or `~/.claude/skills`). Missing → ask: "Bu makinede Matt Pocock skill'leri kurulu değil; KNTL bunlar olmadan ilerleyemez. Kurayım mı? (`npx skills add mattpocock/skills`)" and wait for the answer.
2. `docs/agents/issue-tracker.md` exists. Missing → "Önce `/setup-matt-pocock-skills` çalıştırılmalı." and stop.
3. `docs/agents/kntl-conventions.md` and `docs/agents/kntl-stack.md` exist. Missing → run `/kntl-setup machine` now; `/kntl-setup stack` waits until after the POC.
4. Apple target → the Figma MCP answers and `skill://figma/figma-swiftui/SKILL.md` loads; otherwise give the connection steps. The design inspiration source named in `kntl-stack.md` (default: Mobbin MCP) answers; otherwise note it for `/kntl-setup`.

Preflight passes only when each line was verified in this session.

## Start or resume

- **Existing project** (a `wayfinder:map` issue exists): behave as `/kntl-status`, then `/kntl-next`. Read the map and `docs/kntl/status.json`; discovery is never replayed.
- **New project:** collect the entry packet (codename, one-sentence promise, target market, platforms, icon direction if any). Create the private repo under `thekntl` when absent. Chart the map by calling the Skill tool with `wayfinder`: Destination = "every applicable face is done and the product is public"; Notes = the faces below plus the kntl skills to consult; first tickets = the App Shell design ticket, filed as `references/phases.md` § Design ticket for a face in kntl-next says, and the POC ticket (`kntl:app-shell`, title `POC — <değer akışı>`, `flow:<slug>`, `ready-for-agent`, `## What to build` opening with `/kntl-poc #N`), the POC blocked natively on the design ticket. Hand over to `/kntl-design`.

## Order of work

Sequential core, then parallel faces:

1. **App Shell design** → `/kntl-design` (lo-fi → hi-fi → foundation, on the real platform, in the Design Lab).
2. **POC** → `/kntl-poc` (prove the value feature, no backend).
3. **Stack questionnaire and setups** → `/kntl-setup`.
4. **Faces in parallel** → `/kntl-next` picks, `/kntl-implement` builds.
5. **Legal** → `/kntl-legal`, right before production.
6. **Production** → `/kntl-release`; marketing goes live the same day.

Speed is a tie-breaker, never a deadline: cut scope, never foundations. Dates appear only when the owner asks.

## The die: seven faces

| Face | Label | Starts after | Skills |
| --- | --- | --- | --- |
| App Shell | `kntl:app-shell` | — | kntl-design → kntl-poc → kntl-implement |
| Onboarding | `kntl:onboarding` | design language approved | kntl-design, kntl-implement |
| Paywall and payment | `kntl:paywall` | design language + stack | kntl-design, the chosen payment provider's skills, kntl-implement |
| Product platform (backend, environments, integrations) | `kntl:platform` | stack | kntl-backend, kntl-implement |
| Landing pages | `kntl:landing` | design language + niche | kntl-design, kntl-marketing, kntl-implement |
| Marketing | `kntl:marketing` | App Shell + POC | kntl-marketing |
| Legal | `kntl:legal` | before production | kntl-legal |

Every ticket carries one face label and one `flow:<scenario>` label. The product is done when every applicable face is done; a face that does not apply is written on the map under Out of scope, never skipped silently.

## Which skill

- Where are we, remind me → `/kntl-status [#ticket]` · What next → `/kntl-next` · What are these tickets → `/kntl-explain`
- Decide something → `/kntl-grilling` (the others call it; it also runs alone)
- Build one ticket → `/kntl-implement #N` · Run the agent chain → `/kntl-implement --bundle`
- Existing project → `/kntl-adopt` · Switch harness or machine → `/kntl-handoff`

Sessions: one working session `<codename> · Ana`; `/kntl-status pin` lives in `<codename> · Akış`, `/kntl-explain pin` in `<codename> · Ticket'lar`. Archive Akış when its flow ends.

## Hard boundaries

Owner-only limits, environment parity and the tool-access order are in `docs/agents/kntl-conventions.md`; GitHub goes through the host's `gh`.
