# WordPress Multisite Versus Astro for Product Marketing Sites

**Date:** 2026-07-27
**Decision context:** One solo developer; multiple low-traffic product sites; an existing WordPress Multisite on the production Swarm; a custom image that is not currently optimized; a fixed FreeScout support platform; localized SEO content; agent-driven product work; public MVP launch in 3–7 days.

## Contents

- Decision
- Why Astro remains the paved road
- What WordPress Multisite would improve
- Why WordPress does not replace Astro now
- Optional future paths
- Plain-English summary

## Decision

Keep **Astro as the fixed default** for every new product marketing site. Keep the existing WordPress Multisite operating its current sites, but do not add new MVP product sites or support plugins to it by default.

Do not use WordPress as the FreeScout replacement. The product's Astro `/support` route should link to or embed the product's FreeScout customer flow, while the product app opens that same route.

WordPress can be reconsidered later as:

- an optional editorial CMS feeding Astro through the WordPress REST API; or
- a separate migration decision after the existing image, staging, upgrades, backups, performance, and automation have been proven.

Neither path belongs in the three-to-seven-day paved road today.

## Why Astro remains the paved road

### Product isolation and review

Each Astro marketing site is versioned with its product. Copy, locale files, structured content, design tokens, redirects, campaign routes, analytics, and legal pages can be reviewed in the same pull request as the product decision that changed them.

Astro content collections provide schemas, type checking, and build-time or live loaders for structured content. Astro recommends build-time collections when content is relatively static and performance, caching, image processing, and reuse matter ([Astro content collections](https://docs.astro.build/en/guides/content-collections/)).

This matches the planned agent-generated daily content workflow: content is a traceable repository artifact, a failed build blocks malformed content, and one product's deploy does not change another product.

### Localization and SEO structure

Astro has first-party internationalized routing with explicit locales, default locale, fallbacks, and locale URL helpers ([i18n configuration](https://docs.astro.build/en/reference/configuration-reference/#i18n), [i18n API](https://docs.astro.build/en/reference/modules/astro-i18n/)).

The official sitemap integration generates sitemap entries from built routes, including localized and dynamic static routes ([Astro sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)).

These features do not guarantee ranking. They do make localized URLs, schemas, metadata validation, and sitemap generation deterministic inside the reusable template.

### Runtime and design

A static Astro marketing site does not need a PHP/database request path for normal page delivery. It can reproduce the approved product prototype, typography, animation, campaign pages, and design tokens without depending on a shared theme or page-builder runtime.

This reduces runtime coupling and makes each site's rollback the rollback of one product artifact. The trade-off is that every content change needs a build and deploy, which is acceptable because the planned content loop already owns that automation.

## What WordPress Multisite would improve

WordPress Multisite gives one administrator a familiar UI for many sites. WordPress defines it as multiple sites sharing one WordPress installation and core files ([Create a Network](https://developer.wordpress.org/advanced-administration/multisite/create-network/)).

It can provide:

- browser-based manual editing;
- shared users and network administration;
- reusable network themes and plugins;
- official content APIs for posts, pages, media, users, settings, and other site resources ([REST API reference](https://developer.wordpress.org/rest-api/reference/));
- official WP-CLI site creation through `wp site create` ([WP-CLI site create](https://developer.wordpress.org/cli/commands/site/create/)).

If non-technical editors, mobile editing, or a shared editorial desk later become important, these are real advantages.

## Why WordPress does not replace Astro now

### Shared blast radius

The convenience comes from shared infrastructure. Multisite sites share the WordPress installation, while Super Admin controls network plugins, themes, upgrades, and sites. WordPress documents that core, plugin, and theme management permissions are centralized at the network level ([Multisite roles and capabilities](https://wordpress.org/documentation/article/roles-and-capabilities/)).

A problematic network plugin, theme update, core update, custom-image change, database incident, or performance regression can therefore affect several product sites together. WordPress advises backups before plugin updates and warns that plugin compatibility may be unknown when a plugin has not been updated for the current core version ([plugin management](https://wordpress.org/documentation/article/manage-plugins/)).

The existing custom image is already reported as inefficient. Making it the new-product default would pull optimization, update, backup, staging, security, and recovery work into the master-skill critical path before it has evidence of lower total ownership cost.

### Automation boundary

The core REST API is strong for content, but it is distributed per site and its standard endpoint list does not include Multisite site creation ([REST API handbook](https://developer.wordpress.org/rest-api/), [REST endpoint reference](https://developer.wordpress.org/rest-api/reference/)). WordPress provides site creation through WP-CLI instead.

On the existing Swarm, that CLI path may require an owner-executed runtime operation or a new authenticated provisioning service. The master skill must not invoke Docker or reach into the WordPress database to bypass that boundary.

### Extra plugin ownership

Using a WordPress support plugin would create a second ticket model beside FreeScout and add plugin compatibility, security, mail, backup, and migration work. A contact form may forward to the FreeScout mailbox, but it should not become the source of truth for support state.

SEO, forms, caching, multilingual content, redirects, and security commonly expand the WordPress plugin surface. Each additional network plugin must be versioned, tested on staging, backed up, monitored, and recovered across the shared network. Existing availability does not make that operating work free.

### Design fidelity

A custom WordPress theme can match the application, but the reusable implementation would need to reproduce the same product tokens, motion, components, campaign routes, and localized states inside PHP/theme conventions or a page builder. That is a second frontend system beside the approved Astro template.

For this owner, who expects agents rather than a content team to produce most pages, the WordPress editor advantage does not currently outweigh that duplication.

## Optional future paths

### Headless WordPress

Astro can load remote content because content collections accept remote and custom loaders. WordPress exposes posts, pages, media, and other resources through REST.

This preserves Astro rendering while offering WordPress editing, but it creates two systems, preview/cache invalidation, content schema mapping, authentication, media handling, localization mapping, and two backup paths. Reconsider only when manual editorial UX becomes a measured bottleneck.

### Full WordPress template

Reopen only after a separate staging-first infrastructure project proves:

1. a pinned and reproducible custom image;
2. network-level theme/plugin inventory and ownership;
3. performance budgets under representative pages;
4. automated backups and a successful restore drill;
5. isolated staging and safe network upgrades;
6. API or owner-run site provisioning;
7. localization, sitemap, canonical, structured-data, redirect, consent, form, and analytics acceptance tests;
8. design parity with the approved product frontend;
9. lower measured six-month operating effort than the Astro template.

The owner performs every Docker/Swarm runtime operation.

## Plain-English summary

WordPress is attractive because the server and editor already exist, but its sites share one operational failure surface and the current image needs work. Astro better matches isolated, version-controlled, agent-built product sites. Keep WordPress for its current sites; revisit it only if manual content editing becomes a real bottleneck and a staging project proves lower total maintenance.
