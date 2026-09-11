/* =========================================================
   Escribe la capa de datos que carga el navegador.

   Uso, desde la raíz del repositorio:

       node herramientas/generar-datos-navegador.js

   Lee el registro completo de cotizaciones —precios/assets/js/
   datos-precios.js, que es el original, con la nota y la fuente de
   cada una— y escribe dos cosas:

     precios/assets/js/cotizaciones.js
        Las mismas cotizaciones en forma compacta: diccionario de
        comercios, fechas y unidades, y una línea corta por
        cotización. Sin nota ni fuente.

     precios/assets/datos/detalle-CAT.json
        La nota y la fuente, una por categoría, en el mismo orden en
        que van las cotizaciones de esa categoría en cotizaciones.js.

   Por qué separarlo: la nota y la fuente son dos terceras partes
   del peso del registro y no hacen falta para pintar un precio. El
   navegador las pide cuando de verdad las va a usar —al pasar el
   cursor sobre un comercio, al copiar para Excel—, y mientras tanto
   la página abre con una fracción del peso.

   Hay que correrlo cada vez que cambian las cotizaciones, antes de
   generar-categorias.js.
   ========================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const JS = path.join(RAIZ, 'precios/assets/js');
const DATOS = path.join(RAIZ, 'precios/assets/datos');

global.window = {};
require(path.join(JS, 'datos-catalogo.js'));
require(path.join(JS, 'datos-proveedores.js'));
require(path.join(JS, 'precios.js'));
require(path.join(JS, 'datos-precios.js'));
const PRECIOS = global.window.PRECIOS;
const registros = PRECIOS.registros;

/* ---------- diccionarios ----------
   Un comercio se repite en miles de cotizaciones y una fecha en
   cientos. Guardarlos una vez y apuntar al índice es de lejos el
   recorte más barato que hay. */
function diccionario(valores) {
  const orden = {};
  valores.forEach(v => { orden[v] = (orden[v] || 0) + 1; });
  /* Los más frecuentes primero: así los índices que más se repiten son
     los de un solo dígito. */
  return Object.keys(orden).sort((a, b) => orden[b] - orden[a] || (a < b ? -1 : 1));
}
const indice = lista => { const m = {}; lista.forEach((v, i) => { m[v] = i; }); return m; };

const prov = diccionario(registros.map(r => r.proveedor));
const fecha = diccionario(registros.map(r => r.fecha || ''));
/* La unidad propia es la excepción, así que el índice 0 es «sin unidad
   propia» y la línea puede terminar antes. */
const unid = [''].concat(diccionario(registros.map(r => r.unidad || '')).filter(u => u));
const mon = ['RD$'].concat(diccionario(registros.map(r => r.moneda || 'RD$')).filter(m => m !== 'RD$'));

const iProv = indice(prov), iFecha = indice(fecha), iUnid = indice(unid), iMon = indice(mon);

/* ---------- las líneas ----------
   [comercio, precio, fecha] y, solo si hace falta, unidad propia,
   ITBIS declarado, peso y moneda de origen. Se recorta por el final:
   la inmensa mayoría de las cotizaciones son de tres números. */
function linea(r) {
  const q = [
    iProv[r.proveedor],
    Math.round(r.precio * 100) / 100,
    iFecha[r.fecha || ''],
    iUnid[r.unidad || ''] || 0,
    r.itbis ? 1 : 0,
    r.peso || 1,
    iMon[r.moneda || 'RD$'] || 0,
    r.precioOrigen === null || r.precioOrigen === undefined ? null : r.precioOrigen
  ];
  const porDefecto = [null, null, null, 0, 1, 1, 0, null];
  let n = q.length;
  while (n > 3 && q[n - 1] === porDefecto[n - 1]) n -= 1;
  return q.slice(0, n);
}

