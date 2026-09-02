# skills

Agent skills for launching solo indie products the KNTL way. They sit on top of [Matt Pocock's skills](https://github.com/mattpocock/skills) and assume they are installed.

## Install

```bash
npx skills add mattpocock/skills
npx skills add thekntl/skills
```

Then, inside a product repo, run `/setup-matt-pocock-skills` once and `/kntl` to start or resume.

## The family

`/kntl` is the router: preflight, launch map, the order of work, the seven faces of the die, and which skill to reach for. Everything else is user-invoked except `kntl-grilling`, which other skills call.

| Skill | Reach for it when |
| --- | --- |
| `kntl` | Starting or resuming a product; unsure which skill comes next |
| `kntl-setup` | A new repo needs its stack questionnaire, conventions, access paths, and permission allowlist |
| `kntl-grilling` | Any decision: plain summaries, options, a decision ledger, contradiction checks |
| `kntl-design` | UI/UX from lo-fi to foundation on the real platform, inside the Design Lab |
| `kntl-poc` | Proving the value feature works before anything else is built |
| `kntl-implement` | Building one ticket end to end, or running the agent chain over the ready ones |
| `kntl-next` | "What do we do next?" without leaving the current flow |
| `kntl-status` | "Where are we?" for the project, a face, or a ticket; the dashboard |
| `kntl-explain` | "What are these tickets?" grouped and in plain language |
| `kntl-backend` | Backend, three environments sharing one code path, integrations behind adapters |
| `kntl-legal` | Legal texts right before production: public base plus addendum |
| `kntl-marketing` | Niche, campaigns, creatives, publishing, measurement |
| `kntl-release` | The production gate and publication |
| `kntl-adopt` | Bringing an existing project into the flow |
| `kntl-handoff` | Moving a project between harnesses or machines without losing state |

## Order of work

App Shell design → POC → stack questionnaire and setups → the faces in parallel (App Shell, onboarding, paywall, platform, landing pages, marketing) → legal → production. Dates are advice, never rules; scope gets cut, foundations do not.

## Sessions

Keep one working session per product (`<codename> · Ana`). Pin `/kntl-status pin` into `<codename> · Akış` and `/kntl-explain pin` into `<codename> · Ticket'lar`; archive Akış when its flow ends.

## Research

`research/` holds the primary-source notes the defaults were chosen from.
