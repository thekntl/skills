# Phases and start conditions

The observables `/kntl-next` reads. Step 4 takes the Faz from the first row of § Faz whose "Still failing while" holds; step 5 rule 1 takes that row's prompt; step 5 rule 3 takes a face's start condition from § Start conditions and, for a face with no ticket in the set, its charting prompt. Every cell names a file or tracker fact, so two runs on the same repo land on the same row.

## Faz

| Faz | Still failing while | Rule 1 prompt |
| --- | --- | --- |
| `App Shell tasarımı` | `docs/design/DESIGN.md` is missing, or the App Shell row of its Status table reads lo-fi or hi-fi | `/kntl-design #N` on the App Shell design ticket (`kntl:app-shell` with `wayfinder:prototype`, or `## What to build` naming `/kntl-design`) |
| `POC` | the POC ticket (`kntl:app-shell`, title or `## What to build` naming `/kntl-poc`) is open | `/kntl-poc #N` |
| `stack anketi` | a row of `docs/agents/kntl-stack.md` reads `pending POC` | `/kntl-setup` |
| `yüzler (<yüz>)` | a face other than legal is neither done nor under Out of scope on the map; `<yüz>` is the current face from step 2 | — (rules 2 and 3) |
| `hukuk` | the `kntl:legal` ticket is absent or open | — (Empty frontier's legal line) |
| `production` | the "Production release" ticket (`kntl:platform`) is absent or open | — (`/kntl-release`) |
| `yayın sonrası` | — | — |

**Face done:** the face has at least one ticket in the set, every one of them is closed, launch-day tickets aside (SKILL.md § The human batch), and no item under Not yet specified names the face or one of its flows. Each face skill's Face done section says what those tickets had to prove; the tracker says whether they closed.

## Start conditions

Faces in die order (`/kntl`). A face under Out of scope on the map is skipped. The charting prompt applies to a face whose start condition holds and which has no ticket in the set.

| Face | Starts after | Holds when | Charting prompt |
| --- | --- | --- | --- |
| App Shell | — | always | `/kntl` (charts the map with the App Shell design and POC tickets) |
| Onboarding | design language approved | the App Shell row of `DESIGN.md` reads foundation or done | `/kntl-design #N` on a design ticket filed as below |
| Paywall and payment | design language + stack | the row above; no row of `kntl-stack.md` reads `pending POC`; the Payment / subscription row's Choice is not `none` | `/kntl-design #N` on a design ticket filed as below |
| Product platform | stack | no row of `kntl-stack.md` reads `pending POC` | `/kntl-backend` |
| Landing pages | design language + niche | the App Shell row of `DESIGN.md` reads foundation or done, and the ledger holds a `confirmed` entry tagged `niche` | `/kntl-marketing` (its Destinations and Ticket steps brief and file the landing tickets) |
| Marketing | App Shell + POC | the POC ticket is closed | `/kntl-marketing` |
| Legal | before production | every other face done or Out of scope | Empty frontier's legal line |

**Design ticket for a face:** before handing off, file one child of the map the way the tracker doc says: title `<Face> design`; labels the face label, `wayfinder:prototype`, `ready-for-human`, and `flow:<slug>` of the first catalogue row in `docs/design/SCENARIOS.md` whose Entry point is the face (none → the face name as the slug, added to the catalogue as a `draft` row); body per the conventions file, its `## What to build` opening with `/kntl-design #N` and the face's done criterion from the die table. The ticket leaves here unassigned; the prompt is `/kntl-design #N`.
