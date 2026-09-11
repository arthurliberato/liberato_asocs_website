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

const comercios = MAN.com.slice();
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

/* El valor es el nombre completo, que es con el que viaja el dato; lo que
   se lee es el corto, igual que en la tabla y que en el recuadro sobre la
   foto. Que las tres vistas nombren al comercio de la misma manera. */
const corto = (n) => String(n).replace(/\s*\([^)]*\)\s*/g, '').replace(/^Ferreter[ií]a\s+/i, '').trim();
/* Se ordena por el nombre corto, que es el que se lee: alfabetizar por
   «Ferretería Ochoa (8A)» y mostrar «Ochoa» deja la lista descolocada. */
const opciones = comercios.slice()
  .sort((a, b) => corto(a).localeCompare(corto(b), 'es'))
  .map(c => `<option value="${esc(c)}">${esc(corto(c))}</option>`).join('\n            ');

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

<!-- El banner juega con la misma geometría de la marca: rectángulos a
     tope, la esquina cortada de la plancha y la paleta entera —ámbar,
     marfil, rojo y los verdes—. No es una ilustración: son las mismas
     piezas del logotipo puestas en otra escala. -->
<section class="ir-banner">
  <div class="shell ir-banner-inner">
    <div>
      <p class="ir-eyebrow">Presupuesta</p>
      <h1 class="ir-titulo">Interiorismo</h1>
    </div>
    <svg class="ir-trama" viewBox="0 0 360 120" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
      <rect fill="#e89019" x="0"   y="24" width="34" height="96"/>
      <rect fill="#f2efe2" x="34"  y="24" width="52" height="30"/>
      <rect fill="#de3b22" x="86"  y="24" width="34" height="62"/>
      <rect fill="#f2efe2" x="34"  y="86" width="86" height="30"/>
      <rect fill="#477926" x="140" y="0"  width="34" height="120"/>
      <rect fill="#7cb356" x="174" y="44" width="52" height="30"/>
      <rect fill="#e89019" x="226" y="44" width="34" height="76"/>
      <rect fill="#c7dcb8" x="174" y="74" width="52" height="46"/>
      <rect fill="#f2efe2" x="280" y="10" width="34" height="80"/>
      <rect fill="#de3b22" x="314" y="10" width="46" height="28"/>
      <rect fill="#e89019" x="314" y="62" width="46" height="28"/>
    </svg>
  </div>
</section>

<div class="ir-barra" id="ir-barra">
  <div class="shell">
    <div class="ir-filtros">
      <div class="ir-chips" id="ir-chips" role="group" aria-label="Filtrar por categoría">
        <button class="ir-chip is-on" type="button" data-cat="" aria-pressed="true">Todo<span class="ir-chip-n">${TOTAL}</span></button>
        ${pastillas}
      </div>

      <!-- La segunda fila la pinta interiorismo.js: son las subcategorías
           de la categoría elegida —papel tapiz, porcelanato de pared,
           lámpara de techo— y solo aparece cuando hay una elegida. -->
      <div class="ir-chips ir-subs" id="ir-subs" role="group" aria-label="Filtrar por tipo" hidden></div>

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

    <!-- Sin la cuenta de artículos: quien viene a mirar no necesita saber
         que hay 4,841, y el número ocupaba un renglón entero. Queda el
         aviso de que todavía está llegando lo que falta. -->
    <p class="ir-cuenta" id="ir-cuenta" role="status"></p>
  </div>
</div>

<div class="shell">
  <div class="ir-grid" id="ir-grid"></div>
  <p class="ir-vacio" id="ir-vacio" hidden>No hay nada con esos filtros. Pruebe quitando alguno.</p>
  <div class="ir-mas" id="ir-mas" hidden></div>
</div>

</main>

<!-- ============ MI SELECCIÓN ============
     El mismo panel lateral que la lista de cotización del catálogo, con la
     misma piel, porque es el mismo gesto: ir apartando lo que sirve para
     mandarlo junto. Lo que cambia es qué se guarda. En la tabla se guarda
     un ítem —«papel tapiz, 12 m²»—, que es lo que va a un presupuesto.
     Aquí se guarda el artículo concreto que se vio: esta foto, este
     modelo, este precio, esta tienda. Por eso son dos listas y no una. -->
<button class="cot-fab" id="ir-fab" type="button" aria-controls="ir-panel">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v16l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>
  Mi selección <span class="cot-n" id="ir-n">0</span>
</button>

<div class="cot-overlay" id="ir-overlay"></div>

<aside class="cot-panel" id="ir-panel" aria-hidden="true" aria-label="Mi selección de interiorismo">
  <div class="cot-head">
    <div>
      <h2 id="ir-panel-titulo">Mi selección</h2>
      <p class="mat-sub" id="ir-sub"></p>
    </div>
    <button class="cot-close" id="ir-cerrar" type="button" aria-label="Cerrar la selección">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
  </div>

  <div class="cot-body" id="ir-lista"></div>

  <!-- La misma selección, vista por comercio: a quién hay que pedirle qué.
       Ocupa el sitio de la lista en vez de abrir otra ventana porque es la
       misma lista contada de otra manera, no otro sitio. -->
  <div class="cot-body" id="ir-rfq" hidden></div>

  <div class="cot-foot">
    <div class="cot-total">
      <span class="k">Suma de lo guardado</span>
      <span class="v" id="ir-total">RD$ 0</span>
    </div>
    <p class="cot-nota" id="ir-nota">
      Cada pieza lleva el precio que publica su tienda, con enlace a ella. La suma es
      orientativa: no incluye instalación, transporte ni las mermas del corte.
    </p>
    <!-- Tres salidas. Las dos primeras se llevan la lista a otro sitio —una
         hoja, un papel—; la tercera la devuelve al comercio, que es para lo
         que se armó. -->
    <div class="cot-acciones" id="ir-acciones">
      <button class="btn btn-primary" id="ir-cotizar" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5h16v11H8l-4 4V5z"/><path d="M8 9h8M8 12h5"/></svg>
        Solicitar cotización
      </button>
      <button class="btn btn-ghost" id="ir-pdf" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9V4h12v5M6 18v2h12v-2M6 9h12a2 2 0 0 1 2 2v5H4v-5a2 2 0 0 1 2-2z"/></svg>
        Exportar a PDF
      </button>
      <button class="btn btn-ghost" id="ir-excel" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
        Exportar a Excel
      </button>
    </div>
    <!-- Solo aparece dentro de la vista por comercio. -->
    <div class="cot-acciones" id="ir-rfq-acciones" hidden>
      <button class="btn btn-ghost" id="ir-volver" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        Volver a la lista
      </button>
    </div>
  </div>
</aside>

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
