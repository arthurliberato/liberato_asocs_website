'use strict';
/* =========================================================
   reglas-hogardeco.js — el catálogo de hogardeco.com.do

   608 productos de una tienda de revestimientos decorativos, y
   con ella caen dos de los siete rubros de interiorismo que se
   habían medido con cero ítems: los revestimientos decorativos
   y el piso vinílico.

   LO QUE LA HACE UTILIZABLE ES LA COLUMNA DE MEDIDAS
   --------------------------------------------------
   Casi todo lo que vende se publica como sale de fábrica —el
   panel por tablilla, el papel por rollo, el mosaico por
   pieza— y con su medida al lado: «14CM X 10MM X 2.9M», «0.53 m
   de ancho x 10 m de largo», «30 cm x 30 cm». Con eso la pieza
   se convierte en metro cuadrado, que es como se cubica una
   pared, y el panel de RD$ 550 y el rollo de RD$ 1,850 se
   pueden por fin mirar juntos.

   La conversión no es nuestra: la hace la medida que publica la
   tienda, y la nota de cada cotización deja dicho cuál era el
   precio de la pieza.

   LO QUE NO ENTRA
   ---------------
   Las velas y los difusores aromáticos, que son decoración y no
   obra. Los bloques de cristal, porque su columna de medidas
   trae basura —dice «y Precio»— y sin medida no hay metro. Y
   los nueve artículos cuyo precio «varía por medida», que la
   propia extracción marca: de esos, los que traen su tabla de
   variantes entran por ahí y el resto no entra.
   ========================================================= */

