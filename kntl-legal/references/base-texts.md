# Choosing and citing a public base text

A **base** is a public, standard text the product adopts unchanged; the addendum carries every difference. This file says what qualifies, where a base usually comes from and which texts constrain it, what the Base line records, and how the `research` agent verifies a candidate.

## What qualifies

- Published by a store, by the billing party (a store or a merchant of record), or as a public template kept under a named version or edition.
- Numbered clauses, or headings stable enough to number; the addendum addresses clauses by number.
- Cited in `docs/legal/base-<document>.md` by the `research` findings, or opened and read in this session.
- Available in the language of the addendum; the language edition is part of the Base line, and a market whose language the base lacks takes a different base for that language.

## Bases and constraints

A base is a text the product can publish as its own and addend. A **constraint** is a store or regulator text the product can neither adopt nor addend; it binds what the base and the addendum may say, and the research brief checks the chosen base against it. One base per document and language; any number of constraints.

| Document | Base, one versioned public text | Constraints |
| --- | --- | --- |
| `terms` | On the App Store, Apple's standard Licensed Application End User License Agreement; on the web or Google Play, a versioned public template. | Apple's published minimum terms for a custom EULA; Google Play's developer policies on user data and on the app's own terms. |
| `subscription` | The subscription or payment clause of the `terms` base; the rest is Added entries: billing party, plans, price display, trial or intro offer, renewal, cancel and restore paths. | The billing party's terms the buyer already accepted: Apple Media Services Terms and Conditions on the App Store, Google Play Terms of Service on Play, the merchant of record's buyer terms on the web (Paddle). When the product bills directly (Stripe), the buyer accepts only the product's own text. |
| `support` | The support and availability clause of the `terms` base; the rest is Added entries. | The stores' rule that a support contact is reachable from the listing. |
| `privacy` | A versioned public template that follows the market's minimum-content list. | The KVKK Board's communiqué on the disclosure obligation for Türkiye; GDPR Articles 13 and 14 for the EU; the stores' privacy-policy requirement and the App Privacy answers. |

Where the table says template, find the candidate in this order: a text the store or billing party publishes for products to adopt, when one exists; otherwise a template the owner names through the Skill tool with `kntl-grilling`, recorded as a `D-` entry in state `research-needed` until the findings verify it (step 6's approval round confirms it). A document with no verified candidate has no Base line, and the publication checklist waits for it.

## The Base line

`Base: <name>, <publisher>, version <as printed>, published <as printed>, retrieved <date>, language edition <lang>, at <URL copied from the opened page>`

Every value is copied from the page the findings in `docs/legal/base-<document>.md` cite, or from a page opened in this session; for a verbatim copy, the URL is the page it was copied from. A page that could not be opened yields no Base line, and a document without a Base line has no base yet. A URL, version, or date typed from memory is a fabrication; the cure is opening the page and copying.

When the base carries headings without numbers, number them in reading order and record that numbering in `docs/legal/base-<document>.md`, so every addendum entry resolves to one heading.

Publish the base by the Base line's URL when the publisher hosts a stable versioned page; otherwise copy it verbatim into `docs/legal/<document>.base.<lang>.md` under the publisher's licence, recorded in the findings file.

## Briefing the research agent

Call the Skill tool with `research`, one call per distinct base (the `terms` call also carries the `subscription` and `support` constraints; those two documents cite `docs/legal/base-terms.md`), giving: the document, the markets and languages from the inventory, the platform and store, the billing party, the candidate base, and the constraints from the table. Ask for: whether the candidate exists and is current; its name, publisher, version, publication date, and language editions as printed; its clause numbering; which clauses touch subscriptions, personal data, support, governing law, and termination; and which constraint clauses the base or the addendum must satisfy. Findings go to `docs/legal/base-<document>.md`, each claim with its source.

## When a base changes

A new version of the base means a new retrieval: bump the Base line, diff the clause numbering, re-check every entry against the new text, move the effective date, and re-run the publication checklist.
