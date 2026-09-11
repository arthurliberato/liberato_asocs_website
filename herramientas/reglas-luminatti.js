'use strict';
/* =========================================================
   reglas-luminatti.js — el catálogo de luminatti.com

   140 lámparas de diseño importadas, todas de Vigo Lighting
   Group, con precios en DÓLARES: de US$ 77 a US$ 3,160, mediana
   US$ 399. Es el extremo alto de la iluminación decorativa y
   por eso vale tenerlo: sin él, la partida terminaba en lo que
   cuesta una lámpara en el mercado local y no decía nada de lo
   que cuesta una de interiorismo.

   TODO ES DECORATIVO Y NO HAY MÁS EJE QUE EL MONTAJE
   --------------------------------------------------
   Los nombres vienen en inglés y traen medidas y zócalos
   —«Black Pendant with 4 Fume Globes 4xE27-G»— pero eso no
   convierte la lámpara en una especificación: sigue siendo una
   pieza que se elige por cómo se ve. Vale lo mismo aquí que en
   Mundo LED, y el módulo de especificación lo explica con los
   números.

   EL COLGANTE ES UNA LÁMPARA DE TECHO
   -----------------------------------
   Esta tienda dice «Pendant» donde la otra dice «lámpara de
   techo». Si cada una se quedara con su palabra, las dos nunca
   compartirían un ítem, y comparar el mercado local contra el
   importado de diseño es justamente lo que hace útil esta
   fuente: en la partida de techo entran los dos.

   LA MONEDA ES UN DATO, NO UN SUPUESTO
   ------------------------------------
   La tienda publica en dólares y así se registra. El peso lo
   pone la tasa del catálogo, en un solo sitio, y la nota de
   cada cotización dice cuál y de cuándo.
   ========================================================= */

const ILUM = require('./especificacion-iluminacion.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

const MONTAJE = {
  'Lámpara colgante': 'techo',
  'Lámpara de techo': 'techo',
  'Luminaria de superficie': 'techo',
  'Lámpara de pared (aplique)': 'pared',
  'Lámpara de mesa': 'mesa',
  'Lámpara de piso': 'pie'
};

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) { MOTIVO.valor = 'la ficha no publica un precio utilizable'; return null; }
  /* Una lámpara agotada no se puede comprar, y su precio moviendo la mediana
     de la partida es una referencia que no existe. */
  if (/agotado/i.test(a.disponibilidad)) { MOTIVO.valor = 'artículo agotado en la tienda'; return null; }

  const t = baja(a.nombre);
  if (/\bset of \d+|\bpack of \d+|\bx\s?\d+\s*pcs\b/.test(t)) {
    MOTIVO.valor = 'el precio cubre un juego de varias lámparas, no una';
    return null;
  }

  const m = MONTAJE[a.cat1];
  if (!m) { MOTIVO.valor = 'la ficha no dice cómo se monta la lámpara'; return null; }
  return ILUM.item('lampara-decorativa', { montaje: m });
}

module.exports = { regla, MOTIVO, MONTAJE };
