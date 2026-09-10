'use strict';
/* =========================================================
   reglas-tonos.js — el catálogo de tonosycolores.com

   Una tienda de pintura, y la primera del catálogo: MAT-12
   tenía un solo ítem —un estuco— y la pintura es de las
   partidas que más se preguntan.

   DOS COSAS QUE ESTA TIENDA DECLARA
   ---------------------------------
   Que sus precios **llevan ITBIS**, lo cual se registra como
   dato en vez de suponerse, y el envase de cada SKU en su
   propia columna («1 GL», «5 GL», «0.20 gl (750ml)»), que es
   justo lo que define la partida.

   Y UNA QUE HAY QUE MIRAR DE CERCA
   --------------------------------
   Los 236 SKU están «en oferta», con un descuento medio del
   27%. Cuando todo el catálogo está rebajado, el precio de
   oferta ES el precio de calle y el «regular» es el de lista;
   por eso se carga el vigente y la nota lo dice. No es el caso
   de una liquidación puntual —esas sí se dejan fuera, como las
   23 baldosas rebajadas de Ochoa—: aquí no hay un precio sin
   rebaja con el que comparar.
   ========================================================= */

const PINTURA = require('./especificacion-pintura.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

/* Categorías del sitio que no son material de obra. */
const FUERA = {
  'Limpieza domestica': 'producto de limpieza doméstica, no material de obra'
};

/* El envase, de su propia columna: «1 GL», «5 GL», «1/2 GL», «0.20 gl
   (750ml)», «Cubeta», «20kg». Los que vienen en peso no son pintura
   líquida y van por otro camino. */
function galones(a) {
  const p = String(a.presentacion || '');
  let m = p.match(/^\s*([\d.]+)\s*\/\s*([\d.]+)\s*gl/i);
  if (m) return PINTURA.aEnvase(parseFloat(m[1]) / parseFloat(m[2]));
  m = p.match(/^\s*([\d.]+)\s*gl/i);
  if (m) return PINTURA.aEnvase(parseFloat(m[1]));
  if (/cubeta/i.test(p)) return 5;
  m = p.match(/^\s*([\d.]+)\s*(?:oz|onz)/i);
  if (m) return PINTURA.aEnvase(parseFloat(m[1]) / 128);
  m = p.match(/^\s*([\d.]+)\s*ml/i);
  if (m) return PINTURA.aEnvase(parseFloat(m[1]) / 3785.41);
  return null;
}

/* El tipo, que es lo que separa las partidas: para qué sirve la pintura,
   no de qué marca es. */
function tipo(a) {
  const t = baja(a.nombre + ' ' + a.cat1 + ' ' + a.info);
  if (/sellador de techo|impermeabiliz|antihumedad|blockaid|siliconizer|urethanizer|masterflex|duraflex|roof/.test(t)) return 'impermeabilizante';
  if (/anticorr|oxiguard/.test(t)) return 'anticorrosiva';
  if (/trafico|senalizacion vial|pavimont/.test(t)) return 'de tráfico';
  if (/epoxi/.test(t)) return 'epóxica';
  /* Especialidades que no son la acrílica de pared: mezclarlas ahí abría el
     ítem de RD$ 374 a RD$ 6,836. */
  if (/piscina/.test(t)) return 'para piscina';
  if (/aislante termic|termoaislant/.test(t)) return 'aislante térmica';
  /* La masilla de sheetrock y la de fachada se compran en el mismo envase y
     valen tres veces distinto: son dos partidas. */
  if (/masilla|plasmont/.test(t)) {
    if (/sheetrock|drywall|yeso|wallboard|kementex/.test(t)) return 'masilla para sheetrock';
    if (/exterior|fachada|zentech/.test(t)) return 'masilla para exterior';
    return 'masilla';
  }
  if (/primer|emulsion fijadora|fijador/.test(t)) return 'primer';
  if (/esmalte/.test(t)) return 'esmalte';
  if (/chalk|tiza|pizarra|magnetica|efecto madera|estuco|cera/.test(t)) return null; // decorativa: ver abajo
  if (/acrilic|latex|montokril|monto nature|nevada|supra|uno zero|ovaldine|pintura|texturizada|aislante termico|piscina/.test(t)) return 'acrílica';
  return null;
}

const HERRAMIENTA = [
  [/^brocha/, 'brocha'],
  [/^rodillo|^mota/, 'rodillo'],
  [/^espatula/, 'espatula'],
  [/^bandeja/, 'bandeja']
];

function reglaHerramienta(a) {
  const t = baja(a.nombre);
  for (let i = 0; i < HERRAMIENTA.length; i++) {
    if (!HERRAMIENTA[i][0].test(t)) continue;
    /* La medida viene en el nombre, en pulgadas: «Brocha 2 1/2″». */
    const m = a.nombre.match(/(\d+(?:\s+\d+\/\d+)?|\d+\/\d+)\s*(?:″|"|pulg)/);
    if (!m) { MOTIVO.valor = 'la ficha no declara la medida de la herramienta'; return null; }
    return PINTURA.item('herramienta-pintura', {
      tipo: HERRAMIENTA[i][1],
      medida_pulg: m[1].trim()
    });
  }
  return undefined;
}

function regla(a) {
  MOTIVO.valor = '';
  if (FUERA[a.cat1]) { MOTIVO.valor = FUERA[a.cat1]; return null; }

  /* En este catálogo el sufijo «-3» del SKU es la cubeta de cinco galones
     (32 de 34 lo confirman). Cuando además la presentación dice un galón,
     la ficha se contradice a sí misma y el precio no se puede usar. */
  if (/-3$/.test(String(a.codigo)) && /^\s*1\s*gl\s*$/i.test(String(a.presentacion || ''))) {
    MOTIVO.valor = 'la ficha se contradice: el SKU es de cubeta y la presentación dice un galón';
    return null;
  }

  const h = reglaHerramienta(a);
  if (h !== undefined) return h;

  const t = baja(a.nombre);
  if (/^masking|^cinta|^lija|^guante|^tirro/.test(t)) {
    MOTIVO.valor = 'consumible de pintor que el catálogo no tiene como partida';
    return null;
  }
  if (/^cera|^estuco|chalk|tiza|pizarra|magnetica|efecto madera/.test(t)) {
    MOTIVO.valor = 'acabado decorativo de especialidad, no partida de obra corriente';
    return null;
  }

  const tp = tipo(a);
  if (!tp) { MOTIVO.valor = 'la ficha no dice qué tipo de pintura es'; return null; }
  const g = galones(a);
  if (!g) {
    MOTIVO.valor = String(a.presentacion || '').trim()
      ? 'el envase que declara no es uno de los que se compran por volumen'
      : 'la ficha no declara el envase, que es lo que define la partida';
    return null;
  }

  const medidas = { tipo: tp, galones: g };
  const acab = baja(a.acabado);
  if (/mate/.test(acab) && !/semi/.test(acab)) medidas.acabado = 'mate';
  else if (/satinad|semigloss|semi-mate|semi/.test(acab)) medidas.acabado = 'satinado';
  else if (/brillo|brillante/.test(acab)) medidas.acabado = 'brillante';
  return PINTURA.item('pintura', medidas);
}

module.exports = { regla, MOTIVO, FUERA };
