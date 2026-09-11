'use strict';
/* =========================================================
   reglas-ferremix.js — el catálogo de ferremix.com.do

   12,583 filas y 8,984 productos: el más extenso del
   directorio y, de lejos, el más sucio. Ferremix ya estaba
   como comercio con dos precios levantados a mano; esta
   extracción lo convierte en fuente completa.

   EL NOMBRE ESTÁ ROTO; EL SLUG NO
   -------------------------------
   La columna «Producto» viene con letras comidas —«Ceramia»,
   «Boma», «Tomacorriene», «Bomillo», «Lave», «Valula»— en
   cientos de artículos. Escribir expresiones contra eso sería
   clasificar mal en silencio, que es lo peor que puede pasarle
   a este catálogo.

   Pero el slug de la URL trae el nombre del propio comercio
   bien escrito: «Boma periférica para agua de 1/2 hp» vive en
   /products/bomba-periferica-1-2hp-altura-max-30m-uso-agricola.
   Las reglas leen los dos: el slug para saber QUÉ es la pieza,
   y el nombre original para las medidas, porque el slug
   convierte las barras en espacios y «1/2» se vuelve «1 2».
   Cuando los dos discrepan sobre la medida, no entra.

   QUÉ SE MIRA Y QUÉ NO
   --------------------
   De sus 21 departamentos solo siete tienen partidas de obra:
   plomería, baños y grifería, electricidad, iluminación,
   pinturas, pisos y materiales de construcción. Herramientas,
   hogar, automotriz, tornillos, jardinería, maquinaria,
   cerrajería y los 3,511 artículos «sin departamento» quedan
   fuera enteros y con su motivo: son una ferretería general, no
   una lista de materiales.
   ========================================================= */

const BALDOSAS = require('./especificacion-baldosas.js');
const BANOS = require('./especificacion-banos.js');
const PLOM = require('./especificacion-plomeria.js');
const ELEC = require('./especificacion-electricos.js');
const PINTURA = require('./especificacion-pintura.js');

const MOTIVO = { valor: '' };

const baja = s => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');

