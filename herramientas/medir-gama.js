#!/usr/bin/env node
/* =========================================================
   medir-gama.js — de qué gama es cada marca, medido

     node herramientas/medir-gama.js            # ver la medición
     node herramientas/medir-gama.js --escribir # escribir la tabla

   POR QUÉ HACE FALTA

   «Mezcladora, de baño» tiene 577 cotizaciones y una referencia de
   RD$ 4.967 que no le sirve a casi nadie: solo el 14% de las
   cotizaciones cae a menos de una cuarta parte de distancia de ella.
   No es culpa de la fórmula —la mediana de medianas da casi lo mismo—
   sino de que la partida contiene dos productos distintos con el mismo
   nombre: la mezcladora de una ferretería y la de una casa de diseño,
   y entre las dos hay doce veces de diferencia.

   QUÉ LO DECIDE: LA MARCA, NO EL COMERCIO

   La tentación es separar por comercio —ferreterías abajo, casas de
   diseño arriba— y es un atajo que falla justo donde importa: Ochoa es
   una ferretería y vende TILBY a RD$ 2.702 y HELVEX a RD$ 11.147. El
   mismo comercio, las dos gamas.

   CÓMO SE MIDE

   El precio absoluto no sirve para comparar marcas, porque una marca
   que hace inodoros y otra que hace tornillos no son comparables. Así
   que cada cotización se mide como MÚLTIPLO DE LA MEDIANA DE SU
   PARTIDA: 1.0 es «lo que cuesta normalmente esto». Entonces sí se
   pueden poner todas las marcas en la misma recta.

   Puestas ahí, las 62 marcas con quince o más cotizaciones van de 0,02
   a 13,59 en un continuo: casi todos los escalones son de x1,00 a
   x1,06. NO HAY UN HUECO NATURAL donde cortar. Eso hay que decirlo
   porque cambia lo que se puede afirmar: los cortes de abajo son una
   convención escogida en números redondos, no una frontera encontrada
   en el dato.

   DÓNDE SE GANA EL SITIO

   Lo que decide si la gama sirve en una categoría no es la dispersión
   sola, sino cuánto separan las marcas frente a cuánto se solapan.
   Medido así:

     27,8x  Plomería, sanitarios y gas      15 marcas, de 0,14 a 10,22
     12,2x  Cableado estructurado y redes    3 marcas (pocas, y una rara)
      6,7x  Iluminación decorativa          11 marcas
      3,9x  Muebles y espejos de baño        6 marcas
      2,5x  Lavamanos y pedestales           6 marcas
      1,9x  Pisos y revestimientos          23 marcas
      1,5x  Inodoros y urinarios             7 marcas
      1,0x  Pintura y acabados               3 marcas
      1,0x  Electricidad e iluminación       5 marcas
      0,7x  Alarmas y control de accesos     4 marcas

   Por debajo de 1,5x la marca no dice nada que la partida no diga ya, y
   ponerle una etiqueta de gama a un artículo de pintura sería inventar
   una distinción que el mercado no hace. Por eso la tabla solo recoge
   las marcas de las categorías que pasan el umbral.
   ========================================================= */

'use strict';

const fs = require('fs');
const path = require('path');
const DATOS = path.join(__dirname, '..', 'precios/assets/js');

global.window = global;
require(path.join(DATOS, 'precios.js'));
/* La tabla de gamas, antes de leer el registro: c() la consulta al
   construir cada cotización. La miden y la escriben medir-gama.js y
   gama-marcas.js; aquí solo se enchufa. */
/* Salvo aquí: esta herramienta es la que ESCRIBE la tabla, así que tiene
   que poder correr sin ella —la primera vez, o si se borra para rehacerla
   desde cero. No la necesita para medir: mide sobre la marca. */
try { global.PRECIOS.gamaDeMarca = require('./gama-marcas.js'); } catch (e) { /* aún no existe */ }
['catalogo', 'proveedores', 'precios'].forEach(f => require(path.join(DATOS, 'datos-' + f + '.js')));

const CAT = global.CATALOGO;
const PROV = global.PROVEEDORES;
const PRECIOS = global.PRECIOS;
PRECIOS.aplicar(CAT, PROV);

/* Cuántas cotizaciones hacen falta para creerse una marca, y cuántas
   para creerse la mediana de una partida. Son los dos umbrales de todo
   esto y por eso van juntos y a la vista. */
