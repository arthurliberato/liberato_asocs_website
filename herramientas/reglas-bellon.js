'use strict';
/* =========================================================
   reglas-bellon.js — el catálogo de catalogo.bellon.com.do

   26,485 productos: el catálogo más grande del directorio, casi
   el triple que Ferremix. Bellón abrió en Santiago en 1949 y
   hoy tiene ocho sucursales dominicanas —Pontezuela, La Romana,
   Imbert, Punta Cana, San Francisco de Macorís, Baní, Mao y
   Santo Domingo— con el mismo precio en todas.

   EL NOMBRE BUENO ESTÁ EN LA DESCRIPCIÓN
   --------------------------------------
   La columna de listado viene abreviada y cortada a 50
   caracteres: «Lámpara Empot Acri Fluo 503 EO 2X4 32W 3T
   Sylvania». La descripción trae el nombre entero: «Lámpara
   Empotrar Acrílica Fluorescente 503 EO 2X4 32W 3T Sylvania
   P01408-21». Son 11,622 artículos donde la descripción dice
   más que el nombre, y en 9,827 el nombre está cortado justo en
   el límite. La extracción ya pone la descripción en `nombre` y
   deja el abreviado en `abrev`; estas reglas leen el completo.

   Es el mismo problema que el nombre roto de Ferremix, resuelto
   por el mismo camino: leer el campo donde el comercio escribió
   bien lo que vende, no el que la vitrina recortó.

   NO HAY COLUMNA DE CATEGORÍA
   ---------------------------
   Ni departamento, ni familia, ni nada. Es la primera fuente
   del directorio donde la clasificación sale ENTERA del nombre,
   y eso cambia el riesgo: en Ferremix un error metía una pieza
   en la familia vecina; aquí puede meter cualquier cosa en
   cualquier parte. Por eso el despachador es una lista blanca
   de sustantivos iniciales y todo lo demás se va sin ruido:
   de 26,485 artículos, los que no empiezan por una palabra que
   sabemos leer ni se cuentan como descarte.

   Y por eso también hay una lista de trampas, que son las
   palabras que significan una cosa en la obra y otra en esta
   ferretería:

     zócalo      aquí es el portalámparas, no el rodapié
     palometa    el soporte de estante o de malla, no el de baño
     plafón      la plancha de cielo raso, no la luminaria
     cable acero el cable de acero, no el conductor eléctrico
     cemento     «cemento contacto» y «cemento PVC» son pegamento
     interruptor «interruptor timbre» es el pulsador del timbre

   EL ITBIS NO LO DECLARA
   ----------------------
   Ni la extracción ni la ficha dicen si el precio publicado lo
   lleva. Va con el supuesto de mostrador, igual que Ferremix y
   La Ibérica, y la nota lo dice en vez de callarlo.
   ========================================================= */

