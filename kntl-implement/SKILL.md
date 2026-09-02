---
name: kntl-implement
description: "Build one ticket from claim to squash-merged PR: worktree, /implement with /tdd, /code-review against main, smoke on the real runtime, Hikaye. With --bundle, one ticket inside the agent chain, or hand the owner the chain script."
disable-model-invocation: true
---

# KNTL Implement

Builds `#N (kısa ad)` end to end. Owner-facing text, issue and PR bodies, Hikaye, environment parity, tool access and owner-only limits follow `docs/agents/kntl-conventions.md`; read it before the first message. Build, run and simulator paths come from `docs/agents/kntl-stack.md`; tracker operations from `docs/agents/issue-tracker.md`.

## İzin paketi

Before the first side effect, show this block once and wait. The answers hold for the whole run; a `hayır` line becomes a hand-off step in the closing message.

```
İzin paketi — #N (kısa ad)
1. Build, typecheck ve testleri çalıştırma                 evet / hayır
2. Simülatör/tarayıcıda gezinme ve ekran görüntüsü         evet / hayır
3. Commit ve push                                          evet / hayır
4. PR açma                                                 evet / hayır
5. Squash merge ve branch temizliği                        evet / hayır
```

Done when every line has an answer. When the harness still prompts mid-run, the closing message proposes the `.claude/settings.json` allow pattern that would silence it next time.

## `/kntl-implement #N`

1. **Claim.** `main` is clean and matches `origin/main`; `#N` is open, has no open blocker, no assignee, and carries `ready-for-agent`. Read its body, comments and every ledger id it cites in `docs/kntl/decisions.jsonl`, then assign yourself. Done when the assignee is you. An unanswered product question in the ticket ends the run here: name it and point the owner at `/kntl-grilling`.
2. **Worktree.** `git worktree add ../<repo>-<N> -b <face>/<N>-<slug> main`; work there from now on. Done when `git worktree list` shows it on that branch.
3. **Build.** Call the Skill tool with `implement`; it runs `tdd` at seams agreed first. Done when typecheck and the full suite pass in the worktree.
4. **Review.** Call the Skill tool with `code-review`, fixed point `main`. The Spec axis also asks: did development run on real modules, and does only configuration differ per environment? Done when every finding is fixed or answered in the PR body with a reason.
5. **Smoke.** Read `references/smoke.md`, then walk the ticket's `flow:<slug>` scenario from `docs/design/SCENARIOS.md` on the development runtime as a user would. Done when every scenario step has a one-line action, a one-line observation and a screenshot under `docs/kntl/smoke/<N>/`, all taken as `references/smoke.md` says.
6. **PR.** Push the branch; open the PR with the body sections from the conventions file, `Closes #N` under `## Ticket`. Done when the PR carries the automated results, the smoke evidence, a human-validation verdict with a plain reason, risks and rollback, and `## Özet`, and step 5's walk ran on the real development modules (database, auth, adapters).
7. **Merge and clean.** From the primary checkout on `main`: `git worktree remove ../<repo>-<N>`, `gh pr merge <face>/<N>-<slug> --squash --delete-branch`, `git pull --ff-only`, then run `/kntl-status`'s steps 2–3 (regenerate `docs/kntl/status.json`, refresh `docs/kntl/index.html`, commit `docs: status <YYYY-MM-DD>` on `main`) and push. Done when `#N` is closed by the merge, `git worktree list` shows only `main`, `main` matches `origin/main` and `status.json` shows `#N` closed.
8. **Close.** Technical bullets first (what changed, which checks ran, results), the `Hikaye` block below them, last line `Sıradaki için /kntl-next.` Done when the same Hikaye also sits in the PR's `## Özet`.

## `/kntl-implement #N --bundle`

One ticket inside the chain. `docs/kntl/chain.sh` opened `chain/<face>-<date>` from `main` in the chain worktree, printed the İzin paketi and the tool list once, claimed `#N`, and started you with a fresh context. Record `git rev-parse HEAD` as the last good commit before touching a file, then run steps 3–5 with these differences and exit:

- The İzin paketi is the script's: build, test, simulator and browser, commit on the chain branch, ticket comments. Push, the PR and the merge belong to the script and the owner.
- Seams are the interfaces the ticket's acceptance criteria name; list them in the commit message in place of the confirmation `tdd` asks for.
- Commit on the chain branch with `#N` in the message once the suite is green; review against the last good commit.
- Review findings answered rather than fixed go into the Hikaye comment under a `## Review` line.
- In place of a PR, comment on `#N`: the `Hikaye` block first, then the smoke evidence (steps, observations, screenshot paths). Exit 0 with a clean tree. Done when the comment is posted.
- Red after one fix attempt → exit 1: the script reverts to the last good commit and retries you once in a fresh context; after a second failure it comments the evidence, relabels `ready-for-human` and the chain moves to the next ticket that does not depend on it. A product question, blocker or owner-only step → comment which and exit 2: same comment and relabel, then the chain stops.

## `/kntl-implement --bundle`

Copy `assets/chain.sh` to `docs/kntl/chain.sh` when it is missing or older than the asset; list the frontier per face (open, unblocked, unassigned, `ready-for-agent`); hand the owner the start line `FACE=<face> AGENT_CMD="claude -p" docs/kntl/chain.sh` (`codex exec` is the alternative) and say what its İzin paketi will ask. Done when the owner has the command; the owner starts the script. The script runs a fresh agent per ticket, opens one atomic PR at the end (`#N (kısa ad)` + Hikaye per ticket, `Closes` per ticket, `## Özet`), and writes `docs/kntl/chain-<date>.md`; the owner reviews and merges that PR.
