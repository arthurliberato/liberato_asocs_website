#!/usr/bin/env node
/* =========================================================
   importar-catalogos.js

   Varios comercios publican su catálogo con precios. Esta
   herramienta los convierte en ítems y cotizaciones del sitio,
   sin que nadie transcriba nada a mano.

   USO
   ---
     node herramientas/importar-catalogos.js              # revisar
     node herramientas/importar-catalogos.js --listar     # ver qué saldría
     node herramientas/importar-catalogos.js --descartes  # y qué no, y por qué
     node herramientas/importar-catalogos.js --escribir   # aplicar

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

const TOLERANCIA = 0.35;
const PIES_POR_UNIDAD = 20;
const ESCRIBIR = process.argv.indexOf('--escribir') >= 0;

/* La misma tasa que usa el catálogo, leída de su propio archivo para que no
   haya dos números del dólar en el repositorio. */
const TASA_USD = (function () {
  const t = fs.readFileSync(path.join(DATOS, 'datos-catalogo.js'), 'utf8')
             .match(/tasaUSD\s*:\s*\{[^}]*valor\s*:\s*([\d.]+)/);
  return t ? parseFloat(t[1]) : 0;
}());

/* =========================================================
   1. Artículos que caen en un ítem que ya existe
   ========================================================= */

