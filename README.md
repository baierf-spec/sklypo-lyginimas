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

## Cloudflare būsena

- Zona `sklypolyginimas.lt` aktyvi, Worker'is pririštas prie `sklypolyginimas.lt` ir `www.sklypolyginimas.lt` (www → apex 301).
- Email Routing: `uzklausa@` ir `info@sklypolyginimas.lt` peradresuojami į `ADMIN_EMAIL`.
- Turnstile: widget'as „sklypolyginimas“, slaptas raktas Worker'io secret `TURNSTILE_SECRET_KEY`, viešas raktas build metu (`TURNSTILE_SITE_KEY`).
- Laiškai adminui: siuntėjas `uzklausa@sklypolyginimas.lt` (domene įjungtas Email Routing), gavėjas – patvirtintas Email Routing adresas `ADMIN_EMAIL`. Siuntimas patvirtintam adresui nemokamas ir veikia be Workers Paid / Email Sending. Atsarginis siuntėjas – `EMAIL_FROM_FALLBACK`.
- Klientams laiškų (pvz., patvirtinimų) siųsti negalima, kol paskyroje nėra Workers Paid plano.
- `SEO_INDEXABLE=true`: robots.txt leidžia indeksuoti, sitemap `/sitemap.xml`.

## Užklausų peržiūra

```bash
npx wrangler d1 execute sklypolyginimas-leads --remote \
  --command "SELECT created_at, kind, json_extract(data,'$.vardas') AS vardas, json_extract(data,'$.tel') AS tel, json_extract(data,'$.savivaldybe') AS vieta, status FROM leads ORDER BY created_at DESC LIMIT 50"
```
