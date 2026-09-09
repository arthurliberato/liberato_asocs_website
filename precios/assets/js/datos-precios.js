/* =========================================================
   precios.ingsliberato.com — precios por proveedor

   Esta es la tabla que faltaba del modelo de datos: el precio
   nunca vive en la ficha del ítem, sino aquí, con su proveedor,
   su fecha y su fuente. De ahí sale gratis el historial.

   CÓMO REGISTRAR UNA COTIZACIÓN
   -----------------------------
   Cada cotización recibida se agrega con la función c():

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

     precio de referencia = mediana de esas cotizaciones
     mínimo y máximo      = extremos observados
     estado               = verificado

   Las cotizaciones se normalizan al criterio de ITBIS del ítem antes de
   compararlas, así que da igual si un proveedor cotiza con el impuesto
   incluido y otro sin él.

   Los fabricantes de canal cerrado (vende_al_publico = false) se muestran
   en la ficha como indicador de tendencia, pero NO entran en el cálculo
   del precio de referencia. Es la regla del documento de proveedores.

   ESTADO ACTUAL
   -------------
   16 cotizaciones de 3 comercios, tomadas de los precios que ellos
   mismos publican en sus tiendas en línea (08 y 09/09/2026). Con eso hay
   13 ítems verificados de 302 que llevan precio; los otros 289 siguen
   siendo estimaciones nuestras. Los 6 ítems restantes van según
   tarifario oficial y no llevan precio por definición.

   El sitio no se abre al público hasta que cada ítem tenga al menos un
   precio real. Para avanzar en eso están las dos herramientas del
   repositorio: generar-lote-precios.js arma el encargo de los ítems que
   todavía faltan, e importar-lote.js revisa la respuesta y escribe las
   llamadas a c() que van justo aquí abajo.

   Nunca se inventa un precio para atribuírselo a una empresa real: cada
   cotización de aquí tiene su fuente y su fecha, y lo que no se pudo
   verificar simplemente no se carga.
   ========================================================= */

