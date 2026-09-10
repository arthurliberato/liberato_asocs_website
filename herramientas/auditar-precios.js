'use strict';
/* =========================================================
   auditar-precios.js — busca precios que no se sostienen

   Un precio de referencia mal puesto es peor que un ítem que falta:
   quien cubica se lleva el número a un presupuesto y lo descubre
   cuando ya lo entregó. Este script busca los que no se sostienen.

   QUÉ MIRA, Y POR QUÉ ESO

   1. DISPERSIÓN ENTRE COMERCIOS
      Dos comercios cotizando el mismo ítem deberían quedar cerca. La
      dispersión normal es de marca: un bombillo LED de 12 W cuesta 60
      en genérico y 220 de marca, y eso es información, no un error.
      Medido sobre los 242 ítems comparables, la mediana es 1.6x y el
      percentil 90 está en 4.6x.

      Pero por encima de 8x el ítem deja de ser una sola cosa. El caso
      que lo enseña es «Dispensador de jabón»: convivían un dispensador
      plástico de 676 y uno electrónico HELVEX de 15,547. No es que un
      comercio se equivocara; es que a la partida le falta un eje que
      separe el manual del automático.

      Mientras ese eje no exista, el ítem no se publica.

   2. MEDIDAS IMPOSIBLES
      Cuando la lectura del catálogo de un comercio se tuerce, sale una
      medida absurda —«Cinta de teflón 12520"»— y con ella un precio que
      no significa nada.

   3. FUERA DE SERIE (solo informa, no retira)
      Un ítem que se sale de su propia serie de medidas. Informa y no
      retira porque la medida SÍ manda en el precio: un bushing de 8" x 4"
      cuesta legítimamente treinta veces uno de 1/2". Hace falta ojo
      humano, así que sale en el informe y no en la lista.

   USO
     node herramientas/auditar-precios.js            informe completo
     node herramientas/auditar-precios.js --lista    solo los códigos a retirar
     node herramientas/auditar-precios.js --escribir escribe la lista en el catálogo
   ========================================================= */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');

/* Por encima de aquí, el ítem no es una sola cosa. Medido, no supuesto:
   ver el encabezado. */
const DISPERSION_MAXIMA = 8;
/* Para informar de la serie hace falta que la serie exista. */
const MINIMO_SERIE = 3;
const FUERA_DE_SERIE = 10;

function modelo() {
  const salida = execFileSync('node',
    [path.join(__dirname, 'datos-para-excel.js')],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
      /* Sin esto el auditor no vería lo que él mismo retiró en la pasada
         anterior, lo daría por bueno y volvería a publicarlo. */
      env: Object.assign({}, process.env, { ILYA_AUDITAR: '1' }) });
  return JSON.parse(salida);
}

