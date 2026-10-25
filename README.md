# sklypolyginimas.lt

Lead svetainė apie sklypo lyginimą: statiniai puslapiai (SEO/GEO) + Cloudflare Worker, kuris užklausas siunčia el. paštu adminui ir saugo D1 bazėje.

## Struktūra

```
src/pages/*.mjs     puslapių turinys (HTML šablonai)
src/site.mjs        bendras maketas, antraštė, poraštė, formos, JSON-LD
src/assets/         styles.css, app.js (slankiklis, skaičiuoklė, formos, nuotraukos)
public/             favicon, og.png, llms.txt, _headers
build.mjs           sugeneruoja dist/ (+ sitemap.xml)
worker/index.js     /api/lead, /api/partner, robots.txt, noindex
migrations/         D1 schema
wrangler.jsonc      Cloudflare konfigūracija
```

## Komandos

```bash
npm install
npm run dev       # build + wrangler dev (el. laiškai tik simuliuojami)
npm run deploy    # build + D1 migracijos + wrangler deploy
```

## Kaip veikia užklausos

1. Forma siunčia `multipart/form-data` į `/api/lead`. Nuotraukos sumažinamos naršyklėje (iki 1600 px JPEG, max 6).
2. Worker patikrina honeypot, kilmę (`ALLOWED_ORIGINS`), Turnstile (jei nustatytas `TURNSTILE_SECRET_KEY`), dažnį iš IP.
3. Įrašo užklausą į D1 (`leads` lentelė) ir siunčia laišką per Cloudflare Email Service į `ADMIN_EMAIL` su nuotraukomis kaip priedais. Jei klientas nurodė el. paštą, „Atsakyti“ eina tiesiai jam.

## Kintamieji (`wrangler.jsonc` → `vars`)

| Kintamasis | Paskirtis |
|---|---|
| `ADMIN_EMAIL` | Kur siunčiamos užklausos. Turi būti patvirtintas Email Routing paskirties adresas. |
| `EMAIL_FROM` | Siuntėjas. Domenas turi būti įjungtas Email Sending. Kol `sklypolyginimas.lt` neaktyvus, naudojamas `uzklausa@drenazoirengimas.lt`. |
| `SITE_ORIGIN` | Kanoninis adresas (www → apex nukreipimas, robots sitemap). |
| `ALLOWED_ORIGINS` | Iš kur leidžiama siųsti formas. |
| `LEADS_ENABLED` | `false` – laikinai išjungti užklausas. |
| `SEO_INDEXABLE` | `true` – leisti indeksuoti (kol `false`, visur `noindex` ir `Disallow: /`). |

Pasirenkami: `TURNSTILE_SECRET_KEY` (secret) ir `TURNSTILE_SITE_KEY` (GitHub Actions kintamasis build metu).

## Paleidimo žingsniai

1. **Nameserveriai.** Pas domeno registratorių `sklypolyginimas.lt` nameserverius pakeiskite į `ram.ns.cloudflare.com` ir `zita.ns.cloudflare.com`.
2. **Email Sending.** Kai zona aktyvi: Cloudflare → Email Service → Email Sending → Onboard Domain → `sklypolyginimas.lt`. Tada `EMAIL_FROM` pakeiskite į `uzklausa@sklypolyginimas.lt`.
3. **Domenas Worker'iui.** `wrangler.jsonc` atkomentuokite `routes` blokelį.
4. **Indeksavimas.** `SEO_INDEXABLE` → `"true"`, tada Google Search Console pateikite `/sitemap.xml`.
5. **Automatinis deploy.** GitHub → Settings → Secrets → `CLOUDFLARE_API_TOKEN` (šablonas „Edit Cloudflare Workers“ + D1 Edit). Kiekvienas push į `main` paleidžia `.github/workflows/deploy.yml`.

## Užklausų peržiūra

```bash
npx wrangler d1 execute sklypolyginimas-leads --remote \
  --command "SELECT created_at, kind, json_extract(data,'$.vardas') AS vardas, json_extract(data,'$.tel') AS tel, json_extract(data,'$.savivaldybe') AS vieta, status FROM leads ORDER BY created_at DESC LIMIT 50"
```
