#!/usr/bin/env node
/* =========================================================
   generar-lote-precios.js

   El lanzamiento de precios.ingsliberato.com tiene una sola
   condición: cada ítem del catálogo debe llegar con al menos un
   precio real de un comercio real. Hoy faltan la mayoría.

   Esta herramienta prepara el trabajo de recolección en tandas.
   Toma los ítems que TODAVÍA no tienen ninguna cotización real
   (las del modo demo no cuentan), los ordena por catálogo y
   escribe un encargo en Markdown listo para pegar en un asistente
   con navegación, o para repartir entre quien vaya a llamar a los
   proveedores.

   USO
   ---
     node herramientas/generar-lote-precios.js            # próximos 30
     node herramientas/generar-lote-precios.js 40         # próximos 40
     node herramientas/generar-lote-precios.js 30 --desde 60
     node herramientas/generar-lote-precios.js 20 --categoria MAT-04
     node herramientas/generar-lote-precios.js 0          # solo informar cobertura

   Los ítems salen ordenados por cuántos comercios del directorio
   publican esa categoría en línea: primero lo que se resuelve sentado
   frente a la pantalla, de último los agregados, la mano de obra y el
   alquiler de equipos, que hay que preguntarlos por teléfono.

   Cada corrida escribe herramientas/lotes/lote-NN.md, numerado
   según los lotes que ya existan. Como los ítems ya cubiertos se
   excluyen solos, basta con cargar las cotizaciones que devuelva
   un lote y volver a correr la herramienta: el siguiente lote
   arranca donde terminó el anterior, sin repetir trabajo.

   La respuesta se carga con herramientas/importar-lote.js.
   ========================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DATOS = path.join(RAIZ, 'precios/assets/js');
const LOTES = path.join(__dirname, 'lotes');

global.window = global;
/* El motor va antes que el registro: datos-precios.js le pide la c(). */
require(path.join(DATOS, 'precios.js'));
['catalogo', 'proveedores', 'precios', 'demo'].forEach(function (f) {
  require(path.join(DATOS, 'datos-' + f + '.js'));
});

const CAT = global.CATALOGO;
const PROV = global.PROVEEDORES;
const PRECIOS = global.PRECIOS;

/* ---------------------------------------------------------
   1. Qué falta
   --------------------------------------------------------- */

const problemas = PRECIOS.aplicar(CAT, PROV);
if (problemas && problemas.length) {
  console.error('Los datos de precios tienen problemas; corrígelos antes de armar un lote:');
  problemas.forEach(function (p) { console.error('  - ' + p); });
  process.exit(1);
}

/* Un ítem está cubierto cuando el sitio ya le muestra un precio real:
   estado 'verificado'. No cuentan las cotizaciones de demostración, ni
   las que vienen en otra presentación (quedan fuera de la mediana y el
   ítem sigue mostrando la estimación). Los ítems 'tarifario' no llevan
   precio por definición, así que tampoco entran en la cuenta. */
const SIN_PRECIO = {tarifario: true};

const pendientes = CAT.items.filter(function (i) {
  return i.estado !== 'verificado' && !SIN_PRECIO[i.estado];
});
const cubiertos = CAT.items.filter(function (i) { return i.estado === 'verificado'; });
const sinPrecio = CAT.items.filter(function (i) { return SIN_PRECIO[i.estado]; });

/* Orden de trabajo: primero las categorías que más comercios del
   directorio publican en línea, porque son las que se pueden resolver
   sentado. Los agregados, la mano de obra y el alquiler de equipos
   quedan de últimos: esos precios hay que pedirlos por teléfono. */
const tiendasPorCat = {};
PROV.lista.forEach(function (p) {
  if (!p.precios || p.demo || p.publico === false) return;
  p.cats.forEach(function (c) { tiendasPorCat[c] = (tiendasPorCat[c] || 0) + 1; });
});

const ordenOriginal = {};
CAT.items.forEach(function (i, n) { ordenOriginal[i.codigo] = n; });

