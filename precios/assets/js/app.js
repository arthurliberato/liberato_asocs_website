/* =========================================================
   precios.ingsliberato.com — app.js
   Sin dependencias externas. Un solo archivo para todas las
   páginas: cada bloque se activa solo si su HTML está presente.
   ========================================================= */
(function () {
  'use strict';

  var CAT = window.CATALOGO || {items:[], categorias:[], grupos:[], etapas:[], conversiones:[], meta:{}};
  var PROV = window.PROVEEDORES || {lista:[], zonas:[], tipos:[], canales:[], meta:{}};
  var PRECIOS = window.PRECIOS || null;

  /* Une las cotizaciones por proveedor con el catálogo. Cuando un ítem tiene
     cotizaciones de proveedores que venden al público, su precio de referencia
     pasa a ser la mediana de esas cotizaciones. */
  if (PRECIOS) PRECIOS.aplicar(CAT, PROV);
  var ITBIS = (CAT.meta && CAT.meta.itbis) || 0.18;
  /* El alcance de casi todos los ítems (precio de mostrador); en la tabla
     solo se etiqueta el que se aparta de él. La ficha lo muestra siempre. */
  var ALCANCE_BASE = (CAT.meta && CAT.meta.alcanceBase) || '';
  var LS_KEY = 'ilya_precios_cotizacion_v1';

  /* ---------------- utilidades ---------------- */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function normaliza(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function fmt(n) {
    if (n === null || n === undefined) return '—';
    var dec = n < 100 ? (Math.round(n) === n ? 0 : 2) : 0;
    return n.toLocaleString('es-DO', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  }

  function rd(n) { return n === null || n === undefined ? '—' : 'RD$ ' + fmt(n); }

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Precio a mostrar según el interruptor de ITBIS.
     Un ítem con itbis:true trae el 18% incluido; con itbis:false no lo lleva
     (mano de obra, servicios) y nunca se le suma: solo se marca. */
  function precioVista(valor, item, sinItbis) {
    if (valor === null || valor === undefined) return null;
    if (sinItbis && item.itbis) return valor / (1 + ITBIS);
    return valor;
  }

  var catPorCodigo = {};
  CAT.categorias.forEach(function (c) { catPorCodigo[c.codigo] = c; });
  var etapaPorCodigo = {};
  CAT.etapas.forEach(function (e) { etapaPorCodigo[e.codigo] = e; });
  var itemPorCodigo = {};
  CAT.items.forEach(function (i) { itemPorCodigo[i.codigo] = i; });

  function nombreCat(codigo) { return catPorCodigo[codigo] ? catPorCodigo[codigo].nombre : codigo; }

  /* Cada categoría tiene su página estática; es a donde deben apuntar los
     enlaces internos, no al catálogo filtrado (./?cat=…). */
  function urlCat(codigo) {
    var c = catPorCodigo[codigo];
    return c && c.slug ? c.slug + '.html' : './?cat=' + encodeURIComponent(codigo);
  }

  /* El orden natural del catálogo es el de los grupos (MAT → MOS → EQU),
     no el alfabético del código. */
  var ordenGrupo = {};
  CAT.grupos.forEach(function (g, i) { ordenGrupo[g.codigo] = i; });
  function cmpCatalogo(a, b) {
    var ga = ordenGrupo[a.codigo.slice(0, 3)], gb = ordenGrupo[b.codigo.slice(0, 3)];
    if (ga !== gb) return ga - gb;
    return a.codigo.localeCompare(b.codigo, 'es');
  }

  var ICONO = {
    lupa:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    mas:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    equis:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    basura:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12"/></svg>',
    lista:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    wa:      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5 0a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.2.1-.2 0-.4 0-.5s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3A2.9 2.9 0 0 0 6.8 12a5.1 5.1 0 0 0 1 2.2 11.5 11.5 0 0 0 4.5 3.9c1.6.6 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z"/></svg>',
    tel:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5c0 8.3 6.7 15 15 15l1.5-3.2-4-1.8-1.7 1.9a12.4 12.4 0 0 1-6.7-6.7l1.9-1.7-1.8-4L5 4.9Z"/></svg>',
    mail:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/></svg>',
    copiar:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    proveedor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="width:15px;height:15px"><path d="M3 9h18l-1.5-4.5h-15L3 9Z"/><path d="M4.5 9v10.5h15V9"/><path d="M9.5 19.5V14h5v5.5"/></svg>',
    flecha:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    web:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/></svg>'
  };

  /* ---------------- menú móvil (todas las páginas) ---------------- */

  (function navMovil() {
    var toggle = $('#nav-toggle'), nav = $('#nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var abierto = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!abierto));
      toggle.setAttribute('aria-label', abierto ? 'Abrir menú' : 'Cerrar menú');
      nav.classList.toggle('is-open', !abierto);
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });
  })();

  (function anio() {
    var el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  })();

  /* =========================================================
     LISTA DE COTIZACIÓN
     Vive en localStorage y se comparte entre páginas.
     ========================================================= */

  /* Estado compartido: los filtros del catálogo y el interruptor de ITBIS
     también gobiernan cómo se muestran los montos de la lista de cotización. */
  var estado = {q: '', grupo: '', cat: '', etapa: '', gama: '', orden: 'cat', sinItbis: false};

  var cotizacion = cargarCotizacion();

  function cargarCotizacion() {
    try {
      var raw = window.localStorage.getItem(LS_KEY);
      var datos = raw ? JSON.parse(raw) : [];
      return Array.isArray(datos)
        ? datos.filter(function (l) { return l && itemPorCodigo[l.codigo]; })
        : [];
    } catch (e) { return []; }
  }

  function guardarCotizacion() {
    try { window.localStorage.setItem(LS_KEY, JSON.stringify(cotizacion)); } catch (e) { /* modo privado */ }
  }

  function enCotizacion(codigo) {
    return cotizacion.some(function (l) { return l.codigo === codigo; });
  }

  function agregarACotizacion(codigo) {
    if (enCotizacion(codigo)) return;
    cotizacion.push({codigo: codigo, cant: 1});
    guardarCotizacion();
    pintarCotizacion();
  }

  function quitarDeCotizacion(codigo) {
    cotizacion = cotizacion.filter(function (l) { return l.codigo !== codigo; });
    guardarCotizacion();
    pintarCotizacion();
    sincronizarBotonesTabla();
  }

  function totalCotizacion(sinItbis) {
    return cotizacion.reduce(function (acc, l) {
      var it = itemPorCodigo[l.codigo];
      if (!it || it.ref === null) return acc;
      var p = precioVista(it.ref, it, sinItbis);
      return acc + p * (parseFloat(l.cant) || 0);
    }, 0);
  }

  function pintarCotizacion() {
    var fab = $('#cot-fab'), cuerpo = $('#cot-body'), total = $('#cot-total'), n = $('#cot-n');
    if (fab) fab.hidden = cotizacion.length === 0;
    if (n) n.textContent = cotizacion.length;
    if (!cuerpo) return;

    var sinItbis = estado.sinItbis;

    if (!cotizacion.length) {
      cuerpo.innerHTML = '<p class="cot-vacio">Todavía no ha agregado ítems.<br>' +
        'Use el botón <strong>+</strong> del catálogo para armar su lista y enviarla por WhatsApp.</p>';
    } else {
      cuerpo.innerHTML = cotizacion.map(function (l) {
        var it = itemPorCodigo[l.codigo];
        var p = precioVista(it.ref, it, sinItbis);
        var sub = p === null ? null : p * (parseFloat(l.cant) || 0);
        return '<div class="cot-item" data-codigo="' + esc(it.codigo) + '">' +
            '<div><h4>' + esc(it.nombre) + '</h4><small>' + esc(it.codigo) + ' · ' + esc(nombreCat(it.cat)) + '</small></div>' +
            '<button class="cot-quitar" type="button" data-quitar="' + esc(it.codigo) + '" aria-label="Quitar ' + esc(it.nombre) + '">' + ICONO.basura + '</button>' +
            '<div class="cot-controles">' +
              '<input type="number" min="0" step="any" value="' + esc(l.cant) + '" data-cant="' + esc(it.codigo) + '" aria-label="Cantidad de ' + esc(it.nombre) + '">' +
              '<span class="cot-unidad">' + esc(it.unidad) + '</span>' +
              '<span class="cot-sub">' + (sub === null ? 'a cotizar' : rd(sub)) + '</span>' +
            '</div>' +
          '</div>';
      }).join('');
    }

    if (total) total.textContent = rd(totalCotizacion(sinItbis));
    var nota = $('#cot-nota-itbis');
    if (nota) nota.textContent = sinItbis ? 'Montos sin ITBIS.' : 'Montos como se muestran en el catálogo (los materiales incluyen ITBIS).';
  }

  function textoCotizacion() {
    var sinItbis = estado.sinItbis;
    var lineas = ['Solicitud de cotización — precios.ingsliberato.com', ''];
    cotizacion.forEach(function (l, i) {
      var it = itemPorCodigo[l.codigo];
      lineas.push((i + 1) + '. ' + it.nombre + ' — ' + l.cant + ' ' + it.unidad + ' (' + it.codigo + ')');
    });
    lineas.push('');
    lineas.push('Estimado de referencia: ' + rd(totalCotizacion(sinItbis)) + (sinItbis ? ' (sin ITBIS)' : ''));
    lineas.push('Los precios del sitio son referenciales; agradezco su cotización formal.');
    return lineas.join('\n');
  }

  (function panelCotizacion() {
    var panel = $('#cot-panel'), fab = $('#cot-fab'), overlay = $('#cot-overlay'), cerrar = $('#cot-close');
    if (!panel) { pintarCotizacion(); return; }

    function abrir() {
      panel.classList.add('is-open');
      if (overlay) overlay.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      if (cerrar) cerrar.focus();
    }
    function cerrarPanel() {
      panel.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      if (fab) fab.focus();
    }

    if (fab) fab.addEventListener('click', abrir);
    if (cerrar) cerrar.addEventListener('click', cerrarPanel);
    if (overlay) overlay.addEventListener('click', cerrarPanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) cerrarPanel();
    });

    panel.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-quitar]');
      if (btn) quitarDeCotizacion(btn.getAttribute('data-quitar'));
    });

    panel.addEventListener('input', function (e) {
      var input = e.target.closest('[data-cant]');
      if (!input) return;
      var codigo = input.getAttribute('data-cant');
      var linea = cotizacion.filter(function (l) { return l.codigo === codigo; })[0];
      if (!linea) return;
      linea.cant = input.value === '' ? '' : Math.max(0, parseFloat(input.value) || 0);
      guardarCotizacion();
      var it = itemPorCodigo[codigo];
      var p = precioVista(it.ref, it, estado.sinItbis);
      var sub = $('.cot-item[data-codigo="' + codigo + '"] .cot-sub', panel);
      if (sub) sub.textContent = p === null ? 'a cotizar' : rd(p * (parseFloat(linea.cant) || 0));
      var total = $('#cot-total');
      if (total) total.textContent = rd(totalCotizacion(estado.sinItbis));
    });

    var vaciar = $('#cot-vaciar');
    if (vaciar) vaciar.addEventListener('click', function () {
      cotizacion = [];
      guardarCotizacion();
      pintarCotizacion();
      sincronizarBotonesTabla();
    });

    var wa = $('#cot-wa');
    if (wa) wa.addEventListener('click', function () {
      if (!cotizacion.length) return;
      var url = 'https://wa.me/18297939892?text=' + encodeURIComponent(textoCotizacion());
      window.open(url, '_blank', 'noopener');
    });

    var copiar = $('#cot-copiar');
    if (copiar) copiar.addEventListener('click', function () {
      if (!cotizacion.length) return;
      var texto = textoCotizacion();
      var listo = function () {
        var previo = copiar.textContent;
        copiar.textContent = 'Copiado';
        window.setTimeout(function () { copiar.textContent = previo; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(listo, function () { window.prompt('Copie la lista:', texto); });
      } else {
        window.prompt('Copie la lista:', texto);
      }
    });

    pintarCotizacion();
  })();



  /* =========================================================
     AVISO DE MODO DEMOSTRACIÓN
     Mientras haya datos ficticios cargados, todas las páginas lo
     dicen arriba del todo. Se apaga solo al desactivar datos-demo.js.
     ========================================================= */

  (function avisoDemo() {
    if (!global_DEMO() || !document.body) return;

    /* Se puede cerrar, pero solo por la sesión del navegador: al volver otro
       día el aviso reaparece. Las etiquetas «Demostración» de cada ítem y la
       nota morada dentro de cada ficha no se pueden ocultar. */
    var LS_DEMO = 'ilya_precios_aviso_demo_cerrado';
    try {
      if (window.sessionStorage.getItem(LS_DEMO) === '1') return;
    } catch (e) { /* modo privado: se muestra igual */ }

    var barra = document.createElement('div');
    barra.className = 'barra-demo';
    barra.setAttribute('role', 'status');
    barra.innerHTML =
      '<div class="barra-demo-texto">' +
        '<span class="barra-demo-etiqueta">Modo demostración</span> ' +
        'Esta versión incluye <strong>proveedores y cotizaciones ficticios</strong>, marcados con la ' +
        'etiqueta <em>demo</em>, para mostrar cómo funcionará el sitio. Ningún proveedor real ha ' +
        'cotizado todavía y ninguno de estos precios es una oferta.' +
      '</div>' +
      '<button class="barra-demo-cerrar" type="button" aria-label="Cerrar el aviso de demostración">' +
        ICONO.equis +
      '</button>';

    barra.querySelector('.barra-demo-cerrar').addEventListener('click', function () {
      barra.remove();
      try { window.sessionStorage.setItem(LS_DEMO, '1'); } catch (e) { /* nada que guardar */ }
    });

    document.body.insertBefore(barra, document.body.firstChild);
  })();

  function global_DEMO() {
    return window.DEMO && window.DEMO.activo;
  }



  /* =========================================================
     FILA DE FILTROS EN UNA SOLA LÍNEA
     Se muestran las etapas que caben y el resto pasa a un menú
     desplegable, para que la barra no ocupe media pantalla.
     ========================================================= */

  function cerrarMenuChips() {
    $$('.chip-menu').forEach(function (m) { m.hidden = true; });
    $$('.chip-mas').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }

  function compactarChips(cont) {
    if (!cont) return;
    var mas = $('.chip-mas', cont);
    var menu = $('.chip-menu', cont);
    if (!mas || !menu) return;

    /* El menú es hijo del contenedor y sus opciones también son .chip, así
       que solo cuentan los hijos directos de la fila. */
    var chips = $$(':scope > .chip:not(.chip-mas)', cont);
    if (!chips.length) return;

    chips.forEach(function (c) { c.hidden = false; });
    mas.hidden = false;
    mas.textContent = '+0';

    var base = cont.firstElementChild.offsetTop;
    var ocultos = [];

    /* Se ocultan desde el final hasta que el botón del menú vuelva a la
       primera línea. El filtro activo nunca se oculta: si está aplicado,
       tiene que verse. */
    for (var i = chips.length - 1; i >= 0; i--) {
      if (mas.offsetTop <= base + 2) break;
      if (chips[i].getAttribute('aria-pressed') === 'true') continue;
      chips[i].hidden = true;
      ocultos.unshift(chips[i]);
      mas.textContent = '+' + ocultos.length;
    }

    if (!ocultos.length) {
      mas.hidden = true;
      menu.hidden = true;
      menu.innerHTML = '';
      return;
    }

    mas.textContent = '+' + ocultos.length;
    mas.setAttribute('aria-label', ocultos.length + ' etapas más');
    mas.title = ocultos.map(function (c) { return c.textContent; }).join(' · ');
    menu.innerHTML = ocultos.map(function (c) {
      return '<button class="chip" type="button" data-etapa="' + esc(c.getAttribute('data-etapa')) +
        '" aria-pressed="' + c.getAttribute('aria-pressed') + '">' + esc(c.textContent) + '</button>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var mas = e.target.closest('.chip-mas');
    if (mas) {
      var menu = $('.chip-menu', mas.parentNode);
      var abierto = mas.getAttribute('aria-expanded') === 'true';
      cerrarMenuChips();
      if (!abierto && menu) {
        menu.hidden = false;
        mas.setAttribute('aria-expanded', 'true');
      }
      return;
    }
    if (!e.target.closest('.chip-menu')) cerrarMenuChips();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarMenuChips();
  });

  function recompactarTodo() {
    $$('.filtros').forEach(function (f) {
      if ($('.chip-mas', f)) compactarChips(f);
    });
  }

  (function recompactar() {
    var t;
    window.addEventListener('resize', function () {
      window.clearTimeout(t);
      t = window.setTimeout(recompactarTodo, 150);
    });

    /* Las tipografías cargan de forma asíncrona y cambian el ancho de los
       chips: hay que volver a medir cuando estén listas, o el cálculo se
       hace sobre la fuente de reserva y sobran o faltan chips. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(recompactarTodo);
    } else {
      window.addEventListener('load', recompactarTodo);
    }
  })();

  /* =========================================================
     MIS PROVEEDORES
     Un visitante que ya trabaja con ciertos proveedores puede
     seleccionarlos y ver los precios calculados solo con sus
     cotizaciones. La selección vive en el navegador y se comparte
     entre páginas, igual que la lista de cotización.
     ========================================================= */

  var LS_PROV = 'ilya_precios_mis_proveedores_v1';
  var misProveedores = cargarMisProveedores();

  function cargarMisProveedores() {
    try {
      var raw = window.localStorage.getItem(LS_PROV);
      var datos = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(datos)) return [];
      var validos = {};
      PROV.lista.forEach(function (p) { validos[p.nombre] = true; });
      return datos.filter(function (n) { return validos[n]; });
    } catch (e) { return []; }
  }

  function guardarMisProveedores() {
    try { window.localStorage.setItem(LS_PROV, JSON.stringify(misProveedores)); } catch (e) { /* modo privado */ }
  }

  function aplicarFiltroProveedores() {
    if (PRECIOS) PRECIOS.recalcular(CAT, misProveedores);
    guardarMisProveedores();
    refrescarTodo();
  }

  function alternarProveedor(nombre) {
    var i = misProveedores.indexOf(nombre);
    if (i === -1) misProveedores.push(nombre);
    else misProveedores.splice(i, 1);
    aplicarFiltroProveedores();
  }

  /* ---------- repintado general tras cambiar el filtro ---------- */

  function badgeEstadoHTML(it) {
    if (it.estado === 'demo') return '<span class="badge badge-demo">Demostración</span>';
    if (it.estado === 'verificado') return '<span class="badge badge-verificado">Verificado</span>';
    if (it.estado === 'tarifario') return '<span class="badge badge-tarifario">Tarifario oficial</span>';
    return '<span class="badge badge-estimado">Estimado</span>';
  }

  function pintarCeldaPrecio(td, it) {
    var pct = it.unidad === '%';
    var p = precioVista(it.ref, it, estado.sinItbis);
    if (p === null) { td.innerHTML = '<span class="precio-nulo">Según tarifario</span>'; return; }
    /* Solo el precio de referencia. El rango y la mediana son análisis y
       van en el libro de Excel, no en la tabla del sitio. */
    td.innerHTML = pct ? '<span class="precio">' + fmt(p) + ' %</span>'
                       : '<span class="precio">' + rd(p) + '</span>';
    td.setAttribute('data-precio-ref', it.ref === null ? '' : it.ref);
  }

  /* Vuelve a pintar precios, etiquetas y fichas abiertas desde el objeto del
     ítem, no desde el HTML: es lo que permite que el filtro cambie los montos
     también en las páginas de categoría, que llegan ya renderizadas. */
  function refrescarTodo() {
    $$('tr[data-item]').forEach(function (tr) {
      var it = itemPorCodigo[tr.getAttribute('data-item')];
      if (!it) return;
      var celda = $('td[data-precio-ref]', tr);
      if (celda) pintarCeldaPrecio(celda, it);
      var estadoCelda = $('.celda-estado', tr);
      if (estadoCelda) {
        estadoCelda.innerHTML = badgeEstadoHTML(it) +
          (it.itbis ? '' : ' <span class="badge badge-itbis">no lleva ITBIS</span>') +
          (it.filtrado ? ' <span class="badge badge-filtrado">sus proveedores</span>' : '') +
          (it.sinCotizacionDelFiltro ? ' <span class="badge badge-itbis">sin cotización suya</span>' : '');
      }
      var detalle = tr.nextElementSibling;
      if (detalle && detalle.classList.contains('fila-detalle') && !detalle.hidden) {
        detalle.firstElementChild.innerHTML = detalleDe(it);
        repintarPrecios(detalle);
      }
    });

    if (window.__pintarCatalogo) window.__pintarCatalogo();
    if (window.__pintarProveedores) window.__pintarProveedores();

    pintarBarraFiltro();
    pintarPanelProveedores();
    pintarCotizacion();
  }

  /* ---------- barra de estado del filtro ---------- */

  function pintarBarraFiltro() {
    var barra = $('#barra-filtro');
    if (!barra) return;
    if (!misProveedores.length) { barra.hidden = true; return; }
    barra.hidden = false;
    var conCotizacion = CAT.items.filter(function (i) { return i.filtrado; }).length;
    barra.innerHTML =
      '<span class="barra-filtro-etiqueta">Sus proveedores</span> ' +
      'Precios calculados solo con <strong>' + misProveedores.length + '</strong> ' +
      (misProveedores.length === 1 ? 'proveedor' : 'proveedores') +
      ' que usted eligió. ' +
      (conCotizacion
        ? '<strong>' + conCotizacion + '</strong> ' + (conCotizacion === 1 ? 'ítem tiene' : 'ítems tienen') + ' cotización suya; el resto muestra la referencia general.'
        : 'Ninguno de los ítems tiene cotización de ellos todavía, así que se muestra la referencia general.') +
      ' <button type="button" class="link-reset" id="abrir-proveedores">Cambiar</button>' +
      ' <button type="button" class="link-reset" id="quitar-filtro">Quitar filtro</button>';
  }

  /* ---------- panel de selección ---------- */

  function crearPanelProveedores() {
    if ($('#prov-panel')) return;

    var overlay = document.createElement('div');
    overlay.className = 'cot-overlay';
    overlay.id = 'prov-overlay';

    var panel = document.createElement('aside');
    panel.className = 'cot-panel';
    panel.id = 'prov-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-label', 'Mis proveedores');
    panel.innerHTML =
      '<div class="cot-head">' +
        '<h2>Mis proveedores</h2>' +
        '<button class="cot-close" id="prov-close" type="button" aria-label="Cerrar">' +
          ICONO.equis + '</button>' +
      '</div>' +
      '<div class="prov-buscador">' +
        '<label class="visually-hidden" for="prov-filtro-q">Buscar proveedor</label>' +
        '<input id="prov-filtro-q" type="search" placeholder="Buscar proveedor…" autocomplete="off">' +
        '<p class="prov-ayuda">Marque los proveedores con los que trabaja. El precio de referencia ' +
        'de cada ítem pasa a calcularse solo con sus cotizaciones. Los ítems sin cotización de ellos ' +
        'siguen mostrando la referencia general.</p>' +
      '</div>' +
      '<div class="cot-body" id="prov-lista"></div>' +
      '<div class="cot-foot">' +
        '<div class="cot-total"><span class="k">Seleccionados</span><span class="v" id="prov-n">0</span></div>' +
        '<div class="cot-acciones">' +
          '<button class="btn btn-ghost" id="prov-limpiar" type="button">Quitar todos</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    function abrir() {
      panel.classList.add('is-open');
      overlay.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      $('#prov-close').focus();
    }
    function cerrar() {
      panel.classList.remove('is-open');
      overlay.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    }
    window.__abrirProveedores = abrir;

    $('#prov-close').addEventListener('click', cerrar);
    overlay.addEventListener('click', cerrar);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) cerrar();
    });
    $('#prov-limpiar').addEventListener('click', function () {
      misProveedores = [];
      aplicarFiltroProveedores();
    });
    $('#prov-filtro-q').addEventListener('input', function () { pintarPanelProveedores(); });
    $('#prov-lista').addEventListener('change', function (e) {
      var chk = e.target.closest('input[data-prov]');
      if (chk) alternarProveedor(chk.getAttribute('data-prov'));
    });
  }

  function pintarPanelProveedores() {
    var lista = $('#prov-lista');
    if (!lista) return;
    var q = normaliza(($('#prov-filtro-q') || {}).value || '');
    var nombreZona = function (c) {
      var z = PROV.zonas.filter(function (x) { return x.codigo === c; })[0];
      return z ? z.nombre : c;
    };

    var visibles = PROV.lista.filter(function (p) {
      if (!q) return true;
      return normaliza(p.nombre + ' ' + p.cats.join(' ') + ' ' + p.zonas.map(nombreZona).join(' ')).indexOf(q) !== -1;
    });

    lista.innerHTML = visibles.length
      ? visibles.map(function (p) {
          var marcado = misProveedores.indexOf(p.nombre) !== -1;
          return '<label class="prov-opcion' + (marcado ? ' is-marcado' : '') + '">' +
              '<input type="checkbox" data-prov="' + esc(p.nombre) + '"' + (marcado ? ' checked' : '') + '>' +
              '<span><span class="prov-opcion-n">' + esc(p.nombre) +
                (p.demo ? ' <span class="badge badge-demo">demo</span>' : '') + '</span>' +
              '<small>' + esc(p.zonas.map(nombreZona).join(' · ')) +
                (p.publico ? '' : ' · solo vía distribución') + '</small></span>' +
            '</label>';
        }).join('')
      : '<p class="cot-vacio">Ningún proveedor coincide con esa búsqueda.</p>';

    var n = $('#prov-n');
    if (n) n.textContent = misProveedores.length;

    $$('[data-abrir-proveedores] .prov-cuenta').forEach(function (el) {
      el.textContent = misProveedores.length ? '(' + misProveedores.length + ')' : '';
    });
  }

  /* Botón para abrir el panel, junto al interruptor de ITBIS. */
  function montarBotonProveedores() {
    var filas = $$('.tools-row');
    if (!filas.length) return;
    var destino = filas[filas.length - 1];
    if ($('[data-abrir-proveedores]', destino)) return;
    var boton = document.createElement('button');
    boton.className = 'btn btn-ghost btn-mini';
    boton.type = 'button';
    boton.setAttribute('data-abrir-proveedores', '');
    boton.innerHTML = ICONO.proveedor + ' Mis proveedores <span class="prov-cuenta"></span>';
    destino.appendChild(boton);
  }

  function montarBarraFiltro() {
    if ($('#barra-filtro')) return;
    var main = $('#main');
    if (!main) return;
    var barra = document.createElement('div');
    barra.className = 'barra-filtro';
    barra.id = 'barra-filtro';
    barra.setAttribute('role', 'status');
    barra.hidden = true;
    main.insertBefore(barra, main.firstChild);
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-abrir-proveedores]') || e.target.closest('#abrir-proveedores')) {
      if (window.__abrirProveedores) window.__abrirProveedores();
      return;
    }
    if (e.target.closest('#quitar-filtro')) {
      misProveedores = [];
      aplicarFiltroProveedores();
      return;
    }
    var estrella = e.target.closest('[data-prov-toggle]');
    if (estrella) {
      alternarProveedor(estrella.getAttribute('data-prov-toggle'));
      return;
    }
  });


  /* Arranque: aplica la selección guardada antes de que se pinte nada. */
  if (PRECIOS && misProveedores.length) PRECIOS.recalcular(CAT, misProveedores);
  crearPanelProveedores();
  montarBotonProveedores();
  montarBarraFiltro();
  pintarBarraFiltro();
  pintarPanelProveedores();


  /* =========================================================
     MATERIALES POR PROVEEDOR
     Para cada proveedor, los ítems del catálogo que caen en las
     categorías que cubre: el punto de partida para pedirle precios.
     De ahí salen la hoja de cálculo en blanco y el texto del RFQ.
     ========================================================= */

  function itemsDeProveedor(p) {
    return CAT.items.filter(function (it) {
      return it.ref !== null && p.cats.indexOf(it.cat) !== -1;
    });
  }

  function yaCotizo(it, nombre) {
    return (it.cotizaciones || []).some(function (q) { return q.proveedor.nombre === nombre; });
  }

  var matEstado = {proveedor: null, cat: '', soloPendientes: true};

  function crearPanelMateriales() {
    if ($('#mat-panel')) return;

    var overlay = document.createElement('div');
    overlay.className = 'cot-overlay';
    overlay.id = 'mat-overlay';

    var panel = document.createElement('aside');
    panel.className = 'cot-panel cot-panel-ancho';
    panel.id = 'mat-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-label', 'Materiales a cotizar');
    panel.innerHTML =
      '<div class="cot-head">' +
        '<div><h2 id="mat-titulo">Materiales a cotizar</h2>' +
          '<p class="mat-sub" id="mat-sub"></p></div>' +
        '<button class="cot-close" id="mat-close" type="button" aria-label="Cerrar">' + ICONO.equis + '</button>' +
      '</div>' +
      '<div class="mat-controles">' +
        '<label class="visually-hidden" for="mat-cat">Categoría</label>' +
        '<select class="select" id="mat-cat"></select>' +
        '<label class="toggle-itbis"><input type="checkbox" id="mat-pendientes" checked> Solo los que aún no ha cotizado</label>' +
      '</div>' +
      '<div class="cot-body" id="mat-lista"></div>' +
      '<div class="cot-foot">' +
        '<div class="cot-total"><span class="k">Ítems seleccionados</span><span class="v" id="mat-n">0</span></div>' +
        '<p class="cot-nota">Son los ítems del catálogo en las categorías que cubre este proveedor. ' +
          'Es un punto de partida para el RFQ, no su inventario real: confirme con él qué maneja.</p>' +
        '<div class="cot-acciones">' +
          '<button class="btn btn-wa" id="mat-wa" type="button">' + ICONO.wa + ' Enviar por WhatsApp</button>' +
          '<button class="btn btn-primary" id="mat-texto" type="button">Copiar solicitud</button>' +
          '<button class="btn btn-ghost" id="mat-tsv" type="button">Copiar para Excel</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    function cerrar() {
      panel.classList.remove('is-open');
      overlay.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    }
    $('#mat-close').addEventListener('click', cerrar);
    overlay.addEventListener('click', cerrar);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) cerrar();
    });

    $('#mat-cat').addEventListener('change', function () {
      matEstado.cat = this.value;
      pintarMateriales();
    });
    $('#mat-pendientes').addEventListener('change', function () {
      matEstado.soloPendientes = this.checked;
      pintarMateriales();
    });

    $('#mat-tsv').addEventListener('click', function () {
      var items = materialesVisibles();
      if (!items.length) return;
      copiarTexto(PRECIOS.aTSV(
        [PRECIOS.ENCABEZADOS_RFQ].concat(PRECIOS.filasRFQ(items, matEstado.proveedor.nombre, nombreCat)),
        false), this);
    });
    $('#mat-texto').addEventListener('click', function () {
      var items = materialesVisibles();
      if (!items.length) return;
      copiarTexto(PRECIOS.textoRFQ(items, matEstado.proveedor.nombre, nombreCat), this);
    });
    $('#mat-wa').addEventListener('click', function () {
      var items = materialesVisibles();
      if (!items.length) return;
      var p = matEstado.proveedor;
      var texto = PRECIOS.textoRFQ(items, p.nombre, nombreCat);
      var url = p.wa
        ? 'https://wa.me/' + p.wa + '?text=' + encodeURIComponent(texto)
        : 'https://wa.me/?text=' + encodeURIComponent(texto);
      window.open(url, '_blank', 'noopener');
    });
  }

  function materialesVisibles() {
    var p = matEstado.proveedor;
    if (!p) return [];
    return itemsDeProveedor(p).filter(function (it) {
      if (matEstado.cat && it.cat !== matEstado.cat) return false;
      if (matEstado.soloPendientes && yaCotizo(it, p.nombre)) return false;
      return true;
    });
  }

  function pintarMateriales() {
    var lista = $('#mat-lista');
    if (!lista || !matEstado.proveedor) return;
    var p = matEstado.proveedor;
    var items = materialesVisibles();

    var porCat = {};
    items.forEach(function (it) { (porCat[it.cat] = porCat[it.cat] || []).push(it); });

    lista.innerHTML = items.length
      ? Object.keys(porCat).map(function (c) {
          return '<div class="mat-grupo">' +
              '<p class="detalle-titulo">' + esc(nombreCat(c)) + ' · ' + porCat[c].length + '</p>' +
              porCat[c].map(function (it) {
                return '<div class="mat-item">' +
                    '<span class="mat-item-n">' + esc(it.nombre) +
                      (yaCotizo(it, p.nombre) ? ' <span class="badge badge-verificado">ya cotizó</span>' : '') + '</span>' +
                    '<small>' + esc(it.codigo) + ' · ' + esc(it.unidad) + (it.esp ? ' · ' + esc(it.esp) : '') + '</small>' +
                  '</div>';
              }).join('') +
            '</div>';
        }).join('')
      : '<p class="cot-vacio">No queda ningún ítem por cotizar con este filtro.</p>';

    var n = $('#mat-n');
    if (n) n.textContent = items.length;

    var wa = $('#mat-wa');
    if (wa) {
      wa.hidden = false;
      wa.lastChild.textContent = p.wa ? ' Enviar por WhatsApp' : ' Abrir en WhatsApp';
    }
  }

  function abrirMateriales(nombre) {
    var p = PROV.lista.filter(function (x) { return x.nombre === nombre; })[0];
    if (!p) return;
    crearPanelMateriales();
    matEstado.proveedor = p;
    matEstado.cat = '';
    matEstado.soloPendientes = true;

    $('#mat-titulo').textContent = 'Materiales a cotizar';
    $('#mat-sub').textContent = p.nombre;
    $('#mat-pendientes').checked = true;

    var usadas = {};
    itemsDeProveedor(p).forEach(function (it) { usadas[it.cat] = true; });
    $('#mat-cat').innerHTML = '<option value="">Todas sus categorías</option>' +
      CAT.categorias.filter(function (c) { return usadas[c.codigo]; })
        .map(function (c) { return '<option value="' + esc(c.codigo) + '">' + esc(c.codigo + ' · ' + c.nombre) + '</option>'; })
        .join('');
    $('#mat-cat').value = '';

    pintarMateriales();
    $('#mat-panel').classList.add('is-open');
    $('#mat-overlay').classList.add('is-open');
    $('#mat-panel').setAttribute('aria-hidden', 'false');
    $('#mat-close').focus();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-materiales]');
    if (b) abrirMateriales(b.getAttribute('data-materiales'));
  });

  /* =========================================================
     COPIAR AL PORTAPAPELES
     Todo se copia como TSV: es el formato que Excel, Google Sheets
     y Numbers reparten en columnas al pegar. Los montos van como
     número plano, sin símbolo ni separador de miles, para que la
     hoja los reconozca como números y no como texto.
     ========================================================= */

  function avisar(boton, texto) {
    if (!boton) return;
    var previo = boton.getAttribute('data-previo');
    if (previo === null) boton.setAttribute('data-previo', boton.innerHTML);
    boton.classList.add('copiado');
    boton.innerHTML = boton.classList.contains('btn-copiar')
      ? ICONO.check
      : texto;
    window.clearTimeout(boton._t);
    boton._t = window.setTimeout(function () {
      boton.innerHTML = boton.getAttribute('data-previo');
      boton.classList.remove('copiado');
    }, 1600);
  }

  function copiarTexto(texto, boton) {
    function alterno() {
      var ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-2000px';
      document.body.appendChild(ta);
      ta.select();
      var exito = false;
      try { exito = document.execCommand('copy'); } catch (e) { exito = false; }
      document.body.removeChild(ta);
      if (exito) avisar(boton, 'Copiado');
      else window.prompt('Copie con Ctrl+C:', texto);
    }
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(function () { avisar(boton, 'Copiado'); }, alterno);
    } else {
      alterno();
    }
  }

  /* Opciones de exportación: el precio copiado es el que se ve en pantalla,
     así que respeta el interruptor de ITBIS. */
  function opcionesExport() {
    return {
      nombreCat: nombreCat,
      sinItbis: estado.sinItbis,
      precio: function (valor, item) { return precioVista(valor, item, estado.sinItbis); }
    };
  }

  function filasDeItem(codigo) {
    var it = itemPorCodigo[codigo];
    if (!it || !PRECIOS) return [];
    return PRECIOS.filasItem(it, opcionesExport());
  }

  /* =========================================================
     REPINTAR PRECIOS AL CAMBIAR EL ITBIS
     Sirve igual para la tabla de una página estática y para los
     paneles de detalle que estén abiertos.
     ========================================================= */

  function repintarPrecios(raiz) {
    var sinItbis = estado.sinItbis;

    $$('[data-precio-ref]', raiz || document).forEach(function (el) {
      var crudo = el.getAttribute('data-precio-ref');
      if (crudo === '') return;
      var falso = {itbis: el.getAttribute('data-precio-itbis') === '1'};
      var pct = el.getAttribute('data-precio-pct') === '1';
      var v = function (attr) {
        var n = parseFloat(el.getAttribute(attr));
        return isNaN(n) ? null : precioVista(n, falso, sinItbis);
      };
      var ref = v('data-precio-ref');

      if (el.tagName === 'TD') {
        el.innerHTML = pct
          ? '<span class="precio">' + fmt(ref) + ' %</span>'
          : '<span class="precio">' + rd(ref) + '</span>';
      } else {
        el.textContent = pct ? fmt(ref) + ' %' : rd(ref);
      }
    });
  }

  /* =========================================================
     DETALLE POR PROVEEDOR
     El catálogo lo inserta al vuelo; las páginas de categoría lo
     traen ya escrito en el HTML y solo se muestra u oculta.
     ========================================================= */

  function detalleDe(it) {
    return PRECIOS.detalleHTML(it, {
      nombreCat: nombreCat,
      proveedoresCategoria: PROV.lista.filter(function (p) { return !p.demo && p.cats.indexOf(it.cat) !== -1; }),
      seleccion: misProveedores
    });
  }

  function alternarDetalle(boton) {
    var codigo = boton.getAttribute('data-detalle');
    var fila = boton.closest('tr');
    if (!fila) return;
    var abierto = boton.getAttribute('aria-expanded') === 'true';
    var siguiente = fila.nextElementSibling;
    var esDetalle = siguiente && siguiente.classList.contains('fila-detalle');

    if (abierto) {
      boton.setAttribute('aria-expanded', 'false');
      if (esDetalle) siguiente.hidden = true;
      return;
    }

    boton.setAttribute('aria-expanded', 'true');

    var it = itemPorCodigo[codigo];
    if (!it || !PRECIOS) return;

    /* Las páginas de categoría traen la ficha ya escrita en el HTML, que es lo
       que ve un buscador. Al abrirla se vuelve a generar desde los datos, para
       que refleje el filtro de proveedores y el interruptor de ITBIS actuales. */
    if (esDetalle) {
      siguiente.firstElementChild.innerHTML = detalleDe(it);
      siguiente.hidden = false;
      repintarPrecios(siguiente);
      return;
    }

    var tr = document.createElement('tr');
    tr.className = 'fila-detalle';
    var td = document.createElement('td');
    td.colSpan = fila.children.length;
    td.innerHTML = detalleDe(it);
    tr.appendChild(td);
    fila.parentNode.insertBefore(tr, fila.nextSibling);
    repintarPrecios(tr);
  }

  /* Manejadores globales: funcionan en el catálogo y en las páginas estáticas. */
  document.addEventListener('click', function (e) {
    var detalle = e.target.closest('[data-detalle]');
    if (detalle) { alternarDetalle(detalle); return; }

    var unaFila = e.target.closest('[data-copiar-precio]');
    if (unaFila) {
      var filas = filasDeItem(unaFila.getAttribute('data-copiar-precio'));
      var i = unaFila.getAttribute('data-copiar-indice');
      var fila = i === null ? filas[0] : filas[parseInt(i, 10) + 1];
      if (fila) copiarTexto(PRECIOS.aTSV([fila], false), unaFila);
      return;
    }

    var itemEntero = e.target.closest('[data-copiar-item]');
    if (itemEntero) {
      var todas = filasDeItem(itemEntero.getAttribute('data-copiar-item'));
      if (todas.length) copiarTexto(PRECIOS.aTSV(todas, false), itemEntero);
      return;
    }

    var tabla = e.target.closest('[data-copiar-tabla]');
    if (tabla) {
      var codigos = $$('[data-copiar-precio]:not([data-copiar-indice])').map(function (b) {
        return b.getAttribute('data-copiar-precio');
      });
      var vistos = {}, acumulado = [];
      codigos.forEach(function (c) {
        if (vistos[c]) return;
        vistos[c] = true;
        acumulado = acumulado.concat(filasDeItem(c));
      });
      if (acumulado.length) copiarTexto(PRECIOS.aTSV(acumulado, true), tabla);
      return;
    }
  });

  /* Agregar a la lista funciona igual en el catálogo y en las páginas
     estáticas de categoría, así que el manejador vive en el documento. */
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (!add) return;
    agregarACotizacion(add.getAttribute('data-add'));
    sincronizarBotonesTabla();
  });

  /* =========================================================
     CATÁLOGO: buscador, filtros y tabla
     ========================================================= */

  function sincronizarBotonesTabla() {
    $$('.btn-add').forEach(function (b) {
      var dentro = enCotizacion(b.getAttribute('data-add'));
      b.classList.toggle('is-added', dentro);
      b.innerHTML = dentro ? ICONO.check : ICONO.mas;
      b.setAttribute('aria-label', (dentro ? 'Ya está en la lista: ' : 'Agregar a la lista de cotización: ') + b.getAttribute('data-nombre'));
    });
  }

  (function catalogo() {
    var cuerpo = $('#tabla-body');
    if (!cuerpo) return;

    var input = $('#q'), selOrden = $('#orden'), selCat = $('#f-cat'),
        chkItbis = $('#f-itbis'), meta = $('#resultado-meta'), tablaWrap = $('#tabla-wrap'),
        vacio = $('#sin-resultados');

    /* --- estado inicial desde la URL --- */
    var params = new URLSearchParams(window.location.search);
    estado.q = params.get('q') || '';
    estado.grupo = params.get('grupo') || '';
    estado.cat = params.get('cat') || '';
    estado.etapa = params.get('etapa') || '';
    estado.gama = params.get('gama') || '';
    estado.orden = params.get('orden') || 'cat';

    /* --- poblar el selector de categorías --- */
    if (selCat) {
      selCat.innerHTML = '<option value="">Todas las categorías</option>' +
        CAT.grupos.map(function (g) {
          var opciones = CAT.categorias.filter(function (c) { return c.grupo === g.codigo; })
            .map(function (c) { return '<option value="' + esc(c.codigo) + '">' + esc(c.codigo + ' · ' + c.nombre) + '</option>'; })
            .join('');
          return '<optgroup label="' + esc(g.codigo + ' — ' + g.nombre) + '">' + opciones + '</optgroup>';
        }).join('');
      selCat.value = estado.cat;
    }

    /* --- chips de etapa --- */
    var chipsEtapa = $('#chips-etapa');
    if (chipsEtapa) {
      chipsEtapa.innerHTML = '<span class="chip-group-label">Etapa</span>' +
        CAT.etapas.map(function (e) {
          return '<button class="chip" type="button" data-etapa="' + esc(e.codigo) + '" aria-pressed="false">' + esc(e.nombre) + '</button>';
        }).join('') +
        '<button class="chip chip-mas" type="button" aria-expanded="false" aria-controls="chips-etapa-menu" hidden></button>' +
        '<div class="chip-menu" id="chips-etapa-menu" hidden></div>';
    }

    /* --- chips de gama --- */
    var chipsGama = $('#chips-gama');
    if (chipsGama) {
      chipsGama.innerHTML = '<span class="chip-group-label">Gama</span>' +
        [['economica', 'Económica'], ['estandar', 'Estándar'], ['premium', 'Premium']].map(function (g) {
          return '<button class="chip" type="button" data-gama="' + esc(g[0]) + '" aria-pressed="false">' + esc(g[1]) + '</button>';
        }).join('');
    }

    if (input) input.value = estado.q;
    if (selOrden) selOrden.value = estado.orden;

    function filtrar() {
      var q = normaliza(estado.q).split(/\s+/).filter(Boolean);
      return CAT.items.filter(function (it) {
        if (estado.cat && it.cat !== estado.cat) return false;
        if (estado.grupo && it.cat.indexOf(estado.grupo) !== 0) return false;
        if (estado.etapa && it.etapa !== estado.etapa) return false;
        if (estado.gama && it.gama !== estado.gama) return false;
        if (!q.length) return true;
        var heno = normaliza([it.nombre, it.codigo, it.esp, it.alias, it.unidad, nombreCat(it.cat)].join(' '));
        return q.every(function (t) { return heno.indexOf(t) !== -1; });
      });
    }

    /* Relevancia: con búsqueda activa manda el nombre del ítem, no el orden del
       catálogo. Así "varilla" devuelve varillas antes que un epóxico cuya
       descripción menciona la palabra. */
    function relevancia(it, q) {
      var nombre = normaliza(it.nombre);
      var puntos = 0;
      q.forEach(function (t) {
        if (nombre.indexOf(t) === 0) puntos += 3;
        else if (nombre.indexOf(' ' + t) !== -1) puntos += 2;
        else if (nombre.indexOf(t) !== -1) puntos += 1;
      });
      return puntos;
    }

    function ordenar(lista) {
      var copia = lista.slice();
      var q = normaliza(estado.q).split(/\s+/).filter(Boolean);
      if (q.length && estado.orden === 'cat') {
        copia.sort(function (a, b) {
          var d = relevancia(b, q) - relevancia(a, q);
          return d !== 0 ? d : cmpCatalogo(a, b);
        });
        return copia;
      }
      if (estado.orden === 'nombre') {
        copia.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); });
      } else if (estado.orden === 'precio-asc' || estado.orden === 'precio-desc') {
        var signo = estado.orden === 'precio-asc' ? 1 : -1;
        copia.sort(function (a, b) {
          if (a.ref === null) return 1;
          if (b.ref === null) return -1;
          return signo * (a.ref - b.ref);
        });
      } else {
        copia.sort(cmpCatalogo);
      }
      return copia;
    }

    function badgeEstado(it) {
      if (it.estado === 'demo') return '<span class="badge badge-demo">Demostración</span>';
      if (it.estado === 'verificado') return '<span class="badge badge-verificado">Verificado</span>';
      if (it.estado === 'tarifario') return '<span class="badge badge-tarifario">Tarifario oficial</span>';
      return '<span class="badge badge-estimado">Estimado</span>';
    }

    function fila(it) {
      var p = precioVista(it.ref, it, estado.sinItbis);
      var esPorcentaje = it.unidad === '%';

      var precioHtml;
      if (p === null) {
        precioHtml = '<span class="precio-nulo">Según tarifario</span>';
      } else if (esPorcentaje) {
        precioHtml = '<span class="precio">' + fmt(p) + ' %</span>';
      } else {
        precioHtml = '<span class="precio">' + rd(p) + '</span>';
      }

      return '<tr data-item="' + esc(it.codigo) + '">' +
          '<td><button class="item-toggle" type="button" data-detalle="' + esc(it.codigo) + '" aria-expanded="false">' +
                ICONO.flecha + '<span class="item-nombre">' + esc(it.nombre) + '</span></button>' +
              (it.esp ? '<span class="item-esp">' + esc(it.esp) + '</span>' : '') +
              (it.alcance && it.alcance !== ALCANCE_BASE ? '<span class="item-alcance">' + esc(it.alcance) + '</span>' : '') +
              (it.nota ? '<span class="item-esp">' + esc(it.nota) + '</span>' : '') + '</td>' +
          '<td><span class="item-cod">' + esc(it.codigo) + '</span><br>' +
              '<a class="item-esp" style="text-decoration:none" href="' + esc(urlCat(it.cat)) + '">' + esc(nombreCat(it.cat)) + '</a></td>' +
          '<td class="unidad">' + esc(it.unidad) + '</td>' +
          '<td class="num">' + precioHtml + '</td>' +
          '<td class="celda-estado">' + badgeEstado(it) +
              (it.itbis ? '' : ' <span class="badge badge-itbis">no lleva ITBIS</span>') +
              (it.filtrado ? ' <span class="badge badge-filtrado">sus proveedores</span>' : '') +
              (it.sinCotizacionDelFiltro ? ' <span class="badge badge-itbis">sin cotización suya</span>' : '') + '</td>' +
          '<td class="num acciones">' +
            '<button class="btn-copiar" type="button" data-copiar-precio="' + esc(it.codigo) + '" ' +
              'aria-label="Copiar ' + esc(it.nombre) + ' como fila de hoja de cálculo" ' +
              'title="Copiar como fila para Excel">' + ICONO.copiar + '</button>' +
            (it.ref === null ? '' :
              '<button class="btn-add" type="button" data-add="' + esc(it.codigo) + '" data-nombre="' + esc(it.nombre) + '">' + ICONO.mas + '</button>') +
          '</td>' +
        '</tr>';
    }

    function pintar() {
      var lista = ordenar(filtrar());

      if (meta) {
        meta.innerHTML = '<span><strong>' + lista.length + '</strong> ' +
          (lista.length === 1 ? 'ítem' : 'ítems') +
          (CAT.items.length !== lista.length ? ' de ' + CAT.items.length : '') + '</span>' +
          (hayFiltros() ? '<button class="link-reset" type="button" id="reset">Limpiar filtros</button>' : '');
        var reset = $('#reset');
        if (reset) reset.addEventListener('click', limpiar);
      }

      if (!lista.length) {
        if (tablaWrap) tablaWrap.hidden = true;
        if (vacio) vacio.hidden = false;
      } else {
        if (tablaWrap) tablaWrap.hidden = false;
        if (vacio) vacio.hidden = true;
        cuerpo.innerHTML = lista.map(fila).join('');
      }

      sincronizarBotonesTabla();
      actualizarURL();
    }

    function hayFiltros() {
      return !!(estado.q || estado.cat || estado.grupo || estado.etapa || estado.gama);
    }

    function limpiar() {
      estado.q = ''; estado.cat = ''; estado.grupo = ''; estado.etapa = ''; estado.gama = '';
      if (input) input.value = '';
      if (selCat) selCat.value = '';
      $$('[data-etapa],[data-gama]').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      pintar();
    }

    /* Se parte de la URL con la que llegó el visitante: los parámetros que no
       son del catálogo (utm, fbclid…) se conservan y solo se reescriben los
       seis del filtro. La ruta se normaliza a ./ para que /index.html no se
       cuele en la barra de direcciones ni en la URL que la gente copia. */
    function actualizarURL() {
      var p = new URLSearchParams(window.location.search);
      ['q', 'grupo', 'cat', 'etapa', 'gama', 'orden'].forEach(function (k) { p['delete'](k); });
      if (estado.q) p.set('q', estado.q);
      if (estado.grupo) p.set('grupo', estado.grupo);
      if (estado.cat) p.set('cat', estado.cat);
      if (estado.etapa) p.set('etapa', estado.etapa);
      if (estado.gama) p.set('gama', estado.gama);
      if (estado.orden !== 'cat') p.set('orden', estado.orden);
      var qs = p.toString();
      window.history.replaceState(null, '', './' + (qs ? '?' + qs : '') + window.location.hash);
    }

    /* --- eventos --- */
    if (input) {
      var t;
      input.addEventListener('input', function () {
        window.clearTimeout(t);
        t = window.setTimeout(function () { estado.q = input.value.trim(); pintar(); }, 140);
      });
    }
    if (selCat) selCat.addEventListener('change', function () { estado.cat = selCat.value; estado.grupo = ''; pintar(); });
    if (selOrden) selOrden.addEventListener('change', function () { estado.orden = selOrden.value; pintar(); });
    if (chkItbis) chkItbis.addEventListener('change', function () {
      estado.sinItbis = chkItbis.checked;
      pintar();
      pintarCotizacion();
    });

    document.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-etapa],[data-gama]');
      if (chip) {
        var esEtapa = chip.hasAttribute('data-etapa');
        var valor = chip.getAttribute(esEtapa ? 'data-etapa' : 'data-gama');
        var activo = chip.getAttribute('aria-pressed') === 'true';
        var attr = esEtapa ? 'data-etapa' : 'data-gama';
        $$('[' + attr + ']').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        /* El mismo filtro puede estar en la fila y en el menú desplegable:
           se marcan los dos, no solo el que se pulsó. */
        if (!activo) {
          $$('[' + attr + '="' + valor + '"]').forEach(function (c) { c.setAttribute('aria-pressed', 'true'); });
        }
        if (esEtapa) estado.etapa = activo ? '' : valor;
        else estado.gama = activo ? '' : valor;
        cerrarMenuChips();
        compactarChips(chipsEtapa);
        pintar();
        return;
      }
    });

    /* marcar chips que vengan en la URL */
    if (estado.etapa) {
      var ce = $('[data-etapa="' + estado.etapa + '"]');
      if (ce) ce.setAttribute('aria-pressed', 'true');
    }
    if (estado.gama) {
      var cg = $('[data-gama="' + estado.gama + '"]');
      if (cg) cg.setAttribute('aria-pressed', 'true');
    }

    window.__pintarCatalogo = pintar;
    pintar();
    compactarChips(chipsEtapa);
  })();

  /* =========================================================
     PORTADA: categorías y precios de referencia destacados
     ========================================================= */

  (function portada() {
    var gridCats = $('#grid-categorias');
    if (gridCats && !gridCats.children.length) {
      var conteo = {};
      CAT.items.forEach(function (i) { conteo[i.cat] = (conteo[i.cat] || 0) + 1; });
      gridCats.innerHTML = CAT.categorias.map(function (c) {
        return '<a class="card" href="' + esc(urlCat(c.codigo)) + '">' +
            '<span class="card-cod">' + esc(c.codigo) + '</span>' +
            '<h3>' + esc(c.nombre) + '</h3>' +
            '<p>' + esc(c.desc) + '</p>' +
            '<span class="card-meta"><span>' + (conteo[c.codigo] || 0) + ' ítems</span><span>Ver precios →</span></span>' +
          '</a>';
      }).join('');
    }

    var destacados = $('#destacados');
    if (destacados && !destacados.children.length) {
      var codigos = [
        'MAT-02-001', 'MAT-04-002', 'MAT-05-003', 'MAT-03-002', 'MAT-01-001',
        'MAT-01-004', 'MAT-06-005', 'MAT-07-002', 'MOS-01-002', 'MOS-01-003'
      ];
      destacados.innerHTML = codigos.map(function (c) {
        var it = itemPorCodigo[c];
        if (!it) return '';
        return '<li class="destacado">' +
            '<span class="destacado-n">' + esc(it.nombre) + '<small>' + esc(it.esp || nombreCat(it.cat)) + '</small></span>' +
            '<span class="destacado-p">' + rd(it.ref) + ' <small style="font-weight:400;color:var(--ink-mute)">/ ' + esc(it.unidad) + '</small></span>' +
          '</li>';
      }).join('');
    }

    var conv = $('#tabla-conversiones');
    if (conv) {
      conv.innerHTML = CAT.conversiones.map(function (c) {
        return '<tr><td><strong>' + esc(c.de) + '</strong></td><td>' + esc(c.a) + '</td></tr>';
      }).join('');
    }

    var canales = $('#tabla-canales');
    if (canales) {
      canales.innerHTML = PROV.canales.map(function (c) {
        return '<tr><td><strong>' + esc(c.rubro) + '</strong></td><td>' + esc(c.canal) + '</td><td>' + esc(c.fabricante) + '</td></tr>';
      }).join('');
    }

    /* cifras de la portada */
    var nItems = $('#n-items'), nCats = $('#n-cats');
    if (nItems) nItems.textContent = CAT.items.length;
    if (nCats) nCats.textContent = CAT.categorias.length;
  })();

  /* =========================================================
     PÁGINAS ESTÁTICAS DE CATEGORÍA
     La tabla llega renderizada desde el generador; aquí solo se
     recalculan los montos cuando se pide verlos sin ITBIS.
     ========================================================= */

  (function paginaCategoria() {
    var cuerpo = $('#tabla-estatica');
    if (!cuerpo) return;

    var chk = $('#f-itbis');
    if (chk) chk.addEventListener('change', function () {
      estado.sinItbis = chk.checked;
      repintarPrecios(document);
      pintarCotizacion();
    });

    sincronizarBotonesTabla();
  })();

  /* =========================================================
     PROVEEDORES
     ========================================================= */

  (function proveedores() {
    var grid = $('#grid-proveedores');
    if (!grid) return;

    var input = $('#q-prov'), selCat = $('#f-prov-cat'), selZona = $('#f-prov-zona'),
        meta = $('#prov-meta'), vacio = $('#prov-vacio');

    var f = {q: '', cat: '', zona: '', tipo: '', soloPublico: false, soloPrecios: false};

    var params = new URLSearchParams(window.location.search);
    f.cat = params.get('cat') || '';
    f.q = params.get('q') || '';

    if (selCat) {
      var usadas = {};
      PROV.lista.forEach(function (p) {
        if (p.demo) return;
        p.cats.forEach(function (c) { usadas[c] = true; });
      });
      selCat.innerHTML = '<option value="">Todas las categorías</option>' +
        CAT.categorias.filter(function (c) { return usadas[c.codigo]; })
          .map(function (c) { return '<option value="' + esc(c.codigo) + '">' + esc(c.codigo + ' · ' + c.nombre) + '</option>'; })
          .join('');
      selCat.value = f.cat;
    }
    if (selZona) {
      selZona.innerHTML = '<option value="">Toda la República Dominicana</option>' +
        PROV.zonas.map(function (z) { return '<option value="' + esc(z.codigo) + '">' + esc(z.nombre) + '</option>'; }).join('');
    }
    if (input) input.value = f.q;

    var chipsTipo = $('#chips-tipo');
    if (chipsTipo) {
      chipsTipo.innerHTML = '<span class="chip-group-label">Tipo</span>' +
        PROV.tipos.map(function (t) {
          return '<button class="chip" type="button" data-tipo="' + esc(t.codigo) + '" aria-pressed="false">' + esc(t.nombre) + '</button>';
        }).join('');
    }

    function nombreZona(c) {
      var z = PROV.zonas.filter(function (x) { return x.codigo === c; })[0];
      return z ? z.nombre : c;
    }
    function nombreTipo(c) {
      var t = PROV.tipos.filter(function (x) { return x.codigo === c; })[0];
      return t ? t.nombre : c;
    }

    function tarjeta(p) {
      var contactos = [];
      if (p.web) contactos.push('<a href="https://' + esc(p.web) + '" target="_blank" rel="noopener nofollow">' + ICONO.web + esc(p.web) + '</a>');
      if (p.tel) contactos.push('<a href="tel:' + esc(p.tel.replace(/[^0-9+]/g, '')) + '">' + ICONO.tel + esc(p.tel) + '</a>');
      if (p.wa) contactos.push('<a href="https://wa.me/' + esc(p.wa) + '" target="_blank" rel="noopener">' + ICONO.wa + 'WhatsApp</a>');
      if (p.email) contactos.push('<a href="mailto:' + esc(p.email) + '">' + ICONO.mail + esc(p.email) + '</a>');

      var elegido = misProveedores.indexOf(p.nombre) !== -1;
      return '<article class="prov' + (elegido ? ' prov-elegido' : '') + '">' +
          '<div class="prov-top">' +
            '<div><h3>' + esc(p.nombre) + '</h3><p class="prov-tipo">' + esc(nombreTipo(p.tipo)) + '</p></div>' +
            '<div style="display:flex;flex-direction:column;gap:.3rem;align-items:flex-end">' +
              (p.precios ? '<span class="badge badge-precios">Precios en línea</span>' : '') +
              (p.publico ? '<span class="badge badge-publico">Vende al público</span>' : '<span class="badge badge-canal">Solo vía distribución</span>') +
            '</div>' +
          '</div>' +
          '<p class="prov-nota">' + esc(p.nota) + '</p>' +
          '<div class="prov-cats">' +
            p.cats.map(function (c) { return '<span class="tag" title="' + esc(nombreCat(c)) + '">' + esc(c) + '</span>'; }).join('') +
            p.zonas.map(function (z) { return '<span class="tag">' + esc(nombreZona(z)) + '</span>'; }).join('') +
          '</div>' +
          '<div class="prov-contacto">' +
            (contactos.length ? contactos.join('') : '<span class="prov-sincontacto">Sin datos de contacto verificados públicamente.</span>') +
          '</div>' +
          '<div class="prov-acciones">' +
            '<button class="btn-elegir' + (elegido ? ' is-elegido' : '') + '" type="button" data-prov-toggle="' + esc(p.nombre) + '">' +
              (elegido ? ICONO.check + ' Trabajo con este' : ICONO.mas + ' Trabajar solo con este') +
            '</button>' +
            '<button class="btn-elegir" type="button" data-materiales="' + esc(p.nombre) + '">' +
              ICONO.lista + ' Materiales a cotizar (' + itemsDeProveedor(p).length + ')' +
            '</button>' +
          '</div>' +
        '</article>';
    }

    function pintar() {
      var q = normaliza(f.q).split(/\s+/).filter(Boolean);
      var lista = PROV.lista.filter(function (p) {
        if (p.demo) return false;
        if (f.cat && p.cats.indexOf(f.cat) === -1) return false;
        if (f.zona && p.zonas.indexOf(f.zona) === -1 && p.zonas.indexOf('nacional') === -1) return false;
        if (f.tipo && p.tipo !== f.tipo) return false;
        if (f.soloPublico && !p.publico) return false;
        if (f.soloPrecios && !p.precios) return false;
        if (!q.length) return true;
        var heno = normaliza([p.nombre, p.nota, p.web, p.cats.join(' '), nombreTipo(p.tipo)].join(' '));
        return q.every(function (t) { return heno.indexOf(t) !== -1; });
      });

      var totalReales = PROV.lista.filter(function (p) { return !p.demo; }).length;
      if (meta) meta.innerHTML = '<span><strong>' + lista.length + '</strong> ' +
        (lista.length === 1 ? 'proveedor' : 'proveedores') +
        (lista.length !== totalReales ? ' de ' + totalReales : '') + '</span>';

      grid.innerHTML = lista.map(tarjeta).join('');
      if (vacio) vacio.hidden = lista.length > 0;
      grid.hidden = lista.length === 0;
    }

    if (input) {
      var t;
      input.addEventListener('input', function () {
        window.clearTimeout(t);
        t = window.setTimeout(function () { f.q = input.value.trim(); pintar(); }, 140);
      });
    }
    if (selCat) selCat.addEventListener('change', function () { f.cat = selCat.value; pintar(); });
    if (selZona) selZona.addEventListener('change', function () { f.zona = selZona.value; pintar(); });

    var chkPublico = $('#f-prov-publico');
    if (chkPublico) chkPublico.addEventListener('change', function () { f.soloPublico = chkPublico.checked; pintar(); });
    var chkPrecios = $('#f-prov-precios');
    if (chkPrecios) chkPrecios.addEventListener('change', function () { f.soloPrecios = chkPrecios.checked; pintar(); });

    document.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-tipo]');
      if (!chip) return;
      var activo = chip.getAttribute('aria-pressed') === 'true';
      $$('[data-tipo]').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', String(!activo));
      f.tipo = activo ? '' : chip.getAttribute('data-tipo');
      pintar();
    });

    window.__pintarProveedores = pintar;
    pintar();
  })();

})();
