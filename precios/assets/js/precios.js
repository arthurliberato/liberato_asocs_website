/* =========================================================
   precios.ingsliberato.com — el motor de los precios

   Aquí vive el cálculo; los datos viven en otros dos sitios.

   QUIÉN CARGA QUÉ
   ---------------
   - En el navegador: este archivo y cotizaciones.js, que trae las
     cotizaciones en forma compacta (diccionarios de proveedor, fecha
     y unidad, y una línea corta por cotización). Son unos 150 KB en
     vez de los 2.6 MB que pesa el registro completo, y llegan sin
     la nota ni la fuente, que no hacen falta para pintar la tabla.
   - En las herramientas del repositorio: este archivo y
     datos-precios.js, que es el registro en su forma legible, con la
     nota y la fuente de cada cotización. Ese es el original: de él
     sale cotizaciones.js y de él salen el libro de Excel, la
     auditoría y las páginas.

   La nota y la fuente llegan al navegador aparte, por categoría, en
   assets/datos/detalle-CAT.json, y solo cuando se necesitan: al
   pasar el cursor sobre el comercio o al copiar para Excel. Ver
   PRECIOS.detalle().

   CÓMO REGISTRAR UNA COTIZACIÓN
   -----------------------------
   Cada cotización recibida se agrega en datos-precios.js con c():

     c('MAT-02-001', 'Ferretería Ochoa (8A)', 455, {
       fecha:  '2026-09-05',                 // AAAA-MM-DD
       fuente: 'Precio publicado en ochoa.com.do',
       itbis:  true,        // ¿el monto incluye el 18%?
       unidad: 'funda',     // si difiere de la del ítem, se marca y no promedia
       nota:   ''           // opcional: condiciones, volumen, validez
     });

   - El primer argumento es el código del ítem, tal cual aparece en
     datos-catalogo.js.
   - El segundo es el NOMBRE EXACTO del proveedor en datos-proveedores.js.
     Si no coincide, el generador falla y avisa: es a propósito, para que
     un error de tipeo no pase silencioso a producción.

   QUÉ PASA AL REGISTRAR PRECIOS
   -----------------------------
   En cuanto un ítem tiene al menos una cotización de un proveedor que
   vende al público, el sitio deja de mostrar la estimación de arranque y
   pasa a calcular:

     precio de referencia = mediana ponderada de esas cotizaciones
     mínimo y máximo      = extremos observados
     estado               = verificado

   Las cotizaciones se normalizan al criterio de ITBIS del ítem antes de
   compararlas, así que da igual si un proveedor cotiza con el impuesto
   incluido y otro sin él.

   Los fabricantes de canal cerrado (vende_al_publico = false) se muestran
   en la ficha como indicador de tendencia, pero NO entran en el cálculo
   del precio de referencia. Es la regla del documento de proveedores.

   Nunca se inventa un precio para atribuírselo a una empresa real: cada
   cotización tiene su fuente y su fecha, y lo que no se pudo verificar
   simplemente no se carga.
   ========================================================= */

