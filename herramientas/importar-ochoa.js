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
      esp: 'Acero al carbono liso · sección ' + forma + ' de ' + pulg(l) +
           (tor ? ' · rectificada a medida' : '') + ' · barra de 20 pies',
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
        esp: 'Pieza de remate para cumbrera de techo de zinc · calibre ' + z[1] +
             ' · ' + z[2] + ' pies',
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
        esp: 'Canal de desagüe para techo de aluzinc · ' + pulg(d1) + ' x ' + pulg(d2) +
             ' · tramo de ' + z[3] + ' pies',
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
        esp: 'Pletina de acero inoxidable · ' + pulg(w1) + ' x ' + pulg(w2) +
             ' · barra de ' + z[3] + ' pies',
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
      esp: 'Lámina galvanizada ' + tipo + ' calibre ' + cal + ' · ' + an.t + ' x ' + la.t + ' pies',
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
        esp: 'Acero al carbono con acabado galvanizado · calibre ' + m[1],
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
        esp: 'Alambre galvanizado cortado a medida para amarre · caja de ' + k[1] + ' libras',
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
        esp: 'Alambre liso galvanizado cortado para amarre · calibre ' + cal[1] +
             ' · paquete de ' + k[1] + ' libras',
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
        esp: 'Alambre galvanizado con púas entrelazadas · ' +
             (porMm ? m[1] + ' mm de diámetro' : 'calibre ' + m[1]) + ' · rollo de ' + m[2] + ' metros',
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
        esp: 'Malla de alambre galvanizado tejido en rombo · calibre ' + cal +
             (pvc ? ' con revestimiento de PVC' : '') + ' · ' + m[2] +
             ' pies de alto · rollo de ' + m[3] + ' pies',
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
        esp: 'Poste tubular galvanizado para cerramiento · ' + pulg(l) + ' · tramo de ' + m[2] + ' pies',
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
        esp: 'Silleta plástica para mantener el recubrimiento del acero · ' + pulg(l),
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
        esp: 'Empalme mecánico roscado para varilla de refuerzo · ' + pulg(l) +
             ' · serie Q' + m[1] + ' (' + m[1] + ' mm)',
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
        esp: 'Lámina expandida de acero · rombo de ' + pulg(l) + ' · plancha de ' +
             m[1] + ' x ' + m[2] + ' pies',
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
        esp: 'Refuerzo disperso para losas y pisos industriales · funda de ' + k[1] + ' kg',
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
        esp: 'Malla hexagonal galvanizada · calibre ' + m[1] + ' · ' + alto.t +
             ' pies de alto · rollo de ' + parseInt(p[1], 10) + ' pies',
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
      esp: 'Malla de alambre tejido en cuadro · calibre ' + m[1] + ' · retícula ' +
           pulg(x) + ' x ' + pulg(y) + ' · ' + alto.t + ' pies de alto · rollo de ' +
           parseInt(p[3], 10) + ' pies',
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
      esp: 'Pigmento en polvo para granito fundido y mosaico · ' + color + ' ' + grado +
           ' · presentación de ' + libras + ' libras',
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
      esp: 'Agregado ensacado para obra menor y reparaciones · ' +
           (l ? 'granulometría ' + pulg(l) + ' · ' : '') + 'funda de ' + m[1] + ' libras',
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
        esp: 'Masilla en polvo para alisar paredes interiores · funda de ' + m[1] + ' libras',
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
        esp: 'Yeso de construcción a granel, despachado por libra',
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
      esp: 'Yeso de construcción para plafones y terminación · funda de ' + m[1] + ' libras',
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
      esp: 'Cemento blanco en presentación menuda, para detalles y reparaciones · ' +
           m[1] + ' libras',
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
      esp: 'Cemento gris en presentación menuda, para reparaciones · ' + m[1] + ' libras',
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

    const TIPOS = {
      'aluminio/angulares':  ['Angular de aluminio',        'Perfil L de aluminio',            'angular de aluminio, perfil L'],
      'aluminio/planchuela': ['Planchuela de aluminio',     'Pletina de aluminio',             'pletina de aluminio, planchuela'],
      'aluminio/tubos':      ['Tubo redondo de aluminio',   'Tubería redonda de aluminio',     'tubo de aluminio'],
      'aluminio/barras':     ['Barra de aluminio',          'Barra maciza de aluminio',        'barra de aluminio'],
      'aluminio/perfiles':   ['Perfil de aluminio',         'Perfil tubular de aluminio',      'perfilería de aluminio'],
      'aluminio/molduras':   ['Moldura U de aluminio',      'Moldura en U de aluminio',        'moldura U, canal de aluminio']
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
      esp: t[1] + ' extruido · ' + medida + ' · tramo de 19.20 pies',
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
      esp: 'Herraje galvanizado de cerramiento · ' + medida + (variante ? ' ·' + variante : ''),
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

const FUENTES = [
  {
    archivo: FUENTE,
    etiqueta: 'materiales de construcción',
    motivo: 'la ficha no declara la medida',
    regla: a => {
      const r = REGLAS[a.cat2 + '/' + a.cat3];
      return r ? r(a) : undefined;              // undefined = familia sin regla, ni se cuenta
    }
  },
  {
    archivo: path.join(__dirname, 'datos-externos/ochoa-banos-2026-09-09.json'),
    etiqueta: 'baños',
    motivo: 'repuesto de consumidor, no equipamiento de obra',
    regla: a => BANOS.regla(a) || null
  }
];

/* Ochoa cotiza algunas barras POR PIE; la unidad completa son 20 pies,
   como dice su propia nota de facturación. */
const precioUnidad = a => a.unidad === 'PIE' ? a.precio * PIES_POR_UNIDAD : a.precio;

const aExistente = [];
const nuevos = [];
const descartados = [];
const totales = [];

FUENTES.forEach(fuente => {
  const articulos = JSON.parse(fs.readFileSync(fuente.archivo, 'utf8'));
  const conPrecio = articulos.filter(a => typeof a.precio === 'number' && a.precio > 0);
  let dentro = 0, fuera = 0;

  conPrecio.forEach(a => {
    if (MAPEO[a.codigo]) { aExistente.push({ a, item: MAPEO[a.codigo] }); dentro++; return; }
    const spec = fuente.regla(a);
    if (spec === undefined) return;                       // familia sin regla
    if (!spec) { descartados.push({ a, motivo: fuente.motivo }); fuera++; return; }
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

if (ESCRIBIR) {
  reemplazar('datos-catalogo.js', 'items', bloqueItems());
  reemplazar('datos-precios.js', 'cotizaciones', bloqueCotizaciones());
  console.log('');
  console.log('Escrito. Ahora corre: node herramientas/generar-categorias.js');
} else {
  console.log('');
  console.log('Nada escrito. Corre otra vez con --escribir para aplicar.');
}
