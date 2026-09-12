#!/usr/bin/env node
/* =========================================================
   revisar-retirados.js — los ítems que se fueron sin precio
   y el precio que llegó después

     node herramientas/revisar-retirados.js           # el informe
     node herramientas/revisar-retirados.js --todos   # también los que no tienen candidato
     node herramientas/revisar-retirados.js MAT-14    # una categoría

   POR QUÉ HACE FALTA

   El 9 de septiembre se retiró todo lo que no tuviera precio real
   («Solo se publica lo que tiene precio real»). Entre lo retirado iba
   MAT-14-008 «Pegamento PVC, 1/4 galón». Los catálogos de Bellón,
   Ferremix y Ochoa entraron el 10 y el 11, y traen ciento seis
   artículos de cemento PVC con precio publicado.

   El ítem se fue el día 9 y su precio llegó el día 10, y nadie los
   volvió a juntar. No es un caso: es un mecanismo. El importador crea
   ítems por MAPEO —declarado a mano— o por REGLA —familias donde la
   ficha declara la medida—, y la lista de retirados no se vuelve a
   mirar nunca. Cada catálogo nuevo puede resucitar ítems y no lo hace.

   Lo mismo pasó con el tornillo de drywall, la masilla de juntas y la
   tapa de registro. Los cuatro están retirados y los cuatro tienen
   artículos con precio esperando en herramientas/datos-externos/.

   QUÉ HACE Y QUÉ NO HACE

   NO empareja por parecido de texto para crear ítems: eso es
   exactamente lo que el importador se prohíbe, y con razón. Lo que
   hace es BUSCAR CANDIDATOS y ponerlos delante para que alguien
   decida. Informa, nunca escribe.

   Un candidato es un artículo cuyo nombre contiene todas las palabras
   significativas del ítem retirado. «Pegamento PVC» pide «pegamento» y
   «pvc»; se le añaden los sinónimos que el mercado usa de verdad
   —cemento por pegamento, sheetrock por drywall—, porque sin ellos el
   ítem con más candidatos del catálogo se ve como si no tuviera
   ninguno.

   TRES ESTADOS, NO DOS

   Un ítem retirado con candidatos no siempre es un hueco. «Mezcladora
   de lavamanos» se retiró porque MAT-09-066 «Mezcladora, de baño» la
   reemplazó, y las tres crucetas RUBI se retiraron a mano y a
   propósito. Esos no hay que resucitarlos: ya están servidos.

   Así que cada retirado cae en uno de tres sitios:

     REEMPLAZADO — hay un ítem VIVO en la misma categoría que comparte
                   sus palabras significativas. No se toca.
     RESUCITABLE — no hay sucesor y sí hay artículos con precio. Este
                   es el hueco de verdad.
     SIN PRECIO   — nadie lo publica todavía.

   SE EXCLUYEN MOS Y EQU. La mano de obra y el alquiler de equipo no
   salen en el catálogo de una ferretería; buscarlos ahí solo produce
   ruido. Quedan los materiales, que son los que un catálogo puede
   resucitar.
   ========================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const EXTERNOS = path.join(RAIZ, 'herramientas', 'datos-externos');

/* ---------- lo retirado ---------- */

global.window = global;
global.PRECIOS = { c: function () {} };
require(path.join(RAIZ, 'precios/assets/js/datos-catalogo.js'));

const RETIRADOS = (global.CATALOGO.retirados || [])
  .filter(r => /^MAT-/.test(r.codigo || ''));

/* ---------- lo que publican los comercios ---------- */

