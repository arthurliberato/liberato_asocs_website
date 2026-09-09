'use strict';
/* =========================================================
   especificacion-madera.js — el ítem es la especificación

   En la madera la especificación es la escuadría y el largo, y
   una tercera cosa que el catálogo no tenía declarada: si la
   pieza va **bruta o cepillada**. Son dos productos con dos
   precios, y en el mismo comercio el 2x4x12 bruto sale a
   RD$ 860 y el cepillado a RD$ 635 — al revés de lo que uno
   esperaría, que es justo por qué hay que declararlo en vez de
   suponerlo.

   En los paneles la especificación es el material, el espesor y
   el formato de la hoja. Todo lo demás —la marca, el origen del
   pino— es de la cotización.
   ========================================================= */

const FAMILIAS = {
  'madera-pieza': {
    cat: 'MAT-06', unidad: 'unidad', etapa: 'estructura', orden: 10,
    ejes: ['especie', 'escuadria', 'largo_pies', 'acabado'],
    nombre: m => 'Madera de ' + m.especie + ' ' + m.acabado + ', ' + m.escuadria +
                 ' x ' + m.largo_pies + ' pies',
    esp: m => 'Pieza de ' + m.escuadria + ' en ' + m.largo_pies + ' pies, ' + m.acabado,
    alias: 'madera, pino, cuartón, tabla, alfarda, encofrado'
  },

  panel: {
    cat: 'MAT-06', unidad: 'plancha', etapa: 'estructura', orden: 20,
    ejes: ['material', 'espesor', 'formato'],
    nombre: m => m.material + ' ' + m.espesor + ', ' + m.formato,
    esp: m => 'Hoja de ' + m.formato + ' y ' + m.espesor + ' de espesor',
    alias: 'plywood, panel, hoja, formaleta, MDF'
  }
};

const limpia = s => (s === 0 ? '0' : String(s === undefined || s === null ? '' : s).trim());

function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia de madera desconocida: ' + familia);
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

/* Especificaciones que el catálogo ya tenía escritas a mano. */
const YA_EXISTE = {
  /* «Cuartón de pino 2x4x12» es, en la obra, la pieza bruta: la cepillada se
     pide por su nombre. La ficha nuestra no lo decía y ahora lo dice el
     comercio. */
  'madera-pieza-especie-pino-americano-escuadria-2pulg-x-4pulg-largo-pies-12-acabado-bruta': 'MAT-06-002',
  'panel-material-plywood-de-pino-espesor-1-2pulg-formato-4-x-8-pies': 'MAT-06-005',
  'panel-material-plywood-de-pino-espesor-3-4pulg-formato-4-x-8-pies': 'MAT-06-006'
};

module.exports = { FAMILIAS, item, YA_EXISTE };
