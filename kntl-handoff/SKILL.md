---
name: kntl-handoff
description: "Move a KNTL project between harnesses or machines without loss: send flushes state to git and docs/kntl/HANDOFF.md and seals it; pickup verifies the seal and reads back in Turkish before any work."
disable-model-invocation: true
---

# KNTL Handoff

Moves a known project between Claude Code and Codex, in either direction, or onto another machine; a project new to this family goes through `/kntl-adopt`. Two halves in one skill. `git fetch` first; the **handoff ref** is the SHA argument when given, else `origin/<current branch>`. A SHA or `pickup` as the argument selects **pickup**, this harness is arriving; `send` selects **send**, this harness is leaving; otherwise `git show <handoff ref>:docs/kntl/HANDOFF.md` decides: absent, or ending in a `devralındı:` line, → send; present without that line → pickup. Two guarantees: the sender committed, pushed, and wrote everything where it belongs; the receiver read it correctly. Owner-facing wording follows `docs/agents/kntl-conventions.md`.

## Send

1. **Flush state**, in this order:
   - Chain: a running chain is the owner's process; ask the owner to let the ticket in flight post its comment, then end the script; copy the report's Biten / ready-for-human'a dönen / PR lines into `HANDOFF.md` › Active work › Chain; the report file itself stays uncommitted.
   - Grilling round: a half-finished round is recorded as `/kntl-grilling`'s Record step does, then `docs/kntl/.grilling` is removed.
   - In-flight ticket: a half-finished ticket gets a left-off comment (branch, what is done, what comes next).
   - `docs/kntl/status.json`: regenerate and commit as `/kntl-status` steps 2–3 do.
   - Uncommitted changes, in every worktree, the chain report aside: a `wip: handoff` commit on that worktree's branch.
   - Push: every worktree in `git worktree list` and every branch ahead of or without an upstream, the chain branch among them.

   Done when `git status --porcelain` is empty in every worktree, the chain report aside, `git log --branches --not --remotes` prints nothing, the active ticket's flow has its scenario in `docs/design/SCENARIOS.md`, the in-flight ticket carries its left-off comment, `docs/kntl/.grilling` is gone, and no `chain.sh` process is running.
2. **Write `docs/kntl/HANDOFF.md`** from `assets/HANDOFF.template.md`; read the template before writing. `Seal` is `git rev-parse HEAD` after step 1. For the in-flight task, call the Skill tool with `handoff` and paste its document under `## In-flight task`. Local-only items are listed by path and owner; values stay on this machine. Commit as `docs: handoff`, push. Done when every section is filled or reads `none`, the Seal is HEAD's parent, and `origin/<branch>` equals HEAD.
3. **Verify and seal.** Re-run the porcelain and unpushed-branch checks from step 1, then print the block below with every field filled. Done when the block is on screen and both checks passed.

```
Devir mühürlendi
- Mühür: <mühür SHA> · HEAD: <SHA> · Branch: <branch adı>
- Push: origin/<branch> = HEAD · push'lanmamış branch yok · <k>/<k> worktree temiz
- Devralma komutu, diğer harness'te: `/kntl-handoff <HEAD SHA>` — yeni makinede önce `git clone <remote adresi>`
```

## Pickup

`/kntl-handoff <SHA>`, the SHA from the sender's block; without it the seal check alone holds.

1. **Harness prerequisites.** Switch to the `Branch` that `HANDOFF.md` names at the handoff ref, `git pull --ff-only`, and read the pulled file's `## Harness notes`. Run `/kntl`'s Preflight, then also: every `kntl-*` skill answers here (missing → `npx skills add thekntl/skills`); every MCP under `## Harness notes` is connected here (Codex configures its own), each missing one listed with its install path; host `gh` is authorised. Then show the `İzin paketi` in the shape of `/kntl-implement`'s block, categories taken from `## Harness notes`, and wait; the sender's answers belong to the other harness. Done when HEAD is on `Branch` with nothing to pull, every item reads present or missing-with-its-step, and each category has an answer.
2. **Read and verify.** `git log --oneline <Seal>..HEAD` prints exactly the `docs: handoff` commit, and HEAD equals the argument when given; every row of `## Branches and worktrees` resolves in `git ls-remote --heads`. Read `HANDOFF.md`, `docs/kntl/status.json`, `docs/kntl/decisions.jsonl`, and the `wayfinder:map` issue, then behave as `/kntl-status`. A mismatch stops here with what differs and who can fix it. Done when the seal check passed, every branch resolves, and the Hatırlatma is on screen.
3. **Read back, then take over.** Before any work, the block below in Turkish, 5–8 lines, from what step 2 read; wait for the owner's yes. On yes, append `devralındı: <harness>, <YYYY-MM-DD>, <the SHA verified in step 2>` as the last line of `HANDOFF.md`, commit `docs: handoff picked up`, push, and hand the owner the command from `## Next step`. Done when the line is on the remote and one command is on screen.

```
Anladığım:
- Proje şu aşamada: <faz; yüzlerin durumu tek cümle>
- Aktif akış: <yüz> · <flow> · #N (kısa ad)
- Son yapılan: <üç işin özeti>
- Sıradaki adım: <adım> — `/kntl-<skill> …`
- Bu makinede yok / eksik: <env dosyaları, servisler, MCP'ler>
Doğru mu? Onaylayınca devralıyorum.
```
