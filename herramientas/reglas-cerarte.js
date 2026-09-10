'use strict';
/* =========================================================
   reglas-cerarte.js — el catálogo de cerarte.com.do

   CerArte es una tienda especializada: cerámica, porcelanato,
   baños y cocinas. Es el primer comercio que le hace segunda
   voz a Ochoa en baldosas, que era el hueco más grande del
   catálogo (130 ítems con un solo precio).

   LO QUE ESTE CATÁLOGO HACE BIEN
   ------------------------------
   Declara lo que los demás se callan: la unidad de venta en
   cada línea (m² o unidad), los metros y las piezas por caja,
   la fecha desde la que rige el precio y, sobre todo, que el
   precio publicado NO lleva ITBIS. Eso último se registra como
   dato (`itbis: false` en la fuente), no como suposición.

   LO QUE SE CALLA, Y CUESTA CARO
   ------------------------------
   En 434 de sus 883 baldosas no dice si la pieza es de piso o
   de pared. Antes de decidir qué hacer se midió si ese eje
   mueve el precio, con el mismo método de los bombillos:

     material + uso + formato → 71 buckets,  4 con rango >3x
     material + formato       → 64 buckets, 10 con rango >3x
     solo formato             → 53 buckets, 11 con rango >3x

   Y dentro de un mismo (material, formato), la mediana de un
   uso a otro llega a diferir 1.9x: la cerámica de 60 x 120 de
   pared vale RD$ 2,067/m² y la de piso RD$ 1,082/m². El eje se
   gana su sitio, así que las que no lo declaran se quedan
   fuera con ese motivo dicho. Tampoco se dedujo del formato:
   se comprobó que 60 x 120 y 60 x 60 están genuinamente
   repartidos entre piso, pared y ambos.

   EL COLOR NO ES UN ÍTEM
   ----------------------
   1,316 códigos y 1,926 variantes: la diferencia son colores y
   acabados del mismo producto. Van como cotizaciones distintas
   del mismo ítem, y el importador colapsa las que coinciden en
   precio.
   ========================================================= */

const BALDOSAS = require('./especificacion-baldosas.js');
const BANOS = require('./especificacion-banos.js');
const PLOM = require('./especificacion-plomeria.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

/* En este catálogo «D/» es «de», «P/» es «para» y «C/» es «con». Se
   normalizan para que las expresiones de abajo se lean. */
const texto = a => baja(a.nombre)
  .replace(/\bd\s*\/\s*/g, 'de ').replace(/\bp\s*\/\s*/g, 'para ')
  .replace(/\bc\s*\/\s*/g, 'con ').replace(/\bs\s*\/\s*/g, 'sin ')
  .replace(/\s+/g, ' ').trim();

const num = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };

/* =========================================================
   Subgrupos que no entran, y por qué
   ========================================================= */

const FUERA = {
  'ASIENTOS P/INODOROS': 'repuesto de consumidor, no partida de obra',
  'TAPA D/TANQUES': 'repuesto de consumidor, no partida de obra',
  'MECANISMOS': 'mecanismo interno del aparato; se compra con él, no aparte',
  'PLACA D/DESCARGA': 'mecanismo interno del aparato; se compra con él, no aparte',
  'BOTON DESCARGA': 'mecanismo interno del aparato; se compra con él, no aparte',
  'SISTEMA D/ELEVACION': 'mecanismo interno del aparato; se compra con él, no aparte',
  KITS: 'kit de repuesto de un modelo concreto',
  REPUESTOS: 'repuesto de consumidor, no partida de obra',
  'REPUESTOS APARATOS SANITARIO': 'repuesto de consumidor, no partida de obra',
  'REPUESTOS ACCESORIOS BAÑOS': 'repuesto de consumidor, no partida de obra',
  'REPUESTOS PANEL DE DUCHA': 'repuesto de consumidor, no partida de obra',
  CARTUCHO: 'repuesto de consumidor, no partida de obra',
  BISAGRAS: 'repuesto de consumidor, no partida de obra',
  SELLOS: 'repuesto de consumidor, no partida de obra',
  BATERIAS: 'repuesto de consumidor, no partida de obra',
  'TUERCAS / TORNILLOS': 'repuesto de consumidor, no partida de obra',
  DETERGENTES: 'producto de limpieza, no material de obra',
  PROTECTORES: 'tratamiento químico de superficie, no material de obra',
  WASHLET: 'aparato electrónico de consumidor, no partida de obra',
  TACOS: 'pieza decorativa suelta; se vende por unidad y no forma partida',
  VALVULAS: 'válvula de fluxómetro; el catálogo no tiene todavía esa partida',
  'IMPERMEABILIZANTES': 'el catálogo no tiene todavía partida de impermeabilizante de baño',
  'DERRETIDO PERMACOLOR': 'componente suelto de un derretido de dos partes; no es una funda comparable',
  'DERRETIDOS EPOXICOS': 'derretido epóxico; no se compara por kilo con el cementicio',
  ADHESIVOS: 'la ficha no declara la clase del adhesivo (C1 o C2), que es lo que separa las partidas',
  'ADHESIVOS FORTIFICADOS CON POLIMEROS': 'la ficha no declara la clase del adhesivo (C1 o C2), que es lo que separa las partidas',
  'ADHESIVOS EPOXICOS': 'la ficha no declara la clase del adhesivo (C1 o C2), que es lo que separa las partidas',
  'JUNTA DE EXPANSION': 'la ficha no declara la medida de la junta',
  METALIZADOS: 'pieza decorativa metálica, no baldosa de campo',
  GRIFERIAS: 'la ficha no dice para qué aparato es la grifería'
};

