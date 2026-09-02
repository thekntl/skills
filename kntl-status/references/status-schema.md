# `docs/kntl/status.json` schema

The derived view of the tracker that `/kntl-status` regenerates on every run. GitHub Issues stay the single source of truth; this file is committed so the history of progress diffs and every agent can read it without the tracker. A wrong value is fixed in the tracker and the file regenerated. `assets/dashboard.html` (copied byte-identical to `docs/kntl/index.html`) renders it; `assets/status.sample.json` is a complete instance of this schema for the fictional codename Pusula.

Every string the owner reads (a face's `label`, `summary`, `why`, `reason`, `what`, `note`, `startCondition`, `doneCriteria`) is plain Turkish with no technical terms; a flow is named by its slug (`onboarding akışı`), the scenario name the `flow:` label carries. Identifiers (`id`, `slug`, `state`, `triage`, `kind`) are the fixed English tokens below.

## Top level

| Field | Type | Meaning |
| --- | --- | --- |
| `schema` | `"kntl-status/1"` | Schema version; the dashboard refuses another value with a one-line message. |
| `generatedAt` | ISO 8601 UTC string | When this run wrote the file. |
| `product` | object | See Product. |
| `phase` | object | See Phase. |
| `active` | object | The face and flow the project is currently on. See Active. |
| `flows` | array of Flow | Every flow slug in use, each with its scenario pointer. |
| `faces` | array of Face, seven entries in router order | `app-shell`, `onboarding`, `paywall`, `platform`, `landing`, `marketing`, `legal`, always all seven. |
| `next` | Next | What comes next, by the order `/kntl-next` uses. |
| `blockers` | array of Blocker | Open tickets that hold other open tickets back. |
| `ownerActions` | array of OwnerAction | Open `ready-for-human` tickets. |
| `unfaced` | array of `{ number, title }` | Issues with no face label (the map excluded); empty when the tracker is clean. The report names them so the owner can label them. |

### Product

| Field | Type | Source |
| --- | --- | --- |
| `codename` | string | `docs/agents/kntl-stack.md`; the map title when the stack file carries none. |
| `platforms` | array of `"ios" \| "macos" \| "web" \| "android"` | `docs/agents/kntl-stack.md`. |
| `repo` | `"owner/name"` | `git remote -v`. |
| `map` | integer | The `wayfinder:map` issue number. |

### Phase

Read `kntl-next/SKILL.md` (the sibling skill directory) § Status block and its `references/phases.md` § Faz before filling `current`.

| Field | Type | Meaning |
| --- | --- | --- |
| `sequence` | fixed array | `["prereqs", "app-shell", "poc", "setup", "faces", "legal", "release", "post-launch"]`. |
| `current` | step | The Faz `kntl-next` writes in its Status block (the first row of `phases.md` § Faz whose observable still fails), mapped to a step id: `App Shell tasarımı` → `app-shell`, `POC` → `poc`, `stack anketi` → `setup`, `yüzler` → `faces`, `hukuk` → `legal`, `production` → `release`, `yayın sonrası` → `post-launch`. |
| `done` | array of steps | Every step of `sequence` before `current`; `prereqs` counts as done only when both `docs/agents/kntl-conventions.md` and `docs/agents/kntl-stack.md` exist. |

Steps only: the phase strip shows order, and time stays out of it.

### Active

| Field | Type | Rule |
| --- | --- | --- |
| `face` | face id | Face of the last closed ticket (latest `closedAt`); `app-shell` when nothing has closed. |
| `flow` | flow slug or `null` | Flow of that same ticket. |

### Flow

| Field | Type | Rule |
| --- | --- | --- |
| `slug` | string | Every distinct `flow:<slug>` label in use, plus every Slug in the catalogue table of `docs/design/SCENARIOS.md`. |
| `label` | string | Equal to `slug`: the flow's name is its scenario name, the word the `flow:` label, the progress line and the dashboard all print. |
| `scenario` | string or `null` | `docs/design/SCENARIOS.md` when the catalogue holds a row with this slug (the dashboard shows it beside the slug), else `null`. |

### Face

| Field | Type | Rule |
| --- | --- | --- |
| `id` | face id | The label without its `kntl:` prefix. |
| `label` | string | Owner-facing name; defaults below. |
| `state` | `"not-started" \| "in-progress" \| "done" \| "out-of-scope"` | `out-of-scope` when the map's Out of scope names the face; `done` when the face has at least one ticket, every ticket is closed, and `gaps` is empty; `in-progress` when at least one ticket is closed or assigned; otherwise `not-started`. |
| `startCondition` | string | From the map's Notes; defaults below. |
| `doneCriteria` | string | From the map's Notes; defaults below. |
| `counts` | object | See Counts. |
| `tickets` | array of Ticket | Every issue carrying this face label, open and closed, in ascending number order. |
| `gaps` | array of Gap | See Gap. |
| `decisions` | object | `count`: ledger entries whose `face` is this face and whose `state` is other than `superseded`. `provisional`: the newest three entries in state `provisional`, each `{ "id": "D-044", "gist": "<the entry's answer>" }`, newest first. |

#### Counts

All five are integers over the face's `tickets`; `done + open` equals the array length.

| Field | Rule |
| --- | --- |
| `done` | `state` is `closed`. |
| `open` | `state` is `open`. |
| `blocked` | open and `blockedBy` is non-empty. |
| `human` | open and `triage` is `ready-for-human`. |
| `agent` | open, `triage` is `ready-for-agent`, and `blockedBy` is empty: the chain can take it now. |

The report line for a face reads `<label>: <done>/<done + open> yerinde · <human> insan işi, <agent> agent ticket'ı, <blocked> bloklu`.

#### Ticket

| Field | Type | Rule |
| --- | --- | --- |
| `number` | integer | Issue number. |
| `title` | string | Issue title verbatim (a two-to-five-word plain label by convention). |
| `url` | string | Issue URL. |
| `state` | `"open" \| "closed"` | Issue state. |
| `summary` | string | The issue's `## Özet` block, verbatim; empty string when absent. |
| `flow` | flow slug or `null` | From the `flow:<slug>` label; `null` when the ticket carries none. |
| `labels` | array of strings | Every label name on the issue, verbatim. |
| `triage` | `"ready-for-agent" \| "ready-for-human" \| null` | From the triage labels. |
| `assignee` | string or `null` | Login of the assignee; an assigned open ticket is claimed. |
| `blockedBy` | array of integers | Numbers of the ticket's blockers that are still open (GitHub's `issue_dependencies_summary.blocked_by`, or the open issues in a `Blocked by:` line). Closed blockers drop out, so a non-empty array means blocked now. |
| `closedAt` | `YYYY-MM-DD` or `null` | Day the issue closed. |

