'use strict';
/* =========================================================
   especificacion-estructura.js — la varilla

   La partida que se pide en toda obra dominicana y que ningún
   módulo tenía todavía como especificación, porque los primeros
   comercios del directorio no la declaraban entera: publicaban
   «Varilla 1/2"» sin el largo, y una varilla sin largo no es un
   precio, es la mitad de un precio. El catálogo arrancó con
   cinco varillas escritas a mano, todas de 20 pies, porque era
   el único largo del que se tenía dato.

   El catálogo de Bellón sí la declara, y con la prueba encima:
   «Varilla Constr. 1/2" x 30' G60 20.04 Lb». Diámetro, largo,
   grado y peso. Con el peso se puede comprobar el precio en vez
   de creerlo —20.04 lb es el peso teórico de una #4 de 30
   pies— y por eso el peso va en la especificación visible
   aunque no forme parte de la clave.

   QUÉ DEFINE UNA VARILLA
   ----------------------
   Diámetro, largo y grado. El largo es la mitad que faltaba: la
   misma #4 se vende en 20, 25, 30, 35 y 40 pies y cada una es
   una partida, porque el precio va con el acero que trae. Y el
   grado no es adorno: la G40 de 4 mm y la G60 de 3/8" son dos
   aceros distintos con dos usos distintos.

   El zinc NO vive aquí aunque se pareciera: el catálogo ya lo
   tenía desde la extracción de Ochoa, con la plancha nombrada
   por sus dos medidas. Una segunda familia habría abierto una
   tabla de zinc al lado de la que ya existe.
   ========================================================= */

const FAMILIAS = {
  varilla: {
    cat: 'MAT-04', unidad: 'unidad', etapa: 'estructura', orden: 5,
    ejes: ['diametro', 'largo_pies', 'grado'],
    nombre: m => 'Varilla corrugada ' + m.diametro + ' x ' + m.largo_pies + ' pies',
    esp: m => 'Grado ' + m.grado + ' · ASTM A615' + (m.peso_lb ? ' · ' + m.peso_lb + ' lb por unidad' : ''),
    alias: 'varilla, acero de refuerzo, cabilla, corrugada'
  }
};

const limpia = s => (s === 0 ? '0' : String(s === undefined || s === null ? '' : s).trim());

function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia de estructura desconocida: ' + familia);
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
    alias: f.alias,
    medidas: medidas
  };
}

/* Lo que el catálogo ya tenía escrito a mano, para que la importación no
   cree un ítem duplicado al lado del que ya existe. */
const YA_EXISTE = {
  'varilla-diametro-3-8pulg-largo-pies-20-grado-60': 'MAT-04-001',
  'varilla-diametro-1-2pulg-largo-pies-20-grado-60': 'MAT-04-002',
  'varilla-diametro-3-4pulg-largo-pies-20-grado-60': 'MAT-04-004',
  'varilla-diametro-1pulg-largo-pies-20-grado-60': 'MAT-04-005'
};

module.exports = { FAMILIAS, item, YA_EXISTE };