(function (global) {
  'use strict';

  var registros = [];

  /* Cuando el comercio cotiza en dólares, el USD es el dato de origen y el
     peso se deriva de la tasa del catálogo. Se guardan los dos: el original
     para poder auditarlo y el convertido para poder compararlo. */
  function enPesos(precio, moneda) {
    if (moneda !== 'USD') return precio;
    /* El catálogo ya está cargado cuando esto corre: datos-catalogo.js va
       antes en el HTML y antes en el require de las herramientas. */
    var t = global.CATALOGO && global.CATALOGO.meta && global.CATALOGO.meta.tasaUSD;
    if (!t || !t.valor) throw new Error('Hay precios en USD y el catálogo no trae tasa de cambio.');
    return Math.round(precio * t.valor * 100) / 100;
  }

  function c(item, proveedor, precio, o) {
    o = o || {};
    var moneda = o.moneda || 'RD$';
    var nota = o.nota || '';
    if (moneda !== 'RD$') {
      var t = global.CATALOGO.meta.tasaUSD;
      nota += (nota ? '. ' : '') + 'Convertido a RD$ a ' + t.valor
            + ' por dólar, tasa del ' + t.fecha;
    }
    registros.push({
      item: item,
      proveedor: proveedor,
      precio: enPesos(precio, moneda),
      moneda: moneda,
      precioOrigen: moneda === 'RD$' ? null : precio,
      fecha: o.fecha || '',
      fuente: o.fuente || '',
      itbis: o.itbis !== false,
      unidad: o.unidad || '',
      /* Cuántos artículos del comercio representa esta cotización. Es 1 casi
         siempre; sube cuando varios artículos comparten especificación y
         precio y la importación los junta en una línea. Sin él la mediana
         cuenta igual una lámpara única de RD$ 186,717 que un precio que
         comparten veintiocho, y en una partida que se presupuesta por rango
         eso la corre hacia arriba sin que se vea. */
      peso: o.peso > 1 ? o.peso : 1,
      nota: nota,
      /* El artículo del comercio detrás de esta cotización: su nombre, su
         SKU, su marca y el enlace a su ficha. La marca es la que decide la
         gama; el enlace y el SKU son con lo que se pide. Solo los trae el
         registro completo —las herramientas del repositorio—, no la forma
         compacta que carga el navegador. */
      art: o.art || '',
      sku: o.sku || '',
      marca: o.marca || '',
      url: o.url || '',
      /* La gama. Primero la que el registro trae escrita —la declaró una
         persona para este comercio en este producto, y es más estrecha
         que medir una marca en todo el catálogo—; si no, la de la marca,
         que está medida. Las tablas las ponen las herramientas del
         repositorio; el navegador no calcula ninguna, la recibe hecha. */
      gama: o.gama || (global.PRECIOS.gamaDeMarca && global.PRECIOS.gamaDeMarca[o.marca]) || ''
    });
  }
  /* ---------------------------------------------------------
     Cálculo
     --------------------------------------------------------- */

  var ITBIS = 0.18;

  function normalizarItbis(valor, itbisRegistro, itbisItem) {
    if (itbisRegistro === itbisItem) return valor;
    return itbisItem ? valor * (1 + ITBIS) : valor / (1 + ITBIS);
  }

  function mediana(valores) {
    var v = valores.slice().sort(function (a, b) { return a - b; });
    var m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  }

  /* La mediana del estante, no la de la lista de precios distintos: cada
     cotización pesa lo que pesa en la vitrina del comercio. Con todos los
     pesos en 1 da exactamente lo mismo que la de arriba. */
  function medianaPonderada(pares) {
    var v = pares.slice().sort(function (a, b) { return a.valor - b.valor; });
    var total = 0, i;
    for (i = 0; i < v.length; i++) total += v[i].peso;
    if (!total) return mediana(v.map(function (x) { return x.valor; }));
    var mitad = total / 2, suma = 0;
    for (i = 0; i < v.length; i++) {
      suma += v[i].peso;
      if (suma > mitad) return v[i].valor;
      if (suma === mitad && i + 1 < v.length) return (v[i].valor + v[i + 1].valor) / 2;
    }
    return v[v.length - 1].valor;
  }

  /* Une las cotizaciones con el catálogo y el directorio.
     Devuelve la lista de problemas encontrados (códigos o proveedores que
     no existen), para que el generador pueda fallar en vez de publicar
     datos colgando de referencias rotas. */
  function aplicar(CAT, PROV) {
    var problemas = [];

    var itemPorCodigo = {};
    CAT.items.forEach(function (i) { itemPorCodigo[i.codigo] = i; });
    var provPorNombre = {};
    PROV.lista.forEach(function (p) { provPorNombre[p.nombre] = p; });

    CAT.items.forEach(function (i) { i.cotizaciones = []; });

    registros.forEach(function (r, n) {
      var item = itemPorCodigo[r.item];
      if (!item) {
        /* Un ítem retirado por precio dudoso sigue teniendo sus cotizaciones:
           no son huérfanas, es que su ítem no se publica. Ver
           herramientas/auditar-precios.js. */
        if (CAT.dudosos && CAT.dudosos[r.item]) return;
        problemas.push('Cotización ' + (n + 1) + ': el ítem ' + r.item + ' no existe en el catálogo.');
        return;
      }
      var prov = provPorNombre[r.proveedor];
      if (!prov) {
        problemas.push('Cotización ' + (n + 1) + ' (' + r.item + '): el proveedor "' + r.proveedor +
                       '" no existe en el directorio. Debe coincidir exactamente con datos-proveedores.js.');
        return;
      }
      var mismaUnidad = !r.unidad || r.unidad === item.unidad;
      var q = {
        proveedor: prov,
        precio: r.precio,
        precioNormalizado: normalizarItbis(r.precio, r.itbis, item.itbis),
        itbis: r.itbis,
        unidad: r.unidad || item.unidad,
        mismaUnidad: mismaUnidad,
        fecha: r.fecha,
        fuente: r.fuente,
        nota: r.nota,
        /* Cuántos artículos del comercio representa esta línea. */
        peso: r.peso || 1,
        /* De qué gama, según la marca. La trae el registro en Node y la
           tira de letras en el navegador; aquí solo se copia. */
        gama: r.gama || '',
        /* Solo los proveedores que venden al público entran en el cálculo. */
        cuenta: prov.publico && mismaUnidad
      };
      /* Enlace de ida y vuelta: cuando la nota y la fuente lleguen aparte
         (ver detalle()), hay que poder rellenarlas también aquí. */
      r._q = q;
      item.cotizaciones.push(q);
    });

    /* Se guarda la estimación original de cada ítem antes de tocarla, para
       poder volver a ella cuando un filtro deje al ítem sin cotizaciones. */
    CAT.items.forEach(function (item) {
      item.cotizaciones.sort(function (a, b) { return a.precioNormalizado - b.precioNormalizado; });
      item.base = {ref: item.ref, min: item.min, max: item.max,
                   estado: item.estado, fuente: item.fuente, fecha: item.fecha};
    });

    recalcular(CAT, null);

    return problemas;
  }

  /* Recalcula el precio de referencia de cada ítem.

     `seleccion` es una lista de nombres de proveedores: cuando trae algo,
     solo esas cotizaciones cuentan, que es lo que permite a un visitante
     trabajar únicamente con los proveedores con los que ya tiene relación.
     Con null o lista vacía, cuentan todas.

     Un ítem sin cotizaciones de los proveedores elegidos vuelve a su
     estimación original en vez de quedarse sin precio. */
  function recalcular(CAT, seleccion) {
    var filtro = seleccion && seleccion.length ? seleccion : null;

    CAT.items.forEach(function (item) {
      if (!item.base) return;

      var validas = (item.cotizaciones || []).filter(function (q) {
        return q.cuenta && (!filtro || filtro.indexOf(q.proveedor.nombre) !== -1);
      });

      /* Un dato real siempre gana a uno de demostración. En cuanto el ítem
         tiene una cotización de verdad, las ficticias dejan de promediar,
         para que nunca se calcule una mediana mezclando ambas cosas. */
      var reales = validas.filter(function (q) { return !q.proveedor.demo; });
      if (reales.length) validas = reales;

      if (!validas.length) {
        item.ref = item.base.ref;
        item.min = item.base.min;
        item.max = item.base.max;
        item.estado = item.base.estado;
        item.fuente = item.base.fuente;
        item.fecha = item.base.fecha;
        item.filtrado = false;
        item.gamas = null;
        item.sinCotizacionDelFiltro = !!filtro;
        return;
      }

      var valores = validas.map(function (q) { return q.precioNormalizado; });
      item.ref = Math.round(medianaPonderada(validas.map(function (q) {
        return { valor: q.precioNormalizado, peso: q.peso || 1 };
      })) * 100) / 100;
      item.min = Math.round(Math.min.apply(null, valores) * 100) / 100;
      item.max = Math.round(Math.max.apply(null, valores) * 100) / 100;

      /* UNA REFERENCIA POR GAMA

         «Mezcladora, de baño» tiene 577 cotizaciones y una referencia
         que le sirve al 14% de ellas. No es la fórmula: es que bajo el
         mismo nombre conviven la mezcladora de ferretería y la de casa
         de diseño, y entre las dos hay doce veces. Separadas por gama,
         las cuatro referencias —2.283, 4.004, 13.764 y 31.811— le
         sirven al 32%, y sobre todo dicen la verdad: cuánto cuesta
         depende de qué se esté comprando.

         Se calcula aquí y no una vez al generar porque tiene que
         responder al filtro de comercios igual que la principal: quien
         mira solo dos ferreterías no debe ver la referencia premium de
         una casa de diseño que no ha seleccionado.

         Tres cotizaciones es el mínimo para publicar una: con dos, la
         «mediana» es el promedio de dos números y no dice nada. */
      var porGama = {};
      validas.forEach(function (q) {
        if (q.gama) (porGama[q.gama] = porGama[q.gama] || []).push(q.precioNormalizado);
      });
      var gamas = null, orden = [];
      ['economica', 'estandar', 'alta', 'premium'].forEach(function (g) {
        var v = porGama[g];
        if (!v || v.length < 3) return;
        var r = Math.round(mediana(v) * 100) / 100;
        (gamas = gamas || {})[g] = { ref: r, n: v.length };
        orden.push(r);
      });

      /* Y SOLO SI QUEDAN EN ORDEN

         La gama de una marca se mide sobre todo lo que vende, así que es
         un promedio de sus líneas: una marca que es estándar en general
         puede tener una línea cara, y entonces en esa partida concreta
         sale por encima de una marca «alta». Pasa poco, pero pasa —el
         urinario de porcelana salía con la económica a RD$ 6.631 y la
         estándar a RD$ 5.473— y publicado parece un error nuestro, no lo
         que es: que ahí la marca no manda.

         Cuando el orden se rompe no se publica ninguna. Vale más no decir
         nada que decir algo que se lee al revés. */
      for (var i = 1; i < orden.length; i++) {
        if (orden[i] <= orden[i - 1]) { gamas = null; break; }
      }
      /* Con una sola tampoco: una referencia «económica» suelta, sin las
         otras con qué compararla, no informa de nada. */
      if (gamas && orden.length < 2) gamas = null;
      item.gamas = gamas;

      /* Un dato inventado no se presenta como comprobado: si todas las
         cotizaciones que cuentan vienen del modo demostración, el ítem
         queda marcado como «Demostración», no como «Verificado». */
      var soloDemo = validas.every(function (q) { return q.proveedor.demo; });
      item.estado = soloDemo ? 'demo' : 'verificado';
      item.fuente = validas.length +
        (validas.length === 1 ? ' cotización ' : ' cotizaciones ') +
        (filtro ? 'de sus proveedores' : 'de proveedores') +
        (soloDemo ? ' · datos de demostración' : '');

      var fechas = validas.map(function (q) { return q.fecha; }).filter(Boolean).sort();
      item.fecha = fechas.length ? fechas[fechas.length - 1] : item.base.fecha;
      item.filtrado = !!filtro;
      item.sinCotizacionDelFiltro = false;
    });
  }

  /* ---------------------------------------------------------
     Exportación a hoja de cálculo
     Una cotización = una fila. Se copia como TSV, que es lo que
     Excel, Google Sheets y Numbers reparten en columnas al pegar.
     --------------------------------------------------------- */

  var ENCABEZADOS = [
    'Código', 'Ítem', 'Especificación', 'Alcance', 'Categoría', 'Unidad',
    'Proveedor', 'Precio', 'Mínimo', 'Máximo', 'Moneda',
    'ITBIS incluido', 'Estado', 'Fecha', 'Fuente'
  ];

  /* Los montos van como número plano, sin símbolo ni separador de miles:
     es lo único que Excel reconoce como número al pegar. */
  function num(n) {
    if (n === null || n === undefined || isNaN(n)) return '';
    return String(Math.round(n * 100) / 100);
  }

  function limpiar(s) {
    return String(s === null || s === undefined ? '' : s).replace(/[\t\r\n]+/g, ' ').trim();
  }

  var ESTADOS = {estimado: 'Estimado', verificado: 'Verificado', tarifario: 'Tarifario oficial', demo: 'Demostración'};

  /* Devuelve las filas de un ítem: la de referencia del sitio y una por
     cada cotización registrada. `precio` recibe una función que aplica el
     interruptor de ITBIS, para que lo copiado sea lo que se ve en pantalla. */
  function filasItem(item, opciones) {
    opciones = opciones || {};
    var nombreCat = opciones.nombreCat || function (c) { return c; };
    var precio = opciones.precio || function (v) { return v; };
    var sinItbis = !!opciones.sinItbis;
    var filas = [];

    var itbisTexto = function (traeItbis) {
      return traeItbis && !sinItbis ? 'Sí' : 'No';
    };

    filas.push([
      item.codigo, item.nombre, item.esp, item.alcance, nombreCat(item.cat), item.unidad,
      item.filtrado ? 'Referencia de sus proveedores' : 'Referencia del mercado',
      num(precio(item.ref, item)), num(precio(item.min, item)), num(precio(item.max, item)),
      item.unidad === '%' ? '%' : 'DOP',
      itbisTexto(item.itbis), ESTADOS[item.estado] || item.estado, item.fecha, item.fuente
    ].map(limpiar));

    /* Misma regla que en la ficha: donde hay cotizaciones reales, las de
       demostración no se exportan. Lo que se copia es lo que se ve. */
    var todas = item.cotizaciones || [];
    var hayReales = todas.some(function (q) { return !q.proveedor.demo; });
    var exportables = hayReales ? todas.filter(function (q) { return !q.proveedor.demo; }) : todas;

    exportables.forEach(function (q) {
      filas.push([
        item.codigo, item.nombre, item.esp, item.alcance, nombreCat(item.cat), q.unidad,
        q.proveedor.nombre,
        num(precio(q.precioNormalizado, item)), '', '',
        item.unidad === '%' ? '%' : 'DOP',
        itbisTexto(item.itbis),
        (q.proveedor.demo ? 'Cotización de demostración' : 'Cotización') +
          (q.cuenta ? '' : ' (fuera del cálculo)'),
        q.fecha, q.fuente
      ].map(limpiar));
    });

    return filas;
  }

  function aTSV(filas, conEncabezado) {
    var todas = conEncabezado ? [ENCABEZADOS].concat(filas) : filas;
    return todas.map(function (f) { return f.join('\t'); }).join('\n');
  }

  /* ---------------------------------------------------------
     Solicitud de cotización (RFQ) a un proveedor

     Plantilla estandarizada con código de ítem, especificación y
     unidad, y con las tres preguntas que siempre hay que hacer:
     precio con y sin ITBIS, validez de la cotización y tramos por
     volumen. Es la recomendación del documento de proveedores.
     --------------------------------------------------------- */

  var ENCABEZADOS_RFQ = [
    'Código', 'Ítem', 'Especificación', 'Alcance', 'Categoría', 'Unidad', 'Proveedor',
    'Cantidad', 'Precio cotizado', 'Incluye ITBIS', 'Fecha de cotización', 'Validez', 'Notas'
  ];

  /* Hoja en blanco lista para que el proveedor la devuelva llena: las
     columnas de precio van vacías a propósito. */
  function filasRFQ(items, proveedor, nombreCat) {
    nombreCat = nombreCat || function (c) { return c; };
    return items.map(function (it) {
      return [
        it.codigo, it.nombre, it.esp, it.alcance, nombreCat(it.cat), it.unidad, proveedor,
        '', '', '', '', '', ''
      ].map(limpiar);
    });
  }

  function textoRFQ(items, proveedor, nombreCat) {
    nombreCat = nombreCat || function (c) { return c; };
    var lineas = [
      'Solicitud de cotización — Ingenieros Liberato & Asociados',
      'Proveedor: ' + proveedor,
      '',
      'Buenos días. Favor cotizarnos los siguientes ítems:',
      ''
    ];

    var catActual = '';
    var n = 0;
    items.forEach(function (it) {
      var cat = nombreCat(it.cat);
      if (cat !== catActual) {
        catActual = cat;
        lineas.push('— ' + cat + ' —');
      }
      n += 1;
      lineas.push(n + '. [' + it.codigo + '] ' + it.nombre + ' — unidad: ' + it.unidad +
        (it.esp ? '\n   ' + it.esp : ''));
    });

    lineas.push('');
    lineas.push('Agradecemos indicar en la cotización:');
    lineas.push('- Precio con y sin ITBIS');
    lineas.push('- Validez de la cotización');
    lineas.push('- Disponibilidad y tiempo de entrega');
    lineas.push('- Tramos de descuento por volumen, si aplican');
    lineas.push('');
    lineas.push('Quedamos atentos. Gracias.');
    lineas.push('Ingenieros Liberato & Asociados · arthur@ingsliberato.com · +1 (829) 793-9892');
    return lineas.join('\n');
  }
  /* ---------------------------------------------------------
     La forma compacta, que es la que llega al navegador

     cotizaciones.js no repite el nombre del comercio ni la fecha
     ocho mil veces: los guarda una vez en un diccionario y cada
     cotización apunta al índice. Tampoco trae la nota ni la fuente,
     que son dos terceras partes del peso del registro y no hacen
     falta para pintar un precio.

     La línea es [comercio, precio, fecha] y se alarga solo cuando
     hay algo que decir: unidad propia, ITBIS declarado, peso mayor
     que uno, moneda de origen.
     --------------------------------------------------------- */
  function compacto(d) {
    var prov = d.prov || [], fechas = d.fecha || [], unid = d.unid || [''],
        mon = d.mon || ['RD$'];
    registros.length = 0;
    /* LA TIRA DE GAMAS

       Una letra por cotización, en el mismo orden —«e» económica, «s»
       estándar, «a» alta, «p» premium, «.» sin marca conocida—. Va
       aparte y no como un campo más de la línea porque la línea se
       recorta por el final: meterla dentro obligaría a escribir la
       unidad, el ITBIS, el peso y la moneda en cada cotización que
       tuviera gama, y son cinco números para guardar una letra. */
    var GAMA = { e: 'economica', s: 'estandar', a: 'alta', p: 'premium' };
    d.cot.forEach(function (par) {
      var item = par[0], tira = par[2] || '';
      par[1].forEach(function (q, n) {
        registros.push({
          gama: GAMA[tira.charAt(n)] || '',
          item: item,
          proveedor: prov[q[0]],
          precio: q[1],
          moneda: q[6] ? mon[q[6]] : 'RD$',
          precioOrigen: q.length > 7 ? q[7] : null,
          fecha: fechas[q[2]] || '',
          fuente: '',
          itbis: q[4] === undefined ? true : !!q[4],
          unidad: q[3] ? unid[q[3]] : '',
          peso: q[5] || 1,
          nota: ''
        });
      });
    });
  }

  /* ---------------------------------------------------------
     La nota y la fuente, a pedido

     Viven en assets/datos/detalle-CAT.json, un arreglo en el mismo
     orden en que van las cotizaciones de esa categoría en
     cotizaciones.js: [fuente, nota] por cotización. Se piden cuando
     se necesitan —al pasar el cursor sobre un comercio, al copiar
     para Excel— y se rellenan en el sitio, sobre los objetos que ya
     existen, para no rehacer el cálculo.

     Con el registro completo cargado (las herramientas del
     repositorio) esto no hace nada: la nota ya está.
     --------------------------------------------------------- */
  var detalleListo = {}, detallePedido = {};

  function rellenarDetalle(cat, arr) {
    var n = 0;
    registros.forEach(function (r) {
      if (r.item.slice(0, 6) !== cat) return;
      var d = arr[n++];
      if (!d) return;
      r.fuente = d[0];
      r.nota = d[1];
      if (r._q) { r._q.fuente = d[0]; r._q.nota = d[1]; }
    });
    detalleListo[cat] = true;
  }

  /* Devuelve una promesa; con todo ya cargado se resuelve al vuelo. */
  function detalle(cats) {
    cats = (typeof cats === 'string' ? [cats] : cats || []).filter(function (c) {
      return c && !detalleListo[c];
    });
    if (!cats.length || typeof fetch !== 'function') return Promise.resolve();
    return Promise.all(cats.map(function (cat) {
      if (!detallePedido[cat]) {
        detallePedido[cat] = fetch('assets/datos/detalle-' + cat + '.json')
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (arr) { rellenarDetalle(cat, arr); })
          /* Sin detalle el sitio sigue funcionando: se queda sin la nota
             al pasar el cursor y sin la columna de fuente al exportar.
             Es peor perder la tabla entera por un archivo que no cargó. */
          .catch(function () { detalleListo[cat] = true; });
      }
      return detallePedido[cat];
    }));
  }

  /* Las categorías que tocan una lista de ítems, para pedir de una vez
     el detalle de todo lo que se va a exportar. */
  function catsDe(items) {
    var vistas = {};
    (items || []).forEach(function (i) { vistas[String(i.codigo || i).slice(0, 6)] = true; });
    return Object.keys(vistas);
  }

  global.PRECIOS = {
    registros: registros,
    c: c,
    compacto: compacto,
    detalle: detalle,
    catsDe: catsDe,
    aplicar: aplicar,
    recalcular: recalcular,
    ENCABEZADOS: ENCABEZADOS,
    filasItem: filasItem,
    aTSV: aTSV,
    num: num,
    ENCABEZADOS_RFQ: ENCABEZADOS_RFQ,
    filasRFQ: filasRFQ,
    textoRFQ: textoRFQ
  };

})(typeof window !== 'undefined' ? window : globalThis);
