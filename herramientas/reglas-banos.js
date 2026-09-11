'use strict';
/* =========================================================
   reglas-banos.js — el catálogo de baños de Ochoa

   Este archivo decide dos cosas sobre cada artículo:

     1. Si le sirve o no a un constructor.
     2. Qué ESPECIFICACIÓN es, para que caiga en el ítem que le
        toca junto a los del otro comercio.

   Lo segundo cambió: antes cada artículo creaba su propio ítem
   con su marca y su modelo en el nombre, y eso está mal. Un
   inodoro de una pieza elongado es un solo ítem aunque lo vendan
   Helvex, Cato y AquaSpa; la marca es de la cotización. La tabla
   de especificaciones vive en especificacion-banos.js y la usan
   los dos comercios, que es lo que hace que sus precios caigan en
   la misma fila.

   LA REGLA DE ENTRADA
   -------------------
   Entra lo que un constructor presupuesta e instala como parte de
   la obra —el equipamiento— y queda fuera el repuesto que compra
   el dueño de casa para cambiar una pieza rota.

   Un inodoro entra. Una tapa de inodoro no. Una manecilla, una
   pera, un flotador, un juego de tornillos de tanque: no. No es
   que sean malos productos, es que nadie los pone en un
   presupuesto de obra.

   OJO CON LAS CATEGORÍAS DEL COMERCIO
   -----------------------------------
   No son de fiar: hay espejos dentro de «muebles de baños»,
   botiquines LED dentro de «espejos», barras de seguridad dentro
   de «secador de manos» y tapas de tanque dentro de «inodoros de
   una pieza». Por eso todo se clasifica por el nombre del
   producto, que sí es consistente.
   ========================================================= */

const T = require('./texto-ochoa.js');
const E = require('./especificacion-banos.js');

/* ---------------------------------------------------------
   Lo que no entra: repuesto de consumidor
   --------------------------------------------------------- */
const REPUESTO = [
  /^Asiento\b/i,                       // tapa de inodoro
  /^Tapa\b/i,                          // tapa de tanque
  /^(Manecilla|Manija|Manivela)\b/i,
  /^(Pera|Flota|Flotador|Varilla)\b/i,
  /^(Push|Button|Botton|Bot[oó]n)\b/i,
  /^(Tornillos?|Set De Tornillos)\b/i,
  /^(Flush|Flust)\b/i,
  /^V[aá]lvula\b/i,
  /^Cubrefalta\b/i,
  /^Kit (De Tornillos|Valv|Rondanas|para inodoro Pera|P \/ Inodoro Pera)/i,
  /^(Vaso|Portavaso)\b/i,              // vaso de cristal: menaje, no obra
  /^Cubierta Para Papelera/i,
  /^L[aá]mpara\b/i,
  /^(Mecanismo|Repuesto|Chapet[oó]n|Palote|Pu[ñn]o)\b/i,
  /^Fitting\b/i
];

/* Accesorios: el juego sí, la pieza suelta no.

   Un constructor presupuesta «juego de accesorios de baño» por cada baño
   del proyecto, no un toallero Milano y un portapapel Lugano por separado:
   eso es una decisión de decoración que además llena la página de variantes
   de la misma cosa en distintos acabados. Se quedan las barras de
   seguridad, porque en baño accesible y en obra hotelera y de salud son
   partida obligatoria con su propio anclaje, y el equipamiento de baño
   público, que se compra por cantidad de baños igual que un inodoro. */
const PIEZA_SUELTA = [
  /^(Toallero|Portatoallas?|Porta ?Toalle?r?o?|Porta ?Toalla)/i,
  /^(Portapapel|Porta ?Papel|Papelera)/i,
  /^(Portacepillos?|Porta ?Cepillo|Cepiller[ao])/i,
  /^Jabonera/i,
  /^(Gancho|Percha)/i,
  /^Repisa\b/i,
  /^Tendedero\b/i
];

/* ---------------------------------------------------------
   De qué especificación se trata. Gana el primero que casa.
   --------------------------------------------------------- */
