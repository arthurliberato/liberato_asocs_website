'use strict';
/* =========================================================
   reglas-iberica.js — el catálogo de tienda.laiberica.com.do

   La Ibérica es el tercer comercio de baldosas y el segundo
   especializado, después de CerArte. Cubre lo mismo: cerámica,
   porcelanato, baños, grifería, adhesivos y complementos de
   colocación.

   LO QUE NO DECLARA
   -----------------
   El uso de la baldosa. Solo 87 de sus 478 piezas caen en las
   categorías «Pisos» y «Paredes»; las otras 391 viven en
   «CERAMICA» y «DECORADO», que mezclan formatos de piso y de
   pared sin distinguirlos. Se aplica la misma regla que en
   CerArte —y por la misma medición: dentro de un mismo
   (material, formato) el uso mueve la mediana hasta 1.9x— así
   que las que no lo declaran quedan fuera con el motivo dicho.

   Tampoco declara si el precio lleva ITBIS: su propia nota de
   extracción dice que la web no lo desglosa. Va con el supuesto
   de mostrador, como Ochoa.

   LA MEDIDA VIENE LIMPIA
   ----------------------
   La extracción trae el formato en su columna («60×120», con el
   signo × de multiplicar, no una equis) y la presentación en
   otra («25 Lb», «250/1»). Eso ahorra adivinar dentro del
   nombre, que es de donde salen casi todos los errores de los
   otros catálogos.
   ========================================================= */

