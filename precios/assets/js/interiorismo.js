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
  /* «comercios» en plural desde que se puede elegir más de uno. Vacío
     quiere decir todos, que es lo mismo que decía la cadena vacía. */
  var estado = { cats: [], sub: null, q: '', comercios: [], orden: 'cat' };
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
      /* Con varios elegidos, la página hace falta si trae alguno. */
      if (estado.comercios.length && !estado.comercios.some(function (c) {
        return p.c.indexOf(man.com.indexOf(c)) >= 0;
      })) continue;
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
        if (estado.comercios.length && estado.comercios.indexOf(v.c) < 0) return;
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
    if (pideTodo() || estado.cats.length || estado.comercios.length) {
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
    var unCom = estado.comercios.length === 1 ? estado.comercios[0] : null;
    /* La cuenta exacta del manifiesto sirve para un comercio, no para
       tres: no hay una cifra guardada por cada combinación. Con varios se
       cuenta lo cargado, como con cualquier otro filtro compuesto. */
    var simple = !estado.q && estado.comercios.length <= 1 &&
                 (estado.cats.length + (unCom ? 1 : 0)) <= 1;
    /* Una categoría con una subcategoría dentro también es cuenta exacta:
       el manifiesto trae cuántas fichas tiene cada una. Sin esto, elegir
       «papel tapiz» seguía diciendo las 719 de toda la categoría. */
    if (simple && estado.sub !== null && estado.cats.length === 1 && !unCom) {
      var fila = (man.subCat[estado.cats[0]] || []).filter(function (x) { return x[0] === estado.sub; })[0];
      if (fila) c = { n: fila[1] };
    } else if (estado.sub !== null) simple = false;
    if (c) { /* ya está */ }
    else if (simple && !estado.cats.length && !unCom) c = man.todo;
    else if (simple && estado.cats.length === 1) c = man.cat[estado.cats[0]];
    else if (simple && unCom) c = man.porCom[man.com.indexOf(unCom)];

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
    /* Ya no se dice cuántos hay. Quien viene a mirar no elige por el número
       —4,841 no ayuda a decidir nada— y ocupaba un renglón entero encima de
       la primera fila de fotos. Lo único que queda es el aviso de que
       todavía está llegando lo que falta, que sí es información: explica
       por qué la cuadrícula sigue creciendo sola. */
    cuenta.innerHTML = parcial ? '<span class="ir-cargando">cargando el resto…</span>' : '';
  }


  /* ---------- pintar ---------- */

  function ficha(v) {
    /* La ficha es un <article> y no un <a>: dentro va el enlace a la tienda
       y, encima de la foto, el botón de guardar. Un botón dentro de un
       enlace no es HTML válido y en la práctica se traga el clic. */
    var tarjeta = document.createElement('article');
    tarjeta.className = 'ir-card';

    var a = document.createElement('a');
    a.className = 'ir-enlace';
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
       existe —la tienda la cambió, la retiró— la ficha entera se va. Es lo
       contrario de lo habitual, y es a propósito: en una tabla de precios
       el dato manda aunque falte la foto; en una cuadrícula de fotos, sin
       foto no hay nada que enseñar. */
    img.onerror = function () {
      if (tarjeta.parentNode) tarjeta.parentNode.removeChild(tarjeta);
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
    tarjeta.appendChild(a);
    tarjeta.appendChild(botonGuardar(v));
    tarjeta.appendChild(acciones(v, a.href));

    /* EN EL TELÉFONO, UN TOQUE NO PUEDE SIGNIFICAR DOS COSAS

       Con ratón la ficha entera es un enlace y el marcador de guardar
       está en la esquina: se ven los dos y se elige con el puntero. Con
       el dedo no hay puntero ni hay hover, el marcador es un blanco de
       treinta píxeles al lado del enlace, y tocar para mirar el precio
       te saca a la tienda sin pedirlo.

       Así que en pantalla táctil el primer toque no sale de la página:
       abre los dos botones sobre la foto y que decida quien mira. */
    a.addEventListener('click', function (e) {
      if (!esTactil() || tarjeta.classList.contains('is-abierta')) return;
      e.preventDefault();
      cerrarFichas();
      tarjeta.classList.add('is-abierta');
    });
    return tarjeta;
  }

  /* Si el dispositivo no tiene hover, el dedo es el puntero. Se pregunta
     cada vez y no una sola: hay tabletas con teclado y ventanas que se
     arrastran de una pantalla a otra. */
  function esTactil() {
    return window.matchMedia && window.matchMedia('(hover: none)').matches;
  }

  function cerrarFichas() {
    [].forEach.call(document.querySelectorAll('.ir-card.is-abierta'), function (c) {
      c.classList.remove('is-abierta');
    });
  }

  /* Los dos botones que salen al tocar: el mismo de guardar, con todas
     sus letras porque aquí hay sitio, y el de salir a la tienda. */
  function acciones(v, href) {
    var caja = document.createElement('div');
    caja.className = 'ir-acciones';

    var g = document.createElement('button');
    g.type = 'button';
    g.className = 'ir-acc ir-acc-guardar';
    g.innerHTML = ICONO_MARCA + '<span></span>';
    marcarAccion(g, v);
    g.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      alternar(v);
      marcarAccion(g, v);
      var esq = caja.parentNode && caja.parentNode.querySelector('.ir-guardar');
      if (esq) marcarBoton(esq, v);
    });
    caja.appendChild(g);

    var ver = document.createElement('a');
    ver.className = 'ir-acc ir-acc-ver';
    ver.href = href;
    ver.target = '_blank';
    ver.rel = 'noopener nofollow';
    ver.textContent = 'Ver en la tienda';
    ver.addEventListener('click', function (e) { e.stopPropagation(); });
    caja.appendChild(ver);
    return caja;
  }

  function marcarAccion(b, v) {
    var on = estaGuardado(v);
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.querySelector('span').textContent = on ? 'Guardado' : 'Guardar';
  }

  /* =========================================================
     MI SELECCIÓN

     El mismo panel lateral que la lista de cotización del catálogo,
     porque es el mismo gesto: ir apartando lo que sirve para mandarlo
     junto. Lo que cambia es qué se guarda. En la tabla se guarda un
     ítem —«papel tapiz, 12 m²»—, que es lo que va a un presupuesto;
     aquí se guarda el artículo concreto que se vio: esta foto, este
     modelo, este precio, esta tienda. Son dos listas y no una porque
     son dos decisiones distintas, y mezclarlas perdería justo lo que
     hace útil a cada una.

     Vive en el navegador, como la otra. El día que haya cuentas, esto
     es lo que se sincroniza.
     ========================================================= */

  var LS_SEL = 'ilya_interiorismo_seleccion_v1';
  var seleccion = [];

  /* La dirección del producto identifica al artículo: es única por tienda
     y no cambia con la importación, a diferencia de cualquier índice. */
  function claveDe(v) { return v.u || v.img; }

  function leerSeleccion() {
    try {
      var t = localStorage.getItem(LS_SEL);
      seleccion = t ? JSON.parse(t) : [];
      if (!Array.isArray(seleccion)) seleccion = [];
    } catch (e) { seleccion = []; }
  }
  function guardarSeleccion() {
    try { localStorage.setItem(LS_SEL, JSON.stringify(seleccion)); } catch (e) { /* modo privado */ }
  }
  function estaGuardado(v) {
    var k = claveDe(v);
    for (var i = 0; i < seleccion.length; i++) if (claveDe(seleccion[i]) === k) return true;
    return false;
  }

  var ICONO_MARCA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v16l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>';

  function botonGuardar(v) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ir-guardar';
    b.innerHTML = ICONO_MARCA;
    marcarBoton(b, v);
    b.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      alternar(v);
      marcarBoton(b, v);
      var acc = b.parentNode && b.parentNode.querySelector('.ir-acc-guardar');
      if (acc) marcarAccion(acc, v);
    });
    return b;
  }

  function marcarBoton(b, v) {
    var on = estaGuardado(v);
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('aria-label', (on ? 'Quitar de mi selección: ' : 'Guardar en mi selección: ') + v.n);
    b.title = on ? 'Quitar de mi selección' : 'Guardar en mi selección';
  }

  function alternar(v) {
    var k = claveDe(v), i = -1;
    for (var n = 0; n < seleccion.length; n++) if (claveDe(seleccion[n]) === k) { i = n; break; }
    if (i >= 0) seleccion.splice(i, 1);
    else seleccion.push({ n: v.n, img: v.img, p: v.p, c: v.c, u: v.u, k: v.k, s: v.s, q: 1 });
    guardarSeleccion();
    pintarSeleccion();
  }

  /* CUÁNTAS

     Una pieza guardada casi nunca es una pieza comprada: son doce metros de
     porcelanato, seis luminarias iguales, tres rollos de papel. Sin la
     cantidad la suma del panel no es un presupuesto de nada, y el comercio
     que recibe la solicitud no sabe qué cotizar.

     Va a 1 por defecto para no obligar a teclear cuando de verdad es una.
     Las listas viejas no la traen —se guardaron antes de que existiera—,
     así que se lee con el 1 de respaldo en vez de migrarlas. */
  function cant(v) {
    var q = parseFloat(v && v.q);
    return q > 0 ? q : 1;
  }
  function importe(v) { return (v.p || 0) * cant(v); }

  function fijarCantidad(i, q) {
    if (!seleccion[i]) return;
    q = parseFloat(q);
    seleccion[i].q = q > 0 ? q : 1;
    guardarSeleccion();
    pintarSeleccion();
  }

  /* Los botones de la cuadrícula tienen que decir lo mismo que el panel:
     se quita algo desde el panel y la ficha de atrás se entera. */
  function refrescarBotones() {
    [].forEach.call(grid.querySelectorAll('.ir-card'), function (t) {
      var b = t.querySelector('.ir-guardar');
      var enlace = t.querySelector('.ir-enlace');
      var img = t.querySelector('img');
      if (!b || !img) return;
      var v = { u: enlace ? enlace.getAttribute('href') : '', img: img.getAttribute('src'),
                n: (t.querySelector('.ir-nombre') || {}).textContent || '' };
      if (v.u === '#') v.u = '';
      marcarBoton(b, v);
    });
  }

  function pintarSeleccion() {
    var fab = $('ir-fab'), n = $('ir-n'), cuerpo = $('ir-lista'),
        total = $('ir-total'), sub = $('ir-sub');
    if (!cuerpo) return;
    /* El botón se queda aunque no haya nada guardado. Escondido hasta el
       primer clic, nadie descubre que la lista existe: el marcador de cada
       foto no se lee como «esto se guarda en algún sitio» si ese sitio no
       está a la vista. Con la lista vacía el contador va en cero y el panel
       explica qué hacer. */
    if (fab) fab.hidden = false;
    if (n) n.textContent = seleccion.length;

    if (!seleccion.length) {
      cuerpo.innerHTML = '<p class="cot-vacio">Todavía no ha guardado nada.<br>' +
        'Use el marcador de cada foto para ir apartando lo que le sirva.</p>';
    } else {
      cuerpo.innerHTML = porCategoria().map(function (g) {
        return '<div class="ir-grupo">' +
            '<div class="ir-grupo-cab">' +
              '<span>' + esc(g.nombre) + ' <small>' + g.filas.length + '</small></span>' +
              '<span class="ir-grupo-sub">' + money(g.suma) + '</span>' +
            '</div>' +
            g.filas.map(function (f) {
              var v = f.v;
              return '<div class="ir-sel">' +
                  '<img src="' + esc(v.img) + '" alt="" loading="lazy">' +
                  '<div class="ir-sel-txt">' +
                    '<a href="' + esc(v.u || '#') + '" target="_blank" rel="noopener nofollow">' + esc(v.n) + '</a>' +
                    '<small>' + esc(corto(v.c)) + (man && man.sub && man.sub[v.s] ? ' · ' + esc(man.sub[v.s]) : '') + '</small>' +
                  '</div>' +
                  '<div class="ir-sel-der">' +
                    '<input class="ir-cant" type="number" min="1" step="1" inputmode="numeric" ' +
                      'value="' + cant(v) + '" data-cant="' + f.i + '" ' +
                      'aria-label="Cantidad de ' + esc(v.n) + '">' +
                    '<span class="ir-sel-p">' + money(importe(v)) +
                      (cant(v) > 1 ? '<small>' + money(v.p) + ' c/u</small>' : '') + '</span>' +
                    '<button class="cot-quitar" type="button" data-quitar="' + f.i + '" aria-label="Quitar ' + esc(v.n) + '">' +
                      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12"/></svg>' +
                    '</button>' +
                  '</div>' +
                '</div>';
            }).join('') +
          '</div>';
      }).join('');
    }

    if (total) total.textContent = money(sumaTotal());
    var uds = 0;
    seleccion.forEach(function (v) { uds += cant(v); });
    if (sub) sub.textContent = seleccion.length
      ? seleccion.length + (seleccion.length === 1 ? ' pieza guardada' : ' piezas guardadas') +
        (uds !== seleccion.length ? ' · ' + uds + ' unidades' : '')
      : '';
    if (enRFQ) pintarRFQ();
    refrescarBotones();
  }

  /* Una selección de interiorismo se cuenta por decenas o por cientos, y
     una lista plana de doscientas fotos no se lee. Se agrupa por categoría
     —pisos, iluminación, revestimientos— con su subtotal, que es como se
     mira un presupuesto de acabados: cuánto va en piso, cuánto en luz. El
     orden de los grupos es el mismo de las pastillas de arriba. */
  function porCategoria() {
    var grupos = {}, orden = [];
    seleccion.forEach(function (v, i) {
      var k = v.k || 'otros';
      if (!grupos[k]) { grupos[k] = []; orden.push(k); }
      grupos[k].push({ v: v, i: i });
    });
    var deLasPastillas = Object.keys(CATS);
    orden.sort(function (a, b) {
      var x = deLasPastillas.indexOf(a), y = deLasPastillas.indexOf(b);
      return (x < 0 ? 99 : x) - (y < 0 ? 99 : y);
    });
    return orden.map(function (k) {
      var suma = 0;
      grupos[k].forEach(function (f) { suma += importe(f.v); });
      return { cat: k, nombre: (CATS[k] && CATS[k].n) || 'Otros', filas: grupos[k], suma: suma };
    });
  }


  /* =========================================================
     SOLICITAR COTIZACIÓN

     La lista se arma mirando fotos, que es una sola actividad; pedirla es
     otra, y sobre todo se hace por partes. Doce piezas guardadas pueden
     ser cuatro tiendas, y ninguna de las cuatro quiere una lista con lo
     que venden las otras tres. Así que la misma selección se da la vuelta:
     de agrupada por categoría —como se mira— a agrupada por comercio
     —como se pide—, y cada comercio recibe solo lo suyo.

     Quien pide se identifica una vez. Un comercio dominicano que recibe
     una solicitud sin nombre ni RNC no sabe si cotiza al detalle o de
     obra, y son precios distintos; el RNC es justamente lo que le dice
     que hay una empresa detrás. Va opcional —hay quien construye su casa
     sin RNC— y se guarda en el navegador para no volver a escribirlo.

     No se manda nada desde aquí: no hay servidor y no lo va a haber por
     esto. Se prepara el texto y se abre el canal del comercio —su correo,
     su WhatsApp— con el texto dentro; mandar lo manda la persona, desde
     su propia cuenta, que además es como el comercio puede contestarle.
     ========================================================= */

  var LS_QUIEN = 'ilya_solicitante_v1';
  var quien = { nombre: '', rnc: '', email: '', tel: '', obra: '' };
  var enRFQ = false;

  function leerQuien() {
    try {
      var t = JSON.parse(localStorage.getItem(LS_QUIEN) || '{}');
      if (t && typeof t === 'object') {
        ['nombre', 'rnc', 'email', 'tel', 'obra'].forEach(function (k) {
          if (typeof t[k] === 'string') quien[k] = t[k];
        });
      }
    } catch (e) { /* modo privado */ }
  }
  function guardarQuien() {
    try { localStorage.setItem(LS_QUIEN, JSON.stringify(quien)); } catch (e) { /* modo privado */ }
  }

  /* La misma selección, agrupada por comercio. El orden es por importe: la
     tienda a la que más se le va a pedir, primero. */
  function porComercio() {
    var g = {}, orden = [];
    seleccion.forEach(function (v, i) {
      var k = v.c || 'Sin comercio';
      if (!g[k]) { g[k] = []; orden.push(k); }
      g[k].push({ v: v, i: i });
    });
    return orden.map(function (k) {
      var suma = 0, uds = 0;
      g[k].forEach(function (f) { suma += importe(f.v); uds += cant(f.v); });
      return { com: k, filas: g[k], suma: suma, uds: uds, contacto: contactoDe(k) };
    }).sort(function (a, b) { return b.suma - a.suma; });
  }

  function contactoDe(nombre) {
    if (!man || !man.contacto || !man.com) return {};
    var i = man.com.indexOf(nombre);
    return (i >= 0 && man.contacto[i]) || {};
  }

  /* El texto que recibe el comercio. Va en plano y no en HTML porque tiene
     que entrar igual en un correo, en un WhatsApp y en un pegado a mano. */
  function textoRFQ(g) {
    var l = [];
    l.push('Solicitud de cotización');
    l.push('');
    l.push('Buen día. Les escribo para pedirles cotización de los siguientes');
    l.push('artículos de su catálogo:');
    l.push('');
    g.filas.forEach(function (f, n) {
      var v = f.v;
      l.push((n + 1) + '. ' + v.n);
      l.push('   Cantidad: ' + cant(v));
      if (v.u) l.push('   ' + v.u);
    });
    l.push('');
    l.push('Agradezco me confirmen precio unitario, disponibilidad, tiempo de');
    l.push('entrega y si el precio incluye ITBIS.');
    l.push('');
    var firma = [];
    if (quien.nombre) firma.push(quien.nombre);
    if (quien.rnc) firma.push('RNC ' + quien.rnc);
    if (quien.obra) firma.push('Obra: ' + quien.obra);
    if (quien.email) firma.push(quien.email);
    if (quien.tel) firma.push('Tel. ' + quien.tel);
    if (firma.length) { l.push('—'); firma.forEach(function (x) { l.push(x); }); }
    return l.join('\n');
  }

  function asuntoRFQ() {
    return 'Solicitud de cotización' + (quien.obra ? ' · ' + quien.obra : '');
  }

  var CAMPOS = [
    { k: 'nombre', t: 'Nombre o empresa', ph: 'Ings. Liberato & Asociados', tipo: 'text', an: 'organization' },
    { k: 'rnc', t: 'RNC', ph: '1-01-12345-6', tipo: 'text', an: 'off', op: true },
    { k: 'email', t: 'Correo', ph: 'compras@ejemplo.com', tipo: 'email', an: 'email' },
    { k: 'tel', t: 'Teléfono', ph: '809-000-0000', tipo: 'tel', an: 'tel', op: true },
    { k: 'obra', t: 'Obra o proyecto', ph: 'Residencial Los Cerros, apto. 3B', tipo: 'text', an: 'off', op: true }
  ];

  function pintarRFQ() {
    var caja = $('ir-rfq');
    if (!caja) return;

    if (!seleccion.length) {
      caja.innerHTML = '<p class="cot-vacio">No hay nada que cotizar todavía.</p>';
      return;
    }

    var grupos = porComercio();

    var form = '<div class="ir-quien">' +
      '<h3>Quién pide</h3>' +
      '<p class="ir-quien-n">Va al pie de cada solicitud. Se guarda en este navegador; ' +
      'no sale de aquí hasta que usted mande el mensaje.</p>' +
      '<div class="ir-quien-campos">' +
      CAMPOS.map(function (c) {
        return '<label class="ir-campo' + (c.k === 'obra' ? ' ir-campo-ancho' : '') + '">' +
            '<span>' + esc(c.t) + (c.op ? ' <i>opcional</i>' : '') + '</span>' +
            '<input type="' + c.tipo + '" data-quien="' + c.k + '" autocomplete="' + c.an + '" ' +
              'placeholder="' + esc(c.ph) + '" value="' + esc(quien[c.k] || '') + '">' +
          '</label>';
      }).join('') +
      '</div></div>';

    var cartas = grupos.map(function (g, gi) {
      var c = g.contacto, canales = [];

      if (c.email) {
        canales.push('<a class="btn btn-primary" href="mailto:' + esc(c.email) +
          '?subject=' + encodeURIComponent(asuntoRFQ()) +
          '&body=' + encodeURIComponent(textoRFQ(g)) + '">' + ICONO_CORREO + 'Correo</a>');
      }
      if (c.wa) {
        canales.push('<a class="btn btn-ghost" target="_blank" rel="noopener" href="https://wa.me/' +
          esc(String(c.wa).replace(/\D/g, '')) + '?text=' + encodeURIComponent(textoRFQ(g)) +
          '">' + ICONO_WA + 'WhatsApp</a>');
      }
      canales.push('<button class="btn btn-ghost" type="button" data-copiar="' + gi + '">' +
        ICONO_COPIAR + 'Copiar la solicitud</button>');
      if (c.web) {
        canales.push('<a class="btn btn-ghost" target="_blank" rel="noopener nofollow" href="https://' +
          esc(c.web) + '">' + ICONO_WEB + esc(c.web) + '</a>');
      }

      return '<div class="ir-carta">' +
          '<div class="ir-carta-cab">' +
            '<span class="ir-carta-com">' + esc(corto(g.com)) + '</span>' +
            '<span class="ir-carta-cif">' + g.filas.length +
              (g.filas.length === 1 ? ' artículo' : ' artículos') +
              ' · ' + g.uds + (g.uds === 1 ? ' unidad' : ' unidades') +
              ' · ' + money(g.suma) + '</span>' +
          '</div>' +
          '<ol class="ir-carta-lista">' +
            g.filas.map(function (f) {
              return '<li><span>' + esc(f.v.n) + '</span><b>' + cant(f.v) + '</b></li>';
            }).join('') +
          '</ol>' +
          (c.email || c.wa ? '' :
            '<p class="ir-carta-n">Todavía no tenemos su correo ni su WhatsApp. ' +
            'Copie la solicitud y péguela donde la tienda atienda.</p>') +
          '<div class="ir-carta-acc">' + canales.join('') + '</div>' +
        '</div>';
    }).join('');

    caja.innerHTML = form +
      '<p class="ir-rfq-tit">' + grupos.length +
        (grupos.length === 1 ? ' comercio' : ' comercios') + ' a los que pedir</p>' +
      cartas;
  }

  var ICONO_CORREO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/></svg>';
  var ICONO_WA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/></svg>';
  var ICONO_COPIAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 9h10v10H9z"/><path d="M5 15V5h10"/></svg>';
  var ICONO_WEB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></svg>';

  /* El texto va dentro del enlace —mailto: y wa.me lo llevan en la
     dirección— así que cambia con cada letra que se escribe en «quién
     pide». Repintar la vista entera en cada tecla le quitaría el foco al
     campo, así que se reescriben solo las direcciones. */
  function refrescarEnlaces() {
    var caja = $('ir-rfq');
    if (!caja || caja.hidden) return;
    var grupos = porComercio();
    [].forEach.call(caja.querySelectorAll('.ir-carta'), function (t, gi) {
      var g = grupos[gi];
      if (!g) return;
      var texto = textoRFQ(g);
      var m = t.querySelector('a[href^="mailto:"]');
      if (m) {
        m.href = 'mailto:' + g.contacto.email +
          '?subject=' + encodeURIComponent(asuntoRFQ()) +
          '&body=' + encodeURIComponent(texto);
      }
      var w = t.querySelector('a[href^="https://wa.me/"]');
      if (w) {
        w.href = 'https://wa.me/' + String(g.contacto.wa).replace(/\D/g, '') +
          '?text=' + encodeURIComponent(texto);
      }
    });
  }

  function verRFQ(si) {
    enRFQ = !!si;
    var lista = $('ir-lista'), caja = $('ir-rfq'), tit = $('ir-panel-titulo'),
        acc = $('ir-acciones'), accR = $('ir-rfq-acciones');
    if (!caja) return;
    if (enRFQ) pintarRFQ();
    lista.hidden = enRFQ;
    caja.hidden = !enRFQ;
    if (acc) acc.hidden = enRFQ;
    if (accR) accR.hidden = !enRFQ;
    if (tit) tit.textContent = enRFQ ? 'Solicitar cotización' : 'Mi selección';
    /* En la vista por comercio el pie dice otra cosa: ahí lo que importa no
       es que la suma sea orientativa, sino que va a dejar de serlo. */
    var nota = $('ir-nota');
    if (nota) {
      nota.textContent = enRFQ
        ? 'Los precios son los que publica cada tienda hoy. La cotización que le devuelvan es la que vale.'
        : 'Cada pieza lleva el precio que publica su tienda, con enlace a ella. La suma es ' +
          'orientativa: no incluye instalación, transporte ni las mermas del corte.';
    }
    caja.scrollTop = 0;
    if (lista) lista.scrollTop = 0;
  }

  function copiarSolicitud(gi, boton) {
    var g = porComercio()[gi];
    if (!g) return;
    var t = textoRFQ(g);
    var hecho = function () {
      var antes = boton.innerHTML;
      boton.innerHTML = ICONO_COPIAR + 'Copiado';
      boton.disabled = true;
      setTimeout(function () { boton.innerHTML = antes; boton.disabled = false; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(hecho, function () { aMano(t, hecho); });
    } else { aMano(t, hecho); }
  }

  /* Sin permiso de portapapeles —o sin https— queda el truco de siempre. */
  function aMano(t, hecho) {
    var a = document.createElement('textarea');
    a.value = t;
    a.setAttribute('readonly', '');
    a.style.position = 'fixed';
    a.style.top = '-1000px';
    document.body.appendChild(a);
    a.select();
    try { document.execCommand('copy'); hecho(); } catch (e) { /* nada que hacer */ }
    document.body.removeChild(a);
  }

  function unidades() {
    var n = 0;
    seleccion.forEach(function (v) { n += cant(v); });
    return n;
  }

  function sumaTotal() {
    var n = 0;
    seleccion.forEach(function (v) { n += importe(v); });
    return n;
  }

  function fechaHoy() {
    var d = new Date();
    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
  }

  /* ---------- exportar a PDF ----------
     Sin librería: se arma una hoja limpia dentro de la misma página, se
     esconde en pantalla y solo existe al imprimir. El navegador ya sabe
     hacer PDF —«Guardar como PDF» en su propio diálogo— y lo hace con
     mejor tipografía que cualquier generador que pudiéramos cargar, y sin
     los trescientos kilobytes que costaría traerlo. */
  function exportarPDF() {
    var hoja = document.getElementById('ir-impresion');
    if (!hoja) {
      hoja = document.createElement('div');
      hoja.id = 'ir-impresion';
      hoja.className = 'solo-impresion';
      document.body.appendChild(hoja);
    }
    var grupos = porCategoria();
    hoja.innerHTML =
      '<header class="imp-cab">' +
        '<h1>Mi selección</h1>' +
        '<p>Presupuesta · Ingenieros Liberato &amp; Asociados · precios.ingsliberato.com</p>' +
        '<p>' + seleccion.length + (seleccion.length === 1 ? ' pieza' : ' piezas') +
          ' · ' + unidades() + (unidades() === 1 ? ' unidad' : ' unidades') +
          ' · ' + fechaHoy() + '</p>' +
      '</header>' +
      grupos.map(function (g) {
        return '<section class="imp-grupo">' +
            '<h2>' + esc(g.nombre) + '<span>' + money(g.suma) + '</span></h2>' +
            '<table><tbody>' +
            g.filas.map(function (f) {
              var v = f.v;
              return '<tr>' +
                  '<td class="imp-foto"><img src="' + esc(v.img) + '" alt=""></td>' +
                  '<td><strong>' + esc(v.n) + '</strong><br><small>' + esc(corto(v.c)) +
                    (man && man.sub && man.sub[v.s] ? ' · ' + esc(man.sub[v.s]) : '') + '</small>' +
                    (v.u ? '<br><small class="imp-url">' + esc(v.u) + '</small>' : '') + '</td>' +
                  '<td class="imp-c">' + cant(v) + '</td>' +
                  '<td class="imp-p">' + money(importe(v)) +
                    (cant(v) > 1 ? '<br><small>' + money(v.p) + ' c/u</small>' : '') + '</td>' +
                '</tr>';
            }).join('') +
            '</tbody></table>' +
          '</section>';
      }).join('') +
      '<p class="imp-total"><span>Suma de lo guardado</span><span>' + money(sumaTotal()) + '</span></p>' +
      '<p class="imp-pie">Cada pieza lleva el precio que publica su tienda en línea, con su enlace. ' +
        'La suma es orientativa: no incluye instalación, transporte ni las mermas del corte, y ningún ' +
        'precio es una cotización formal.</p>';
    window.print();
  }

  /* ---------- exportar a Excel ----------
     Un .xlsx de verdad, no un CSV con otro nombre: es un zip con cinco
     XML dentro, y escribirlo a mano cuesta menos que traer una librería.
     Sin compresión (método 0), que para unas pocas decenas de kilobytes
     da igual y ahorra el deflate. */
  function crcTabla() {
    var t = [], c, n, k;
    for (n = 0; n < 256; n++) {
      c = n;
      for (k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  }
  var CRC = crcTabla();
  function crc32(b) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function bytes(s) {
    var out = [], i, c;
    for (i = 0; i < s.length; i++) {
      c = s.codePointAt(i);
      if (c > 0xFFFF) i++;
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xC0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xF0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return new Uint8Array(out);
  }
  function zip(archivos) {
    var partes = [], central = [], desplazamiento = 0;
    function u16(n) { return [n & 255, (n >> 8) & 255]; }
    function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
    archivos.forEach(function (f) {
      var nombre = bytes(f.nombre), datos = bytes(f.texto), c = crc32(datos);
      var local = [].concat([0x50,0x4B,0x03,0x04], u16(20), u16(0), u16(0), u16(0), u16(0),
                            u32(c), u32(datos.length), u32(datos.length), u16(nombre.length), u16(0));
      partes.push(new Uint8Array(local), nombre, datos);
      central.push([].concat([0x50,0x4B,0x01,0x02], u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
                             u32(c), u32(datos.length), u32(datos.length), u16(nombre.length),
                             u16(0), u16(0), u16(0), u16(0), u32(0), u32(desplazamiento),
                             Array.prototype.slice.call(nombre)));
      desplazamiento += local.length + nombre.length + datos.length;
    });
    var dir = [];
    central.forEach(function (c) { dir = dir.concat(c); });
    var fin = [].concat([0x50,0x4B,0x05,0x06], u16(0), u16(0), u16(archivos.length), u16(archivos.length),
                        u32(dir.length), u32(desplazamiento), u16(0));
    partes.push(new Uint8Array(dir), new Uint8Array(fin));
    var total = 0; partes.forEach(function (p) { total += p.length; });
    var salida = new Uint8Array(total), n = 0;
    partes.forEach(function (p) { salida.set(p, n); n += p.length; });
    return salida;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function col(n) { var s = ''; n += 1; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - r - 1) / 26; } return s; }
  function libro(filas, anchos, titulo) {
    var xmlFilas = filas.map(function (fila, y) {
      var celdas = fila.map(function (v, x) {
        var ref = col(x) + (y + 1);
        if (typeof v === 'number' && isFinite(v)) return '<c r="' + ref + '"><v>' + v + '</v></c>';
        if (v === null || v === undefined || v === '') return '';
        return '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + esc(v) + '</t></is></c>';
      }).join('');
      return '<row r="' + (y + 1) + '">' + celdas + '</row>';
    }).join('');
    var cols = anchos.map(function (w, i) {
      return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>';
    }).join('');
    return zip([
      { nombre: '[Content_Types].xml', texto:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '</Types>' },
      { nombre: '_rels/.rels', texto:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>' },
      { nombre: 'xl/workbook.xml', texto:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<sheets><sheet name="' + esc(titulo) + '" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { nombre: 'xl/_rels/workbook.xml.rels', texto:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '</Relationships>' },
      { nombre: 'xl/worksheets/sheet1.xml', texto:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<cols>' + cols + '</cols><sheetData>' + xmlFilas + '</sheetData></worksheet>' }
    ]);
  }

  function exportarExcel() {
    var filas = [
      ['Mi selección — Presupuesta · Ingenieros Liberato & Asociados'],
      ['precios.ingsliberato.com · ' + fechaHoy()],
      [],
      ['Categoría', 'Pieza', 'Tipo', 'Comercio', 'Cantidad', 'Precio unitario RD$',
       'Importe RD$', 'Enlace']
    ];
    porCategoria().forEach(function (g) {
      g.filas.forEach(function (f) {
        var v = f.v;
        filas.push([g.nombre, v.n, (man && man.sub && man.sub[v.s]) || '', v.c,
                    cant(v), v.p || 0, importe(v), v.u || '']);
      });
      filas.push(['', 'Subtotal ' + g.nombre, '', '', '', '', g.suma, '']);
      filas.push([]);
    });
    filas.push(['', 'TOTAL', '', '', '', '', sumaTotal(), '']);
    filas.push([]);
    filas.push(['Los precios son los que publica cada tienda en línea. No incluyen instalación, ' +
                'transporte ni mermas, y ninguno es una cotización formal.']);

    var datos = libro(filas, [26, 44, 28, 22, 10, 16, 14, 48], 'Mi selección');
    var url = URL.createObjectURL(new Blob([datos],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'mi-seleccion-presupuesta.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }



  /* Se abre y se cierra igual que el panel del catálogo, con las mismas
     clases: una sola manera de comportarse en todo el sitio. */
  function abrirPanel(abrir) {
    var panel = $('ir-panel'), velo = $('ir-overlay');
    if (!panel) return;
    panel.classList.toggle('is-open', abrir);
    panel.setAttribute('aria-hidden', abrir ? 'false' : 'true');
    if (velo) velo.classList.toggle('is-open', abrir);
    var foco = abrir ? $('ir-cerrar') : $('ir-fab');
    if (foco && !foco.hidden) foco.focus();
  }

  (function montarSeleccion() {
    if (!$('ir-panel')) return;
    leerSeleccion();
    leerQuien();
    pintarSeleccion();

    $('ir-fab').addEventListener('click', function () { abrirPanel(true); });
    $('ir-cerrar').addEventListener('click', function () { abrirPanel(false); });
    $('ir-overlay').addEventListener('click', function () { abrirPanel(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('ir-panel').classList.contains('is-open')) abrirPanel(false);
    });

    $('ir-lista').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-quitar]') : null;
      if (!b) return;
      seleccion.splice(+b.getAttribute('data-quitar'), 1);
      guardarSeleccion();
      pintarSeleccion();
    });

    /* La cantidad se aplica al soltar el campo y al pulsar Intro, no en
       cada tecla: repintar la lista entera mientras se teclea le quita el
       foco al campo en el que se está escribiendo. */
    $('ir-lista').addEventListener('change', function (e) {
      var c = e.target.closest ? e.target.closest('[data-cant]') : null;
      if (c) fijarCantidad(+c.getAttribute('data-cant'), c.value);
    });
    $('ir-lista').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var c = e.target.closest ? e.target.closest('[data-cant]') : null;
      if (c) { e.preventDefault(); c.blur(); }
    });

    $('ir-pdf').addEventListener('click', exportarPDF);
    $('ir-excel').addEventListener('click', exportarExcel);
    $('ir-cotizar').addEventListener('click', function () { verRFQ(true); });
    $('ir-volver').addEventListener('click', function () { verRFQ(false); });

    $('ir-rfq').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-copiar]') : null;
      if (b) copiarSolicitud(+b.getAttribute('data-copiar'), b);
    });
    /* Los campos de quién pide se guardan al salir de cada uno. No se
       repinta nada: el texto de la solicitud se arma en el momento de
       mandarla, así que basta con tener el dato al día. */
    $('ir-rfq').addEventListener('input', function (e) {
      var c = e.target.closest ? e.target.closest('[data-quien]') : null;
      if (!c) return;
      quien[c.getAttribute('data-quien')] = c.value.trim();
      guardarQuien();
      refrescarEnlaces();
    });
  }());

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
    if (estado.comercios.length) p.set('comercio', estado.comercios.join(','));
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
    /* Un enlace guardado de cuando solo se podía elegir uno trae un
       nombre suelto, y sigue valiendo: una lista de uno. */
    estado.comercios = (p.get('comercio') || '').split(',')
      .map(function (x) { return x.trim(); })
      .filter(function (x) { return x && man && man.com.indexOf(x) >= 0; });
    estado.q = p.get('q') || '';
    estado.orden = p.get('orden') || 'cat';
    $('ir-q').value = estado.q;
    $('ir-orden').value = estado.orden;
    pintarComercios();
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

  /* ---------- el desplegable de comercios ----------

     Se puede elegir más de uno. El botón dice cuántos hay elegidos sin
     abrirlo, que en el teléfono es lo único que se ve mientras se mira la
     cuadrícula: «Todos los comercios», «Ochoa» o «3 comercios». */

  function pintarComercios() {
    var caja = $('ir-comercio-menu');
    if (!caja) return;
    [].forEach.call(caja.querySelectorAll('input[type=checkbox]'), function (i) {
      i.checked = estado.comercios.indexOf(i.value) >= 0;
    });
    var t = $('ir-comercio-txt');
    if (!estado.comercios.length) t.textContent = 'Todos los comercios';
    else if (estado.comercios.length === 1) t.textContent = corto(estado.comercios[0]);
    else t.textContent = estado.comercios.length + ' comercios';
    $('ir-comercio-btn').classList.toggle('is-on', estado.comercios.length > 0);
  }

  function abrirComercios(abrir) {
    var menu = $('ir-comercio-menu'), btn = $('ir-comercio-btn');
    if (!menu) return;
    menu.hidden = !abrir;
    btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  }

  if ($('ir-comercio-btn')) {
    $('ir-comercio-btn').addEventListener('click', function () {
      abrirComercios($('ir-comercio-menu').hidden);
    });
    $('ir-comercio-menu').addEventListener('change', function (e) {
      if (!man || e.target.type !== 'checkbox') return;
      var i = estado.comercios.indexOf(e.target.value);
      if (e.target.checked) { if (i < 0) estado.comercios.push(e.target.value); }
      else if (i >= 0) estado.comercios.splice(i, 1);
      pintarComercios();
      filtrar();
    });
    $('ir-comercio-todos').addEventListener('click', function () {
      if (!man) return;
      estado.comercios = [];
      pintarComercios();
      filtrar();
      abrirComercios(false);
    });
    /* Se cierra al tocar fuera y con Escape, como cualquier desplegable.
       No se cierra al marcar una casilla: elegir tres comercios son tres
       toques seguidos y volver a abrirlo entre uno y otro sería absurdo. */
    document.addEventListener('click', function (e) {
      var d = $('ir-comercio');
      if (d && !d.contains(e.target)) abrirComercios(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('ir-comercio-menu').hidden) {
        abrirComercios(false);
        $('ir-comercio-btn').focus();
      }
    });
  }

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- sucesos ---------- */

  document.addEventListener('click', function (e) {
    if (e.target.closest && !e.target.closest('.ir-card')) cerrarFichas();
  });

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
