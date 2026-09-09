#!/usr/bin/env node
/* =========================================================
   importar-ochoa.js

   Ferretería Ochoa publica su catálogo completo con precios.
   Esta herramienta lo convierte en ítems y cotizaciones del
   sitio, sin que nadie transcriba nada a mano.

   USO
   ---
     node herramientas/importar-ochoa.js              # revisar
     node herramientas/importar-ochoa.js --escribir   # aplicar

   La fuente es herramientas/datos-externos/ochoa-AAAA-MM-DD.json,
   la extracción del catálogo tal como la publica el comercio. Queda
   versionada para que cualquiera pueda repetir la importación y ver
   de dónde salió cada número.

   CÓMO DECIDE QUÉ ENTRA
   ---------------------
   1. MAPEO — artículos que corresponden a un ítem que YA existe en el
      catálogo. Se declaran a mano, uno por uno. No hay emparejamiento
      automático por parecido de texto: probamos uno y casó «Funda De
      Arena 55 Libras» con «Viaje de arena, 16 m³».

   2. REGLAS — familias completas (angulares, planchuelas, perfiles,
      tolas…) donde la ficha del comercio declara la medida exacta.
      De cada artículo sale un ítem nuevo del catálogo que nace ya
      verificado, con su precio real.

      La regla devuelve null cuando la ficha NO declara la medida, y
      entonces el artículo no entra. Es la mayoría de lo que se
      descarta: «Malla Ciclónica 3.43Mm» aparece cuatro veces con
      precios de RD$ 5,223 a RD$ 13,273 y en ningún lado dice la
      altura. Una fila así en un presupuesto es peor que ninguna.

   CÓMO VALIDA LOS PRECIOS
   -----------------------
   El acero se vende al peso: dentro de una familia, el precio por
   libra es casi constante. Los angulares de Ochoa dan RD$ 35.00/lb
   clavados en 15 de 21 medidas. Eso da una prueba objetiva: se
   calcula la mediana de RD$/lb de la familia y se rechaza lo que se
   aparte más de TOLERANCIA.

   Ojo con la unidad: algunos artículos se cotizan POR PIE y la
   unidad completa son 20 pies, como dice la propia nota de
   facturación de Ochoa. Sin esa corrección un angular de 20.20 lb
   parece costar RD$ 1.93 la libra en vez de RD$ 38.66.
   ========================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DATOS = path.join(RAIZ, 'precios/assets/js');
const FUENTE = path.join(__dirname, 'datos-externos/ochoa-2026-09-09.json');

const PROVEEDOR = 'Ferretería Ochoa (8A)';
const FECHA = '2026-09-09';
const TOLERANCIA = 0.35;
const PIES_POR_UNIDAD = 20;
const ESCRIBIR = process.argv.indexOf('--escribir') >= 0;

/* =========================================================
   1. Artículos que caen en un ítem que ya existe
   ========================================================= */

const MAPEO = {
  '04-59-0192': 'MAT-02-003',   // Cemento Blanco Argos · ref FUNDA40KILOS
  '04-59-0391': 'MAT-02-003',   // Cemento Blanco Perla del Sur · ref FUNDA40KG
  '04-59-0065': 'MAT-02-004',   // Cal Perla hidratada · ref FDA44LBS = 20 kg
  '02-45-0011': 'MAT-04-021',   // Alambre Liso Galvanizado · ref C-18ROLLO/GDE.
  '02-45-0010': 'MAT-04-022',   // Alambre Liso Galvanizado C-14 · ref C-14ROLLOGDE
  '04-66-0230': 'MAT-04-008',   // Malla electrosoldada · ref W2.3X2.3 100X100
  '04-66-0253': 'MAT-04-014',   // Malla electrosoldada · ref W2.7X2.7 100X100
  '04-53-0015': 'MAT-04-023'    // Angular H. Negro · ref 11/2X1/8=3MM
};