pendientes.sort(function (a, b) {
  const da = (tiendasPorCat[b.cat] || 0) - (tiendasPorCat[a.cat] || 0);
  if (da) return da;
  return ordenOriginal[a.codigo] - ordenOriginal[b.codigo];
});

/* ---------------------------------------------------------
   2. Recorte del lote
   --------------------------------------------------------- */

const args = process.argv.slice(2);
const pedido = args.filter(function (a) { return /^\d+$/.test(a); })[0];
const tamano = pedido === undefined ? 30 : parseInt(pedido, 10);
const iDesde = args.indexOf('--desde');
const desde = iDesde >= 0 ? parseInt(args[iDesde + 1], 10) || 0 : 0;

function informarCobertura() {
  console.log('Cobertura: ' + cubiertos.length + ' de ' + (CAT.items.length - sinPrecio.length) +
              ' ítems con precio real · faltan ' + pendientes.length +
              ' (' + sinPrecio.length + ' van según tarifario y no llevan precio).');
}

/* «0 ítems» es la forma de preguntar cómo va la cobertura sin armar nada. */
if (tamano === 0) { informarCobertura(); process.exit(0); }

const iCat = args.indexOf('--categoria');
const soloCat = iCat >= 0 ? String(args[iCat + 1] || '').toUpperCase() : '';

const cola = soloCat
  ? pendientes.filter(function (i) { return i.cat === soloCat; })
  : pendientes;

if (soloCat && !cola.length) {
  console.log('La categoría ' + soloCat + ' no tiene ítems pendientes.');
  process.exit(0);
}

const lote = cola.slice(desde, desde + tamano);

if (!lote.length) {
  console.log('No quedan ítems pendientes en ese tramo.');
  console.log('Pendientes totales: ' + pendientes.length + '.');
  process.exit(0);
}

/* ---------------------------------------------------------
   3. A quién preguntarle
       Solo comercios que publican precios abiertamente y que
       según el directorio cubren alguna categoría del lote.
   --------------------------------------------------------- */

const catsLote = {};
lote.forEach(function (i) { catsLote[i.cat] = true; });

const comercios = PROV.lista.filter(function (p) {
  if (!p.precios || p.demo) return false;
  if (p.publico === false) return false;         // canal cerrado: no cotiza al público
  return p.cats.some(function (c) { return catsLote[c]; });
});

/* ---------------------------------------------------------
   4. El encargo
   --------------------------------------------------------- */

const nombreCat = function (codigo) {
  const c = CAT.categorias.filter(function (k) { return k.codigo === codigo; })[0];
  return c ? c.nombre : codigo;
};

const V = '```';
const hoy = new Date().toISOString().slice(0, 10);

const fichas = [];
let catActual = '';
lote.forEach(function (i) {
  if (i.cat !== catActual) {
    catActual = i.cat;
    const tiendas = comercios
      .filter(function (p) { return p.cats.indexOf(i.cat) >= 0; })
      .map(function (p) { return p.nombre; });
    fichas.push('');
    fichas.push('### ' + i.cat + ' · ' + nombreCat(i.cat));
    fichas.push('_Comercios con esta categoría: ' +
      (tiendas.length ? tiendas.join(', ') : 'ninguno del listado; busca en el mercado abierto') + '._');
    fichas.push('');
  }
  fichas.push('- **' + i.codigo + '** — ' + i.nombre);
  const detalle = [];
  if (i.esp) detalle.push('Especificación: ' + i.esp);
  detalle.push('Unidad: **' + i.unidad + '**');
  if (i.alias) detalle.push('También le dicen: ' + i.alias);
  if (i.alcance) detalle.push('El precio cubre: ' + i.alcance);
  fichas.push('  · ' + detalle.join(' · '));
});

