import { SITE, faq, faqSchema, shortForm, checkIcon } from '../site.mjs';

const FAQ = [
  { q: 'Kiek kainuoja išlyginti 10 arų sklypą?', a: 'Technika su operatoriumi kainuoja 30–45 € už valandą. Galutinė suma priklauso nuo to, kiek valandų užtruks darbas: lygiam sklypui jų reikia mažiau, kauburiuotam ar po statybų – daugiau. Orientacinę sumą parodys <a href="/kaina/">skaičiuoklė</a>.' },
  { q: 'Kada geriausia lyginti sklypą?', a: 'Nuo pavasario, kai žemė pradžiūsta, iki vėlyvo rudens. Molingo grunto po liūčių geriau neliesti: technika jį suspaudžia, ir vanduo nebesigeria.' },
  { q: 'Kiek juodžemio reikia vejai?', a: 'Rekomenduojama 15–18 cm derlingo sluoksnio. Vienam arui tai 15–18 m³, dešimčiai arų – 150–180 m³. Jei sklype jau yra geros žemės, atvežti reikės mažiau.' },
  { q: 'Kokia technika tinkamiausia sklypui lyginti?', a: 'Kiemams tarp tvorų – mini krautuvas, dideliems plotams ir aukščių skirtumams – buldozeris. Nuolydžiai tikslinami lazeriniu nivelyru, paviršius sutankinamas volu.' },
  { q: 'Kas atliks darbus?', a: 'Jūsų užklausą perduodame vienam patikrintam rangovui jūsų regione. Sutartį sudarote tiesiogiai su juo, o už užklausą nieko nemokate.' },
];

const REQ = [
  ['„Kaina sutartinė“, o sąskaita už valandas išauga dvigubai.', 'Sąmata raštu, su kaina už arą arba didžiausiu valandų skaičiumi.'],
  ['Pažadama atvažiuoti „kitą savaitę“, o paskui nebeatsiliepiama.', 'Konkreti darbų data, užrašyta sutartyje ar bent el. laiške.'],
  ['Po pirmo lietaus atsiranda balos, vanduo bėga link pamatų.', 'Nuolydis nuo namo, išmatuotas nivelyru, o ne „iš akies“.'],
  ['Atvežtame juodžemyje – molis, akmenys ir piktžolių šaknys.', 'Žemės kilmė iš anksto ir galimybė ją apžiūrėti prieš paskleidžiant.'],
  ['Molingas gruntas lyginamas po liūties ir suspaudžiamas.', 'Darbai tik po vienos–dviejų sausų dienų, net jei tenka nukelti datą.'],
  ['Išvažinėta veja, įskilusios trinkelės, užkabinta tvora.', 'Technika, parinkta pagal privažiavimą, ir sutvarkyta vieta po darbų.'],
];

const SVC = [
  ['s1', 'Grubus lyginimas ir planiravimas', 'Kauburiai nukasami, duobės užpildomos, aukščiai susiejami su namu ir keliu.', '<path d="M8 40 C 26 20, 40 52, 60 34 S 92 22, 112 38" fill="none" stroke="#8A6A4E" stroke-width="2" stroke-dasharray="4 4"/><path d="M8 44 L112 48" stroke="#2E5B3A" stroke-width="3" stroke-linecap="round"/>'],
  ['s2', 'Paruošimas vejai', 'Frezavimas, akmenų išrinkimas, lyginimas ir volavimas prieš sėją.', '<rect x="8" y="34" width="104" height="6" rx="3" fill="#4F8A4C"/><rect x="8" y="40" width="104" height="12" fill="#5B4130"/><circle cx="88" cy="24" r="9" fill="none" stroke="#16291C" stroke-width="2"/>'],
  ['s3', 'Nuolydžiai ir vandens nuvedimas', 'Vanduo nukreipiamas nuo pamatų į drenažą ar griovį.', '<rect x="10" y="16" width="26" height="30" rx="2" fill="#16291C"/><path d="M36 44 L112 52" stroke="#2E5B3A" stroke-width="3" stroke-linecap="round"/><path d="M54 34 h36 M84 29 l7 5 -7 5" stroke="#4E86B0" stroke-width="2" fill="none" stroke-linecap="round"/>'],
  ['s5', 'Juodžemio atvežimas', 'Vejai reikia 15–18 cm derlingo sluoksnio – apie 15–18 m³ arui.', '<path d="M16 50 L36 20 L56 50 Z" fill="#5B4130"/><rect x="56" y="44" width="56" height="6" rx="3" fill="#5B4130"/><rect x="56" y="40" width="56" height="4" rx="2" fill="#4F8A4C"/>'],
  ['s6', 'Sklypo paruošimas statyboms', 'Krūmai, kelmai, statybinės atliekos ir privažiavimas technikai.', '<path d="M26 52 V30 M26 30 l-8 -8 M26 30 l8 -11" stroke="#8A6A4E" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="58" y="30" width="20" height="22" rx="2" fill="none" stroke="#5C6B60" stroke-width="2"/><path d="M8 52 h104" stroke="#2E5B3A" stroke-width="3" stroke-linecap="round"/>'],
];

