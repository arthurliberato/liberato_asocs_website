'use strict';
/* =========================================================
   reglas-mundoled.js — el catálogo de mundoled.com.do

   1,558 artículos de una tienda dedicada solo a iluminación, y
   con eso el catálogo cubre por fin la partida que tenía vacía:
   de los siete rubros de interiorismo que se midieron sin un
   solo ítem, éste llena el más grande.

   DOS MITADES QUE NO SE COMPRAN IGUAL
   -----------------------------------
   952 de sus artículos son lámparas decorativas y el resto es
   material de instalación. Van por caminos distintos porque se
   eligen distinto, y el módulo de especificación explica por
   qué con los números delante: la decorativa no declara ejes
   —1% dice cuántas luces lleva, 20% la potencia— y se publica
   por rango; la funcional sí los declara y se compara pieza
   contra pieza.

   LA SECCIÓN ORIENTA, EL NOMBRE MANDA
   -----------------------------------
   Las secciones de la tienda son buenas pero no limpias, y
   creerles a ciegas costaría partidas enteras:

     «Ojo de buey» trae sobre todo bombillos dicroicos GU10,
     que son la bombilla que va DENTRO del ojo de buey.
     «Tubos LED» trae cajetines y bases, que son el aparato que
     sostiene el tubo, no el tubo.
     «Base ojos de buey» trae bases de yeso, que son otra cosa
     que la base metálica de empotrar.
     «Panel LED» trae bases de superficie para panel.

   En los cuatro casos la pieza que nombra la sección vale una
   fracción o un múltiplo de la que trae dentro. Así que la
   sección dice por dónde empezar a leer y el nombre decide.
   ========================================================= */

