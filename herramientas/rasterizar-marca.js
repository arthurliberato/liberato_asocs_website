'use strict';
/* =========================================================
   rasterizar-marca.js — las dos piezas que no pueden ser SVG

   El logotipo vive en SVG, pero hay dos sitios donde no sirve:

     og.png               WhatsApp, Facebook, X y LinkedIn no leen SVG
                          en og:image. Va a 1200x630, que es la medida
                          que esperan.
     apple-touch-icon.png iOS tampoco lo acepta para el icono de la
                          pantalla de inicio. Va a 180x180.
     isotipo-180.png      El que se incrusta en el libro de Excel: openpyxl
                          solo mete mapas de bits. Es el mismo dibujo que
                          el de iOS, pero con su propio archivo para que
                          cambiar uno no toque el otro sin querer.

   Se rasterizan con Chromium para no meter otra dependencia: el
   navegador ya está para el barrido de contraste.

     node herramientas/rasterizar-marca.js
   ========================================================= */

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DESTINOS = [path.join(RAIZ, 'assets', 'img'),
                  path.join(RAIZ, 'precios', 'assets', 'img')];
const CHROME = process.env.CHROME_PATH
  || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const MARFIL = '#f2efe2', VERDE = '#3f6e22', AMBAR = '#e89019';

function cargarChromium() {
  const sitios = ['playwright-core', 'playwright',
                  path.join(__dirname, 'node_modules', 'playwright-core'),
                  process.env.PLAYWRIGHT_PATH].filter(Boolean);
  for (const s of sitios) { try { return require(s).chromium; } catch (e) { /* siguiente */ } }
  console.error('Falta playwright-core. Instalarlo con:\n' +
                '   npm install --no-save playwright-core');
  process.exit(2);
}

const paginaOg = logo => `<!doctype html><meta charset="utf-8">
<style>
 html,body{margin:0;padding:0}
 body{width:1200px;height:630px;background:${MARFIL};display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:34px;
      font-family:Archivo,Inter,'Helvetica Neue',Helvetica,Arial,sans-serif}
 img{width:840px;height:auto}
 .regla{width:840px;height:3px;background:${AMBAR}}
 p{margin:0;font-size:27px;font-weight:600;letter-spacing:.16em;
   text-transform:uppercase;color:${VERDE}}
</style>
<img src="file://${logo}">
<div class="regla"></div>
<p>Construcción &middot; Diseño &middot; Supervisión</p>`;

const paginaIcono = iso => `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0}img{width:180px;height:180px;display:block}</style>
<img src="file://${iso}">`;

(async () => {
  const chromium = cargarChromium();
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const carpeta = DESTINOS[0];

  const og = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await og.setContent(paginaOg(path.join(carpeta, 'logo.svg')));
  await og.waitForTimeout(400);
  await og.screenshot({ path: path.join(carpeta, 'og.png') });
  await og.close();

  const icono = await b.newPage({ viewport: { width: 180, height: 180 } });
  await icono.setContent(paginaIcono(path.join(carpeta, 'isotipo.svg')));
  await icono.waitForTimeout(300);
  await icono.screenshot({ path: path.join(carpeta, 'apple-touch-icon.png') });
  await icono.screenshot({ path: path.join(carpeta, 'isotipo-180.png') });
  await icono.close();

  await b.close();

  /* La segunda carpeta es copia: el subdominio se publica por separado. */
  for (const f of ['og.png', 'apple-touch-icon.png', 'isotipo-180.png']) {
    fs.copyFileSync(path.join(DESTINOS[0], f), path.join(DESTINOS[1], f));
  }
  console.log('Escritos og.png (1200x630), apple-touch-icon.png e isotipo-180.png en las dos carpetas.');
})();
