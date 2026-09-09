'use strict';
/* =========================================================
   especificacion-banos.js — el ítem es la especificación

   Una hoja de 8.5 x 11 es un solo ítem aunque la vendan cinco
   marcas. Lo mismo un inodoro de una pieza elongado: la marca y
   el modelo son de la cotización, no del ítem.

   Aquí vive la tabla canónica de los ítems de baño y la usan los
   dos comercios. Es lo que hace que el precio de Ochoa y el de
   InnovaCentro caigan en la misma fila: no se emparejan nombres
   de producto —eso ya lo probamos y falla—, sino que cada uno
   declara qué especificación tiene delante y la tabla decide el
   ítem.

   LAS MEDIDAS VAN POR SEPARADO
   ----------------------------
   Cada comercio publica lo que quiere: uno da las dimensiones
   del inodoro y otro solo los litros del tanque. Por eso las
   medidas se guardan una por columna en vez de en una frase.
   Las que forman parte de la identidad del ítem —la forma de un
   inodoro, el largo de una barra de seguridad— entran en la
   clave; las demás se registran y se acumulan de todos los
   artículos que caen en el ítem, de modo que la ficha termina
   sabiendo más que cualquiera de sus fuentes.
   ========================================================= */

/* Las familias. `ejes` son las medidas que forman parte de la identidad:
   dos artículos con distinto valor en un eje son ítems distintos. */
const FAMILIAS = {
  'inodoro-una-pieza': {
    cat: 'MAT-24', base: 'Inodoro de una pieza', unidad: 'unidad',
    ejes: ['forma'], etapa: 'instalaciones', orden: 10,
    alias: 'inodoro, taza de baño, wc, one piece',
    esp: 'Inodoro monobloque de cerámica, tanque y taza en una sola pieza'
  },
  'inodoro-tanque': {
    cat: 'MAT-24', base: 'Tanque para inodoro de dos piezas', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 20,
    alias: 'tanque de inodoro, cisterna',
    esp: 'Solo el tanque. La basineta se compra aparte y es la otra mitad del inodoro'
  },
  'inodoro-basineta': {
    cat: 'MAT-24', base: 'Basineta para inodoro de dos piezas', unidad: 'unidad',
    ejes: ['forma'], etapa: 'instalaciones', orden: 30,
    alias: 'basineta, taza, cuerpo del inodoro',
    esp: 'Solo la taza. El tanque se compra aparte y es la otra mitad del inodoro'
  },
  'inodoro-fluxometro': {
    cat: 'MAT-24', base: 'Taza para fluxómetro', unidad: 'unidad',
    ejes: ['forma'], etapa: 'instalaciones', orden: 40,
    alias: 'taza de fluxómetro, inodoro comercial',
    esp: 'Taza sin tanque, para válvula de descarga. Uso comercial e institucional'
  },
  'urinario': {
    cat: 'MAT-24', base: 'Urinario de porcelana', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 50,
    alias: 'orinal, mingitorio, urinario'
  },
  'bide': {
    cat: 'MAT-24', base: 'Bidé', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 60, alias: 'bidé, bidet'
  },
  'kit-instalacion-inodoro': {
    cat: 'MAT-24', base: 'Kit de instalación de inodoro', unidad: 'juego',
    ejes: [], etapa: 'instalaciones', orden: 70,
    alias: 'kit de instalación, cera y tornillos de inodoro',
    esp: 'Lo que el plomero compra por cada aparato que monta'
  },

  'lavamanos': {
    cat: 'MAT-25', base: 'Lavamanos', unidad: 'unidad',
    ejes: ['montaje'], etapa: 'instalaciones', orden: 10,
    alias: 'lavamanos, lavabo, lavatorio'
  },
  'pedestal': {
    cat: 'MAT-25', base: 'Pedestal para lavamanos', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 20,
    alias: 'pedestal, pie de lavamanos',
    esp: 'Se compra aparte del lavamanos: son dos partidas'
  },
  'palometa': {
    cat: 'MAT-25', base: 'Palometa para lavamanos', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 30,
    alias: 'palometa, soporte de lavamanos, escuadra'
  },
  'conector-desague': {
    cat: 'MAT-25', base: 'Conector de desagüe para lavamanos', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 40, alias: 'conector, yee de desagüe'
  },

  'mueble-bano': {
    cat: 'MAT-26', base: 'Mueble de baño', unidad: 'unidad',
    ejes: ['montaje'], etapa: 'terminacion', orden: 10,
    alias: 'mueble de baño, vanity, gabinete'
  },
  'botiquin': {
    cat: 'MAT-26', base: 'Botiquín de baño', unidad: 'unidad',
    ejes: ['luz'], etapa: 'terminacion', orden: 20,
    alias: 'botiquín, gabinete con espejo'
  },
  'espejo': {
    cat: 'MAT-26', base: 'Espejo de baño', unidad: 'unidad',
    ejes: ['luz'], etapa: 'terminacion', orden: 30, alias: 'espejo de baño'
  },
  'cabina-ducha': {
    cat: 'MAT-26', base: 'Cabina o panel de ducha', unidad: 'unidad',
    ejes: [], etapa: 'terminacion', orden: 40,
    alias: 'cabina de ducha, mampara, panel de ducha'
  },

  'barra-seguridad': {
    cat: 'MAT-27', base: 'Barra de seguridad', unidad: 'unidad',
    ejes: ['forma', 'largo_cm'], etapa: 'terminacion', orden: 10,
    alias: 'barra de seguridad, agarradera, accesibilidad',
    esp: 'Herraje de accesibilidad. Su anclaje va contra el muro, no contra la cerámica'
  },
  'juego-accesorios': {
    cat: 'MAT-27', base: 'Juego de accesorios de baño', unidad: 'juego',
    ejes: ['piezas'], etapa: 'terminacion', orden: 20,
    alias: 'juego de accesorios, kit de baño'
  },
  'secador-manos': {
    cat: 'MAT-27', base: 'Secador de manos', unidad: 'unidad',
    ejes: ['activacion'], etapa: 'terminacion', orden: 30,
    alias: 'secador de manos'
  },
  'dispensador-jabon': {
    cat: 'MAT-27', base: 'Dispensador de jabón', unidad: 'unidad',
    ejes: ['activacion'], etapa: 'terminacion', orden: 40,
    alias: 'dispensador de jabón, dosificador'
  },
  'dispensador-papel': {
    cat: 'MAT-27', base: 'Dispensador de papel', unidad: 'unidad',
    ejes: ['tipo_papel'], etapa: 'terminacion', orden: 50,
    alias: 'dispensador de papel, portarrollo comercial'
  },
  'cambiador-bebes': {
    cat: 'MAT-27', base: 'Cambiador de bebés de pared', unidad: 'unidad',
    ejes: [], etapa: 'terminacion', orden: 60,
    alias: 'cambiador de bebés, baño público'
  },

  'ducha-cabezal': {
    cat: 'MAT-09', base: 'Cabezal de ducha', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 10, alias: 'cabeza de ducha, regadera'
  },
  'ducha-telefono': {
    cat: 'MAT-09', base: 'Ducha teléfono', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 20, alias: 'ducha de mano, teléfono de ducha'
  },
  'ducha-columna': {
    cat: 'MAT-09', base: 'Columna de ducha', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 30, alias: 'columna de ducha, set de ducha'
  },
  'ducha-barra': {
    cat: 'MAT-09', base: 'Barra deslizable para ducha', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 40, alias: 'barra deslizable, riel de ducha'
  },
  'ducha-brazo': {
    cat: 'MAT-09', base: 'Brazo de ducha', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 50, alias: 'brazo de ducha, cuello de ducha'
  },
  'ducha-mezcladora': {
    cat: 'MAT-09', base: 'Mezcladora de ducha', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 60, alias: 'mezcladora, grifería de ducha'
  },
  'ducha-manguera': {
    cat: 'MAT-09', base: 'Manguera para ducha teléfono', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 70, alias: 'manguera de ducha, flexible'
  }
};

