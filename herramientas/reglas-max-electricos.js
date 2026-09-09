'use strict';
/* =========================================================
   reglas-max-electricos.js — Max Ferretería · eléctricos

   468 artículos, la colección más grande que ha entrado de un
   solo comercio. Los nombres son los más abreviados del
   catálogo y la subcategoría del origen está vacía en dos de
   cada tres artículos, así que aquí manda la familia
   normalizada que trae la extracción y, sobre ella, el nombre.

   EL HUECO DE LAS UNIDADES, OTRA VEZ
   ----------------------------------
   Es el tercer archivo de esta ferretería con el mismo
   problema, y ya no es un descuido puntual: la tienda deja
   vacío el campo de unidad de venta en toda su ficha. En cables
   y alambres eso es definitivo: RD$ 16 por un THHN No. 12 solo
   tiene sentido por pie, pero la ficha no lo dice. Los 27
   artículos de esa familia quedan fuera.
   ========================================================= */

const ESP = require('./especificacion-electricos.js');

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();
const baja = s => limpia(s).toLowerCase()
  .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i')
  .replace(/[óò]/g, 'o').replace(/[úù]/g, 'u').replace(/ñ/g, 'n');

const MOTIVO = { valor: '' };

/* Familias enteras que no entran. */
const FUERA = {
  'Cables y alambres': 'la tienda no declara la unidad de venta: RD$ 16 por un THHN No. 12 solo tiene sentido por pie, pero la ficha no lo dice',
  'Pilas y baterias': 'pila de consumo, no material de obra',
  'Linternas y focos': 'artículo de consumo, no equipo de obra',
  'Herramientas e instrumentos': 'herramienta suelta que este catálogo no describe lo bastante',
  'Conectores de datos, TV y telefonia': 'accesorio de datos que la ficha no describe lo bastante para el catálogo de redes',
  'Seguridad y videoporteros': 'equipo de seguridad que la ficha no describe lo bastante'
};

/* Medidas en pulgadas, escritas como el oficio: 1/2, 3/4, 1-1/2. */
function pulgadas(t) {
  const s = String(t || '').replace('-', ' ').trim();
  let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (m) return parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
  m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m) return parseInt(m[1], 10) / parseInt(m[2], 10);
  m = s.match(/^(\d+(?:\.\d+)?)$/);
  return m ? parseFloat(m[1]) : null;
}
const FRACCION = { 0.125: '1/8', 0.25: '1/4', 0.375: '3/8', 0.5: '1/2', 0.625: '5/8',
                   0.75: '3/4', 0.875: '7/8' };
function comoPulgada(v) {
  if (!(v > 0)) return '';
  const ent = Math.floor(v + 1e-9), resto = Math.round((v - ent) * 1000) / 1000;
  const fr = FRACCION[resto];
  if (resto && !fr) return (Math.round(v * 100) / 100) + '"';
  if (ent && fr) return ent + ' ' + fr + '"';
  return fr ? fr + '"' : ent + '"';
}
function medidaPulg(t) { const v = pulgadas(t); return v === null ? '' : comoPulgada(v); }

/* La medida de un tubo o una abrazadera, sacada del nombre. Se busca una
   fracción o un número seguido de comillas, para no confundirla con el código
   interno del artículo. */