const pesos = n => 'RD$ ' + Math.round(n).toLocaleString('en-US');
const col = (t, n) => String(t).slice(0, n).padEnd(n);
const mediana = a => {
  const s = a.slice().sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/* ---------- 1: dispersión entre comercios ---------- */
function dispersion(items) {
  const fuera = [];
  for (const i of items) {
    const ps = (i.precios || []).filter(p => p && p.precio).map(p => p.precio);
    if (ps.length < 2) continue;
    const min = Math.min(...ps), max = Math.max(...ps);
    if (min <= 0) continue;
    const r = max / min;
    if (r >= DISPERSION_MAXIMA) {
      fuera.push({
        item: i, razon: 'dispersion', factor: r, precios: ps.slice().sort((a, b) => a - b),
        motivo: 'los comercios lo cotizan entre ' + pesos(min) + ' y ' + pesos(max)
                + ' (' + r.toFixed(0) + 'x): la partida mezcla productos distintos'
      });
    }
  }
  return fuera;
}

/* ---------- 2: medidas imposibles ---------- */
/* Techos por eje, en la unidad en que el catálogo los guarda. Nada de esto
   existe en una obra: si aparece, la lectura del catálogo se torció. */
const TECHO = {
  medida_pulg: 120, largo_cm: 1200, ancho_cm: 1200, alto_cm: 1200,
  /* 305 m es la caja de cable de red de 1000 pies: existe, no es un error. */
  diametro_pulg: 60, espesor_mm: 500, largo_m: 500, ancho_mm: 5000,
  potencia_w: 5000, litros: 2000, watts: 5000
};
function medidasImposibles(items) {
  const fuera = [];
  for (const i of items) {
    for (const [eje, valor] of Object.entries(i.medidas || {})) {
      let v = valor;
      const techo = TECHO[eje] || (eje === 'medida' ? TECHO.medida_pulg : 0);
      /* La medida puede venir como texto —«12520"»—: se le saca el número. */
      const n = typeof v === 'number' ? v
              : (String(v).match(/[\d.]+/) ? parseFloat(String(v).match(/[\d.]+/)[0]) : 0);
      if (!techo || !n || n <= techo) continue;
      v = typeof v === 'number' ? v : v + ' (' + n + ')';
      fuera.push({
        item: i, razon: 'medida', factor: v / techo,
        motivo: 'la medida leída es imposible: ' + eje + ' = ' + v
                + ' (el techo razonable es ' + techo + ')'
      });
      break;
    }
  }
  return fuera;
}

/* ---------- 3: fuera de su serie (informativo) ---------- */
function fueraDeSerie(items) {
  const familias = new Map();
  for (const i of items) {
    const m = i.medidas || {};
    const ejes = Object.keys(m).filter(k => typeof m[k] === 'string').sort();
    if (!ejes.length) continue;
    for (const libre of ejes) {
      const clave = [i.catCodigo, ejes.join('|'),
        ejes.filter(k => k !== libre).map(k => k + '=' + m[k]).join('|'), libre].join('::');
      if (!familias.has(clave)) familias.set(clave, { libre, miembros: [] });
      familias.get(clave).miembros.push(i);
    }
  }
  const vistos = new Set(), fuera = [];
  for (const { libre, miembros } of familias.values()) {
    if (miembros.length < MINIMO_SERIE) continue;
    const med = mediana(miembros.map(x => x.ref));
    if (!med) continue;
    for (const x of miembros) {
      const r = x.ref > med ? x.ref / med : med / x.ref;
      if (r < FUERA_DE_SERIE || vistos.has(x.codigo)) continue;
      vistos.add(x.codigo);
      fuera.push({
        item: x, razon: 'serie', factor: r,
        motivo: 'cuesta ' + pesos(x.ref) + ' y la mediana de su serie (eje «'
                + libre + '») es ' + pesos(med)
      });
    }
  }
  return fuera;
}

/* ---------- 4: revisados a mano ----------
   Los que ninguna regla general pilla sin llevarse por delante casos
   legítimos. Cada uno con su razón: si mañana cambia el dato, se borra
   la línea y vuelve a publicarse. */
const A_MANO = {
  'MAT-09-084': 'La Ibérica publica un fregadero Teka de 20x21" a RD$ 75, '
    + 'que no es un precio de fregadero. Además la medida se leyó como 8 x 8.',
  'MAT-10-181': 'Un rollo de cinta de electricista de 30 m a RD$ 1,730 solo se '
    + 'explica si el precio es de un paquete, y la ficha no lo dice'
};
function aMano(items) {
  return items.filter(i => A_MANO[i.codigo]).map(i => ({
    item: i, razon: 'a mano', factor: 0, motivo: A_MANO[i.codigo]
  }));
}

/* ---------- escribir la lista en el catálogo ---------- */
const CATALOGO = path.join(RAIZ, 'precios', 'assets', 'js', 'datos-catalogo.js');
function escribir(retirar) {
  const esc = t => String(t).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const L = ['  var dudosos = {'];
  retirar.slice().sort((a, b) => a.item.codigo.localeCompare(b.item.codigo))
    .forEach((f, n, todos) => {
      L.push("    /* " + esc(f.item.nombre) + " */");
      L.push("    '" + f.item.codigo + "': '" + esc(f.motivo) + "'"
             + (n === todos.length - 1 ? '' : ','));
    });
  L.push('  };');
  const texto = fs.readFileSync(CATALOGO, 'utf8');
  const ini = texto.indexOf('  /* dudosos:inicio');
  const fin = texto.indexOf('  /* dudosos:fin */');
  if (ini < 0 || fin < 0) {
    console.error('No encuentro los marcadores dudosos en datos-catalogo.js.');
    process.exit(1);
  }
  const cabecera = texto.slice(ini, texto.indexOf('\n', ini) + 1);
  fs.writeFileSync(CATALOGO,
    texto.slice(0, ini) + cabecera + L.join('\n') + '\n' + texto.slice(fin));
  console.log('Escritos %d ítems en la lista de dudosos de datos-catalogo.js.', retirar.length);
}

/* ---------- informe ---------- */
function main() {
  const d = modelo();
  const items = d.items.filter(i => i.ref);
  const previos = new Set();
  const retirar = [...dispersion(items), ...medidasImposibles(items), ...aMano(items)]
    .filter(f => !previos.has(f.item.codigo) && previos.add(f.item.codigo))
    .sort((a, b) => b.factor - a.factor);
  const informar = fueraDeSerie(items)
    .filter(f => !retirar.some(r => r.item.codigo === f.item.codigo))
    .sort((a, b) => b.factor - a.factor);

  if (process.argv.includes('--lista')) {
    for (const f of retirar) console.log(f.item.codigo + '\t' + f.motivo);
    return;
  }
  if (process.argv.includes('--escribir')) { escribir(retirar); return; }

  console.log('%d ítems con precio · %d comparables entre comercios\n',
    items.length, items.filter(i => (i.precios || []).filter(p => p && p.precio).length > 1).length);

  console.log('=== NO PUBLICABLES (%d) ===', retirar.length);
  console.log('Se retiran: un precio mal puesto es peor que un ítem que falta.\n');
  for (const f of retirar) {
    console.log('  ' + col(f.item.codigo, 12) + ' ' + col(f.item.nombre, 40) + ' ' + f.motivo);
    if (f.precios) console.log('  ' + ' '.repeat(53) + f.precios.map(pesos).join('  ·  '));
  }

  console.log('\n=== PARA MIRAR A OJO (%d) ===', informar.length);
  console.log('Fuera de su serie, pero la medida manda en el precio: puede ser legítimo.\n');
  for (const f of informar.slice(0, 25)) {
    console.log('  ' + String(Math.round(f.factor)).padStart(5) + 'x  '
      + col(f.item.codigo, 12) + ' ' + col(f.item.nombre, 38) + ' ' + f.motivo);
  }
  if (informar.length > 25) console.log('  ... y %d más', informar.length - 25);
}

main();
