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
/* La tabla de gamas, antes de leer el registro: c() la consulta al
   construir cada cotización. La miden y la escriben medir-gama.js y
   gama-marcas.js; aquí solo se enchufa. */
(global.PRECIOS || global.window.PRECIOS).gamaDeMarca = require('./gama-marcas.js');
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
  if (!(r.item in donde)) { donde[r.item] = porItem.length; porItem.push([r.item, [], [], []]); }
  const g = porItem[donde[r.item]];
  g[1].push(linea(r));
  g[2].push([r.fuente || '', r.nota || '']);
  g[3].push(r.gama || '');
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
L.push('');
L.push('   Tras las líneas, cuando el ítem tiene marcas medidas, va la tira');
L.push('   de gamas: una letra por cotización y en el mismo orden —«e»');
L.push('   económica, «s» estándar, «a» alta, «p» premium, «.» sin medir.');
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
/* LA TIRA DE GAMAS

   Una letra por cotización y en el mismo orden que las líneas: «e»
   económica, «s» estándar, «a» alta, «p» premium, «.» sin medir.

   Solo la llevan los ítems que de verdad van a publicar una referencia
   por gama, y eso pide dos gamas con tres cotizaciones cada una: con una
   sola no hay con qué comparar, y con dos de dos la «mediana» es el
   promedio de dos números. Escribirla en los 2.206 ítems costaba 18 KB
   para que la usaran veinticinco; así cuesta menos de uno.

   El umbral se comprueba sin filtro, que es como se abre la página. Al
   filtrar por comercio la referencia se recalcula con lo que quede, y
   puede quedarse sin gamas —nunca ganarlas—, que es el lado correcto por
   el que equivocarse. */