const BALDOSAS = require('./especificacion-baldosas.js');
const BANOS = require('./especificacion-banos.js');
const PLOM = require('./especificacion-plomeria.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

const texto = a => baja(a.nombre)
  .replace(/\bp\s*\/\s*/g, 'para ').replace(/\bc\s*\/\s*/g, 'con ')
  .replace(/\bs\s*\/\s*/g, 'sin ').replace(/\s+/g, ' ').trim();

/* «60×120» con el signo de multiplicar; también admite la equis. */
function partes(medida) {
  const m = String(medida || '').replace(/×/g, 'x').match(/^\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
}

const LIBRA_KG = 0.45359237;

/* =========================================================
   Categorías que no entran, y por qué
   ========================================================= */

/* SOBRE LOS TOPES, que es lo que hay en los grupos «Marmolero»

   Aquí decía que la encimera «se cotiza por trabajo, no por partida de
   catálogo», y eso no era exacto: esta tienda SÍ publica precio fijo por
   material y por color, treinta y cuatro topes de cuarzo, granito, mármol y
   Neolith, con los precios ordenados por material como uno esperaría.

   Lo que falta es la unidad, y sin ella el número no significa nada. «Tope
   Cuarzo Bianchissimo Pulido 2cm · RD$ 24,001» no dice si son 24 mil pesos
   la plancha, el metro cuadrado o el pie lineal, y entre la primera y la
   segunda lectura hay cinco veces de diferencia.

   La evidencia interna apunta a la plancha: los diez Neolith son los únicos
   que traen medida —3200×1600×12, unos 5 m²— y salen entre RD$ 5,300 y
   RD$ 6,400 el metro cuadrado. Leídos como plancha, el cuarzo, el granito y
   el mármol caen en esa misma banda; leídos como metro cuadrado, el cuarzo
   saldría cuatro veces por encima del Neolith, que es el material más caro
   de los cuatro. Apunta, pero no lo dice.

   Se consultó y se decidió esperar: topes se queda vacío hasta conseguir una
   lista de una marmolería que declare la unidad. Es la misma regla que dejó
   fuera el alambre de Bellón —casi seguro no es una unidad— y por la misma
   razón. Cuando llegue esa lista, lo único que hay que cambiar aquí es esto. */
const FUERA = {
  Accesorios: 'accesorio suelto de baño; el catálogo compara juegos, no piezas sueltas',
  'Marmolero Mosaicos': 'la ficha del tope no declara si el precio es por plancha, por metro cuadrado o por pie lineal',
  'Marmolero Cuarzo': 'la ficha del tope no declara si el precio es por plancha, por metro cuadrado o por pie lineal',
  'Marmolero Neolith': 'la ficha del tope no declara si el precio es por plancha, por metro cuadrado o por pie lineal',
  'Marmolero Granito': 'la ficha del tope no declara si el precio es por plancha, por metro cuadrado o por pie lineal',
  'Marmolero Marmol': 'la ficha del tope no declara si el precio es por plancha, por metro cuadrado o por pie lineal',
  'Piedras Naturales': 'piedra natural cortada a medida, no baldosa de formato de catálogo'
};

const TILE = new Set(['CERAMICA', 'Pisos', 'Paredes', 'DECORADO', 'Neolith', 'Mosaicos']);

/* =========================================================
   Baldosas
   ========================================================= */

function material(a) {
  const t = baja(a.nombre + ' ' + a.familia + ' ' + a.cat1);
  if (/porcelan|\bgres\b|neolith/.test(t)) return 'porcelanato';
  if (/ceramic|azulejo|revestimiento|pavimento|piso|pared|decorado|mosaico/.test(t)) return 'ceramica';
  return null;
}

function uso(a) {
  const c = baja(a.cat1 + ' ' + a.cat2 + ' ' + a.cat3);
  if (/pared|revestimiento/.test(c)) return 'pared';
  if (/piso|pavimento/.test(c)) return 'piso';
  const d = baja(a.info);
  const piso = /\bpiso|pavimento|suelo/.test(d);
  const pared = /\bpared|revestimiento|muro|azulejo/.test(d);
  if (piso && pared) return 'piso y pared';
  if (piso) return 'piso';
  if (pared) return 'pared';
  return null;
}

function reglaBaldosa(a) {
  const t = texto(a);
  if (/^zocalo|^rodapie/.test(t)) {
    const mat = /marmol/.test(t) ? 'mármol' : /porcelan/.test(t) ? 'porcelanato' : /ceramic|quarry/.test(t) ? 'cerámica' : null;
    if (!mat) { MOTIVO.valor = 'la ficha no declara el material del rodapié'; return null; }
    return BALDOSAS.item('rodapie', { material: mat });
  }
  const p = partes(a.medida);
  if (!p) { MOTIVO.valor = 'la ficha no declara el formato de la pieza'; return null; }
  const f = BALDOSAS.formato(p[0], p[1]);
  if (!f) { MOTIVO.valor = 'la ficha no declara el formato de la pieza'; return null; }

  if (/^mosaico|^malla/.test(t)) return BALDOSAS.item('mosaico', { formato: f });
  if (/^peldano|^escalon/.test(t)) return BALDOSAS.item('peldano', { formato: f });

  const mat = material(a);
  if (!mat) { MOTIVO.valor = 'la ficha no declara si es cerámica o porcelanato'; return null; }
  const u = uso(a);
  if (!u) { MOTIVO.valor = 'la ficha no declara si la pieza es de piso o de pared'; return null; }
  return BALDOSAS.item('baldosa', { material: mat, uso: u, formato: f });
}

/* =========================================================
   Complementos de colocación
   ========================================================= */

function reglaComplemento(a) {
  const t = texto(a);

  if (/^cruceta|^espaciador/.test(t)) {
    const e = String(a.medida || t).match(/(\d+(?:\.\d+)?)\s*mm/i);
    const q = String(a.presentacion || a.nombre).match(/(\d+)\s*\/\s*1/);
    if (!e || !q) { MOTIVO.valor = 'la ficha no declara el espesor o cuántas trae la funda'; return null; }
    return BALDOSAS.item('cruceta', { espesor_mm: parseFloat(e[1]), piezas: parseInt(q[1], 10) });
  }

  if (/^clip|^cuna|^tenaza|^alicate/.test(t)) {
    if (/tenaza|alicate/.test(t)) return BALDOSAS.item('herramienta-ceramica', { tipo: 'alicate' });
    const e = String(a.medida || t).match(/(\d+(?:\.\d+)?)\s*mm/i);
    if (!e) { MOTIVO.valor = 'la ficha no declara el espesor de junta del nivelador'; return null; }
    const pieza = /cuna/.test(t) ? 'cuna' : /calzo/.test(t) ? 'calzo' : 'clip';
    /* Cuántos trae la funda, igual que en la cruceta de arriba. */
    const q = String(a.presentacion || a.nombre).match(/(\d+)\s*\/\s*1/);
    return BALDOSAS.item('nivelador-ceramica', {
      pieza: pieza, espesor_mm: parseFloat(e[1]), piezas: q ? parseInt(q[1], 10) : ''
    });
  }

  if (/^perfil|^remate|^junta/.test(t)) {
    const mat = /alumin/.test(t) ? 'aluminio' : /acero inox|inoxidable/.test(t) ? 'acero inoxidable'
              : /\bpvc\b/.test(t) ? 'PVC' : /laton/.test(t) ? 'latón' : null;
    if (!mat) { MOTIVO.valor = 'la ficha no declara el material del perfil'; return null; }
    const p = partes(a.medida);
    if (!p) { MOTIVO.valor = 'la ficha no declara la medida del perfil'; return null; }
    /* El primer número es el canto que cubre y el segundo el largo del
       tramo en milímetros: 12×2500 es un perfil de 12 mm de 2.5 m. */
    const canto = Math.min(p[0], p[1]);
    const tipo = /junta/.test(t) ? 'dilatacion' : /escalon|peldano/.test(t) ? 'peldano' : 'canto';
    return BALDOSAS.item('perfil-canto', { tipo: tipo, material: mat, medida_mm: canto });
  }

  MOTIVO.valor = 'complemento de colocación que la ficha no describe lo bastante';
  return null;
}

/* =========================================================
   Adhesivos y derretidos
   ========================================================= */

function pesoKg(a) {
  const t = String(a.presentacion || a.nombre);
  let m = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo)/i);
  if (m) return BALDOSAS.aPesoKg(parseFloat(m[1]));
  m = t.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|libra)/i);
  if (m) return BALDOSAS.aPesoKg(parseFloat(m[1]) * LIBRA_KG);
  return null;
}