#### Gap

An empty slot in the puzzle: a piece the flow needs that has no ticket yet.

| Field | Type | Rule |
| --- | --- | --- |
| `title` | string | Short plain name of the missing piece. |
| `note` | string | What filling it takes, in one sentence; `/kntl-grilling ile ticket'a dönüşür` when the map says nothing more. |
| `flow` | flow slug or `null` | The flow the gap belongs to. |

Sources, both applied: every item of the map's Not yet specified section becomes a gap on the face it names (by face id, label, or one of the face's flows), with `flow` set when the item names one; an item naming no face lands on `active.face`. Every catalogue row of `docs/design/SCENARIOS.md` whose slug no ticket carries becomes a gap titled `Senaryo: <slug>`, `flow` = its slug, on the face its Entry point names (`onboarding` → `onboarding`, `paywall` → `paywall`, any other → `active.face`).

### Next

| Field | Type | Rule |
| --- | --- | --- |
| `kind` | `"human-pack" \| "ticket" \| "phase"` | Which case below applied. |
| `number` | integer or `null` | The ticket for `kind: ticket`; `null` otherwise. |
| `title` | string | Ticket title; `İnsan işleri paketi (<n>)` for the pack; the phase step's plain name for `phase`. |
| `why` | string | One plain sentence: why this comes first. |
| `command` | string | The exact slash command the owner runs, from the rule below. |

