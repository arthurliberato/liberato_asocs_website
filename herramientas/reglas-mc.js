'use strict';
/* =========================================================
   reglas-mc.js — Ferretería MC (Mercantil del Caribe)

   Esta fuente no es una extracción de catálogo: son dos
   cotizaciones formales que el comercio emitió a nombre de
   Ingenieros Liberato & Asociados. Eso cambia dos cosas y las
   dos importan.

   1. EL ITBIS ES UN DATO, NO UN SUPUESTO.
      La cotización trae la columna aparte: precio, ITBIS y
      total. Es la primera fuente del catálogo donde no hay que
      asumir nada — el precio va con `itbis: false` porque lo
      dice el documento.

   2. EL CABLE SE VENDE POR PIE.
      La unidad de medida de las líneas de alambre THHN es «PI».
      Era la pregunta abierta desde las colecciones de Max, que
      no publican unidad: los RD$ 16 de un THHN #12 son por pie.
      Ahora está confirmado por un comercio que lo factura así.

   LO QUE ESTA COTIZACIÓN ENSEÑA SOBRE DÓNDE PARTIR UN ÍTEM
   -------------------------------------------------------
   Es un comercio itemizando de verdad, y confirma línea por
   línea los ejes que el catálogo ya usaba:

   · «TUBO PVC 1 1/2X19» aparece TRES veces, y lo único que las
     separa es la referencia: SDR41 a RD$ 337.80, SDR26 a
     RD$ 496.60 y SCH40 a RD$ 898.00. La norma es el ítem.
   · «REDUCCION BUSHING PVC 2x1/2» aparece dos veces: DRENAJE a
     RD$ 12.26 y PRESION a RD$ 26.14. Drenaje y presión son dos
     ítems, no dos marcas.
   · «PERFIL CUADRADO GALV 1 1/2x20» aparece dos veces, 1.2 mm y
     1.6 mm. La pared del tubo es el ítem.
   · «ABRAZADERA P/MALLA 1 1/2"» aparece dos veces, CORTA y
     LARGA.

   Y confirma lo contrario también: el color del alambre THHN
   —blanco, amarillo, negro— va en la descripción de cada línea
   y nunca abre una línea nueva. El calibre sí. La marca tampoco:
   la misma unión universal está cotizada con ERA y con AQUAVITA,
   y lo que las separa es SCH80 contra SCH40.
   ========================================================= */

const PLOM = require('./especificacion-plomeria.js');
const ELEC = require('./especificacion-electricos.js');

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();
const baja = s => limpia(s).toLowerCase();

const MOTIVO = { valor: '' };

/* Medidas que esta cotización trae y el catálogo todavía no, porque el
   comercio del que salieron esas familias no las vende. No se inventan aquí:
   crearlas es trabajo del importador que genera esa familia, y mientras tanto
   la línea se descarta diciendo cuál falta. */
const SIN_ITEM = {
  '#MAT-19|perfil-cuadrado-galvanizado-2x2-1.5': true,
  '#MAT-19|perfil-cuadrado-galvanizado-4x4-2.2': true,
  '#MAT-19|perfil-cuadrado-negro-1x1-1.6': true,
  '#MAT-22|accesorio-abrazadera-1.25larga': true,
  '#MAT-22|accesorio-copa-pasante-1.25x2': true,
  '#MAT-22|accesorio-brazo-2x1.5sencillo': true,
  '#MAT-20|angular-1.5x0.125': true
};

/* Pulgadas escritas como el oficio: 1/2, 3/4, 1 1/2. */
function pulg(t) {
  const s = limpia(t).replace(/"/g, '');
  let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (m) return parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
  m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m) return parseInt(m[1], 10) / parseInt(m[2], 10);
  m = s.match(/^(\d+(?:\.\d+)?)$/);
  return m ? parseFloat(m[1]) : null;
}
const med = t => { const v = pulg(t); return v === null ? '' : PLOM.comoPulgada(v); };
/* Para las claves de Ochoa, que usan el número decimal: 1.5, 0.75. */
const dec = t => { const v = pulg(t); return v === null ? '' : String(Math.round(v * 10000) / 10000); };

/* =========================================================
   Correspondencias con ítems que ya existen
   =========================================================
   Se resuelven por patrón porque la cotización es regular: cada
   línea trae la medida en la descripción y el resto en la
   referencia. Las claves con # son de ítems que genera el
   importador y cuyo código se corre. */

