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

  /* =====================================================================
     COTIZACIONES IMPORTADAS DEL CATÁLOGO DE UN PROVEEDOR

     Todo lo que va entre los marcadores de abajo lo escribe
     herramientas/importar-ochoa.js a partir de la extracción versionada
     en herramientas/datos-externos/. No editarlo a mano: se reescribe
     entero en cada importación.

     Ferretería Ochoa publica su catálogo completo con precios. La
     herramienta lee la ficha de cada artículo, saca la medida exacta y
     valida el precio contra el de su familia: el acero se vende al peso,
     así que dentro de una familia el precio por libra es casi constante
     y lo que se aparta demasiado no se carga.
     ===================================================================== */

  var PROV_OCHOA = 'Ferretería Ochoa (8A)';

/* ochoa:cotizaciones:inicio — generado por herramientas/importar-ochoa.js.
     No editar a mano: se reescribe en cada importación. */

  /* Artículos que corresponden a un ítem que ya existía. */
  c('MAT-04-021', PROV_OCHOA, 62.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-liso-galvanizado-02450011',
    nota: 'Alambre Liso Galvanizado · artículo 02-45-0011 · ref. C-18ROLLO/GDE. · marca GALV-ALAMBRE. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-022', PROV_OCHOA, 61.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-liso-galvanizado-c-14-02450010',
    nota: 'Alambre Liso Galvanizado C-14 · artículo 02-45-0010 · ref. C-14ROLLOGDE · marca GALV-ALAMBRE. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-023', PROV_OCHOA, 861, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-24-60-lbs-04530015',
    nota: 'Angular H. Negro - 24.60 Lbs · artículo 04-53-0015 · ref. 11/2X1/8=3MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-008', PROV_OCHOA, 17130.85, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-elect-s-corrug-2-40x40-4-89-qq-04660230',
    nota: 'Malla Elect-S Corrug 2.40X40 4.89 Qq · artículo 04-66-0230 · ref. W2.3X2.3100X100 · marca MALLA-E. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-014', PROV_OCHOA, 20629.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-elect-s-corrug-2-40x40-5-88-qq-04660253',
    nota: 'Malla Elect-S Corrug. 2.40X40 5.88 Qq · artículo 04-66-0253 · ref. W2.7X2.7100X100 · marca MALLA-E. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-004', PROV_OCHOA, 437.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cal-perla-hidratada-04590065',
    nota: 'Cal Perla (Hidratada) · artículo 04-59-0065 · ref. FDA44LBS · marca POMIER%. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-003', PROV_OCHOA, 1178.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-blanco-argos-04590192',
    nota: 'Cemento Blanco Argos · artículo 04-59-0192 · ref. FUNDA40KILOS · marca ARGOS. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-003', PROV_OCHOA, 1130.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-blanco-perla-del-sur-04590391',
    nota: 'Cemento Blanco Perla Del Sur · artículo 04-59-0391 · ref. FUNDA40KG · marca MORTEROS EUROPA. ' + SUPUESTO_ITBIS
  });

  /* Familias completas del catálogo de Ochoa: cada ítem nace verificado. */
  c('MAT-01-020', PROV_OCHOA, 151.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/funda-de-grava-3-4-50-libras-04510335',
    nota: 'Funda De Grava 3 / 4” - 50 Libras · artículo 04-51-0335 · ref. PT00009(50XAT) · marca PRET. ' + SUPUESTO_ITBIS
  });
  c('MAT-01-021', PROV_OCHOA, 448.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/grava-blanca-50-libras-04510344',
    nota: 'Grava Blanca (50 Libras) · artículo 04-51-0344 · ref. 3/4PT00014(50XAT) · marca PRET. ' + SUPUESTO_ITBIS
  });
  c('MAT-01-022', PROV_OCHOA, 151.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/funda-de-arena-3-16-55-libras-04510337',
    nota: 'Funda De Arena 3 / 16” - 55 Libras · artículo 04-51-0337 · ref. PT00011(50XAT) · marca PRET. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-017', PROV_OCHOA, 34.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-gris-04590319',
    nota: 'Cemento Gris. · artículo 04-59-0319 · ref. 5LIBRAS · marca PANAM. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-018', PROV_OCHOA, 65.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-gris-04590320',
    nota: 'Cemento Gris · artículo 04-59-0320 · ref. 10LIBRAS · marca PANAM. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-019', PROV_OCHOA, 49.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-blanco-04590410',
    nota: 'Cemento Blanco · artículo 04-59-0410 · ref. FDA.2LBS0.9KG · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-020', PROV_OCHOA, 109.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-blanco-04590409',
    nota: 'Cemento Blanco · artículo 04-59-0409 · ref. FDA.5LBS2.25KG · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-021', PROV_OCHOA, 159.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-blanco-fundas-04590356',
    nota: 'Cemento Blanco Fundas · artículo 04-59-0356 · ref. 10LIBRAS · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-022', PROV_OCHOA, 4.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/yeso-en-polvo-04590219',
    nota: 'Yeso En Polvo · artículo 04-59-0219 · ref. BLANCOLIBRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-023', PROV_OCHOA, 37.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/yeso-en-polvo-5-lbs-04590344',
    nota: 'Yeso En Polvo 5 Lbs. · artículo 04-59-0344 · ref. 5LIBRAS · marca PALOMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-024', PROV_OCHOA, 373.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/yeso-en-polvo-blanco-paloma-04590063',
    nota: 'Yeso En Polvo Blanco Paloma · artículo 04-59-0063 · ref. FDA.65LBS · marca PALOMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-025', PROV_OCHOA, 1295.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fibra-de-acero-04660385',
    nota: 'Fibra De Acero · artículo 04-66-0385 · ref. 1439(5.3KG) · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-026', PROV_OCHOA, 807.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/macro-fibra-p-hormigon-04660383',
    nota: 'Macro Fibra P / Hormigon · artículo 04-66-0383 · ref. 1437(1.5KG) · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-027', PROV_OCHOA, 61.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-liso-galvanizado-c-10-02450008',
    nota: 'Alambre Liso Galvanizado C-10 · artículo 02-45-0008 · ref. C-10ROLLOGDE · marca GALV-ALAMBRE. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-028', PROV_OCHOA, 61.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-liso-galvanizado-c-12-02450009',
    nota: 'Alambre Liso Galvanizado C-12 · artículo 02-45-0009 · ref. C-12ROLLOGDE · marca GALV-ALAMBRE. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-029', PROV_OCHOA, 56.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-liso-galvanizado-c-16-02450107',
    nota: 'Alambre Liso Galvanizado C-16 · artículo 02-45-0107 · ref. C-16ROLLOGDE · marca GALV-ALAMBRE. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-030', PROV_OCHOA, 30.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/separadores-plasticos-p-varillas-04660381',
    nota: 'Separadores Plasticos P / Varillas · artículo 04-66-0381 · ref. 3/8" · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-031', PROV_OCHOA, 45.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/separadores-plasticos-p-varillas-04660373',
    nota: 'Separadores Plasticos P / Varillas · artículo 04-66-0373 · ref. 1/2\'\' · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-032', PROV_OCHOA, 54.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/separadores-plasticos-p-varillas-04660374',
    nota: 'Separadores Plasticos P / Varillas · artículo 04-66-0374 · ref. 5/8\'\' · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-033', PROV_OCHOA, 63.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/separadores-plasticos-p-varillas-04660375',
    nota: 'Separadores Plasticos P / Varillas · artículo 04-66-0375 · ref. 3/4\'\' · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-034', PROV_OCHOA, 70.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/separadores-plasticos-p-varillas-04660376',
    nota: 'Separadores Plasticos P / Varillas · artículo 04-66-0376 · ref. 1\'\' · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-035', PROV_OCHOA, 78.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/separadores-plasticos-p-varillas-04660377',
    nota: 'Separadores Plasticos P / Varillas · artículo 04-66-0377 · ref. 11/4\'\' · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-036', PROV_OCHOA, 228.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/coupler-mecanico-p-varilla-04660369',
    nota: 'Coupler Mecanico P / Varilla · artículo 04-66-0369 · ref. Q193/4\'\' · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-037', PROV_OCHOA, 434.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/coupler-mecanico-p-varilla-04660368',
    nota: 'Coupler Mecanico P / Varilla · artículo 04-66-0368 · ref. Q251\'\' · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-038', PROV_OCHOA, 697.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/coupler-mecanico-p-varilla-04660370',
    nota: 'Coupler Mecanico P / Varilla · artículo 04-66-0370 · ref. Q2811/8\'\' · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-039', PROV_OCHOA, 854.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/coupler-mecanico-p-varilla-04660371',
    nota: 'Coupler Mecanico P / Varilla · artículo 04-66-0371 · ref. Q3211/4\'\' · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-040', PROV_OCHOA, 1066.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/coupler-mecanico-p-varilla-04660372',
    nota: 'Coupler Mecanico P / Varilla · artículo 04-66-0372 · ref. Q3513/8\'\' · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-041', PROV_OCHOA, 2488.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-galv-picado-02450222',
    nota: 'Alambre Galv. Picado · artículo 02-45-0222 · ref. CAJA50LB(22.68KG) · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-04-042', PROV_OCHOA, 619.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-liso-galv-picado-10lib-02450154',
    nota: 'Alambre Liso Galv. Picado 10Lib · artículo 02-45-0154 · ref. C-16PAQUETE · marca GALV-ALAMBRE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-011', PROV_OCHOA, 296.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-acanalado-c-29-04770028',
    nota: 'Plancha De Zinc Acanalado C-29 · artículo 04-77-0028 · ref. C-293X6 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-011', PROV_OCHOA, 270.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-acanalado-sol-250xat-04770129',
    nota: 'Zinc Acanalado (Sol)(250Xat) · artículo 04-77-0129 · ref. C-293X6 · marca SOL. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-012', PROV_OCHOA, 592.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-acanalado-c-29-04770094',
    nota: 'Plancha De Zinc Acanalado C-29 · artículo 04-77-0094 · ref. C-293X12 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-013', PROV_OCHOA, 208.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-acanalado-c-34-04770030',
    nota: 'Plancha De Zinc Acanalado C-34 · artículo 04-77-0030 · ref. C-343X6 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-014', PROV_OCHOA, 414.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-acanalado-c-34-04770095',
    nota: 'Plancha De Zinc Acanalado C-34 · artículo 04-77-0095 · ref. C-343X12 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-015', PROV_OCHOA, 296.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-liso-c-29-04770054',
    nota: 'Plancha De Zinc Liso C-29 · artículo 04-77-0054 · ref. C-293X6 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-015', PROV_OCHOA, 270.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-liso-c-29-04770131',
    nota: 'Plancha De Zinc Liso C-29 · artículo 04-77-0131 · ref. C-293X6 · marca SOL. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-016', PROV_OCHOA, 209.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-liso-c-34-04770127',
    nota: 'Plancha De Zinc Liso C-34 · artículo 04-77-0127 · ref. C-343X6 · marca SOL. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-016', PROV_OCHOA, 208.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-liso-6-lbs-100xat-04770055',
    nota: 'Zinc Liso 6 Lbs. (100Xat) · artículo 04-77-0055 · ref. C-343X6 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-017', PROV_OCHOA, 1127.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-translucido-04770063',
    nota: 'Zinc Translucido · artículo 04-77-0063 · ref. BLANCA3\'X6\' · marca BAF. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-017', PROV_OCHOA, 1127.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-traslucido-3-04770064',
    nota: 'Zinc Traslucido 3\' · artículo 04-77-0064 · ref. AZUL3\'X6\' · marca BAF. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-017', PROV_OCHOA, 1127.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-traslucido-3-04770065',
    nota: 'Zinc Traslucido 3\' · artículo 04-77-0065 · ref. VERDE3\'X6\' · marca BAF. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-017', PROV_OCHOA, 1127.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-traslucido-3-04770072',
    nota: 'Zinc Traslucido 3\' · artículo 04-77-0072 · ref. AMARILLO3\'X6\' · marca BAF. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-018', PROV_OCHOA, 660, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caballete-para-aluzinc-21-04520043',
    nota: 'Caballete Para Aluzinc 21\'\' · artículo 04-52-0043 · ref. 21"X10\'MAX. · marca ACERO ESTRELLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-019', PROV_OCHOA, 141.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caballete-de-zinc-04580009',
    nota: 'Caballete De Zinc · artículo 04-58-0009 · ref. CAL-29X6\' · marca AVM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-020', PROV_OCHOA, 104.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caballete-de-zinc-04580010',
    nota: 'Caballete De Zinc · artículo 04-58-0010 · ref. CAL-34X6\' · marca AVM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-021', PROV_OCHOA, 659.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cano-para-aluzinc-6-04520469',
    nota: 'Caño Para Aluzinc 6\'\' · artículo 04-52-0469 · ref. 6\'\'X7\'\'X10\' · marca ACERO ESTRELLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-014', PROV_OCHOA, 55.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-amarillo-com-04590337',
    nota: 'Polvo Mosaico Amarillo Com · artículo 04-59-0337 · ref. 1LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-015', PROV_OCHOA, 153.81, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-amarillo-ind-04590330',
    nota: 'Polvo Mosaico Amarillo Ind · artículo 04-59-0330 · ref. 1LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-016', PROV_OCHOA, 82.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-azul-com-04590335',
    nota: 'Polvo Mosaico Azul Com · artículo 04-59-0335 · ref. 1LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-017', PROV_OCHOA, 162.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-azul-ind-04590327',
    nota: 'Polvo Mosaico Azul Ind · artículo 04-59-0327 · ref. 1LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-018', PROV_OCHOA, 90.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-negro-com-04590342',
    nota: 'Polvo Mosaico Negro Com · artículo 04-59-0342 · ref. 1LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-019', PROV_OCHOA, 129.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-negro-ind-04590328',
    nota: 'Polvo Mosaico Negro Ind · artículo 04-59-0328 · ref. 1LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-020', PROV_OCHOA, 66.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-rojo-com-04590341',
    nota: 'Polvo Mosaico Rojo Com · artículo 04-59-0341 · ref. 1LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-021', PROV_OCHOA, 106.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-rojo-ind-04590332',
    nota: 'Polvo Mosaico Rojo Ind · artículo 04-59-0332 · ref. 1LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-022', PROV_OCHOA, 78.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-verde-com-04590338',
    nota: 'Polvo Mosaico Verde Com · artículo 04-59-0338 · ref. 1LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-023', PROV_OCHOA, 180.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-verde-ind-04590324',
    nota: 'Polvo Mosaico Verde Ind · artículo 04-59-0324 · ref. 1LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-024', PROV_OCHOA, 460.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-amarillo-ind-04590331',
    nota: 'Polvo Mosaico Amarillo Ind · artículo 04-59-0331 · ref. 3LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-025', PROV_OCHOA, 280.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-amarillo-com-04590336',
    nota: 'Polvo Mosaico Amarillo Com · artículo 04-59-0336 · ref. 5LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-026', PROV_OCHOA, 367.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-azul-com-04590334',
    nota: 'Polvo Mosaico Azul Com · artículo 04-59-0334 · ref. 5LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-027', PROV_OCHOA, 813.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-azul-ind-04590326',
    nota: 'Polvo Mosaico Azul Ind · artículo 04-59-0326 · ref. 5LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-028', PROV_OCHOA, 406.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-negro-com-04590343',
    nota: 'Polvo Mosaico Negro Com · artículo 04-59-0343 · ref. 5LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-029', PROV_OCHOA, 647.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-negro-ind-04590329',
    nota: 'Polvo Mosaico Negro Ind · artículo 04-59-0329 · ref. 5LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-030', PROV_OCHOA, 333.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-rojo-com-04590340',
    nota: 'Polvo Mosaico Rojo Com · artículo 04-59-0340 · ref. 5LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-031', PROV_OCHOA, 472.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-rojo-ind-04590333',
    nota: 'Polvo Mosaico Rojo Ind · artículo 04-59-0333 · ref. 5LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-032', PROV_OCHOA, 350.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-verde-com-04590339',
    nota: 'Polvo Mosaico Verde Com · artículo 04-59-0339 · ref. 5LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-033', PROV_OCHOA, 902.88, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-mosaico-verde-ind-04590325',
    nota: 'Polvo Mosaico Verde Ind · artículo 04-59-0325 · ref. 5LIBRAS · marca BELGA-LIBRAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-034', PROV_OCHOA, 3195.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-p-mosaico-cromo-55-lbs-04590027',
    nota: 'Polvo P / Mosaico (Cromo) 55 Lbs. · artículo 04-59-0027 · ref. 16322AMAR.COM. · marca BELGA. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-035', PROV_OCHOA, 7742.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-p-mosaico-cromo-55-lbs-04590022',
    nota: 'Polvo P / Mosaico (Cromo) 55 Lbs. · artículo 04-59-0022 · ref. 13632AMAR.IND. · marca BELGA. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-036', PROV_OCHOA, 4220.23, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-p-mosaico-cromo-55-lbs-04590021',
    nota: 'Polvo P / Mosaico (Cromo) 55 Lbs. · artículo 04-59-0021 · ref. 16066AZULCOM. · marca BELGA. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-037', PROV_OCHOA, 8183.45, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-p-mosaico-cromo-55-lbs-04590050',
    nota: 'Polvo P / Mosaico (Cromo) 55 Lbs. · artículo 04-59-0050 · ref. 9776KAZULIND. · marca BELGA. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-038', PROV_OCHOA, 4640.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-p-mosaico-cromo-04590071',
    nota: 'Polvo P / Mosaico (Cromo) · artículo 04-59-0071 · ref. 8035NEGROCOM. · marca BELGA. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-039', PROV_OCHOA, 6521.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-p-mosaico-cromo-6316-04590060',
    nota: 'Polvo P / Mosaico (Cromo) 6316 · artículo 04-59-0060 · ref. 9081NEGROIND. · marca BELGA. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-040', PROV_OCHOA, 3350.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-p-mosaico-cromo-55-lbs-04590024',
    nota: 'Polvo P / Mosaico (Cromo) 55 Lbs. · artículo 04-59-0024 · ref. 16323ROJOCOM. · marca BELGA. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-041', PROV_OCHOA, 5451.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-p-mosaico-cromo-12908-55-lbs-04590023',
    nota: 'Polvo P / Mosaico(Cromo) (12908) 55 Lbs. · artículo 04-59-0023 · ref. F-6225ROJOIND. · marca BELGA. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-042', PROV_OCHOA, 4017.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-p-mosaico-cromo-04590033',
    nota: 'Polvo P / Mosaico (Cromo) · artículo 04-59-0033 · ref. 16068VERDECOM. · marca BELGA. ' + SUPUESTO_ITBIS
  });
  c('MAT-08-043', PROV_OCHOA, 9092.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/polvo-p-mosaico-cromo-55-lbs-04590059',
    nota: 'Polvo P / Mosaico (Cromo) 55 Lbs. · artículo 04-59-0059 · ref. 14951VERDEIND. · marca BELGA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-016', PROV_OCHOA, 108.23, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-de-ducha-con-cubrefalta-01232378',
    nota: 'Brazo De Ducha Con Cubrefalta · artículo 01-23-2378 · ref. 15059-1/2X7/1/4 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-017', PROV_OCHOA, 124.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-giratoria-brazo-cubrefalta-01230013',
    nota: 'Ducha Giratoria Brazo / Cubrefalta · artículo 01-23-0013 · ref. SPC-4571/2 · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-018', PROV_OCHOA, 126.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/soporte-ducha-p-pared-maldivas-01230425',
    nota: 'Soporte Ducha P / Pared Maldivas · artículo 01-23-0425 · ref. 96110 · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-019', PROV_OCHOA, 218.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/soporte-d-fijacion-p-ducha-01112754',
    nota: 'Soporte D / Fijacion P / Ducha · artículo 01-11-2754 · ref. 16074 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-020', PROV_OCHOA, 256.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/manguera-p-fregadero-01162535',
    nota: 'Manguera P / Fregadero · artículo 01-16-2535 · ref. 30171 · marca EZ-FLO/EASTMAN. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-021', PROV_OCHOA, 267.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-de-mano-cromo-rojo-01232499',
    nota: 'Ducha De Mano Cromo / Rojo · artículo 01-23-2499 · ref. TB5836/3-1 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-022', PROV_OCHOA, 283.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-de-ducha-2-01232379',
    nota: 'Cabeza De Ducha 2\'\' · artículo 01-23-2379 · ref. 15010 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-023', PROV_OCHOA, 307.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-p-ducha-telefono-1-funcion-01232598',
    nota: 'Cabeza P / Ducha Telefono 1 Funcion · artículo 01-23-2598 · ref. P01715 · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-024', PROV_OCHOA, 331.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-c-brazo-redonda-01230010',
    nota: 'Ducha C / Brazo Redonda · artículo 01-23-0010 · ref. SPC-1042 · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-025', PROV_OCHOA, 335.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-con-brazo-01230539',
    nota: 'Ducha Con Brazo · artículo 01-23-0539 · ref. 15029 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-026', PROV_OCHOA, 334.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-c-brazo-cuadrada-01230014',
    nota: 'Ducha C / Brazo Cuadrada · artículo 01-23-0014 · ref. SPC-1039 · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-027', PROV_OCHOA, 336.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-p-ducha-cuadrada-01232611',
    nota: 'Cabeza P / Ducha Cuadrada · artículo 01-23-2611 · ref. P017074" · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-028', PROV_OCHOA, 345.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-c-brazo-c-cubrefalta-redonda-01230011',
    nota: 'Ducha C / Brazo C / Cubrefalta Redonda · artículo 01-23-0011 · ref. SPC-1038 · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-029', PROV_OCHOA, 361.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-de-ducha-01230538',
    nota: 'Brazo De Ducha · artículo 01-23-0538 · ref. 15055 · marca EZ-FLO/EASTMAN. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-030', PROV_OCHOA, 363.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/manguera-de-metal-p-ducha-1-5mts-01232599',
    nota: 'Manguera De Metal P / Ducha 1.5Mts · artículo 01-23-2599 · ref. P01800 · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-031', PROV_OCHOA, 365.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-t-telefono-p-bano-completa-01232571',
    nota: 'Ducha T / Telefono P / Bano Completa · artículo 01-23-2571 · ref. 1560 · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-032', PROV_OCHOA, 373.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-de-ducha-3-01230545',
    nota: 'Cabeza De Ducha 3\'\' · artículo 01-23-0545 · ref. 15038 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-033', PROV_OCHOA, 401.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-p-ducha-5-funciones-01232597',
    nota: 'Cabeza P / Ducha 5 Funciones · artículo 01-23-2597 · ref. P01703 · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-034', PROV_OCHOA, 404.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-de-ducha-red-cromo-verde-01232507',
    nota: 'Cabeza De Ducha Red Cromo / Verde · artículo 01-23-2507 · ref. TB2236-4 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-035', PROV_OCHOA, 501.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-p-banera-01232615',
    nota: 'Ducha P / Banera · artículo 01-23-2615 · ref. P01325 · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-036', PROV_OCHOA, 508.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-de-ducha-01230529',
    nota: 'Cabeza De Ducha · artículo 01-23-0529 · ref. 15036 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-036', PROV_OCHOA, 195.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-de-ducha-01230415',
    nota: 'Cabeza De Ducha · artículo 01-23-0415 · ref. 15004 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-037', PROV_OCHOA, 511.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/manguera-cromada-plastica-01230530',
    nota: 'Manguera Cromada Plastica · artículo 01-23-0530 · ref. 15078 · marca EZ-FLO/EASTMAN. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-038', PROV_OCHOA, 535.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-de-ducha-red-d-mano-01232512',
    nota: 'Cabeza De Ducha Red + D. Mano · artículo 01-23-2512 · ref. TB2216 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-039', PROV_OCHOA, 553.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-deslizable-p-ducha-negra-01232555',
    nota: 'Barra Deslizable P / Ducha Negra · artículo 01-23-2555 · ref. SB18050-1-B · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-040', PROV_OCHOA, 559.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-tipo-telefono-p01720-01232584',
    nota: 'Ducha Tipo Teléfono P01720 · artículo 01-23-2584 · ref. P01720 · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-041', PROV_OCHOA, 562.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-de-ducha-cuadrada-01232514',
    nota: 'Cabeza De Ducha Cuadrada · artículo 01-23-2514 · ref. TB2228 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-042', PROV_OCHOA, 678.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-p-ducha-redonda-01232612',
    nota: 'Cabeza P / Ducha Redonda · artículo 01-23-2612 · ref. P017088" · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-043', PROV_OCHOA, 712.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-t-telefono-completa-01232463',
    nota: 'Ducha T / Telefono Completa · artículo 01-23-2463 · ref. 90103/15878 · marca EZ-FLO/EASTMAN. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-043', PROV_OCHOA, 475.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-t-telefono-completa-01232550',
    nota: 'Ducha T / Telefono Completa · artículo 01-23-2550 · ref. UP2168SET · marca ULTRA-PLOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-043', PROV_OCHOA, 1482.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-t-telefono-completa-01230540',
    nota: 'Ducha T / Telefono Completa · artículo 01-23-0540 · ref. 15070 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-044', PROV_OCHOA, 730.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-telefono-c-manguera-8-funciones-01232602',
    nota: 'Ducha Telefono C / Manguera 8 Funciones · artículo 01-23-2602 · ref. P01722 · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-045', PROV_OCHOA, 764.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-telefono-c-manguera-3-funciones-01232601',
    nota: 'Ducha Telefono C / Manguera 3 Funciones · artículo 01-23-2601 · ref. P01721 · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-045', PROV_OCHOA, 1084.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-telefono-c-manguera-3-funciones-01232604',
    nota: 'Ducha Telefono C / Manguera 3 Funciones · artículo 01-23-2604 · ref. P01725 · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-046', PROV_OCHOA, 783.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-deslizante-para-duchas-01232450',
    nota: 'Barra Deslizante Para Duchas · artículo 01-23-2450 · ref. A98089/A89089 · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-047', PROV_OCHOA, 835.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-redonda-5-funciones-01232600',
    nota: 'Ducha Redonda 5 Funciones · artículo 01-23-2600 · ref. P01704 · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-048', PROV_OCHOA, 895.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-c-brazo-y-cubrefalta-01230471',
    nota: 'Ducha C / Brazo Y Cubrefalta · artículo 01-23-0471 · ref. 15029 · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-049', PROV_OCHOA, 1152.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-higienica-55-chattaf-f-01230424',
    nota: 'Ducha Higienica 55-Chattaf-F · artículo 01-23-0424 · ref. 96136 · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-050', PROV_OCHOA, 1338.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-telefono-c-manguera-5-funciones-01232603',
    nota: 'Ducha Telefono C / Manguera 5 Funciones · artículo 01-23-2603 · ref. P01724 · marca AQUINA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-051', PROV_OCHOA, 1415.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-deslizable-p-ducha-01232530',
    nota: 'Barra Deslizable P / Ducha · artículo 01-23-2530 · ref. TB2156BN-1 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-051', PROV_OCHOA, 806.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-deslizable-para-ducha-01232538',
    nota: 'Barra Deslizable Para Ducha · artículo 01-23-2538 · ref. TB2156-1 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-052', PROV_OCHOA, 1660.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cabeza-de-ducha-4-01230533',
    nota: 'Cabeza De Ducha 4\'\' · artículo 01-23-0533 · ref. 15113 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-053', PROV_OCHOA, 3637.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-barra-exter-cabeza-red-01021597',
    nota: 'Ducha Barra Exter. Cabeza Red · artículo 01-02-1597 · ref. TB2216 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-053', PROV_OCHOA, 6509.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-barra-exter-cabeza-red-01021600',
    nota: 'Ducha Barra Exter. Cabeza Red · artículo 01-02-1600 · ref. TB593 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-053', PROV_OCHOA, 3180, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-barra-exter-cabeza-red-01021598',
    nota: 'Ducha Barra Exter. Cabeza Red · artículo 01-02-1598 · ref. TB2287 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-054', PROV_OCHOA, 10189.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-ducha-ext-4-op-cabeza-cuad-negro-01021751',
    nota: 'Barra Ducha Ext 4 Op. Cabeza Cuad. Negro · artículo 01-02-1751 · ref. D191STL · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-055', PROV_OCHOA, 10200.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-ducha-ext-4-op-cabeza-red-negro-01021752',
    nota: 'Barra Ducha Ext 4 Op. Cabeza Red. Negro · artículo 01-02-1752 · ref. D192STL · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-056', PROV_OCHOA, 10542.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-barra-ext-inx-pro-2op-gris-soporte-01021745',
    nota: 'Ducha Barra Ext Inx Pro 2Op Gris Soporte · artículo 01-02-1745 · ref. INX-1553-S · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-057', PROV_OCHOA, 12179.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-de-barra-exterior-paris-01021642',
    nota: 'Ducha De Barra Exterior Paris · artículo 01-02-1642 · ref. TB2151BN · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-058', PROV_OCHOA, 14479.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-barra-exter-cab-cuad-cromo-01021716',
    nota: 'Ducha Barra Exter. Cab. Cuad. Cromo · artículo 01-02-1716 · ref. TB23SW63 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-058', PROV_OCHOA, 9360.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-barra-exter-cab-cuad-cromo-01021709',
    nota: 'Ducha Barra Exter. Cab. Cuad. Cromo · artículo 01-02-1709 · ref. TB23SW62 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-058', PROV_OCHOA, 9604.32, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-barra-exter-cab-cuad-cromo-01021712',
    nota: 'Ducha Barra Exter. Cab. Cuad. Cromo · artículo 01-02-1712 · ref. TB23SW004 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-059', PROV_OCHOA, 15783.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/columna-de-ducha-165x200-mm-01101276',
    nota: 'Columna De Ducha 165X200 Mm · artículo 01-10-1276 · ref. S8879 · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-060', PROV_OCHOA, 16111.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-barra-ext-inx-pro-4op-gris-cuad-01021743',
    nota: 'Ducha Barra Ext Inx Pro 4Op Gris Cuad · artículo 01-02-1743 · ref. INX-1551-BS · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-061', PROV_OCHOA, 16111.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/ducha-barra-ext-inx-pro-4op-gris-red-01021744',
    nota: 'Ducha Barra Ext Inx Pro 4Op Gris Red · artículo 01-02-1744 · ref. INX-1552-BSR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-062', PROV_OCHOA, 16238.78, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/columna-de-ducha-155x210-mm-01101275',
    nota: 'Columna De Ducha 155X210 Mm · artículo 01-10-1275 · ref. S9801 · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-062', PROV_OCHOA, 11281.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/columna-de-ducha-155x210-mm-01101277',
    nota: 'Columna De Ducha 155X210 Mm · artículo 01-10-1277 · ref. SP21 · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-063', PROV_OCHOA, 25137.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-exterior-minimalista-virgen-cromo-01021693',
    nota: 'Barra Exterior Minimalista Virgen Cromo · artículo 01-02-1693 · ref. EDD77177CR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-064', PROV_OCHOA, 25445.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-de-ducha-coc-silver-chrome-01021648',
    nota: 'Barra De Ducha Coc Silver Chrome · artículo 01-02-1648 · ref. M770DCR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-065', PROV_OCHOA, 27491.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-de-bano-ducha-coc-silver-chrome-01021646',
    nota: 'Barra De Baño Ducha Coc Silver Chrome · artículo 01-02-1646 · ref. M771DCR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-066', PROV_OCHOA, 28335.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-exterior-minimalista-virgen-black-01021692',
    nota: 'Barra Exterior Minimalista Virgen Black · artículo 01-02-1692 · ref. EDD77177BLK · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-067', PROV_OCHOA, 29022.19, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-de-bano-ducha-coc-negro-cobalto-01021647',
    nota: 'Barra De Baño Ducha Coc Negro Cobalto · artículo 01-02-1647 · ref. M771DBK · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-068', PROV_OCHOA, 40738.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/columna-ducha-expuesta-c-regadera-01101110',
    nota: 'Columna Ducha Expuesta C / Regadera · artículo 01-10-1110 · ref. ALS9409002-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-069', PROV_OCHOA, 2603.89, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mezcladora-mono-ducha-c-salida-01021719',
    nota: 'Mezcladora Mono Ducha C / Salida · artículo 01-02-1719 · ref. TBZ21C3 · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-070', PROV_OCHOA, 5024.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mezcl-ducha-stelo-milan-gris-met-01021755',
    nota: 'Mezcl. Ducha Stelo Milan Gris Met · artículo 01-02-1755 · ref. D182STL · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-071', PROV_OCHOA, 5025.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mezcl-ducha-stelo-milan-cromo-01021754',
    nota: 'Mezcl. Ducha Stelo Milan Cromo · artículo 01-02-1754 · ref. D181STL · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-09-072', PROV_OCHOA, 12165.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mezc-monom-barra-ext-new-belice-01021175',
    nota: 'Mezc Monom. Barra Ext.New Belice · artículo 01-02-1175 · ref. 96170 · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-12-009', PROV_OCHOA, 331.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/estuco-para-interiores-04590424',
    nota: 'Estuco Para Interiores · artículo 04-59-0424 · ref. 35LIBRAS · marca DURO YESO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-001', PROV_OCHOA, 262.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-negro-1-2mm-144xat-04670061',
    nota: 'Perfil Cuad. Negro 1.2Mm (144Xat) · artículo 04-67-0061 · ref. 3/4X3/4"20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-002', PROV_OCHOA, 321.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-negro-1-6mm-144xat-04671177',
    nota: 'Perfil Cuad. Negro 1.6Mm (144Xat) · artículo 04-67-1177 · ref. 3/4X3/4"20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-003', PROV_OCHOA, 355.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-negro-1-2mm-144xat-04670066',
    nota: 'Perfil Cuad. Negro 1.2Mm (144Xat) · artículo 04-67-0066 · ref. 1X1"20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-004', PROV_OCHOA, 510.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-negro-1-2-mm-144xat-04670070',
    nota: 'Perfil Cuad. Negro 1.2 Mm (144Xat) · artículo 04-67-0070 · ref. 11/4X11/4"20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-005', PROV_OCHOA, 556.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-negro-1-6-mm-144xat-04670071',
    nota: 'Perfil Cuad. Negro 1.6 Mm (144Xat) · artículo 04-67-0071 · ref. 11/4X11/4"20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-006', PROV_OCHOA, 542.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-negro-1-2mm-150xat-04670059',
    nota: 'Perfil Cuad. Negro 1.2Mm (150Xat) · artículo 04-67-0059 · ref. 11/2X11/2"20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-007', PROV_OCHOA, 647.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-negro-1-6mm-150xat-04670058',
    nota: 'Perfil Cuad. Negro 1.6Mm (150Xat) · artículo 04-67-0058 · ref. 11/2X11/2"20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-008', PROV_OCHOA, 867.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-negro-1-6mm-90xat-04670065',
    nota: 'Perfil Cuad. Negro 1.6Mm (90Xat) · artículo 04-67-0065 · ref. 2X2"20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-009', PROV_OCHOA, 1319.81, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-negro-1-6mm-48xat-04670062',
    nota: 'Perfil Cuad. Negro 1.6Mm (48Xat) · artículo 04-67-0062 · ref. 3X320\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-010', PROV_OCHOA, 316.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuadrado-galv-1-2-mm-144xat-04670043',
    nota: 'Perfil Cuadrado Galv. 1.2 Mm (144Xat) · artículo 04-67-0043 · ref. 3/4X3/4X20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-011', PROV_OCHOA, 423.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuadrado-galv-1-2-mm-144xata-04670044',
    nota: 'Perfil Cuadrado Galv. 1.2 Mm 144Xata · artículo 04-67-0044 · ref. 1X1"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-012', PROV_OCHOA, 539.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuadrado-galv-1-6-mm-144xat-04671557',
    nota: 'Perfil Cuadrado Galv. 1.6 Mm (144Xat) · artículo 04-67-1557 · ref. 1X1"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-013', PROV_OCHOA, 712.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuadrado-galv-1-5-mm-225xata-04672749',
    nota: 'Perfil Cuadrado Galv. 1.5 Mm 225Xata · artículo 04-67-2749 · ref. 11/4X11/4"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-014', PROV_OCHOA, 648.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-galv-1-2-mm-150xat-04670045',
    nota: 'Perfil Cuad. Galv. 1.2 Mm (150Xat) · artículo 04-67-0045 · ref. 11/2X11/2X20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-015', PROV_OCHOA, 814.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-galv-1-6-mm-150xat-04670046',
    nota: 'Perfil Cuad. Galv. 1.6 Mm (150Xat) · artículo 04-67-0046 · ref. 11/2X11/2X20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-016', PROV_OCHOA, 1108.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-galv-1-6-mm-90xat-04670047',
    nota: 'Perfil Cuad. Galv. 1.6 Mm (90Xat) · artículo 04-67-0047 · ref. 2X2"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-017', PROV_OCHOA, 1707.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-galv-1-5-48xat-04672419',
    nota: 'Perfil Cuad. Galv. 1.5 (48Xat) · artículo 04-67-2419 · ref. 3X3\'\'X20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-018', PROV_OCHOA, 402.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-negro-1-2mm-150xat-04670049',
    nota: 'Perfil Rect. Negro 1.2Mm (150Xat) · artículo 04-67-0049 · ref. 3/4X11/2X20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-019', PROV_OCHOA, 472.19, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-negro-1-6-mm-150xat-04670035',
    nota: 'Perfil Rect. Negro 1.6 Mm (150Xat) · artículo 04-67-0035 · ref. 3/4X11/2 · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-020', PROV_OCHOA, 542.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-negro-1-2mm-150xat-04670060',
    nota: 'Perfil Rect. Negro 1.2Mm (150Xat) · artículo 04-67-0060 · ref. 2X1X20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-021', PROV_OCHOA, 639.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-negro-1-6mm-150xat-04670063',
    nota: 'Perfil Rect. Negro 1.6Mm (150Xat) · artículo 04-67-0063 · ref. 2X1X20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-022', PROV_OCHOA, 1082.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-negro-1-6mm-72xat-04670064',
    nota: 'Perfil Rect. Negro 1.6Mm (72Xat) · artículo 04-67-0064 · ref. 2X3"20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-023', PROV_OCHOA, 1349.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-negro-1-6mm-60xat-04670057',
    nota: 'Perfil Rect. Negro 1.6Mm (60Xat) · artículo 04-67-0057 · ref. 2X4"X20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-024', PROV_OCHOA, 973.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-negro-1-6mm-88xat-04670056',
    nota: 'Perfil Rect. Negro 1.6Mm (88Xat) · artículo 04-67-0056 · ref. 3X11/2"20\' · marca HN-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-025', PROV_OCHOA, 492.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-2-150xat-04670036',
    nota: 'Perfil Rect. Galv. 1.2 (150Xat) · artículo 04-67-0036 · ref. 3/4X11/2"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-026', PROV_OCHOA, 626.88, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-5-mm-150-xat-04670037',
    nota: 'Perfil Rect. Galv.1.5 Mm (150 Xat) · artículo 04-67-0037 · ref. 3/4X11/2X20 · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-027', PROV_OCHOA, 646.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-2-150xat-04670038',
    nota: 'Perfil Rect. Galv. 1.2 (150Xat) · artículo 04-67-0038 · ref. 2X1"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-028', PROV_OCHOA, 812.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-6-150xat-04670039',
    nota: 'Perfil Rect. Galv. 1.6 (150Xat) · artículo 04-67-0039 · ref. 2X1"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-029', PROV_OCHOA, 1400.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-6-72xat-04670042',
    nota: 'Perfil Rect. Galv. 1.6 (72Xat) · artículo 04-67-0042 · ref. 2X3"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-030', PROV_OCHOA, 1695.85, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-6-60xat-04670041',
    nota: 'Perfil Rect. Galv. 1.6 (60Xat) · artículo 04-67-0041 · ref. 2X4"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-031', PROV_OCHOA, 1275.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-6-88xat-04670040',
    nota: 'Perfil Rect. Galv. 1.6 (88Xat) · artículo 04-67-0040 · ref. 3X11/2"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-032', PROV_OCHOA, 620.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-2-77mm-04730463',
    nota: 'Tubo Negro (2.77Mm) · artículo 04-73-0463 · ref. 1/2\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-033', PROV_OCHOA, 826, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-2-87mm-04730465',
    nota: 'Tubo Negro (2.87Mm) · artículo 04-73-0465 · ref. 3/4\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-034', PROV_OCHOA, 1206.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-3-38mm-04730469',
    nota: 'Tubo Negro ( 3.38Mm) · artículo 04-73-0469 · ref. 1"X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-035', PROV_OCHOA, 1507.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-3-56mm-04730466',
    nota: 'Tubo Negro (3.56Mm) · artículo 04-73-0466 · ref. 11/4\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-036', PROV_OCHOA, 1952.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-3-68mm-04730464',
    nota: 'Tubo Negro (3.68Mm) · artículo 04-73-0464 · ref. 11/2\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-037', PROV_OCHOA, 2634.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-3-91mm-04730467',
    nota: 'Tubo Negro (3.91Mm) · artículo 04-73-0467 · ref. 2\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-038', PROV_OCHOA, 4173.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-2-1-2-04730461',
    nota: 'Tubo 2 1 / 2\'\' · artículo 04-73-0461 · ref. 21/2\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-039', PROV_OCHOA, 5029.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-3-04730462',
    nota: 'Tubo Negro 3\'\' · artículo 04-73-0462 · ref. 3\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-040', PROV_OCHOA, 15250.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-407-85-lbs-6mm-04730087',
    nota: 'Tubo Negro 407.85 Lbs. (6Mm) · artículo 04-73-0087 · ref. 8"X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-041', PROV_OCHOA, 11671.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-304-23-lbs-6-35mm-04730088',
    nota: 'Tubo Negro 304.23 Lbs ( 6.35Mm) · artículo 04-73-0088 · ref. 6"X20" · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-042', PROV_OCHOA, 18313.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-240-82-kg-1-4-6-00-mm-04730086',
    nota: 'Tubo Negro 240.82 Kg.(1 / 4 6.00 Mm) · artículo 04-73-0086 · ref. 10"X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-043', PROV_OCHOA, 27695.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-6mm-04730137',
    nota: 'Tubo Negro (6Mm) · artículo 04-73-0137 · ref. 14"X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-044', PROV_OCHOA, 62026.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-1-2-12-70-mm-04730523',
    nota: 'Tubo Negro 1 / 2 (12.70 Mm). · artículo 04-73-0523 · ref. 16X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-045', PROV_OCHOA, 2658, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/correa-galvanizada-tipo-z-04780204',
    nota: 'Correa Galvanizada Tipo Z. · artículo 04-78-0204 · ref. 1/16X6" · marca GALV-CORREA. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-046', PROV_OCHOA, 3039.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/correa-galvanizada-tipo-z-04780225',
    nota: 'Correa Galvanizada Tipo Z · artículo 04-78-0225 · ref. 1/16X8" · marca GALV-CORREA. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-001', PROV_OCHOA, 449.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-11-80-lbs-04530002',
    nota: 'Angular H. Negro - 11.80 Lbs · artículo 04-53-0002 · ref. 3/4X1/83MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-002', PROV_OCHOA, 560, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-16-00-lbs-04530007',
    nota: 'Angular H. Negro - 16.00 Lbs · artículo 04-53-0007 · ref. 1X1/83MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-003', PROV_OCHOA, 812.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-23-20-lbs-04530014',
    nota: 'Angular H. Negro - 23.20 Lbs · artículo 04-53-0014 · ref. 1X3/165MM4.5MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-004', PROV_OCHOA, 1163.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-29-80-lbs-04530018',
    nota: 'Angular H. Negro - 29.80 Lbs · artículo 04-53-0018 · ref. 1X1/46MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-005', PROV_OCHOA, 781, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-20-20-lbs-04530012',
    nota: 'Angular H. Negro - 20.20 Lbs · artículo 04-53-0012 · ref. 11/4X1/83MM · marca HN-ANGULARES. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-006', PROV_OCHOA, 1036, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-29-60-lbs-04530017',
    nota: 'Angular H. Negro - 29.60 Lbs · artículo 04-53-0017 · ref. 11/4X3/16=5MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-007', PROV_OCHOA, 1344, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-38-40-lbs-04530024',
    nota: 'Angular H. Negro - 38.40 Lbs · artículo 04-53-0024 · ref. 11/4X1/46MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-008', PROV_OCHOA, 1260, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-36-00-lbs-04530022',
    nota: 'Angular H. Negro - 36.00 Lbs · artículo 04-53-0022 · ref. 11/2X3/16=5MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-009', PROV_OCHOA, 1638.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-46-80-lbs-04530027',
    nota: 'Angular H. Negro - 46.80 Lbs · artículo 04-53-0027 · ref. 11/2X1/4=6MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-010', PROV_OCHOA, 1155, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-33-00-lbs-04530021',
    nota: 'Angular H. Negro - 33.00 Lbs · artículo 04-53-0021 · ref. 2X1/8 · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-011', PROV_OCHOA, 1708, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-48-80-lbs-04530028',
    nota: 'Angular H. Negro - 48.80 Lbs · artículo 04-53-0028 · ref. 2X3/16=5MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-012', PROV_OCHOA, 2324.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-63-80-lbs-04530030',
    nota: 'Angular H. Negro - 63.80 Lbs · artículo 04-53-0030 · ref. 2X1/4=6MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-013', PROV_OCHOA, 3290.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-94-00-lbs-04530035',
    nota: 'Angular H. Negro - 94.00 Lbs · artículo 04-53-0035 · ref. 2X3/89MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-014', PROV_OCHOA, 2149, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-61-40-lbs-04530029',
    nota: 'Angular H. Negro - 61.40 Lbs · artículo 04-53-0029 · ref. 21/2X3/165MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-015', PROV_OCHOA, 2870, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-82-00-lbs-04530034',
    nota: 'Angular H. Negro - 82.00 Lbs · artículo 04-53-0034 · ref. 21/2X1/4 · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-016', PROV_OCHOA, 4130, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-118-00-lbs-04530004',
    nota: 'Angular H. Negro - 118.00 Lbs · artículo 04-53-0004 · ref. 21/2X3/89MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-017', PROV_OCHOA, 3430, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-98-00-lbs-04530036',
    nota: 'Angular H. Negro - 98.00 Lbs · artículo 04-53-0036 · ref. 3X1/4 · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-018', PROV_OCHOA, 5622.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-144-00-lbs-04530006',
    nota: 'Angular H. Negro- 144.00 Lbs · artículo 04-53-0006 · ref. 3X3/89MM · marca HN-ANGULARES. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-019', PROV_OCHOA, 4117.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-132-00-lbs-04530005',
    nota: 'Angular H. Negro - 132.00 Lbs · artículo 04-53-0005 · ref. 4X1/46MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-020', PROV_OCHOA, 9995.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-hierro-negro-256-lbs-04530016',
    nota: 'Angular Hierro Negro 256 Lbs · artículo 04-53-0016 · ref. 4X1/212MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-021', PROV_OCHOA, 141.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-4-250-lbs-04680031',
    nota: 'Planchuela H. Negro 4.250 Lbs · artículo 04-68-0031 · ref. 1/2X1/83MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-022', PROV_OCHOA, 249.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-6-400-lbs-04680053',
    nota: 'Planchuela H. Negro 6.400 Lbs · artículo 04-68-0053 · ref. 1/2X3/165MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-023', PROV_OCHOA, 331.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-8-500-lbs-04680046',
    nota: 'Planchuela H. Negro 8.500 Lbs · artículo 04-68-0046 · ref. 1/2X1/4 · marca HN-PLANCHUELA. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-024', PROV_OCHOA, 298.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-6-376-lbs-04680039',
    nota: 'Planchuela H. Negro 6.376 Lbs · artículo 04-68-0039 · ref. 3/4X1/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-025', PROV_OCHOA, 373, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-9-564-lbs-04680048',
    nota: 'Planchuela H. Negro 9.564 Lbs · artículo 04-68-0048 · ref. 3/4X3/165MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-026', PROV_OCHOA, 497.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-12-750-lbs-04680007',
    nota: 'Planchuela H. Negro 12.750 Lbs · artículo 04-68-0007 · ref. 3/4X1/4 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-027', PROV_OCHOA, 297.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-8-500-lbs-04680045',
    nota: 'Planchuela H. Negro 8.500 Lbs · artículo 04-68-0045 · ref. 1X1/83MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-028', PROV_OCHOA, 446.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-12-750-lbs-04680006',
    nota: 'Planchuela H. Negro 12.750 Lbs · artículo 04-68-0006 · ref. 1X3/165MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-029', PROV_OCHOA, 595, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-17-000-lbs-04680013',
    nota: 'Planchuela H. Negro 17.000 Lbs · artículo 04-68-0013 · ref. 1X1/46MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-030', PROV_OCHOA, 1327.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-34-000-lbs-04680027',
    nota: 'Planchuela H. Negro 34.000 Lbs · artículo 04-68-0027 · ref. 1X1/212MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-031', PROV_OCHOA, 415.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-10-650-lbs-04680001',
    nota: 'Planchuela H. Negro 10.650 Lbs · artículo 04-68-0001 · ref. 11/4X1/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-032', PROV_OCHOA, 614.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-15-94-lbs-04680010',
    nota: 'Planchuela H. Negro 15.94 Lbs · artículo 04-68-0010 · ref. 11/4X3/16=5MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-033', PROV_OCHOA, 745.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-21-30-lbs-04680020',
    nota: 'Planchuela H. Negro 21.30 Lbs · artículo 04-68-0020 · ref. 11/4X1/46MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-034', PROV_OCHOA, 1115.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-31-878-lbs-04680025',
    nota: 'Planchuela H. Negro 31.878 Lbs · artículo 04-68-0025 · ref. 11/4X3/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-035', PROV_OCHOA, 451.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-12-750-lbs-04680005',
    nota: 'Planchuela H. Negro 12.750 Lbs · artículo 04-68-0005 · ref. 11/2X1/83MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-036', PROV_OCHOA, 682.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-19-500-lbs-04680017',
    nota: 'Planchuela H. Negro 19.500 Lbs · artículo 04-68-0017 · ref. 11/2X3/16=5MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-037', PROV_OCHOA, 892.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-25-500-lbs-04680021',
    nota: 'Planchuela H. Negro 25.500 Lbs · artículo 04-68-0021 · ref. 11/2X1/4=6MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-038', PROV_OCHOA, 1338.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-38-250-lbs-04680029',
    nota: 'Planchuela H. Negro 38.250 Lbs · artículo 04-68-0029 · ref. 11/2X3/89MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-039', PROV_OCHOA, 1991.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-51-000-lbs-04680035',
    nota: 'Planchuela H. Negro 51.000 Lbs · artículo 04-68-0035 · ref. 11/2X1/2 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-040', PROV_OCHOA, 595, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-17-000-lbs-04680014',
    nota: 'Planchuela H. Negro 17.000 Lbs · artículo 04-68-0014 · ref. 2X1/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-041', PROV_OCHOA, 892.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-25-500-lbs-04680023',
    nota: 'Planchuela H. Negro 25.500 Lbs · artículo 04-68-0023 · ref. 2X3/16=5MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-042', PROV_OCHOA, 1189.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-34-000-lbs-04680028',
    nota: 'Planchuela H. Negro 34.000 Lbs · artículo 04-68-0028 · ref. 2X1/4=6MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-043', PROV_OCHOA, 1785, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-51-000-lbs-04680036',
    nota: 'Planchuela H. Negro 51.000 Lbs · artículo 04-68-0036 · ref. 2X3/89MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-044', PROV_OCHOA, 2380, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-68-000-lbs-04680041',
    nota: 'Planchuela H. Negro 68.000 Lbs · artículo 04-68-0041 · ref. 2X1/2 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-045', PROV_OCHOA, 1487.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-42-500-lbs-04680033',
    nota: 'Planchuela H. Negro 42.500 Lbs · artículo 04-68-0033 · ref. 21/2X1/4 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-046', PROV_OCHOA, 2231.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-63-760-lbs-04680040',
    nota: 'Planchuela H. Negro 63.760 Lbs · artículo 04-68-0040 · ref. 21/2X3/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-047', PROV_OCHOA, 1785, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-51-000-lbs-04680037',
    nota: 'Planchuela H. Negro 51.000 Lbs · artículo 04-68-0037 · ref. 3X1/4 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-048', PROV_OCHOA, 2677.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-76-500-lbs-04680044',
    nota: 'Planchuela H. Negro 76.500 Lbs · artículo 04-68-0044 · ref. 3X3/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-049', PROV_OCHOA, 2380, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-68-000-lbs-04680042',
    nota: 'Planchuela H. Negro 68.000 Lbs · artículo 04-68-0042 · ref. 4X1/4 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-050', PROV_OCHOA, 3982.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-102-000-lbs-04680003',
    nota: 'Planchuela H. Negro 102.000 Lbs · artículo 04-68-0003 · ref. 4X3/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-051', PROV_OCHOA, 1397.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-acero-inox-04680070',
    nota: 'Planchuela Acero Inox. · artículo 04-68-0070 · ref. 2X1/8X20\' · marca INOX-PLANCHUELA. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-052', PROV_OCHOA, 411.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-cuadrada-13-016-170xt-m-04540002',
    nota: 'Barra Cuadrada-13.016 (170Xt.M.) · artículo 04-54-0002 · ref. 7/16"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-053', PROV_OCHOA, 538.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-cuadrada-17-lbs-130xt-m-04540004',
    nota: 'Barra Cuadrada-17 Lbs (130Xt.M) · artículo 04-54-0004 · ref. 1/2"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-054', PROV_OCHOA, 843.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-cuadrada-26-562-lbs-83xt-m-s-d-04540005',
    nota: 'Barra Cuadrada-26.562 Lbs (83Xt.M) S / D · artículo 04-54-0005 · ref. 5/8"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-055', PROV_OCHOA, 238.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-7-510-lbs-296xt-m-04540037',
    nota: 'Barra Redonda-7.510 Lbs(296Xt.M.) · artículo 04-54-0037 · ref. 3/8"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-056', PROV_OCHOA, 421.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-13-352-lbs-166xt-m-04540027',
    nota: 'Barra Redonda-13.352 Lbs(166Xt.M.) · artículo 04-54-0027 · ref. 1/2"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-057', PROV_OCHOA, 660.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-20-862-lbs-106xt-m-04540028',
    nota: 'Barra Redonda-20.862 Lbs(106Xt.M.) · artículo 04-54-0028 · ref. 5/8"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-058', PROV_OCHOA, 945.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-30-040-lbs-74xt-04540030',
    nota: 'Barra Redonda-30.040 Lbs (74Xt) · artículo 04-54-0030 · ref. 3/4"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-059', PROV_OCHOA, 1666.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-53-408-lbs-42xt-04540035',
    nota: 'Barra Redonda-53.408 Lbs (42Xt) · artículo 04-54-0035 · ref. 1"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-060', PROV_OCHOA, 426.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-torneada-170-xt-04540009',
    nota: 'Barra Torneada (170 Xt) · artículo 04-54-0009 · ref. 7/16" · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-061', PROV_OCHOA, 553.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-torneada-130-xt-04540008',
    nota: 'Barra Torneada (130 Xt) · artículo 04-54-0008 · ref. 1/2" · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-062', PROV_OCHOA, 858.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-torneada-83-xt-04540010',
    nota: 'Barra Torneada ( 83 Xt) · artículo 04-54-0010 · ref. 5/8" · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-001', PROV_OCHOA, 1113.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-40-80-lbs-04710023',
    nota: 'Tola Negra 40.80 Lbs · artículo 04-71-0023 · ref. 1/32X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-002', PROV_OCHOA, 1497.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-59-34-lbs-04710032',
    nota: 'Tola Negra 59.34 Lbs · artículo 04-71-0032 · ref. 1/22X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-003', PROV_OCHOA, 2938.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-102-00-lbs-04710001',
    nota: 'Tola Negra 102.00 Lbs · artículo 04-71-0001 · ref. 1/16X4X10 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-004', PROV_OCHOA, 2224.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-81-61-lbs-04710040',
    nota: 'Tola Negra 81.61 Lbs · artículo 04-71-0040 · ref. 1/16X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-005', PROV_OCHOA, 3132.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-122-40-lbs-04710004',
    nota: 'Tola Negra 122.40 Lbs · artículo 04-71-0004 · ref. 3/32X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-006', PROV_OCHOA, 5622.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-204-00-lbs-04710012',
    nota: 'Tola Negra 204.00 Lbs · artículo 04-71-0012 · ref. 1/8X4X10 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-007', PROV_OCHOA, 4104.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-163-20-lbs-04710010',
    nota: 'Tola Negra 163.20 Lbs · artículo 04-71-0010 · ref. 1/8X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-008', PROV_OCHOA, 6428.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-255-00-lbs-04710016',
    nota: 'Tola Negra 255.00 Lbs · artículo 04-71-0016 · ref. 1/8X5X10 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-009', PROV_OCHOA, 6678.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-244-80-lbs-04710015',
    nota: 'Tola Negra 244.80 Lbs · artículo 04-71-0015 · ref. 3/16X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-010', PROV_OCHOA, 10410.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-382-50-lbs-04710022',
    nota: 'Tola Negra 382.50 Lbs · artículo 04-71-0022 · ref. 3/16X5X10 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-011', PROV_OCHOA, 12392.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-459-00-lbs-04710026',
    nota: 'Tola Negra 459.00 Lbs · artículo 04-71-0026 · ref. 3/16X6X10 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-012', PROV_OCHOA, 8276.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-326-40-lbs-04710020',
    nota: 'Tola Negra 326.40 Lbs · artículo 04-71-0020 · ref. 1/4X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-013', PROV_OCHOA, 16280.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-612-00-lbs-04710034',
    nota: 'Tola Negra 612.00 Lbs · artículo 04-71-0034 · ref. 1/4X6X10 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-014', PROV_OCHOA, 12665.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-489-60-lbs-04710029',
    nota: 'Tola Negra 489.60 Lbs · artículo 04-71-0029 · ref. 3/8X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-015', PROV_OCHOA, 21001.52, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-5-8-04710042',
    nota: 'Tola Negra 5 / 8\'\' · artículo 04-71-0042 · ref. 5/8X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-016', PROV_OCHOA, 37319.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-negra-1305-60-lbs-04710008',
    nota: 'Tola Negra 1305.60 Lbs · artículo 04-71-0008 · ref. 1"X4\'X8\' · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-017', PROV_OCHOA, 3253.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-corrugada-133-00-lbs-04710046',
    nota: 'Tola Corrugada 133.00 Lbs · artículo 04-71-0046 · ref. 3/32X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-018', PROV_OCHOA, 4279.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-corrugada-186-50-lbs-04710048',
    nota: 'Tola Corrugada 186.50 Lbs · artículo 04-71-0048 · ref. 1/8X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-019', PROV_OCHOA, 6433.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-corrugada-244-80-lbs-04710049',
    nota: 'Tola Corrugada 244.80 Lbs · artículo 04-71-0049 · ref. 3/16X4X8 · marca HN-TOLAS. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-020', PROV_OCHOA, 825.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-galvanizada-25-lbs-04770085',
    nota: 'Tola Galvanizada 25 Lbs. · artículo 04-77-0085 · ref. C-264X8 · marca GALV-TOLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-021', PROV_OCHOA, 952.19, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-galvanizada-32-lbs-04770071',
    nota: 'Tola Galvanizada 32 Lbs · artículo 04-77-0071 · ref. C-244X8 · marca GALV-TOLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-022', PROV_OCHOA, 1169.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-galvanizada-44-lbs-04770070',
    nota: 'Tola Galvanizada 44 Lbs. · artículo 04-77-0070 · ref. C-224X8 · marca GALV-TOLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-023', PROV_OCHOA, 1551.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-galvanizada-52-lbs-04770069',
    nota: 'Tola Galvanizada 52 Lbs. · artículo 04-77-0069 · ref. C-204X8 · marca GALV-TOLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-024', PROV_OCHOA, 2364.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tola-galvanizada-83-75-libs-04770067',
    nota: 'Tola Galvanizada 83.75 Libs. · artículo 04-77-0067 · ref. C-164X8 · marca GALV-TOLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-025', PROV_OCHOA, 2209.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/material-desplegable-plano-04770012',
    nota: 'Material Desplegable Plano · artículo 04-77-0012 · ref. 4X8X3/8" · marca MDP. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-026', PROV_OCHOA, 765.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/material-desplegable-plano-04770010',
    nota: 'Material Desplegable Plano · artículo 04-77-0010 · ref. 4X8X1/2" · marca MDP. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-027', PROV_OCHOA, 850, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/material-desplegable-plano-04770011',
    nota: 'Material Desplegable Plano · artículo 04-77-0011 · ref. 4X8X3/4" · marca MDP. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-028', PROV_OCHOA, 1080.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/material-desplegable-plano-04770009',
    nota: 'Material Desplegable Plano. · artículo 04-77-0009 · ref. 4X8X1" · marca MDP. ' + SUPUESTO_ITBIS
  });
  c('MAT-21-029', PROV_OCHOA, 939.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/material-desplegable-plano-04770007',
    nota: 'Material Desplegable Plano · artículo 04-77-0007 · ref. 4X8X11/2" · marca MDP. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-001', PROV_OCHOA, 5223.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-3-43mm-04660038',
    nota: 'Malla Ciclonica 3.43Mm · artículo 04-66-0038 · ref. C-093X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-002', PROV_OCHOA, 6121.98, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-3-43mm-04660039',
    nota: 'Malla Ciclonica 3.43Mm · artículo 04-66-0039 · ref. C-094X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-003', PROV_OCHOA, 9867.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-3-43mm-04660040',
    nota: 'Malla Ciclonica 3.43Mm · artículo 04-66-0040 · ref. C-096X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-004', PROV_OCHOA, 11757.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-rev-en-pvc-3-43mm-04660064',
    nota: 'Malla Ciclonica Rev. En Pvc 3.43Mm · artículo 04-66-0064 · ref. C-96X50VERDE · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-005', PROV_OCHOA, 13273.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-3-43mm-04660051',
    nota: 'Malla Ciclonica 3.43Mm · artículo 04-66-0051 · ref. C-098X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-006', PROV_OCHOA, 527.06, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-galv-p-malla-1-15mm-127xat-04730089',
    nota: 'Tubo Galv P / Malla 1.15Mm (127Xat) · artículo 04-73-0089 · ref. 11/4X20\' · marca TUB-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-007', PROV_OCHOA, 462.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-galv-p-malla-1-15mm-91xat-04730090',
    nota: 'Tubo Galv P / Malla 1.15Mm (91Xat) · artículo 04-73-0090 · ref. 11/2X15\' · marca TUB-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-008', PROV_OCHOA, 699.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-galv-p-malla-1-20mm-61xat-04730516',
    nota: 'Tubo Galv P / Malla 1.20Mm (61Xat) · artículo 04-73-0516 · ref. 2"X20\' · marca TUB-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-009', PROV_OCHOA, 4335.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-c-11-04660035',
    nota: 'Malla Ciclónica C-11 · artículo 04-66-0035 · ref. C-113X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-010', PROV_OCHOA, 8694.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-c-11-04660037',
    nota: 'Malla Ciclónica C-11 · artículo 04-66-0037 · ref. C-116X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-011', PROV_OCHOA, 2601.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-d-puas-premiun-64xpaleta-02450184',
    nota: 'Alambre D / Puas Premiun (64Xpaleta) · artículo 02-45-0184 · ref. 1.50MM250MTS · marca CORVI. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-012', PROV_OCHOA, 2541.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-d-puas-02450221',
    nota: 'Alambre D / Puas · artículo 02-45-0221 · ref. C-15250MTS · marca PATRON. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-013', PROV_OCHOA, 964.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-de-puas-02450003',
    nota: 'Alambre De Púas · artículo 02-45-0003 · ref. C-16110MTS · marca CORVI. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-014', PROV_OCHOA, 2108.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-d-puas-galv-cebu-superior-02450007',
    nota: 'Alambre D / Puas Galv.Cebu(Superior) · artículo 02-45-0007 · ref. C-16250MTS(64XAT) · marca KINNOX. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-014', PROV_OCHOA, 2336.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-de-puas-t-aiwa-02450159',
    nota: 'Alambre De Puas / T Aiwa · artículo 02-45-0159 · ref. C-16250MTS · marca CORVI. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-014', PROV_OCHOA, 3439.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-de-puas-250-mts-02450098',
    nota: 'Alambre De Puas 250 Mts. · artículo 02-45-0098 · ref. C-16250MTS · marca MOTTO. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-015', PROV_OCHOA, 1933.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-de-puas-250-mts-02450145',
    nota: 'Alambre De Puas 250 Mts. · artículo 02-45-0145 · ref. C-17250MTS · marca TORO. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-016', PROV_OCHOA, 113.78, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-met-d-cuad-p-conejo-29-30kgs-02450118',
    nota: 'Tela Met. D / Cuad. P / Conejo 29.30Kgs · artículo 02-45-0118 · ref. C-161X2X4X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-017', PROV_OCHOA, 192.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-metalica-d-cuadrito-43-50kgs-02450080',
    nota: 'Tela Metalica D / Cuadrito 43.50Kgs · artículo 02-45-0080 · ref. C-181/2X1/2X4X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-018', PROV_OCHOA, 106.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-met-d-cuad-p-conejo-22kgs-02450199',
    nota: 'Tela Met. D / Cuad. P / Conejo 22Kgs · artículo 02-45-0199 · ref. C-181X1/2X3\'X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-019', PROV_OCHOA, 145.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-met-d-cuad-p-conejo-29-30kgs-02450198',
    nota: 'Tela Met. D / Cuad. P / Conejo 29.30Kgs · artículo 02-45-0198 · ref. C-181X1/2X4X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-020', PROV_OCHOA, 37.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-met-d-cuadrito-p-conejo-6-60kgs-02450161',
    nota: 'Tela Met. D / Cuadrito P / Conejo 6.60Kgs · artículo 02-45-0161 · ref. C-201X2X3X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-021', PROV_OCHOA, 72.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-metalica-d-cuadrito-bwg-14kgs-02450032',
    nota: 'Tela Metalica D / Cuadrito Bwg 14Kgs · artículo 02-45-0032 · ref. C-213/8X3/8X3X100 · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-022', PROV_OCHOA, 54.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-p-gallinero-13kgs-02450127',
    nota: 'Tela P / Gallinero 13Kgs · artículo 02-45-0127 · ref. C-193X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-023', PROV_OCHOA, 46.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-p-gallinero-11kgs-02450139',
    nota: 'Tela P / Gallinero 11Kgs · artículo 02-45-0139 · ref. C-203X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-024', PROV_OCHOA, 16.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/abrazadera-p-malla-cicl-04660001',
    nota: 'Abrazadera P / Malla Cicl. · artículo 04-66-0001 · ref. 11/4"CORTA · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-025', PROV_OCHOA, 76.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-pasante-p-malla-cicl-04660023',
    nota: 'Copa Pasante P / Malla Cicl. · artículo 04-66-0023 · ref. 11/4"X11/2" · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-026', PROV_OCHOA, 55.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-tensora-p-malla-ciclonica-04660024',
    nota: 'Copa Tensora P / Malla Ciclonica · artículo 04-66-0024 · ref. 11/4" · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-027', PROV_OCHOA, 36.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-terminal-p-tubo-malla-04660026',
    nota: 'Copa Terminal P / Tubo Malla · artículo 04-66-0026 · ref. 11/4"(TAPON) · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-028', PROV_OCHOA, 60.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/union-p-tubo-de-malla-04660280',
    nota: 'Union P / Tubo De Malla · artículo 04-66-0280 · ref. 11/4"REFORZADA · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-029', PROV_OCHOA, 19.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/abrazadera-p-malla-cicl-04660003',
    nota: 'Abrazadera P / Malla Cicl. · artículo 04-66-0003 · ref. 11/2"CORTA · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-030', PROV_OCHOA, 28.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/abrazadera-p-malla-cicl-04660002',
    nota: 'Abrazadera P / Malla Cicl. · artículo 04-66-0002 · ref. 11/2"LARGA-S/TORN. · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-031', PROV_OCHOA, 187.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-p-malla-ciclonica-doble-04660017',
    nota: 'Brazo P / Malla Ciclonica Doble · artículo 04-66-0017 · ref. 11/2X11/4 · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-032', PROV_OCHOA, 124.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-sencillo-p-malla-especial-04660251',
    nota: 'Brazo Sencillo P / Malla Especial · artículo 04-66-0251 · ref. 11/2X11/4 · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-033', PROV_OCHOA, 76.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-pasante-p-malla-cicl-04660021',
    nota: 'Copa Pasante P / Malla Cicl. · artículo 04-66-0021 · ref. 11/2"X11/2" · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-034', PROV_OCHOA, 61.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-terminal-p-tubo-malla-04660091',
    nota: 'Copa Terminal P / Tubo Malla · artículo 04-66-0091 · ref. 11/2(TAPON) · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-035', PROV_OCHOA, 21.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/abrazadera-p-malla-cicl-04660006',
    nota: 'Abrazadera P / Malla Cicl. · artículo 04-66-0006 · ref. 2"CORTA · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-036', PROV_OCHOA, 20.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/abrazadera-p-malla-ciclonica-04660007',
    nota: 'Abrazadera P / Malla Ciclonica · artículo 04-66-0007 · ref. 2"LARGA-S/TORN. · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-037', PROV_OCHOA, 187.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-para-malla-ciclonica-04660242',
    nota: 'Brazo Para Malla Ciclonica · artículo 04-66-0242 · ref. 2X11/4SENCILLA · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-038', PROV_OCHOA, 373.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-doble-p-tubo-malla-04660319',
    nota: 'Brazo Doble P / Tubo Malla · artículo 04-66-0319 · ref. 2X11/2 · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-039', PROV_OCHOA, 51.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-terminal-p-tubo-malla-04660029',
    nota: 'Copa Terminal P / Tubo Malla · artículo 04-66-0029 · ref. 2"(TAPON) · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-040', PROV_OCHOA, 300.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-p-malla-ciclonica-04660326',
    nota: 'Brazo P / Malla Ciclonica · artículo 04-66-0326 · ref. 23/8X11/2 · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-041', PROV_OCHOA, 36.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-terminal-p-tubo-malla-04660030',
    nota: 'Copa Terminal P / Tubo Malla · artículo 04-66-0030 · ref. 3"(TAPON) · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-001', PROV_OCHOA, 299.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-red-d-alum-tubor0004-04730134',
    nota: 'Tubo Red.D / Alum. Tubor0004 · artículo 04-73-0134 · ref. 3/8"(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-002', PROV_OCHOA, 373.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-red-d-aluminio-tubor0008-04730054',
    nota: 'Tubo Red.D / Aluminio Tubor0008 · artículo 04-73-0054 · ref. 1/2"(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-003', PROV_OCHOA, 452.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-d-aluminio-plati0003-04680089',
    nota: 'Planchuela D / Aluminio Plati0003 · artículo 04-68-0089 · ref. 1/2X1/819.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-004', PROV_OCHOA, 394.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-d-aluminio-angu0001-04530109',
    nota: 'Angular D / Aluminio Angu0001 · artículo 04-53-0109 · ref. 1/2X1/2X(19.20) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-005', PROV_OCHOA, 377.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/moldura-d-aluminio-u-eu002-04530094',
    nota: 'Moldura D / Aluminio ”U” Eu002 · artículo 04-53-0094 · ref. 1/2X1/2X19.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-006', PROV_OCHOA, 827.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/moldura-u-d-aluminio-can-007-04530108',
    nota: 'Moldura ”U” D / Aluminio Can.007 · artículo 04-53-0108 · ref. 5/8X5/8X19.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-007', PROV_OCHOA, 772.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-red-d-alum-tubor0013-04730057',
    nota: 'Tubo Red. D / Alum. Tubor0013 · artículo 04-73-0057 · ref. 3/4"(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-008', PROV_OCHOA, 436.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-de-aluminio-19-20cm-04530111',
    nota: 'Angular De Aluminio 19.20Cm · artículo 04-53-0111 · ref. 3/4X3/4X19.20 · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-009', PROV_OCHOA, 957.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-red-d-aluminio-tubor0021-04730053',
    nota: 'Tubo Red.D / Aluminio Tubor0021 · artículo 04-73-0053 · ref. 1"(19.20PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-010', PROV_OCHOA, 1709.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-d-aluminio-plati0020-04680050',
    nota: 'Planchuela D / Aluminio Plati0020 · artículo 04-68-0050 · ref. 1X1/4X19.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-011', PROV_OCHOA, 626.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-d-aluminio-ea-046-04530084',
    nota: 'Angular D / Aluminio Ea-046 · artículo 04-53-0084 · ref. 1X3/4(19.20PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-012', PROV_OCHOA, 1336.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-aluminio-tubo-et076-04670007',
    nota: 'Perfil Aluminio (Tubo Et076) · artículo 04-67-0007 · ref. 1X1"(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-013', PROV_OCHOA, 2185.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-red-d-alum-tubor0028-04730051',
    nota: 'Tubo Red.D / Alum. Tubor0028 · artículo 04-73-0051 · ref. 11/4"X(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-014', PROV_OCHOA, 982.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-d-alum-ea014-19-20-pie-04530113',
    nota: 'Angular D / Alum. Ea014 (19.20 Pie) · artículo 04-53-0113 · ref. 11/4X11/4 · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-015', PROV_OCHOA, 2567.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-d-alum-plati0032-04540065',
    nota: 'Planchuela D / Alum Plati0032 · artículo 04-54-0065 · ref. 11/2X1/4(19.20P · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-016', PROV_OCHOA, 1117.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/moldura-d-aluminio-u-eu071-04530099',
    nota: 'Moldura D / Aluminio ”U” Eu071 · artículo 04-53-0099 · ref. 11/2X3/4X19.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-017', PROV_OCHOA, 2473.52, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-d-aluminio-angu0019-04530114',
    nota: 'Angular D / Aluminio Angu0019 · artículo 04-53-0114 · ref. 11/2X11/2(19.20P · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-018', PROV_OCHOA, 1701.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-d-alum-et087-tuboca0087-04670194',
    nota: 'Perfil Cuad. D / Alum.Et087 Tuboca0087 · artículo 04-67-0194 · ref. 11/2X11/2(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-019', PROV_OCHOA, 1846.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-alum-et117-rect0117-04670073',
    nota: 'Perfil Rect. Alum. Et117 Rect0117 · artículo 04-67-0073 · ref. 2X1(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-020', PROV_OCHOA, 3334.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-d-alum-1-8-angu0027-04530115',
    nota: 'Angular D / Alum. 1 / 8 Angu0027 · artículo 04-53-0115 · ref. 2X2X19.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-021', PROV_OCHOA, 2695.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-d-alum-plati0051-04540066',
    nota: 'Planchuela D / Alum Plati0051 · artículo 04-54-0066 · ref. 3"X3/16(19.20PI) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-022', PROV_OCHOA, 3956.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-d-aluminio-et103-04670080',
    nota: 'Perfil Rect. D / Aluminio Et103 · artículo 04-67-0080 · ref. 3X11/2X(19.2PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-023', PROV_OCHOA, 3464.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-d-alumino-plati0059-04540067',
    nota: 'Planchuela D / Alumino Plati0059 · artículo 04-54-0067 · ref. 4"X1/819.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-024', PROV_OCHOA, 5142.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-aluminio-nat-rect0101-04670119',
    nota: 'Perfil Aluminio Nat. Rect0101 · artículo 04-67-0119 · ref. 4"X13/4"X(19.2P · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-001', PROV_OCHOA, 5981.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-aguazul-con-asiento-01045143',
    nota: 'Inodoro Aguazul Con Asiento · artículo 01-04-5143 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-002', PROV_OCHOA, 6162.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-one-piece-ares-c-asiento-01045464',
    nota: 'Inodoro One Piece Ares C / Asiento · artículo 01-04-5464 · ref. BLANCO2016 · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-003', PROV_OCHOA, 6458.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elong-anubis-c-asiento-01045495',
    nota: 'Inodoro Elong. Anubis C / Asiento · artículo 01-04-5495 · ref. 2777BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-004', PROV_OCHOA, 7263.45, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-jazmin-red-c-asiento-01045146',
    nota: 'Inodoro Jazmin Red. C / Asiento · artículo 01-04-5146 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-005', PROV_OCHOA, 8109.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elong-milenio-c-asiento-01045353',
    nota: 'Inodoro Elong. Milenio C / Asiento · artículo 01-04-5353 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-006', PROV_OCHOA, 8116.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elong-zurich-c-asiento-01045155',
    nota: 'Inodoro Elong. Zurich C / Asiento · artículo 01-04-5155 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-007', PROV_OCHOA, 8541.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-jazmin-red-c-asiento-01045171',
    nota: 'Inodoro Jazmin Red. C / Asiento · artículo 01-04-5171 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-008', PROV_OCHOA, 8569.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elong-tango-c-asiento-01045175',
    nota: 'Inodoro Elong. Tango C / Asiento · artículo 01-04-5175 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-009', PROV_OCHOA, 8937.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-jazmin-elong-c-asiento-01045147',
    nota: 'Inodoro Jazmin Elong. C / Asiento · artículo 01-04-5147 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-010', PROV_OCHOA, 8960.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-one-piece-atenas-c-asiento-01045491',
    nota: 'Inodoro One Piece Atenas C / Asiento · artículo 01-04-5491 · ref. 2064BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-011', PROV_OCHOA, 9157.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-fiore-elongado-c-asiento-01045316',
    nota: 'Inodoro Fiore Elongado C / Asiento · artículo 01-04-5316 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-012', PROV_OCHOA, 9595.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elong-terra-c-asiento-01045145',
    nota: 'Inodoro Elong. Terra C / Asiento · artículo 01-04-5145 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-013', PROV_OCHOA, 10133.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-bellini-one-piece-01045306',
    nota: 'Inodoro Bellini One Piece · artículo 01-04-5306 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-014', PROV_OCHOA, 10517.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-one-piece-hermes-c-asiento-01045489',
    nota: 'Inodoro One Piece Hermes C / Asiento · artículo 01-04-5489 · ref. 2054BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-015', PROV_OCHOA, 10904.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-jazmin-elong-c-asiento-01045172',
    nota: 'Inodoro Jazmin Elong. C / Asiento · artículo 01-04-5172 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-016', PROV_OCHOA, 11433.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elong-tango-c-asiento-01045176',
    nota: 'Inodoro Elong Tango C / Asiento · artículo 01-04-5176 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-017', PROV_OCHOA, 11783.07, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-one-piece-zaya-c-asiento-01045494',
    nota: 'Inodoro One Piece Zaya C / Asiento · artículo 01-04-5494 · ref. 2920BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-018', PROV_OCHOA, 11988.89, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elong-chichen-itza-c-asiento-01045178',
    nota: 'Inodoro Elong Chichen Itza C / Asiento · artículo 01-04-5178 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-019', PROV_OCHOA, 12917.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-olimpia-con-asiento-01045183',
    nota: 'Inodoro Olimpia Con Asiento · artículo 01-04-5183 · ref. TTRBLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-020', PROV_OCHOA, 13890.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elong-austral-compac-3-8l-01045498',
    nota: 'Inodoro Elong. Austral Compac 3.8L · artículo 01-04-5498 · ref. WCAUSTRALBLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-021', PROV_OCHOA, 14950.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-option-elongado-4-8l-01045356',
    nota: 'Inodoro Option Elongado 4.8L · artículo 01-04-5356 · ref. WCBLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-022', PROV_OCHOA, 15757.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elongado-drakar-16-01045388',
    nota: 'Inodoro Elongado Drakar 16 · artículo 01-04-5388 · ref. BLANCO4.8LT · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-023', PROV_OCHOA, 16560.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elong-sarez-c-asiento-01045621',
    nota: 'Inodoro Elong. Sarez C / Asiento · artículo 01-04-5621 · ref. 2094MBNEGROMATE · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-024', PROV_OCHOA, 16560.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-one-piece-nemes-c-asiento-01045487',
    nota: 'Inodoro One Piece Nemes C / Asiento · artículo 01-04-5487 · ref. 2920NEGROMATE · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-025', PROV_OCHOA, 19389.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-elongado-bolmen-01045468',
    nota: 'Inodoro Elongado Bolmen · artículo 01-04-5468 · ref. TT1316MSMARFIL · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-026', PROV_OCHOA, 27004.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-rivoli-plus-one-piece-01045329',
    nota: 'Inodoro Rivoli Plus One Piece · artículo 01-04-5329 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-027', PROV_OCHOA, 27009.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-susp-genius-cisterna-01045603',
    nota: 'Inodoro Susp. Genius + Cisterna · artículo 01-04-5603 · ref. 1907BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-028', PROV_OCHOA, 32824.98, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-miura-16-01045504',
    nota: 'Inodoro Miura 16 · artículo 01-04-5504 · ref. WCMIURA16BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-029', PROV_OCHOA, 34487.85, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inodoro-op-capri-plus-4-8-lpd-01045400',
    nota: 'Inodoro Op Capri Plus 4.8 Lpd · artículo 01-04-5400 · ref. OPCARPIPLUSB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-030', PROV_OCHOA, 586.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoro-bellini-01045417',
    nota: 'Tanque Para Inodoro Bellini · artículo 01-04-5417 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-031', PROV_OCHOA, 1220.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-ceres-01045508',
    nota: 'Tanque Ceres · artículo 01-04-5508 · ref. BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-032', PROV_OCHOA, 1707.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-toronto-ii-ada-manija-01045677',
    nota: 'Tanque Toronto Ii Ada Manija · artículo 01-04-5677 · ref. KLIPENIVORY · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-033', PROV_OCHOA, 2559.07, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-lucas-red-3-4-8-lpd-01045601',
    nota: 'Tanque Lucas Red. 3´´ 4.8 Lpd · artículo 01-04-5601 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-034', PROV_OCHOA, 2587.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-artemis-push-710x415x800-mm-01045511',
    nota: 'Tanque Artemis Push 710X415X800 Mm · artículo 01-04-5511 · ref. 2758BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-035', PROV_OCHOA, 2732.09, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-aguazul-calidad-universal-01045090',
    nota: 'Tanque Aguazul Calidad Universal · artículo 01-04-5090 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-036', PROV_OCHOA, 2942.09, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoro-milenio-01045348',
    nota: 'Tanque Para Inodoro Milenio · artículo 01-04-5348 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-037', PROV_OCHOA, 2953.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoro-zurich-01045104',
    nota: 'Tanque Para Inodoro Zurich · artículo 01-04-5104 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-038', PROV_OCHOA, 3205.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-3-lucas-4-8-01045633',
    nota: 'Tanque 3´´ Lucas 4.8 · artículo 01-04-5633 · ref. NEGRO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-039', PROV_OCHOA, 3281.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-milenio-01045349',
    nota: 'Tanque Milenio · artículo 01-04-5349 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-040', PROV_OCHOA, 3294.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoro-zurich-01045106',
    nota: 'Tanque Para Inodoro Zurich · artículo 01-04-5106 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-041', PROV_OCHOA, 3353.81, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoro-jazmin-01045095',
    nota: 'Tanque Para Inodoro Jazmin · artículo 01-04-5095 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-042', PROV_OCHOA, 3460.52, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-aguazul-calidad-universal-01045092',
    nota: 'Tanque Aguazul Calidad Universal · artículo 01-04-5092 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-043', PROV_OCHOA, 3504.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-tango-3-01045163',
    nota: 'Tanque Tango 3\'\' · artículo 01-04-5163 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-044', PROV_OCHOA, 3523.85, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoro-fiore-01045314',
    nota: 'Tanque Para Inodoro Fiore · artículo 01-04-5314 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-045', PROV_OCHOA, 3686.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoro-jazmin-01045098',
    nota: 'Tanque Para Inodoro Jazmin · artículo 01-04-5098 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-046', PROV_OCHOA, 3935.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-goya-c-boton-3-8-01045524',
    nota: 'Tanque Goya C / Boton 3.8 · artículo 01-04-5524 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-047', PROV_OCHOA, 3963.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-de-inodoro-rodano-01045228',
    nota: 'Tanque De Inodoro Rodano · artículo 01-04-5228 · ref. TQ1-2-MMARFIL · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-048', PROV_OCHOA, 3963.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-inodoro-chichen-itza-01045167',
    nota: 'Tanque Inodoro Chichen Itza · artículo 01-04-5167 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-049', PROV_OCHOA, 4050.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoro-terra-iii-01045100',
    nota: 'Tanque Para Inodoro Terra Iii · artículo 01-04-5100 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-050', PROV_OCHOA, 4346.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoro-tango-01045165',
    nota: 'Tanque Para Inodoro Tango · artículo 01-04-5165 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-051', PROV_OCHOA, 4513.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-olimpia-01045282',
    nota: 'Tanque Olimpia · artículo 01-04-5282 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-052', PROV_OCHOA, 4532.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-inodoro-chichen-itza-01045168',
    nota: 'Tanque Inodoro Chichen Itza · artículo 01-04-5168 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-053', PROV_OCHOA, 4629.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-terra-3-01045102',
    nota: 'Tanque Terra 3” · artículo 01-04-5102 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-054', PROV_OCHOA, 4844.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-de-inodoro-option-01045362',
    nota: 'Tanque De Inodoro Option · artículo 01-04-5362 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-055', PROV_OCHOA, 4864.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-de-inodoro-rodano-01045227',
    nota: 'Tanque De Inodoro Rodano · artículo 01-04-5227 · ref. TQ1-2BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-056', PROV_OCHOA, 4918.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-olimpia-01045262',
    nota: 'Tanque Olimpia · artículo 01-04-5262 · ref. MARFIL · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-057', PROV_OCHOA, 5209.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-austral-01045518',
    nota: 'Tanque Austral · artículo 01-04-5518 · ref. WCAUSTRALBLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-058', PROV_OCHOA, 5283.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-inodoro-drakar-16-01045405',
    nota: 'Tanque Inodoro Drakar 16 · artículo 01-04-5405 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-059', PROV_OCHOA, 5467.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-sustenta-01045598',
    nota: 'Tanque Sustenta · artículo 01-04-5598 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-060', PROV_OCHOA, 5914.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-bolmen-16-01045472',
    nota: 'Tanque Bolmen 16 · artículo 01-04-5472 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-061', PROV_OCHOA, 6050.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoros-rodano-01045476',
    nota: 'Tanque Para Inodoros Rodano · artículo 01-04-5476 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-062', PROV_OCHOA, 6289.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-rodano-16-01045475',
    nota: 'Tanque Rodano 16 · artículo 01-04-5475 · ref. MARFIL · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-063', PROV_OCHOA, 6467.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-para-inodoro-bolmen-01045471',
    nota: 'Tanque Para Inodoro Bolmen · artículo 01-04-5471 · ref. MARFIL · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-064', PROV_OCHOA, 10691.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-murano-murano-01045332',
    nota: 'Tanque Murano Murano · artículo 01-04-5332 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-065', PROV_OCHOA, 13128.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-miura-16-01045505',
    nota: 'Tanque Miura 16 · artículo 01-04-5505 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-066', PROV_OCHOA, 18906.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tanque-miura-con-sensor-miura-4-8-01045583',
    nota: 'Tanque Miura Con Sensor Miura 4.8 · artículo 01-04-5583 · ref. MIURA16TCCBLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-067', PROV_OCHOA, 2129.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-universal-01045625',
    nota: 'Basineta Universal · artículo 01-04-5625 · ref. 110018033BLANCO · marca TREBOL. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-068', PROV_OCHOA, 2176.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elongado-ceres-01045507',
    nota: 'Basineta Elongado Ceres · artículo 01-04-5507 · ref. BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-069', PROV_OCHOA, 2501.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-de-ceramica-redonda-01045360',
    nota: 'Basineta De Cerámica Redonda · artículo 01-04-5360 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-070', PROV_OCHOA, 2558.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-lucas-red-3-4-8-lpd-01045600',
    nota: 'Basineta Lucas Red. 3´´ 4.8 Lpd · artículo 01-04-5600 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-071', PROV_OCHOA, 2731.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-aguazul-red-calidad-universal-01045089',
    nota: 'Basineta Aguazul Red. Calidad Universal · artículo 01-04-5089 · ref. BLANCA · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-072', PROV_OCHOA, 3026.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-baby-01045402',
    nota: 'Basineta Baby · artículo 01-04-5402 · ref. BLANCO · marca TREBOL. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-073', PROV_OCHOA, 3204.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-red-3-lucas-4-8-01045632',
    nota: 'Basineta Red. 3´´ Lucas 4.8 · artículo 01-04-5632 · ref. NEGRO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-074', PROV_OCHOA, 3391.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-jazmin-red-3-4-8-lpd-01045093',
    nota: 'Basineta Jazmin Red. 3” 4.8 Lpd · artículo 01-04-5093 · ref. BLANCA · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-075', PROV_OCHOA, 3445.23, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-aguazul-red-calidad-universal-01045091',
    nota: 'Basineta Aguazul Red. Calidad Universal · artículo 01-04-5091 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-076', PROV_OCHOA, 3686.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-jazmin-red-3-4-8-lpd-01045096',
    nota: 'Basineta Jazmin Red. 3” 4.8 Lpd · artículo 01-04-5096 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-077', PROV_OCHOA, 3893.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elong-anubis-c-asientos-01045509',
    nota: 'Basineta Elong. Anubis C / Asientos · artículo 01-04-5509 · ref. 2777BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-078', PROV_OCHOA, 4011.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-artemis-2-c-a-700x360x740-01045640',
    nota: 'Basineta Artemis 2 C / A. 700X360X740 · artículo 01-04-5640 · ref. BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-079', PROV_OCHOA, 4090.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elon-armin-c-asiento-01045680',
    nota: 'Basineta Elon Armin C / Asiento · artículo 01-04-5680 · ref. LX-2596BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-080', PROV_OCHOA, 4174.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elon-artemis-c-a-710x415x800-01045510',
    nota: 'Basineta Elon. Artemis C / A. 710X415X800 · artículo 01-04-5510 · ref. 2758BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-081', PROV_OCHOA, 4494.81, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elong-tango-elong-3-3-8-lpd-01045162',
    nota: 'Basineta Elong Tango Elong 3” 3.8 Lpd · artículo 01-04-5162 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-082', PROV_OCHOA, 4593.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elong-zurich-3-4-8-lpd-01045103',
    nota: 'Basineta Elong. Zurich 3” 4.8 Lpd · artículo 01-04-5103 · ref. BLANCA · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-083', PROV_OCHOA, 4598.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-milenio-elong-3-8-lpd-01045347',
    nota: 'Basineta Milenio Elong. 3.8 Lpd · artículo 01-04-5347 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-084', PROV_OCHOA, 4717.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-ino-drakar-1-tt1-01045182',
    nota: 'Basineta Ino. Drakar 1 Tt1 · artículo 01-04-5182 · ref. TZ1BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-085', PROV_OCHOA, 4974.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elong-terra-3-4-8-lpd-01045099',
    nota: 'Basineta Elong Terra 3” 4.8 Lpd · artículo 01-04-5099 · ref. BLANCA · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-086', PROV_OCHOA, 5014.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-jazmin-elong-3-4-8-lpd-01045094',
    nota: 'Basineta Jazmin Elong. 3” 4.8 Lpd · artículo 01-04-5094 · ref. BLANCA · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-087', PROV_OCHOA, 5063.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-de-ceramica-fiore-01045313',
    nota: 'Basineta De Cerámica Fiore · artículo 01-04-5313 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-088', PROV_OCHOA, 5127.81, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elong-goya-3-3-8-lpd-01045166',
    nota: 'Basineta Elong Goya 3” 3.8 Lpd · artículo 01-04-5166 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-089', PROV_OCHOA, 5568.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elong-tango-3-3-8-lpd-01045164',
    nota: 'Basineta Elong Tango 3” 3.8 Lpd · artículo 01-04-5164 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-090', PROV_OCHOA, 5574.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elong-zurich-3-4-8-lpd-01045105',
    nota: 'Basineta Elong Zurich 3” 4.8 Lpd · artículo 01-04-5105 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-091', PROV_OCHOA, 5574.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-milenio-elong-3-8-lpd-01045350',
    nota: 'Basineta Milenio Elong 3.8 Lpd · artículo 01-04-5350 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-092', PROV_OCHOA, 5688.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elong-terra-3-3-8-lpd-01045101',
    nota: 'Basineta Elong Terra 3” 3.8 Lpd · artículo 01-04-5101 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-093', PROV_OCHOA, 5699.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-jazmin-elong-3-4-8-lpd-01045097',
    nota: 'Basineta Jazmin Elong. 3” 4.8 Lpd · artículo 01-04-5097 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-094', PROV_OCHOA, 5846.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-emma-square-01045236',
    nota: 'Basineta Emma Square · artículo 01-04-5236 · ref. G2716001 · marca GALA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-095', PROV_OCHOA, 5938, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elong-goya-3-3-8-lpd-01045169',
    nota: 'Basineta Elong Goya 3” 3.8 Lpd · artículo 01-04-5169 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-096', PROV_OCHOA, 6111.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elong-austral-3-8-l-01045517',
    nota: 'Basineta Elong. Austral 3.8 L · artículo 01-04-5517 · ref. WCAUSTRALBLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-097', PROV_OCHOA, 6768.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-olimpia-red-01045294',
    nota: 'Basineta Olimpia Red. · artículo 01-04-5294 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-098', PROV_OCHOA, 7335.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/taza-de-inodoro-olimpia-01045261',
    nota: 'Taza De Inodoro Olimpia · artículo 01-04-5261 · ref. MARFIL · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-099', PROV_OCHOA, 7537.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/taza-de-inodoro-option-01045361',
    nota: 'Taza De Inodoro Option · artículo 01-04-5361 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-100', PROV_OCHOA, 7759.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/taza-terra-fluxometro-01045260',
    nota: 'Taza Terra Fluxometro · artículo 01-04-5260 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-101', PROV_OCHOA, 7906.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-drakar-16-01045414',
    nota: 'Basineta Drakar 16 · artículo 01-04-5414 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-102', PROV_OCHOA, 8277.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-elongada-sustenta-01045599',
    nota: 'Basineta Elongada Sustenta · artículo 01-04-5599 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-103', PROV_OCHOA, 8732.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-bolmen-16-01045469',
    nota: 'Basineta Bolmen 16 · artículo 01-04-5469 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-104', PROV_OCHOA, 8922.82, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-rodano-16-01045473',
    nota: 'Basineta Rodano 16 · artículo 01-04-5473 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-105', PROV_OCHOA, 9558, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-bolmen-16-01045470',
    nota: 'Basineta Bolmen 16 · artículo 01-04-5470 · ref. MARFIL · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-106', PROV_OCHOA, 15300.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/taza-fluxpared-semiocul-3-5-4-8-6l-nao-01045631',
    nota: 'Taza Fluxpared Semiocul 3.5, 4.8, 6L Nao · artículo 01-04-5631 · ref. TZFNAOP · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-107', PROV_OCHOA, 15716.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/taza-para-flux-nao-c-asiento-01045283',
    nota: 'Taza Para Flux Nao C / Asiento · artículo 01-04-5283 · ref. TZF1S · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-108', PROV_OCHOA, 15899.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-c-asiento-murano-01045331',
    nota: 'Basineta C / Asiento Murano · artículo 01-04-5331 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-109', PROV_OCHOA, 19696.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/basineta-miura-16-con-asiento-01045506',
    nota: 'Basineta Miura 16 Con Asiento · artículo 01-04-5506 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-110', PROV_OCHOA, 4422.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/orinal-duero-c-accesorios-01061649',
    nota: 'Orinal Duero C / Accesorios · artículo 01-06-1649 · ref. 3107HBLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-111', PROV_OCHOA, 5473.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mingitorio-orinal-misisipi-01061367',
    nota: 'Mingitorio Orinal Misisipi · artículo 01-06-1367 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-112', PROV_OCHOA, 5887.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/orinal-volga-c-accesorios-01061648',
    nota: 'Orinal Volga C / Accesorios · artículo 01-06-1648 · ref. 3108BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-113', PROV_OCHOA, 7374.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/orinal-obi-c-sensor-01061647',
    nota: 'Orinal Obi C / Sensor · artículo 01-06-1647 · ref. 3103BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-114', PROV_OCHOA, 8145.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/orinal-victoria-c-sensor-01061646',
    nota: 'Orinal Victoria C / Sensor · artículo 01-06-1646 · ref. 3102BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-115', PROV_OCHOA, 11016.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mingitorio-orinal-terra-iii-01061486',
    nota: 'Mingitorio / Orinal Terra Iii · artículo 01-06-1486 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-24-116', PROV_OCHOA, 21399.06, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/urinario-ferris-01061336',
    nota: 'Urinario Ferris · artículo 01-06-1336 · ref. MG-1BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-001', PROV_OCHOA, 684.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-esquina-bnw209-01061549',
    nota: 'Lavamanos De Esquina Bnw209 · artículo 01-06-1549 · ref. BLANCO · marca TILBY-BAN. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-002', PROV_OCHOA, 1093, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-erie-01061626',
    nota: 'Lavamanos Erie · artículo 01-06-1626 · ref. BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-003', PROV_OCHOA, 1325.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-caprio-01061629',
    nota: 'Lavamanos Caprio · artículo 01-06-1629 · ref. BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-004', PROV_OCHOA, 1381.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-argos-01061622',
    nota: 'Lavamanos Argos · artículo 01-06-1622 · ref. 5619BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-005', PROV_OCHOA, 1527.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-ceramica-junior-01061352',
    nota: 'Lavamanos Cerámica Junior · artículo 01-06-1352 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-006', PROV_OCHOA, 1527.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-junior-01061309',
    nota: 'Lavamanos De Cerámica Junior · artículo 01-06-1309 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-007', PROV_OCHOA, 1582.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-junior-01061311',
    nota: 'Lavamanos De Cerámica Junior · artículo 01-06-1311 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-008', PROV_OCHOA, 1789.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-jazmin-01061512',
    nota: 'Lavamanos De Cerámica Jazmin · artículo 01-06-1512 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-008', PROV_OCHOA, 2158.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-jazmin-01061315',
    nota: 'Lavamanos De Cerámica Jazmin · artículo 01-06-1315 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-009', PROV_OCHOA, 1859.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-jazmin-01061510',
    nota: 'Lavamanos De Cerámica Jazmin · artículo 01-06-1510 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-009', PROV_OCHOA, 1681.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-jazmin-01061313',
    nota: 'Lavamanos De Cerámica Jazmin · artículo 01-06-1313 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-010', PROV_OCHOA, 1879.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-4-lucas-01061671',
    nota: 'Lavamanos 4´´ Lucas · artículo 01-06-1671 · ref. NEGRO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-011', PROV_OCHOA, 2085.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-atenas-36x36-01061595',
    nota: 'Lavamanos Atenas 36X36 · artículo 01-06-1595 · ref. 5206CBLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-012', PROV_OCHOA, 2158.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamano-jazmin-1-h-01061511',
    nota: 'Lavamano Jazmin 1 H · artículo 01-06-1511 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-013', PROV_OCHOA, 2177.81, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-eros-41x41-01061596',
    nota: 'Lavamanos Eros 41X41 · artículo 01-06-1596 · ref. 5002BBLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-014', PROV_OCHOA, 2188.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-c-pedestal-bp518-01061538',
    nota: 'Lavamanos C / Pedestal Bp518. · artículo 01-06-1538 · ref. BLANCO · marca TILBY-BAN. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-015', PROV_OCHOA, 2565.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-01061445',
    nota: 'Lavamanos De Cerámica · artículo 01-06-1445 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-016', PROV_OCHOA, 2658.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-terra-01061515',
    nota: 'Lavamanos De Cerámica Terra · artículo 01-06-1515 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-016', PROV_OCHOA, 2653.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-terra-01061317',
    nota: 'Lavamanos De Cerámica Terra · artículo 01-06-1317 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-017', PROV_OCHOA, 2769.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-jano-red-01061656',
    nota: 'Lavamanos Jano Red. · artículo 01-06-1656 · ref. 5554BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-018', PROV_OCHOA, 2807.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-elpis-61x79-01061610',
    nota: 'Lavamanos Elpis 61X79 · artículo 01-06-1610 · ref. 4001-60BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-019', PROV_OCHOA, 2913.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-zurich-01061530',
    nota: 'Lavamanos De Cerámica Zurich · artículo 01-06-1530 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-019', PROV_OCHOA, 2932.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-zurich-01061322',
    nota: 'Lavamanos De Cerámica Zurich · artículo 01-06-1322 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-020', PROV_OCHOA, 2925.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamano-mono-milenio-01061487',
    nota: 'Lavamano Mono Milenio · artículo 01-06-1487 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-021', PROV_OCHOA, 2960.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamano-sobreponer-ovalin-4-01061492',
    nota: 'Lavamano Sobreponer Ovalin 4\'\' · artículo 01-06-1492 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-022', PROV_OCHOA, 3027.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-terra-01061524',
    nota: 'Lavamanos De Cerámica Terra · artículo 01-06-1524 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-022', PROV_OCHOA, 3026.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-terra-01061320',
    nota: 'Lavamanos De Cerámica Terra · artículo 01-06-1320 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-023', PROV_OCHOA, 3056.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-square-38x38-01061594',
    nota: 'Lavamanos Square 38X38 · artículo 01-06-1594 · ref. 5079CBLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-024', PROV_OCHOA, 3186.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamano-mono-milenio-01061489',
    nota: 'Lavamano Mono Milenio · artículo 01-06-1489 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-025', PROV_OCHOA, 3246.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-label-01061625',
    nota: 'Lavamanos Label · artículo 01-06-1625 · ref. 5271BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-026', PROV_OCHOA, 3253.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamano-sobreponer-redondo-4-01061493',
    nota: 'Lavamano Sobreponer Redondo 4\'\' · artículo 01-06-1493 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-027', PROV_OCHOA, 3261.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamano-sobreponer-redondo-1h-01061517',
    nota: 'Lavamano Sobreponer Redondo 1H · artículo 01-06-1517 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-028', PROV_OCHOA, 3266.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-goya-01061514',
    nota: 'Lavamanos De Cerámica Goya · artículo 01-06-1514 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-028', PROV_OCHOA, 3266.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-goya-01061447',
    nota: 'Lavamanos De Cerámica Goya · artículo 01-06-1447 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-029', PROV_OCHOA, 3272.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamano-sobreponer-ovalin-1h-01061516',
    nota: 'Lavamano Sobreponer Ovalin 1H · artículo 01-06-1516 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-030', PROV_OCHOA, 3411.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-zurich-01061324',
    nota: 'Lavamanos De Cerámica Zurich · artículo 01-06-1324 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-031', PROV_OCHOA, 3460.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-tamayo-01061495',
    nota: 'Lavamanos De Cerámica Tamayo · artículo 01-06-1495 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-032', PROV_OCHOA, 3507.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-balder-cuad-01061654',
    nota: 'Lavamanos Balder Cuad. · artículo 01-06-1654 · ref. 5506BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-033', PROV_OCHOA, 3524.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamano-sobre-cubierta-turin-01061544',
    nota: 'Lavamano Sobre Cubierta Turin · artículo 01-06-1544 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-034', PROV_OCHOA, 3524.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamano-sobrecubierta-niza-01061496',
    nota: 'Lavamano Sobrecubierta Niza · artículo 01-06-1496 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-035', PROV_OCHOA, 3887.52, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-selene-81x46-01061609',
    nota: 'Lavamanos Selene 81X46 · artículo 01-06-1609 · ref. 4001-80BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-036', PROV_OCHOA, 3915.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-de-ceramica-niza-01061497',
    nota: 'Lavamanos De Cerámica Niza · artículo 01-06-1497 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-037', PROV_OCHOA, 4072.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-bragi-red-01061657',
    nota: 'Lavamanos Bragi Red. · artículo 01-06-1657 · ref. 8428MA-10ART.COLOR · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-038', PROV_OCHOA, 4096.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-odin-red-01061653',
    nota: 'Lavamanos Odin Red. · artículo 01-06-1653 · ref. 8428MA-9ART.COLOR · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-039', PROV_OCHOA, 4645.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-sobreponer-sreb-santorini-01061540',
    nota: 'Lavabo Sobreponer Sreb Santorini · artículo 01-06-1540 · ref. BLANCOLVSANTORINI · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-040', PROV_OCHOA, 4837.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-sobreponer-1p-santorini-01061541',
    nota: 'Lavabo Sobreponer 1P Santorini · artículo 01-06-1541 · ref. BLANCOLVSANTORINI1 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-041', PROV_OCHOA, 4880.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-frey-cuad-01061655',
    nota: 'Lavamanos Frey Cuad. · artículo 01-06-1655 · ref. LX-5529BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-042', PROV_OCHOA, 4912.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-artemis-01061616',
    nota: 'Lavamanos Artemis · artículo 01-06-1616 · ref. C004BLANCO/ORO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-043', PROV_OCHOA, 5360.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-tuy-50-blanco-01101323',
    nota: 'Lavamanos Tuy 50 Blanco · artículo 01-10-1323 · ref. 2012000000153 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-044', PROV_OCHOA, 5418.52, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-delos-01061608',
    nota: 'Lavamanos Delos · artículo 01-06-1608 · ref. LX-C036NEGRO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-045', PROV_OCHOA, 5533.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-sobreponer-sreb-moreab-01061542',
    nota: 'Lavabo Sobreponer Sreb Moreab · artículo 01-06-1542 · ref. BLANCOLVMOREAB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-046', PROV_OCHOA, 5578.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-isis-41x41-01061611',
    nota: 'Lavamanos Isis 41X41 · artículo 01-06-1611 · ref. 7024BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-047', PROV_OCHOA, 5627.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-tuy-60-ceramico-01101124',
    nota: 'Lavabo Tuy 60 Ceramico · artículo 01-10-1124 · ref. 2011000000741 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-048', PROV_OCHOA, 5761, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-roubd-mini-01061563',
    nota: 'Lavabo Roubd Mini · artículo 01-06-1563 · ref. BLANCO · marca INNOBATH. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-049', PROV_OCHOA, 5971.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-sobreponer-1p-moreab-01061543',
    nota: 'Lavabo Sobreponer 1P Moreab · artículo 01-06-1543 · ref. BLANCOLVMOREA1B · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-050', PROV_OCHOA, 6135.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-atenea-01061615',
    nota: 'Lavamanos Atenea · artículo 01-06-1615 · ref. C005BLANCO/PLATA · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-051', PROV_OCHOA, 6202.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-sobrecu-elipsis-01061643',
    nota: 'Lavamanos Sobrecu Elipsis · artículo 01-06-1643 · ref. BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-052', PROV_OCHOA, 6280.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-cloe-01061614',
    nota: 'Lavamanos Cloe · artículo 01-06-1614 · ref. C020NEGRO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-053', PROV_OCHOA, 6285.52, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-aure-01061566',
    nota: 'Lavabo Aure · artículo 01-06-1566 · ref. BLANCO · marca INNOBATH. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-054', PROV_OCHOA, 6325.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-grande-bajo-cub-c-reb-01061505',
    nota: 'Lavabo Grande Bajo Cub C / Reb. · artículo 01-06-1505 · ref. LV-LUGANOBLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-055', PROV_OCHOA, 7188.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavatorio-tuy-80-ceramico-01101189',
    nota: 'Lavatorio Tuy 80 Ceramico · artículo 01-10-1189 · ref. 2011000000380 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-056', PROV_OCHOA, 7649.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-clio-01061613',
    nota: 'Lavamanos Clio · artículo 01-06-1613 · ref. C019NEGRO/PLATA · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-057', PROV_OCHOA, 7782.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-cibeles-01061612',
    nota: 'Lavamanos Cibeles · artículo 01-06-1612 · ref. 7023BLANCCALACATTA · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-058', PROV_OCHOA, 8191.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavatorio-marte-85-ceramico-01101295',
    nota: 'Lavatorio Marte 85 Ceramico · artículo 01-10-1295 · ref. 1821500147143 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-059', PROV_OCHOA, 8612.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-fly-45-cm-01101188',
    nota: 'Lavabo Fly 45 Cm · artículo 01-10-1188 · ref. 2011000000670 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-060', PROV_OCHOA, 8893.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-sobrecubierta-marcus-01061335',
    nota: 'Lavamanos Sobrecubierta Marcus · artículo 01-06-1335 · ref. LV-3BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-061', PROV_OCHOA, 8964.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-clap-sobreponer-01061503',
    nota: 'Lavabo Clap Sobreponer · artículo 01-06-1503 · ref. LV-CLAPBLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-062', PROV_OCHOA, 9362.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-de-sobreponer-lucerna-c-r-3p-01061306',
    nota: 'Lavabo De Sobreponer Lucerna C / R 3P · artículo 01-06-1306 · ref. LV-2-3PBLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-063', PROV_OCHOA, 10519.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-trazzo-sobreponer-01061333',
    nota: 'Lavamanos Trazzo Sobreponer · artículo 01-06-1333 · ref. LV-5BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-064', PROV_OCHOA, 10789.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavatorio-go-81x46x17-negro-mate-01101536',
    nota: 'Lavatorio Go 81X46X17 Negro Mate · artículo 01-10-1536 · ref. 20230658 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-065', PROV_OCHOA, 10865.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-trazzo-sobreponer-01061334',
    nota: 'Lavamanos Trazzo Sobreponer · artículo 01-06-1334 · ref. LV-5MMARFIL · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-066', PROV_OCHOA, 11061.07, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-cassini-sobreponer-01061331',
    nota: 'Lavamanos Cassini Sobreponer · artículo 01-06-1331 · ref. LV-4BLANCO · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-067', PROV_OCHOA, 11790.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-cassini-sobreponer-01061332',
    nota: 'Lavamanos Cassini Sobreponer · artículo 01-06-1332 · ref. LV-4MMARFIL · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-068', PROV_OCHOA, 12253.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavatorio-slim-60-ceramico-01101382',
    nota: 'Lavatorio Slim 60 Ceramico · artículo 01-10-1382 · ref. 2018000000111 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-069', PROV_OCHOA, 12545.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-sobreponer-1p-creb-futura-m-01061669',
    nota: 'Lavabo Sobreponer 1P Creb Futura M · artículo 01-06-1669 · ref. LV-FUTURA1M · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-070', PROV_OCHOA, 13554.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavabo-de-sobreponer-lucerna-1p-01061304',
    nota: 'Lavabo De Sobreponer Lucerna 1P · artículo 01-06-1304 · ref. LV-2-1P · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-071', PROV_OCHOA, 15293.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-helmi-01061618',
    nota: 'Lavamanos Helmi · artículo 01-06-1618 · ref. 8003BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-072', PROV_OCHOA, 17608.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-tuy-doble-120-cm-01101207',
    nota: 'Lavamanos Tuy Doble 120 Cm · artículo 01-10-1207 · ref. 2011000000640 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-073', PROV_OCHOA, 17783.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lavamanos-surt-01061617',
    nota: 'Lavamanos Surt · artículo 01-06-1617 · ref. 8009BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-074', PROV_OCHOA, 891.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-magna-01061632',
    nota: 'Pedestal Magna · artículo 01-06-1632 · ref. 3209FBLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-075', PROV_OCHOA, 979.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-vallarta-01061604',
    nota: 'Pedestal Vallarta · artículo 01-06-1604 · ref. BLANCO · marca ITALGRIF. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-076', PROV_OCHOA, 1093, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-erie-01061627',
    nota: 'Pedestal Erie · artículo 01-06-1627 · ref. BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-077', PROV_OCHOA, 1102.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-universal-01061482',
    nota: 'Pedestal Universal · artículo 01-06-1482 · ref. BLANCO · marca TREBOL. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-078', PROV_OCHOA, 1327.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-caprio-01061630',
    nota: 'Pedestal Caprio · artículo 01-06-1630 · ref. BLANCO · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-079', PROV_OCHOA, 1618.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-lucas-01061672',
    nota: 'Pedestal Lucas · artículo 01-06-1672 · ref. NEGRO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-080', PROV_OCHOA, 1778.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-para-lavamanos-goya-01061446',
    nota: 'Pedestal Para Lavamanos Goya · artículo 01-06-1446 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-081', PROV_OCHOA, 1986.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-para-lavamanos-jazmin-01061310',
    nota: 'Pedestal Para Lavamanos Jazmin · artículo 01-06-1310 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-082', PROV_OCHOA, 2014.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-para-lavamanos-terra-01061319',
    nota: 'Pedestal Para Lavamanos Terra · artículo 01-06-1319 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-083', PROV_OCHOA, 2014.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-zurich-01061323',
    nota: 'Pedestal Zurich · artículo 01-06-1323 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-084', PROV_OCHOA, 2016.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-lavamanos-milenio-01061488',
    nota: 'Pedestal Lavamanos Milenio · artículo 01-06-1488 · ref. BLANCO · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-085', PROV_OCHOA, 2276.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-para-lavamanos-goya-01061448',
    nota: 'Pedestal Para Lavamanos Goya · artículo 01-06-1448 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-086', PROV_OCHOA, 2305.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-para-lavamanos-01061316',
    nota: 'Pedestal Para Lavamanos · artículo 01-06-1316 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-086', PROV_OCHOA, 2357.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-para-lavamanos-01061321',
    nota: 'Pedestal Para Lavamanos · artículo 01-06-1321 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-087', PROV_OCHOA, 2376.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-para-lavamanos-zurich-01061325',
    nota: 'Pedestal Para Lavamanos Zurich · artículo 01-06-1325 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-088', PROV_OCHOA, 2382.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pedestal-milenio-01061490',
    nota: 'Pedestal Milenio · artículo 01-06-1490 · ref. MARFIL · marca CATO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-089', PROV_OCHOA, 3334.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pata-volga-30-kit-2-uds-2-5x2-5-negro-01101479',
    nota: 'Pata Volga 30 (Kit 2 Uds. 2.5X2.5 Negro) · artículo 01-10-1479 · ref. 20230435 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-090', PROV_OCHOA, 57.88, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/palometa-p-lavamanos-senc-01060339',
    nota: 'Palometa P / Lavamanos Senc. · artículo 01-06-0339 · ref. PAR · marca P.CIBAO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-091', PROV_OCHOA, 70.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/palometa-para-lavamanos-doble-01060123',
    nota: 'Palometa Para Lavamanos Doble · artículo 01-06-0123 · ref. HG1A017 · marca PROMEDOCA. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-091', PROV_OCHOA, 69.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/palometa-para-lavamanos-doble-01060338',
    nota: 'Palometa Para Lavamanos Doble · artículo 01-06-0338 · ref. DOBLE · marca P.CIBAO. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-092', PROV_OCHOA, 80.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/palometa-sencilla-p-lav-d-metal-01061641',
    nota: 'Palometa Sencilla P / Lav D / Metal · artículo 01-06-1641 · ref. 2494 · marca FLEXIMATIC. ' + SUPUESTO_ITBIS
  });
  c('MAT-25-093', PROV_OCHOA, 255.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/conector-yee-1-01061642',
    nota: 'Conector Yee 1\'\' · artículo 01-06-1642 · ref. 25861" · marca FLEXIMATIC. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-001', PROV_OCHOA, 5433.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-de-b-p-colgar-meridian-othelo-01101008',
    nota: 'Mueble De B. P / Colgar Meridian Othelo · artículo 01-10-1008 · ref. 30X30X20 · marca ALCER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-002', PROV_OCHOA, 8614.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-mini-40-blanco-01101177',
    nota: 'Mueble Mini 40 Blanco · artículo 01-10-1177 · ref. 2015000000387 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-003', PROV_OCHOA, 9059.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-mini-movel-40x21x50-p1-lav-car-01101474',
    nota: 'Mueble Mini Movel 40X21X50 P1+Lav Car · artículo 01-10-1474 · ref. 20230638 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-004', PROV_OCHOA, 14417.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-anidis-susp-60x45x44-carvalho-01101505',
    nota: 'Mueble Anidis Susp. 60X45X44 Carvalho · artículo 01-10-1505 · ref. 20230641 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-005', PROV_OCHOA, 14452.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-eco-reno-iris-blanco-50-01101172',
    nota: 'Mueble Eco Reno / Iris Blanco 50 · artículo 01-10-1172 · ref. 2018000000630 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-006', PROV_OCHOA, 14618.32, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-anidis-60-estepa-01101196',
    nota: 'Mueble Anidis 60 Estepa · artículo 01-10-1196 · ref. 2016000000457 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-007', PROV_OCHOA, 14719.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-anidis-60-blanco-01101126',
    nota: 'Mueble Anidis 60 Blanco · artículo 01-10-1126 · ref. 2016000000456 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-008', PROV_OCHOA, 16099.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-eco-movel-60-blanco-brillo-01101173',
    nota: 'Mueble Eco Movel 60 Blanco Brillo · artículo 01-10-1173 · ref. 2012000000251 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-009', PROV_OCHOA, 17006.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-fit-g2-50-suspend-branco-01101364',
    nota: 'Mueble Fit G2 50 Suspend. Branco · artículo 01-10-1364 · ref. 20200272 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-010', PROV_OCHOA, 17007.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-fit-g2-50-suspend-taiga-01101365',
    nota: 'Mueble Fit G2 50 Suspend. Taiga · artículo 01-10-1365 · ref. 20210382 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-011', PROV_OCHOA, 17013.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-fit-50-susp-carvalho-01101484',
    nota: 'Mueble Fit 50 Susp Carvalho · artículo 01-10-1484 · ref. 50X40X55 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-012', PROV_OCHOA, 17144.98, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-volga-60-p2-susp-roble-hera-01101524',
    nota: 'Mueble Volga 60 P2 Susp. Roble Hera · artículo 01-10-1524 · ref. 20240201 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-013', PROV_OCHOA, 17169.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-fit-g2-50-suspend-hercules-01101363',
    nota: 'Mueble Fit G2 50 Suspend. Hercules · artículo 01-10-1363 · ref. 20200273 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-014', PROV_OCHOA, 17330.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-anidis-80-blanco-01101143',
    nota: 'Mueble Anidis 80 Blanco · artículo 01-10-1143 · ref. 2011000000764/16-458 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-015', PROV_OCHOA, 18240.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-zeus-60-blanco-01101166',
    nota: 'Mueble Zeus 60 Blanco · artículo 01-10-1166 · ref. 2015000000345 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-016', PROV_OCHOA, 19035.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-eco-80-blanco-brillo-01101161',
    nota: 'Mueble Eco 80 Blanco Brillo · artículo 01-10-1161 · ref. 2015000000352/264 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-017', PROV_OCHOA, 19503.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-fit-susp-50x40x55-cinza-mate-per-01101492',
    nota: 'Mueble Fit Susp. 50X40X55 Cinza Mate-Per · artículo 01-10-1492 · ref. 20230632 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-018', PROV_OCHOA, 19517.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-fit-susp-50x40x55-negro-mate-pef-01101493',
    nota: 'Mueble Fit Susp. 50X40X55 Negro Mate Pef · artículo 01-10-1493 · ref. 20230633 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-019', PROV_OCHOA, 19711.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-surf-60-lino-01101130',
    nota: 'Mueble Surf 60 Lino · artículo 01-10-1130 · ref. 2015000000101 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-020', PROV_OCHOA, 19905.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-volga-80-p2-susp-blanco-01101526',
    nota: 'Mueble Volga 80 P2 Susp. Blanco · artículo 01-10-1526 · ref. 20240202 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-021', PROV_OCHOA, 19949.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-volga-80-p2-susp-roble-hera-01101527',
    nota: 'Mueble Volga 80 P2 Susp. Roble Hera · artículo 01-10-1527 · ref. 20240203 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-022', PROV_OCHOA, 20203.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-volga-60-g2-susp-roble-hera-01101529',
    nota: 'Mueble Volga 60 G2 Susp. Roble Hera · artículo 01-10-1529 · ref. 20240205 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-023', PROV_OCHOA, 20322.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-arrabida-2-60x45x81-carvalho-pefc-01101497',
    nota: 'Mueble Arrabida 2 60X45X81 Carvalho Pefc · artículo 01-10-1497 · ref. 20230648 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-024', PROV_OCHOA, 20361.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-volga-60-g2-susp-blanco-01101528',
    nota: 'Mueble Volga 60 G2 Susp. Blanco · artículo 01-10-1528 · ref. 20240204 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-025', PROV_OCHOA, 21156.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-roma-suspend-80-blanco-taiga-01101362',
    nota: 'Mueble Roma Suspend. 80 Blanco / Taiga · artículo 01-10-1362 · ref. 20210384 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-026', PROV_OCHOA, 21190.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-roma-suspend-80-blanco-hercules-01101354',
    nota: 'Mueble Roma Suspend. 80 Blanco / Hercules · artículo 01-10-1354 · ref. 20210383 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-027', PROV_OCHOA, 21711.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-strato-80-wenge-01101132',
    nota: 'Mueble Strato 80 Wenge · artículo 01-10-1132 · ref. 2011000000612 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-028', PROV_OCHOA, 21795.98, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-zeus-80-wengue-01101165',
    nota: 'Mueble Zeus 80 Wengue · artículo 01-10-1165 · ref. 2011000000763 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-029', PROV_OCHOA, 21882.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-zeus-80-blanco-01101164',
    nota: 'Mueble Zeus 80 Blanco · artículo 01-10-1164 · ref. 2011000000762 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-030', PROV_OCHOA, 22110.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-zen-60-g2-hercules-01101389',
    nota: 'Mueble Zen 60 G2 Hercules · artículo 01-10-1389 · ref. 20210744 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-031', PROV_OCHOA, 22157.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-zen-60-g2-blanco-01101388',
    nota: 'Mueble Zen 60 G2 Blanco · artículo 01-10-1388 · ref. 20210743 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-032', PROV_OCHOA, 23215.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-samba-60-lino-01101162',
    nota: 'Mueble Samba 60 Lino · artículo 01-10-1162 · ref. 2015000000110 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-033', PROV_OCHOA, 23218, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-volga-80-g2-susp-roble-hera-01101531',
    nota: 'Mueble Volga 80 G2 Susp. Roble Hera · artículo 01-10-1531 · ref. 20240207 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-034', PROV_OCHOA, 23399.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-samba-play-g3-60-blanco-01101163',
    nota: 'Mueble Samba Play G3 60 Blanco · artículo 01-10-1163 · ref. 2018000000568 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-035', PROV_OCHOA, 23550.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-arrabida-2-80x45x81-carvalho-pefc-01101496',
    nota: 'Mueble Arrabida 2 80X45X81 Carvalho Pefc · artículo 01-10-1496 · ref. 20230652 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-036', PROV_OCHOA, 24460.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-versatil-movel-80-p2g3-branco-01101352',
    nota: 'Mueble Versatil Movel 80 P2G3 Branco · artículo 01-10-1352 · ref. 2012000000164 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-037', PROV_OCHOA, 24472.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-arrabida-2-60x45x81-cinza-mate-01101507',
    nota: 'Mueble Arrabida 2 60X45X81 Cinza Mate · artículo 01-10-1507 · ref. 20230649 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-038', PROV_OCHOA, 25043.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-arrabida-2-60x45x81-blanco-mate-01101499',
    nota: 'Mueble Arrabida 2 60X45X81 Blanco Mate · artículo 01-10-1499 · ref. 20230647 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-039', PROV_OCHOA, 26981.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-jazz-80-blanco-lino-01101170',
    nota: 'Mueble Jazz 80 Blanco Lino · artículo 01-10-1170 · ref. 2015000000118 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-040', PROV_OCHOA, 27541.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-mirage-60-carvallo-01101487',
    nota: 'Mueble Mirage 60 Carvallo · artículo 01-10-1487 · ref. 20230513 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-041', PROV_OCHOA, 27754.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-mirage-movel-g2-60-roble-01101360',
    nota: 'Mueble Mirage Movel G2 60 Roble · artículo 01-10-1360 · ref. 20200144 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-042', PROV_OCHOA, 28527.23, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-arrabida-2-80x45x81-blanco-mate-01101498',
    nota: 'Mueble Arrabida 2 80X45X81 Blanco Mate · artículo 01-10-1498 · ref. 20230651 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-043', PROV_OCHOA, 29740.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-one-movel-g2-suspend-60-taiga-01101356',
    nota: 'Mueble One Movel G2 Suspend. 60 Taiga · artículo 01-10-1356 · ref. 20210385 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-044', PROV_OCHOA, 30823.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-one-movel-g2-suspend-60-hercules-01101357',
    nota: 'Mueble One Movel G2 Suspend. 60 Hercules · artículo 01-10-1357 · ref. 20200235 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-045', PROV_OCHOA, 32918.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-one-movel-g2-suspend-80-taiga-01101358',
    nota: 'Mueble One Movel G2 Suspend. 80 Taiga · artículo 01-10-1358 · ref. 2021086 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-046', PROV_OCHOA, 33698.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-luxor-vegas-60-estepa-fren-blanco-01101200',
    nota: 'Mueble Luxor Vegas 60 Estepa Fren Blanco · artículo 01-10-1200 · ref. 20190266 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-047', PROV_OCHOA, 45479.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-jazz-120-blanco-lino-01101169',
    nota: 'Mueble Jazz 120 Blanco Lino · artículo 01-10-1169 · ref. 2015000000279 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-048', PROV_OCHOA, 45823.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-jota-80-susp-blanco-01101486',
    nota: 'Mueble Jota 80 Susp Blanco · artículo 01-10-1486 · ref. 80X45X55 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-049', PROV_OCHOA, 48148.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mueble-jota-80-susp-carvalho-01101485',
    nota: 'Mueble Jota 80 Susp Carvalho · artículo 01-10-1485 · ref. 80X45X55 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-050', PROV_OCHOA, 725.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-redondo-plastico-01100205',
    nota: 'Botiquin Redondo Plastico · artículo 01-10-0205 · ref. SPC-839-0WTBLANCO · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-051', PROV_OCHOA, 751.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-redondo-plastico-01100202',
    nota: 'Botiquin Redondo Plastico · artículo 01-10-0202 · ref. SPC-839CREMA · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-052', PROV_OCHOA, 840.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-cuadrado-plastico-01100053',
    nota: 'Botiquin Cuadrado Plastico · artículo 01-10-0053 · ref. SPC-486CREMA · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-052', PROV_OCHOA, 831.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-cuadrado-plastico-01100166',
    nota: 'Botiquin Cuadrado Plastico · artículo 01-10-0166 · ref. SPC-486AZUL · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-053', PROV_OCHOA, 944.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-cuadrado-plastico-01101176',
    nota: 'Botiquin Cuadrado Plastico · artículo 01-10-1176 · ref. 486-OWTBEIGE · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-054', PROV_OCHOA, 6543.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-city-40-blanco-01101233',
    nota: 'Botiquin City 40 Blanco · artículo 01-10-1233 · ref. 2012000000195 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-055', PROV_OCHOA, 10320.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-p-bano-led-antifog-50x70-01101250',
    nota: 'Botiquin P / Bano Led Antifog 50X70 · artículo 01-10-1250 · ref. LDS5070100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-055', PROV_OCHOA, 11958.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-p-bano-led-antifog-50x70-01101449',
    nota: 'Botiquin P / Bano Led Antifog 50X70 · artículo 01-10-1449 · ref. DPJG-10A100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-056', PROV_OCHOA, 10820.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-p-bano-led-50-x-70-01101253',
    nota: 'Botiquin P / Bano Led 50 X 70 · artículo 01-10-1253 · ref. LIL5070100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-057', PROV_OCHOA, 13808.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-p-bano-led-63-x-65-01101251',
    nota: 'Botiquin P / Bano Led 63 X 65 · artículo 01-10-1251 · ref. LDS6365100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-058', PROV_OCHOA, 15911.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-p-bano-led-antifog-80x70-01101443',
    nota: 'Botiquin P / Bano Led Antifog 80X70 · artículo 01-10-1443 · ref. DPJG-06A100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-058', PROV_OCHOA, 15239.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-p-bano-led-antifog-80x70-01101446',
    nota: 'Botiquin P / Bano Led Antifog 80X70 · artículo 01-10-1446 · ref. DPJG-08B100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-058', PROV_OCHOA, 15673.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-p-bano-led-antifog-80x70-01101450',
    nota: 'Botiquin P / Bano Led Antifog 80X70 · artículo 01-10-1450 · ref. DPJG-10B100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-058', PROV_OCHOA, 19262.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-p-bano-led-antifog-80x70-01101447',
    nota: 'Botiquin P / Bano Led Antifog 80X70 · artículo 01-10-1447 · ref. DPJG-09A100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-058', PROV_OCHOA, 17068.85, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-p-bano-led-antifog-80x70-01101448',
    nota: 'Botiquin P / Bano Led Antifog 80X70 · artículo 01-10-1448 · ref. DPJG-09B100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-059', PROV_OCHOA, 24256.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/botiquin-p-bano-led-antifog-100x90-01101444',
    nota: 'Botiquin P / Bano Led Antifog 100X90 · artículo 01-10-1444 · ref. DPJG-06B100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-060', PROV_OCHOA, 1210.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-rectangular-01101255',
    nota: 'Espejo P / Bano Rectangular · artículo 01-10-1255 · ref. 50X70 · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-060', PROV_OCHOA, 1880.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-rectangular-01101256',
    nota: 'Espejo P / Bano Rectangular · artículo 01-10-1256 · ref. 60X140 · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-061', PROV_OCHOA, 1210.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-redondo-01101257',
    nota: 'Espejo P / Bano Redondo · artículo 01-10-1257 · ref. D600 · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-062', PROV_OCHOA, 1345.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-decorativo-50x70-01101532',
    nota: 'Espejo Decorativo 50X70 · artículo 01-10-1532 · ref. F-0530186039 · marca INCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-062', PROV_OCHOA, 1319.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-decorativo-50x70-01101533',
    nota: 'Espejo Decorativo 50X70 · artículo 01-10-1533 · ref. N-1129941439 · marca INCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-062', PROV_OCHOA, 1372.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-decorativo-50x70-01101534',
    nota: 'Espejo Decorativo 50X70 · artículo 01-10-1534 · ref. N-0729940539 · marca INCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-063', PROV_OCHOA, 2494.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-sidney-42x66-01101416',
    nota: 'Espejo Sidney 42X66 · artículo 01-10-1416 · ref. 2012000000236 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-064', PROV_OCHOA, 3134.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-rectangular-sidney-01101125',
    nota: 'Espejo Rectangular Sidney · artículo 01-10-1125 · ref. 2011000000766 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-064', PROV_OCHOA, 6676.32, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-rectangular-sidney-01101296',
    nota: 'Espejo Rectangular Sidney · artículo 01-10-1296 · ref. 2018000000302 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-065', PROV_OCHOA, 3599.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-sidney-50-x-90-01101297',
    nota: 'Espejo Sidney 50 X 90 · artículo 01-10-1297 · ref. 2008000000100 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-066', PROV_OCHOA, 4982.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-redondo-60x60-led-antifog-01101442',
    nota: 'Espejo P / Bano Redondo 60X60 Led Antifog · artículo 01-10-1442 · ref. DP360100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-067', PROV_OCHOA, 5083.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-sidney-80x90-01101384',
    nota: 'Espejo Sidney 80X90 · artículo 01-10-1384 · ref. 2008000000101 · marca AML. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-068', PROV_OCHOA, 5126.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-redondo-led-antifog-01101244',
    nota: 'Espejo P / Bano Redondo Led Antifog · artículo 01-10-1244 · ref. LOM6060100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-068', PROV_OCHOA, 4773.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-redondo-led-antifog-01101440',
    nota: 'Espejo P / Bano Redondo Led Antifog · artículo 01-10-1440 · ref. DP321E100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-069', PROV_OCHOA, 5267.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-led-antifog-50-x-70-01101242',
    nota: 'Espejo P / Bano Led Antifog 50 X 70 · artículo 01-10-1242 · ref. LIM5070VR100-24V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-069', PROV_OCHOA, 4270.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-led-antifog-50-x-70-01101247',
    nota: 'Espejo P / Bano Led Antifog 50 X 70 · artículo 01-10-1247 · ref. LTM5070110-240 · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-069', PROV_OCHOA, 8534.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-led-antifog-50-x-70-01101248',
    nota: 'Espejo P / Bano Led Antifog 50 X 70 · artículo 01-10-1248 · ref. LTM5070C110-240 · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-070', PROV_OCHOA, 5267.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-ovalado-led-antifog-01101243',
    nota: 'Espejo P / Bano Ovalado Led Antifog · artículo 01-10-1243 · ref. LOM5070EL100-24V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-071', PROV_OCHOA, 6121.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-led-antifog-chrome-01101550',
    nota: 'Espejo Led Antifog Chrome · artículo 01-10-1550 · ref. 50X80DP342 · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-072', PROV_OCHOA, 7403.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-led-antifog-60x100-01101451',
    nota: 'Espejo P / Bano Led Antifog 60X100 · artículo 01-10-1451 · ref. DP343100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-073', PROV_OCHOA, 8275.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-led-antifog-120x60-01101241',
    nota: 'Espejo P / Bano Led Antifog 120X60 · artículo 01-10-1241 · ref. BRM12060RL100-24V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-073', PROV_OCHOA, 7811.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-led-antifog-120x60-01101240',
    nota: 'Espejo P / Bano Led Antifog 120X60 · artículo 01-10-1240 · ref. BRM12060HL100-24V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-074', PROV_OCHOA, 10672.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-con-aumento-a-2-vistas-cromo-01100862',
    nota: 'Espejo Con Aumento A 2 Vistas Cromo · artículo 01-10-0862 · ref. ES-001 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-075', PROV_OCHOA, 14235.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-led-antifog-60-x-140-01101246',
    nota: 'Espejo P / Bano Led Antifog 60 X 140 · artículo 01-10-1246 · ref. LRM14060C100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-26-075', PROV_OCHOA, 8291.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/espejo-p-bano-led-antifog-60-x-140-01101245',
    nota: 'Espejo P / Bano Led Antifog 60 X 140 · artículo 01-10-1245 · ref. LRM14060100-240V · marca GTSHOWER. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-001', PROV_OCHOA, 1176.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-de-seguridad-16-01112806',
    nota: 'Barra De Seguridad 16\'\' · artículo 01-11-2806 · ref. GB016C · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-002', PROV_OCHOA, 1416.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-de-seguridad-curva-145-01112808',
    nota: 'Barra De Seguridad Curva 145 · artículo 01-11-2808 · ref. GB0145QC · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-003', PROV_OCHOA, 1522.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-de-seguridad-20-01112807',
    nota: 'Barra De Seguridad 20\'\' · artículo 01-11-2807 · ref. GB020C · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-004', PROV_OCHOA, 3007.09, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-seguridad-recta-305-mm-satin-01112118',
    nota: 'Barra Seguridad Recta 305 Mm Satin · artículo 01-11-2118 · ref. B-305-S · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-005', PROV_OCHOA, 3022.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-seguridad-recta-01112140',
    nota: 'Barra Seguridad Recta · artículo 01-11-2140 · ref. B-470-S · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-006', PROV_OCHOA, 3271.81, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-de-seguridad-recta-70-cm-01112640',
    nota: 'Barra De Seguridad Recta 70 Cm · artículo 01-11-2640 · ref. B-700-S · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-007', PROV_OCHOA, 3297.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-de-seguridad-recta-61-cm-01112641',
    nota: 'Barra De Seguridad Recta 61 Cm · artículo 01-11-2641 · ref. B-610-S · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-008', PROV_OCHOA, 6226.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-seguridad-recta-90cm-01112628',
    nota: 'Barra Seguridad Recta 90Cm · artículo 01-11-2628 · ref. B-900-S · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-009', PROV_OCHOA, 7495.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/agarradera-con-jabonera-clasica-01112778',
    nota: 'Agarradera Con Jabonera Clasica · artículo 01-11-2778 · ref. 158 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-010', PROV_OCHOA, 421.81, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-anilla-blister-01100352',
    nota: 'Toallero Anilla Blister · artículo 01-10-0352 · ref. 22012-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-011', PROV_OCHOA, 698.45, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-anilla-milano-blister-01101309',
    nota: 'Toallero Anilla Milano Blister · artículo 01-10-1309 · ref. 86411-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-012', PROV_OCHOA, 726.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-blister-01100353',
    nota: 'Toallero Barra Blister · artículo 01-10-0353 · ref. 22013-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-013', PROV_OCHOA, 775.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-anilla-lugano-blister-01101306',
    nota: 'Toallero Anilla Lugano Blister · artículo 01-10-1306 · ref. 7511-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-014', PROV_OCHOA, 938.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-tipo-anilla-verona-01101372',
    nota: 'Toallero Tipo Anilla Verona · artículo 01-10-1372 · ref. TB62211-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-015', PROV_OCHOA, 1155.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-lugano-blister-01101304',
    nota: 'Toallero Barra Lugano Blister · artículo 01-10-1304 · ref. 7501-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-016', PROV_OCHOA, 1243.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-milano-blister-01101307',
    nota: 'Toallero Barra Milano Blister · artículo 01-10-1307 · ref. 86401-4 · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-017', PROV_OCHOA, 1689.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-argolla-clasica-c-01111491',
    nota: 'Toallero Argolla Clasica C · artículo 01-11-1491 · ref. 109C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-018', PROV_OCHOA, 1791.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-argolla-clasica-ii-cr-01112560',
    nota: 'Toallero Argolla Clasica Ii Cr · artículo 01-11-2560 · ref. 209 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-019', PROV_OCHOA, 2174.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-sencillo-acess-blanco-01112843',
    nota: 'Toallero Sencillo Acess Blanco · artículo 01-11-2843 · ref. ACC-109-B · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-020', PROV_OCHOA, 2231.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-de-manos-deco-01112770',
    nota: 'Toallero De Manos Deco · artículo 01-11-2770 · ref. DC-09 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-021', PROV_OCHOA, 2306.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-sencillo-piazza-cromo-01112836',
    nota: 'Toallero Sencillo Piazza Cromo · artículo 01-11-2836 · ref. PIA-109 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-022', PROV_OCHOA, 2438.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-argolla-spacio-01112715',
    nota: 'Toallero Argolla Spacio · artículo 01-11-2715 · ref. SP-09 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-023', PROV_OCHOA, 2835.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-sencillo-maxima-cr-01112803',
    nota: 'Toallero Sencillo Maxima Cr · artículo 01-11-2803 · ref. 20109 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-024', PROV_OCHOA, 2959.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-de-barra-piazza-cromo-01112835',
    nota: 'Toallero De Barra Piazza Cromo · artículo 01-11-2835 · ref. PIA-105 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-025', PROV_OCHOA, 3075.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-de-manos-explora-01112685',
    nota: 'Toallero De Manos Explora · artículo 01-11-2685 · ref. HOT-109-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-026', PROV_OCHOA, 3304.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-institucional-01112801',
    nota: 'Toallero Institucional · artículo 01-11-2801 · ref. 7516-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-027', PROV_OCHOA, 3309.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-de-barra-deco-01112767',
    nota: 'Toallero De Barra Deco · artículo 01-11-2767 · ref. DC-05 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-028', PROV_OCHOA, 3399.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-senc-acces-rose-gold-01112853',
    nota: 'Toallero Senc Acces Rose Gold · artículo 01-11-2853 · ref. ACC109-AU · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-029', PROV_OCHOA, 3504.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-clasica-c-01111487',
    nota: 'Toallero Barra Clasica C · artículo 01-11-1487 · ref. 105 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-030', PROV_OCHOA, 3657.82, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-acess-blanco-01112844',
    nota: 'Toallero Barra Acess Blanco · artículo 01-11-2844 · ref. ACC-105-B · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-031', PROV_OCHOA, 3658.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-spacio-01112710',
    nota: 'Toallero Barra Spacio · artículo 01-11-2710 · ref. SP-05 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-032', PROV_OCHOA, 4384.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-sencillo-premier-eb-01112842',
    nota: 'Toallero Sencillo Premier Eb · artículo 01-11-2842 · ref. 15109-EB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-033', PROV_OCHOA, 4390.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-integra-b-01112865',
    nota: 'Toallero Barra Integra B · artículo 01-11-2865 · ref. IN-05-B · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-034', PROV_OCHOA, 4624.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-explora-01112687',
    nota: 'Toallero Barra Explora · artículo 01-11-2687 · ref. HOT-105-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-035', PROV_OCHOA, 5671.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-premier-eb-cr-01112811',
    nota: 'Toallero Barra Premier Eb / Cr · artículo 01-11-2811 · ref. 15105-EB/CR · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-036', PROV_OCHOA, 5682.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-de-barra-vertika-01112669',
    nota: 'Toallero De Barra Vertika · artículo 01-11-2669 · ref. 16105-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-037', PROV_OCHOA, 5697.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-sencillo-piura-cr-01112874',
    nota: 'Toallero Sencillo Piura Cr · artículo 01-11-2874 · ref. PIU-09 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-038', PROV_OCHOA, 7412.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-toallero-mult-clasica-ii-01112561',
    nota: 'Porta Toallero Mult. Clasica Ii · artículo 01-11-2561 · ref. 210 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-039', PROV_OCHOA, 8056.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-premier-eb-01112838',
    nota: 'Toallero Barra Premier Eb · artículo 01-11-2838 · ref. 15105-EB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-040', PROV_OCHOA, 9214.23, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toallero-barra-piura-cr-01112872',
    nota: 'Toallero Barra Piura Cr · artículo 01-11-2872 · ref. PIU-05 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-041', PROV_OCHOA, 9286.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portatoallas-multiple-clasica-124-cr-01112183',
    nota: 'Portatoallas Multiple Clasica 124 Cr · artículo 01-11-2183 · ref. 124 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-042', PROV_OCHOA, 67.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/papelera-d-superficie-01110300',
    nota: 'Papelera D / Superficie · artículo 01-11-0300 · ref. SPC-452 · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-042', PROV_OCHOA, 188.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/papelera-de-superficie-01112735',
    nota: 'Papelera De Superficie · artículo 01-11-2735 · ref. 15235 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-043', PROV_OCHOA, 453, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/papelera-blister-01100351',
    nota: 'Papelera Blister · artículo 01-10-0351 · ref. 22011-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-044', PROV_OCHOA, 698.45, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-milano-blister-01101308',
    nota: 'Portapapel Milano Blister · artículo 01-10-1308 · ref. 86410-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-045', PROV_OCHOA, 706.06, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/papelera-lugano-blister-01101305',
    nota: 'Papelera Lugano Blister · artículo 01-10-1305 · ref. 7510-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-046', PROV_OCHOA, 937.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-verona-01101337',
    nota: 'Porta Papel Verona · artículo 01-10-1337 · ref. TB62210A-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-046', PROV_OCHOA, 1158.81, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-verona-01101338',
    nota: 'Porta Papel Verona · artículo 01-10-1338 · ref. TB62210B-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-047', PROV_OCHOA, 1745.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-sencillo-deco-01112766',
    nota: 'Porta Papel Sencillo Deco · artículo 01-11-2766 · ref. DC-04 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-048', PROV_OCHOA, 1831.88, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-piazza-cromo-01112833',
    nota: 'Porta Papel Piazza Cromo · artículo 01-11-2833 · ref. PIA-117 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-049', PROV_OCHOA, 1839.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-antiqua-cl-01111558',
    nota: 'Portapapel Antiqua Cl · artículo 01-11-1558 · ref. 4104CL · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-050', PROV_OCHOA, 1897.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-spacio-01112711',
    nota: 'Porta Papel Spacio · artículo 01-11-2711 · ref. SP-04 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-051', PROV_OCHOA, 2085.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-piazza-acab-eb-01112846',
    nota: 'Porta Papel Piazza Acab. Eb. · artículo 01-11-2846 · ref. PIA-117-EB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-052', PROV_OCHOA, 2250.78, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-integra-b-01112864',
    nota: 'Portapapel Integra B · artículo 01-11-2864 · ref. IN-04-B · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-053', PROV_OCHOA, 2372.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-clasica-c-01111494',
    nota: 'Portapapel Clasica C · artículo 01-11-1494 · ref. 117 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-054', PROV_OCHOA, 2403.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-elegance-s-l-01112588',
    nota: 'Portapapel Elegance S L · artículo 01-11-2588 · ref. 8104-S/L · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-055', PROV_OCHOA, 2468.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-c-cubierta-elegance-sl-01112444',
    nota: 'Portapapel C / Cubierta Elegance Sl · artículo 01-11-2444 · ref. 8114-S/L · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-056', PROV_OCHOA, 2605.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-sencillo-maxima-01112804',
    nota: 'Porta Papel Sencillo Maxima · artículo 01-11-2804 · ref. 20117 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-057', PROV_OCHOA, 2763.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-sencillo-clasica-ii-01112562',
    nota: 'Porta Papel Sencillo Clasica Ii · artículo 01-11-2562 · ref. 217 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-058', PROV_OCHOA, 2979.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-sencillo-explora-01112688',
    nota: 'Porta Papel Sencillo Explora · artículo 01-11-2688 · ref. HOT-117-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-059', PROV_OCHOA, 2984.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-sencillo-premier-eb-cr-01112810',
    nota: 'Portapapel Sencillo Premier Eb / Cr · artículo 01-11-2810 · ref. 15104-EB/CR · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-060', PROV_OCHOA, 3099.32, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-vertical-01112771',
    nota: 'Porta Papel Vertical · artículo 01-11-2771 · ref. 34 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-061', PROV_OCHOA, 3657.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-sencillo-antirobo-clasica-ii-01112692',
    nota: 'Portapapel Sencillo Antirobo Clasica Ii · artículo 01-11-2692 · ref. 215 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-062', PROV_OCHOA, 3966.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-papel-sencilla-vertika-01112668',
    nota: 'Porta Papel Sencilla Vertika · artículo 01-11-2668 · ref. 16104-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-063', PROV_OCHOA, 4108.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-con-repisa-p-celular-cr-01112876',
    nota: 'Portapapel Con Repisa P / Celular Cr · artículo 01-11-2876 · ref. 17 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-064', PROV_OCHOA, 4148.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-piura-cr-01112875',
    nota: 'Portapapel Piura Cr · artículo 01-11-2875 · ref. PIU-17 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-065', PROV_OCHOA, 4440.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portapapel-premier-eb-01112839',
    nota: 'Portapapel Premier Eb · artículo 01-11-2839 · ref. 15104-EB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-066', PROV_OCHOA, 17.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cepillera-01110074',
    nota: 'Cepillera · artículo 01-11-0074 · ref. SPC-463NIQUELADO · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-067', PROV_OCHOA, 142.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cepillera-niquelada-01112736',
    nota: 'Cepillera Niquelada · artículo 01-11-2736 · ref. 15206 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-068', PROV_OCHOA, 401.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-cepillo-blister-01100354',
    nota: 'Porta Cepillo Blister · artículo 01-10-0354 · ref. 22014-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-069', PROV_OCHOA, 1564.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portacepillos-access-cr-01112817',
    nota: 'Portacepillos Access Cr · artículo 01-11-2817 · ref. ACC-107 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-070', PROV_OCHOA, 1647.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/porta-cepillo-explora-01112684',
    nota: 'Porta Cepillo Explora · artículo 01-11-2684 · ref. HOT-107-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-071', PROV_OCHOA, 1778.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cepillero-clasica-ii-cromo-01112558',
    nota: 'Cepillero Clasica Ii Cromo · artículo 01-11-2558 · ref. 207 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-072', PROV_OCHOA, 1877.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cepillero-deco-01112779',
    nota: 'Cepillero Deco · artículo 01-11-2779 · ref. DC-07 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-073', PROV_OCHOA, 2816.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portacepillo-acces-eb-01112859',
    nota: 'Portacepillo Acces Eb · artículo 01-11-2859 · ref. ACC107-EB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-074', PROV_OCHOA, 3660.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/portacepillos-premier-eb-01112841',
    nota: 'Portacepillos Premier Eb · artículo 01-11-2841 · ref. 15107-EB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-075', PROV_OCHOA, 53.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-niq-p-superficie-01110237',
    nota: 'Jabonera Niq. P / Superficie · artículo 01-11-0237 · ref. SPC-461/SW-4549 · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-076', PROV_OCHOA, 144.23, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-cristal-01101345',
    nota: 'Jabonera Cristal · artículo 01-10-1345 · ref. SPP-DISHSQ · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-077', PROV_OCHOA, 156.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-niquelada-01112737',
    nota: 'Jabonera Niquelada · artículo 01-11-2737 · ref. 15201 · marca EZ-FLO/USA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-078', PROV_OCHOA, 344.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-blister-01100355',
    nota: 'Jabonera Blister · artículo 01-10-0355 · ref. 22015-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-079', PROV_OCHOA, 784.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-institucional-01112809',
    nota: 'Jabonera Institucional · artículo 01-11-2809 · ref. 7509-A · marca TILBY-INST. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-080', PROV_OCHOA, 1690.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-clasica-semiempotrar-01111489',
    nota: 'Jabonera Clásica Semiempotrar · artículo 01-11-1489 · ref. 108 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-081', PROV_OCHOA, 1778.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-clasica-ii-cromo-01112559',
    nota: 'Jabonera Clasica Ii Cromo · artículo 01-11-2559 · ref. 208 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-082', PROV_OCHOA, 2136.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-deco-01112769',
    nota: 'Jabonera Deco · artículo 01-11-2769 · ref. DC-08 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-083', PROV_OCHOA, 2375.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-spacio-01112714',
    nota: 'Jabonera Spacio · artículo 01-11-2714 · ref. SP-08 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-084', PROV_OCHOA, 2553.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-sencilla-met-nuva-s-01112423',
    nota: 'Jabonera Sencilla Met. Nuva S. · artículo 01-11-2423 · ref. 9128S · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-085', PROV_OCHOA, 3117.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-senc-metalica-nuva-cr-01112341',
    nota: 'Jabonera Senc. Metalica Nuva Cr. · artículo 01-11-2341 · ref. 9128 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-086', PROV_OCHOA, 3307.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-access-eb-01112848',
    nota: 'Jabonera Access Eb · artículo 01-11-2848 · ref. ACC-108-EB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-087', PROV_OCHOA, 3309.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-acces-rose-gold-01112852',
    nota: 'Jabonera Acces Rose Gold · artículo 01-11-2852 · ref. ACC108-AU · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-088', PROV_OCHOA, 3357.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-sencilla-spira-cromo-01112763',
    nota: 'Jabonera Sencilla Spira Cromo · artículo 01-11-2763 · ref. 18108CR · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-089', PROV_OCHOA, 3557.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-premier-eb-01112845',
    nota: 'Jabonera Premier Eb · artículo 01-11-2845 · ref. 15108-EB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-090', PROV_OCHOA, 3742.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-vertika-01112667',
    nota: 'Jabonera Vertika · artículo 01-11-2667 · ref. 16108-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-091', PROV_OCHOA, 4472.06, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/dispensador-de-toalla-papel-gm-ai-01112869',
    nota: 'Dispensador De Toalla Papel Gm Ai · artículo 01-11-2869 · ref. MB-2512 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-092', PROV_OCHOA, 5152.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jabonera-rectangular-rejilla-01112689',
    nota: 'Jabonera Rectangular Rejilla · artículo 01-11-2689 · ref. REJ-01-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-093', PROV_OCHOA, 14903.09, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/dispensador-de-jabon-cumberland-01112824',
    nota: 'Dispensador De Jabon Cumberland · artículo 01-11-2824 · ref. Z6956-SD · marca ZURN. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-094', PROV_OCHOA, 15547.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/dosificador-jabon-espuma-elec-bat-01112821',
    nota: 'Dosificador Jabon Espuma Elec Bat · artículo 01-11-2821 · ref. MB1101 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-095', PROV_OCHOA, 16368.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/secador-d-manos-con-boton-acc-01112568',
    nota: 'Secador D / Manos Con Boton Acc · artículo 01-11-2568 · ref. MB-1011 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-096', PROV_OCHOA, 18390.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/secador-de-mano-c-sensor-alumin-negro-01112828',
    nota: 'Secador De Mano C / Sensor Alumin Negro · artículo 01-11-2828 · ref. Q-162A2 · marca WORLD DRYER. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-097', PROV_OCHOA, 27487.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/secador-de-manos-turbo-01112748',
    nota: 'Secador De Manos Turbo · artículo 01-11-2748 · ref. MB-1012 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-098', PROV_OCHOA, 32765.78, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/secador-manos-c-sensor-turbo-elec-ace-i-01112773',
    nota: 'Secador Manos C / Sensor Turbo Elec. Ace.I · artículo 01-11-2773 · ref. MB-1012AI · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-099', PROV_OCHOA, 63455.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/secador-de-mano-automatico-plateado-abs-01112830',
    nota: 'Secador De Mano Automatico Plateado Abs · artículo 01-11-2830 · ref. V-649A · marca WORLD DRYER. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-100', PROV_OCHOA, 150, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-hotel-01112372',
    nota: 'Gancho Hotel · artículo 01-11-2372 · ref. 815441001 · marca ROCA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-101', PROV_OCHOA, 955.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-sencillo-deco-01112768',
    nota: 'Gancho Sencillo Deco · artículo 01-11-2768 · ref. DC-06 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-102', PROV_OCHOA, 978.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-sencillo-piazza-cromo-01112834',
    nota: 'Gancho Sencillo Piazza Cromo · artículo 01-11-2834 · ref. PIA-106 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-103', PROV_OCHOA, 1023.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-sencillo-spacio-01112712',
    nota: 'Gancho Sencillo Spacio · artículo 01-11-2712 · ref. SP-06 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-104', PROV_OCHOA, 1090.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-sencillo-maxima-01112805',
    nota: 'Gancho Sencillo Maxima · artículo 01-11-2805 · ref. 20106 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-105', PROV_OCHOA, 1101.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-sencillo-piazza-eb-01112847',
    nota: 'Gancho Sencillo Piazza Eb · artículo 01-11-2847 · ref. PIA-106-EB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-106', PROV_OCHOA, 1609.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-sencillo-magna-dx-cr-01112755',
    nota: 'Gancho Sencillo Magna Dx Cr · artículo 01-11-2755 · ref. 19106CR · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-107', PROV_OCHOA, 1730.32, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-sencillo-access-cr-01112816',
    nota: 'Gancho Sencillo Access Cr · artículo 01-11-2816 · ref. ACC-106 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-108', PROV_OCHOA, 1779.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-doble-kubica-01112673',
    nota: 'Gancho Doble Kubica · artículo 01-11-2673 · ref. 14106-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-109', PROV_OCHOA, 1812.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-sencillo-explora-01112683',
    nota: 'Gancho Sencillo Explora · artículo 01-11-2683 · ref. HOT-106-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-110', PROV_OCHOA, 1960.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gancho-sencillo-premier-eb-01112840',
    nota: 'Gancho Sencillo Premier Eb · artículo 01-11-2840 · ref. 15106-EB · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-111', PROV_OCHOA, 14568.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/repisa-semicircular-doble-rejilla-01112691',
    nota: 'Repisa Semicircular Doble Rejilla · artículo 01-11-2691 · ref. REJ-03-C · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-112', PROV_OCHOA, 2082.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tendedero-retractil-clasica-01111517',
    nota: 'Tendedero Retractil Clasica · artículo 01-11-1517 · ref. 122 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-113', PROV_OCHOA, 345.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorio-p-bano-jgo-01110270',
    nota: 'Accesorio P / Bano Jgo · artículo 01-11-0270 · ref. SPC-549-P05 · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-114', PROV_OCHOA, 940.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorio-p-bano-jgo-5-pieza-01112799',
    nota: 'Accesorio P / Bano Jgo (5 Pieza) · artículo 01-11-2799 · ref. 12966 · marca EZ-FLO/EASTMAN. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-115', PROV_OCHOA, 1081.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-3pzas-burdeos-01100350',
    nota: 'Kit Acc. Bano 3Pzas.Burdeos · artículo 01-10-0350 · ref. 601/3-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-116', PROV_OCHOA, 1342.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-01101368',
    nota: 'Kit Acc. Bano 6Pzas. · artículo 01-10-1368 · ref. 73700 · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-117', PROV_OCHOA, 1598.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-burdeos-01100275',
    nota: 'Kit Acc. Bano 6Pzas.Burdeos · artículo 01-10-0275 · ref. 601/6-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-118', PROV_OCHOA, 1605.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-prem-4pzas-01101303',
    nota: 'Kit Accesorios P / Bano Prem 4Pzas · artículo 01-10-1303 · ref. IB904CR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-119', PROV_OCHOA, 1638.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6-pzas-cuenca-01100947',
    nota: 'Kit Acc. Bano 6 Pzas Cuenca · artículo 01-10-0947 · ref. 1300/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-120', PROV_OCHOA, 1673.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-acce-p-bano-3-pzas-brushed-nickel-01101379',
    nota: 'Kit De Acce P / Baño 3 Pzas Brushed Nickel · artículo 01-10-1379 · ref. IB-3M-303BN · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-121', PROV_OCHOA, 1673.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-p-bano-3-piezas-negro-01101378',
    nota: 'Kit De Accesorios P / Baño 3 Piezas Negro · artículo 01-10-1378 · ref. IB-3M-303BK · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-122', PROV_OCHOA, 1709.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-p-indoro-d-flush-01045589',
    nota: 'Kit P / Indoro D / Flush · artículo 01-04-5589 · ref. 4451 · marca FLEXIMATIC. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-123', PROV_OCHOA, 1773, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-d-instalacion-p-inodoro-01045375',
    nota: 'Kit D / Instalacion P / Inodoro · artículo 01-04-5375 · ref. 400AK · marca FLUIDMASTERINC. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-124', PROV_OCHOA, 1798.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-para-bano-huelva-01100057',
    nota: 'Accesorios Para Baño Huelva · artículo 01-10-0057 · ref. 1801/6-ASCROMO/MATE · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-125', PROV_OCHOA, 1813.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-acceso-p-bano-4-pzas-brush-nickel-01101381',
    nota: 'Kit De Acceso P / Baño 4 Pzas Brush Nickel · artículo 01-10-1381 · ref. IB-3M-404BN · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-126', PROV_OCHOA, 1839.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorio-6-pzas-vigo-01100693',
    nota: 'Kit Accesorio 6 Pzas. Vigo · artículo 01-10-0693 · ref. 2200/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-127', PROV_OCHOA, 1876.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6-pzas-granada-01100948',
    nota: 'Kit Acc. Bano 6 Pzas Granada · artículo 01-10-0948 · ref. 2700-6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-128', PROV_OCHOA, 1980.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-para-banos-01100949',
    nota: 'Kit De Accesorios Para Baños · artículo 01-10-0949 · ref. 17700-6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-128', PROV_OCHOA, 3572.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-para-banos-01101119',
    nota: 'Kit De Accesorios Para Baños · artículo 01-10-1119 · ref. 7500/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-128', PROV_OCHOA, 538.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-para-banos-01101121',
    nota: 'Kit De Accesorios Para Baños · artículo 01-10-1121 · ref. 33300/3-ABS · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-128', PROV_OCHOA, 349.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-para-banos-01101122',
    nota: 'Kit De Accesorios Para Baños · artículo 01-10-1122 · ref. 32900/3-ABS · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-129', PROV_OCHOA, 1984.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-para-bano-burdeos-01100172',
    nota: 'Accesorios Para Baño Burdeos · artículo 01-10-0172 · ref. 601/6-AGCROMO/ORO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-130', PROV_OCHOA, 2072.07, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-de-bano-cali-6-piezas-cro-01101548',
    nota: 'Kit Accesorios De Baño Cali 6 Piezas Cro · artículo 01-10-1548 · ref. TB57200/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-131', PROV_OCHOA, 2083.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-quito-cr-01101214',
    nota: 'Kit Accesorios P / Bano Quito Cr · artículo 01-10-1214 · ref. TBF5100/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-132', PROV_OCHOA, 2297.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-para-banos-01100171',
    nota: 'Kit De Accesorios Para Baños · artículo 01-10-0171 · ref. 1801/6-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-133', PROV_OCHOA, 2327.23, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pz-cromo-01101539',
    nota: 'Kit Acc. Baño 6Pz Cromo · artículo 01-10-1539 · ref. 19100-CR · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-134', PROV_OCHOA, 2407.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pz-matte-black-01101540',
    nota: 'Kit Acc. Baño 6Pz Matte Black · artículo 01-10-1540 · ref. 19100-BM · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-135', PROV_OCHOA, 2638.09, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-livorno-cr-01101216',
    nota: 'Kit Accesorios P / Bano Livorno Cr · artículo 01-10-1216 · ref. TB8900/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-136', PROV_OCHOA, 2920.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-milano-cr-01101215',
    nota: 'Kit Accesorios P / Bano Milano Cr · artículo 01-10-1215 · ref. TB8600/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-137', PROV_OCHOA, 2922.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-amalfi-cromo-01101523',
    nota: 'Kit Acc. Bano 6Pzas. Amalfi Cromo · artículo 01-10-1523 · ref. TAB54/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-138', PROV_OCHOA, 2939.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-dublin-cr-01101218',
    nota: 'Kit Accesorios P / Bano Dublin Cr · artículo 01-10-1218 · ref. TB7100/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-139', PROV_OCHOA, 3064.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-p-bano-4-pzas-negro-01101380',
    nota: 'Kit De Accesorios P / Baño 4 Pzas Negro · artículo 01-10-1380 · ref. IB-3M-404BK · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-140', PROV_OCHOA, 3070.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-valencia-01101551',
    nota: 'Kit Acc. Bano 6Pzas. Valencia · artículo 01-10-1551 · ref. TB71100-BR · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-141', PROV_OCHOA, 3143.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-6-pzas-accesorio-bano-luxury-sat-01100671',
    nota: 'Kit 6 Pzas. Accesorio Bano Luxury Sat · artículo 01-10-0671 · ref. IB806BR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-142', PROV_OCHOA, 3187.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-lazio-cromo-01101522',
    nota: 'Kit Acc. Bano 6Pzas. Lazio Cromo · artículo 01-10-1522 · ref. TAB53/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-143', PROV_OCHOA, 3266.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pz-brush-golden-01101541',
    nota: 'Kit Acc. Baño 6Pz Brush Golden · artículo 01-10-1541 · ref. 19100-BG · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-144', PROV_OCHOA, 3318.89, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-dubai-gold-matt-01101374',
    nota: 'Kit Acc. Bano 6Pzas. Dubai Gold Matt · artículo 01-10-1374 · ref. TB81900/6-MG · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-145', PROV_OCHOA, 3360.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-6-pzas-accesorio-bano-luxury-cromo-01100670',
    nota: 'Kit 6 Pzas. Accesorio Bano Luxury Cromo · artículo 01-10-0670 · ref. IB806CR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-146', PROV_OCHOA, 3453.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-bergamo-01101327',
    nota: 'Kit Acc. Bano 6Pzas.Bergamo · artículo 01-10-1327 · ref. TB17A/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-147', PROV_OCHOA, 3470.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-bergamo-ss-bn-01101220',
    nota: 'Kit Accesorios P / Bano Bergamo Ss-Bn · artículo 01-10-1220 · ref. TB17A-SS/6-BN · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-148', PROV_OCHOA, 3610.88, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-verona-01101342',
    nota: 'Kit Acc. Bano 6Pzas.Verona · artículo 01-10-1342 · ref. TB622001/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-149', PROV_OCHOA, 3628.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-dubai-brush-nickel-01101373',
    nota: 'Kit Acc. Bano 6Pzas. Dubai Brush Nickel · artículo 01-10-1373 · ref. TB81900/6-BN · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-150', PROV_OCHOA, 3629.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-banos-6-pzas-devon-01101481',
    nota: 'Kit Acc. Banos 6 Pzas. Devon · artículo 01-10-1481 · ref. TB22601/6-BL · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-151', PROV_OCHOA, 3966.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-livorno-brush-nick-01101221',
    nota: 'Kit Accesorios P / Bano Livorno Brush Nick · artículo 01-10-1221 · ref. TB8900/6-BN · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-152', PROV_OCHOA, 3967.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-lugano-01101318',
    nota: 'Kit Acc. Bano 6Pzas. Lugano · artículo 01-10-1318 · ref. TB7500/6-BL · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-153', PROV_OCHOA, 4100.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-banos-6-pzas-malaga-01100661',
    nota: 'Kit Acc. Banos 6 Pzas. Malaga · artículo 01-10-0661 · ref. 16100/6-ACER · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-154', PROV_OCHOA, 4178.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pz-gold-01101543',
    nota: 'Kit Acc Bano 6Pz Gold · artículo 01-10-1543 · ref. IB-706-GOLD · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-155', PROV_OCHOA, 4228.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-prem-6pzas-01101302',
    nota: 'Kit Accesorios P / Bano Prem 6Pzas · artículo 01-10-1302 · ref. IB906CR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-156', PROV_OCHOA, 4323.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acces-bano-livorno-6pzas-oil-brush-01101310',
    nota: 'Kit Acces.Bano Livorno 6Pzas Oil Brush · artículo 01-10-1310 · ref. TB8900/6-ORB · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-157', PROV_OCHOA, 4372.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-ajaccio-01101552',
    nota: 'Kit Acc. Bano 6Pzas. Ajaccio · artículo 01-10-1552 · ref. TB25100-BR · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-158', PROV_OCHOA, 4513.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-para-bano-linz-01101343',
    nota: 'Accesorios Para Baño Linz · artículo 01-10-1343 · ref. TB1114001/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-159', PROV_OCHOA, 5068.78, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-para-bano-venecia-01101340',
    nota: 'Accesorios Para Baño Venecia · artículo 01-10-1340 · ref. TBZ279001/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-160', PROV_OCHOA, 6703.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-para-bano-lazio-01101339',
    nota: 'Accesorios Para Baño Lazio · artículo 01-10-1339 · ref. TB5001/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  /* ochoa:cotizaciones:fin */

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