Read `kntl-next/SKILL.md` (the sibling skill directory) § Steps (its Choose step), § Prompt by ticket, § The human batch and § Empty frontier before filling these fields. `next` is what that Choose step yields on this file's data, one `kind` per outcome: the human batch → `human-pack`, `n` = the open `ready-for-human` count, `command: /kntl-next`; a Faz inside the sequential core (`App Shell tasarımı`, `POC`, `stack anketi`) → `phase`, `command` = that row's prompt in `phases.md` § Faz; a ticket → `ticket`, `command` = the prompt § Prompt by ticket names for it; an empty frontier → `phase`, `command` = the prompt § Empty frontier names.

### Blocker

Every open ticket that appears in at least one open ticket's `blockedBy`.

| Field | Type | Rule |
| --- | --- | --- |
| `number`, `title` | integer, string | The blocking ticket. |
| `reason` | string | One plain sentence on what it waits for: the owner (`ready-for-human`), an agent, or its own blockers. |
| `blocks` | array of integers | The open tickets it holds back. |

### OwnerAction

Every open `ready-for-human` ticket.

| Field | Type | Rule |
| --- | --- | --- |
| `number`, `title` | integer, string | The ticket. |
| `what` | string | One plain sentence: the owner's move, taken from the ticket body. |

## Face defaults

Used for `label`, `startCondition`, and `doneCriteria` when the map's Notes carry none for that face.

| id | label | startCondition | doneCriteria |
| --- | --- | --- | --- |
| `app-shell` | App Shell | İlk iş | Ana değer akışı gerçek cihazda baştan sona çalışıyor |
| `onboarding` | Onboarding | Tasarım dili onaylandıktan sonra | İlk açılıştan ana değere kadar akış onaylı ve çalışıyor |
| `paywall` | Paywall ve ödeme | Tasarım dili + stack anketi | Satın alma, geri yükleme ve erişim hakkı gerçek cihazda çalışıyor |
| `platform` | Ürün altyapısı | Stack anketi | Üç ortam aynı kodla çalışıyor; dış sağlayıcılar değiştirilebilir |
| `landing` | Landing sayfaları | Tasarım dili + niş kararı | Her kampanya hedefi için yayınlanabilir sayfa ve ölçüm var |
| `marketing` | Pazarlama | App Shell + POC bitince | İlk kampanya kreatifleriyle hazır, ölçüm bağlı |
| `legal` | Hukuk | Production'dan hemen önce | Yayına hazır sözleşme ve gizlilik metinleri |

## Clusters and the progress line

A cluster is `face + flow`, derived by the dashboard and by the report from `tickets` and `gaps`; nothing about clusters is stored. For a flow: `yerinde` = tickets in the flow with `state: closed`; total = all tickets in the flow; `boşluk` = gaps with that flow. The line reads `<slug> akışı <yerinde>/<total> yerinde, <boşluk> boşluk`; with zero gaps the second clause is dropped. A cluster is complete when `yerinde` equals total and `boşluk` is zero.

## Dashboard contract

- Single file, embedded CSS and JS, light and dark theme, no network beyond `fetch("./status.json")` relative to its own URL. When the fetch fails (opened via `file://`), it shows a file picker and a drop zone that accept the JSON.
- Query parameters filter the page to the scope the skill was called with: `?face=<id>`, `?flow=<slug>`, `?ticket=<number>` (opens that ticket's detail), `?view=faces|puzzle` (default `faces`; `?flow=` defaults to `puzzle`). Unknown values fall back to the unfiltered view.
- Faces view: the phase strip from `phase` (no dates), seven face cards (`state` colour, `counts` progress bar, ticket rows `#26 — kısa ad — sade özet` with blocked rows marked), side panels `Sıradaki` from `next`, `Blokerler` from `blockers`, `Sana düşenler` from `ownerActions`; a face card opens its tickets; each card shows `decisions.count` and its `provisional` entries.
- Puzzle view: one piece per ticket, coloured by face and patterned by flow; closed pieces filled, open pieces pale, `ready-for-human` pieces edge-marked, blocked pieces locked, `blockedBy` drawn as edges; a cluster card per `face + flow` with the progress line above and the missing pieces; gaps drawn as empty slots that open their `note`; `next` highlighted; filters for face, flow, and state. A piece opens the ticket detail; a cluster opens its flow's `scenario` pointer and remaining pieces.
- `generatedAt` is visible on the page so a run can verify the browser shows this run's file.
