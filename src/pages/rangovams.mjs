import { checkIcon, doneIcon, turnstile } from '../site.mjs';

export default {
  path: '/rangovams/',
  title: 'Rangovams – sklypo lyginimo užklausos jūsų regione | sklypolyginimas.lt',
  description: 'Žemės darbų įmonėms: gaukite sklypo lyginimo užklausas iš savo regiono be reklamos biudžeto. Mokestis už užklausą, regiono išimtinė teisė arba svetainės perėmimas.',
  headOpts: { partner: true },
  body: `
<section style="padding:40px 0 var(--sec)">
<div class="wrap split center" style="gap:48px 72px">
<div class="stack" style="gap:28px">
<h1 class="disp" style="font-size:clamp(46px,6vw,86px)">Sklypo lyginimo užsakymai be reklamos biudžeto</h1>
<p class="lead" style="color:var(--ink-2)">Žmonės, ieškantys „sklypo lyginimas“, randa šią svetainę. Kiekvieną užklausą perduodame vienam patikrintam rangovui regione – jums belieka paskambinti ir susitarti.</p>
<div class="row"><a href="#partneris" class="btn">Patikrinti, ar regionas laisvas</a></div>
</div>
<figure class="panel-dark" style="margin:0;padding:clamp(24px,3.4vw,40px)">
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><span style="font-size:20px;font-weight:650">Užklausos pavyzdys</span><span style="font-size:14px;font-weight:600;padding:6px 12px;border-radius:999px;background:var(--moss)">nauja</span></div>
<dl style="margin:0">
${[['Vieta', 'Vilniaus r., Riešė'], ['Plotas', '14 a, po statybų'], ['Darbai', 'Grubus lyginimas, juodžemis, paruošimas vejai'], ['Kada', 'Per dvi savaites'], ['Savininkas', 'Taip'], ['Biudžetas', '1 500–5 000 €'], ['Nuotraukos', '3']].map(([k, v]) => `<div style="display:grid;grid-template-columns:minmax(0,130px) minmax(0,1fr);gap:16px;padding:14px 0;border-top:1px solid #2F4535;font-size:16px"><dt style="color:var(--on-dark-2)">${k}</dt><dd style="margin:0" class="tnum">${v}</dd></div>`).join('')}
</dl>
<figcaption class="small" style="margin-top:16px;color:var(--on-dark-2)">Pavyzdiniai duomenys. Užklausos ateina el. paštu iškart po pateikimo, kartu su nuotraukomis.</figcaption>
</figure>
</div>
</section>

<section class="sec-b">
<div class="wrap stack" style="gap:40px">
<h2 class="h2 h2-m">Kaip galime bendradarbiauti</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:16px">
<article class="panel stack" style="gap:14px;border-radius:24px;padding:36px"><h3 style="font-size:22px;font-weight:650">Mokestis už užklausą</h3><p class="muted">Mokate tik už gautas užklausas. Be mėnesinio mokesčio ir įsipareigojimų.</p></article>
<article class="panel-dark stack" style="gap:14px;border-radius:24px;padding:36px"><h3 style="font-size:22px;font-weight:650">Visas regionas jums</h3><p style="color:var(--on-dark)">Visos regiono užklausos – tik jums. Jūsų įmonės pavadinimas ir kontaktai miesto puslapyje.</p></article>
<article class="panel stack" style="gap:14px;border-radius:24px;padding:36px"><h3 style="font-size:22px;font-weight:650">Svetainės perėmimas</h3><p class="muted">Perimkite visą svetainę, domeną ir pozicijas paieškoje kaip savo prekės ženklą.</p></article>
</div>
<p class="muted">Kainas aptariame individualiai pagal regioną ir užklausų kiekį.</p>
</div>
</section>

<section id="partneris" class="sec-b">
<div class="wrap"><div class="panel split" style="gap:48px 72px">
<div class="stack">
<h2 class="h2 h2-m">Ko tikimės iš partnerio</h2>
<p class="muted">Svetainė klientams žada aiškius dalykus, todėl partneriai turi juos vykdyti.</p>
<ul class="cl">
<li>${checkIcon()}Registruota įmonė ar individuali veikla</li>
<li>${checkIcon()}Susisiekiate su klientu tą pačią arba kitą darbo dieną</li>
<li>${checkIcon()}Matuojate nivelyru, sąmatą pateikiate raštu</li>
<li>${checkIcon()}Turite patikrinamų klientų atsiliepimų</li>
</ul>
</div>
<div data-lead data-endpoint="/api/partner">
<form class="form" action="/api/partner" method="post" novalidate>
<div class="hp" aria-hidden="true"><label>Svetainė<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
<label class="lbl">Įmonės pavadinimas<input class="f" type="text" name="imone" required maxlength="120"></label>
<label class="lbl">Regionas<select class="f" name="regionas"><option>Vilnius ir Vilniaus r.</option><option>Kaunas ir Kauno r.</option><option>Klaipėda ir Klaipėdos r.</option><option>Šiauliai</option><option>Panevėžys</option><option>Kitas</option></select></label>
<div class="grid2">
<label class="lbl">Kontaktinis asmuo<input class="f" type="text" name="vardas" maxlength="80"></label>
<label class="lbl">Telefono numeris<input class="f" type="tel" name="tel" maxlength="30"></label>
</div>
<label class="lbl">El. paštas<input class="f" type="email" name="email" required maxlength="120"></label>
${turnstile()}
<p class="form-err" role="alert" data-err></p>
<button type="submit" class="btn btn-block">Patikrinti, ar regionas laisvas</button>
</form>
<div class="done" role="status" tabindex="-1">${doneIcon}<h3 class="h2" style="font-size:32px">Ačiū, gavome</h3><p class="muted">Patikrinsime, ar jūsų regionas laisvas, ir atsakysime per vieną darbo dieną.</p></div>
</div>
</div></div>
</section>`,
};