const heroSvg = `
<svg viewBox="0 0 1200 460" role="img" aria-label="Sklypo pjūvis prieš ir po lyginimo: kairėje duobėtas sklypas su bala, dešinėje lygi veja su nuolydžiu nuo namo">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4ECE1"/><stop offset="1" stop-color="#D3DFCF"/></linearGradient>
<pattern id="sub" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#CDBF9F"/><circle cx="3" cy="4" r="1.3" fill="#B5A57F"/><circle cx="10" cy="10" r="1" fill="#B5A57F"/></pattern>
<pattern id="clay" width="18" height="10" patternUnits="userSpaceOnUse"><rect width="18" height="10" fill="#8A6A4E"/><path d="M0 6 Q4.5 3 9 6 T18 6" fill="none" stroke="#7A5C42" stroke-width="1.2"/></pattern>
<clipPath id="after"><rect data-clip x="1080" y="0" width="1200" height="460"/></clipPath>
</defs>
<rect width="1200" height="460" fill="url(#sky)"/>
<g>
<path d="M250 318 C 310 262, 360 352, 440 318 S 560 248, 640 306 S 760 366, 840 314 S 980 254, 1060 312 S 1160 340, 1200 322 L1200 460 L250 460 Z" fill="url(#clay)"/>
<path d="M250 318 C 310 262, 360 352, 440 318 S 560 248, 640 306 S 760 366, 840 314 S 980 254, 1060 312 S 1160 340, 1200 322" fill="none" stroke="#5E4430" stroke-width="2.5"/>
<ellipse cx="742" cy="346" rx="58" ry="9" fill="#9FC0D6"/><ellipse cx="742" cy="345" rx="40" ry="4" fill="#C7DCE8"/>
<circle cx="520" cy="290" r="9" fill="#9C9686"/><circle cx="538" cy="296" r="6" fill="#B1AB9B"/><circle cx="960" cy="276" r="11" fill="#9C9686"/>
<rect x="1010" y="284" width="38" height="12" rx="2" fill="#A8A297" transform="rotate(-14 1029 290)"/>
<path d="M600 268 l-6 -14 M604 268 l2 -16 M609 268 l8 -12" stroke="#6F8A5A" stroke-width="2" fill="none"/>
<path d="M880 312 l-5 -12 M884 312 l3 -14" stroke="#6F8A5A" stroke-width="2" fill="none"/>
</g>
<g clip-path="url(#after)">
<rect width="1200" height="460" fill="url(#sky)"/>
<path d="M250 300 L1200 320 L1200 460 L250 460 Z" fill="url(#sub)"/>
<path d="M250 300 L1200 320 L1200 346 L250 326 Z" fill="#5B4130"/>
<path d="M250 294 L1200 314 L1200 322 L250 302 Z" fill="#4F8A4C"/>
<path d="M250 294 L1200 314" stroke="#3E733D" stroke-width="2.5" fill="none"/>
<path d="M1112 204 L1096 314 M1112 204 L1128 316 M1112 204 L1112 315" stroke="#16291C" stroke-width="2" fill="none"/>
<rect x="1100" y="186" width="24" height="18" rx="4" fill="#16291C"/>
<line x1="1100" y1="194" x2="250" y2="176" stroke="#D93A2B" stroke-width="1.6" stroke-dasharray="2 5"/>
<g font-family="Bricolage Grotesque, sans-serif" fill="#16291C">
<path d="M520 262 L690 266" stroke="#16291C" stroke-width="1.5"/><path d="M682 260 L691 266 L682 272" stroke="#16291C" stroke-width="1.5" fill="none"/>
<text x="520" y="250" font-size="18" font-weight="600">Nuolydis 2 % nuo namo</text>
<line x1="980" y1="333" x2="980" y2="392" stroke="#16291C" stroke-width="1.2"/>
<text x="880" y="414" font-size="16">15–18 cm juodžemio</text>
</g>
</g>
<rect x="70" y="190" width="180" height="128" rx="4" fill="#16291C"/>
<path d="M58 194 L160 124 L262 194 Z" fill="#2E5B3A"/>
<rect x="104" y="228" width="34" height="40" rx="2" fill="#EEF2EC" opacity=".85"/>
<rect x="178" y="236" width="40" height="82" rx="2" fill="#5C6B60"/>
<rect x="70" y="318" width="180" height="142" fill="#C3CEC1"/>
<line data-handle-line x1="1080" y1="0" x2="1080" y2="460" stroke="#F8FAF6" stroke-width="3"/>
<g data-handle transform="translate(1080 230)"><circle r="26" fill="#F8FAF6"/><path d="M-8 -7 L-15 0 L-8 7 M8 -7 L15 0 L8 7" stroke="#16291C" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
<g font-family="Bricolage Grotesque, sans-serif" font-size="17" font-weight="600">
<rect x="292" y="24" width="76" height="34" rx="17" fill="#16291C" opacity=".85"/><text x="330" y="47" text-anchor="middle" fill="#F8FAF6">Prieš</text>
<rect x="1100" y="24" width="64" height="34" rx="17" fill="#F8FAF6"/><text x="1132" y="47" text-anchor="middle" fill="#16291C">Po</text>
</g>
</svg>`;

