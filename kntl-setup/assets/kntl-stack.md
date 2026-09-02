# KNTL stack

Written by `/kntl-setup`; every kntl skill reads the access path here instead of rediscovering it. How to use a path and what to do when a level is missing: `docs/agents/kntl-conventions.md` → Tool access. A capability absent from this file has no path yet: add the row, then use it. A category the product does not need reads `none` in Choice with the reason under Alternatives considered and `—` in `Ready?`. A row `kntl-grilling` chose or confirmed carries the ledger id after the choice: `PostHog · D-012`.

Codename `<codename>` · platforms `<apple | web | android>` · updated `<YYYY-MM-DD>` by the `<machine | stack>` half.

`Ready?` values: `ready` · `needs auth: <where>` · `wizard: <script path>` · `owner: <step>` · `missing: <install step>` · `pending POC` · `—` (a `none` row).

## Machine level

| Category | Choice | Alternatives considered | Access path | Ready? |
| --- | --- | --- | --- | --- |
| GitHub | host `gh` | — | host `gh`, authorised as `<login>`; repo `thekntl/<slug>` | `<ready?>` |
| Platform toolchain | `<Xcode + simulator · pnpm + Go · Android SDK>` | — | host CLI `<xcodebuild, xcrun simctl · pnpm, go · ./gradlew, adb>`; MCP `<simulator-server>` | `<ready?>` |
| Browser | `<browser MCP>` | — | MCP `<browser-server>`; last level, for capabilities with no other path | `<ready?>` |
| Design inspiration | Mobbin | Dribbble, web search | MCP `<mobbin-server>` (search_screens, search_flows, search_sections) | `<ready?>` |
| Design tool | Figma + `figma-swiftui` | — | MCP `<figma-server>` (get_design_context, get_screenshot, get_metadata) + `skill://figma/figma-swiftui/SKILL.md` | `<ready?>` |

## Providers

| Category | Choice | Alternatives considered | Access path | Ready? |
| --- | --- | --- | --- | --- |
| Product analytics | `<PostHog>` | `<GA4, Amplitude>` | `<MCP server (tools) · host CLI · browser>` | pending POC |
| Crash / error | `<Sentry>` | `<Crashlytics>` | | pending POC |
| Payment / subscription | `<RevenueCat>` | `<StoreKit direct, Paddle, Stripe>` | | pending POC |
| Backend | `<own Go stack · Firebase · Supabase · none>` | | | pending POC |
| Hosting | `<own hosts + Docker contexts · Fly · Railway · none>` | — | `owner: hosts, contexts, deploy target, secret store` | pending POC |
| Mobile data | `<SwiftData on device>` | `<CloudKit sync, backend>` | | pending POC |
| MMP / attribution | `<AppsFlyer · none>` | `<Adjust, Branch>` | | pending POC |
| Identity | `<WorkOS · none>` | `<Firebase Auth, Supabase Auth>` | | pending POC |
| Email | `<Brevo · none>` | `<Resend, Postmark>` | | pending POC |
| Support | `<FreeScout · none>` | `<email, Intercom>` | | pending POC |
| ASO | `<Astro MCP + Kickstart MCP>` | — | | pending POC |
| SEO | `<Google Search Console>` | — | browser only | pending POC |
| Marketing site | `<Astro static>` | — | host CLI `pnpm` | pending POC |

## Marketing defaults

| Category | Choice | Alternatives considered | Access path | Ready? |
| --- | --- | --- | --- | --- |
| Paid learning channel | TikTok first, Meta second | — | owner ad accounts | `<ready?>` |
| Ad accounts | one company Meta Business Portfolio, TikTok Business Center, and AppsFlyer advertiser account; separate identities, ad accounts, and measurement assets per product | — | owner | `<ready?>` |

## POC dependencies

Copied by `/kntl-setup` step 6 from the `## Dependencies` comment on the POC ticket, one line each, the category row appended:

- `<what> · provided by <agent|owner> · needed <now|at setup> · <D-id> · <source link>` → `<category row>`
- `backend: <reason>` → Backend
