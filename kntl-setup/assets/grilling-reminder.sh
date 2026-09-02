#!/usr/bin/env bash
# KNTL grilling reminder — a UserPromptSubmit hook.
#
# Installed by `/kntl-setup grilling-hook` (step 9) as .claude/hooks/grilling-reminder.sh,
# made executable, with this entry merged into .claude/settings.json:
#
#   "hooks": {
#     "UserPromptSubmit": [
#       { "hooks": [ { "type": "command",
#                      "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/grilling-reminder.sh" } ] }
#     ]
#   }
#
# While docs/kntl/.grilling exists (kntl-grilling creates it at session start and removes it
# at session end) every submitted prompt gets the round skeleton injected into context; the
# harness carries the format, so a long session cannot forget it. Otherwise the hook is silent.
#
# The skeleton is copied verbatim from kntl-grilling/references/round-template.md → "The round".
# Edit the two together: the hook must print the same labels the skill does.
set -eu
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
[ -f "$root/docs/kntl/.grilling" ] || exit 0
cat <<'SKELETON'
KNTL grilling round in progress (docs/kntl/.grilling exists). Before writing the next round: call the Skill tool with `kntl-grilling`, read the last `## Round N` comment on the grilling ticket, and keep this skeleton for every question.

## Tur N

Önceden karara bağlı: D-017 (haftalık paket · 3 gün deneme), D-023 (yıllık paket yok)
Yeniden sorulacak: Q2 — D-041 `provisional` idi

❓ Q1 — <başlık>
Sade özet: <1–2 cümle: karar ne, neden şimdi>
Hikaye: <somut sahne: bu cevap kullanıcının hayatında ya da üründe neyi değiştirir>
Seçenekler:
  A. <seçenek> · + <avantaj> · − <dezavantaj>
  B. <seçenek> · + <avantaj> · − <dezavantaj>
  C. <seçenek> · + <avantaj> · − <dezavantaj>
➡️ Öneri: A — <tek cümle gerekçe>
(Serbest cevap da olur. "A ama emin değilim" → geçici kayıt.)

---

❓ Q2 — <başlık>
…

Sıradaki turlar:
- Tur N+1: <konu>, <konu> · karara bağlı: D-017
- Tur N+2: <konu>

Kayıt: D-042, D-043 → docs/kntl/decisions.jsonl · yorum: ## Round N-1 → #26 (kısa ad)
Kontrol: özet ✓ hikaye ✓ seçenekler ✓ sıradaki turlar ✓ kayıt ✓
SKELETON