const techSvg = `<svg viewBox="0 0 600 400" role="img" aria-label="Pjūvis: veja, 15–18 cm juodžemis, sutankintas gruntas, drenažas prie pamatų, nuolydis nuo namo">
<defs><pattern id="cp" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#D8CBB0"/><circle cx="3" cy="4" r="1.4" fill="#BBAA86"/><circle cx="10" cy="11" r="1" fill="#BBAA86"/></pattern>
<pattern id="gp" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#E6E2D8"/><circle cx="6" cy="6" r="3.2" fill="#C9C3B4"/></pattern></defs>
<rect x="20" y="44" width="92" height="336" rx="4" fill="#16291C"/>
<path d="M112 120 L580 150 L580 380 L112 380 Z" fill="url(#cp)"/>
<path d="M112 112 L580 142 L580 186 L112 156 Z" fill="#5B4130"/>
<path d="M112 104 L580 134 L580 142 L112 112 Z" fill="#4F8A4C"/>
<rect x="114" y="292" width="76" height="64" fill="url(#gp)"/>
<circle cx="152" cy="324" r="15" fill="#F8FAF6" stroke="#4E86B0" stroke-width="3"/>
<g font-family="Bricolage Grotesque, sans-serif" font-size="15" fill="#16291C" font-weight="600">
<path d="M210 84 L340 92" stroke="#16291C" stroke-width="1.5"/><path d="M332 86 L341 92 L332 98" fill="none" stroke="#16291C" stroke-width="1.5"/>
<text x="210" y="72">2–5 %</text>
<circle cx="420" cy="127" r="13" fill="#16291C"/><text x="420" y="132" text-anchor="middle" fill="#EEF2EC" font-size="13">A</text>
<circle cx="360" cy="165" r="13" fill="#16291C"/><text x="360" y="170" text-anchor="middle" fill="#EEF2EC" font-size="13">C</text>
<circle cx="440" cy="270" r="13" fill="#16291C"/><text x="440" y="275" text-anchor="middle" fill="#EEF2EC" font-size="13">B</text>
<circle cx="214" cy="324" r="13" fill="#16291C"/><text x="214" y="329" text-anchor="middle" fill="#EEF2EC" font-size="13">D</text>
<line x1="540" y1="139" x2="540" y2="183" stroke="#16291C" stroke-width="1.5"/><text x="486" y="210" font-weight="500">15–18 cm</text>
</g></svg>`;

