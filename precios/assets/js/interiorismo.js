'use strict';
/* =========================================================
   interiorismo.js — el explorador visual

   Dos mil setecientas fotos que viven en los servidores de nueve
   comercios. Eso manda sobre todo lo demás del archivo, y en dos
   niveles distintos que conviene no confundir.

   1. NO SE DESCARGAN LOS DATOS DE GOLPE
   El catálogo entero son 559 KB de nombres, precios y URL. En un
   solo archivo, el navegador tiene que bajarlos ENTEROS antes de
   pintar la primera foto, que es justo lo contrario de lo que
   esta página promete. Van en doce páginas de 250 artículos y
   aquí se pide la que hace falta: la primera pantalla son 48 KB
   y un manifiesto de 2 KB.

   El manifiesto trae además las cifras ya calculadas de cada
   categoría y cada comercio, así que el contador —cuántos hay,
   de cuánto a cuánto, la mediana— sale exacto sin descargar las
   doce páginas solo para contar.

   Filtrar por categoría no obliga a bajarlo todo: el manifiesto
   dice qué páginas contienen cada una. Buscar y ordenar por
   precio sí, porque preguntan por el conjunto entero, y mientras
   llegan las que faltan la página lo dice en vez de mentir con
   un resultado parcial.

   2. NO SE PINTAN LAS FICHAS DE GOLPE
   Aunque los datos ya estén, soltar 250 <img> abre cientos de
   conexiones a nueve dominios. Se pintan de 48 en 48 y las
   siguientes al llegar al final.

   UNA FOTO ROTA NO ROMPE LA FICHA
   Son enlaces a sitios ajenos: un día una tienda renombra un
   archivo. Cuando pasa, la ficha se queda con su recuadro, su
   nombre y su enlace, que es lo que de verdad sirve.
   ========================================================= */

