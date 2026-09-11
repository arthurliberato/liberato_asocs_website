'use strict';
/* =========================================================
   plantilla-precios.js — el encabezado y el pie del subdominio

   Vivían dentro de generar-categorias.js, que era su único
   consumidor. Al aparecer el segundo —el explorador visual de
   interiorismo— copiarlos habría creado dos menús que se
   separan el día que se agregue una sección y alguien se
   acuerde de tocar solo uno.

   El nombre de la sección activa lo pasa quien genera la
   página: es lo único que cambia entre una y otra.
   ========================================================= */

const PRINCIPAL = 'https://ingsliberato.com';

/* La portada es el catálogo, así que el menú no lleva «Inicio»: el logotipo
   ya cumple esa función. Las páginas generadas son hijas de una sección, no
   la sección misma, por eso marcan aria-current="true" y no "page". */
function header(seccion) {
  /* «En venta» sale del subdominio, igual que el sitio principal apunta
     aquí desde su propio menú. Este es el lado con más tráfico —quien
     busca precios de construcción muchas veces está presupuestando una
     casa— y ese público es justo el de los apartamentos. */
  const nav = [
    ['./', 'Catálogo de precios', 'catalogo'],
    ['interiorismo.html', 'Interiorismo', 'interiorismo'],
    ['proveedores.html', 'Proveedores', 'proveedores'],
    ['quienes-somos.html', 'Quiénes somos', 'quienes-somos'],
    [PRINCIPAL + '/proyectos-en-venta.html', 'Proyectos en venta', 'en-venta'],
  ].map(([href, texto, clave]) =>
    `<li><a href="${href}"${clave === seccion ? ' aria-current="true"' : ''}>${texto}</a></li>`
  ).join('\n        ');

  return `<a class="skip-link" href="#main">Saltar al contenido</a>

<header class="site-header">
  <div class="shell header-inner">
    <a class="brand" href="./" aria-label="Precios de construcción — Ingenieros Liberato &amp; Asociados">
      <img src="assets/img/logo.svg" alt="Ingenieros Liberato &amp; Asociados" width="1114" height="200">
      <span class="brand-tag">Precios de<br>construcción</span>
    </a>

    <nav class="nav" id="nav" aria-label="Navegación principal">
      <ul class="nav-list">
        ${nav}
      </ul>
      <a class="btn btn-contacto nav-cta" href="${PRINCIPAL}/#contacto">Contáctanos</a>
    </nav>

    <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;
}

const FOOTER = `<footer class="site-footer">
  <div class="shell footer-inner">
    <div class="footer-brand">
      <img src="assets/img/logo.svg" alt="Ingenieros Liberato &amp; Asociados" width="1114" height="200">
      <p>Base de precios de construcción de República Dominicana,<br>
         publicada por Ingenieros Liberato &amp; Asociados.<br>
         Más de 40 años construyendo en el país.</p>
    </div>

    <nav class="footer-nav" aria-label="Navegación del pie">
      <div>
        <h3>Base de precios</h3>
        <ul>
          <li><a href="./">Catálogo completo</a></li>
          <li><a href="precio-cemento-morteros-aditivos.html">Cemento</a></li>
          <li><a href="precio-varilla-acero.html">Varilla y acero</a></li>
          <li><a href="precio-tuberia-conexiones-pvc.html">Tubería y conexiones</a></li>
          <li><a href="precio-ceramica-porcelanato-pisos.html">Cerámica y pisos</a></li>
        </ul>
      </div>
      <div>
        <h3>Referencia</h3>
        <ul>
          <li><a href="proveedores.html">Directorio de proveedores</a></li>
          <li><a href="descargas/precios-construccion-rd.xlsx" download>Descargar en Excel</a></li>
          <li><a href="quienes-somos.html">Quiénes somos</a></li>
          <li><a href="${PRINCIPAL}/proyectos-en-venta.html">Apartamentos en venta</a></li>
        </ul>
      </div>
      <div>
        <h3>Contacto</h3>
        <ul>
          <li><a href="${PRINCIPAL}/">ingsliberato.com</a></li>
          <li><a href="tel:+18297939892">+1 (829) 793-9892</a></li>
          <li><a href="mailto:arthur@ingsliberato.com">arthur@ingsliberato.com</a></li>
          <li><span>Av. Abraham Lincoln 956<br>Santo Domingo, D.N.</span></li>
        </ul>
      </div>
    </nav>
  </div>

  <div class="shell footer-bottom">
    <p>&copy; <span id="year">2026</span> Ingenieros Liberato &amp; Asociados.</p>
    <p>Precios referenciales. No sustituyen una cotización formal del proveedor.</p>
  </div>
</footer>`;


/* El icono de copiar aparece dos veces por fila: en una página de 800 ítems
   son mil seiscientas copias del mismo dibujo, medio megabyte de trazos
   repetidos. Se declara una vez aquí y cada botón lo referencia. */
const SPRITE = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><symbol id="i-copiar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></symbol></svg>`;

const USO_COPIAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-copiar"/></svg>';

module.exports = { header, FOOTER, PRINCIPAL, SPRITE, USO_COPIAR };
