#!/usr/bin/env node
/* =========================================================
   datos-para-excel.js

   Vuelca a JSON, por salida estándar, todo lo que necesita el
   libro de Excel: catálogo, cotizaciones, proveedores,
   conversiones y los totales de portada.

   Lo consume herramientas/generar-excel.py, que es quien arma
   el .xlsx. La división es a propósito: el modelo de datos vive
   en JavaScript, que es donde lo lee el sitio, y no se duplica.

   IMPORTANTE — el libro NO carga datos-demo.js. Las cotizaciones
   de demostración existen para que se vea cómo funcionará el
   sitio, y un archivo que circula por correo no es lugar para
   precios ficticios. Los ítems que hoy solo tienen precio demo
   salen en el libro como estimaciones, que es lo que son.
   ========================================================= */

'use strict';

const path = require('path');
const DATOS = path.join(__dirname, '..', 'precios/assets/js');

global.window = global;
['catalogo', 'proveedores', 'precios'].forEach(f => require(path.join(DATOS, 'datos-' + f + '.js')));

const CAT = global.CATALOGO;
const PROV = global.PROVEEDORES;
const PRECIOS = global.PRECIOS;

const problemas = PRECIOS.aplicar(CAT, PROV);
if (problemas && problemas.length) {
  console.error('Los datos tienen problemas; corrígelos antes de generar el libro:');
  problemas.forEach(p => console.error('  - ' + p));
  process.exit(1);
}

const catPorCodigo = {};
CAT.categorias.forEach(c => { catPorCodigo[c.codigo] = c; });
const grupoPorCodigo = {};
CAT.grupos.forEach(g => { grupoPorCodigo[g.codigo] = g; });
const etapaPorCodigo = {};
CAT.etapas.forEach(e => { etapaPorCodigo[e.codigo] = e; });

/* Proveedores que aparecen en alguna cotización, en el orden en que
   conviene leerlos: primero los que más ítems cotizan. */
const cuenta = {};
PRECIOS.registros.forEach(q => { cuenta[q.proveedor] = (cuenta[q.proveedor] || 0) + 1; });
const conCotizaciones = PROV.lista
  .filter(p => cuenta[p.nombre])
  .sort((a, b) => cuenta[b.nombre] - cuenta[a.nombre] || a.nombre.localeCompare(b.nombre, 'es'));

/* Cotizaciones por ítem y proveedor. Cuando un proveedor tiene más de
   una para el mismo ítem —dos presentaciones, dos marcas— se toma la
   más baja, que es la que un comprador usaría para negociar. */
const todasPorItem = {};
PRECIOS.registros.forEach(q => {
  if (q.precio > 0) (todasPorItem[q.item] = todasPorItem[q.item] || []).push(q.precio);
});

const porItem = {};
PRECIOS.registros.forEach(q => {
  const fila = porItem[q.item] || (porItem[q.item] = {});
  const previo = fila[q.proveedor];
  if (!previo || q.precio < previo.precio) fila[q.proveedor] = q;
});

const items = CAT.items.map(i => ({
  codigo: i.codigo,
  grupo: grupoPorCodigo[i.codigo.slice(0, 3)] ? grupoPorCodigo[i.codigo.slice(0, 3)].nombre : i.codigo.slice(0, 3),
  categoria: catPorCodigo[i.cat] ? catPorCodigo[i.cat].nombre : i.cat,
  catCodigo: i.cat,
  nombre: i.nombre,
  esp: i.esp,
  alcance: i.alcance,
  alias: i.alias,
  unidad: i.unidad,
  etapa: etapaPorCodigo[i.etapa] ? etapaPorCodigo[i.etapa].nombre : (i.etapa || 'Transversal'),
  gama: i.gama,
  origen: i.origen,
  estado: i.estado,
  itbis: i.itbis,
  ref: i.ref,
  min: i.min,
  max: i.max,
  fecha: i.fecha,
  /* En el Excel la fuente son los comercios que cotizaron el ítem, no el
     conteo: quien audita un presupuesto quiere el nombre. */
  fuente: Object.keys(porItem[i.codigo] || {}).sort().join(' · '),
  nota: i.nota,
  medidas: i.medidas || {},
  cotizaciones: Object.keys(porItem[i.codigo] || {}).length,
  precios: conCotizaciones.map(p => {
    const q = (porItem[i.codigo] || {})[p.nombre];
    return q ? { precio: q.precio, unidad: q.unidad || '', itbis: q.itbis, fecha: q.fecha } : null;
  }),
  /* TODAS las cotizaciones, sin colapsar por comercio. El comparativo del
     Excel usa la más barata de cada tienda, que es la que sirve para
     negociar; el auditor necesita lo contrario —la lista entera— porque los
     peldaños intermedios son justamente lo que le dice si un hueco es un
     error o el salto normal entre una marca y otra. Colapsando, el tapón
     macho de 1" quedaba en RD$ 5.61 y RD$ 62 y parecía roto; con la lista
     completa aparece el de RD$ 35.11 en medio, del mismo comercio, y se ve
     que es la escalera de marcas. */
  todas: (todasPorItem[i.codigo] || []).slice().sort((a, b) => a - b)
}));

const proveedores = PROV.lista.map(p => ({
  nombre: p.nombre,
  tipo: p.tipo,
  canal: p.canal,
  publico: p.publico,
  precios: p.precios,
  demo: !!p.demo,
  zonas: (p.zonas || []).map(z => {
    const x = (PROV.zonas || []).filter(k => k.codigo === z)[0];
    return x ? x.nombre : z;
  }),
  cats: (p.cats || []).map(c => catPorCodigo[c] ? catPorCodigo[c].nombre : c),
  web: p.web, tel: p.tel, wa: p.wa, email: p.email, nota: p.nota,
  cotizaciones: cuenta[p.nombre] || 0
}));

const verificados = CAT.items.filter(i => i.estado === 'verificado').length;
const tarifario = CAT.items.filter(i => i.estado === 'tarifario').length;

process.stdout.write(JSON.stringify({
  generado: new Date().toISOString().slice(0, 10),
  sitio: 'https://precios.ingsliberato.com',
  totales: {
    items: CAT.items.length,
    conPrecio: CAT.items.length - tarifario,
    verificados: verificados,
    estimados: CAT.items.length - tarifario - verificados,
    tarifario: tarifario,
    cotizaciones: PRECIOS.registros.length,
    comercios: conCotizaciones.length
  },
  proveedoresComparativo: conCotizaciones.map(p => p.nombre),
  items: items,
  proveedores: proveedores,
  categorias: CAT.categorias.map(c => ({ codigo: c.codigo, nombre: c.nombre, desc: c.desc, slug: c.slug })),
  etapas: CAT.etapas.map(e => e.nombre),
  conversiones: CAT.conversiones
}));
