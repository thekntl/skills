---
name: kntl-adopt
description: "Bring an existing or half-finished project into KNTL (kntlize, KNTL'e al, mevcut projeyi entegre et): static survey, live sweep, the picture on the die, pasted into map, tickets and dashboard, reported in Turkish."
disable-model-invocation: true
---

# KNTL Adopt

Input: a project built without KNTL, taken over from elsewhere, or a KNTL project left half-finished. Output: the project's picture on the die's seven faces with evidence, pasted into the KNTL artefacts, and a Turkish report. This skill writes KNTL documents and tracker items only; every line of code stays as found and each finding becomes a ticket instead of a fix. Owner-facing formats, ticket titles, bodies and labels, parity and tool access live in `docs/agents/kntl-conventions.md`; read it before writing anything the owner sees. A half-finished KNTL project takes the same path: map, ledger, seeds and tickets are updated in place, never recreated. The run's own files live in `docs/kntl/adopt-<YYYY-MM-DD>/`: `survey.md` (stages 2 and 4), `sweep.md` with its screenshots (stage 3), `report.md` (stage 6).

## 1. Prerequisites

The first lines of `/kntl`'s Preflight, resolved rather than stopped at: Pocock skills present, else the router's question; `docs/agents/issue-tracker.md` present, else say "Önce `/setup-matt-pocock-skills` çalıştırılmalı." and continue when the file appears; `docs/agents/kntl-conventions.md` present, else run `/kntl-setup machine` now, the provider questionnaire waits for stage 2. Done when `docs/agents/issue-tracker.md`, `docs/agents/kntl-conventions.md` and `docs/agents/kntl-stack.md` exist, every machine-level row of the stack file carries an access path, and its GitHub row reads `ready`.

## 2. Static survey

Fan out one subagent per area, in parallel, each returning its section of `survey.md` with a `path:line` for every claim. On a large repo (several targets, or an inventory past what one session holds) fan the areas, and stage 3's walkers, out through the Workflow tool after the owner's yes (call the Skill tool with `workflow-authoring` for the script), one run per area or platform, each returning its section of `survey.md` or of the sweep log:

- (a) structure, target platforms, the launch recipe (build and launch commands) per platform;
- (b) stack and providers (payment, analytics, attribution, crash, auth, database, email, support) from manifests, imports and config;
- (c) environments and parity violations against the conventions file's parity rule: in-memory stores, auth skipped in development, modules switched off per environment, secrets committed;
- (d) tests, CI, docs, ADRs, README decisions, existing issues.

Resolve the access path of every detected provider and of the platform toolchain in the conventions file's order; a capability without a path gets `missing: <install step>` in its `Ready?` cell. Done when the pre-filled questionnaire stands in `docs/agents/kntl-stack.md` in the `/kntl-setup` asset's format, every detected provider row carrying the value and its evidence in the Choice cell (`RevenueCat · tespit: Package.swift:12`) plus its access path, the rest `pending POC`, so `/kntl-setup` asks only those rows and the contradictions; every environment is named with its configuration source; and `survey.md` holds areas a–d, the launch recipe per platform and the parity list.

## 3. Live sweep

Read `references/sweep.md` before the first launch; it holds where the sweep runs and with which accounts, the walk order, the variation limits and the sweep log format. Show this block once before the first launch and wait; the answers hold for the whole run. A `hayır` on 1 or 2 makes that platform's rows `not tried` with the reason; on 3 the report hands the owner the line `git add docs/kntl docs/agents docs/design CONTEXT.md && git commit -m "docs: kntl adopt <YYYY-MM-DD>" && git push`; on 4 the issue bodies to file. When the harness still prompts mid-run, the report proposes the `.claude/settings.json` allow pattern that would silence it next time. Then the whole-product smoke as sweep.md says, one walker per runtime. Done when every line of the block has an answer, the coverage table shows every screen reached or its blocker, every form at three variations, every flow at a happy path and one error path, and every row carries evidence.

```
İzin paketi — KNTL'e alma
1. Build ve çalıştırma                                                                       evet / hayır
2. Simülatör/tarayıcı/emülatörde gezinme ve ekran görüntüsü                                  evet / hayır
3. KNTL dokümanlarını (docs/kntl, docs/agents, docs/design, CONTEXT.md) commit ve push etme   evet / hayır
4. Issue ve yorum açma                                                                       evet / hayır
```

## 4. Placement on the die

For each of the seven faces in `/kntl`'s die table, judge the state against that face's done criterion in `docs/kntl/status.json`'s vocabulary: `done`, `in-progress`, `not-started` or `out-of-scope`. `out-of-scope` is open to paywall alone, when the product charges nothing; landing and marketing shrink to the product's size instead, and their gap lists say how small. Each face's state, survey and sweep evidence and gap list go into `survey.md`. Then add:

