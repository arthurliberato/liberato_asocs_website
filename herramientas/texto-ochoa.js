'use strict';
/* =========================================================
   texto-ochoa.js — el nombre del artículo, legible

   Ochoa escribe los nombres abreviados y con mayúscula en cada
   palabra: «Basineta Elong. Ceres», «Cable Telef. 2X18 Awg».
   Aquí solo se expanden SUS abreviaturas y se separan medidas
   pegadas. No se inventa nada ni se corrige su criterio: si la
   ficha dice 4.8 lpd, sale 4.8 lpd.

   Cada extracción añade las abreviaturas de su rubro; las de
   abajo son las que se repiten en todas.
   ========================================================= */

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();

const COMUNES = [
  [/\bP\s*\/\s*/gi, 'para '], [/\bC\s*\/\s*/gi, 'con '],
  [/\bD\s*\/\s*/gi, 'de '],   [/\bS\s*\/\s*/gi, 'sin '],
  [/\bT\s*\/\s*/gi, 'tipo '],
  [/\bExt\.(?![a-zá-ú])/gi, 'exterior'], [/\bInt\.(?![a-zá-ú])/gi, 'interior'],
  [/\bSup\.(?![a-zá-ú])/gi, 'superficie'], [/\bInalam\.(?![a-zá-ú])/gi, 'inalámbrico'],
  [/\bBco\.?(?![a-zá-ú])/gi, 'blanco'], [/\bNeg\.(?![a-zá-ú])/gi, 'negro'],
  [/\bSenc\.(?![a-zá-ú])/gi, 'sencillo'], [/\bMult\.(?![a-zá-ú])/gi, 'múltiple'],
  [/\bElec\.(?![a-zá-ú])/gi, 'eléctrico'], [/\bTelef\.(?![a-zá-ú])/gi, 'telefónico'],
  [/\bProx\.(?![a-zá-ú])/gi, 'proximidad'], [/\bMovimi\.(?![a-zá-ú])/gi, 'movimiento'],
  [/\bAlim\.(?![a-zá-ú])/gi, 'alimentación'], [/\bTecn\.(?![a-zá-ú])/gi, 'tecnología'],
  [/\bDisp\.(?![a-zá-ú])/gi, 'dispositivo'],
  [/\s*\/\s*/g, ' / '], [/\s*''/g, '"'], [/[”“]/g, '"'], [/[´`]/g, "'"],
  /* Medidas pegadas: "50X70" y "700X360X740" se separan como medidas y no
     como palabras, para que no queden "50 X70". Se pasa dos veces porque
     una sola no alcanza cuando hay tres factores seguidos. */
  [/(\d)\s*[xX]\s*(\d)/g, '$1 x $2'], [/(\d)\s*[xX]\s*(\d)/g, '$1 x $2'],
  /* Una letra suelta pegada a un número suele ser parte del código del
     modelo ("1P", "4K"), así que solo se separa cuando siguen dos o más. */
  [/(\d)([A-Za-zá-ú]{2,})/g, '$1 $2'], [/\.(?=[A-Za-zá-ú])/g, '. ']
];

function normaliza(nombre, propias) {
  let t = limpia(nombre);
  (propias || []).concat(COMUNES).forEach(([re, a]) => { t = t.replace(re, a); });
  t = limpia(t).replace(/\s+([.,])/g, '$1');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* Clave estable para agrupar cotizaciones del mismo producto. */
const clave = s => String(s).toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* El color viene pegado dentro de la referencia: "2758BLANCO", "KLIPENIVORY". */
const COLORES = [
  ['BLANCA', 'blanca'], ['BLANCO', 'blanco'], ['MARFIL', 'marfil'], ['NEGRO', 'negro'],
  ['NEGRA', 'negra'], ['IVORY', 'marfil'], ['BEIGE', 'beige'], ['GRIS', 'gris'],
  ['BONE', 'hueso'], ['DORADO', 'dorado'], ['ORO', 'dorado'], ['PLATA', 'plata'],
  ['BRONCE', 'bronce'], ['NIQUEL', 'níquel'], ['CROMO', 'cromo']
];
function color(a) {
  const r = String(a.ref || '').toUpperCase();
  for (const [k, v] of COLORES) if (r.indexOf(k) >= 0) return v;
  return '';
}

/* Nombre corto para el catálogo: el sitio los muestra en tabla. */
function recorta(nombre, max) {
  max = max || 92;
  return nombre.length > max ? nombre.slice(0, max - 3).replace(/[\s,·-]+$/, '') + '…' : nombre;
}

module.exports = { limpia, normaliza, clave, color, recorta };
