---
name: kntl-status
description: "Where are we: a Hatırlatma recap first, then progress for the whole project, one face or flow, or one module or ticket. Regenerates docs/kntl/status.json and opens the dashboard; read-only toward the tracker."
disable-model-invocation: true
---

# KNTL Status

Answers "ne durumdayız" and "hatırlat" for a KNTL project. The tracker stays untouched: this skill reads issues and writes only `docs/kntl/status.json` and `docs/kntl/index.html`; picking work is `/kntl-next`, explaining the ticket set is `/kntl-explain`. Wording toward the owner follows `docs/agents/kntl-conventions.md`; read it before writing the report.

## Scope

The argument picks one of three scopes.

| Argument | Scope | Body after the Hatırlatma |
| --- | --- | --- |
| none | project | `Faz`, `Yüzler` (progress per face), `Blokerler`, `Sana düşenler`, `Sıradaki` |
| a face (`paywall`, `kntl:paywall`) or a flow (`flow:onboarding`, a slug from `docs/design/SCENARIOS.md`) | face or flow | done and missing against the face's done criterion, tickets by short name, `Blokerler` |
| `#26`, or a module name matched against ticket titles, bodies, and labels | module or ticket | related tickets, last merges, open defects (open issues matched to the module that carry `needs-triage` per `docs/agents/triage-labels.md` or no face label), smoke evidence present or absent |

`hatırlat`, `ne yapıyorduk`, `nerede kaldık`, `bu ticket neydi`, and `yenile` in the Akış session are the same call; whatever they name sets the scope, and each run posts a new block. `pin`, alone or after a scope, also names the session (step 6).

## Steps

1. **Read.** The `wayfinder:map` issue; every issue carrying a `kntl:*` face label, open and closed, with labels, assignee, open blockers, and the PR that closed it, the way `docs/agents/issue-tracker.md` describes under Wayfinding operations; `docs/kntl/decisions.jsonl`; `docs/design/SCENARIOS.md` and `docs/agents/kntl-stack.md` when present. When no map exists, answer with one line, `Bu projede harita yok; önce /kntl.`, and stop. Done when every face-labelled issue is in hand, the last closed ticket is known with its merge day and Hikaye, and every ledger entry naming the scope's face, flow, or ticket is listed.
2. **Regenerate `docs/kntl/status.json`** from step 1 in the shape of `references/status-schema.md`; read it before writing the file (`assets/status.sample.json` is a full instance). Done when every face-labelled issue appears exactly once under its face with `flow` and `blockedBy`, every map fog item is a gap, each face's counts add up to its tickets, and `phase` and `next` are what `/kntl-next` yields on this data, after reading the kntl-next sections the schema names.
3. **Refresh the dashboard copy and commit.** Copy `assets/dashboard.html` to `docs/kntl/index.html`. When `git status --porcelain docs/kntl/status.json docs/kntl/index.html` is non-empty and `git rev-parse --abbrev-ref HEAD` prints the default branch (`main`), commit those two files as `docs: status <YYYY-MM-DD>`; on any other branch leave them modified and add `status.json değişti, ana dalda commit edilir` under `Pano:` in the report. Done when `cmp` on the two files prints nothing and, on the default branch, that `git status` line prints nothing.
4. **Write the report:** the Hatırlatma (template below), the scope's body from the table, one `Pano:` line with the dashboard address, then the `Ticket sözlüğü` footer. Progress is counted in pieces (`onboarding akışı 5/6 yerinde, 1 boşluk`) and in hands (`3 insan işi kaldı, sonra 12 agent ticket'ı zincirle gider`); a date appears only as the day something landed. Done when all six Hatırlatma lines and every item of the scope's body row are filled from step 1's data.
5. **Open the dashboard.** Start `python3 -m http.server 8765 --directory docs/kntl` in the background and open `http://localhost:8765/index.html` with the scope's query (`?face=<id>` with the `kntl:` prefix stripped, `?flow=<slug>`, `?ticket=<N>`; a module name opens `?ticket=` of the first matched ticket) in the in-app browser preview; without a browser tool, hand the owner the two moves: double-click `docs/kntl/index.html`, then drop `status.json` onto it. Done when the page shows this run's `generatedAt`, or the owner has the two moves.
6. **Pin** only when the argument says so: set the session title to `<codename> · Akış` with `mcp__ccd_session_mgmt__set_session_title`; when the tool is absent, give the owner that exact name. Done when the title reads that name or the owner has it.

## Hatırlatma

Six lines, first block in every scope. Sources: `Ne yapıyorduk` and `Neden` from the ticket's `## Özet` (project: the map's Destination; face or flow: its done criterion), `Nerede kaldık` from the last closed ticket's Hikaye and merge day, `Nasıl karar vermiştik` from ledger entries in scope other than `superseded`, `Sırada ne` from `next`, `İlgili parçalar` from tickets sharing the flow. In ticket scope every line is about that ticket: `Ne yapıyorduk` ends with its face and flow (`paywall yüzü, satın alma akışı`); `Nerede kaldık` carries the ticket's own state; `Sırada ne` states the remaining work in one clause before the command; `İlgili parçalar` opens with `bekliyor: #M (kısa ad)` and `bekletiyor: #K (kısa ad)` from the tracker's native blocking, then the same-flow tickets.

```
Hatırlatma
- Ne yapıyorduk: <bu proje / yüz / ticket ne işe yarıyor>
- Neden: <hangi sorunu çözüyor, kullanıcı ne fark edecek>
- Nerede kaldık: <gün> — <Hikaye'nin tek cümlesi>; durum: <açık / bloklu / birleşti>
- Nasıl karar vermiştik: D-041: haftalıkta 3 gün deneme · D-044: <tek cümle>
- Sırada ne: <adım> — `/kntl-implement #28 (kısa ad)`
- İlgili parçalar: #26 — buton kenarları: <tek cümle> · #27 — <kısa ad>: <tek cümle>
```
