# Release checklist

Read before the first scenario walk in step 3 of `/kntl-release`; steps 4–6 use its tables. Every check runs on staging with real modules, the parity `docs/agents/kntl-conventions.md` defines; per-environment values are read from the value files.

## Evidence row

One row per scenario, all rows in one comment on the "Production release" ticket; screenshots are `docs/kntl/smoke/<N>/<scenario-slug>-<n>.png` with N the ticket's number; a web row carries the `get_page_text` excerpt in place of a path, as `kntl-implement`'s `references/smoke.md` says.

```
| Scenario | Runtime | Steps walked | Observation | Screenshots | Verdict |
| onboarding-first-run | iOS simulator, staging build 42 | 1 open → 2 allow notifications → 3 main screen | empty state, copy as designed | onboarding-first-run-1.png … | pass |
```

Verdict: `pass` · `defect: #N (kısa ad)` (the ticket that fixes it) · `accepted limitation: D-0NN` (a limitation the owner accepted in the ledger).

## Per scenario

Walk the scenario's entry point and every state its data-state axis lists; a happy-path-only row is partial.

- **Value and navigation.** The steps as written; loading, empty, error, offline and retry where the axis lists them; the state survives backgrounding and a cold start.
- **Purchase and restore** (paid product). In the sandbox or test store `docs/agents/kntl-stack.md` names: buy each package the paywall offers; the entitlement holds after a cold start; restore on a fresh install or a second sandbox account returns it; the locked state returns when the sandbox subscription expires; price, duration and renewal text on screen equal the store product.
- **Support moments.** Request succeeds, validation fails, offline, portal unavailable, mail unavailable, composer opened versus sent; the URL context carries product, version, build, platform and locale.
- **Analytics and consent.** The scenario's events arrive in the staging analytics project with consent given and stop after the Settings opt-out; attribution and crash SDKs initialise with the staging value file's keys.
- **Accessibility and localisation.** Largest Dynamic Type (200% zoom on web), VoiceOver or screen-reader order, Reduce Motion; every shipped language on onboarding, the paywall and About.

## Once per release

- About shows version, build, publisher and the legal links; each link opens the text `/kntl-legal` published at that destination.
- The support destination answers; on iOS the Get Support quick action opens it.
- Deep-link and notification entries reach their scenario through the app's router on the staging build.
- A forced test crash from staging appears in the crash tool; on web the health endpoint answers 200 over TLS.
- Typecheck, tests, lint and a build of every target are green on the release build's commit.

## Store and site readiness

Who: `agent` (verified from the repo or through an access path), `draft` (text prepared for the owner to paste), `owner` (a field only the owner can set; it goes on the checklist with its value).

### Apple (App Store Connect)

| Row | Who | Evidence |
| --- | --- | --- |
| App Privacy answers equal the rows of `docs/legal/data-provider-inventory.md` | draft | inventory row per answer |
| Privacy policy URL and support URL fields point at the published texts | draft | both URLs open |
| Age rating questionnaire | draft | answers from the inventory's trigger table |
| Paid Apps agreement, tax and banking complete (paid product) | owner | Agreements page |
| Subscription products and offers in Ready to Submit with localised display names | agent | store-state read tools |
| Screenshots per device family from real runtime captures, per language | agent | `docs/kntl/smoke/<N>/store/` |
| Review notes, with a demo account when sign-in exists | draft | the account works on staging |
| Export compliance answer | draft | encryption use in the code, cited by file path (TLS-only → exempt) |
| Sign in with Apple offered wherever a third-party sign-in is | agent | scenario row |
| In-app account deletion when accounts exist | agent | scenario row |
| Restore Purchases visible on the paywall (paid product) | agent | scenario row |
| Version release set to manual | owner | version page |

### Android (Google Play)

Data safety form from the inventory (`draft`), content rating (`draft`), the internal testing track running the release build (`agent`), the production track rollout (`owner`).

### Web

| Row | Who | Evidence |
| --- | --- | --- |
| Production host, DNS and TLS certificate | owner | `curl -sI` answers 200 |
| Health endpoint and error page | agent | staging response |
| Legal pages and `/support` at their final URLs | agent | pages open |
| Analytics, crash and attribution keyed to the production projects | agent | value file diff |
| Every campaign destination from the landing face | agent | each URL answers 200 |
| Rollback: the previous tag and the exact command | draft | platform face ticket |

## Publication stages (input to the wizard)

- **Apple:** 1 select the uploaded build for the version · 2 paste the drafted metadata, screenshots, privacy and rating answers · 3 attach review notes and the demo account · 4 set manual release · 5 submit for review · 6 on approval, release · 7 wait until the lookup below returns the app.
- **Web:** 1 run the production deploy steps from the platform face's ticket · 2 confirm DNS and TLS · 3 run the health check · 4 keep the rollback command open through the first hour · 5 paste the deploy output.
- **Both:** activate the campaigns `/kntl-marketing` prepared, with the budget the owner sets; when İzin paketi line 5 is `hayır`, a last stage after the lookup returns the app: `git tag v<version> <commit> && git push origin v<version>`.

## Public: lookup commands

- Apple: `curl -s "https://itunes.apple.com/lookup?bundleId=<bundle-id>" | jq -r '.results[0].version'` prints `<version>`, and `.results[0].trackViewUrl` opens signed out.
- Play: `curl -sI "https://play.google.com/store/apps/details?id=<package>"` answers 200 (reachability); the production track's version and build number are read through the Play access path in `docs/agents/kntl-stack.md`.
- Web: `curl -sI https://<production-host>/` answers 200 over TLS, and the About screen or health endpoint shows the release build's version.

Then, read-only through the MCP read tools `kntl-stack.md` names: the first production events in the analytics tool and the first sessions in the crash tool.
