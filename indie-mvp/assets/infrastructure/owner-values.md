# Shared Platform Owner Values

Complete separate staging and production value sets before runtime work.

## Readiness state

- Current reusable-template state: `BLOCKED_OWNER_VERIFICATION`
- [ ] Full current FreeScout immutable digest recorded; a shortened digest prefix or stale GHCR tag is insufficient
- [ ] PostgreSQL immutable digest, major, architecture, persistence target, and FreeScout compatibility set recorded
- [ ] FreeScout PostgreSQL TLS variable mismatch resolved against the pinned artifact or maintainer evidence
- [ ] Exact `DB_PASS_FILE`, `FREESCOUT_APP_KEY_FILE`, setup, scheduler, proxy, and update contracts proven in staging
- [ ] Isolated database-plus-`/data` restore passed
- [ ] Private `foundation-evidence.json` records owner approval, primary-source review, exact manifest hash, the complete staging deployment-contract hash printed while blocked, compatibility fingerprint, secret-file/mail/scheduler results, and isolated-restore issue

Do not change the state to `STAGING_VERIFIED` or `PRODUCTION_READY` while any item above is open. Recheck the current FreeScout, Nfrastack, and PostgreSQL primary sources before selecting artifacts.

## Platform placement

- [ ] Staging orchestration mode and owner-selected context
- [ ] Production context and approved maintenance window
- [ ] Registry and immutable PostgreSQL image digest
- [ ] Registry and immutable FreeScout image digest
- [ ] PostgreSQL placement label and durable-volume node/recovery plan
- [ ] FreeScout placement label and shared durable `/data` recovery plan
- [ ] Existing private backend and ingress overlay network names
- [ ] Existing external volume names and storage drivers
- [ ] Reverse proxy/provider and required labels

## Secrets and identity

- [ ] Existing Swarm secret names for PostgreSQL admin user/password
- [ ] Dedicated FreeScout database role/password secret
- [ ] FreeScout application/encryption key secret
- [ ] Registry credentials, if needed
- [ ] Secret creation, rotation, recovery, and owner

## Service behavior

- [ ] Exact reviewed FreeScout image environment-variable and secret-file contract
- [ ] Confirm `DB_PASS_FILE` and `FREESCOUT_APP_KEY_FILE` against the pinned artifact
- [ ] Resolve `FREESCOUT_DB_PGSQL_SSL_MODE` versus upstream `DB_PGSQL_SSLMODE`; do not guess a TLS variable
- [ ] Explicit `SETUP_TYPE`, `SCHEDULER_TYPE`, and `ENABLE_AUTO_UPDATE` behavior
- [ ] PostgreSQL and FreeScout CPU/memory reservations and limits
- [ ] Health endpoint/check appropriate to the pinned FreeScout image
- [ ] TLS hostname, DNS, certificate, ingress route, and attachment limits
- [ ] SMTP/IMAP or OAuth provider, SPF/DKIM/DMARC, bounce and reply-threading plan
- [ ] Required FreeScout modules, licenses, compatible versions, and owner account/MFA

## Recovery and operations

- [ ] Off-node backup destination and retention
- [ ] Per-database logical backup and cluster-global role backup schedule
- [ ] PostgreSQL restore target, RPO, RTO, monitoring, alerts, and disk thresholds
- [ ] FreeScout database plus `/data` backup consistency procedure
- [ ] Isolated staging restore drill and accepted evidence
- [ ] Upgrade, migration, rollback, and module compatibility procedure
- [ ] Log collection/redaction and incident owner

## Approval

- [ ] Owner reviewed `shared-platform.yml` with `platform.staging.env.example` substitutions
- [ ] Owner performed staging deployment
- [ ] Owner completed mailbox, mail, portal, and locale tests
- [ ] Owner completed isolated restore drill
- [ ] Owner reviewed the same `shared-platform.yml` with separate production values and rollback
- [ ] Production validator accepted the owner-approved staging evidence without a manifest or compatibility mismatch
- [ ] Production evidence records its own issue, owner approval timestamp, and the complete production deployment-contract hash printed while blocked

The skill does not execute or inspect Docker runtime state. The owner supplies results back to the canonical infrastructure issue.