const LETRA = { economica: 'e', estandar: 's', alta: 'a', premium: 'p' };
let conTira = 0;
porItem.forEach((g, n) => {
  const cuenta = {};
  (g[3] || []).forEach(x => { if (x) cuenta[x] = (cuenta[x] || 0) + 1; });
  const vale = Object.keys(cuenta).filter(k => cuenta[k] >= 3).length >= 2;
  let gamas = '';
  if (vale) {
    gamas = ',"' + g[1].map((_, i) => LETRA[(g[3] || [])[i]] || '.').join('') + '"';
    conTira += 1;
  }
  L.push('      ["' + g[0] + '",' + JSON.stringify(g[1]) + gamas + ']' +
         (n < porItem.length - 1 ? ',' : ''));
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

/* =========================================================
   El catálogo, también en forma compacta

   datos-catalogo.js pesa 678 KB y buena parte es repetición: la
   unidad, la etapa, el alcance, el estado y la fuente de cada ítem
   son los mismos siete u ocho textos una y otra vez. En diccionario
   ocupan 1 KB. De paso se quedan fuera tres campos que el navegador
   no mira nunca —medidas, gama y origen—, que son de la auditoría.

   Y los alias, que son 96 KB y solo sirven para buscar, van en su
   propio archivo: los carga la portada, que es la única página con
   buscador, y no las 31 páginas de categoría.
   ========================================================= */

const CAT = global.window.CATALOGO;

const dic = {}, orden = {};
function dicc(campo, valor) {
  if (!dic[campo]) { dic[campo] = []; orden[campo] = {}; }
  const s = JSON.stringify(valor);
  if (!(s in orden[campo])) { orden[campo][s] = dic[campo].length; dic[campo].push(valor); }
  return orden[campo][s];
}

/* El orden de los campos es el que lee catalogo.js al reconstruir. */
const filas = CAT.items.map(i => [
  i.codigo, i.nombre, i.esp || '', dicc('cat', i.cat), dicc('unidad', i.unidad),
  dicc('etapa', i.etapa), dicc('alcance', i.alcance || ''), dicc('estado', i.estado),
  dicc('fuente', i.fuente || ''), dicc('fecha', i.fecha || ''), i.itbis ? 1 : 0,
  i.ref, i.min, i.max, dicc('ambitos', i.ambitos || []), i.nota || ''
]);

const taxonomia = ['meta', 'grupos', 'categorias', 'etapas', 'conversiones', 'dudosos', 'retirados'];

const K = [];
K.push('/* =========================================================');
K.push('   El catálogo en la forma que carga el navegador.');
K.push('');
K.push('   NO EDITAR A MANO. Lo escribe herramientas/generar-datos-navegador.js');
K.push('   a partir de datos-catalogo.js, que es el original y el que se edita.');
K.push('');
K.push('   Cada ítem es una línea de dieciséis posiciones; las que son índices');
K.push('   apuntan a los diccionarios de aquí abajo. Faltan tres campos del');
K.push('   original —medidas, gama y origen— porque el sitio no los usa: son');
K.push('   de la auditoría y del libro de Excel, que leen el original. Los');
K.push('   alias van aparte, en catalogo-alias.js, porque solo los necesita el');
K.push('   buscador de la portada.');
K.push('   ========================================================= */');
K.push('');
K.push('(function (global) {');
K.push("  'use strict';");
K.push('');
K.push('  var d = ' + JSON.stringify(dic) + ';');
K.push('');
K.push('  var f = [');
filas.forEach((f, n) => K.push('    ' + JSON.stringify(f) + (n < filas.length - 1 ? ',' : '')));
K.push('  ];');
K.push('');
K.push('  global.CATALOGO = {');
taxonomia.forEach(k => K.push('    ' + k + ': ' + JSON.stringify(CAT[k]) + ','));
K.push('    items: f.map(function (i) {');
K.push('      return {');
K.push('        codigo: i[0], nombre: i[1], esp: i[2], cat: d.cat[i[3]], unidad: d.unidad[i[4]],');
K.push('        etapa: d.etapa[i[5]], alcance: d.alcance[i[6]], estado: d.estado[i[7]],');
K.push('        fuente: d.fuente[i[8]], fecha: d.fecha[i[9]], itbis: !!i[10],');
K.push('        ref: i[11], min: i[12], max: i[13], ambitos: d.ambitos[i[14]], nota: i[15],');
K.push("        alias: ''");
K.push('      };');
K.push('    })');
K.push('  };');
K.push('');
K.push("})(typeof window !== 'undefined' ? window : globalThis);");
fs.writeFileSync(path.join(JS, 'catalogo.js'), K.join('\n') + '\n');

/* Los alias, para el buscador de la portada. */
const A = [];
A.push('/* Los alias de cada ítem, que es como el buscador encuentra «varilla» al');
A.push('   escribir «cabilla». Van aparte porque son 96 KB y solo los usa la');
A.push('   portada, la única página con buscador. NO EDITAR A MANO: lo escribe');
A.push('   herramientas/generar-datos-navegador.js. */');
A.push('');
A.push('(function (global) {');
A.push("  'use strict';");
A.push('  var a = ' + JSON.stringify(CAT.items.map(i => i.alias || '')) + ';');
A.push('  global.CATALOGO.items.forEach(function (it, n) { it.alias = a[n]; });');
A.push("})(typeof window !== 'undefined' ? window : globalThis);");
fs.writeFileSync(path.join(JS, 'catalogo-alias.js'), A.join('\n') + '\n');

/* ---------- informe ---------- */
const kb = n => String(Math.round(n / 1024)).padStart(5) + ' KB';
console.log('Registro completo (datos-precios.js) ' + kb(fs.statSync(path.join(JS, 'datos-precios.js')).size));
console.log('  de esos, con tira de gamas: ' + conTira);
console.log('Forma compacta  (cotizaciones.js)    ' + kb(fs.statSync(path.join(JS, 'cotizaciones.js')).size) +
            '   ' + registros.length + ' cotizaciones de ' + porItem.length + ' ítems');
console.log('Catálogo completo (datos-catalogo.js)' + kb(fs.statSync(path.join(JS, 'datos-catalogo.js')).size));
console.log('Forma compacta  (catalogo.js)        ' + kb(fs.statSync(path.join(JS, 'catalogo.js')).size) +
            '   ' + CAT.items.length + ' ítems');
console.log('Alias           (catalogo-alias.js)  ' + kb(fs.statSync(path.join(JS, 'catalogo-alias.js')).size) +
            '   solo la portada');
console.log('Detalle por categoría                ' + kb(pesoDetalle) + '   ' +
            Object.keys(detalle).length + ' archivos, el mayor ' +
            kb(Math.max.apply(null, Object.keys(detalle).map(c => JSON.stringify(detalle[c]).length))));
