'use strict';
/* =========================================================
   reglas-banos.js — clasificador del catálogo de baños

   Aquí la medida no es lo que identifica al artículo: un inodoro
   se identifica por marca, modelo y color, no por pulgadas. Así
   que este archivo no parsea dimensiones, decide dos cosas:

     1. Si el artículo le sirve o no a un constructor.
     2. Qué es, para poder ordenarlo en el catálogo.

   LA REGLA DE ENTRADA
   -------------------
   Entra lo que un constructor presupuesta e instala como parte
   de la obra —el equipamiento— y queda fuera el repuesto que
   compra el dueño de casa para cambiar una pieza rota.

   Un inodoro entra. Una tapa de inodoro no. Una manecilla, una
   pera, un flotador, un juego de tornillos de tanque: no. No es
   que sean malos productos, es que nadie los pone en un
   presupuesto de obra, y cada fila que no se usa le quita
   claridad a las que sí.

   OJO CON LAS CATEGORÍAS DEL COMERCIO
   -----------------------------------
   No son de fiar: hay espejos dentro de «muebles de baños»,
   botiquines LED dentro de «espejos» y barras de seguridad
   dentro de «secador de manos». Por eso todo se clasifica por el
   nombre del producto, que sí es consistente.
   ========================================================= */

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();

/* El comercio escribe todo abreviado y en mayúscula inicial.
   Solo expandimos sus abreviaturas: no se inventa nada. */
