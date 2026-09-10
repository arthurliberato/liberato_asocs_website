'use strict';
/* =========================================================
   especificacion-pintura.js — la pintura como partida de obra

   MAT-12 tenía un solo ítem: un estuco. La pintura es de las
   partidas que más se preguntan y no había con qué comparar.

   QUÉ DEFINE UNA PINTURA
   ----------------------
   Dos cosas, y son las dos que un presupuesto escribe:

     tipo      acrílica, esmalte, anticorrosivo, epóxica,
               de tráfico, impermeabilizante, primer, masilla
     envase    el galón, la cubeta de cinco, la funda de 40
               libras: el precio por galón cambia con el
               envase, así que mezclarlos en un mismo ítem
               daría una mediana sin sentido. Va como texto y
               no como número porque no toda la pintura se
               vende por volumen: los impermeabilizantes en
               polvo y algunas masillas se venden por peso.

   Y una que NO: el color. Es de la cotización, igual que en la
   baldosa. Una tienda publica cuarenta colores del mismo
   producto al mismo precio.

   EL ACABADO NO ENTRA EN LA CLAVE
   -------------------------------
   Mate, satinado y brillo son diferencias reales, pero de 236
   artículos 128 no lo declaran. Partir los ítems según si el
   comercio se acordó de escribirlo es la peor razón posible
   para partir un ítem —el mismo criterio que ya se aplicó al
   acabado de la baldosa—, así que va como medida y solo si
   todos los artículos del ítem coinciden. Con un solo comercio
   tampoco hay con qué medir si mueve el precio: cuando entre
   el segundo, se mide y se decide.
   ========================================================= */

const FAMILIAS = {
  pintura: {
    cat: 'MAT-12', unidad: 'envase', etapa: 'terminacion', orden: 10,
    ejes: ['tipo', 'envase'],
    nombre: m => (SUSTANTIVO[m.tipo] || 'Pintura ' + m.tipo) + ', ' + m.envase,
    alias: 'pintura, galón de pintura, cubeta, acrílica, esmalte, látex, anticorrosivo'
  },

  'herramienta-pintura': {
    cat: 'EQU-04', unidad: 'unidad', etapa: 'terminacion', orden: 60,
    ejes: ['tipo', 'medida_pulg'],
    nombre: m => ETIQUETA_HERRAMIENTA[m.tipo] + (m.medida_pulg ? ' de ' + m.medida_pulg + '"' : ''),
    alias: 'brocha, rodillo, mota, espátula, herramienta de pintura'
  }
};

/* Masilla, primer e impermeabilizante no son «pintura X»: son otra cosa que
   se compra en el mismo envase y en la misma partida. */
const SUSTANTIVO = {
  masilla: 'Masilla',
  'masilla para sheetrock': 'Masilla para sheetrock',
  'masilla para exterior': 'Masilla para exterior',
  primer: 'Primer sellador',
  impermeabilizante: 'Impermeabilizante'
};

const ETIQUETA_HERRAMIENTA = {
  brocha: 'Brocha',
  rodillo: 'Rodillo para pintar',
  espatula: 'Espátula',
  bandeja: 'Bandeja para pintar'
};

/* Cómo lo pide la obra: el galón y la cubeta tienen nombre propio. */
function envaseVolumen(g) {
  if (g === 5) return 'cubeta de 5 galones';
  if (g === 2.5) return '2.5 galones';
  if (g === 1) return 'galón';
  if (g === 0.66) return 'envase de 2.5 litros';
  if (g === 0.5) return 'medio galón';
  if (g === 0.25) return 'cuarto de galón';
  if (g === 0.2) return 'envase de 750 ml';
  if (g === 0.125) return 'octavo de galón';
  if (g === 0.0625) return 'envase de 8 onzas';
  return g + ' galones';
}

/* Los envases que el mercado dominicano usa. Un 1.06 gl (4 litros) es un
   galón para todos los efectos, y un 0.2 gl (750 ml) es un cuarto: se
   redondean al envase del mercado o el catálogo se llenaría de ítems que
   son el mismo. */
const ENVASES_GAL = [0.0625, 0.125, 0.2, 0.25, 0.5, 0.66, 1, 2.5, 5];
const TOLERANCIA_ENVASE = 0.12;

/* Si el envase no es uno de esos, no entra: un «0.73 galones» es una funda
   de 5 kg que la tienda convirtió a volumen, y no se compara con nada. */
function aEnvase(g) {
  if (!(g > 0)) return null;
  let mejor = null;
  ENVASES_GAL.forEach(e => {
    const err = Math.abs(e - g) / g;
    if (err <= TOLERANCIA_ENVASE && (!mejor || err < mejor.err)) mejor = { e: e, err: err };
  });
  return mejor ? envaseVolumen(mejor.e) : null;
}

/* Los que se venden por peso conservan su propia unidad: una funda de 40
   libras de impermeabilizante en polvo no es «0.73 galones» de nada. */
const PESOS_LB = [1, 2, 5, 10, 20, 25, 40, 50, 55, 80, 100];
function aEnvasePeso(lb) {
  if (!(lb > 0)) return null;
  let mejor = null;
  PESOS_LB.forEach(p => {
    const err = Math.abs(p - lb) / lb;
    if (err <= 0.06 && (!mejor || err < mejor.err)) mejor = { p: p, err: err };
  });
  const v = mejor ? mejor.p : Math.round(lb);
  return 'funda de ' + v + (v === 1 ? ' libra' : ' libras');
}

const limpia = s => String(s === 0 ? 0 : (s || '')).trim();

function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia de pintura desconocida: ' + familia);
  medidas = medidas || {};

  const claves = [familia];
  for (let i = 0; i < f.ejes.length; i++) {
    const v = limpia(medidas[f.ejes[i]]);
    /* Sin el eje no hay ítem: «pintura acrílica» sin decir el envase no
       sirve para presupuestar nada. */
    if (!v) return null;
    claves.push(f.ejes[i] + '-' + v);
  }

  return {
    cat: f.cat,
    familia: familia,
    clave: claves.join('-').toLowerCase()
             .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
             .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
             .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    orden: f.orden,
    nombre: f.nombre(medidas),
    unidad: f.unidad,
    esp: '',
    etapa: f.etapa,
    origen: 'importado',
    alias: f.alias,
    medidas: medidas
  };
}

module.exports = { FAMILIAS, item, aEnvase, aEnvasePeso, envaseVolumen, ENVASES_GAL };
