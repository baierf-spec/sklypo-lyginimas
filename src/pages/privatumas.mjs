import { crumbs } from '../site.mjs';

export default {
  path: '/privatumo-politika/',
  title: 'Privatumo politika | sklypolyginimas.lt',
  priority: 0.2,
  description: 'Kaip sklypolyginimas.lt tvarko užklausose pateiktus asmens duomenis.',
  body: `
<section style="padding:40px 0 var(--sec)" data-mg data-stagger="90">
<div class="wrap stack" style="gap:36px">
${crumbs([{ name: 'Pradžia', path: '/' }, { name: 'Privatumo politika', path: '/privatumo-politika/' }])}
<h1 class="disp" style="font-size:clamp(40px,5vw,72px)" data-m="up">Privatumo politika</h1>
<div class="prose" data-m="up">
<p>Ši politika paaiškina, kaip svetainė sklypolyginimas.lt tvarko asmens duomenis, kuriuos pateikiate užklausos formoje. Duomenų valdytojas: [įmonės pavadinimas, įmonės kodas, adresas, el. paštas].</p>
<h2>Kokius duomenis renkame</h2>
<p>Vardą, telefono numerį, el. pašto adresą (jei nurodote), sklypo vietą, plotą, aprašymą ir nuotraukas, jei jas pridedate. Techniniais tikslais taip pat fiksuojamas užklausos laikas ir puslapis, iš kurio ji pateikta.</p>
<h2>Kam naudojame duomenis</h2>
<p>Tik tam, kad galėtume su jumis susisiekti, išmatuoti sklypą ir pateikti pasiūlymą. Jei darbus jūsų regione atlieka mūsų partneris, užklausa perduodama jam. Teisinis pagrindas – jūsų sutikimas, kurį pažymite pateikdami formą.</p>
<h2>Kam perduodame</h2>
<p>Užklausos duomenis gali gauti mūsų partneris, atliekantis darbus jūsų regione. Duomenų neparduodame reklamos tikslais ir neperduodame kitiems tretiesiems asmenims, išskyrus paslaugų teikėjus, užtikrinančius svetainės veikimą (talpinimas ir el. pašto siuntimas – Cloudflare, Inc.; lankomumo statistika – Google Ireland Ltd.).</p>
<h2>Slapukai ir lankomumo statistika</h2>
<p>Svetainės lankomumui matuoti naudojame Google Analytics (Google Ireland Ltd.). Ši paslauga naudoja slapukus ir renka nuasmenintą informaciją apie apsilankymus: kuriuos puslapius peržiūrėjote, iš kur atėjote, kokį įrenginį naudojate, ir ar pateikėte užklausą. Užklausos turinys (vardas, telefonas ir kiti formos duomenys) į Google Analytics neperduodamas. Slapukus galite ištrinti ar užblokuoti savo naršyklės nustatymuose.</p>
<h2>Kiek laiko saugome</h2>
<p>Užklausų duomenis saugome ne ilgiau kaip 24 mėnesius, po to jie ištrinami.</p>
<h2>Jūsų teisės</h2>
<p>Galite prašyti susipažinti su savo duomenimis, juos ištaisyti ar ištrinti, taip pat atšaukti sutikimą, parašę [el. paštas]. Turite teisę pateikti skundą Valstybinei duomenų apsaugos inspekcijai.</p>
</div>
</div>
</section>`,
};
