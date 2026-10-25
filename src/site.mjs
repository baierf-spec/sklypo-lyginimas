// Shared layout, components and helpers for the static build.
export const SITE = {
  url: (process.env.SITE_URL || 'https://sklypolyginimas.lt').replace(/\/$/, ''),
  name: 'sklypolyginimas.lt',
  updated: '2026-10-24',
  updatedLt: '2026 m. spalio 24 d.',
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '',
};

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const MUNICIPALITIES = ['Vilniaus m.', 'Vilniaus r.', 'Kauno m.', 'Kauno r.', 'Klaipėdos m.', 'Klaipėdos r.', 'Šiaulių m.', 'Šiaulių r.', 'Panevėžio m.', 'Panevėžio r.', 'Alytaus', 'Marijampolės', 'Trakų r.', 'Elektrėnų', 'Kita'];

export const logoMark = (size = 38) => `<svg width="${size}" height="${size}" viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="10" fill="#16291C"/><path d="M7.5 14.2c2.6-3.4 5 2.8 7.8-.2s5.2-3.4 8.2-.3 3.8 1.4 5 0" fill="none" stroke="#8DB48E" stroke-width="2.2" stroke-linecap="round"/><path d="M7.5 23.2L28.5 25" stroke="#EEF2EC" stroke-width="3.4" stroke-linecap="round"/></svg>`;