/* El nombre del comercio, tal como lo escribió en su propia URL. */
function slug(a) {
  const m = String(a.url || '').match(/\/products\/([^/?#]+)/);
  if (!m) return '';
  try { return decodeURIComponent(m[1]).replace(/-/g, ' ').replace(/\s+/g, ' ').trim(); }
  catch (e) { return m[1].replace(/-/g, ' '); }
}

/* Para saber qué es la pieza: el slug manda, el nombre roto acompaña. */
const texto = a => baja(slug(a) + ' ' + a.nombre + ' ' + a.variante + ' ' + a.linea);

/* Para las medidas: el nombre original y la columna de medida, que
   conservan las barras de las fracciones. */
const medido = a => baja(a.nombre + ' ' + a.medida + ' ' + a.variante);

/* =========================================================
   Departamentos que no entran
   ========================================================= */

const FUERA = {
  'Sin departamento': 'la tienda no lo clasifica y su ficha no basta para saber qué es',
  Herramientas: 'herramienta de ferretería general, no partida de obra',
  'Hogar y decoración': 'artículo de hogar, no material de obra',
  Automotriz: 'artículo de automóvil, no material de obra',
  Maquinarias: 'maquinaria de taller, no partida de obra',
  Cerrajería: 'cerrajería de ferretería general; el catálogo no tiene esa partida',
  Jardinería: 'artículo de jardín, no material de obra',
  Tornillos: 'tornillería suelta; el catálogo no compara fijaciones por pieza',
  'Seguridad Industrial': 'equipo de protección personal; el catálogo no tiene esa partida',
  Escolares: 'artículo escolar, no material de obra',
  'Deporte y recreación': 'artículo deportivo, no material de obra',
  Ventilación: 'el catálogo no tiene todavía partida de ventilación',
  'Piscinas y jacuzzi': 'equipo de piscina; el catálogo no tiene esa partida',
  Herrería: 'perfil de herrería que esta tienda no mide en su ficha'
};

/* =========================================================
   Medidas
   ========================================================= */

/* Las fracciones del nombre original: 1/2, 3/4, 1 1/2… */
function pulgada(t) {
  const m = t.match(/(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(?:"|''|pulg|pulgada)/);
  if (m) return m[1].replace(/\s+/g, ' ').trim() + '"';
  /* Sin comillas: «codo pvc 1/2» es media pulgada igual. */
  const f = t.match(/\b(\d+\s+\d+\/\d+|\d+\/\d+)\b/);
  return f ? f[1].replace(/\s+/g, ' ').trim() + '"' : null;
}

function numero(t, re) { const m = t.match(re); return m ? parseFloat(m[1]) : null; }

/* =========================================================
   Pinturas
   ========================================================= */

const TIPO_PINTURA = t =>
  /impermeabiliz|sellador de techo|antihumedad|hidrorepel/.test(t) ? 'impermeabilizante' :
  /anticorros|antioxid/.test(t) ? 'anticorrosiva' :
  /trafico|senalizacion vial/.test(t) ? 'de tráfico' :
  /epoxic|epoxi/.test(t) ? 'epóxica' :
  /masilla/.test(t) ? (/sheetrock|drywall|yeso/.test(t) ? 'masilla para sheetrock' : 'masilla') :
  /primer|fijador|sellador acrilic|base coat/.test(t) ? 'primer' :
  /esmalte|oleo|oil/.test(t) ? 'esmalte' :
  /acrilic|latex|vinil|pintura elite|pintura ultra/.test(t) ? 'acrílica' : null;

function envasePintura(a) {
  const t = medido(a) + ' ' + baja(slug(a));
  let m = t.match(/(\d+(?:\.\d+)?)\s*(?:gl|gal|galon|galones)\b/);
  if (m) return PINTURA.aEnvase(parseFloat(m[1]));
  m = t.match(/\b(\d+)\s*\/\s*(\d+)\s*(?:gl|gal|galon)\b/);
  if (m) return PINTURA.aEnvase(parseFloat(m[1]) / parseFloat(m[2]));
  if (/\bcubeta\b/.test(t)) return PINTURA.aEnvase(5);
  if (/\bpinta\b/.test(t)) return PINTURA.aEnvase(0.125);
  if (/\bcuarto\b/.test(t)) return PINTURA.aEnvase(0.25);
  m = t.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|libras?)\b/);
  if (m) return PINTURA.aEnvasePeso(parseFloat(m[1]));
  m = t.match(/(\d+(?:\.\d+)?)\s*kg\b/);
  if (m) return PINTURA.aEnvasePeso(parseFloat(m[1]) / 0.45359237);
  return null;
}

function reglaPintura(a) {
  const t = texto(a);
  if (/brocha|rodillo|mota|espatula|bandeja|porta ?rolo/.test(t)) {
    const tipo = /brocha/.test(t) ? 'brocha' : /rodillo|mota|porta ?rolo/.test(t) ? 'rodillo'
               : /espatula/.test(t) ? 'espatula' : 'bandeja';
    const p = pulgada(medido(a));
    if (!p) { MOTIVO.valor = 'la ficha no declara la medida de la herramienta'; return null; }
    return PINTURA.item('herramienta-pintura', { tipo: tipo, medida_pulg: p.replace('"', '') });
  }
  if (/silicon|sellador acrilic|pistola|repuesto|vaso de repuesto|thinner|disolvente|removedor|spray|aerosol/.test(t)) {
    MOTIVO.valor = 'consumible o herramienta de pintor que el catálogo no tiene como partida';
    return null;
  }
  const tipo = TIPO_PINTURA(t);
  if (!tipo) { MOTIVO.valor = 'la ficha no dice qué tipo de pintura es'; return null; }
  const env = envasePintura(a);
  if (!env) { MOTIVO.valor = 'la ficha no declara el envase, que es lo que define la partida'; return null; }
  return PINTURA.item('pintura', { tipo: tipo, envase: env });
}

/* =========================================================
   Pisos
   ========================================================= */

function reglaPiso(a) {
  const t = texto(a);
  if (/clip|nivelador|separador|cruceta/.test(t)) {
    const e = numero(medido(a), /(\d+(?:\.\d+)?)\s*mm/);
    if (!e) { MOTIVO.valor = 'la ficha no declara el espesor de junta del nivelador'; return null; }
    return BALDOSAS.item('nivelador-ceramica', { pieza: 'clip', espesor_mm: e });
  }
  const m = medido(a).match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
  if (!m) { MOTIVO.valor = 'la ficha no declara el formato de la pieza'; return null; }
  const f = BALDOSAS.formato(parseFloat(m[1]), parseFloat(m[2]));
  if (!f) { MOTIVO.valor = 'la ficha no declara el formato de la pieza'; return null; }
  const mat = /porcelan/.test(t) || a.cat2 === 'Porcelanato' ? 'porcelanato' : 'ceramica';
  const uso = /\bpared\b|revestimiento|azulejo/.test(t) ? 'pared'
            : /\bpiso\b|pavimento|suelo/.test(t) ? 'piso' : null;
  if (!uso) { MOTIVO.valor = 'la ficha no declara si la pieza es de piso o de pared'; return null; }
  return BALDOSAS.item('baldosa', { material: mat, uso: uso, formato: f });
}

/* =========================================================
   Plomería
   ========================================================= */

function reglaPlomeria(a) {
  const t = texto(a);
  const md = medido(a);

  if (/bomba (periferica|centrifuga|sumergible|de agua)|motobomba/.test(t)) {
    const hp = numero(md, /(\d+(?:\s+\d+\/\d+|\/\d+|\.\d+)?)\s*hp/) ||
               (/(\d+)\s*\/\s*(\d+)\s*hp/.test(md) ? null : null);
    const fr = md.match(/(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*hp/);
    const potencia = fr ? fr[1].replace(/\s+/g, ' ').trim() : null;
    if (!potencia) { MOTIVO.valor = 'la ficha no declara la potencia de la bomba'; return null; }
    const tipo = /sumergible/.test(t) ? 'sumergible' : /periferica/.test(t) ? 'periférica' : 'centrífuga';
    return PLOM.item('bomba-agua', { tipo: tipo, hp: potencia });
  }
  if (/\btinaco\b|tanque de agua/.test(t)) {
    const g = numero(md, /(\d+)\s*(?:gls|gal|galones)/);
    if (!g) { MOTIVO.valor = 'la ficha no declara la capacidad del tinaco'; return null; }
    return PLOM.item('tinaco', { capacidad_gal: g });
  }
  if (/calentador/.test(t)) {
    MOTIVO.valor = 'calentador que la ficha no describe lo bastante (energía y capacidad)';
    return null;
  }
  if (/fregadero/.test(t)) {
    const pozos = /doble|2 ?pozos|dos pozos/.test(t) ? 2 : /sencillo|1 ?pozo|un pozo/.test(t) ? 1 : null;
    if (!pozos) { MOTIVO.valor = 'la ficha no declara cuántos pozos tiene el fregadero'; return null; }
    const m = md.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
    if (!m) { MOTIVO.valor = 'la ficha no declara la medida del fregadero'; return null; }
    const pulg = v => Math.round(v / (v > 120 ? 25.4 : v > 40 ? 2.54 : 1));
    return PLOM.item('fregadero', {
      pozos: pozos,
      medida: pulg(Math.max(+m[1], +m[2])) + ' x ' + pulg(Math.min(+m[1], +m[2])) + ' pulgadas'
    });
  }
  if (/sifon|cespol/.test(t)) {
    const p = pulgada(md);
    const mat = /\bpvc\b/.test(t) ? 'PVC' : /laton|metal|cromo|inox/.test(t) ? 'metal' : null;
    if (!p || !mat) { MOTIVO.valor = 'la ficha no declara el material o la medida del sifón'; return null; }
    return PLOM.item('sifon', { uso: /frega|cocina/.test(t) ? 'fregadero' : 'lavamanos', material: mat, medida: p });
  }
  if (/resumidero|rejilla de piso/.test(t)) {
    const m = md.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
    if (!m) { MOTIVO.valor = 'la ficha no declara la medida de la rejilla'; return null; }
    return PLOM.item('rejilla-piso', { medida: m[1] + ' x ' + m[2] + '"' });
  }
  if (/llave de paso|llave angular|valvula de bola|valvula de compuerta|valvula de paso/.test(t)) {
    const p = pulgada(md);
    if (!p) { MOTIVO.valor = 'la ficha no declara la medida de la llave'; return null; }
    const tipo = /angular/.test(t) ? 'angular' : /compuerta/.test(t) ? 'compuerta' : 'bola';
    const mat = /\bpvc\b/.test(t) ? 'PVC' : /laton|bronce/.test(t) ? 'latón' : /\bcpvc\b/.test(t) ? 'CPVC' : 'metal';
    return PLOM.item('llave-paso', { tipo: tipo, material: mat, medida: p });
  }
  if (/^tubo|tuberia/.test(t)) {
    MOTIVO.valor = 'la ficha no declara la norma ni el largo del tubo';
    return null;
  }
  if (/codo|tee\b|reduccion|union|adaptador|copa|tapon|niple|yee\b/.test(t)) {
    MOTIVO.valor = 'conexión que la ficha no describe lo bastante (material, tipo y medida)';
    return null;
  }
  MOTIVO.valor = 'pieza de plomería que la ficha no describe lo bastante';
  return null;
}

/* =========================================================
   Baños y grifería
   ========================================================= */

/* Las piezas sueltas del aparato llevan su nombre —«cartucho para
   mezcladoras», «puño para monomando», «vástago para llave de lavamanos»— y
   si se cuelan en el ítem del aparato lo abren de RD$ 49 a RD$ 83,000. Van
   primero, antes de que ninguna otra expresión las reclame. */
/* «Filtro HEPA para secador de manos» entraba como secador y metía un
   repuesto de 849 en una partida de 27,000. El patrón «X para <aparato>»
   es el que delata al repuesto: la pieza es la X, no el aparato. */
/* Y el mismo patrón por el otro lado: cuando el nombre EMPIEZA por la
   pieza, el artículo es la pieza. «Porta baterías para mezcladora de
   sensor» y «Válvula solenoide para mezcladora de sensor» entraban como
   mezcladoras con sensor y ponían el mínimo de esa partida en RD$ 740 y
   RD$ 2,339, contra una mediana de casi RD$ 7,000. El catálogo de
   Ferremix escribe mal las dos —«ara» y «Válula»—, así que la letra que
   les falta va opcional. */
const EMPIEZA_PIEZA = /^(?:porta ?bater[ií]as?|v[aá]l?[uv]+la|solenoide|electrov[aá]l[uv]+la)\b/;

const PIEZA_SUELTA = /\bfiltro\b|\bresistencia\b|(?:^|\s)(?:motor|bomba) para |cartucho|aireador|\bpuno\b|\bpunos\b|maneral|vastago|cuello de repuesto|repuesto|pichorro|chapeton|desviador|\btapa\b|\btapon\b|asiento para inodoro|sello|empaque|arandela|kit de reparacion|salida de tina|manguera (de|para) (abasto|lavamanos|lavabo|fregadero|inodoro)|manguera flexible|manguera acero/;

function reglaBano(a) {
  const t = texto(a);

  if (PIEZA_SUELTA.test(t) || EMPIEZA_PIEZA.test(t)) {
    MOTIVO.valor = 'pieza suelta o repuesto del aparato, no la partida completa';
    return null;
  }
  if (/mueble con lavamanos|mueble de lavamanos/.test(t)) {
    return BANOS.item('mueble-bano', { montaje: /suspendido|flotante|pared/.test(t) ? 'pared' : 'piso' });
  }

  if (/mezcladora|monomando|griferia|\bgrifo\b/.test(t)) {
    if (/ducha|regadera|empotrar/.test(t)) return BANOS.item('ducha-mezcladora', {});
    const act = BANOS.activacion(t);
    const uso = /frega|cocina|lavadero/.test(t) ? 'fregadero' : 'bano';
    return BANOS.item('mezcladora', { uso: uso, activacion: act });
  }
  if (/^regadera|cabezal de ducha|ducha (cuadrada|redonda|tipo lluvia)/.test(t)) {
    const c = BANOS.cabezalDeDucha(t);
    return BANOS.item(c.familia, c.medidas);
  }
  if (/ducha telefono|ducha de mano|regadera de mano/.test(t)) return BANOS.item('ducha-telefono', {});
  if (/brazo (de|para) ducha|cuello de ganso/.test(t)) return BANOS.item('ducha-brazo', {});
  if (/columna de ducha|sistema de ducha/.test(t)) return BANOS.item('ducha-columna', {});
  if (/manguera (de|para) ducha/.test(t)) return BANOS.item('ducha-manguera', {});

  if (/inodoro|sanitario de loza|taza de bano/.test(t)) {
    if (/infantil|nino/.test(t)) return BANOS.item('inodoro-infantil', {});
    if (/suspendido|colgado/.test(t)) return BANOS.item('inodoro-suspendido', {});
    if (/una pieza|monopieza|one piece/.test(t)) return BANOS.item('inodoro-una-pieza', {});
    if (/dos piezas|two piece/.test(t)) return BANOS.item('inodoro-dos-piezas', {});
    MOTIVO.valor = 'la ficha no dice si el inodoro es de una pieza, de dos o suspendido';
    return null;
  }
  if (/lavamanos|lavabo/.test(t)) {
    const montaje = /pedestal/.test(t) ? 'pedestal' : /empotr|bajo tope/.test(t) ? 'empotrar'
                  : /colgar|pared|suspendido/.test(t) ? 'pared' : /sobre ?poner|sobre tope/.test(t) ? 'sobreponer' : '';
    return BANOS.item('lavamanos', { montaje: montaje });
  }
  if (/mueble de bano|gabinete de bano|vanity/.test(t)) {
    return BANOS.item('mueble-bano', { montaje: /suspendido|flotante|pared/.test(t) ? 'pared' : 'piso' });
  }
  if (/espejo/.test(t)) return BANOS.item('espejo', { luz: /led|luz/.test(t) ? 'led' : '' });
  if (/urinario|orinal/.test(t)) return BANOS.item('urinario', {});
  if (/\bbidet\b|\bbide\b/.test(t)) return BANOS.item('bide', {});
  if (/banera|tina de bano|jacuzzi/.test(t)) return BANOS.item(BANOS.tipoDeBanera(t), { montaje: BANOS.montajeDeBanera(t), material: BANOS.materialDeBanera(t) });
  if (/barra de (apoyo|seguridad)/.test(t)) {
    const cm = numero(medido(a), /(\d+(?:\.\d+)?)\s*cm/);
    const med = { forma: /abatible/.test(t) ? 'abatible' : /\ben l\b|"l"/.test(t) ? 'en L' : 'recta' };
    if (cm) { const v = BANOS.aCm(cm, 'cm'); if (v) med.largo_cm = v; }
    return BANOS.item('barra-seguridad', med);
  }
  if (/secador de manos/.test(t)) return BANOS.item('secador-manos',
    { ambito: BANOS.ambito(t), activacion: /sensor|automatic/.test(t) ? 'sensor' : '' });
  if (/dispensador (de|para) jabon/.test(t)) return BANOS.item('dispensador-jabon',
    { ambito: BANOS.ambito(t), activacion: /sensor|automatic/.test(t) ? 'sensor' : '' });
  if (/juego de accesorios|set de accesorios/.test(t)) {
    const p = t.match(/(\d+)\s*(?:pza|pzas|piezas)/);
    return BANOS.item('juego-accesorios',
      Object.assign({ ambito: BANOS.ambito(t) }, p ? { piezas: parseInt(p[1], 10) } : {}));
  }
  if (/toallero|jabonera|portarrollo|porta rollo|gancho|percha|papelera|escobillero|repisa|vaso/.test(t)) {
    MOTIVO.valor = 'accesorio suelto de baño; el catálogo compara juegos, no piezas sueltas';
    return null;
  }
  if (/vastago|puno|cartucho|repuesto|asiento|tapa/.test(t)) {
    MOTIVO.valor = 'repuesto de consumidor, no partida de obra';
    return null;
  }
  MOTIVO.valor = 'artículo de baño que la ficha no describe lo bastante';
  return null;
}

/* =========================================================
   Electricidad e iluminación
   ========================================================= */

function reglaElectrico(a) {
  const t = texto(a);
  const md = medido(a);

  /* «Tapa blanca para interruptor doble» es la placa, no el interruptor: son
     dos partidas y se llevan diez veces de precio. */
  if (/^tapa\b|\bplaca (armada|ciega|para)/.test(t)) {
    const tipo = /triple/.test(t) ? 'triple' : /doble/.test(t) ? 'doble'
               : /ciega/.test(t) ? 'ciega' : /sencilla|simple/.test(t) ? 'sencilla' : null;
    if (!tipo) { MOTIVO.valor = 'la ficha no declara cuántos huecos tiene la placa'; return null; }
    return ELEC.item('placa-electrica', { tipo: tipo });
  }
  const w = numero(md, /(\d+(?:\.\d+)?)\s*(?:w|watts?|vatios?)\b/);

  if (/bombillo|bombilla|foco led/.test(t)) {
    if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del bombillo'; return null; }
    const tec = /\bled\b/.test(t) ? 'led' : /halogen/.test(t) ? 'halógeno'
              : /bajo consumo|ahorrador|fluorescent/.test(t) ? 'bajo consumo'
              : /incandescen|vintage|filamento/.test(t) ? 'incandescente' : null;
    if (!tec) { MOTIVO.valor = 'la ficha no declara la tecnología del bombillo'; return null; }
    return ELEC.item('bombillo', { tecnologia: tec, potencia_w: w });
  }
  if (/reflector|proyector led/.test(t)) {
    if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del reflector'; return null; }
    return ELEC.item('reflector-led', { potencia_w: w });
  }
  if (/tubo (de )?led/.test(t)) {
    if (!w) { MOTIVO.valor = 'la ficha no declara la potencia del tubo'; return null; }
    return ELEC.item('tubo-led', { potencia_w: w });
  }
  if (/panel led|plafon led|luminario|lampara (cuadrada|redonda)/.test(t)) {
    if (!w) { MOTIVO.valor = 'la ficha no declara la potencia de la luminaria'; return null; }
    const montaje = /empotr/.test(t) ? 'empotrar' : /sobre ?poner|adosad/.test(t) ? 'sobreponer' : null;
    const forma = /cuadrad/.test(t) ? 'cuadrado' : /redond|circular/.test(t) ? 'redondo' : null;
    if (!montaje || !forma) { MOTIVO.valor = 'la ficha no declara el montaje o la forma del panel'; return null; }
    return ELEC.item('panel-led', { montaje: montaje, forma: forma, potencia_w: w });
  }
  if (/interruptor/.test(t)) {
    const tipo = /triple/.test(t) ? 'triple' : /doble/.test(t) ? 'doble'
               : /sencillo|simple/.test(t) ? 'sencillo' : /conmutad|tres vias|3 vias/.test(t) ? 'conmutador' : null;
    if (!tipo) { MOTIVO.valor = 'la ficha no declara cuántas teclas tiene el interruptor'; return null; }
    return ELEC.item('interruptor', { tipo: tipo });
  }
  if (/tomacorriente|toma corriente/.test(t)) {
    if (/con (tapa y )?caja|incluye caja/.test(t)) {
      MOTIVO.valor = 'el precio cubre el tomacorriente con su caja, no la pieza sola';
      return null;
    }
    const tipo = /doble/.test(t) ? 'doble' : /sencillo/.test(t) ? 'sencillo'
               : /gfci|falla a tierra/.test(t) ? 'gfci' : /usb/.test(t) ? 'con USB' : null;
    if (!tipo) { MOTIVO.valor = 'la ficha no declara el tipo de tomacorriente'; return null; }
    return ELEC.item('tomacorriente', { tipo: tipo });
  }
  if (/breaker|interruptor termomagnetico/.test(t)) {
    const amp = numero(md, /(\d+)\s*a(?:mp|mps|mperios)?\b/);
    const polos = numero(md, /(\d+)\s*polos?/) || (/\bbipolar\b/.test(t) ? 2 : /\bmonopolar\b/.test(t) ? 1 : null);
    if (!amp || !polos) { MOTIVO.valor = 'la ficha no declara el amperaje o los polos del breaker'; return null; }
    return ELEC.item('breaker', { polos: polos, amperaje: amp });
  }
  if (/zocalo|roseta|socket/.test(t)) {
    const tipo = /porcelana/.test(t) ? 'porcelana' : /baquelita|plastic/.test(t) ? 'plástico' : null;
    if (!tipo) { MOTIVO.valor = 'la ficha no declara el material del zócalo'; return null; }
    return ELEC.item('roseta', { tipo: tipo });
  }
  if (/extension electrica|cordon de extension/.test(t)) {
    const pies = numero(md, /(\d+)\s*(?:pies|ft|')/);
    if (!pies) { MOTIVO.valor = 'la ficha no declara el largo de la extensión'; return null; }
    return ELEC.item('extension-electrica', { largo_pies: pies });
  }
  if (/regleta|multitoma|multicontacto/.test(t)) {
    const s = numero(md, /(\d+)\s*(?:salidas|tomas|puertos)/);
    if (!s) { MOTIVO.valor = 'la ficha no declara cuántas salidas tiene la regleta'; return null; }
    return ELEC.item('regleta', { salidas: s });
  }
  if (/cinta aislante|tape electrico/.test(t)) {
    const p = pulgada(md);
    if (!p) { MOTIVO.valor = 'la ficha no declara la medida de la cinta'; return null; }
    return ELEC.item('cinta-aislante', { medida: p });
  }
  if (/alambre|cable|conductor/.test(t)) {
    /* El calibre no basta para saber que es THHN. Esta tienda vende alambre
       dúplex de 300 V, alambre para soldar, alambre de vehículo y «alambre
       estándar» en rollo de 500 m, y todos traen su AWG en la talla. Si
       entran en la partida del THHN se llevan por delante el ítem: el
       dúplex #12 sale a RD$ 10.90 y el rollo de THHN #12 a RD$ 1,950.

       Y hay una segunda trampa detrás: esos precios son POR PIE, y el ítem
       del catálogo va por rollo de 100 pies. La ficha de esta tienda no
       declara la unidad en ningún campo, así que no hay con qué convertir.
       Sin THHN declarado y sin unidad, el alambre de aquí no entra. */
    MOTIVO.valor = /thhn|thhw/.test(t)
      ? 'la ficha no declara si el precio es por pie o por rollo'
      : 'alambre que no es THHN (dúplex, para soldar, de vehículo o estándar)';
    return null;
  }
  if (/linterna|pila|bateria|inversor|antena|multimetro|probador|candado|cerradura|contactor|palometa/.test(t)) {
    MOTIVO.valor = 'artículo eléctrico que no es partida de obra';
    return null;
  }
  MOTIVO.valor = 'artículo eléctrico que la ficha no describe lo bastante';
  return null;
}

/* =========================================================
   Materiales de construcción
   ========================================================= */

function reglaMaterial(a) {
  const t = texto(a);
  const md = medido(a);
  const kg = (() => {
    let m = md.match(/(\d+(?:\.\d+)?)\s*kg/); if (m) return BALDOSAS.aPesoKg(parseFloat(m[1]));
    m = md.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|libras?)/);
    if (m) return BALDOSAS.aPesoKg(parseFloat(m[1]) * 0.45359237);
    return null;
  })();

  if (/\bcemento\b/.test(t)) {
    MOTIVO.valor = 'la ficha no declara el tipo ni el peso de la funda de cemento';
    return null;
  }
  if (/\bestuco\b/.test(t)) {
    if (!kg) { MOTIVO.valor = 'la ficha no declara el peso de la funda de estuco'; return null; }
    return BALDOSAS.item('estuco', { color: /blanco/.test(t) ? 'blanco' : 'gris', kg: kg });
  }
  if (/\byeso\b/.test(t)) {
    if (!kg) { MOTIVO.valor = 'la ficha no declara el peso de la funda de yeso'; return null; }
    return BALDOSAS.item('yeso', { kg: kg });
  }
  if (/clavos?|malla|carretilla|cincel|pata de cabra|cangrejo|pigmento|aditivo|thorobond|\bcal\b/.test(t)) {
    MOTIVO.valor = 'artículo que el catálogo no tiene como partida propia';
    return null;
  }
  MOTIVO.valor = 'material que la ficha no describe lo bastante';
  return null;
}

/* =========================================================
   El despachador
   ========================================================= */

function regla(a) {
  MOTIVO.valor = '';
  if (!(a.precio > 1)) { MOTIVO.valor = 'la ficha no publica un precio utilizable'; return null; }
  if (a.disponibilidad === 'No') { MOTIVO.valor = 'artículo agotado en la tienda'; return null; }

  const t0 = texto(a);
  /* «Juego de 2 bombillos» es un precio por dos: mezclarlo con el de uno
     contamina la mediana sin que se vea. */
  if (/\b(?:juego|set|pack|combo|kit) de \d+\b|\b\d+\s*(?:pzas?|piezas|unidades)\b/.test(t0)) {
    MOTIVO.valor = 'el precio cubre un paquete de varias unidades, no una';
    return null;
  }
  /* Una motobomba a gasolina no es la bomba eléctrica de una cisterna. */
  if (/motobomba/.test(t0) && /gasolina|motor a gasolina|diesel/.test(t0)) {
    MOTIVO.valor = 'motobomba de motor de combustión; el catálogo no tiene esa partida';
    return null;
  }

  const d = a.cat1;
  if (FUERA[d]) { MOTIVO.valor = FUERA[d]; return null; }

  switch (d) {
    case 'Pinturas':                     return reglaPintura(a);
    case 'Pisos y Terminaciones':        return reglaPiso(a);
    case 'Plomería':                     return reglaPlomeria(a);
    case 'Baños y Grifería':             return reglaBano(a);
    case 'Electricidad':
    case 'Iluminación':                  return reglaElectrico(a);
    case 'Materiales de construcción':   return reglaMaterial(a);
    default:
      MOTIVO.valor = 'departamento que el catálogo no cubre';
      return null;
  }
}

module.exports = { regla, MOTIVO, FUERA, slug };
