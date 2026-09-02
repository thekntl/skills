# <Codename> scenarios

A scenario is one user state × one data state × one entry point, named by a slug. The slug is the flow label (`flow:<slug>`) on every ticket in that flow, the picker entry on the Design Lab home, the smoke case `/kntl-implement` walks, and the frame for store screenshots and marketing creatives. One list, four consumers.

## Axes

Pick one value per axis; add a value only when the product has that state.

- User state: `new`, `onboarded`, `trial`, `subscribed`, `expired`, `winback`
- Data state: `empty`, `populated`, `error`, `offline`
- Entry point: `onboarding`, `paywall`, `home`, `deep-link`, `notification`

Slug: `<user>-<data>-<entry>` unless a shorter product name reads better (`first-run`, `purchase`). A slug is fixed once a ticket carries it.

## Catalogue

| Slug | User state | Data state | Entry point | Opens on | What the owner should see | Fixture | Used by | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `first-run` | new | empty | onboarding | Welcome | <first value in plain words> | `Fixtures/first-run` | demo, smoke, screenshot | draft |
| `purchase` | trial | populated | paywall | Paywall | <offer, price, restore path> | `Fixtures/purchase` | demo, smoke, screenshot, creative | draft |
| `return-offline` | subscribed | offline | home | Home | <cached content and the offline notice> | `Fixtures/return-offline` | demo, smoke | draft |

Used by: `demo` (Lab picker), `smoke` (`/kntl-implement` on the real runtime), `screenshot` (store listing), `creative` (`/kntl-marketing`).

Status: `draft` (listed in lo-fi), `demo` (runs in the Lab picker; set when `/kntl-design` closes hi-fi), `smoke` (walked by `/kntl-implement` on the development runtime with real adapters, the fixture being only the test target's seed; set by the foundation ticket whose acceptance criteria name it).