function medidaDeTubo(nombre) {
  const t = limpia(nombre);
  let m = t.match(/(\d+\s*-\s*\d+\s*\/\s*\d+|\d+\s*\/\s*\d+)\s*(?:''|"|”|PULG)?/i);
  if (m) return medidaPulg(m[1]);
  m = t.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(?:''|"|”)/);
  return m ? medidaPulg(m[1]) : '';
}

function regla(a) {
  const spec = clasificar(a);
  if (spec && spec.clave && ESP.YA_EXISTE[spec.clave]) return { existente: ESP.YA_EXISTE[spec.clave] };
  return spec;
}

function clasificar(a) {
  MOTIVO.valor = '';
  const n = baja(a.nombre);
  const fam = a.cat3;

  if (FUERA[fam]) { MOTIVO.valor = FUERA[fam]; return null; }

  /* ---- Bombillos ---- */
  if (fam === 'Iluminacion - Bombillos') {
    if (!a.potencia_w) { MOTIVO.valor = 'la ficha no declara la potencia del bombillo'; return null; }
    /* La tecnología casi siempre está en el nombre, pero pegada de formas
       distintas: «LED10W», «SPIRAL», «3U». Cuando no está, la potencia la
       delata: un bombillo decorativo de 25 W o más en formato G16, R20,
       torpedo o G40 no existe en LED — es incandescente, y por eso se puede
       leer sin adivinar. */
    const tec = /led/.test(n) ? 'LED'
              : /espiral|spiral|ahorrador|\b3u\b|cfl/.test(n) ? 'ahorrador'
              : /halogen/.test(n) ? 'halógeno'
              : /incandes/.test(n) ? 'incandescente'
              : (a.potencia_w >= 25 && /g16|g25|g40|r20|torpedo|a19|clear|frost/.test(n))
                ? 'incandescente' : '';
    if (!tec) { MOTIVO.valor = 'la ficha no declara la tecnología del bombillo'; return null; }
    const med = { tecnologia: tec, potencia_w: a.potencia_w };
    if (a.base) med.formato = a.base;
    if (a.temp_k) med.temp_k = a.temp_k;
    return ESP.item('bombillo', med);
  }

  /* ---- Paneles, empotrados y luminarias ---- */
  if (fam === 'Iluminacion - Paneles, empotrados y luminarias') {
    if (/emerc|emergencia/.test(n)) return ESP.item('lampara-emergencia', {});
    if (!a.potencia_w) {
      /* Sin potencia declarada y con «dirigible» o «fijo» en el nombre no es un
         panel incompleto: es el cuerpo de la luminaria, que se vende sin
         bombillo y es otra partida. */
      if (/emp|empot/.test(n)) {
        const t = /dirig/.test(n) ? 'dirigible' : /fijo/.test(n) ? 'fija' : '';
        const f = /cuadra|cuad\b|recto/.test(n) ? 'cuadrada'
                : /circ|redond|curvo/.test(n) ? 'redonda' : '';
        if (t && f) return ESP.item('luminaria-empotrada', { tipo: t, forma: f });
      }
      MOTIVO.valor = 'la ficha no declara la potencia de la luminaria';
      return null;
    }
    const montaje = /empot|emp\b|empotrad/.test(n) ? 'empotrado'
                  : /sobrepon|superficie/.test(n) ? 'de sobreponer'
                  : /colgan|pendant/.test(n) ? 'colgante' : '';
    if (!montaje) { MOTIVO.valor = 'la ficha no dice si la luminaria es empotrada o de sobreponer'; return null; }
    const forma = /cuadra|cuad\b/.test(n) ? 'cuadrado' : /redond|circ/.test(n) ? 'redondo' : '';
    if (!forma) { MOTIVO.valor = 'la ficha no declara la forma del panel'; return null; }
    const med = { montaje: montaje, forma: forma, potencia_w: a.potencia_w };
    if (a.temp_k) med.temp_k = a.temp_k;
    return ESP.item('panel-led', med);
  }

  /* ---- Reflectores ---- */
  if (fam === 'Iluminacion - Reflectores') {
    if (!a.potencia_w) { MOTIVO.valor = 'la ficha no declara la potencia del reflector'; return null; }
    const med = { potencia_w: a.potencia_w };
    if (/solar/.test(n)) med.alimentacion = 'solar';
    if (a.temp_k) med.temp_k = a.temp_k;
    return ESP.item('reflector-led', med);
  }

  /* ---- Tubos LED ---- */
  if (fam === 'Iluminacion - Tubos LED') {
    if (!a.potencia_w) { MOTIVO.valor = 'la ficha no declara la potencia del tubo'; return null; }
    const m = limpia(a.nombre).match(/(\d)\s*(?:pies|ft|')/i);
    const med = { potencia_w: a.potencia_w };
    if (m) med.largo_pies = parseInt(m[1], 10);
    return ESP.item('tubo-led', med);
  }

  /* ---- Zócalos, rosetas y fotoceldas ---- */
  if (fam === 'Iluminacion - Zocalos, rosetas y fotoceldas') {
    const tipo = /fotocelda|fotocelula/.test(n) ? 'fotocelda'
               : /roseta/.test(n) ? 'roseta'
               : /zocalo|socket|portalamp/.test(n) ? 'zocalo' : '';
    if (!tipo) { MOTIVO.valor = 'accesorio de iluminación que la ficha no describe lo bastante'; return null; }
    return ESP.item('roseta', { tipo: tipo });
  }

  /* ---- Interruptores y tomacorrientes ---- */
  if (fam === 'Interruptores y tomacorrientes') {
    /* El artículo que combina toma e interruptor es una tercera cosa. */
    if (/^toma\s*\/\s*inter|^inter\s*\/\s*toma/.test(n)) {
      return ESP.item('interruptor', { tipo: 'con tomacorriente' });
    }
    if (/^toma|tomacorr/.test(n)) {
      const tipo = /gfci|falla a tierra/.test(n) ? 'GFCI'
                 : /usb/.test(n) ? 'con USB'
                 : /doble/.test(n) ? 'doble polarizado'
                 : /sencill|simple/.test(n) ? 'sencillo' : 'doble polarizado';
      return ESP.item('tomacorriente', { tipo: tipo });
    }
    if (/^int|^interr|^interup/.test(n)) {
      const tipo = /dimm?er/.test(n) ? 'dimmer'
                 : /4\s*way|cuatro v/.test(n) ? 'de 4 vías'
                 : /3\s*way|tres v/.test(n) ? 'de 3 vías'
                 : /triple/.test(n) ? 'triple'
                 : /doble/.test(n) ? 'doble'
                 : /sencill|simple/.test(n) ? 'sencillo' : '';
      if (!tipo) { MOTIVO.valor = 'la ficha no declara cuántas teclas tiene el interruptor'; return null; }
      return ESP.item('interruptor', { tipo: tipo });
    }
    MOTIVO.valor = 'salida eléctrica que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Placas y tapas ---- */
  if (fam === 'Placas, tapas y accesorios') {
    /* El dimmer está archivado aquí pero es un mecanismo de pared. */
    if (/dimm?er/.test(n)) return ESP.item('interruptor', { tipo: 'dimmer' });
    if (/tapa ciega/.test(n)) return ESP.item('placa-electrica', { tipo: 'Tapa ciega' });
    if (/p\s*\/\s*tomacorr|p\s*\/\s*t\s*c|para tomacorriente/.test(n)) {
      return ESP.item('placa-electrica', { tipo: 'Tapa para tomacorriente' });
    }
    let m = limpia(a.nombre).match(/(\d)\s*M\b/);
    if (m) return ESP.item('placa-electrica', { tipo: 'Placa de ' + m[1] + ' módulos' });
    m = limpia(a.nombre).match(/(\d)\s*(?:h\b|hueco|huecos|puesto|puestos)/i);
    if (m) return ESP.item('placa-electrica', {
      tipo: 'Placa de pared de ' + m[1] + (m[1] === '1' ? ' hueco' : ' huecos') });
    if (/^tapa (doble|sencilla|simple)/.test(n)) {
      return ESP.item('placa-electrica', {
        tipo: 'Placa de pared de ' + (/doble/.test(n) ? '2 huecos' : '1 hueco') });
    }
    MOTIVO.valor = 'la ficha no declara cuántos huecos o módulos tiene la placa';
    return null;
  }

  /* ---- Enchufes y adaptadores ---- */
  if (fam === 'Enchufes y adaptadores') {
    const tipo = /^espigo/.test(n) ? 'Espigo'
               : /^clavija/.test(n) ? 'Clavija'
               : /^adaptador/.test(n) ? 'Adaptador de enchufe'
               : /^enchufe/.test(n) ? 'Enchufe' : '';
    if (!tipo) { MOTIVO.valor = 'pieza de conexión que la ficha no describe lo bastante'; return null; }
    return ESP.item('enchufe-adaptador', { tipo: tipo });
  }

  /* ---- Breakers y paneles ---- */
  if (fam === 'Proteccion - Breakers y paneles') {
    if (/^switch doble tiro|doble tiro/.test(n)) {
      const p = limpia(a.nombre).match(/(\d)\s*P\b/i);
      if (!p || !a.amperaje) { MOTIVO.valor = 'la ficha no declara los polos o el amperaje del switch'; return null; }
      return ESP.item('switch-doble-tiro', { polos: parseInt(p[1], 10), amperaje: a.amperaje });
    }
    if (/^fusible|^fisible/.test(n)) {
      if (!a.amperaje) { MOTIVO.valor = 'la ficha no declara el amperaje del fusible'; return null; }
      return ESP.item('fusible', { amperaje: a.amperaje });
    }
    if (/^caja breaker|^panel|^centro de carga/.test(n)) {
      /* Dos cosas distintas con nombres parecidos: la caja de un solo breaker
         para la acometida, que se mide en amperios, y el panel de circuitos,
         que se mide en espacios. */
      let m = limpia(a.nombre).match(/(\d+)\s*(?:ways?|espacios?|esp\b|circ\b|circuitos?)/i);
      if (m) return ESP.item('caja-breaker', { espacios: parseInt(m[1], 10) });
      m = limpia(a.nombre).match(/(\d+)\s*-\s*(\d+)\s*CIRC/i);
      if (m) return ESP.item('caja-breaker', { espacios: parseInt(m[2], 10) });
      if (a.amperaje) return ESP.item('caja-main', { amperaje: a.amperaje });
      MOTIVO.valor = 'la ficha no declara cuántos espacios ni qué amperaje tiene el panel';
      return null;
    }
    if (/^breaker/.test(n)) {
      if (!a.amperaje) { MOTIVO.valor = 'la ficha no declara el amperaje del breaker'; return null; }
      const p = limpia(a.nombre).match(/(\d)\s*P\b/i);
      if (!p) { MOTIVO.valor = 'la ficha no declara cuántos polos tiene el breaker'; return null; }
      const med = { polos: parseInt(p[1], 10), amperaje: a.amperaje };
      /* El «fino» ocupa medio espacio del panel: no es intercambiable. */
      if (/fino|delgad|thqp/.test(n)) med.formato = 'fino';
      return ESP.item('breaker', med);
    }
    MOTIVO.valor = 'equipo de protección que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Protectores y reguladores ---- */
  if (fam === 'Proteccion - Protectores y reguladores') {
    const tipo = /regulador|estabilizador/.test(n) ? 'Regulador de voltaje'
               : /protector/.test(n) ? 'Protector de voltaje'
               : /supresor|surge/.test(n) ? 'Supresor de picos'
               : /ups|respaldo/.test(n) ? 'UPS de respaldo' : '';
    if (!tipo) { MOTIVO.valor = 'equipo de protección que la ficha no describe lo bastante'; return null; }
    return ESP.item('protector-voltaje', { tipo: tipo });
  }

  /* ---- Canalización ---- */
  if (fam === 'Tuberias, canaletas y registros') {
    if (/^abrazadera/.test(n)) {
      const md = medidaDeTubo(a.nombre);
      if (!md) { MOTIVO.valor = 'la ficha no declara la medida de la abrazadera'; return null; }
      const h = limpia(a.nombre).match(/(\d)\s*-?\s*H\b/i);
      const med = { medida: md };
      if (h) med.huecos = parseInt(h[1], 10);
      return ESP.item('abrazadera-emt', med);
    }
    if (/^canaleta/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*[xX]\s*(\d+)/);
      if (!m) { MOTIVO.valor = 'la ficha no declara la medida de la canaleta'; return null; }
      return ESP.item('canaleta', { medida: m[1] + ' x ' + m[2] + ' mm' });
    }
    if (/^caja/.test(n)) {
      const material = /metal|metalica|acero/.test(n) ? 'metal'
                     : /pvc|plast/.test(n) ? 'PVC' : '';
      const forma = /octagonal|octog/.test(n) ? 'octagonal'
                  : /rectangul|2\s*x\s*4/.test(n) ? 'rectangular'
                  : /cuadrad|4\s*x\s*4/.test(n) ? 'cuadrada' : '';
      if (!material || !forma) { MOTIVO.valor = 'la ficha no declara el material o la forma de la caja'; return null; }
      const med = { material: material, forma: forma };
      const m = limpia(a.nombre).match(/(\d)\s*[xX]\s*(\d)/);
      if (m) med.medida = m[1] + ' x ' + m[2];
      return ESP.item('caja-electrica', med);
    }
    if (/liquid\s*tight|^tuberia bx|flexible|corrugad/.test(n)) {
      const md = medidaDeTubo(a.nombre);
      if (!md) { MOTIVO.valor = 'la ficha no declara la medida de la tubería flexible'; return null; }
      const material = /liquid\s*tight/.test(n) ? 'liquid tight'
                     : /bx/.test(n) ? 'BX' : 'corrugada';
      return ESP.item('tubo-flexible', { material: material, medida: md });
    }
    if (/^tuberia|^tubo/.test(n)) {
      const md = medidaDeTubo(a.nombre);
      if (!md) { MOTIVO.valor = 'la ficha no declara el diámetro del tubo'; return null; }
      const material = /emt|metalica/.test(n) ? 'EMT' : /pvc/.test(n) ? 'PVC' : '';
      if (!material) { MOTIVO.valor = 'la ficha no declara el material del tubo'; return null; }
      const l = limpia(a.nombre).match(/[xX]\s*(\d+)\s*(?:'|pies|ft)/i);
      if (!l) { MOTIVO.valor = 'la ficha no declara el largo del tubo'; return null; }
      return ESP.item('tubo-electrico', { material: material, medida: md, largo_pies: parseInt(l[1], 10) });
    }
    MOTIVO.valor = 'pieza de canalización que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Abrazaderas plásticas ---- */
  if (fam === 'Abrazaderas plasticas') {
    const m = limpia(a.nombre).match(/(\d+(?:\.\d+)?)\s*(?:''|"|”|PULG)/i);
    if (!m) { MOTIVO.valor = 'la ficha no declara el largo de la abrazadera'; return null; }
    return ESP.item('abrazadera-plastica', { largo_pulg: parseFloat(m[1]) });
  }

  /* ---- Cintas aislantes ---- */
  if (fam === 'Cintas aislantes') {
    const m = limpia(a.nombre).match(/(\d+(?:\.\d+)?)\s*(?:mts?|m\b|yardas?|yds?|pies|ft)/i);
    if (!m) { MOTIVO.valor = 'la ficha no declara el largo del rollo de cinta'; return null; }
    return ESP.item('cinta-aislante', { medida: m[1] + ' ' + baja(m[0].replace(m[1], '')).trim() });
  }

  /* ---- Extensiones y regletas ---- */
  if (fam === 'Extensiones y regletas') {
    if (/^regleta|^multitoma/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*(?:sal|salidas?|tomas?|un\b)/i);
      if (!m) { MOTIVO.valor = 'la ficha no declara cuántas salidas tiene la regleta'; return null; }
      const med = { salidas: parseInt(m[1], 10) };
      if (/suge|supresor|surge/.test(n)) med.supresor = 'si';
      return ESP.item('regleta', med);
    }
    if (/^exten/.test(n)) {
      /* El largo viene con comilla («50'») o suelto detrás del nombre
         («EXTENSIONES 12 16AWG»). Se acepta el primero de los dos, y nunca un
         número de cuatro cifras, que sería el código del artículo. */
      let m = limpia(a.nombre).match(/(\d{1,3})\s*(?:'|ft\b|pies)/i);
      if (!m) m = limpia(a.nombre).match(/EXTENSIONES?\s+(\d{1,3})(?!\d)/i);
      if (!m) { MOTIVO.valor = 'la ficha no declara el largo de la extensión'; return null; }
      return ESP.item('extension-electrica', { largo_pies: parseInt(m[1], 10) });
    }
    MOTIVO.valor = 'artículo de extensión que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Timbres, sensores y temporizadores ---- */
  if (fam === 'Timbres, sensores y temporizadores') {
    const tipo = /timbre/.test(n) ? 'Timbre eléctrico'
               : /sensor de mov|sensor mov/.test(n) ? 'Sensor de movimiento'
               : /temporizador|timer/.test(n) ? 'Temporizador'
               : /fotocelda/.test(n) ? 'Fotocelda' : '';
    if (!tipo) { MOTIVO.valor = 'control eléctrico que la ficha no describe lo bastante'; return null; }
    return ESP.item('timbre-sensor', { tipo: tipo });
  }

  return undefined;
}

module.exports = { MOTIVO, FUERA, regla };
