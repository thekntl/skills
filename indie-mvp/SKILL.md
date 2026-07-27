---
name: indie-mvp
description: Validate and launch a solo Apple-platform or web product from codename and promise to a public, measurable MVP on a three-to-seven-day public-product clock, with optional pre-build demand validation.
---

# Indie MVP

Run one visible launch map with short, phase-scoped frontiers. Keep decisions in GitHub, ask only at real crossroads, and turn each settled phase into agent-ready implementation work.

## Start or resume

1. Read [operating-contract.md](references/operating-contract.md) before changing project state.
2. Find the product repository and canonical `Product Launch Map` issue.
   - If both exist, resume from the active frontier. Do not replay completed discovery.
   - If either is absent, read [phase-bootstrap.md](references/phase-bootstrap.md) and bootstrap from the codename, product promise, target market/category, and platform. Ask only for missing inputs that block the selected route's first artifact: a demand experiment for validate-first, or a target-runtime prototype for build-first/parallel.
3. Read [product-map-and-grilling.md](references/product-map-and-grilling.md). Keep one master map; open a short Wayfinder checkpoint at each phase boundary.
4. Load only the reference for the active phase.

Completion criterion: the active phase, its canonical issue, its open decisions, and its next checkable gate are visible.

## Run the phase engine

Use this order, skipping a gate only when its reference explicitly permits it:

1. **Bootstrap:** identity, private repository, product map, glossary, countdown, validation route, long-lead owner actions.
2. **Demand validation, when selected:** test the promise and payment intent before full product construction.
3. **Frontend:** complete backend-independent behavior on every actual target runtime.
4. **Integrations:** define product-owned adapters, events, consent, paywall, attribution, support, and telemetry.
5. **Backend:** close as backendless or derive services from approved frontend contracts.
6. **Market and marketing:** confirm competitors, analyze pain points, build the marketing system, and prepare value-led acquisition.
7. **Release:** prove critical paths, publish, and make the complete system observable.
8. **Post-launch:** learn from product, acquisition, support, review, and search evidence.

For each phase:

1. Open or update one phase issue from [phase-issue.md](assets/github/phase-issue.md).
2. Run a scoped Wayfinder checkpoint: current evidence, decisions, risks, gate, and smallest credible route.
3. Apply paved-road defaults from [fixed-stack.md](references/fixed-stack.md).
4. Use Batch Grill only for material unresolved choices. Record uncertainty and run the mandatory reevaluation round.
5. Convert every settled outcome into self-contained implementation issues.
6. When the phase frontier contains only `ready-for-agent` work, read [implementation-loops.md](references/implementation-loops.md) and generate that phase's unattended package.
7. Verify the phase gate and update the master map. For interactive work, run the manual Ask Matt closeout before the next operation. For autonomous work, keep processing eligible issues and put one exact Ask Matt reminder in the final morning report.

Completion criterion: the phase issue contains decision evidence, gate evidence, linked agent-ready work, the uncertainty verdict, and either the interactive Ask Matt result or the autonomous-loop reminder.

## Load phase references

- For product creation and identity, read [phase-bootstrap.md](references/phase-bootstrap.md).
- For a selected pre-build or parallel demand test, read [phase-demand-validation.md](references/phase-demand-validation.md).
- For screens, states, Mobbin research, Figma, and native prototypes, read [phase-frontend.md](references/phase-frontend.md).
- For providers, adapters, analytics, monetization, attribution, consent, and support, read [phase-integrations.md](references/phase-integrations.md).
- For Go services, persistence, external systems, shared infrastructure, and FreeScout provisioning, read [phase-backend-and-infrastructure.md](references/phase-backend-and-infrastructure.md).
- For competitors, Astro/Kickstart research, websites, social, email, creative, ads, ASO, and SEO, read [phase-market-and-marketing.md](references/phase-market-and-marketing.md).
- For QA, App Store/web publication, owner-run deployment handoffs, and evidence loops, read [phase-release-and-postlaunch.md](references/phase-release-and-postlaunch.md).

## Preserve hard boundaries

- Speak with the owner in Turkish. Write code, documentation, research, issues, comments, and pull requests in English.
- Treat GitHub Issues as the operational source of truth. End every issue and substantive issue comment with `## Plain-English summary`.
- Keep the public-launch target at three to seven days. Move nonessential scope to post-launch.
- Prototype visual decisions on their actual platform. A browser mock is not approval evidence for an Apple interface.
- Put every external system behind a product-owned Adapter boundary.
- Prepare Docker artifacts and owner instructions; leave every Docker, Compose, context, API, Swarm, and Docker-backed runtime operation to the owner.
- Start viable providers on free plans. Leave payment methods, purchases, upgrades, budgets, legal assent, identity verification, MFA, and irreversible ownership changes to the owner.
- Do not commit, push, publish, deploy, create paid resources, or activate campaigns unless the current request and authority explicitly include that action.

Completion criterion: no hidden decision store, unresolved product choice, Docker runtime action, secret, spend action, or owner-only operation enters an unattended queue.