function reglaAdhesivo(a) {
  const t = texto(a);

  if (/^derretido|^flexcolor|^grout/.test(t)) {
    if (/epoxi|kerapoxy|spectralock/.test(t)) {
      MOTIVO.valor = 'derretido epóxico; no se compara por kilo con el cementicio';
      return null;
    }
    const kg = pesoKg(a);
    if (!kg) { MOTIVO.valor = 'la ficha no declara el peso de la funda de derretido'; return null; }
    return BALDOSAS.item('derretido', { kg: kg });
  }

  if (/^cemento|^adhesivo|^adesilex|^granirapid|^mortero|^keraflex|^kerabond/.test(t)) {
    /* La clase C1/C2 es lo que separa las partidas y esta tienda solo la
       declara en algunos nombres («C2», «Flex»). Sin ella no entra. */
    const clase = /\bc2\b|flex|granirapid|adesilex/.test(t) ? 'c2' : /\bc1\b/.test(t) ? 'c1' : null;
    if (!clase) { MOTIVO.valor = 'la ficha no declara la clase del adhesivo (C1 o C2), que es lo que separa las partidas'; return null; }
    const kg = pesoKg(a);
    if (!kg) { MOTIVO.valor = 'la ficha no declara el peso de la funda de adhesivo'; return null; }
    const color = /blanco|white/.test(t) ? 'blanco' : 'gris';
    return BALDOSAS.item('adhesivo-cementicio', { clase: clase, color: color, kg: kg });
  }

  MOTIVO.valor = 'producto químico de colocación que el catálogo no cubre todavía';
  return null;
}

/* =========================================================
   Baños, grifería y cocina
   ========================================================= */

