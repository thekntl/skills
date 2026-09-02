---
name: kntl-grilling
description: "Grill the owner about a decision the KNTL way. Use when the owner wants to grill, decide (karar), or stress-test a plan or idea, or when another kntl skill calls kntl-grilling."
---

# KNTL grilling

A superset of `/grilling`: call the Skill tool twice, for `grilling` and `domain-modeling`; they run underneath, unchanged. Owner-facing language, ticket naming and `## Özet` follow `docs/agents/kntl-conventions.md`; read it before the first round. Words-first is the default. Called with `prototype-first` (how `/kntl-design` calls it), a question is asked as candidates in the Design Lab and the verdict is the answer; a question the owner can settle in words is still asked in words. The skeleton stays; a caller may add lines to it.

## Open the session

1. **Marker.** `mkdir -p docs/kntl && touch docs/kntl/.grilling`; the optional reminder hook fires while it exists. Done when the file exists.
2. **Ticket.** Rounds are recorded on the grilling ticket: the `wayfinder:grilling` ticket being resolved, or the one the caller names. Without one, create a `wayfinder:grilling` child of the map as `docs/agents/issue-tracker.md` says, labelled per the conventions' Tracker vocabulary. Done when the ticket number is known.
3. **Ledger scan.** Read [`references/ledger.md`](references/ledger.md) before this scan and before every write. Read `docs/kntl/decisions.jsonl` (whole file while it is short; face + tags + free text once it grows) and classify every candidate question: *already decided and valid* → shown under `Önceden karara bağlı` with its id; *re-ask* → asked with the reason written (`D-041 provisional idi`, `D-017'den sonra stack değişti`, `kapsam farklı: o web içindi, bu iOS`); *new* → asked. Done when every frontier question carries one of the three classes and round 1 opens with the scan block.

## Every round

Before composing a round, call the Skill tool with `kntl-grilling` again and re-read the last `## Round N` comment on the ticket. Then write the round with the literal template in [`references/round-template.md`](references/round-template.md), read before every round. `Sıradaki turlar` is recomputed after every answer, decided topics marked with their ids.

A round is done when every block on its Kontrol line shows ✓ (five words-first; a caller's additions carry their own ticks) and the owner's answers are in.

## Every answer

- **Provisional.** "A ama emin değilim", "A?", "sezgisel" → state `provisional`, said aloud: "Bunu geçici kabul ediyorum, sonunda tekrar soracağım."
- **Contradiction check.** Compare the answer with the live ledger entries on the same topic. Same scope and a different answer stops the round with the contradiction block from the template (date, ticket, scope, reason, then the four options: keep the old / take the new and supersede the old / both valid in separate scopes / research needed). Old entry `provisional` and from this session → a one-line confirmation suffices. Outcome on the ledger: a new line with `supersedes`, the old line's state `superseded`.
- **Göster.** "bunu görmem lazım" / "göster" on a question → make that one answer visible: visual questions as two or three alternatives in the Design Lab on the real platform, with examples from the inspiration source `docs/agents/kntl-stack.md` names when they help; the rest as a diagram, table or flow. Collect the verdict, return to the round.

An answer is done when its state is known and the contradiction check passed or was resolved through one of the four options.

## Record, then the next round

Before asking the next round: append the round's entries to `docs/kntl/decisions.jsonl`, post the `## Round N` comment on the ticket (ids, a one-line gist each, evidence links: prototype screenshots, Lab experiments), and, when `docs/design/DESIGN.md` exists, rewrite the section a design decision touches (the file and its template belong to `/kntl-design`). Done when every answer of the round appears as an id in the comment.

## Close

1. **Re-evaluation round.** When the frontier empties, ask every `provisional` entry in the ledger together, this session's and every older one (`references/ledger.md` lists the re-evaluation set), with the template's re-evaluation round, saying how later answers affected each; flip states as the owner confirms. Done when the owner has confirmed a state for every one.
2. **Resolve, marker off.** Post the final `## Round N` comment. A `wayfinder:grilling` ticket this session resolves is resolved as `docs/agents/issue-tracker.md` says: resolution comment citing the session's ids, close, one line under the map's Decisions so far; a ticket a caller named stays open for the caller. Then `rm docs/kntl/.grilling`. Done when every id appended this session appears in a `## Round N` comment on the ticket, the ticket is closed with its map line or handed back to the caller, and the marker file is gone.