/* Los subgrupos de baldosa. El comercio los ordena por aspecto —mármol,
   piedra, cemento, madera— y eso no es una especificación de compra: lo que
   define la baldosa es material, uso y formato. */
const BALDOSA = new Set(['DIFERENCIADORES', 'TIPO MARMOL', 'TIPO PIEDRA',
  'TIPO CEMENTO', 'TIPO MADERA', 'NEUTROS', 'PISCINAS', 'TECNICOS',
  'RV DIFERENCIADORES', 'PV NEUTROS']);

/* =========================================================
   Baldosas: material, uso y formato
   ========================================================= */

function material(a) {
  const t = baja(a.nombre + ' ' + a.cat1 + ' ' + a.categoriaFicha + ' ' + a.cat3);
  if (/porcelan|\bporc\b|\blev\b|\bgres\b|tecnico|gran formato/.test(t)) return 'porcelanato';
  if (/ceramic|revestimiento|pavimento/.test(t)) return 'ceramica';
  /* Cuando el menú calla, la descripción del propio comercio suele decirlo. */
  const d = baja(a.info);
  if (/porcelan|\bgres\b/.test(d)) return 'porcelanato';
  if (/ceramic|azulejo|pasta blanca/.test(d)) return 'ceramica';
  return null;
}

/* El comercio separa su menú en revestimientos (pared) y pavimentos (piso),
   y en eso es consistente. Cuando el menú calla, la descripción larga a
   veces lo dice. Cuando callan las dos, el artículo no entra. */
function uso(a) {
  /* «RV» y «PV» son las siglas del propio comercio para revestimiento y
     pavimento, y las usa igual en el menú, en el subgrupo y en el nombre. */
  const c = baja(a.categoriaFicha + ' ' + a.cat2 + ' ' + a.cat3 + ' ' + a.nombre);
  if (/\brv\b|revestimiento/.test(c)) return 'pared';
  if (/\bpv\b|pavimento/.test(c)) return 'piso';
  const d = baja(a.info);
  const piso = /\bpiso|pavimento|suelo/.test(d);
  const pared = /\bpared|revestimiento|muro|azulejo/.test(d);
  if (piso && pared) return 'piso y pared';
  if (piso) return 'piso';
  if (pared) return 'pared';
  return null;
}

/* El tamaño nominal viene en su propia columna, en centímetros. */
function formatoDe(a) {
  const m = String(a.tamano || '').match(/^(\d+(?:\.\d+)?)\s*[Xx]\s*(\d+(?:\.\d+)?)$/);
  if (!m) return '';
  return BALDOSAS.formato(parseFloat(m[1]), parseFloat(m[2]));
}

