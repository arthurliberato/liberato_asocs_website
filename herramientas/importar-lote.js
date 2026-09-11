#!/usr/bin/env node
/* =========================================================
   importar-lote.js

   La otra mitad de generar-lote-precios.js. Toma la respuesta
   cruda de un lote —las líneas separadas por | — la revisa
   contra el catálogo y el directorio, y escribe las llamadas a
   c() listas para pegar en precios/assets/js/datos-precios.js.

   No escribe en datos-precios.js por su cuenta a propósito:
   cada cotización que entra al sitio pasa antes por la vista de
   una persona. Lo que la herramienta sí hace es no dejar entrar
   basura.

   USO
   ---
     node herramientas/importar-lote.js respuesta.txt
     node herramientas/importar-lote.js respuesta.txt > cotizaciones.js

   QUÉ RECHAZA
   -----------
   - Código de ítem que no existe en el catálogo.
   - Nombre de proveedor que no está en el directorio (con sugerencia
     del más parecido, porque casi siempre es un tilde de menos).
   - Precio que no es un número positivo.
   - Fecha que no tiene forma AAAA-MM-DD.
   - Líneas marcadas NO ENCONTRADO.

   QUÉ SOLO AVISA
   --------------
   Un precio muy lejos de la estimación de arranque no se rechaza:
   la estimación es lo que estamos corrigiendo. Pero se marca, porque
   un precio 90% por debajo casi siempre significa que la tienda
   vende otra presentación, no que el material bajó de precio.
   ========================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DATOS = path.join(RAIZ, 'precios/assets/js');

global.window = global;
/* El motor va antes que el registro: datos-precios.js le pide la c(). */
require(path.join(DATOS, 'precios.js'));
['catalogo', 'proveedores', 'precios', 'demo'].forEach(function (f) {
  require(path.join(DATOS, 'datos-' + f + '.js'));
});

const CAT = global.CATALOGO;
const PROV = global.PROVEEDORES;

const archivo = process.argv[2];
if (!archivo) {
  console.error('Uso: node herramientas/importar-lote.js <archivo-con-la-respuesta>');
  process.exit(1);
}

const crudo = fs.readFileSync(archivo, 'utf8');

/* ---------------------------------------------------------
   Índices
   --------------------------------------------------------- */

const itemPorCodigo = {};
CAT.items.forEach(function (i) { itemPorCodigo[i.codigo] = i; });

const provPorNombre = {};
PROV.lista.forEach(function (p) { provPorNombre[p.nombre] = p; });

const normaliza = function (s) {
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
};

const provPorClave = {};
PROV.lista.forEach(function (p) { provPorClave[normaliza(p.nombre)] = p; });

const parecido = function (nombre) {
  const clave = normaliza(nombre);
  let mejor = null, mejorLargo = 0;
  Object.keys(provPorClave).forEach(function (k) {
    if (k.indexOf(clave) >= 0 || clave.indexOf(k) >= 0) {
      if (k.length > mejorLargo) { mejorLargo = k.length; mejor = provPorClave[k]; }
    }
  });
  return mejor;
};

/* ---------------------------------------------------------
   Lectura
   --------------------------------------------------------- */

const CAMPOS = 8;   // CODIGO | PROVEEDOR | NOMBRE | PRECIO | ITBIS | URL | FECHA | NOTAS
const buenas = [];
const rechazos = [];
const avisos = [];
const noEncontrado = [];

