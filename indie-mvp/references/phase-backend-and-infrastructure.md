# Backend and Infrastructure Phase

## Contents

- Backend gate
- Service design
- Fixed deployment baseline
- Docker owner boundary
- Shared foundation
- FreeScout product provisioning
- Gate

## Backend gate

Close immediately as `backendless` when approved frontend and integration contracts require no server.

Otherwise derive the backend from:

- approved frontend reads, mutations, states, and events;
- identity and authorization requirements;
- adapter and webhook needs;
- synchronization and scheduled work;
- operations, security, retention, deletion, and administration.

Decide only to MVP depth.

## Service design

Use the fixed Go/web/data stack in [fixed-stack.md](fixed-stack.md).

- Keep browser HTML/HTMX endpoints separate from versioned JSON REST.
- Describe Apple/external APIs with OpenAPI 3.1.
- Generate, do not hand-maintain, the Swift API client.
- Use `pgx`, `sqlc`, and `goose`.
- Apply Adapter boundaries to storage and external systems.
- Make idempotency, webhook verification, retry, failure mapping, and observability explicit.
- Keep administrative tools minimal and owner-operable.

For each service record data ownership, access, retention, deletion/export, migrations, jobs, health, resources, failure modes, backup, restore, and rollback.

## Fixed deployment baseline

Prepare for:

- one storage-only server;
- one three-node production Docker Swarm;
- one staging server;
- owner-managed Docker contexts.

Keep production workloads off the storage-only server. Reach storage only through an explicit adapter and approved network boundary.

Use one shared production PostgreSQL installation and a separate staging installation. Give each product an isolated database and least-privilege role. Split a product out only for measured contention, incompatible versions/extensions, independent recovery needs, or legal/isolation requirements.

Do not introduce Coolify or another privileged control plane as part of an MVP. Evaluate it only as a separate staging-first infrastructure decision.

## Docker owner boundary

The agent prepares:

- Dockerfiles;
- Compose/Swarm YAML;
- non-secret configuration examples;
- static validation;
- deployment, upgrade, backup, restore, rollback, and acceptance checklists.

The owner performs every Docker-related runtime operation, including read-only inspection, context changes, log access, deployment, restart, service update, restore, and management-UI action that changes or queries container infrastructure.

Do not use an API, UI, remote shell, or indirect tool to bypass this boundary. Continue only from owner-supplied output.

## Shared foundation

Use the one-time artifacts under `assets/infrastructure/` to prepare:

- version-pinned shared PostgreSQL production and staging services;
- isolated roles/databases, logical backup, globals backup, monitoring, restore, upgrade, and rollback;
- one FreeScout production service and staging counterpart;
- dedicated FreeScout databases/roles;
- persistent FreeScout `/data`, ingress, mail, secrets, backup, restore, module, upgrade, and rollback contracts.

Use one `shared-platform.yml` source with separate staging and production value files. Do not fork the service shape into environment copies.

The shared foundation is explicitly `BLOCKED_OWNER_VERIFICATION`, not a pre-approved production manifest. Current primary-source research does not establish a complete current FreeScout image digest, a supported PostgreSQL major matrix, or an unambiguous PostgreSQL TLS environment variable for the Nfrastack image. Before runtime use, recheck current FreeScout, Nfrastack, and PostgreSQL primary sources, then let the owner resolve those facts and supply image digests, version-aware PostgreSQL persistence, network/volume names, node labels, registry access, ingress/proxy settings, secret names, resources, scheduler behavior, backup destination, mail, DNS/TLS, monitoring, and staging results.

Run `scripts/validate-shared-platform.mjs` against the packaged blocked examples and every privately resolved environment value file. It statically rejects unresolved values, mutable images, architecture/major/persistence mismatches, disputed TLS keys, invalid readiness transitions, and missing evidence. Both a `STAGING_VERIFIED` staging claim and a `PRODUCTION_READY` production claim require the owner-approved evidence contract and reject a changed manifest, complete deployment contract, evidence issue, or compatibility fingerprint. Generate each deployment-contract hash while its environment is still blocked, then record it before changing readiness state. The hash covers environment, network, volume, placement, secret identifiers, resources, hostname, database/user, stack, and every other declared deployment value without storing secret contents; it deliberately excludes the readiness state and evidence URL so the promotion proof is not self-referential. Production carries its own issue and owner approval while preserving the staging-proven compatibility set. Blocked values remain evidence-optional. It does not parse runtime state or invoke Docker.

Do not mark the foundation `STAGING_VERIFIED` until the owner has proven the exact compatibility set, secret-file behavior, scheduling, mail, and isolated database-plus-`/data` restore. Do not mark it `PRODUCTION_READY` until reviewed production evidence exists.

## FreeScout product provisioning

Use one mailbox and customer portal configuration per product. Keep customer access email-link based; do not couple it to WorkOS during MVP. Preserve native email as a portal-unavailable fallback.

The official API requires the API & Webhooks module. Its documented boundary supports listing mailboxes and managing conversations, users, folders/custom fields, and webhooks. It does not document mailbox creation/update, inbound/outbound mail setup, mailbox permissions, module licensing, or portal creation/branding.

Therefore:

1. Generate a mailbox manifest from `assets/infrastructure/freescout-product-checklist.md`.
2. Let the owner configure mailbox, mail credentials/OAuth, permissions, module license, portal, brand, locale, and DNS.
3. Accept the mailbox ID and non-secret result.
4. Verify documented API operations when an approved connector is available.
5. Automate supported conversation/webhook/reporting work after verification.

Do not use browser automation, direct database writes, container execution, or undocumented endpoints for missing setup operations.

## Gate

Decision gate:

- every frontend contract is backendless or mapped to a service;
- data, identity, permissions, adapters, operations, security, and admin needs are explicit;
- owner runtime steps and values are visible;
- implementation issues contain no product decision.

Runtime gate:

- local/test verification passes;
- owner-supplied staging evidence is recorded;
- backup/restore and production handoff are known;
- no backend launch blocker remains.
