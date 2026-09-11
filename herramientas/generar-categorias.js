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
require(path.join(DESTINO, 'assets/js/datos-precios.js'));
require(path.join(DESTINO, 'assets/js/datos-demo.js'));
const CAT = global.window.CATALOGO;
const PROV = global.window.PROVEEDORES;
const PRECIOS = global.window.PRECIOS;
const CONTENIDO = require('./contenido-categorias.js');

/* Une las cotizaciones por proveedor con el catálogo antes de generar nada.
   Si una cotización apunta a un ítem o a un proveedor que no existe, se
   aborta: es preferible fallar aquí que publicar una ficha rota. */
const problemas = PRECIOS.aplicar(CAT, PROV);
if (problemas.length) {
  console.error('Errores en datos-precios.js:');
  problemas.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}

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
/* En la tabla solo se etiqueta el alcance que se aparta del de mostrador. */
const ALCANCE_BASE = (CAT.meta && CAT.meta.alcanceBase) || '';

/* El encabezado y el pie viven en su propio módulo desde que hay dos
   generadores que los usan. */
const { header, FOOTER } = require('./plantilla-precios.js');

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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/></svg>
  <p><strong>Precios compartidos por proveedores, no cotizaciones.</strong> Cada ítem lleva el precio que el
     propio comercio publica en línea o cotizó por escrito, con su fecha, y sale marcado como
     <em>Verificado</em>. Ninguno es una cotización formal a su nombre: sirven para dimensionar
     un presupuesto, no para cerrar una compra.</p>
