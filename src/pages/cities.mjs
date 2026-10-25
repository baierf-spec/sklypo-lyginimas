import { SITE, crumbs, crumbsSchema, faq, faqSchema, shortForm } from '../site.mjs';

const CITIES = [
  {
    slug: 'vilnius', name: 'Vilnius', loc: 'Vilniuje', gen: 'Vilniaus', municipality: 'Vilniaus m./r.',
    avg: 37, providers: 35,
    villages: ['Vilniaus miestas', 'Avižienių sen.', 'Riešės sen.', 'Pagirių sen.', 'Mickūnų sen.', 'Nemenčinės sen.', 'Rudaminos sen.', 'Sužionių sen.', 'Kita Vilniaus r. vieta'],
    areas: ['Vilniaus miestas', 'Avižieniai', 'Riešė', 'Pagiriai', 'Mickūnai', 'Nemenčinė', 'Rudamina', 'Sužionys', 'Bezdonys', 'Marijampolis', 'Maišiagala'],
    local: 'Vilnius ir jo apylinkės yra kalvotos, todėl čia dažniau nei kitur tenka ne tik lyginti, bet ir formuoti nuolydžius ar terasas, kad vanduo nebėgtų link namo. Naujuose priemiesčių kvartaluose – Riešėje, Avižieniuose, Pagiriuose – po statybų sklypuose dažnai lieka iškastos žemės krūvos ir suvažinėtas gruntas, kurį pirmiausia reikia supurenti.',
    near: ['Trakai', 'Elektrėnai', 'Širvintos'],
  },
  {
    slug: 'kaunas', name: 'Kaunas', loc: 'Kaune', gen: 'Kauno', municipality: 'Kauno m./r.',
    avg: 37, providers: 30,
    villages: ['Kauno miestas', 'Garliava', 'Domeikava', 'Karmėlava', 'Ringaudai', 'Akademija', 'Neveronys', 'Raudondvaris', 'Samylai', 'Kita Kauno r. vieta'],
    areas: ['Kauno miestas', 'Garliava', 'Domeikava', 'Karmėlava', 'Ringaudai', 'Akademija', 'Neveronys', 'Raudondvaris', 'Samylai', 'Užliedžiai'],
    local: 'Kauno rajone sparčiai daugėja individualių namų – ypač Garliavoje, Domeikavoje, Ringauduose ir Neveronyse. Žemesnėse vietose prie Nemuno ir Neries slėnių svarbu iš anksto numatyti, kur nuvesti lietaus vandenį, todėl nuolydžiai ir drenažas čia dažnai būna sąmatos dalis kartu su lyginimu.',
    near: ['Kaišiadorys', 'Jonava', 'Prienai'],
  },
];