function articulos() {
  const out = [];
  for (const f of fs.readdirSync(EXTERNOS).filter(x => x.endsWith('.json'))) {
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(EXTERNOS, f), 'utf8')); }
    catch (e) { continue; }
    const arr = Array.isArray(j) ? j : (j.articulos || j.items || j.productos || []);
    if (!Array.isArray(arr)) continue;
    const comercio = f.replace(/-\d{4}-\d{2}-\d{2}\.json$/, '');
    for (const a of arr) {
      const nombre = a.nombre || a.abrev || '';
      const precio = parseFloat(a.precio);
      if (!nombre || !(precio > 0)) continue;
      out.push({ comercio, nombre, precio, texto: norm(nombre + ' ' + (a.descripcion || '')) });
    }
  }
  return out;
}

/* El tornillo de drywall cuesta RD$ 0.48 y redondeado a entero salía
   «RD$ 0», que parece un error de dato y no lo es. */
const pesos = n => n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString('en-US');

const norm = t => String(t || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

/* Palabras que no distinguen nada: están en medio catálogo. */
const VACIAS = new Set(('de del la el los las para por con sin y o a en un una' +
  ' unidad saco funda galon galones rollo caja cubeta juego set kit pieza piezas' +
  ' m2 m3 ml mm cm pulg pulgada pulgadas pies pie lb lbs libra libras gal oz' +
  ' tipo clase color blanco blanca negro negra gris').split(' '));

/* El mercado no llama a las cosas como el catálogo. Sin esto, el ítem con
   106 candidatos se ve como si no tuviera ninguno. */
const SINONIMOS = {
  pegamento: ['pegamento', 'cemento', 'pega', 'adhesivo'],
  drywall:   ['drywall', 'sheetrock', 'yeso', 'panel'],
  masilla:   ['masilla', 'compuesto', 'joint'],
  junta:     ['junta', 'juntas', 'joint'],
  tornillo:  ['tornillo', 'tornillos'],
  varilla:   ['varilla', 'barra'],
  llave:     ['llave', 'valvula', 'grifo'],
  tuberia:   ['tuberia', 'tubo'],
  manguera:  ['manguera', 'flexible', 'abasto'],
  inodoro:   ['inodoro', 'sanitario', 'toilet'],
  arena:     ['arena'],
  cable:     ['cable', 'alambre'],
  breaker:   ['breaker', 'interruptor'],
};

function palabras(nombre) {
  return norm(nombre)
    .replace(/[^a-z0-9\/"'\s.]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^[."']+|[."']+$/g, ''))
    /* Los números y medidas se dejan fuera: «1/4 galón» no debe exigir
       que el artículo diga 1/4, porque lo que se busca es el producto,
       no la presentación. La presentación se decide después. */
    .filter(w => w.length >= 3 && !/^\d/.test(w) && !VACIAS.has(w));
}

/* includes() no sirve: «caja» cae dentro de nada, pero «electrica» cae
   dentro de «Calculadora Sharp Eléctrica» y el ítem «Caja eléctrica 2x4»
   se llenaba de calculadoras. Se exige palabra completa. */
const RE = {};
function trozo(s) {
  if (!RE[s]) RE[s] = new RegExp('(^|[^a-z0-9])' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)');
  return RE[s];
}

function candidatos(item, arts) {
  const ws = palabras(item.nombre);
  if (!ws.length) return [];
  const grupos = ws.map(w => SINONIMOS[w] || [w]);
  return arts.filter(a => grupos.every(g => g.some(s => trozo(s).test(a.texto))));
}

/* ---------- ¿alguien lo reemplazó? ---------- */

/* Un sucesor es un ítem VIVO de la misma categoría que comparte todas las
   palabras significativas del retirado, o todas menos una cuando el
   retirado tiene dos o más. «Mezcladora de lavamanos» contra «Mezcladora,
   de baño» comparte «mezcladora» y pierde «lavamanos»: es el mismo
   producto renombrado al separar por aparato. Con una sola palabra se
   exige coincidencia exacta, porque «Arena» contra «Arena» no prueba
   nada si no queda ninguna palabra de respaldo.

   El sucesor tiene que compartir la PRIMERA palabra significativa del
   retirado, que es la que nombra el producto, y puede perder una de las
   demás.

   Cuando falta una palabra se IMPRIME cuál falta. A veces la que falta
   es justo la que distingue: «Panel solar 550 W» encuentra «Panel LED
   empotrado» perdiendo «solar», y un panel solar no es un panel LED.
   Ese emparejamiento es malo y hay que poder verlo, no esconderlo. */
