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
    /* Este va dos veces por fila; en una tabla larga son miles de copias del
       mismo dibujo. Se declara una vez en el HTML (ver SPRITE en
       herramientas/plantilla-precios.js) y aquí solo se referencia. */
    copiar:  '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-copiar"/></svg>',
    flechaIzq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>',
    flechaDer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg>',
    wa:      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5 0a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.2.1-.2 0-.4 0-.5s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3A2.9 2.9 0 0 0 6.8 12a5.1 5.1 0 0 0 1 2.2 11.5 11.5 0 0 0 4.5 3.9c1.6.6 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z"/></svg>',
    correo:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    proveedor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="width:15px;height:15px"><path d="M3 9h18l-1.5-4.5h-15L3 9Z"/><path d="M4.5 9v10.5h15V9"/><path d="M9.5 19.5V14h5v5.5"/></svg>',
    flecha:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    web:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/></svg>'
  };

  /* =========================================================
     LO QUE SE QUEDA ARRIBA AL BAJAR

     Al bajar por una tabla de ochocientas filas, lo que hace falta a
     la vista no son los filtros —ya se aplicaron— sino saber qué
     columna se está leyendo. Así que la cabecera de la tabla se pega
     siempre, y la barra de filtros se repliega al bajar hasta dejar
     solo el buscador y sus acciones, que es lo único que se usa a
     media tabla. Al subir vuelve entera.

     Las dos alturas van a variables de CSS porque de ellas cuelga
     dónde se pega la cabecera de la tabla, y la de la barra cambia
     cada vez que se repliega.
     ========================================================= */

  (function barraPegajosa() {
    var cabecera = $('.site-header'), tools = $('.tools');
    var raiz = document.documentElement;

    function medir() {
      if (cabecera) raiz.style.setProperty('--alto-cabecera', cabecera.offsetHeight + 'px');
      raiz.style.setProperty('--alto-tools', (tools ? tools.offsetHeight : 0) + 'px');
    }
    medir();
    window.addEventListener('resize', medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);

    if (!tools) return;

    /* Histéresis: se repliega al pasar de 240 px bajando y solo vuelve
       tras subir 60 px seguidos. Sin eso, un dedo tembloroso sobre el
       umbral abre y cierra la barra sin parar. */
    var ultimo = window.pageYOffset, subido = 0, plegada = false;
    function alDeslizar() {
      var y = window.pageYOffset;
      var baja = y > ultimo;
      subido = baja ? 0 : subido + (ultimo - y);
      if (!plegada && baja && y > 240) { plegada = true; tools.classList.add('is-plegada'); medir(); }
      else if (plegada && (subido > 60 || y < 120)) { plegada = false; tools.classList.remove('is-plegada'); medir(); }
      ultimo = y;
    }
    var esperando = false;
    window.addEventListener('scroll', function () {
      if (esperando) return;
      esperando = true;
      window.requestAnimationFrame(function () { esperando = false; alDeslizar(); });
    }, {passive: true});
  })();

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
  var estado = {q: '', grupo: '', cat: '', etapa: '', min: '', max: '', orden: 'cat', sinItbis: false};

  /* La tabla arranca con 100 filas. Con 1,449 ítems, pintarlas todas cuesta
     casi un segundo en un teléfono y nadie las mira: el que busca filtra. */
  var PAGINA = 100;

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
            '<div><h4>' + esc(it.nombre) + '</h4><small>' + esc(nombreCat(it.cat)) + '</small></div>' +
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

  /* La columna «Última actualización» no dice qué es el precio sino cuánto
     hace que se confirmó. Se calcula al cargar, porque envejece cada día:
     las páginas de categoría traen la fecha en data-fecha y aquí se pasa al
     tramo. Una fecha de solo año y mes cuenta desde su día 1. */
  var TRAMOS_FECHA = [
    [7, 'badge-reciente', 'Últimos 7 días'],
    [14, 'badge-quincena', '8–14 días'],
    [30, 'badge-mes', '15–30 días']
  ];
  function tramoFecha(fecha) {
    if (!fecha) return {clase: 'badge-viejo', texto: 'Sin fecha'};
    var p = String(fecha).split('-');
    var d = new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1);
    var dias = Math.floor((new Date() - d) / 864e5);
    for (var i = 0; i < TRAMOS_FECHA.length; i++) {
      if (dias <= TRAMOS_FECHA[i][0]) return {clase: TRAMOS_FECHA[i][1], texto: TRAMOS_FECHA[i][2]};
    }
    return {clase: 'badge-viejo', texto: 'Más de 30 días'};
  }
  function badgeFechaHTML(it) {
    if (it.estado === 'demo') return '<span class="badge badge-demo">Demostración</span>';
    var f = fechaFila(it), t = tramoFecha(f);
    return '<span class="badge ' + t.clase + '" data-fecha="' + esc(f || '') + '" title="' + esc(f || 'sin fecha') + '">' + t.texto + '</span>';
  }
  function refrescarBadgesFecha(raiz) {
    $$('.badge[data-fecha]', raiz || document).forEach(function (el) {
      var t = tramoFecha(el.getAttribute('data-fecha'));
      el.className = 'badge ' + t.clase;
      el.textContent = t.texto;
    });
  }

  /* =========================================================
     EL COMERCIO ELEGIDO
     Bajo el nombre de cada ítem va un tag por comercio que lo vende. Al
     pulsarlo, el precio y la fecha de la fila pasan a ser los de ese
     comercio; al volver a pulsarlo, regresa la referencia del mercado.
     La elección vive en el objeto del ítem, así sobrevive a que la tabla
     se vuelva a pintar por un filtro o por el interruptor de ITBIS.
     ========================================================= */
  function cotizacionesPorProveedor(it) {
    var vistos = {}, lista = [];
    (it.cotizaciones || []).forEach(function (q) {
      if (!q.cuenta || vistos[q.proveedor.nombre]) return;
      vistos[q.proveedor.nombre] = true;
      lista.push(q);
    });
    return lista;
  }
  function cotizacionElegida(it) {
    if (!it.provElegido) return null;
    var qs = cotizacionesPorProveedor(it);
    for (var i = 0; i < qs.length; i++) if (qs[i].proveedor.nombre === it.provElegido) return qs[i];
    return null;
  }
  function precioFila(it) { var q = cotizacionElegida(it); return q ? q.precioNormalizado : it.ref; }
  function fechaFila(it) { var q = cotizacionElegida(it); return q ? q.fecha : it.fecha; }
  function nombreTag(nombre) {
    return String(nombre).replace(/\s*\([^)]*\)\s*/g, '').replace(/^Ferreter[ií]a\s+/i, '').trim();
  }
  /* El precio y la fecha están desde el principio; la nota —qué artículo
     exacto es, de qué marca— llega con el detalle de la categoría, que se
     pide al acercar el cursor. Ver pedirDetalle(). */
  function tituloTag(q) {
    return rd(q.precioNormalizado) + (q.fecha ? ' · ' + q.fecha : '') +
      (q.nota ? ' · ' + String(q.nota).slice(0, 160) : '');
  }
  function tagsProveedores(it) {
    var qs = cotizacionesPorProveedor(it);
    if (!qs.length) return '';
    return '<span class="item-provs">' + qs.map(function (q) {
      var activo = it.provElegido === q.proveedor.nombre;
      return '<button class="tag-prov" type="button" data-item-prov="' + esc(it.codigo) + '" data-prov="' + esc(q.proveedor.nombre) + '" ' +
        'aria-pressed="' + (activo ? 'true' : 'false') + '" title="' + esc(tituloTag(q)) + '">' + esc(nombreTag(q.proveedor.nombre)) + '</button>';
    }).join('') + '</span>';
  }

  /* LA REFERENCIA POR GAMA, BAJO EL NOMBRE

     Hay partidas donde un solo precio de referencia miente por omisión.
     «Mezcladora, de baño» tiene 577 cotizaciones y una referencia de
     RD$ 4.967 que le queda cerca al 14% de ellas: bajo el mismo nombre
     conviven la mezcladora de ferretería y la de casa de diseño, y entre
     las dos hay doce veces. Quien presupuesta una vivienda económica y
     quien presupuesta una de lujo están mirando el mismo número y a los
     dos les sirve mal.

     Así que donde se puede medir, se dice. Solo aparece en las partidas
     donde la marca de verdad separa —hoy 25 de 2.206, casi todas de
     baño—; en el resto no hay línea, porque inventarla sería peor que
     no tenerla. Cómo se mide, en herramientas/medir-gama.js. */
  var ETIQUETA_GAMA = { economica: 'Económica', estandar: 'Estándar',
                        alta: 'Alta', premium: 'Premium' };

  function tiraGama(it) {
    if (!it.gamas) return '';
    var partes = [];
    ['economica', 'estandar', 'alta', 'premium'].forEach(function (g) {
      var x = it.gamas[g];
      if (!x) return;
      partes.push('<span class="gama-p" title="' + x.n + ' cotizaciones de marcas de gama ' +
        ETIQUETA_GAMA[g].toLowerCase() + '"><i>' + ETIQUETA_GAMA[g] + '</i>' + rd(x.ref) + '</span>');
    });
    if (partes.length < 2) return '';
    return '<span class="item-gamas">' + partes.join('') + '</span>';
  }

  /* =========================================================
     EL DETALLE DE CADA COTIZACIÓN, A PEDIDO

     La nota y la fuente son dos terceras partes del peso del
     registro de precios y no hacen falta para pintar un precio,
     así que no viajan con la página: viven por categoría en
     assets/datos/detalle-CAT.json y se piden cuando de verdad se
     van a usar —al acercar el cursor a un comercio, al copiar
     para Excel—. Mientras no lleguen, la tabla funciona igual;
     lo único que falta es el texto del globo y la columna de
     fuente al exportar.
     ========================================================= */

  var detallePedido = {};

  function conDetalle(cats, hacer) {
    if (!PRECIOS || !PRECIOS.detalle) { hacer(); return; }
    PRECIOS.detalle(cats).then(hacer, hacer);
  }

  /* Los globos ya están escritos en el HTML; cuando llega la nota hay que
     volver a escribirlos. Solo se hace una vez por categoría. */
  function refrescarTitulos() {
    $$('[data-item-prov]').forEach(function (b) {
      var it = itemPorCodigo[b.getAttribute('data-item-prov')];
      if (!it) return;
      var nombre = b.getAttribute('data-prov');
      var qs = (it.cotizaciones || []).filter(function (q) { return q.proveedor.nombre === nombre; });
      if (qs.length) b.setAttribute('title', tituloTag(qs[0]));
    });
  }

  /* Siempre se espera al detalle, aunque otro ya lo haya pedido: quien pide
     con una tarea detrás —copiar para Excel— tiene que recibirla con la
     fuente puesta, no con lo que hubiera cuando salió la petición.
     PRECIOS.detalle() reparte la misma promesa a todos. Lo que sí se hace
     una sola vez es reescribir los globos. */
  function pedirDetalle(cats, hacer) {
    var nuevos = (cats || []).filter(function (c) { return c && !detallePedido[c]; });
    nuevos.forEach(function (c) { detallePedido[c] = true; });
    conDetalle(cats, function () {
      if (nuevos.length) refrescarTitulos();
      if (hacer) hacer();
    });
  }

  /* Acercarse basta para pedirlo: así, cuando el visitante llega a hacer
     clic en «copiar», el detalle ya está. */
  function alAcercarse(e) {
    var t = e.target.closest && e.target.closest('.tag-prov, [data-copiar-tabla]');
    if (!t) return;
    var codigo = t.getAttribute('data-item-prov');
    pedirDetalle(codigo ? [codigo.slice(0, 6)] : catsDeLaPagina());
  }
  document.addEventListener('pointerover', alAcercarse);
  document.addEventListener('focusin', alAcercarse);

  function catsDeLaPagina() {
    var propia = document.body.getAttribute('data-cat');
    if (propia) return [propia];
    var vistas = {};
    $$('tr[data-item]').forEach(function (tr) { vistas[tr.getAttribute('data-item').slice(0, 6)] = true; });
    return Object.keys(vistas);
  }
  function htmlCeldaEstado(it) {
    return badgeFechaHTML(it) +
      (it.itbis ? '' : ' <span class="badge badge-itbis">no lleva ITBIS</span>') +
      (it.filtrado ? ' <span class="badge badge-filtrado">sus proveedores</span>' : '') +
      (it.sinCotizacionDelFiltro ? ' <span class="badge badge-itbis">sin cotización suya</span>' : '');
  }

  /* Junto al precio va un botón que copia solo el número; el de la última
     columna copia la fila tal como se ve. */
  function botonCopiarPrecio(it) {
    return ' <button class="btn-copiar btn-copiar-precio" type="button" data-copiar-monto="' + esc(it.codigo) + '" ' +
      'aria-label="Copiar el precio de ' + esc(it.nombre) + '" title="Copiar el precio">' + ICONO.copiar + '</button>';
  }
  function pintarCeldaPrecio(td, it) {
    var pct = it.unidad === '%';
    var bruto = precioFila(it);
    var p = precioVista(bruto, it, estado.sinItbis);
    if (p === null) { td.innerHTML = '<span class="precio-nulo">Según tarifario</span>'; return; }
    /* Solo un número: la referencia o el precio del comercio elegido. El
       rango y la mediana son análisis y van en el libro de Excel. */
    td.innerHTML = (pct ? '<span class="precio">' + fmt(p) + ' %</span>'
                        : '<span class="precio">' + rd(p) + '</span>') + botonCopiarPrecio(it);
    td.setAttribute('data-precio-ref', bruto === null ? '' : bruto);
  }
  /* Los dos botones bajo la tabla. Sirven igual al catálogo, que pinta las
     filas, y a las páginas de categoría, que las traen escritas y solo las
     esconden: un buscador ve las 416 filas de tubería aunque el visitante
     empiece viendo 100. */
  function pintarMas(visibles, total, alPulsar) {
    var caja = $('#tabla-mas');
    if (!caja) return;
    if (visibles >= total) { caja.hidden = true; caja.innerHTML = ''; return; }
    var faltan = total - visibles;
    caja.hidden = false;
    caja.innerHTML =
      '<span class="tabla-mas-cuenta">' + visibles + ' de ' + total + '</span>' +
      '<button class="btn btn-ghost btn-mini" type="button" data-mas="pagina">Cargar ' +
        Math.min(PAGINA, faltan) + ' más</button>' +
      '<button class="btn btn-ghost btn-mini" type="button" data-mas="todo">Cargar los ' + total + '</button>';
    $$('[data-mas]', caja).forEach(function (b) {
      b.addEventListener('click', function () { alPulsar(b.getAttribute('data-mas') === 'todo'); });
    });
  }

  /* Copia la fila tal como se ve: ítem, categoría o etapa, unidad, precio y
     última actualización, separados por tabulador. Lo que sale en el Excel
     (código, especificación, mínimo, máximo, fuente) se copia desde la ficha. */
  function textoFilaVisible(tr) {
    if (!tr) return '';
    return $$('td', tr).slice(0, -1).map(function (td, i) {
      var nombre = i === 0 ? $('.item-nombre', td) : null;
      return (nombre || td).textContent.replace(/\s+/g, ' ').trim();
    }).join('\t');
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
        estadoCelda.innerHTML = htmlCeldaEstado(it);
      }
    });

    if (window.__pintarCatalogo) window.__pintarCatalogo();
    if (window.__pintarProveedores) window.__pintarProveedores();

    pintarBarraFiltro();
    pintarPanelProveedores();
    sincronizarMenuProv();
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

  /* El menú de proveedores de la portada. Va aparte del panel porque la
     selección se puede cambiar desde los dos sitios y la portada no monta
     el panel: las casillas y el rótulo del botón tienen que ponerse al día
     igual, venga el cambio de donde venga. */
  function sincronizarMenuProv() {
    $$('input[data-prov-chip]').forEach(function (c) {
      c.checked = misProveedores.indexOf(c.getAttribute('data-prov-chip')) !== -1;
    });
    var bot = $('#f-prov');
    if (!bot) return;
    var n = misProveedores.length;
    bot.textContent = n === 0 ? 'Todos los proveedores'
      : n === 1 ? nombreTag(misProveedores[0])
      : n + ' proveedores';
    bot.setAttribute('aria-pressed', n ? 'true' : 'false');
  }

  /* Botón para abrir el panel, junto al interruptor de ITBIS. */
  function montarBotonProveedores() {
    /* En la portada el filtro de proveedor ya está en la fila de menús;
       un segundo botón para lo mismo sobra. */
    if ($('#menu-prov')) return;
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
                    '<small>' + esc(it.unidad) + '</small>' +
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
        .map(function (c) { return '<option value="' + esc(c.codigo) + '">' + esc(c.nombre) + '</option>'; })
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
        var texto = pct ? fmt(ref) + ' %' : rd(ref);
        var span = $('.precio', el);
        if (span) span.textContent = texto;
        else el.innerHTML = '<span class="precio">' + texto + '</span>';
      } else {
        el.textContent = pct ? fmt(ref) + ' %' : rd(ref);
      }
    });
  }

  /* Manejadores globales: funcionan en el catálogo y en las páginas estáticas. */
  document.addEventListener('click', function (e) {
    var tag = e.target.closest('[data-item-prov]');
    if (tag) {
      var itT = itemPorCodigo[tag.getAttribute('data-item-prov')];
      var trT = tag.closest('tr');
      if (!itT || !trT) return;
      var nombreT = tag.getAttribute('data-prov');
      itT.provElegido = itT.provElegido === nombreT ? null : nombreT;
      $$('.tag-prov', trT).forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-prov') === itT.provElegido ? 'true' : 'false');
      });
      var celdaP = $('td[data-precio-ref]', trT);
      if (celdaP) pintarCeldaPrecio(celdaP, itT);
      var celdaE = $('.celda-estado', trT);
      if (celdaE) celdaE.innerHTML = htmlCeldaEstado(itT);
      return;
    }

    var monto = e.target.closest('[data-copiar-monto]');
    if (monto) {
      var itM = itemPorCodigo[monto.getAttribute('data-copiar-monto')];
      var pM = itM ? precioVista(precioFila(itM), itM, estado.sinItbis) : null;
      /* Se copia lo que se ve: el monto redondeado como en la tabla. */
      if (pM !== null) copiarTexto(itM.unidad === '%' ? String(pM) : String(Math.round(pM)), monto);
      return;
    }

    var filaVisible = e.target.closest('[data-copiar-fila]');
    if (filaVisible) {
      copiarTexto(textoFilaVisible(filaVisible.closest('tr')), filaVisible);
      return;
    }

    var tabla = e.target.closest('[data-copiar-tabla]');
    if (tabla) {
      var codigos = $$('tr[data-item]').map(function (tr) { return tr.getAttribute('data-item'); });
      /* La columna de fuente sale del detalle de la categoría. Casi siempre
         ya llegó, porque se pide al acercarse al botón; si no, se espera:
         una exportación sin la fuente de cada precio no sirve de nada. */
      pedirDetalle(PRECIOS.catsDe(codigos), function () {
        var vistos = {}, acumulado = [];
        codigos.forEach(function (c) {
          if (vistos[c]) return;
          vistos[c] = true;
          acumulado = acumulado.concat(filasDeItem(c));
        });
        if (acumulado.length) copiarTexto(PRECIOS.aTSV(acumulado, true), tabla);
      });
      return;
    }
  });


  /* =========================================================
     CATÁLOGO: buscador, filtros y tabla
     ========================================================= */


  (function catalogo() {
    var cuerpo = $('#tabla-body');
    if (!cuerpo) return;

    var input = $('#q'), selOrden = $('#orden'), inMin = $('#f-min'), inMax = $('#f-max'),
        chkItbis = $('#f-itbis'), meta = $('#resultado-meta'), tablaWrap = $('#tabla-wrap'),
        vacio = $('#sin-resultados');

    /* --- estado inicial desde la URL --- */
    var params = new URLSearchParams(window.location.search);
    var numero = function (v) { var n = parseFloat(v); return isNaN(n) || n < 0 ? '' : n; };
    estado.q = params.get('q') || '';
    estado.grupo = params.get('grupo') || '';
    estado.cat = params.get('cat') || '';
    estado.ambito = params.get('ambito') || '';
    estado.etapa = params.get('etapa') || '';
    estado.min = numero(params.get('min'));
    estado.max = numero(params.get('max'));
    /* Por defecto manda cuántos comercios cotizan el ítem: un precio que
       tres ferreterías publican dice más que uno que publica una sola, y
       arriba tiene que estar lo comparable. */
    estado.orden = params.get('orden') || 'comercios';

    /* --- chips: categoría, etapa y proveedor. Categoría y etapa eligen una;
       proveedor admite varios, y su selección se guarda en el navegador. --- */
    var ambitoPorCat = {};
    CAT.categorias.forEach(function (c) { ambitoPorCat[c.codigo] = c.ambitos || []; });
    /* El ítem manda sobre su categoría: dentro de eléctricos, el cable es
       obra y el bombillo lo pide también quien decora. El catálogo ya
       resolvió esa regla y dejó el ámbito en cada ítem. */
    function itemEnAmbito(it, a) {
      return !a || (it.ambitos || ambitoPorCat[it.cat] || []).indexOf(a) !== -1;
    }
    /* Los chips sí van por categoría: la fila ofrece categorías. */
    function catEnAmbito(cod, a) {
      return !a || (ambitoPorCat[cod] || []).indexOf(a) !== -1;
    }

    /* El selector de ámbito. Va aparte de los chips porque no es un
       filtro más: decide qué catálogo estás mirando, y de él depende
       qué categorías se ofrecen. Por eso «Todo» es el estado por
       defecto —el catálogo completo no se esconde— y los otros dos son
       lentes sobre la misma base. */
    var AMBITOS = [
      { clave: '', nombre: 'Todo el catálogo' },
      { clave: 'construccion', nombre: 'Construcción' },
      { clave: 'interiorismo', nombre: 'Interiorismo' }
    ];
    var selAmbito = $('#ambito');
    function pintarAmbitos() {
      if (!selAmbito) return;
      selAmbito.innerHTML = AMBITOS.map(function (a) {
        var n = a.clave
          ? CAT.items.filter(function (i) { return itemEnAmbito(i, a.clave); }).length
          : CAT.items.length;
        return '<button class="ambito-op" type="button" data-ambito="' + esc(a.clave) + '" ' +
          'aria-pressed="' + (estado.ambito === a.clave ? 'true' : 'false') + '">' +
          esc(a.nombre) + ' <span class="ambito-n">' + n + '</span></button>';
      }).join('');
    }

    /* --- categoría y etapa: una lista cada una ---
       Cada opción lleva cuántos ítems tiene, que es lo único que se
       perdía al pasar de la muralla de chips a un desplegable: de un
       vistazo ya no se ve dónde hay catálogo y dónde casi nada. */
    var selCat = $('#f-cat'), selEtapa = $('#f-etapa');

    function cuenta(prueba) {
      var n = 0;
      CAT.items.forEach(function (i) { if (prueba(i)) n += 1; });
      return n;
    }

    /* Se pinta en función y no en línea porque hay que repintarla cuando
       cambia el ámbito: las categorías ofrecidas son las de ese público. */
    function pintarSelCat() {
      if (!selCat) return;
      var suyas = CAT.categorias.filter(function (c) { return catEnAmbito(c.codigo, estado.ambito); });
      selCat.innerHTML = '<option value="">Todas las categorías</option>' +
        suyas.map(function (c) {
          var n = cuenta(function (i) { return i.cat === c.codigo && itemEnAmbito(i, estado.ambito); });
          return '<option value="' + esc(c.codigo) + '">' + esc(c.nombre) + ' (' + n + ')</option>';
        }).join('');
      selCat.value = estado.cat;
    }

    function pintarSelEtapa() {
      if (!selEtapa) return;
      selEtapa.innerHTML = '<option value="">Todas las etapas</option>' +
        CAT.etapas.map(function (e) {
          var n = cuenta(function (i) { return i.etapa === e.codigo && itemEnAmbito(i, estado.ambito); });
          return '<option value="' + esc(e.codigo) + '"' + (n ? '' : ' disabled') + '>' +
            esc(e.nombre) + ' (' + n + ')</option>';
        }).join('');
      selEtapa.value = estado.etapa;
    }

    pintarSelCat();
    pintarSelEtapa();
    pintarAmbitos();

    /* --- proveedor: varios a la vez, así que casillas ---
       Un desplegable normal solo deja elegir uno, y aquí el visitante
       marca los comercios con los que ya trabaja. El botón dice cuántos
       lleva; la lista se guarda en el navegador. */
    var botProv = $('#f-prov'), listaProv = $('#menu-prov-lista');

    function pintarMenuProv() {
      if (!listaProv) return;
      listaProv.innerHTML = PROV.lista.filter(function (p) { return !p.demo; }).map(function (p) {
        var activo = misProveedores.indexOf(p.nombre) !== -1;
        return '<label class="menu-op"><input type="checkbox" data-prov-chip="' + esc(p.nombre) + '"' +
          (activo ? ' checked' : '') + '> <span>' + esc(p.nombre) + '</span></label>';
      }).join('') +
      '<button class="menu-limpiar" type="button" id="f-prov-todos">Todos los proveedores</button>';
      sincronizarMenuProv();
    }

    function abrirMenuProv(abrir) {
      if (!listaProv || !botProv) return;
      listaProv.hidden = !abrir;
      botProv.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    }

    pintarMenuProv();

    if (botProv) botProv.addEventListener('click', function () {
      abrirMenuProv(listaProv.hidden);
    });
    if (listaProv) listaProv.addEventListener('change', function (e) {
      var ch = e.target.closest('input[data-prov-chip]');
      if (ch) alternarProveedor(ch.getAttribute('data-prov-chip'));
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#menu-prov')) abrirMenuProv(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') abrirMenuProv(false);
    });

    if (input) input.value = estado.q;
    if (selOrden) selOrden.value = estado.orden;
    if (inMin) inMin.value = estado.min;
    if (inMax) inMax.value = estado.max;

    function filtrar() {
      var q = normaliza(estado.q).split(/\s+/).filter(Boolean);
      return CAT.items.filter(function (it) {
        /* El ámbito filtra por categoría, no por ítem: una categoría
           sirve a un público o a los dos, y el 42 % del catálogo lo
           piden ambos. Es una lente, no una partición. */
        if (estado.ambito && !itemEnAmbito(it, estado.ambito)) return false;
        if (estado.cat && it.cat !== estado.cat) return false;
        if (estado.grupo && it.cat.indexOf(estado.grupo) !== 0) return false;
        if (estado.etapa && it.etapa !== estado.etapa) return false;
        /* Con proveedores elegidos solo quedan los ítems que ellos cotizan;
           el precio ya viene recalculado solo con sus cotizaciones. */
        if (misProveedores.length && !it.filtrado) return false;
        if (estado.min !== '' || estado.max !== '') {
          var pv = precioVista(precioFila(it), it, estado.sinItbis);
          if (pv === null) return false;
          if (estado.min !== '' && pv < estado.min) return false;
          if (estado.max !== '' && pv > estado.max) return false;
        }
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
      /* Con búsqueda escrita manda la relevancia, sea cual sea el orden
         por defecto: quien escribe «varilla» quiere varillas primero. */
      if (q.length && (estado.orden === 'cat' || estado.orden === 'comercios')) {
        copia.sort(function (a, b) {
          var d = relevancia(b, q) - relevancia(a, q);
          return d !== 0 ? d : cmpCatalogo(a, b);
        });
        return copia;
      }
      if (estado.orden === 'comercios') {
        copia.sort(function (a, b) {
          var d = cotizacionesPorProveedor(b).length - cotizacionesPorProveedor(a).length;
          return d !== 0 ? d : cmpCatalogo(a, b);
        });
      } else if (estado.orden === 'nombre') {
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


    function fila(it) {
      var bruto = precioFila(it);
      var p = precioVista(bruto, it, estado.sinItbis);
      var esPorcentaje = it.unidad === '%';

      var precioHtml;
      if (p === null) {
        precioHtml = '<span class="precio-nulo">Según tarifario</span>';
      } else if (esPorcentaje) {
        precioHtml = '<span class="precio">' + fmt(p) + ' %</span>' + botonCopiarPrecio(it);
      } else {
        precioHtml = '<span class="precio">' + rd(p) + '</span>' + botonCopiarPrecio(it);
      }

      return '<tr data-item="' + esc(it.codigo) + '">' +
          '<td><span class="item-nombre">' + esc(it.nombre) + '</span>' +
              (it.alcance && it.alcance !== ALCANCE_BASE ? '<span class="item-alcance">' + esc(it.alcance) + '</span>' : '') +
              tagsProveedores(it) + tiraGama(it) + '</td>' +
          '<td><a class="item-esp" style="text-decoration:none" href="' + esc(urlCat(it.cat)) + '">' + esc(nombreCat(it.cat)) + '</a></td>' +
          '<td class="unidad">' + esc(it.unidad) + '</td>' +
          '<td class="num" data-precio-ref="' + (bruto === null ? '' : bruto) + '">' + precioHtml + '</td>' +
          '<td class="celda-estado">' + htmlCeldaEstado(it) + '</td>' +
          '<td class="num acciones">' +
            '<button class="btn-copiar" type="button" data-copiar-fila="' + esc(it.codigo) + '" ' +
              'aria-label="Copiar la fila de ' + esc(it.nombre) + '" title="Copiar la fila">' + ICONO.copiar + '</button>' +
          '</td>' +
        '</tr>';
    }

    function pintar() {
      var lista = ordenar(filtrar());
      if (estado.tope === undefined) estado.tope = PAGINA;
      if (estado.tope > lista.length) estado.tope = Math.max(PAGINA, lista.length);

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
        cuerpo.innerHTML = lista.slice(0, estado.tope).map(fila).join('');
      }
      pintarMas(Math.min(estado.tope, lista.length), lista.length, function (todo) {
        estado.tope = todo ? lista.length : estado.tope + PAGINA;
        pintar();
      });
      actualizarURL();
    }

    function hayFiltros() {
      return !!(estado.q || estado.cat || estado.grupo || estado.etapa || estado.ambito || estado.min !== '' || estado.max !== '' || misProveedores.length);
    }

    function limpiar() {
      estado.q = ''; estado.cat = ''; estado.grupo = ''; estado.etapa = ''; estado.ambito = ''; estado.min = ''; estado.max = ''; estado.tope = PAGINA;
      if (input) input.value = '';
      if (inMin) inMin.value = '';
      if (inMax) inMax.value = '';
      if (selCat) selCat.value = '';
      if (selEtapa) selEtapa.value = '';
      if (misProveedores.length) { misProveedores = []; aplicarFiltroProveedores(); }
      else pintar();
    }

    /* Se parte de la URL con la que llegó el visitante: los parámetros que no
       son del catálogo (utm, fbclid…) se conservan y solo se reescriben los
       seis del filtro. La ruta se normaliza a ./ para que /index.html no se
       cuele en la barra de direcciones ni en la URL que la gente copia. */
    function actualizarURL() {
      var p = new URLSearchParams(window.location.search);
      ['q', 'grupo', 'cat', 'etapa', 'ambito', 'min', 'max', 'orden'].forEach(function (k) { p['delete'](k); });
      if (estado.q) p.set('q', estado.q);
      if (estado.grupo) p.set('grupo', estado.grupo);
      if (estado.ambito) p.set('ambito', estado.ambito);
      if (estado.cat) p.set('cat', estado.cat);
      if (estado.etapa) p.set('etapa', estado.etapa);
      if (estado.min !== '') p.set('min', estado.min);
      if (estado.max !== '') p.set('max', estado.max);
      if (estado.orden !== 'comercios') p.set('orden', estado.orden);
      var qs = p.toString();
      window.history.replaceState(null, '', './' + (qs ? '?' + qs : '') + window.location.hash);
    }

    /* --- eventos --- */
    if (input) {
      var t;
      input.addEventListener('input', function () {
        window.clearTimeout(t);
        t = window.setTimeout(function () { estado.q = input.value.trim(); estado.tope = PAGINA; pintar(); }, 140);
      });
    }
    [[inMin, 'min'], [inMax, 'max']].forEach(function (par) {
      if (!par[0]) return;
      var tm;
      par[0].addEventListener('input', function () {
        window.clearTimeout(tm);
        tm = window.setTimeout(function () { estado[par[1]] = numero(par[0].value); estado.tope = PAGINA; pintar(); }, 200);
      });
    });
    if (selOrden) selOrden.addEventListener('change', function () { estado.orden = selOrden.value; pintar(); });
    if (chkItbis) chkItbis.addEventListener('change', function () {
      estado.sinItbis = chkItbis.checked;
      pintar();
      pintarCotizacion();
    });

    if (selCat) selCat.addEventListener('change', function () {
      estado.cat = selCat.value;
      estado.grupo = '';
      estado.tope = PAGINA;
      pintar();
    });
    if (selEtapa) selEtapa.addEventListener('change', function () {
      estado.etapa = selEtapa.value;
      estado.tope = PAGINA;
      pintar();
    });

    document.addEventListener('click', function (e) {
      /* «Todos los proveedores»: suelta la selección entera de una vez, que
         es lo que cuesta con casillas. */
      if (e.target.closest('#f-prov-todos')) {
        if (misProveedores.length) { misProveedores = []; aplicarFiltroProveedores(); }
        abrirMenuProv(false);
        return;
      }

      var op = e.target.closest('[data-ambito]');
      if (op) {
        var nuevo = op.getAttribute('data-ambito');
        if (nuevo === estado.ambito) return;
        estado.ambito = nuevo;
        /* Una categoría elegida puede no existir en el ámbito nuevo:
           se suelta en vez de dejar la tabla vacía sin explicación. */
        if (estado.cat && !catEnAmbito(estado.cat, estado.ambito)) estado.cat = '';
        estado.grupo = '';
        estado.tope = PAGINA;
        pintarAmbitos();
        /* Las cuentas de cada opción son de este ámbito, así que las dos
           listas se rehacen, no solo la de categorías. */
        pintarSelCat();
        pintarSelEtapa();
        pintar();
        actualizarURL();
        return;
      }
    });

    window.__pintarCatalogo = pintar;
    pintar();
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

    /* Las filas ya están en el HTML, que es lo que ve un buscador; aquí solo
       se esconden las que pasan de la primera página. */
    var filas = $$('tr[data-item]', cuerpo);
    var tope = PAGINA;
    function aplicarTope() {
      filas.forEach(function (tr, k) { tr.hidden = k >= tope; });
      pintarMas(Math.min(tope, filas.length), filas.length, function (todo) {
        tope = todo ? filas.length : tope + PAGINA;
        aplicarTope();
      });
    }
    if (filas.length > PAGINA) aplicarTope();

    var chk = $('#f-itbis');
    if (chk) chk.addEventListener('change', function () {
      estado.sinItbis = chk.checked;
      repintarPrecios(document);
      pintarCotizacion();
    });
  })();

  /* =========================================================
     PROVEEDORES
     ========================================================= */

  (function proveedores() {
    var grid = $('#grid-proveedores');
    if (!grid) return;

    var input = $('#q-prov'), selCat = $('#f-prov-cat'), selZona = $('#f-prov-zona'),
        meta = $('#prov-meta'), vacio = $('#prov-vacio');

    var f = {q: '', cat: '', zona: '', soloPrecios: false};

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
          .map(function (c) { return '<option value="' + esc(c.codigo) + '">' + esc(c.nombre) + '</option>'; })
          .join('');
      selCat.value = f.cat;
    }
    if (selZona) {
      selZona.innerHTML = '<option value="">Toda la República Dominicana</option>' +
        PROV.zonas.map(function (z) { return '<option value="' + esc(z.codigo) + '">' + esc(z.nombre) + '</option>'; }).join('');
    }
    if (input) input.value = f.q;

    function nombreZona(c) {
      var z = PROV.zonas.filter(function (x) { return x.codigo === c; })[0];
      return z ? z.nombre : c;
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
            '<h3>' + esc(p.nombre) + '</h3>' +
            (p.precios ? '<span class="badge badge-precios">Precios en línea</span>' : '') +
          '</div>' +
          '<p class="prov-nota">' + esc(p.nota) + '</p>' +
          '<div class="prov-cats">' +
            p.cats.map(function (c) { return '<span class="tag">' + esc(nombreCat(c)) + '</span>'; }).join('') +
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
        if (f.soloPrecios && !p.precios) return false;
        if (!q.length) return true;
        var heno = normaliza([p.nombre, p.nota, p.web, p.cats.map(nombreCat).join(' ')].join(' '));
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

    var chkPrecios = $('#f-prov-precios');
    if (chkPrecios) chkPrecios.addEventListener('change', function () { f.soloPrecios = chkPrecios.checked; pintar(); });

    window.__pintarProveedores = pintar;
    pintar();
  })();


  /* =========================================================
     BANNERS LATERALES
     En pantallas anchas sobra margen a los dos lados del contenido; ahí va
     la firma con su llamada. El botón no lleva a otra página: despliega
     las dos vías de contacto. Se montan desde aquí para no repetir el
     marcado en 32 páginas.
     ========================================================= */
  var CONTACTO = {
    wa: 'https://wa.me/18297939892?text=' + encodeURIComponent('Hola, vengo de precios.ingsliberato.com y quiero información sobre contratación, subcontratos especializados o presupuestos.'),
    correo: 'mailto:arthur@ingsliberato.com?subject=' + encodeURIComponent('Consulta desde precios.ingsliberato.com')
  };
  function montarBannersLaterales() {
    if (!document.body || $('.banner-lateral')) return;
    ['izq', 'der'].forEach(function (lado) {
      var b = document.createElement('aside');
      b.className = 'banner-lateral banner-' + lado;
      b.setAttribute('aria-label', 'Ingenieros Liberato & Asociados');
      b.innerHTML =
        '<button class="banner-plegar" type="button" data-plegar="' + lado + '" aria-expanded="true" ' +
          'aria-label="Plegar el aviso">' +
          (lado === 'izq' ? ICONO.flechaIzq : ICONO.flechaDer) + '</button>' +
        '<img class="banner-iso" src="assets/img/isotipo.svg" alt="" width="100" height="100">' +
        '<p class="banner-marca">Ingenieros Liberato<br>&amp; Asociados</p>' +
        '<p class="banner-servicios">Construcción · Supervisión · Diseño</p>' +
        '<p class="banner-msj">¿Necesitas contratista, subcontratista especializado o presupuestos?</p>' +
        '<button class="btn btn-primary banner-cta" type="button" aria-expanded="false" aria-controls="banner-contacto-' + lado + '">Contáctanos</button>' +
        '<div class="banner-contacto" id="banner-contacto-' + lado + '" hidden>' +
          '<a class="banner-opcion" href="' + CONTACTO.wa + '" target="_blank" rel="noopener">' + ICONO.wa + '<span>WhatsApp<small>+1 (829) 793-9892</small></span></a>' +
          '<a class="banner-opcion" href="' + CONTACTO.correo + '">' + ICONO.correo + '<span>Correo electrónico<small>arthur@ingsliberato.com</small></span></a>' +
        '</div>';
      document.body.appendChild(b);
    });

    /* El ajuste dura lo que dure la pestaña: sessionStorage, no localStorage.
       Al abrir una nueva pestaña el aviso vuelve a verse. */
    var LS_BANNER = 'ilya_precios_banners_plegados';
    function leerPlegados() {
      try { return JSON.parse(window.sessionStorage.getItem(LS_BANNER)) || {}; } catch (e) { return {}; }
    }
    function aplicarPlegados() {
      var p = leerPlegados();
      $$('.banner-lateral').forEach(function (b) {
        var lado = b.classList.contains('banner-izq') ? 'izq' : 'der';
        var plegado = !!p[lado];
        b.classList.toggle('plegado', plegado);
        var btn = $('.banner-plegar', b);
        btn.setAttribute('aria-expanded', plegado ? 'false' : 'true');
        btn.setAttribute('aria-label', plegado ? 'Desplegar el aviso' : 'Plegar el aviso');
      });
    }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-plegar]');
      if (!btn) return;
      var lado = btn.getAttribute('data-plegar');
      var p = leerPlegados();
      p[lado] = !p[lado];
      try { window.sessionStorage.setItem(LS_BANNER, JSON.stringify(p)); } catch (err) { /* modo privado */ }
      aplicarPlegados();
    });
    aplicarPlegados();
    function cerrarTodos(salvo) {
      $$('.banner-cta').forEach(function (btn) {
        if (btn === salvo) return;
        btn.setAttribute('aria-expanded', 'false');
        $('#' + btn.getAttribute('aria-controls')).hidden = true;
      });
    }
    document.addEventListener('click', function (e) {
      var cta = e.target.closest('.banner-cta');
      if (cta) {
        var caja = $('#' + cta.getAttribute('aria-controls'));
        var abrir = caja.hidden;
        cerrarTodos(cta);
        caja.hidden = !abrir;
        cta.setAttribute('aria-expanded', abrir ? 'true' : 'false');
        return;
      }
      if (!e.target.closest('.banner-lateral')) cerrarTodos();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarTodos(); });
  }
  montarBannersLaterales();

  refrescarBadgesFecha();
})();