const ABREVIATURAS = [
  [/\bP\s*\/\s*/gi, 'para '], [/\bC\s*\/\s*/gi, 'con '],
  [/\bD\s*\/\s*/gi, 'de '],   [/\bS\s*\/\s*/gi, 'sin '],
  [/\bT\s*\/\s*/gi, 'tipo '],
  [/\bElong\.?(?![a-zá-ú])/gi, 'elongado'], [/\bElon\.?(?![a-zá-ú])/gi, 'elongado'],
  [/\bRed\.(?![a-zá-ú])/gi, 'redondo'], [/\bRect\.(?![a-zá-ú])/gi, 'rectangular'],
  [/\bPzas?\.?(?![a-zá-ú])/gi, 'piezas'], [/\bJgo\.?(?![a-zá-ú])/gi, 'juego'],
  [/\bIno\.?(?![a-zá-ú])/gi, 'inodoro'], [/\bInod\.?(?![a-zá-ú])/gi, 'inodoro'],
  [/\bIndoro\b/gi, 'inodoro'], [/\bBidet\b/gi, 'bidé'],
  [/\bBano\b/gi, 'baño'], [/\bBanos\b/gi, 'baños'], [/\bBanera\b/gi, 'bañera'],
  [/\bAcces?\.(?![a-zá-ú])/gi, 'accesorios'], [/\bAccs\.?(?![a-zá-ú])/gi, 'accesorios'],
  [/\bMezcl?\.(?![a-zá-ú])/gi, 'mezcladora'], [/\bMonom\.(?![a-zá-ú])/gi, 'monomando'],
  [/\bLav\.(?![a-zá-ú])/gi, 'lavamanos'], [/\bCub\.(?![a-zá-ú])/gi, 'cubierta'],
  [/\bReb\.(?![a-zá-ú])/gi, 'rebosadero'], [/\bDesag\.(?![a-zá-ú])/gi, 'desagüe'],
  [/\bGde\.(?![a-zá-ú])/gi, 'grande'], [/\bSreb\b/gi, 'sin rebosadero'],
  [/\bCreb\b/gi, 'con rebosadero'], [/\bSusp\.(?![a-zá-ú])/gi, 'suspendido'],
  [/\bMult\.(?![a-zá-ú])/gi, 'múltiple'], [/\bSenc\.(?![a-zá-ú])/gi, 'sencillo'],
  [/\bElec\.(?![a-zá-ú])/gi, 'eléctrico'], [/\bExt\.(?![a-zá-ú])/gi, 'extensible'],
  /* Los tres nombres del mismo aparato, unificados para que se busquen juntos. */
  [/^Lavabo\b/i, 'Lavamanos'], [/^Lavatorio\b/i, 'Lavamanos'], [/^Lavamano\b/i, 'Lavamanos'],
  [/\bMezc\b(?![a-zá-ú])/gi, 'Mezcladora'],
  [/\s*\/\s*/g, ' / '], [/\s*''/g, '"'], [/[”“]/g, '"'], [/[´`]/g, "'"],
  /* Medidas pegadas: "50X70" y "700X360X740" se separan como medidas, no
     como palabras, para que no queden "50 X70". */
  [/(\d)\s*[xX]\s*(\d)/g, '$1 x $2'], [/(\d)\s*[xX]\s*(\d)/g, '$1 x $2'],
  /* Una letra suelta pegada a un número suele ser parte del código del
     modelo ("1P", "3H"), así que solo se separa cuando siguen dos o más. */
  [/(\d)([A-Za-zá-ú]{2,})/g, '$1 $2'], [/\.(?=[A-Za-zá-ú])/g, '. ']
];

function normaliza(nombre) {
  let t = limpia(nombre);
  ABREVIATURAS.forEach(([re, a]) => { t = t.replace(re, a); });
  t = limpia(t).replace(/\s+([.,])/g, '$1');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* El color viene pegado dentro de la referencia: "2758BLANCO",
   "TQ1-2-MMARFIL", "KLIPENIVORY". */
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

/* ---------------------------------------------------------
   Lo que no entra: repuesto de consumidor
   --------------------------------------------------------- */
const REPUESTO = [
  /^Asiento\b/i,                       // tapa de inodoro
  /^Tapa\b/i,                          // tapa de tanque
  /^(Manecilla|Manija|Manivela)\b/i,
  /^(Pera|Flota|Flotador|Varilla)\b/i,
  /^(Push|Button|Botton|Bot[oó]n)\b/i,
  /^(Tornillos?|Set De Tornillos)\b/i,
  /^(Flush|Flust)\b/i,
  /^V[aá]lvula\b/i,
  /^Cubrefalta\b/i,
  /^Kit (De Tornillos|Valv|Rondanas|para inodoro Pera|P \/ Inodoro Pera)/i,
  /^(Vaso|Portavaso)\b/i,              // vaso de cristal: menaje, no obra
  /^Cubierta Para Papelera/i,
  /^L[aá]mpara\b/i,
  /^(Mecanismo|Repuesto|Chapet[oó]n|Palote|Pu[ñn]o)\b/i,
  /^Fitting\b/i
];

/* ---------------------------------------------------------
   Lo que sí entra, y qué es
     [patrón, tipo, categoría, unidad, etapa, alias]
   El orden importa: gana el primero que casa.
   --------------------------------------------------------- */
const TIPOS = [
  [/^Inodoro\b/i,                     'Inodoro de una pieza',     'MAT-24', 'unidad', 'instalaciones', 'inodoro, taza de baño, wc'],
  [/^Tanque\b/i,                      'Tanque de inodoro',        'MAT-24', 'unidad', 'instalaciones', 'tanque de inodoro, cisterna'],
  [/^(Basineta|Taza)\b/i,             'Basineta de inodoro',      'MAT-24', 'unidad', 'instalaciones', 'basineta, taza, cuerpo del inodoro'],
  [/^(Orinal|Mingitorio|Urinario)\b/i,'Urinario',                 'MAT-24', 'unidad', 'instalaciones', 'orinal, mingitorio, urinario'],
  [/^(Lavamanos?|Lavabo|Lavatorio)\b/i,'Lavamanos',               'MAT-25', 'unidad', 'instalaciones', 'lavamanos, lavabo, lavatorio'],
  [/^(Pedestal|Pata)\b/i,             'Pedestal para lavamanos',  'MAT-25', 'unidad', 'instalaciones', 'pedestal, pie de lavamanos'],
  [/^Palometa\b/i,                    'Palometa para lavamanos',  'MAT-25', 'unidad', 'instalaciones', 'palometa, soporte de lavamanos'],
  [/^Conector\b/i,                    'Conector de desagüe',      'MAT-25', 'unidad', 'instalaciones', 'conector, yee de desagüe'],

  [/^(Mueble|Gabinete|Vanity)\b/i,    'Mueble de baño',           'MAT-26', 'unidad', 'terminacion', 'mueble de baño, vanity, gabinete'],
  [/^Botiqu[ií]n\b/i,                 'Botiquín de baño',         'MAT-26', 'unidad', 'terminacion', 'botiquín, gabinete con espejo'],
  [/^Espejo\b/i,                      'Espejo de baño',           'MAT-26', 'unidad', 'terminacion', 'espejo de baño'],
  [/^Cabina\b/i,                      'Cabina de baño',           'MAT-26', 'unidad', 'terminacion', 'cabina de ducha, mampara'],

  [/^(Barra (De )?Seguridad|Agarradera)/i, 'Barra de seguridad',  'MAT-27', 'unidad', 'terminacion', 'barra de seguridad, agarradera, accesibilidad'],
  [/^(Barra|Columna|Cabeza|Ducha|Regadera|Brazo|Manguera|Soporte)\b/i,
                                      'Ducha',                    'MAT-09', 'unidad', 'instalaciones', 'ducha, regadera, cabezal'],
  [/^Mezc/i,                          'Mezcladora',               'MAT-09', 'unidad', 'instalaciones', 'mezcladora, grifería de ducha'],

  [/^(Toallero|Portatoallas?|Porta ?Toalle?r?o?|Porta ?Toalla)/i, 'Toallero', 'MAT-27', 'unidad', 'terminacion', 'toallero, portatoallas'],
  [/^(Portapapel|Porta ?Papel|Papelera)/i,    'Portapapel',       'MAT-27', 'unidad', 'terminacion', 'portapapel, papelera de baño'],
  [/^(Portacepillos?|Porta ?Cepillo|Cepiller[ao])/i, 'Portacepillos', 'MAT-27', 'unidad', 'terminacion', 'portacepillos, cepillera'],
  [/^(Jabonera|Dispensador|Dosificador)/i,    'Jabonera o dispensador', 'MAT-27', 'unidad', 'terminacion', 'jabonera, dispensador de jabón'],
  [/^Secador\b/i,                     'Secador de manos',         'MAT-27', 'unidad', 'terminacion', 'secador de manos'],
  [/^(Gancho|Percha)/i,               'Gancho de baño',           'MAT-27', 'unidad', 'terminacion', 'gancho, perchero de baño'],
  [/^Repisa\b/i,                      'Repisa de baño',           'MAT-27', 'unidad', 'terminacion', 'repisa de baño'],
  [/^Tendedero\b/i,                   'Tendedero',                'MAT-27', 'unidad', 'terminacion', 'tendedero retráctil'],
  [/^(Kit|Juego|Accesorios?)\b/i,     'Juego de accesorios de baño', 'MAT-27', 'juego', 'terminacion', 'juego de accesorios, kit de baño']
];

/* ---------------------------------------------------------
   La regla
   --------------------------------------------------------- */
function regla(a) {
  const n = limpia(a.nombre);
  if (REPUESTO.some(re => re.test(n))) return null;

  /* El kit de instalación del inodoro sí es de obra: es lo que el
     plomero compra por cada aparato que monta. */
  const instalacion = /^Kit (De |D \/ )?Instalaci[oó]n/i.test(n);

  const t = TIPOS.filter(x => x[0].test(n))[0];
  if (!t && !instalacion) return null;

  const [, tipo, cat, unidad, etapa, alias] = t || [null, 'Kit de instalación de inodoro', 'MAT-24', 'juego', 'instalaciones', 'kit de instalación, cera y tornillos'];
  const orden = t ? TIPOS.indexOf(t) : TIPOS.length;

  /* El nombre del comercio ya dice qué es la pieza —«Basineta Aguazul»,
     «Lavabo Santorini»— así que no se le antepone nada: prefijar el tipo
     produce cosas como «Lavamanos lavabo Aure». El tipo sirve para
     agrupar y ordenar, no para nombrar. */
  const col = color(a);
  let nombre = normaliza(n);
  if (col && nombre.toLowerCase().indexOf(col) < 0) nombre += ', ' + col;

  const detalle = [];
  if (a.marca && !/GENERICO/i.test(a.marca)) detalle.push('marca ' + a.marca);
  if (col) detalle.push('color ' + col);
  if (a.ref) detalle.push('referencia ' + a.ref);

  return {
    cat: cat,
    tipo: tipo,
    orden: orden * 100000 + Math.round(a.precio),
    clave: (tipo + '|' + nombre).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
             .replace(/[^a-z0-9]+/g, '-'),
    nombre: nombre.length > 92 ? nombre.slice(0, 89).replace(/[\s,·-]+$/, '') + '…' : nombre,
    unidad: unidad,
    esp: detalle.join(' · '),
    etapa: etapa,
    origen: 'importado',
    alias: alias
  };
}

module.exports = { regla, normaliza, TIPOS };
