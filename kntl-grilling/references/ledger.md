# Ledger operations

`docs/kntl/decisions.jsonl` is the single source of decisions: one JSON object per line, append-only for questions and answers (the only in-place edit is a state flip, see Writes below), committed with the repo. Ticket comments cite ids and gist them; the wayfinder map's Decisions-so-far points at the ticket, the ticket at the entry. The ledger holds why and history; `docs/design/DESIGN.md` holds the compiled latest state of design decisions; ADRs under `docs/adr/` (written by `domain-modeling`) hold the hard-to-reverse ones and are linked through `evidence`.

## Entry

```json
{"id":"D-041","date":"YYYY-MM-DD","ticket":26,"face":"paywall","flow":"purchase","tags":["trial"],"question":"…","answer":"…","state":"confirmed|provisional|superseded|research-needed","why":"…","scope":"…","supersedes":null,"evidence":"…"}
```

- `id`: `D-` plus three zero-padded digits, one past the highest in the file.
- `face`: the face label without its prefix (`paywall` for `kntl:paywall`); `flow`: the scenario slug of the `flow:` label.
- `state`: `confirmed` · `provisional` (owner unsure: `why` names the doubt, `evidence` what would settle it) · `research-needed` (`evidence` names who looks at what) · `superseded` (a later entry names this id in `supersedes`).
- `scope`: the contradiction key (platform, launch, segment). The same question holds different answers in different scopes; the check compares scope before it compares answers.
- `evidence`: URL of the prototype screenshot, Lab experiment, ADR, or research file.
- `supersedes`: id of the entry this one replaces, else `null`.

Writes: a new decision is a new line. A changed answer is a new line with `supersedes`; the replaced line changes in `state` only. State flips (`provisional → confirmed` at re-evaluation, `→ research-needed`, `→ superseded`) are the only in-place edits; `question`, `answer` and `why` stay as written.

## Recipes

Next id (`10#` keeps a leading zero decimal):

```sh
last=$(jq -r '.id[2:]' docs/kntl/decisions.jsonl 2>/dev/null | sort -n | tail -1); printf 'D-%03d\n' $(( 10#${last:-0} + 1 ))
```

Scan before round 1. Under a few hundred lines read the whole file; above that, filter by face, then tags, then free text, and union the results:

```sh
wc -l docs/kntl/decisions.jsonl
jq -c 'select(.state!="superseded")' docs/kntl/decisions.jsonl                                   # live entries
jq -c --arg f paywall 'select(.face==$f and .state!="superseded")' docs/kntl/decisions.jsonl     # by face
jq -c --arg t trial 'select(any(.tags[]; .==$t) and .state!="superseded")' docs/kntl/decisions.jsonl   # by tag
grep -i 'deneme' docs/kntl/decisions.jsonl | jq -c 'select(.state!="superseded")'                # free text
jq -c 'select(.state=="provisional")' docs/kntl/decisions.jsonl                                   # re-evaluation set
```

Append one entry:

```sh
jq -nc --arg id "$id" --arg date "$(date +%F)" --argjson ticket 26 --arg face paywall --arg flow purchase \
  --argjson tags '["trial"]' --arg q "…" --arg a "…" --arg state confirmed --arg why "…" --arg scope "iOS, ilk lansman" \
  --arg sup "" --arg ev "…" \
  '{id:$id,date:$date,ticket:$ticket,face:$face,flow:$flow,tags:$tags,question:$q,answer:$a,state:$state,why:$why,scope:$scope,supersedes:(if $sup=="" then null else $sup end),evidence:$ev}' \
  >> docs/kntl/decisions.jsonl
```

Supersede: append the new entry with `--arg sup D-041`, then flip the old line. The same command with `.state="confirmed"` confirms a provisional entry at re-evaluation:

```sh
jq -c 'if .id=="D-041" then .state="superseded" else . end' docs/kntl/decisions.jsonl > docs/kntl/.decisions.tmp && mv docs/kntl/.decisions.tmp docs/kntl/decisions.jsonl
```

Chain of replacements, oldest first:

```sh
jq -r 'select(.supersedes!=null) | "\(.id) ⇐ \(.supersedes)"' docs/kntl/decisions.jsonl
```

Contradiction check on an answer: take the live entries that share the question's face and tags or match its words, keep those whose `scope` covers the new answer's scope, and compare answers. A different answer in the same scope is a contradiction; a different scope is a candidate for option 3 of the block, still put to the owner.

## `## Round N` comment

Posted on the grilling ticket after the round's entries are appended, through the host's `gh`:

```
## Round 3
- D-042 — haftalık pakette 3 gün deneme · kanıt: <url>
- D-043 — paywall onboarding'in sonunda (provisional) · kanıt: Lab deneyi "paywall-yeri"
- D-044 ⇐ D-041 — yıllık paket kaldırıldı
Sıradaki turlar: fiyat noktası, geri kazanım akışı

## Özet
<2–4 cümle: bu turda ne karara bağlandı, kullanıcı ne fark edecek>
```

```sh
gh issue comment 26 --body-file round.md
gh api "repos/{owner}/{repo}/issues/26/comments?per_page=100" --jq '[.[] | select(.body | startswith("## Round"))] | last | .body'   # last round, re-read before composing
```
