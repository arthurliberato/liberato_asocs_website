'use strict';
/* =========================================================
   generar-proyectos-venta.js — el listado y la ficha de cada
   proyecto inmobiliario en venta

       node herramientas/generar-proyectos-venta.js

   Escribe proyectos-en-venta.html y una proyecto-<slug>.html por cada
   entrada de assets/js/proyectos-venta.js, y actualiza el sitemap.

   POR QUÉ UNA PÁGINA POR PROYECTO
   Un proyecto en venta se comparte por WhatsApp y se busca por su
   nombre. Necesita URL propia, título propio y vista previa propia; en
   un bloque de la portada no tiene ninguna de las tres. El bloque de
   la portada también existe: lleva al listado, y el listado a la
   ficha. No compiten, se encadenan.

   LO QUE NO SE INVENTA
   Un metraje, un precio o una fecha de entrega que no están
   confirmados no se rellenan: la ficha dice que están pendientes. Es
   una oferta de venta de un inmueble, no una maqueta.
   ========================================================= */

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const SITIO = 'https://ingsliberato.com';
const INDEX = path.join(RAIZ, 'index.html');

global.window = global;
require(path.join(RAIZ, 'assets', 'js', 'proyectos-venta.js'));
const PROYECTOS = global.PROYECTOS_VENTA;

const esc = (t) => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- cabecera y pie, levantados de la portada ----------
   Se leen de index.html en vez de copiarse aquí: una copia se queda
   vieja el día que alguien toque el menú y nadie se entera. */
function trozo(html, apertura, cierre) {
  const i = html.indexOf(apertura);
  const j = html.indexOf(cierre, i);
  if (i < 0 || j < 0) throw new Error('No encuentro ' + apertura + ' en index.html');
  return html.slice(i, j + cierre.length);
}

function desdeLaPortada() {
  const html = fs.readFileSync(INDEX, 'utf8');
  /* Los anclas de la portada («#servicios») no llevan a ninguna parte
     desde una subpágina: se reescriben para volver a la portada. */
  const aPortada = (t) => t.replace(/href="#([a-z-]+)"/g, 'href="index.html#$1"');
  return {
    cabecera: aPortada(trozo(html, '<header class="site-header"', '</header>')),
    pie: aPortada(trozo(html, '<footer class="site-footer"', '</footer>'))
  };
}

/* ---------- lectura de un proyecto ---------- */
const ESTADO = {
  'preventa': 'En preventa',
  'en-construccion': 'En construcción',
  'terminado': 'Terminado'
};

const ubicacionTexto = (u) =>
  [u.sector, u.municipio, u.provincia === u.municipio ? null : u.provincia]
    .filter(Boolean).join(', ');

const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
             'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function entregaTexto(e) {
  if (!e) return null;
  const [a, m] = e.split('-');
  return MES[parseInt(m, 10) - 1] + ' de ' + a;
}

const dinero = (d) => d ? d.moneda + ' ' + Number(d.monto).toLocaleString('en-US') : null;

function tipologiaNombre(t) {
  return t.habitaciones + (t.habitaciones === 1 ? ' habitación' : ' habitaciones');
}

/* Un dato que no está confirmado se dice, no se rellena ni se deja en
   blanco: en blanco parece un error de la página. */
const PENDIENTE = '<span class="pendiente">Pendiente de confirmar</span>';
const dato = (v) => (v == null || v === '') ? PENDIENTE : esc(v);

/* ---------- las piezas ---------- */
function fichaDatos(p) {
  const filas = [
    ['Ubicación', ubicacionTexto(p.ubicacion)],
    ['Estado de la obra', ESTADO[p.estado] || null],
    ['Avance', p.avance == null ? null : p.avance + '%'],
    ['Entrega estimada', entregaTexto(p.entrega)],
    ['Niveles', p.niveles],
    ['Unidades', p.unidades]
  ];
  return `<dl class="pv-datos">
    ${filas.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${dato(v)}</dd></div>`).join('\n    ')}
  </dl>`;
}

function tablaTipologias(p) {
  const conPrecio = p.politicaPrecio === 'desde';
  const filas = p.tipologias.map((t) => `
      <tr>
        <td><strong>${esc(tipologiaNombre(t))}</strong></td>
        <td>${t.banos == null ? PENDIENTE : esc(t.banos)}</td>
        <td>${t.m2 == null ? PENDIENTE : esc(t.m2) + ' m²'}</td>
        ${conPrecio ? `<td class="pv-precio">${dinero(t.desde) ? 'Desde ' + esc(dinero(t.desde)) : PENDIENTE}</td>` : ''}
        <td>${t.disponibles == null ? PENDIENTE : esc(t.disponibles)}</td>
      </tr>`).join('');
  return `<div class="pv-tabla-caja">
    <table class="pv-tabla">
      <thead><tr>
        <th>Tipología</th><th>Baños</th><th>Área</th>${conPrecio ? '<th>Precio</th>' : ''}<th>Disponibles</th>
      </tr></thead>
      <tbody>${filas}
      </tbody>
    </table>
  </div>
  ${conPrecio ? '' : `<p class="pv-nota">El precio de este proyecto todavía no se publica: se da por contacto directo.</p>`}`;
}

function tarjeta(p) {
  const tip = p.tipologias.map(tipologiaNombre).join(' y ');
  return `      <li class="pv-tarjeta">
        <a href="proyecto-${esc(p.slug)}.html">
          <span class="pv-estado">${esc(ESTADO[p.estado] || 'En venta')}</span>
          <h3>${esc(p.nombre)}</h3>
          <p class="pv-loc">${esc(ubicacionTexto(p.ubicacion))}</p>
          <p class="pv-tip">${esc(tip)}${p.unidades ? ' · ' + p.unidades + ' unidades' : ''}</p>
          <span class="pv-ver">Ver el proyecto <span aria-hidden="true">&rarr;</span></span>
        </a>
      </li>`;
}

/* ---------- el documento ---------- */
function pagina({ titulo, desc, canonica, cuerpo, cabecera, pie }) {
  return `<!DOCTYPE html>