export const checkIcon = (size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8.25" fill="none" stroke="#2E5B3A" stroke-width="1.5"/><path d="M5.5 9.3l2.3 2.3 4.7-5" fill="none" stroke="#2E5B3A" stroke-width="1.8"/></svg>`;

const plusIcon = `<svg class="ic" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v14M3 10h14" stroke="#2E5B3A" stroke-width="2" stroke-linecap="round"/></svg>`;

const photoIcon = (dark) => `<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" style="flex:none"><rect width="40" height="40" rx="12" fill="${dark ? '#2E5B3A' : '#E1ECDF'}"/><path d="M11 27l5.5-6.5 4 4 3-3 5.5 5.5" fill="none" stroke="${dark ? '#EEF2EC' : '#2E5B3A'}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="25" cy="14.5" r="2.2" fill="${dark ? '#EEF2EC' : '#2E5B3A'}"/></svg>`;

const doneIcon = `<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="#E1ECDF"/><path d="M14 24.5l6.5 6.5L34 17" fill="none" stroke="#2E5B3A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const faq = (items, cls = '') => `<div class="faq ${cls}">${items.map((q, i) => `
<details${i === 0 && cls !== 'compact' ? ' open' : ''}><summary>${q.q}${plusIcon}</summary><p>${q.a}</p></details>`).join('')}
</div>`;

export const faqSchema = (items) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a.replace(/<[^>]+>/g, '') } })),
});

export const crumbs = (items) => `<nav aria-label="Kelias"><ol class="crumbs">${items.map((c, i) => i === items.length - 1 ? `<li aria-current="page">${c.name}</li>` : `<li><a href="${c.path}">${c.name}</a></li>`).join('')}</ol></nav>`;

export const crumbsSchema = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE.url + c.path })),
});

export const photoDrop = ({ dark = false, name = 'foto' } = {}) => `
<div class="stack" style="gap:10px">
<label class="drop" data-drop>
<input type="file" name="${name}" accept="image/*" multiple data-photos>
${photoIcon(dark)}
<span style="display:flex;flex-direction:column;gap:2px"><span class="t1" data-photo-label>Pridėti sklypo nuotraukų</span><span class="t2">Nebūtina, bet kaina bus tikslesnė. Iki 6 nuotraukų.</span></span>
</label>
<div class="thumbs" data-thumbs></div>
</div>`;

const turnstile = () => SITE.turnstileSiteKey ? `<div class="cf-turnstile" data-sitekey="${SITE.turnstileSiteKey}" data-language="lt" data-appearance="interaction-only"></div>` : '';

const munOptions = (placeholder = true) => (placeholder ? '<option value="">Pasirinkite</option>' : '') + MUNICIPALITIES.map((m) => `<option>${m}</option>`).join('');

export const consent = () => `<label class="check"><input type="checkbox" name="sutikimas" value="taip" required><span>Sutinku, kad mano duomenys būtų naudojami šiai užklausai pagal <a href="/privatumo-politika/">privatumo politiką</a>.</span></label>`;

/** Short lead form (4 fields + photos). */
export const shortForm = ({ source, dark = false, municipality, villages } = {}) => {
  const place = villages
    ? `<label class="lbl">Vietovė<select class="f" name="vieta">${villages.map((v) => `<option>${v}</option>`).join('')}</select></label>`
    : `<label class="lbl">Savivaldybė<select class="f" name="savivaldybe" required>${munOptions()}</select></label>`;
  return `
<div data-lead class="${dark ? 'dark-form' : ''}">
<form class="form" action="/api/lead" method="post" enctype="multipart/form-data" novalidate>
<input type="hidden" name="saltinis" value="${esc(source)}">
${municipality ? `<input type="hidden" name="savivaldybe" value="${esc(municipality)}">` : ''}
<div class="hp" aria-hidden="true"><label>Svetainė<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
<div class="grid2">
${place}
<label class="lbl">Plotas arais<input class="f tnum" type="number" name="arai" min="1" max="100000" inputmode="numeric" placeholder="12"></label>
</div>
<div class="grid2">
<label class="lbl">Vardas<input class="f" type="text" name="vardas" autocomplete="given-name" required maxlength="80"></label>
<label class="lbl">Telefono numeris<input class="f" type="tel" name="tel" autocomplete="tel" placeholder="+370" required maxlength="30"></label>
</div>
${photoDrop({ dark })}
${consent()}
${turnstile()}
<p class="form-err" role="alert" data-err></p>
<button type="submit" class="btn btn-block"${dark ? ' style="background:#F8FAF6;color:#16291C"' : ''}>Gauti pasiūlymą</button>
</form>
<div class="done" role="status" tabindex="-1">
${doneIcon}
<h3 class="h2" style="font-size:32px">Užklausa išsiųsta</h3>
<p style="font-size:17px;line-height:1.6" class="${dark ? '' : 'muted'}">Paskambinsime tą pačią arba kitą darbo dieną ir suderinsime nemokamo matavimo laiką.</p>
</div>
</div>`;
};

export { munOptions, doneIcon, turnstile };

const NAV = [
  { href: '/paslaugos/', label: 'Paslaugos' },
  { href: '/kaina/', label: 'Kainos' },
  { href: '/#miestai', label: 'Miestai' },
  { href: '/#duk', label: 'Klausimai' },
];

export const header = (current, { minimal = false, partner = false } = {}) => `
<a class="skip" href="#turinys">Pereiti prie turinio</a>
<header class="site-head"><div class="wrap">
<a href="/" class="brand" aria-label="sklypolyginimas.lt, pradžia">${logoMark()}<span class="brand-name">sklypolyginimas<span>.lt</span></span>${partner ? '<span class="badge">rangovams</span>' : ''}</a>
${minimal ? `<a href="/" style="font-size:16px;font-weight:500">Grįžti į pradžią</a>` : partner ? `<a href="#partneris" class="btn btn-sm">Tapti partneriu</a>` : `<nav class="nav" aria-label="Pagrindinė navigacija">
${NAV.map((n) => `<a href="${n.href}"${n.href === current ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n')}
<a href="/uzklausa/" class="btn btn-sm">Gauti pasiūlymą</a>
</nav>`}
</div></header>`;

export const footer = () => `
<footer class="site-foot"><div class="wrap">
<div class="foot-grid">
<div class="stack" style="gap:14px">
<a href="/" class="brand" aria-label="sklypolyginimas.lt">${logoMark(32)}<span class="brand-name">sklypolyginimas<span>.lt</span></span></a>
<p class="small" style="font-size:15px;max-width:22em">Sklypų lyginimas, nuolydžiai ir paruošimas vejai visoje Lietuvoje. [Įmonės pavadinimas], įm. k. [kodas].</p>
</div>
<nav aria-label="Puslapiai"><a href="/paslaugos/">Sklypo lyginimo paslaugos</a><a href="/kaina/">Kainos ir skaičiuoklė</a><a href="/uzklausa/">Užklausa</a><a href="/privatumo-politika/">Privatumo politika</a></nav>
<nav aria-label="Miestai"><a href="/vilnius/">Sklypo lyginimas Vilniuje</a><a href="/kaunas/">Sklypo lyginimas Kaune</a></nav>
<div class="stack" style="gap:12px;font-size:16px"><span class="ttl" style="font-weight:600">Užklausos</span><a href="/uzklausa/">Gauti pasiūlymą</a><span class="muted" style="font-size:15px">Matavimas nemokamas</span></div>
</div>
<p class="small">© 2026 sklypolyginimas.lt</p>
</div></footer>`;

/** Full HTML document. */
export const layout = ({ path, title, description, body, schema = [], current, headOpts = {}, ogType = 'website', noindex = false }) => {
  const crumbNode = schema.find((x) => x['@type'] === 'BreadcrumbList');
  const canonical = SITE.url + path;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': SITE.url + '/#website', url: SITE.url + '/', name: SITE.name, inLanguage: 'lt-LT' },
      { '@type': 'Organization', '@id': SITE.url + '/#org', name: SITE.name, url: SITE.url + '/', logo: SITE.url + '/icon-512.png', email: 'info@sklypolyginimas.lt', areaServed: { '@type': 'Country', name: 'Lietuva' }, knowsAbout: ['Sklypo lyginimas', 'Sklypo planiravimas', 'Nuolydžių formavimas', 'Paruošimas vejai', 'Juodžemio atvežimas', 'Drenažas'] },
      { '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: title, description, inLanguage: 'lt-LT', isPartOf: { '@id': SITE.url + '/#website' }, about: { '@id': SITE.url + '/#org' }, dateModified: SITE.updated, primaryImageOfPage: SITE.url + '/og.png', ...(crumbNode ? { breadcrumb: crumbNode } : {}) },
      ...schema,
    ],
  };
  return `<!doctype html>
<html lang="lt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'}">
<link rel="alternate" hreflang="lt" href="${canonical}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${ogType}">
<meta property="og:locale" content="lt_LT">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#16291C">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<script>(function(d){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('m');setTimeout(function(){if(!window.__m)d.classList.remove('m')},3500)}}catch(e){}})(document.documentElement)</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap">
<link rel="stylesheet" href="/assets/styles.css?v=__V__">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
${SITE.turnstileSiteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : ''}
</head>
<body>
${header(current, headOpts)}
<main id="turinys">
${body}
</main>
${footer()}
<script src="/assets/motion.js?v=__V__" defer></script>
<script src="/assets/app.js?v=__V__" defer></script>
</body>
</html>
`;
};