</div>`;

/* ---------- fila de la tabla ---------- */

/* La columna «Última actualización» se calcula en el navegador, porque
   envejece cada día. El HTML trae la fecha en data-fecha y, como texto de
   respaldo sin JavaScript, la fecha misma: así el archivo no cambia de un
   día para otro y la regeneración sigue siendo idempotente. */
/* Los dos botones de copiar de la fila: el del precio copia el número; el
   de la última columna, la fila tal como se ve. app.js hace el trabajo. */
const ICONO_COPIAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
function botonCopiarPrecio(it) {
  return ` <button class="btn-copiar btn-copiar-precio" type="button" data-copiar-monto="${esc(it.codigo)}" aria-label="Copiar el precio de ${esc(it.nombre)}" title="Copiar el precio">${ICONO_COPIAR}</button>`;
}
/* Mismo criterio que app.js: un tag por comercio que vende al público y en
   la misma unidad; el nombre corto, sin «Ferretería» ni paréntesis. */
function nombreTag(nombre) {
  return String(nombre).replace(/\s*\([^)]*\)\s*/g, '').replace(/^Ferreter[ií]a\s+/i, '').trim();
}
function tagsProveedores(it) {
  const vistos = new Set();
  const qs = (it.cotizaciones || []).filter((q) => q.cuenta && !vistos.has(q.proveedor.nombre) && vistos.add(q.proveedor.nombre));
  if (!qs.length) return '';
  return '<span class="item-provs">' + qs.map((q) => {
    const titulo = 'RD$ ' + Math.round(q.precioNormalizado).toLocaleString('en-US') + (q.fecha ? ' · ' + q.fecha : '') + (q.nota ? ' · ' + String(q.nota).slice(0, 160) : '');
    return `<button class="tag-prov" type="button" data-item-prov="${esc(it.codigo)}" data-prov="${esc(q.proveedor.nombre)}" aria-pressed="false" title="${esc(titulo)}">${esc(nombreTag(q.proveedor.nombre))}</button>`;
  }).join('') + '</span>';
}
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function badgeFecha(it) {
  const f = String(it.fecha || '');
  const p = f.split('-');
  const texto = p.length >= 3 ? `${+p[2]} ${MESES[+p[1] - 1]} ${p[0]}`
              : p.length === 2 ? `${MESES[+p[1] - 1]} ${p[0]}` : 'sin fecha';
  return `<span class="badge badge-viejo" data-fecha="${esc(f)}" title="${esc(f || 'sin fecha')}">${esc(texto)}</span>`;
}

function fila(it) {
  const pct = it.unidad === '%';
  let precio;
  if (it.ref === null) {
    precio = '<span class="precio-nulo">Según tarifario</span>';
  } else if (pct) {
    /* Sin el rango debajo: el sitio muestra un precio de referencia y la
       lista de cotizaciones reales. La mediana, el mínimo y el máximo son
       herramientas de análisis y viven en el libro de Excel. */
    precio = `<span class="precio">${fmt(it.ref)} %</span>`;
  } else {
    precio = `<span class="precio">${rd(it.ref)}</span>`;
  }

  const etapa = it.etapa && etapaPorCodigo[it.etapa] ? etapaPorCodigo[it.etapa].nombre : 'Transversal';

  /* Bajo el nombre, un tag por comercio que vende el ítem; app.js hace que
     al pulsarlo la fila muestre el precio de ese comercio. */

  return `          <tr data-item="${esc(it.codigo)}">
            <td><span class="item-nombre">${esc(it.nombre)}</span>` +
      (it.alcance && it.alcance !== ALCANCE_BASE ? `<span class="item-alcance">${esc(it.alcance)}</span>` : '') + tagsProveedores(it) + `</td>
            <td><span class="item-esp">${esc(etapa)}</span></td>
            <td class="unidad">${esc(it.unidad)}</td>
            <td class="num" data-precio-ref="${it.ref === null ? '' : it.ref}" data-precio-itbis="${it.itbis ? '1' : '0'}" data-precio-pct="${pct ? '1' : '0'}">${precio}${it.ref === null ? '' : botonCopiarPrecio(it)}</td>
            <td class="celda-estado">${badgeFecha(it)}${it.itbis ? '' : ' <span class="badge badge-itbis">no lleva ITBIS</span>'}</td>
            <td class="num acciones"><button class="btn-copiar" type="button" data-copiar-fila="${esc(it.codigo)}" aria-label="Copiar la fila de ${esc(it.nombre)}" title="Copiar la fila">${ICONO_COPIAR}</button></td>
          </tr>`;
}

/* Enlace al libro de Excel. Lo genera herramientas/generar-excel.py y va
   commiteado en precios/descargas/, así que aquí es un enlace y ya: no hay
   que armar el archivo en el navegador ni cargar una librería para eso. */
const ENLACE_EXCEL =
  '<a class="btn btn-ghost btn-mini" href="descargas/precios-construccion-rd.xlsx" download>' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="width:15px;height:15px">' +
  '<path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>' +
  ' Descargar en Excel</a>';

/* ---------- bloques de la página ---------- */

function bloqueProveedores(codigo) {
  const lista = PROV.lista.filter((p) => !p.demo && p.cats.indexOf(codigo) !== -1);
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
  /* La zona no es la misma en todas las categorías: el alquiler de
     plataformas lo cotiza un comercio de Bávaro, no del Gran Santo Domingo.
     Se saca de quién cotizó de verdad, no de un valor fijo. */
  const zonasDeLaCategoria = (items) => {
    const codigos = new Set();
    /* c.proveedor ya es el objeto del comercio, no su nombre. */
    items.forEach((i) => (i.cotizaciones || []).forEach((c) => {
      const p = c.proveedor;
      if (p && p.zonas) p.zonas.forEach((z) => codigos.add(z));
    }));
    if (codigos.has('nacional') || codigos.size === 0) return 'Cobertura nacional';
    const nombre = (c) => (PROV.zonas.filter((z) => z.codigo === c)[0] || {}).nombre || c;
    const nombres = Array.from(codigos).map(nombre).sort();
    return nombres.length > 2
      ? nombres.slice(0, 2).join(', ') + ' y otras zonas'
      : nombres.join(' y ');
  };

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
          { '@type': 'ListItem', position: 1, name: 'Catálogo de precios', item: SITIO + '/' },
          { '@type': 'ListItem', position: 2, name: cat.nombre, item: url },
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
         ${zonasDeLaCategoria(items)}, actualizado en septiembre de 2026.
       </p>`
    : `<p class="section-sub" style="margin-top:1.2rem"><strong>${items.length} ítems</strong> en esta categoría, sin monto publicado porque se liquidan según tarifario oficial.</p>`;

  const cuerpo = `
<section class="section section-primera">
  <div class="shell">
    <nav class="miga" aria-label="Ruta de navegación">
      <a href="./">Catálogo de precios</a> <span aria-hidden="true">›</span>
      <span aria-current="page">${esc(cat.nombre)}</span>
    </nav>

    <div class="section-head" style="margin-bottom:1.5rem">
      <p class="eyebrow">${esc(grupo.nombre)}</p>
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
      <button class="btn btn-ghost btn-mini" type="button" data-copiar-tabla>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="width:15px;height:15px"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
        Copiar tabla
      </button>
      ${ENLACE_EXCEL}
    </div>

    <div class="tabla-wrap">
      <table class="tabla">
        <caption class="visually-hidden">${esc(c.h1)} — precios de referencia</caption>
        <thead>
          <tr>
            <th scope="col">Ítem</th>
            <th scope="col">Etapa</th>
            <th scope="col">Unidad</th>
            <th scope="col" class="num">Precio de referencia</th>
            <th scope="col">Última actualización</th>
            <th scope="col" class="num">Copiar fila</th>
          </tr>
        </thead>
        <tbody id="tabla-estatica">
${items.map(fila).join('\n')}
        </tbody>
      </table>
    </div>
      <div class="tabla-mas" id="tabla-mas" hidden></div>

    <p style="margin-top:1.2rem;font-size:.88rem;color:var(--ink-mute);max-width:74ch">
      Bajo cada ítem están los comercios que lo venden: pulse uno y el precio de la fila pasa
      a ser el suyo, con su fecha; púlselo otra vez y vuelve la referencia del mercado. El
      botón junto al precio copia solo el número; el de la última columna copia la fila tal
      como se ve, separada por tabuladores. Salvo que el ítem diga otra cosa, el precio es
      de mostrador: material retirado en almacén, sin transporte.
    </p>

    <p style="margin-top:.6rem;font-size:.88rem;color:var(--ink-mute);max-width:74ch">
      ¿Busca algo que no está en esta tabla?
      <a href="./?cat=${esc(cat.codigo)}">Abra el catálogo completo con buscador y filtros</a>.
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
<meta name="theme-color" content="#f2efe2">
<link rel="canonical" href="${url}">

<meta property="og:type" content="article">
<meta property="og:locale" content="es_DO">
<meta property="og:site_name" content="Precios de construcción RD — Ingenieros Liberato &amp; Asociados">
<meta property="og:title" content="${esc(c.titulo)}">
<meta property="og:description" content="${esc(c.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITIO}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="assets/img/isotipo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">

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

<aside class="franja-negocio">
  <div class="shell franja-negocio-inner">
    <p class="franja-servicios">Construcción <span aria-hidden="true">·</span> Diseño <span aria-hidden="true">·</span> Supervisión</p>
  </div>
</aside>

<main id="main">
${cuerpo}
</main>

${FOOTER}

${COTIZACION}

<script src="assets/js/datos-catalogo.js"></script>
<script src="assets/js/datos-proveedores.js"></script>
<script src="assets/js/datos-precios.js"></script>
<script src="assets/js/datos-demo.js"></script>
<script src="assets/js/app.js" defer></script>
</body>
</html>
`;

  fs.writeFileSync(path.join(DESTINO, cat.slug + '.html'), html);
  return { slug: cat.slug, items: items.length, bytes: html.length };
}