const MAPEO_OCHOA = {
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
  if (m) {
    const v = m[1].replace(/''|"|”|“|'|’/g, ' ').match(MEDIDA);
    if (v) return limpia(v[1]).replace(/[.,\-]$/, '');
  }
  /* Cuando la descripción no la trae, la referencia del fabricante casi
     siempre sí: "3/4X11/2X20" es un perfil de 3/4 x 1 1/2 en 20 pies. */
  const r = String(a.ref || '').replace(/''|"|”|“|'|’/g, ' ').match(MEDIDA);
  return r ? limpia(r[1]).replace(/[.,\-]$/, '') : '';
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
  const t = limpia(txt).replace(/-/g, ' ').replace(/["'\u2019\u201d]/g, '');
  let m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);              // "1 1/2"
  if (m) return { n: +m[1] + (+m[2] / +m[3]), t: m[1] + ' ' + m[2] + '/' + m[3] };

  /* El comercio escribe los números mixtos pegados: "11/2" es una pulgada y
     media, no once medios. La regla que los separa sin romper las fracciones
     de verdad: si la fracción tal cual sale mayor que 1, es un mixto, porque
     en este oficio nadie escribe fracciones impropias. Así "11/4" queda en
     1 1/4 y "15/16" se mantiene como quince dieciseisavos. */
  m = t.match(/^(\d)(\d)\/(\d{1,2})$/);
  if (m && (+m[1] + '' + m[2]) / +m[3] > 1) {
    return { n: +m[1] + (+m[2] / +m[3]), t: m[1] + ' ' + m[2] + '/' + m[3] };
  }

  m = t.match(/^(\d+)\/(\d+)$/);
  if (m) return { n: +m[1] / +m[2], t: m[1] + '/' + m[2] };
  m = t.match(/^(\d+)(?:\.0+)?$/);
  if (m) return { n: +m[1], t: m[1] };
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

const FAMILIAS_ALUMINIO = ['aluminio/angulares', 'aluminio/planchuela', 'aluminio/tubos',
                           'aluminio/barras', 'aluminio/perfiles', 'aluminio/molduras'];

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
      esp: '',
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
      esp: '',
      etapa: 'estructura',
      origen: 'importado',
      alias: 'pletina, fleje de hierro, planchuela'
    };
  },

  /* ---- Barras lisas, cuadradas y redondas ---- */
  'hierros/barras': function (a) {
    const cuad = /Cuadrada/i.test(a.nombre);
    const tor = /Torneada/i.test(a.nombre);
    if (!cuad && !tor && !/Redonda/i.test(a.nombre)) return null;
    const p = partes(dimension(a));
    const l = p.length ? frac(p[0]) : null;
    if (!l) return null;
    const forma = cuad ? 'cuadrada' : tor ? 'redonda torneada' : 'redonda';
    return {
      cat: 'MAT-20',
      clave: 'barra-' + forma.replace(/\s/g, '-') + '-' + l.n,
      orden: 2000 + (cuad ? 0 : tor ? 200 : 100) + l.n,
      nombre: 'Barra ' + forma + ' de acero ' + pulg(l) + ' x 20 pies',
      unidad: 'unidad',
      esp: '',
      etapa: 'estructura',
      origen: 'importado',
      alias: cuad ? 'barra cuadrada, hierro cuadrado' :
             tor ? 'barra torneada, eje de acero' : 'barra lisa, hierro redondo liso'
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
      esp: '',
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
      esp: w ? '' : 'La ficha no declara la pared',
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
      esp: '',
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
        /* El calibre solo está en la referencia: "C-264X8" es calibre 26 en 4 x 8. */
        esp: (c => c ? 'Calibre ' + c[1] : '')(String(a.ref).match(/^C-(\d{2})/)),
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
      esp: w ? 'Peso ' + w + ' lb' : '',
      etapa: 'estructura',
      origen: 'importado',
      alias: cor ? 'lámina antiderrapante, plancha corrugada' : 'lámina de hierro, plancha negra'
    };
  },

  /* ---- Techos de zinc ---- */
  'hierros/planchas': function (a) {
    const p = partes(dimension(a));
    let an = p.length === 2 ? frac(p[0]) : null;
    let la = p.length === 2 ? frac(p[1]) : null;

    if (/Zinc Tra[ns]*lucido/i.test(a.nombre)) {
      if (!an || !la) return null;
      return {
        cat: 'MAT-07',
        clave: 'zinc-translucido-' + an.n + 'x' + la.n,
        orden: 300 + an.n,
        nombre: 'Zinc translúcido ' + an.t + ' x ' + la.t + ' pies',
        unidad: 'plancha',
        esp: '',
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
        /* El nombre lleva el desarrollo; el largo solo está en la referencia: 21"X10'. */
        esp: (t => t ? 'Tramo de ' + t[1] + ' pies' : '')(String(a.ref).match(/X(\d+)'/)),
        etapa: 'techos',
        origen: 'importado',
        alias: 'cumbrera, capote de techo'
      };
    }

    const ref = String(a.ref || '').replace(/["'\u2019\u201d]/g, '').toUpperCase();

    /* El caballete y el caño no declaran medida en la descripción, pero la
       referencia sí: "CAL-29X6'" es calibre 29 en 6 pies. */
    let z = /Caballete De Zinc/i.test(a.nombre) && ref.match(/^CAL-(\d+)X(\d+)/);
    if (z) {
      return {
        cat: 'MAT-07',
        clave: 'caballete-zinc-' + z[1] + '-' + z[2],
        orden: 500 + (+z[1]),
        nombre: 'Caballete de zinc calibre ' + z[1] + ', ' + z[2] + ' pies',
        unidad: 'unidad',
        esp: '',
        etapa: 'techos',
        gama: 'economica',
        alias: 'cumbrera de zinc, capote de techo'
      };
    }

    z = /Ca[ñn]o Para Aluzinc/i.test(a.nombre) && ref.match(/^([\d\/]+)X([\d\/]+)X(\d+)/);
    if (z) {
      const d1 = frac(z[1]), d2 = frac(z[2]);
      if (!d1 || !d2) return null;
      return {
        cat: 'MAT-07',
        clave: 'cano-aluzinc-' + d1.n + 'x' + d2.n + '-' + z[3],
        orden: 600 + d1.n,
        nombre: 'Caño para aluzinc ' + pulg(d1) + ' x ' + pulg(d2) + ' x ' + z[3] + ' pies',
        unidad: 'unidad',
        esp: '',
        etapa: 'techos',
        origen: 'importado',
        alias: 'canal de techo, canaleta de aluzinc'
      };
    }

    /* La planchuela de acero inoxidable va aparte: a RD$ 263 la libra no es
       la misma pieza que la de hierro negro a 35, y no debe promediar con
       ella. Se cotiza por pie, y la unidad son 20. */
    z = /Planchuela Acero Inox/i.test(a.nombre) && ref.match(/^([\d\/]+)X([\d\/]+)X(\d+)/);
    if (z) {
      const w1 = frac(z[1]), w2 = frac(z[2]);
      if (!w1 || !w2) return null;
      return {
        cat: 'MAT-20',
        clave: 'planchuela-inox-' + w1.n + 'x' + w2.n,
        orden: 1900 + w1.n,
        nombre: 'Planchuela de acero inoxidable ' + pulg(w1) + ' x ' + pulg(w2) + ' x ' + z[3] + ' pies',
        unidad: 'unidad',
        esp: '',
        etapa: 'estructura',
        gama: 'premium',
        origen: 'importado',
        alias: 'pletina inoxidable, planchuela inox'
      };
    }

    /* "Zinc Acanalado (Sol)" y "Zinc Liso 6 Lbs." son el mismo producto que
       las planchas de arriba con otro nombre; la referencia lo dice. */
    let m = a.nombre.match(/Plancha De Zinc (Acanalado|Liso) C-(\d+)/i);
    let tipo, cal;
    if (m) { tipo = m[1].toLowerCase(); cal = m[2]; }
    else {
      const alt = a.nombre.match(/^Zinc (Acanalado|Liso)\b/i) && ref.match(/^C-(\d+)(\d)X(\d+)$/);
      if (!alt) return null;
      tipo = a.nombre.match(/^Zinc (Acanalado|Liso)\b/i)[1].toLowerCase();
      cal = alt[1];
      an = frac(alt[2]); la = frac(alt[3]);
    }
    if (!an || !la) return null;
    return {
      cat: 'MAT-07',
      clave: 'zinc-' + tipo + '-' + cal + '-' + an.n + 'x' + la.n,
      orden: (tipo === 'acanalado' ? 100 : 200) + (+cal) + la.n / 100,
      nombre: 'Zinc ' + tipo + ' calibre ' + cal + ', ' + an.t + ' x ' + la.t + ' pies',
      unidad: 'plancha',
      esp: '',
      etapa: 'techos',
      gama: 'economica',
      alias: 'plancha de zinc, lámina de zinc'
    };
  },

  /* ---- Alambre liso galvanizado y alambre de púas ---- */
  'hierros/alambres': function (a) {
    let m = a.nombre.match(/Alambre Liso Galvanizado C-(\d+)/i);
    if (m && a.unidad === 'LIBRA') {
      return {
        cat: 'MAT-04',
        clave: 'alambre-liso-galv-' + m[1],
        orden: +m[1],
        nombre: 'Alambre liso galvanizado calibre ' + m[1],
        unidad: 'lb',
        esp: '',
        etapa: 'estructura',
        alias: 'alambre galvanizado, alambre de amarre'
      };
    }

    if (/Alambre Galv\. Picado/i.test(a.nombre)) {
      const k = String(a.ref).toUpperCase().match(/^CAJA(\d+)LB/);
      if (!k) return null;
      return {
        cat: 'MAT-04',
        clave: 'alambre-picado-caja-' + k[1],
        orden: 700,
        nombre: 'Alambre galvanizado picado, caja de ' + k[1] + ' lb',
        unidad: 'caja',
        esp: 'La ficha no declara el calibre',
        etapa: 'estructura',
        origen: 'importado',
        alias: 'alambre picado, alambre cortado de amarre'
      };
    }

    if (/Alambre Liso Galv\. Picado/i.test(a.nombre)) {
      const k = a.nombre.match(/(\d+)\s*Lib/i);
      const cal = String(a.ref).toUpperCase().match(/^C-(\d+)/);
      if (!k || !cal) return null;
      return {
        cat: 'MAT-04',
        clave: 'alambre-liso-picado-' + cal[1] + '-' + k[1],
        orden: 750,
        nombre: 'Alambre liso galvanizado picado calibre ' + cal[1] + ', paquete de ' + k[1] + ' lb',
        unidad: 'paquete',
        esp: '',
        etapa: 'estructura',
        origen: 'importado',
        alias: 'alambre picado, alambre de amarre cortado'
      };
    }

    /* Del alambre de púas el nombre no dice nada útil —hay siete artículos
       llamados casi igual— pero la referencia trae calibre y metraje. */
    if (/Alambre D[eE]? ?\/? ?P[uú]as/i.test(a.nombre)) {
      m = String(a.ref).match(/^C-(\d+)(\d{3})MTS/) || String(a.ref).match(/^([\d.]+)MM(\d{3})MTS/);
      if (!m) return null;
      const porMm = /MM/.test(String(a.ref));
      return {
        cat: 'MAT-22',
        clave: 'alambre-puas-' + m[1] + '-' + m[2],
        orden: 200 + (+m[1]),
        nombre: 'Alambre de púas ' + (porMm ? m[1] + ' mm' : 'calibre ' + m[1]) +
                ', rollo de ' + m[2] + ' metros',
        unidad: 'rollo',
        /* Cuando el nombre da milímetros, la ficha suele traducirlos a calibre. */
        esp: porMm && /Calibre:\s*\d+/i.test(a.info)
             ? 'La ficha lo declara calibre ' + limpia(a.info).match(/Calibre:\s*(\d+)/i)[1] : '',
        etapa: 'exteriores',
        origen: 'importado',
        alias: 'alambre de púas, púa, alambre de espino'
      };
    }

    return null;
  },

  /* ---- Malla ciclónica, postes, separadores, couplers y fibras ---- */
  'hierros/mallas y complementos': function (a) {
    const r = String(a.ref).replace(/["'\u2019\u201d]/g, '');

    /* "C-096X50" = calibre 9, 6 pies de alto, rollo de 50 pies. La ficha lo
       confirma en texto: «Galvanizada 6 x 50 pies de largo». */
    let m = /Malla Cicl[oó]nica/i.test(a.nombre) && r.match(/^C-(\d{1,2}?)(\d)X(\d+)(.*)$/);
    if (m) {
      const cal = String(+m[1]);
      const pvc = /Pvc/i.test(a.nombre) || /VERDE/i.test(m[4]);
      return {
        cat: 'MAT-22',
        clave: 'malla-ciclonica-' + cal + '-' + m[2] + (pvc ? '-pvc' : ''),
        orden: (+cal) * 10 + (+m[2]),
        nombre: 'Malla ciclónica calibre ' + cal + (pvc ? ' revestida en PVC' : '') +
                ', ' + m[2] + ' pies de alto, rollo de ' + m[3] + ' pies',
        unidad: 'rollo',
        esp: 'Galvanizada',
        etapa: 'exteriores',
        origen: 'importado',
        alias: 'malla ciclónica, verja de alambre, cyclone'
      };
    }

    m = /Tubo Galv P \/ Malla/i.test(a.nombre) && r.match(/^([\d\/]+)X(\d+)/);
    if (m) {
      const l = frac(m[1]);
      if (!l) return null;
      return {
        cat: 'MAT-22',
        clave: 'tubo-malla-' + l.n + '-' + m[2],
        orden: 100 + l.n,
        nombre: 'Tubo galvanizado para malla ciclónica ' + pulg(l) + ' x ' + m[2] + ' pies',
        unidad: 'unidad',
        esp: '',
        etapa: 'exteriores',
        origen: 'importado',
        alias: 'poste de malla, tubo de verja'
      };
    }

    if (/Separadores Plasticos/i.test(a.nombre)) {
      const l = frac(r);
      if (!l) return null;
      return {
        cat: 'MAT-04',
        clave: 'separador-varilla-' + l.n,
        orden: 500 + l.n,
        nombre: 'Separador plástico para varilla ' + pulg(l),
        unidad: 'unidad',
        esp: 'La ficha no declara el recubrimiento',
        etapa: 'estructura',
        origen: 'importado',
        alias: 'silleta, separador de varilla, galleta'
      };
    }

    /* "Q251" = serie Q25 (25 mm) y su equivalente en pulgadas, 1". */
    m = /Coupler Mecanico/i.test(a.nombre) && r.match(/^Q(\d{2})(.+)$/);
    if (m) {
      const l = frac(m[2]);
      if (!l) return null;
      return {
        cat: 'MAT-04',
        clave: 'coupler-varilla-' + l.n,
        orden: 600 + l.n,
        nombre: 'Coupler mecánico para varilla ' + pulg(l),
        unidad: 'unidad',
        esp: 'Serie Q' + m[1],
        etapa: 'estructura',
        origen: 'importado',
        alias: 'coupler, empalme mecánico de varilla'
      };
    }

    /* Metal desplegable: "4X8X1/2" es plancha de 4 x 8 pies con rombo de 1/2". */
    m = /Material Desplegable/i.test(a.nombre) && r.match(/^(\d+)X(\d+)X([\d\/]+)$/);
    if (m) {
      const l = frac(m[3]);
      if (!l) return null;
      return {
        cat: 'MAT-21',
        clave: 'desplegable-' + m[1] + 'x' + m[2] + '-' + l.n,
        orden: 3000 + l.n,
        nombre: 'Metal desplegable plano ' + pulg(l) + ', plancha ' + m[1] + ' x ' + m[2] + ' pies',
        unidad: 'plancha',
        esp: 'La ficha no declara el calibre',
        etapa: 'estructura',
        origen: 'importado',
        alias: 'metal desplegado, lámina expandida'
      };
    }

    if (/Fibra De Acero|Macro Fibra/i.test(a.nombre)) {
      const k = r.match(/\(([\d.]+)\s*KG\)/i);
      if (!k) return null;
      const acero = /Fibra De Acero/i.test(a.nombre);
      return {
        cat: 'MAT-02',
        clave: (acero ? 'fibra-acero-' : 'macrofibra-') + k[1],
        orden: 900,
        nombre: (acero ? 'Fibra de acero para hormigón' : 'Macrofibra sintética para hormigón') +
                ', funda de ' + k[1] + ' kg',
        unidad: 'funda',
        esp: '',
        etapa: 'estructura',
        origen: 'importado',
        alias: acero ? 'fibra metálica para hormigón' : 'fibra sintética, macrofibra'
      };
    }

    return null;
  },

  /* ---- Telas metálicas de cerramiento ---- */
  'hierros/telas metalicas y gaviones': function (a) {
    const m = String(a.ref).replace(/["'\u2019\u201d]/g, '').match(/^C-(\d{2})(.*)$/);
    if (!m) return null;
    const p = m[2].split('X');

    if (/Gallinero/i.test(a.nombre) && p.length === 2) {
      const alto = frac(p[0]);
      if (!alto) return null;
      return {
        cat: 'MAT-22',
        clave: 'tela-gallinero-' + m[1] + '-' + alto.n,
        orden: 400 + (+m[1]),
        nombre: 'Tela para gallinero calibre ' + m[1] + ', ' + alto.t + ' pies de alto',
        unidad: 'yarda',
        esp: 'Rollo de ' + parseInt(p[1], 10) + ' pies',
        etapa: 'exteriores',
        origen: 'importado',
        alias: 'tela de gallinero, malla hexagonal'
      };
    }

    if (p.length !== 4) return null;                       // retícula, alto y largo
    const x = frac(p[0]), y = frac(p[1]), alto = frac(p[2]);
    if (!x || !y || !alto) return null;
    return {
      cat: 'MAT-22',
      clave: 'tela-metalica-' + m[1] + '-' + x.n + 'x' + y.n + '-' + alto.n,
      orden: 300 + (+m[1]),
      nombre: 'Tela metálica calibre ' + m[1] + ', retícula ' + pulg(x) + ' x ' + pulg(y) +
              ', ' + alto.t + ' pies de alto',
      unidad: 'yarda',
      esp: 'Rollo de ' + parseInt(p[3], 10) + ' pies',
      etapa: 'exteriores',
      origen: 'importado',
      alias: 'tela metálica, malla de cuadrito, tela para conejo'
    };
  },

  /* ---- Polvo de color para mosaico y granito fundido ---- */
  'polvos/cromo': function (a) {
    const r = String(a.ref).toUpperCase();
    const grado = /IND/.test(r) || /\bInd\b/.test(a.nombre) ? 'industrial' : 'comercial';
    const COLORES = {AMAR: 'amarillo', AZUL: 'azul', NEGRO: 'negro', ROJO: 'rojo', VERDE: 'verde'};

    let color = null, libras = null;
    const nm = a.nombre.match(/Polvo Mosaico (Amarillo|Azul|Negro|Rojo|Verde)/i);
    if (nm) {
      color = nm[1].toLowerCase();
      const lb = r.match(/^(\d+)LIBRAS?$/);
      if (!lb) return null;
      libras = +lb[1];
    } else {
      /* La funda grande no dice el color en el nombre; la referencia sí:
         "16068VERDECOM." o "13632AMAR.IND.". */
      const k = Object.keys(COLORES).filter(c => r.indexOf(c) >= 0)[0];
      if (!k) return null;
      color = COLORES[k];
      libras = 55;
    }

    return {
      cat: 'MAT-08',
      clave: 'polvo-mosaico-' + color + '-' + grado + '-' + libras,
      orden: 900 + libras,
      nombre: 'Polvo de color para mosaico ' + color + ' ' + grado + ', ' + libras + ' lb',
      unidad: libras >= 55 ? 'funda' : 'unidad',
      esp: '',
      etapa: 'pisos',
      gama: grado === 'industrial' ? 'premium' : 'estandar',
      origen: 'importado',
      alias: 'cromo, polvo de color, pigmento para granito'
    };
  },

  /* ---- Agregados en funda ---- */
  'agregados/grava': function (a) {
    const m = a.nombre.match(/(\d+)\s*Libras/i);
    if (!m) return null;
    const arena = /Arena/i.test(a.nombre);
    const blanca = /Blanca/i.test(a.nombre);
    const med = a.nombre.match(/(\d+\s*\/\s*\d+)\s*[”"']/);
    const l = med ? frac(med[1].replace(/\s/g, '')) : null;
    const que = arena ? 'Arena' : (blanca ? 'Grava blanca' : 'Grava');
    return {
      cat: 'MAT-01',
      clave: 'funda-' + (arena ? 'arena' : blanca ? 'grava-blanca' : 'grava') +
             (l ? '-' + l.n : '') + '-' + m[1],
      orden: 900 + (+m[1]),
      nombre: que + (l ? ' ' + pulg(l) : '') + ' en funda de ' + m[1] + ' libras',
      unidad: 'funda',
      esp: '',
      etapa: 'estructura',
      alias: 'funda de arena, funda de grava, agregado ensacado'
    };
  },

  /* ---- Yeso y estuco ---- */
  'polvos/yeso': function (a) {
    const r = String(a.ref).toUpperCase();

    if (/Estuco/i.test(a.nombre)) {
      const m = r.match(/^(\d+)LIBRAS?$/);
      if (!m) return null;
      return {
        cat: 'MAT-12',
        clave: 'estuco-' + m[1],
        orden: 900,
        nombre: 'Estuco para interiores, funda de ' + m[1] + ' libras',
        unidad: 'funda',
        esp: '',
        etapa: 'terminacion',
        alias: 'estuco, masilla de pared'
      };
    }

    if (!/Yeso En Polvo/i.test(a.nombre)) return null;

    if (a.unidad === 'LIBRA') {
      return {
        cat: 'MAT-02',
        clave: 'yeso-polvo-libra',
        orden: 800,
        nombre: 'Yeso en polvo, por libra',
        unidad: 'lb',
        esp: '',
        etapa: 'terminacion',
        alias: 'yeso en polvo, yeso de obra'
      };
    }

    const m = r.match(/(\d+(?:\.\d+)?)\s*LBS?/) || r.match(/^(\d+)LIBRAS?$/);
    if (!m) return null;
    const marca = /Iberyola/i.test(a.nombre) ? 'Iberyola' : /Paloma/i.test(a.nombre) ? 'Paloma' : '';
    return {
      cat: 'MAT-02',
      clave: 'yeso-polvo-' + m[1] + (marca ? '-' + marca.toLowerCase() : ''),
      orden: 800 + (+m[1]),
      nombre: 'Yeso en polvo' + (marca ? ' ' + marca : '') + ', funda de ' + m[1] + ' libras',
      unidad: 'funda',
      esp: '',
      etapa: 'terminacion',
      origen: /Iberyola/i.test(a.nombre) ? 'importado' : 'nacional',
      alias: 'yeso en polvo, yeso de obra'
    };
  },

  /* ---- Presentaciones pequeñas de cemento ---- */
  'polvos/cemento blanco': function (a) {
    const r = String(a.ref).toUpperCase();
    const m = r.match(/^FDA\.(\d+)LBS/) || r.match(/^(\d+)LIBRAS?$/);
    if (!m) return null;                                   // las fundas de 40 kg van por MAPEO
    return {
      cat: 'MAT-02',
      clave: 'cemento-blanco-' + m[1],
      orden: 700 + (+m[1]),
      nombre: 'Cemento blanco, funda de ' + m[1] + ' libras',
      unidad: 'funda',
      esp: '',
      etapa: 'terminacion',
      origen: 'importado',
      alias: 'cemento blanco'
    };
  },

  'polvos/cemento gris': function (a) {
    const m = String(a.ref).toUpperCase().match(/^(\d+)LIBRAS?$/);
    if (!m) return null;
    return {
      cat: 'MAT-02',
      clave: 'cemento-gris-' + m[1],
      orden: 600 + (+m[1]),
      nombre: 'Cemento gris, funda de ' + m[1] + ' libras',
      unidad: 'funda',
      esp: '',
      etapa: 'terminacion',
      alias: 'cemento gris, funda pequeña de cemento'
    };
  },

  /* ---- Perfilería de aluminio ----
     Aquí hay que ser estricto. Buena parte del aluminio se identifica por
     código de extrusora —Angu0027, Plati0032, Tuboc0090— y no por medida,
     y varias referencias traen ese código pegado delante de la dimensión
     ("11575/8" es la pieza 1157 de 5/8"). Separarlos a ojo es adivinar, así
     que solo entra la referencia que arranca directamente en la medida. */
  aluminio: function (a, familia) {
    const r = String(a.ref).replace(/["'\u2019\u201d]/g, '').trim();
    if (/^[A-Za-z]/.test(r)) return null;                  // código de extrusora al frente
    if (/^\d{4}/.test(r)) return null;                     // código numérico pegado a la medida

    /* Todo el aluminio viene en tramos de 19.20 pies; se quita esa cola
       para quedarnos solo con la sección. */
    const cuerpo = r.replace(/X?\(?19[.,]?\d*\s*(PIES?|PI|P)?\)?$/i, '').replace(/[X(]+$/, '');
    if (!cuerpo) return null;

    const p = cuerpo.split(/X/i).map(limpia).filter(Boolean);
    const l = frac(p[0]);
    if (!l) return null;
    const h = p.length > 1 ? frac(p[1]) : null;
    if (p.length > 1 && !h) return null;

    /* Un tubo redondo o una barra quedan definidos por un solo número, pero
       una planchuela sin espesor o un angular sin ala no dicen nada. */
    const UNA_MEDIDA = {'aluminio/tubos': true, 'aluminio/barras': true};
    if (!h && !UNA_MEDIDA[familia]) return null;

    /* Nombre, especificación y alias. Ninguna ficha de aluminio declara la
       pared del tubo ni el espesor del angular, y ahí está la diferencia. */
    const TIPOS = {
      'aluminio/angulares':  ['Angular de aluminio',        'La ficha no declara el espesor',  'angular de aluminio, perfil L'],
      'aluminio/planchuela': ['Planchuela de aluminio',     '',                                'pletina de aluminio, planchuela'],
      'aluminio/tubos':      ['Tubo redondo de aluminio',   'La ficha no declara la pared',    'tubo de aluminio'],
      'aluminio/barras':     ['Barra de aluminio',          '',                                'barra de aluminio'],
      'aluminio/perfiles':   ['Perfil de aluminio',         'La ficha no declara la pared',    'perfilería de aluminio'],
      'aluminio/molduras':   ['Moldura U de aluminio',      'La ficha no declara el espesor',  'moldura U, canal de aluminio']
    };
    const t = TIPOS[familia];
    if (!t) return null;

    let nombre = t[0];
    if (familia === 'aluminio/perfiles') {
      nombre = /Cuad/i.test(a.nombre) ? 'Perfil cuadrado de aluminio'
             : /Rect/i.test(a.nombre) ? 'Perfil rectangular de aluminio'
             : 'Perfil de aluminio';
    }

    const medida = pulg(l) + (h ? ' x ' + pulg(h) : '');
    return {
      cat: 'MAT-23',
      clave: familia.split('/')[1] + '-' + l.n + (h ? 'x' + h.n : ''),
      orden: l.n * 100 + (h ? h.n : 0),
      nombre: nombre + ' ' + medida + ' x 19.20 pies',
      unidad: 'unidad',
      esp: t[1],
      etapa: 'puertas-ventanas',
      origen: 'importado',
      alias: t[2]
    };
  },

  /* ---- Accesorios de malla ciclónica ---- */
  'aluminio/accesorios para malla': function (a) {
    const r = String(a.ref).replace(/["'']/g, '');
    const tipo =
      /^Abrazadera/i.test(a.nombre) ? 'Abrazadera' :
      /^Brazo/i.test(a.nombre) ? 'Brazo' :
      /^Copa Pasante/i.test(a.nombre) ? 'Copa pasante' :
      /^Copa Tensora/i.test(a.nombre) ? 'Copa tensora' :
      /^Copa Terminal/i.test(a.nombre) ? 'Copa terminal' :
      /^Union/i.test(a.nombre) ? 'Unión' : null;
    if (!tipo) return null;

    const m = r.match(/^(\d(?:\d\/\d)?|\d\/\d)(?:X(\d(?:\d\/\d)?|\d\/\d))?(.*)$/);
    if (!m) return null;
    const a1 = frac(m[1]);
    if (!a1) return null;
    const a2 = m[2] ? frac(m[2]) : null;
    /* La variante viene escrita en femenino en la referencia porque allá
       describe la abrazadera; aquí concuerda con el nombre de la pieza. */
    const resto = limpia(m[3] || '').replace(/[()]/g, '').toLowerCase();
    const masculino = tipo === 'Brazo';
    const variante =
      /larga/.test(resto) ? (masculino ? ' largo' : ' larga') :
      /corta/.test(resto) ? (masculino ? ' corto' : ' corta') :
      /sencilla/.test(resto) || /Sencillo/i.test(a.nombre) ? (masculino ? ' sencillo' : ' sencilla') :
      /doble/i.test(a.nombre) ? ' doble' :
      /reforzada/.test(resto) ? (masculino ? ' reforzado' : ' reforzada') : '';
    const medida = pulg(a1) + (a2 ? ' x ' + pulg(a2) : '');
    return {
      cat: 'MAT-22',
      clave: 'accesorio-' + tipo.toLowerCase().replace(/\s/g, '-') + '-' + a1.n +
             (a2 ? 'x' + a2.n : '') + variante.replace(/\s/g, ''),
      orden: 500 + a1.n,
      nombre: tipo + variante + ' para malla ciclónica ' + medida,
      unidad: 'unidad',
      esp: /S\/TORN/i.test(r) ? 'Sin tornillo · se compra aparte' : '',
      etapa: 'exteriores',
      origen: 'importado',
      alias: 'accesorio de verja, herraje de malla ciclónica'
    };
  }
};

FAMILIAS_ALUMINIO.forEach(f => { REGLAS[f] = a => REGLAS.aluminio(a, f); });

/* =========================================================
   3. Lectura y clasificación
   ========================================================= */

/* Cada extracción trae su propio criterio. En materiales de construcción el
   artículo se identifica por su medida, y la regla la busca en la ficha. En
   baños se identifica por marca y modelo, y lo que hay que decidir es otra
   cosa: si el artículo le sirve o no a un constructor. Ese criterio vive en
   reglas-banos.js. */
const BANOS = require('./reglas-banos.js');
const SEGTEC = require('./reglas-segtec.js');
const INNOVA = require('./reglas-innovacentro.js');
const BALDOSAS = require('./reglas-baldosas.js');
const CIMA = require('./reglas-cima.js');
const MAX = require('./reglas-max.js');
const MAXELEC = require('./reglas-max-electricos.js');
const MC = require('./reglas-mc.js');
const CERARTE = require('./reglas-cerarte.js');
const IBERICA = require('./reglas-iberica.js');
const TONOS = require('./reglas-tonos.js');
const FERREMIX = require('./reglas-ferremix.js');
const BELLON = require('./reglas-bellon.js');
const MUNDOLED = require('./reglas-mundoled.js');
const HOGARDECO = require('./reglas-hogardeco.js');
const CORTINAJE = require('./reglas-cortinaje.js');
const DCO = require('./reglas-dco.js');
const CARABELA = require('./reglas-carabela.js');
const BELLAVISTA = require('./reglas-bellavista.js');
const ILUMEL = require('./reglas-ilumel.js');
const LUMINATTI = require('./reglas-luminatti.js');

const FUENTES = [
  {
    archivo: FUENTE,
    etiqueta: 'Ochoa · materiales de construcción',
    proveedor: 'Ferretería Ochoa (8A)',
    constante: 'PROV_OCHOA',
    fecha: '2026-09-09',
    motivo: 'la ficha no declara la medida',
    mapeo: MAPEO_OCHOA,
    regla: a => {
      const r = REGLAS[a.cat2 + '/' + a.cat3];
      return r ? r(a) : undefined;              // undefined = familia sin regla, ni se cuenta
    }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/ochoa-banos-2026-09-09.json'),
    etiqueta: 'Ochoa · baños',
    proveedor: 'Ferretería Ochoa (8A)',
    constante: 'PROV_OCHOA',
    fecha: '2026-09-09',
    motivo: 'repuesto de consumidor o pieza suelta de decoración',
    mapeo: {},
    regla: a => BANOS.regla(a) || null
  },
  {
    archivo: path.join(__dirname, 'datos-externos/ochoa-seguridad-2026-09-09.json'),
    etiqueta: 'Ochoa · seguridad y tecnología',
    proveedor: 'Ferretería Ochoa (8A)',
    constante: 'PROV_OCHOA',
    fecha: '2026-09-09',
    motivo: 'accesorio de computadora, no de obra',
    mapeo: {},
    regla: a => SEGTEC.regla(a) || null
  },
  {
    archivo: path.join(__dirname, 'datos-externos/ochoa-baldosas-2026-09-09.json'),
    etiqueta: 'Ochoa · baldosas',
    proveedor: 'Ferretería Ochoa (8A)',
    constante: 'PROV_OCHOA',
    fecha: '2026-09-09',
    motivo: 'la ficha no declara la especificación',
    motivoDe: () => BALDOSAS.MOTIVO.valor || 'la ficha no declara la especificación',
    mapeo: {},
    /* undefined tiene que sobrevivir: es «familia sin regla», y no es lo mismo
       que un descarte. En este catálogo hay un taco metálico archivado bajo
       pavimentos que no es de este rubro y no tiene por qué contarse como
       algo que se dejó fuera. */
    regla: a => { const r = BALDOSAS.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/innovacentro-2026-09-09.json'),
    etiqueta: 'InnovaCentro · materiales de construcción',
    proveedor: 'InnovaCentro (La Innovación)',
    constante: 'PROV_INNOVA',
    fecha: '2026-09-09',
    motivo: 'no corresponde a ningún ítem y su ficha no basta para crear uno',
    mapeo: INNOVA.MAPEO,
    regla: a => INNOVA.regla(a) || null
  },
  {
    archivo: path.join(__dirname, 'datos-externos/cima-materiales-2026-09-09.json'),
    etiqueta: 'Cima · materiales',
    proveedor: 'Ferretería Cima',
    constante: 'PROV_CIMA',
    fecha: '2026-09-09',
    motivo: 'no corresponde a ningún ítem y su ficha no basta para crear uno',
    /* La colección es corta y el comercio la trae agrupada, así que el motivo
       del descarte se puede dar familia por familia. */
    motivoDe: a => CIMA.FUERA_MATERIALES[a.cat3] || 'no corresponde a ningún ítem del catálogo',
    mapeo: CIMA.MAPEO,
    regla: () => null
  },
  {
    archivo: path.join(__dirname, 'datos-externos/cima-plomeria-2026-09-09.json'),
    etiqueta: 'Cima · plomería y baños',
    proveedor: 'Ferretería Cima',
    constante: 'PROV_CIMA',
    fecha: '2026-09-09',
    motivo: 'la ficha no declara la especificación',
    motivoDe: () => CIMA.MOTIVO.valor || 'la ficha no declara la especificación',
    mapeo: {},
    regla: a => { const r = CIMA.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/max-maderas-2026-09-09.json'),
    etiqueta: 'Max Ferretería · maderas',
    proveedor: 'Max Ferretería',
    constante: 'PROV_MAX',
    fecha: '2026-09-09',
    motivo: 'la ficha no declara la especificación',
    motivoDe: () => MAX.MOTIVO.valor || 'la ficha no declara la especificación',
    mapeo: MAX.MAPEO,
    regla: a => { const r = MAX.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/max-metales-2026-09-09.json'),
    etiqueta: 'Max Ferretería · metales',
    proveedor: 'Max Ferretería',
    constante: 'PROV_MAX',
    fecha: '2026-09-09',
    motivo: 'la ficha no declara la especificación',
    motivoDe: () => MAX.MOTIVO.valor || 'la ficha no declara la especificación',
    mapeo: MAX.MAPEO_METALES,
    regla: a => { const r = MAX.reglaMetales(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/max-electricos-2026-09-09.json'),
    etiqueta: 'Max Ferretería · eléctricos',
    proveedor: 'Max Ferretería',
    constante: 'PROV_MAX',
    fecha: '2026-09-09',
    motivo: 'la ficha no declara la especificación',
    motivoDe: () => MAXELEC.MOTIVO.valor || 'la ficha no declara la especificación',
    mapeo: {},
    regla: a => { const r = MAXELEC.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/mc-cotizacion-2026-09-09.json'),
    etiqueta: 'Ferretería MC · cotización formal',
    proveedor: 'Ferretería MC',
    constante: 'PROV_MC',
    fecha: '2026-09-09',
    /* No es una extracción de catálogo: son dos cotizaciones que el comercio
       emitió a nombre nuestro, con el ITBIS en columna aparte. */
    itbis: false,
    fuenteDe: a => 'Cotización ' + a.cotizacion + ' de Ferretería MC, 09/09/2026',
    motivo: 'la línea no corresponde a ningún ítem del catálogo',
    motivoDe: () => MC.MOTIVO.valor || 'la línea no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = MC.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/cerarte-2026-09-10.json'),
    etiqueta: 'CerArte · cerámica, porcelanato y baños',
    proveedor: 'CerArte',
    constante: 'PROV_CERARTE',
    fecha: '2026-09-10',
    /* Su tienda declara en la ficha que el precio publicado no lleva ITBIS.
       No hay nada que suponer. */
    itbis: false,
    notaItbis: 'El comercio publica el precio sin ITBIS y lo suma en la factura',
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => CERARTE.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = CERARTE.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/iberica-2026-09-10.json'),
    etiqueta: 'La Ibérica · cerámica, baños y grifería',
    proveedor: 'La Ibérica',
    constante: 'PROV_IBERICA',
    fecha: '2026-09-10',
    /* Su propia nota de extracción dice que la web no desglosa el impuesto:
       va con el supuesto de mostrador. */
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => IBERICA.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = IBERICA.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/tonos-2026-09-09.json'),
    etiqueta: 'Tonos y Colores · pintura',
    proveedor: 'Tonos y Colores',
    constante: 'PROV_TONOS',
    fecha: '2026-09-09',
    /* La tienda declara que sus precios llevan ITBIS: es un dato, no un
       supuesto, y la nota lo dice así. */
    itbisDeclarado: true,
    notaItbis: 'El comercio declara que el precio incluye ITBIS. Todo su catálogo está en oferta, así que se carga el precio vigente: es el de calle',
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => TONOS.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = TONOS.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/ferremix-2026-09-10.json'),
    etiqueta: 'Ferremix · ferretería general',
    proveedor: 'Ferremix (Grupo Alterra)',
    constante: 'PROV_FERREMIX',
    fecha: '2026-09-10',
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => FERREMIX.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = FERREMIX.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/bellon-2026-09-10.json'),
    etiqueta: 'Bellón · ferretería completa',
    proveedor: 'Bellón',
    constante: 'PROV_BELLON',
    fecha: '2026-09-10',
    /* Ni la extracción ni la ficha dicen si el precio publicado lleva ITBIS:
       va con el supuesto de mostrador y la nota lo dice. */
    fuenteDe: () => 'Catálogo público de Bellón (catalogo.bellon.com.do), 10/09/2026',
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => BELLON.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = BELLON.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/bellavista-2026-09-11.json'),
    etiqueta: 'Papel Tapiz Bella Vista',
    proveedor: 'Papel Tapiz Bella Vista',
    constante: 'PROV_BELLAVISTA',
    fecha: '2026-09-11',
    /* Lo declara su propia columna de precio, así que es dato y no supuesto. */
    itbisDeclarado: true,
    notaItbis: 'El comercio declara que el precio incluye ITBIS',
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => BELLAVISTA.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = BELLAVISTA.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/carabela-2026-09-11.json'),
    etiqueta: 'Carabela · baño y cocina de gama alta',
    proveedor: 'Carabela',
    constante: 'PROV_CARABELA',
    fecha: '2026-09-11',
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => CARABELA.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = CARABELA.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/ilumel-2026-09-11.json'),
    etiqueta: 'Ilumel · lámparas decorativas',
    proveedor: 'Ilumel',
    constante: 'PROV_ILUMEL',
    fecha: '2026-09-11',
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => ILUMEL.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = ILUMEL.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/dco-2026-09-11.json'),
    etiqueta: 'DCO · papel tapiz escandinavo',
    proveedor: 'DCO',
    constante: 'PROV_DCO',
    fecha: '2026-09-11',
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => DCO.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = DCO.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/cortinaje-2026-09-11.json'),
    etiqueta: 'Cortinaje · papel tapiz de diseñador',
    proveedor: 'Cortinaje',
    constante: 'PROV_CORTINAJE',
    fecha: '2026-09-11',
    moneda: 'USD',
    fuenteDe: a => 'Precio publicado en ' + (a.url || 'cortinaje.shop'),
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => CORTINAJE.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = CORTINAJE.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/hogardeco-2026-09-10.json'),
    etiqueta: 'Hogardeco · revestimientos decorativos',
    proveedor: 'Hogardeco',
    constante: 'PROV_HOGARDECO',
    fecha: '2026-09-10',
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => HOGARDECO.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = HOGARDECO.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/mundoled-2026-09-10.json'),
    etiqueta: 'Mundo LED · iluminación',
    proveedor: 'Mundo LED',
    constante: 'PROV_MUNDOLED',
    fecha: '2026-09-10',
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => MUNDOLED.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = MUNDOLED.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/luminatti-2026-09-10.json'),
    etiqueta: 'Luminatti · iluminación de diseño',
    proveedor: 'Luminatti',
    constante: 'PROV_LUMINATTI',
    fecha: '2026-09-10',
    /* Publica en dólares: el dato de origen es el dólar y el peso sale de la
       tasa del catálogo. */
    moneda: 'USD',
    fuenteDe: a => 'Precio publicado en ' + (a.url || 'luminatti.com'),
    motivo: 'no corresponde a ningún ítem del catálogo',
    motivoDe: () => LUMINATTI.MOTIVO.valor || 'no corresponde a ningún ítem del catálogo',
    mapeo: {},
    regla: a => { const r = LUMINATTI.regla(a); return r === undefined ? undefined : (r || null); }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/innovacentro-banos-2026-09-09.json'),
    etiqueta: 'InnovaCentro · baños',
    proveedor: 'InnovaCentro (La Innovación)',
    constante: 'PROV_INNOVA',
    fecha: '2026-09-09',
    motivo: 'no es equipamiento de obra',
    /* Este comercio agrupa bien su catálogo, así que el motivo del descarte
       se puede decir grupo por grupo en vez de con una frase para todos. */
    motivoDe: a => INNOVA.FUERA_BANOS[a.cat3] || 'no es equipamiento de obra',
    mapeo: {},
    regla: a => INNOVA.reglaBanos(a) || null
  }
];

/* Ochoa cotiza algunas barras POR PIE; la unidad completa son 20 pies,
   como dice su propia nota de facturación.

   Las baldosas plantean lo mismo al revés: la tienda cobra por pieza y la
   obra compra por metro cuadrado. Ahí el factor no es fijo —depende del
   formato— y lo pone la regla en `_factorUnidad` al clasificar el artículo,
   con la nota que explica de dónde sale. */
const precioUnidad = a =>
  a._factorUnidad ? a.precio * a._factorUnidad.veces :
  a.unidad === 'PIE' ? a.precio * PIES_POR_UNIDAD : a.precio;

const aExistente = [];
const nuevos = [];
const descartados = [];
const totales = [];

FUENTES.forEach(fuente => {
  const articulos = JSON.parse(fs.readFileSync(fuente.archivo, 'utf8'));
  const conPrecio = articulos.filter(a => typeof a.precio === 'number' && a.precio > 0);
  let dentro = 0, fuera = 0;

  conPrecio.forEach(a => {
    a._fuente = fuente;                                   // de quién es el precio
    if (fuente.mapeo[a.codigo]) {
      aExistente.push({ a, item: fuente.mapeo[a.codigo] });
      dentro++;
      return;
    }
    const spec = fuente.regla(a);
    if (spec === undefined) return;                       // familia sin regla
    if (spec && spec.factorUnidad) a._factorUnidad = spec.factorUnidad;
    if (!spec) {
      descartados.push({ a, motivo: fuente.motivoDe ? fuente.motivoDe(a) : fuente.motivo });
      fuera++;
      return;
    }
    /* Una regla puede resolver que el artículo es un ítem que ya existe.
       En InnovaCentro pasa mucho: es el segundo comercio, y lo valioso de su
       catálogo no son ítems nuevos sino un segundo precio para los que ya
       están. */
    if (spec.existente) {
      aExistente.push({ a, item: spec.existente });
      dentro++;
      return;
    }
    nuevos.push({ a, spec });
    dentro++;
  });

  totales.push({ etiqueta: fuente.etiqueta, articulos: articulos.length,
                 conPrecio: conPrecio.length, dentro, fuera });
});

/* =========================================================
   4. Validación por precio de la libra
   ========================================================= */

/* La prueba del precio por libra solo vale donde el peso ES el precio: el
   acero comercial se compra al peso y dentro de una familia el RD$/lb apenas
   se mueve. En el polvo de color, en cambio, el precio depende del pigmento
   y del grado —el verde industrial vale casi el triple que el amarillo
   comercial— y aplicarla ahí rechazaría precios buenos. */
const VALIDA_POR_LIBRA = {
  'hierros/angulares': true,
  'hierros/planchuelas': true,
  'hierros/barras': true,
  'hierros/tolas': true,
  'hierros/tubos': true
};

const porFamilia = {};
nuevos.concat(aExistente.map(x => ({ a: x.a, spec: null }))).forEach(x => {
  const f = x.a.cat2 + '/' + x.a.cat3;
  if (!VALIDA_POR_LIBRA[f]) return;
  const w = peso(x.a);
  if (!w) return;
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
  const f = a.cat2 + '/' + a.cat3;
  if (!VALIDA_POR_LIBRA[f]) return true;
  const w = peso(a);
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
  /* Las medidas se acumulan de todos los artículos que caen en el ítem: uno
     declara los litros del tanque y otro las dimensiones, y la ficha termina
     sabiendo más que cualquiera de sus fuentes.

     Pero solo se publica lo que TODOS los artículos del ítem dicen igual. Si
     uno declara acabado mate y otro brillante, la ficha del ítem no puede
     decir «mate»: sería publicar como especificación lo que dijo una sola de
     sus fuentes. En conflicto, la medida se cae. */
  if (x.spec.medidas) {
    const m = items[k].spec.medidas || (items[k].spec.medidas = {});
    const roto = items[k].medidasEnConflicto || (items[k].medidasEnConflicto = {});
    Object.keys(x.spec.medidas).forEach(kk => {
      const v = x.spec.medidas[kk];
      if (v === undefined || v === '' || v === null) return;
      if (roto[kk]) return;
      if (m[kk] === undefined || m[kk] === '' || m[kk] === null) { m[kk] = v; return; }
      if (String(m[kk]) !== String(v)) { roto[kk] = true; delete m[kk]; }
    });
  }
});

/* El mismo ítem, el mismo comercio y el mismo precio, varias veces: el
   derretido Eurojunta sale en 16 colores y los 16 cuestan RD$ 323.12. Bajo el
   modelo de especificación son un solo precio, y publicarlos 16 veces llenaría
   la ficha de filas idénticas y le daría a ese comercio 16 votos en la
   mediana. Se deja una cotización y se dice cuántos artículos la comparten. */
function colapsar(articulos) {
  const vistos = {};
  const salida = [];
  articulos.forEach(a => {
    const k = a._fuente.etiqueta + '|' + Math.round(precioUnidad(a) * 100);
    if (vistos[k]) { vistos[k].repite++; return; }
    vistos[k] = { a: a, repite: 1 };
    salida.push(vistos[k]);
  });
  return salida;
}

Object.keys(items).forEach(k => { items[k].cotizables = colapsar(items[k].articulos); });

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
const corte = fuenteCatalogo.indexOf('/* catalogos:items:inicio');
if (corte < 0) {
  /* Sin este aviso el indexOf devuelve -1, el slice se lleva el archivo
     entero y el contador incluye los ítems que generó la corrida anterior:
     los códigos se corren y las cotizaciones quedan apuntando al vacío.
     Pasó una vez; no vuelve a pasar en silencio. */
  console.error('No encuentro el marcador catalogos:items en datos-catalogo.js.');
  process.exit(1);
}
const aMano = fuenteCatalogo
  .slice(0, corte)
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

/* Un mapeo puede apuntar a un ítem que genera esta misma herramienta. Ahí no
   sirve escribir el código —se corre solo si más adelante entra otro ítem
   antes—, así que se escribe '#CATEGORÍA|clave' y se resuelve aquí, ya con
   los códigos asignados. */
if (process.argv.indexOf('--claves') >= 0) {
  const filtro = process.argv[process.argv.indexOf('--claves') + 1] || '';
  console.log('');
  console.log('Claves de los ítems generados' + (filtro ? ' que casan con «' + filtro + '»' : '') + ':');
  Object.keys(codigoDe).sort().forEach(k => {
    if (filtro && k.toLowerCase().indexOf(filtro.toLowerCase()) < 0) return;
    console.log('  ' + codigoDe[k] + '   #' + k);
  });
}

const generados = {};
Object.keys(codigoDe).forEach(k => { generados[codigoDe[k]] = k; });

aExistente.forEach(x => {
  if (x.item.charAt(0) === '#') {
    const k = x.item.slice(1);
    const codigo = codigoDe[k];
    if (!codigo) {
      console.error('El mapeo del artículo ' + x.a.codigo + ' apunta a «' + k +
                    '», que esta corrida no genera. Corre --claves para ver las que hay.');
      process.exit(1);
    }
    x.item = codigo;
    return;
  }
  /* Un mapeo NUNCA debe apuntar por código a un ítem que genera esta misma
     herramienta: el número se corre en cuanto entra otro ítem antes en la
     misma categoría, y las cotizaciones terminan en el ítem equivocado sin
     dar ningún error. Pasó con InnovaCentro y las mallas ciclónicas. */
  if (generados[x.item]) {
    console.error('El mapeo del artículo ' + x.a.codigo + ' apunta a ' + x.item +
                  ', que es un ítem generado. Usa la clave: #' + generados[x.item]);
    process.exit(1);
  }
});

/* =========================================================
   6. Código generado
   ========================================================= */

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const num = n => Math.round(n * 100) / 100;

function bloqueItems() {
  const L = [];
  L.push('  /* catalogos:items:inicio — generado por herramientas/importar-catalogos.js.');
  L.push('     No editar a mano: se reescribe en cada importación. */');
  let catPrev = '';
  lista.forEach(e => {
    const s = e.spec;
    if (s.cat !== catPrev) { catPrev = s.cat; L.push(''); L.push('  /* ' + s.cat + ' */'); }
    /* El precio de referencia sale de la cotización real; el sitio lo
       recalcula igual al arrancar, pero así el HTML generado ya nace
       con el número correcto aunque el JavaScript no llegue a correr. */
    const precios = e.cotizables.map(c => precioUnidad(c.a));
    const ref = num(mediana(precios));
    const med = s.medidas || {};
    const claves = Object.keys(med).filter(k => med[k] !== '' && med[k] !== null && med[k] !== undefined);
    const medidas = claves.length
      ? 'medidas:{' + claves.map(k =>
          k + ':' + (typeof med[k] === 'number' ? med[k] : "'" + esc(med[k]) + "'")).join(', ') + '}'
      : '';

    const o = [
      "esp:'" + esc(s.esp) + "'",
      "etapa:'" + s.etapa + "'",
      s.gama ? "gama:'" + s.gama + "'" : '',
      s.origen ? "origen:'" + s.origen + "'" : '',
      "alias:'" + esc(s.alias) + "'",
      medidas,
      "alcance:'Material retirado en almacén'"
    ].filter(Boolean).join(', ');
    L.push("  it('" + s.cat + "', '" + esc(s.nombre) + "', '" + esc(s.unidad) + "', " +
           ref + ', ' + num(Math.min.apply(null, precios)) + ', ' + num(Math.max.apply(null, precios)) +
           ', {' + o + '});');
  });
  L.push('  /* catalogos:items:fin */');
  return L.join('\n');
}

/* Lo mismo que colapsar(), para los artículos que caen en un ítem que ya
   existía: ahí el ítem no se genera, así que hay que agrupar por código. */
function colapsarPorItem(entradas) {
  const vistos = {};
  const salida = [];
  entradas.forEach(x => {
    const k = x.item + '|' + x.a._fuente.etiqueta + '|' + Math.round(precioUnidad(x.a) * 100);
    if (vistos[k]) { vistos[k].repite++; return; }
    vistos[k] = { item: x.item, a: x.a, repite: 1 };
    salida.push(vistos[k]);
  });
  return salida;
}

function bloqueCotizaciones() {
  const L = [];
  L.push('  /* catalogos:cotizaciones:inicio — generado por herramientas/importar-catalogos.js.');
  L.push('     No editar a mano: se reescribe en cada importación. */');
  L.push('');

  const linea = (item, a, repite) => {
    /* La referencia del fabricante va en la nota porque es la prueba: es
       donde la tienda declara la medida que su propio nombre se calla. */
    const ficha = [a.nombre, 'artículo ' + a.codigo];
    if (a.ref) ficha.push('ref. ' + a.ref);
    if (a.marca && !/GENERICO/i.test(a.marca)) ficha.push('marca ' + a.marca);
    const notas = [ficha.join(' · ')];
    if (a.unidad === 'PIE') notas.push('La tienda cotiza por pie y factura la unidad de ' +
      PIES_POR_UNIDAD + ' pies; aquí va el precio de la unidad completa');
    if (a._factorUnidad) notas.push(a._factorUnidad.nota + ' (RD$ ' + num(a.precio) + ' por pieza)');
    if (repite > 1) notas.push('El comercio lista ' + repite + ' artículos con esta misma ' +
      'especificación y el mismo precio; aquí van como una sola cotización, y cuenta por ' +
      repite + ' al calcular la referencia');
    const f = a._fuente;
    /* El ITBIS solo se asume cuando la fuente no lo declara. En una cotización
       formal viene en su propia columna, y entonces es un dato: se escribe
       `itbis: false` y la nota lo dice en vez de suponerlo. */
    const campos = ["    fecha: '" + f.fecha + "', fuente: '" +
                    esc(f.fuenteDe ? f.fuenteDe(a) : 'Precio publicado en ' + a.url) + "'"];
    if (f.itbis === false) campos.push('    itbis: false');
    /* Hay comercios que publican en dólares. El peso lo pone la tasa del
       catálogo, en un solo sitio, y la nota de la cotización dice cuál y de
       cuándo: así el día que la tasa cambie no hay que tocar mil líneas. */
    if (f.moneda && f.moneda !== 'RD$') campos.push("    moneda: '" + f.moneda + "'");
    if (repite > 1) campos.push('    peso: ' + repite);
    /* Tres casos: el comercio declara que no lo lleva, declara que sí lo
       lleva, o se calla y hay que suponerlo. Solo el tercero es un supuesto
       y solo ese lo dice. */
    const cierre = (f.itbis === false || f.itbisDeclarado)
      ? "    nota: '" + esc(notas.join('. ')) + '. ' + esc(f.notaItbis || 'El precio es antes de ITBIS: la cotización lo suma aparte') + "'"
      : "    nota: '" + esc(notas.join('. ')) + ". ' + SUPUESTO_ITBIS";
    return "  c('" + item + "', " + f.constante + ", " + num(precioUnidad(a)) + ", {\n" +
           campos.join(',\n') + ',\n' + cierre + "\n  });";
  };

  if (existenteOk.length) {
    L.push('  /* Artículos que corresponden a un ítem que ya existía. Aquí es donde');
    L.push('     el catálogo se vuelve comparable: el mismo ítem con el precio de');
    L.push('     más de un comercio. */');
    FUENTES.forEach(f => {
      const suyas = existenteOk.filter(x => x.a._fuente === f);
      if (!suyas.length) return;
      L.push('');
      L.push('  /* ' + f.etiqueta + ' */');
      colapsarPorItem(suyas).forEach(c => L.push(linea(c.item, c.a, c.repite)));
    });
    L.push('');
  }
  L.push('  /* Familias completas del catálogo de Ochoa: cada ítem nace verificado. */');
  lista.forEach(e => {
    const cod = codigoDe[e.spec.cat + '|' + e.spec.clave];
    e.cotizables.forEach(c => L.push(linea(cod, c.a, c.repite)));
  });
  L.push('  /* catalogos:cotizaciones:fin */');
  return L.join('\n');
}

/* =========================================================
   7. Escritura entre marcadores
   ========================================================= */

function reemplazar(archivo, marca, bloque) {
  const ruta = path.join(DATOS, archivo);
  const texto = fs.readFileSync(ruta, 'utf8');
  const ini = '/* catalogos:' + marca + ':inicio';
  const fin = '/* catalogos:' + marca + ':fin */';
  const i = texto.indexOf(ini), j = texto.indexOf(fin);
  if (i < 0 || j < 0) {
    console.error('No encuentro los marcadores catalogos:' + marca + ' en ' + archivo + '.');
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

totales.forEach(t => {
  console.log('Extracción de ' + t.etiqueta + ': ' + t.articulos + ' artículos, ' +
              t.conPrecio + ' con precio, ' + t.dentro + ' aprovechados' +
              (t.fuera ? ' y ' + t.fuera + ' descartados' : '') + '.');
});
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
const porMotivo = {};
descartados.forEach(x => { porMotivo[x.motivo] = (porMotivo[x.motivo] || 0) + 1; });
console.log('Descartados (' + descartados.length + '):');
Object.keys(porMotivo).forEach(m => console.log('  ' + String(porMotivo[m]).padStart(4) + '  ' + m));
if (process.argv.indexOf('--descartes') >= 0) {
  const porFam = {};
  descartados.forEach(x => {
    const f = x.a.cat2 + '/' + x.a.cat3;
    (porFam[f] = porFam[f] || []).push(x.a);
  });
  Object.keys(porFam).sort().forEach(f => {
    console.log('  — ' + f + ' (' + porFam[f].length + ')');
    porFam[f].forEach(a => console.log('     ' + a.codigo + '  ' + a.nombre +
      '  · ref ' + (a.ref || '—')));
  });
}

if (process.argv.indexOf('--listar') >= 0) {
  console.log('');
  console.log('Ítems que saldrían:');
  let cp = '';
  lista.forEach(e => {
    if (e.spec.cat !== cp) { cp = e.spec.cat; console.log('  — ' + cp); }
    console.log('    ' + codigoDe[e.spec.cat + '|' + e.spec.clave] + '  ' + e.spec.nombre +
                '  (' + e.spec.unidad + ')');
  });
}

const faltan = Object.keys(porCategoria).filter(c => !CAT.categorias.some(k => k.codigo === c));
if (faltan.length) {
  console.log('');
  console.log('FALTA declarar estas categorías en datos-catalogo.js: ' + faltan.join(', '));
  process.exit(1);
}

/* =========================================================
   7. El catálogo visual

   El índice de precios compara ESPECIFICACIONES: «Papel tapiz» es un
   solo ítem con 289 cotizaciones, y esa es exactamente la abstracción
   que sirve para presupuestar. Pero no sirve para elegir: nadie escoge
   un papel tapiz por su mediana, lo escoge por cómo se ve.

   Así que para interiorismo hace falta el otro grano, el del ARTÍCULO
   concreto —este modelo, esta foto, este precio, esta tienda— y eso lo
   sabe este importador y nadie más: es el único punto del sistema donde
   conviven el artículo tal como lo publica el comercio y el ítem del
   catálogo al que pertenece. Sacarlo aquí evita tener que volver a
   clasificar en otro sitio con otras reglas, que es como se desincronizan
   los catálogos.

   Solo entra lo que tiene foto y es de interiorismo: sin imagen no hay nada
   que explorar visualmente.

   SE ESCRIBE EN PÁGINAS, NO EN UN ARCHIVO
   En un solo archivo son 790 KB que el navegador tiene que descargar
   ENTEROS antes de pintar la primera foto, que es exactamente lo que no
   debe pasar en una página cuya gracia es ver algo de inmediato. Van en
   páginas de 250 y el explorador pide la que necesita.
   ========================================================= */

function escribirVisual() {
  /* El ámbito se pregunta ÍTEM POR ÍTEM, no por su categoría, y esa
     distinción no es cosmética. «Pisos y revestimientos» es de los dos
     ámbitos, pero dentro lleva sesenta y dos consumibles de instalación
     —crucetas, calzos, clips, juntas de dilatación— que el catálogo saca de
     interiorismo uno por uno con sus propias reglas. Preguntando por la
     categoría, un «Clips-Calzo Espesorado 2mm» terminaba entre las lámparas
     y los mármoles.

     Por eso esto se calcula DESPUÉS de escribir el catálogo: recargándolo se
     obtienen los ítems ya con su ámbito resuelto, en vez de repetir aquí las
     reglas y arriesgar que las dos copias se separen. */
  const ambitoDeItem = {};
  const ordenCat = {};
  (function () {
    const g = { window: {} };
    const antes = global.window;
    global.window = g.window;
    delete require.cache[require.resolve(path.join(DATOS, 'datos-catalogo.js'))];
    require(path.join(DATOS, 'datos-catalogo.js'));
    (g.window.CATALOGO.items || []).forEach(i => { ambitoDeItem[i.codigo] = i.ambitos || []; });
    (g.window.CATALOGO.categorias || []).forEach((c, n) => { ordenCat[c.codigo] = n; });
    global.window = antes;
  }());

  const filas = [];
  const vistos = {};
  const anota = (a, codigoItem, cat) => {
    const img = a.imagen || '';
    if (!img) return;
    if (!(ambitoDeItem[codigoItem] || []).includes('interiorismo')) return;
    const f = a._fuente;
    const clave = f.proveedor + '|' + a.codigo;
    if (vistos[clave]) return;
    vistos[clave] = 1;
    filas.push({
      n: limpia(a.nombre).slice(0, 90),
      img: img,
      p: Math.round(precioUnidad(a) * (f.moneda === 'USD' ? TASA_USD : 1)),
      c: f.proveedor,
      u: a.url || '',
      i: codigoItem,
      k: cat
    });
  };

  nuevosOk.forEach(x => anota(x.a, codigoDe[x.spec.cat + '|' + x.spec.clave], x.spec.cat));
  existenteOk.forEach(x => anota(x.a, x.item, String(x.item).slice(0, 6)));

  /* El orden de la página: por categoría, y dentro de ella intercalando
     comercios, para que las primeras pantallas no parezcan una sola tienda.
     Se fija AQUÍ y no en el navegador porque de este orden dependen las
     páginas: la número 3 tiene que traer siempre los mismos artículos. */
  const turno = {};
  filas.forEach(v => { turno[v.c] = (turno[v.c] || 0); v._t = turno[v.c]++; });
  filas.sort((a, b) =>
    (ordenCat[a.k] - ordenCat[b.k]) || (a._t - b._t) || a.n.localeCompare(b.n));

  /* Las URL son el 63% de los bytes y casi todas empiezan igual: 977 por
     «https://mundoled.com.do/wp-content/uploads/», 535 por el CDN de
     Shopify. Un diccionario de prefijos con la referencia por número las
     encoge a la mitad. */
  const cuentaPre = {};
  const prefijoDe = u => {
    const m = String(u).match(/^https?:\/\/[^/]+\/(?:[^/]+\/){0,3}/);
    return m ? m[0] : '';
  };
  filas.forEach(v => {
    [prefijoDe(v.img), prefijoDe(v.u)].forEach(q => { if (q) cuentaPre[q] = (cuentaPre[q] || 0) + 1; });
  });
  const pre = Object.keys(cuentaPre).filter(q => cuentaPre[q] >= 3 && q.length > 18)
    .sort((a, b) => cuentaPre[b] * b.length - cuentaPre[a] * a.length).slice(0, 60);
  const idxPre = {};
  pre.forEach((q, n) => { idxPre[q] = n; });
  const corta = u => {
    const q = prefijoDe(u);
    return (q && idxPre[q] !== undefined) ? [idxPre[q], String(u).slice(q.length)] : String(u);
  };

  const comercios = [...new Set(filas.map(v => v.c))].sort();
  const idxCom = {};
  comercios.forEach((c, n) => { idxCom[c] = n; });

  /* Una fila es un arreglo y no un objeto: repetir siete nombres de campo
     2,771 veces cuesta 83 KB que no dicen nada. */
  const fila = v => [v.n, corta(v.img), v.p, idxCom[v.c], corta(v.u), v.i, v.k];

  const POR_PAGINA = 250;
  const dir = path.join(DATOS, '..', 'datos');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.readdirSync(dir).filter(f => /^visual/.test(f)).forEach(f => fs.unlinkSync(path.join(dir, f)));

  const paginas = [];
  for (let i = 0; i < filas.length; i += POR_PAGINA) {
    const trozo = filas.slice(i, i + POR_PAGINA);
    fs.writeFileSync(path.join(dir, 'visual-' + paginas.length + '.json'),
                     JSON.stringify(trozo.map(fila)));
    paginas.push({
      n: trozo.length,
      k: [...new Set(trozo.map(v => v.k))],
      c: [...new Set(trozo.map(v => idxCom[v.c]))]
    });
  }

  /* Las cifras de cada categoría y de cada comercio se calculan aquí, con
     todo delante, y viajan en el manifiesto. Así el contador —cuántos hay,
     de cuánto a cuánto, cuál es la mediana— sale exacto desde la primera
     pantalla, sin obligar a descargar las doce páginas solo para contar.
     Cuando el visitante combina filtros, lo que se cuenta es lo cargado y
     el contador lo dice. */
  const cifras = lista => {
    const v = lista.map(x => x.p).sort((a, b) => a - b);
    return { n: v.length, min: v[0], max: v[v.length - 1], med: v[v.length >> 1] };
  };
  const porCat = {}, porCom = {};
  filas.forEach(v => {
    (porCat[v.k] = porCat[v.k] || []).push(v);
    (porCom[v.c] = porCom[v.c] || []).push(v);
  });
  Object.keys(porCat).forEach(k => { porCat[k] = cifras(porCat[k]); });
  Object.keys(porCom).forEach(k => { porCom[idxCom[k]] = cifras(porCom[k]); delete porCom[k]; });

  fs.writeFileSync(path.join(dir, 'visual.json'), JSON.stringify({
    total: filas.length, porPagina: POR_PAGINA,
    pre: pre, com: comercios, pags: paginas,
    todo: cifras(filas), cat: porCat, porCom: porCom
  }));

  return { total: filas.length, paginas: paginas.length,
           /* Solo lo del explorador: en esta carpeta también viven los
              detalle-CAT.json, que son de otra cosa. */
           kb: Math.round(fs.readdirSync(dir).filter(f => /^visual/.test(f)).reduce((s, f) =>
             s + fs.statSync(path.join(dir, f)).size, 0) / 1024) };
}

if (ESCRIBIR) {
  reemplazar('datos-catalogo.js', 'items', bloqueItems());
  reemplazar('datos-precios.js', 'cotizaciones', bloqueCotizaciones());
  /* Después de los dos, y no a la vez: escribirVisual() recarga el catálogo
     para preguntarle el ámbito de cada ítem, y necesita el recién escrito. */
  const vis = escribirVisual();
  console.log('Catálogo visual: ' + vis.total + ' artículos en ' + vis.paginas +
              ' páginas (' + vis.kb + ' KB en total).');
  console.log('');
  console.log('Escrito. Ahora corre, en este orden:');
  console.log('  node herramientas/generar-datos-navegador.js');
  console.log('  node herramientas/generar-categorias.js');
} else {
  console.log('');
  console.log('Nada escrito. Corre otra vez con --escribir para aplicar.');
}