const BALDOSAS = require('./especificacion-baldosas.js');
const BANOS = require('./especificacion-banos.js');
const PLOM = require('./especificacion-plomeria.js');
const ELEC = require('./especificacion-electricos.js');
const PINTURA = require('./especificacion-pintura.js');
const MADERA = require('./especificacion-madera.js');
const ESTR = require('./especificacion-estructura.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();

/* El nombre completo, que es el que la descripción salvó del recorte. */
const texto = a => baja(a.nombre);

/* =========================================================
   Medidas
   ========================================================= */

/* Los números que pueden ser medidas, con sus fracciones enteras:
   «1 1/2», «3/4», «33.3». Copiado del mismo lector que usa Cima, para
   que las claves de los dos comercios caigan en el mismo ítem. */
function numerosDe(nombre) {
  const t = limpia(nombre).replace(/,/g, ' ');
  const salida = [];
  const re = /(?:^|[\s(])(\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+(?:\.\d+)?)(?=$|[\s)xX×'"”]|mm|MM)/g;
  let m;
  while ((m = re.exec(t)) !== null) salida.push(m[1].trim());
  return salida;
}

function medidaPulg(txt) {
  const v = PLOM.pulgadas(txt);
  return v === null ? '' : PLOM.comoPulgada(v);
}

/* La primera medida en pulgadas que traiga el nombre. */
function pulgada(nombre) {
  const m = limpia(nombre).match(/(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(?:"|''|”|pulg)/);
  return m ? medidaPulg(m[1]) : '';
}

function numero(t, re) { const m = t.match(re); return m ? parseFloat(m[1]) : null; }

/* =========================================================
   Trampas del vocabulario de esta tienda
   ========================================================= */

/* Palabras que en esta ferretería no significan lo que significan en una
   obra. Cada una costaría un ítem con el precio de otra cosa. */
const TRAMPAS = [
  [/^zocalo (metal|gancho|porcelana|baquelita|e\d|pasador|colgante)/, 'en esta tienda «zócalo» es el portalámparas, no el rodapié'],
  [/^palometa/, 'soporte de estante o de malla, no el accesorio de baño'],
  [/^plafon (fisura|pvc|mineral|acustico|tablilla|yeso)/, 'plancha de cielo raso; el catálogo no tiene esa partida'],
  [/^cable acero/, 'cable de acero de izaje, no conductor eléctrico'],
  [/^cemento (contacto|pvc|cpvc|caucho|blanco maximus)/, 'pegamento de contacto o solvente, no cemento portland'],
  [/^interruptor (timbre|flotador|presion|termico|nivel)/, 'no es el interruptor de pared de una instalación eléctrica'],
  [/^bomba (sumergible fuent|de aire|manual|vacio|grasa|aceite|combustible|gasolina|achique)/, 'bomba que no es la de abasto de agua de una vivienda'],
  [/^varilla (flota|soldar|tierra|roscada|cortina)/, 'no es varilla de refuerzo de hormigón'],
  [/^tubo (guia|calentador|escape|neon|carton|prueba|ensayo)/, 'pieza o repuesto, no tubería de instalación'],
  [/^bombillo.*huevo paloma|^bombillo (vela|flama|decorativo|globo)/, 'bombillo decorativo, no el de una instalación de vivienda'],
  [/piscina/, 'artículo de piscina; el catálogo no tiene esa partida'],
  [/hidromasaje|\bhidrom\b|^jacuzzi/, 'bañera de hidromasaje: es otro aparato y otro precio que la bañera de obra'],
  [/^ducha barra|^ducha metal (con|c\/) ?brazo/, 'juego de ducha completo, no la pieza suelta que nombra'],
  [/^inodoro.*intelig|^inodoro.*smart|bide electronic/, 'inodoro inteligente: es otro aparato y otro precio']
];

/* =========================================================
   Estructura: varilla y zinc
   ========================================================= */

/* «Varilla Constr. 1/2" x 30' G60 20.04 Lb (At. 110/1)». Diámetro, largo,
   grado y peso, los cuatro declarados. El atado —cuántas trae el paquete—
   no es del ítem: el precio publicado es por unidad. */
function reglaVarilla(a) {
  const n = limpia(a.nombre);
  const m = n.match(/^Varilla\s+Constr\.?\s+([\d\s/]+?)\s*("|''|”)?\s*[xX]\s*(\d+)\s*'/);
  if (!m) { MOTIVO.valor = 'la ficha no declara el diámetro o el largo de la varilla'; return null; }
  const d = medidaPulg(m[1]);
  /* Las de 4 mm no se miden en pulgadas: son alambrón, y su ficha lo dice
     en milímetros. Van por su propio camino o no van. */
  if (!d) { MOTIVO.valor = 'la varilla no viene medida en pulgadas'; return null; }
  const g = n.match(/\bG\s?(\d{2})\b/i);
  if (!g) { MOTIVO.valor = 'la ficha no declara el grado del acero'; return null; }
  const p = n.match(/([\d.]+)\s*Lb\b/i);
  const spec = ESTR.item('varilla', {
    diametro: d, largo_pies: parseInt(m[3], 10), grado: parseInt(g[1], 10),
    peso_lb: p ? p[1] : ''
  });
  /* Las cuatro de 20 pies el catálogo ya las tenía escritas a mano. Sin esta
     comprobación nacían otra vez con el mismo nombre y el precio de Bellón
     quedaba en un ítem gemelo en vez de sumarse al que ya se compara. */
  if (spec && ESTR.YA_EXISTE[spec.clave]) return { existente: ESTR.YA_EXISTE[spec.clave] };
  return spec;
}

/* «Zinc Acanalado C29 3' x 6' x (0.28) 9.00Lb»: perfil, calibre, ancho y
   largo. El zinc NO necesita familia propia: el catálogo ya lo tiene, con la
   plancha nombrada por sus dos medidas —«Zinc acanalado calibre 29, 3 x 6
   pies»— desde la extracción de Ochoa. Aquí solo hay que caer encima de esa
   clave para que los precios se comparen en la misma fila en vez de abrir
   una segunda tabla de zinc al lado de la primera. */
const ZINC_CONOCIDO = {
  'acanalado-29-3x6': 1, 'acanalado-29-3x12': 1,
  'acanalado-34-3x6': 1, 'acanalado-34-3x12': 1,
  'liso-29-3x6': 1, 'liso-34-3x6': 1
};

function reglaZinc(a) {
  const n = limpia(a.nombre);
  const perfil = /acanalad|ondulad/i.test(n) ? 'acanalado' : /\bliso\b/i.test(n) ? 'liso' : '';
  if (!perfil) { MOTIVO.valor = 'la ficha no dice si la plancha es acanalada o lisa'; return null; }
  const c = n.match(/\bC\s?(\d{2})\b/);
  if (!c) { MOTIVO.valor = 'la ficha no declara el calibre de la plancha'; return null; }
  const m = n.match(/(\d+)\s*'\s*[xX]\s*(\d+)\s*'/);
  if (!m) { MOTIVO.valor = 'la ficha no declara las medidas de la plancha'; return null; }
  const clave = perfil + '-' + parseInt(c[1], 10) + '-' + parseInt(m[1], 10) + 'x' + parseInt(m[2], 10);
  if (!ZINC_CONOCIDO[clave]) {
    MOTIVO.valor = 'plancha de zinc en un calibre o formato que el catálogo no compara todavía';
    return null;
  }
  return { existente: '#MAT-07|zinc-' + clave };
}

/* =========================================================
   Baldosas
   ========================================================= */

/* «Cerámica 45 x 45 Cm 1A 4.94/Mt Cristofoletti 45330 Blanco 11Pcs/Cjs
   Interior». El formato en centímetros y, de regalo, cuántas piezas hacen
   un metro cuadrado: «4.94/Mt». Eso último es lo que convierte un precio
   por pieza en el precio por m² que pide un presupuesto. */
function reglaBaldosa(a) {
  const t = texto(a);
  const n = limpia(a.nombre);

  const m = n.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)\s*(?:Cm|cm)/);
  if (!m) { MOTIVO.valor = 'la ficha no declara el formato de la pieza'; return null; }
  const f = BALDOSAS.formato(parseFloat(m[1]), parseFloat(m[2]));
  if (!f) { MOTIVO.valor = 'el formato no es de los que el catálogo compara'; return null; }

  /* Las piezas por metro cuadrado, tal como las publica la tienda. */
  const pm = n.match(/([\d.]+)\s*\/\s*Mt\b/i);
  if (!pm) { MOTIVO.valor = 'la ficha no declara cuántas piezas hacen un metro cuadrado'; return null; }
  const piezas = parseFloat(pm[1]);
  if (!(piezas > 0 && piezas < 400)) { MOTIVO.valor = 'las piezas por metro cuadrado no son un número creíble'; return null; }

  const mat = /porcelanato/.test(t) ? 'porcelanato' : 'ceramica';
  const uso = /\bpared\b|azulejo|revestimiento/.test(t) ? 'pared'
            : /\bpiso\b|\binterior\b|\bexterior\b|transito|antideslizante/.test(t) ? 'piso' : '';
  if (!uso) { MOTIVO.valor = 'la ficha no declara si la pieza es de piso o de pared'; return null; }

  const spec = BALDOSAS.item('baldosa', { material: mat, uso: uso, formato: f });
  if (!spec) return null;
  /* El ítem se compara por metro cuadrado y la tienda cobra por pieza. */
  spec.factorUnidad = {
    veces: piezas,
    nota: 'La tienda cobra por pieza y declara ' + piezas + ' piezas por m²; aquí va el precio del m²'
  };
  return spec;
}

/* =========================================================
   Plomería
   ========================================================= */

/* El mismo vocabulario de materiales que usa Cima, palabra por palabra,
   para que las dos tiendas caigan en el mismo ítem y se puedan comparar. */
const MATERIAL_CONEXION = [
  [/pvc\s*presion/, 'PVC presión'],
  [/pvc\s*dren/, 'PVC drenaje'],
  [/\bcpvc\b/, 'CPVC'],
  [/\bppr?\b/, 'PPR'],
  [/\bhg\b|galvaniz/, 'HG'],
  [/bronce/, 'bronce'],
  [/cobre/, 'cobre'],
  [/niquelad/, 'niquelado'],
  [/\bpvc\b/, 'PVC'],
  [/\bplast/, 'plástico']
];

function materialDe(n) {
  for (let i = 0; i < MATERIAL_CONEXION.length; i++) {
    if (MATERIAL_CONEXION[i][0].test(n)) return MATERIAL_CONEXION[i][1];
  }
  return '';
}

function tipoConexion(n) {
  if (/^codoniple/.test(n)) return 'codoniple';
  if (/^codo/.test(n)) return /\b45\b/.test(n) ? 'codo-45' : /\b90\b/.test(n) ? 'codo-90' : 'codo';
  if (/^tee/.test(n)) return /reducid/.test(n) ? 'tee-reducida' : 'tee';
  if (/^cruz/.test(n)) return 'cruz';
  if (/^yee/.test(n)) return 'yee';
  if (/^niple/.test(n)) return /reductor/.test(n) ? 'niple-reductor' : 'niple';
  if (/^reduccion/.test(n)) return /\bbus\b|bushing/.test(n) ? 'reduccion-bushing' : 'reduccion';
  if (/^tapon/.test(n)) return /macho/.test(n) ? 'tapon-macho' : /hembra/.test(n) ? 'tapon-hembra' : 'tapon';
  if (/^adaptador/.test(n)) return /macho/.test(n) ? 'adaptador-macho' : /hembra/.test(n) ? 'adaptador-hembra' : 'adaptador';
  if (/^union/.test(n)) return /universal/.test(n) ? 'union-universal' : 'union';
  if (/^coupling/.test(n)) return 'coupling';
  return '';
}

function medidaConexion(a, tipo) {
  const n = baja(a.nombre);
  const nums = numerosDe(a.nombre).filter(v => !(/^codo/.test(n) && (v === '90' || v === '45')));
  if (/mm/i.test(a.nombre)) {
    const mm = limpia(a.nombre).match(/(\d+)\s*mm/gi);
    if (mm) return mm.map(x => x.replace(/\s*mm/i, '') + ' mm').join(' x ');
  }
  const pulg = nums.map(medidaPulg).filter(Boolean);
  if (!pulg.length) return '';
  if (pulg.length >= 2 && /reduc|niple|yee|tee-reducida|adaptador/.test(tipo + ' ' + n)) {
    return pulg[0] + ' x ' + pulg[1];
  }
  return pulg[0];
}

function reglaConexion(a) {
  const n = baja(a.nombre);
  /* «Adaptador Bronce 5 Salidas Bomba Ladrona»: ese 5 son cinco salidas, no
     cinco pulgadas. Un número que viene seguido de lo que cuenta no es una
     medida, y leerlo como tal creaba un adaptador de 5" que no existe. */
  if (/\d+\s*(salidas?|vias?|puertos?)/.test(n)) {
    MOTIVO.valor = 'la pieza se describe por número de salidas, no por medida';
    return null;
  }
  const tipo = tipoConexion(n);
  if (!tipo) { MOTIVO.valor = 'no se reconoce qué pieza de conexión es'; return null; }
  const material = materialDe(n);
  if (!material) { MOTIVO.valor = 'la ficha no declara el material de la conexión'; return null; }
  const medida = medidaConexion(a, tipo);
  if (!medida) { MOTIVO.valor = 'la ficha no declara la medida de la conexión'; return null; }
  return PLOM.item('conexion', { tipo: tipo, material: material, medida: medida });
}

/* «Tubo PVC 3/4" x 19' 160 Lb SDR26 Corvi-Sonaca»: material, diámetro,
   largo y norma. La presión en libras es consecuencia de la norma, así que
   no entra en la clave: SDR-26 ya la dice. */
function reglaTubo(a) {
  const n = limpia(a.nombre);
  const m = n.match(/^Tubo\s+(PVC|CPVC|PPR|Cobre|Acero Inoxidable|Hierro Negro|Aluminio)\s*(Drenaje|Presi[oó]n)?\s*(?:#?\d+\s+)?([\d./\s]+?)\s*(?:"|''|”|mm)?\s*[xX]\s*(\d+(?:\.\d+)?)\s*'/i);
  if (!m) { MOTIVO.valor = 'la ficha no declara el diámetro o el largo del tubo'; return null; }
  const d = medidaPulg(m[3]);
  if (!d) { MOTIVO.valor = 'no se entiende el diámetro del tubo'; return null; }
  const norma = (n.match(/\b(SDR-?\s?\d+(?:\.\d+)?|SCH-?\s?\d+)\b/i) || [])[1];
  const uso = m[2] ? m[2].toLowerCase().replace('ó', 'o') : '';
  const material = m[1].toUpperCase() === m[1] ? m[1] : m[1];
  /* Sin norma no hay tubo: el mismo diámetro en SDR-41 y en SDR-26 son dos
     tubos con dos espesores y casi el doble de precio. El de drenaje es la
     excepción declarada: su norma es el uso. */
  const nm = norma ? norma.toUpperCase().replace(/\s/g, '').replace(/^(SDR|SCH)-?/, '$1-')
           : uso === 'drenaje' ? 'DRENAJE' : '';
  if (!nm) { MOTIVO.valor = 'la ficha no declara la norma del tubo'; return null; }
  return PLOM.item('tubo', {
    material: material, norma: nm, diametro: d, largo_pies: parseFloat(m[4])
  });
}

function reglaPlomeria(a) {
  const t = texto(a);
  const n = limpia(a.nombre);

  if (/^tinaco/.test(t)) {
    const g = numero(t, /(\d+)\s*(?:gls|gl|galones|galon)\b/);
    if (!g) { MOTIVO.valor = 'la ficha no declara la capacidad del tinaco'; return null; }
    return PLOM.item('tinaco', { capacidad_gal: g });
  }
  if (/^cisterna/.test(t)) {
    const g = numero(t, /(\d+)\s*(?:gls|gl|galones|galon)\b/);
    const mat = /plastic|polietilen/.test(t) ? 'plástico' : /fibra/.test(t) ? 'fibra de vidrio' : '';
    if (!g || !mat) { MOTIVO.valor = 'la ficha no declara el material o la capacidad de la cisterna'; return null; }
    return PLOM.item('cisterna', { material: mat, capacidad_gal: g });
  }
  if (/^bomba/.test(t)) {
    const m = n.match(/(\d+(?:\s+\d+\/\d+|\/\d+|\.\d+)?)\s*HP\b/i);
    if (!m) { MOTIVO.valor = 'la ficha no declara la potencia de la bomba'; return null; }
    const tipo = /sumergible/.test(t) ? 'sumergible' : /periferica/.test(t) ? 'periférica'
               : /centrifuga/.test(t) ? 'centrífuga' : '';
    if (!tipo) { MOTIVO.valor = 'la ficha no declara el tipo de bomba'; return null; }
    return PLOM.item('bomba-agua', { tipo: tipo, hp: m[1].replace(/\s+/g, ' ').trim() });
  }
  if (/^cheque/.test(t)) {
    /* Tres cosas distintas se llaman cheque en esta columna: la válvula de
       retención de una instalación, la goma de repuesto de una bomba y el
       cheque industrial de vapor tipo Y de 300 PSI. Juntas daban un ítem de
       RD$ 186 a RD$ 14,826. Entra solo la primera. */
    if (/goma|bomba/.test(t)) { MOTIVO.valor = 'goma de repuesto de bomba, no la válvula de retención'; return null; }
    if (/vapor|psi|tipo y|bronce roscad|industrial/.test(t)) { MOTIVO.valor = 'válvula industrial de vapor, no la de una instalación de vivienda'; return null; }
    if (!/vertical|horizontal/.test(t)) { MOTIVO.valor = 'la ficha no dice si el cheque es vertical u horizontal'; return null; }
    const p = pulgada(n);
    if (!p) { MOTIVO.valor = 'la ficha no declara la medida del cheque'; return null; }
    return PLOM.item('cheque', { medida: p });
  }
  if (/^(llave de paso|llave paso|valvula)/.test(t)) {
    const p = pulgada(n);
    if (!p) { MOTIVO.valor = 'la ficha no declara la medida de la llave'; return null; }
    const tipo = /angular/.test(t) ? 'angular' : /compuerta/.test(t) ? 'compuerta'
               : /bola|esfera/.test(t) ? 'bola' : '';
    if (!tipo) { MOTIVO.valor = 'la ficha no declara el tipo de llave de paso'; return null; }
    const mat = materialDe(t) || 'metal';
    return PLOM.item('llave-paso', { tipo: tipo, material: mat, medida: p });
  }
  if (/^sifon|^cespol/.test(t)) {
    const p = pulgada(n);
    const mat = /\bpvc\b/.test(t) ? 'PVC' : /laton|metal|cromo|inox/.test(t) ? 'metal' : '';
    if (!p || !mat) { MOTIVO.valor = 'la ficha no declara el material o la medida del sifón'; return null; }
    return PLOM.item('sifon', { uso: /frega|cocina/.test(t) ? 'fregadero' : 'lavamanos', material: mat, medida: p });
  }
  if (/^fregadero/.test(t)) {
    const pozos = /doble|2 pozos|dos pozos/.test(t) ? 2 : /sencillo|1 pozo|un pozo/.test(t) ? 1 : null;
    const m = n.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
    if (!pozos || !m) { MOTIVO.valor = 'la ficha no declara los pozos o la medida del fregadero'; return null; }
    return PLOM.item('fregadero', {
      pozos: pozos,
      medida: Math.round(Math.max(+m[1], +m[2])) + ' x ' + Math.round(Math.min(+m[1], +m[2])) + ' pulgadas'
    });
  }
  MOTIVO.valor = 'pieza de plomería que la ficha no describe lo bastante';
  return null;
}

/* =========================================================
   Baños y grifería
   ========================================================= */

/* La misma trampa que en Ferremix: el repuesto lleva el nombre del aparato
   y, si entra, abre el ítem de cientos a decenas de miles. */
const PIEZA_SUELTA = /\bfiltro\b|\bresistencia\b|cartucho|aireador|\bpuno\b|\bpunos\b|maneral|vastago|repuesto|pichorro|chapeton|desviador|\btapa\b|\btapon\b|asiento (para|de) inodoro|sello|empaque|arandela|kit de reparacion|manguera (de|para) (abasto|lavamanos|fregadero|inodoro)|\bflota\b|herraje/;

function reglaBano(a) {
  const t = texto(a);
  const n = limpia(a.nombre);

  if (PIEZA_SUELTA.test(t)) {
    MOTIVO.valor = 'pieza suelta o repuesto del aparato, no la partida completa';
    return null;
  }

  if (/^inodoro/.test(t)) {
    if (/infantil|nino/.test(t)) return BANOS.item('inodoro-infantil', {});
    if (/suspendido|colgado/.test(t)) return BANOS.item('inodoro-suspendido', {});
    if (/one piece|una pieza|monopieza/.test(t)) return BANOS.item('inodoro-una-pieza', {});
    if (/two piece|dos piezas|2 pcs/.test(t)) return BANOS.item('inodoro-dos-piezas', {});
    MOTIVO.valor = 'la ficha no dice si el inodoro es de una pieza, de dos o suspendido';
    return null;
  }
  if (/^lavamanos|^lavabo/.test(t)) {
    const montaje = /pedestal/.test(t) ? 'pedestal'
                  : /empotrar|bajo tope/.test(t) ? 'empotrar'
                  : /sobremesa|sobre tope|sobreponer/.test(t) ? 'sobreponer'
                  : /colgar|pared|suspendido/.test(t) ? 'pared' : '';
    if (!montaje) { MOTIVO.valor = 'la ficha no declara cómo se monta el lavamanos'; return null; }
    return BANOS.item('lavamanos', { montaje: montaje });
  }
  if (/^urinario|^orinal/.test(t)) return BANOS.item('urinario', {});
  if (/^bidet|^bide\b/.test(t)) return BANOS.item('bide', {});
  if (/^(llave mezcladora|mezcladora|monomando)/.test(t)) {
    if (/ducha|regadera/.test(t)) return BANOS.item('ducha-mezcladora', {});
    const uso = /frega|cocina|lavadero|bar\b/.test(t) ? 'fregadero' : 'bano';
    const act = BANOS.activacion(t);
    return BANOS.item('mezcladora', { uso: uso, activacion: act });
  }
  if (/^ducha/.test(t)) {
    if (/telefono|de mano/.test(t)) return BANOS.item('ducha-telefono', {});
    if (/columna|sistema/.test(t)) return BANOS.item('ducha-columna', {});
    if (/brazo|cuello de ganso/.test(t)) return BANOS.item('ducha-brazo', {});
    MOTIVO.valor = 'la ficha no dice qué pieza de la ducha es';
    return null;
  }
  if (/^mueble (de bano|con lavamanos)|^vanity/.test(t)) {
    return BANOS.item('mueble-bano', { montaje: /suspendido|flotante|pared/.test(t) ? 'pared' : 'piso' });
  }
  if (/^banera|^tina de bano|^jacuzzi/.test(t)) return BANOS.item(BANOS.tipoDeBanera(t), { montaje: BANOS.montajeDeBanera(t), material: BANOS.materialDeBanera(t) });
  if (/^barra (de apoyo|de seguridad)/.test(t)) {
    const cm = numero(baja(n), /(\d+(?:\.\d+)?)\s*cm/);
    const med = { forma: /abatible/.test(t) ? 'abatible' : /\ben l\b/.test(t) ? 'en L' : 'recta' };
    if (cm) { const v = BANOS.aCm(cm, 'cm'); if (v) med.largo_cm = v; }
    return BANOS.item('barra-seguridad', med);
  }
  MOTIVO.valor = 'artículo de baño que la ficha no describe lo bastante';
  return null;
}

/* =========================================================
   Electricidad
   ========================================================= */

/* Esta tienda no vende solo la ferretería de una casa: vende también la
   línea industrial y la domótica. En la misma columna conviven un breaker
   enchufable de 15 A a RD$ 430 y uno termomagnético de 1,200 A a RD$
   257,085; un interruptor sencillo de RD$ 56 y uno Wi-Fi con Alexa de RD$
   4,960; un tomacorriente doble de RD$ 79 y uno con dos puertos USB de RD$
   7,250.

   Ninguno de esos pares es «el mismo artículo más caro»: son aparatos
   distintos que el catálogo no compara. Sin esta puerta, el ítem
   «Tomacorriente doble» salía con un rango de RD$ 73 a RD$ 7,583 —103
   veces— y una tabla así no se puede presupuestar. Entra el dispositivo
   corriente de una instalación de vivienda; lo demás se queda fuera y con
   el motivo escrito. */
const FUERA_DOMESTICO = [
  [/smart|wi-?fi|inteligente|bluetooth|z-wave|homekit|alexa|domotic|conectado|inalambric/, 'dispositivo inteligente; el catálogo compara el aparato corriente de una instalación'],
  [/\bdimmer\b|atenuador/, 'atenuador de luz, no el interruptor corriente'],
  [/termo ?magnetic|caja moldeada|\bcvs\d|\bngs\d|\bmdl\d|\bld3\d|\bkd3\d|industrial/, 'aparato industrial de tablero, no de una instalación de vivienda'],
  [/\briel\b|\bdin\b/, 'breaker de riel DIN; el catálogo compara el enchufable'],
  [/\busb\b|supresor|multiple \d+ tomas|\d+ tomas con extension/, 'toma con electrónica incorporada, no el tomacorriente corriente'],
  [/sin ?tapa/, 'el precio es de la pieza sin su tapa'],
  [/^tomacorriente ext\.|^tomacorriente extension/, 'clavija de extensión, no el tomacorriente de pared'],
  [/piloto|temporizador|fotocelda/, 'dispositivo con función añadida, no el corriente'],
  [/\be39\b|\be40\b|\bhid\b|high bay|vapor de|\bg53\b|par-?56/, 'bombillo de base o tecnología industrial, no el de una vivienda'],
  /* La caja de piso es obra civil: se empotra en la losa y trae su tapa
     metálica. A RD$ 7,583 al lado de un tomacorriente de pared de RD$ 75, no
     es el mismo artículo ni de lejos. */
  [/\bpiso\b/, 'caja de piso empotrada, no el dispositivo de pared'],
  [/tomacorriente\s*&|con interruptor|\+ interruptor/, 'combinación de dos dispositivos en una pieza, no el tomacorriente solo'],
  /* «Interruptor Sencillo 2P 32A» no es el de una tecla de pared: es el
     seccionador de un aparato. Los de pared no llevan amperaje escrito. */
  [/^interruptor.*\b\d{2}\s?a\b/, 'seccionador de aparato por amperaje, no el interruptor de pared'],
  [/filamento|torpedo|\bvela\b|\bambar\b|vintage|edison/, 'bombillo decorativo de filamento, no el de iluminación corriente']
];

function reglaElectrico(a) {
  const t = texto(a);
  const n = limpia(a.nombre);
  const w = numero(t, /(\d+(?:\.\d+)?)\s*w\b/);

  for (let i = 0; i < FUERA_DOMESTICO.length; i++) {
    if (FUERA_DOMESTICO[i][0].test(t)) { MOTIVO.valor = FUERA_DOMESTICO[i][1]; return null; }
  }

  if (/^breaker/.test(t)) {
    /* «Grueso» es el enchufable de 1" y «Fino» el de 1/2": los dos son el
       breaker de un panel residencial y valen casi lo mismo —RD$ 430 y RD$
       447 en 15 A—. Todo lo demás en esta columna es de tablero. */
    if (!/grueso|fino|delgado|enchufable/.test(t)) {
      MOTIVO.valor = 'la ficha no dice que sea un breaker enchufable de panel residencial';
      return null;
    }
    const amp = numero(t, /(\d+)\s*a\b/);
    const polos = numero(t, /(\d+)\s*p\b/) || numero(t, /(\d+)\s*polos?/)
                || (/bipolar/.test(t) ? 2 : /monopolar/.test(t) ? 1 : null);
    if (!amp || !polos) { MOTIVO.valor = 'la ficha no declara el amperaje o los polos del breaker'; return null; }
    return ELEC.item('breaker', { polos: polos, amperaje: amp });
  }
  if (/^caja breaker|^panel breaker|^centro de carga/.test(t)) {
    /* «1F 14-24 Circuitos»: el rango es de espacios sencillos a dobles. El
       ítem se define por el número mayor, que es el que la caja admite. */
    const m = n.match(/(?:(\d+)\s*-\s*)?(\d+)\s*Circuitos/i);
    if (!m) { MOTIVO.valor = 'la ficha no declara cuántos espacios tiene la caja'; return null; }
    return ELEC.item('caja-breaker', { espacios: parseInt(m[2], 10) });
  }
  if (/^bombillo/.test(t)) {
    if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del bombillo'; return null; }
    /* «Bombillo Reflector Led 10W PAR-30» es un reflector, no la bombilla de
       una lámpara: su ítem es otro y ya existe. Sin esto entraba en el de 10
       W y lo llevaba de RD$ 159 a RD$ 2,575. */
    if (/reflector|par-?\d+|dicroic|\bmr16\b|\bar111\b/.test(t)) {
      if (!/\bled\b/.test(t)) { MOTIVO.valor = 'el catálogo solo compara reflectores LED'; return null; }
      return ELEC.item('reflector-led', { potencia_w: w });
    }
    const tec = /\bled\b/.test(t) ? 'led'
              : /halogen/.test(t) ? 'halógeno'
              : /fluorescent|ahorrador|bajo consumo|compacto/.test(t) ? 'bajo consumo'
              : /incandescen|filamento|huevo paloma/.test(t) ? 'incandescente' : '';
    if (!tec) { MOTIVO.valor = 'la ficha no declara la tecnología del bombillo'; return null; }
    /* El bombillo de piscina, el de vapor de sodio y el vial son de
       instalación especial y no comparan con el de una vivienda. */
    if (/piscina|vapor (de )?sodio|vapor (de )?mercurio|metal halide|aditivo metalico|vial/.test(t)) {
      MOTIVO.valor = 'bombillo de instalación especial; el catálogo no tiene esa partida';
      return null;
    }
    return ELEC.item('bombillo', { tecnologia: tec, potencia_w: w });
  }
  if (/^reflector/.test(t)) {
    if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del reflector'; return null; }
    if (!/\bled\b/.test(t)) { MOTIVO.valor = 'el catálogo solo compara reflectores LED'; return null; }
    /* El solar de jardín y el RGB de piscina o fachada no son el reflector
       de obra: traen panel, batería o control de color, y el precio es de
       eso. Juntos daban un ítem de RD$ 93 a RD$ 4,060 en 5 W. */
    if (/solar|\brgb\b|multicolor|con control/.test(t)) {
      MOTIVO.valor = 'reflector solar o de color; el catálogo compara el reflector de obra';
      return null;
    }
    return ELEC.item('reflector-led', { potencia_w: w });
  }
  if (/^tubo led|^tubo fluorescente/.test(t)) {
    if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del tubo'; return null; }
    if (!/\bled\b/.test(t)) { MOTIVO.valor = 'el catálogo solo compara tubos LED'; return null; }
    return ELEC.item('tubo-led', { potencia_w: w });
  }
  if (/^panel led/.test(t)) {
    if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del panel'; return null; }
    const montaje = /empotr/.test(t) ? 'empotrar' : /sobreponer|adosad|superficie/.test(t) ? 'sobreponer' : '';
    const forma = /cuadrad/.test(t) ? 'cuadrado' : /redond|circular/.test(t) ? 'redondo' : '';
    if (!montaje || !forma) { MOTIVO.valor = 'la ficha no declara el montaje o la forma del panel'; return null; }
    return ELEC.item('panel-led', { montaje: montaje, forma: forma, potencia_w: w });
  }
  if (/^interruptor/.test(t)) {
    /* El de superficie va montado sobre la pared, con su cajita: es otra
       pieza y otro montaje. El de cuatro vías es el intermedio de un
       circuito de tres puntos, que el catálogo no tiene como partida.
       Los dos se colaban dentro de «sencillo» y lo abrían 27 veces. */
    if (/superficie|sobreponer/.test(t)) { MOTIVO.valor = 'interruptor de superficie, no el empotrado de pared'; return null; }
    if (/4 ?way|cuatro vias/.test(t)) { MOTIVO.valor = 'interruptor de cuatro vías; el catálogo no tiene esa partida'; return null; }
    const tipo = /triple/.test(t) ? 'triple' : /doble/.test(t) ? 'doble'
               : /3 ?way|tres vias|conmutad/.test(t) ? 'conmutador'
               : /sencillo|simple/.test(t) ? 'sencillo' : '';
    if (!tipo) { MOTIVO.valor = 'la ficha no declara cuántas teclas tiene el interruptor'; return null; }
    return ELEC.item('interruptor', { tipo: tipo });
  }
  if (/^tomacorriente/.test(t)) {
    if (/maquina soldar|secadora|estufa|industrial/.test(t)) {
      MOTIVO.valor = 'tomacorriente de fuerza para equipo, no el de una instalación de vivienda';
      return null;
    }
    if (/sin tapa/.test(t)) { MOTIVO.valor = 'el precio es de la pieza sin su tapa'; return null; }
    /* «Falla/Tierra», «Falla a Tierra» y GFCI son lo mismo, y hay que
       reconocerlo ANTES que el «doble» del nombre: un GFCI cuesta veinte
       veces un tomacorriente corriente. */
    const tipo = /gfci|falla ?[\/ ]? ?(a )?tierra/.test(t) ? 'gfci'
               : /doble/.test(t) ? 'doble' : /sencillo/.test(t) ? 'sencillo' : '';
    if (!tipo) { MOTIVO.valor = 'la ficha no declara el tipo de tomacorriente'; return null; }
    return ELEC.item('tomacorriente', { tipo: tipo });
  }
  if (/^alambre electrico|^cable thhn|^alambre thhn/.test(t)) {
    /* «Alambre Eléctrico Trenzado 12 THHN Amarillo · RD$ 15.07». El ítem del
       catálogo va por rollo de 100 pies y ese precio es, casi seguro, el del
       pie: Ferretería MC cotiza el mismo #12 a RD$ 13.68 el pie y declara la
       unidad en su referencia. Pero «casi seguro» no es una unidad, y la
       ficha de esta tienda no la declara en ningún campo.

       Publicarlo como rollo lo pondría cien veces por debajo, que es
       exactamente el error que este catálogo acaba de corregir en otros
       diecinueve calibres. Sin unidad declarada, no entra. */
    MOTIVO.valor = 'la ficha no declara si el precio es por pie o por rollo';
    return null;
  }
  MOTIVO.valor = 'artículo eléctrico que la ficha no describe lo bastante';
  return null;
}

/* =========================================================
   Pintura
   ========================================================= */

/* Solo uno de cada diez artículos de pintura declara el envase. El resto lo
   lleva escondido en el código del fabricante —«Barniz Popular Natural
   Brillo 066021» y «066022» son el cuarto y el galón, a RD$ 504 y RD$
   1,617— y deducir el envase de la última cifra de un código sería
   inventarnos la partida. Sin envase declarado, no entra. */
function envasePintura(n) {
  const t = baja(n);
  let m = t.match(/(\d+(?:\.\d+)?)\s*(?:gl|gal|galon|galones)\b/);
  if (m) return PINTURA.aEnvase(parseFloat(m[1]));
  m = t.match(/\b(\d+)\s*\/\s*(\d+)\s*(?:gl|gal|galon)\b/);
  if (m) return PINTURA.aEnvase(parseFloat(m[1]) / parseFloat(m[2]));
  if (/\bcubeta\b/.test(t)) return PINTURA.aEnvase(5);
  if (/\bcuarto\b/.test(t)) return PINTURA.aEnvase(0.25);
  m = t.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|libras?)\b/);
  if (m) return PINTURA.aEnvasePeso(parseFloat(m[1]));
  m = t.match(/(\d+(?:\.\d+)?)\s*kg\b/);
  if (m) return PINTURA.aEnvasePeso(parseFloat(m[1]) / 0.45359237);
  return null;
}

const TIPO_PINTURA = t =>
  /impermeabiliz|sellador de techo|antihumedad|hidrorepel/.test(t) ? 'impermeabilizante' :
  /anticorros|antioxid/.test(t) ? 'anticorrosiva' :
  /trafico|senalizacion vial/.test(t) ? 'de tráfico' :
  /epoxic|epoxi/.test(t) ? 'epóxica' :
  /masilla/.test(t) ? (/sheetrock|drywall|yeso/.test(t) ? 'masilla para sheetrock' : 'masilla') :
  /primer|fijador|base coat/.test(t) ? 'primer' :
  /esmalte|aceite|oleo/.test(t) ? 'esmalte' :
  /acrilic|latex|vinil/.test(t) ? 'acrílica' : null;

function reglaPintura(a) {
  const t = texto(a);
  if (/spray|aerosol|thinner|disolvente|removedor|tinte|colorante|barniz|laca/.test(t)) {
    MOTIVO.valor = 'producto de acabado que el catálogo no tiene como partida';
    return null;
  }
  const tipo = TIPO_PINTURA(t);
  if (!tipo) { MOTIVO.valor = 'la ficha no dice qué tipo de pintura es'; return null; }
  const env = envasePintura(a.nombre);
  if (!env) { MOTIVO.valor = 'la ficha no declara el envase; el comercio lo cifra en el código del fabricante'; return null; }
  return PINTURA.item('pintura', { tipo: tipo, envase: env });
}

/* =========================================================
   Madera
   ========================================================= */

/* «Plywood Okume 4' x 8' x 1/2" 12mm MR»: especie, formato y espesor. */
function reglaPlywood(a) {
  const n = limpia(a.nombre);
  const m = n.match(/(\d+)\s*'\s*[xX]\s*(\d+)\s*'\s*[xX]\s*([\d\s/]+?)\s*(?:"|''|”)/);
  if (!m) { MOTIVO.valor = 'la ficha no declara el formato o el espesor de la plancha'; return null; }
  const e = medidaPulg(m[3]);
  if (!e) { MOTIVO.valor = 'no se entiende el espesor de la plancha'; return null; }
  const t = texto(a);
  const material = /okume/.test(t) ? 'Plywood de okume'
                 : /encofrar|formaleta/.test(t) ? 'Plywood de formaleta'
                 : /pino/.test(t) ? 'Plywood de pino'
                 : /mdf/.test(t) ? 'Plywood MDF'
                 : /decorativo/.test(t) ? 'Plywood decorativo' : '';
  if (!material) { MOTIVO.valor = 'la ficha no declara de qué es la plancha'; return null; }
  const spec = MADERA.item('panel', {
    material: material, espesor: e, formato: m[1] + ' x ' + m[2] + ' pies'
  });
  if (spec && MADERA.YA_EXISTE[spec.clave]) return { existente: MADERA.YA_EXISTE[spec.clave] };
  return spec;
}

/* =========================================================
   El despachador
   ========================================================= */

/* La lista blanca. Sin columna de categoría, el sustantivo con el que
   empieza el nombre es lo único que dice de qué familia es la pieza, así
   que es él quien decide a qué regla va. Lo que no empieza por una de
   estas palabras no se descarta: ni se mira. Es una ferretería completa y
   la mayor parte de lo que vende —herramienta, hogar, automotriz,
   jardinería, tornillería— no es una partida de obra. */
const RUTA = [
  [/^varilla\b/, reglaVarilla],
  [/^zinc\b/, reglaZinc],
  [/^(ceramica|porcelanato)\b/, reglaBaldosa],
  [/^tubo\b/, reglaTubo],
  [/^(codo|codoniple|tee|cruz|yee|niple|reduccion|tapon|adaptador|union|coupling)\b/, reglaConexion],
  [/^(tinaco|cisterna|bomba|cheque|llave de paso|llave paso|valvula|sifon|cespol|fregadero)\b/, reglaPlomeria],
  [/^(inodoro|lavamanos|lavabo|urinario|orinal|bidet|bide|llave mezcladora|mezcladora|monomando|ducha|mueble de bano|mueble con lavamanos|vanity|banera|tina de bano|jacuzzi|barra de apoyo|barra de seguridad)\b/, reglaBano],
  [/^(breaker|caja breaker|panel breaker|centro de carga|bombillo|reflector|tubo led|panel led|interruptor|tomacorriente|alambre electrico|cable thhn|alambre thhn)\b/, reglaElectrico],
  [/^(pintura|esmalte|masilla|primer|sellador|impermeabilizante|barniz|laca)\b/, reglaPintura],
  [/^plywood\b/, reglaPlywood]
];

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) return undefined;

  const t = texto(a);

  for (let i = 0; i < TRAMPAS.length; i++) {
    if (TRAMPAS[i][0].test(t)) { MOTIVO.valor = TRAMPAS[i][1]; return null; }
  }

  /* Un precio por varias unidades no compara con uno por pieza, y la
     diferencia no se ve en la tabla. «(At. 34/1)» es el atado de la varilla
     y no es eso: ahí el precio publicado sigue siendo por unidad. */
  /* Ojo con las dos que NO son paquetes: «11Pcs/Cjs» son las piezas que trae
     la caja de cerámica —el precio sigue siendo por pieza— y «2 Pcs» en un
     inodoro quiere decir de dos piezas. Descartarlas costaba 1,479
     artículos buenos. */
  if ((/\b(?:juego|set|pack|combo|kit) de \d+\b|\b\d+\s*(?:pzas?|piezas|unidades)\b/.test(t)
       || (/\d+\s*pcs\b/.test(t) && !/pcs\s*\/\s*(cjs|caja)/.test(t) && !/^inodoro/.test(t)))
      && !/^varilla/.test(t)) {
    MOTIVO.valor = 'el precio cubre un paquete de varias unidades, no una';
    return null;
  }

  for (let i = 0; i < RUTA.length; i++) {
    if (RUTA[i][0].test(t)) return RUTA[i][1](a);
  }
  return undefined;                       // no es de las familias que sabemos leer
}

module.exports = { regla, MOTIVO, TRAMPAS, RUTA };
