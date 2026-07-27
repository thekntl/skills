# Operating Contract

## Contents

- Launch result
- Solo-operator rules
- Communication and records
- Authority boundaries
- GitHub handoff standard

## Launch result

Treat time as a product constraint:

- establish the main product shape in two or three days;
- make the product public within three to seven days;
- test the smallest complete version of the product promise;
- start review-, verification-, domain-, and account-dependent work during bootstrap;
- keep a visible countdown, critical path, and daily target in the master issue.

A web product is in the field only at a public production URL. An Apple product is in the field only when publicly available on the App Store. TestFlight and App Review submission are intermediate evidence, not launch.

If external review prevents public availability, record the missed timebox and external blocker. Do not weaken the definition.

## Solo-operator rules

Assume one person owns product, design, engineering, release, marketing, and support.

- Prefer stable industry defaults, reversible decisions, managed services, and reusable templates.
- Add operational complexity only when current evidence pays for its ongoing ownership.
- Automate repetitive setup, testing, reporting, content, and support work.
- Keep dashboards, alerts, and recurring routines operable by one person.
- Defer work that does not test the product promise.

## Communication and records

- Communicate with the owner in simple Turkish.
- Write technical artifacts, code, identifiers, research, GitHub content, commits, and pull requests in English.
- Research discoverable facts instead of asking the owner.
- Keep decisions, tasks, bugs, risks, dependencies, evidence, and artifact links in GitHub Issues.
- Keep substantial files in the repository and link them from their canonical issue.
- End every issue and substantive comment with:

  ```markdown
  ## Plain-English summary

  <Explain the practical meaning in simple, non-technical English.>
  ```

- Maintain product domain language in `CONTEXT.md` or files linked by `CONTEXT-MAP.md`.
- Maintain owner-facing technical and operational language in `docs/GLOSSARY.md`.
- Generate `docs/glossary.html`; edit only its Markdown sources.

## Authority boundaries

The agent may:

- inspect repositories and connected services within the task scope;
- prepare code, tests, manifests, configuration examples, research, drafts, paused campaign plans, and exact operator checklists;
- configure free external resources through approved connectors when no legal, payment, identity, MFA, or irreversible ownership step is involved;
- use ASC CLI for an approved Apple release when prerequisites and authority are ready.

The owner performs or explicitly approves:

- every Docker, Docker Compose, Docker context, Docker API, Docker Swarm, container runtime, and Docker-backed management operation;
- payment methods, paid plans, add-ons, subscriptions, campaign activation, initial budgets, and budget increases;
- legal assent, company or representative verification, tax and billing declarations, MFA, recovery, and irreversible ownership changes;
- runtime values, secrets, and production deployment results that cannot be safely delegated.

Keep secrets and recovery material out of GitHub, repositories, logs, and summaries. Record the secret's approved location and owner, not its value.

## GitHub handoff standard

Create repositories under `thekntl`; default to private. Prefer the connected GitHub integration. A sandboxed `gh` authentication failure does not prove the host or connector is logged out.

Keep one canonical issue per focused implementation unit. Every pull request must include:

- canonical issue and original problem;
- user-visible outcome and why the change exists;
- included scope and non-goals;
- automated evidence and results;
- `Human validation: required`, `recommended`, or `not needed`, with a simple reason;
- exact scenario, steps, expected result, and failure signs when human validation applies;
- actual target-platform visual evidence for visual changes;
- risks, rollback, and owner-only steps;
- a plain-English merge recommendation.

Use [pull-request.md](../assets/github/pull-request.md). Do not hide a Docker runtime step inside validation instructions.
