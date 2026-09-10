'use strict';
/* =========================================================
   auditar-contraste.js — el contraste real, medido en el navegador

   La hoja de estilo dice de qué color es cada cosa, pero no con qué
   fondo termina encima. Este script abre cada página, busca el fondo
   opaco más cercano en el árbol y mide el contraste de todo el texto
   que se ve.

   Dos detalles que cambian el resultado:

   - Los elementos con animación de entrada («.reveal») llegan a
     media opacidad si nadie hizo scroll, y entonces todo parece
     fallar. Se fuerzan visibles antes de medir.
   - El fondo no siempre está en el propio elemento: se sube por el
     árbol hasta encontrar uno con opacidad suficiente.

   Mínimos de la WCAG: 4.5:1 de texto corriente y 3:1 cuando es
   grande (24px, o 18.66px en negrita).

   Uso:
     python3 -m http.server 8123 &
     node herramientas/auditar-contraste.js [url ...]
   ========================================================= */

const fs = require('fs');
const path = require('path');

const CHROME = process.env.CHROME_PATH
  || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.env.BASE_URL || 'http://localhost:8123';

/* Se ejecuta dentro de la página. */
const MEDIR = () => {
  const lum = c => {
    const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const rgb = s => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
  const fondo = el => {
    let n = el;
    while (n && n !== document.documentElement) {
      const b = rgb(getComputedStyle(n).backgroundColor);
      if ((b.length > 3 ? b[3] : 1) > 0.55) return b.slice(0, 3);
      n = n.parentElement;
    }
    return [255, 255, 255];
  };
  const malos = [];
  document.querySelectorAll('body *').forEach(el => {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
    const txt = Array.from(el.childNodes)
      .filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    if (txt.length < 3) return;
    const cs = getComputedStyle(el);
    const c = rgb(cs.color).slice(0, 3), b = fondo(el);
    const l1 = lum(c), l2 = lum(b);
    const r = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const px = parseFloat(cs.fontSize);
    const grande = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700);
    const min = grande ? 3 : 4.5;
    if (r < min) malos.push({
      texto: txt.slice(0, 46), ratio: +r.toFixed(2), min,
      color: cs.color, fondo: 'rgb(' + b.join(',') + ')'
    });
  });
  return malos;
};

function paginas() {
  if (process.argv.length > 2) return process.argv.slice(2);
  const raiz = path.join(__dirname, '..');
  const urls = [BASE + '/index.html'];
  fs.readdirSync(path.join(raiz, 'precios'))
    .filter(f => f.endsWith('.html')).sort()
    .forEach(f => urls.push(BASE + '/precios/' + f));
  return urls;
}

/* El repo no lleva dependencias de node: playwright-core se busca donde
   esté y, si no está, se dice cómo instalarlo en vez de reventar. */
function cargarChromium() {
  const sitios = [
    'playwright-core', 'playwright',
    path.join(__dirname, 'node_modules', 'playwright-core'),
    process.env.PLAYWRIGHT_PATH
  ].filter(Boolean);
  for (const s of sitios) {
    try { return require(s).chromium; } catch (e) { /* siguiente */ }
  }
  console.error('Falta playwright-core. Instalarlo con:\n' +
                '   npm install --no-save playwright-core\n' +
                'y apuntar CHROME_PATH al ejecutable de Chromium si no está en la ruta por defecto.');
  process.exit(2);
}

(async () => {
  const chromium = cargarChromium();
  const navegador = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const urls = paginas();
  let conFallos = 0, total = 0;
  for (const url of urls) {
    const p = await navegador.newPage({ viewport: { width: 1400, height: 1000 } });
    await p.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await p.addStyleTag({ content: '.reveal,.reveal *{opacity:1 !important;transform:none !important;transition:none !important}' });
    await p.waitForTimeout(500);
    const malos = await p.evaluate(MEDIR);
    total += malos.length;
    if (malos.length) {
      conFallos++;
      console.log('\n' + url.replace(BASE, ''));
      malos.slice(0, 12).forEach(m => console.log(
        '   %s  ratio %s (min %s)  %s sobre %s',
        JSON.stringify(m.texto), m.ratio, m.min, m.color, m.fondo));
      if (malos.length > 12) console.log('   ... y %d más', malos.length - 12);
    }
    await p.close();
  }
  await navegador.close();
  console.log(conFallos
    ? '\n%d de %d páginas con problemas de contraste (%d textos)'.replace('%d', conFallos).replace('%d', urls.length).replace('%d', total)
    : '\n' + urls.length + ' páginas · contraste ok en todo el texto visible');
  process.exit(conFallos ? 1 : 0);
})();
