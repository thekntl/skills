# KNTL conventions

Read this before writing anything the owner will see and before creating or editing any issue, pull request, or commit. Written by `/kntl-setup`; every agent working in this repo follows it, whichever skill is running.

## The owner

A solo indie hacker who checks two things: does it work, and is it what I asked. They never need to open code to understand a message. Every owner-facing message answers those two questions first (what works, how to try it, what comes next) and keeps file names, class names, infrastructure terms, and command output below the fold or inside the ticket. Talk to the owner in Turkish. Code, identifiers, commits, issue and PR bodies are English; the `## Özet` block is Turkish.

## Names, not numbers

A ticket is always `#26 (kısa ad)`: its number plus its title in two to four words. Ticket titles are therefore short plain labels; the technical body lives inside. A reply that mentions two or more tickets ends with:

```
Ticket sözlüğü
- #26 — buton kenarları: <tek cümle, sade dilde ne çözüyor>
```

## Özet on every issue and PR

Every issue, pull request, and substantive comment ends with two to four Turkish sentences, no jargon, on what this is for and what the user will notice:

```
## Özet
<2–4 cümle: bu ne işe yarıyor, kullanıcı ne fark edecek>
```

## Hikaye when a ticket is finished

Any message that finishes a ticket, whether through `/kntl-implement` or `/implement`, ends below the technical checklist with three to five Turkish sentences: which problem `#N (kısa ad)` solved as the user experiences it, what changed, how it was verified ("simülatörde uygulamayı açtım, X'e bastım, Y'yi gördüm"), what is left:

```
Hikaye
<3–5 cümle: hangi sorun çözüldü, ne değişti, nasıl doğrulandı, ne kaldı>
```

The same story goes into the PR's `## Özet`.

## Acceptance criteria are bullets

Criteria are `-` bullets. Task-list checkboxes never appear in issue or PR bodies: they do not tick themselves on close and any viewer can toggle them. Proof that a criterion holds is the PR's smoke section and the ticket closing on merge.

## Time

No dates or deadlines unless the owner asks; a requested date is advice. Speed is a tie-breaker between options: prefer the smaller scope that finishes sooner, and cut scope, never foundations. Whatever stays in scope ships complete: auth, persistence, error paths. Skipping a foundation is a written decision in the ticket.

## Environment parity

Development, staging, and production run the same code and the same modules; only configuration differs (connection strings, keys, URLs, flags). Development uses a real local database, real auth, real adapters. Fake adapters live in automated tests and the Design Lab demo only.

## Tool access

Plugin → MCP → CLI on the host → browser, in that order; say in one line why you dropped a level. `docs/agents/kntl-stack.md` records the resolved path per capability; read it instead of rediscovering. GitHub goes through the host's `gh`: a sandboxed auth failure means rerun outside the sandbox; if the host call also fails, hand the owner the exact command. Before calling an MCP absent, search for its tools (they load on demand) and check the configured servers; a server waiting for authorization is "needs auth".

## Owner-only

Payments and paid plans, legal assent, identity verification, MFA, remote Docker or Swarm runtime, production data. Prepare the artefact, hand the owner the exact steps, continue from their output.

## Tracker vocabulary

- Face labels, exactly one per ticket: `kntl:app-shell`, `kntl:onboarding`, `kntl:paywall`, `kntl:platform`, `kntl:landing`, `kntl:marketing`, `kntl:legal`.
- Flow label, exactly one per ticket: `flow:<scenario-slug>`; slugs match `docs/design/SCENARIOS.md`.
- Triage: `ready-for-agent` (an agent finishes it without a product question), `ready-for-human` (a decision, account, credential, approval, or purchase from the owner). Label strings per `docs/agents/triage-labels.md` when present.
- Decisions: `docs/kntl/decisions.jsonl`; cite entries as `D-041` in tickets and PRs.
- Map: the `wayfinder:map` issue; Destination = every applicable face done and the product public.

## Sessions

One working session `<codename> · Ana`. Reference sessions: `<codename> · Akış` (status and next), `<codename> · Ticket'lar` (explain), optional `<codename> · Kararlar`. Sessions are views; the tracker and the files under `docs/kntl` are the memory.

## Issue body

```
## What to build
## Acceptance criteria
## Blocked by
## Decisions
## Özet
```

## PR body

```
## Ticket
## Outcome
## Scope and non-goals
## Automated checks
## Smoke on the real runtime
## Human validation
## Risks and rollback
## Özet
```
