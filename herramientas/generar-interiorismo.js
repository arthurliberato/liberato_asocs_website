'use strict';
/* =========================================================
   generar-interiorismo.js — el explorador visual

       node herramientas/generar-interiorismo.js

   Escribe precios/interiorismo.html. El sitemap lo declara
   generar-categorias.js, que es quien lo escribe entero.

   POR QUÉ NO ES UNA TABLA
   -----------------------
   El resto del subdominio compara especificaciones, y para
   presupuestar eso es lo correcto: «Papel tapiz» es un ítem con
   289 cotizaciones y una mediana, y esa mediana es el número que
   va al presupuesto.

   Pero nadie ELIGE un papel tapiz por su mediana. En
   interiorismo la decisión se toma mirando: este diseño y no el
   otro, esta lámpara y no la de al lado. Una tabla de nombres y
   cifras es, para esa tarea, la peor interfaz posible — obliga a
   imaginar el producto a partir de su ficha.

   Así que aquí manda la imagen y el dato va encima de ella: el
   precio y el comercio en un recuadro sólido sobre la foto, que
   es lo que se necesita saber sin salir de la exploración. Lo
   demás —la especificación, la comparación entre comercios, el
   ITBIS— sigue estando a un clic, en la página de la partida.

   CADA FICHA LLEVA A SU TIENDA
   ----------------------------
   La imagen es del comercio y el enlace también: quien encuentra
   algo que le gusta termina en la página del producto, en la
   tienda que lo vende. No intermediamos la compra ni la
   simulamos.
   ========================================================= */

const fs = require('fs');
const path = require('path');
const { header, FOOTER, PRINCIPAL } = require('./plantilla-precios.js');

const RAIZ = path.join(__dirname, '..');
const SITIO = 'https://precios.ingsliberato.com';
const DESTINO = path.join(RAIZ, 'precios/interiorismo.html');

const g = { window: {} };
global.window = g.window;
require(path.join(RAIZ, 'precios/assets/js/datos-catalogo.js'));
const CAT = g.window.CATALOGO;
/* El catálogo visual ya no es un archivo que se carga: son doce páginas que
   el explorador pide según hacen falta. Aquí se lee su manifiesto, que trae
   las cifras que van impresas en la página. */
const MAN = JSON.parse(fs.readFileSync(path.join(RAIZ, 'precios/assets/datos/visual.json'), 'utf8'));

/* Solo las categorías que de verdad tienen artículos con foto: una pastilla
   de filtro que no filtra nada es ruido. Las cifras salen del manifiesto,
   que las trae ya calculadas. */
const cats = CAT.categorias
  .filter(c => MAN.cat[c.codigo])
  .map(c => ({ codigo: c.codigo, nombre: c.nombre, slug: c.slug, n: MAN.cat[c.codigo].n }))
  .sort((a, b) => b.n - a.n);

const comercios = MAN.com.slice().sort((a, b) => a.localeCompare(b));
const TOTAL = MAN.total;

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const mediana = MAN.todo.med;

const TITULO = 'Interiorismo: explorar acabados y luminarias por imagen';
const DESC = 'Explore visualmente ' + TOTAL.toLocaleString('en-US') +
  ' acabados, revestimientos, luminarias y piezas de baño de ' + comercios.length +
  ' comercios dominicanos, con el precio y la tienda sobre cada foto.';

const pastillas = cats.map(c =>
  `<button class="ir-chip" type="button" data-cat="${c.codigo}" aria-pressed="false">` +
  `${esc(c.nombre)}<span class="ir-chip-n">${c.n}</span></button>`
).join('\n          ');

const opciones = comercios.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('\n            ');

const html = `<!DOCTYPE html>
<html lang="es-DO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(TITULO)}</title>
<meta name="description" content="${esc(DESC)}">
<meta name="author" content="Ingenieros Liberato &amp; Asociados">
<meta name="theme-color" content="#f2efe2">
<link rel="canonical" href="${SITIO}/interiorismo.html">

<meta property="og:type" content="website">
<meta property="og:locale" content="es_DO">
<meta property="og:site_name" content="Precios de construcción RD — Ingenieros Liberato &amp; Asociados">
<meta property="og:title" content="${esc(TITULO)}">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:url" content="${SITIO}/interiorismo.html">
<meta property="og:image" content="${SITIO}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="assets/img/isotipo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/precios.css">
</head>
<body>

${header('interiorismo')}

<aside class="franja-negocio">
  <div class="shell franja-negocio-inner">
    <p class="franja-servicios">Construcción <span aria-hidden="true">·</span> Diseño <span aria-hidden="true">·</span> Supervisión</p>
  </div>
</aside>

<main id="main">

<section class="section-primera">
  <div class="shell ir-intro">
    <div>
      <h1 class="ir-titulo">Interiorismo</h1>
    </div>
  </div>
</section>

<div class="ir-barra" id="ir-barra">
  <div class="shell">
    <div class="ir-filtros">
      <div class="ir-chips" role="group" aria-label="Filtrar por categoría">
        <button class="ir-chip is-on" type="button" data-cat="" aria-pressed="true">Todo<span class="ir-chip-n">${TOTAL}</span></button>
        ${pastillas}
      </div>

      <div class="ir-controles">
        <label class="ir-busca">
          <span class="visually-hidden">Buscar</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" id="ir-q" placeholder="Buscar: colgante, mármol, dorado…" autocomplete="off">
        </label>

        <label class="ir-select">
          <span class="visually-hidden">Comercio</span>
          <select id="ir-comercio">
            <option value="">Todos los comercios</option>
            ${opciones}
          </select>
        </label>

        <label class="ir-select">
          <span class="visually-hidden">Orden</span>
          <select id="ir-orden">
            <option value="cat">Por categoría</option>
            <option value="asc">Precio: de menor a mayor</option>
            <option value="desc">Precio: de mayor a menor</option>
          </select>
        </label>
      </div>
    </div>

    <p class="ir-cuenta" id="ir-cuenta" role="status"></p>
  </div>
</div>

<div class="shell">
  <div class="ir-grid" id="ir-grid"></div>
  <p class="ir-vacio" id="ir-vacio" hidden>No hay nada con esos filtros. Pruebe quitando alguno.</p>
  <div class="ir-mas" id="ir-mas" hidden></div>
</div>

</main>

${FOOTER}

<script>
  window.IR_CATS = ${JSON.stringify(cats.reduce((m, c) => (m[c.codigo] = { n: c.nombre, s: c.slug }, m), {}))};
</script>
<script src="assets/js/interiorismo.js" defer></script>
<script>
  document.getElementById('year').textContent = new Date().getFullYear();
</script>
</body>
</html>
`;

fs.writeFileSync(DESTINO, html);
console.log('Escrito precios/interiorismo.html');
console.log('  ' + TOTAL + ' artículos · ' + cats.length + ' categorías · ' +
            comercios.length + ' comercios · mediana RD$ ' + mediana.toLocaleString('en-US'));

/* El sitemap lo escribe generar-categorias.js, que es su dueño: si los dos
   lo tocaran, el último en correr borraría lo del otro. Allí está declarada
   esta página. */