const MINIMO_MARCA = 15;
const MINIMO_PARTIDA = 5;
const MINIMO_EN_CATEGORIA = 10;

/* Por debajo de aquí la marca no separa lo bastante como para que valga
   la pena etiquetarla. Ver la cabecera. */
const PODER_MINIMO = 1.5;

/* Los cortes. Son una convención en números redondos, no una frontera
   encontrada: el continuo de marcas no tiene hueco donde partirlo. Se
   eligen así para que digan lo que un maestro de obra diría —«esa marca
   es el doble de cara que lo normal»— y se leen sobre el múltiplo de la
   mediana de la partida. */
const CORTES = [
  [0.75, 'economica'],
  [1.50, 'estandar'],
  [4.00, 'alta'],
  [Infinity, 'premium']
];

const med = a => {
  const v = a.slice().sort((x, y) => x - y);
  const m = v.length >> 1;
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};
const cuartil = (a, p) => {
  const v = a.slice().sort((x, y) => x - y);
  return v[Math.floor(v.length * p)];
};

/* SOLO PARTIDAS QUE SIGUEN PUBLICADAS

   El auditor retira las partidas que están rotas —las que mezclan dos
   productos con el mismo nombre— pero sus cotizaciones siguen en el
   registro. Si se miden, contaminan la tabla: STEREN salía a x0,02 de
   su partida y parecía la marca más barata del catálogo. No lo es. Sus
   cotizaciones estaban en «Cable de red», una partida que el propio
   auditor ya había retirado por contener un cable de dock de RD$ 5 y
   uno blindado de RD$ 1.676 bajo el mismo nombre. La vara estaba rota,
   no la marca.

   El auditor ya hizo ese trabajo; esto se limita a respetarlo. */
const publicado = {};
CAT.items.forEach(i => { publicado[i.codigo] = true; });

/* La mediana de cada partida, que es la vara. */
const porItem = {};
PRECIOS.registros.forEach(q => {
  if (q.precio > 0 && publicado[q.item]) (porItem[q.item] = porItem[q.item] || []).push(q.precio);
});
const vara = {};
Object.keys(porItem).forEach(k => { if (porItem[k].length >= MINIMO_PARTIDA) vara[k] = med(porItem[k]); });

/* Cada cotización con marca, como múltiplo de esa vara. */
const deMarca = {};
const deMarcaEnCat = {};
PRECIOS.registros.forEach(q => {
  if (!q.marca || !vara[q.item] || !(q.precio > 0)) return;
  const r = q.precio / vara[q.item];
  (deMarca[q.marca] = deMarca[q.marca] || []).push(r);
  const k = q.item.slice(0, 6) + '|' + q.marca;
  (deMarcaEnCat[k] = deMarcaEnCat[k] || []).push(r);
});

/* Qué tanto separa la marca dentro de cada categoría. */
const porCat = {};
Object.keys(deMarcaEnCat).forEach(k => {
  if (deMarcaEnCat[k].length < MINIMO_EN_CATEGORIA) return;
  const [cat, marca] = k.split('|');
  (porCat[cat] = porCat[cat] || []).push({
    marca: marca,
    valor: med(deMarcaEnCat[k]),
    solape: cuartil(deMarcaEnCat[k], 0.75) / cuartil(deMarcaEnCat[k], 0.25),
    n: deMarcaEnCat[k].length
  });
});

const nombreCat = {};
CAT.categorias.forEach(c => { nombreCat[c.codigo] = c.nombre; });

const categorias = Object.keys(porCat)
  .filter(c => porCat[c].length >= 3)
  .map(c => {
    const v = porCat[c].map(x => x.valor);
    const separan = Math.max.apply(null, v) / Math.min.apply(null, v);
    const solapan = med(porCat[c].map(x => x.solape));
    return { cat: c, nombre: nombreCat[c] || c, separan: separan, solapan: solapan,
             poder: separan / solapan, marcas: porCat[c] };
  })
  .sort((a, b) => b.poder - a.poder);

const gananSitio = categorias.filter(c => c.poder >= PODER_MINIMO);
const catsConGama = {};
gananSitio.forEach(c => { catsConGama[c.cat] = true; });

