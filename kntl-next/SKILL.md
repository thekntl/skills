---
name: kntl-next
description: "Resume the flow from the tracker: the last closed ticket, a five-line status, one recommended ticket with its ready prompt. Bare /kntl on an existing project runs /kntl-status and then this."
disable-model-invocation: true
---

# KNTL Next

`wayfinder`'s Work through the map with KNTL choosing the ticket: the map body and the tickets are read per `docs/agents/issue-tracker.md` § Wayfinding operations, fresh every run; `docs/kntl/status.json` and other sessions' text are views of the tracker. The map is taken as charted. Owner-facing rules live in `docs/agents/kntl-conventions.md`; read it before writing anything the owner sees.

## Steps

1. **Load** the `wayfinder:map` issue body, and `docs/agents/kntl-stack.md` for the GitHub path (host `gh`) and the rows `references/phases.md` reads. Map missing → this is a new project, `/kntl`; stack file missing → `/kntl-setup`; stop there. Zoom into a ticket body only when a rule below needs it. Done when Destination, Notes, Decisions so far, Not yet specified, Out of scope and the stack rows are in context.
2. **Find the last closed ticket** in the ticket set, the map's child tickets plus every issue carrying a `kntl:*` face label: closed as completed, absent from Out of scope (a merged PR closes at merge), the newest close time; on a tie, the ticket listed last in the closing PR's `## Ticket` section. Its face label is the current face (fallback: its parent's face; no completed ticket yet → App Shell); its `flow:` label is the current flow. Done when face and flow are named from one completed ticket.
3. **Query the frontier** over the same set per the tracker doc; for every open ticket keep face, flow, triage label, assignee, open blockers and the tickets it blocks. A ticket without a triage label is classified by content: `wayfinder:grilling`, `wayfinder:prototype`, or a `## What to build` (or `## Question`) that needs something the conventions file reserves for the owner (Owner-only, or the `ready-for-human` line of Tracker vocabulary) → `ready-for-human`; otherwise `ready-for-agent`. Done when each open ticket is classified frontier, blocked, or claimed.
4. **Write the status** with the block below; Faz is the first row of `references/phases.md` § Faz whose observable still fails. Done when all five lines are filled.
5. **Choose**; the first rule that yields something wins:
   0. An open `ready-for-human` ticket on any face, core and launch-day tickets aside (both defined under the batch) → the batch below; an agent ticket only once the batch is answered.
   1. Faz inside the sequential core → that row's prompt on its open core ticket: `/kntl-design #N`, `/kntl-poc #N`, `/kntl-setup`.
   2. Current face, frontier, `ready-for-agent`: the piece that completes the current flow; then a neighbouring flow (linked by blocking, or the scenario the current one leads into in `docs/design/SCENARIOS.md`); then another flow on this face. Among equals: the ticket the last close unblocked, then the head of the longest chain of open blockers. A half-done flow is finished before the face changes.
   3. Another face, only when this face's frontier is empty: the first face in the die table's order (`/kntl`) whose start condition holds per `references/phases.md` and which holds a `ready-for-agent` frontier ticket or no ticket at all; a ticketless face's prompt is its charting prompt from that file, otherwise rule 2's order inside it. A jump in the die order gets one line of why ("legal daha erken, önce platform yüzü").
   Done when exactly one of a prompt, a ticket, the batch, or an empty frontier is chosen.
6. **Hand off**: one recommendation, why in two sentences, and the prompt: rule 1's, the charting prompt, or the table below. Claiming belongs to the skill in the prompt; every ticket leaves here unassigned. When no open ticket carries the current flow's label, end with "Akış oturumunu arşivleyip yenisini açabilirsin." Done when the owner has one prompt to paste.

## Prompt by ticket

The first row that matches wins.

| Ticket | Prompt |
| --- | --- |
| `wayfinder:research` | `/wayfinder #<map> #N`; its research subagent resolves the ticket |
| `kntl:legal` | `/kntl-legal` |
| `kntl:marketing`, or `## What to build` names `/kntl-marketing` | `/kntl-marketing #N` |
| `wayfinder:prototype`, or `## What to build` names `/kntl-design` | `/kntl-design #N` |
| any other `ready-for-agent` | `/kntl-implement #N`; `/kntl-implement --bundle` when this face's frontier holds two or more tickets of this row |

## Status block

```
Faz: <App Shell tasarımı | POC | stack anketi | yüzler (<yüz>) | hukuk | production | yayın sonrası>
Son biten: #N (kısa ad) — Hikaye'den tek cümle
Açık işler: <k> insan işi, sonra <n> agent ticket'ı
Blokerler: #N (kısa ad) — neden
Sana düşenler: #N (kısa ad) — ne
```

## The human batch

Every open `ready-for-human` ticket on every face, blocked ones included and marked `(bloklu: #M (kısa ad))`, in one numbered message: decisions as one round of `kntl-grilling` (call the Skill tool with `kntl-grilling`), account and credential steps through `wizard` (call the Skill tool with `wizard`). Two kinds stay out: a **core ticket** (`wayfinder:prototype`, or `## What to build` naming `/kntl-design` or `/kntl-poc`) belongs to rule 1's skill; a **launch-day ticket** (a `kntl:marketing` campaign-activation ticket, or a ticket with no open blocker the owner answered `sonra`) waits for `/kntl-release` and holds no face back. Each answer, `sonra` included, is recorded on its ticket; an answer flips it to `ready-for-agent` or resolves it (the tracker doc's Resolve), a `sonra` keeps it open and out of the batch until its blocker closes. Done when every ticket in the batch carries an answer or a `sonra`; then return to step 5.

## Empty frontier

- Open tickets exist, all claimed or blocked only by claimed ones → name them `#N (kısa ad)` with their assignee; the prompt is `/kntl-next` once they close.
- No open ticket and fog left under Not yet specified inside a charted face → the prompt is `/kntl-grilling`, to graduate it into tickets.
- No open ticket beyond launch-day ones and every face except legal done or Out of scope → "Production'a hazırız, `/kntl-legal` ile başla", then wait for the owner's yes; legal done → `/kntl-release`.

## Pin

Called with `pin`, name this session `<codename> · Akış` (tool `mcp__ccd_session_mgmt__set_session_title`; when it is absent, tell the owner the name to use). Without `pin` the title stays as it is.