- the POC verdict: the value feature the promise rests on works end to end on the real runtime, or which link breaks;
- a `docs/design/DESIGN.md` seed from `kntl-design/assets/DESIGN.template.md`: the Status row for App Shell reads `done` when the face is judged done, `foundation` when in-progress with tokens found in the code, `lo-fi` otherwise; the platform, tokens, components and patterns sections filled from the code; an existing file is updated in place;
- a `docs/design/SCENARIOS.md` seed from `kntl-design/assets/SCENARIOS.template.md`: one catalogue row per flow of the sweep inventory (its slug, user, data and entry states, Opens on, What the owner should see, Status `smoke` when every row of the flow reads `works`, `draft` otherwise), updated in place when the file exists;
- a `CONTEXT.md` seed by calling the Skill tool with `domain-modeling` on the terms the code and screens use.

Done when every face has a state, evidence and gap list in `survey.md`, the POC verdict cites a sweep row, the Status table names App Shell's stage, every inventory flow has a catalogue row, and the three seeds exist or are updated in place.

## 5. Paste

1. **Map.** Existing `wayfinder:map` → update its sections in place. None → call the Skill tool with `wayfinder`, Chart the map, its grilling already answered by stage 4: Destination = every applicable face done and the product public; Notes = the faces and the kntl skills; Decisions so far empty; Not yet specified = what the sweep left unclear; Out of scope = faces judged `out-of-scope`, with why. Done when the map body reflects every face's state.
2. **Ledger.** In this order: create a `wayfinder:grilling` child of the map as `docs/agents/issue-tracker.md` says; append one `provisional` entry per decision the project already embodies (stack choices, prices and packages on the paywall, environment layout, design tokens, auth model) to `docs/kntl/decisions.jsonl` per `kntl-grilling`'s `references/ledger.md`, `ticket` that number, `evidence` the path or screenshot; then call the Skill tool with `kntl-grilling` naming that ticket, whose ledger scan re-asks each entry as `D-nnn provisional idi` in one round, the detected value marked as the recommendation. A yes flips the entry to `confirmed` and its stack row's marker to `· D-nnn`; "emin değilim" leaves it `provisional` for the next session. Resolve the ticket as the tracker doc says. Done when every detected decision has an id and an owner-visited state, and the map's Decisions so far carries the round's ticket line.
3. **Tickets.** Call the Skill tool with `qa`, each broken and missing row of the sweep log standing in for the owner's report as `references/sweep.md` maps it, filed as child tickets of the map; the conventions file's title, labels, body and `## Özet` override qa's template; the evidence link points into the sweep folder. An existing open issue that matches a row gets the labels and is cited instead of refiled. Create in dependency order, wire native blocking in a second pass. Done when every broken and missing row cites exactly one ticket and every `flow:` slug on a ticket has a catalogue row.
4. **Evidence and gate tickets**, children of the map, labelled and bodied per the conventions file, so the regenerated `status.json` derives the states stage 4 judged. One `<akış> — mevcut durum` per flow whose rows all read `works` and one `<Yüz> — mevcut durum` per face judged `done` or `in-progress` without such a flow (face label; `flow:` = the flow's slug, for a face ticket the slug of the inventory flow that evidences the face, else the value flow's; body citing the sweep rows and screenshots), each closed as completed. The POC ticket (`kntl:app-shell`, title `POC — <değer akışı>`, the value flow's `flow:` label, `## What to build` opening with `/kntl-poc #N` and citing the sweep row and its ledger ids): verdict `çalışıyor` → closed as completed with a resolution comment carrying `## Dependencies` lines in `kntl-poc` step 5's shape (API keys, device permissions, providers), which `/kntl-setup` reads; `çalışmıyor` or `belirsiz` → open, `ready-for-agent`, for `/kntl-poc #N`. App Shell's Status row reading `lo-fi` → the App Shell design ticket, filed as `kntl-next`'s `references/phases.md` § Design ticket for a face says, for `/kntl-design #N`. Done when every face judged done or in-progress has a closed ticket, the POC ticket stands in the state its verdict demands, and the design ticket exists when the Status row reads `lo-fi`.
5. **Status.** Run `/kntl-status`'s steps 2 and 3, its commit following İzin paketi line 3: regenerate `docs/kntl/status.json` per its `references/status-schema.md` and copy its dashboard asset to `docs/kntl/index.html`. Done when both steps' criteria hold and the dashboard shows the seven faces with the states stage 4 judged and their counts.

## 6. Report

Read `references/report.md` and write the Turkish report from its template to `report.md` in the run folder: one paragraph on what the project does, the per-face table (state, evidence, gap count), the detected stack, the risks (parity violations, security, broken flows), the next step, and `Ticket sözlüğü`. Post it as the reply and as a comment on the map. Done when every face row's gap count equals its open tickets, every risk ends in a ticket, and the next step is one command, its ticket named when it takes one.