/* ---------- agrupar por ítem ----------
   El código del ítem son doce caracteres que se repiten una vez por
   comercio; escribirlo una sola vez por ítem ahorra más que cualquier
   diccionario. Se respeta el orden del registro. */
const porItem = [];
const donde = {};
registros.forEach(r => {
  if (!(r.item in donde)) { donde[r.item] = porItem.length; porItem.push([r.item, [], []]); }
  const g = porItem[donde[r.item]];
  g[1].push(linea(r));
  g[2].push([r.fuente || '', r.nota || '']);
});

/* ---------- cotizaciones.js ---------- */
const L = [];
L.push('/* =========================================================');
L.push('   Las cotizaciones en la forma que carga el navegador.');
L.push('');
L.push('   NO EDITAR A MANO. Lo escribe herramientas/generar-datos-navegador.js');
L.push('   a partir de datos-precios.js, que es el registro original y el que');
L.push('   se edita. Aquí no está la nota ni la fuente de cada cotización:');
L.push('   esas van por categoría en assets/datos/detalle-CAT.json y se piden');
L.push('   solo cuando se necesitan.');
L.push('');
L.push('   La línea de cada cotización es');
L.push('     [comercio, precio, fecha, unidad, itbis, peso, moneda, precioOrigen]');
L.push('   recortada por el final: casi todas son de tres números. Los tres');
L.push('   primeros son índices de los diccionarios de abajo.');
L.push('   ========================================================= */');
L.push('');
L.push('(function (global) {');
L.push("  'use strict';");
L.push('');
L.push('  global.PRECIOS.compacto({');
L.push('    prov: ' + JSON.stringify(prov) + ',');
L.push('    fecha: ' + JSON.stringify(fecha) + ',');
L.push('    unid: ' + JSON.stringify(unid) + ',');
L.push('    mon: ' + JSON.stringify(mon) + ',');
L.push('    cot: [');
porItem.forEach((g, n) => {
  L.push('      ["' + g[0] + '",' + JSON.stringify(g[1]) + ']' + (n < porItem.length - 1 ? ',' : ''));
});
L.push('    ]');
L.push('  });');
L.push('');
L.push("})(typeof window !== 'undefined' ? window : globalThis);");
fs.writeFileSync(path.join(JS, 'cotizaciones.js'), L.join('\n') + '\n');

/* ---------- detalle-CAT.json ----------
   El mismo recorrido, en el mismo orden: así el enésimo detalle de una
   categoría le corresponde a su enésima cotización. */
const detalle = {};
porItem.forEach(g => {
  const cat = g[0].slice(0, 6);
  if (!detalle[cat]) detalle[cat] = [];
  g[2].forEach(d => detalle[cat].push(d));
});
if (!fs.existsSync(DATOS)) fs.mkdirSync(DATOS, {recursive: true});
fs.readdirSync(DATOS).filter(f => /^detalle-/.test(f)).forEach(f => fs.unlinkSync(path.join(DATOS, f)));
let pesoDetalle = 0;
Object.keys(detalle).sort().forEach(cat => {
  const texto = JSON.stringify(detalle[cat]);
  pesoDetalle += texto.length;
  fs.writeFileSync(path.join(DATOS, 'detalle-' + cat + '.json'), texto);
});

/* ---------- informe ---------- */
const kb = n => String(Math.round(n / 1024)).padStart(5) + ' KB';
console.log('Registro completo (datos-precios.js) ' + kb(fs.statSync(path.join(JS, 'datos-precios.js')).size));
console.log('Forma compacta  (cotizaciones.js)    ' + kb(fs.statSync(path.join(JS, 'cotizaciones.js')).size) +
            '   ' + registros.length + ' cotizaciones de ' + porItem.length + ' ítems');
console.log('Detalle por categoría                ' + kb(pesoDetalle) + '   ' +
            Object.keys(detalle).length + ' archivos, el mayor ' +
            kb(Math.max.apply(null, Object.keys(detalle).map(c => JSON.stringify(detalle[c]).length))));
