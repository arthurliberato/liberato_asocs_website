'use strict';
/* =========================================================
   reglas-carabela.js — el catálogo de carabela.do

   286 referencias del extremo alto del baño y la cocina:
   Ramón Soler, Noken, IB Rubinetterie, Salgar y Foster. Es la
   contraparte de arriba de partidas que hasta ahora se movían
   entre lo que venden las ferreterías: un lavamanos de RD$
   170,500 al lado del de RD$ 1,093, y las dos cosas son
   ciertas.

   SUS CATEGORÍAS NO SIRVEN PARA CLASIFICAR
   ----------------------------------------
   No por descuido, sino porque están hechas para navegar una
   tienda, no para presupuestar. «Muebles de baño» tiene dentro
   las patas y los tiradores del mueble —un juego de dos patas a
   RD$ 3,665 junto a un mueble de RD$ 110,800—; «Lavamanos» trae
   sobre todo grifería de lavabo, que es la llave y no el
   aparato; «Inodoros y bidets» trae los asientos sueltos; y en
   «Espejos» hay un aplique de pared, que es una lámpara.

   Así que la categoría orienta y el nombre decide, igual que en
   Mundo LED y en Bellón.

   LOS ELECTRODOMÉSTICOS NO ENTRAN
   -------------------------------
   Campanas, hornos, placas de cocción y zafacones son la mitad
   de su sección de cocina y el catálogo no tiene ese rubro. No
   es que no importen en un presupuesto de interiorismo —importan
   mucho, una placa de cocción son RD$ 229,745— es que abrir una
   partida de electrodomésticos con catorce artículos de un solo
   comercio daría una referencia que no compara con nada. Quedan
   anotados con su motivo, para cuando haya una segunda fuente.
   ========================================================= */

