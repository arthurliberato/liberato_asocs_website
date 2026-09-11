'use strict';
/* =========================================================
   reglas-ilumel.js — el catálogo de ilumel.com y su outlet

   263 lámparas decorativas de una tienda de Santo Domingo, de
   RD$ 1,089 a RD$ 153,327. Es la segunda fuente de la partida
   después de Mundo LED, y la que le pone techo local: donde
   Mundo LED llega a RD$ 186,717, Ilumel sostiene la escalera
   entera por el medio.

   UNA TIENDA, DOS DOMINIOS
   ------------------------
   ilumeloutlet.com es la misma empresa. De sus 23 lámparas, 15
   tienen el mismo SKU y EL MISMO PRECIO que en la tienda
   principal: no son una segunda opinión sobre el precio, son el
   mismo dato publicado dos veces, y contarlas doble haría
   parecer que dos comercios coinciden cuando hay uno solo. La
   extracción se queda con las 8 que solo existen en el outlet y
   todo entra como un comercio: Ilumel.

   LOS NOMBRES NO DICEN NADA, Y ESTÁ BIEN
   --------------------------------------
   Ochenta y seis artículos se llaman «LAMPARA DE TECHO» y ya.
   Para el índice de precios da igual —la partida es «Lámpara
   decorativa de techo» y lo que importa es el precio— y para el
   explorador visual tampoco estorba: ahí quien informa es la
   foto. Lo único que se limpia son los asteriscos con que la
   tienda marca sus registros.
   ========================================================= */

const ILUM = require('./especificacion-iluminacion.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

const MONTAJE = {
  'Lámparas de Techo': 'techo',
  'Lámparas de Pared': 'pared',
  'Lámparas de Mesa': 'mesa',
  'Lámparas de Piso': 'pie'
};

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) { MOTIVO.valor = 'la ficha no publica un precio utilizable'; return null; }
  if (!/^s[ií]$/i.test(a.disponibilidad)) { MOTIVO.valor = 'artículo agotado en la tienda'; return null; }

  const t = baja(a.nombre + ' ' + a.cat1);

  if (/panel divisor|divisor de rejilla|biombo/.test(t)) {
    MOTIVO.valor = 'panel divisor decorativo: el catálogo no tiene esa partida';
    return null;
  }
  if (/^juego de \d+|^set de \d+/.test(baja(a.nombre))) {
    MOTIVO.valor = 'el precio cubre un juego de varias lámparas, no una';
    return null;
  }

  const m = MONTAJE[a.cat1];
  if (!m) { MOTIVO.valor = 'la ficha no dice cómo se monta la lámpara'; return null; }
  return ILUM.item('lampara-decorativa', { montaje: m });
}

module.exports = { regla, MOTIVO, MONTAJE };