const REV = require('./especificacion-revestimiento.js');
const BALDOSAS = require('./especificacion-baldosas.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

const texto = a => baja(a.nombre + ' ' + a.cat1 + ' ' + a.cat2 + ' ' + a.material);

/* Categorías enteras que no son partida de obra. */
const FUERA = {
  'Aromatización del Hogar': 'vela o difusor aromático: decoración, no partida de obra',
  Pegamentos: 'pegamento de instalación; el catálogo no lo compara todavía como partida propia',
  Accesorios: 'accesorio de terminación cuyo precio la tienda no publica por pieza'
};

/* El material, que es lo que separa una plancha de otra. Sale del nombre y
   de la columna que la tienda a veces llena. */
function material(t) {
  if (/bambu/.test(t)) return 'bambú';
  if (/onix|ónix/.test(t)) return 'ónix';
  if (/marmol/.test(t)) return 'mármol';
  if (/\bwpc\b/.test(t)) return 'WPC';
  if (/\bspc\b/.test(t)) return 'SPC';
  if (/\bpu\b|poliuretano/.test(t)) return 'poliuretano';
  if (/cuero/.test(t)) return 'cuero';
  if (/ratan|rattan/.test(t)) return 'ratán';
  if (/madera maciza|madera/.test(t)) return 'madera';
  if (/piedra/.test(t)) return 'piedra';
  if (/vinilo|\bpvc\b/.test(t)) return 'PVC';
  return '';
}

/* Convierte el precio de la pieza en precio del metro cuadrado, y deja dicho
   de dónde salió la cuenta. */
function porMetro(a, d, queEs) {
  return {
    veces: 1 / d.area_m2,
    nota: 'La tienda cobra por ' + queEs + ' y, según ' + d.fuente + ', cada una cubre ' +
          d.area_m2 + ' m²; aquí va el precio del m²'
  };
}

function conMetro(spec, a, d, queEs) {
  if (!spec) return null;
  spec.factorUnidad = porMetro(a, d, queEs);
  return spec;
}

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) { MOTIVO.valor = 'la ficha no publica un precio utilizable'; return null; }
  if (/sin existencia|agotado/i.test(a.disponibilidad)) {
    MOTIVO.valor = 'artículo sin existencias en la tienda'; return null;
  }
  if (FUERA[a.cat1]) { MOTIVO.valor = FUERA[a.cat1]; return null; }

  const t = texto(a);
  const sub = a.cat2 || a.cat1;

  /* Los accesorios de instalación que se cuelan en las mismas secciones: el
     soporte metálico de RD$ 15 no es un panel de RD$ 690. */
  if (/^soporte|^perfil de remate|^limpiador|^alfombra protectora|^kit de|^tornillo/.test(baja(a.nombre))) {
    MOTIVO.valor = 'accesorio o consumible de instalación, no el revestimiento';
    return null;
  }

  /* Lo que cubre la pieza: primero lo que la tienda declara, y si no, sus medidas. */
  const d = REV.area(a);

  /* ---- Pisos: van a la familia de piso vinílico, que ya existe ---- */
  if (a.cat1 === 'Pisos') {
    if (!d) { MOTIVO.valor = 'la ficha no declara las medidas de la tabla'; return null; }
    if (!d.espesor_mm) { MOTIVO.valor = 'la ficha no declara el espesor del piso'; return null; }
    const uso = /exterior/.test(t) ? 'exterior' : 'interior';
    return conMetro(BALDOSAS.item('piso-vinilico', { uso: uso, espesor_mm: d.espesor_mm }),
                    a, d, 'tabla');
  }

  /* ---- Tiradores: sin ejes, como la lámpara decorativa ---- */
  if (a.cat1 === 'Tiradores') return REV.item('tirador', {});

  /* ---- Todo lo demás es superficie y necesita su medida ---- */
  if (!d) { MOTIVO.valor = 'la ficha no declara las medidas de la pieza, y sin ellas no hay metro cuadrado'; return null; }
  const mat = material(t);

  if (a.cat1 === 'Papel Tapiz') {
    return conMetro(REV.item('papel-tapiz', {}), a, d, 'rollo');
  }
  if (a.cat1 === 'Flexistone') {
    return conMetro(REV.item('revestimiento-flexible',
      { uso: /exterior/.test(t) ? 'exterior' : 'interior' }), a, d, 'lámina');
  }
  if (a.cat1 === 'Mosaicos') {
    if (!mat) { MOTIVO.valor = 'la ficha no declara de qué material es el mosaico'; return null; }
    return conMetro(REV.item('mosaico-decorativo', { material: mat }), a, d, 'pieza');
  }
  if (a.cat1 === 'Piezas 3D de Cuero') {
    return conMetro(REV.item('pieza-3d', { material: mat || 'cuero' }), a, d, 'pieza');
  }
  if (a.cat1 === 'Mallas De Rattan') {
    return conMetro(REV.item('malla-decorativa', { material: mat || 'ratán' }), a, d, 'rollo');
  }
  if (a.cat1 === 'Rocas') {
    if (!d.espesor_mm) { MOTIVO.valor = 'la ficha no declara el espesor de la pieza'; return null; }
    return conMetro(REV.item('plancha-decorativa',
      { material: mat || 'poliuretano', espesor_mm: d.espesor_mm }), a, d, 'plancha');
  }
  if (a.cat1 === 'Planchas') {
    if (!d.espesor_mm) { MOTIVO.valor = 'la ficha no declara el espesor de la plancha'; return null; }
    if (!mat) { MOTIVO.valor = 'la ficha no declara de qué material es la plancha'; return null; }
    return conMetro(REV.item('plancha-decorativa', { material: mat, espesor_mm: d.espesor_mm }),
                    a, d, 'plancha');
  }
  if (/^Paneles/.test(a.cat1)) {
    if (!d.espesor_mm) { MOTIVO.valor = 'la ficha no declara el espesor del panel'; return null; }
    const m2 = /acustico/.test(t) ? 'PVC acústico' : (mat || 'PVC');
    return conMetro(REV.item('panel-pared', { material: m2, espesor_mm: d.espesor_mm }),
                    a, d, 'tablilla');
  }
  if (/Barrotes/i.test(a.cat1)) {
    MOTIVO.valor = 'barrote separador: se vende por pieza de un largo y el catálogo no tiene esa partida';
    return null;
  }
  if (a.cat1 === 'Bloques De Cristal') {
    MOTIVO.valor = 'la columna de medidas del bloque de cristal no trae una medida';
    return null;
  }
  if (a.cat1 === 'Molduras PVC') {
    MOTIVO.valor = 'moldura decorativa: se vende por tramo lineal y el catálogo no tiene esa partida';
    return null;
  }
  MOTIVO.valor = 'artículo de decoración que el catálogo no tiene como partida';
  return null;
}

module.exports = { regla, MOTIVO, FUERA };
