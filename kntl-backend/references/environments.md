# Environments

Read this in step 4 of `/kntl-backend` before laying out the environments. The parity rule lives in `docs/agents/kntl-conventions.md`; this file is its mechanics.

## One code path, three value files

- The layout is one table: every service the product runs, the value keys each environment sets, and the names of its secrets. A backend is described by one compose file or one manifest set plus `development`, `staging`, `production` value files; a backendless product by the client's build configurations, `staging` being the TestFlight or preview build.
- The three value files are the only place environments differ, and they are committed. They hold connection configuration alone: URLs, provider project ids, feature flags, and the names of secrets. A key, or a connection string that carries a credential, is a secret: it lives under its name in the store the `Hosting` row names, and the value file cites that name.
- `development` points the real adapters at each provider's sandbox, test store, or dev project; `staging` and `production` point them at their own projects.
- The layout ticket writes the compose or manifest, the Dockerfiles, and the three value files; the remote environments' prep tickets below build on it.

## Development on this machine

The runtime for the layout ticket's smoke and every later platform smoke; the layout ticket's `## What to build` copies this section so `/kntl-implement` finds it in the ticket. Bring up every service the compose or manifest names with the `development` value file (local containers are the agent's to run; the remote runtime follows the conventions file's Owner-only rule), run the migrations, boot the app against it, and keep it running until the smoke evidence is captured. The modules are the real ones per the conventions file's Environment parity. A service this machine cannot run becomes a ticket.

## Staging and production: the owner's runtime

The `Hosting` row under Providers in `docs/agents/kntl-stack.md` holds hosts, Docker contexts, deploy target, and secret store; step 2 of `/kntl-backend` writes it from the owner's answer, ledger id beside the choice, and the topology is the owner's. A backend's remote environments are ticketed in pairs, per environment: one `ready-for-agent` prep ticket, blocked on the layout ticket, that produces that environment's static validation of the compose or manifest and value file, and its deploy, upgrade, backup, restore, and rollback steps (more than a few commands → call the Skill tool with `wizard` for the walkthrough); one `ready-for-human` ticket, blocked on the prep, carrying the steps or the wizard path once the prep merges, where the owner runs them and pastes the output. The remote operations themselves follow the conventions file's Owner-only rule. The human ticket is the one `/kntl-release` reads.
