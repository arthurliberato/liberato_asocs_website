'use strict';
/* =========================================================
   auditar-precios.js — busca precios que no se sostienen

   Un precio de referencia mal puesto es peor que un ítem que falta:
   quien cubica se lleva el número a un presupuesto y lo descubre
   cuando ya lo entregó. Este script busca los que no se sostienen.

   QUÉ MIRA, Y POR QUÉ ESO

   1. DISPERSIÓN ENTRE COMERCIOS
      Dos comercios cotizando el mismo ítem deberían quedar cerca, y
      cuando no, la diferencia suele ser de gama: un bombillo LED de 12 W
      cuesta 60 en genérico y 220 de marca. Eso es información, no un
      error.

      Lo que se mide NO es del más barato al más caro, sino el hueco más
      grande entre dos cotizaciones vecinas. Los extremos no dicen si la
      lista es una cosa o dos; el hueco sí. Ver el comentario largo sobre
      la función, que trae el caso y el número.

      Cuando el hueco delata que la partida no es una sola cosa, el ítem
      no se publica hasta que exista el eje que la separe.

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

/* NO se mide del más barato al más caro. Se mide el HUECO más grande entre
   dos cotizaciones vecinas, y la razón es que los dos extremos de una lista
   ordenada no dicen si la lista es una cosa o dos.

   El caso que lo enseña es «Cabezal de ducha»: 138 cotizaciones que van de
   RD$ 126 a RD$ 143,568 —1,135 veces— y ni un solo salto mayor de 2.6x entre
   una y la siguiente. Eso no es un error de nadie: es la escalera completa
   del mercado, de la regadera plástica a la ducha de techo empotrada, con
   todos los peldaños puestos. Retirarlo por sus extremos era retirar el
   ítem con más información del catálogo.

   El hueco, en cambio, sí distingue. Un intruso deja un vacío y se queda
   solo del otro lado: en «Inodoro suspendido» el salto de 9.8x separa
   diecinueve inodoros de un ASIENTO para inodoro, que es otra pieza. Un eje
   que falta parte la lista en dos grupos con gente a los dos lados, como en
   el dispensador de jabón manual contra el electrónico.

   SE MIDE SOBRE TODAS LAS COTIZACIONES, NO UNA POR COMERCIO
   El comparativo del Excel se queda con la más barata de cada tienda, que
   es la que sirve para negociar. Aquí eso sería un error: borra los
   peldaños de en medio y fabrica huecos que no existen. El tapón macho de
   PVC de 1" quedaba en RD$ 5.61 y RD$ 62 y parecía roto; con la lista
   entera aparece el de RD$ 35.11 —del mismo comercio, otra marca— y se ve
   que es una escalera, no un salto. Siete accesorios de plomería estaban
   retirados por eso y ninguno tenía nada malo.

   DE DÓNDE SALE EL UMBRAL
   Medido sobre los 883 ítems con más de una cotización: la mediana del
   hueco mayor es 1.58x, el percentil 90 está en 3.56x, el 95 en 5.06x y el
   99 en 13.11x. Cortar en 7x retira el 2.8%.
   Mirando la banda de 3.5x a 7x uno por uno, casi todo lo que hay es la
   misma cosa: el margen de mostrador en piezas chicas. Un niple de 3/8"
   sale a RD$ 27 en una cadena grande y a RD$ 185 en una ferretería de
   barrio, y las dos tienen razón —en una pieza de treinta pesos el costo de
   manejarla pesa más que la pieza—. Se comprobó que es margen y no un error
   de unidad porque la brecha SE CIERRA según sube el precio: 0.39x en las
   piezas de menos de RD$ 100 y 0.92x en las de más de RD$ 2,000. Un error
   de unidad sería igual en toda la escala.

   De 7x en adelante lo que aparece son defectos: el asiento metido entre
   los inodoros, un interruptor inteligente entre los sencillos, una tira
   LED RGB entre los reflectores. Ahí se corta. */
const HUECO_MAXIMO = 7;

/* Cuántas cotizaciones quedan del lado chico del hueco. Una o dos son un
   intruso —una pieza mal clasificada, que se arregla en la regla del
   comercio—; más de dos son dos familias de verdad y lo que falta es un eje. */
function huecoMayor(ps) {
  const s = ps.slice().sort((a, b) => a - b);
  let hueco = 1, corte = 0;
  for (let k = 1; k < s.length; k++) {
    const h = s[k] / s[k - 1];
    if (h > hueco) { hueco = h; corte = k; }
  }
  return { hueco, corte, solos: Math.min(corte, s.length - corte), ordenados: s };
}

function dispersion(items) {
  const fuera = [];
  for (const i of items) {
    /* Todas las cotizaciones, no una por comercio: ver la nota en
       datos-para-excel.js sobre por qué el colapso fabricaba huecos. */
    const ps = (i.todas && i.todas.length ? i.todas
                : (i.precios || []).filter(p => p && p.precio).map(p => p.precio));
    if (ps.length < 2 || Math.min(...ps) <= 0) continue;
    const h = huecoMayor(ps);
    if (h.hueco < HUECO_MAXIMO) continue;
    const min = h.ordenados[h.corte - 1], max = h.ordenados[h.corte];
    fuera.push({
      item: i, razon: 'dispersion', factor: h.hueco, precios: h.ordenados,
      motivo: (h.solos <= 2
        ? 'entre ' + pesos(min) + ' y ' + pesos(max) + ' no hay nada, y del lado barato '
          + (h.solos === 1 ? 'queda una sola cotización' : 'quedan dos cotizaciones')
          + ' (' + h.hueco.toFixed(0) + 'x): hay una pieza mal clasificada'
        : 'la partida se parte en dos entre ' + pesos(min) + ' y ' + pesos(max)
          + ' (' + h.hueco.toFixed(0) + 'x): le falta un eje que separe los dos grupos')
    });
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
