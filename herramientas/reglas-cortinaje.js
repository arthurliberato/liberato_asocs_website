'use strict';
/* =========================================================
   reglas-cortinaje.js — el catálogo de cortinaje.shop

   La tienda se llama Cortinaje pero lo que publica es papel
   tapiz de diseñador: Roberto Cavalli, Gianfranco Ferré, Dolce
   & Gabbana, Lamborghini, Elie Saab. Doscientos setenta y
   cuatro referencias en Santo Domingo, con precio en DÓLARES,
   de US$ 27 a US$ 250 el rollo.

   Vale por el techo del mercado. El papel tapiz que ya tenía el
   catálogo sale entre RD$ 310 y RD$ 390 el metro cuadrado, y
   quien presupuesta un interiorismo necesita saber que el otro
   extremo está cuatro veces más arriba.

   PERO SOLO ENTRAN CINCUENTA Y DOS
   -------------------------------
   El resto no declara el tamaño del rollo, y sin él no hay
   metro cuadrado. No es un detalle que se pueda suponer: el
   papel tapiz se vende en dos rollos estándar —el angosto de
   0.53 x 10 m, que cubre 5.3 m², y el ancho de 1.06 x 10.05,
   que cubre 10.6— y son exactamente el doble uno del otro. Un
   rollo de US$ 225 puede ser US$ 42 o US$ 21 el metro según
   cuál sea, y la ficha no lo dice ni en su columna ni en su
   descripción.

   Los cincuenta y dos que sí lo declaran son todos de la misma
   colección y al mismo precio, así que de aquí sale un solo
   punto de precio. Poco, pero cierto.
   ========================================================= */

const REV = require('./especificacion-revestimiento.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) { MOTIVO.valor = 'la ficha no publica un precio utilizable'; return null; }
  if (!/^s[ií]$/i.test(a.disponibilidad)) { MOTIVO.valor = 'artículo no disponible en la tienda'; return null; }

  if (a.cat1 === 'Panel') {
    MOTIVO.valor = 'panel mural a medida: la ficha no declara la superficie que cubre';
    return null;
  }
  if (!/papel tapiz/i.test(a.cat1)) {
    MOTIVO.valor = 'artículo que el catálogo no tiene como partida';
    return null;
  }

  const d = REV.area(a);
  if (!d) {
    MOTIVO.valor = 'la ficha no declara el tamaño del rollo, y el papel tapiz viene en dos estándares que se llevan el doble';
    return null;
  }
  const spec = REV.item('papel-tapiz', {});
  if (!spec) return null;
  spec.factorUnidad = {
    veces: 1 / d.area_m2,
    nota: 'La tienda cobra por rollo y, según ' + d.fuente + ', cada uno cubre ' +
          d.area_m2 + ' m²; aquí va el precio del m²'
  };
  return spec;
}

module.exports = { regla, MOTIVO };
