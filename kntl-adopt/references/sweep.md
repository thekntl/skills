# The live sweep

A smoke of the whole product: walk the real runtime like a user who is trying everything for the first time, and leave evidence for every step. The launch recipe in `survey.md` says how to build and start each platform; the Platform toolchain row of `docs/agents/kntl-stack.md` names the driver per platform. One walker per runtime at a time; platforms sweep in parallel, each with its own log section.

## Where it runs

- **Environment.** `development` first; `staging` when development lacks a piece the flow needs (a backend, a provider). `production` only after the owner said yes in this session, asked as one line when production is the only environment that exists; on production the sweep opens, reads, scrolls and goes back, and every form, purchase, setting and account control is recorded `not tried (production)`. A staging database that holds real users' records counts as production.
- **Accounts.** Sandbox accounts throughout: the project's seeded test users, a StoreKit configuration or Sandbox Apple ID, RevenueCat's test store, Stripe or Paddle test mode, a mail catcher. Accounts and test cards only the owner can create come through the Skill tool with `wizard`; the sweep continues from the owner's output.
- **Side effects.** Every action that leaves the device (purchase, email, push, SMS, webhook, a write to a third party) reaches a sandbox or a fake the project already ships. When the environment offers neither, the step is `not tried` with the reason and the row records what the screen showed up to that point.
- **Data.** Records the sweep created are fair game for destructive controls (delete account, clear data); other people's records are read only.
- **Design Lab.** A Lab target in the workspace is noted as one App Shell evidence line; the sweep walks the product target.

## Inventory, then walk

1. **Inventory.** From `survey.md`'s routes, navigation code and storyboards, list every screen; from the sweep itself, add every screen reached that the list missed. Group flows by scenario: an entry state (fresh install, returning user, signed out, signed in, no entitlement, entitled) plus the path to an end state, and mint each flow's slug once by the Slug rule of `kntl-design/assets/SCENARIOS.template.md` (a slug already in `docs/design/SCENARIOS.md` is reused as written); that slug is the flow's catalogue row in stage 4 and the `flow:` label on its tickets. Each flow carries the face it evidences (first open to value → `kntl:onboarding`; purchase, restore, entitlement → `kntl:paywall`; support, about, legal links → `kntl:app-shell` or `kntl:legal`; the marketing site → `kntl:landing`).
2. **Entry states first.** Reset the app and walk each entry state the sandbox can produce before drilling into screens.
3. **Screens breadth-first** from the root navigation: reach the screen, screenshot it, press every control once (buttons, rows, toggles, menus, gestures the UI advertises), then its children.
4. **Forms, three variations each,** in this order: submit empty (expect validation), submit one invalid value chosen as the most likely mistake (expect a field-level message with the entered content preserved), submit valid (expect the success end state).
5. **Flows, two paths each:** the happy path to its end state, then one error path chosen as the one a real user hits most often: offline, permission denied, cancelled purchase, invalid input at the decisive step, server error when a switch exists.
6. **After each flow,** read the console, logs and network panel: an error logged while the UI shows success is `broken` (silent failure), and evidence includes the log line.
7. **Parity at runtime:** data gone after a relaunch, accounts without a sign-in, `DEBUG`-only branches, a provider replaced by a stub outside tests join `survey.md`'s parity list with the screenshot that shows them.

Deeper variations (a fourth form case, a second error path, localisation, accessibility settings) are listed as acceptance bullets on the finding's ticket, and the sweep moves on. A screen that crashes on the second attempt is `broken` and skipped; an app that crashes on launch ends that platform's sweep with every row `not tried (launch)` and one ticket.

## Verdicts

- `works`: the end state is reached and matches what the screen promised.
- `broken`: the screen or step exists and crashes, dead-ends, shows the wrong result, or fails silently.
- `missing`: the screen, control or next step of the flow does not exist.
- `not tried`: blocked by a safety limit or a missing sandbox; the reason is in the row.

## Evidence and the sweep log

Everything lives in `docs/kntl/adopt-<YYYY-MM-DD>/` beside `survey.md`: the log at `sweep.md`, screenshots beside it named `<platform>-<screen-slug>--<state>.jpg`, committed with the other KNTL documents (İzin paketi line 3) so ticket and ledger evidence links resolve. One screenshot per screen at first reach, one per flow end state, one per failure. Store screenshots as JPEG at most 1200 px on the long side (`sips -Z 1200 -s format jpeg in.png --out out.jpg` on macOS) so the folder stays small in git.

```
# Sweep — <codename> · <YYYY-MM-DD>
Environment: development · accounts: <which sandbox> · production: <no | navigation only, owner yes at HH:MM>

## <platform>

### Coverage
| Screen | Reached via | Controls pressed | Forms (n of 3 variations) | Verdict | Evidence |
| --- | --- | --- | --- | --- | --- |
| Home | launch, signed in | 7 of 7 | — | works | ios-home--populated.jpg |
| Settings › Account | Settings row | 4 of 5 | delete account: 3 of 3 | broken | ios-settings-account--delete-error.jpg, log line 42 |

### Flows
| Flow (`flow:` slug) | Face | Path | Steps | Expected end state | Observed | Verdict | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| purchase | kntl:paywall | happy | paywall → weekly → sandbox sheet → confirm | entitlement active, paywall dismissed | entitlement active | works | ios-paywall--purchased.jpg |
| purchase | kntl:paywall | error: cancel | paywall → weekly → cancel | paywall stays, no error dialog | spinner never stops | broken | ios-paywall--cancel-spinner.jpg |

### Parity
- <observation> — <evidence>

### Not tried
- <screen or flow> — not tried: <reason>
```

## From a row to a ticket

Every `broken` and `missing` row becomes one ticket in stage 5, thin over thick: one per broken or missing step, one per screen-level gap, and a flow missing end to end gets one per step it would need. The row is the report `qa` asks for: `Observed` is what happened, `Expected end state` is what was expected, `Path` and `Steps` are the steps to reproduce, and the row answers qa's clarifying questions. Into the conventions file's body: the expected behaviour with those steps as reproduction under `## What to build`, the expected end state plus the deeper variations as bullets under `## Acceptance criteria`, the ledger ids the step rests on under `## Decisions`. Labels: the flow's face and `flow:` slug, whose catalogue row stage 4 seeded; `ready-for-human` when the missing piece needs a product decision, with the question in the body for `/kntl-next`'s human batch, otherwise `ready-for-agent`. The `Evidence` cell becomes the link to the screenshot in the sweep folder.