/* Cómo se lee cada eje en el nombre del ítem. */
const ETIQUETA = {
  forma:       v => v,
  montaje:     v => 'de ' + v,
  luz:         v => v === 'led' ? 'con luz LED' : '',
  piezas:      v => v + ' piezas',
  largo_cm:    v => v + ' cm',
  activacion:  v => v === 'sensor' ? 'con sensor' : v === 'boton' ? 'de botón' : '',
  tipo_papel:  v => 'de ' + v
};

const limpia = s => String(s || '').trim();

/* Construye el ítem. `medidas` trae todo lo que el comercio declaró; los
   ejes de la familia salen de ahí y entran en la clave, el resto queda
   registrado. */
function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia de baño desconocida: ' + familia);
  medidas = medidas || {};

  const partes = [];
  const claves = [familia];
  f.ejes.forEach(eje => {
    const v = limpia(medidas[eje]);
    if (!v) return;
    claves.push(eje + '-' + v);
    const t = ETIQUETA[eje] ? ETIQUETA[eje](v) : v;
    if (t) partes.push(t);
  });

  return {
    cat: f.cat,
    familia: familia,
    clave: claves.join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    orden: f.orden,
    nombre: f.base + (partes.length ? ', ' + partes.join(', ') : ''),
    unidad: f.unidad,
    esp: f.esp || '',
    etapa: f.etapa,
    origen: 'importado',
    alias: f.alias,
    medidas: medidas
  };
}

/* Redondeo de largos a los 5 cm, para que 90 cm y 36 pulgadas —que son
   91.4— sean la misma barra, que es lo que son en la obra. */
function aCm(valor, unidad) {
  let cm = null;
  if (unidad === 'pulg') cm = valor * 2.54;
  else if (unidad === 'mm') cm = valor / 10;
  else if (unidad === 'cm') cm = valor;
  if (cm === null || !isFinite(cm)) return null;
  return Math.round(cm / 5) * 5;
}

module.exports = { FAMILIAS, item, aCm };