/* El campo `ref` de la extracción es el que manda. El nombre del artículo
   muchas veces no dice la medida —«Alambre Liso Galvanizado», sin más— pero
   la referencia del fabricante sí: C-18ROLLO/GDE. Sin ella, la mitad de
   estas correspondencias serían suposiciones nuestras. Con ella son datos
   del comercio. */

/* Descartados a conciencia, con el motivo a la vista:

   polvos/cal  «Cal (Pura Cal)» y «Pura Cal Viva» se venden por «funda» sin
               declarar el peso, ni en el nombre ni en la referencia.
   hierros/barras  «Barra Torneada» no declara diámetro en ningún campo.
   hierros/tubos   «Tubo Negro 407.85 Lbs.» no declara el diámetro. */

/* =========================================================
   2. Reglas por familia
   ========================================================= */

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();

/* La ficha mete la dimensión dentro de un párrafo de mercadeo sin
   puntuación: "...GalvanizadoDimensiones: 1 1/2 X 1 1/2 X 20'Usos...".
   En vez de adivinar dónde empieza la prosa, tomamos solo lo que sí es
   una medida: la tira inicial de números, fracciones y equis. */
const MEDIDA = /^\s*(\d[\d\s\/\-.]*(?:\s*[xX×]\s*\d[\d\s\/\-.]*)*)/;

