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
  c('MAT-07-011', PROV_OCHOA, 296.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-acanalado-c-29-04770028',
    nota: 'Plancha De Zinc Acanalado C-29 · artículo 04-77-0028 · ref. C-293X6 · marca METALDOM. ' + SUPUESTO_ITBIS
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
  c('MAT-19-026', PROV_OCHOA, 646.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-2-150xat-04670038',
    nota: 'Perfil Rect. Galv. 1.2 (150Xat) · artículo 04-67-0038 · ref. 2X1"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-027', PROV_OCHOA, 812.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-6-150xat-04670039',
    nota: 'Perfil Rect. Galv. 1.6 (150Xat) · artículo 04-67-0039 · ref. 2X1"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-028', PROV_OCHOA, 1400.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-6-72xat-04670042',
    nota: 'Perfil Rect. Galv. 1.6 (72Xat) · artículo 04-67-0042 · ref. 2X3"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-029', PROV_OCHOA, 1695.85, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-6-60xat-04670041',
    nota: 'Perfil Rect. Galv. 1.6 (60Xat) · artículo 04-67-0041 · ref. 2X4"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-030', PROV_OCHOA, 1275.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-galv-1-6-88xat-04670040',
    nota: 'Perfil Rect. Galv. 1.6 (88Xat) · artículo 04-67-0040 · ref. 3X11/2"20\' · marca GALV-PERFIL. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-031', PROV_OCHOA, 620.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-2-77mm-04730463',
    nota: 'Tubo Negro (2.77Mm) · artículo 04-73-0463 · ref. 1/2\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-032', PROV_OCHOA, 826, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-2-87mm-04730465',
    nota: 'Tubo Negro (2.87Mm) · artículo 04-73-0465 · ref. 3/4\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-033', PROV_OCHOA, 1206.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-3-38mm-04730469',
    nota: 'Tubo Negro ( 3.38Mm) · artículo 04-73-0469 · ref. 1"X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-034', PROV_OCHOA, 1507.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-3-56mm-04730466',
    nota: 'Tubo Negro (3.56Mm) · artículo 04-73-0466 · ref. 11/4\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-035', PROV_OCHOA, 1952.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-3-68mm-04730464',
    nota: 'Tubo Negro (3.68Mm) · artículo 04-73-0464 · ref. 11/2\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-036', PROV_OCHOA, 2634.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-3-91mm-04730467',
    nota: 'Tubo Negro (3.91Mm) · artículo 04-73-0467 · ref. 2\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-037', PROV_OCHOA, 4173.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-2-1-2-04730461',
    nota: 'Tubo 2 1 / 2\'\' · artículo 04-73-0461 · ref. 21/2\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-038', PROV_OCHOA, 5029.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-3-04730462',
    nota: 'Tubo Negro 3\'\' · artículo 04-73-0462 · ref. 3\'\'X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-039', PROV_OCHOA, 11671.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-304-23-lbs-6-35mm-04730088',
    nota: 'Tubo Negro 304.23 Lbs ( 6.35Mm) · artículo 04-73-0088 · ref. 6"X20" · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-040', PROV_OCHOA, 18313.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-240-82-kg-1-4-6-00-mm-04730086',
    nota: 'Tubo Negro 240.82 Kg.(1 / 4 6.00 Mm) · artículo 04-73-0086 · ref. 10"X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-041', PROV_OCHOA, 27695.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-6mm-04730137',
    nota: 'Tubo Negro (6Mm) · artículo 04-73-0137 · ref. 14"X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-042', PROV_OCHOA, 62026.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-negro-1-2-12-70-mm-04730523',
    nota: 'Tubo Negro 1 / 2 (12.70 Mm). · artículo 04-73-0523 · ref. 16X20\' · marca HN-TUBO. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-043', PROV_OCHOA, 2658, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/correa-galvanizada-tipo-z-04780204',
    nota: 'Correa Galvanizada Tipo Z. · artículo 04-78-0204 · ref. 1/16X6" · marca GALV-CORREA. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-19-044', PROV_OCHOA, 3039.2, {
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
  c('MAT-20-051', PROV_OCHOA, 411.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-cuadrada-13-016-170xt-m-04540002',
    nota: 'Barra Cuadrada-13.016 (170Xt.M.) · artículo 04-54-0002 · ref. 7/16"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-052', PROV_OCHOA, 538.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-cuadrada-17-lbs-130xt-m-04540004',
    nota: 'Barra Cuadrada-17 Lbs (130Xt.M) · artículo 04-54-0004 · ref. 1/2"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-053', PROV_OCHOA, 843.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-cuadrada-26-562-lbs-83xt-m-s-d-04540005',
    nota: 'Barra Cuadrada-26.562 Lbs (83Xt.M) S / D · artículo 04-54-0005 · ref. 5/8"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-054', PROV_OCHOA, 238.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-7-510-lbs-296xt-m-04540037',
    nota: 'Barra Redonda-7.510 Lbs(296Xt.M.) · artículo 04-54-0037 · ref. 3/8"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-055', PROV_OCHOA, 421.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-13-352-lbs-166xt-m-04540027',
    nota: 'Barra Redonda-13.352 Lbs(166Xt.M.) · artículo 04-54-0027 · ref. 1/2"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-056', PROV_OCHOA, 660.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-20-862-lbs-106xt-m-04540028',
    nota: 'Barra Redonda-20.862 Lbs(106Xt.M.) · artículo 04-54-0028 · ref. 5/8"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-057', PROV_OCHOA, 945.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-30-040-lbs-74xt-04540030',
    nota: 'Barra Redonda-30.040 Lbs (74Xt) · artículo 04-54-0030 · ref. 3/4"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-058', PROV_OCHOA, 1666.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-53-408-lbs-42xt-04540035',
    nota: 'Barra Redonda-53.408 Lbs (42Xt) · artículo 04-54-0035 · ref. 1"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
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