<html lang="es-DO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#f2efe2">
<link rel="canonical" href="${esc(canonica)}">

<meta property="og:type" content="website">
<meta property="og:locale" content="es_DO">
<meta property="og:site_name" content="Ingenieros Liberato &amp; Asociados">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITIO}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="assets/img/isotipo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css">
<noscript><style>.reveal{opacity:1;transform:none}</style></noscript>
</head>
<body>

<a class="skip-link" href="#main">Saltar al contenido</a>

${cabecera}

<main id="main">
${cuerpo}
</main>

${pie}

<script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}

const CONTACTO = (que) => `
<section class="section section-dark">
  <div class="shell">
    <div class="section-head">
      <p class="eyebrow">Interesado</p>
      <h2 class="section-title">${esc(que)}</h2>
      <p class="section-sub">Escríbanos y le damos disponibilidad, precios y condiciones al día.</p>
    </div>
    <div class="cta-acciones">
      <a class="btn btn-contacto btn-lg" href="index.html#contacto">Contáctanos</a>
      <a class="btn btn-ghost btn-lg" href="https://wa.me/18297939892?text=Hola%2C%20vengo%20de%20ingsliberato.com%20y%20me%20interesa%20un%20proyecto%20en%20venta." target="_blank" rel="noopener">Escribir por WhatsApp</a>
    </div>
  </div>
</section>`;

function main() {
  const { cabecera, pie } = desdeLaPortada();
  const escritos = [];

  /* --- el listado --- */
  const listado = pagina({
    titulo: 'Proyectos en venta | Ingenieros Liberato & Asociados',
    desc: 'Apartamentos en venta en proyectos residenciales en construcción de Ingenieros Liberato & Asociados en República Dominicana.',
    canonica: SITIO + '/proyectos-en-venta.html',
    cabecera, pie,
    cuerpo: `
<section class="section section-primera">
  <div class="shell">
    <div class="section-head">
      <p class="eyebrow">Proyectos en venta</p>
      <h1 class="section-title">Apartamentos en obras que estamos construyendo</h1>
      <p class="section-sub">
        Unidades disponibles en proyectos residenciales en curso. Los construimos nosotros,
        así que la información de avance y entrega viene de la obra, no de un folleto.
      </p>
    </div>
    <ul class="pv-lista">
${PROYECTOS.map(tarjeta).join('\n')}
    </ul>
  </div>
</section>
${CONTACTO('¿Le interesa alguna de estas unidades?')}`
  });
  fs.writeFileSync(path.join(RAIZ, 'proyectos-en-venta.html'), listado);
  escritos.push('proyectos-en-venta.html');

  /* --- una ficha por proyecto --- */
  for (const p of PROYECTOS) {
    const loc = ubicacionTexto(p.ubicacion);
    const tip = p.tipologias.map(tipologiaNombre).join(' y ');
    const html = pagina({
      titulo: `${p.nombre} — apartamentos en venta en ${p.ubicacion.municipio}`,
      desc: `Apartamentos de ${tip} en ${loc}. ${ESTADO[p.estado] || 'En venta'}, construido por Ingenieros Liberato & Asociados.`,
      canonica: `${SITIO}/proyecto-${p.slug}.html`,
      cabecera, pie,
      cuerpo: `
<section class="section section-primera">
  <div class="shell">
    <p class="miga"><a href="proyectos-en-venta.html">Proyectos en venta</a>
      <span aria-hidden="true">›</span> ${esc(p.nombre)}</p>
    <div class="section-head">
      <p class="eyebrow">${esc(ESTADO[p.estado] || 'En venta')}</p>
      <h1 class="section-title">${esc(p.nombre)}</h1>
      <p class="section-sub">${esc(loc)}</p>
      ${p.nombreProvisional ? `<p class="pv-provisional">El nombre comercial del proyecto está por definirse; aquí se identifica por su ubicación.</p>` : ''}
    </div>

    ${fichaDatos(p)}

    <h2 class="pv-h2">Tipologías</h2>
    ${tablaTipologias(p)}

    ${p.amenidades && p.amenidades.length ? `<h2 class="pv-h2">Amenidades</h2>
    <ul class="pv-amenidades">${p.amenidades.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
    ${p.financiamiento ? `<h2 class="pv-h2">Financiamiento</h2><p>${esc(p.financiamiento)}</p>` : ''}
  </div>
</section>
${CONTACTO('¿Le interesa este proyecto?')}`
    });
    const nombre = `proyecto-${p.slug}.html`;
    fs.writeFileSync(path.join(RAIZ, nombre), html);
    escritos.push(nombre);
  }

  /* --- el sitemap --- */
  const urls = [[SITIO + '/', 'monthly', '1.0'],
                [SITIO + '/proyectos-en-venta.html', 'weekly', '0.9']]
    .concat(PROYECTOS.map((p) => [`${SITIO}/proyecto-${p.slug}.html`, 'weekly', '0.8']));
  fs.writeFileSync(path.join(RAIZ, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map(([u, f, p]) =>
        `  <url>\n    <loc>${u}</loc>\n    <changefreq>${f}</changefreq>\n    <priority>${p}</priority>\n  </url>`).join('\n')
    + '\n</urlset>\n');

  console.log('Escritas %d páginas:', escritos.length);
  escritos.forEach((e) => console.log('   ' + e));
  console.log('sitemap.xml con %d URLs', urls.length);
}

main();