const page = (c) => {
  const C = [{ name: 'Pradžia', path: '/' }, { name: 'Miestai', path: '/#miestai' }, { name: c.name, path: `/${c.slug}/` }];
  const QA = [
    { q: `Kiek kainuoja sklypo lyginimas ${c.loc}?`, a: `Teikėjai ${c.loc} skelbia 30–45 € už technikos valandą, vidurkis – ${c.avg} €. Galutinė kaina priklauso nuo reljefo, grunto ir atstumo iki objekto.` },
    { q: `Ar užklausos priimamos iš ${c.gen} rajono?`, a: `Taip, iš viso ${c.gen} miesto ir rajono. Atokesnėse vietose technikos atvežimas gali kainuoti daugiau.` },
    { q: 'Kaip greitai galima pradėti darbus?', a: 'Priklauso nuo sezono ir rangovo užimtumo. Pavasarį ir rudenį verta užsisakyti bent viena–dviem savaitėmis anksčiau.' },
  ];
  return {
    path: `/${c.slug}/`,
    title: `Sklypo lyginimas ${c.loc} – kaina 2026 | sklypolyginimas.lt`,
    description: `Sklypo lyginimas ${c.loc} ir ${c.gen} rajone: 30–45 €/val. (vid. ${c.avg} €). Nemokama užklausa patikrintam ${c.gen} regiono rangovui, kaina raštu prieš darbus.`,
    body: `
<section style="padding:40px 0 var(--sec)" data-mg data-stagger="90">
<div class="wrap stack" style="gap:36px">
<div data-m="up">${crumbs(C)}</div>
<div class="split" style="gap:48px 72px">
<div class="stack" style="gap:28px">
<h1 class="disp h1-l" data-m="up">Sklypo lyginimas ${c.loc} ir ${c.gen} rajone</h1>
<p class="lead" style="color:var(--ink-2)" data-m="up">${c.name === 'Vilnius' ? 'Vilniuje' : c.loc} sklypo lyginimas kainuoja 30–45 € už technikos valandą, vidutiniškai ${c.avg} €. Paslaugas skelbia apie ${c.providers} teikėjų, todėl pasiūlymai labai skiriasi – palyginti verta pagal tą pačią darbų apimtį.</p>
<dl class="stats" data-m="up">
<div><dt>vidutinė kaina už valandą</dt><dd class="disp tnum"><span class="count" data-count="${c.avg}">${c.avg}</span> €</dd></div>
<div><dt>teikėjų ${c.loc}</dt><dd class="disp tnum"><span class="count" data-count="${c.providers}">${c.providers}</span></dd></div>
</dl>
<p class="small" data-m="up">Šaltinis: paslaugos.lt, 2026 m. spalis. Atnaujinta <time datetime="${SITE.updated}">${SITE.updatedLt}</time>.</p>
</div>
<div id="greita" class="panel-dark" style="padding:clamp(24px,3.6vw,44px)" data-m="card" data-d="200">
<h2 class="h2" style="font-size:32px;margin-bottom:20px">Užklausa ${c.gen} regione</h2>
${shortForm({ source: c.slug, dark: true, municipality: c.municipality, villages: c.villages })}
</div>
</div>
</div>
</section>

<section class="sec-b" data-mg data-stagger="45">
<div class="wrap split" style="gap:32px 80px">
<h2 class="h2 h2-m" style="max-width:12em" data-m="up">Kur priimamos užklausos</h2>
<div class="pills" data-story="lightup">${c.areas.map((a) => `<span class="pill" style="color:var(--forest)" data-m="up">${a}</span>`).join('')}</div>
</div>
</section>

<section class="sec-b" data-mg>
<div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr));gap:24px">
<div class="panel stack" data-m="card">
<h2 class="h2 h2-s">Prieš lyginant sklypą ${c.gen} rajone</h2>
<p class="muted" style="line-height:1.65">${c.local}</p>
<ol class="stepper">
<li class="now"><span class="dot">1</span>Pasitikslinkite sklypo ribas ir kaimynų sklypų aukščius.</li>
<li class="now"><span class="dot">2</span>Išsiaiškinkite, kur galima nuvesti lietaus vandenį.</li>
<li class="now"><span class="dot">3</span>Įvertinkite privažiavimą: vartų plotį, dangas, medžius.</li>
</ol>
</div>
<div class="panel stack" style="gap:8px" data-m="card">
<h2 class="h2 h2-s" style="margin-bottom:12px">Klausimai apie ${c.name === 'Vilnius' ? 'Vilnių' : 'Kauną'}</h2>
${faq(QA, 'compact')}
</div>
</div>
</section>

<section class="sec-b" data-mg>
<div class="wrap stack" data-m="up">
<h2 style="font-size:22px;font-weight:650">Taip pat skaitykite</h2>
<div class="pills"><a href="/paslaugos/#s2" class="pill">Paruošimas vejai</a><a href="/paslaugos/#s3" class="pill">Nuolydžiai ir balos</a><a href="/paslaugos/#s5" class="pill">Juodžemio kiekis</a><a href="/kaina/" class="pill">Kainų skaičiuoklė</a>${CITIES.filter((x) => x.slug !== c.slug).map((x) => `<a href="/${x.slug}/" class="pill">Sklypo lyginimas ${x.loc}</a>`).join('')}</div>
</div>
</section>`,
    schema: [
      crumbsSchema(C),
      { '@type': 'Service', name: `Sklypo lyginimas ${c.loc}`, serviceType: 'Sklypo lyginimas', areaServed: c.areas.map((a) => ({ '@type': 'Place', name: a })), provider: { '@id': SITE.url + '/#org' }, offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: 30, highPrice: 45 } },
      faqSchema(QA),
    ],
  };
};

export default CITIES.map(page);