crudo.split('\n').forEach(function (linea, n) {
  const cruda = linea.trim();
  if (!cruda || cruda.indexOf('|') < 0) return;
  if (/^\|?\s*-+\s*\|/.test(cruda)) return;                       // separador de tabla markdown
  if (/^\s*\|?\s*CODIGO\s*\|/i.test(cruda)) return;               // encabezado

  const campos = cruda.replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); });
  const ref = 'línea ' + (n + 1);

  if (/NO ENCONTRADO/i.test(cruda)) { noEncontrado.push(ref + ': ' + campos[0]); return; }

  if (campos.length < 4) {
    rechazos.push(ref + ': solo trae ' + campos.length + ' campos, hacen falta ' + CAMPOS + ' — ' + cruda.slice(0, 80));
    return;
  }

  const codigo = campos[0].toUpperCase();
  const item = itemPorCodigo[codigo];
  if (!item) { rechazos.push(ref + ': el código ' + codigo + ' no existe en el catálogo.'); return; }

  let prov = provPorNombre[campos[1]];
  if (!prov) {
    const sug = parecido(campos[1]);
    rechazos.push(ref + ': el proveedor "' + campos[1] + '" no está en el directorio' +
      (sug ? ' — ¿querías decir "' + sug.nombre + '"?' : '. Agrégalo primero a datos-proveedores.js.'));
    return;
  }
  if (prov.demo) { rechazos.push(ref + ': "' + prov.nombre + '" es un proveedor de demostración.'); return; }

  const precio = parseFloat(String(campos[3]).replace(/[^0-9.]/g, ''));
  if (!(precio > 0)) { rechazos.push(ref + ': "' + campos[3] + '" no es un precio válido.'); return; }

  const decl = String(campos[4] || '').toUpperCase();
  const declarado = /^S[IÍ]$/.test(decl) ? 'si' : (decl === 'NO' ? 'no' : 'nodice');

  const url = campos[5] || '';
  const fecha = campos[6] || '';
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    rechazos.push(ref + ': la fecha "' + fecha + '" no tiene forma AAAA-MM-DD.');
    return;
  }

  /* El directorio dice qué categorías cubre cada comercio. Si llega un
     precio de una categoría que no tiene declarada, el dato puede estar
     bien y el que está desactualizado es el directorio: se avisa para
     revisar los dos. */
  if (prov.cats.indexOf(item.cat) < 0) {
    avisos.push(codigo + ' · ' + prov.nombre + ': el directorio no lo tiene registrado en ' +
      item.cat + '. Si el precio es correcto, agrega la categoría en datos-proveedores.js.');
  }

  /* El precio de arranque es una estimación nuestra: sirve de alarma,
     no de juez. Solo avisamos cuando la distancia es tan grande que
     casi seguro son presentaciones distintas. */
  if (item.ref) {
    const razon = precio / item.ref;
    if (razon < 0.35 || razon > 3) {
      avisos.push(codigo + ' · ' + prov.nombre + ': RD$ ' + precio +
        ' contra una estimación de RD$ ' + item.ref + ' (' +
        Math.round((razon - 1) * 100) + '%). Revisa la presentación antes de cargarlo.');
    }
  }

  buenas.push({
    item: item, prov: prov, precio: precio, declarado: declarado,
    nombreTienda: campos[2] || '', url: url, fecha: fecha,
    notas: campos[7] || ''
  });
});

/* ---------------------------------------------------------
   Salida
   --------------------------------------------------------- */

const esc = function (s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); };

const bloques = buenas.map(function (b) {
  const nota = [];
  if (b.nombreTienda) nota.push(b.nombreTienda);
  if (b.notas) nota.push(b.notas);

  /* Cuando la ficha no declara ITBIS reusamos la constante que ya vive
     en datos-precios.js, así que esa parte de la nota sale como
     expresión y no como texto literal. */
  let notaJS = nota.length ? "'" + esc(nota.join('. ')) + "'" : '';
  if (b.declarado === 'nodice') {
    notaJS = notaJS ? "'" + esc(nota.join('. ')) + ". ' + SUPUESTO_ITBIS" : 'SUPUESTO_ITBIS';
  }

  const opciones = [
    "fecha: '" + esc(b.fecha) + "'",
    "fuente: '" + esc(b.url ? 'Precio publicado en ' + b.url : 'Precio publicado por el comercio') + "'"
  ];
  if (b.declarado === 'no') opciones.push('itbis: false');
  if (notaJS) opciones.push('nota: ' + notaJS);

  return "  c('" + b.item.codigo + "', '" + esc(b.prov.nombre) + "', " + b.precio + ", {\n" +
         "    " + opciones.join(',\n    ') + "\n" +
         "  });";
});

if (bloques.length) {
  console.log('  /* Lote importado desde ' + path.basename(archivo) + ' */');
  console.log('');
  console.log(bloques.join('\n\n'));
  console.log('');
}

const err = function (t) { process.stderr.write(t + '\n'); };

err('');
err('— ' + buenas.length + (buenas.length === 1 ? ' cotización lista' : ' cotizaciones listas') +
      ' para pegar en datos-precios.js.');

if (noEncontrado.length) {
  err('');
  err('— ' + noEncontrado.length + (noEncontrado.length === 1 ? ' línea venía' : ' líneas venían') +
      ' como NO ENCONTRADO (así debe ser: no se inventa nada).');
}

if (avisos.length) {
  err('');
  err('— ' + avisos.length + (avisos.length === 1 ? ' precio para revisar' : ' precios para revisar') +
      ' antes de cargarlos:');
  avisos.forEach(function (a) { err('    ' + a); });
}

if (rechazos.length) {
  err('');
  err('— ' + rechazos.length + (rechazos.length === 1 ? ' línea rechazada:' : ' líneas rechazadas:'));
  rechazos.forEach(function (r) { err('    ' + r); });
}

err('');