(function () {
  var CATS = window.IR_CATS || {};
  var TANDA = 48;
  var RUTA = 'assets/datos/';

  var $ = function (id) { return document.getElementById(id); };
  var grid = $('ir-grid'), cuenta = $('ir-cuenta'), vacio = $('ir-vacio'), mas = $('ir-mas');
  if (!grid) return;

  var man = null;                 // el manifiesto
  var paginas = [];               // las que ya llegaron, por número
  var pidiendo = {};              // las que están en camino
  var estado = { cats: [], sub: null, q: '', comercio: '', orden: 'cat' };
  var lista = [], pintados = 0, cargandoTodo = false;

  function money(n) { return 'RD$ ' + Math.round(n).toLocaleString('en-US'); }
  /* Misma regla que la tabla de precios: sin el paréntesis de la razón
     social y sin el «Ferretería» de delante. */
  function corto(nombre) {
    return String(nombre).replace(/\s*\([^)]*\)\s*/g, '').replace(/^Ferreter[ií]a\s+/i, '').trim();
  }
  function baja(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  /* Deshace el diccionario de prefijos con que se guardaron las URL. */
  function url(v) { return Array.isArray(v) ? man.pre[v[0]] + v[1] : v; }

  /* ---------- pedir páginas ---------- */

  function pide(n) {
    if (paginas[n]) return Promise.resolve(paginas[n]);
    if (pidiendo[n]) return pidiendo[n];
    pidiendo[n] = fetch(RUTA + 'visual-' + n + '.json')
      .then(function (r) { return r.json(); })
      .then(function (filas) {
        paginas[n] = filas.map(function (f) {
          var v = { n: f[0], img: url(f[1]), p: f[2], c: man.com[f[3]], u: url(f[4]), i: f[5], k: f[6], s: f[7] };
          v._b = baja(v.n + ' ' + v.c + ' ' + (CATS[v.k] ? CATS[v.k].n : ''));
          return v;
        });
        return paginas[n];
      })
      .catch(function () { paginas[n] = []; return []; });
    return pidiendo[n];
  }

  /* Qué páginas hacen falta para el filtro puesto. Con categorías elegidas,
     el manifiesto dice cuáles las contienen; sin ellas, todas. */
  function necesarias() {
    var fuera = [];
    for (var n = 0; n < man.pags.length; n++) {
      var p = man.pags[n];
      if (estado.cats.length && !estado.cats.some(function (c) { return p.k.indexOf(c) >= 0; })) continue;
      if (estado.comercio && p.c.indexOf(man.com.indexOf(estado.comercio)) < 0) continue;
      fuera.push(n);
    }
    return fuera;
  }

  /* Buscar y ordenar por precio preguntan por el conjunto entero. */
  function pideTodo() { return estado.q || estado.orden !== 'cat'; }

  function cargadas(ns) { return ns.every(function (n) { return !!paginas[n]; }); }

  /* ---------- filtrar ---------- */

  function filtrar(desdeCero) {
    if (desdeCero !== false) { grid.textContent = ''; pintados = 0; }

    var ns = necesarias();
    var listasYa = ns.filter(function (n) { return !!paginas[n]; });

    lista = [];
    var q = baja(estado.q).split(/\s+/).filter(Boolean);
    listasYa.forEach(function (n) {
      paginas[n].forEach(function (v) {
        if (estado.cats.length && estado.cats.indexOf(v.k) < 0) return;
        if (estado.sub !== null && v.s !== estado.sub) return;
        if (estado.comercio && v.c !== estado.comercio) return;
        for (var i = 0; i < q.length; i++) if (v._b.indexOf(q[i]) < 0) return;
        lista.push(v);
      });
    });

    if (estado.orden === 'asc') lista.sort(function (a, b) { return a.p - b.p; });
    else if (estado.orden === 'desc') lista.sort(function (a, b) { return b.p - a.p; });

    grid.textContent = ''; pintados = 0;
    contar(ns, listasYa);
    pintar();
    vacio.hidden = !(lista.length === 0 && cargadas(ns));
    actualizarURL();

    /* Lo que falta se pide en segundo plano y se vuelve a pintar cuando
       llega. Solo se piden todas cuando el filtro lo exige; si no, basta
       con la siguiente al llegar al final. */
    var faltan = ns.filter(function (n) { return !paginas[n]; });
    if (!faltan.length) return;
    if (pideTodo() || estado.cats.length || estado.comercio) {
      cargandoTodo = true;
      Promise.all(faltan.map(pide)).then(function () {
        cargandoTodo = false;
        filtrar();
      });
    } else if (lista.length < TANDA) {
      pide(faltan[0]).then(function () { filtrar(); });
    }
  }

  /* Fichas que se cayeron porque su foto no cargó. Se guarda la dirección
     para no contar dos veces la misma al repintar. */
  var caidas = {}, rotas = 0, ultimoConteo = null;

  function contar(ns, listasYa) {
    ultimoConteo = [ns, listasYa];
    var c;
    var simple = !estado.q && (estado.cats.length + (estado.comercio ? 1 : 0)) <= 1;
    /* Una categoría con una subcategoría dentro también es cuenta exacta:
       el manifiesto trae cuántas fichas tiene cada una. Sin esto, elegir
       «papel tapiz» seguía diciendo las 719 de toda la categoría. */
    if (simple && estado.sub !== null && estado.cats.length === 1 && !estado.comercio) {
      var fila = (man.subCat[estado.cats[0]] || []).filter(function (x) { return x[0] === estado.sub; })[0];
      if (fila) c = { n: fila[1] };
    } else if (estado.sub !== null) simple = false;
    if (c) { /* ya está */ }
    else if (simple && !estado.cats.length && !estado.comercio) c = man.todo;
    else if (simple && estado.cats.length === 1) c = man.cat[estado.cats[0]];
    else if (simple && estado.comercio) c = man.porCom[man.com.indexOf(estado.comercio)];

    /* Cuando las cifras salen del manifiesto son exactas aunque falten
       páginas por descargar, y avisar de una carga que no las afecta sería
       ruido. El aviso solo sale cuando lo que se cuenta es lo que hay
       cargado, que es cuando el número todavía puede subir. */
    var exactas = !!c;
    if (!c) {
      if (!lista.length) { cuenta.textContent = cargandoTodo ? 'Buscando…' : ''; return; }
      var v = lista.map(function (x) { return x.p; }).sort(function (a, b) { return a - b; });
      c = { n: lista.length, min: v[0], max: v[v.length - 1], med: v[v.length >> 1] };
    }
    var parcial = !exactas && !cargadas(ns);
    /* Cuántos hay, y nada más. El rango y la mediana son análisis y aquí
       se viene a mirar: quien quiera comparar números tiene el catálogo de
       precios y el libro de Excel.

       Menos las fichas que se cayeron: si una foto no carga, su ficha se
       quita (ver ficha()) y contarla sería prometer algo que no está. */
    var n = Math.max(0, c.n - rotas);
    cuenta.innerHTML = '<strong>' + n.toLocaleString('en-US') + '</strong> ' +
      (n === 1 ? 'artículo' : 'artículos') +
      (parcial ? ' <span class="ir-cargando">cargando el resto…</span>' : '');
  }


  /* ---------- pintar ---------- */

  function ficha(v) {
    var a = document.createElement('a');
    a.className = 'ir-card';
    a.href = v.u || '#';
    a.target = '_blank';
    a.rel = 'noopener nofollow';
    a.title = v.n + ' — ' + v.c;

    var marco = document.createElement('span');
    marco.className = 'ir-foto';

    var img = document.createElement('img');
    img.src = v.img;
    img.alt = v.n;
    img.loading = 'lazy';
    img.decoding = 'async';
    /* Aquí se viene a mirar, así que una ficha sin foto no es media ficha:
       es un hueco que estorba. Cuando la dirección de la imagen ya no
       existe —la tienda la cambió, la retiró— la ficha entera se va y el
       contador lo resta. Es lo contrario de lo habitual, y es a propósito:
       en una tabla de precios el dato manda aunque falte la foto; en una
       cuadrícula de fotos, sin foto no hay nada que enseñar. */
    img.onerror = function () {
      if (!caidas[v.img]) { caidas[v.img] = 1; rotas += 1; }
      if (a.parentNode) a.parentNode.removeChild(a);
      if (ultimoConteo) contar(ultimoConteo[0], ultimoConteo[1]);
      /* Si se cayeron todas —la tienda dejó de servir sus imágenes, o no
         hay red— la cuadrícula vacía sin explicación parece un error de la
         página. Vale más decir qué pasó. */
      if (!grid.children.length) {
        vacio.hidden = false;
        vacio.textContent = 'No se pudieron cargar las fotos de estos artículos. Vuelva a intentarlo en un momento.';
      }
    };
    marco.appendChild(img);

    var chip = document.createElement('span');
    chip.className = 'ir-precio';
    chip.innerHTML = '<b>' + money(v.p) + '</b><i></i>';
    /* El nombre corto del comercio, igual que en la tabla: en un recuadro
       de cuatro centímetros sobre la foto, «Ferretería Ochoa (8A)» no cabe
       y no dice nada que «Ochoa» no diga. El completo queda en el title. */
    chip.querySelector('i').textContent = corto(v.c);
    marco.appendChild(chip);
    a.appendChild(marco);

    var pie = document.createElement('span');
    pie.className = 'ir-pie';
    var nom = document.createElement('span');
    nom.className = 'ir-nombre';
    nom.textContent = v.n;
    pie.appendChild(nom);
    /* Debajo del nombre va la subcategoría, no la categoría: «Papel tapiz»
       orienta más que «Revestimientos decorativos», y cuando se está
       mirando una categoría concreta la categoría ya está dicha arriba. */
    var etiqueta = (man && man.sub && man.sub[v.s]) || (CATS[v.k] && CATS[v.k].n);
    if (etiqueta) {
      var cat = document.createElement('span');
      cat.className = 'ir-cat';
      cat.textContent = etiqueta;
      pie.appendChild(cat);
    }
    a.appendChild(pie);
    return a;
  }

  function pintar() {
    var frag = document.createDocumentFragment();
    var hasta = Math.min(pintados + TANDA, lista.length);
    for (var i = pintados; i < hasta; i++) frag.appendChild(ficha(lista[i]));
    grid.appendChild(frag);
    pintados = hasta;

    var ns = necesarias();
    var faltanPaginas = ns.filter(function (n) { return !paginas[n]; });
    var quedan = lista.length - pintados;

    mas.hidden = quedan <= 0 && !faltanPaginas.length;
    if (mas.hidden) { mas.innerHTML = ''; return; }

    if (quedan > 0) {
      mas.innerHTML = '<button class="btn btn-ghost" type="button" id="ir-mas-btn">Ver ' +
        Math.min(TANDA, quedan) + ' más <span class="ir-mas-n">de ' +
        quedan.toLocaleString('en-US') + '</span></button>';
      $('ir-mas-btn').addEventListener('click', pintar);
    } else {
      mas.innerHTML = '<span class="ir-cargando">Cargando más…</span>';
      pide(faltanPaginas[0]).then(function () { filtrar(false); });
    }
  }

  if ('IntersectionObserver' in window) {
    var ojo = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting || !man) return;
      if (pintados < lista.length) pintar();
      else {
        var f = necesarias().filter(function (n) { return !paginas[n]; });
        if (f.length) pide(f[0]).then(function () { filtrar(false); });
      }
    }, { rootMargin: '700px' });
    ojo.observe(mas);
  }

  /* ---------- la URL guarda el estado ---------- */

  function actualizarURL() {
    var p = new URLSearchParams();
    if (estado.cats.length) p.set('cat', estado.cats.join(','));
    /* La subcategoría viaja por su nombre, no por su número: el número
       depende de cuántas fichas tenga cada una y cambia en cada
       importación, así que un enlace guardado dejaría de servir. */
    if (estado.sub !== null && man && man.sub) p.set('sub', man.sub[estado.sub]);
    if (estado.comercio) p.set('comercio', estado.comercio);
    if (estado.q) p.set('q', estado.q);
    if (estado.orden !== 'cat') p.set('orden', estado.orden);
    var s = p.toString();
    history.replaceState(null, '', s ? '?' + s : location.pathname);
  }

  function leerURL() {
    var p = new URLSearchParams(location.search);
    estado.cats = (p.get('cat') || '').split(',').filter(Boolean);
    var sub = p.get('sub');
    estado.sub = sub && man && man.sub ? (man.sub.indexOf(sub) >= 0 ? man.sub.indexOf(sub) : null) : null;
    estado.comercio = p.get('comercio') || '';
    estado.q = p.get('q') || '';
    estado.orden = p.get('orden') || 'cat';
    $('ir-q').value = estado.q;
    $('ir-comercio').value = estado.comercio;
    $('ir-orden').value = estado.orden;
    pintarChips();
  }

  function pintarChips() {
    [].forEach.call(document.querySelectorAll('#ir-chips .ir-chip'), function (b) {
      var c = b.getAttribute('data-cat');
      var on = c ? estado.cats.indexOf(c) >= 0 : estado.cats.length === 0;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    pintarSubs();
  }

  /* ---------- la segunda fila: las subcategorías ----------
     Una categoría del catálogo es demasiado gruesa para elegir mirando:
     «Revestimientos decorativos» mete en la misma pastilla el papel tapiz,
     la plancha de bambú, la piedra flexible y el tirador de mueble, que no
     son la misma decisión. La segunda fila las separa, y solo aparece
     cuando hay una categoría elegida: con el catálogo entero delante serían
     ochenta pastillas, que es otra forma de no ayudar. */
  function pintarSubs() {
    var caja = $('ir-subs');
    if (!caja || !man || !man.subCat) return;
    var unaSola = estado.cats.length === 1 ? estado.cats[0] : null;
    var lst = unaSola ? (man.subCat[unaSola] || []) : [];
    /* Con una sola subcategoría, la fila no dice nada que la de arriba no
       diga ya. */
    if (lst.length < 2) {
      caja.hidden = true;
      caja.textContent = '';
      estado.sub = null;
      return;
    }
    caja.hidden = false;
    var total = 0;
    lst.forEach(function (x) { total += x[1]; });
    var html = '<button class="ir-chip ir-sub' + (estado.sub === null ? ' is-on' : '') +
      '" type="button" data-sub="" aria-pressed="' + (estado.sub === null ? 'true' : 'false') +
      '">Todo<span class="ir-chip-n">' + total + '</span></button>';
    lst.forEach(function (x) {
      var on = estado.sub === x[0];
      html += '<button class="ir-chip ir-sub' + (on ? ' is-on' : '') + '" type="button" data-sub="' +
        x[0] + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        esc(man.sub[x[0]]) + '<span class="ir-chip-n">' + x[1] + '</span></button>';
    });
    caja.innerHTML = html;
  }

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- sucesos ---------- */

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.ir-chip') : null;
    if (!b || !man) return;
    if (b.hasAttribute('data-sub')) {
      var s = b.getAttribute('data-sub');
      estado.sub = s === '' ? null : +s;
      pintarSubs();
    } else {
      var c = b.getAttribute('data-cat');
      if (!c) estado.cats = [];
      else {
        var i = estado.cats.indexOf(c);
        if (i >= 0) estado.cats.splice(i, 1); else estado.cats.push(c);
      }
      /* Cambiar de categoría cambia las subcategorías que hay debajo, así
         que la elegida deja de tener sentido. */
      estado.sub = null;
      pintarChips();
    }
    filtrar();
    window.scrollTo({ top: $('ir-barra').offsetTop - 8, behavior: 'smooth' });
  });

  var espera;
  $('ir-q').addEventListener('input', function (e) {
    clearTimeout(espera);
    var v = e.target.value;
    espera = setTimeout(function () { if (man) { estado.q = v; filtrar(); } }, 220);
  });
  $('ir-comercio').addEventListener('change', function (e) {
    if (man) { estado.comercio = e.target.value; filtrar(); }
  });
  $('ir-orden').addEventListener('change', function (e) {
    if (man) { estado.orden = e.target.value; filtrar(); }
  });

  /* ---------- arranque ---------- */

  cuenta.innerHTML = '<span class="ir-cargando">Cargando…</span>';
  fetch(RUTA + 'visual.json')
    .then(function (r) { return r.json(); })
    .then(function (m) {
      man = m;
      leerURL();
      return pide(necesarias()[0] || 0);
    })
    .then(function () { filtrar(); })
    .catch(function () {
      cuenta.textContent = '';
      vacio.hidden = false;
      vacio.textContent = 'No se pudo cargar el catálogo. Recargue la página.';
    });
}());