const VIVOS = global.CATALOGO.items.map(i => ({ i, ws: new Set(palabras(i.nombre)) }));

function sucesor(r) {
  const ws = palabras(r.nombre);
  if (!ws.length) return null;
  const falla = ws.length >= 2 ? 1 : 0;
  let mejor = null;
  for (const v of VIVOS) {
    if (v.i.cat !== r.cat) continue;
    /* La primera palabra significativa es la que NOMBRA el producto. Sin
       exigirla, «Calentador eléctrico 10 galones» encontraba «Interruptor
       de flotante eléctrico»: compartían «electrico» y nada más. */
    if (!v.ws.has(ws[0])) continue;
    const faltan = ws.filter(w => !v.ws.has(w)).length;
    if (faltan <= falla && (!mejor || faltan < mejor.faltan)) {
      mejor = { it: v.i, falta: ws.filter(w => !v.ws.has(w))[0] || null };
    }
  }
  return mejor;
}

/* ---------- informe ---------- */

const soloCat = process.argv.find(a => /^(MAT)-\d+$/.test(a));
const todos = process.argv.includes('--todos');

const arts = articulos();
const lista = RETIRADOS.filter(r => !soloCat || r.cat === soloCat);

const filas = lista.map(r => {
  const c = candidatos(r, arts);
  const ps = c.map(x => x.precio).sort((a, b) => a - b);
  const com = [...new Set(c.map(x => x.comercio))];
  return { r, n: c.length, com, min: ps[0], max: ps[ps.length - 1], ej: c.slice(0, 3), suc: sucesor(r) };
}).sort((a, b) => b.n - a.n);

const reemplazados = filas.filter(f => f.suc);
const resucitables = filas.filter(f => !f.suc && f.n > 0);
const sinPrecio    = filas.filter(f => !f.suc && !f.n);

console.log('');
console.log('LOS RETIRADOS QUE YA TIENEN PRECIO');
console.log('==================================');
console.log('%d ítems de material retirados · %d artículos publicados en %d catálogos',
  lista.length, arts.length, fs.readdirSync(EXTERNOS).filter(x => x.endsWith('.json')).length);
console.log('');
console.log('  reemplazados por un ítem vivo : %d', reemplazados.length);
console.log('  resucitables (hay precio)     : %d', resucitables.length);
console.log('  sin precio todavía            : %d', sinPrecio.length);
console.log('');
console.log('RESUCITABLES — nadie los reemplazó y su precio está publicado');
console.log('------------------------------------------------------------');

for (const f of resucitables) {
  console.log('%s  %s', String(f.n).padStart(4), f.r.codigo + '  ' + f.r.nombre);
  console.log('       %d comercios · RD$ %s – %s',
    f.com.length, pesos(f.min), pesos(f.max));
  for (const e of f.ej) console.log('         · [%s] %s — RD$ %s', e.comercio, e.nombre.slice(0, 62), pesos(e.precio));
}

if (todos) {
  console.log('');
  console.log('REEMPLAZADOS — ya servidos por otro ítem, no se tocan');
  console.log('-----------------------------------------------------');
  for (const f of reemplazados) {
    console.log('  %s  %s', f.r.codigo, f.r.nombre);
    console.log('       -> %s%s', f.suc.it.nombre, f.suc.falta ? '   (falta «' + f.suc.falta + '» — revisar)' : '');
  }
}

console.log('');
console.log('%d ítems retirados esperan resurrección, con %d artículos detrás.',
  resucitables.length, resucitables.reduce((s, f) => s + f.n, 0));
console.log('Ninguno entra solo: hay que declararlos.');
console.log('');
