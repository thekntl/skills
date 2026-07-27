# Shared PostgreSQL and FreeScout Infrastructure

**Research date:** 2026-07-27
**Scope:** Current FreeScout, Nfrastack, PostgreSQL Official Image, GitHub Container Registry, and OCI/CNCF Distribution primary sources only. No container/runtime command, deployment, install, or external mutation was performed.

## Table of contents

- [Decision](#decision)
- [Database support and compatibility boundary](#database-support-and-compatibility-boundary)
- [Image sources and immutable candidates](#image-sources-and-immutable-candidates)
- [PostgreSQL image contract](#postgresql-image-contract)
- [FreeScout image contract](#freescout-image-contract)
- [Digest resolution without Docker](#digest-resolution-without-docker)
- [What the reusable template must not generalize](#what-the-reusable-template-must-not-generalize)
- [Template corrections and remaining gates](#template-corrections-and-remaining-gates)

## Decision

The shared-platform package is **not production-ready without an owner-run staging verification**.

The current FreeScout core explicitly lists PostgreSQL as supported, and the current linked container source includes PDO PostgreSQL support. However, FreeScout publishes **no PostgreSQL minimum, maximum, or tested-major matrix**. A reusable production template therefore cannot claim that PostgreSQL 17, 18, or any other major is FreeScout-compatible solely from upstream documentation. The owner must select a maintained PostgreSQL major, pin it, and verify the exact FreeScout image, required modules, migrations, mail flow, scheduler/worker behavior, backup, restore, and rollback in staging.

Only one current immutable candidate could be identified from the first-party pages inspected. This is not a deployment approval:

| Component | Current candidate checked on 2026-07-27 | Status |
| --- | --- | --- |
| FreeScout container | **Blocked:** current Docker Hub tags are `2.2.1`/`2.2.1-alpine`, but the inspected page exposes only shortened platform digest prefixes. | A shortened prefix is not an immutable production reference. GHCR still showed `2.2.0`; its digest is stale and must not be promoted as current. |
| PostgreSQL container | `docker.io/library/postgres@sha256:3a82e1f56c8f0f5616a11103ac3d47e632c3938698946a7ad26da0df1334744a` | Current multi-architecture index candidate for `18.4`; the shown AMD64 manifest is `sha256:d93de42662696f278fb34354b06fdaa90ad7ca3106d6f72fbd01d16da006d2cf`. Neither proves FreeScout compatibility. |

Sources: [FreeScout requirements](https://github.com/freescout-help-desk/freescout#requirements), [FreeScout-linked container redirect](https://freescout.net/docker/), [current Nfrastack Docker Hub tags](https://hub.docker.com/r/nfrastack/freescout/tags), [Nfrastack GHCR package](https://github.com/nfrastack/container-freescout/pkgs/container/container-freescout), [PostgreSQL 18.4 AMD64 image](https://hub.docker.com/layers/library/postgres/18.4/images/sha256-d93de42662696f278fb34354b06fdaa90ad7ca3106d6f72fbd01d16da006d2cf), [PostgreSQL versioning policy](https://www.postgresql.org/support/versioning/).

## Database support and compatibility boundary

FreeScout core currently lists:

- MySQL 5.0 or newer;
- MariaDB 5.0 or newer;
- PostgreSQL, with **no version constraint stated**.

The web installer likewise offers MySQL or PostgreSQL. The installation guide's package and SQL examples remain MySQL/MariaDB-oriented, so they do not establish a PostgreSQL major or PostgreSQL-specific production setup. Sources: [FreeScout requirements](https://github.com/freescout-help-desk/freescout#requirements), [installation guide](https://github.com/freescout-help-desk/freescout/wiki/Installation-Guide#8-installing-the-application).

The current Nfrastack `Containerfile` enables `PDO_PGSQL`, and the image changelog records that PostgreSQL support was restored in container version 2.0.3 after being accidentally omitted during the 1.x-to-2.x transition. This proves current image intent, not compatibility with every PostgreSQL major. Sources: [current `Containerfile`](https://github.com/nfrastack/container-freescout/blob/main/Containerfile), [container releases](https://github.com/nfrastack/container-freescout/releases).

Consequences:

- Do not state “FreeScout supports PostgreSQL 17/18” as an upstream fact.
- Do not let a maintained PostgreSQL Official Image tag substitute for application compatibility testing.
- Treat the selected FreeScout digest, PostgreSQL digest, architecture, PHP variant, core version, and paid-module versions as one compatibility set.

## Image sources and immutable candidates

### FreeScout

FreeScout core does not publish the image itself. Its official README's Docker link redirects to the separately maintained `nfrastack/container-freescout` repository. That repository publishes:

- `ghcr.io/nfrastack/container-freescout`;
- `docker.io/nfrastack/freescout`.

The former `tiredofit/freescout` and `ghcr.io/tiredofit/docker-freescout` 1.x namespaces are superseded by Nfrastack 2.x and must not be used as the reusable default. The 2.x line also changed paths and environment-variable naming. Source: [Nfrastack image README and 1.x migration](https://github.com/nfrastack/container-freescout#upgrading-from-1x).

Docker Hub currently lists the `2.2.1`, `2.2.1-alpine`, and PHP/base-specific 2.2.1 tags. Its page exposes only shortened platform digest prefixes (`4573d1d6923b` for AMD64 and `d3c0e3728463` for ARM64). Those prefixes are useful for comparison but are not complete immutable references.

The GHCR package page still presents 2.2.0-era metadata. That page cannot establish the full current 2.2.1 index or platform digest. The reusable template must therefore retain an explicit `BLOCKED_OWNER_VERIFICATION` placeholder until the complete digest for the deliberately selected 2.2.1 variant and architecture is resolved from a first-party registry surface.

Use an index digest only after confirming every target node architecture is represented; use a platform manifest when the deployment deliberately pins one architecture. Sources: [current Nfrastack Docker Hub tags](https://hub.docker.com/r/nfrastack/freescout/tags), [Nfrastack GHCR package](https://github.com/nfrastack/container-freescout/pkgs/container/container-freescout).

### PostgreSQL

`docker.io/library/postgres` is the Docker Official Image maintained by the PostgreSQL Docker Community; the `docker-library/official-images` `library/postgres` file is the current tag source of truth. PostgreSQL currently lists 18.4, 17.10, 16.14, 15.18, and 14.23 as supported minors; PostgreSQL 19 is beta. FreeScout does not choose among supported majors. Sources: [PostgreSQL Official Image repository](https://github.com/docker-library/postgres), [official-images source of truth](https://github.com/docker-library/official-images/blob/master/library/postgres), [published tag list](https://github.com/docker-library/docs/blob/master/postgres/README.md#supported-tags-and-respective-dockerfile-links), [PostgreSQL versioning policy](https://www.postgresql.org/support/versioning/).

The 18.4 index digest above is a current official-image candidate only. Selecting 18 changes the image persistence contract from the 17-and-earlier path, and remains an owner architecture/compatibility decision rather than a value to bake into all projects.

## PostgreSQL image contract

The official image contract is:

| Concern | Exact contract |
| --- | --- |
| Required initialization secret | `POSTGRES_PASSWORD` or `POSTGRES_PASSWORD_FILE`; empty is invalid unless the explicitly unsafe `trust` authentication mode is chosen. |
| Bootstrap role | `POSTGRES_USER` / `POSTGRES_USER_FILE`; defaults to `postgres`, creates a **superuser**, and creates a database with the same name unless `POSTGRES_DB` overrides it. |
| Bootstrap database | `POSTGRES_DB` / `POSTGRES_DB_FILE`; defaults to `POSTGRES_USER`. |
| Other supported secret pointers | `_FILE` is supported only for `POSTGRES_INITDB_ARGS`, `POSTGRES_PASSWORD`, `POSTGRES_USER`, and `POSTGRES_DB`. |
| Initialization scope | These variables and `/docker-entrypoint-initdb.d` scripts affect only an empty data directory. Existing clusters are not reconciled on restart. |
| Persistence, PostgreSQL 17 and below | Mount `/var/lib/postgresql/data`; mounting only `/var/lib/postgresql` can leave data in an anonymous volume. |
| Persistence, PostgreSQL 18 and above | The declared volume is `/var/lib/postgresql`; default `PGDATA` is versioned, for example `/var/lib/postgresql/18/docker`. |
| Host authentication | PostgreSQL 14+ defaults to `scram-sha-256` for host connections when `POSTGRES_HOST_AUTH_METHOD` is not set. Never generalize `trust`. |

Sources: [Official Image environment variables](https://github.com/docker-library/docs/blob/master/postgres/README.md#environment-variables), [Docker Secrets and initialization scripts](https://hub.docker.com/_/postgres#docker-secrets), [PGDATA version boundary](https://hub.docker.com/_/postgres#pgdata).

`POSTGRES_USER` is therefore the cluster bootstrap superuser, not FreeScout's least-privilege application login. The FreeScout database and role must be created through an owner-reviewed administration path, and their identifiers and grants must not be inferred from the bootstrap values.

## FreeScout image contract

### Core, database, and secret variables

For Nfrastack 2.x:

| Concern | Exact current spelling |
| --- | --- |
| Automated bootstrap | `SETUP_TYPE=AUTO`; it writes config, runs migrations, and creates the bootstrap admin on a fresh database. `MANUAL` skips that work. |
| External URL | `APP_URL=https://…` is required. `SITE_URL` is a compatibility alias, but new templates should use `APP_URL`. |
| PostgreSQL driver | `DB_TYPE=pgsql` or `DB_TYPE=postgres`. |
| PostgreSQL connection | `DB_HOST`, explicit `DB_PORT=5432`, `DB_NAME`, `DB_USER`, and `DB_PASS` or `DB_PASS_FILE`. The image default port is `3306`, so omission is unsafe. |
| PostgreSQL TLS mode | **Blocked:** Nfrastack documents `FREESCOUT_DB_PGSQL_SSL_MODE`, which would yield `DB_PGSQL_SSL_MODE`; current FreeScout code reads `DB_PGSQL_SSLMODE` instead. Do not bless either spelling until the pinned artifact or maintainer confirms the contract. `DB_SSL` is documented as MySQL/MariaDB-only. |
| Application key from a secret file | `FREESCOUT_APP_KEY_FILE=/run/secrets/<name>`, not `APP_KEY_FILE`. The `FREESCOUT_` passthrough strips the prefix and resolves its `_FILE` pointer before writing `APP_KEY`. |
| Bootstrap admin secret | `ADMIN_PASS_FILE`; the same `_FILE` table also marks admin email/first/last name and DB host/port/name/user/password as supported. |
| Deterministic upgrades | `ENABLE_AUTO_UPDATE` defaults to `TRUE`; set an explicit owner-reviewed policy rather than relying on the default. |

The upstream database configuration confirms `DB_CONNECTION=pgsql`, the standard host/port/database/user/password fields, schema `public`, and `DB_PGSQL_SSLMODE` with default `prefer`. This conflicts with Nfrastack's documented TLS variable spelling. The upstream `.env.example` says `APP_KEY` is required for the application and that `DB_PASSWORD` has a maximum length of 50 characters. Sources: [FreeScout database configuration](https://github.com/freescout-help-desk/freescout/blob/dist/config/database.php), [Nfrastack configuration tables](https://github.com/nfrastack/container-freescout#configuration), [Nfrastack passthrough and Docker secrets](https://github.com/nfrastack/container-freescout#setting-freescout-configuration), [FreeScout `.env.example`](https://github.com/freescout-help-desk/freescout/blob/dist/.env.example).

Nfrastack 2.0.3 restored PDO PostgreSQL support after it was accidentally removed. This history is another reason to verify the exact pinned image rather than infer compatibility from the moving 2.x line. Source: [Nfrastack 2.0.3 release](https://github.com/nfrastack/container-freescout/releases/tag/2.0.3).

The current base image also has an app-key generation routine enabled by the FreeScout `Containerfile`. Consequently, an externally supplied APP_KEY is a reproducibility and recovery policy, not a documented requirement for first boot. Whether generated or supplied, the same key must survive restore with the persisted config; rotating or losing it may break encryption-dependent data. The exact `FREESCOUT_APP_KEY_FILE` path should still be proven against the pinned artifact because Nfrastack's base-image documentation describes some capabilities as “advanced.” Sources: [FreeScout `Containerfile`](https://github.com/nfrastack/container-freescout/blob/main/Containerfile), [Nfrastack Laravel passthrough](https://github.com/nfrastack/container-laravel#laravel_env_prefix-passthrough).

### Persistence

For 2.x, mount **one** of:

- `/data` (recommended): configuration, sessions, cache, uploads, modules, and version marker;
- `/www/html`: source-tree persistence, but only with the documented config/storage-redirection changes.

Logs use `/logs`. The 1.x `/www/logs`, `/assets/custom`, `/assets/custom-scripts`, and `/assets/modules` paths are obsolete. A reusable template should mount `/data`, optionally persist `/logs` according to the log policy, and back up the FreeScout database and `/data` as one recovery unit. Source: [Nfrastack persistent storage](https://github.com/nfrastack/container-freescout#persistent-storage).

### Scheduler and queue

FreeScout requires `schedule:run` once per minute for mail fetching, queue dispatching, and report digests. Current Nfrastack 2.x offers:

- `SCHEDULER_TYPE=service`: persistent `freescout-worker` queue worker plus a scheduler service firing once per minute;
- `SCHEDULER_TYPE=cron`: BusyBox cron firing once per minute;
- `alt`: alias documented by the README.

The README says the default is `service`, while the current source defaults file says `CRON`. This documentation/source mismatch means the template must set `SCHEDULER_TYPE` explicitly and staging must prove that exactly one scheduler and intended worker topology runs. Sources: [scheduler and queue README](https://github.com/nfrastack/container-freescout#scheduler--queue-worker), [current defaults source](https://github.com/nfrastack/container-freescout/blob/main/rootfs/container/defaults/40-freescout), [FreeScout cron requirement](https://github.com/freescout-help-desk/freescout/wiki/Installation-Guide#9-configuring-cron-jobs).

The upstream bare-host cron example intentionally omits `--no-interaction`, because that option disables FreeScout's embedded queue worker. Nfrastack's `service` topology may use it only because the image starts a separate persistent worker. Copying either command outside its topology can silently disable or duplicate queue processing.

### Reverse and outbound proxies

- `APP_URL` must be the real external HTTPS URL; the image derives the secure-session setting and trusted host from it.
- `FREESCOUT_APP_TRUSTED_PROXIES` writes `APP_TRUSTED_PROXIES`. Upstream accepts comma-separated proxy addresses; `*` trusts direct proxies and `**` trusts the full forwarding chain. Never put either wildcard into a reusable default.
- `FREESCOUT_APP_PROXY` is an **outbound web proxy** for FreeScout/module requests, not the reverse-proxy setting.
- Reverse-proxy labels, forwarded-header trust, proxy CIDRs, network names, TLS termination, attachment limits, and asset-cache behavior are environment-specific. FreeScout warns that proxy asset caching can cause cross-user/session failures.

Sources: [Nfrastack FreeScout configuration passthrough](https://github.com/nfrastack/container-freescout#setting-freescout-configuration), [upstream `.env.example`](https://github.com/freescout-help-desk/freescout/blob/dist/.env.example), [FreeScout installation troubleshooting](https://github.com/freescout-help-desk/freescout/wiki/Installation-Guide).

## Digest resolution without Docker

**Yes.** No Docker daemon or container runtime is needed.

The OCI/CNCF Distribution API defines `HEAD /v2/<name>/manifests/<reference>` and a successful `Docker-Content-Digest` response header. Clients must send the manifest/index media types they support in `Accept`; otherwise a registry may negotiate a platform manifest or legacy representation with a different digest. Source: [Distribution Registry HTTP API V2](https://distribution.github.io/distribution/spec/api/#existing-manifests).

For Docker Hub, its first-party API documentation shows:

1. request a read token from `auth.docker.io` scoped to `repository:library/postgres:pull`;
2. request the manifest/index from `registry-1.docker.io/v2/library/postgres/manifests/<tag>`;
3. read `Docker-Content-Digest`, or parse the index for a platform-specific manifest digest.

Source: [Docker Hub supported Registry API](https://docs.docker.com/reference/api/registry/latest/).

GHCR stores Docker V2 and OCI manifests, and public packages can be accessed anonymously. The same read-only manifest endpoint and content-digest semantics apply after handling the registry's bearer challenge. The public package page also exposes index and platform digests directly. Sources: [GitHub Container registry support](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#about-container-registry-support), [Nfrastack GHCR package](https://github.com/nfrastack/container-freescout/pkgs/container/container-freescout).

Digest lookup is read-only metadata retrieval. It does **not** prove runtime compatibility, module compatibility, successful migrations, correct secret resolution, or restorable persistence.

No registry API was called for this research because the task prohibited container APIs. The current FreeScout digest therefore remains unresolved rather than guessed from a shortened prefix or stale package page.

## What the reusable template must not generalize

- PostgreSQL major/minor, base distribution, `PGDATA`, or mount target across the PostgreSQL 17/18 boundary.
- FreeScout core, container, PHP, architecture, or module compatibility merely from a floating tag.
- Database names, roles, grants, bootstrap superuser name, or secret identifiers.
- APP_KEY generation/ownership policy, secret-file entitlement/behavior, or key rotation.
- Either disputed PostgreSQL TLS variable spelling, CA/certificate paths, or whether database traffic crosses an untrusted network.
- `APP_URL`, trusted hosts, trusted proxy CIDRs, wildcard proxy trust, outbound proxy, ingress labels, or network names.
- Scheduler mode, replica count, shared-storage semantics, resource limits, health checks, RPO/RTO, or backup consistency procedure.
- SMTP/IMAP/OAuth values, attachment limits, retention, malware controls, or paid-module versions/licenses.
- Staging and production values: they require separate databases, roles, keys, volumes, domains, and credentials.

## Template corrections and remaining gates

The source-backed static corrections are:

1. Replace `APP_KEY_FILE` with `FREESCOUT_APP_KEY_FILE`.
2. Use required `APP_URL`, not the legacy `SITE_URL`, in new templates.
3. Keep `DB_TYPE=pgsql` and explicit `DB_PORT=5432`.
4. Add explicit `SCHEDULER_TYPE`; do not inherit the disputed default.
5. Keep the PostgreSQL TLS environment key blocked until the `FREESCOUT_DB_PGSQL_SSL_MODE` versus `DB_PGSQL_SSLMODE` mismatch is resolved against the pinned artifact.
6. Keep FreeScout application persistence at `/data`.
7. Keep PostgreSQL 17-and-earlier persistence at `/var/lib/postgresql/data`; use the version-aware PostgreSQL 18+ contract if that major is selected.
8. Keep immutable image fields as owner-reviewed values; the PostgreSQL digest in this note is a dated candidate, while the current FreeScout digest is unresolved.

The official Nfrastack compose example uses a floating tag, plaintext demonstration values, and MariaDB rather than PostgreSQL. It is illustrative only and cannot verify this foundation's PostgreSQL, secret-file, or immutable-image contract. Source: [Nfrastack compose example](https://github.com/nfrastack/container-freescout/blob/main/examples/compose.yml).

The production foundation remains blocked until the owner records:

- selected architectures and the complete current FreeScout 2.2.1 plus PostgreSQL immutable digests;
- selected PostgreSQL major and an isolated staging compatibility result;
- pinned FreeScout core/container/PHP/module set;
- confirmed PostgreSQL TLS variable spelling and reviewed TLS/CA mode;
- successful secret-file resolution for `DB_PASS_FILE`, `ADMIN_PASS_FILE`, and `FREESCOUT_APP_KEY_FILE`;
- explicit scheduler/worker behavior with no duplicate scheduling;
- proxy/TLS contract;
- consistent database-plus-`/data` backup, isolated restore, upgrade, and rollback results.
