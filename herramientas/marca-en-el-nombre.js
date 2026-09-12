'use strict';
/* =========================================================
   marca-en-el-nombre.js — leer la marca de los comercios que
   no publican columna de marca

     node herramientas/marca-en-el-nombre.js            # la medición
     node herramientas/marca-en-el-nombre.js --vocabulario
     node herramientas/marca-en-el-nombre.js --genericas

   POR QUÉ HACE FALTA

   La gama de un producto la decide la marca, y la marca solo llega a
   la cotización si el comercio publica una COLUMNA de marca. Seis lo
   hacen —Ochoa el 99%, CerArte el 100%, Ferremix el 96%— y los demás
   no publican ninguna:

     Bellón      1,788 cotizaciones,  0% con marca
     Cima          646 cotizaciones,  0%
     Mundo LED     354 cotizaciones,  1%
     Ilumel        249 cotizaciones,  0%

   Bellón es el catálogo más grande del directorio y no aporta una sola
   marca, aunque la escribe en todos sus nombres: «Llave Mezcladora
   Lavamanos Sin Desague Sayco LF400», «Cemento PVC 950ml Henkel
   Tangit». Sin leerla, 1,121 cotizaciones de grifería tienen marca
   reconocida en el 2% y la gama no puede separar la llave de RD$ 277
   de la grifería de RD$ 80,380.

   LA ADVERTENCIA QUE YA ESTABA ESCRITA

   importar-catalogos.js dice, con razón, que «sacar la marca de una
   frase con una expresión regular es exactamente la clase de cosa que
   se rompe callada». Esto NO es eso, y la diferencia importa:

   1. No se inventa el vocabulario. Las marcas salen de la COLUMNA que
      otros comercios sí publican: 646 nombres que alguien declaró.
   2. Se depura con una prueba, no con una opinión. Una palabra que
      aparece sobre todo en artículos cuya marca declarada es OTRA no
      es marca sino descripción —«PVC» sale en 850 nombres y 841 son de
      otra marca—, y se cae del vocabulario.
   3. Se exige POSICIÓN. Donde la marca se declara Y aparece en el
      nombre, su centro cae en la mediana al 89% del texto: va al
      final, antes del código de modelo. Se descarta lo que aparezca
      antes del 70%.
   4. Y se mide contra la verdad. Los artículos cuya marca declarada
      está en el nombre son el banco de pruebas: se lee sin mirarla y
      se compara.

   LO QUE DIO LA MEDICIÓN

     lee el 69% de los artículos que traen la marca en el nombre
     acierta el 100% de las veces que lee
     se inventa una marca en el 1% de los que no la traen

   El 1% es el precio y hay que decirlo: son artículos donde una
   palabra del vocabulario aparece al final del nombre sin ser la
   marca. No hay manera de bajarlo a cero sin dejar de leer.

   LO QUE NO HACE

   No adivina. Si no reconoce nada, devuelve '' y el artículo se queda
   sin marca, como estaba. Una marca equivocada en un precio de un
   comercio real es peor que ninguna marca.
   ========================================================= */

const fs = require('fs');
const path = require('path');

const EXTERNOS = path.join(__dirname, 'datos-externos');

/* Los dos umbrales de todo esto, juntos y a la vista. El primero es
   cuánto puede una palabra aparecer en artículos de otra marca antes de
   dejar de considerarse marca; el segundo, a qué altura del nombre tiene
   que estar. Ver la medición en la cabecera. */
const AJENIDAD_MAXIMA = 0.5;
const POSICION_MINIMA = 0.7;
const MINIMO_DECLARACIONES = 3;
const MINIMO_PARA_JUZGAR = 8;

const norm = t => String(t || '').toUpperCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function articulos() {
  const out = [];
  for (const f of fs.readdirSync(EXTERNOS).filter(x => x.endsWith('.json'))) {
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(EXTERNOS, f), 'utf8')); }
    catch (e) { continue; }
    const arr = Array.isArray(j) ? j : (j.articulos || j.items || j.productos || []);
    if (!Array.isArray(arr)) continue;
    const comercio = f.replace(/-\d{4}-\d{2}-\d{2}\.json$/, '');
    for (const a of arr) out.push({ comercio, nombre: norm(a.nombre || a.abrev || ''), marca: norm(a.marca || '').trim() });
  }
  return out;
}

