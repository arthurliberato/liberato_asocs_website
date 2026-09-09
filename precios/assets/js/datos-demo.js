/* =========================================================
   MODO DEMOSTRACIÓN — datos ficticios

   Este archivo carga proveedores y cotizaciones INVENTADOS, para
   poder ver cómo se comporta el sitio cuando ya haya cotizaciones
   reales cargadas: la ficha por proveedor, el recálculo del precio
   de referencia, la normalización de ITBIS y el copiado a Excel.

   NADA DE LO QUE HAY AQUÍ ES REAL.

   Todos los proveedores llevan «(demo)» en el nombre y la etiqueta
   `demo`, precisamente para que nunca se confundan con las 80
   empresas reales del directorio. Los ítems que reciben estas
   cotizaciones quedan marcados como «Demostración», no como
   «Verificado»: un dato inventado no se presenta como comprobado.

   CÓMO APAGARLO
   -------------
   Poner ACTIVO en false, aquí abajo, y volver a correr:

       node herramientas/generar-categorias.js

   Todo vuelve a su estado real: los proveedores demo desaparecen y
   los ítems regresan a su precio estimado. Para eliminarlo del todo,
   borrar este archivo y su <script> del generador y de las cuatro
   páginas escritas a mano.
   ========================================================= */

(function (global) {
  'use strict';

  var ACTIVO = true;

  if (!ACTIVO) { global.DEMO = {activo: false}; return; }

  var PROV = global.PROVEEDORES;
  var PRECIOS = global.PRECIOS;
  if (!PROV || !PRECIOS) return;

  /* ---------- proveedores ficticios ---------- */

  function pd(nombre, o) {
    PROV.lista.push({
      nombre: nombre,
      tipo: o.tipo, canal: o.canal, publico: o.publico !== false,
      cats: o.cats, zonas: o.zonas || ['gsd'],
      web: '', tel: '', wa: '', email: '', precios: false,
      demo: true,
      nota: 'Proveedor ficticio, cargado solo para la demostración del sitio.'
    });
  }

  pd('Ferretería La Muestra (demo)', {
    tipo: 'cadena', canal: 'detallista', zonas: ['gsd'],
    cats: ['MAT-02','MAT-04','MAT-05','MAT-06','MAT-08','MAT-09','MAT-12','MAT-13','MAT-14']
  });
  pd('Depósito Modelo (demo)', {
    tipo: 'mayorista', canal: 'mayorista', zonas: ['gsd'],
    cats: ['MAT-02','MAT-04','MAT-06','MAT-08','MAT-09','MAT-10','MAT-14']
  });
  pd('Distribuidora Ejemplo (demo)', {
    tipo: 'distribuidor', canal: 'mayorista', zonas: ['nacional'],
    cats: ['MAT-01','MAT-02','MAT-03','MAT-04','MAT-07','MAT-08','MAT-10','MAT-12','MAT-13']
  });
  pd('Cantera Prueba (demo)', {
    tipo: 'fabricante', canal: 'fabricante', zonas: ['gsd'], cats: ['MAT-01']
  });
  pd('Bloquera Demostración (demo)', {
    tipo: 'fabricante', canal: 'fabricante', zonas: ['sur'], cats: ['MAT-05']
  });
  pd('Hormigonera Simulada (demo)', {
    tipo: 'fabricante', canal: 'fabricante', zonas: ['nacional'], cats: ['MAT-03']
  });
  /* Canal cerrado: aparece en la ficha como indicador de tendencia,
     pero no entra en el cálculo del precio de referencia. */
  pd('Cementera Ficticia (demo)', {
    tipo: 'fabricante', canal: 'fabricante', publico: false, zonas: ['nacional'], cats: ['MAT-02','MAT-03']
  });
  pd('Contratista Genérico (demo)', {
    tipo: 'especializado', canal: 'detallista', zonas: ['gsd'], cats: ['MOS-02']
  });

  /* ---------- cotizaciones ficticias ---------- */

  function q(item, proveedor, precio, o) {
    o = o || {};
    PRECIOS.registros.push({
      item: item, proveedor: proveedor, precio: precio,
      fecha: o.fecha || '2026-09-04',
      fuente: o.fuente || 'Cotización de demostración',
      itbis: o.itbis !== false,
      unidad: o.unidad || '',
      nota: o.nota || ''
    });
  }

  /* Cemento: tres cotizaciones que cuentan, una de ellas SIN ITBIS
     (se normaliza antes de comparar), más un fabricante de canal
     cerrado que se muestra pero no promedia. */
  q('MAT-02-001', 'Ferretería La Muestra (demo)', 462, {fecha: '2026-09-05'});
  q('MAT-02-001', 'Depósito Modelo (demo)', 448, {fecha: '2026-09-03', nota: 'Precio por palé completo'});
  q('MAT-02-001', 'Distribuidora Ejemplo (demo)', 390, {fecha: '2026-09-06', itbis: false, nota: 'Cotizado sin ITBIS'});
  q('MAT-02-001', 'Cementera Ficticia (demo)', 430, {fecha: '2026-09-02', nota: 'Precio de fábrica, venta solo por distribución'});

  /* Arena: incluye una cotización por viaje, en unidad distinta a la
     del ítem (m³), que se muestra marcada y queda fuera del cálculo. */
  q('MAT-01-001', 'Cantera Prueba (demo)', 1080, {fecha: '2026-09-05', nota: 'Retirando en cantera'});
  q('MAT-01-001', 'Distribuidora Ejemplo (demo)', 1240, {fecha: '2026-09-04', nota: 'Puesto en obra, Gran Santo Domingo'});
  q('MAT-01-001', 'Cantera Prueba (demo)', 17000, {fecha: '2026-09-05', unidad: 'viaje', nota: 'Viaje de 16 m³'});

  q('MAT-03-002', 'Hormigonera Simulada (demo)', 6950, {fecha: '2026-09-05', itbis: false});
  q('MAT-03-002', 'Distribuidora Ejemplo (demo)', 7100, {fecha: '2026-09-02', itbis: false, nota: 'Mínimo 7 m³ por despacho'});

  q('MAT-04-002', 'Ferretería La Muestra (demo)', 605, {fecha: '2026-09-06'});
  q('MAT-04-002', 'Depósito Modelo (demo)', 578, {fecha: '2026-09-05', nota: 'Desde 50 unidades'});
  q('MAT-04-002', 'Distribuidora Ejemplo (demo)', 596, {fecha: '2026-09-03'});

  q('MAT-05-003', 'Bloquera Demostración (demo)', 37, {fecha: '2026-09-04', nota: 'En fábrica, sin transporte'});
  q('MAT-05-003', 'Ferretería La Muestra (demo)', 42, {fecha: '2026-09-06'});

  q('MAT-06-005', 'Depósito Modelo (demo)', 1740, {fecha: '2026-09-05'});
  q('MAT-06-005', 'Ferretería La Muestra (demo)', 1620, {fecha: '2026-09-04'});

  q('MAT-07-002', 'Distribuidora Ejemplo (demo)', 2390, {fecha: '2026-09-06', nota: 'Corte a medida sin recargo'});

  q('MAT-08-003', 'Ferretería La Muestra (demo)', 1195, {fecha: '2026-09-05'});
  q('MAT-08-003', 'Distribuidora Ejemplo (demo)', 1350, {fecha: '2026-09-03'});
  q('MAT-08-003', 'Depósito Modelo (demo)', 1240, {fecha: '2026-09-06'});

  q('MAT-32-001', 'Ferretería La Muestra (demo)', 1320, {fecha: '2026-09-05'});
  q('MAT-32-001', 'Depósito Modelo (demo)', 1210, {fecha: '2026-09-04'});

  q('MAT-10-001', 'Depósito Modelo (demo)', 2380, {fecha: '2026-09-06'});
  q('MAT-10-001', 'Distribuidora Ejemplo (demo)', 2540, {fecha: '2026-09-02'});

  q('MAT-12-002', 'Ferretería La Muestra (demo)', 9200, {fecha: '2026-09-05'});
  q('MAT-12-002', 'Distribuidora Ejemplo (demo)', 8650, {fecha: '2026-09-04'});

  q('MAT-13-001', 'Distribuidora Ejemplo (demo)', 1045, {fecha: '2026-09-06'});
  q('MAT-13-001', 'Ferretería La Muestra (demo)', 1120, {fecha: '2026-09-03'});

  q('MAT-14-001', 'Ferretería La Muestra (demo)', 82, {fecha: '2026-09-05'});
  q('MAT-14-001', 'Depósito Modelo (demo)', 74, {fecha: '2026-09-04'});

  /* Mano de obra: no lleva ITBIS. */
  q('MOS-02-001', 'Contratista Genérico (demo)', 400, {fecha: '2026-09-05', itbis: false, nota: 'Solo mano de obra, muro de 6"'});

  global.DEMO = {
    activo: true,
    proveedores: PROV.lista.filter(function (p) { return p.demo; }).length,
    cotizaciones: PRECIOS.registros.length
  };

})(typeof window !== 'undefined' ? window : globalThis);
