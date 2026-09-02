# Stack defaults

The questionnaire's answer key for `/kntl-setup` step 7: one row per category, the recommended default first. Each row becomes one `kntl-grilling` question with the default marked as the recommendation; the owner accepts it in a word, names an alternative, or answers freely. **Ask when** decides whether the row is asked at all; a skipped row is written per the `none` rule in the header of `docs/agents/kntl-stack.md`.

| Category | Default (recommended) | Alternatives | Readiness check | Ask when |
| --- | --- | --- | --- | --- |
| Design inspiration | Mobbin MCP | Dribbble, web search | MCP answers a `search_screens` call | the Machine level row reads `missing`, or the owner objects; otherwise shown under `Önceden karara bağlı` for one confirmation |
| Product analytics | PostHog | GA4, Amplitude | MCP connected, or account exists | always (mandatory) |
| Crash / error | Sentry | Crashlytics | MCP connected | always (mandatory) |
| Payment / subscription | RevenueCat | StoreKit direct, Paddle, Stripe | MCP connected | always (mandatory); a free product answers `none` |
| Backend | own Go stack | Firebase, Supabase, none (backendless) | account, repo | always (mandatory); conditioned on the POC, see below |
| Hosting | own hosts + Docker contexts | Fly, Railway, none | owner: hosts, contexts, deploy target, secret store | Backend chosen |
| Mobile data | SwiftData on device | CloudKit sync, backend | — | Apple target |
| Design tool | Figma MCP + `figma-swiftui` | — | MCP answers; `skill://figma/figma-swiftui/SKILL.md` loads | Apple target; confirmed the way Design inspiration is |
| ASO | Astro MCP + Kickstart MCP | — | MCP connected | Apple target |
| SEO | Google Search Console (cloud; browser-only access) | — | account | web product or landing pages |
| Marketing site | Astro (static) | — | — | always |
| MMP / attribution | AppsFlyer | Adjust, Branch | MCP authorised | paid campaigns planned |
| Identity | WorkOS, only when accounts add product value | Firebase Auth, Supabase Auth, none | account | product has accounts |
| Email | Brevo | Resend, Postmark | account | product sends email |
| Support | FreeScout | email, Intercom | account | product offers support |
| Paid learning channel | TikTok first, Meta second | — | ad accounts | marketing face |
| Ad accounts | one company Meta Business Portfolio, TikTok Business Center, AppsFlyer advertiser account; per-product identities, ad accounts, measurement assets | — | owner access | marketing face |

## Question rules

- Backend: read `## POC dependencies` first. A `backend:` line present → the default recommended, the line named as the reason; absent → the question "iOS uygulaması: backend gerekli mi, SwiftData/CloudKit yeter mi?" with `none` recommended.
- With a backend, the platform face needs `development`, `staging`, `production`; backendless → staging is TestFlight or a preview deploy. Say which in the backend row's Alternatives considered.
- Every provider starts on its free plan; paid plans, add-ons, and budget are owner steps.
- A `provisional` answer still fills the stack row so setups can start; `kntl-grilling` re-asks it.