const BANOS = require('./especificacion-banos.js');
const PLOM = require('./especificacion-plomeria.js');
const ILUM = require('./especificacion-iluminacion.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

const texto = a => baja(a.nombre + ' ' + a.cat2 + ' ' + a.ref);

/* Las piezas del mueble y del aparato, que la tienda mezcla con el aparato
   mismo. Van primero: si «Juego de 2 tiradores UNIIQ» llega a la regla del
   mueble, abre la partida de RD$ 2,100 a RD$ 110,800. */
const PIEZA_SUELTA = /^(juego de \d+ (pata|tirador)|pata|patas|tirador|tiradores|asiento|tapa|kit de |cesta|repuesto|cartucho|aireador|valvula|desague|rejilla|sifon extensible)/;

/* Accesorios que se compran por diseño y de uno en uno. El catálogo compara
   juegos de accesorios, no la percha suelta; está decidido desde CerArte. */
const ACCESORIO = /^(colgador|percha|toallero|tallero|jabonera|portarrollo|porta rollo|porta ?papel|escobillero|papelera|dosificador|barra de toalla|repisa|gancho|vaso|dispensador|tapon)/;

const ELECTRODOMESTICO = {
  'Campanas extractoras': 'campana extractora: el catálogo no tiene partida de electrodomésticos',
  'Hornos': 'horno: el catálogo no tiene partida de electrodomésticos',
  'Placas de cocción / estufas': 'placa de cocción: el catálogo no tiene partida de electrodomésticos',
  'Zafacones': 'zafacón de cocina: el catálogo no tiene esa partida',
  'Accesorios de cocina': 'accesorio de cocina suelto: el catálogo no tiene esa partida'
};

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) { MOTIVO.valor = 'la ficha no publica un precio utilizable'; return null; }
  if (!/^s[ií]$/i.test(a.disponibilidad)) { MOTIVO.valor = 'artículo agotado en la tienda'; return null; }
  if (ELECTRODOMESTICO[a.cat2]) { MOTIVO.valor = ELECTRODOMESTICO[a.cat2]; return null; }

  const t = texto(a);
  const n = baja(a.nombre);

  if (PIEZA_SUELTA.test(n)) {
    MOTIVO.valor = 'pieza suelta del mueble o del aparato, no la partida completa';
    return null;
  }
  if (ACCESORIO.test(n)) {
    MOTIVO.valor = 'accesorio suelto de baño; el catálogo compara juegos, no piezas sueltas';
    return null;
  }

  /* El aplique que la tienda guarda entre los espejos es una lámpara de
     pared, y su partida existe: la de iluminación decorativa. */
  if (/^aplique/.test(n)) return ILUM.item('lampara-decorativa', { montaje: 'pared' });

  /* ---- Grifería ----
     Aquí la categoría de la tienda SÍ es el dato: «Grifería de baño» y
     «Grifería de cocina» dicen exactamente a qué aparato va, que es lo único
     que separa las dos partidas. El nombre solo se consulta para sacar la de
     ducha, que vive en la suya.

     Ojo con «Grifería a pared»: en un baño es el monomando de lavabo montado
     al muro, no una ducha. Leerlo como ducha metía cuarenta y cuatro llaves
     de lavabo —hasta RD$ 75,950— en la partida de la mezcladora de ducha. */
  if (/^griferia|^grifo|^mezclador|^monomando|^llave/.test(n)) {
    if (/ducha|regadera|termostat/.test(n)) return BANOS.item('ducha-mezcladora', {});
    if (/cocina|fregadero|lavaplatos/.test(t)) return BANOS.item('mezcladora', { uso: 'fregadero', activacion: 'manual' });
    if (/bano|lavabo|lavamanos|bide/.test(t)) return BANOS.item('mezcladora', { uso: 'bano', activacion: 'manual' });
    MOTIVO.valor = 'la ficha no dice a qué aparato va la grifería';
    return null;
  }

  /* ---- Ducha ---- */
  if (/^rociador|^regadera|cabezal de ducha/.test(n)) return BANOS.item('ducha-cabezal', {});
  if (/^brazo de ducha/.test(n)) return BANOS.item('ducha-brazo', {});
  /* La tienda la nombra de cuatro maneras —«Columna de Grifería Alexia»,
     «Columna Drako Ducha», «Columna Ducha Smart», «Columna Smart
     Termostática Ducha»— y todas son lo mismo. */
  if (/^columna/.test(n) && /ducha|griferia|termostat/.test(t)) return BANOS.item('ducha-columna', {});
  if (/^conjunto de ducha|^set de ducha/.test(n)) return BANOS.item('ducha-columna', {});
  if (/^ducha (telefono|de mano)|^teleducha/.test(n)) return BANOS.item('ducha-telefono', {});
  if (/^plato de ducha|^plato ducha/.test(n)) return BANOS.item('plato-ducha', {});

  /* ---- Aparatos ---- */
  if (/^inodoro|^sanitario/.test(n)) {
    if (/suspendid|colgad|a pared/.test(t)) return BANOS.item('inodoro-suspendido', {});
    if (/una pieza|monopieza|one piece/.test(t)) return BANOS.item('inodoro-una-pieza', {});
    if (/dos piezas|two piece/.test(t)) return BANOS.item('inodoro-dos-piezas', {});
    MOTIVO.valor = 'la ficha no dice si el inodoro es de una pieza, de dos o suspendido';
    return null;
  }
  if (/^bidet|^bide\b/.test(n)) return BANOS.item('bide', {});
  if (/^banera|^tina\b/.test(n)) return BANOS.item('banera', {});
  if (/^espejo/.test(n)) return BANOS.item('espejo', { luz: /led|luz/.test(t) ? 'led' : '' });
  if (/^botiquin/.test(n)) return BANOS.item('botiquin', {});

  if (/^lavabo|^lavamanos/.test(n)) {
    const m = /sobre ?encimera|sobremesa|sobre ?poner/.test(t) ? 'sobreponer'
            : /empotr|bajo ?encimera/.test(t) ? 'empotrar'
            : /pedestal/.test(t) ? 'pedestal'
            : /suspendid|a pared|colgad|mural/.test(t) ? 'pared'
            : /exento|libre/.test(t) ? 'exento' : '';
    if (!m) { MOTIVO.valor = 'la ficha no declara cómo se monta el lavamanos'; return null; }
    return BANOS.item('lavamanos', { montaje: m });
  }

  if (/^mueble|^conjunto .*mueble|^vanity/.test(n)) {
    return BANOS.item('mueble-bano', { montaje: /suspendid|a pared|colgad/.test(t) ? 'pared' : 'piso' });
  }

  /* ---- Cocina: lo que sí es partida de obra ---- */
  if (/^fregadero/.test(n)) {
    const pozos = /doble|2 (senos|pozos|cubetas)/.test(t) ? 2
                : /sencillo|1 (seno|pozo|cubeta)|un seno/.test(t) ? 1 : null;
    const m = (a.medida + ' ' + a.nombre).match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/);
    if (!pozos || !m) { MOTIVO.valor = 'la ficha no declara los pozos o la medida del fregadero'; return null; }
    const cm = v => Math.round(parseFloat(String(v).replace(',', '.')) / 2.54);
    return PLOM.item('fregadero', {
      pozos: pozos,
      medida: cm(Math.max(+m[1], +m[2])) + ' x ' + cm(Math.min(+m[1], +m[2])) + ' pulgadas'
    });
  }
  if (/^sifon/.test(n)) {
    const mat = /laton|metal|cromo|inox|bronce/.test(t) ? 'metal' : /pvc|plastic/.test(t) ? 'PVC' : '';
    if (!mat) { MOTIVO.valor = 'la ficha no declara el material del sifón'; return null; }
    MOTIVO.valor = 'la ficha no declara la medida del sifón';
    return null;
  }

  MOTIVO.valor = 'artículo que la ficha no describe lo bastante para una partida';
  return null;
}

module.exports = { regla, MOTIVO, ELECTRODOMESTICO };
