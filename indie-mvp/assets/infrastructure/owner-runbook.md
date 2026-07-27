# Shared PostgreSQL and FreeScout Owner Runbook

## Purpose

Prepare one staging and one production PostgreSQL installation plus one staging and one production FreeScout service. Every runtime operation is owner-executed.

## Staging sequence

1. Keep foundation state `BLOCKED_OWNER_VERIFICATION`; complete `owner-values.md` and a private staging copy of `platform.staging.env.example`.
2. Review immutable images, source/changelog, supported database versions, security advisories, and FreeScout module compatibility.
3. Confirm the pinned FreeScout image's actual environment and secret-file contract, including `DB_PASS_FILE`, `FREESCOUT_APP_KEY_FILE`, explicit setup/scheduler/update behavior, and the unresolved PostgreSQL TLS variable spelling. Update the single `shared-platform.yml` source only from recorded evidence.
4. Create or verify owner-managed networks, volumes, placement labels, secrets, DNS/TLS, ingress, backup destination, and monitoring.
5. Keep the state blocked and run `node indie-mvp/scripts/validate-shared-platform.mjs --values <private-staging-values> --environment staging` from this skill checkout, then perform an independent YAML review. Record the printed deployment-contract, manifest, and compatibility fingerprints in a private copy of `foundation-evidence.json.example`; attach exact primary-source evidence to the linked GitHub issue. The deployment-contract fingerprint covers every declared deployment value but deliberately excludes `FOUNDATION_STATE` and `FOUNDATION_CONTRACT_EVIDENCE`, which are evidence-control fields; changing either therefore cannot create a self-referential hash. This validator reads files only; it never invokes Docker or a container runtime.
6. Execute the staging runtime deployment manually.
7. Capture service placement, health, resource, storage, TLS, log-redaction, and restart evidence.
8. Create the dedicated FreeScout database/role through the owner-approved PostgreSQL administration path.
9. Complete FreeScout web setup, admin security, mail, required modules, portal, locale, attachment, retention, and privacy settings.
10. Test inbound mail, outbound mail, reply threading, bounce handling, portal magic links, attachments, isolation, API/webhooks, and Apple private relay.
11. Back up PostgreSQL globals, FreeScout database, and FreeScout `/data`.
12. Restore into an isolated staging target and prove portal, attachment, mail, and module state.
13. Record exact mail/scheduler, secret-file, compatibility, restore, and risk evidence in the infrastructure issue. Put the blocked-state run's printed `deploymentContractSha256` into the private evidence JSON as `stagingDeploymentContractSha256`, change the private staging values to `STAGING_VERIFIED`, set `FOUNDATION_CONTRACT_EVIDENCE` to that evidence issue, and rerun with `--foundation-evidence <owner-approved-foundation-evidence.json>`. The state is invalid until the complete deployment contract—including environment, network, volume, placement, secret identifiers, resources, hostname, database/user, and stack values—matches. Promote only after this check passes.

## Production sequence

1. Copy `platform.production.env.example` privately and promote only reviewed staging values and immutable digests into it.
2. Confirm production-specific networks, volumes, labels, secrets, DNS/TLS, mail, backup, monitoring, and maintenance window.
3. Create the production evidence issue and put its exact URL in `FOUNDATION_CONTRACT_EVIDENCE`. While production remains `BLOCKED_OWNER_VERIFICATION`, run the validator without evidence and copy its `deploymentContractSha256` into the private evidence JSON as `productionDeploymentContractSha256`. Review rollback and shared-database blast radius, but do not add production approval or change readiness state yet.
4. Execute deployment manually.
5. Repeat health, persistence, mail, portal, API, backup, and alert checks.
6. Record the production result in the evidence issue. Only after owner acceptance, add `productionOwnerApproved=true` and its timestamp to the evidence JSON, change the values once from `BLOCKED_OWNER_VERIFICATION` to `PRODUCTION_READY`, and run the final validator with `--foundation-evidence <owner-approved-foundation-evidence.json>`. The validator must confirm the complete production deployment contract, current manifest, production evidence issue, and staging-proven compatibility fingerprint. If it fails, return to blocked state. Schedule the first restore verification only after this final check passes.

## Upgrade

1. Recheck core/image/module compatibility and advisories.
2. Take database, globals, and `/data` backups.
3. Rehearse upgrade and rollback on staging.
4. Verify migrations, mail polling, queues, portal, API, modules, locale, and attachments.
5. Approve a production maintenance window.
6. Execute manually and retain the previous immutable digest until acceptance.

## Recovery

Recover PostgreSQL and FreeScout `/data` as one consistent application state. A backup does not pass until an isolated restore proves authentication, portal access, conversations, attachments, modules, mail configuration, and encryption-dependent data.

When uncertain, keep the product's native-email support fallback active and stop before production change.