const doc = [
  '# Precios de materiales de construcción en República Dominicana',
  '',
  'Necesito el precio publicado de ' + lote.length + ' artículos de construcción en comercios dominicanos.',
  '',
  '## Comercios a consultar',
  '',
  comercios.map(function (p) { return '- **' + p.nombre + '** — ' + p.web; }).join('\n'),
  '',
  'No hace falta que todos tengan todos los ítems. Con dos o tres precios por ítem es suficiente.',
  '',
  '## Reglas importantes',
  '',
  '1. **Solo precios publicados abiertamente.** No inicies sesión, no te registres ni entres a ninguna sección que pida cuenta.',
  '2. **Si no lo encuentras, escribe NO ENCONTRADO.** No estimes, no aproximes y no uses el precio de un producto parecido de otra tienda. Un dato inventado aquí es peor que un dato faltante.',
  '3. **Copia el nombre exacto** con que aparece el producto en la tienda, aunque no coincida con el mío. Eso me permite verificar que es el mismo producto.',
  '4. **Indica si el precio incluye ITBIS** (el 18%). Las ferreterías dominicanas suelen mostrarlo incluido; si la ficha lo dice, respétalo, y si no lo dice escribe NO DICE.',
  '5. **Incluye la URL exacta** de la página del producto y la fecha en que la consultaste.',
  '6. Si la tienda vende en una presentación distinta a mi unidad (por ejemplo yo pido por m² y la tienda vende por caja, o pido 20 pies y venden 19), **no conviertas el precio**: anótalo tal cual y escribe la presentación real en Notas.',
  '',
  '## Formato de respuesta',
  '',
  'Devuélveme solo un bloque de texto con una línea por precio encontrado, con los campos separados por el carácter | en este orden y sin encabezado:',
  '',
  V,
  'CODIGO | PROVEEDOR | NOMBRE EN LA TIENDA | PRECIO | INCLUYE ITBIS | URL | FECHA | NOTAS',
  V,
  '',
  '- **CODIGO**: el código del ítem tal cual aparece abajo, por ejemplo MAT-04-002',
  '- **PROVEEDOR**: el nombre del comercio exactamente como está en la lista de arriba',
  '- **PRECIO**: solo el número, sin RD$ ni separador de miles. Ejemplo: 455 o 1180.50',
  '- **INCLUYE ITBIS**: SI, NO o NO DICE',
  '- **FECHA**: formato AAAA-MM-DD',
  '- **NOTAS**: presentación, marca, o vacío',
  '',
  'Ejemplo de dos líneas bien formadas:',
  '',
  V,
  'MAT-02-001 | Ferretería Ochoa (8A) | Cemento Gris Titán 42.5 Kg | 455 | SI | https://ochoa.com.do/producto/... | ' + hoy + ' | Marca Titán',
  'MAT-04-002 | Ferremix (Grupo Alterra) | Varilla 1/2 x 20 pies grado 60 | 590 | SI | https://ferremix.com.do/products/... | ' + hoy + ' |',
  V,
  '',
  '---',
  '',
  '## Los ' + lote.length + ' ítems',
  fichas.join('\n'),
  '',
  '---',
  '',
  'Al final, dime brevemente qué comercios no respondieron o bloquearon la consulta.',
  ''
].join('\n');

/* ---------------------------------------------------------
   5. Escritura
   --------------------------------------------------------- */

if (!fs.existsSync(LOTES)) fs.mkdirSync(LOTES, { recursive: true });

const previos = fs.readdirSync(LOTES).filter(function (f) { return /^lote-\d+\.md$/.test(f); });
const numero = String(previos.length + 1).padStart(2, '0');
const salida = path.join(LOTES, 'lote-' + numero + '.md');

fs.writeFileSync(salida, doc);

console.log('Lote ' + numero + ' escrito en herramientas/lotes/lote-' + numero + '.md');
console.log('  ' + lote.length + ' ítems · ' + comercios.length + ' comercios');
console.log('  ' + lote[0].codigo + ' (' + lote[0].nombre + ')');
console.log('  … ' + lote[lote.length - 1].codigo + ' (' + lote[lote.length - 1].nombre + ')');
console.log('');
informarCobertura();
