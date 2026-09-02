---
name: kntl-explain
description: "Explain the open tickets in plain language, clustered by flow: what each solves, what the user will notice, what blocks what, and which decisions it rests on."
disable-model-invocation: true
---

# KNTL Explain

`/kntl-status` answers "where are we", `/kntl-next` answers "what next", this skill answers "what are these": a catalogue of the open tickets, clustered by flow, each explained from the user's seat. It is read-only. The owner, the names-not-numbers rule and the Özet rule live in `docs/agents/kntl-conventions.md`; read it before writing a line the owner will see.

Arguments, all optional: a face label (`paywall`) or `flow:<scenario-slug>` narrows the catalogue; `kapananlar` adds the tickets closed in the last 14 days; `hikaye` adds a mini story to every entry; `pin` names the session. `anlamlandır`, `ticket'ları açıkla`, `ne neydi` and `yenile` are the same call in whichever session they are typed; every rerun posts a fresh catalogue below the earlier one. One ticket's reminder is `/kntl-status #N`.

## Steps

1. **Read.** Through the host `gh`, as `docs/agents/issue-tracker.md` describes under Wayfinding operations: the `wayfinder:map` issue, then one ticket set made of its child tickets and every issue carrying a `kntl:*` face label (open ones, plus closed ones for the cluster counts and `kapananlar`) with labels, assignee, native blocked-by and blocking, and the body's `## Decisions` and `## Özet` sections; for closed tickets also the close day and, with `kapananlar`, the closing comment's Hikaye or the closing PR's `## Özet`. Then the ledger `docs/kntl/decisions.jsonl`, and `docs/design/SCENARIOS.md` when present. `docs/kntl/status.json` is a derived view; the tracker is the source. Done when every open ticket in the set is in hand with face, flow, triage label, assignee, both blocking directions, Özet and decision ids; every closed ticket sharing an open ticket's face and flow is counted, with its closing Hikaye or PR Özet in hand when `kapananlar` is set; and every `D-` id cited either resolves to a ledger line or is listed as missing.
2. **Cluster.** A group is one flow inside one face, a puzzle cluster. Order groups by the face order in `docs/agents/kntl-conventions.md`, Tracker vocabulary, then by map order. A ticket without a flow label goes to its face's `genel` group; one without a face label to `Etiketsiz`, last; both shaped as in the template. Done when every open ticket sits in exactly one group and the group totals add up to the open count.
3. **Write each entry** in Turkish, behaviour rather than code:
   - one or two sentences on which problem the ticket solves and what the user will notice, drawn from its `## Özet` (from the body when the Özet is missing, marked `özeti yok`);
   - the state, stacked in this order: `senden bekleniyor` when `ready-for-human`, else `sahipli` when assigned; then `bloklu: #N (ad)` behind an open blocker; a ticket with neither is `açık`, on the frontier;
   - `bekletiyor:` naming every ticket it blocks;
   - the decisions: every ledger entry the ticket cites or whose `ticket` field names it, as `D-041 — <answer in plain words>`, `(geçici)` when `provisional`, the superseding entry in place of a superseded one, a cited id absent from the ledger as `D-0xx — defterde yok`;
   - with `hikaye`, a `Hikaye:` line: one user, one scene, what they do and see once the ticket ships, two or three sentences.
   Done when every number carries its name and every entry reads without a term the owner would look up.
4. **Deliver** in the template below. The catalogue is the reply's `Ticket sözlüğü` in long form, so the reply ends with it. With `pin`, set the session title to `<codename> · Ticket'lar` (`mcp__ccd_session_mgmt__set_session_title` when available; otherwise tell the owner the name to type). Done when the catalogue is posted and the title matches the pin request.

## Template

```
## Ticket'lar — <codename>
<N> açık ticket, <M> akış · kaynak: tracker, <YYYY-MM-DD>

### <Yüz> · <akış adı> — <senaryonun tek cümlesi> (<yerinde>/<toplam> yerinde)
- #26 — buton kenarları · açık · bekletiyor: #30 (onboarding ekranı)
  <1–2 sade cümle: hangi sorunu çözüyor, kullanıcı ne fark edecek.>
  Karar: D-041 — haftalıkta 3 gün deneme (geçici)
  Hikaye: <istenince: tek kullanıcı, tek sahne, ticket bitince ne yapıyor ve ne görüyor>
- #25 — renk paleti · senden bekleniyor · bloklu: #24 (logo)
  <…>

### Onboarding · genel — akış etiketi yok (2/4 yerinde)
- <aynı biçimde girişler>

### Etiketsiz — yüz etiketi eksik; etiketleyince kümesine geçer
- #31 — bildirim izni · açık
  <…>

### Son kapananlar
- #21 — giriş ekranı: <tek cümle, ne değişti>
```

`<codename>` is the product codename from `docs/kntl/status.json`, else the map's title. The group line's sentence is the flow's scenario from `docs/design/SCENARIOS.md`; when the file or the slug is missing, write the group sentence from the tickets. `Son kapananlar` appears with `kapananlar`; each line comes from the ticket's closing Hikaye or its PR's `## Özet`.