function reglaBano(a) {
  const t = texto(a);

  if (/^inodoro|^taza/.test(t)) {
    if (/infantil|junior|nino|kinder/.test(t)) return BANOS.item('inodoro-infantil', {});
    if (/suspendido|colgado|pared/.test(t)) return BANOS.item('inodoro-suspendido', {});
    if (/fluxometro|fluxometrico/.test(t)) return BANOS.item('inodoro-fluxometro', {});
    if (/una pieza|monopieza|one piece/.test(t)) return BANOS.item('inodoro-una-pieza', {});
    if (/dos pieza|two piece/.test(t)) return BANOS.item('inodoro-dos-piezas', {});
    /* La tienda no dice de cuántas piezas es casi nunca, y son dos partidas
       con precios distintos. */
    MOTIVO.valor = 'la ficha no dice si el inodoro es de una pieza, de dos o suspendido';
    return null;
  }
  if (/^lavaman|^lavabo/.test(t)) {
    /* «Sin pedestal» y «semipedestal» van PRIMERO: los dos contienen la
       palabra «pedestal» y, puestos después, nunca llegaban a su rama.
       Un lavamanos sin pedestal cuesta la mitad que uno con él. */
    const montaje = /sin pedestal|semipedestal|suspendido|colgar/.test(t) ? 'pared'
                  : /con pedestal|\bpedestal\b/.test(t) ? 'pedestal'
                  : /empotr|bajo tope|undermount/.test(t) ? 'empotrar'
                  : /sobre tope|sobreponer|vessel/.test(t) ? 'sobreponer' : '';
    /* Sin montaje declarado va al «Lavamanos» genérico, que existe justo
       para eso y ya recibe precios de otros comercios. */
    return BANOS.item('lavamanos', { montaje: montaje });
  }
  if (/^semipedestal|^pedestal/.test(t)) return BANOS.item('pedestal', {});
  if (/^conjunto|^mueble/.test(t)) {
    return BANOS.item('mueble-bano', { montaje: /suspendido|flotante|pared/.test(t) ? 'pared' : 'piso' });
  }
  if (/^espejo/.test(t)) return BANOS.item('espejo', { luz: /led|luz/.test(t) ? 'led' : '' });
  if (/^banera|^jacuzzi|^tina\b/.test(t)) return BANOS.item(BANOS.tipoDeBanera(t), { montaje: BANOS.montajeDeBanera(t), material: BANOS.materialDeBanera(t) });
  if (/^plato/.test(t)) return BANOS.item('plato-ducha', {});
  if (/^mampara|^cabina/.test(t)) {
    const c = BANOS.cabinaDeDucha(t);
    return BANOS.item(c.familia, c.medidas);
  }
  if (/^bidet|^bide\b/.test(t)) return BANOS.item('bide', {});
  if (/^orinal|^urinario/.test(t)) return BANOS.item('urinario', {});
  if (/^asiento/.test(t)) { MOTIVO.valor = 'repuesto de consumidor, no partida de obra'; return null; }
  if (/^pulsador|^bastidor|^kit/.test(t)) { MOTIVO.valor = 'mecanismo interno del aparato; se compra con él, no aparte'; return null; }
  if (BANOS.esJuegoDeDucha(t)) return (function () { const c = BANOS.juegoDeDucha(t); return BANOS.item(c.familia, c.medidas); })();
  MOTIVO.valor = 'aparato sanitario que la ficha no describe lo bastante';
  return null;
}

function reglaGriferia(a) {
  const t = texto(a);
  if (/^brazo/.test(t)) return BANOS.item('ducha-brazo', {});
  if (/^rociador|^regadera|^cabezal/.test(t)) {
    const c = BANOS.cabezalDeDucha(t);
    return BANOS.item(c.familia, c.medidas);
  }
  if (BANOS.esJuegoDeDucha(t)) return (function () { const c = BANOS.juegoDeDucha(t); return BANOS.item(c.familia, c.medidas); })();
  if (/^valvula|^vlvula|^fluxometro|^maneral|^sensor|^llave de paso/.test(t)) {
    MOTIVO.valor = 'pieza de grifería que el catálogo no tiene como partida propia';
    return null;
  }
  if (/^kit/.test(t)) { MOTIVO.valor = 'kit de repuesto de un modelo concreto'; return null; }
  if (/^mezc|^grifo|^llave/.test(t)) {
    /* Ducha empotrada es otra partida que la mezcladora del lavamanos. */
    if (/ducha/.test(t)) return BANOS.item('ducha-mezcladora', {});
    const act = BANOS.activacion(t);
    const usoG = /cocina|frega|lavadero|lavatrapero/.test(t) ? 'fregadero' : 'bano';
    return BANOS.item('mezcladora', { uso: usoG, activacion: act });
  }
  MOTIVO.valor = 'pieza de grifería que la ficha no describe lo bastante';
  return null;
}