const FAMILIA = [
  [/^Inodoro\b/i,                      'inodoro-una-pieza'],
  [/^Tanque\b/i,                       'inodoro-tanque'],
  [/^(Basineta|Taza)\b/i,              'inodoro-basineta'],
  [/^(Orinal|Mingitorio|Urinario)\b/i, 'urinario'],
  [/^Bidet?\b/i,                       'bide'],
  [/^Kit (De |D \/ )?Instalaci[oó]n/i, 'kit-instalacion-inodoro'],
  [/^(Lavamanos?|Lavabo|Lavatorio)\b/i,'lavamanos'],
  [/^(Pedestal|Pata)\b/i,              'pedestal'],
  [/^Palometa\b/i,                     'palometa'],
  [/^Conector\b/i,                     'conector-desague'],
  [/^(Mueble|Gabinete|Vanity)\b/i,     'mueble-bano'],
  [/^Botiqu[ií]n\b/i,                  'botiquin'],
  [/^Espejo\b/i,                       'espejo'],
  [/^Cabina\b/i,                       'cabina-ducha'],
  [/^(Barra (De )?Seguridad|Agarradera)/i, 'barra-seguridad'],
  [/^(Kit|Juego|Accesorios?)\b/i,      'juego-accesorios'],
  [/^Secador\b/i,                      'secador-manos'],
  [/^(Dispensador|Dosificador).*(Jab[oó]n|Espuma)/i, 'dispensador-jabon'],
  [/^(Dispensador|Dosificador)/i,      'dispensador-papel'],
  [/^Cambiador/i,                      'cambiador-bebes'],
  /* Casi todo lo de ducha empieza por «Ducha», así que la palabra que
     distingue está más adentro del nombre y no al principio. */
  [/^Mezc/i,                           'ducha-mezcladora'],
  [/^Manguera\b|manguera/i,            'ducha-manguera'],
  [/^Columna\b|columna/i,              'ducha-columna'],
  [/^Brazo\b|\bbrazo\b/i,             'ducha-brazo'],
  [/barra|riel|desliza/i,              'ducha-barra'],
  [/tel[eé]fono|de mano|\bmano\b/i,    'ducha-telefono'],
  /* «Soporte» estaba aquí y no debía: la escuadra que sujeta el teléfono de
     la ducha a la pared no es el cabezal. Entraba a RD$ 126 en una partida
     cuyo siguiente peldaño está en RD$ 2,759 y hacía parecer roto un ítem
     que no lo estaba. */
  [/^Soporte\b/i,                      null],
  [/^(Cabeza|Regadera|Ducha)/i,        'ducha-cabezal']
];

/* ---------------------------------------------------------
   Las medidas, sacadas del nombre y de la referencia
   --------------------------------------------------------- */
const num = s => { const v = parseFloat(String(s).replace(',', '.')); return isFinite(v) ? v : null; };

