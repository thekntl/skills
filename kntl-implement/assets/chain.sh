#!/usr/bin/env bash
# KNTL chain: every frontier ticket in turn, a fresh agent per ticket, one chain branch, one atomic PR the owner merges.
# Start from the repo root:  FACE=paywall AGENT_CMD="claude -p" docs/kntl/chain.sh
# Env: AGENT_CMD ("claude -p" default, "codex exec" alternative), FACE (face slug without "kntl:", default all),
#      TICKETS ("12 14 19" overrides the frontier query), AGENT_FLAGS (replaces the default flags, space-separated).
# Default Claude flags = the project allowlist /kntl-setup wrote (.claude/settings.json) + the smoke's browser clicks and
# screenshots; push and merge stay with the script. Codex flags follow `codex exec --help`; recheck when the version differs.
# Agent exit codes: 0 committed and done, 1 failed (one retry in a fresh context; a second failure relabels and moves on), 2 stop the chain.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"; cd "$ROOT"
REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
FACE="${FACE:-all}"; DATE="$(date +%Y-%m-%d)"; BRANCH="chain/$FACE-$DATE"
WT="$(dirname "$ROOT")/$(basename "$ROOT")-chain"; REPORT="$ROOT/docs/kntl/chain-$DATE.md"; LOG="$WT.log"
AGENT_CMD="${AGENT_CMD:-claude -p}"; SKILL='/'; FLAGS=()
perm() { jq -r ".permissions.$1 // [] | join(\",\")" "$ROOT/.claude/settings.json" 2>/dev/null || :; }
ALLOW="$(perm allow)"; DENY="$(perm deny)"
BROWSER="$(printf '%s' "$ALLOW" | tr , '\n' | sed -n 's/__navigate$//p' | head -n1)"  # browser MCP server, as the roster spells it
case "$AGENT_CMD" in
  claude*)
    [ -n "$ALLOW" ] || ALLOW="Read,Edit,Write,Glob,Grep,Bash(git:*),Bash(gh issue:*),Bash(gh api:*),Bash(pnpm:*),Bash(xcodebuild:*),Bash(xcrun:*),Bash(docker compose:*),Bash(sips:*),Bash(screencapture:*),Bash(osascript:*),mcp__Claude_Browser,mcp__Claude_Code_iOS_Simulator"
    [ -n "$DENY" ] || DENY="Bash(git push --force:*),Bash(git push -f:*),Bash(git reset --hard:*),Bash(git clean:*),Bash(git branch -D:*),Bash(rm -rf:*)"
    FLAGS=(--permission-mode acceptEdits --disallowedTools "$DENY,Bash(git push:*),Bash(gh pr merge:*)"
      --allowedTools "$ALLOW,Skill,ToolSearch${BROWSER:+,${BROWSER}__computer,${BROWSER}__form_input}") ;;
  codex*) SKILL='$'; FLAGS=(-s workspace-write --approve-for-me) ;;
esac
[ -z "${AGENT_FLAGS+x}" ] || read -ra FLAGS <<<"$AGENT_FLAGS"
DONE=(); HUMAN=(); STOP=""; PR=""; SEEN=""

cat <<EOF

İzin paketi — zincir $BRANCH
Agent ve yetkisi: $AGENT_CMD ${FLAGS[*]:-}
Zincir boyunca: build ve test; simülatör/tarayıcıda gezinme ve ekran görüntüsü; zincir branch'ine commit;
ticket'a yorum ve etiket; sonda push ve tek PR. Merge yok: paketi sen inceleyip merge edersin.
EOF
read -r -p "Bu yetkiyle başlayayım mı? (evet/hayır) " ok; [ "$ok" = evet ] || exit 1

[ -z "$(git status --porcelain --untracked-files=no)" ] || { echo "Çalışma ağacı kirli; önce temizle."; exit 1; }
git checkout -q main; git pull -q --ff-only origin main
git worktree add -q "$WT" -b "$BRANCH" main; cd "$WT"; mkdir -p "$(dirname "$REPORT")"; : >"$LOG"