export default {
  path: '/',
  title: 'Sklypo lyginimas – kaina 2026 ir patikrinti rangovai | sklypolyginimas.lt',
  description: 'Sklypo lyginimas visoje Lietuvoje: rinkos kainos 2026 m. (30–45 €/val.), kainų skaičiuoklė ir nemokama užklausa patikrintam rangovui jūsų rajone.',
  body: `
<section>
<div class="wrap stack" style="gap:40px;padding-top:40px">
<div class="split end" style="gap:32px 64px">
<h1 class="disp h1-xl">Sklypo lyginimas, po kurio nelieka balų</h1>
<div class="stack" style="gap:28px;padding-bottom:8px">
<p class="lead">Aprašykite sklypą per dvi minutes. Patikrintas jūsų rajono rangovas atvažiuos jo išmatuoti ir pateiks kainą raštu – dar prieš pradedant darbus.</p>
<div class="row"><a href="/uzklausa/" class="btn">Gauti pasiūlymą</a><a href="/kaina/" class="btn-o">Kiek tai kainuoja?</a></div>
</div>
</div>
<figure class="slider" data-slider>${heroSvg}
<input class="scrub" type="range" min="4" max="96" step="1" value="90" aria-label="Palyginkite sklypą prieš ir po lyginimo">
</figure>
<ul class="ticks">
<li>${checkIcon(18)}Užklausa nemokama ir nieko neįpareigoja</li>
<li>${checkIcon(18)}Perduodame tik patikrintiems rangovams</li>
<li>${checkIcon(18)}Kaina raštu prieš darbus</li>
</ul>
</div>
</section>

<section class="sec">
<div class="wrap split" style="gap:48px 80px">
<div class="stack" style="gap:24px;max-width:34em">
<h2 class="h2 h2-l">Kiek kainuoja sklypo lyginimas 2026 metais</h2>
<p style="font-size:19px;line-height:1.6;color:var(--ink-2)">Dauguma rangovų skaičiuoja už technikos valandą: įprastai 30–45 €, vidutiniškai 37 €. Didelius plotus lyginant buldozeriu valanda kainuoja brangiau, bet darbas vyksta greičiau. Prie sumos pridedamas technikos atvežimas ir juodžemis, jei jo trūksta.</p>
<p class="muted">Tikslią kainą lemia reljefas, gruntas ir privažiavimas, todėl patikimiausia – apmatavimas vietoje ir sąmata raštu.</p>
<a href="/kaina/" style="font-weight:600">Atidaryti kainų skaičiuoklę</a>
</div>
<div class="panel" style="padding-block:12px 24px">
<dl class="price-dl tnum">
<div><dt>Sklypo lyginimas</dt><dd>30–45 €<span> / val.</span></dd></div>
<div><dt>Buldozeris</dt><dd>50–70 €<span> / val.</span></dd></div>
<div><dt>Mini ekskavatorius</dt><dd>25–35 €<span> / val.</span></dd></div>
<div><dt>Juodžemis, smėlis, žvyras</dt><dd>3–16 €<span> / m³</span></dd></div>
</dl>
<p class="small" style="margin-top:8px">Teikėjų skelbiamos kainos Vilniuje ir Kaune, paslaugos.lt, 2026 m. spalis.</p>
</div>
</div>
</section>

<section class="sec">
<div class="wrap stack" style="gap:56px">
<div class="split end" style="gap:24px 80px">
<h2 class="h2 h2-l">Ko reikalauti iš rangovo, kad nereikėtų perdarinėti</h2>
<p class="body-l">Šešios situacijos, dėl kurių žmonės dažniausiai lieka nepatenkinti. Kiekvienos galima išvengti vienu aiškiu susitarimu. Mūsų partneriai šių susitarimų laikosi.</p>
</div>
<div class="req">${REQ.map(([w, n]) => `<div><p class="was">${w}</p><p class="need">${n}</p></div>`).join('')}</div>
</div>
</section>

<section class="dark" style="margin-top:var(--sec);padding-block:var(--sec)">
<div class="wrap stack" style="gap:64px">
<h2 class="h2 h2-l" style="max-width:14em">Nuo užklausos iki kainos raštu – trys žingsniai</h2>
<ol class="steps">
<li><span class="disp tnum n">1</span><h3>Aprašote sklypą</h3><p>Vieta, plotas, ko reikia ir, jei norite, kelios nuotraukos. Užtrunka dvi minutes.</p></li>
<li><span class="disp tnum n">2</span><h3>Rangovas susisiekia</h3><p>Užklausą gauna vienas patikrintas jūsų rajono rangovas ir tą pačią arba kitą darbo dieną suderina apmatavimą.</p></li>
<li><span class="disp tnum n">3</span><h3>Gaunate sąmatą</h3><p>Rangovas išmatuoja aukščius ir atsiunčia kainą raštu. Ar užsakyti darbus, sprendžiate jūs.</p></li>
</ol>
<div><a href="/uzklausa/" class="btn-l">Pradėti užklausą</a></div>
</div>
</section>

<section class="sec">
<div class="wrap split" style="gap:40px 80px">
<div class="stack" style="max-width:26em">
<h2 class="h2 h2-l">Ką apima sklypo lyginimas</h2>
<p class="body-l">Dažniausiai reikia ne vieno darbo, o kelių iš eilės. Užklausoje pažymėkite visus – rangovas pateiks bendrą sąmatą.</p>
<a href="/paslaugos/" style="font-weight:600">Visi darbai su brėžiniais</a>
</div>
<div>${SVC.map(([id, t, d, s]) => `<a href="/paslaugos/#${id}" class="svc"><svg viewBox="0 0 120 64" aria-hidden="true">${s}</svg><div><h3>${t}</h3><p>${d}</p></div></a>`).join('')}</div>
</div>
</section>

<section class="sec">
<div class="wrap">
<div class="panel split center" style="gap:48px 64px">
<div class="stack" style="gap:22px">
<h2 class="h2 h2-m">Taip atrodo teisingai paruoštas sklypas</h2>
<p class="body-l">Balos, išdžiūvę lopai ir nusėdę takai atsiranda ne dėl žolės, o dėl pagrindo. Keturi dalykai, kuriuos turi padaryti geras rangovas:</p>
<dl class="abcd">
<div><dt>A</dt><dd><strong>Nuolydis 2–5 % nuo pamatų</strong> pirmuosius tris metrus.</dd></div>
<div><dt>B</dt><dd><strong>Sutankintas gruntas</strong> po takais ir terasa.</dd></div>
<div><dt>C</dt><dd><strong>15–18 cm juodžemio</strong>, kad veja neišdžiūtų vasarą.</dd></div>
<div><dt>D</dt><dd><strong>Drenažas prie pamatų</strong>, kai gruntas molingas.</dd></div>
</dl>
</div>
<figure style="margin:0">${techSvg}</figure>
</div>
</div>
</section>

<section id="miestai" class="sec">
<div class="wrap split" style="gap:32px 80px">
<div class="stack" style="gap:16px;max-width:26em">
<h2 class="h2 h2-m">Sklypo lyginimas jūsų mieste</h2>
<p class="body-l">Užklausas priimame visoje Lietuvoje. Didžiųjų miestų puslapiuose rasite vietinius įkainius ir aptarnaujamas vietoves.</p>
</div>
<div class="stack" style="gap:16px">
<div class="pills"><a href="/vilnius/" class="pill">Vilnius ir rajonas</a><a href="/kaunas/" class="pill">Kaunas ir rajonas</a></div>
<div class="pills"><span class="pill">Klaipėda</span><span class="pill">Šiauliai</span><span class="pill">Panevėžys</span><span class="pill">Alytus</span><span class="pill">Marijampolė</span><span class="pill">Trakai</span><span class="pill">Elektrėnai</span></div>
</div>
</div>
</section>

<section id="duk" class="sec">
<div class="wrap split" style="gap:32px 80px">
<h2 class="h2 h2-m" style="max-width:10em">Dažniausi klausimai</h2>
${faq(FAQ)}
</div>
</section>

<section id="uzklausa" class="sec sec-b">
<div class="wrap">
<div class="panel-dark split" style="gap:48px 72px">
<div class="stack">
<h2 class="h2 h2-l">Sužinokite, kiek kainuos jūsų sklypas</h2>
<p style="font-size:18px;line-height:1.6;color:var(--on-dark);max-width:26em">Keturi laukai – ir rangovas susisieks su jumis. Daugiau detalių galėsite pridėti <a href="/uzklausa/">išsamioje užklausoje</a>.</p>
</div>
<div style="background:var(--paper);color:var(--forest);border-radius:var(--r-lg);padding:clamp(24px,3.4vw,40px)">
${shortForm({ source: 'pagrindinis' })}
</div>
</div>
</div>
</section>`,
  schema: [
    { '@type': 'Service', name: 'Sklypo lyginimas', serviceType: 'Sklypo lyginimas ir planiravimas', areaServed: { '@type': 'Country', name: 'Lietuva' }, provider: { '@id': SITE.url + '/#org' }, offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: 30, highPrice: 45, description: 'Kaina už technikos valandą' } },
    faqSchema(FAQ),
  ],
};
