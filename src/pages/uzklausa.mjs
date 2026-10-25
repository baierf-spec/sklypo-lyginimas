import { munOptions, photoDrop, consent, turnstile, doneIcon } from '../site.mjs';

export default {
  path: '/uzklausa/',
  title: 'Užklausa – gaukite sklypo lyginimo pasiūlymą | sklypolyginimas.lt',
  description: 'Aprašykite sklypą per dvi minutes ir gaukite patikrinto rangovo pasiūlymą raštu. Užklausa nemokama ir nieko neįpareigoja.',
  headOpts: { minimal: true },
  body: `
<section style="padding:24px 0 var(--sec)">
<div class="wrap" style="display:flex;flex-wrap:wrap;gap:48px 72px;align-items:flex-start">
<div class="stack" style="flex:1 1 320px;min-width:0;gap:32px">
<h1 class="disp" style="font-size:clamp(42px,5vw,72px)">Pasiūlymas jūsų sklypui</h1>
<p class="lead">Kuo daugiau papasakosite, tuo tikslesnę kainą rangovas pasakys jau pirmo pokalbio metu.</p>
<ol class="stepper" aria-label="Užklausos žingsniai" data-stepper>
<li class="now"><span class="dot">1</span>Sklypas</li>
<li><span class="dot">2</span>Darbai</li>
<li><span class="dot">3</span>Laikas ir biudžetas</li>
<li><span class="dot">4</span>Kontaktai</li>
</ol>
<p class="small" style="font-size:15px;max-width:24em;padding-top:20px;border-top:1px solid var(--line)">Užklausa nemokama. Ją gauna vienas patikrintas rangovas jūsų regione, o sprendimą priimate jūs.</p>
</div>

<div class="panel" style="flex:999 1 560px;min-width:0" data-lead data-multistep>
<form class="form" action="/api/lead" method="post" enctype="multipart/form-data" novalidate>
<input type="hidden" name="saltinis" value="uzklausa">
<div class="hp" aria-hidden="true"><label>Svetainė<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>

<div class="step" data-step="1">
<h2 class="h2" style="font-size:34px">Kur yra sklypas?</h2>
<div class="grid2">
<label class="lbl">Savivaldybė<select class="f" name="savivaldybe" required>${munOptions()}</select></label>
<label class="lbl">Gyvenvietė<input class="f" type="text" name="vieta" placeholder="Pavyzdžiui, Riešė" maxlength="80"></label>
</div>
<label class="lbl" style="max-width:260px">Plotas arais<input class="f tnum" type="number" name="arai" min="1" max="100000" inputmode="numeric" placeholder="12"></label>
<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:15px;font-weight:600;margin-bottom:12px">Kokia žemė dabar?</legend>
<div class="grid2" style="gap:10px">
<label class="pick"><input type="radio" name="bukle" value="Beveik lygi">Beveik lygi</label>
<label class="pick"><input type="radio" name="bukle" value="Kauburiai, duobės">Kauburiai, duobės</label>
<label class="pick"><input type="radio" name="bukle" value="Po statybų">Po statybų</label>
<label class="pick"><input type="radio" name="bukle" value="Telkšo vanduo">Telkšo vanduo</label>
</div></fieldset>
</div>

<div class="step" data-step="2" hidden>
<h2 class="h2" style="font-size:34px">Ko reikia?</h2>
<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:15px;font-weight:600;margin-bottom:12px">Pažymėkite viską, kas tinka</legend>
<div class="grid2" style="gap:10px">
<label class="pick"><input type="checkbox" name="darbai" value="Grubus lyginimas">Grubus lyginimas</label>
<label class="pick"><input type="checkbox" name="darbai" value="Paruošimas vejai">Paruošimas vejai</label>
<label class="pick"><input type="checkbox" name="darbai" value="Nuolydžiai nuo namo">Nuolydžiai nuo namo</label>
<label class="pick"><input type="checkbox" name="darbai" value="Juodžemio atvežimas">Juodžemio atvežimas</label>
<label class="pick"><input type="checkbox" name="darbai" value="Frezavimas, akmenys">Frezavimas, akmenys</label>
<label class="pick"><input type="checkbox" name="darbai" value="Krūmai, kelmai, atliekos">Krūmai, kelmai, atliekos</label>
</div></fieldset>
<div class="stack" style="gap:8px"><span style="font-size:15px;font-weight:600">Sklypo nuotraukos</span>${photoDrop()}</div>
<label class="lbl">Kas dar svarbu? <span class="hint">Siauri vartai, trinkelės, medžiai ir pan.</span><textarea class="f" name="pastabos" rows="3" maxlength="2000"></textarea></label>
</div>

<div class="step" data-step="3" hidden>
<h2 class="h2" style="font-size:34px">Kada ir už kiek?</h2>
<label class="lbl">Kada planuojate darbus?<select class="f" name="kada"><option>Per dvi savaites</option><option>Per mėnesį</option><option>Per tris mėnesius</option><option>Kitą sezoną</option><option>Kol kas tik domiuosi kaina</option></select></label>
<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:15px;font-weight:600;margin-bottom:12px">Ar esate sklypo savininkas?</legend>
<div class="grid2" style="gap:10px">
<label class="pick"><input type="radio" name="savininkas" value="Taip">Taip</label>
<label class="pick"><input type="radio" name="savininkas" value="Statytojas ar rangovas">Statytojas ar rangovas</label>
<label class="pick"><input type="radio" name="savininkas" value="Kita">Kita</label>
</div></fieldset>
<label class="lbl">Numatomas biudžetas <span class="hint">Nebūtina</span><select class="f tnum" name="biudzetas"><option>Dar nežinau</option><option>iki 500 €</option><option>500–1 500 €</option><option>1 500–5 000 €</option><option>daugiau nei 5 000 €</option></select></label>
</div>

<div class="step" data-step="4" hidden>
<h2 class="h2" style="font-size:34px">Kaip su jumis susisiekti?</h2>
<div class="grid2">
<label class="lbl">Vardas<input class="f" type="text" name="vardas" autocomplete="given-name" required maxlength="80"></label>
<label class="lbl">Telefono numeris<input class="f" type="tel" name="tel" autocomplete="tel" placeholder="+370" required maxlength="30"></label>
</div>
<div class="grid2">
<label class="lbl">El. paštas <span class="hint">Sąmatai atsiųsti, nebūtina</span><input class="f" type="email" name="email" autocomplete="email" maxlength="120"></label>
<label class="lbl">Kada patogu kalbėti?<select class="f" name="laikas"><option>Bet kada</option><option>8–12 val.</option><option>12–17 val.</option><option>Po 17 val.</option></select></label>
</div>
${consent()}
${turnstile()}
</div>

<p class="form-err" role="alert" data-err></p>
<div class="step-nav">
<button type="button" class="btn-o" data-back hidden>Atgal</button>
<span class="small" style="font-size:15px" data-hint>Užtruks apie dvi minutes</span>
<button type="button" class="btn" data-next>Toliau</button>
<button type="submit" class="btn" data-submit hidden>Išsiųsti užklausą</button>
</div>
</form>
<div class="done" role="status" tabindex="-1">
${doneIcon}
<h2 class="h2" style="font-size:40px">Užklausa išsiųsta</h2>
<p class="lead">Rangovas susisieks su jumis tą pačią arba kitą darbo dieną ir suderins apmatavimo laiką. Kol laukiate, pasižiūrėkite, kiek kainuoja panašūs darbai.</p>
<div class="row"><a href="/kaina/" class="btn">Atidaryti kainų gidą</a><a href="/" class="btn-o">Grįžti į pradžią</a></div>
</div>
</div>
</div>
</section>`,
  noindex: false,
};
