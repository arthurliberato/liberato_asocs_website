/* =========================================================
   Importador de extracciones de catálogo de proveedor

   Toma una extracción en JSON del catálogo publicado de un
   proveedor y produce dos cosas:

     1. Las cotizaciones listas para pegar en datos-precios.js
     2. Un informe de precios inverosímiles que NO deben cargarse

   VALIDACIÓN POR PESO
   -------------------
   Las fichas de acero declaran el peso de la pieza. Con eso se
   calcula el precio por libra de cada una y se compara con la
   mediana de su familia. El acero se vende por peso, así que dentro
   de una familia ese valor es casi constante: en los angulares de
   Ochoa da RD$ 35.00 por libra en ocho de nueve medidas.

   Una pieza que se sale más de un 35% de la mediana de su familia
   no se carga. En la extracción del 09/09/2026 eso descartó cuatro
   precios que estaban a RD$ 1.9 por libra, veinte veces por debajo
   de su familia: errores de la propia ficha del proveedor.

   USO
   ---
       node herramientas/importar-ochoa.js <extraccion.json>

   El mapeo de qué artículo del proveedor corresponde a qué ítem
   nuestro se declara abajo, a mano y por código. No se empareja de
   forma automática: los nombres del proveedor y los nuestros
   describen los productos de maneras distintas, y un emparejador
   por similitud confunde una funda de arena de 55 libras con un
   viaje de 16 metros cúbicos.
   ========================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

/* Artículo del proveedor → ítem de nuestro catálogo. Solo se
   declaran las correspondencias verificadas una por una. */
const MAPEO = {
  '04-59-0192': 'MAT-02-003',  // Cemento blanco Argos, funda 40 kilos
  '04-59-0391': 'MAT-02-003',  // Cemento blanco Perla del Sur, funda 40 kg
  '02-45-0011': 'MAT-04-021',  // Alambre liso galvanizado C-18
  '02-45-0010': 'MAT-04-022',  // Alambre liso galvanizado C-14
  '04-66-0230': 'MAT-04-008',  // Malla electrosoldada W2.3x2.3 100x100, rollo 2.40x40
  '04-66-0253': 'MAT-04-014',  // Malla electrosoldada W2.7x2.7 100x100, rollo 2.40x40
  '04-53-0015': 'MAT-04-023',  // Angular hierro negro 1 1/2 x 1/8
};

const PROVEEDOR = 'Ferretería Ochoa (8A)';
const FUENTE = 'Precio publicado en ochoa.com.do';
/* Familias donde el precio por libra no es constante por naturaleza:
   el color y la calidad mandan, no el peso. */
const SIN_VALIDAR = new Set(['cromo']);
const TOLERANCIA = 0.35;

function peso(nombre) {
  const m = /([\d.,]+)\s*Lbs?\b/i.exec(nombre || '');
  if (!m) return null;
  const v = parseFloat(m[1].replace(/,/g, ''));
  return v > 0 ? v : null;
}

function mediana(xs) {
  const v = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

function main() {
  const archivo = process.argv[2];
  if (!archivo) {
    console.error('Uso: node herramientas/importar-ochoa.js <extraccion.json>');
    process.exit(1);
  }
  const arts = JSON.parse(fs.readFileSync(archivo, 'utf8'))
    .filter((a) => typeof a.p === 'number' && a.p > 0);

  /* Precio por libra por familia, para detectar lo imposible. */
  const familias = {};
  arts.forEach((a) => {
    const w = peso(a.nombre);
    if (!w || SIN_VALIDAR.has(a.cat3)) return;
    (familias[a.cat3] = familias[a.cat3] || []).push({ a, w, u: a.p / w });
  });

  const descartados = [];
  Object.keys(familias).forEach((k) => {
    const v = familias[k];
    if (v.length < 4) return;
    const med = mediana(v.map((x) => x.u));
    v.forEach((x) => {
      if (Math.abs(x.u - med) / med <= TOLERANCIA) return;
      descartados.push({
        codigo: x.a.codigo, nombre: x.a.nombre, familia: k,
        precio: x.a.p, porLibra: x.u, medianaFamilia: med,
        esperado: Math.round(x.w * med * 100) / 100,
      });
    });
  });
  const fuera = new Set(descartados.map((d) => d.codigo));

  console.log('Artículos con precio:', arts.length);
  console.log('Precios descartados por inverosímiles:', descartados.length);
  descartados.forEach((d) => {
    console.log(`   ${d.codigo}  ${d.nombre.slice(0, 42).padEnd(44)}` +
      `RD$ ${d.precio.toFixed(2).padStart(10)} = ${d.porLibra.toFixed(2)}/lb ` +
      `(su familia va a ${d.medianaFamilia.toFixed(2)}/lb; debería costar ~${d.esperado})`);
  });

  const porCodigo = {};
  arts.forEach((a) => { porCodigo[a.codigo] = a; });

  const lineas = [];
  Object.keys(MAPEO).forEach((codOchoa) => {
    const a = porCodigo[codOchoa];
    if (!a) { console.error('AVISO: el artículo ' + codOchoa + ' no está en la extracción.'); return; }
    if (fuera.has(codOchoa)) { console.error('OMITIDO por precio inverosímil: ' + codOchoa); return; }
    const nota = `${a.nombre.trim()}${a.marca ? ', marca ' + a.marca.trim() : ''}` +
      `${a.ref ? ' (ref. ' + a.ref.trim() + ')' : ''}. Precio publicado con ITBIS incluido.`;
    lineas.push(
      `  c('${MAPEO[codOchoa]}', '${PROVEEDOR}', ${a.p}, {\n` +
      `    fecha: '${FECHA}', fuente: '${FUENTE}',\n` +
      `    nota: ${JSON.stringify(nota)}\n` +
      `  });`);
  });

  const salida = path.join(path.dirname(archivo), 'cotizaciones-generadas.js');
  fs.writeFileSync(salida, lineas.join('\n\n') + '\n');
  console.log('\nCotizaciones generadas:', lineas.length, '→', salida);
}

const FECHA = process.env.FECHA || new Date().toISOString().slice(0, 10);
main();
