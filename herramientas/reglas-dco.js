'use strict';
/* =========================================================
   reglas-dco.js — el catálogo de dco.do, sección Proyectos

   168 papeles tapiz con precio, todos de casas escandinavas y
   europeas —Boråstapeter, Majvillan, Rifle Paper Co., Newbie,
   Scandinavian Designers— y es la mejor fuente de la partida
   por una razón concreta: cada ficha publica la medida de su
   rollo.

   Eso es justo lo que le faltaba a Cortinaje, donde 198 de 274
   referencias se quedaron fuera por no decir si el rollo era el
   angosto de 5.3 m² o el ancho de 10.6. Aquí la ficha lo dice
   producto por producto —«1005 × 53 cm», «823 × 68.58 cm»,
   «1120 × 53 cm»— y de ahí sale el metro cuadrado sin suponer
   nada.

   Con estas 168, la partida de papel tapiz del catálogo queda
   con 289 cotizaciones entre RD$ 310 y RD$ 3,055 el metro, y
   sin un solo salto mayor de 1.52x: la escalera completa, del
   papel corriente al de diseño.

   LO QUE NO ENTRA
   ---------------
   Los cuatro mosaicos de espejo y el panel Arcobaleno, que la
   tienda publica sin precio: dice «consultar». Un ítem sin
   precio no es una referencia.
   ========================================================= */

const REV = require('./especificacion-revestimiento.js');

const MOTIVO = { valor: '' };

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) {
    MOTIVO.valor = 'la tienda publica el artículo sin precio: dice consultar';
    return null;
  }
  if (!/^Papel tapiz/i.test(a.cat1)) {
    MOTIVO.valor = 'espejo decorativo a medida; el catálogo no tiene esa partida';
    return null;
  }

  /* El área sale de la medida del rollo que publica la ficha, producto por
     producto: no todos son el rollo estándar —hay de 68.58 cm de ancho y de
     11.20 m de largo— y usar un valor típico para todos habría errado hasta
     un 11% en una partida donde el metro es la unidad. */
  const d = REV.area(a);
  if (!d) { MOTIVO.valor = 'la ficha no declara la medida del rollo'; return null; }

  const spec = REV.item('papel-tapiz', {});
  if (!spec) return null;
  spec.factorUnidad = {
    veces: 1 / d.area_m2,
    nota: 'La tienda cobra por rollo y su ficha declara ' + (a.medida || '').trim() +
          ', o sea ' + d.area_m2 + ' m² por rollo; aquí va el precio del m²'
  };
  return spec;
}

module.exports = { regla, MOTIVO };
