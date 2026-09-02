# Round template

Reproduce this skeleton for every round. Owner text is Turkish; ids, paths and labels stay as written. `<cevap>`, `<gerekçe>` and `<kapsam>` print the entry's `answer`, `why` and `scope`. `Kayıt` reports what [`ledger.md`](ledger.md) recipes wrote after the previous round.

## The round

```
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
```

Line rules:

- `Önceden karara bağlı` and `Yeniden sorulacak` open round 1; a later round carries them when a new answer or a zoomed ticket adds to them.
- `Seçenekler` holds two or three materially different options, one + and one − each; a yes/no decision holds two.
- `Kayıt` in round 1 reports the scan: `Kayıt: defter tarandı — 14 giriş, 3 eşleşme (D-017, D-023, D-041)`.
- `Kontrol` prints ✗ in place of ✓ for a missing block; the block is written and the line re-checked before the round is sent.

## Provisional answer

Said in the reply that acknowledges the answer, before the next round:

```
Bunu geçici kabul ediyorum, sonunda tekrar soracağım. (D-044 · provisional)
```

## Contradiction block

Sent the moment an answer collides with a live ledger entry in the same scope; the round waits for the owner's pick:

```
⚠️ Çelişki — Q3 ↔ D-041
<tarih>, #<ticket> (kısa ad), kapsam "<kapsam>", gerekçe "<gerekçe>": X demiştin.
Şimdi Y diyorsun. Çelişki şurada: <tek cümle>.
Seçenekler:
  1. Eskiyi koru — D-041 kalır, Q3 cevabı düşer
  2. Yeniyi al, eskiyi geçersiz kıl — yeni giriş supersedes: D-041
  3. İkisi ayrı kapsamlarda geçerli, ayır — iki giriş, iki kapsam
  4. Araştırma gerek — research-needed; kim neye bakacak
➡️ Öneri: <n> — <neden>
```

Old entry `provisional` and written in this session: one line replaces the block — `D-041 geçiciydi; Y ile değiştiriyorum, tamam mı?`

## Göster

One question, then back to the round; the verdict is that question's answer:

```
🔍 Q2 için gösteriyorum: <ne kuruldu, nerede: Design Lab / diyagram / tablo>, <nasıl bakılır>
Adaylar: A <…> · B <…> · C <…>   (ilham: <kaynak, örnek>)
Verdikt?
```

## Re-evaluation round

Opens when the frontier is empty and lists every `provisional` entry in the ledger; the options are the three target states. The session closes when every listed entry has an owner-confirmed state:

```
## Yeniden değerlendirme

Frontier boş. Geçici kalan kararlar, birlikte:

❓ D-044 — <başlık>
Sade özet: <1–2 cümle: karar ne, neden hâlâ açık>
Hikaye: <somut sahne: onaylanırsa ve değişirse kullanıcı neyi görür>
Ne demiştin: <cevap> · Neden emin değildin: <gerekçe>
Sonra ne oldu: <bu kararı etkileyen sonraki cevaplar, id'leriyle>
Seçenekler: Onayla (confirmed) · Değiştir (yeni giriş, supersedes) · Araştır (research-needed)
➡️ Öneri: <seçenek> — <neden>

---

❓ D-047 — <başlık>
…

Sıradaki turlar: — (frontier boş)
Kayıt: D-045, D-046 → docs/kntl/decisions.jsonl · yorum: ## Round N-1 → #26 (kısa ad)
Kontrol: özet ✓ hikaye ✓ seçenekler ✓ sıradaki turlar ✓ kayıt ✓
```
