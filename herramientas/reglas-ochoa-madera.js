'use strict';
/* =========================================================
   reglas-ochoa-madera.js — los paneles de Ochoa

   Sesenta artículos, y es de lo más limpio que trae el catálogo.
   El material va en el nombre y la medida en la referencia, con el
   formato y el espesor juntos y escritos de tres maneras que
   quieren decir lo mismo: «4X8X3/4=18MM», «4X8-18MM-3/4» y
   «4X8X3/418MM».

   Se comprueba solo: la serie del plywood de pino sube 588 · 799 ·
   1.107 · 1.436 · 1.758 · 2.077 pesos de 3/16" a 3/4", monótona y
   sin saltos raros. Una serie así es la señal de que el comercio
   publica el precio por plancha y no por atado, que es lo único
   que aquí podía salir mal: los nombres dicen «ATADO 50PZ» y la
   tentación era leerlo como el precio del atado.

   Y no lo es. Un plywood de 3/4" a RD$ 2.077 la plancha está en
   línea con los RD$ 1.993 que ya tenía el catálogo para el
   corriente; a RD$ 2.077 el atado de cincuenta planchas costaría
   RD$ 41 la plancha, que no existe. El «ATADO 50PZ» es cuántas
   trae el fardo, no qué se está cotizando.

   LO QUE NO ENTRA
   ---------------
   - Los cantos de melamina (3). Se venden por rollo de 984 pies y
     el precio publicado —RD$ 3,39— es por pie. No es un panel.
   - El forro de pino (1). Es una pieza de madera, no una plancha,
     y su ficha no dice si va bruta o cepillada, que es lo que
     separa las dos en el catálogo.
   ========================================================= */

const MADERA = require('./especificacion-madera.js');

const MOTIVO = { valor: '' };

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();
const baja = s => limpia(s).toLowerCase()
  .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i')
  .replace(/[óò]/g, 'o').replace(/[úù]/g, 'u').replace(/ñ/g, 'n');

/* El milímetro y la fracción son el mismo espesor dicho de dos maneras, y
   el comercio las escribe juntas. Se publica en fracción, que es como se
   pide en la obra. */
const ESPESOR_MM = {
  '2.7': '1/8"', '3': '1/8"', '3.0': '1/8"', '3.6': '3/16"', '4': '3/16"',
  '5.5': '5.5 mm', '6': '1/4"', '9': '3/8"', '12': '1/2"', '15': '5/8"', '18': '3/4"'
};
const FRACCION = { '1/8': '1/8"', '3/16': '3/16"', '1/4': '1/4"', '3/8': '3/8"',
                   '1/2': '1/2"', '5/8': '5/8"', '3/4': '3/4"' };

/* El material, por el nombre. El orden importa: «MELAMINA MDF» es melamina
   y no MDF a secas, y «MDF HIDROFUGO CHAPADO ROBLE» es chapado. */
const MATERIAL = [
  [/melamina.*mdp/, 'Melamina MDP hidrófugo'],
  [/melamina.*mdf/, 'Melamina MDF hidrófugo'],
  [/mdf hidrofugo chapado|chapado roble/, 'Plywood MDF hidrófugo chapado'],
  [/mdf hidrofugo|mdf hidro/, 'Plywood MDF hidrófugo'],
  [/fibro mdf|\bmdf\b/, 'Plywood MDF'],
  [/carton piedra/, 'Cartón piedra'],
  [/okume/, 'Plywood de okume'],
  [/encofrar|encofrado|formaleta/, 'Plywood de formaleta'],
  [/laminado negro/, 'Plywood laminado negro'],
  [/\bdec\.?\b|decorativ/, 'Plywood decorativo'],
  [/pino/, 'Plywood de pino']
];

/* El formato de la plancha, en pies. «30X7» y «32X7» son 3.0 y 3.2 pies:
   el punto se pierde en la referencia del comercio. */
function formatoDe(ref) {
  const m = String(ref || '').match(/(\d+)\s*'?\s*[xX]\s*(\d+)\s*'?/);
  if (!m) return '';
  /* «30X7» y «32X7» son 3.0 y 3.2 pies. Y 3.0 es 3: si se deja el decimal
     puesto, la misma plancha de okume sale en dos partidas —una escrita
     «3 x 7» y otra «3.0 x 7»— por cómo la tecleó el comercio. */
  const pie = v => {
    const x = (v >= 30 && v <= 39) ? v / 10 : v;
    return Number.isInteger(x) ? String(x) : x.toFixed(1);
  };
  const a = pie(parseInt(m[1], 10)), b = pie(parseInt(m[2], 10));
  if (!a || !b) return '';
  return a + ' x ' + b + ' pies';
}

function espesorDe(texto) {
  const t = String(texto || '').toUpperCase();
  /* Manda la fracción, porque es como se pide la plancha en la obra y es
     la propia tienda la que hace la equivalencia: escribe «4X8X1/4=5.5MM»,
     de modo que para ella un cuarto de pulgada son 5,5 mm. Discutírselo
     sería inventar un espesor que nadie pide. El milímetro entra solo
     cuando viene sin fracción al lado. */
  const fr = t.match(/(\d+\/\d+)/g);
  if (fr) {
    for (let i = fr.length - 1; i >= 0; i--) if (FRACCION[fr[i]]) return FRACCION[fr[i]];
  }
  const mm = t.match(/(\d+(?:\.\d+)?)\s*MM/);
  if (mm && ESPESOR_MM[mm[1]]) return ESPESOR_MM[mm[1]];
  return '';
}

function regla(a) {
  MOTIVO.valor = '';
  if (a.cat1 !== 'madera') return undefined;

  const n = baja(a.nombre);

  if (/^cantos?\b/.test(n)) {
    MOTIVO.valor = 'canto de melamina: se vende por rollo y el precio publicado es por pie, no es un panel';
    return null;
  }
  if (/^pino forro|^forro\b/.test(n)) {
    MOTIVO.valor = 'pieza de madera, no plancha, y la ficha no dice si va bruta o cepillada';
    return null;
  }

  let material = '';
  for (let i = 0; i < MATERIAL.length; i++) {
    if (MATERIAL[i][0].test(n)) { material = MATERIAL[i][1]; break; }
  }
  if (!material) { MOTIVO.valor = 'la ficha no declara el material del panel'; return null; }

  /* La melamina lleva el color en la referencia y la medida en el nombre;
     el resto al revés. Se miran los dos. */
  const medida = limpia(a.ref) + ' ' + limpia(a.nombre);
  const espesor = espesorDe(medida);
  if (!espesor) { MOTIVO.valor = 'la ficha no declara el espesor del panel'; return null; }

  const formato = formatoDe(medida);
  if (!formato) { MOTIVO.valor = 'la ficha no declara el formato de la plancha'; return null; }

  return MADERA.item('panel', { material: material, espesor: espesor, formato: formato });
}

module.exports = { regla, MOTIVO };
