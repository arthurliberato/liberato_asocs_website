'use strict';
/* =========================================================
   especificacion-revestimiento.js — lo que se le pone a la pared

   El catálogo tenía «revestimientos decorativos» entre los
   rubros de interiorismo medidos con cero ítems. Esto lo llena:
   el panel de PVC, la plancha de bambú y de ónix, el papel
   tapiz, la piedra flexible, el mosaico decorativo, la pieza 3D
   de cuero y la malla de ratán.

   TODO VA POR METRO CUADRADO
   --------------------------
   Es la unidad en la que se cubica una pared, y es la única en
   la que estas cosas se pueden comparar entre sí. Las tiendas
   los venden como salen de fábrica —el panel por tablilla, el
   papel por rollo, el mosaico por pieza— y cada formato cubre
   una superficie distinta: una tablilla de PVC de 14 cm por 2.9
   m cubre 0.41 m² y un rollo de papel tapiz de 0.53 por 10 m
   cubre 5.3. Sin llevarlos al metro, el precio de uno y otro no
   se pueden ni mirar juntos.

   La conversión no es nuestra: sale de las medidas que la
   propia tienda publica, y la nota de cada cotización dice cuál
   era el precio de la pieza y cuántas piezas hacen el metro.

   EL ESPESOR SÍ ES DEL ÍTEM, EL COLOR NO
   --------------------------------------
   Un panel de PVC de 10 mm y otro de 24 mm son dos productos
   con dos precios; los ciento y pico de colores del mismo panel
   son uno solo. Es la misma regla que ya rige en la baldosa y
   en la pintura: lo que cambia el precio entra en la clave, lo
   que cambia el gusto va en la cotización.
   ========================================================= */

const FAMILIAS = {
  'panel-pared': {
    cat: 'MAT-34', unidad: 'm²', etapa: 'terminacion', orden: 10,
    ejes: ['material', 'espesor_mm'],
    nombre: m => 'Panel de pared de ' + m.material + ', ' + m.espesor_mm + ' mm',
    esp: '',
    alias: 'panel decorativo, panel de pared, lambrín, tablilla, WPC'
  },
  'plancha-decorativa': {
    cat: 'MAT-34', unidad: 'm²', etapa: 'terminacion', orden: 20,
    ejes: ['material', 'espesor_mm'],
    nombre: m => 'Plancha decorativa de ' + m.material + ', ' + m.espesor_mm + ' mm',
    esp: 'Formato de 1.22 m de ancho',
    alias: 'plancha, lámina decorativa, panel liso, mármol PVC, ónix'
  },
  'papel-tapiz': {
    cat: 'MAT-34', unidad: 'm²', etapa: 'terminacion', orden: 30,
    ejes: ['material'],
    nombre: m => 'Papel tapiz de ' + m.material,
    esp: 'Rollo de 0.53 x 10 m',
    alias: 'papel tapiz, wallpaper, empapelado'
  },
  'revestimiento-flexible': {
    cat: 'MAT-34', unidad: 'm²', etapa: 'terminacion', orden: 40,
    ejes: ['uso'],
    nombre: m => 'Revestimiento flexible de piedra, de ' + m.uso,
    esp: 'Lámina flexible que sigue la curva del muro',
    alias: 'flexistone, piedra flexible, revestimiento flexible'
  },
  'mosaico-decorativo': {
    cat: 'MAT-34', unidad: 'm²', etapa: 'terminacion', orden: 50,
    ejes: ['material'],
    nombre: m => 'Mosaico decorativo de ' + m.material,
    esp: '',
    alias: 'mosaico decorativo, malla de mármol, mosaico de madera'
  },
  'pieza-3d': {
    cat: 'MAT-34', unidad: 'm²', etapa: 'terminacion', orden: 60,
    ejes: ['material'],
    nombre: m => 'Pieza 3D de pared de ' + m.material,
    esp: '',
    alias: 'pieza 3D, panel 3D, relieve de pared, cuero'
  },
  'malla-decorativa': {
    cat: 'MAT-34', unidad: 'm²', etapa: 'terminacion', orden: 70,
    ejes: ['material'],
    nombre: m => 'Malla decorativa de ' + m.material,
    esp: '',
    alias: 'malla de ratán, rejilla decorativa, cannage'
  },
  tirador: {
    cat: 'MAT-34', unidad: 'unidad', etapa: 'terminacion', orden: 80,
    ejes: [],
    nombre: 'Tirador para mueble',
    /* Sin ejes a propósito: la tienda publica sesenta y dos y ninguno declara
       más que su modelo. Se compra por diseño, como la lámpara, y el rango es
       la respuesta. */
    esp: 'Se presupuesta por rango: la pieza se elige por diseño',
    alias: 'tirador, haladera, manija de mueble, herraje de cocina'
  }
};

const limpia = s => (s === 0 ? '0' : String(s === undefined || s === null ? '' : s).trim());

function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia de revestimiento desconocida: ' + familia);
  medidas = medidas || {};
  const claves = [familia];
  for (let i = 0; i < f.ejes.length; i++) {
    const v = limpia(medidas[f.ejes[i]]);
    if (!v) return null;
    claves.push(f.ejes[i] + '-' + v);
  }
  return {
    cat: f.cat,
    familia: familia,
    clave: claves.join('-').toLowerCase()
             .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
             .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
             .replace(/"/g, 'pulg').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    orden: f.orden,
    nombre: typeof f.nombre === 'function' ? f.nombre(medidas) : f.nombre,
    unidad: f.unidad,
    esp: typeof f.esp === 'function' ? f.esp(medidas) : (f.esp || ''),
    etapa: f.etapa,
    origen: 'importado',
    alias: f.alias,
    medidas: medidas
  };
}

/* Lee las medidas tal como las escribe la tienda, en todos los formatos en
   que las escribe:

     «14CM X 10MM X 2.9M»            «1.22M ANCHO X 8MM X 2.9M ALTO»
     «0.53 m de ancho x 10 m largo»  «60CM ANCHO x 1.20M ALTO»
     «30 cm x 30 cm»                 «23.2CM X 2CM X 20CM»

   La regla que las resuelve todas es una sola: de los números que trae, las
   DOS MAYORES son el ancho y el largo —la superficie— y el menor, cuando
   hay tres, es el espesor. Funciona igual si el espesor viene en milímetros
   que si viene en centímetros, que es donde fallaría cualquier regla que
   dependiera de la unidad en vez del tamaño. */
const A_METRO = { m: 1, cm: 0.01, mm: 0.001 };

function dimensiones(texto) {
  const t = String(texto || '');
  const re = /(\d+(?:[.,]\d+)?)\s*(mm|cm|m)\b/gi;
  const v = [];
  let m;
  while ((m = re.exec(t)) !== null) {
    const n = parseFloat(m[1].replace(',', '.'));
    if (isFinite(n) && n > 0) v.push(n * A_METRO[m[2].toLowerCase()]);
  }
  if (v.length < 2) return null;
  const orden = v.slice().sort((a, b) => b - a);
  const area = orden[0] * orden[1];
  /* Ninguna pieza de estas mide más de treinta metros cuadrados ni menos de
     un centímetro cuadrado: fuera de ahí lo que se leyó no son medidas. */
  if (!(area > 0.0001 && area < 30)) return null;
  return {
    area_m2: Math.round(area * 10000) / 10000,
    espesor_mm: v.length >= 3 ? Math.round(orden[orden.length - 1] * 1000 * 10) / 10 : null
  };
}

module.exports = { FAMILIAS, item, dimensiones };