function reglaBaldosa(a) {
  const f = formatoDe(a);
  if (!f) { MOTIVO.valor = 'la ficha no declara el tamaño de la pieza'; return null; }

  /* El mosaico se compra en malla y se presupuesta aparte, aunque el
     comercio lo archive bajo el mismo aspecto que la baldosa de campo. */
  if (/^mosaico/.test(texto(a))) return BALDOSAS.item('mosaico', { formato: f });

  if (a.unidad !== 'M2') {
    MOTIVO.valor = 'la baldosa no se cotiza por metro cuadrado y no se puede comparar';
    return null;
  }
  const mat = material(a);
  if (!mat) { MOTIVO.valor = 'la ficha no declara si es cerámica o porcelanato'; return null; }
  const u = uso(a);
  if (!u) { MOTIVO.valor = 'la ficha no declara si la pieza es de piso o de pared'; return null; }

  /* Las piezas por metro no se registran: salen del formato, que ya está en
     el nombre. El acabado sí, y solo si todos los artículos del ítem
     coinciden; el importador descarta la medida en cuanto haya conflicto. */
  const medidas = { material: mat, uso: u, formato: f };
  const acab = acabado(a);
  if (acab) medidas.acabado = acab;
  return BALDOSAS.item('baldosa', medidas);
}

function acabado(a) {
  const t = baja(a.acabado);
  if (/antidesliz/.test(t)) return 'antideslizante';
  if (/pulid|lapp?ato|brillo|brillante|glossy/.test(t)) return 'pulido';
  if (/mate|natural|satinad|matt/.test(t)) return 'mate';
  return '';
}

/* =========================================================
   Accesorios de colocación
   ========================================================= */

const MATERIAL_PERFIL = t =>
  /alumin/.test(t) ? 'aluminio' :
  /acero inox|inoxidable/.test(t) ? 'acero inoxidable' :
  /\bpvc\b/.test(t) ? 'PVC' :
  /laton|bronce/.test(t) ? 'latón' : null;

function reglaPerfil(a) {
  const t = texto(a);
  const mat = MATERIAL_PERFIL(t);
  if (!mat) { MOTIVO.valor = 'la ficha no declara el material del perfil'; return null; }
  /* La talla viene como «10MM-2.7ML»: el primer número es el canto de la
     baldosa que cubre y el segundo el largo del tramo. */
  const m = String(a.talla || '').match(/(\d+(?:\.\d+)?)\s*(?:MM)?\s*-/i);
  const medida = m ? parseFloat(m[1]) : null;
  if (!medida) { MOTIVO.valor = 'la ficha no declara la medida del perfil'; return null; }
  const tipo = /escalon|peldano/.test(t) ? 'peldano' : 'canto';
  return BALDOSAS.item('perfil-canto', { tipo: tipo, material: mat, medida_mm: medida });
}

function reglaNivelador(a) {
  const t = texto(a);
  if (/alicate|pinza|tenaza/.test(t)) return BALDOSAS.item('herramienta-ceramica', { tipo: 'alicate' });
  if (/separador|cruz/.test(t)) {
    const e = String(a.nombre).match(/(\d+(?:\.\d+)?)\s*MM/i);
    const p = String(a.nombre).match(/(\d+)\s*\/\s*1\b/);
    if (!e || !p) { MOTIVO.valor = 'la ficha no declara el espesor o cuántas trae la funda'; return null; }
    return BALDOSAS.item('cruceta', { espesor_mm: parseFloat(e[1]), piezas: parseInt(p[1], 10) });
  }
  const me = String(a.talla || '').match(/(\d+(?:\.\d+)?)\s*MM/i);
  const esp = me ? parseFloat(me[1]) : null;
  if (!esp) { MOTIVO.valor = 'la ficha no declara el espesor de junta del nivelador'; return null; }
  const pieza = /tirante|clip|correa/.test(t) ? 'clip' : /cuna/.test(t) ? 'cuna' : 'calzo';
  return BALDOSAS.item('nivelador-ceramica', { pieza: pieza, espesor_mm: esp });
}

function reglaZocalo(a) {
  const t = texto(a);
  const mat = /vinil/.test(t) ? 'vinil' : MATERIAL_PERFIL(t) || (/marmol/.test(t) ? 'mármol' : null);
  if (!mat) { MOTIVO.valor = 'la ficha no declara el material del rodapié'; return null; }
  return BALDOSAS.item('rodapie', { material: mat });
}

function reglaVinil(a) {
  const m = String(a.nombre + ' ' + a.talla).match(/(\d+(?:\.\d+)?)\s*MM/i);
  if (!m) { MOTIVO.valor = 'la ficha no declara el espesor del vinil'; return null; }
  const u = /pared|panel/.test(texto(a)) || a.cat3 === 'PARED D/VINIL' ? 'pared' : 'piso';
  return BALDOSAS.item('piso-vinilico', { uso: u, espesor_mm: parseFloat(m[1]) });
}