function gamaDe(valor) {
  for (let i = 0; i < CORTES.length; i++) if (valor < CORTES[i][0]) return CORTES[i][1];
  return 'premium';
}

/* La tabla: una marca, una gama. Solo las marcas que aparecen en alguna
   categoría donde la gama se gana el sitio, y con su múltiplo medido
   sobre TODAS sus cotizaciones, no solo las de esa categoría. */
const tabla = {};
Object.keys(deMarca).forEach(m => {
  if (deMarca[m].length < MINIMO_MARCA) return;
  const enBuenaCat = Object.keys(deMarcaEnCat).some(k => {
    const [cat, marca] = k.split('|');
    return marca === m && catsConGama[cat] && deMarcaEnCat[k].length >= MINIMO_EN_CATEGORIA;
  });
  if (!enBuenaCat) return;
  tabla[m] = { gama: gamaDe(med(deMarca[m])), valor: Math.round(med(deMarca[m]) * 100) / 100,
               n: deMarca[m].length };
});

/* ---------------- informe ---------------- */
console.log('MARCAS MEDIDAS: ' + Object.keys(deMarca).filter(m => deMarca[m].length >= MINIMO_MARCA).length +
            ' con ' + MINIMO_MARCA + '+ cotizaciones en partidas de ' + MINIMO_PARTIDA + '+\n');
console.log('DÓNDE SE GANA EL SITIO (separan ÷ solapan)');
categorias.forEach(c => {
  console.log('  ' + (c.poder >= PODER_MINIMO ? '✓' : '·') + ' ' + c.poder.toFixed(1).padStart(5) + 'x   ' +
              String(c.marcas.length).padStart(2) + ' marcas   ' + c.nombre);
});

console.log('\nLA TABLA: ' + Object.keys(tabla).length + ' marcas');
const orden = Object.keys(tabla).sort((a, b) => tabla[a].valor - tabla[b].valor);
let gprev = '';
orden.forEach(m => {
  if (tabla[m].gama !== gprev) { console.log('  ── ' + tabla[m].gama + ' ──'); gprev = tabla[m].gama; }
  console.log('     x' + tabla[m].valor.toFixed(2).padStart(6) + '   n=' + String(tabla[m].n).padStart(4) + '   ' + m);
});

const cubiertas = PRECIOS.registros.filter(q => q.marca && tabla[q.marca]).length;
console.log('\nCotizaciones que quedan con gama: ' + cubiertas + ' de ' + PRECIOS.registros.length +
            ' (' + Math.round(100 * cubiertas / PRECIOS.registros.length) + '%)');

/* ---------------- escritura ---------------- */
if (process.argv.indexOf('--escribir') >= 0) {
  const L = [];
  L.push("'use strict';");
  L.push('/* =========================================================');
  L.push('   gama-marcas.js — GENERADO. No se edita a mano.');
  L.push('');
  L.push('     node herramientas/medir-gama.js --escribir');
  L.push('');
  L.push('   De qué gama es cada marca, medido sobre el registro entero:');
  L.push('   cada cotización como múltiplo de la mediana de su partida, y');
  L.push('   la mediana de esos múltiplos por marca. El método, los');
  L.push('   umbrales y por qué los cortes son una convención y no una');
  L.push('   frontera, en la cabecera de medir-gama.js.');
  L.push('');
  L.push('   Medido el ' + new Date().toISOString().slice(0, 10) + ' sobre ' +
          PRECIOS.registros.length + ' cotizaciones.');
  L.push('   ========================================================= */');
  L.push('');
  L.push('var GAMA_MARCAS = {');
  const lineas = orden.map(m =>
    "  " + JSON.stringify(m) + ": '" + tabla[m].gama + "'," +
    "   /* x" + tabla[m].valor.toFixed(2) + " · " + tabla[m].n + " cotizaciones */");
  L.push(lineas.join('\n').replace(/,(\s+\/\*[^*]*\*\/)$/, '$1'));
  L.push('};');
  L.push('');
  L.push("if (typeof module !== 'undefined') module.exports = GAMA_MARCAS;");
  L.push("if (typeof window !== 'undefined') window.GAMA_MARCAS = GAMA_MARCAS;");
  L.push('');
  fs.writeFileSync(path.join(__dirname, 'gama-marcas.js'), L.join('\n'));
  console.log('\nEscrito herramientas/gama-marcas.js');
}
