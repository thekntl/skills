# Web Stack and Data Topology Decision Research

**Date:** 2026-07-27
**Decision context:** One solo developer, public launch in 3–7 days, Apple and web products, an existing three-node production Docker Swarm, a separate staging server, and a hard rule that agents never operate Docker or production infrastructure.

## Contents

- Executive recommendation
- Go-rendered HTML with HTMX
- Astro for the separate marketing website
- Web HTML and Apple API boundary
- Coolify, the existing Swarm, and management UI
- PostgreSQL topology
- SQLite, libSQL, and Turso
- `pnpm`, Turborepo, and Go in one monorepo
- Final fixed-stack proposal

## Executive recommendation

| Concern | Recommended paved road |
| --- | --- |
| Interactive web product | Go + `net/http`-compatible `chi` + `templ` + HTMX |
| Public SEO pages in the web product | Normal server-rendered, independently addressable HTML routes |
| Marketing website | Separate static Astro app using content collections, i18n routing, and sitemap integration |
| Apple-to-backend protocol | Versioned JSON HTTP API described by OpenAPI 3.1; generate the Swift client |
| Default production data | One shared PostgreSQL installation, with a separate database and least-privilege login role per product |
| Staging data | A separate PostgreSQL installation; never share the production cluster |
| SQLite exception | Embedded SQLite only for a single-instance, low-write, non-critical service |
| libSQL/Turso | Not the self-hosted default; reconsider only for a product-specific replication requirement |
| Swarm management layer | Add nothing now; do not place Coolify over the production Swarm |
| Monorepo orchestration | `go.work` for Go; `pnpm` workspaces + Turborepo for Astro/JavaScript packages only |

This preserves the user's preferred Go/HTMX model. Astro is recommended for marketing because it standardizes content operations, not because Go SSR has weak SEO.

## 1. Go-rendered HTML with HTMX

### Fit