/* =========================================================
   Baños y cocina
   ========================================================= */

function reglaInodoro(a) {
  const t = texto(a);
  if (/^taza para inodoro|^taza para inodoro/.test(t)) {
    return /fluxometro/.test(t) ? BANOS.item('inodoro-fluxometro', {})
                                : BANOS.item('inodoro-basineta', {});
  }
  if (/kinder|infantil|junior|nino/.test(t)) return BANOS.item('inodoro-infantil', {});
  if (a.cat3 === 'INODORO SUS' || /suspendido|colgado/.test(t)) return BANOS.item('inodoro-suspendido', {});
  if (a.cat3 === 'INODORO COM' || /fluxometro/.test(t)) return BANOS.item('inodoro-fluxometro', {});
  if (a.cat3 === 'INODORO TP' || /two piece|dos pieza/.test(t)) return BANOS.item('inodoro-dos-piezas', {});
  if (a.cat3 === 'INODORO OP' || /one piece|una pieza|monobloque/.test(t)) return BANOS.item('inodoro-una-pieza', {});
  MOTIVO.valor = 'la ficha no dice si el inodoro es de una pieza, de dos o suspendido';
  return null;
}

const MONTAJE_LAVAMANOS = {
  'LAVAMANOS P/TOPE': 'sobreponer',
  'LAVAMANOS SUS': 'pared',
  'LAVAMANOS PEDESTAL': 'pedestal',
  'LAVAMANOS EMP': 'empotrar'
};

function reglaLavamanos(a) {
  const t = texto(a);
  /* El comercio archiva algún mueble con lavamanos bajo lavamanos. Un mueble
     con su lavamanos es otra partida: se compra por el mueble. */
  if (/^mueble|con mueble/.test(t)) {
    return BANOS.item('mueble-bano', { montaje: /suspendido|pared|flotante/.test(t) ? 'pared' : 'piso' });
  }
  const montaje = /pedestal/.test(t) ? 'pedestal'
                : /empotrado|empotrar|bajo tope|undermount/.test(t) ? 'empotrar'
                : /suspendido|pared|colgar/.test(t) ? 'pared'
                : /sobre tope|de tope|sobreponer|vessel/.test(t) ? 'sobreponer'
                : MONTAJE_LAVAMANOS[a.cat3] || null;
  if (!montaje) { MOTIVO.valor = 'la ficha no declara cómo se monta el lavamanos'; return null; }
  return BANOS.item('lavamanos', { montaje: montaje });
}

function reglaGriferia(a) {
  const t = texto(a);
  const act = /sensor|electronic|automatic|infrarroj|bacteria-free|pressmatic|temporizad|timer/.test(t)
    ? 'sensor' : 'manual';
  /* La regla del catálogo: una mezcladora solo se separa por si lleva sensor
     y por si es de fregar o de baño. La marca, el acabado y el número de
     manijas son de la cotización. */
  const usoG = a.cat3 === 'GRIFOS COCINA' || /cocina|fregadero|fregar/.test(t) ? 'fregadero' : 'bano';
  return BANOS.item('mezcladora', { uso: usoG, activacion: act });
}

function reglaDucha(a) {
  const t = texto(a);
  if (/^brazo de ducha|^brazo para|^codo de salida/.test(t)) return BANOS.item('ducha-brazo', {});
  if (/^manguera/.test(t)) return BANOS.item('ducha-manguera', {});
  if (/^barra de ducha|riel/.test(t)) return BANOS.item('ducha-barra', {});
  if (/mezclador|valvula de ducha|termostat|termostic/.test(t)) {
    if (/banera|bañera/.test(t)) return BANOS.item('mezcladora', { uso: 'bano', activacion: 'manual' });
    return BANOS.item('ducha-mezcladora', {});
  }
  /* «Toda columna ducha va dentro del mismo ítem»: sistema, set y columna son
     el mismo producto con tres nombres comerciales. */
  if (/^sistema de ducha|^sistema ducha|^columna|^set de ducha/.test(t)) return BANOS.item('ducha-columna', {});
  if (/^ducha de mano|telefono|^duchade ?mano|manual/.test(t)) return BANOS.item('ducha-telefono', {});
  if (/^cabezal|rainshower|^ducha de techo|^ducha de pared|^ducha lateral|^ducha rotatoria|^regadera/.test(t)) {
    return BANOS.item('ducha-cabezal', {});
  }
  MOTIVO.valor = 'pieza de ducha que la ficha no describe lo bastante';
  return null;
}