/* Una marca válida: ni una letra suelta ni una frase. */
const FORMA = /^[A-Z0-9][A-Z0-9 .&'\-]*$/;

function construir() {
  const arts = articulos();
  const conMarca = arts.filter(a => a.marca.length >= 3 && a.marca.length <= 24 && FORMA.test(a.marca));

  const veces = {};
  conMarca.forEach(a => { veces[a.marca] = (veces[a.marca] || 0) + 1; });
  const candidatas = Object.keys(veces).filter(m => veces[m] >= MINIMO_DECLARACIONES);

  const re = {};
  candidatas.forEach(m => {
    re[m] = new RegExp('(^|[^A-Z0-9])' + m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^A-Z0-9]|$)');
  });

  /* LA DEPURACIÓN. «PVC» está declarado como marca por algún comercio, pero
     aparece en 850 nombres y 841 de ellos declaran otra marca: es el
     material, no el fabricante. Lo mismo «EMT», «USA», «PLYWOOD». */
  const genericas = [];
  const vocabulario = [];
  candidatas.forEach(m => {
    let dentro = 0, ajena = 0;
    for (const a of conMarca) {
      if (!a.nombre || !re[m].test(a.nombre)) continue;
      dentro++;
      if (a.marca !== m) ajena++;
    }
    if (dentro >= MINIMO_PARA_JUZGAR && ajena / dentro > AJENIDAD_MAXIMA) {
      genericas.push({ m, dentro, ajena });
    } else {
      vocabulario.push(m);
    }
  });

  return { vocabulario, genericas, re, conMarca, arts };
}

let cache = null;
const tabla = () => (cache || (cache = construir()));

/* =========================================================
   Leer
   ========================================================= */

/* Gana la que esté MÁS AL FINAL, y a igual posición la más larga: en
   «Cemento PVC 950ml Henkel Tangit» eso escoge Tangit, que es la marca,
   sobre Henkel, que es el grupo, y sobre PVC, que ya se cayó antes. */
function marcaDe(nombre) {
  const t = tabla();
  const n = norm(nombre);
  if (!n) return '';
  let mejor = '', pos = -1;
  for (let i = 0; i < t.vocabulario.length; i++) {
    const m = t.vocabulario[i];
    const j = n.search(t.re[m]);
    if (j < 0) continue;
    const p = (j + m.length / 2) / n.length;
    if (p < POSICION_MINIMA) continue;
    if (p > pos || (p === pos && m.length > mejor.length)) { mejor = m; pos = p; }
  }
  return mejor;
}

module.exports = { marcaDe, tabla, AJENIDAD_MAXIMA, POSICION_MINIMA };

/* =========================================================
   Informe
   ========================================================= */

if (require.main === module) {
  const t = tabla();

  if (process.argv.includes('--vocabulario')) {
    console.log(t.vocabulario.sort().join('\n'));
    process.exit(0);
  }
  if (process.argv.includes('--genericas')) {
    console.log('Palabras que alguien declaró como marca y son descripción:\n');
    t.genericas.sort((a, b) => b.dentro - a.dentro).forEach(g =>
      console.log('  ' + g.m.padEnd(18) + ' en ' + g.dentro + ' nombres, ' + g.ajena + ' de otra marca'));
    process.exit(0);
  }

  console.log('');
  console.log('LEER LA MARCA DEL NOMBRE');
  console.log('========================');
  console.log('%d marcas declaradas por los comercios · %d descartadas por genéricas · %d en el vocabulario',
    t.vocabulario.length + t.genericas.length, t.genericas.length, t.vocabulario.length);

  /* La prueba: los artículos cuya marca declarada SÍ está en el nombre son
     la verdad conocida. En los demás no hay nada que leer, y contarlos como
     fallo mediría otra cosa; pero sí sirven para ver cuántas veces el lector
     se inventa una. */
  const legibles = t.conMarca.filter(a => a.nombre && t.re[a.marca] && t.re[a.marca].test(a.nombre));
  const mudos = t.conMarca.filter(a => a.nombre && !(t.re[a.marca] && t.re[a.marca].test(a.nombre)));

  let leidos = 0, aciertos = 0;
  legibles.forEach(a => { const p = marcaDe(a.nombre); if (p) { leidos++; if (p === a.marca) aciertos++; } });
  let inventadas = 0;
  mudos.forEach(a => { if (marcaDe(a.nombre)) inventadas++; });

  console.log('');
  console.log('Banco de pruebas: %d artículos traen su marca declarada en el nombre, %d no.', legibles.length, mudos.length);
  console.log('  leyó      %d de los legibles  (%d%%)', leidos, Math.round(leidos / legibles.length * 100));
  console.log('  acertó    %d de los que leyó  (%d%%)', aciertos, Math.round(aciertos / leidos * 100));
  console.log('  se inventó una en %d de los mudos  (%d%%)', inventadas, Math.round(inventadas / mudos.length * 100));

  console.log('');
  console.log('LO QUE GANARÍAN LOS COMERCIOS SIN COLUMNA DE MARCA');
  console.log('--------------------------------------------------');
  const porComercio = {};
  t.arts.forEach(a => {
    const c = porComercio[a.comercio] || (porComercio[a.comercio] = { n: 0, declarada: 0, leida: 0 });
    c.n++;
    if (a.marca) c.declarada++;
    else if (a.nombre && marcaDe(a.nombre)) c.leida++;
  });
  Object.keys(porComercio).sort((a, b) => porComercio[b].leida - porComercio[a].leida).forEach(c => {
    const v = porComercio[c];
    if (!v.leida) return;
    console.log('  %s %s artículos · declaran %d%% · se les puede leer %d más (%d%%)',
      c.padEnd(24), String(v.n).padStart(6), Math.round(v.declarada / v.n * 100), v.leida,
      Math.round(v.leida / v.n * 100));
  });
  console.log('');
}
