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

  /* Las dos planchas de plywood de InnovaCentro que estaban aquí, tomadas a
     mano el 08/09/2026, las reemplazó la extracción completa del 09/09: son
     los mismos artículos 004929 y 025846, con precio de la misma tienda un
     día después. Ahora entran por el importador, con su ficha versionada.
     De paso quedó dicho que el precio se movió: el pino de 1/2 estaba en
     RD$ 1,495 y aparece en 1,425. */

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
  var PROV_INNOVA = 'InnovaCentro (La Innovación)';

/* catalogos:cotizaciones:inicio — generado por herramientas/importar-catalogos.js.
     No editar a mano: se reescribe en cada importación. */

  /* Artículos que corresponden a un ítem que ya existía. Aquí es donde
     el catálogo se vuelve comparable: el mismo ítem con el precio de
     más de un comercio. */

  /* Ochoa · materiales de construcción */
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

  /* InnovaCentro · materiales de construcción */
  c('MAT-02-004', PROV_INNOVA, 570, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/calhidratada/cal-hidratada-empañete-44-lb-perla-026053',
    nota: 'CAL HIDRATADA EMPAÑETE 44 LB PERLA · artículo 026053 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-057', PROV_INNOVA, 57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementoblanco/cemento-blanco-en-funda-2-lb-009121',
    nota: 'CEMENTO BLANCO EN FUNDA 2 LB · artículo 009121 · ref. Cemento · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-058', PROV_INNOVA, 132, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementoblanco/cemento-blanco-en-funda-5-lb-009110',
    nota: 'CEMENTO BLANCO EN FUNDA 5 LB · artículo 009110 · ref. Cemento · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-002', PROV_INNOVA, 755, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementoblanco/cemento-blanco-funda-25-kg-015794',
    nota: 'CEMENTO BLANCO FUNDA 25 KG · artículo 015794 · ref. Cemento · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-003', PROV_INNOVA, 1295, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementoblanco/cemento-blanco-funda-40-kg-057367',
    nota: 'CEMENTO BLANCO FUNDA 40 KG · artículo 057367 · ref. Cemento · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-056', PROV_INNOVA, 173, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementogris/cemento-gris-10-lb-057347',
    nota: 'CEMENTO GRIS 10 LB · artículo 057347 · ref. Cemento · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-001', PROV_INNOVA, 655, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementogris/cemento-gris-titan-94-lb-023108',
    nota: 'CEMENTO GRIS TITAN 94 LB · artículo 023108 · ref. Cemento · marca TITAN. ' + SUPUESTO_ITBIS
  });
  c('MAT-12-009', PROV_INNOVA, 690, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/morteros/estuco-interior-forte-blanco-35-lb-065073',
    nota: 'ESTUCO INTERIOR FORTE BLANCO 35 LB · artículo 065073 · marca PEGA FORTE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-009', PROV_INNOVA, 330, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/morteros/mortero-pañete-forte-94-lb-normal-065070',
    nota: 'MORTERO PAÑETE FORTE 94 LB NORMAL · artículo 065070 · marca PEGA FORTE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-009', PROV_INNOVA, 384, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/morteros/mortero-pañete-titan-42-5-kg-normal-023111',
    nota: 'MORTERO PAÑETE TITAN 42.5 KG NORMAL · artículo 023111 · marca TITAN. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-007', PROV_INNOVA, 1054, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/pegamento-ceramica-weco-w-900-we0810457-blanco-50-058654',
    nota: 'PEGAMENTO CERAMICA WECO W-900 WE0810457 BLANCO 50 LB · artículo 058654 · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-006', PROV_INNOVA, 595, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/plafones/plafon-biselado-pebble-2x2-046360',
    nota: 'PLAFON BISELADO PEBBLE 2X2\' · artículo 046360 · ref. Plafon · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-06-005', PROV_INNOVA, 1520, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchasdeplywood/plywood-okume-4-x8-x1-3-2-7-025844',
    nota: 'PLYWOOD OKUME 4\'X8\'X1/2" · artículo 025844 · ref. Plywood · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-06-006', PROV_INNOVA, 1990, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchasdeplywood/plywood-okume-4-x8-x3-3-4-7-025846',
    nota: 'PLYWOOD OKUME 4\'X8\'X3/4" · artículo 025846 · ref. Plywood · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-06-005', PROV_INNOVA, 1425, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchasdeplywood/plywood-pino-4-x8-x1-3-2-7-004929',
    nota: 'PLYWOOD PINO 4\'X8\'X1/2" · artículo 004929 · ref. Plywood · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-06-006', PROV_INNOVA, 1995, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchasdeplywood/plywood-pino-4-x8-x3-3-4-7-025685',
    nota: 'PLYWOOD PINO 4\'X8\'X3/4" · artículo 025685 · ref. Plywood · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-017', PROV_INNOVA, 2730, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/alambre-puas-cal-16-250-mt-premium-035335',
    nota: 'ALAMBRE PUAS CAL-16 250 MT PREMIUM · artículo 035335 · ref. Alambre · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-016', PROV_INNOVA, 845, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/alambre-puas-jabali-cal-16-110-mt-059298',
    nota: 'ALAMBRE PUAS JABALI CAL-16 110 MT · artículo 059298 · ref. Alambre · marca JABALI. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-017', PROV_INNOVA, 1885, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/alambre-puas-jabali-cal-16-250-mt-059299',
    nota: 'ALAMBRE PUAS JABALI CAL-16 250 MT · artículo 059299 · ref. Alambre · marca JABALI. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-017', PROV_INNOVA, 3770, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/alambre-puas-motto-16x250-mt-003852',
    nota: 'ALAMBRE PUAS MOTTO 16X250 MT · artículo 003852 · ref. Alambre · marca MOTTO. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-033', PROV_INNOVA, 46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/abrazadera-malla-ciclonica-1-1-3-2-7-larga-032630',
    nota: 'ABRAZADERA MALLA CICLONICA 1-1/2" LARGA · artículo 032630 · ref. Malla · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-028', PROV_INNOVA, 98, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/copa-pasante-malla-ciclonica-1-1-3-2x1-1-3-4-7-032626',
    nota: 'COPA PASANTE MALLA CICLONICA 1-1/2X1-1/4" · artículo 032626 · ref. Malla · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-037', PROV_INNOVA, 105, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/copa-terminal-malla-ciclonica-1-1-3-2-7-032625',
    nota: 'COPA TERMINAL MALLA CICLONICA 1-1/2" · artículo 032625 · ref. Malla · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-013', PROV_INNOVA, 10250, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/malla-ciclonica-6x50-calibre-11-galvanizada-028879',
    nota: 'MALLA CICLONICA 6X50\' CALIBRE 11 GALVANIZADA · artículo 028879 · ref. Malla · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-007', PROV_INNOVA, 14690, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/malla-ciclonica-6x50-calibre-9-revestida-3-plastic-055382',
    nota: 'MALLA CICLONICA 6X50\' CALIBRE 9 REVESTIDA/PLASTICA · artículo 055382 · ref. Malla · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-034', PROV_INNOVA, 277, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/palometa-doble-malla-ciclonica-1-1-3-2x1-1-3-4-032628',
    nota: 'PALOMETA DOBLE MALLA CICLONICA 1-1/2X1-1/4 · artículo 032628 · ref. Palometa · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-035', PROV_INNOVA, 168, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/palometa-sencilla-malla-ciclonica-1-1-3-2x1-1-3-4-032629',
    nota: 'PALOMETA SENCILLA MALLA CICLONICA 1-1/2X1-1/4 · artículo 032629 · ref. Palometa · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-010', PROV_INNOVA, 625, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/tubo-galvanizado-malla-ciclonica-1-1-3-2x15-054850',
    nota: 'TUBO GALVANIZADO MALLA CICLONICA 1-1/2X15\' · artículo 054850 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-009', PROV_INNOVA, 730, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/tubo-galvanizado-malla-ciclonica-1-1-3-4x20-036418',
    nota: 'TUBO GALVANIZADO MALLA CICLONICA 1-1/4X20\' · artículo 036418 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-013', PROV_INNOVA, 338, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchadezincacanaladas/plancha-zinc-acanalado-6-cal-29-029919',
    nota: 'PLANCHA ZINC ACANALADO 6\' CAL 29 · artículo 029919 · ref. Plancha · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-015', PROV_INNOVA, 245, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchadezincacanaladas/plancha-zinc-acanalado-6-cal-34-028393',
    nota: 'PLANCHA ZINC ACANALADO 6\' CAL 34 · artículo 028393 · ref. Plancha · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-016', PROV_INNOVA, 1165, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/productosdealuminio/angular-aluminio-1-1-3-4x1-1-3-4-7-x19-046363',
    nota: 'ANGULAR ALUMINIO 1-1/4X1-1/4"X19\' · artículo 046363 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-004', PROV_INNOVA, 295, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/angularesdealuminio/angular-aluminio-1-3-2x1-3-2-7-x19-032501',
    nota: 'ANGULAR ALUMINIO 1/2X1/2"X19\' · artículo 032501 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-013', PROV_INNOVA, 755, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/productosdealuminio/angular-aluminio-1x3-3-4-7-x19-046362',
    nota: 'ANGULAR ALUMINIO 1X3/4"X19\' · artículo 046362 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-010', PROV_INNOVA, 445, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/productosdealuminio/angular-aluminio-3-3-4x3-3-4-7-x19-032502',
    nota: 'ANGULAR ALUMINIO 3/4X3/4"X19\' · artículo 032502 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-019', PROV_INNOVA, 1795, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchastranslucidas/plancha-translucida-6-trasparente-tipo-zinc-033108',
    nota: 'PLANCHA TRANSLUCIDA 6\' TRASPARENTE TIPO ZINC · artículo 033108 · ref. Plancha · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-019', PROV_INNOVA, 1195, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchastranslucidas/plancha-translucida-fibraforte-amarillo-1-80m-x-0-046351',
    nota: 'PLANCHA TRANSLUCIDA FIBRAFORTE AMARILLO 1.80M X 0.84M · artículo 046351 · ref. Plancha · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-019', PROV_INNOVA, 1195, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchastranslucidas/plancha-translucida-fibraforte-azul-1-80m-x-0-84m-046352',
    nota: 'PLANCHA TRANSLUCIDA FIBRAFORTE AZUL 1.80M X 0.84M · artículo 046352 · ref. Plancha · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-019', PROV_INNOVA, 1195, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchastranslucidas/plancha-translucida-fibraforte-blanca-1-80m-x-0-84-017574',
    nota: 'PLANCHA TRANSLUCIDA FIBRAFORTE BLANCA 1.80M X 0.84M · artículo 017574 · ref. Plancha · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-019', PROV_INNOVA, 1195, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchastranslucidas/plancha-translucida-fibraforte-verde-2-75x6-017576',
    nota: 'PLANCHA TRANSLUCIDA FIBRAFORTE VERDE 2.75X6\' · artículo 017576 · ref. Plancha · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-001', PROV_INNOVA, 895, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/panelesdeyesoyaccesorios/plancha-yeso-knauf-4-x8-x1-3-2-7-004771',
    nota: 'PLANCHA YESO KNAUF 4\'X8\'X1/2" · artículo 004771 · ref. Plancha · marca KNAUF. ' + SUPUESTO_ITBIS
  });

  /* Familias completas del catálogo de Ochoa: cada ítem nace verificado. */
  c('EQU-04-006', PROV_OCHOA, 480.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/herramienta-de-terminacion-z-tool-03061404',
    nota: 'Herramienta De Terminación Z-Tool · artículo 03-06-1404 · ref. Z-TOOL-ZP · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('EQU-04-006', PROV_OCHOA, 448.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/herramienta-de-terminacion-z-tool-03061403',
    nota: 'Herramienta De Terminación Z-Tool · artículo 03-06-1403 · ref. Z-TOOL · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('EQU-04-007', PROV_OCHOA, 6682.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/max-turbotool-03061424',
    nota: 'Max Turbotool · artículo 03-06-1424 · ref. MAX-TT · marca SIEMON. ' + SUPUESTO_ITBIS
  });
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
  c('MAT-02-017', PROV_INNOVA, 959, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-cano-silbond-rosado-1-gl-004840',
    nota: 'ADITIVO CONCRETO CANO SILBOND ROSADO 1 GL · artículo 004840 · marca CANO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-018', PROV_INNOVA, 465, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-cano-silbond-rosado-1-3-2-gl-004839',
    nota: 'ADITIVO CONCRETO CANO SILBOND ROSADO 1/2 GL · artículo 004839 · marca CANO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-019', PROV_INNOVA, 265, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-cano-silbond-rosado-32-oz-037788',
    nota: 'ADITIVO CONCRETO CANO SILBOND ROSADO 32 OZ · artículo 037788 · marca CANO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-020', PROV_INNOVA, 1020, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-cano-silbond-ultra-azul-1-gl-005237',
    nota: 'ADITIVO CONCRETO CANO SILBOND ULTRA AZUL 1 GL · artículo 005237 · marca CANO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-021', PROV_INNOVA, 535, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-cano-silbond-ultra-azul-1-3-2-gl-005236',
    nota: 'ADITIVO CONCRETO CANO SILBOND ULTRA AZUL 1/2 GL · artículo 005236 · marca CANO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-022', PROV_INNOVA, 305, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-cano-silbond-ultra-azul-32-oz-037787',
    nota: 'ADITIVO CONCRETO CANO SILBOND ULTRA AZUL 32 OZ · artículo 037787 · marca CANO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-023', PROV_INNOVA, 10935, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-lanco-cb-1052-2-5-gl-058714',
    nota: 'ADITIVO CONCRETO LANCO CB-1052-2 5 GL · artículo 058714 · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-024', PROV_INNOVA, 1125, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-lanco-cb-606-4-1-gl-rosado-003742',
    nota: 'ADITIVO CONCRETO LANCO CB-606-4 1 GL ROSADO · artículo 003742 · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-025', PROV_INNOVA, 570, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-lanco-cb-606-9-1-3-2-gl-rosado-003744',
    nota: 'ADITIVO CONCRETO LANCO CB-606-9 1/2 GL ROSADO · artículo 003744 · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-026', PROV_INNOVA, 6300, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-lanco-cb-610-2-5-gl-azul-extra-pr-036176',
    nota: 'ADITIVO CONCRETO LANCO CB-610-2 5 GL AZUL EXTRA PRO · artículo 036176 · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-027', PROV_INNOVA, 1185, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-lanco-cb-610-4-1-gl-azul-extra-pr-003746',
    nota: 'ADITIVO CONCRETO LANCO CB-610-4 1 GL AZUL EXTRA PRO · artículo 003746 · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-028', PROV_INNOVA, 395, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-lanco-cb-610-5-1-3-4-gl-001402',
    nota: 'ADITIVO CONCRETO LANCO CB-610-5 1/4 GL · artículo 001402 · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-029', PROV_INNOVA, 2005, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-lanco-cb-8000-4-texturizado-1-gl-042770',
    nota: 'ADITIVO CONCRETO LANCO CB-8000-4 TEXTURIZADO 1 GL · artículo 042770 · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-030', PROV_INNOVA, 1460, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-lanco-cb-902-1-gl-058712',
    nota: 'ADITIVO CONCRETO LANCO CB-902 1 GL · artículo 058712 · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-031', PROV_INNOVA, 6055, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/aditivo-concreto-lanco-cb-902-2-5-gl-058713',
    nota: 'ADITIVO CONCRETO LANCO CB-902-2 5 GL · artículo 058713 · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-032', PROV_INNOVA, 454.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/fibra-polipropileno-sikafiber-para-concreto-0-6kg-047405',
    nota: 'FIBRA POLIPROPILENO SIKAFIBER PARA CONCRETO 0.6KG · artículo 047405 · marca SIKA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-033', PROV_INNOVA, 1610.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/aditivosparaconcretos/primer-epoxico-concreto-sikadur-32-gel-1kg-compone-010885',
    nota: 'PRIMER EPOXICO CONCRETO SIKADUR 32 GEL 1KG COMPONENTE A+B · artículo 010885 · marca SIKA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-034', PROV_INNOVA, 3952.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementos/cemento-autonivelante-weco-w-501-we0850105-polimer-062080',
    nota: 'CEMENTO AUTONIVELANTE WECO W-501 WE0850105 POLIMERO GRIS 40 LB · artículo 062080 · ref. Cemento · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-035', PROV_INNOVA, 377.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementos/cemento-weco-w-350-we0855504-gris-10-lb-062081',
    nota: 'CEMENTO WECO W-350 WE0855504 GRIS 10 LB · artículo 062081 · ref. Cemento · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-036', PROV_INNOVA, 533.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementos/cemento-weco-w-400-we0875003-blanco-10-lb-ultra-058655',
    nota: 'CEMENTO WECO W-400 WE0875003 BLANCO 10 LB ULTRA · artículo 058655 · ref. Cemento · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-037', PROV_INNOVA, 949.45, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementos/cemento-weco-w-511-we0751104-hiraulico-1-gl-062076',
    nota: 'CEMENTO WECO W-511 WE0751104 HIRAULICO 1 GL · artículo 062076 · ref. Cemento · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-038', PROV_INNOVA, 2817.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cementos/cemento-weco-w-511-we0751105-hiraulico-cubeta-40-l-058652',
    nota: 'CEMENTO WECO W-511 WE0751105 HIRAULICO CUBETA 40 LB · artículo 058652 · ref. Cemento · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-039', PROV_INNOVA, 135, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/morteros/mezcla-pañete-10-lb-057349',
    nota: 'MEZCLA PAÑETE 10 LB · artículo 057349 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-040', PROV_INNOVA, 1270.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/morteros/mortero-anclaje-sikagrout-212-relleno-22kg-047407',
    nota: 'MORTERO ANCLAJE SIKAGROUT 212 RELLENO 22KG · artículo 047407 · marca SIKA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-041', PROV_INNOVA, 2396, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/morteros/mortero-ceramica-mapei-ultraflex-lft-polimero-blan-061948',
    nota: 'MORTERO CERAMICA MAPEI ULTRAFLEX LFT POLIMERO BLANCO 50 LB · artículo 061948 · marca MAPEI. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-042', PROV_INNOVA, 2715.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/morteros/mortero-impermeabilizante-sika-101-blanco-25kg-tan-047421',
    nota: 'MORTERO IMPERMEABILIZANTE SIKA 101 BLANCO 25KG TANQUES PISCINAS · artículo 047421 · marca SIKA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-043', PROV_INNOVA, 1308, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/morteros/mortero-mapei-planitop-xs-gris-50-lb-061934',
    nota: 'MORTERO MAPEI PLANITOP XS GRIS 50 LB · artículo 061934 · marca MAPEI. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-044', PROV_INNOVA, 167, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/yeso/yeso-blanco-funda-10-lb-057348',
    nota: 'YESO BLANCO FUNDA 10 LB · artículo 057348 · ref. Cemento · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-045', PROV_INNOVA, 28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/yeso/yeso-blanco-funda-2-lb-052185',
    nota: 'YESO BLANCO FUNDA 2 LB · artículo 052185 · ref. Cemento · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-046', PROV_INNOVA, 1365.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/pegamento-ceramica-weco-w-1000-we0810501-polimero-062079',
    nota: 'PEGAMENTO CERAMICA WECO W-1000 WE0810501 POLIMERO BLANCO 50 LB · artículo 062079 · ref. Pegamento · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-047', PROV_INNOVA, 786.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/pegamento-ceramica-weco-w-3000-cero-polimero-blanc-062078',
    nota: 'PEGAMENTO CERAMICA WECO W-3000 CERO POLIMERO BLANCO 10 LB · artículo 062078 · ref. Pegamento · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-048', PROV_INNOVA, 1845, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/pegamento-ceramica-lanco-sm-502-4-ceramic-tile-bla-058460',
    nota: 'PEGAMENTO CERAMICA LANCO SM-502-4 CERAMIC TILE BLANCO 1 GL · artículo 058460 · ref. Pegamento · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-049', PROV_INNOVA, 625, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/pegamento-ceramica-lanco-sm-502-5-ceramic-tile-bla-058461',
    nota: 'PEGAMENTO CERAMICA LANCO SM-502-5 CERAMIC TILE BLANCO 1/4 GL · artículo 058461 · ref. Pegamento · marca LANCO. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-050', PROV_INNOVA, 610.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/pegamento-ceramica-weco-w-2000-we0810602-polimero-062077',
    nota: 'PEGAMENTO CERAMICA WECO W-2000 WE0810602 POLIMERO GRIS 10 LB · artículo 062077 · ref. Pegamento · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-051', PROV_INNOVA, 437.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/pegamento-ceramica-weco-w-761-blanco-10-lb-069945',
    nota: 'PEGAMENTO CERAMICA WECO W-761 BLANCO 10 LB · artículo 069945 · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-052', PROV_INNOVA, 569.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/pegamento-ceramica-weco-w-900-we0810454-blanco-10-058653',
    nota: 'PEGAMENTO CERAMICA WECO W-900 WE0810454 BLANCO 10 LB · artículo 058653 · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 328, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-1001-blanco-forte-10-lb-065072',
    nota: 'DERRETIDO 1001 BLANCO FORTE 10 LB · artículo 065072 · ref. Derretido · marca PEGA FORTE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 712, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-mapei-keracolor-5005-chamois-10-lb-para-061937',
    nota: 'DERRETIDO MAPEI KERACOLOR 5005 CHAMOIS 10 LB PARA CERAMICA · artículo 061937 · marca MAPEI. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 712, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-mapei-keracolor-5010-negro-10-lb-para-ce-061942',
    nota: 'DERRETIDO MAPEI KERACOLOR 5010 NEGRO 10 LB PARA CERAMICA · artículo 061942 · marca MAPEI. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 712, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-mapei-keracolor-5077-frost-10-lb-para-ce-061941',
    nota: 'DERRETIDO MAPEI KERACOLOR 5077 FROST 10 LB PARA CERMANICA · artículo 061941 · marca MAPEI. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 543.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-weco-w-573-we1071051-10-lb-blanco-para-c-058656',
    nota: 'DERRETIDO WECO W-573 WE1071051 10 LB BLANCO PARA CERAMICA · artículo 058656 · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 543.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-weco-w-573-we1071055-10-lb-gris-para-cer-058657',
    nota: 'DERRETIDO WECO W-573 WE1071055 10 LB GRIS PARA CERAMICA · artículo 058657 · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 543.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-weco-w-573-we1071059-10-lb-bone-para-cer-058659',
    nota: 'DERRETIDO WECO W-573 WE1071059 10 LB BONE PARA CERAMICA · artículo 058659 · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 543.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-weco-w-573-we1071063-10-lb-silver-gray-p-058660',
    nota: 'DERRETIDO WECO W-573 WE1071063 10 LB SILVER GRAY PARA CERAMICA · artículo 058660 · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 543.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-weco-w-573-we1071064-10-lb-frost-gray-pa-058661',
    nota: 'DERRETIDO WECO W-573 WE1071064 10 LB FROST GRAY PARA CERAMICA · artículo 058661 · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 556.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-weco-w-573-we1071085-10-lb-riviera-sand-058662',
    nota: 'DERRETIDO WECO W-573 WE1071085 10 LB RIVIERA SAND PARA CERAMICA · artículo 058662 · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 553.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-weco-w-573-we1071087-10-lb-sierra-snow-p-062075',
    nota: 'DERRETIDO WECO W-573 WE1071087 10 LB SIERRA SNOW PARA CERAMICA · artículo 062075 · ref. Derretido · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 668.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-weco-w-573-we1071089-10-lb-terracota-par-062074',
    nota: 'DERRETIDO WECO W-573 WE1071089 10 LB TERRACOTA PARA CERAMICA · artículo 062074 · ref. Derretido · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-053', PROV_INNOVA, 681.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/derretidosdepisos/derretido-weco-w-573-we1071093-10-lb-marron-para-c-062073',
    nota: 'DERRETIDO WECO W-573 WE1071093 10 LB MARRON PARA CERAMICA · artículo 062073 · ref. Derretido · marca WEC. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-054', PROV_INNOVA, 336, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/pegamento-ceramica-pega-forte-gris-50-lb-065071',
    nota: 'PEGAMENTO CERAMICA PEGA FORTE GRIS 50 LB · artículo 065071 · marca PEGA FORTE. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-054', PROV_INNOVA, 325, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/pegamento-ceramica-pegatod-gris-50-lb-024743',
    nota: 'PEGAMENTO CERAMICA PEGATOD GRIS 50 LB · artículo 024743 · marca PEGATOD. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-055', PROV_OCHOA, 34.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-gris-04590319',
    nota: 'Cemento Gris. · artículo 04-59-0319 · ref. 5LIBRAS · marca PANAM. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-056', PROV_OCHOA, 65.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-gris-04590320',
    nota: 'Cemento Gris · artículo 04-59-0320 · ref. 10LIBRAS · marca PANAM. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-057', PROV_OCHOA, 49.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-blanco-04590410',
    nota: 'Cemento Blanco · artículo 04-59-0410 · ref. FDA.2LBS0.9KG · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-058', PROV_OCHOA, 109.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-blanco-04590409',
    nota: 'Cemento Blanco · artículo 04-59-0409 · ref. FDA.5LBS2.25KG · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-059', PROV_OCHOA, 159.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cemento-blanco-fundas-04590356',
    nota: 'Cemento Blanco Fundas · artículo 04-59-0356 · ref. 10LIBRAS · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-060', PROV_OCHOA, 4.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/yeso-en-polvo-04590219',
    nota: 'Yeso En Polvo · artículo 04-59-0219 · ref. BLANCOLIBRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-061', PROV_OCHOA, 37.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/yeso-en-polvo-5-lbs-04590344',
    nota: 'Yeso En Polvo 5 Lbs. · artículo 04-59-0344 · ref. 5LIBRAS · marca PALOMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-062', PROV_OCHOA, 373.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/yeso-en-polvo-blanco-paloma-04590063',
    nota: 'Yeso En Polvo Blanco Paloma · artículo 04-59-0063 · ref. FDA.65LBS · marca PALOMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-063', PROV_OCHOA, 1295.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fibra-de-acero-04660385',
    nota: 'Fibra De Acero · artículo 04-66-0385 · ref. 1439(5.3KG) · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-02-064', PROV_OCHOA, 807.79, {
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
  c('MAT-06-018', PROV_INNOVA, 780, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchasdeplywood/plywood-okume-4-x8-x1-3-4-7-025848',
    nota: 'PLYWOOD OKUME 4\'X8\'X1/4" · artículo 025848 · ref. Plywood · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-06-019', PROV_INNOVA, 475, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchasdeplywood/plywood-okume-4-x8-x1-3-8-7-025847',
    nota: 'PLYWOOD OKUME 4\'X8\'X1/8" · artículo 025847 · ref. Plywood · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-06-020', PROV_INNOVA, 1115, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchasdeplywood/plywood-okume-4-x8-x3-3-8-7-025849',
    nota: 'PLYWOOD OKUME 4\'X8\'X3/8" · artículo 025849 · ref. Plywood · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-06-021', PROV_INNOVA, 825, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchasdeplywood/plywood-pino-4-x8-x1-3-4-7-004927',
    nota: 'PLYWOOD PINO 4\'X8\'X1/4" · artículo 004927 · ref. Plywood · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-06-022', PROV_INNOVA, 1245, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchasdeplywood/plywood-pino-4-x8-x3-3-8-7-004928',
    nota: 'PLYWOOD PINO 4\'X8\'X3/8" · artículo 004928 · ref. Plywood · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-06-023', PROV_INNOVA, 1995, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchasdeplywood/plywood-slatwall-decoratico-blco-4x8-029814',
    nota: 'PLYWOOD SLATWALL DECORATICO BLCO 4X8\' · artículo 029814 · ref. Plywood · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-011', PROV_INNOVA, 1535, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/caballetes-para-techos/caballete-fibraforte-rojo-0-76x0-6-046355',
    nota: 'CABALLETE FIBRAFORTE ROJO 0.76X0.6 · artículo 046355 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-012', PROV_INNOVA, 1450, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/planchastipotejas/plancha-teja-fibraforte-rojo-opaco-0-76mx1-15m-046354',
    nota: 'PLANCHA TEJA FIBRAFORTE ROJO OPACO 0 .76MX1.15M · artículo 046354 · ref. Plancha · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-013', PROV_OCHOA, 296.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-acanalado-c-29-04770028',
    nota: 'Plancha De Zinc Acanalado C-29 · artículo 04-77-0028 · ref. C-293X6 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-013', PROV_OCHOA, 270.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-acanalado-sol-250xat-04770129',
    nota: 'Zinc Acanalado (Sol)(250Xat) · artículo 04-77-0129 · ref. C-293X6 · marca SOL. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-014', PROV_OCHOA, 592.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-acanalado-c-29-04770094',
    nota: 'Plancha De Zinc Acanalado C-29 · artículo 04-77-0094 · ref. C-293X12 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-015', PROV_OCHOA, 208.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-acanalado-c-34-04770030',
    nota: 'Plancha De Zinc Acanalado C-34 · artículo 04-77-0030 · ref. C-343X6 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-016', PROV_OCHOA, 414.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-acanalado-c-34-04770095',
    nota: 'Plancha De Zinc Acanalado C-34 · artículo 04-77-0095 · ref. C-343X12 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-017', PROV_OCHOA, 296.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-liso-c-29-04770054',
    nota: 'Plancha De Zinc Liso C-29 · artículo 04-77-0054 · ref. C-293X6 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-017', PROV_OCHOA, 270.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-liso-c-29-04770131',
    nota: 'Plancha De Zinc Liso C-29 · artículo 04-77-0131 · ref. C-293X6 · marca SOL. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-018', PROV_OCHOA, 209.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plancha-de-zinc-liso-c-34-04770127',
    nota: 'Plancha De Zinc Liso C-34 · artículo 04-77-0127 · ref. C-343X6 · marca SOL. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-018', PROV_OCHOA, 208.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-liso-6-lbs-100xat-04770055',
    nota: 'Zinc Liso 6 Lbs. (100Xat) · artículo 04-77-0055 · ref. C-343X6 · marca METALDOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-019', PROV_OCHOA, 1127.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-translucido-04770063',
    nota: 'Zinc Translucido · artículo 04-77-0063 · ref. BLANCA3\'X6\' · marca BAF. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-019', PROV_OCHOA, 1127.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-traslucido-3-04770064',
    nota: 'Zinc Traslucido 3\' · artículo 04-77-0064 · ref. AZUL3\'X6\' · marca BAF. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-019', PROV_OCHOA, 1127.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-traslucido-3-04770065',
    nota: 'Zinc Traslucido 3\' · artículo 04-77-0065 · ref. VERDE3\'X6\' · marca BAF. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-019', PROV_OCHOA, 1127.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/zinc-traslucido-3-04770072',
    nota: 'Zinc Traslucido 3\' · artículo 04-77-0072 · ref. AMARILLO3\'X6\' · marca BAF. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-020', PROV_OCHOA, 660, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caballete-para-aluzinc-21-04520043',
    nota: 'Caballete Para Aluzinc 21\'\' · artículo 04-52-0043 · ref. 21"X10\'MAX. · marca ACERO ESTRELLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-021', PROV_OCHOA, 141.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caballete-de-zinc-04580009',
    nota: 'Caballete De Zinc · artículo 04-58-0009 · ref. CAL-29X6\' · marca AVM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-022', PROV_OCHOA, 104.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caballete-de-zinc-04580010',
    nota: 'Caballete De Zinc · artículo 04-58-0010 · ref. CAL-34X6\' · marca AVM. ' + SUPUESTO_ITBIS
  });
  c('MAT-07-023', PROV_OCHOA, 659.86, {
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
  c('MAT-13-011', PROV_INNOVA, 98, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/angular-10-t-grid-plafon-014378',
    nota: 'ANGULAR 10\' T-GRID PLAFON · artículo 014378 · ref. Angular · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-012', PROV_INNOVA, 26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cross-tee-2-t-grid-plafon-014381',
    nota: 'CROSS TEE 2\' T-GRID PLAFON · artículo 014381 · ref. Plafon · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-013', PROV_INNOVA, 56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/cross-tee-4-t-grid-plafon-014379',
    nota: 'CROSS TEE 4\' T-GRID PLAFON · artículo 014379 · ref. Plafon · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-014', PROV_INNOVA, 149, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/durmiente-plafon/durmiente-plafon-2-1-3-2-7-x-10-cal-25-036984',
    nota: 'DURMIENTE PLAFON 2-1/2" X 10 CAL 25 · artículo 036984 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-015', PROV_INNOVA, 186, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/main-tee-plafon/main-tee-12-t-grid-plafon-014377',
    nota: 'MAIN TEE 12\' T-GRID PLAFON · artículo 014377 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-016', PROV_INNOVA, 185, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/parales-para-plafon/parales-2-1-3-2-7-x10-cal-25-plafond-036983',
    nota: 'PARALES 2-1/2"X10 CAL.25 PLAFOND · artículo 036983 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-017', PROV_INNOVA, 202, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/plafones/plafon-pvc-blanco-2-x-4-cs-605x1219x7-014374',
    nota: 'PLAFON PVC BLANCO 2 X 4\' CS-605X1219X7 · artículo 014374 · ref. Plafon · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-018', PROV_INNOVA, 375, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/plafones/plafon-pvc-blanco-machihembrado-cs-250x5800x7mm-19-060020',
    nota: 'PLAFON PVC BLANCO MACHIHEMBRADO CS-250X5800X7MM (19’) · artículo 060020 · ref. Plafon · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-019', PROV_INNOVA, 295, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/plafones/plafon-vinyl-yeso-liso-2-x-4-7-mm-a154-014372',
    nota: 'PLAFON VINYL YESO LISO 2 X 4\' 7 MM A154 · artículo 014372 · ref. Plafon · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-13-020', PROV_INNOVA, 495, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/carton-piedra/carton-piedra-4-x8-3-2-mm-1-3-8-7-025843',
    nota: 'CARTON PIEDRA 4\'X8\' 3.2 MM 1/8" · artículo 025843 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-003', PROV_OCHOA, 740.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-hdcvi-domo-2mp-2-8mm-cooper-sdl-03062128',
    nota: 'Camara Hdcvi Domo 2Mp 2.8Mm Cooper Sdl · artículo 03-06-2128 · ref. DH-HAC-T1A21N-U-IL-A · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-004', PROV_OCHOA, 1368.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-hdcvi-domo-5mp-2-8mm-cooper-sdl-03062129',
    nota: 'Camara Hdcvi Domo 5Mp 2.8Mm Cooper Sdl · artículo 03-06-2129 · ref. DH-HAC-T1A51N-U-IL-A · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-005', PROV_OCHOA, 1394.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-hdcvi-bullet-5mp-2-8mm-cooper-sdl-03062140',
    nota: 'Camara Hdcvi Bullet 5Mp 2.8Mm Cooper Sdl · artículo 03-06-2140 · ref. DH-HAC-B1A51N-U-IL-A · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-006', PROV_OCHOA, 1576.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-inalambr-smart-inte-2mp-1080p-03061896',
    nota: 'Camara Inalambr Smart Inte 2Mp 1080P · artículo 03-06-1896 · ref. CM1408WT/CM1418WT · marca UNNO. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-007', PROV_OCHOA, 1649.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-t-domo-2mp-3-6mm-exterior-serie4-03060604',
    nota: 'Camara T / Domo 2Mp 3.6Mm Exterior Serie4 · artículo 03-06-0604 · ref. COR-H2TRF · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-008', PROV_OCHOA, 1784.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cam-hdcvi-bullet-2mp-2-8mm-sdl-mic-ir40m-03062003',
    nota: 'Cam Hdcvi Bullet 2Mp 2.8Mm Sdl Mic Ir40M · artículo 03-06-2003 · ref. DH-HAC-HFW1200TLMN · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-009', PROV_OCHOA, 2191.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-seg-bullet-hdcvi-hfw2220rn-2-03062141',
    nota: 'Camara Seg. Bullet Hdcvi Hfw2220Rn (2 · artículo 03-06-2141 · ref. 116788. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-010', PROV_OCHOA, 2548.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-seguridad-wi-fi-hd-360-c-fuente-03061546',
    nota: 'Camara Seguridad Wi-Fi Hd 360 C / Fuente · artículo 03-06-1546 · ref. 4663GK-200MP2-B · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-011', PROV_OCHOA, 2549.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-turr-2mp-lente-fijo-turrent-2-8mm-03061881',
    nota: 'Camara Turr 2Mp Lente Fijo Turrent 2.8Mm · artículo 03-06-1881 · ref. IPC-T122-APF28-SC · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-012', PROV_OCHOA, 2588.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-t-bullet-anal-hybrid-ahd-100-ir-03060610',
    nota: 'Camara T / Bullet Anal.Hybrid Ahd 100\' Ir · artículo 03-06-0610 · ref. COR-HF97 · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-013', PROV_OCHOA, 2705.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-domo-2mp-lente-fijo-2-8mm-03061877',
    nota: 'Camara Domo 2Mp Lente Fijo 2.8Mm · artículo 03-06-1877 · ref. IPC-D122-PF28-SC · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-014', PROV_OCHOA, 2810.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-2mp-3-6mm-net-poe-03060622',
    nota: 'Camara 2Mp 3.6Mm Net Poe · artículo 03-06-0622 · ref. COR-IP2BM · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-015', PROV_OCHOA, 3073.06, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-turret-4mp-ip67-smart-ir-uniarch-03061730',
    nota: 'Camara Turret 4Mp Ip67 Smart Ir Uniarch · artículo 03-06-1730 · ref. T124-APF28 · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-016', PROV_OCHOA, 3079.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-bullet-wifi-ip-2mp-28mm-zoom-16x-03061861',
    nota: 'Camara Bullet Wifi Ip 2Mp 2,8Mm Zoom 16X · artículo 03-06-1861 · ref. VESTA-293 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-017', PROV_OCHOA, 3087.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-bullet-4mp-2-8mm-03061771',
    nota: 'Camara Bullet 4Mp 2.8Mm · artículo 03-06-1771 · ref. STD-B124-APF28 · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-018', PROV_OCHOA, 3402.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-t-domo-5mp-2-8mm-wide-medallion-03060608',
    nota: 'Camara T / Domo 5Mp 2.8Mm Wide Medallion · artículo 03-06-0608 · ref. COR-H5TRF · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-019', PROV_OCHOA, 3414.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-ip-pt-p-interior-5mp-bidirecional-03062001',
    nota: 'Camara Ip Pt P / Interior 5Mp Bidirecional · artículo 03-06-2001 · ref. DH-IPC-H5BP-0360B · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-020', PROV_OCHOA, 3433.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-ip-domo-2mp-wifi-entry-full-color-03062176',
    nota: 'Camara Ip Domo 2Mp Wifi Entry Full Color · artículo 03-06-2176 · ref. DH-T2A-LED · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-021', PROV_OCHOA, 3442.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-t-bullet-5mp-ext-medallion-2-8mm-03060612',
    nota: 'Camara T / Bullet 5Mp Ext. Medallion 2.8Mm · artículo 03-06-0612 · ref. COR-H5BF · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-022', PROV_OCHOA, 3489.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-ip-domo-2mp-2-8mm-entry-03062004',
    nota: 'Camara Ip Domo 2Mp 2.8Mm Entry · artículo 03-06-2004 · ref. DH-IPC-HDBW1230E-S5 · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-023', PROV_OCHOA, 3618.09, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-domo-ip-5mp-2-8mm-ip67-poe-c-mic-03061878',
    nota: 'Camara Domo Ip 5Mp 2.8Mm Ip67 Poe C / Mic · artículo 03-06-1878 · ref. IPC-D125-PF28-SC · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-024', PROV_OCHOA, 3695.82, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-domo-4mp-2-8mm-03061803',
    nota: 'Camara Domo 4Mp 2.8Mm · artículo 03-06-1803 · ref. D124-PF28 · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-025', PROV_OCHOA, 3714.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-turret-5mp-lente-fijo-2-8mm-03061882',
    nota: 'Camara Turret 5Mp Lente Fijo 2.8Mm · artículo 03-06-1882 · ref. IPC-T125-APF28-SC · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-026', PROV_OCHOA, 4136.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-de-video-home-kit-hub-g2h-pro-03061712',
    nota: 'Camara De Video Home Kit Hub G2H Pro · artículo 03-06-1712 · ref. CH-C01 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-027', PROV_OCHOA, 4592.19, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-domo-2mp-vf-2-8-12mm-03061879',
    nota: 'Camara Domo 2Mp Vf 2.8-12Mm · artículo 03-06-1879 · ref. IPC-D312-APKZ-SC · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-028', PROV_OCHOA, 4606.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-ip-bullet-2mp-2-8mm-wizsense-sdl-03062046',
    nota: 'Camara Ip Bullet 2Mp 2.8Mm Wizsense Sdl · artículo 03-06-2046 · ref. DH-IPC-HFW2249S-S-IL · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-029', PROV_OCHOA, 4679.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-turret-2mp-vf-03061883',
    nota: 'Camara Turret 2Mp Vf · artículo 03-06-1883 · ref. IPC-T312-APKZ-SC · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-030', PROV_OCHOA, 4807.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-2mp-net-03060624',
    nota: 'Camara 2Mp Net · artículo 03-06-0624 · ref. COR-IP2TRF · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-031', PROV_OCHOA, 4918.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-bullet-2mp-lente-fija-2-8mm-03061874',
    nota: 'Camara Bullet 2Mp Lente Fija 2.8Mm · artículo 03-06-1874 · ref. IPC-B122-APF28-SC · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-032', PROV_OCHOA, 5009.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-domo-fixed-eyeball-4mp-2-8mm-03061888',
    nota: 'Camara Domo Fixed Eyeball 4Mp 2.8Mm · artículo 03-06-1888 · ref. SC-3243-IGS-F28 · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-033', PROV_OCHOA, 5040.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-domo-ir-fixed-eyeball-4mp-03061887',
    nota: 'Camara Domo Ir Fixed Eyeball 4Mp · artículo 03-06-1887 · ref. SC-3143-IGS-F28 · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-034', PROV_OCHOA, 5421.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-inala-smart-ext-2mp-1080p-reflect-03061898',
    nota: 'Camara Inala Smart Ext 2Mp 1080P Reflect · artículo 03-06-1898 · ref. CM1412WT · marca UNNO. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-035', PROV_OCHOA, 5427.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-turret-5mp-vf-03061884',
    nota: 'Camara Turret 5Mp Vf · artículo 03-06-1884 · ref. IPC-T315-APKZ-SC · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-036', PROV_OCHOA, 5448.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-domo-5mp-vf-2-8-12mm-03061880',
    nota: 'Camara Domo 5Mp Vf 2.8-12Mm · artículo 03-06-1880 · ref. IPC-D315-APKZ-SC · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-037', PROV_OCHOA, 5547.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-t-bullet-net-ext-ir-1920hx1080v-03060621',
    nota: 'Camara T / Bullet Net Ext. Ir 1920Hx1080V · artículo 03-06-0621 · ref. COR-IP2BF · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-038', PROV_OCHOA, 5675.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-bullet-5mp-lente-vf-2-8mm-03061876',
    nota: 'Camara Bullet 5Mp Lente Vf 2.8Mm · artículo 03-06-1876 · ref. IPC-B315-APKZ-SC · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-039', PROV_OCHOA, 6122.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-domo-fixed-eyeball-5mp-2-8mm-03061889',
    nota: 'Camara Domo Fixed Eyeball 5Mp 2.8Mm · artículo 03-06-1889 · ref. SC-3253-IGS-F28 · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-040', PROV_OCHOA, 7248.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-t-domo-5mp-2-8mm-ir-varifocal-03060609',
    nota: 'Camara T / Domo 5Mp 2.8Mm Ir Varifocal · artículo 03-06-0609 · ref. COR-H5TRV · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-041', PROV_OCHOA, 7322.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-2mp-net-2-8-12mm-03060652',
    nota: 'Camara 2Mp Net 2.8-12Mm · artículo 03-06-0652 · ref. COR-IP2TRV · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-042', PROV_OCHOA, 7322.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-5mp-net-ir-2-8mm-03060653',
    nota: 'Camara 5Mp Net Ir 2.8Mm · artículo 03-06-0653 · ref. COR-IP5TRF · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-043', PROV_OCHOA, 7322.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-t-bullet-5mp-ext-net-2-8mm-03060625',
    nota: 'Camara T / Bullet 5Mp Ext. Net 2.8Mm · artículo 03-06-0625 · ref. COR-IP5BF · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-044', PROV_OCHOA, 8268.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-domo-motorizada-4mp-2-8-12mm-03061890',
    nota: 'Camara Domo Motorizada 4Mp 2.8-12Mm · artículo 03-06-1890 · ref. SC-3743F-IGZ · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-045', PROV_OCHOA, 8594.82, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-bullet-2mp-2-8-12mm-03061802',
    nota: 'Camara Bullet 2Mp 2.8-12Mm · artículo 03-06-1802 · ref. B312-APKZ · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-046', PROV_OCHOA, 8801.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-2mp-2-8-12mm-net-autofocus-03060623',
    nota: 'Camara 2Mp 2.8-12Mm Net Autofocus · artículo 03-06-0623 · ref. COR-IP2BV · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-047', PROV_OCHOA, 9064.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-bullet-4mp-03061968',
    nota: 'Camara Bullet 4Mp · artículo 03-06-1968 · ref. IPC-B124-APF28-SC · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-048', PROV_OCHOA, 11020.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-5mp-ext-net-360gr-pano-03060627',
    nota: 'Camara 5Mp Ext. Net 360Gr Pano. · artículo 03-06-0627 · ref. COR-IP5FISH · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-049', PROV_OCHOA, 11760.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-5mp-medallion-2-8-12mm-net-varif-03060629',
    nota: 'Camara 5Mp Medallion 2.8-12Mm Net Varif. · artículo 03-06-0629 · ref. COR-IP5TRV · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-050', PROV_OCHOA, 12499.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-5mp-net-2-8-12mm-03060626',
    nota: 'Camara 5Mp Net 2.8-12Mm · artículo 03-06-0626 · ref. COR-IP5BV · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-051', PROV_OCHOA, 12992.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/flexidome-ip-micro-3000i-domo-fijo-130gr-03061597',
    nota: 'Flexidome Ip Micro 3000I Domo Fijo 130Gr · artículo 03-06-1597 · ref. NDV-3502-F02 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-052', PROV_OCHOA, 13465.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cam-ip-varifocal-motoriz-bullet8mp-wizse-03061989',
    nota: 'Cam Ip Varifocal Motoriz Bullet8Mp Wizse · artículo 03-06-1989 · ref. DH-IPC-HFW2841T-ZS · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-053', PROV_OCHOA, 14863.32, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-fija-2mp-3-12mm-dinion-03060536',
    nota: 'Camara Fija 2Mp 3-12Mm Dinion · artículo 03-06-0536 · ref. NBN-50022-V3 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-054', PROV_OCHOA, 17705.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-solar-ip-bullet-4mp-4g-2da-gen-03062164',
    nota: 'Camara Solar Ip Bullet 4Mp 4G 2Da Gen · artículo 03-06-2164 · ref. DH-IPC-HFW2441DG-4G- · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-055', PROV_OCHOA, 19602.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-solar-ptz-3mp-3mp-audio-2way-4g-03062165',
    nota: 'Camara Solar Ptz 3Mp+3Mp Audio 2Way 4G · artículo 03-06-2165 · ref. DH-IPC-PTS2649C-3E3Z · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-056', PROV_OCHOA, 24325.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/flexidome-ip-3000i-ir-domo-fijo-5mp-hdr-03061561',
    nota: 'Flexidome Ip 3000I Ir Domo Fijo 5Mp Hdr · artículo 03-06-1561 · ref. NDE-3503-AL · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-057', PROV_OCHOA, 30360.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/camara-domo-ip-ptz-2mp-25x-zoom-03061806',
    nota: 'Camara Domo Ip Ptz 2Mp 25X Zoom · artículo 03-06-1806 · ref. XPTIE252X · marca EPCOM. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-058', PROV_OCHOA, 6079.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/grabador-xvr-16-2ip-1080n-cooper-ws-03062126',
    nota: 'Grabador Xvr 16 / 2Ip 1080N Cooper Ws · artículo 03-06-2126 · ref. DH-XVR1B16-I · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-059', PROV_OCHOA, 6677.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/dvr-4-canales-5mpx-03060651',
    nota: 'Dvr 4 Canales 5Mpx · artículo 03-06-0651 · ref. MD4LT · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-060', PROV_OCHOA, 7438.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/dvr-medallion-ahd-4canales-960h-03060600',
    nota: 'Dvr Medallion Ahd 4Canales 960H · artículo 03-06-0600 · ref. COR-MD4 · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-061', PROV_OCHOA, 17077.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/grabador-de-video-nvr-16ch-1u-c-16poe-8t-03061732',
    nota: 'Grabador De Video Nvr 16Ch 1U C / 16Poe 8T · artículo 03-06-1732 · ref. NVR302-16S-16P · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-062', PROV_OCHOA, 18426.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/dvr-medallion-ahd-16-canales-03060602',
    nota: 'Dvr Medallion Ahd 16 Canales · artículo 03-06-0602 · ref. COR-MD16LT · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-063', PROV_OCHOA, 20990.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/nvr-32ch-no-poe-serie-4000-ei-2hdd-wizse-03062005',
    nota: 'Nvr 32Ch No Poe Serie 4000-Ei 2Hdd Wizse · artículo 03-06-2005 · ref. DHI-NVR4232-EI · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-064', PROV_OCHOA, 126684.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/nvr-64ch-4k-network-video-recorder-03061805',
    nota: 'Nvr 64Ch 4K Network Video Recorder · artículo 03-06-1805 · ref. NVR308-64X · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-065', PROV_OCHOA, 7633.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/disco-duro-skyhawk-sata-1tb-5900-rpm-03062132',
    nota: 'Disco Duro Skyhawk Sata 1Tb 5900 Rpm · artículo 03-06-2132 · ref. ST1000VX012 · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-066', PROV_OCHOA, 22243.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/disco-duro-sata-p-video-vigilancia-8tb-03061812',
    nota: 'Disco Duro Sata P / Video Vigilancia 8Tb · artículo 03-06-1812 · ref. WD84PURZ · marca MDD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-067', PROV_OCHOA, 2707.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/monitor-contacto-clase-a-4-03060553',
    nota: 'Monitor Contacto Clase A 4\'\' · artículo 03-06-0553 · ref. FLM-325-I4-A · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-068', PROV_OCHOA, 2976.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/monitor-calidad-del-aire-tvoc-03061708',
    nota: 'Monitor Calidad Del Aire Tvoc · artículo 03-06-1708 · ref. AAQS-S01 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-069', PROV_OCHOA, 4362.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/monitor-color-de-3-5-pulgadas-03060485',
    nota: 'Monitor Color De 3.5 Pulgadas · artículo 03-06-0485 · ref. 344502 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-070', PROV_OCHOA, 5692.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/monitor-color-s-telefh-fre-03060358',
    nota: 'Monitor Color S / Telefh / Fre · artículo 03-06-0358 · ref. 331851 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-071', PROV_OCHOA, 7129.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/monitor-color-con-telefcolor-03060359',
    nota: 'Monitor Color Con Telefcolor · artículo 03-06-0359 · ref. 331751 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-072', PROV_OCHOA, 15349.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/monitor-led-cctv-32-pulgadas-03061760',
    nota: 'Monitor Led Cctv 32 Pulgadas · artículo 03-06-1760 · ref. MW3232V-K · marca UNIVIEW. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-073', PROV_OCHOA, 17133.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-camaras-4-wifi-domo-2mp-2-8mm-c-disc-01386132',
    nota: 'Kit Camaras 4 Wifi Domo 2Mp 2.8Mm C / Disc · artículo 01-38-6132 · ref. STD/KIT-4CAMDM · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-074', PROV_OCHOA, 18221.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-camara-4-wifi-bullet-2mp-2-8mm-c-dis-01386133',
    nota: 'Kit Camara 4 Wifi Bullet 2Mp 2.8Mm C / Dis · artículo 01-38-6133 · ref. STD/KIT-4CAMBL · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-075', PROV_OCHOA, 108.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-patch-cord-utp-cat6-slim-2ft-azul-03062158',
    nota: 'Cable Patch Cord. Utp Cat6 Slim 2Ft Azul · artículo 03-06-2158 · ref. PFM972-6U-2FT-S · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-076', PROV_OCHOA, 11275.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat6-int-cert-ul-cobre100-03062152',
    nota: 'Cable Utp Cat6 Int. Cert. Ul Cobre100% · artículo 03-06-2152 · ref. PFM920I-6UN-CN-U-BLA · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-077', PROV_OCHOA, 139.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/placa-de-pared-modular-10g-max-03061375',
    nota: 'Placa De Pared Modular 10G Max · artículo 03-06-1375 · ref. 10GMX-FPS02-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-078', PROV_OCHOA, 612.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/placa-interfaz-colgante-03060542',
    nota: 'Placa Interfaz Colgante · artículo 03-06-0542 · ref. NDA-5031-PIP · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-079', PROV_OCHOA, 3481.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-de-expansion-popex-bg-series-03061193',
    nota: 'Modulo De Expansion Popex Bg-Series · artículo 03-06-1193 · ref. B299 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-080', PROV_OCHOA, 62081.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/amplificador-240w-todo-en-uno-03061291',
    nota: 'Amplificador 240W Todo En Uno · artículo 03-06-1291 · ref. PLN-6AIO240 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-081', PROV_OCHOA, 168.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/soporte-giratorio-para-pared-03061195',
    nota: 'Soporte Giratorio Para Pared · artículo 03-06-1195 · ref. B335-3 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-082', PROV_OCHOA, 331.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/base-estandar-analogica-03061585',
    nota: 'Base Estándar Analógica · artículo 03-06-1585 · ref. FAA-440-B6 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-083', PROV_OCHOA, 657.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caja-de-conexion-108-6x36mm-03061891',
    nota: 'Caja De Conexion 108.6X36Mm · artículo 03-06-1891 · ref. TR-JB03-G-IN · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-084', PROV_OCHOA, 744.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caja-de-conexion-117-8x36mm-03061893',
    nota: 'Caja De Conexion 117.8X36Mm · artículo 03-06-1893 · ref. TR-JB03-I-IN · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-085', PROV_OCHOA, 744.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caja-de-conexion-93x93x39mm-03061894',
    nota: 'Caja De Conexion 93X93X39Mm · artículo 03-06-1894 · ref. TR-JB05-A-IN · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-086', PROV_OCHOA, 751.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caja-de-conexion-126x36mm-03061892',
    nota: 'Caja De Conexion 126X36Mm · artículo 03-06-1892 · ref. TR-JB03-H-IN · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-087', PROV_OCHOA, 762.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/base-para-camara-metalica-03061941',
    nota: 'Base Para Camara Metalica · artículo 03-06-1941 · ref. BCBLK · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-088', PROV_OCHOA, 1068.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/soporte-tubo-colgante-12-03061268',
    nota: 'Soporte Tubo Colgante 12” · artículo 03-06-1268 · ref. NDA-U-PMT · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-089', PROV_OCHOA, 1259.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/soporte-de-pared-y-techo-smb-03060535',
    nota: 'Soporte De Pared Y Techo Smb · artículo 03-06-0535 · ref. NDA-U-PSMB · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-090', PROV_OCHOA, 1284.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/base-unica-4-cables-12-24v-03061594',
    nota: 'Base Unica 4 Cables 12 / 24V · artículo 03-06-1594 · ref. F220-B6PS · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-091', PROV_OCHOA, 1286.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caja-de-conexiones-p-camara-bullet-03061807',
    nota: 'Caja De Conexiones P / Camara Bullet · artículo 03-06-1807 · ref. TR-JB05-A-IN · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-092', PROV_OCHOA, 1445.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/soporte-pared-camara-microdomo-03060530',
    nota: 'Soporte Pared Camara Microdomo · artículo 03-06-0530 · ref. NDA-WMT-MICDOME · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-093', PROV_OCHOA, 1912.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/soporte-p-interior-y-exterior-03060541',
    nota: 'Soporte P / Interior Y Exterior · artículo 03-06-0541 · ref. LTC9215/00 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-094', PROV_OCHOA, 4335.82, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/soporte-de-cuello-de-ganzo-para-domo-ptz-03061809',
    nota: 'Soporte De Cuello De Ganzo Para Domo Ptz · artículo 03-06-1809 · ref. TR-WE45-B-IN · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-095', PROV_OCHOA, 7086.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/carcasa-amc-con-1-rail-din-03061589',
    nota: 'Carcasa Amc Con 1 Raíl Din · artículo 03-06-1589 · ref. AEC-AMC2-UL01 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-096', PROV_OCHOA, 8661.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/carcasa-amc-con-2-rail-din-03061590',
    nota: 'Carcasa Amc Con 2 Raíl Din · artículo 03-06-1590 · ref. AEC-AMC2-UL02 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-097', PROV_OCHOA, 13694.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/switch-8-puertos-100m-poe-2puertos-1000m-03061772',
    nota: 'Switch 8 Puertos 100M Poe+2Puertos 1000M · artículo 03-06-1772 · ref. ST-WI-PS226XT · marca WI-TEK. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-098', PROV_OCHOA, 16692.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/switch-24-puerto-100m-poe-2puertos-1000m-03061733',
    nota: 'Switch 24 Puerto 100M Poe+2Puertos 1000M · artículo 03-06-1733 · ref. WI-PS526G · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-099', PROV_OCHOA, 34654.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/receptor-multicanal-5-2-4k-hdvr-av-negro-03061641',
    nota: 'Receptor Multicanal 5.2 4K Hdvr Av Negro · artículo 03-06-1641 · ref. O-STR/DH590 · marca SONY. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-100', PROV_OCHOA, 1012.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mini-caja-de-conexiones-p-camara-bullet-03061774',
    nota: 'Mini Caja De Conexiones P / Camara Bullet · artículo 03-06-1774 · ref. TR-JB03-I-IN · marca STD. ' + SUPUESTO_ITBIS
  });
  c('MAT-16-101', PROV_OCHOA, 6508.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/homekit-camara-de-video-hub-03061699',
    nota: 'Homekit Camara De Video Hub · artículo 03-06-1699 · ref. HUBG3 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-18-006', PROV_INNOVA, 1695, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/asfalto-en-frio-ecofalt-funda-25-kg-070537',
    nota: 'ASFALTO EN FRIO ECOFALT FUNDA 25 KG · artículo 070537 · marca ECOFALT. ' + SUPUESTO_ITBIS
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
  c('MAT-20-001', PROV_INNOVA, 425, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/angularesperforados/angular-perforado-1-1-3-2x1-1-3-2-7-x10-003678',
    nota: 'ANGULAR PERFORADO 1-1/2X1-1/2"X10\' · artículo 003678 · ref. Angular · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-002', PROV_INNOVA, 360, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/angularesperforados/angular-perforado-1-1-3-2x1-1-3-2-7-x8-003679',
    nota: 'ANGULAR PERFORADO 1-1/2X1-1/2"X8\' · artículo 003679 · ref. Angular · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-003', PROV_OCHOA, 449.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-11-80-lbs-04530002',
    nota: 'Angular H. Negro - 11.80 Lbs · artículo 04-53-0002 · ref. 3/4X1/83MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-004', PROV_OCHOA, 560, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-16-00-lbs-04530007',
    nota: 'Angular H. Negro - 16.00 Lbs · artículo 04-53-0007 · ref. 1X1/83MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-005', PROV_OCHOA, 812.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-23-20-lbs-04530014',
    nota: 'Angular H. Negro - 23.20 Lbs · artículo 04-53-0014 · ref. 1X3/165MM4.5MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-006', PROV_OCHOA, 1163.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-29-80-lbs-04530018',
    nota: 'Angular H. Negro - 29.80 Lbs · artículo 04-53-0018 · ref. 1X1/46MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-007', PROV_OCHOA, 781, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-20-20-lbs-04530012',
    nota: 'Angular H. Negro - 20.20 Lbs · artículo 04-53-0012 · ref. 11/4X1/83MM · marca HN-ANGULARES. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-008', PROV_OCHOA, 1036, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-29-60-lbs-04530017',
    nota: 'Angular H. Negro - 29.60 Lbs · artículo 04-53-0017 · ref. 11/4X3/16=5MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-009', PROV_OCHOA, 1344, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-38-40-lbs-04530024',
    nota: 'Angular H. Negro - 38.40 Lbs · artículo 04-53-0024 · ref. 11/4X1/46MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-010', PROV_OCHOA, 1260, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-36-00-lbs-04530022',
    nota: 'Angular H. Negro - 36.00 Lbs · artículo 04-53-0022 · ref. 11/2X3/16=5MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-011', PROV_OCHOA, 1638.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-46-80-lbs-04530027',
    nota: 'Angular H. Negro - 46.80 Lbs · artículo 04-53-0027 · ref. 11/2X1/4=6MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-012', PROV_OCHOA, 1155, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-33-00-lbs-04530021',
    nota: 'Angular H. Negro - 33.00 Lbs · artículo 04-53-0021 · ref. 2X1/8 · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-013', PROV_OCHOA, 1708, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-48-80-lbs-04530028',
    nota: 'Angular H. Negro - 48.80 Lbs · artículo 04-53-0028 · ref. 2X3/16=5MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-014', PROV_OCHOA, 2324.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-63-80-lbs-04530030',
    nota: 'Angular H. Negro - 63.80 Lbs · artículo 04-53-0030 · ref. 2X1/4=6MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-015', PROV_OCHOA, 3290.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-94-00-lbs-04530035',
    nota: 'Angular H. Negro - 94.00 Lbs · artículo 04-53-0035 · ref. 2X3/89MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-016', PROV_OCHOA, 2149, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-61-40-lbs-04530029',
    nota: 'Angular H. Negro - 61.40 Lbs · artículo 04-53-0029 · ref. 21/2X3/165MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-017', PROV_OCHOA, 2870, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-82-00-lbs-04530034',
    nota: 'Angular H. Negro - 82.00 Lbs · artículo 04-53-0034 · ref. 21/2X1/4 · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-018', PROV_OCHOA, 4130, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-118-00-lbs-04530004',
    nota: 'Angular H. Negro - 118.00 Lbs · artículo 04-53-0004 · ref. 21/2X3/89MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-019', PROV_OCHOA, 3430, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-98-00-lbs-04530036',
    nota: 'Angular H. Negro - 98.00 Lbs · artículo 04-53-0036 · ref. 3X1/4 · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-020', PROV_OCHOA, 5622.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-144-00-lbs-04530006',
    nota: 'Angular H. Negro- 144.00 Lbs · artículo 04-53-0006 · ref. 3X3/89MM · marca HN-ANGULARES. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-021', PROV_OCHOA, 4117.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-h-negro-132-00-lbs-04530005',
    nota: 'Angular H. Negro - 132.00 Lbs · artículo 04-53-0005 · ref. 4X1/46MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-022', PROV_OCHOA, 9995.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-hierro-negro-256-lbs-04530016',
    nota: 'Angular Hierro Negro 256 Lbs · artículo 04-53-0016 · ref. 4X1/212MM · marca HN-ANGULARES. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-023', PROV_OCHOA, 141.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-4-250-lbs-04680031',
    nota: 'Planchuela H. Negro 4.250 Lbs · artículo 04-68-0031 · ref. 1/2X1/83MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-024', PROV_OCHOA, 249.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-6-400-lbs-04680053',
    nota: 'Planchuela H. Negro 6.400 Lbs · artículo 04-68-0053 · ref. 1/2X3/165MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-025', PROV_OCHOA, 331.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-8-500-lbs-04680046',
    nota: 'Planchuela H. Negro 8.500 Lbs · artículo 04-68-0046 · ref. 1/2X1/4 · marca HN-PLANCHUELA. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-026', PROV_OCHOA, 298.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-6-376-lbs-04680039',
    nota: 'Planchuela H. Negro 6.376 Lbs · artículo 04-68-0039 · ref. 3/4X1/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-027', PROV_OCHOA, 373, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-9-564-lbs-04680048',
    nota: 'Planchuela H. Negro 9.564 Lbs · artículo 04-68-0048 · ref. 3/4X3/165MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-028', PROV_OCHOA, 497.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-12-750-lbs-04680007',
    nota: 'Planchuela H. Negro 12.750 Lbs · artículo 04-68-0007 · ref. 3/4X1/4 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-029', PROV_OCHOA, 297.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-8-500-lbs-04680045',
    nota: 'Planchuela H. Negro 8.500 Lbs · artículo 04-68-0045 · ref. 1X1/83MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-030', PROV_OCHOA, 446.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-12-750-lbs-04680006',
    nota: 'Planchuela H. Negro 12.750 Lbs · artículo 04-68-0006 · ref. 1X3/165MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-031', PROV_OCHOA, 595, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-17-000-lbs-04680013',
    nota: 'Planchuela H. Negro 17.000 Lbs · artículo 04-68-0013 · ref. 1X1/46MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-032', PROV_OCHOA, 1327.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-34-000-lbs-04680027',
    nota: 'Planchuela H. Negro 34.000 Lbs · artículo 04-68-0027 · ref. 1X1/212MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-033', PROV_OCHOA, 415.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-10-650-lbs-04680001',
    nota: 'Planchuela H. Negro 10.650 Lbs · artículo 04-68-0001 · ref. 11/4X1/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-034', PROV_OCHOA, 614.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-15-94-lbs-04680010',
    nota: 'Planchuela H. Negro 15.94 Lbs · artículo 04-68-0010 · ref. 11/4X3/16=5MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-035', PROV_OCHOA, 745.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-21-30-lbs-04680020',
    nota: 'Planchuela H. Negro 21.30 Lbs · artículo 04-68-0020 · ref. 11/4X1/46MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-036', PROV_OCHOA, 1115.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-31-878-lbs-04680025',
    nota: 'Planchuela H. Negro 31.878 Lbs · artículo 04-68-0025 · ref. 11/4X3/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-037', PROV_OCHOA, 451.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-12-750-lbs-04680005',
    nota: 'Planchuela H. Negro 12.750 Lbs · artículo 04-68-0005 · ref. 11/2X1/83MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-038', PROV_OCHOA, 682.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-19-500-lbs-04680017',
    nota: 'Planchuela H. Negro 19.500 Lbs · artículo 04-68-0017 · ref. 11/2X3/16=5MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-039', PROV_OCHOA, 892.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-25-500-lbs-04680021',
    nota: 'Planchuela H. Negro 25.500 Lbs · artículo 04-68-0021 · ref. 11/2X1/4=6MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-040', PROV_OCHOA, 1338.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-38-250-lbs-04680029',
    nota: 'Planchuela H. Negro 38.250 Lbs · artículo 04-68-0029 · ref. 11/2X3/89MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-041', PROV_OCHOA, 1991.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-51-000-lbs-04680035',
    nota: 'Planchuela H. Negro 51.000 Lbs · artículo 04-68-0035 · ref. 11/2X1/2 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-042', PROV_OCHOA, 595, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-17-000-lbs-04680014',
    nota: 'Planchuela H. Negro 17.000 Lbs · artículo 04-68-0014 · ref. 2X1/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-043', PROV_OCHOA, 892.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-25-500-lbs-04680023',
    nota: 'Planchuela H. Negro 25.500 Lbs · artículo 04-68-0023 · ref. 2X3/16=5MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-044', PROV_OCHOA, 1189.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-34-000-lbs-04680028',
    nota: 'Planchuela H. Negro 34.000 Lbs · artículo 04-68-0028 · ref. 2X1/4=6MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-045', PROV_OCHOA, 1785, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-51-000-lbs-04680036',
    nota: 'Planchuela H. Negro 51.000 Lbs · artículo 04-68-0036 · ref. 2X3/89MM · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-046', PROV_OCHOA, 2380, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-68-000-lbs-04680041',
    nota: 'Planchuela H. Negro 68.000 Lbs · artículo 04-68-0041 · ref. 2X1/2 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-047', PROV_OCHOA, 1487.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-42-500-lbs-04680033',
    nota: 'Planchuela H. Negro 42.500 Lbs · artículo 04-68-0033 · ref. 21/2X1/4 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-048', PROV_OCHOA, 2231.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-63-760-lbs-04680040',
    nota: 'Planchuela H. Negro 63.760 Lbs · artículo 04-68-0040 · ref. 21/2X3/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-049', PROV_OCHOA, 1785, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-51-000-lbs-04680037',
    nota: 'Planchuela H. Negro 51.000 Lbs · artículo 04-68-0037 · ref. 3X1/4 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-050', PROV_OCHOA, 2677.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-76-500-lbs-04680044',
    nota: 'Planchuela H. Negro 76.500 Lbs · artículo 04-68-0044 · ref. 3X3/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-051', PROV_OCHOA, 2380, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-68-000-lbs-04680042',
    nota: 'Planchuela H. Negro 68.000 Lbs · artículo 04-68-0042 · ref. 4X1/4 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-052', PROV_OCHOA, 3982.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-h-negro-102-000-lbs-04680003',
    nota: 'Planchuela H. Negro 102.000 Lbs · artículo 04-68-0003 · ref. 4X3/8 · marca HN-PLANCHUELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-053', PROV_OCHOA, 1397.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-acero-inox-04680070',
    nota: 'Planchuela Acero Inox. · artículo 04-68-0070 · ref. 2X1/8X20\' · marca INOX-PLANCHUELA. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-054', PROV_OCHOA, 411.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-cuadrada-13-016-170xt-m-04540002',
    nota: 'Barra Cuadrada-13.016 (170Xt.M.) · artículo 04-54-0002 · ref. 7/16"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-055', PROV_OCHOA, 538.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-cuadrada-17-lbs-130xt-m-04540004',
    nota: 'Barra Cuadrada-17 Lbs (130Xt.M) · artículo 04-54-0004 · ref. 1/2"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-056', PROV_OCHOA, 843.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-cuadrada-26-562-lbs-83xt-m-s-d-04540005',
    nota: 'Barra Cuadrada-26.562 Lbs (83Xt.M) S / D · artículo 04-54-0005 · ref. 5/8"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-057', PROV_OCHOA, 238.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-7-510-lbs-296xt-m-04540037',
    nota: 'Barra Redonda-7.510 Lbs(296Xt.M.) · artículo 04-54-0037 · ref. 3/8"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-058', PROV_OCHOA, 421.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-13-352-lbs-166xt-m-04540027',
    nota: 'Barra Redonda-13.352 Lbs(166Xt.M.) · artículo 04-54-0027 · ref. 1/2"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-059', PROV_OCHOA, 660.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-20-862-lbs-106xt-m-04540028',
    nota: 'Barra Redonda-20.862 Lbs(106Xt.M.) · artículo 04-54-0028 · ref. 5/8"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-060', PROV_OCHOA, 945.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-30-040-lbs-74xt-04540030',
    nota: 'Barra Redonda-30.040 Lbs (74Xt) · artículo 04-54-0030 · ref. 3/4"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-061', PROV_OCHOA, 1666.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-redonda-53-408-lbs-42xt-04540035',
    nota: 'Barra Redonda-53.408 Lbs (42Xt) · artículo 04-54-0035 · ref. 1"X20\' · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-062', PROV_OCHOA, 426.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-torneada-170-xt-04540009',
    nota: 'Barra Torneada (170 Xt) · artículo 04-54-0009 · ref. 7/16" · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-063', PROV_OCHOA, 553.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barra-torneada-130-xt-04540008',
    nota: 'Barra Torneada (130 Xt) · artículo 04-54-0008 · ref. 1/2" · marca METALDOM-B. ' + SUPUESTO_ITBIS
  });
  c('MAT-20-064', PROV_OCHOA, 858.38, {
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
  c('MAT-22-001', PROV_INNOVA, 595, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/alambresdetrincheras/alambre-trinchera-jabali-rollo-45-mt-017017',
    nota: 'ALAMBRE TRINCHERA JABALI ROLLO 45 MT · artículo 017017 · ref. Alambre · marca JABALI. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-002', PROV_INNOVA, 995, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/proteccion-verjas/proteccion-verja-3-puya-barra-redonda-060073',
    nota: 'PROTECCION VERJA 3 PUYA BARRA REDONDA · artículo 060073 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-003', PROV_INNOVA, 985, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/proteccion-verjas/proteccion-verja-planchuela-1-mt-039225',
    nota: 'PROTECCION VERJA PLANCHUELA 1 MT · artículo 039225 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-004', PROV_OCHOA, 5223.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-3-43mm-04660038',
    nota: 'Malla Ciclonica 3.43Mm · artículo 04-66-0038 · ref. C-093X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-005', PROV_OCHOA, 6121.98, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-3-43mm-04660039',
    nota: 'Malla Ciclonica 3.43Mm · artículo 04-66-0039 · ref. C-094X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-006', PROV_OCHOA, 9867.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-3-43mm-04660040',
    nota: 'Malla Ciclonica 3.43Mm · artículo 04-66-0040 · ref. C-096X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-007', PROV_OCHOA, 11757.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-rev-en-pvc-3-43mm-04660064',
    nota: 'Malla Ciclonica Rev. En Pvc 3.43Mm · artículo 04-66-0064 · ref. C-96X50VERDE · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-008', PROV_OCHOA, 13273.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-3-43mm-04660051',
    nota: 'Malla Ciclonica 3.43Mm · artículo 04-66-0051 · ref. C-098X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-009', PROV_OCHOA, 527.06, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-galv-p-malla-1-15mm-127xat-04730089',
    nota: 'Tubo Galv P / Malla 1.15Mm (127Xat) · artículo 04-73-0089 · ref. 11/4X20\' · marca TUB-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-010', PROV_OCHOA, 462.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-galv-p-malla-1-15mm-91xat-04730090',
    nota: 'Tubo Galv P / Malla 1.15Mm (91Xat) · artículo 04-73-0090 · ref. 11/2X15\' · marca TUB-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-011', PROV_OCHOA, 699.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-galv-p-malla-1-20mm-61xat-04730516',
    nota: 'Tubo Galv P / Malla 1.20Mm (61Xat) · artículo 04-73-0516 · ref. 2"X20\' · marca TUB-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-012', PROV_OCHOA, 4335.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-c-11-04660035',
    nota: 'Malla Ciclónica C-11 · artículo 04-66-0035 · ref. C-113X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-013', PROV_OCHOA, 8694.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/malla-ciclonica-c-11-04660037',
    nota: 'Malla Ciclónica C-11 · artículo 04-66-0037 · ref. C-116X50 · marca MALLA-C. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-014', PROV_OCHOA, 2601.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-d-puas-premiun-64xpaleta-02450184',
    nota: 'Alambre D / Puas Premiun (64Xpaleta) · artículo 02-45-0184 · ref. 1.50MM250MTS · marca CORVI. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-015', PROV_OCHOA, 2541.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-d-puas-02450221',
    nota: 'Alambre D / Puas · artículo 02-45-0221 · ref. C-15250MTS · marca PATRON. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-016', PROV_OCHOA, 964.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-de-puas-02450003',
    nota: 'Alambre De Púas · artículo 02-45-0003 · ref. C-16110MTS · marca CORVI. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-017', PROV_OCHOA, 2108.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-d-puas-galv-cebu-superior-02450007',
    nota: 'Alambre D / Puas Galv.Cebu(Superior) · artículo 02-45-0007 · ref. C-16250MTS(64XAT) · marca KINNOX. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-017', PROV_OCHOA, 2336.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-de-puas-t-aiwa-02450159',
    nota: 'Alambre De Puas / T Aiwa · artículo 02-45-0159 · ref. C-16250MTS · marca CORVI. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-017', PROV_OCHOA, 3439.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-de-puas-250-mts-02450098',
    nota: 'Alambre De Puas 250 Mts. · artículo 02-45-0098 · ref. C-16250MTS · marca MOTTO. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-018', PROV_OCHOA, 1933.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/alambre-de-puas-250-mts-02450145',
    nota: 'Alambre De Puas 250 Mts. · artículo 02-45-0145 · ref. C-17250MTS · marca TORO. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-019', PROV_OCHOA, 113.78, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-met-d-cuad-p-conejo-29-30kgs-02450118',
    nota: 'Tela Met. D / Cuad. P / Conejo 29.30Kgs · artículo 02-45-0118 · ref. C-161X2X4X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-020', PROV_OCHOA, 192.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-metalica-d-cuadrito-43-50kgs-02450080',
    nota: 'Tela Metalica D / Cuadrito 43.50Kgs · artículo 02-45-0080 · ref. C-181/2X1/2X4X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-021', PROV_OCHOA, 106.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-met-d-cuad-p-conejo-22kgs-02450199',
    nota: 'Tela Met. D / Cuad. P / Conejo 22Kgs · artículo 02-45-0199 · ref. C-181X1/2X3\'X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-022', PROV_OCHOA, 145.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-met-d-cuad-p-conejo-29-30kgs-02450198',
    nota: 'Tela Met. D / Cuad. P / Conejo 29.30Kgs · artículo 02-45-0198 · ref. C-181X1/2X4X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-023', PROV_OCHOA, 37.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-met-d-cuadrito-p-conejo-6-60kgs-02450161',
    nota: 'Tela Met. D / Cuadrito P / Conejo 6.60Kgs · artículo 02-45-0161 · ref. C-201X2X3X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-024', PROV_OCHOA, 72.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-metalica-d-cuadrito-bwg-14kgs-02450032',
    nota: 'Tela Metalica D / Cuadrito Bwg 14Kgs · artículo 02-45-0032 · ref. C-213/8X3/8X3X100 · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-025', PROV_OCHOA, 54.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-p-gallinero-13kgs-02450127',
    nota: 'Tela P / Gallinero 13Kgs · artículo 02-45-0127 · ref. C-193X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-026', PROV_OCHOA, 46.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tela-p-gallinero-11kgs-02450139',
    nota: 'Tela P / Gallinero 11Kgs · artículo 02-45-0139 · ref. C-203X100\' · marca GENER-TELA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-027', PROV_OCHOA, 16.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/abrazadera-p-malla-cicl-04660001',
    nota: 'Abrazadera P / Malla Cicl. · artículo 04-66-0001 · ref. 11/4"CORTA · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-028', PROV_OCHOA, 76.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-pasante-p-malla-cicl-04660023',
    nota: 'Copa Pasante P / Malla Cicl. · artículo 04-66-0023 · ref. 11/4"X11/2" · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-029', PROV_OCHOA, 55.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-tensora-p-malla-ciclonica-04660024',
    nota: 'Copa Tensora P / Malla Ciclonica · artículo 04-66-0024 · ref. 11/4" · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-030', PROV_OCHOA, 36.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-terminal-p-tubo-malla-04660026',
    nota: 'Copa Terminal P / Tubo Malla · artículo 04-66-0026 · ref. 11/4"(TAPON) · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-031', PROV_OCHOA, 60.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/union-p-tubo-de-malla-04660280',
    nota: 'Union P / Tubo De Malla · artículo 04-66-0280 · ref. 11/4"REFORZADA · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-032', PROV_OCHOA, 19.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/abrazadera-p-malla-cicl-04660003',
    nota: 'Abrazadera P / Malla Cicl. · artículo 04-66-0003 · ref. 11/2"CORTA · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-033', PROV_OCHOA, 28.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/abrazadera-p-malla-cicl-04660002',
    nota: 'Abrazadera P / Malla Cicl. · artículo 04-66-0002 · ref. 11/2"LARGA-S/TORN. · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-034', PROV_OCHOA, 187.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-p-malla-ciclonica-doble-04660017',
    nota: 'Brazo P / Malla Ciclonica Doble · artículo 04-66-0017 · ref. 11/2X11/4 · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-035', PROV_OCHOA, 124.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-sencillo-p-malla-especial-04660251',
    nota: 'Brazo Sencillo P / Malla Especial · artículo 04-66-0251 · ref. 11/2X11/4 · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-036', PROV_OCHOA, 76.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-pasante-p-malla-cicl-04660021',
    nota: 'Copa Pasante P / Malla Cicl. · artículo 04-66-0021 · ref. 11/2"X11/2" · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-037', PROV_OCHOA, 61.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-terminal-p-tubo-malla-04660091',
    nota: 'Copa Terminal P / Tubo Malla · artículo 04-66-0091 · ref. 11/2(TAPON) · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-038', PROV_OCHOA, 21.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/abrazadera-p-malla-cicl-04660006',
    nota: 'Abrazadera P / Malla Cicl. · artículo 04-66-0006 · ref. 2"CORTA · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-039', PROV_OCHOA, 20.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/abrazadera-p-malla-ciclonica-04660007',
    nota: 'Abrazadera P / Malla Ciclonica · artículo 04-66-0007 · ref. 2"LARGA-S/TORN. · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-040', PROV_OCHOA, 187.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-para-malla-ciclonica-04660242',
    nota: 'Brazo Para Malla Ciclonica · artículo 04-66-0242 · ref. 2X11/4SENCILLA · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-041', PROV_OCHOA, 373.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-doble-p-tubo-malla-04660319',
    nota: 'Brazo Doble P / Tubo Malla · artículo 04-66-0319 · ref. 2X11/2 · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-042', PROV_OCHOA, 51.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/copa-terminal-p-tubo-malla-04660029',
    nota: 'Copa Terminal P / Tubo Malla · artículo 04-66-0029 · ref. 2"(TAPON) · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-043', PROV_OCHOA, 300.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/brazo-p-malla-ciclonica-04660326',
    nota: 'Brazo P / Malla Ciclonica · artículo 04-66-0326 · ref. 23/8X11/2 · marca ACC-MALLA. ' + SUPUESTO_ITBIS
  });
  c('MAT-22-044', PROV_OCHOA, 36.5, {
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
  c('MAT-23-006', PROV_INNOVA, 750, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/productosdealuminio/angular-aluminio-1x1-7-x19-032503',
    nota: 'ANGULAR ALUMINIO 1X1"X19\' · artículo 032503 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-007', PROV_INNOVA, 398, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://www.innovacentro.com.do/productosdealuminio/angular-aluminio-3-3-4x1-3-2-7-x19-046361',
    nota: 'ANGULAR ALUMINIO 3/4X1/2"X19\' · artículo 046361 · marca INNOMATE. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-008', PROV_OCHOA, 827.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/moldura-u-d-aluminio-can-007-04530108',
    nota: 'Moldura ”U” D / Aluminio Can.007 · artículo 04-53-0108 · ref. 5/8X5/8X19.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-009', PROV_OCHOA, 772.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-red-d-alum-tubor0013-04730057',
    nota: 'Tubo Red. D / Alum. Tubor0013 · artículo 04-73-0057 · ref. 3/4"(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-010', PROV_OCHOA, 436.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-de-aluminio-19-20cm-04530111',
    nota: 'Angular De Aluminio 19.20Cm · artículo 04-53-0111 · ref. 3/4X3/4X19.20 · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-011', PROV_OCHOA, 957.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-red-d-aluminio-tubor0021-04730053',
    nota: 'Tubo Red.D / Aluminio Tubor0021 · artículo 04-73-0053 · ref. 1"(19.20PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-012', PROV_OCHOA, 1709.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-d-aluminio-plati0020-04680050',
    nota: 'Planchuela D / Aluminio Plati0020 · artículo 04-68-0050 · ref. 1X1/4X19.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-013', PROV_OCHOA, 626.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-d-aluminio-ea-046-04530084',
    nota: 'Angular D / Aluminio Ea-046 · artículo 04-53-0084 · ref. 1X3/4(19.20PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-014', PROV_OCHOA, 1336.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-aluminio-tubo-et076-04670007',
    nota: 'Perfil Aluminio (Tubo Et076) · artículo 04-67-0007 · ref. 1X1"(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-015', PROV_OCHOA, 2185.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tubo-red-d-alum-tubor0028-04730051',
    nota: 'Tubo Red.D / Alum. Tubor0028 · artículo 04-73-0051 · ref. 11/4"X(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-016', PROV_OCHOA, 982.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-d-alum-ea014-19-20-pie-04530113',
    nota: 'Angular D / Alum. Ea014 (19.20 Pie) · artículo 04-53-0113 · ref. 11/4X11/4 · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-017', PROV_OCHOA, 2567.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-d-alum-plati0032-04540065',
    nota: 'Planchuela D / Alum Plati0032 · artículo 04-54-0065 · ref. 11/2X1/4(19.20P · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-018', PROV_OCHOA, 1117.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/moldura-d-aluminio-u-eu071-04530099',
    nota: 'Moldura D / Aluminio ”U” Eu071 · artículo 04-53-0099 · ref. 11/2X3/4X19.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-019', PROV_OCHOA, 2473.52, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-d-aluminio-angu0019-04530114',
    nota: 'Angular D / Aluminio Angu0019 · artículo 04-53-0114 · ref. 11/2X11/2(19.20P · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-020', PROV_OCHOA, 1701.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-cuad-d-alum-et087-tuboca0087-04670194',
    nota: 'Perfil Cuad. D / Alum.Et087 Tuboca0087 · artículo 04-67-0194 · ref. 11/2X11/2(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-021', PROV_OCHOA, 1846.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-alum-et117-rect0117-04670073',
    nota: 'Perfil Rect. Alum. Et117 Rect0117 · artículo 04-67-0073 · ref. 2X1(19.2PIE) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-022', PROV_OCHOA, 3334.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/angular-d-alum-1-8-angu0027-04530115',
    nota: 'Angular D / Alum. 1 / 8 Angu0027 · artículo 04-53-0115 · ref. 2X2X19.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-023', PROV_OCHOA, 2695.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-d-alum-plati0051-04540066',
    nota: 'Planchuela D / Alum Plati0051 · artículo 04-54-0066 · ref. 3"X3/16(19.20PI) · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-024', PROV_OCHOA, 3956.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/perfil-rect-d-aluminio-et103-04670080',
    nota: 'Perfil Rect. D / Aluminio Et103 · artículo 04-67-0080 · ref. 3X11/2X(19.2PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-025', PROV_OCHOA, 3464.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/planchuela-d-alumino-plati0059-04540067',
    nota: 'Planchuela D / Alumino Plati0059 · artículo 04-54-0067 · ref. 4"X1/819.20PIE · marca EMMA. ' + SUPUESTO_ITBIS
  });
  c('MAT-23-026', PROV_OCHOA, 5142.65, {
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
  c('MAT-27-010', PROV_OCHOA, 4472.06, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/dispensador-de-toalla-papel-gm-ai-01112869',
    nota: 'Dispensador De Toalla Papel Gm Ai · artículo 01-11-2869 · ref. MB-2512 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-011', PROV_OCHOA, 14903.09, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/dispensador-de-jabon-cumberland-01112824',
    nota: 'Dispensador De Jabon Cumberland · artículo 01-11-2824 · ref. Z6956-SD · marca ZURN. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-012', PROV_OCHOA, 15547.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/dosificador-jabon-espuma-elec-bat-01112821',
    nota: 'Dosificador Jabon Espuma Elec Bat · artículo 01-11-2821 · ref. MB1101 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-013', PROV_OCHOA, 16368.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/secador-d-manos-con-boton-acc-01112568',
    nota: 'Secador D / Manos Con Boton Acc · artículo 01-11-2568 · ref. MB-1011 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-014', PROV_OCHOA, 18390.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/secador-de-mano-c-sensor-alumin-negro-01112828',
    nota: 'Secador De Mano C / Sensor Alumin Negro · artículo 01-11-2828 · ref. Q-162A2 · marca WORLD DRYER. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-015', PROV_OCHOA, 27487.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/secador-de-manos-turbo-01112748',
    nota: 'Secador De Manos Turbo · artículo 01-11-2748 · ref. MB-1012 · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-016', PROV_OCHOA, 32765.78, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/secador-manos-c-sensor-turbo-elec-ace-i-01112773',
    nota: 'Secador Manos C / Sensor Turbo Elec. Ace.I · artículo 01-11-2773 · ref. MB-1012AI · marca HELVEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-017', PROV_OCHOA, 63455.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/secador-de-mano-automatico-plateado-abs-01112830',
    nota: 'Secador De Mano Automatico Plateado Abs · artículo 01-11-2830 · ref. V-649A · marca WORLD DRYER. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-018', PROV_OCHOA, 345.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorio-p-bano-jgo-01110270',
    nota: 'Accesorio P / Bano Jgo · artículo 01-11-0270 · ref. SPC-549-P05 · marca SPC. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-019', PROV_OCHOA, 940.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorio-p-bano-jgo-5-pieza-01112799',
    nota: 'Accesorio P / Bano Jgo (5 Pieza) · artículo 01-11-2799 · ref. 12966 · marca EZ-FLO/EASTMAN. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-020', PROV_OCHOA, 1081.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-3pzas-burdeos-01100350',
    nota: 'Kit Acc. Bano 3Pzas.Burdeos · artículo 01-10-0350 · ref. 601/3-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-021', PROV_OCHOA, 1342.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-01101368',
    nota: 'Kit Acc. Bano 6Pzas. · artículo 01-10-1368 · ref. 73700 · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-022', PROV_OCHOA, 1598.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-burdeos-01100275',
    nota: 'Kit Acc. Bano 6Pzas.Burdeos · artículo 01-10-0275 · ref. 601/6-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-023', PROV_OCHOA, 1605.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-prem-4pzas-01101303',
    nota: 'Kit Accesorios P / Bano Prem 4Pzas · artículo 01-10-1303 · ref. IB904CR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-024', PROV_OCHOA, 1638.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6-pzas-cuenca-01100947',
    nota: 'Kit Acc. Bano 6 Pzas Cuenca · artículo 01-10-0947 · ref. 1300/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-025', PROV_OCHOA, 1673.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-acce-p-bano-3-pzas-brushed-nickel-01101379',
    nota: 'Kit De Acce P / Baño 3 Pzas Brushed Nickel · artículo 01-10-1379 · ref. IB-3M-303BN · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-026', PROV_OCHOA, 1673.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-p-bano-3-piezas-negro-01101378',
    nota: 'Kit De Accesorios P / Baño 3 Piezas Negro · artículo 01-10-1378 · ref. IB-3M-303BK · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-027', PROV_OCHOA, 1709.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-p-indoro-d-flush-01045589',
    nota: 'Kit P / Indoro D / Flush · artículo 01-04-5589 · ref. 4451 · marca FLEXIMATIC. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-028', PROV_OCHOA, 1773, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-d-instalacion-p-inodoro-01045375',
    nota: 'Kit D / Instalacion P / Inodoro · artículo 01-04-5375 · ref. 400AK · marca FLUIDMASTERINC. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-029', PROV_OCHOA, 1798.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-para-bano-huelva-01100057',
    nota: 'Accesorios Para Baño Huelva · artículo 01-10-0057 · ref. 1801/6-ASCROMO/MATE · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-030', PROV_OCHOA, 1813.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-acceso-p-bano-4-pzas-brush-nickel-01101381',
    nota: 'Kit De Acceso P / Baño 4 Pzas Brush Nickel · artículo 01-10-1381 · ref. IB-3M-404BN · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-031', PROV_OCHOA, 1839.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorio-6-pzas-vigo-01100693',
    nota: 'Kit Accesorio 6 Pzas. Vigo · artículo 01-10-0693 · ref. 2200/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-032', PROV_OCHOA, 1876.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6-pzas-granada-01100948',
    nota: 'Kit Acc. Bano 6 Pzas Granada · artículo 01-10-0948 · ref. 2700-6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-033', PROV_OCHOA, 1980.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-para-banos-01100949',
    nota: 'Kit De Accesorios Para Baños · artículo 01-10-0949 · ref. 17700-6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-033', PROV_OCHOA, 3572.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-para-banos-01101119',
    nota: 'Kit De Accesorios Para Baños · artículo 01-10-1119 · ref. 7500/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-033', PROV_OCHOA, 538.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-para-banos-01101121',
    nota: 'Kit De Accesorios Para Baños · artículo 01-10-1121 · ref. 33300/3-ABS · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-033', PROV_OCHOA, 349.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-para-banos-01101122',
    nota: 'Kit De Accesorios Para Baños · artículo 01-10-1122 · ref. 32900/3-ABS · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-034', PROV_OCHOA, 1984.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-para-bano-burdeos-01100172',
    nota: 'Accesorios Para Baño Burdeos · artículo 01-10-0172 · ref. 601/6-AGCROMO/ORO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-035', PROV_OCHOA, 2072.07, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-de-bano-cali-6-piezas-cro-01101548',
    nota: 'Kit Accesorios De Baño Cali 6 Piezas Cro · artículo 01-10-1548 · ref. TB57200/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-036', PROV_OCHOA, 2083.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-quito-cr-01101214',
    nota: 'Kit Accesorios P / Bano Quito Cr · artículo 01-10-1214 · ref. TBF5100/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-037', PROV_OCHOA, 2297.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-para-banos-01100171',
    nota: 'Kit De Accesorios Para Baños · artículo 01-10-0171 · ref. 1801/6-ACROMO · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-038', PROV_OCHOA, 2327.23, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pz-cromo-01101539',
    nota: 'Kit Acc. Baño 6Pz Cromo · artículo 01-10-1539 · ref. 19100-CR · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-039', PROV_OCHOA, 2407.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pz-matte-black-01101540',
    nota: 'Kit Acc. Baño 6Pz Matte Black · artículo 01-10-1540 · ref. 19100-BM · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-040', PROV_OCHOA, 2638.09, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-livorno-cr-01101216',
    nota: 'Kit Accesorios P / Bano Livorno Cr · artículo 01-10-1216 · ref. TB8900/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-041', PROV_OCHOA, 2920.29, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-milano-cr-01101215',
    nota: 'Kit Accesorios P / Bano Milano Cr · artículo 01-10-1215 · ref. TB8600/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-042', PROV_OCHOA, 2922.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-amalfi-cromo-01101523',
    nota: 'Kit Acc. Bano 6Pzas. Amalfi Cromo · artículo 01-10-1523 · ref. TAB54/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-043', PROV_OCHOA, 2939.75, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-dublin-cr-01101218',
    nota: 'Kit Accesorios P / Bano Dublin Cr · artículo 01-10-1218 · ref. TB7100/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-044', PROV_OCHOA, 3064.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-accesorios-p-bano-4-pzas-negro-01101380',
    nota: 'Kit De Accesorios P / Baño 4 Pzas Negro · artículo 01-10-1380 · ref. IB-3M-404BK · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-045', PROV_OCHOA, 3070.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-valencia-01101551',
    nota: 'Kit Acc. Bano 6Pzas. Valencia · artículo 01-10-1551 · ref. TB71100-BR · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-046', PROV_OCHOA, 3143.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-6-pzas-accesorio-bano-luxury-sat-01100671',
    nota: 'Kit 6 Pzas. Accesorio Bano Luxury Sat · artículo 01-10-0671 · ref. IB806BR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-047', PROV_OCHOA, 3187.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-lazio-cromo-01101522',
    nota: 'Kit Acc. Bano 6Pzas. Lazio Cromo · artículo 01-10-1522 · ref. TAB53/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-048', PROV_OCHOA, 3266.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pz-brush-golden-01101541',
    nota: 'Kit Acc. Baño 6Pz Brush Golden · artículo 01-10-1541 · ref. 19100-BG · marca ULTRA. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-049', PROV_OCHOA, 3318.89, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-dubai-gold-matt-01101374',
    nota: 'Kit Acc. Bano 6Pzas. Dubai Gold Matt · artículo 01-10-1374 · ref. TB81900/6-MG · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-050', PROV_OCHOA, 3360.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-6-pzas-accesorio-bano-luxury-cromo-01100670',
    nota: 'Kit 6 Pzas. Accesorio Bano Luxury Cromo · artículo 01-10-0670 · ref. IB806CR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-051', PROV_OCHOA, 3453.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-bergamo-01101327',
    nota: 'Kit Acc. Bano 6Pzas.Bergamo · artículo 01-10-1327 · ref. TB17A/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-052', PROV_OCHOA, 3470.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-bergamo-ss-bn-01101220',
    nota: 'Kit Accesorios P / Bano Bergamo Ss-Bn · artículo 01-10-1220 · ref. TB17A-SS/6-BN · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-053', PROV_OCHOA, 3610.88, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-verona-01101342',
    nota: 'Kit Acc. Bano 6Pzas.Verona · artículo 01-10-1342 · ref. TB622001/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-054', PROV_OCHOA, 3628.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-dubai-brush-nickel-01101373',
    nota: 'Kit Acc. Bano 6Pzas. Dubai Brush Nickel · artículo 01-10-1373 · ref. TB81900/6-BN · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-055', PROV_OCHOA, 3629.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-banos-6-pzas-devon-01101481',
    nota: 'Kit Acc. Banos 6 Pzas. Devon · artículo 01-10-1481 · ref. TB22601/6-BL · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-056', PROV_OCHOA, 3966.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-livorno-brush-nick-01101221',
    nota: 'Kit Accesorios P / Bano Livorno Brush Nick · artículo 01-10-1221 · ref. TB8900/6-BN · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-057', PROV_OCHOA, 3967.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-lugano-01101318',
    nota: 'Kit Acc. Bano 6Pzas. Lugano · artículo 01-10-1318 · ref. TB7500/6-BL · marca TILBY-GR. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-058', PROV_OCHOA, 4100.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-banos-6-pzas-malaga-01100661',
    nota: 'Kit Acc. Banos 6 Pzas. Malaga · artículo 01-10-0661 · ref. 16100/6-ACER · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-059', PROV_OCHOA, 4178.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pz-gold-01101543',
    nota: 'Kit Acc Bano 6Pz Gold · artículo 01-10-1543 · ref. IB-706-GOLD · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-060', PROV_OCHOA, 4228.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-accesorios-p-bano-prem-6pzas-01101302',
    nota: 'Kit Accesorios P / Bano Prem 6Pzas · artículo 01-10-1302 · ref. IB906CR · marca INEX. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-061', PROV_OCHOA, 4323.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acces-bano-livorno-6pzas-oil-brush-01101310',
    nota: 'Kit Acces.Bano Livorno 6Pzas Oil Brush · artículo 01-10-1310 · ref. TB8900/6-ORB · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-062', PROV_OCHOA, 4372.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-acc-bano-6pzas-ajaccio-01101552',
    nota: 'Kit Acc. Bano 6Pzas. Ajaccio · artículo 01-10-1552 · ref. TB25100-BR · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-063', PROV_OCHOA, 4513.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-para-bano-linz-01101343',
    nota: 'Accesorios Para Baño Linz · artículo 01-10-1343 · ref. TB1114001/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-064', PROV_OCHOA, 5068.78, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-para-bano-venecia-01101340',
    nota: 'Accesorios Para Baño Venecia · artículo 01-10-1340 · ref. TBZ279001/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-27-065', PROV_OCHOA, 6703.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-para-bano-lazio-01101339',
    nota: 'Accesorios Para Baño Lazio · artículo 01-10-1339 · ref. TB5001/6-A · marca TILBY-KIT. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-001', PROV_OCHOA, 4948.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/panel-p-control-lcd-03060447',
    nota: 'Panel P / Control Lcd · artículo 03-06-0447 · ref. VOX-OUT · marca AMC. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-002', PROV_OCHOA, 7194.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/panel-de-control-ip-28-zonas-03060572',
    nota: 'Panel De Control Ip 28 Zonas · artículo 03-06-0572 · ref. B4512 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-003', PROV_OCHOA, 8277.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/panel-de-control-ip-48-zonas-03060573',
    nota: 'Panel De Control Ip 48 Zonas · artículo 03-06-0573 · ref. B5512 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-004', PROV_OCHOA, 10609.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/panel-control-de-pared-plena-03061289',
    nota: 'Panel Control De Pared Plena · artículo 03-06-1289 · ref. PLM-WCP · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-005', PROV_OCHOA, 11910.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/central-d-seguridad-con-vesta-243-03061842',
    nota: 'Central D / Seguridad Con Vesta-243 · artículo 03-06-1842 · ref. VESTALITE · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-006', PROV_OCHOA, 13889.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/central-vesta-d-seguridad-ip-4g-320zonas-03061821',
    nota: 'Central Vesta D / Seguridad Ip+4G 320Zonas · artículo 03-06-1821 · ref. V047N-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-007', PROV_OCHOA, 19216.09, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/central-hibrida-vestade-hasta-320-zonas-03061814',
    nota: 'Central Híbrida Vestade Hasta 320 Zonas · artículo 03-06-1814 · ref. V113N-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-008', PROV_OCHOA, 19632.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/central-d-seguridad-ip-c-vesta-047n-03061843',
    nota: 'Central D / Seguridad Ip C / Vesta-047N · artículo 03-06-1843 · ref. VESTA4G · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-009', PROV_OCHOA, 23000.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/panel-de-control-32-areas-03061201',
    nota: 'Panel De Control 32-Areas · artículo 03-06-1201 · ref. B9512G · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-010', PROV_OCHOA, 3449.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/teclado-basico-2-lineas-03060574',
    nota: 'Teclado Basico 2 Lineas · artículo 03-06-0574 · ref. B915 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-011', PROV_OCHOA, 3869.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/teclado-inalambrico-c-lector-de-proximi-03061846',
    nota: 'Teclado Inalambrico C / Lector De Proximi · artículo 03-06-1846 · ref. VESTA-012-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-012', PROV_OCHOA, 5376.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/teclado-con-funciones-b920-03060575',
    nota: 'Teclado Con Funciones B920 · artículo 03-06-0575 · ref. B920 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-013', PROV_OCHOA, 5376.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/teclado-de-control-y-anunciador-lcd-03060501',
    nota: 'Teclado De Control Y Anunciador Lcd · artículo 03-06-0501 · ref. FMR-7033 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-014', PROV_OCHOA, 6547.98, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/teclado-capacitvo-2lineas-03061198',
    nota: 'Teclado Capacitvo 2Lineas · artículo 03-06-1198 · ref. B921C · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-015', PROV_OCHOA, 7211.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/teclado-para-fuego-e-intrusion-03061199',
    nota: 'Teclado Para Fuego E Intrusión · artículo 03-06-1199 · ref. B925F · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-016', PROV_OCHOA, 7359.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/teclado-inalam-c-lector-d-prox-sirena-03061847',
    nota: 'Teclado Inalam. C / Lector D / Prox.+Sirena · artículo 03-06-1847 · ref. VESTA-307-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-017', PROV_OCHOA, 7523.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/teclado-rf-f1-cableado-c-lector-mifare-03061844',
    nota: 'Teclado Rf(F1)+Cableado C / Lector Mifare · artículo 03-06-1844 · ref. VESTA-125N-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-018', PROV_OCHOA, 13205.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/teclado-tactil-03060576',
    nota: 'Teclado Tactil · artículo 03-06-0576 · ref. B942W · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-019', PROV_OCHOA, 696.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/contactos-de-puerta-03060597',
    nota: 'Contactos De Puerta · artículo 03-06-0597 · ref. ISN-CMET-4418 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-020', PROV_OCHOA, 754.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-flexion-inalambrico-03094698',
    nota: 'Sensor De Flexion Inalambrico · artículo 03-09-4698 · ref. SFI3577172 · marca LINSEG. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-021', PROV_OCHOA, 784.09, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-magnetico-p-puertas-y-ventanas-03060444',
    nota: 'Sensor Magnetico P / Puertas Y Ventanas · artículo 03-06-0444 · ref. CM-400 · marca AMC. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-022', PROV_OCHOA, 820.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-movimiento-infrarojo-12mt-03060590',
    nota: 'Detector Movimiento Infrarojo 12Mt · artículo 03-06-0590 · ref. ISC-BPR2-WP12 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-023', PROV_OCHOA, 914.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-presencia-03060443',
    nota: 'Sensor De Presencia · artículo 03-06-0443 · ref. IF-400 · marca AMC. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-024', PROV_OCHOA, 1402.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-ocupacion-cx-100-03061060',
    nota: 'Sensor De Ocupación Cx-100 · artículo 03-06-1060 · ref. CX-100 · marca WATTSTOPPER. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-025', PROV_OCHOA, 1499.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-us-500pies-24v-03061059',
    nota: 'Sensor Us 500Pies 24V · artículo 03-06-1059 · ref. W-500A · marca WATTSTOPPER. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-026', PROV_OCHOA, 1559.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/contacto-magnetico-inalambrico-vesta-03061817',
    nota: 'Contacto Magnético Inalambrico Vesta · artículo 03-06-1817 · ref. V013-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-027', PROV_OCHOA, 1601.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-movimiento-blueline-12mt-03060591',
    nota: 'Detector Movimiento Blueline 12Mt · artículo 03-06-0591 · ref. ISC-BDL2-WP12G · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-028', PROV_OCHOA, 1624.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-de-salida-sns-03060594',
    nota: 'Detector De Salida Sns · artículo 03-06-0594 · ref. DS151I · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-029', PROV_OCHOA, 1786.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/contacto-magnetico-inalambrico-03061848',
    nota: 'Contacto Magnético Inalambrico · artículo 03-06-1848 · ref. VESTA-019N-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-030', PROV_OCHOA, 1989.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/contacto-montaje-superficie-inalambrico-03061297',
    nota: 'Contacto Montaje Superficie Inalámbrico · artículo 03-06-1297 · ref. RFDW-SM-A · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-031', PROV_OCHOA, 2155.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detectores-de-salida-sns-03061204',
    nota: 'Detectores De Salida Sns · artículo 03-06-1204 · ref. DS160 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-032', PROV_OCHOA, 2242.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-pir-120v-03061062',
    nota: 'Sensor Pir 120V · artículo 03-06-1062 · ref. WS-250-W · marca WATTSTOPPER. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-033', PROV_OCHOA, 2323.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-moviemiento-tritech-03061509',
    nota: 'Detector Moviemiento Tritech · artículo 03-06-1509 · ref. ISC-PDL1-W18G · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-034', PROV_OCHOA, 2409.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-de-vibracion-y-rotura-de-crista-03061850',
    nota: 'Detector De Vibración Y Rotura De Crista · artículo 03-06-1850 · ref. VESTA-040-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-035', PROV_OCHOA, 2675.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-pir-inalambrico-15m-130grad-03061849',
    nota: 'Detector Pir Inalambrico 15M 130Grad. · artículo 03-06-1849 · ref. VESTA-177-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-036', PROV_OCHOA, 2944.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-movimiento-16m-03061549',
    nota: 'Detector Movimiento 16M · artículo 03-06-1549 · ref. ISC-PPR1-WA16G · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-037', PROV_OCHOA, 4061.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-movimiento-inalambrico-12m-03061303',
    nota: 'Detector Movimiento Inalámbrico, 12M · artículo 03-06-1303 · ref. RFPR-12-A · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-038', PROV_OCHOA, 4246.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-pir-120v-1200pies-03061058',
    nota: 'Sensor Pir 120V 1200Pies · artículo 03-06-1058 · ref. CI-355 · marca WATTSTOPPER. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-039', PROV_OCHOA, 4381.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-movimiento-exterior-tritech-03060593',
    nota: 'Detector Movimiento Exterior Tritech · artículo 03-06-0593 · ref. OD850-F1 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-040', PROV_OCHOA, 5338.48, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-inalambrico-d-doble-tecn-12m-03061852',
    nota: 'Detector Inalambrico D / Doble Tecn. 12M · artículo 03-06-1852 · ref. VESTA-151-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-041', PROV_OCHOA, 5567.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-movimiento-inalambrico-11m-03061295',
    nota: 'Detector Movimiento Inalámbrico, 11M · artículo 03-06-1295 · ref. RFDL-11-A · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-042', PROV_OCHOA, 5604.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-de-humo-multifucional-pir-6m-03061853',
    nota: 'Detector De Humo Multifucional Pir 6M · artículo 03-06-1853 · ref. VESTA-336-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-043', PROV_OCHOA, 6462.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-dual-120v-360gr-03061061',
    nota: 'Sensor Dual 120V 360Gr · artículo 03-06-1061 · ref. DT-355 · marca WATTSTOPPER. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-044', PROV_OCHOA, 7135.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-pir-inalambrico-de-exterior-10m-03061854',
    nota: 'Detector Pir Inalambrico De Exterior 10M · artículo 03-06-1854 · ref. VESTA-036-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-045', PROV_OCHOA, 7155.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-pircam-para-interior-03061855',
    nota: 'Detector Pircam Para Interior · artículo 03-06-1855 · ref. VESTA-270-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-046', PROV_OCHOA, 11447.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-pircam-inalambrico-p-exterior-03061856',
    nota: 'Detector Pircam Inalambrico P / Exterior · artículo 03-06-1856 · ref. VESTA-347-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-047', PROV_OCHOA, 713.99, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sirena-de-12v-30w-blanca-03061782',
    nota: 'Sirena De 12V 30W Blanca · artículo 03-06-1782 · ref. 000898 · marca LINSEG. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-048', PROV_OCHOA, 3381.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sirena-inalambrica-interior-95db-a-10m-03061857',
    nota: 'Sirena Inalambrica Interior 95Db A 10M · artículo 03-06-1857 · ref. VESTA-373-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-049', PROV_OCHOA, 5053.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sirena-exterior-104db-a-1-metro-03061858',
    nota: 'Sirena Exterior 104Db A 1 Metro · artículo 03-06-1858 · ref. VESTA-107N-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-050', PROV_OCHOA, 8877.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/bocina-mini-24vdc-102db-03061490',
    nota: 'Bocina Mini 24Vdc 102Db · artículo 03-06-1490 · ref. MN530GB · marca TUTONDO. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-051', PROV_OCHOA, 15935.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/bocina-oli-24v-30w-negra-03060717',
    nota: 'Bocina Oli 24V 30W Negra · artículo 03-06-0717 · ref. OL530C2N · marca TUTONDO. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-052', PROV_OCHOA, 39917.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/bocina-esferica-multiposicion-2vias-120w-03060725',
    nota: 'Bocina Esferica Multiposicion 2Vias 120W · artículo 03-06-0725 · ref. SX33ASLMC · marca TUTONDO. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-053', PROV_OCHOA, 49478.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/bocina-esferica-p-piso-2vias-120w-03060724',
    nota: 'Bocina Esferica P / Piso 2Vias 120W · artículo 03-06-0724 · ref. SX31ASLMC · marca TUTONDO. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-054', PROV_OCHOA, 2022.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pulsador-de-panico-1-boton-03061301',
    nota: 'Pulsador De Pánico, 1 Botón · artículo 03-06-1301 · ref. RFPB-SB-A · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-055', PROV_OCHOA, 5449.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lector-tarjeta-iclass-wiegand-7-6cm-03060566',
    nota: 'Lector Tarjeta Iclass Wiegand 7.6Cm · artículo 03-06-0566 · ref. ARD-SER10-WI · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-056', PROV_OCHOA, 8723.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/control-acceso-para-puerta-03060577',
    nota: 'Control Acceso Para Puerta · artículo 03-06-0577 · ref. B901 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-057', PROV_OCHOA, 10566.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/control-acceso-prox-ext-c-teclado-03060643',
    nota: 'Control Acceso Prox.Ext.C / Teclado · artículo 03-06-0643 · ref. COR-ACC970 · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-057', PROV_OCHOA, 8365.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/control-acceso-prox-ext-c-teclado-03060644',
    nota: 'Control Acceso Prox.Ext.C / Teclado · artículo 03-06-0644 · ref. COR-ACC980 · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-058', PROV_OCHOA, 11217.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lector-tarjeta-iclass-wiegand-11-4cm-03060567',
    nota: 'Lector Tarjeta Iclass Wiegand 11.4Cm · artículo 03-06-0567 · ref. ARD-SER40-WI · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-059', PROV_OCHOA, 12767.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/control-acceso-ip-ext-c-teclado-03060645',
    nota: 'Control Acceso Ip Ext.C / Teclado · artículo 03-06-0645 · ref. COR-ACC980IP · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-060', PROV_OCHOA, 13952.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lector-tarjeta-iclass-37bit-03060569',
    nota: 'Lector Tarjeta Iclass 37Bit · artículo 03-06-0569 · ref. ACD-IC2K37-50 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-061', PROV_OCHOA, 16289.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/control-acceso-biometrico-huella-net-03060636',
    nota: 'Control Acceso Biometrico / Huella Net · artículo 03-06-0636 · ref. COR-ACC890BIO · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-062', PROV_OCHOA, 31872.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/lector-tarjeta-iclass-wiegand-33-6cm-03060568',
    nota: 'Lector Tarjeta Iclass Wiegand 33.6Cm · artículo 03-06-0568 · ref. ARD-SER90-WI · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-063', PROV_OCHOA, 34781.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/control-acceso-p-12-salidas-network-03060631',
    nota: 'Control Acceso P / 12 Salidas Network · artículo 03-06-0631 · ref. COR-ACC1000 · marca CCTV CORE. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-064', PROV_OCHOA, 48902.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/control-de-acceso-con-huella-03061190',
    nota: 'Control De Acceso Con Huella · artículo 03-06-1190 · ref. ARD-FPBEW2-H2 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-065', PROV_OCHOA, 7107.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-alarma-inalambrica-03060442',
    nota: 'Kit Alarma Inalambrica · artículo 03-06-0442 · ref. KITBELLBOX · marca AMC. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-066', PROV_OCHOA, 10439.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-audio-awg-16-4-blanco-gris-03011076',
    nota: 'Cable Audio Awg 16 / 4 Blanco / Gris · artículo 03-01-1076 · ref. 5251-906836R500\' · marca GENESIS. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-067', PROV_OCHOA, 2299.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-telefono-plug-in-03060578',
    nota: 'Modulo Telefono Plug-In · artículo 03-06-0578 · ref. B430 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-068', PROV_OCHOA, 7860.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/parlante-6-5-cielo-par-s2incei-03061039',
    nota: 'Parlante 6.5” Cielo, Par, S2Incei · artículo 03-06-1039 · ref. NV21C6 · marca NUVO LEGRAND. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-069', PROV_OCHOA, 481.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/carril-din-03060561',
    nota: 'Carril Din · artículo 03-06-0561 · ref. ACX-RAIL-250 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-070', PROV_OCHOA, 1083.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gabinete-p-modulo-pqn-03060581',
    nota: 'Gabinete P / Modulo Pqn · artículo 03-06-0581 · ref. B11 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-071', PROV_OCHOA, 1199.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gabinete-p-modulo-mdn-03060582',
    nota: 'Gabinete P / Modulo Mdn · artículo 03-06-0582 · ref. B10 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-072', PROV_OCHOA, 4924.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/comunicador-gsm-03061784',
    nota: 'Comunicador Gsm · artículo 03-06-1784 · ref. 000403CELL8 · marca LINSEG. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-073', PROV_OCHOA, 30875.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/controlador-de-puerta-wi-2-lect-03061588',
    nota: 'Controlador De Puerta Wi 2 Lect. · artículo 03-06-1588 · ref. APC-AMC2-2WCF · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-074', PROV_OCHOA, 40571.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/controlador-puerta-extension-wiegand-03060562',
    nota: 'Controlador Puerta Extension Wiegand · artículo 03-06-0562 · ref. API-AMC2-4WE · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-075', PROV_OCHOA, 51002.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/controlador-acceso-modular-03060560',
    nota: 'Controlador Acceso Modular · artículo 03-06-0560 · ref. APC-AMC2-4WCF · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-076', PROV_OCHOA, 1857.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fuente-ethernet-poe-15-4w-1-puerto-03061279',
    nota: 'Fuente Ethernet Poe 15.4W 1 Puerto · artículo 03-06-1279 · ref. NPD-5001-POE · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-077', PROV_OCHOA, 2150.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/power-pack-120-277v-03061063',
    nota: 'Power Pack 120 / 277V · artículo 03-06-1063 · ref. BZ-150 · marca WATTSTOPPER. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-078', PROV_OCHOA, 10.19, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/aislador-intermedio-plano-iw-15-03021912',
    nota: 'Aislador Intermedio Plano Iw-15 · artículo 03-02-1912 · ref. 25265 · marca LINSEG. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-079', PROV_OCHOA, 24.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/aislador-templador-cuadrado-c-perno-03021877',
    nota: 'Aislador Templador Cuadrado C / Perno · artículo 03-02-1877 · ref. TC-1525262 · marca LINSEG. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-080', PROV_OCHOA, 32.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/aislador-intermedio-c-perno-03021876',
    nota: 'Aislador Intermedio C / Perno · artículo 03-02-1876 · ref. IG-1525264 · marca LINSEG. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-081', PROV_OCHOA, 104.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/anillo-negro-03060739',
    nota: 'Anillo Negro · artículo 03-06-0739 · ref. SX34ABK · marca TUTONDO. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-082', PROV_OCHOA, 287.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/anillo-blanco-03060742',
    nota: 'Anillo Blanco · artículo 03-06-0742 · ref. SX34AWH · marca TUTONDO. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-083', PROV_OCHOA, 287.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/anillo-gris-03060743',
    nota: 'Anillo Gris · artículo 03-06-0743 · ref. SX34AGR · marca TUTONDO. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-084', PROV_OCHOA, 6614.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/carcasa-con-1-rail-din-03060563',
    nota: 'Carcasa Con 1 Rail Din · artículo 03-06-0563 · ref. AEC-AMC2-UL1 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-085', PROV_OCHOA, 73.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/letrero-de-advertencia-electricidad-03030587',
    nota: 'Letrero De Advertencia Electricidad · artículo 03-03-0587 · ref. LTL13625267 · marca LINSEG. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-086', PROV_OCHOA, 5176.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/electrificador-p-cerco-electrico-1600m-03081249',
    nota: 'Electrificador P / Cerco Electrico 1600M · artículo 03-08-1249 · ref. MAX1RF25246 · marca LINSEG. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-087', PROV_OCHOA, 6906.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/electrificador-p-cerco-electrico-3600m-03081250',
    nota: 'Electrificador P / Cerco Electrico 3600M · artículo 03-08-1250 · ref. MAX1225247 · marca LINSEG. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-088', PROV_OCHOA, 11952.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/electrificador-p-cerco-electrico-8000m-03081251',
    nota: 'Electrificador P / Cerco Electrico 8000M · artículo 03-08-1251 · ref. SUPERMAX25248 · marca LINSEG. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-089', PROV_OCHOA, 676.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/control-remoto-p-alarma-03060445',
    nota: 'Control Remoto P / Alarma · artículo 03-06-0445 · ref. TR-400 · marca AMC. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-090', PROV_OCHOA, 4838.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/conversor-d-zonas-cableadas-inalambrico-03061820',
    nota: 'Conversor D / Zonas Cableadas Inalambrico · artículo 03-06-1820 · ref. V027-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-090', PROV_OCHOA, 4965.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/conversor-de-zonas-cableadas-inalambrico-03061863',
    nota: 'Conversor De Zonas Cableadas Inalambrico · artículo 03-06-1863 · ref. VESTA-027-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-091', PROV_OCHOA, 321.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/censor-hd25-ref-65943-1000024601-03095431',
    nota: 'Censor Hd25 Ref 65943 (1000024601) · artículo 03-09-5431 · ref. 123207. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-092', PROV_OCHOA, 487.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/censor-hd35-ref-65944-1000024673-03095432',
    nota: 'Censor Hd35 Ref 65944 (1000024673) · artículo 03-09-5432 · ref. 123209. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-093', PROV_OCHOA, 959.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/censor-hd55-ref-66089-1000055372-03095433',
    nota: 'Censor Hd55 Ref. 66089 (1000055372) · artículo 03-09-5433 · ref. 135134. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-094', PROV_OCHOA, 1910.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sello-03160429',
    nota: 'Sello · artículo 03-16-0429 · ref. A12025P5008 · marca FAAC. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-095', PROV_OCHOA, 5208.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/extensor-repetidor-inalambrico-03061826',
    nota: 'Extensor / Repetidor Inalambrico · artículo 03-06-1826 · ref. 030-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-28-096', PROV_OCHOA, 11668.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/g-series-panel-de-control-ip-8-areas-03061547',
    nota: 'G Series Panel De Control Ip 8 Areas · artículo 03-06-1547 · ref. B8512G · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-003', PROV_OCHOA, 18682.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/central-control-incendio-4-zonas-24v-03060500',
    nota: 'Central Control Incendio 4 Zonas 24V · artículo 03-06-0500 · ref. FPD-7024 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-004', PROV_OCHOA, 1369.45, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-de-rotura-de-cristal-cruadrado-03061592',
    nota: 'Detector De Rotura De Cristal Cruadrado · artículo 03-06-1592 · ref. DS1102I · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-005', PROV_OCHOA, 1508.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-termico-03060515',
    nota: 'Detector Termico · artículo 03-06-0515 · ref. F220-P · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-006', PROV_OCHOA, 1657.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-humo-calor-fijo-03061587',
    nota: 'Detector Humo, Calor Fijo · artículo 03-06-1587 · ref. D263TH · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-007', PROV_OCHOA, 2053.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-de-calor-analogico-03060557',
    nota: 'Detector De Calor Analogico · artículo 03-06-0557 · ref. FAH-440 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-008', PROV_OCHOA, 2127.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-de-humo-c-alarma-multiplex-03060513',
    nota: 'Detector De Humo C / Alarma Multiplex · artículo 03-06-0513 · ref. D7050TH · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-008', PROV_OCHOA, 1934.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-de-humo-c-alarma-multiplex-03060512',
    nota: 'Detector De Humo C / Alarma Multiplex · artículo 03-06-0512 · ref. D7050 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-009', PROV_OCHOA, 2135.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-de-humo-analogico-03060558',
    nota: 'Detector De Humo Analogico · artículo 03-06-0558 · ref. FAP-440 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-010', PROV_OCHOA, 3315.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-de-impacto-03061240',
    nota: 'Detector De Impacto · artículo 03-06-1240 · ref. ISC-SK10 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-011', PROV_OCHOA, 5647.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-gas-de-combustion-12-24v-03060520',
    nota: 'Detector Gas De Combustion 12 / 24V · artículo 03-06-0520 · ref. D382/GD2A · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-012', PROV_OCHOA, 23981.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/detector-humo-largo-alcance-24v-03060523',
    nota: 'Detector Humo Largo Alcance 24V · artículo 03-06-0523 · ref. D296 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-013', PROV_OCHOA, 2764.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sirena-con-luz-estrobo-24v-03060526',
    nota: 'Sirena Con Luz Estrobo 24V · artículo 03-06-0526 · ref. W-HSR · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-014', PROV_OCHOA, 870.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pulsador-de-panico-03061591',
    nota: 'Pulsador De Panico · artículo 03-06-1591 · ref. ISC-PB1-100 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-015', PROV_OCHOA, 2693.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/estacion-manual-doble-accion-roja-03061595',
    nota: 'Estacion Manual Doble Accion Roja · artículo 03-06-1595 · ref. FMM-462-D · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-016', PROV_OCHOA, 3695.82, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/estacion-analogica-manual-roja-03060555',
    nota: 'Estacion Analogica Manual Roja · artículo 03-06-0555 · ref. FMM-325A · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-017', PROV_OCHOA, 4065.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/estacion-analogica-manual-doble-03060556',
    nota: 'Estacion Analogica Manual Doble · artículo 03-06-0556 · ref. FMM-325A-D · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-018', PROV_OCHOA, 574.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-expansivo-popit-03060586',
    nota: 'Modulo Expansivo Popit · artículo 03-06-0586 · ref. D9127U · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-019', PROV_OCHOA, 1199.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-multiplex-mini-1-entrada-12v-03060505',
    nota: 'Modulo Multiplex Mini 1 Entrada 12V · artículo 03-06-0505 · ref. D7044M · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-020', PROV_OCHOA, 1276.45, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-multiplex-1-entrada-12v-03060506',
    nota: 'Modulo Multiplex 1 Entrada 12V · artículo 03-06-0506 · ref. D7044 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-021', PROV_OCHOA, 1683.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-de-expasion-8-entradas-03060585',
    nota: 'Modulo De Expasion 8 Entradas · artículo 03-06-0585 · ref. B208 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-022', PROV_OCHOA, 2217.5, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-multiplex-entrada-salida-12v-03060507',
    nota: 'Modulo Multiplex Entrada / Salida 12V · artículo 03-06-0507 · ref. D7053 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-023', PROV_OCHOA, 3149.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-dispositivos-de-notificacion-03061596',
    nota: 'Modulo Dispositivos De Notificacion · artículo 03-06-1596 · ref. D192G · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-024', PROV_OCHOA, 3442.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-de-entrada-dual-p-fpa-1000-03060549',
    nota: 'Modulo De Entrada Dual P / Fpa-1000 · artículo 03-06-0549 · ref. FLM-325-214 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-025', PROV_OCHOA, 3449.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-de-rele-doble-2a-03060550',
    nota: 'Módulo De Relé Doble 2A · artículo 03-06-0550 · ref. FLM-325-2R4-2A · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-026', PROV_OCHOA, 3564.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-de-zona-convencional-03061586',
    nota: 'Módulo De Zona Convencional · artículo 03-06-1586 · ref. FLM-325-CZM4 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-027', PROV_OCHOA, 3868.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-salida-supervisado-clase-a-b-03060552',
    nota: 'Modulo Salida Supervisado Clase A / B · artículo 03-06-0552 · ref. FLM-325-NA4 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-028', PROV_OCHOA, 6150.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-de-extension-multiplex-p-7024-03060504',
    nota: 'Modulo De Extension Multiplex P / 7024 · artículo 03-06-0504 · ref. FPE-7039 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-029', PROV_OCHOA, 11977.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-slc-conectable-para-fpa-1000-03061236',
    nota: 'Módulo Slc Conectable Para Fpa-1000 · artículo 03-06-1236 · ref. FPE-1000-SLC · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-030', PROV_OCHOA, 781.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/bisel-p-pulsador-de-alarma-mcp-rw-rojo-03061568',
    nota: 'Bisel P / Pulsador De Alarma Mcp Rw, Rojo · artículo 03-06-1568 · ref. FMC-BEZEL-RD · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-031', PROV_OCHOA, 11751.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/programador-punto-analogico-de-mano-03060554',
    nota: 'Programador Punto Analogico De Mano · artículo 03-06-0554 · ref. D5070 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-032', PROV_OCHOA, 22010.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/display-lcd-fpa-1000-03060548',
    nota: 'Display Lcd Fpa-1000 · artículo 03-06-0548 · ref. FMR-1000-RCMD · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-033', PROV_OCHOA, 906.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fuente-de-alimentacion-120v-60hz-03060533',
    nota: 'Fuente De Alimentacion 120V 60Hz · artículo 03-06-0533 · ref. UPA-1220-60 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-034', PROV_OCHOA, 1157.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fuente-de-alimentacion-120vac-60hz-03060538',
    nota: 'Fuente De Alimentacion 120Vac 60Hz · artículo 03-06-0538 · ref. UPA-2430-60 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-035', PROV_OCHOA, 11089.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fuente-de-alimentacion-12-24vdc-03060565',
    nota: 'Fuente De Alimentación 12 / 24Vdc · artículo 03-06-0565 · ref. APS-PSU-60 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-036', PROV_OCHOA, 16632.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fuente-de-alimentacion-rnac-8a-24v-03060525',
    nota: 'Fuente De Alimentacion Rnac 8A 24V · artículo 03-06-0525 · ref. FPP-RNAC-8A-4C · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-037', PROV_OCHOA, 165.78, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/soporte-de-montaje-lc1-mmsb-03061249',
    nota: 'Soporte De Montaje Lc1-Mmsb · artículo 03-06-1249 · ref. LC1-MMSB · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-038', PROV_OCHOA, 232.07, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/base-detector-de-humo-multiplex-03060514',
    nota: 'Base Detector De Humo Multiplex · artículo 03-06-0514 · ref. D7050-B6 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-039', PROV_OCHOA, 270.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/base-detector-de-calor-03060518',
    nota: 'Base Detector De Calor · artículo 03-06-0518 · ref. F220-B6 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-040', PROV_OCHOA, 309.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/base-estandar-analogica-4-pulg-03060559',
    nota: 'Base Estándar Analógica 4 Pulg · artículo 03-06-0559 · ref. FAA-440-B4 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-041', PROV_OCHOA, 452.89, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cubierta-transparente-03061224',
    nota: 'Cubierta, Transparente. · artículo 03-06-1224 · ref. FMC-FLAP-RW · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-042', PROV_OCHOA, 615.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/base-detector-calor-c-rele-12-24v-03060519',
    nota: 'Base Detector Calor C / Rele 12 / 24V · artículo 03-06-0519 · ref. F220-B6R · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-043', PROV_OCHOA, 1091.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caja-post-sup-475x325x225-roja-03061228',
    nota: 'Caja Post. Sup., 4,75X3,25X2,25”, Roja · artículo 03-06-1228 · ref. FMM-100WPBB-R · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-044', PROV_OCHOA, 2340.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/aislador-de-cortocirc-p-fpa-1000-03060551',
    nota: 'Aislador De Cortocirc. P / Fpa-1000 · artículo 03-06-0551 · ref. FLM-325-ISO · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-045', PROV_OCHOA, 3906.74, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/carcasa-para-detector-de-humo-03060521',
    nota: 'Carcasa Para Detector De Humo · artículo 03-06-0521 · ref. D341 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-29-046', PROV_OCHOA, 3502.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/luz-estroboscopica-roja-p-base-de-sirena-03061571',
    nota: 'Luz Estroboscópica Roja P / Base De Sirena · artículo 03-06-1571 · ref. FNS-420-R · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-002', PROV_OCHOA, 3536.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/panel-de-conexion-fija-03061381',
    nota: 'Panel De Conexión Fija · artículo 03-06-1381 · ref. FCP3-RACK · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-003', PROV_OCHOA, 27633.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/panel-de-conexion-mapit-g2-03061679',
    nota: 'Panel De Conexión Mapit G2 · artículo 03-06-1679 · ref. M-SPPA-T24K · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-004', PROV_OCHOA, 5019.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/monitor-cristal-a-color-libre-manos-03060437',
    nota: 'Monitor Cristal A Color Libre Manos · artículo 03-06-0437 · ref. VXKRV76-WBLANCO · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-004', PROV_OCHOA, 5019.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/monitor-cristal-a-color-libre-manos-03060436',
    nota: 'Monitor Cristal A Color Libre Manos · artículo 03-06-0436 · ref. VXKRV76-BNEGRO · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-005', PROV_OCHOA, 79.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat5-8cca-305m-azul-03060402',
    nota: 'Cable Utp Cat5 8Cca 305M Azul · artículo 03-06-0402 · ref. CAB-10105 · marca NETCOMLAB. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-006', PROV_OCHOA, 72.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat5e-gris-03060403',
    nota: 'Cable Utp Cat5E Gris · artículo 03-06-0403 · ref. CAB-10100/10495 · marca NETCOMLAB. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-007', PROV_OCHOA, 5.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-retract-dock-a-3-5mm-p-iphone-03060838',
    nota: 'Cable Retract. Dock A 3.5Mm P / Iphone · artículo 03-06-0838 · ref. POD-077 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-008', PROV_OCHOA, 106.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat-5e-azul-r-1000-03060448',
    nota: 'Cable Utp Cat 5E Azul R / 1000\' · artículo 03-06-0448 · ref. CAT5E · marca PHELPS DODGE. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-009', PROV_OCHOA, 97.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat6-305m-gris-int-03060405',
    nota: 'Cable Utp Cat6 305M Gris Int. · artículo 03-06-0405 · ref. CAB-10106 · marca NETCOMLAB. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-010', PROV_OCHOA, 115.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat5e-305m-negro-03060404',
    nota: 'Cable Utp Cat5E 305M Negro · artículo 03-06-0404 · ref. CAB-10560 · marca NETCOMLAB. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-011', PROV_OCHOA, 135, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat6-305m-negro-exter-03060441',
    nota: 'Cable Utp Cat6 305M Negro Exter. · artículo 03-06-0441 · ref. CAB-10565 · marca NETCOMLAB. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-012', PROV_OCHOA, 7.89, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-firewire-4p-a-4p-de-1-8m-03060781',
    nota: 'Cable Firewire 4P A 4P De 1.8M · artículo 03-06-0781 · ref. 506-642 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-013', PROV_OCHOA, 187.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-telef-6-hilos-awg28-marfil-r-1000-03061672',
    nota: 'Cable Telef. 6 Hilos Awg28 Marfil R / 1000 · artículo 03-06-1672 · ref. MO6T-305 · marca STEREN. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-014', PROV_OCHOA, 222.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat-6-24-4-azul-r-1000-03061503',
    nota: 'Cable Utp Cat.6 24 / 4 Azul R / 1000\' · artículo 03-06-1503 · ref. 9C6M4-E2-06 · marca SIEMON. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-015', PROV_OCHOA, 222.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat-6e-24-4-negro-r-1000-03061504',
    nota: 'Cable Utp Cat.6E 24 / 4 Negro R / 1000\' · artículo 03-06-1504 · ref. 9C6M4-E2-01 · marca SIEMON. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-016', PROV_OCHOA, 242.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat-6e-24-4-gris-r-1640-03061502',
    nota: 'Cable Utp Cat.6E 24 / 4 Gris R / 1640\' · artículo 03-06-1502 · ref. 9C6M4-E2-5CR · marca SIEMON. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-017', PROV_OCHOA, 15.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-firewire-9p-a-9p-de-1-8m-03060782',
    nota: 'Cable Firewire 9P A 9P De 1.8M · artículo 03-06-0782 · ref. 506-650 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-018', PROV_OCHOA, 437, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-6-fiber-xglo-singlemode-03061623',
    nota: 'Cable, 6 Fiber, Xglo, Singlemode · artículo 03-06-1623 · ref. 9GD8P006D-E201A · marca SIEMON. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-019', PROV_OCHOA, 617.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-audio-2x0-75-4x2x0-22-03061496',
    nota: 'Cable Audio 2X0.75+4X2X0.22 · artículo 03-06-1496 · ref. TUC52TST · marca TUTONDO. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-020', PROV_OCHOA, 813.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-bco-blindado-cat-5e-24-4-03061640',
    nota: 'Cable Utp Bco. Blindado Cat.5E 24 / 4 · artículo 03-06-1640 · ref. FTP5E-305 · marca STEREN. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-021', PROV_OCHOA, 1675.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-telef-2x18-awg-gris-blindado-03061674',
    nota: 'Cable Telef. 2X18 Awg Gris Blindado · artículo 03-06-1674 · ref. M-02X18MM · marca STEREN. La tienda cotiza por pie y factura la unidad de 20 pies; aquí va el precio de la unidad completa. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-022', PROV_OCHOA, 125.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat5e-1ft-snagless-03061356',
    nota: 'Cable Utp-Cat5E 1Ft Snagless · artículo 03-06-1356 · ref. 24814 · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-023', PROV_OCHOA, 163.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-15-03060415',
    nota: 'Cable Hdmi 15\' · artículo 03-06-0415 · ref. CMP-10552 · marca NETCOMLAB. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-024', PROV_OCHOA, 192.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-10-1-3mt-1002048-03060417',
    nota: 'Cable Hdmi 10\' 1.3Mt 1002048 · artículo 03-06-0417 · ref. CMP-10551 · marca NETCOMLAB. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-025', PROV_OCHOA, 197.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-1080p-6-03061929',
    nota: 'Cable Hdmi 1080P 6\' · artículo 03-06-1929 · ref. E40053 · marca ROCKWELL. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-026', PROV_OCHOA, 201.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-1-8-mts-03061911',
    nota: 'Cable Hdmi 1.8 Mts · artículo 03-06-1911 · ref. CB4106BK · marca UNNO. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-027', PROV_OCHOA, 215.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-3-cat-6-bco-03061425',
    nota: 'Cordon De Parcheo 3\' Cat.6 Bco · artículo 03-06-1425 · ref. MC06-03-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-028', PROV_OCHOA, 215.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-3-cat-6-azul-03061426',
    nota: 'Cordon De Parcheo 3\' Cat.6 Azul · artículo 03-06-1426 · ref. MC06-03-06 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-029', PROV_OCHOA, 240.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-5-cat-6-azul-03061429',
    nota: 'Cordon De Parcheo 5\' Cat.6 Azul · artículo 03-06-1429 · ref. MC06-05-06 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-030', PROV_OCHOA, 241.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-5-cat-6-bco-03061428',
    nota: 'Cordon De Parcheo 5\' Cat.6 Bco. · artículo 03-06-1428 · ref. MC06-05-02-28 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-030', PROV_OCHOA, 240.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-5-cat-6-bco-03061427',
    nota: 'Cordon De Parcheo 5\' Cat.6 Bco. · artículo 03-06-1427 · ref. MC06-05-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-031', PROV_OCHOA, 248.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-10-03061910',
    nota: 'Cable Hdmi 10\' · artículo 03-06-1910 · ref. CB4110BK · marca UNNO. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-032', PROV_OCHOA, 255.45, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-conexion-ethernet-cat6-25-7-5m-03061916',
    nota: 'Cable Conexión Ethernet Cat6 25\' 7.5M · artículo 03-06-1916 · ref. CB4325GY · marca UNNO. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-033', PROV_OCHOA, 260.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-7-cat-6-azul-03061431',
    nota: 'Cordon De Parcheo 7\' Cat.6 Azul · artículo 03-06-1431 · ref. MC06-07-06 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-034', PROV_OCHOA, 260.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-7-cat-6-bco-03061430',
    nota: 'Cordon De Parcheo 7\' Cat.6 Bco · artículo 03-06-1430 · ref. MC06-07-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-035', PROV_OCHOA, 264.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-audio-3-5mm-2ra-12-03060408',
    nota: 'Cable Audio 3.5Mm 2Ra 12\' · artículo 03-06-0408 · ref. EXT-20500 · marca NETCOMLAB. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-036', PROV_OCHOA, 292.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat6-7ft-snagless-03061358',
    nota: 'Cable Utp-Cat6 7Ft Snagless · artículo 03-06-1358 · ref. 27132 · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-037', PROV_OCHOA, 298.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-10-cat-6-bco-03061432',
    nota: 'Cordon De Parcheo 10\' Cat.6 Bco · artículo 03-06-1432 · ref. MC06-10-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-038', PROV_OCHOA, 325.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-v1-4-15-03061913',
    nota: 'Cable Hdmi V1.4. 15\' · artículo 03-06-1913 · ref. CB4115BK · marca UNNO. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-039', PROV_OCHOA, 351.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-high-speed-hdtv-03060384',
    nota: 'Cable Hdmi High Speed Hdtv · artículo 03-06-0384 · ref. 33574 · marca G. ELECTRIC. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-040', PROV_OCHOA, 367.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-15-cat-6-bco-03061433',
    nota: 'Cordon De Parcheo 15\' Cat.6 Bco · artículo 03-06-1433 · ref. MC06-15-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-041', PROV_OCHOA, 430.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-1080p-25-03061931',
    nota: 'Cable Hdmi 1080P 25\' · artículo 03-06-1931 · ref. E40057 · marca ROCKWELL. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-042', PROV_OCHOA, 466.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-3-rj45-cat-6a-bco-03061444',
    nota: 'Cordon De Parcheo 3\' Rj45 Cat.6A Bco · artículo 03-06-1444 · ref. ZM6A-S03-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-043', PROV_OCHOA, 477.1, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-conexion-ethernet-cat6-50-15m-03061917',
    nota: 'Cable Conexión Ethernet Cat6 50\' 15M · artículo 03-06-1917 · ref. CB4350GY · marca UNNO. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-044', PROV_OCHOA, 503, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-5-rj45-cat-6a-azul-03061400',
    nota: 'Cordon De Parcheo 5\' Rj45 Cat.6A Azul · artículo 03-06-1400 · ref. ZM6A-S05-06 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-045', PROV_OCHOA, 503, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cordon-de-parcheo-5-rj45-cat-6a-bco-03061399',
    nota: 'Cordon De Parcheo 5\' Rj45 Cat.6A Bco · artículo 03-06-1399 · ref. ZM6A-S05-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-046', PROV_OCHOA, 508.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-v2-1-5-03061912',
    nota: 'Cable Hdmi V2.1 5\' · artículo 03-06-1912 · ref. CB4227BL · marca UNNO. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-047', PROV_OCHOA, 639.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-10ft-4k-high-speed-etherne-03061368',
    nota: 'Cable Hdmi 10Ft 4K High Speed Etherne · artículo 03-06-1368 · ref. 56784 · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-048', PROV_OCHOA, 733.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-1m-3-3-03061335',
    nota: 'Cable Hdmi 1M (3.3\') · artículo 03-06-1335 · ref. AC2M01BK · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-049', PROV_OCHOA, 860.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-de-conexion-tera-cat6a-1-10g-2m-03061688',
    nota: 'Cable De Conexión Tera Cat6A 1 / 10G 2M · artículo 03-06-1688 · ref. T4A-B02M-B02L · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-050', PROV_OCHOA, 1026.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-50-pies-03061745',
    nota: 'Cable Hdmi 50 Pies · artículo 03-06-1745 · ref. CB4150BK · marca UNNO. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-051', PROV_OCHOA, 1133.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-1080p-50-pies-03061932',
    nota: 'Cable Hdmi 1080P 50 Pies · artículo 03-06-1932 · ref. E40059 · marca ROCKWELL. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-052', PROV_OCHOA, 1494.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-4m-13-1-03061337',
    nota: 'Cable Hdmi 4M (13.1\') · artículo 03-06-1337 · ref. AC2M04BK · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-053', PROV_OCHOA, 1676.18, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-cobre-direct-attach-03061662',
    nota: 'Cable Cobre Direct Attach · artículo 03-06-1662 · ref. QSFP30-00.5 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-053', PROV_OCHOA, 1649.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-cobre-direct-attach-03061664',
    nota: 'Cable Cobre Direct Attach · artículo 03-06-1664 · ref. SFPH10GB1.5MS03 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-053', PROV_OCHOA, 1649.33, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-cobre-direct-attach-03061663',
    nota: 'Cable Cobre Direct Attach · artículo 03-06-1663 · ref. SFPH10GB1.5MS02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-054', PROV_OCHOA, 3754.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-hdmi-20ft-4k-high-speed-etherne-03061369',
    nota: 'Cable Hdmi 20Ft 4K High Speed Etherne · artículo 03-06-1369 · ref. 50188 · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-055', PROV_OCHOA, 11979.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-utp-cat-6e-24-4-gris-r-1000-03061534',
    nota: 'Cable Utp Cat. 6E 24 / 4 Gris R / 1000\' · artículo 03-06-1534 · ref. 9C6M4-E2-RXA · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-056', PROV_OCHOA, 20292.59, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-manager-vertical-value-7pies-03061622',
    nota: 'Cable Manager, Vertical, Value, 7Pies · artículo 03-06-1622 · ref. VCM1A-10S-1-45 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-057', PROV_OCHOA, 21280, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-copper-categoria-7a-e10-r-1000-03061632',
    nota: 'Cable Copper Categoria 7A E10 R / 1000\' · artículo 03-06-1632 · ref. 9T7L4-E10 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-058', PROV_OCHOA, 0.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barril-de-union-cople-f-con-tuerca-03061142',
    nota: 'Barril De Union Cople F Con Tuerca · artículo 03-06-1142 · ref. 200-053 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-059', PROV_OCHOA, 0.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/acoplador-03060981',
    nota: 'Acoplador · artículo 03-06-0981 · ref. 200-515 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-060', PROV_OCHOA, 0.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/acoplador-de-300-a-75-ohms-interior-03061089',
    nota: 'Acoplador De 300 A 75 Ohms Interior · artículo 03-06-1089 · ref. 200-510 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-061', PROV_OCHOA, 0.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/acoplador-de-75-a-300-ohms-interior-03061091',
    nota: 'Acoplador De 75 A 300 Ohms Interior · artículo 03-06-1091 · ref. 200-500 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-062', PROV_OCHOA, 0.6, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barril-de-union-cople-dorado-f-03061141',
    nota: 'Barril De Union Cople Dorado F · artículo 03-06-1141 · ref. 200-051 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-063', PROV_OCHOA, 1.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barril-union-doble-03060980',
    nota: 'Barril Union Doble · artículo 03-06-0980 · ref. 200-272 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-064', PROV_OCHOA, 0.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barril-union-sencillo-03060979',
    nota: 'Barril Union Sencillo · artículo 03-06-0979 · ref. 200-271 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-065', PROV_OCHOA, 1.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-p-circuito-impreso-d-4-contacto-r11-03061168',
    nota: 'Jack P / Circuito Impreso D / 4 Contacto R11 · artículo 03-06-1168 · ref. 300-086 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-066', PROV_OCHOA, 0.65, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tira-sencillo-36pines-03061105',
    nota: 'Tira Sencillo 36Pines · artículo 03-06-1105 · ref. F36-S · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-067', PROV_OCHOA, 2.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cople-c-cable-p-tira-led-monocromatica-03061155',
    nota: 'Cople C / Cable P / Tira Led Monocromatica · artículo 03-06-1155 · ref. MODLED-025 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-068', PROV_OCHOA, 2.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-telf-doble-03060975',
    nota: 'Jack Telf.Doble · artículo 03-06-0975 · ref. 300-104 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-069', PROV_OCHOA, 3.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cople-c-cable-p-tira-led-rgb-03061156',
    nota: 'Cople C / Cable P / Tira Led Rgb · artículo 03-06-1156 · ref. MODLED-026 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-070', PROV_OCHOA, 3.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/barriles-de-union-coples-dorados-f-24k-03061165',
    nota: 'Barriles De Union (Coples) Dorados F 24K · artículo 03-06-1165 · ref. 203-050 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-071', PROV_OCHOA, 3.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/conectores-dorados-f-de-enroscar-p-rg-6-03061163',
    nota: 'Conectores Dorados F De Enroscar P / Rg-6 · artículo 03-06-1163 · ref. 203-039 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-072', PROV_OCHOA, 26.88, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mangas-de-proteccion-03061423',
    nota: 'Mangas De Protección · artículo 03-06-1423 · ref. HT-60 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-073', PROV_OCHOA, 30.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/casquillo-con-tuerca-p-soldadores-wtcpt-03061080',
    nota: 'Casquillo Con Tuerca P / Soldadores Wtcpt · artículo 03-06-1080 · ref. BA-60 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-074', PROV_OCHOA, 33.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/conector-plug-para-camara-03061739',
    nota: 'Conector Plug Para Camara · artículo 03-06-1739 · ref. ST-PLUG · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-075', PROV_OCHOA, 43.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plug-utp-categoria-6-03061411',
    nota: 'Plug Utp Categoría 6 · artículo 03-06-1411 · ref. P6U-8-8 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-076', PROV_OCHOA, 56.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/decorator-strap-bl3p-03061346',
    nota: 'Decorator Strap, Bl3P · artículo 03-06-1346 · ref. WP3413WH · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-077', PROV_OCHOA, 58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/decorator-strap-bl4p-03061347',
    nota: 'Decorator Strap, Bl4P · artículo 03-06-1347 · ref. WP3414WH · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-078', PROV_OCHOA, 70.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/keystone-jack-icon-data-voice-bag-of-25-03061361',
    nota: 'Keystone Jack Icon,Data / Voice Bag Of 25 · artículo 03-06-1361 · ref. KSICON · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-079', PROV_OCHOA, 76.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/conector-rj45-blanco-cat5e-03061339',
    nota: 'Conector Rj45 Blanco Cat5E · artículo 03-06-1339 · ref. WP3450WH · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-080', PROV_OCHOA, 77.06, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fp-keystone-2hole-sg-pc-desig-screw-kit-03061362',
    nota: 'Fp,Keystone,2Hole,Sg,Pc Desig,Screw,Kit · artículo 03-06-1362 · ref. KSFP2 · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-081', PROV_OCHOA, 96.98, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/keystone-blank-qty10-fogwhite-03061363',
    nota: 'Keystone,Blank,Qty10 Fogwhite · artículo 03-06-1363 · ref. KSB10 · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-082', PROV_OCHOA, 101.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/placa-de-pared-modular-3s-03061442',
    nota: 'Placa De Pared Modular 3S · artículo 03-06-1442 · ref. MX-FP-S-03-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-083', PROV_OCHOA, 101.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/placa-max-1-puerto-bco-03061440',
    nota: 'Placa Max 1 Puerto Bco · artículo 03-06-1440 · ref. MX-FP-S-01-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-084', PROV_OCHOA, 101.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/placa-max-2-puerto-bco-03061441',
    nota: 'Placa Max 2 Puerto Bco · artículo 03-06-1441 · ref. MX-FP-S-02-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-085', PROV_OCHOA, 102.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/faceplate-single-gang-4-openings-mx-03061617',
    nota: 'Faceplate, Single Gang, 4 Openings, Mx, · artículo 03-06-1617 · ref. MX-FP-S-04-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-086', PROV_OCHOA, 101.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/placa-serie-ct-p-1-acoplador-bco-03061376',
    nota: 'Placa Serie Ct P / 1 Acoplador Bco. · artículo 03-06-1376 · ref. CT2-FP-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-087', PROV_OCHOA, 106.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cat5e-keystone-jack-individual-bag-fog-03061359',
    nota: 'Cat5E Keystone Jack Individual Bag,Fog · artículo 03-06-1359 · ref. KS5EA · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-088', PROV_OCHOA, 128.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inserto-ciego-max-paq-10-negro-03061439',
    nota: 'Inserto Ciego Max Paq.10 Negro · artículo 03-06-1439 · ref. MX-BL-01 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-089', PROV_OCHOA, 145.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/placa-serie-ct-p-2-acoplador-bco-03061377',
    nota: 'Placa Serie Ct P / 2 Acoplador Bco. · artículo 03-06-1377 · ref. CT4-BOX-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-090', PROV_OCHOA, 146.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-ciego-wp3455wh-03061342',
    nota: 'Módulo Ciego Wp3455Wh · artículo 03-06-1342 · ref. WP3455WH · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-091', PROV_OCHOA, 181.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/conector-rca-rojo-03061343',
    nota: 'Conector Rca Rojo · artículo 03-06-1343 · ref. KSRCARW · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-092', PROV_OCHOA, 189.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-max-rj45-plano-cat-6-negro-03061434',
    nota: 'Jack Max Rj45 Plano Cat.6 Negro · artículo 03-06-1434 · ref. MX6-F01 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-093', PROV_OCHOA, 190.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mc6-utp-modular-cord-1-ft-white-03061614',
    nota: 'Mc6 Utp Modular Cord, 1 Ft, White · artículo 03-06-1614 · ref. MC6-01-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-094', PROV_OCHOA, 190.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/utp-modular-cord-1-ft-blue-03061615',
    nota: 'Utp Modular Cord, 1 Ft, Blue · artículo 03-06-1615 · ref. MC6-01-06 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-095', PROV_OCHOA, 192.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/patch-cord-cat6-blanco-3ft-03061737',
    nota: 'Patch Cord Cat6 Blanco 3Ft · artículo 03-06-1737 · ref. CB4303GY · marca UNIMAX. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-096', PROV_OCHOA, 200.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/inserto-ciego-max-paq-10-bco-03061438',
    nota: 'Inserto Ciego Max Paq.10 Bco · artículo 03-06-1438 · ref. MX-BL-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-097', PROV_OCHOA, 251.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6-negro-03061393',
    nota: 'Jack Zmax Rj45 Cat.6 Negro · artículo 03-06-1393 · ref. Z6-01 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-098', PROV_OCHOA, 254.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-max-rj45-plano-cat-6-bco-03061435',
    nota: 'Jack Max Rj45 Plano Cat.6 Bco · artículo 03-06-1435 · ref. MX6-F02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-099', PROV_OCHOA, 256.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6-azul-03061445',
    nota: 'Jack Zmax Rj45 Cat.6 Azul · artículo 03-06-1445 · ref. Z6-06 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-100', PROV_OCHOA, 305.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pasador-de-cables-03061348',
    nota: 'Pasador De Cables · artículo 03-06-1348 · ref. WP1014WH · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-101', PROV_OCHOA, 316.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/keystone-usb-2-0-a-a-f-f-fog-white-03061365',
    nota: 'Keystone,Usb 2.0 A-A,F / F Fog White · artículo 03-06-1365 · ref. KSUSBAA · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-102', PROV_OCHOA, 337.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6a-blindado-negro-03061395',
    nota: 'Jack Zmax Rj45 Cat.6A Blindado Negro · artículo 03-06-1395 · ref. Z6A-S01 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-102', PROV_OCHOA, 334.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6a-blindado-negro-03061651',
    nota: 'Jack Zmax Rj45 Cat.6A Blindado Negro · artículo 03-06-1651 · ref. Z6A-S05 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-102', PROV_OCHOA, 275.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6a-blindado-negro-03061650',
    nota: 'Jack Zmax Rj45 Cat.6A Blindado Negro · artículo 03-06-1650 · ref. Z6A-S03 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-102', PROV_OCHOA, 275.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6a-blindado-negro-03061652',
    nota: 'Jack Zmax Rj45 Cat.6A Blindado Negro · artículo 03-06-1652 · ref. Z6A-SK01 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-102', PROV_OCHOA, 439.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6a-blindado-negro-03061653',
    nota: 'Jack Zmax Rj45 Cat.6A Blindado Negro · artículo 03-06-1653 · ref. ZP1-6AS-01S · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-102', PROV_OCHOA, 301.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6a-blindado-negro-03061647',
    nota: 'Jack Zmax Rj45 Cat.6A Blindado Negro · artículo 03-06-1647 · ref. Z6A-S01 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-103', PROV_OCHOA, 343.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6a-blindado-azul-03061396',
    nota: 'Jack Zmax Rj45 Cat.6A Blindado Azul · artículo 03-06-1396 · ref. Z6A-S06 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-104', PROV_OCHOA, 384.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6a-blindado-blanco-03061649',
    nota: 'Jack Zmax Rj45 Cat.6A Blindado Blanco · artículo 03-06-1649 · ref. Z6A-S02D · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-104', PROV_OCHOA, 301.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6a-blindado-blanco-03061648',
    nota: 'Jack Zmax Rj45 Cat.6A Blindado Blanco · artículo 03-06-1648 · ref. Z6A-S02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-105', PROV_OCHOA, 431.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-zmax-rj45-cat-6-bco-03061394',
    nota: 'Jack Zmax Rj45 Cat.6 Bco · artículo 03-06-1394 · ref. Z6-02 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-106', PROV_OCHOA, 497.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-7a-para-patch-panel-03061629',
    nota: 'Jack 7A Para Patch Panel · artículo 03-06-1629 · ref. T7F-01-1 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-107', PROV_OCHOA, 525.07, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/conector-de-fibra-optica-03061378',
    nota: 'Conector De Fibra Óptica · artículo 03-06-1378 · ref. FC1-LB-LC5-9AQ · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-108', PROV_OCHOA, 652.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/conector-de-fibra-os1-os4-03061379',
    nota: 'Conector De Fibra Os1 / Os4 · artículo 03-06-1379 · ref. FC1-LB-LCU-9BL · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-109', PROV_OCHOA, 883.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/placa-sencilla-acero-1-puerto-03061413',
    nota: 'Placa Sencilla Acero 1 Puerto · artículo 03-06-1413 · ref. XFP-S-01-SS · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-110', PROV_OCHOA, 883.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/placa-sencilla-acero-2-puerto-03061414',
    nota: 'Placa Sencilla Acero 2 Puerto · artículo 03-06-1414 · ref. XFP-S-02-SS · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-111', PROV_OCHOA, 1081.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jumper-xglo-1mt-03061382',
    nota: 'Jumper Xglo 1Mt · artículo 03-06-1382 · ref. FJ2-LCLC5L-01AQ · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-111', PROV_OCHOA, 359.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jumper-xglo-1mt-03061384',
    nota: 'Jumper Xglo 1Mt · artículo 03-06-1384 · ref. FP1B-LC5L-01AQ · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-112', PROV_OCHOA, 1187.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jumper-de-f-o-xglo-1mt-03061410',
    nota: 'Jumper De F.O Xglo 1Mt · artículo 03-06-1410 · ref. FJ2-LCUSCUL-01 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-113', PROV_OCHOA, 1196.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/placa-doble-acero-3-puerto-03061415',
    nota: 'Placa Doble Acero 3 Puerto · artículo 03-06-1415 · ref. XFP-D-03-SS · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-114', PROV_OCHOA, 1215.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jumper-xglo-3mt-03061383',
    nota: 'Jumper Xglo 3Mt. · artículo 03-06-1383 · ref. FJ2-LCLC5L-03AQ · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-115', PROV_OCHOA, 1305.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/patch-cord-7-pies-cat-7-03061630',
    nota: 'Patch Cord 7 Pies Cat 7 · artículo 03-06-1630 · ref. T4-02M-B02L · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-116', PROV_OCHOA, 1315.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/adaptador-de-fibra-reforzado-03061418',
    nota: 'Adaptador De Fibra Reforzado · artículo 03-06-1418 · ref. XG2-XLC-LC-MM · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-117', PROV_OCHOA, 1396.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/patch-cord-10-pies-cat-7-03061631',
    nota: 'Patch Cord 10 Pies Cat 7 · artículo 03-06-1631 · ref. T403MBO2L · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-118', PROV_OCHOA, 1513.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/jack-rj45-cat-6-negro-03061416',
    nota: 'Jack Rj45 Cat.6 Negro · artículo 03-06-1416 · ref. X6-F01 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-119', PROV_OCHOA, 1646.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/adaptador-de-fibra-reforzados-03061417',
    nota: 'Adaptador De Fibra Reforzados · artículo 03-06-1417 · ref. XG2-XLC-LC-SM · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-120', PROV_OCHOA, 1782.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/patch-panel-max-modular-de-48-puertos-03061618',
    nota: 'Patch Panel Max Modular, De 48 Puertos, · artículo 03-06-1618 · ref. MX-PNL-48 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-121', PROV_OCHOA, 1803.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/bandeja-de-empalme-03061392',
    nota: 'Bandeja De Empalme · artículo 03-06-1392 · ref. TRAY-3 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-122', PROV_OCHOA, 1866.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tapa-ciega-para-rack-03061646',
    nota: 'Tapa Ciega Para Rack · artículo 03-06-1646 · ref. PNL-TBLNK010-1S · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-123', PROV_OCHOA, 2171.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/organizador-de-cable-hor-1ur-03061386',
    nota: 'Organizador De Cable Hor. 1Ur · artículo 03-06-1386 · ref. HCM-4-1U · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-124', PROV_OCHOA, 2740.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/organizador-de-cable-2ur-03061421',
    nota: 'Organizador De Cable 2Ur · artículo 03-06-1421 · ref. HCM-4-2U · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-125', PROV_OCHOA, 2810.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/adaptador-fibra-optica-03061654',
    nota: 'Adaptador Fibra Optica · artículo 03-06-1654 · ref. LS-MP6-01CAQ · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-125', PROV_OCHOA, 83.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/adaptador-fibra-optica-03061656',
    nota: 'Adaptador Fibra Optica · artículo 03-06-1656 · ref. RIC-F-MX6-01 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-126', PROV_OCHOA, 3491.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/adaptador-quickpack-fibra-optica-03061655',
    nota: 'Adaptador Quickpack Fibra Optica · artículo 03-06-1655 · ref. RIC-F-MP72-01 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-127', PROV_OCHOA, 4089.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-12-port-cat5e12-po-03061326',
    nota: 'Modulo 12-Port Cat5E12-Po · artículo 03-06-1326 · ref. AC1014 · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-128', PROV_OCHOA, 4491.54, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-ric-c-12-acopladores-03061389',
    nota: 'Modulo Ric C / 12 Acopladores · artículo 03-06-1389 · ref. RIC-F-LCQ24-01C · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-129', PROV_OCHOA, 5514.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-12-port-cat612-po-03061327',
    nota: 'Modulo 12-Port Cat612-Po · artículo 03-06-1327 · ref. AC1015 · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-130', PROV_OCHOA, 5568.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/patch-pannel-quest-cat6-24-puertos-03061736',
    nota: 'Patch Pannel Quest Cat6 24 Puertos · artículo 03-06-1736 · ref. ST-QC6-24 · marca TE CONNECTIVITY. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-131', PROV_OCHOA, 6282.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/organizador-cable-vertical-42u-03061627',
    nota: 'Organizador Cable Vertical 42U · artículo 03-06-1627 · ref. V8A-VPC6-1-42 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-132', PROV_OCHOA, 7469.85, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/distribuidor-f-o-deslizable-03061380',
    nota: 'Distribuidor F.O Deslizable · artículo 03-06-1380 · ref. FCP3-DWR · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-133', PROV_OCHOA, 10078.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/rack-7-pies-03061391',
    nota: 'Rack 7 Pies · artículo 03-06-1391 · ref. RS1-07-S · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-134', PROV_OCHOA, 10635.77, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-comunicacion-ethernet-03060580',
    nota: 'Modulo Comunicacion Ethernet · artículo 03-06-0580 · ref. B426 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-135', PROV_OCHOA, 24364.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/organizador-routeit-vertical-doble-de-45-03061621',
    nota: 'Organizador Routeit Vertical Doble De 45 · artículo 03-06-1621 · ref. VCM1A-10D-1-45 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-136', PROV_OCHOA, 1.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/transf-ext-p-antena-03061090',
    nota: 'Transf.Ext. P / Antena · artículo 03-06-1090 · ref. 200-490 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-137', PROV_OCHOA, 2122.4, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fuente-inalabrica-on-off-03061077',
    nota: 'Fuente Inalabrica On / Off · artículo 03-06-1077 · ref. ARPS15RF2 · marca ADORNE. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-138', PROV_OCHOA, 9810.73, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/injector-poe-injec-03061338',
    nota: 'Injector Poe Injec · artículo 03-06-1338 · ref. DA2401 · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-139', PROV_OCHOA, 2153.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caja-de-superficie-ip66-ip67-03061412',
    nota: 'Caja De Superficie Ip66 / Ip67 · artículo 03-06-1412 · ref. X-IBOX-03 · marca SIEMON. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-140', PROV_OCHOA, 251.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/video-balun-st-530135a-03061738',
    nota: 'Video Balun St-530135A · artículo 03-06-1738 · ref. ST-530135A · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-141', PROV_OCHOA, 500.98, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/switch-8-puertos-10-100-mbps-plastico-03062000',
    nota: 'Switch 8 Puertos 10 / 100 Mbps Plastico · artículo 03-06-2000 · ref. DH-PFS3008-8ET-L · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-142', PROV_OCHOA, 670.06, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulador-agil-uso-comercial-p-3-canales-03061153',
    nota: 'Modulador Agil Uso Comercial P / 3 Canales · artículo 03-06-1153 · ref. USM-20D3 · marca STEREN. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-143', PROV_OCHOA, 4799.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/switch-remoto-rf-3-way-03061518',
    nota: 'Switch Remoto Rf 3-Way · artículo 03-06-1518 · ref. LC2203-WH · marca ON Q. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-144', PROV_OCHOA, 11046.92, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/wireless-av-receiver-03061371',
    nota: 'Wireless Av / Receiver · artículo 03-06-1371 · ref. 29358 · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-145', PROV_OCHOA, 16024.35, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/wireless-a-v-for-hdmi-taa-com-03061370',
    nota: 'Wireless A / V For Hdmi Taa Com · artículo 03-06-1370 · ref. 29329 · marca ORTRONICS. ' + SUPUESTO_ITBIS
  });
  c('MAT-30-146', PROV_OCHOA, 5924.86, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/unidad-de-control-digital-pantalla-oled-03060710',
    nota: 'Unidad De Control Digital Pantalla Oled · artículo 03-06-0710 · ref. CZ830MC · marca TUTONDO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-002', PROV_OCHOA, 40009.07, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/central-conserje-2h-03060468',
    nota: 'Central Conserje 2H · artículo 03-06-0468 · ref. 346310 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-003', PROV_OCHOA, 7887.13, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/teclado-modulo-conexion-c-rs-485-p-inter-03061765',
    nota: 'Teclado Modulo Conexion C / Rs-485 P / Inter · artículo 03-06-1765 · ref. OCB-LE-LQ · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-004', PROV_OCHOA, 331.49, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-temp-humedad-p-aire-acond-03061465',
    nota: 'Sensor Temp. Humedad P / Aire Acond. · artículo 03-06-1465 · ref. SI7021 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-005', PROV_OCHOA, 506.24, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/contacto-magnetico-inalambrico-03061478',
    nota: 'Contacto Magnetico Inalambrico · artículo 03-06-1478 · ref. DW2 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-006', PROV_OCHOA, 1071.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-puerta-y-ventana-zigbee-03061701',
    nota: 'Sensor De Puerta Y Ventana Zigbee · artículo 03-06-1701 · ref. MCCGQ11LM · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-007', PROV_OCHOA, 1280.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-temperatura-y-humedad-03061703',
    nota: 'Sensor De Temperatura Y Humedad · artículo 03-06-1703 · ref. WSDCGQ11LM · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-007', PROV_OCHOA, 266.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-temperatura-y-humedad-03061466',
    nota: 'Sensor De Temperatura Y Humedad · artículo 03-06-1466 · ref. DS18B20 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-008', PROV_OCHOA, 1361.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-fugas-de-agua-ip67-zigbee-03061705',
    nota: 'Sensor De Fugas De Agua Ip67 Zigbee · artículo 03-06-1705 · ref. SJCGQ11LM · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-009', PROV_OCHOA, 1439.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-vibracion-03061704',
    nota: 'Sensor De Vibración · artículo 03-06-1704 · ref. DJT11LM · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-010', PROV_OCHOA, 1474.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-movimiento-170grados-zigbee-03061702',
    nota: 'Sensor De Movimiento 170Grados Zigbee · artículo 03-06-1702 · ref. RTCGQ11LM · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-011', PROV_OCHOA, 1600.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-movimiento-p1-03061711',
    nota: 'Sensor De Movimiento P1 · artículo 03-06-1711 · ref. MS-S02 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-012', PROV_OCHOA, 1906.37, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/contacto-radion-universal-03061305',
    nota: 'Contacto Radion Universal · artículo 03-06-1305 · ref. RFUN-A · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-013', PROV_OCHOA, 6967.3, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/sensor-de-presencia-fp2-znms02es-03061827',
    nota: 'Sensor De Presencia Fp2 Znms02Es · artículo 03-06-1827 · ref. PS-S02E · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-014', PROV_OCHOA, 101.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pulsador-p-telefono-sprint-03060294',
    nota: 'Pulsador P / Telefono Sprint · artículo 03-06-0294 · ref. 337430 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-015', PROV_OCHOA, 1001.67, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pulsador-int-serie-3000-s-vx2200-03060438',
    nota: 'Pulsador Int.Serie 3000 S.Vx2200 · artículo 03-06-0438 · ref. VX3171 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-016', PROV_OCHOA, 1091.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/boton-de-salida-mecanico-03062055',
    nota: 'Boton De Salida Mecanico · artículo 03-06-2055 · ref. ASF905 · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-017', PROV_OCHOA, 1437.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pulsador-inalambrico-bidireccional-4-bot-03061825',
    nota: 'Pulsador Inalambrico Bidireccional 4 Bot · artículo 03-06-1825 · ref. V144-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-018', PROV_OCHOA, 1444.45, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pulsador-inalambrico-bidireccional-03061845',
    nota: 'Pulsador Inalambrico Bidireccional · artículo 03-06-1845 · ref. VESTA-144-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-019', PROV_OCHOA, 1628.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/boton-de-panico-inalambrico-vesta-03061819',
    nota: 'Botón De Pánico Inalambrico Vesta. · artículo 03-06-1819 · ref. V038-433 · marca VESTA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-020', PROV_OCHOA, 9200.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/estacion-de-llamada-pln-6aio240-6-zonas-03061292',
    nota: 'Estación De Llamada Pln-6Aio240, 6 Zonas · artículo 03-06-1292 · ref. PLN-6CS · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-021', PROV_OCHOA, 14861.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/estacion-interior-touch-7-p-intercom-03061766',
    nota: 'Estacion Interior Touch 7” P / Intercom · artículo 03-06-1766 · ref. ST-LI9460-UD2 · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-022', PROV_OCHOA, 5063.11, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cerradura-inteligente-p-ul1-negro-03061184',
    nota: 'Cerradura Inteligente P / Ul1 Negro · artículo 03-06-1184 · ref. AUTOBOLT-BK · marca ULTRALOQ. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-023', PROV_OCHOA, 9798.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cerradura-inteligente-5-in-1-ab-03060747',
    nota: 'Cerradura Inteligente 5-In-1 Ab · artículo 03-06-0747 · ref. UL3BT · marca ULTRALOQ. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-024', PROV_OCHOA, 10930.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cerradura-inteligente-negro-app-huella-03061183',
    nota: 'Cerradura Inteligente Negro App / Huella · artículo 03-06-1183 · ref. UL1BK-UB01+BRIDGE · marca ULTRALOQ. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-025', PROV_OCHOA, 15106.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cerradura-inteligente-3-in-1-satin-03060748',
    nota: 'Cerradura Inteligente 3-In-1 Satin · artículo 03-06-0748 · ref. SN-UB01COMBO+BRIDGE · marca ULTRALOQ. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-026', PROV_OCHOA, 305.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/telefono-trad-intercom-serie-3000-03060439',
    nota: 'Telefono Trad. Intercom Serie 3000 · artículo 03-06-0439 · ref. S.VX3111 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-027', PROV_OCHOA, 1419, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/telefono-sprint-194mm-03061069',
    nota: 'Telefono Sprint 194Mm · artículo 03-06-1069 · ref. 344242 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-028', PROV_OCHOA, 5570.12, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/monitor-touch-negro-7-p-intercom-03062009',
    nota: 'Monitor Touch Negro 7” P / Intercom · artículo 03-06-2009 · ref. DHI-VTH2421FB-P · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-029', PROV_OCHOA, 8802.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/videoportero-p-villa-ip-wf-4btn-2mp-03062008',
    nota: 'Videoportero P / Villa Ip / Wf 4Btn 2Mp · artículo 03-06-2008 · ref. DHI-VTO3311Q-WP · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-030', PROV_OCHOA, 8979.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-de-video-timbre-inteligente-g4-03061830',
    nota: 'Kit De Video Timbre Inteligente G4 · artículo 03-06-1830 · ref. SVD-KIT1 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-031', PROV_OCHOA, 10076.91, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/monitor-p-intercom-de-7-03061665',
    nota: 'Monitor P / Intercom De 7\'\' · artículo 03-06-1665 · ref. 16124 · marca YALE. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-032', PROV_OCHOA, 16736.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-intercom-video-4-ydv-4702-ydv4403-03060654',
    nota: 'Kit Intercom Video 4\'\' Ydv-4702 / Ydv4403 · artículo 03-06-0654 · ref. 11400/16140 · marca YALE. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-033', PROV_OCHOA, 16951.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-intercom-audio-8-apartamentos-03060434',
    nota: 'Kit Intercom Audio 8 Apartamentos · artículo 03-06-0434 · ref. KBP88LL3BS · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-034', PROV_OCHOA, 22371.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-luci-microeva-2in-2out-03060665',
    nota: 'Kit Luci Microeva 2In / 2Out · artículo 03-06-0665 · ref. HKITP620 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-035', PROV_OCHOA, 22538.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-intercom-video-7-touch-ydv-ts-03060655',
    nota: 'Kit Intercom Video 7\'\' Touch Ydv-Ts · artículo 03-06-0655 · ref. 10930/16066 · marca YALE. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-036', PROV_OCHOA, 32009.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-intercom-audio-video-color-4-apart-03060428',
    nota: 'Kit Intercom Audio Video / Color 4 Apart. · artículo 03-06-0428 · ref. KWB48LL2BS · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-037', PROV_OCHOA, 41504.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-intercom-audio-video-color-6-apart-03060429',
    nota: 'Kit Intercom Audio Video / Color 6 Apart. · artículo 03-06-0429 · ref. KWB68LL2BS · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-038', PROV_OCHOA, 50715.2, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-intercom-audio-video-color-8-apart-03060430',
    nota: 'Kit Intercom Audio Video / Color 8 Apart. · artículo 03-06-0430 · ref. KWB88LL2BS · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-039', PROV_OCHOA, 61795.82, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-domotica-10-circuitos-on-off-2-shutt-03061769',
    nota: 'Kit Domotica 10 Circuitos On-Off+2 Shutt · artículo 03-06-1769 · ref. HKITZ520H · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-040', PROV_OCHOA, 85380.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/kit-domotica-10-circuitos-on-03061770',
    nota: 'Kit Domotica 10 Circuitos On- · artículo 03-06-1770 · ref. HKITZ527H · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-041', PROV_OCHOA, 178.8, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cable-para-conexion-470mm-03060316',
    nota: 'Cable Para Conexion 470Mm · artículo 03-06-0316 · ref. 346902 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-042', PROV_OCHOA, 713.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/organizador-de-2-u-fertec-03062159',
    nota: 'Organizador De 2 U Fertec · artículo 03-06-2159 · ref. FT-CM2UFERTEC · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-043', PROV_OCHOA, 1766.44, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-termoregulador-12vdc-rs485-mix-03060398',
    nota: 'Modulo Termoregulador 12Vdc Rs485.Mix · artículo 03-06-0398 · ref. HA10413 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-044', PROV_OCHOA, 2573.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-montaje-para-2-modulos-intercom-03061767',
    nota: 'Modulo Montaje Para 2 Modulos Intercom · artículo 03-06-1767 · ref. OCB-LBCE9003-RS2 · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-045', PROV_OCHOA, 2999.88, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-8-pulsadores-2h-2f-03060479',
    nota: 'Modulo 8 Pulsadores 2H 2F · artículo 03-06-0479 · ref. 352100 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-046', PROV_OCHOA, 3552.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-duplicacion-entradas-03060394',
    nota: 'Modulo Duplicacion Entradas · artículo 03-06-0394 · ref. HA03000 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-047', PROV_OCHOA, 3563.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-de-teclado-sfera-2h-03060484',
    nota: 'Módulo De Teclado Sfera 2H · artículo 03-06-0484 · ref. 353000 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-048', PROV_OCHOA, 12062.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-pantalla-2h2-wir-03060481',
    nota: 'Modulo Pantalla 2H2 Wir · artículo 03-06-0481 · ref. 352500 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-049', PROV_OCHOA, 13196.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-dlfra-p-acceso-modo-bco-03060704',
    nota: 'Modulo Dlfra P / Acceso Modo Bco. · artículo 03-06-0704 · ref. HA02012 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-050', PROV_OCHOA, 13196.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-dlfra-p-acceso-modo-gris-03060706',
    nota: 'Modulo Dlfra P / Acceso Modo Gris · artículo 03-06-0706 · ref. HA02010 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-051', PROV_OCHOA, 13617.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-audio-y-video-2-hilo-03060480',
    nota: 'Modulo Audio Y Video 2 Hilo · artículo 03-06-0480 · ref. 351200 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-052', PROV_OCHOA, 21617.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/modulo-de-expansion-03061483',
    nota: 'Modulo De Expansion · artículo 03-06-1483 · ref. 346851 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-053', PROV_OCHOA, 1439.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/controlador-smart-home-cub-03061706',
    nota: 'Controlador Smart Home Cub · artículo 03-06-1706 · ref. MFKZQ01LM · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-054', PROV_OCHOA, 294.14, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toma-8-hilos-p-centralita-1-mod-living-03060344',
    nota: 'Toma 8 Hilos P / Centralita 1 Mod.Living · artículo 03-06-0344 · ref. 336983 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-055', PROV_OCHOA, 1026.79, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-inteligente-03062194',
    nota: 'Interruptor Inteligente · artículo 03-06-2194 · ref. MINI-R4M · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-056', PROV_OCHOA, 1078.94, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-wifi-multifuncion-03061581',
    nota: 'Interruptor Wifi Multifunción · artículo 03-06-1581 · ref. BASICR4 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-057', PROV_OCHOA, 1089.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-wifi-sencillo-hor-bco-03061479',
    nota: 'Interruptor Wifi Sencillo Hor. Bco · artículo 03-06-1479 · ref. TOUCHUS · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-058', PROV_OCHOA, 1497.83, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-wifi-triple-bco-03061450',
    nota: 'Interruptor Wifi Triple Bco · artículo 03-06-1450 · ref. T2US3C · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-059', PROV_OCHOA, 1630.25, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-blanco-03061961',
    nota: 'Interruptor Blanco · artículo 03-06-1961 · ref. M5-2C-120W · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-059', PROV_OCHOA, 1715.72, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-blanco-03061960',
    nota: 'Interruptor Blanco · artículo 03-06-1960 · ref. M5-3C-120W · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-059', PROV_OCHOA, 1508.28, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-blanco-03061962',
    nota: 'Interruptor Blanco · artículo 03-06-1962 · ref. M5-1C-120W · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-060', PROV_OCHOA, 1740.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-medidor-de-potencia-03061964',
    nota: 'Interruptor Medidor De Potencia · artículo 03-06-1964 · ref. POWR320DELITE · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-061', PROV_OCHOA, 2008.71, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-tx-ultimate-1-canal-03061946',
    nota: 'Interruptor Tx Ultimate 1 Canal · artículo 03-06-1946 · ref. T5-1C-120 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-062', PROV_OCHOA, 2054.7, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-tx-ultimate-2-canales-03061947',
    nota: 'Interruptor Tx Ultimate 2 Canales · artículo 03-06-1947 · ref. T5-2C-120 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-063', PROV_OCHOA, 2368.55, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tomacorriente-smart-zigbee-15a-125v-03061694',
    nota: 'Tomacorriente Smart Zigbee 15A 125V · artículo 03-06-1694 · ref. ZNCZ12LM · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-064', PROV_OCHOA, 2372.05, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-wifi-p-abanico-c-bateria-03061788',
    nota: 'Interruptor Wifi P / Abanico C / Bateria · artículo 03-06-1788 · ref. IFAN04-L · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-065', PROV_OCHOA, 2743.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-doble-c-neutro-120v-blanco-03061698',
    nota: 'Interruptor Doble C / Neutro 120V Blanco · artículo 03-06-1698 · ref. WS-USC04 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-066', PROV_OCHOA, 2743.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-doble-sin-neutro-120v-blanco-03061696',
    nota: 'Interruptor Doble Sin Neutro 120V Blanco · artículo 03-06-1696 · ref. WS-USC02 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-067', PROV_OCHOA, 2892.27, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interruptor-simple-c-neutro-120v-blanco-03061697',
    nota: 'Interruptor Simple C / Neutro 120V Blanco · artículo 03-06-1697 · ref. WS-USC03 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-068', PROV_OCHOA, 2958.46, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/interrupto-simple-sin-neutro-120v-blanco-03061695',
    nota: 'Interrupto Simple Sin Neutro 120V Blanco · artículo 03-06-1695 · ref. WS-USC01 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-069', PROV_OCHOA, 5359.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/int-timer-smart-home-16a-03061068',
    nota: 'Int.Timer Smart Home 16A · artículo 03-06-1068 · ref. G2-CW-PT · marca SWITCH BEE. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-070', PROV_OCHOA, 5359.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/shutter-switch-2way-03061067',
    nota: 'Shutter+ Switch 2Way · artículo 03-06-1067 · ref. 3-M-SSR · marca SWITCH BEE. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-071', PROV_OCHOA, 5359.63, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/toma-cte-inteligente-smat-home-03060753',
    nota: 'Toma Cte Inteligente Smat Home · artículo 03-06-0753 · ref. IR-SK-R16 · marca SWITCH BEE. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-072', PROV_OCHOA, 7656.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/int-triple-smart-home-10a-03061066',
    nota: 'Int. Triple Smart Home 10A · artículo 03-06-1066 · ref. G3-CW-S3 · marca SWITCH BEE. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-073', PROV_OCHOA, 7806.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/microfluxa-s-dimmer-0-10v-1out-03060667',
    nota: 'Microfluxa S.Dimmer 0-10V 1Out · artículo 03-06-0667 · ref. HL61000 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-074', PROV_OCHOA, 28.95, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/capacitor-275v-0-5mf-03060752',
    nota: 'Capacitor 275V 0.5Mf · artículo 03-06-0752 · ref. CAPBLINK · marca SWITCH BEE. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-075', PROV_OCHOA, 1111.78, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/power-supply-12vdc-100-260vac-03062116',
    nota: 'Power Supply 12Vdc 100-260Vac · artículo 03-06-2116 · ref. ES516N110VAC · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-076', PROV_OCHOA, 4514.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fuente-alimentador-12v-4a-4mod-03060395',
    nota: 'Fuente Alimentador 12V 4A 4Mod · artículo 03-06-0395 · ref. HA06000-DIN · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-077', PROV_OCHOA, 4801.16, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/pdu-8-salidas-rackmount-dahua-03062115',
    nota: 'Pdu 8 Salidas Rackmount Dahua · artículo 03-06-2115 · ref. ZZM10/PDU(8USA250) · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-078', PROV_OCHOA, 5229.21, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/fuente-poder-2-hilos-03060476',
    nota: 'Fuente Poder 2 Hilos · artículo 03-06-0476 · ref. 346050 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-079', PROV_OCHOA, 9152.69, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/regenerador-de-bus-ursula-03060670',
    nota: 'Regenerador De Bus Úrsula · artículo 03-06-0670 · ref. HA02000 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-080', PROV_OCHOA, 175.04, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/base-din-sonoff-03061469',
    nota: 'Base Din Sonoff · artículo 03-06-1469 · ref. DRDINRAILTRAY · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-081', PROV_OCHOA, 255.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caja-de-registro-para-basic-03061468',
    nota: 'Caja De Registro Para Basic · artículo 03-06-1468 · ref. WATERPROOFCASE · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-082', PROV_OCHOA, 656.41, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/caja-empotrar-de-2-modulos-03060465',
    nota: 'Caja Empotrar De 2 Módulos · artículo 03-06-0465 · ref. 350020 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-083', PROV_OCHOA, 1346.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/bracket-zl-p-fijar-cerradura-600lbs-03062118',
    nota: 'Bracket Zl P / Fijar Cerradura 600Lbs · artículo 03-06-2118 · ref. DHI-ASF500-ZL · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-084', PROV_OCHOA, 1556.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cubierta-de-modulo-2-hilos-03060473',
    nota: 'Cubierta De Módulo 2 Hilos · artículo 03-06-0473 · ref. 351201 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-085', PROV_OCHOA, 1992.43, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cubierta-modulo-a-v-2p-audio-03061187',
    nota: 'Cubierta Modulo A / V 2P Audio · artículo 03-06-1187 · ref. 351221 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-086', PROV_OCHOA, 2294.68, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/bracket-u-zl-p-fijar-cerradura-600lbs-03062117',
    nota: 'Bracket U-Zl P / Fijar Cerradura 600Lbs · artículo 03-06-2117 · ref. DHI-ASF280F · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-087', PROV_OCHOA, 2499.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/cubierta-8-pulsadorrs-2h-2f-03060471',
    nota: 'Cubierta 8 Pulsadorrs 2H 2F · artículo 03-06-0471 · ref. 352181 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-088', PROV_OCHOA, 323.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/configurador-3-caja-de-10-unids-03060320',
    nota: 'Configurador #3 Caja De 10 Unids · artículo 03-06-0320 · ref. 346913/3501/3 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-089', PROV_OCHOA, 323.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/configurador-4-caja-de-10-unids-03060321',
    nota: 'Configurador #4 Caja De 10 Unids · artículo 03-06-0321 · ref. 346914/3501/4 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-090', PROV_OCHOA, 329.66, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/configurador-5-caja-de-10-unids-03060322',
    nota: 'Configurador #5 Caja De 10 Unids · artículo 03-06-0322 · ref. 346915/3501/5 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-091', PROV_OCHOA, 538.84, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/control-remoto-rf-03061610',
    nota: 'Control Remoto Rf · artículo 03-06-1610 · ref. RM433 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-092', PROV_OCHOA, 559.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/configurador-6-caja-de-10-unids-03060323',
    nota: 'Configurador #6 Caja De 10 Unids · artículo 03-06-0323 · ref. 346916/3501/6 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-093', PROV_OCHOA, 594.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/configurador-2-caja-de-10-unids-03060319',
    nota: 'Configurador #2 Caja De 10 Unids · artículo 03-06-0319 · ref. 346912/3501/2 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-094', PROV_OCHOA, 594.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/configurador-9-caja-de-10-unids-03060326',
    nota: 'Configurador #9 Caja De 10 Unids · artículo 03-06-0326 · ref. 346919/3501/9 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-095', PROV_OCHOA, 774.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tarjeta-badge-rifd-neutra-adjunta-03060707',
    nota: 'Tarjeta Badge Rifd Neutra Adjunta · artículo 03-06-0707 · ref. HA02021 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-096', PROV_OCHOA, 7237.01, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tarjeta-ingrid-para-extension-03060668',
    nota: 'Tarjeta Ingrid Para Extensión · artículo 03-06-0668 · ref. HL16000 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-097', PROV_OCHOA, 14351.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tarjeta-eva-light-16in-100ut-125v-03060396',
    nota: 'Tarjeta Eva Light 16In 100Ut 125V · artículo 03-06-0396 · ref. HS07500 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-098', PROV_OCHOA, 17663.76, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tarjeta-vesta-12vdc-03060399',
    nota: 'Tarjeta Vesta 12Vdc · artículo 03-06-0399 · ref. HM01000 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-099', PROV_OCHOA, 19549.22, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/tarjeta-eva-16in-100ut-multifuncion-125v-03060397',
    nota: 'Tarjeta Eva 16In 100Ut Multifuncion 125V · artículo 03-06-0397 · ref. HS01500 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-100', PROV_OCHOA, 231.08, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/video-balun-aciple-rap-c-cable-8mp-cvi-03062123',
    nota: 'Video Balun Aciple Rap.C / Cable 8Mp Cvi · artículo 03-06-2123 · ref. DH-PFM800-4K · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-101', PROV_OCHOA, 587.39, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/terminal-rj45-cat6-100pcs-03062124',
    nota: 'Terminal Rj45 Cat6 (100Pcs) · artículo 03-06-2124 · ref. DH-PFM976-631 · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-102', PROV_OCHOA, 1120.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/mini-switch-inalambrico-03061707',
    nota: 'Mini Switch Inalámbrico · artículo 03-06-1707 · ref. WXKG11LM · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-103', PROV_OCHOA, 1156.51, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/bridge-rf-433mhz-wifi-03061452',
    nota: 'Bridge Rf-433Mhz + Wifi · artículo 03-06-1452 · ref. RFBRIDGER2 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-104', PROV_OCHOA, 4641.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/receptor-bus-sdi2-inalambrica-03061548',
    nota: 'Receptor Bus Sdi2 Inalámbrica · artículo 03-06-1548 · ref. B810 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-105', PROV_OCHOA, 5282.42, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/borne-transmisor-infrarojos-12vcc-03060674',
    nota: 'Borne Transmisor Infrarojos 12Vcc · artículo 03-06-0674 · ref. HA11000 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-106', PROV_OCHOA, 8465.64, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/concentrador-hub-03061963',
    nota: 'Concentrador Hub · artículo 03-06-1963 · ref. AIBRIDG/AIBRIDGE-26 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-107', PROV_OCHOA, 10846.87, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/unidad-central-c-alexa-incluido-03060754',
    nota: 'Unidad Central C / Alexa Incluido · artículo 03-06-0754 · ref. 1-CU · marca SWITCH BEE. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-108', PROV_OCHOA, 18998.93, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/switch-poe-clod-gigabit-ad-24poe-2ul-03062109',
    nota: 'Switch Poe Clod Gigabit Ad 24Poe+2Ul · artículo 03-06-2109 · ref. DH-CS4228-24GT-240 · marca DAHUA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-109', PROV_OCHOA, 537.03, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/soneria-adicional-2-hilos-03060303',
    nota: 'Soneria Adicional 2 Hilos · artículo 03-06-0303 · ref. 336910 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-110', PROV_OCHOA, 563.56, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/unidad-p-secreto-de-conversacion-03060302',
    nota: 'Unidad P / Secreto De Conversacion · artículo 03-06-0302 · ref. 336300 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-111', PROV_OCHOA, 1085.02, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/frontal-para-teclado-numerico-03060313',
    nota: 'Frontal Para Teclado Numerico · artículo 03-06-0313 · ref. 332651 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-112', PROV_OCHOA, 1143.26, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/automation-premium-basic-zigbee-03061540',
    nota: 'Automation Premium Basic Zigbee · artículo 03-06-1540 · ref. 4660 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-113', PROV_OCHOA, 1145.61, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/automation-premium-d1-03061541',
    nota: 'Automation Premium D1 · artículo 03-06-1541 · ref. 433.92MH · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-114', PROV_OCHOA, 1210.31, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/doble-pulsador-serie-modo-03060679',
    nota: 'Doble Pulsador Serie Modo · artículo 03-06-0679 · ref. HA10010 · marca MASTER. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-115', PROV_OCHOA, 1430.53, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/auto-premium-interruptor-2ch-blanco-03061470',
    nota: 'Auto Premium Interruptor 2Ch Blanco · artículo 03-06-1470 · ref. T2US2C · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-116', PROV_OCHOA, 1516.19, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/automation-premium-tomacorriente-03061634',
    nota: 'Automation Premium Tomacorriente · artículo 03-06-1634 · ref. IW100 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-117', PROV_OCHOA, 1749.36, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/auto-premium-interruptor-1ch-black-03061461',
    nota: 'Auto Premium Interruptor 1Ch Black · artículo 03-06-1461 · ref. T3US1C · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-118', PROV_OCHOA, 1765.47, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/derivador-montante-independ-03060327',
    nota: 'Derivador Montante Independ. · artículo 03-06-0327 · ref. 346980 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-119', PROV_OCHOA, 1856.15, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/auto-premium-interruptor-2ch-negro-03061476',
    nota: 'Auto Premium Interruptor 2Ch Negro · artículo 03-06-1476 · ref. T3US2C · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-120', PROV_OCHOA, 2071.9, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/auto-premium-interruptor-3ch-negro-03061477',
    nota: 'Auto Premium Interruptor 3Ch Negro · artículo 03-06-1477 · ref. T3US3C · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-121', PROV_OCHOA, 2164.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/marco-soporte-2-modulos-03060477',
    nota: 'Marco Soporte 2 Modulos · artículo 03-06-0477 · ref. 350221 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-122', PROV_OCHOA, 2745.97, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/disp-wifi-4ch-10a-15a-03061580',
    nota: 'Disp. Wifi 4Ch 10A / 15A · artículo 03-06-1580 · ref. 4CHPROR3 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-122', PROV_OCHOA, 2604.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/disp-wifi-4ch-10a-15a-03061583',
    nota: 'Disp. Wifi 4Ch 10A / 15A · artículo 03-06-1583 · ref. 4CHR3 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-123', PROV_OCHOA, 2878.17, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/disp-wifi-multifuncion-15a-03061449',
    nota: 'Disp. Wifi Multifuncion 15A · artículo 03-06-1449 · ref. POWR3 · marca SONOFF. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-124', PROV_OCHOA, 3719.96, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/smart-home-hub-03061700',
    nota: 'Smart Home Hub · artículo 03-06-1700 · ref. HUBM1S · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-124', PROV_OCHOA, 4457.57, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/smart-home-hub-03061709',
    nota: 'Smart Home Hub · artículo 03-06-1709 · ref. HUBM2 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-124', PROV_OCHOA, 2234.38, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/smart-home-hub-03061710',
    nota: 'Smart Home Hub · artículo 03-06-1710 · ref. HUBE1 · marca AQARA. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-125', PROV_OCHOA, 5396.45, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/accesorios-p-instalacion-2-modulo-interc-03061768',
    nota: 'Accesorios P / Instalacion 2 Modulo Interc · artículo 03-06-1768 · ref. ST-LE-BDV2 · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-126', PROV_OCHOA, 9883.62, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/video-intercom-modulo-estacion-puerta-03061764',
    nota: 'Video Intercom Modulo Estacion Puerta · artículo 03-06-1764 · ref. ST-LE9003-JNF1 · marca SECTECH. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-127', PROV_OCHOA, 11519.81, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/intercom-video-7-adic-4haddit-03061043',
    nota: 'Intercom Video 7\'\' Adic 4Haddit · artículo 03-06-1043 · ref. 330751 · marca BTICINO. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-128', PROV_OCHOA, 39743.82, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/temporizador-semanal-plena-03061293',
    nota: 'Temporizador Semanal Plena · artículo 03-06-1293 · ref. PLN-6TMW · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-129', PROV_OCHOA, 40282.58, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/gestor-de-mensajes-plena-03061244',
    nota: 'Gestor De Mensajes Plena · artículo 03-06-1244 · ref. LBB1965/00 · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  c('MAT-31-130', PROV_OCHOA, 59719.34, {
    fecha: '2026-09-09', fuente: 'Precio publicado en https://ochoa.com.do/producto/plena-matrix-mezclador-8-canales-03061605',
    nota: 'Plena Matrix Mezclador 8 Canales · artículo 03-06-1605 · ref. PLM-8M8-US · marca BOSCH. ' + SUPUESTO_ITBIS
  });
  /* catalogos:cotizaciones:fin */

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
