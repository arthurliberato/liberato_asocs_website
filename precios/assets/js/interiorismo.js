'use strict';
/* =========================================================
   interiorismo.js — el explorador visual

   Dos mil trescientas fotos que viven en los servidores de seis
   comercios. Eso manda sobre todo lo demás del archivo:

   SE PINTA POR TANDAS
   No se pueden soltar 2,312 <img> de golpe: el navegador abre
   cientos de conexiones a seis dominios y la página se arrastra.
   Se pintan 48, y las siguientes cuando el visitante llega al
   final. Con loading="lazy" encima, el navegador ni siquiera
   pide las que quedan fuera de pantalla.

   UNA FOTO ROTA NO ROMPE LA FICHA
   Son enlaces a sitios ajenos: un día una tienda renombra un
   archivo y esa imagen desaparece. Cuando pasa, la ficha se
   queda con su recuadro de color, su nombre y su enlace, que es
   lo que de verdad hace falta. Lo que no puede pasar es que
   quede un hueco blanco sin explicación.

   EL RECUADRO VA SOBRE LA FOTO, NO DEBAJO
   El precio y el comercio tienen que leerse sin salir de la
   exploración, y sobre una fotografía cualquiera —clara, oscura,
   con fondo blanco o una sala entera— lo único que garantiza
   contraste es un relleno sólido. Verde 800 con texto blanco da
   9.5:1, muy por encima del mínimo, sea cual sea la foto debajo.
   ========================================================= */

(function () {
  var V = window.VISUAL || [];
  var CATS = window.IR_CATS || {};
  var TANDA = 48;

  var $ = function (id) { return document.getElementById(id); };
  var grid = $('ir-grid'), cuenta = $('ir-cuenta'), vacio = $('ir-vacio'), mas = $('ir-mas');
  if (!grid) return;

  var estado = { cats: [], q: '', comercio: '', orden: 'cat' };
  var lista = [], pintados = 0;

  var pesos = 'RD$ ' ;
  function money(n) { return pesos + n.toLocaleString('en-US'); }

  /* Sin acentos y en minúscula: quien busca «marmol» quiere encontrar
     «mármol», y en este catálogo la mitad de los nombres vienen de un
     comercio que no los acentúa. */
  function baja(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  V.forEach(function (v) { v._b = baja(v.n + ' ' + v.c + ' ' + (CATS[v.k] ? CATS[v.k].n : '')); });

  /* ---------- filtrar y ordenar ---------- */

  function filtrar() {
    var q = baja(estado.q).split(/\s+/).filter(Boolean);
    lista = V.filter(function (v) {
      if (estado.cats.length && estado.cats.indexOf(v.k) < 0) return false;
      if (estado.comercio && v.c !== estado.comercio) return false;
      for (var i = 0; i < q.length; i++) if (v._b.indexOf(q[i]) < 0) return false;
      return true;
    });

    if (estado.orden === 'asc') lista.sort(function (a, b) { return a.p - b.p; });
    else if (estado.orden === 'desc') lista.sort(function (a, b) { return b.p - a.p; });
    else lista.sort(function (a, b) {
      /* Por categoría, y dentro de ella intercalando comercios: si se deja el
         orden natural, los mil de Mundo LED salen juntos y las primeras
         pantallas parecen una sola tienda. */
      if (a.k !== b.k) return a.k.localeCompare(b.k);
      if (a._i !== b._i) return a._i - b._i;
      return a.n.localeCompare(b.n);
    });

    grid.textContent = '';
    pintados = 0;
    vacio.hidden = lista.length > 0;
    contar();
    pintar();
    actualizarURL();
  }

  /* El turno de cada artículo dentro de su comercio, para poder intercalar. */
  (function () {
    var n = {};
    V.forEach(function (v) { n[v.c] = (n[v.c] || 0); v._i = n[v.c]++; });
  }());

  function contar() {
    var n = lista.length;
    if (!n) { cuenta.textContent = ''; return; }
    var ps = lista.map(function (v) { return v.p; }).sort(function (a, b) { return a - b; });
    var med = ps[ps.length >> 1];
    cuenta.innerHTML = '<strong>' + n.toLocaleString('en-US') + '</strong> ' +
      (n === 1 ? 'artículo' : 'artículos') +
      ' <span class="ir-cuenta-sep">·</span> de ' + money(ps[0]) + ' a ' + money(ps[ps.length - 1]) +
      ' <span class="ir-cuenta-sep">·</span> mediana ' + money(med);
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
    img.referrerPolicy = 'no-referrer-when-downgrade';
    img.onerror = function () { marco.classList.add('ir-foto-rota'); img.remove(); };
    marco.appendChild(img);

    var chip = document.createElement('span');
    chip.className = 'ir-precio';
    chip.innerHTML = '<b>' + money(v.p) + '</b><i>' + v.c + '</i>';
    marco.appendChild(chip);

    a.appendChild(marco);

    var pie = document.createElement('span');
    pie.className = 'ir-pie';
    pie.innerHTML = '<span class="ir-nombre">' + v.n.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>' +
      (CATS[v.k] ? '<span class="ir-cat">' + CATS[v.k].n + '</span>' : '');
    a.appendChild(pie);
    return a;
  }

  function pintar() {
    var frag = document.createDocumentFragment();
    var hasta = Math.min(pintados + TANDA, lista.length);
    for (var i = pintados; i < hasta; i++) frag.appendChild(ficha(lista[i]));
    grid.appendChild(frag);
    pintados = hasta;

    var quedan = lista.length - pintados;
    mas.hidden = quedan <= 0;
    if (quedan > 0) {
      mas.innerHTML = '<button class="btn btn-ghost" type="button" id="ir-mas-btn">Ver ' +
        Math.min(TANDA, quedan) + ' más <span class="ir-mas-n">de ' +
        quedan.toLocaleString('en-US') + '</span></button>';
      $('ir-mas-btn').addEventListener('click', pintar);
    }
  }

  /* Al llegar al final se pinta sola; el botón queda para quien navega con
     teclado o tiene el scroll infinito desactivado. */
  if ('IntersectionObserver' in window) {
    var ojo = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting && pintados < lista.length) pintar();
    }, { rootMargin: '600px' });
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
    if (!b) return;
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
    espera = setTimeout(function () { estado.q = v; filtrar(); }, 200);
  });
  $('ir-comercio').addEventListener('change', function (e) { estado.comercio = e.target.value; filtrar(); });
  $('ir-orden').addEventListener('change', function (e) { estado.orden = e.target.value; filtrar(); });

  leerURL();
  filtrar();
}());
