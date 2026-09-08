/* =========================================================
   Generador de las páginas estáticas por categoría del
   subdominio precios.ingsliberato.com.

   Uso, desde la raíz del repositorio:

       node herramientas/generar-categorias.js

   Lee la capa de datos del sitio (precios/assets/js/datos-*.js)
   y el contenido editorial (herramientas/contenido-categorias.js),
   y escribe un HTML por categoría en precios/, además del
   sitemap.xml.

   El sitio publicado sigue siendo estático: este generador se
   corre a mano cuando cambian los datos o el contenido, no en
   el despliegue.
   ========================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const DESTINO = path.join(RAIZ, 'precios');
const SITIO = 'https://precios.ingsliberato.com';
const PRINCIPAL = 'https://ingsliberato.com';
const WA = '18297939892';

/* ---------- cargar la capa de datos del sitio ---------- */
global.window = {};
require(path.join(DESTINO, 'assets/js/datos-catalogo.js'));
require(path.join(DESTINO, 'assets/js/datos-proveedores.js'));
const CAT = global.window.CATALOGO;
const PROV = global.window.PROVEEDORES;
const CONTENIDO = require('./contenido-categorias.js');

/* ---------- utilidades ---------- */

const esc = (s) => String(s === null || s === undefined ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fmt = (n) => {
  if (n === null || n === undefined) return '—';
  const dec = n < 100 ? (Math.round(n) === n ? 0 : 2) : 0;
  return n.toLocaleString('es-DO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
};
const rd = (n) => (n === null || n === undefined ? '—' : 'RD$ ' + fmt(n));

const catPorCodigo = {};
CAT.categorias.forEach((c) => { catPorCodigo[c.codigo] = c; });
const grupoPorCodigo = {};
CAT.grupos.forEach((g) => { grupoPorCodigo[g.codigo] = g; });
const etapaPorCodigo = {};
CAT.etapas.forEach((e) => { etapaPorCodigo[e.codigo] = e; });

/* ---------- cabecera, pie y panel de cotización ---------- */

function header(seccion) {
  const nav = [
    ['index.html', 'Inicio', 'inicio'],
    ['catalogo.html', 'Catálogo de precios', 'catalogo'],
    ['proveedores.html', 'Proveedores', 'proveedores'],
    ['metodologia.html', 'Metodología', 'metodologia'],
  ].map(([href, texto, clave]) =>
    `<li><a href="${href}"${clave === seccion ? ' aria-current="page"' : ''}>${texto}</a></li>`
  ).join('\n        ');

  return `<a class="skip-link" href="#main">Saltar al contenido</a>

<header class="site-header">
  <div class="shell header-inner">
    <a class="brand" href="index.html" aria-label="Precios de construcción — Ingenieros Liberato &amp; Asociados">
      <img src="assets/img/logo.png" alt="Ingenieros Liberato &amp; Asociados" width="2920" height="766">
      <span class="brand-tag">Precios de<br>construcción</span>
    </a>

    <nav class="nav" id="nav" aria-label="Navegación principal">
      <ul class="nav-list">
        ${nav}
      </ul>
      <a class="btn btn-primary nav-cta" href="${PRINCIPAL}/#contacto">Solicitar cotización</a>
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
      <img src="assets/img/logo-oscuro.png" alt="Ingenieros Liberato &amp; Asociados" width="2920" height="766">
      <p>Base de precios de construcción de República Dominicana,<br>
         publicada por Ingenieros Liberato &amp; Asociados.<br>
         Más de 40 años construyendo en el país.</p>
    </div>

    <nav class="footer-nav" aria-label="Navegación del pie">
      <div>
        <h3>Base de precios</h3>
        <ul>
          <li><a href="catalogo.html">Catálogo completo</a></li>
          <li><a href="precio-cemento-morteros-aditivos.html">Cemento</a></li>
          <li><a href="precio-varilla-acero.html">Varilla y acero</a></li>
          <li><a href="precio-blocks-prefabricados.html">Blocks</a></li>
          <li><a href="precio-jornal-mano-de-obra.html">Jornales</a></li>
        </ul>
      </div>
      <div>
        <h3>Referencia</h3>
        <ul>
          <li><a href="proveedores.html">Directorio de proveedores</a></li>
          <li><a href="metodologia.html">Metodología</a></li>
          <li><a href="metodologia.html#conversiones">Conversiones de unidad</a></li>
          <li><a href="metodologia.html#preguntas">Preguntas frecuentes</a></li>
        </ul>
      </div>
      <div>
        <h3>La empresa</h3>
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

const COTIZACION = `<!-- ============ LISTA DE COTIZACIÓN ============ -->
<button class="cot-fab" id="cot-fab" type="button" hidden aria-controls="cot-panel">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
  Mi lista <span class="cot-n" id="cot-n">0</span>
</button>

<div class="cot-overlay" id="cot-overlay"></div>

<aside class="cot-panel" id="cot-panel" aria-hidden="true" aria-label="Lista de cotización">
  <div class="cot-head">
    <h2>Mi lista de cotización</h2>
    <button class="cot-close" id="cot-close" type="button" aria-label="Cerrar lista">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
  </div>

  <div class="cot-body" id="cot-body"></div>

  <div class="cot-foot">
    <div class="cot-total">
      <span class="k">Estimado de referencia</span>
      <span class="v" id="cot-total">RD$ 0</span>
    </div>
    <p class="cot-nota">
      <span id="cot-nota-itbis"></span>
      Es un estimado con precios referenciales, no una cotización. Envíelo y le respondemos con precios de proveedor y disponibilidad.
    </p>
    <div class="cot-acciones">
      <button class="btn btn-wa" id="cot-wa" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5 0a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.2.1-.2 0-.4 0-.5s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3A2.9 2.9 0 0 0 6.8 12a5.1 5.1 0 0 0 1 2.2 11.5 11.5 0 0 0 4.5 3.9c1.6.6 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z"/></svg>
        Enviar por WhatsApp
      </button>
      <button class="btn btn-ghost" id="cot-copiar" type="button">Copiar lista</button>
      <button class="btn btn-ghost" id="cot-vaciar" type="button">Vaciar</button>
    </div>
  </div>
</aside>`;

const AVISO = `<div class="aviso">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 9v5M12 17.5h.01"/><path d="M10.3 3.9 1.9 18.4A2 2 0 0 0 3.6 21.4h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
  <p><strong>Precios de arranque, no cotizaciones.</strong> Los montos publicados hoy son
     estimaciones de referencia para el Gran Santo Domingo; ninguno proviene todavía de una
     cotización formal. Sirven para dimensionar un presupuesto, no para cerrar una compra.
     Cada ítem indica su estado y su fecha. <a href="metodologia.html">Cómo trabajamos los precios →</a></p>
</div>`;

/* ---------- fila de la tabla ---------- */

function badgeEstado(it) {
  if (it.estado === 'verificado') return '<span class="badge badge-verificado">Verificado</span>';
  if (it.estado === 'tarifario') return '<span class="badge badge-tarifario">Tarifario oficial</span>';
  return '<span class="badge badge-estimado">Estimado</span>';
}

function fila(it) {
  const pct = it.unidad === '%';
  let precio;
  if (it.ref === null) {
    precio = '<span class="precio-nulo">Según tarifario</span>';
  } else if (pct) {
    precio = `<span class="precio">${fmt(it.ref)} %</span>` +
             `<span class="precio-rango">${fmt(it.min)} – ${fmt(it.max)} %</span>`;
  } else {
    precio = `<span class="precio">${rd(it.ref)}</span>` +
             `<span class="precio-rango">${rd(it.min)} – ${rd(it.max)}</span>`;
  }

  const etapa = it.etapa && etapaPorCodigo[it.etapa] ? etapaPorCodigo[it.etapa].nombre : 'Transversal';

  return `          <tr>
            <td><span class="item-nombre">${esc(it.nombre)}</span>` +
      (it.esp ? `<span class="item-esp">${esc(it.esp)}</span>` : '') +
      (it.nota ? `<span class="item-esp">${esc(it.nota)}</span>` : '') + `</td>
            <td><span class="item-cod">${esc(it.codigo)}</span><br><span class="item-esp">${esc(etapa)}</span></td>
            <td class="unidad">${esc(it.unidad)}</td>
            <td class="num" data-precio-ref="${it.ref === null ? '' : it.ref}" data-precio-min="${it.min === null ? '' : it.min}" data-precio-max="${it.max === null ? '' : it.max}" data-precio-itbis="${it.itbis ? '1' : '0'}" data-precio-pct="${pct ? '1' : '0'}">${precio}</td>
            <td>${badgeEstado(it)}${it.itbis ? '' : ' <span class="badge badge-itbis">no lleva ITBIS</span>'}</td>
            <td class="num">` +
      (it.ref === null ? '' :
        `<button class="btn-add" type="button" data-add="${esc(it.codigo)}" data-nombre="${esc(it.nombre)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>`) + `</td>
          </tr>`;
}

/* ---------- bloques de la página ---------- */

function bloqueProveedores(codigo) {
  const lista = PROV.lista.filter((p) => p.cats.indexOf(codigo) !== -1);
  if (!lista.length) return '';

  const zonaNombre = (c) => (PROV.zonas.filter((z) => z.codigo === c)[0] || {}).nombre || c;
  const tipoNombre = (c) => (PROV.tipos.filter((t) => t.codigo === c)[0] || {}).nombre || c;

  const tarjetas = lista.slice(0, 6).map((p) => {
    const contactos = [];
    if (p.web) contactos.push(`<a href="https://${esc(p.web)}" target="_blank" rel="noopener nofollow">${esc(p.web)}</a>`);
    if (p.tel) contactos.push(`<a href="tel:${esc(p.tel.replace(/[^0-9+]/g, ''))}">${esc(p.tel)}</a>`);
    if (p.wa) contactos.push(`<a href="https://wa.me/${esc(p.wa)}" target="_blank" rel="noopener">WhatsApp</a>`);

    return `      <article class="prov">
        <div class="prov-top">
          <div><h3>${esc(p.nombre)}</h3><p class="prov-tipo">${esc(tipoNombre(p.tipo))}</p></div>
          <div style="display:flex;flex-direction:column;gap:.3rem;align-items:flex-end">${
            p.precios ? '<span class="badge badge-precios">Precios en línea</span>' : ''}${
            p.publico ? '<span class="badge badge-publico">Vende al público</span>' : '<span class="badge badge-canal">Solo vía distribución</span>'}</div>
        </div>
        <p class="prov-nota">${esc(p.nota)}</p>
        <div class="prov-cats">${p.zonas.map((z) => `<span class="tag">${esc(zonaNombre(z))}</span>`).join('')}</div>
        <div class="prov-contacto">${
          contactos.length ? contactos.join('') : '<span class="prov-sincontacto">Sin datos de contacto verificados públicamente.</span>'}</div>
      </article>`;
  }).join('\n');

  return `
<section class="section section-tint">
  <div class="shell">
    <div class="section-head">
      <p class="eyebrow">Dónde cotizar</p>
      <h2 class="section-title">Proveedores de esta categoría</h2>
      <p class="section-sub">${lista.length > 6
        ? `Seis de los ${lista.length} proveedores del directorio que cubren esta categoría.`
        : `Los ${lista.length} proveedores del directorio que cubren esta categoría.`} Solo publicamos contactos disponibles públicamente.</p>
    </div>
    <div class="grid grid-3">
${tarjetas}
    </div>
    <a class="btn btn-ghost" style="margin-top:1.5rem" href="proveedores.html?cat=${esc(codigo)}">Ver todos los proveedores de ${esc(catPorCodigo[codigo].nombre.toLowerCase())}</a>
  </div>
</section>`;
}

function bloqueRelacionadas(codigo) {
  const cat = catPorCodigo[codigo];
  const hermanas = CAT.categorias.filter((c) => c.grupo === cat.grupo && c.codigo !== codigo);
  const otras = CAT.categorias.filter((c) => c.grupo !== cat.grupo);
  const elegidas = hermanas.slice(0, 6).concat(otras.slice(0, 2));

  const conteo = {};
  CAT.items.forEach((i) => { conteo[i.cat] = (conteo[i.cat] || 0) + 1; });

  return `
<section class="section">
  <div class="shell">
    <div class="section-head">
      <p class="eyebrow">Seguir explorando</p>
      <h2 class="section-title">Otras categorías del catálogo</h2>
    </div>
    <div class="grid grid-4">
${elegidas.map((c) => `      <a class="card" href="${c.slug}.html">
        <span class="card-cod">${esc(c.codigo)}</span>
        <h3>${esc(c.nombre)}</h3>
        <p>${esc(c.desc)}</p>
        <span class="card-meta"><span>${conteo[c.codigo] || 0} ítems</span><span>Ver precios →</span></span>
      </a>`).join('\n')}
    </div>
  </div>
</section>`;
}

/* ---------- página completa ---------- */

function generarCategoria(cat) {
  const c = CONTENIDO[cat.codigo];
  const items = CAT.items.filter((i) => i.cat === cat.codigo);
  const conPrecio = items.filter((i) => i.ref !== null);
  const url = `${SITIO}/${cat.slug}.html`;
  const grupo = grupoPorCodigo[cat.grupo];

  const minimo = conPrecio.length ? Math.min.apply(null, conPrecio.map((i) => i.ref)) : null;
  const maximo = conPrecio.length ? Math.max.apply(null, conPrecio.map((i) => i.ref)) : null;
  const unidades = Array.from(new Set(items.map((i) => i.unidad)));

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Precios de construcción', item: SITIO + '/' },
          { '@type': 'ListItem', position: 2, name: 'Catálogo de precios', item: SITIO + '/catalogo.html' },
          { '@type': 'ListItem', position: 3, name: cat.nombre, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: c.faq.map(([p, r]) => ({
          '@type': 'Question', name: p,
          acceptedAnswer: { '@type': 'Answer', text: r },
        })),
      },
    ],
  };

  const resumen = conPrecio.length
    ? `<p class="section-sub" style="margin-top:1.2rem">
         <strong>${items.length} ${items.length === 1 ? 'ítem' : 'ítems'}</strong> en esta categoría,
         con precios de referencia entre ${rd(minimo)} y ${rd(maximo)}
         según el ítem y su unidad (${unidades.slice(0, 4).map(esc).join(', ')}${unidades.length > 4 ? '…' : ''}).
         Gran Santo Domingo, actualizado en septiembre de 2026.
       </p>`
    : `<p class="section-sub" style="margin-top:1.2rem"><strong>${items.length} ítems</strong> en esta categoría, sin monto publicado porque se liquidan según tarifario oficial.</p>`;

  const cuerpo = `
<section class="section" style="padding-bottom:1.5rem">
  <div class="shell">
    <nav class="miga" aria-label="Ruta de navegación">
      <a href="index.html">Precios de construcción</a> <span aria-hidden="true">›</span>
      <a href="catalogo.html">Catálogo</a> <span aria-hidden="true">›</span>
      <span>${esc(cat.nombre)}</span>
    </nav>

    <div class="section-head" style="margin-bottom:1.5rem">
      <p class="eyebrow">${esc(cat.codigo)} · ${esc(grupo.nombre)}</p>
      <h1 class="section-title">${esc(c.h1)}</h1>
    </div>

    <div class="prosa" style="max-width:74ch">
${c.intro.map((p) => `      <p>${p}</p>`).join('\n')}
    </div>

    ${resumen}
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="shell">
    ${AVISO}

    <div class="tools-row" style="margin-bottom:1rem;justify-content:flex-end">
      <label class="toggle-itbis"><input type="checkbox" id="f-itbis"> Ver sin ITBIS</label>
    </div>

    <div class="tabla-wrap">
      <table class="tabla">
        <caption class="visually-hidden">${esc(c.h1)} — precios de referencia</caption>
        <thead>
          <tr>
            <th scope="col">Ítem</th>
            <th scope="col">Código y etapa</th>
            <th scope="col">Unidad</th>
            <th scope="col" class="num">Precio de referencia</th>
            <th scope="col">Estado</th>
            <th scope="col" class="num"><span class="visually-hidden">Agregar a la lista</span></th>
          </tr>
        </thead>
        <tbody id="tabla-estatica">
${items.map(fila).join('\n')}
        </tbody>
      </table>
    </div>

    <p style="margin-top:1.2rem;font-size:.88rem;color:var(--ink-mute);max-width:74ch">
      ¿Busca algo que no está en esta tabla?
      <a href="catalogo.html?cat=${esc(cat.codigo)}">Abra el catálogo completo con buscador y filtros</a>
      o <a href="metodologia.html">lea cómo se arman estos precios</a>.
    </p>
  </div>
</section>

<section class="section section-tint">
  <div class="shell">
    <div class="section-head">
      <p class="eyebrow">Antes de cotizar</p>
      <h2 class="section-title">Qué mueve el precio en este rubro</h2>
    </div>
    <div class="grid grid-4">
${c.claves.map(([t, d]) => `      <div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('\n')}
    </div>
  </div>
</section>
${bloqueProveedores(cat.codigo)}

<section class="section">
  <div class="shell">
    <div class="section-head">
      <p class="eyebrow">Preguntas frecuentes</p>
      <h2 class="section-title">Dudas comunes sobre ${esc(cat.nombre.toLowerCase())}</h2>
    </div>
    <div class="faq prosa" style="max-width:74ch">
${c.faq.map(([p, r]) => `      <details><summary>${esc(p)}</summary><p>${esc(r)}</p></details>`).join('\n')}
    </div>
  </div>
</section>
${bloqueRelacionadas(cat.codigo)}

<section class="section cta">
  <div class="shell cta-inner">
    <div>
      <p class="eyebrow">Del estimado al presupuesto</p>
      <h2 class="section-title">¿Necesita un presupuesto real de esta partida?</h2>
      <p class="section-sub">
        Arme su lista con el botón <strong>+</strong> de la tabla y envíela por WhatsApp, o escríbanos
        directamente. Más de 40 años construyendo, diseñando y supervisando en toda la República Dominicana.
      </p>
    </div>
    <div class="cta-acciones">
      <a class="btn btn-primary btn-lg" href="${PRINCIPAL}/#contacto">Solicitar un presupuesto</a>
      <a class="btn btn-dark-ghost btn-lg" href="https://wa.me/${WA}?text=${encodeURIComponent('Hola, vengo de precios.ingsliberato.com y necesito un presupuesto de ' + cat.nombre.toLowerCase() + '.')}" target="_blank" rel="noopener">Escribir por WhatsApp</a>
    </div>
  </div>
</section>`;

  const html = `<!DOCTYPE html>
<html lang="es-DO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.titulo)}</title>
<meta name="description" content="${esc(c.desc)}">
<meta name="author" content="Ingenieros Liberato &amp; Asociados">
<meta name="theme-color" content="#0d2440">
<link rel="canonical" href="${url}">

<meta property="og:type" content="article">
<meta property="og:locale" content="es_DO">
<meta property="og:site_name" content="Precios de construcción RD — Ingenieros Liberato &amp; Asociados">
<meta property="og:title" content="${esc(c.titulo)}">
<meta property="og:description" content="${esc(c.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITIO}/assets/img/logo.png">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="assets/img/isotipo.png" type="image/png">
<link rel="apple-touch-icon" href="assets/img/isotipo.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/precios.css">

<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>
<body>

${header('catalogo')}

<main id="main">
${cuerpo}
</main>

${FOOTER}

${COTIZACION}

<script src="assets/js/datos-catalogo.js"></script>
<script src="assets/js/datos-proveedores.js"></script>
<script src="assets/js/app.js" defer></script>
</body>
</html>
`;

  fs.writeFileSync(path.join(DESTINO, cat.slug + '.html'), html);
  return { slug: cat.slug, items: items.length, bytes: html.length };
}

/* ---------- portada: bloques estáticos e indexables ----------
   La rejilla de categorías y los precios destacados se escriben en el HTML
   de index.html entre marcadores, para que los enlaces a las 27 páginas y
   los precios existan sin depender de JavaScript. */

function parchearPortada() {
  const archivo = path.join(DESTINO, 'index.html');
  let html = fs.readFileSync(archivo, 'utf8');

  const conteo = {};
  CAT.items.forEach((i) => { conteo[i.cat] = (conteo[i.cat] || 0) + 1; });

  const tarjetas = CAT.categorias.map((c) => `      <a class="card" href="${c.slug}.html">
        <span class="card-cod">${esc(c.codigo)}</span>
        <h3>${esc(c.nombre)}</h3>
        <p>${esc(c.desc)}</p>
        <span class="card-meta"><span>${conteo[c.codigo] || 0} ítems</span><span>Ver precios →</span></span>
      </a>`).join('\n');

  const destacados = [
    'MAT-02-001', 'MAT-04-002', 'MAT-05-003', 'MAT-03-002', 'MAT-01-001',
    'MAT-01-004', 'MAT-06-005', 'MAT-07-002', 'MOS-01-002', 'MOS-01-003',
  ].map((codigo) => {
    const it = CAT.items.filter((i) => i.codigo === codigo)[0];
    if (!it) throw new Error('Destacado inexistente: ' + codigo);
    const cat = catPorCodigo[it.cat];
    return `          <li class="destacado">
            <span class="destacado-n"><a href="${cat.slug}.html" style="text-decoration:none">${esc(it.nombre)}</a><small>${esc(it.esp || cat.nombre)}</small></span>
            <span class="destacado-p">${rd(it.ref)} <small style="font-weight:400;color:var(--ink-mute)">/ ${esc(it.unidad)}</small></span>
          </li>`;
  }).join('\n');

  const reemplazar = (marca, contenido) => {
    const re = new RegExp('(<!-- ' + marca + ':inicio -->)[\\s\\S]*?(<!-- ' + marca + ':fin -->)');
    if (!re.test(html)) throw new Error('No se encontró el marcador ' + marca + ' en index.html');
    html = html.replace(re, '$1\n' + contenido + '\n    $2');
  };

  reemplazar('categorias', `    <div class="grid grid-4" id="grid-categorias">\n${tarjetas}\n    </div>`);
  reemplazar('destacados', `        <ul id="destacados" style="margin-top:1.6rem">\n${destacados}\n        </ul>`);

  /* Cifras del hero: valor real en el HTML, el JS solo lo confirma. */
  const cifras = {
    'n-items': CAT.items.length,
    'n-cats': CAT.categorias.length,
    'n-prov': PROV.lista.length,
    'n-precios': PROV.lista.filter((p) => p.precios).length,
  };
  Object.keys(cifras).forEach((id) => {
    html = html.replace(
      new RegExp('(<span class="stat-num" id="' + id + '">)[^<]*(</span>)'),
      '$1' + cifras[id] + '$2'
    );
  });

  fs.writeFileSync(archivo, html);
  return CAT.categorias.length;
}

/* ---------- sitemap ---------- */

function generarSitemap() {
  const urls = [
    [SITIO + '/', 'weekly', '1.0'],
    [SITIO + '/catalogo.html', 'weekly', '0.9'],
    [SITIO + '/proveedores.html', 'monthly', '0.8'],
    [SITIO + '/metodologia.html', 'monthly', '0.6'],
  ];
  CAT.categorias.forEach((c) => urls.push([`${SITIO}/${c.slug}.html`, 'weekly', '0.8']));

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(([loc, freq, pri]) =>
      `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`
    ).join('\n') + '\n</urlset>\n';

  fs.writeFileSync(path.join(DESTINO, 'sitemap.xml'), xml);
  return urls.length;
}

/* ---------- ejecución ---------- */

let totalBytes = 0;
CAT.categorias.forEach((cat) => {
  if (!CONTENIDO[cat.codigo]) {
    console.error(`FALTA contenido editorial para ${cat.codigo}. Agregar en herramientas/contenido-categorias.js`);
    process.exit(1);
  }
  const r = generarCategoria(cat);
  totalBytes += r.bytes;
  console.log(`  ${r.slug}.html`.padEnd(48) + `${String(r.items).padStart(3)} ítems  ${(r.bytes / 1024).toFixed(0)} KB`);
});

console.log(`\n${CAT.categorias.length} páginas de categoría generadas (${(totalBytes / 1024).toFixed(0)} KB en total)`);
console.log(`index.html: ${parchearPortada()} enlaces de categoría escritos en el HTML`);
console.log(`sitemap.xml regenerado con ${generarSitemap()} URLs`);