/* ---------- portada: bloques estáticos e indexables ----------
   index.html es el catálogo. Debajo de la tabla de resultados, la rejilla de
   categorías y los precios destacados se escriben en el HTML entre marcadores,
   para que los enlaces a las 41 páginas y los precios existan sin depender de
   JavaScript: la tabla del catálogo se sirve vacía y la pinta app.js. */

function parchearPortada() {
  const archivo = path.join(DESTINO, 'index.html');
  let html = fs.readFileSync(archivo, 'utf8');

  /* La portada es la tabla del catálogo y nada más: la rejilla de categorías
     y los destacados salieron de ahí, así que aquí solo quedan las cifras
     del encabezado. */

  /* Cifras del encabezado: valor real en el HTML, el JS solo lo confirma.
     Las del directorio (proveedores, cuántos publican precios) ya no van
     en la portada: pertenecen a proveedores.html. */
  const cifras = {
    'n-items': CAT.items.length,
    'n-cats': CAT.categorias.length,
  };
  Object.keys(cifras).forEach((id) => {
    const re = new RegExp('(<span class="stat-num" id="' + id + '">)[^<]*(</span>)');
    /* String.replace no protesta cuando no encuentra nada: sin esta
       comprobación las cifras se congelarían en silencio. */
    if (!re.test(html)) throw new Error('No se encontró la cifra ' + id + ' en index.html');
    html = html.replace(re, '$1' + cifras[id] + '$2');
  });

  fs.writeFileSync(archivo, html);
  return Object.keys(cifras).length;
}

/* ---------- sitemap ---------- */

function generarSitemap() {
  const urls = [
    [SITIO + '/', 'weekly', '1.0'],
    [SITIO + '/interiorismo.html', 'weekly', '0.9'],
    [SITIO + '/proveedores.html', 'monthly', '0.8'],
    [SITIO + '/quienes-somos.html', 'yearly', '0.5'],
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
console.log(`index.html: ${parchearPortada()} cifras del encabezado actualizadas`);
console.log(`sitemap.xml regenerado con ${generarSitemap()} URLs`);
