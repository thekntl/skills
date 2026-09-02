---
name: kntl-backend
description: "Plan the product platform face: the backend when there is one, the three environments on one code path, and every provider behind an adapter. Run bare once /kntl-setup's stack half has closed, before the first kntl:platform ticket is built."
disable-model-invocation: true
---

# KNTL Backend

Plans the product platform face (`kntl:platform`) and turns it into tickets: the backend when the product has one, the `development`, `staging`, `production` environments, and the third-party integrations, each behind an adapter. Providers and their resolved access paths come from `docs/agents/kntl-stack.md`; parity, owner-only limits, and every owner-facing format come from `docs/agents/kntl-conventions.md`, read before writing anything. Building happens ticket by ticket in `/kntl-implement`.

## Preflight

`docs/agents/kntl-stack.md` exists, and the backend row plus one row per provider the product uses (analytics, crash, payment, and whichever of identity, email, support, attribution apply) carry a Choice and a `Ready?` value other than `pending POC`. A missing file, a missing row, or a `pending POC` row → "Önce `/kntl-setup`." and stop.

## Steps

1. **Inventory the capabilities.** Read `docs/design/SCENARIOS.md`, the ledger `docs/kntl/decisions.jsonl` (its entries tagged `poc` first), and `## POC dependencies` in `docs/agents/kntl-stack.md`. Acquisition intent is parked (`references/adapters.md` → Acquisition intent); it enters the table only through a ticket `/kntl-marketing` filed. Done when every scenario's external need is a row of one capability table: capability, provider from the stack file (or none), seam home (client, backend, or both), consent purpose, ledger ids already deciding it.
2. **Size the face.** Backendless (device data only) → the face is the client-side adapters plus the build configurations. Backend → the face adds the service and three runtime environments, and needs the `Hosting` row `references/environments.md` defines; absent → call the Skill tool with `kntl-grilling` and add it from the owner's answer. Done when the map's Notes line for the platform face reads `backend` or `backendless`, a backend has its Hosting row, and each part cut (the service, the remote environments) is one line under Out of scope with its reason.
3. **Design the seams.** Call the Skill tool with `codebase-design` for the vocabulary, and with `design-an-interface` for each capability that admits more than one plausible interface shape. Read `references/adapters.md` before writing any interface: it holds the adapter rules, the provider defaults, the consent baseline, the parked acquisition-intent paragraph, and the Go service design. Anything the stack file and the ledger leave open is decided by calling the Skill tool with `kntl-grilling`. Done when every capability row has one product-owned interface, a production adapter at each seam home the row names, one fake adapter for tests and the Design Lab demo, and the app's composition root selects between them, with each choice in the ledger.
4. **Lay out the environments.** Read `references/environments.md` and lay the layout out in the shape it gives for step 2's size. Done when one table lists every service, the value keys per environment, and the secret names.
5. **Ticket the face.** Call the Skill tool with `to-tickets`, feeding it the capability table and the environment layout; the issue body and triage labels come from the conventions file and override its template. Every ticket carries `kntl:platform` and one `flow:<scenario-slug>`. Accounts, keys, paid plans, and the owner's run of each remote environment are `ready-for-human`, filed first as one batch; the rest are `ready-for-agent`, blocked natively on the human tickets they wait for. The remote-environment pair runs the other way: the owner's run is blocked on the agent's prep ticket (`references/environments.md` → Staging and production). The environment layout is the first `ready-for-agent` ticket, its `/kntl-implement` smoke being "the development stack boots on this machine with real modules"; every other agent ticket in the face is blocked on it. Done when every capability row and every environment maps to a ticket and the map's Decisions so far links this face's ledger entries.
6. **Hand back.** The conventions file's owner message, each human ticket with its exact step, `Ticket sözlüğü`, last line "Sıradaki için `/kntl-next`." Done when every human ticket is named.

## Face done

Every applicable capability runs through its production adapter from one code path, `/kntl-implement`'s smoke passed on development's real modules, the owner's staging output shows the same build running, and a diff of the value files is the whole environment difference.