(function (global) {
  'use strict';

  var registros = [];

  function c(item, proveedor, precio, o) {
    o = o || {};
    registros.push({
      item: item,
      proveedor: proveedor,
      precio: precio,
      fecha: o.fecha || '',
      fuente: o.fuente || '',
      itbis: o.itbis !== false,
      unidad: o.unidad || '',
      nota: o.nota || ''
    });
  }

  /* =========================================================
     COTIZACIONES REGISTRADAS

     Primera tanda: precios publicados abiertamente en las tiendas en
     línea de los propios comerciantes, consultados el 08/09/2026.

     Sobre el ITBIS: ninguna de estas fichas declara si el precio lo
     incluye. Se registran como `itbis: true` porque en República
     Dominicana el precio de mostrador al consumidor se muestra con el
     impuesto incluido, pero es un SUPUESTO NUESTRO, no un dato de la
     ficha, y así queda dicho en la nota de cada cotización.
     ========================================================= */

  var SUPUESTO_ITBIS = 'La ficha no declara ITBIS; se asume incluido, como es habitual en el precio de mostrador.';

  c('MAT-02-001', 'Ferremix (Grupo Alterra)', 535, {
    fecha: '2026-09-08', fuente: 'Precio publicado en ferremix.com.do',
    nota: 'Cemento gris Titán, funda de 42.5 kg. ' + SUPUESTO_ITBIS
  });

  c('MAT-04-001', 'Ferremix (Grupo Alterra)', 442.77, {
    fecha: '2026-09-08', fuente: 'Precio publicado en ferremix.com.do',
    nota: 'Varilla 3/8 x 20 pies grado 60, precio por unidad. ' + SUPUESTO_ITBIS
  });

  c('MAT-06-005', 'InnovaCentro (La Innovación)', 1495, {
    fecha: '2026-09-08', fuente: 'Precio publicado en innovacentro.com.do',
    nota: 'Plancha de pino 4 x 8 x 1/2, artículo 004929. La misma medida en okume cuesta RD$ 1,395. ' + SUPUESTO_ITBIS
  });

  c('MAT-06-006', 'InnovaCentro (La Innovación)', 1895, {
    fecha: '2026-09-08', fuente: 'Precio publicado en innovacentro.com.do',
    nota: 'Plancha de okume 4 x 8 x 3/4, artículo 025846; no había pino de ese espesor con precio publicado. ' + SUPUESTO_ITBIS
  });

  /* Los dos tubos de PVC vienen en presentación de 19 pies, no de 20 como
     dice la ficha del ítem. Se registran con su unidad real: el modelo los
     muestra pero los deja fuera del cálculo, porque comparar 19 con 20 pies
     daría un precio de referencia falso. Ver la nota del README. */
  c('MAT-09-001', 'Ferretería Ochoa (8A)', 1494.58, {
    fecha: '2026-09-08', fuente: 'Precio publicado en ochoa.com.do',
    unidad: 'tubo de 19 pies',
    nota: 'Tubo PVC semi-presión SDR-41 de 4" x 19 pies. La tienda factura por pies con un mínimo de 19, que equivale a una unidad. ' + SUPUESTO_ITBIS
  });

  c('MAT-09-002', 'Ferretería Ochoa (8A)', 503.78, {
    fecha: '2026-09-08', fuente: 'Listado de marca en ochoa.com.do',
    unidad: 'tubo de 19 pies',
    nota: 'Tubo PVC SDR-41 de 2" x 19 pies, marca CORVI. Precio tomado del listado de marca, no de la ficha del producto. ' + SUPUESTO_ITBIS
  });

  c('MAT-09-008', 'Ferretería Ochoa (8A)', 6107.20, {
    fecha: '2026-09-08', fuente: 'Precio publicado en ochoa.com.do',
    nota: 'Inodoro de una pieza Ares C con asiento, marca Ultra. ' + SUPUESTO_ITBIS
  });

  c('MAT-10-009', 'Ferretería Ochoa (8A)', 472.72, {
    fecha: '2026-09-08', fuente: 'Precio publicado en ochoa.com.do',
    nota: 'Breaker enchufable de 1 polo, 20 A, marca ABB. ' + SUPUESTO_ITBIS
  });

  c('MAT-13-001', 'Ferretería Ochoa (8A)', 956.17, {
    fecha: '2026-09-08', fuente: 'Precio publicado en ochoa.com.do',
    nota: 'Plancha de yeso blanca 1/2 x 4 x 8, marca Knauf. La versión resistente a la humedad cuesta RD$ 1,095.69. ' + SUPUESTO_ITBIS
  });

  /* --- Extracción completa del catálogo de construcción de Ochoa,
         09/09/2026: 398 artículos, 349 con precio publicado.
         Cargadas solo las correspondencias verificadas una por una con
         nuestro catálogo; el resto del archivo queda como fuente para
         ampliar el catálogo más adelante.
         Seis precios del archivo se descartaron por inverosímiles: ver
         herramientas/importar-ochoa.js. --- */

c('MAT-02-003', 'Ferretería Ochoa (8A)', 1178.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en ochoa.com.do',
    nota: "Cemento Blanco Argos, marca ARGOS (ref. FUNDA40KILOS). Precio publicado con ITBIS incluido."
  });

  c('MAT-02-003', 'Ferretería Ochoa (8A)', 1130.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en ochoa.com.do',
    nota: "Cemento Blanco Perla Del Sur, marca MORTEROS EUROPA (ref. FUNDA40KG). Precio publicado con ITBIS incluido."
  });

  c('MAT-04-021', 'Ferretería Ochoa (8A)', 62.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en ochoa.com.do',
    nota: "Alambre Liso Galvanizado, marca GALV-ALAMBRE (ref. C-18ROLLO/GDE.). Precio publicado con ITBIS incluido."
  });

  c('MAT-04-022', 'Ferretería Ochoa (8A)', 61.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en ochoa.com.do',
    nota: "Alambre Liso Galvanizado C-14, marca GALV-ALAMBRE (ref. C-14ROLLOGDE). Precio publicado con ITBIS incluido."
  });

  c('MAT-04-008', 'Ferretería Ochoa (8A)', 17130.85, {
    fecha: '2026-09-09', fuente: 'Precio publicado en ochoa.com.do',
    nota: "Malla Elect-S Corrug 2.40X40 4.89 Qq, marca MALLA-E (ref. W2.3X2.3100X100). Precio publicado con ITBIS incluido."
  });

  c('MAT-04-014', 'Ferretería Ochoa (8A)', 20629.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en ochoa.com.do',
    nota: "Malla Elect-S Corrug. 2.40X40 5.88 Qq, marca MALLA-E (ref. W2.7X2.7100X100). Precio publicado con ITBIS incluido."
  });

  c('MAT-04-023', 'Ferretería Ochoa (8A)', 861, {
    fecha: '2026-09-09', fuente: 'Precio publicado en ochoa.com.do',
    nota: "Angular H. Negro - 24.60 Lbs, marca HN-ANGULARES (ref. 11/2X1/8=3MM). Precio publicado con ITBIS incluido."
  });

  /* RETENIDO — pendiente de verificar
     Ochoa publica «Pintura Acrílica Superior 5 GL» a RD$ 983.41, que serían
     unos RD$ 197 por galón. Es nueve veces menos que nuestra estimación y
     resulta inverosímil para una cubeta de cinco galones: o la ficha cotiza
     por galón, o es otra presentación. No se carga hasta confirmarlo en
     tienda; publicar ese número sería peor que no publicar ninguno.

     c('MAT-12-002', 'Ferretería Ochoa (8A)', 983.41, {...});
  */

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
      item.cotizaciones.push({
        proveedor: prov,
        precio: r.precio,
        precioNormalizado: normalizarItbis(r.precio, r.itbis, item.itbis),
        itbis: r.itbis,
        unidad: r.unidad || item.unidad,
        mismaUnidad: mismaUnidad,
        fecha: r.fecha,
        fuente: r.fuente,
        nota: r.nota,
        /* Solo los proveedores que venden al público entran en el cálculo. */
        cuenta: prov.publico && mismaUnidad
      });
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
        item.sinCotizacionDelFiltro = !!filtro;
        return;
      }

      var valores = validas.map(function (q) { return q.precioNormalizado; });
      item.ref = Math.round(mediana(valores) * 100) / 100;
      item.min = Math.round(Math.min.apply(null, valores) * 100) / 100;
      item.max = Math.round(Math.max.apply(null, valores) * 100) / 100;

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
     Panel de detalle por proveedor
     Lo usan el catálogo (lo inserta al vuelo) y el generador de
     las páginas de categoría (lo escribe ya en el HTML), para que
     haya una sola implementación de la ficha.
     --------------------------------------------------------- */

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function moneda(n) {
    if (n === null || n === undefined) return '—';
    var dec = n < 100 ? (Math.round(n) === n ? 0 : 2) : 0;
    return 'RD$ ' + n.toLocaleString('es-DO', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  }

  /* Celda de precio con los datos crudos, para que el interruptor de
     ITBIS pueda recalcularla sin volver a pintar la ficha entera. */
  function celdaPrecio(valor, item, extra) {
    if (valor === null || valor === undefined) return '<span class="precio-nulo">Según tarifario</span>';
    var pct = item.unidad === '%';
    return '<span class="precio-celda" data-precio-ref="' + valor + '" data-precio-itbis="' +
      (item.itbis ? '1' : '0') + '" data-precio-pct="' + (pct ? '1' : '0') + '">' +
      (pct ? valor + ' %' : moneda(valor)) + '</span>' + (extra || '');
  }

  function botonCopiar(codigo, indice, etiqueta) {
    return '<button class="btn-copiar" type="button" data-copiar-precio="' + esc(codigo) + '"' +
      (indice === null ? '' : ' data-copiar-indice="' + indice + '"') +
      ' aria-label="Copiar ' + esc(etiqueta) + ' como fila de hoja de cálculo" title="Copiar como fila para Excel">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>';
  }

  function detalleHTML(item, opciones) {
    opciones = opciones || {};
    var nombreCat = opciones.nombreCat || function (c) { return c; };
    var proveedoresCategoria = opciones.proveedoresCategoria || [];
    var seleccion = opciones.seleccion || [];

    /* Si el ítem ya tiene cotizaciones reales, las de demostración ni se
       muestran: ver un precio real al lado de uno inventado confunde más
       de lo que enseña. Donde todavía no hay datos reales, siguen. */
    var todas = item.cotizaciones || [];
    var hayReales = todas.some(function (q) { return !q.proveedor.demo; });
    var visibles = hayReales ? todas.filter(function (q) { return !q.proveedor.demo; }) : todas;

    var filas = visibles.map(function (q, n) {
      var mia = seleccion.indexOf(q.proveedor.nombre) !== -1;
      return '<tr class="' + (q.cuenta ? '' : 'cot-fuera ') + (mia ? 'cot-mia' : '') + '">' +
          '<td>' + esc(q.proveedor.nombre) +
            (q.proveedor.demo ? ' <span class="badge badge-demo">demo</span>' : '') +
            (mia ? ' <span class="badge badge-filtrado">suyo</span>' : '') +
            (q.cuenta ? '' : '<span class="item-esp">No entra en el cálculo: ' +
              (q.proveedor.publico ? 'la unidad no coincide con la del ítem' : 'vende solo vía distribución') + '</span>') +
            (q.nota ? '<span class="item-esp">' + esc(q.nota) + '</span>' : '') + '</td>' +
          '<td class="num">' + celdaPrecio(q.precioNormalizado, item) + '</td>' +
          '<td>' + esc(q.fecha || '—') + '</td>' +
          '<td>' + esc(q.fuente || '—') + '</td>' +
          '<td class="num">' + botonCopiar(item.codigo, todas.indexOf(q), q.proveedor.nombre) + '</td>' +
        '</tr>';
    }).join('');

    var pendientes = proveedoresCategoria.length
      ? '<div class="detalle-pendientes"><p class="detalle-titulo">Proveedores por cotizar</p><div class="prov-cats">' +
          proveedoresCategoria.map(function (p) {
            var url = p.wa ? 'https://wa.me/' + p.wa : (p.web ? 'https://' + p.web : '');
            return url
              ? '<a class="tag tag-enlace" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(p.nombre) + '</a>'
              : '<span class="tag">' + esc(p.nombre) + '</span>';
          }).join('') +
        '</div></div>'
      : '';

    var hayDemo = visibles.some(function (q) { return q.proveedor.demo; });
    var avisoDemo = hayDemo
      ? '<p class="detalle-demo">Las cotizaciones de esta ficha son <strong>ficticias</strong>, ' +
        'cargadas para mostrar cómo funcionará el sitio. Ningún proveedor real ha cotizado todavía.</p>'
      : '';

    var vacio = !filas
      ? '<p class="detalle-vacio">Todavía no hay cotizaciones registradas para este ítem. ' +
        'El precio de arriba es la referencia estimada del sitio. En cuanto se registre la ' +
        'primera cotización de un proveedor que vende al público, la referencia pasa a ' +
        'calcularse con la mediana de las cotizaciones reales.</p>'
      : '';

    return '<div class="detalle">' +
        '<div class="detalle-cab">' +
          '<p class="detalle-titulo">Precio por proveedor · ' + esc(item.codigo) + ' · ' + esc(nombreCat(item.cat)) +
            (item.alcance ? ' · <span class="detalle-alcance">' + esc(item.alcance) + '</span>' : '') + '</p>' +
          '<button class="btn btn-ghost btn-mini" type="button" data-copiar-item="' + esc(item.codigo) + '">' +
            'Copiar ítem completo</button>' +
        '</div>' +
        '<div class="tabla-wrap tabla-detalle"><table class="tabla">' +
          '<thead><tr><th scope="col">Proveedor</th><th scope="col" class="num">Precio</th>' +
          '<th scope="col">Fecha</th><th scope="col">Fuente</th>' +
          '<th scope="col" class="num"><span class="visually-hidden">Copiar</span></th></tr></thead>' +
          '<tbody>' +
            '<tr class="cot-referencia">' +
              '<td><strong>' + (item.filtrado ? 'Referencia de sus proveedores' : 'Referencia del mercado') + '</strong>' +
                '<span class="item-esp">' + esc(item.fuente) + '</span></td>' +
              '<td class="num">' + celdaPrecio(item.ref, item,
                  item.min === null ? '' : '<span class="precio-rango" data-precio-min="' + item.min +
                  '" data-precio-max="' + item.max + '">' + moneda(item.min) + ' – ' + moneda(item.max) + '</span>') + '</td>' +
              '<td>' + esc(item.fecha) + '</td>' +
              '<td>' + (item.estado === 'verificado' ? 'Cotizaciones de proveedores'
                        : item.estado === 'demo' ? 'Cotizaciones ficticias'
                        : 'Estimación del sitio') + '</td>' +
              '<td class="num">' + botonCopiar(item.codigo, null, 'referencia de mercado') + '</td>' +
            '</tr>' + filas +
          '</tbody>' +
        '</table></div>' +
        avisoDemo + vacio + pendientes +
      '</div>';
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

  global.PRECIOS = {
    registros: registros,
    aplicar: aplicar,
    recalcular: recalcular,
    ENCABEZADOS: ENCABEZADOS,
    filasItem: filasItem,
    aTSV: aTSV,
    num: num,
    detalleHTML: detalleHTML,
    ENCABEZADOS_RFQ: ENCABEZADOS_RFQ,
    filasRFQ: filasRFQ,
    textoRFQ: textoRFQ
  };

})(typeof window !== 'undefined' ? window : globalThis);
