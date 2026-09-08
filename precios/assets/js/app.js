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
     enlaces internos, no a catalogo.html?cat=… */
  function urlCat(codigo) {
    var c = catPorCodigo[codigo];
    return c && c.slug ? c.slug + '.html' : 'catalogo.html?cat=' + encodeURIComponent(codigo);
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
    var barra = document.createElement('div');
    barra.className = 'barra-demo';
    barra.setAttribute('role', 'status');
    barra.innerHTML = '<span class="barra-demo-etiqueta">Modo demostración</span> ' +
      'Esta versión incluye <strong>proveedores y cotizaciones ficticios</strong>, marcados con la ' +
      'etiqueta <em>demo</em>, para mostrar cómo funcionará el sitio. Ningún proveedor real ha ' +
      'cotizado todavía y ninguno de estos precios es una oferta.';
    document.body.insertBefore(barra, document.body.firstChild);
  })();

  function global_DEMO() {
    return window.DEMO && window.DEMO.activo;
  }

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
        var min = v('data-precio-min'), max = v('data-precio-max');
        el.innerHTML = pct
          ? '<span class="precio">' + fmt(ref) + ' %</span><span class="precio-rango">' + fmt(min) + ' – ' + fmt(max) + ' %</span>'
          : '<span class="precio">' + rd(ref) + '</span><span class="precio-rango">' + rd(min) + ' – ' + rd(max) + '</span>';
      } else {
        el.textContent = pct ? fmt(ref) + ' %' : rd(ref);
      }
    });

    $$('[data-precio-min]', raiz || document).forEach(function (el) {
      if (el.tagName === 'TD') return;
      var celda = el.previousElementSibling;
      var traeItbis = celda && celda.getAttribute('data-precio-itbis') === '1';
      var falso = {itbis: traeItbis};
      var min = precioVista(parseFloat(el.getAttribute('data-precio-min')), falso, sinItbis);
      var max = precioVista(parseFloat(el.getAttribute('data-precio-max')), falso, sinItbis);
      el.textContent = rd(min) + ' – ' + rd(max);
    });
  }

  /* =========================================================
     DETALLE POR PROVEEDOR
     El catálogo lo inserta al vuelo; las páginas de categoría lo
     traen ya escrito en el HTML y solo se muestra u oculta.
     ========================================================= */

  function alternarDetalle(boton) {
    var codigo = boton.getAttribute('data-detalle');
    var fila = boton.closest('tr');
    if (!fila) return;
    var abierto = boton.getAttribute('aria-expanded') === 'true';
    var siguiente = fila.nextElementSibling;

    if (abierto) {
      boton.setAttribute('aria-expanded', 'false');
      if (siguiente && siguiente.classList.contains('fila-detalle')) siguiente.hidden = true;
      return;
    }

    boton.setAttribute('aria-expanded', 'true');

    if (siguiente && siguiente.classList.contains('fila-detalle')) {
      siguiente.hidden = false;
      repintarPrecios(siguiente);
      return;
    }

    var it = itemPorCodigo[codigo];
    if (!it || !PRECIOS) return;
    var tr = document.createElement('tr');
    tr.className = 'fila-detalle';
    var td = document.createElement('td');
    td.colSpan = fila.children.length;
    td.innerHTML = PRECIOS.detalleHTML(it, {
      nombreCat: nombreCat,
      proveedoresCategoria: PROV.lista.filter(function (p) { return p.cats.indexOf(it.cat) !== -1; })
    });
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
        }).join('');
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
        var heno = normaliza([it.nombre, it.codigo, it.esp, it.unidad, nombreCat(it.cat)].join(' '));
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
      var pmin = precioVista(it.min, it, estado.sinItbis);
      var pmax = precioVista(it.max, it, estado.sinItbis);
      var esPorcentaje = it.unidad === '%';

      var precioHtml;
      if (p === null) {
        precioHtml = '<span class="precio-nulo">Según tarifario</span>';
      } else if (esPorcentaje) {
        precioHtml = '<span class="precio">' + fmt(p) + ' %</span>' +
                     '<span class="precio-rango">' + fmt(pmin) + ' – ' + fmt(pmax) + ' %</span>';
      } else {
        precioHtml = '<span class="precio">' + rd(p) + '</span>' +
                     '<span class="precio-rango">' + rd(pmin) + ' – ' + rd(pmax) + '</span>';
      }

      return '<tr>' +
          '<td><button class="item-toggle" type="button" data-detalle="' + esc(it.codigo) + '" aria-expanded="false">' +
                ICONO.flecha + '<span class="item-nombre">' + esc(it.nombre) + '</span></button>' +
              (it.esp ? '<span class="item-esp">' + esc(it.esp) + '</span>' : '') +
              (it.nota ? '<span class="item-esp">' + esc(it.nota) + '</span>' : '') + '</td>' +
          '<td><span class="item-cod">' + esc(it.codigo) + '</span><br>' +
              '<a class="item-esp" style="text-decoration:none" href="' + esc(urlCat(it.cat)) + '">' + esc(nombreCat(it.cat)) + '</a></td>' +
          '<td class="unidad">' + esc(it.unidad) + '</td>' +
          '<td class="num">' + precioHtml + '</td>' +
          '<td>' + badgeEstado(it) + (it.itbis ? '' : ' <span class="badge badge-itbis">no lleva ITBIS</span>') + '</td>' +
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

    function actualizarURL() {
      var p = new URLSearchParams();
      if (estado.q) p.set('q', estado.q);
      if (estado.grupo) p.set('grupo', estado.grupo);
      if (estado.cat) p.set('cat', estado.cat);
      if (estado.etapa) p.set('etapa', estado.etapa);
      if (estado.gama) p.set('gama', estado.gama);
      if (estado.orden !== 'cat') p.set('orden', estado.orden);
      var qs = p.toString();
      window.history.replaceState(null, '', qs ? '?' + qs : window.location.pathname);
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
        $$('[' + (esEtapa ? 'data-etapa' : 'data-gama') + ']').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        chip.setAttribute('aria-pressed', String(!activo));
        if (esEtapa) estado.etapa = activo ? '' : valor;
        else estado.gama = activo ? '' : valor;
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

    /* buscador del hero: manda al catálogo */
    var heroForm = $('#hero-form');
    if (heroForm) {
      heroForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = $('#hero-q').value.trim();
        window.location.href = 'catalogo.html' + (v ? '?q=' + encodeURIComponent(v) : '');
      });
    }

    /* cifras de la portada */
    var nItems = $('#n-items'), nCats = $('#n-cats'), nProv = $('#n-prov'), nPrecios = $('#n-precios');
    if (nItems) nItems.textContent = CAT.items.length;
    if (nCats) nCats.textContent = CAT.categorias.length;
    if (nProv) nProv.textContent = PROV.lista.filter(function (p) { return !p.demo; }).length;
    if (nPrecios) nPrecios.textContent = PROV.lista.filter(function (p) { return p.precios; }).length;
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

      return '<article class="prov">' +
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

    pintar();
  })();

})();
