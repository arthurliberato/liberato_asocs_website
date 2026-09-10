'use strict';
/* =========================================================
   prueba-medidor.js — el medidor de avance, con valores

       node herramientas/prueba-medidor.js

   El único proyecto que hay tiene el avance pendiente, así que la
   ficha real solo enseña el caso vacío. Esto escribe una página con
   ocho casos —de 0 a 100%, de dos a siete niveles— para poder mirar
   los que importan. Sin esto, el medidor lleno se habría publicado
   sin que nadie lo viera.

   Reusa la función del generador, no una copia: si el dibujo cambia,
   la prueba cambia con él.

   Escribe prueba-medidor.html en la raíz, que está en .gitignore: es
   una herramienta de taller, no una página del sitio.
   ========================================================= */
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
global.window = global;
require(path.join(RAIZ, 'assets/js/proyectos-venta.js'));

const CASOS = [
  { avance: 0,   etapa: 'preliminares',  niveles: 4, nota: 'recién empezada' },
  { avance: 18,  etapa: 'cimentacion',   niveles: 4, nota: 'cimentación' },
  { avance: 47,  etapa: 'estructura',    niveles: 4, nota: 'estructura' },
  { avance: 72,  etapa: 'instalaciones', niveles: 4, nota: 'instalaciones' },
  { avance: 96,  etapa: 'terminacion',   niveles: 4, nota: 'casi lista' },
  { avance: 100, etapa: 'entrega',       niveles: 4, nota: 'entregada' },
  { avance: 55,  etapa: 'mamposteria',   niveles: 2, nota: 'dos niveles' },
  { avance: 40,  etapa: 'estructura',    niveles: 7, nota: 'siete niveles' },
];

/* Se reusa el generador de verdad, no una copia. */
const src = fs.readFileSync(path.join(RAIZ, 'herramientas/generar-proyectos-venta.js'), 'utf8');
const i = src.indexOf('const LIENZO'), j = src.indexOf("/* ---------- las piezas ----------");
const trozo = src.slice(i, j).replace(/\bconst (LIENZO|siluetaEdificio|medidorAvance)/g, 'var $1');
const esc = (t) => String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const ETAPAS = global.ETAPAS_OBRA;
const medidor = new Function('esc', 'ETAPAS', trozo + '; return medidorAvance;')(esc, ETAPAS);

const bloques = CASOS.map((c, n) => {
  const p = Object.assign({ slug: 'p' + n }, c);
  return `<section><h3>${c.nota} — ${c.avance}% · ${c.etapa} · ${c.niveles} niveles</h3>${medidor(p)}</section>`;
}).join('\n');

fs.writeFileSync(path.join(RAIZ, 'prueba-medidor.html'),
`<!doctype html><meta charset="utf-8"><title>Prueba del medidor</title>
<link rel="stylesheet" href="assets/css/styles.css">
<style>body{padding:2rem;max-width:760px;margin:0 auto}h3{font:600 .8rem/1 Jost,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#62685a;margin:2rem 0 .7rem}</style>
${bloques}`);
console.log('prueba-medidor.html con %d casos', CASOS.length);