function medidasDe(a, familia) {
  const n = T.limpia(a.nombre) + ' ' + T.limpia(a.ref);
  const m = {};

  if (/^inodoro/.test(familia)) {
    if (/elong|alarg/i.test(n)) m.forma = 'elongado';
    else if (/redond|\bred\.?\b/i.test(n)) m.forma = 'redondo';
    const l = n.match(/(\d[.,]?\d?)\s*(?:LPD|LTS?|L)\b/i);
    if (l) { const v = num(l[1]); if (v && v >= 3 && v <= 12) m.descarga_l = v; }
    if (/push|bot[oó]n/i.test(n)) m.descarga = 'push button';
    else if (/palanca|manija/i.test(n)) m.descarga = 'palanca';
  }

  if (familia === 'lavamanos') {
    if (/sobreponer|sobre poner|\btope\b/i.test(n)) m.montaje = 'sobreponer';
    else if (/empotr|bajo cub/i.test(n)) m.montaje = 'empotrar';
    else if (/pedestal/i.test(n)) m.montaje = 'pedestal';
    else if (/pared|colgar/i.test(n)) m.montaje = 'pared';
    /* El nombre casi nunca dice cómo se monta, pero la subcategoría del
       comercio sí. No es de fiar para saber QUÉ es el artículo —hay tapas
       de tanque archivadas bajo «pedestal»— pero una vez que el nombre ya
       dijo que es un lavamanos, sirve para saber cómo va montado. */
    else if (/^pedestal/i.test(a.cat3 || '')) m.montaje = 'pedestal';
    else if (/sobreponer/i.test(a.cat3 || '')) m.montaje = 'sobreponer';
    else if (/empotrable/i.test(a.cat3 || '')) m.montaje = 'empotrar';
    const h = n.match(/\b(\d)\s*(?:H|agujeros?|perforaciones?)\b/i);
    if (h) m.agujeros = +h[1];
  }

  if (familia === 'mueble-bano') {
    if (/susp|pared|colgar|flotante/i.test(n)) m.montaje = 'pared';
    else if (/\bpiso\b/i.test(n)) m.montaje = 'piso';
  }

  if (familia === 'botiquin' || familia === 'espejo') {
    if (/\bled\b/i.test(n)) m.luz = 'led';
  }

  if (familia === 'barra-seguridad') {
    if (/\ben ?l\b|tipo l|\bl\b(?!\w)/i.test(n)) m.forma = 'en L';
    else if (/abatible/i.test(n)) m.forma = 'abatible';
    else if (/curva/i.test(n)) m.forma = 'curva';
    else m.forma = 'recta';
    let c = n.match(/(\d+(?:[.,]\d+)?)\s*cm\b/i);
    if (c) m.largo_cm = E.aCm(num(c[1]), 'cm');
    if (!m.largo_cm) { c = n.match(/(\d+)\s*mm\b/i); if (c) m.largo_cm = E.aCm(num(c[1]), 'mm'); }
    if (!m.largo_cm) { c = n.match(/(\d+)\s*(?:"|''|pulg)/i); if (c) m.largo_cm = E.aCm(num(c[1]), 'pulg'); }
  }

  if (familia === 'juego-accesorios') {
    const p = n.match(/(\d)\s*(?:Pzas?|piezas?|pcs)\b/i) || n.match(/\b(\d)\s*\/\s*1\b/) || n.match(/\b(\d)\s*en\s*1\b/i);
    if (p) m.piezas = +p[1];
  }

  /* El ámbito lo decide la tabla de especificación, no cada comercio:
     si cada uno lo decidiera, el mismo artículo caería en partidas
     distintas según quién lo venda. */
  if (['juego-accesorios', 'secador-manos', 'dispensador-jabon', 'dispensador-papel'].indexOf(familia) >= 0) {
    m.ambito = E.ambito(n);
  }

  if (familia === 'secador-manos' || familia === 'dispensador-jabon') {
    if (/sensor|autom[aá]tic/i.test(n)) m.activacion = 'sensor';
    else if (/bot[oó]n|manual|palanca/i.test(n)) m.activacion = 'boton';
  }

  if (familia === 'dispensador-papel') {
    if (/toalla/i.test(n)) m.tipo_papel = 'toalla';
    else if (/higi[eé]nico|jumbo|servilleta/i.test(n)) m.tipo_papel = 'papel higiénico';
  }

  /* Dimensiones, cuando el comercio las declara. No forman parte de la
     identidad del ítem pero se registran: si otro proveedor solo publica
     eso, es por donde se podrá emparejar más adelante. */
  const d = n.match(/(\d{2,4})\s*[xX]\s*(\d{2,4})\s*[xX]\s*(\d{2,4})\s*(mm|cm)?/);
  if (d) {
    const u = (d[4] || (num(d[1]) > 200 ? 'mm' : 'cm')).toLowerCase();
    const f = u === 'mm' ? 1 : 10;
    m.largo_mm = num(d[1]) * f; m.ancho_mm = num(d[2]) * f; m.alto_mm = num(d[3]) * f;
  }

  return m;
}

/* ---------------------------------------------------------
   La regla
   --------------------------------------------------------- */
function regla(a) {
  const n = T.limpia(a.nombre);
  if (REPUESTO.some(re => re.test(n))) return null;
  if (PIEZA_SUELTA.some(re => re.test(n))) return null;

  const f = FAMILIA.filter(x => x[0].test(n))[0];
  /* La familia puede ser null a propósito: es una expresión que está en la
     tabla para atrapar el nombre ANTES de que lo reclame otra —«Soporte»
     antes que «Ducha»— y decir que no es partida. */
  if (!f || !f[1]) return null;

  return E.item(f[1], medidasDe(a, f[1]));
}

module.exports = { regla, medidasDe, REPUESTO, PIEZA_SUELTA };