/* Los accesorios sueltos —toalleros, jaboneras, ganchos, papeleras— se
   compran por diseño, no por especificación: el catálogo compara juegos. */
const ACCESORIO_SUELTO = /^toallero|^portarrollo|^porta rollo|^gancho|^percher|^jabonera|^papelera|^porta vaso|^soporte para vaso|^repisa|^escobilla|^nicho|^plato para jabonera|^accesorio para/;

function reglaAccesorio(a) {
  const t = texto(a);
  if (/^set de/.test(t)) {
    const p = t.match(/(\d+)\s*(?:pza|pzas|pieza|piezas|en 1)/);
    return BANOS.item('juego-accesorios', p ? { piezas: parseInt(p[1], 10) } : {});
  }
  if (/^brazo de ducha/.test(t)) return BANOS.item('ducha-brazo', {});
  if (/^manguera de ducha/.test(t)) return BANOS.item('ducha-manguera', {});
  if (/^dispensador para jabon|^dispensador de jabon/.test(t)) {
    return BANOS.item('dispensador-jabon', { activacion: /sensor|automatic/.test(t) ? 'sensor' : '' });
  }
  if (/^secador de manos/.test(t)) {
    return BANOS.item('secador-manos', { activacion: /sensor|automatic/.test(t) ? 'sensor' : '' });
  }
  if (/^barra de seguridad/.test(t)) return reglaBarra(a);
  if (/^asiento para inodoro/.test(t)) { MOTIVO.valor = 'repuesto de consumidor, no partida de obra'; return null; }
  if (/^llave angular/.test(t)) { MOTIVO.valor = 'la ficha no declara la medida de la llave angular'; return null; }
  if (ACCESORIO_SUELTO.test(t)) {
    MOTIVO.valor = 'accesorio suelto de baño; el catálogo compara juegos, no piezas sueltas';
    return null;
  }
  MOTIVO.valor = 'accesorio de baño que la ficha no describe lo bastante';
  return null;
}

function reglaBarra(a) {
  const t = texto(a);
  const forma = /abatible/.test(t) ? 'abatible' : /"l"|forma l|\ben l\b/.test(t) ? 'en L'
              : /curva/.test(t) ? 'curva' : 'recta';
  const m = String(a.talla || a.tamano || '').match(/(\d+(?:\.\d+)?)/);
  const medidas = { forma: forma };
  if (m) {
    const cm = BANOS.aCm(parseFloat(m[1]), parseFloat(m[1]) > 200 ? 'mm' : 'cm');
    if (cm) medidas.largo_cm = cm;
  }
  return BANOS.item('barra-seguridad', medidas);
}

function reglaFregadero(a) {
  const t = texto(a);
  const p = t.match(/(\d)\s*b\b/) || t.match(/\b(doble)\b/);
  const pozos = p ? (p[1] === 'doble' ? 2 : parseInt(p[1], 10)) : null;
  if (!pozos) { MOTIVO.valor = 'la ficha no declara cuántos pozos tiene el fregadero'; return null; }
  /* El catálogo mide los fregaderos en pulgadas, que es como los publican
     los demás comercios; este los publica en centímetros. */
  const m = String(a.talla || a.tamano || '').match(/^(\d+(?:\.\d+)?)\s*[Xx]\s*(\d+(?:\.\d+)?)/);
  if (!m) { MOTIVO.valor = 'la ficha no declara la medida del fregadero'; return null; }
  let x = parseFloat(m[1]), y = parseFloat(m[2]);
  if (x > 300 || y > 300) { x = x / 10; y = y / 10; }          // viene en milímetros
  const pulg = v => Math.round(v / 2.54);
  return PLOM.item('fregadero', {
    pozos: pozos,
    medida: pulg(Math.max(x, y)) + ' x ' + pulg(Math.min(x, y)) + ' pulgadas'
  });
}

function reglaDesague(a) {
  const t = texto(a);
  if (/lineal|canaleta/.test(t)) {
    MOTIVO.valor = 'desagüe lineal de ducha; el catálogo no tiene todavía esa partida';
    return null;
  }
  const usoD = /fregadero|cocina/.test(t) ? 'fregadero' : /lavaman/.test(t) ? 'lavamanos' : 'piso';
  if (usoD === 'piso') {
    MOTIVO.valor = 'rejilla o desagüe de piso que la ficha no mide';
    return null;
  }
  const mat = /acero inox|inoxidable|metal|laton/.test(t) ? 'metal' : 'plástico';
  return PLOM.item('boquilla-desague', { uso: usoD, material: mat });
}