const ELEC = require('./especificacion-electricos.js');
const ILUM = require('./especificacion-iluminacion.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

const texto = a => baja(a.nombre + ' ' + a.cat2 + ' ' + a.info);

/* La potencia: primero la columna que la tienda llenó, si la llenó, y si no
   el nombre, que casi siempre la trae. */
function vatios(a) {
  const c = parseFloat(String(a.w || '').replace(',', '.'));
  if (isFinite(c) && c > 0) return c;
  const m = baja(a.nombre).match(/(\d+(?:\.\d+)?)\s*(?:w\b|watts?\b|vatios?\b)/);
  return m ? parseFloat(m[1]) : null;
}

/* =========================================================
   Secciones que no entran, con su motivo
   ========================================================= */

const FUERA = {
  'Lámparas LED de calle': 'luminaria de alumbrado público, no partida de una edificación',
  'Lámparas de piscina': 'equipo de piscina; el catálogo no tiene esa partida',
  'Jardin': 'iluminación de jardín; el catálogo no la compara todavía',
  'Ecosolar caribe': 'sistema solar completo, no una partida de iluminación',
  'Paneles PVC': 'revestimiento de cielo raso, no iluminación',
  'Bases de yeso': 'base de yeso para empotrar; el catálogo no tiene esa partida',
  'Rieles LED': 'riel de iluminación; el catálogo no tiene esa partida',
  'Empotrable de Piso / Escalera': 'empotrable de piso; el catálogo no tiene esa partida',
  'Accesorios LED': 'accesorio suelto de instalación, no una partida propia',
  'Decoración LED': 'artículo de decoración, no partida de obra',
  'Spotlight': 'un solo artículo suelto: no hay serie con qué compararlo',
  '': 'la tienda no lo clasifica y su ficha no basta para saber qué es'
};

/* =========================================================
   La decorativa: el montaje y nada más
   ========================================================= */

const MONTAJE = {
  'Lámparas de techo': 'techo',
  'Lámparas de pared': 'pared',
  'Apliques de pared': 'pared',
  'Lámparas de mesa': 'mesa',
  'Lámparas de pie': 'pie'
};

function reglaDecorativa(a) {
  const t = texto(a);
  /* El juego de tres lámparas es un precio por tres, y en una partida que se
     presupuesta por pieza eso corre la mediana hacia arriba sin que se vea. */
  if (/^juego de \d+|^set de \d+|\bx\s?\d+\s*(?:uds|unidades)\b/.test(t)) {
    MOTIVO.valor = 'el precio cubre un juego de varias lámparas, no una';
    return null;
  }
  /* Piezas sueltas de la lámpara, que la tienda mete en la misma sección. */
  if (/^pantalla|^tulipa|^globo\b|^repuesto|^cable |^florón|^floron|^base para|^soporte/.test(t)) {
    MOTIVO.valor = 'pieza suelta de la lámpara, no la lámpara';
    return null;
  }
  const m = MONTAJE[a.cat1];
  if (!m) { MOTIVO.valor = 'la ficha no dice cómo se monta la lámpara'; return null; }
  return ILUM.item('lampara-decorativa', { montaje: m });
}

/* =========================================================
   La funcional
   ========================================================= */

function reglaFuncional(a) {
  const t = texto(a);
  const w = vatios(a);

  /* Va primero: la sección «Ojo de buey» está llena de bombillos dicroicos,
     que son la bombilla de dentro y no el aparato. */
  if (/^bombillo|dicroic/.test(t)) {
    if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del bombillo'; return null; }
    if (!/\bled\b/.test(t)) { MOTIVO.valor = 'el catálogo compara bombillos LED'; return null; }
    return ELEC.item('bombillo', { tecnologia: 'led', potencia_w: w });
  }
  /* Y esto también: la base, el cajetín y el aro son el soporte, no la luz. */
  if (/^base |^cajetin|^caja para|^aro\b|^porta/.test(t)) {
    MOTIVO.valor = 'base o cajetín que sostiene la luminaria, no la luminaria';
    return null;
  }

  switch (a.cat1) {
    case 'Reflectores LED':
      if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del reflector'; return null; }
      return ELEC.item('reflector-led', { potencia_w: w });

    case 'Tubos LED':
      if (!/^tubo/.test(t)) { MOTIVO.valor = 'artículo de la sección de tubos que no es un tubo'; return null; }
      if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del tubo'; return null; }
      return ELEC.item('tubo-led', { potencia_w: w });

    case 'Panel LED': {
      if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del panel'; return null; }
      const montaje = /empotr/.test(t) ? 'empotrar' : /superficie|sobreponer|adosad/.test(t) ? 'sobreponer' : '';
      const forma = /redond|circular/.test(t) ? 'redondo'
                  : /cuadrad|\d+\s?x\s?\d+|603|600\*600/.test(t) ? 'cuadrado' : '';
      if (!montaje || !forma) { MOTIVO.valor = 'la ficha no declara el montaje o la forma del panel'; return null; }
      return ELEC.item('panel-led', { montaje: montaje, forma: forma, potencia_w: w });
    }

    case 'Ojo de buey': {
      if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del ojo de buey'; return null; }
      const tipo = /dirigible|orientable|ajustable/.test(t) ? 'dirigible' : 'fijo';
      return ILUM.item('ojo-de-buey', { tipo: tipo, potencia_w: w });
    }

    case 'Campanas LED':
      if (!w) { MOTIVO.valor = 'la ficha no declara la potencia de la campana'; return null; }
      return ILUM.item('campana-led', { potencia_w: w });

    case 'Power supply':
      if (!w) { MOTIVO.valor = 'la ficha no declara la potencia de la fuente'; return null; }
      return ILUM.item('fuente-led', { potencia_w: w });

    case 'Cintas LED': {
      /* El rollo es lo que define el precio y la tienda lo declara casi
         siempre: «5M», «rollo de 5 metros». Sin él, dos cintas iguales
         parecen costar cuatro veces distinto. */
      const m = baja(a.nombre).match(/(\d+(?:\.\d+)?)\s*m\b(?!m)/) ||
                baja(a.nombre).match(/rollo de\s*(\d+(?:\.\d+)?)/);
      if (!m) { MOTIVO.valor = 'la ficha no declara los metros del rollo'; return null; }
      const tipo = /neon|flex/.test(t) ? 'neón' : /rgb|multicolor/.test(t) ? 'RGB' : 'blanca';
      return ILUM.item('cinta-led', { tipo: tipo, metros: parseFloat(m[1]) });
    }

    case 'Perfiles de Aluminio LED': {
      /* «PERFIL 2500*91*35MM»: el primer número es el largo en milímetros. */
      const m = baja(a.nombre).match(/(\d{3,4})\s*[*x]\s*\d/);
      if (!m) { MOTIVO.valor = 'la ficha no declara el largo del perfil'; return null; }
      const largo = Math.round(parseInt(m[1], 10) / 100) / 10;
      if (!(largo >= 0.5 && largo <= 6)) { MOTIVO.valor = 'el largo leído no es de un perfil'; return null; }
      const montaje = /esquiner/.test(t) ? 'esquinero' : /empotr|piso/.test(t) ? 'empotrar' : 'superficie';
      return ILUM.item('perfil-led', { montaje: montaje, largo_m: largo });
    }
  }
  MOTIVO.valor = 'artículo de iluminación que la ficha no describe lo bastante';
  return null;
}

/* =========================================================
   El despachador
   ========================================================= */

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) { MOTIVO.valor = 'la ficha no publica un precio utilizable'; return null; }
  /* Agotado no es lo mismo que sin precio: el precio publicado sigue siendo
     la referencia del comercio, pero un artículo que no se puede comprar no
     debería mover la mediana de una partida. */
  if (/agotado/i.test(a.disponibilidad)) { MOTIVO.valor = 'artículo agotado en la tienda'; return null; }

  if (FUERA[a.cat1] !== undefined) { MOTIVO.valor = FUERA[a.cat1]; return null; }
  if (MONTAJE[a.cat1]) return reglaDecorativa(a);
  return reglaFuncional(a);
}

module.exports = { regla, MOTIVO, FUERA, MONTAJE };
