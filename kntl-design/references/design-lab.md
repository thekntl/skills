# Design Lab

The Lab is a separate, removable app target beside the production app. It holds every open experiment and the demo, links the same shared packages production links, and ships in nothing.

## Shared packages

Two packages carry the design; production and the Lab both link both packages, and nothing links the Lab.

- `DesignSystem`: tokens (colour, typography, spacing, radius, elevation, motion) and base components only.
- `AppUI`: screens and navigation, built on `DesignSystem`. Every external system (auth, purchases, storage, network, notifications, analytics) enters through an adapter protocol: `AppUI` declares a draft protocol per external system, sized to what the demo needs; `/kntl-backend` step 3 finalises the interface and the production adapter, and the fakes here are updated to it.

## Layout per platform

### SwiftUI (iOS, macOS)

```
<Codename>.xcodeproj / .xcworkspace
├── <Codename>/                    production app target
├── DesignLab/                     Lab app target, scheme "DesignLab", same deployment target
│   ├── DesignLabApp.swift         home: Experiments · Demo (· POC)
│   ├── Experiments/
│   │   ├── ExperimentList.swift
│   │   └── <experiment-slug>/
│   │       ├── Experiment.swift   question, candidate names, opening round, winner
│   │       ├── CandidateA.swift
│   │       ├── CandidateB.swift
│   │       └── CandidateC.swift
│   ├── Demo/
│   │   ├── ScenarioPicker.swift
│   │   ├── LabComposition.swift   builds AppShell from AppUI with fakes seeded by a fixture
│   │   ├── FakeAdapters/
│   │   └── Fixtures/<scenario-slug>.swift
│   └── POC/                       added by /kntl-poc
└── Packages/
    ├── DesignSystem/              local Swift package
    └── AppUI/                     local Swift package
```

Run: build the `DesignLab` scheme and launch it on the simulator (macOS: as the native app); the owner watches the simulator panel. Removing the Lab is deleting the `DesignLab` target and folder.

### Web

```
apps/<codename>/          production app
apps/design-lab/          Lab app; routes /experiments/<slug>, /demo?scenario=<slug> and, from /kntl-poc, /poc
packages/design-system/
packages/app-ui/
```

Run: start `apps/design-lab` from the task runner and open it in the browser pane. `apps/design-lab` is absent from the production build and deploy configuration.

### Android

`:app` (production), `:designlab` (application module with its own run configuration; `/kntl-poc` adds a `poc` package), `:designsystem` and `:appui` (library modules). Run: install `:designlab` on the emulator or device.

## Experiments

One design question is one experiment, named by the question's slug (`nav-shape`, `paywall-hero`). The slug is the ledger `evidence` reference until a screenshot exists.

- `Experiment` records the question, the candidate names, the round that opened it, and the winner once decided.
- Candidates A/B/C are structurally different and shown in context: a complete screen at the language level, a component group or single component inside a production screen from `AppUI` below it; built from `DesignSystem` where a token exists and inline otherwise.
- The experiment list on the Lab home shows open experiments; opening one presents the candidates behind a picker (←/→ or a segmented control) so the owner flips between them on the device.
- A screenshot of every candidate goes to `docs/kntl/smoke/<N>/<experiment-slug>-<candidate>.png` (`N` = the design ticket), captured with the per-platform capture commands in `kntl-implement`'s `references/smoke.md`, committed under `docs/kntl/smoke/<N>/` as that file says, because the ledger `evidence` field and the `## Round N` comment link them.

Lifecycle: open → candidates built → shown on the real platform → verdict → losers deleted in the same commit → winner waits in the Lab → "production'a uygula": the winner's tokens go to `DesignSystem`, its screen or component to `AppUI`, production composes it, and the experiment folder is deleted. The Lab holds open experiments only; the list is empty whenever nothing is being decided.

## Demo

The demo is the App Shell itself, composed from `AppUI` with fake adapters and a scenario fixture, so every screen is navigable and every state transition is real. It grows during hi-fi, is complete when hi-fi closes, and lives until the Lab is removed.

- **Scenario picker** on the Lab home lists `docs/design/SCENARIOS.md` by slug. Choosing one calls `LabComposition(scenario:)`, which seeds the fake adapters from `Fixtures/<slug>` and opens the App Shell at the scenario's entry point; deep-link and notification entries go through the same routing entry production uses. The last chosen scenario is remembered.
- **Fake adapters** implement the adapter protocols from `AppUI`. Each exposes the data-state axis (`empty`, `populated`, `error`, `offline`) so a fixture sets the starting state and a small overlay flips it live.
- **Fixtures** are one file per scenario: user state, data, entitlement, entry point. The same object feeds the test target after removal.
- **Composition**: production has `AppComposition.live(config)`, the Lab has `LabComposition(scenario)`; both build the same `AppShell` from `AppUI`, whose screens take every adapter from the composition that builds them — one screen source for the Lab and production.

## POC section

`/kntl-poc` adds a third section, `POC`, to the Lab home at the path in the layout above; the proof's shape and its exit live in that skill.

## Removal

Trigger: the last foundation ticket, when production composes every demo screen from real adapters and every scenario in `SCENARIOS.md` is at status `smoke`. The App Shell foundation files the Lab-removal ticket as a child of the map: labels `kntl:app-shell`, the design ticket's `flow:<slug>`, `ready-for-agent`; body per the conventions file, its `## Blocked by` naming every open design ticket and every open ticket a scenario waits on, so it reaches the frontier only when the trigger holds. `/kntl-design` adds each later face's design ticket when that face opens and its foundation tickets when they are filed; `/kntl-poc` adds the integration ticket.

1. Move `Fixtures/` and `FakeAdapters/` to the test target (`<Codename>Tests`, `packages/app-ui/test`, `:appui` androidTest); `/kntl-implement` smoke and UI tests load them by scenario slug.
2. Delete the Lab target, module or app package together with its scheme or run configuration; the shared packages stay.
3. Build production with no Lab reference and record the removal as a ledger entry carrying the ticket number.

## Figma

Load the skill before the session's first Figma call: from the plugin when installed, otherwise `skill://figma/<name>/SKILL.md` through the Figma MCP.

| Target | Skill | Direction |
| --- | --- | --- |
| Apple (iOS, macOS) | `figma-swiftui` | both: approved SwiftUI screen → Figma, Figma frame → SwiftUI |
| Web, Android | `figma-design-to-code` | Figma frame → code |
| Web, Android | `figma-generate-design` | code → Figma |
| Any | `figma-generate-diagram` | the flow map, as a FigJam diagram |

Figma MCP unreachable on a non-Apple target: the flow map is a Mermaid diagram on the ticket and every Figma column in `DESIGN.md` reads `none`.