HTMX normally sends HTTP requests and expects HTML—not JSON—from the server. It can replace only a selected part of the current document. Its `hx-boost` feature progressively enhances ordinary links and forms; without JavaScript, those links and forms continue to work. These properties match a Go server-rendered application well. See the official [HTMX documentation](https://htmx.org/docs/) and [`hx-boost` reference](https://htmx.org/attributes/hx-boost/).

`templ` is a good fixed rendering layer:

- It compiles HTML components into Go code and supports both server-side and static rendering. [templ introduction](https://templ.guide/)
- Its official HTMX guide demonstrates returning complete HTML while HTMX selects and swaps the requested fragment. [templ + HTMX](https://templ.guide/server-side-rendering/htmx/)
- It removes the need for a client application framework while retaining reusable, typed components.

Use `chi` where the product needs grouped HTML routes, API routes, and middleware. It remains fully compatible with Go's `net/http`, has no external runtime dependencies, and is designed for composable HTTP/REST services. [chi repository](https://github.com/go-chi/chi)

### SEO verdict

Go SSR + HTMX is sound for SEO when each public route:

- returns its meaningful content in the initial HTML response;
- has a unique, independently accessible URL;
- uses crawlable `<a href>` links;
- returns correct status codes, title, canonical, description, structured data, and language metadata;
- provides a sitemap and does not hide essential content behind an HTMX-only interaction.

Google says classical and server-rendered pages expose their content directly in the HTTP response, and still recommends server-side or pre-rendering because it is faster for users and crawlers and not every bot executes JavaScript. [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) Google also recommends SSR, static rendering, or hydration instead of bot-specific dynamic rendering. [Google dynamic rendering guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering)

Therefore, HTMX is not an SEO liability by itself. The failure mode would be an app shell whose important public content exists only after an HTMX request.

### Rendering rule

Use progressive enhancement:

1. A normal browser GET returns the complete page.
2. An HTMX request may return either the complete page plus `hx-select`, or a focused fragment.
3. Forms retain normal `action` and `method` behavior wherever practical.
4. Authentication-only screens may be `noindex`; acquisition and informational screens must be full SSR pages.

## 2. Astro for the separate marketing website

### What Astro materially adds

Astro is explicitly designed for content-driven sites such as marketing sites and blogs. It pre-renders pages to static HTML by default, ships no client JavaScript by default, and supports selective interactivity. [Why Astro](https://docs.astro.build/en/concepts/why-astro/) Its content collections provide schemas, validation, querying, and build-time rendering for structured Markdown or other content. [Astro content collections](https://docs.astro.build/en/guides/content-collections/)

For this product system, Astro also provides reusable primitives for:

- static output by default, avoiding a long-running application process for content pages;
- structured daily SEO articles through content collections;
- localized route generation and fallback behavior; [Astro i18n routing](https://docs.astro.build/en/guides/internationalization/)
- automatic sitemap generation for statically generated routes. [Astro sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)

### What Astro does not add

Astro does not receive an inherent ranking advantage over correct Go SSR. Both can return complete semantic HTML, correct metadata, fast responses, sitemaps, and localized routes.

The material benefit is operational consistency for a fixed, content-heavy marketing template:

- editors and agents add validated content without touching product handlers;
- a failed product backend does not have to take down static acquisition pages;
- static pages are straightforward to cache and serve;
- all products can reuse one marketing-site structure.

The cost is a second build ecosystem and template language. This is acceptable because the marketing site is already a separate concern and `pnpm`/Turborepo are selected.

### Decision

Use:

- **Go + templ + HTMX** for the authenticated or interactive web product;
- **Astro static output** for the marketing site, SEO content, campaign landing pages, legal pages, and localized acquisition pages.

Keep the design tokens and brand assets shared, but do not force the two applications to share rendering code.

## 3. Web HTML and Apple API boundary

HTMX routes and Apple client routes have different representations and should not be conflated.

Recommended boundary:

```text
/                  Astro marketing site or marketing origin
/app/...            Go HTML routes: full pages and HTMX fragments
/api/v1/...         Go JSON API for Apple and other machine clients
/openapi.yaml        Versioned API contract
```

Both the HTML transport and JSON API call the same product-owned application services. They do not call each other. External providers remain behind the required adapter interfaces.

OpenAPI is a language-independent HTTP API description that lets humans and tools understand a service without reading its source. [OpenAPI specification](https://spec.openapis.org/oas/latest.html) Use OpenAPI **3.1** as the conservative fixed version: Apple's Swift OpenAPI Generator fully supports 3.0 and 3.1, while its 3.2 support is currently described as preliminary. The generator can create a type-safe URLSession client at build time for iOS, iPadOS, macOS, watchOS, and visionOS. [Swift OpenAPI Generator](https://github.com/apple/swift-openapi-generator)

Rules:

- Apple clients use `/api/v1`, never HTMX endpoints.
- API-breaking changes require a versioned contract change.
- Contract tests verify the Go implementation against `openapi.yaml`.
- The generated Swift transport is wrapped by a product-owned repository/service interface so application code does not depend directly on generated types.
- HTML and API handlers share use cases, authorization policy, and validation logic but have separate response models.

## 4. Coolify, the existing Swarm, and management UI

The user likely meant **Coolify**, not “Qualify.”

Coolify's documentation still labels Docker Swarm support **experimental**. It requires an external registry reachable by all nodes, and movable persistent services require shared storage across workers. [Coolify Docker Swarm documentation](https://coolify.io/docs/knowledge-base/docker/swarm)

More importantly, Coolify's current first-party release notes say Docker Swarm support was marked deprecated ahead of removal in v5. [Coolify releases](https://github.com/coollabsio/coolify/releases)

Adding Coolify would also introduce a second control plane that can:

- create or import overlay-network destinations;
- configure its own proxy behavior;
- build, pull, start, stop, and clean up resources through SSH;
- alter the deployment path for already-running applications.

That is not an acceptable default on a production Swarm containing unrelated live applications.

### Decision

Leave the production Swarm unchanged for the MVP system. Continue generating:

- Dockerfiles;
- Compose/stack YAML;
- health checks;
- migration and rollback instructions;
- a human-run deployment checklist.

The owner remains the only production Docker operator. This restriction also covers indirect Docker control through Coolify, Portainer, or their APIs.

If a GUI becomes necessary later, Portainer CE has an explicit current LTS installation path for Docker Swarm using its server and agents. [Portainer CE on Swarm](https://docs.portainer.io/2.33-lts/start/install-ce/server/swarm/linux) That makes it a more relevant management-UI candidate than a PaaS deprecating Swarm support. It still adds a privileged control surface, so evaluate it only in staging and only as a separate infrastructure project. Do not add either tool during the 3–7 day product launch.

## 5. PostgreSQL topology

### Default: one shared production installation

PostgreSQL is designed for one running server installation to manage many databases, and its documentation says a separate database is typically used for each project or user. [Creating a PostgreSQL database](https://www.postgresql.org/docs/current/tutorial-createdb.html)

Use:

- one production PostgreSQL installation;
- one database per product;
- one non-superuser login role per product;
- database ownership and grants restricted to that product;
- a completely separate PostgreSQL installation for staging.

Do **not** put every product into one shared application schema, and do not reuse credentials across products.

This minimizes patching, monitoring, memory, connection, and backup administration for a solo operator. It also creates a shared failure and maintenance domain. PostgreSQL roles are cluster-global, so naming and grants must be disciplined. [PostgreSQL database roles](https://www.postgresql.org/docs/current/database-roles.html)

### Backups and recovery

Use two layers:

1. Per-database logical backups with `pg_dump`, plus cluster-global roles/privileges with `pg_dumpall --globals-only`. PostgreSQL documents that `pg_dump` handles one database while `pg_dumpall` also preserves cluster-wide objects. [PostgreSQL SQL dump](https://www.postgresql.org/docs/current/backup-dump.html)
2. WAL archiving and physical base backups when point-in-time recovery becomes required. PostgreSQL's PITR restores the physical cluster, not an individual database, so the recovery runbook must account for the shared blast radius. [PostgreSQL PITR](https://www.postgresql.org/docs/current/continuous-archiving.html)

Backups are not complete until an isolated restore test succeeds. Store copies off the production nodes.

### High availability

Running more identical PostgreSQL containers is not HA. PostgreSQL HA requires an explicit primary/standby, replication, failover, fencing, and durable storage design.

Streaming replication is asynchronous by default; synchronous replication improves durability but adds commit latency and can affect availability if required standbys disappear. [PostgreSQL standby and replication](https://www.postgresql.org/docs/current/warm-standby.html)

For the initial paved road:

- prioritize tested backups, recovery time, and monitoring;
- do not create an improvised multi-primary database inside Swarm;
- add a standby/failover design only as a dedicated infrastructure phase.

### When to split out one product

Move a product to its own PostgreSQL installation when at least one is true:

- measured resource contention affects other products;
- it requires a different PostgreSQL version or incompatible extensions;
- its revenue or data criticality requires an independent recovery/failover policy;
- legal, privacy, or customer isolation requirements demand it;
- its maintenance window can no longer be shared.

Per-product PostgreSQL from day one gives stronger blast-radius isolation but multiplies upgrades, backups, alerts, restore drills, memory use, and credentials. It is the exception, not the MVP default.

## 6. SQLite, libSQL, and Turso

SQLite is valid for a small server application when the Go process and database file live on the same machine and write concurrency is low. SQLite itself says it is suitable for many low-to-medium traffic sites, but recommends a client/server database for multiple networked clients, high write concurrency, or multi-server websites. It allows only one writer at a time. [When to use SQLite](https://www.sqlite.org/whentouse.html)

SQLite WAL requires readers to be on the same machine and does not work over a network filesystem. [SQLite WAL](https://www.sqlite.org/wal.html) Therefore, an embedded SQLite database does not fit a replicated Swarm service unless the service is intentionally constrained to one instance and one durable node.

libSQL can provide remote access and embedded replicas, but its maintainers state that it inherits SQLite's fundamental single-writer model. They also distinguish it from the new Turso Database engine; libSQL is production-ready, while the new engine is not yet production-ready. [libSQL repository](https://github.com/tursodatabase/libsql) Self-hosting it adds a primary, replica, authentication, durable-volume, backup, and failover system—more moving parts than the shared PostgreSQL default.

Decision:

- permit embedded SQLite only for a single-instance, low-write service whose recovery and scaling constraints are explicit;
- do not use SQLite on shared/network storage;
- do not make self-hosted libSQL the default;
- reconsider managed Turso or self-hosted libSQL only when local-first reads, edge replicas, or database-per-tenant is a verified product requirement.

## 7. `pnpm`, Turborepo, and Go in one monorepo

`pnpm` has built-in monorepo support through `pnpm-workspace.yaml`. [pnpm workspaces](https://pnpm.io/workspaces) Turborepo describes itself as a build system optimized for JavaScript and TypeScript codebases and schedules scripts declared in workspace `package.json` files. [Turborepo repository](https://github.com/vercel/turborepo), [Turborepo task configuration](https://turborepo.dev/docs/reference/configuration)

Go has its own multi-module workspace mechanism through `go.work`. [Go workspace tutorial](https://go.dev/doc/tutorial/workspaces)

Use each tool where it is native:

```text
/
  apps/
    product-web/       # Go + templ + HTMX
    marketing/         # Astro
    apple/             # Xcode project/workspace
  api/
    openapi.yaml
  packages/
    design-tokens/     # Shareable generated assets/tokens
  infra/               # Docker/stack templates; human-operated
  go.work
  pnpm-workspace.yaml
  turbo.json
```

- `go.work` coordinates Go modules.
- `pnpm` coordinates Astro and any JavaScript/design-tool packages.
- Turborepo caches and orders JavaScript-package tasks.
- Root scripts may invoke both toolchains for a one-command developer experience.
- Do not pretend Turborepo understands Go imports or the Go dependency graph.
- If a `package.json` wrapper invokes Go checks, treat it as explicit glue and declare its cache inputs/outputs carefully; native `go test`, `go vet`, and builds remain authoritative.

This preserves the user's preferred `pnpm` + Turborepo visibility without making Go depend on a JavaScript build system.

## Final fixed-stack proposal

Adopt these Round 2 decisions:

1. **Apple:** Swift + SwiftUI, Liquid Glass-era OS baseline as decided separately.
2. **Interactive web app:** Go + `chi` + `templ` + HTMX.
3. **Marketing site:** Astro static output.
4. **Apple/backend boundary:** REST-style JSON HTTP API + OpenAPI 3.1 + Swift OpenAPI Generator.
5. **Database:** shared production PostgreSQL, separate database and role per product; separate staging PostgreSQL.
6. **Database exception:** embedded SQLite only for an explicitly single-instance low-risk service; no default libSQL.
7. **Monorepo:** `go.work` + `pnpm` workspaces + Turborepo scoped to JS/content packages.
8. **Infrastructure UI:** no Coolify or Portainer now; preserve the existing Swarm and human-only deployment boundary.

These choices minimize recurring operational work, keep SEO content easy to produce, preserve native Apple clients, and avoid introducing a new production control plane during a one-week launch.