function reglaCocina(a) {
  const t = texto(a);
  if (/^mueble/.test(t)) return BANOS.item('mueble-bano', { montaje: 'piso' });
  if (/^fregadero|^lavadero|^lavatrapero/.test(t)) {
    const p = t.match(/(\d)\s*b\b/) || (/doble/.test(t) ? [null, '2'] : null) || (/sencillo|simple/.test(t) ? [null, '1'] : null);
    const pozos = p ? parseInt(p[1], 10) : null;
    if (!pozos) { MOTIVO.valor = 'la ficha no declara cuántos pozos tiene el fregadero'; return null; }
    const m = partes(a.medida);
    if (!m) { MOTIVO.valor = 'la ficha no declara la medida del fregadero'; return null; }
    let x = m[0], y = m[1];
    if (x > 300 || y > 300) { x = x / 10; y = y / 10; }
    const pulg = v => Math.round(v / 2.54);
    return PLOM.item('fregadero', {
      pozos: pozos,
      medida: pulg(Math.max(x, y)) + ' x ' + pulg(Math.min(x, y)) + ' pulgadas'
    });
  }
  MOTIVO.valor = 'artículo de cocina que la ficha no describe lo bastante';
  return null;
}

function reglaPlomeria(a) {
  const t = texto(a);
  if (/^desague|^desague|^rejilla/.test(t)) {
    if (/lineal|canaleta/.test(t)) { MOTIVO.valor = 'desagüe lineal de ducha; el catálogo no tiene todavía esa partida'; return null; }
    const usoD = /frega|cocina/.test(t) ? 'fregadero' : /lavaman/.test(t) ? 'lavamanos' : null;
    if (!usoD) { MOTIVO.valor = 'rejilla o desagüe de piso que la ficha no mide'; return null; }
    const mat = /inox|metal|laton|acero/.test(t) ? 'metal' : 'plástico';
    return PLOM.item('boquilla-desague', { uso: usoD, material: mat });
  }
  if (/^sifon/.test(t)) {
    const usoS = /frega|cocina/.test(t) ? 'fregadero' : 'lavamanos';
    const mat = /inox|metal|laton|acero/.test(t) ? 'metal' : /\bpvc\b/.test(t) ? 'PVC' : null;
    const m = t.match(/(\d+(?:\s+\d+\/\d+|\.\d+)?)\s*"/);
    if (!mat || !m) { MOTIVO.valor = 'la ficha no declara el material o la medida del sifón'; return null; }
    return PLOM.item('sifon', { uso: usoS, material: mat, medida: m[1] + '"' });
  }
  MOTIVO.valor = 'pieza de plomería que la ficha no describe lo bastante';
  return null;
}

/* =========================================================
   El despachador
   ========================================================= */

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) { MOTIVO.valor = 'la ficha no publica un precio utilizable'; return null; }

  const c = a.cat1;
  if (FUERA[c]) { MOTIVO.valor = FUERA[c]; return null; }
  if (TILE.has(c)) return reglaBaldosa(a);

  switch (c) {
    case 'Complementos Revestimientos':
    case 'Complementos':          return reglaComplemento(a);
    case 'Adhesivos':             return reglaAdhesivo(a);
    case 'Baños':                 return reglaBano(a);
    case 'Griferia':              return reglaGriferia(a);
    case 'Cocina':                return reglaCocina(a);
    case 'Plomeria':              return reglaPlomeria(a);
    default:
      MOTIVO.valor = 'familia que el catálogo no cubre todavía';
      return null;
  }
}

module.exports = { regla, MOTIVO, FUERA };
