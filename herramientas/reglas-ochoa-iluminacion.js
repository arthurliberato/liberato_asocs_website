'use strict';
/* =========================================================
   reglas-ochoa-iluminacion.js — la iluminación del catálogo de Ochoa

   Son 858 artículos con precio, y la mitad no es luminaria: hay
   bombillos, drivers, bases de globo, linternas y repuestos. Lo
   que entra es la lámpara decorativa, por la misma puerta que las
   de Mundo LED, Luminatti, Ilumel y Aliss: la partida no se
   compara modelo a modelo sino que se publica por rango, porque la
   pieza se elige por diseño. Ver especificacion-iluminacion.js.

   Y Ochoa vale ahí por lo mismo que valía Aliss, pero por el otro
   motivo: es una ferretería, no una casa de diseño, así que sus
   lámparas de techo —de RD$ 1.000 a RD$ 15.800— llenan el tramo
   medio del rango, entre las de Aliss y las de Luminatti.

   LA SECCIÓN ORIENTA, EL NOMBRE DECIDE
   ------------------------------------
   Ochoa archiva por sección —techo, pared, mesa y pedestal,
   exteriores— y eso da el montaje. Pero mete en «Lámparas de
   techo» algún aplique y en «mesa y pedestal» una lámpara de
   escalera, así que cuando el nombre dice otra cosa, manda el
   nombre.

   LO QUE NO ENTRA Y POR QUÉ
   -------------------------
   - Lámparas comerciales (161). Son paneles LED empotrados de
     7 a 36 W y sus drivers: luminaria funcional, con potencia y
     temperatura de color declaradas. Esa se compara por
     especificación y no por rango, y el catálogo ya la tiene en
     otras partidas. Mezclarla con la decorativa arruinaría las
     dos.
   - Bombillos y tubos (50). Van en MAT-10 y con su potencia; el
     catálogo los compara aparte.
   - Complementos (35): bases de globo, floronesEZ y globos
     sueltos. Pieza de la lámpara, no la lámpara —el mismo
     criterio que en Mundo LED y en Aliss.
   - Repuestos y accesorios (55), linternas (26) y abanicos (97).
     Un abanico de techo es un aparato, no una luminaria, aunque
     traiga bombillo.
   ========================================================= */

const ILUM = require('./especificacion-iluminacion.js');

const MOTIVO = { valor: '' };

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();
const baja = s => limpia(s).toLowerCase()
  .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i')
  .replace(/[óò]/g, 'o').replace(/[úù]/g, 'u').replace(/ñ/g, 'n');

/* La sección de la tienda da el montaje de partida. «Exteriores» entra
   como pared o techo según lo que sea —un farol de pared es un aplique y
   una lámpara de poste no tiene partida propia todavía. */
const MONTAJE = {
  'lamparas de techo': 'techo',
  'lamparas de pared': 'pared',
  'lamparas de mesa y pedestal': 'mesa',
  'lamparas para exteriores': 'exterior',
  'lampara infantil': 'techo'
};

/* Piezas de la lámpara, no la lámpara. */
const PIEZA = /^(pantalla|tulipa|globo|floron|base\b|cuerpo|repuesto|driver|transformador|socket|portalampara|brazo|cadena|canopy|difusor|rejilla|vidrio|cristal)/;

/* Lo que no es luminaria aunque cuelgue del techo. */
const NO_LUMINARIA = /^(abanico|ventilador|linterna|bombillo|tubo|panel|lamp\s+de\s+panel|lamp\s+panel|reflector|proyector|cinta|extension|timer|fotocelda|sensor)/;

/* Y lo que no es luminaria de ninguna manera. Ochoa archiva en su sección
   de lámparas un juego de marcadores fluorescentes y unos velones LED de
   ocho piezas: el primero es papelería y los segundos son velas de
   adorno. Salieron de mirar lo que entraba y no se llamaba lámpara —tres
   artículos de 361, y dos estaban mal. */
const NI_LUMINARIA = /^(set de marcador|velon|vela\b|velas\b)/;

function regla(a) {
  MOTIVO.valor = '';
  if (a.cat1 !== 'iluminacion') return undefined;

  const sec = baja(a.cat2);
  const n = baja(a.nombre);

  if (sec === 'lamparas comerciales') {
    MOTIVO.valor = 'luminaria funcional —panel LED con potencia y color declarados—, que se compara por especificación y no por rango';
    return null;
  }
  if (sec === 'bombillos y lamparas') {
    MOTIVO.valor = 'bombillo o tubo: el catálogo los compara aparte, por potencia';
    return null;
  }
  if (sec === 'complementos de iluminacion' || sec === 'repuestos y accesorios de iluminacion') {
    MOTIVO.valor = 'pieza suelta de la lámpara, no la lámpara';
    return null;
  }
  if (sec === 'linternas y complementos') {
    MOTIVO.valor = 'linterna portátil, no luminaria de obra';
    return null;
  }
  if (sec === 'abanicos') {
    MOTIVO.valor = 'abanico de techo: es un aparato, no una luminaria';
    return null;
  }

  const m = MONTAJE[sec];
  if (!m) return undefined;                 // sección sin regla: ni se cuenta

  if (PIEZA.test(n)) {
    MOTIVO.valor = 'pieza suelta de la lámpara, no la lámpara';
    return null;
  }
  if (NO_LUMINARIA.test(n) || NI_LUMINARIA.test(n)) {
    MOTIVO.valor = 'no es una luminaria decorativa aunque esté archivado con ellas';
    return null;
  }

  /* El nombre corrige a la sección. Un aplique es de pared lo archive
     Ochoa donde lo archive, y una lámpara de escalera archivada en «mesa
     y pedestal» va en la pared. */
  let montaje = m;
  if (/^aplique|d\s*\/\s*pared|de pared|\bescalera\b|^farol d\s*\/\s*pared/.test(n)) montaje = 'pared';
  else if (/^lamp(ara)?\s*(d\s*\/\s*|de\s+)?(escritorio|mesa)/.test(n)) montaje = 'mesa';
  else if (/\bde pie\b|\bpedestal\b/.test(n)) montaje = 'pie';
  else if (/colgante|colg\.|^lamp(ara)?\s+colg|plafon|techo/.test(n)) montaje = 'techo';

  /* Las de exterior que siguen sin resolverse por el nombre son de poste o
     de columna, y el catálogo no tiene esa partida: una luminaria de poste
     se especifica por su altura y su montaje al mástil, y no se compara
     con un colgante de comedor. */
  if (montaje === 'exterior') {
    MOTIVO.valor = 'luminaria de poste o de columna; el catálogo no tiene esa partida todavía';
    return null;
  }

  return ILUM.item('lampara-decorativa', { montaje: montaje });
}

module.exports = { regla, MOTIVO };
