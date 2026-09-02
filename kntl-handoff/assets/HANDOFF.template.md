# Handoff — <codename>

Written by `/kntl-handoff` on <YYYY-MM-DD> from <Claude Code | Codex> on <machine>. Read top to bottom before touching the repo. The `devralındı:` line at the bottom names the harness, the day, and the `docs: handoff` commit it took over, and closes the file; the next send writes a fresh one. Git carries every commit and branch; this file carries what git cannot: where we are, why, and what lives only on the sending machine.

## Project stage

- Phase: <`phase.current` from `docs/kntl/status.json`: app-shell | poc | setup | faces | legal | release | post-launch>
- `kntl:app-shell`: <done | in progress, k/n tickets | not started | out of scope>
- `kntl:onboarding`: <…>
- `kntl:paywall`: <…>
- `kntl:platform`: <…>
- `kntl:landing`: <…>
- `kntl:marketing`: <…>
- `kntl:legal`: <…>

## Active work

- Face: `kntl:<face>` · Flow: `flow:<slug>` · Ticket: #N (kısa ad)
- Branch: `<name>` · Worktree: `<path>` or none
- Where it stands: <one or two sentences; link to the "left off" comment on the ticket>
- Grilling in progress: <ticket, last recorded `## Round N`> or none
- Chain: <ended after #N (kısa ad); branch `chain/<face>-<date>`; report `docs/kntl/chain-<YYYY-MM-DD>.md` or not written> or none

## Last three things done

1. #N (kısa ad) — <day> — <one line from its Hikaye>
2. #N (kısa ad) — <day> — <one line>
3. #N (kısa ad) — <day> — <one line>

## Next step

- Command: `/kntl-<skill> …`
- Why: <one sentence>
- Blocked by: none | #N (kısa ad) — <what unblocks it, and who>

## Open questions and provisional decisions

- D-041 (`provisional`) — <question> — <why the owner was unsure>
- <question with no id yet> — asked next in `/kntl-grilling` on #N (kısa ad)

## Only on this machine

List by path and owner; values stay on the sending machine. The receiver recreates each item or reports it as missing in the read-back.

- Env files: `<path>` — <where the values live: provider dashboard, password manager, the owner>
- Simulators, emulators, devices: <installed builds, signed-in test accounts>
- Local services: <container or process name, port, start command>
- Caches and generated files: `<path>` — <the command that recreates them>

## Branches and worktrees

| Branch | Purpose | Worktree | Pushed |
| --- | --- | --- | --- |
| `main` | <…> | — | yes |
| `<branch>` | #N (kısa ad) WIP | `<path>` | yes |

## Harness notes

- Sending harness: <Claude Code | Codex>
- MCPs used: <name — what for; the row in `docs/agents/kntl-stack.md`>
- `İzin paketi` for the next step: <the lines of `/kntl-implement`'s block the next step needs>
- Hooks and settings: `.claude/settings.json` allowlist committed <yes | no>; grilling reminder hook <yes | no>

## In-flight task

<the document from Pocock `/handoff`, or `none`>

## Pickup checklist

- Run `/kntl-handoff <HEAD SHA>` here; its Pickup steps are the procedure, and Only on this machine and Harness notes above are what they recreate
- <anything this repo needs beyond those steps, in order> or none

## Verification

- Seal: <SHA of HEAD after the flush; the parent of the `docs: handoff` commit>
- Branch: `<name>`
- Check: `git log --oneline <Seal>..HEAD` prints exactly the `docs: handoff` commit; that commit's SHA is the pickup argument