blocked() {  # true when #$1 has an open blocker: native issue dependencies first, else the "Blocked by: #n" body line
  local n b; n="$(gh api "repos/$REPO/issues/$1/dependencies/blocked_by" --jq '[.[]|select(.state=="open")]|length' 2>/dev/null)" || {
    n=0; for b in $(gh issue view "$1" --json body --jq .body | grep -im1 '^blocked by:' | grep -o '#[0-9]*' | tr -d '#'); do
      [ "$(gh issue view "$b" --json state --jq .state)" = OPEN ] && n=$((n + 1)); done; }
  [ "${n:-0}" -gt 0 ]
}
frontier() {  # open, unblocked, unassigned ready-for-agent tickets, lowest number first: "number<TAB>title"
  local labels="ready-for-agent" l; [ "$FACE" = all ] || labels="$labels,kntl:$FACE"
  gh api "repos/$REPO/issues?state=open&labels=$labels&per_page=100" --jq '[.[]|select(.pull_request==null and (.assignees|length)==0)]|sort_by(.number)[]|"\(.number)\t\(.title)"' \
    | while IFS= read -r l; do blocked "${l%%$'\t'*}" || printf '%s\n' "$l"; done
}
title_of()  { gh issue view "$1" --json title --jq .title; }
hikaye_of() { gh issue view "$1" --json comments --jq '.comments[-1].body'; }
unseen() { awk -F'\t' -v s="|$SEEN|" 'index(s, "|" $1 "|") == 0'; }  # drops tickets this run already handled
next_ticket() {  # sets line to "number<TAB>title", or to "" when the queue is empty
  line=""; [ "${TICKETS+x}" = x ] || { line="$(frontier | unseen | sed -n 1p)"; return 0; }
  set -- $TICKETS; [ $# -gt 0 ] || return 0
  TICKETS="${*:2}"; printf -v line '%s\t%s' "$1" "$(title_of "$1")"
}
run_agent() {  # the prompt goes on stdin: --allowedTools is variadic and would swallow a trailing argument
  printf '%s' "${SKILL}kntl-implement #$1 --bundle" | $AGENT_CMD ${FLAGS[@]+"${FLAGS[@]}"} >>"$LOG" 2>&1; }

while next_ticket && [ -n "$line" ]; do
  n="${line%%$'\t'*}"; title="${line#*$'\t'}"; last_good="$(git rev-parse HEAD)"; SEEN="$SEEN|$n"
  gh issue edit "$n" --add-assignee @me >/dev/null; rc=1
  for attempt in 1 2; do
    printf '== #%s (%s) attempt %s from %s\n' "$n" "$title" "$attempt" "${last_good:0:7}" | tee -a "$LOG"
    run_agent "$n" && rc=0 || rc=$?
    [ "$rc" -eq 0 ] && [ "$(git rev-parse HEAD)" != "$last_good" ] && [ -z "$(git status --porcelain)" ] && break
    [ "$rc" -eq 0 ] && rc=1; git reset -q --hard "$last_good"; git clean -qfd   # a clean exit without a commit is a failure
    [ "$rc" -eq 2 ] && break
  done
  if [ "$rc" -eq 0 ]; then DONE+=("$n"); continue; fi
  gh issue comment "$n" --body "$(printf 'Chain %s: agent exit %s, work reverted to %s.\n\n```\n%s\n```\n\n## Özet\nZincir bu ticket'\''ta takıldı; değişiklikler geri alındı. Sıra sende: sorunu çöz ya da `ready-for-agent` etiketini geri koy.' \
    "$DATE" "$rc" "${last_good:0:7}" "$(tail -n 40 "$LOG")")" >/dev/null
  gh issue edit "$n" --remove-label ready-for-agent --add-label ready-for-human --remove-assignee @me >/dev/null
  HUMAN+=("$n"); [ "$rc" -eq 2 ] || continue; STOP="#$n durdurdu: ürün sorusu, bloker ya da owner-only adım"; break
done

if [ "${#DONE[@]}" -gt 0 ]; then
  git push -q -u origin "$BRANCH"
  body="$(
    printf '## Ticket\n\n'; printf 'Closes #%s\n' "${DONE[@]}"; printf '\n## Outcome\n\n'
    for n in "${DONE[@]}"; do printf '### #%s (%s)\n\n%s\n\n' "$n" "$(title_of "$n")" "$(hikaye_of "$n")"; done
    printf '## Smoke on the real runtime\n\nEvidence per ticket sits in its Hikaye comment, quoted above.\n\n## Human validation\n\nPer ticket, in its Hikaye comment.\n\n## Risks and rollback\n\nRevert the squash commit.\n\n'
    printf '## Özet\nZincir %s ticket'\''ı bitirdi; hepsi bu tek pakette, her birinin hikayesi yukarıda. İnceleyip merge etmek sende.\n' "${#DONE[@]}"
  )"
  PR="$(gh pr create --base main --head "$BRANCH" --title "chain: $FACE $DATE" --body "$body")"
fi

{
  printf '# Zincir %s\n\n- Biten (paket PR'\''ında): %s\n- ready-for-human'\''a dönen: %s\n- Durma nedeni: %s\n- Frontier'\''de kalan: %s\n- PR: %s\n- Merge sonrası: git worktree remove %s && git branch -d %s\n\nTicket sözlüğü\n' \
    "$BRANCH" "${DONE[*]:-yok}" "${HUMAN[*]:-yok}" "${STOP:-frontier boşaldı}" \
    "$(frontier | unseen | cut -f1 | tr '\n' ' ')" "${PR:-yok}" "$WT" "$BRANCH"
  for n in ${DONE[@]+"${DONE[@]}"}; do printf -- '- #%s — %s: %s\n' "$n" "$(title_of "$n")" "$(hikaye_of "$n" | sed -n 2p)"; done
  for n in ${HUMAN[@]+"${HUMAN[@]}"}; do printf -- '- #%s — %s: zincir burada takıldı, sıra sende\n' "$n" "$(title_of "$n")"; done
} >"$REPORT"
printf 'Rapor: %s\nGünlük: %s\nPR: %s\n' "$REPORT" "$LOG" "${PR:-yok}"