function reglaSifon(a) {
  const t = texto(a);
  const usoS = /fregadero|cocina/.test(t) ? 'fregadero' : 'lavamanos';
  const mat = /acero inox|inoxidable|metal|laton/.test(t) ? 'metal' : /\bpvc\b/.test(t) ? 'PVC' : null;
  if (!mat) { MOTIVO.valor = 'la ficha no declara el material del sifón'; return null; }
  const m = t.match(/(\d+(?:\s+\d+\/\d+|\.\d+)?)\s*"/);
  if (!m) { MOTIVO.valor = 'la ficha no declara la medida del sifón'; return null; }
  return PLOM.item('sifon', { uso: usoS, material: mat, medida: m[1] + '"' });
}

/* =========================================================
   El despachador
   ========================================================= */

function regla(a) {
  MOTIVO.valor = '';
  if (a.estado === 'Inactivo') { MOTIVO.valor = 'artículo descontinuado por el comercio'; return null; }

  const g = a.cat3;
  if (FUERA[g]) { MOTIVO.valor = FUERA[g]; return null; }
  if (BALDOSA.has(g)) return reglaBaldosa(a);

  switch (g) {
    case 'ESQUINERO':
    case 'RIBETES REVESTIMIENTO':
    case 'PERFIL P/ESCALON':      return reglaPerfil(a);
    case 'SISTEMA NIVELADOR':
    case 'SEPARADORES':           return reglaNivelador(a);
    case 'ZOCALOS':               return reglaZocalo(a);
    case 'PISOS D/VINIL':
    case 'PARED D/VINIL':         return reglaVinil(a);

    case 'INODORO OP':
    case 'INODORO TP':
    case 'INODORO SUS':
    case 'INODORO COM':
    case 'TAZA P/INODOROS':       return reglaInodoro(a);
    case 'ORINALES':              return BANOS.item('urinario', {});
    case 'BIDET':
    case 'BIDETS':                return BANOS.item('bide', {});
    case 'LAVAMANOS P/TOPE':
    case 'LAVAMANOS SUS':
    case 'LAVAMANOS PEDESTAL':
    case 'LAVAMANOS EMP':         return reglaLavamanos(a);
    case 'MUEBLES BAÑOS':         return BANOS.item('mueble-bano',
      { montaje: /suspendido|pared|flotante/.test(texto(a)) ? 'pared' : 'piso' });
    case 'ESPEJOS':               return BANOS.item('espejo',
      { luz: /led|luz/.test(texto(a)) ? 'led' : '' });
    case 'CABINAS':               return BANOS.item('cabina-ducha', {});
    case 'PLATO DUCHA':           return BANOS.item('plato-ducha', {});
    case 'BAÑERAS':               return BANOS.item('banera', {});
    case 'BARRA DE SEGURIDAD':    return reglaBarra(a);
    case 'ACCESORIOS BAÑOS':      return reglaAccesorio(a);
    case 'DISPENSADOR D/ JABON':  return BANOS.item('dispensador-jabon',
      { activacion: /sensor|automatic/.test(texto(a)) ? 'sensor' : '' });
    case 'SECADOR DE MANOS':      return BANOS.item('secador-manos',
      { activacion: /sensor|automatic/.test(texto(a)) ? 'sensor' : '' });

    case 'GRIFERIA D/LAVAMANO':
    case 'GRIFERIA D/BIDET':
    case 'GRIFERIA P/BAÑERA':
    case 'MEZCLADORA P/BAÑERA':
    case 'GRIFOS COCINA':         return reglaGriferia(a);
    case 'DUCHA D/BAÑO':          return reglaDucha(a);
    case 'FREGADEROS':            return reglaFregadero(a);
    case 'DESAGUES':              return reglaDesague(a);
    case 'SIFONES':               return reglaSifon(a);
    case 'MANGUERAS':             return BANOS.item('ducha-manguera', {});
    case 'CODOS':                 return BANOS.item('ducha-brazo', {});
    default:
      MOTIVO.valor = 'familia que el catálogo no cubre todavía';
      return null;
  }
}

module.exports = { regla, MOTIVO, FUERA };
