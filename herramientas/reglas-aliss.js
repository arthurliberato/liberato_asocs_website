'use strict';
/* =========================================================
   reglas-aliss.js — el catálogo de aliss.do

   Aliss es una cadena de hogar, no una casa de materiales, y eso
   decide casi todo lo que hay aquí abajo. De sus 388 artículos
   extraídos, 337 son maceteros y artículos de jardinería: no son
   partida de obra ni pieza que un diseñador especifique, y se
   quedan fuera enteros.

   LO QUE SÍ ENTRA
   ---------------
   Las 35 lámparas decorativas —de techo y de pared—. Entran por
   la misma puerta que las de Mundo LED y las de Luminatti: la
   lámpara decorativa es la única partida del catálogo que no se
   compara modelo a modelo, sino que se publica por rango, porque
   la pieza se elige por diseño. Ver especificacion-iluminacion.js,
   que lo explica con los números delante.

   Y por eso mismo Aliss vale: es el extremo barato de esa gama
   —una lámpara de techo suya cuesta RD$ 1,800 y una de Luminatti
   US$ 3,160— y sin él la referencia de la partida sale corrida
   hacia arriba. El rango es el dato; los dos extremos lo forman.

   LO QUE NO ENTRA Y POR QUÉ
   -------------------------
   - Jardinería y maceteros (337). Ver arriba.
   - Iluminación exterior (12): lámparas solares de estaca de
     RD$ 94, guirnaldas, antorchas de aceite y linternas colgantes.
     Es iluminación de temporada, no una luminaria de paisajismo
     que alguien especifique con su potencia y su montaje.
   - Espejos de baño (4): son espejos de sobremesa con base, de
     RD$ 475, y el ítem «Espejo de baño» del catálogo son espejos
     de pared de RD$ 2,690 en adelante. Meterlos ahí es meter dos
     cosas distintas en la misma partida; el auditor lo cazaría, y
     con razón. Uno de los cuatro es, además, un organizador de
     plástico que lleva un espejo pegado.
   - Las pantallas sueltas. Una pantalla no es una lámpara, igual
     que un tulipa no lo es en Mundo LED.
   ========================================================= */

const ILUM = require('./especificacion-iluminacion.js');

const MOTIVO = { valor: '' };

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();
const baja = s => limpia(s).toLowerCase()
  .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i')
  .replace(/[óò]/g, 'o').replace(/[úù]/g, 'u').replace(/ñ/g, 'n');

/* La sección orienta; el nombre manda. «Lámparas de techo» trae una
   lámpara de mesa mal archivada y dos pantallas sueltas. */
const MONTAJE = {
  'Lámparas de Techo': 'techo',
  'Lámparas de Pared': 'pared'
};

function regla(a) {
  MOTIVO.valor = '';
  const cat = limpia(a.cat1);
  const n = baja(a.nombre);

  if (cat === 'Césped y Jardín') {
    MOTIVO.valor = 'macetero o artículo de jardinería, no partida de obra';
    return null;
  }
  if (cat === 'Iluminación Exterior') {
    MOTIVO.valor = 'iluminación de temporada —solar de estaca, guirnalda, antorcha—, no luminaria de paisajismo';
    return null;
  }
  if (cat === 'Espejos de Baño') {
    MOTIVO.valor = 'espejo de sobremesa con base, no espejo de baño de pared';
    return null;
  }

  const m = MONTAJE[cat];
  if (!m) return undefined;          // sección sin regla: ni se cuenta

  /* Una pantalla, una tulipa o un florón son piezas de la lámpara, no la
     lámpara. Mismo criterio que en Mundo LED. */
  if (/^pantalla|^tulipa|^globo\b|^floron|^repuesto/.test(n)) {
    MOTIVO.valor = 'pieza suelta de la lámpara, no la lámpara';
    return null;
  }
  /* El nombre corrige a la sección cuando se contradicen: una «Lámpara
     Mesa Con Pantalla De Yute» archivada en techo es de mesa. */
  const montaje = /\blampara\s+(?:de\s+)?mesa\b/.test(n) ? 'mesa'
                : /\blampara\s+(?:de\s+)?pie\b/.test(n) ? 'pie'
                : m;

  return ILUM.item('lampara-decorativa', { montaje: montaje });
}

module.exports = { regla, MOTIVO };
