# Round additions

A `/kntl-design` round is the skeleton in `kntl-grilling/references/round-template.md` with the lines below added. Reproduce them literally; owner text is Turkish, slugs and ids stay as written.

## Per question

`İlham:` follows `Hikaye:`; `Adaylar:` replaces `Seçenekler:` and names what the owner flips through in the Lab:

```
❓ Q1 — <başlık>
Sade özet: <1–2 cümle: karar ne, neden şimdi>
Hikaye: <somut sahne: bu cevap kullanıcının hayatında ya da üründe neyi değiştirir>
İlham: <kaynak> · sorgu "<sorgu>" · örnekler: <ürün / ekran>, <ürün / ekran> · alınan kalıp: <…> · uyarlama: <…>
Adaylar: A <ad> · B <ad> · C <ad>   (deney: <experiment-slug>, senaryo: <scenario-slug>, bak: <neye bakılacak>)
  A. <aday> · + <avantaj> · − <dezavantaj>
  B. <aday> · + <avantaj> · − <dezavantaj>
  C. <aday> · + <avantaj> · − <dezavantaj>
➡️ Öneri: A — <tek cümle gerekçe>
(Serbest cevap da olur. "A ama emin değilim" → geçici kayıt.)
```

## Round footer

`Silinenler:` precedes `Kayıt:`; `Kontrol:` carries seven ticks:

```
Silinenler: <experiment-slug>/B, <experiment-slug>/C · Lab'de bekleyen: <experiment-slug>/A ("production'a uygula" ile taşınır)
Kayıt: D-042, D-043 → docs/kntl/decisions.jsonl · DESIGN.md: <yeniden yazılan bölüm> · yorum: ## Round N-1 → #26 (kısa ad)
Kontrol: özet ✓ hikaye ✓ ilham ✓ adaylar ✓ sıradaki turlar ✓ silinenler ✓ kayıt ✓
```

Line rules:

- `İlham` names the source `docs/agents/kntl-stack.md` resolves; a search that returns nothing usable is written as such (`İlham: Mobbin · "…" · uygun örnek yok`) and the candidates start from scratch. The same row goes into the `Inspiration` table of `DESIGN.md`.
- `Adaylar` names are the candidate files of the Lab experiment; the scenario slug is the picker entry the owner opens first. A question settled in words keeps `Seçenekler:`. The Kontrol tick reads `adaylar ✓` when any question of the round carries `Adaylar:` and `seçenekler ✓` when every question was settled in words; the round is done at seven ✓ (kntl-grilling's five plus `ilham` and `silinenler`).
- `Silinenler` reports the previous round's verdicts: candidates deleted from the Lab and winners waiting there. Round 1, and a round after no verdict, print `Silinenler: —`.
