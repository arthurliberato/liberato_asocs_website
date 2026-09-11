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
  var estado = { cats: [], q: '', comercio: '', orden: 'cat' };
  var lista = [], pintados = 0, cargandoTodo = false;

  function money(n) { return 'RD$ ' + Math.round(n).toLocaleString('en-US'); }
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
          var v = { n: f[0], img: url(f[1]), p: f[2], c: man.com[f[3]], u: url(f[4]), i: f[5], k: f[6] };
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

  function contar(ns, listasYa) {
    var c;
    var simple = !estado.q && (estado.cats.length + (estado.comercio ? 1 : 0)) <= 1;
    if (simple && !estado.cats.length && !estado.comercio) c = man.todo;
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
       precios y el libro de Excel. */
    cuenta.innerHTML = '<strong>' + c.n.toLocaleString('en-US') + '</strong> ' +
      (c.n === 1 ? 'artículo' : 'artículos') +
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
    img.onerror = function () { marco.classList.add('ir-foto-rota'); img.remove(); };
    marco.appendChild(img);

    var chip = document.createElement('span');
    chip.className = 'ir-precio';
    chip.innerHTML = '<b>' + money(v.p) + '</b><i></i>';
    chip.querySelector('i').textContent = v.c;
    marco.appendChild(chip);
    a.appendChild(marco);

    var pie = document.createElement('span');
    pie.className = 'ir-pie';
    var nom = document.createElement('span');
    nom.className = 'ir-nombre';
    nom.textContent = v.n;
    pie.appendChild(nom);
    if (CATS[v.k]) {
      var cat = document.createElement('span');
      cat.className = 'ir-cat';
      cat.textContent = CATS[v.k].n;
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
    if (estado.comercio) p.set('comercio', estado.comercio);
    if (estado.q) p.set('q', estado.q);
    if (estado.orden !== 'cat') p.set('orden', estado.orden);
    var s = p.toString();
    history.replaceState(null, '', s ? '?' + s : location.pathname);
  }

  function leerURL() {
    var p = new URLSearchParams(location.search);
    estado.cats = (p.get('cat') || '').split(',').filter(Boolean);
    estado.comercio = p.get('comercio') || '';
    estado.q = p.get('q') || '';
    estado.orden = p.get('orden') || 'cat';
    $('ir-q').value = estado.q;
    $('ir-comercio').value = estado.comercio;
    $('ir-orden').value = estado.orden;
    pintarChips();
  }

  function pintarChips() {
    [].forEach.call(document.querySelectorAll('.ir-chip'), function (b) {
      var c = b.getAttribute('data-cat');
      var on = c ? estado.cats.indexOf(c) >= 0 : estado.cats.length === 0;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* ---------- sucesos ---------- */

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.ir-chip') : null;
    if (!b || !man) return;
    var c = b.getAttribute('data-cat');
    if (!c) estado.cats = [];
    else {
      var i = estado.cats.indexOf(c);
      if (i >= 0) estado.cats.splice(i, 1); else estado.cats.push(c);
    }
    pintarChips();
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