function dimension(a) {
  const t = limpia(a.info);
  const m = t.match(/Dimensi[oóé]n[eé]?s?\s*:\s*(.{2,80})/i) || t.match(/Tama[nñ]o\s*:\s*(.{2,80})/i);
  if (!m) return '';
  const v = m[1].replace(/''|"|”|“|'|’/g, ' ').match(MEDIDA);
  return v ? limpia(v[1]).replace(/[.,\-]$/, '') : '';
}

/* Algunas tolas declaran el espesor aparte, como "Calibre: 1/8 pulgadas". */
function calibre(a) {
  const m = limpia(a.info).match(/Calibre\s*:\s*(\d[\d\s\/\-.]*)/i);
  return m ? limpia(m[1]) : '';
}

function peso(a) {
  let m = a.nombre.match(/([\d,]+\.?\d*)\s*(Lbs?\.?|Libs?\.?|Libras?)\b/i);
  if (m) return parseFloat(m[1].replace(/,/g, ''));
  m = a.nombre.match(/-\s*([\d,]+\.\d+)\s*\(/);          // "Barra Cuadrada-13.016 (170Xt.M.)"
  if (m) return parseFloat(m[1].replace(/,/g, ''));
  m = limpia(a.info).match(/Peso\s*:\s*([\d.,]+)\s*(Lbs?|libras?)/i);
  return m ? parseFloat(m[1].replace(/,/g, '')) : null;
}

/* Fracciones como las escribe el comercio: "1-1/2", "1 1/2", "11/2", "3/4", "2". */
function frac(txt) {
  const t = limpia(txt).replace(/-/g, ' ');
  let m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return { n: +m[1] + (+m[2] / +m[3]), t: m[1] + ' ' + m[2] + '/' + m[3] };
  m = t.match(/^(\d+)\/(\d+)$/);
  if (m) return { n: +m[1] / +m[2], t: m[1] + '/' + m[2] };
  m = t.match(/^(\d+)(?:\.0+)?$/);
  if (m) return { n: +m[1], t: m[1] };
  m = t.match(/^(\d)(\d\/\d)$/);                          // "11/2" es "1 1/2"
  if (m) { const f = m[2].split('/'); return { n: +m[1] + (+f[0] / +f[1]), t: m[1] + ' ' + m[2] }; }
  return null;
}

const partes = dim => limpia(dim).split(/\s*[xX×]\s*/).map(limpia).filter(Boolean);
const pulg = f => f.t + '"';
const galvanizado = a => /Galv/i.test(a.nombre);

/* El espesor de pared de la perfilería va en el nombre, no en la ficha. */
function pared(a) {
  const m = a.nombre.match(/(\d\.\d)\s*Mm/i) || a.nombre.match(/\b(1\.2|1\.5|1\.6)\b/);
  return m ? m[1] : null;
}

const REGLAS = {

  /* ---- Angulares de hierro negro ---- */
  'hierros/angulares': function (a) {
    if (!/Angular/i.test(a.nombre) || !/Negro/i.test(a.nombre)) return null;
    const p = partes(dimension(a));
    if (p.length !== 2) return null;
    const l = frac(p[0]), e = frac(p[1]);
    if (!l || !e) return null;
    return {
      cat: 'MAT-20',
      clave: 'angular-' + l.n + 'x' + e.n,
      orden: l.n * 100 + e.n,
      nombre: 'Angular de hierro negro ' + pulg(l) + ' x ' + pulg(e) + ' x 20 pies',
      unidad: 'unidad',
      esp: 'Perfil L de acero al carbono · ' + pulg(l) + ' x ' + pulg(e) + ' · barra de 20 pies',
      etapa: 'estructura',
      origen: 'importado',
      alias: 'perfil L, ángulo de hierro, angular'
    };
  },

  /* ---- Planchuelas de hierro negro ---- */
  'hierros/planchuelas': function (a) {
    /* Solo las que el nombre declara hierro negro. Tres fichas dicen
       "acero inoxidable" en la descripción, pero a RD$ 35 la libra —el
       mismo precio que los angulares de hierro negro— eso no puede ser,
       y no vamos a publicar un material que la propia fuente contradice. */
    if (!/^Planchuela H\. Negro/i.test(a.nombre)) return null;
    const p = partes(dimension(a));
    if (p.length !== 2) return null;
    const l = frac(p[0]), e = frac(p[1]);
    if (!l || !e) return null;
    return {
      cat: 'MAT-20',
      clave: 'planchuela-' + l.n + 'x' + e.n,
      orden: 1000 + l.n * 100 + e.n,
      nombre: 'Planchuela de hierro negro ' + pulg(l) + ' x ' + pulg(e) + ' x 20 pies',
      unidad: 'unidad',
      esp: 'Pletina de acero al carbono · ' + pulg(l) + ' x ' + pulg(e) + ' · barra de 20 pies',
      etapa: 'estructura',
      origen: 'importado',
      alias: 'pletina, fleje de hierro, planchuela'
    };
  },

  /* ---- Barras lisas, cuadradas y redondas ---- */
  'hierros/barras': function (a) {
    const cuad = /Cuadrada/i.test(a.nombre), red = /Redonda/i.test(a.nombre);
    if (!cuad && !red) return null;                       // «Barra Torneada» no declara medida
    const p = partes(dimension(a));
    const l = p.length ? frac(p[0]) : null;
    if (!l) return null;
    const forma = cuad ? 'cuadrada' : 'redonda';
    return {
      cat: 'MAT-20',
      clave: 'barra-' + forma + '-' + l.n,
      orden: 2000 + (cuad ? 0 : 100) + l.n,
      nombre: 'Barra ' + forma + ' de acero ' + pulg(l) + ' x 20 pies',
      unidad: 'unidad',
      esp: 'Acero al carbono liso · sección ' + forma + ' de ' + pulg(l) + ' · barra de 20 pies',
      etapa: 'estructura',
      origen: 'importado',
      alias: cuad ? 'barra cuadrada, hierro cuadrado' : 'barra lisa, hierro redondo liso'
    };
  },

  /* ---- Perfilería estructural cuadrada y rectangular ---- */
  'hierros/perfiles': function (a) {
    if (a.unidad !== 'UNIDAD') return null;               // los atados se cotizan aparte
    if (/Mueble/i.test(a.nombre)) return null;            // perfil de mueble, no de obra
    const cuad = /Cuad/i.test(a.nombre), rect = /Rect/i.test(a.nombre);
    if (!cuad && !rect) return null;
    const w = pared(a);
    if (!w) return null;
    const p = partes(dimension(a));
    if (p.length < 2) return null;
    const l = frac(p[0]), h = frac(p[1]);
    if (!l || !h) return null;
    const forma = cuad ? 'cuadrado' : 'rectangular';
    const acab = galvanizado(a) ? 'galvanizado' : 'negro';
    return {
      cat: 'MAT-19',
      clave: 'perfil-' + forma + '-' + acab + '-' + l.n + 'x' + h.n + '-' + w,
      orden: (cuad ? 0 : 500) + (acab === 'negro' ? 0 : 250) + l.n * 10 + h.n,
      nombre: 'Perfil ' + forma + ' ' + acab + ' ' + pulg(l) + ' x ' + pulg(h) +
              ' x 20 pies, pared ' + w + ' mm',
      unidad: 'unidad',
      esp: 'Tubo estructural de sección ' + forma + ' · ' + pulg(l) + ' x ' + pulg(h) +
           ' · pared ' + w + ' mm · acabado ' + acab,
      etapa: 'estructura',
      origen: 'importado',
      alias: 'perfilería, tubo cuadrado, HSS'
    };
  },

  /* ---- Tubería negra redonda ---- */
  'hierros/tubos': function (a) {
    if (!/^Tubo Negro|^Tubo 2/i.test(a.nombre)) return null;   // el de muffler no es de obra
    const p = partes(dimension(a));
    const l = p.length ? frac(p[0]) : null;
    if (!l) return null;
    const m = a.nombre.match(/([\d.]+)\s*Mm/i);
    const w = m ? m[1] : null;
    return {
      cat: 'MAT-19',
      clave: 'tubo-negro-' + l.n + (w ? '-' + w : ''),
      orden: 1000 + l.n,
      nombre: 'Tubo negro redondo ' + pulg(l) + ' x 20 pies' + (w ? ', pared ' + w + ' mm' : ''),
      unidad: 'unidad',
      esp: 'Tubería de acero negro sin recubrimiento · ' + pulg(l) +
           (w ? ' · pared ' + w + ' mm' : '') + ' · tramo de 20 pies',
      etapa: 'estructura',
      origen: 'importado',
      alias: 'tubo de hierro, tubería negra'
    };
  },

  /* ---- Correa galvanizada tipo Z (se cotiza por pie) ---- */
  'hierros/correas': function (a) {
    const p = partes(dimension(a));
    if (p.length !== 2) return null;
    const e = frac(p[0]), l = frac(p[1]);
    if (!e || !l) return null;
    return {
      cat: 'MAT-19',
      clave: 'correa-z-' + l.n + 'x' + e.n,
      orden: 2000 + l.n,
      nombre: 'Correa galvanizada tipo Z ' + pulg(l) + ' x ' + pulg(e) + ' x 20 pies',
      unidad: 'unidad',
      esp: 'Perfil Z galvanizado para correas de techo · alma ' + pulg(l) +
           ' · espesor ' + pulg(e) + ' · tramo de 20 pies',
      etapa: 'techos',
      origen: 'importado',
      alias: 'correa Z, perlín, larguero de techo'
    };
  },

  /* ---- Tolas y láminas de acero ---- */
  'hierros/tolas': function (a) {
    const neg = /Tola Negra/i.test(a.nombre);
    const cor = /Tola Corrugada/i.test(a.nombre);
    const gal = /Tola Galvanizada/i.test(a.nombre);
    if (!neg && !cor && !gal) return null;

    if (gal) {
      const w = peso(a);
      if (!w) return null;                                // el peso es su única medida
      return {
        cat: 'MAT-21',
        clave: 'tola-galv-' + w,
        orden: 2000 + w,
        nombre: 'Tola galvanizada 4 x 8 pies, ' + w + ' lb',
        unidad: 'plancha',
        esp: 'Lámina de acero galvanizada · plancha de 4 x 8 pies · ' + w + ' lb',
        etapa: 'estructura',
        origen: 'importado',
        alias: 'lámina galvanizada, tola galvanizada'
      };
    }

    /* Dos formatos de ficha: "3/16 X 4 X 8" lo dice todo junto, y
       "4 X 8 pies · Calibre: 1/8" separa la plancha del espesor. */
    const p = partes(dimension(a));
    let e, an, la;
    if (p.length === 3) { e = frac(p[0]); an = frac(p[1]); la = frac(p[2]); }
    else if (p.length === 2) { e = frac(calibre(a)); an = frac(p[0]); la = frac(p[1]); }
    if (!e || !an || !la) return null;
    const tipo = cor ? 'corrugada' : 'negra';
    /* El peso va en la especificación a propósito: es lo que permite
       comprobar el espesor. Una plancha de 4 x 8 pies pesa unas 40.8 lb
       por cada 1/32" de espesor, así que peso y espesor se verifican
       mutuamente. Fue lo que confirmó que el raro "1/22" del catálogo
       es real (0.045", el equivalente a 1.15 mm) y no un error. */
    const w = peso(a);
    return {
      cat: 'MAT-21',
      clave: 'tola-' + tipo + '-' + e.n + '-' + an.n + 'x' + la.n,
      orden: (cor ? 1000 : 0) + e.n * 100 + an.n,
      nombre: 'Tola ' + tipo + ' ' + pulg(e) + ', plancha ' + an.t + ' x ' + la.t + ' pies',
      unidad: 'plancha',
      esp: 'Lámina de hierro ' + (cor ? 'corrugada antideslizante' : 'negra laminada en frío') +
           ' · espesor ' + pulg(e) + ' · plancha de ' + an.t + ' x ' + la.t + ' pies' +
           (w ? ' · ' + w + ' lb' : ''),
      etapa: 'estructura',
      origen: 'importado',
      alias: cor ? 'lámina antiderrapante, plancha corrugada' : 'lámina de hierro, plancha negra'
    };
  },

  /* ---- Techos de zinc ---- */
  'hierros/planchas': function (a) {
    const p = partes(dimension(a));
    const an = p.length === 2 ? frac(p[0]) : null;
    const la = p.length === 2 ? frac(p[1]) : null;

    if (/Zinc Tra[ns]*lucido/i.test(a.nombre)) {
      if (!an || !la) return null;
      return {
        cat: 'MAT-07',
        clave: 'zinc-translucido-' + an.n + 'x' + la.n,
        orden: 300 + an.n,
        nombre: 'Zinc translúcido ' + an.t + ' x ' + la.t + ' pies',
        unidad: 'plancha',
        esp: 'Lámina traslúcida para entrada de luz · ' + an.t + ' x ' + la.t + ' pies',
        etapa: 'techos',
        origen: 'importado',
        alias: 'zinc transparente, lámina traslúcida'
      };
    }

    if (/Caballete Para Aluzinc/i.test(a.nombre)) {
      const c = frac(partes(dimension(a))[0] || '');
      if (!c) return null;
      return {
        cat: 'MAT-07',
        clave: 'caballete-aluzinc-' + c.n,
        orden: 400 + c.n,
        nombre: 'Caballete para aluzinc ' + pulg(c),
        unidad: 'unidad',
        esp: 'Pieza de remate para cumbrera de techo de aluzinc · desarrollo ' + pulg(c),
        etapa: 'techos',
        origen: 'importado',
        alias: 'cumbrera, capote de techo'
      };
    }

    const m = a.nombre.match(/Plancha De Zinc (Acanalado|Liso) C-(\d+)/i);
    if (!m || !an || !la) return null;
    const tipo = m[1].toLowerCase(), cal = m[2];
    return {
      cat: 'MAT-07',
      clave: 'zinc-' + tipo + '-' + cal + '-' + an.n + 'x' + la.n,
      orden: (tipo === 'acanalado' ? 100 : 200) + (+cal) + la.n / 100,
      nombre: 'Zinc ' + tipo + ' calibre ' + cal + ', ' + an.t + ' x ' + la.t + ' pies',
      unidad: 'plancha',
      esp: 'Lámina galvanizada ' + tipo + ' calibre ' + cal + ' · ' + an.t + ' x ' + la.t + ' pies',
      etapa: 'techos',
      gama: 'economica',
      alias: 'plancha de zinc, lámina de zinc'
    };
  },

  /* ---- Alambre liso galvanizado, por libra y por calibre ---- */
  'hierros/alambres': function (a) {
    const m = a.nombre.match(/Alambre Liso Galvanizado C-(\d+)/i);
    if (!m || a.unidad !== 'LIBRA') return null;
    return {
      cat: 'MAT-04',
      clave: 'alambre-liso-galv-' + m[1],
      orden: +m[1],
      nombre: 'Alambre liso galvanizado calibre ' + m[1],
      unidad: 'lb',
      esp: 'Acero al carbono con acabado galvanizado · calibre ' + m[1],
      etapa: 'estructura',
      alias: 'alambre galvanizado, alambre de amarre'
    };
  }
};

/* =========================================================
   3. Lectura y clasificación
   ========================================================= */

const articulos = JSON.parse(fs.readFileSync(FUENTE, 'utf8'));
const conPrecio = articulos.filter(a => typeof a.precio === 'number' && a.precio > 0);

/* Ochoa cotiza algunas barras POR PIE; la unidad completa son 20 pies,
   como dice su propia nota de facturación. */
const precioUnidad = a => a.unidad === 'PIE' ? a.precio * PIES_POR_UNIDAD : a.precio;

const aExistente = [];
const nuevos = [];
const descartados = [];

conPrecio.forEach(a => {
  if (MAPEO[a.codigo]) { aExistente.push({ a, item: MAPEO[a.codigo] }); return; }
  const regla = REGLAS[a.cat2 + '/' + a.cat3];
  if (!regla) return;
  const spec = regla(a);
  if (!spec) { descartados.push({ a, motivo: 'la ficha no declara la medida' }); return; }
  nuevos.push({ a, spec });
});

/* =========================================================
   4. Validación por precio de la libra
   ========================================================= */

const porFamilia = {};
nuevos.concat(aExistente.map(x => ({ a: x.a, spec: null }))).forEach(x => {
  const w = peso(x.a);
  if (!w) return;
  const f = x.a.cat2 + '/' + x.a.cat3;
  (porFamilia[f] = porFamilia[f] || []).push(precioUnidad(x.a) / w);
});

const mediana = v => {
  const s = v.slice().sort((p, q) => p - q);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const medianaFam = {};
Object.keys(porFamilia).forEach(f => { if (porFamilia[f].length >= 4) medianaFam[f] = mediana(porFamilia[f]); });

const rechazados = [];
function pasaValidacion(a) {
  const w = peso(a);
  const f = a.cat2 + '/' + a.cat3;
  const med = medianaFam[f];
  if (!w || !med) return true;                        // sin peso o sin familia, no hay con qué comparar
  const ppl = precioUnidad(a) / w;
  if (Math.abs(ppl / med - 1) <= TOLERANCIA) return true;
  rechazados.push({ a, ppl, med, f });
  return false;
}

const nuevosOk = nuevos.filter(x => pasaValidacion(x.a));
const existenteOk = aExistente.filter(x => pasaValidacion(x.a));

/* =========================================================
   5. Un ítem por especificación
   ========================================================= */

const items = {};
nuevosOk.forEach(x => {
  const k = x.spec.cat + '|' + x.spec.clave;
  if (!items[k]) items[k] = { spec: x.spec, articulos: [] };
  items[k].articulos.push(x.a);
});

const lista = Object.keys(items).map(k => items[k]);
lista.sort((p, q) => p.spec.cat.localeCompare(q.spec.cat) || (p.spec.orden - q.spec.orden) ||
                     p.spec.clave.localeCompare(q.spec.clave));

/* Numeración: el catálogo asigna el código por orden de declaración
   dentro de la categoría, así que aquí solo necesitamos saber en qué
   número va cada categoría al llegar el bloque generado. */
global.window = global;
['catalogo', 'proveedores', 'precios', 'demo'].forEach(f => require(path.join(DATOS, 'datos-' + f + '.js')));
const CAT = global.CATALOGO;

/* El contador NO puede salir de CAT.items: ahí ya están los ítems que
   escribió la corrida anterior, y numerar detrás de ellos duplicaría el
   catálogo en cada importación. Se cuenta sobre el texto del archivo,
   hasta el marcador, que es exactamente lo escrito a mano. */
const fuenteCatalogo = fs.readFileSync(path.join(DATOS, 'datos-catalogo.js'), 'utf8');
const aMano = fuenteCatalogo
  .slice(0, fuenteCatalogo.indexOf('/* ochoa:items:inicio'))
  .replace(/\/\*[\s\S]*?\*\//g, '');   // el encabezado trae un it() de ejemplo dentro de un comentario

const contador = {};
(aMano.match(/^\s*it\('[A-Z]{3}-\d{2}'/gm) || []).forEach(l => {
  const c = l.match(/'([A-Z]{3}-\d{2})'/)[1];
  contador[c] = (contador[c] || 0) + 1;
});

const codigoDe = {};
lista.forEach(e => {
  const c = e.spec.cat;
  contador[c] = (contador[c] || 0) + 1;
  const n = contador[c];
  codigoDe[c + '|' + e.spec.clave] = c + '-' + (n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n);
});

/* =========================================================
   6. Código generado
   ========================================================= */

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const num = n => Math.round(n * 100) / 100;

function bloqueItems() {
  const L = [];
  L.push('  /* ochoa:items:inicio — generado por herramientas/importar-ochoa.js.');
  L.push('     No editar a mano: se reescribe en cada importación. */');
  let catPrev = '';
  lista.forEach(e => {
    const s = e.spec;
    if (s.cat !== catPrev) { catPrev = s.cat; L.push(''); L.push('  /* ' + s.cat + ' */'); }
    /* El precio de referencia sale de la cotización real; el sitio lo
       recalcula igual al arrancar, pero así el HTML generado ya nace
       con el número correcto aunque el JavaScript no llegue a correr. */
    const precios = e.articulos.map(precioUnidad);
    const ref = num(mediana(precios));
    const o = [
      "esp:'" + esc(s.esp) + "'",
      "etapa:'" + s.etapa + "'",
      s.gama ? "gama:'" + s.gama + "'" : '',
      s.origen ? "origen:'" + s.origen + "'" : '',
      "alias:'" + esc(s.alias) + "'",
      "alcance:'Material retirado en almacén'"
    ].filter(Boolean).join(', ');
    L.push("  it('" + s.cat + "', '" + esc(s.nombre) + "', '" + esc(s.unidad) + "', " +
           ref + ', ' + num(Math.min.apply(null, precios)) + ', ' + num(Math.max.apply(null, precios)) +
           ', {' + o + '});');
  });
  L.push('  /* ochoa:items:fin */');
  return L.join('\n');
}

function bloqueCotizaciones() {
  const L = [];
  L.push('  /* ochoa:cotizaciones:inicio — generado por herramientas/importar-ochoa.js.');
  L.push('     No editar a mano: se reescribe en cada importación. */');
  L.push('');

  const linea = (item, a, extra) => {
    /* La referencia del fabricante va en la nota porque es la prueba: es
       donde la tienda declara la medida que su propio nombre se calla. */
    const ficha = [a.nombre, 'artículo ' + a.codigo];
    if (a.ref) ficha.push('ref. ' + a.ref);
    if (a.marca && !/GENERICO/i.test(a.marca)) ficha.push('marca ' + a.marca);
    const notas = [ficha.join(' · ')];
    if (a.unidad === 'PIE') notas.push('La tienda cotiza por pie y factura la unidad de ' +
      PIES_POR_UNIDAD + ' pies; aquí va el precio de la unidad completa');
    if (extra) notas.push(extra);
    return "  c('" + item + "', PROV_OCHOA, " + num(precioUnidad(a)) + ", {\n" +
           "    fecha: '" + FECHA + "', fuente: 'Precio publicado en " + esc(a.url) + "',\n" +
           "    nota: '" + esc(notas.join('. ')) + ". ' + SUPUESTO_ITBIS\n" +
           "  });";
  };

  if (existenteOk.length) {
    L.push('  /* Artículos que corresponden a un ítem que ya existía. */');
    existenteOk.forEach(x => L.push(linea(x.item, x.a)));
    L.push('');
  }
  L.push('  /* Familias completas del catálogo de Ochoa: cada ítem nace verificado. */');
  lista.forEach(e => {
    const cod = codigoDe[e.spec.cat + '|' + e.spec.clave];
    e.articulos.forEach(a => L.push(linea(cod, a)));
  });
  L.push('  /* ochoa:cotizaciones:fin */');
  return L.join('\n');
}

/* =========================================================
   7. Escritura entre marcadores
   ========================================================= */

function reemplazar(archivo, marca, bloque) {
  const ruta = path.join(DATOS, archivo);
  const texto = fs.readFileSync(ruta, 'utf8');
  const ini = '/* ochoa:' + marca + ':inicio';
  const fin = '/* ochoa:' + marca + ':fin */';
  const i = texto.indexOf(ini), j = texto.indexOf(fin);
  if (i < 0 || j < 0) {
    console.error('No encuentro los marcadores ochoa:' + marca + ' en ' + archivo + '.');
    process.exit(1);
  }
  const nuevo = texto.slice(0, i).replace(/[ \t]+$/, '') + bloque.replace(/^\s+/, '') +
                texto.slice(j + fin.length);
  fs.writeFileSync(ruta, nuevo);
}

/* =========================================================
   8. Informe
   ========================================================= */

const porCategoria = {};
lista.forEach(e => { porCategoria[e.spec.cat] = (porCategoria[e.spec.cat] || 0) + 1; });

console.log('Extracción: ' + articulos.length + ' artículos, ' + conPrecio.length + ' con precio.');
console.log('');
console.log('Ítems nuevos por categoría:');
Object.keys(porCategoria).sort().forEach(c => {
  const n = CAT.categorias.filter(k => k.codigo === c)[0];
  console.log('  ' + c + '  ' + String(porCategoria[c]).padStart(3) + '  ' + (n ? n.nombre : '(categoría nueva, hay que declararla)'));
});
console.log('  ——');
console.log('  total ' + lista.length + ' ítems nuevos, de ' + nuevosOk.length + ' artículos.');
console.log('');
console.log('Cotizaciones sobre ítems que ya existían: ' + existenteOk.length + '.');

if (rechazados.length) {
  console.log('');
  console.log('Rechazados por precio imposible (' + rechazados.length + '):');
  rechazados.forEach(r => console.log('  ' + r.a.codigo + '  RD$ ' + r.ppl.toFixed(2) +
    '/lb contra RD$ ' + r.med.toFixed(2) + ' de su familia — ' + r.a.nombre));
}

console.log('');
console.log('Descartados porque la ficha no declara la medida: ' + descartados.length + '.');

const faltan = Object.keys(porCategoria).filter(c => !CAT.categorias.some(k => k.codigo === c));
if (faltan.length) {
  console.log('');
  console.log('FALTA declarar estas categorías en datos-catalogo.js: ' + faltan.join(', '));
  process.exit(1);
}

if (ESCRIBIR) {
  reemplazar('datos-catalogo.js', 'items', bloqueItems());
  reemplazar('datos-precios.js', 'cotizaciones', bloqueCotizaciones());
  console.log('');
  console.log('Escrito. Ahora corre: node herramientas/generar-categorias.js');
} else {
  console.log('');
  console.log('Nada escrito. Corre otra vez con --escribir para aplicar.');
}