function existente(a) {
  const n = limpia(a.nombre).toUpperCase();
  const ref = limpia(a.ref).toUpperCase();
  let m;

  /* Varilla corrugada grado 60. */
  m = n.match(/^VARILLA\s+([\d/ ]+)X20/);
  if (m) {
    const d = dec(m[1]);
    const cod = { '0.375': 'MAT-04-001', '0.5': 'MAT-04-002', '0.625': 'MAT-04-003',
                  '0.75': 'MAT-04-004', '1': 'MAT-04-005' }[d];
    if (cod) return cod;
    MOTIVO.valor = 'diámetro de varilla que el catálogo no tiene'; return null;
  }

  /* Malla electrosoldada en rollo. */
  m = n.match(/^MALLA ELECT\/S\s+D([\d.]+)XD[\d.]+X(\d+)X(\d+)/);
  if (m) {
    const cod = { 'D2.3|10': 'MAT-04-008', 'D2.3|15': 'MAT-04-009', 'D2.3|20': 'MAT-04-010',
                  'D2.5|10': 'MAT-04-011', 'D2.5|15': 'MAT-04-012', 'D2.5|20': 'MAT-04-013',
                  'D2.7|10': 'MAT-04-014', 'D2.7|15': 'MAT-04-015',
                  'D2.9|10': 'MAT-04-016', 'D2.9|15': 'MAT-04-017', 'D2.9|20': 'MAT-04-018'
                }['D' + m[1] + '|' + m[2]];
    if (cod) return cod;
    MOTIVO.valor = 'calibre o retícula de malla que el catálogo no tiene'; return null;
  }

  /* Malla ciclónica: alto x rollo de 50 pies, por calibre. */
  m = n.match(/^MALLA CICLONICA\s+(\d+)\s*X\s*50\s+C-?(\d+)/);
  if (m) return '#MAT-22|malla-ciclonica-' + m[2] + '-' + m[1];

  /* Perfil cuadrado, negro o galvanizado, por pared. */
  m = n.match(/^PERFIL CUADRADO\s+(GALV|NEGRO)\s+([\d/ ]+?)\s*(?:X\s*([\d/ ]+?))?\s*X?\s*20\s*$/);
  if (m) {
    const acabado = m[1] === 'GALV' ? 'galvanizado' : 'negro';
    const lado = dec(m[2]);
    const pared = (ref.match(/([\d.]+)\s*MM/) || [])[1];
    if (lado && pared) return '#MAT-19|perfil-cuadrado-' + acabado + '-' + lado + 'x' + lado + '-' + parseFloat(pared);
  }

  /* Angular de acero: ala por espesor. */
  m = n.match(/^ANGULAR\s+([\d/ ]+?)\s*X\s*([\d/ ]+?)\s*X\s*20/);
  if (m) {
    const ala = dec(m[1]), esp = dec(m[2]);
    if (ala && esp) return '#MAT-20|angular-' + ala + 'x' + esp;
  }

  /* Tubo para malla ciclónica. */
  m = n.match(/^TUBO PARA MALLA\s+([\d/ ]+?)\s*X\s*(\d+)/);
  if (m) return '#MAT-22|tubo-malla-' + dec(m[1]) + '-' + m[2];

  /* Accesorios de malla. Ochoa los llama «brazo» y aquí «palometa»; es la
     misma pieza, y ya quedó dicho al importar InnovaCentro. */
  m = n.match(/^ABRAZADERA P\/MALLA\s+([\d/" ]+)/);
  if (m) {
    const largo = /LARGA/.test(ref) ? 'larga' : 'corta';
    return '#MAT-22|accesorio-abrazadera-' + dec(m[1]) + largo;
  }
  m = n.match(/^COPA (PASANTE|FINAL|TERMINAL|TENSORA|BARANDAL) P\/MALLA\s+([\d/" ]+?)(?:\s*X\s*([\d/" ]+))?\s*$/);
  if (m) {
    const tipo = m[1] === 'FINAL' ? 'terminal' : m[1].toLowerCase();
    if (tipo === 'barandal') { MOTIVO.valor = 'la copa de barandal no tiene ítem en el catálogo'; return null; }
    if (!m[3]) return '#MAT-22|accesorio-copa-' + tipo + '-' + dec(m[2]);
    /* La copa pasante lleva dos medidas y cada comercio las escribe en el
       orden que quiere: Ochoa pone «1 1/4 x 1 1/2» y MC «1 1/2 x 1 1/4». Es la
       misma pieza. Se ordenan de menor a mayor para que caigan en la misma
       fila; ya nos había pasado con InnovaCentro. */
    const p = [parseFloat(dec(m[2])), parseFloat(dec(m[3]))].sort((x, y) => x - y);
    return '#MAT-22|accesorio-copa-' + tipo + '-' + p[0] + 'x' + p[1];
  }
  m = n.match(/^PALOMETA\s+\w*\s*P\/MALLA\s+([\d/" ]+?)\s*X\s*([\d/" ]+)/);
  if (m) {
    const forma = /DOBLE/.test(ref) ? 'doble' : 'sencillo';
    return '#MAT-22|accesorio-brazo-' + dec(m[1]) + 'x' + dec(m[2]) + forma;
  }

  /* Cable THHN. El catálogo lo lleva por rollo de 100 pies y la cotización
     por pie: se multiplica y la nota lo deja dicho. */
  m = n.match(/^ALAMBRE THHN \(AWG\)\s+#?(\d+)\b/);
  if (m) {
    const cod = { '12': 'MAT-10-001', '10': 'MAT-10-002', '8': 'MAT-10-003' }[m[1]];
    if (cod) return cod;
  }
  return undefined;
}

/* =========================================================
   Familias
   ========================================================= */

function regla(a) {
  MOTIVO.valor = '';
  const n = limpia(a.nombre).toUpperCase();
  const ref = limpia(a.ref).toUpperCase();
  let m;

  const ya = existente(a);
  if (ya && SIN_ITEM[ya]) {
    MOTIVO.valor = 'medida que el catálogo no tiene todavía en esa familia (' + ya.split('|')[1] + ')';
    return null;
  }
  if (ya) return { existente: ya, factorUnidad: factor(a) };
  if (ya === null) return null;

  /* ---- Tubo PVC ---- */
  m = n.match(/^TUBO PVC\s+([\d/ ]+?)\s*X\s*(\d+)\s*$/);
  if (m) {
    const norma = (ref.match(/(SDR-?\d+|SCH-?\d+)/) || [])[1];
    if (!norma) { MOTIVO.valor = 'la línea no declara la norma del tubo'; return null; }
    return PLOM.item('tubo', {
      material: 'PVC', norma: norma.replace(/^(SDR|SCH)-?/, '$1-'),
      diametro: med(m[1]), largo_pies: parseInt(m[2], 10)
    });
  }

  /* ---- Unión universal ---- */
  m = n.match(/^UNION UNIVERSAL PVC\s+([\d/ ]+)$/);
  if (m) {
    /* La SCH80 es otra pared y otro precio: RD$ 83.29 contra RD$ 41.92 en la
       misma pulgada. La marca no las separa; la cédula sí. */
    const material = /SCH\s*80/.test(ref) ? 'PVC SCH-80' : 'PVC';
    return PLOM.item('conexion', { tipo: 'union-universal', material: material, medida: med(m[1]) });
  }

  /* ---- Reducción bushing ---- */
  m = n.match(/^REDUCCION BUSH(?:ING)?\s+PVC\s+(?:DRENAJ\w*\s+)?([\d/ ]+?)\s*X\s*([\d/ ]+)$/);
  if (m) {
    const material = /DRENAJ/.test(ref + ' ' + n) ? 'PVC drenaje' : 'PVC presión';
    return PLOM.item('conexion', {
      tipo: 'reduccion-bushing', material: material,
      medida: med(m[1]) + ' x ' + med(m[2])
    });
  }

  /* ---- Codo conduit ---- */
  m = n.match(/^CODO CONDUIT PVC\s+([\d/ ]+)$/);
  if (m) return ELEC.item('conexion-conduit', { tipo: 'codo', medida: med(m[1]) });

  /* ---- Cable THHN y cable de goma, por rollo de 100 pies ---- */
  m = n.match(/^ALAMBRE THHN \(AWG\)\s+#?([\d/]+)\b/);
  if (m) return ELEC.item('cable-thhn', { calibre: m[1] });
  m = n.match(/^ALAMBRE DE GOMA\s+(?:\(AWG\)\s+|AWG\s+)?([\d.]+(?:MM)?)\s*\/\s*(\d+)/);
  if (m) return ELEC.item('cable-goma', { calibre: m[1].replace('MM', ' mm'), conductores: parseInt(m[2], 10) });

  MOTIVO.valor = 'línea de la cotización que no corresponde a ninguna familia del catálogo';
  return null;
}

/* El cable se cotiza por pie y el catálogo lo lleva por rollo de 100 pies. */
function factor(a) {
  if (a.unidad !== 'pie') return undefined;
  return { veces: 100, nota: 'La cotización va por pie y el ítem por rollo de 100 pies' };
}

module.exports = { regla, factor, MOTIVO };
