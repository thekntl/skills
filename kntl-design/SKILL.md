---
name: kntl-design
description: "Design one face of the die, lo-fi → hi-fi → foundation: candidates in the Design Lab on the real platform, verdicts through kntl-grilling, decisions in the ledger and docs/design/DESIGN.md."
disable-model-invocation: true
---

# KNTL Design

`/kntl-design #N` designs the face on ticket `#N (kısa ad)`. Run it from `/kntl`, whose preflight verified the Pocock skills, the Figma MCP and the inspiration source; when `docs/agents/kntl-stack.md` is missing, say "Önce `/kntl-setup`" and stop. Everything the owner sees follows `docs/agents/kntl-conventions.md`. This is `grilling-frontend-prototyping` the KNTL way: every question is asked with candidates, and the verdict tree walks from the overall design language down to component groups and single components.

## Fixed rules

- **Real platform.** A candidate is shown where the app runs: SwiftUI in the simulator, a real page in the browser pane, the Android emulator, the native macOS app. Approval evidence is a screenshot from that runtime; an HTML mock of an Apple or Android screen is a sketch on the way there.
- **Inspiration first.** Before each design question, search the inspiration source named in `kntl-stack.md` (default: Mobbin MCP) for the same flow or screen; the round records query, examples, the pattern taken and the adaptation.
- **Design Lab.** Prototype code lives in the Lab target; the production app target changes in the foundation stage only, while `DesignSystem` and `AppUI` receive a winner on "production'a uygula" and the demo composes from them. Read `references/design-lab.md` before creating the Lab, adding an experiment, building the demo, or filing the Lab-removal ticket.
- **Candidate cleanup.** On a verdict the losers are deleted in the same round; the winner stays in the Lab until the owner says "production'a uygula" (several verdicts may be applied together), then moves into the shared package and leaves the Lab. Once the language has settled, each question is one experiment: prototype → apply → delete.
- **Figma.** Load the platform's Figma skill from `references/design-lab.md` § Figma before the session's first Figma call; the flow map goes through `figma-generate-diagram`.
- **Record every round.** kntl-grilling writes the ledger and the `## Round N` comment; `docs/design/DESIGN.md` is created from `assets/DESIGN.template.md` on the first round and its affected section rewritten every round. A step back to an earlier stage is a ledger entry with `supersedes`.

## Rounds

Before each round, call the Skill tool with `kntl-grilling` as `prototype-first` on `#N`; it re-reads the last round. The round keeps its skeleton and adds the lines in `references/round-additions.md`, read before every round.

## Stages

Open by reading the status table in `docs/design/DESIGN.md` and the last round comment, tell the owner which stage this session resumes, and add `#N` to the Lab-removal ticket's `## Blocked by` when that ticket exists. A later face (onboarding, paywall, landing) inherits the approved language: its lo-fi lists its own screens, its hi-fi adds components to the language, its foundation extends the packages.

1. **Lo-fi.** Grey boxes only: the screen list, the flow map as a FigJam diagram (Figma rule above), a rough layout per screen as a Lab experiment on the real platform, and scenarios drafted into `docs/design/SCENARIOS.md` from `assets/SCENARIOS.template.md`. Read `references/surfaces-and-states.md` to decide which screens exist; visual language opens once the lo-fi verdict is in the ledger. Done when every required surface is marked in scope or out of scope on the ticket, every in-scope screen has a grey-box frame the owner walked through in the runtime, the flow map (link or diagram) is on the ticket, and the lo-fi verdict is in the ledger.
2. **Hi-fi.** Language first (tokens, typography, colour, components, motion), then real screens, down the verdict tree. Build the demo: the App Shell on fake adapters and scenario fixtures, with the scenario picker on the Lab home. Read `references/surfaces-and-states.md` again to check state coverage. Done when `DESIGN.md` holds tokens, patterns and every approved decision with its D-id; every in-scope surface and applicable state is reachable in the demo from a scenario in `SCENARIOS.md`, and every scenario reachable in the demo reads `demo` there; approved screens are in Figma or their Figma column reads `none`; the Lab holds open experiments only.
3. **Foundation.** Call the Skill tool with `to-tickets` to turn `DESIGN.md` and the demo into tickets: navigation skeleton, App Shell, the `DesignSystem` and `AppUI` packages, each demo screen wired to real adapters; the issue body and labels come from the conventions file and override its template. Each ticket cites its D-ids; the last foundation ticket of each `flow:<slug>` carries the acceptance criterion "scenario `<slug>` reads `smoke` in `SCENARIOS.md`", set after its smoke passes. The App Shell face also files the Lab-removal ticket as `references/design-lab.md` § Removal says; every face adds the tickets a `SCENARIOS.md` scenario waits on to that ticket's `## Blocked by`. `/kntl-implement` builds them and POC integration lands on top. Done when every ticket is filed with `ready-for-agent` or `ready-for-human`, blocked natively on what it waits for, the Lab-removal ticket's `## Blocked by` names this face's tickets, the `DESIGN.md` status row says foundation, and `#N` is resolved as `docs/agents/issue-tracker.md` says: resolution comment citing the face's D-ids and the filed tickets, one line under the map's Decisions so far, `## Özet`.

Finish by saying what comes next: `/kntl-poc` after the App Shell face, `/kntl-next` after any other.
