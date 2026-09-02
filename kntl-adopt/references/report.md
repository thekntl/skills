# The report

The report is the owner's whole view of the adoption: what the project does, where each face stands, what was found, what to run next. Owner language, names-not-numbers and the Özet rule come from the conventions file; the report is Turkish, ids, labels and paths stay as written, and file, class and command names sit inside the tickets rather than in the report. Write it to `docs/kntl/adopt-<YYYY-MM-DD>/report.md`, then post it twice: as the reply, and as a comment on the `wayfinder:map` issue (`gh issue comment <map> --body-file docs/kntl/adopt-<YYYY-MM-DD>/report.md`) so it survives the session.

## Template

```
## KNTL'e alma — <codename>

**Bu proje şunu yapıyor:** <bir paragraf, kullanıcı gözünden: kim, hangi sorun, uygulama ne yapıyor, hangi platformlarda, bugün ne kadarı çalışıyor>

### Zar

| Yüz | Durum | Kanıt | Eksik |
| --- | --- | --- | --- |
| App Shell | tamam / kısmen / yok / uygulanmaz | <sweep satırı, ekran görüntüsü ya da dosya bağlantısı> | <n> ticket |
| Onboarding | … | … | … |
| Paywall ve ödeme | … | … | … |
| Ürün altyapısı | … | … | … |
| Landing sayfaları | … | … | … |
| Pazarlama | … | … | … |
| Hukuk | … | … | … |

POC: <çalışıyor / çalışmıyor / belirsiz> — <tek cümle: değer özelliği gerçek runtime'da uçtan uca ne yaptı, kanıt bağlantısı> → #N (POC)

### Tespit edilen stack
- <kategori>: <değer> · <tespit: <dosya> | onaylandı D-nnn | geçici D-nnn | açık>[ · eksik — kurulum: <adım>]

### Öne çıkan riskler
- <eşitlik ihlali | güvenlik | çalışmayan akış>: <tek cümle, kullanıcı ne yaşar> → #N (kısa ad)

### Kararlar
<n> giriş yazıldı: <k> onaylandı, <m> geçici. Geçiciler ilk `/kntl-grilling` oturumunda yeniden sorulacak.

### Sıradaki adım
<İzin paketi 3 hayır ise:> önce `git add docs/kntl docs/agents docs/design CONTEXT.md && git commit -m "docs: kntl adopt <YYYY-MM-DD>" && git push`
`<komut>` — <tek cümle: neden bu>

Ticket sözlüğü
- #N — kısa ad: <tek cümle, sade dilde ne çözüyor>
```

## Filling it

- `<codename>`: the codename line of `docs/agents/kntl-stack.md`, else the map's title, else the repo name.
- **Zar rows** keep the die's order and the status-schema labels. `Durum` translates stage 4's state: `done` → tamam, `in-progress` → kısmen, `not-started` → yok, `out-of-scope` → uygulanmaz. `Kanıt` is a link to a sweep log row, a screenshot in the sweep folder, or a `path:line` from `survey.md`; an `uygulanmaz` row carries the why here instead. `Eksik` is the count of open tickets carrying that face label that this run created or cited, and matches the map and the dashboard.
- **POC** is `çalışıyor` when the sweep's value flow row is `works` on the real runtime, `çalışmıyor` when it is `broken` or `missing`, `belirsiz` when it is `not tried`; the line ends in the POC ticket stage 5 filed.
- **Stack lines** come one per Providers row of `docs/agents/kntl-stack.md`, reading the Choice cell: the value, then its marker as `tespit: <dosya>` before the grilling round or, after it, `onaylandı D-nnn` / `geçici D-nnn` per that entry's state in the ledger; a row still `pending POC` reads `açık`. A `Ready?` cell reading `missing: <install step>` appends `eksik — kurulum: <adım>`.
- **Risks** in this order: parity violations, security (secrets in the repo, auth skipped, production keys in development, unprotected endpoints), broken flows on the value path. Each line ends in the ticket that carries it.
- **Sıradaki adım** is the first open step of `/kntl`'s Order of work, each naming the ticket stage 5 filed: the App Shell row of `docs/design/DESIGN.md`'s Status table reads `lo-fi` → `/kntl-design #N` on the App Shell design ticket; POC `çalışmıyor` or `belirsiz` → `/kntl-poc #N` on the open POC ticket; a row of `docs/agents/kntl-stack.md` reads `pending POC` → `/kntl-setup`; otherwise `/kntl-next`, which carries the legal and release gates itself. The commit line precedes it only when İzin paketi line 3 was `hayır`.
- **Ticket sözlüğü** lists every ticket the report mentions, one line each.
