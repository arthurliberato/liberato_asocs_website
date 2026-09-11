'use strict';
/* =========================================================
   reglas-segtec.js — clasificador de seguridad y tecnología

   Misma pregunta que en baños: ¿le sirve a un constructor?

   Aquí el catálogo mezcla dos negocios muy distintos bajo los
   mismos estantes. Por un lado están los sistemas de corrientes
   débiles de un edificio —CCTV, alarma, detección de incendio,
   control de acceso, cableado estructurado, intercomunicación,
   domótica de pared—, que son partidas de obra con su canalización,
   su cableado y su instalador. Por otro está la tienda de
   computadoras: hubs USB, cargadores de laptop, memorias, cables
   HDMI de 1.8 metros, soportes de monitor.

   Lo primero entra. Lo segundo no: nadie lo pone en un presupuesto
   de obra, y llena la página de ruido.

   A diferencia de baños, aquí las categorías del comercio sí
   sirven para agrupar —«camaras bullet», «control de incendios»—
   así que la categoría sale de ellas y el filtro sale del nombre.
   ========================================================= */

const T = require('./texto-ochoa.js');
const ES = require('./especificacion-segtec.js');

/* Abreviaturas propias de este rubro. */
const ABREV = [
  [/\bCctv\b/gi, 'CCTV'], [/\bPoe\b/gi, 'PoE'], [/\bRj45\b/gi, 'RJ45'],
  [/\bUtp\b/gi, 'UTP'], [/\bIp\b/g, 'IP'], [/\bLcd\b/gi, 'LCD'],
  [/\bPir\b/gi, 'PIR'], [/\bPtz\b/gi, 'PTZ'], [/\bNvr\b/gi, 'NVR'],
  [/\bDvr\b/gi, 'DVR'], [/\bXvr\b/gi, 'XVR'], [/\bMp\b/g, 'MP'],
  [/\bVdc\b/gi, 'VDC'], [/\bVac\b/gi, 'VAC'], [/\bDb\b/g, 'dB'],
  [/\bCat\.?(\d)/gi, 'Cat $1'], [/\bAwg\b/gi, 'AWG'],
  [/\bMoviemiento\b/gi, 'movimiento'], [/\bInfrarojo\b/gi, 'infrarrojo'],
  [/\bInalambric/gi, 'inalámbric'], [/\bMagnetico\b/gi, 'magnético'],
  [/\bBiometrico\b/gi, 'biométrico'], [/\bIntercom\b/gi, 'intercom'],
  [/\bAcces?o?\b/gi, 'acceso'], [/\bCensor\b/gi, 'sensor']
];

/* ---------------------------------------------------------
   Lo que no entra: accesorio de computadora, no de obra
   --------------------------------------------------------- */
const NO_ES_DE_OBRA = [
  /* Cables de consumo: los que van de un equipo a otro sobre la mesa. El
     cable de instalación se reconoce porque trae calibre o sección
     —«AWG 16/4», «2X0.75+4X2X0.22»— y ese sí entra. */
  /^Cable (Home ?Theater|Hometheater|Hdtv)/i,
  /^Cable .*(Plug A Plug|Plug-Plug|A Plug|Rca|Svideo|S-Video|Minidin)/i,
  /^Cable (De )?Video Coaxial .*(Presion|Cm|M)$/i,

  /* Adaptadores de escritorio. Los de fibra óptica van en el patch panel
     y son de obra, así que se salvan. */
  /^Adaptad[oa]r? (?!.*(Fibra|[oó]ptic))/i,

  /^Hub /i, /^Cargador/i, /^Memoria/i,
  /^Caja Para Disco Duro/i,
  /^(Soporte|Base) (Ergon|Para Dos Monitores|Tv |De Port|De Laptop)/i,
  /^Soporte .*Port[aá]til/i,
  /^Monitor (4K|24|27|32”? Fhd)/i,
  /^Monitor .*(Oficina|Uhd)/i,
  /^Pantalla/i,
  /^S[ií]mbolos/i,                    // material didáctico de prototipos
  /^Jumper Para Tiras De Pines/i,     // jumper de laboratorio, no de rack
  /^Divisor.*Hdmi/i, /^Conmutador 4K/i,   // distribución de video de consumo
  /^Tablet/i,
  /^Extension Programador/i,              // programador de PIC, equipo de laboratorio
  /Ide Ultra|\bIde\b/i,                   // cable IDE: pieza de computadora
  /^Domo (Azul|Blanca|Blanco|Negro|Gris)$/i  // «Domo Azul», sin decir domo de qué
];

/* ---------------------------------------------------------
   La categoría sale del rubro del comercio
   --------------------------------------------------------- */
const CATEGORIA = {
  'camaras': 'MAT-16',                       // cámaras y videovigilancia
  'alarmas': 'MAT-28',
  'automatizacion y controles': 'MAT-28',
  'control de accesos': 'MAT-28',
  'cerco electricos': 'MAT-28',
  'residenciales': 'MAT-28',                 // cerco eléctrico residencial
  'audio & sonidos': 'MAT-28',               // bocinas y anillos de sistemas de aviso
  'control de incendios': 'MAT-29',
  'cables de redes y conectividad': 'MAT-30',
  'monitores': 'MAT-30',
  'pantallas': 'MAT-30',
  'domotica': 'MAT-31',
  'intercomunicadores': 'MAT-31'
};

/* ---------------------------------------------------------
   De qué especificación se trata. Gana el primero que casa.
   --------------------------------------------------------- */
const FAMILIA = [
  [/^Kit C[aá]mara/i,                              'kit-cctv'],
  [/^Kit Alarma/i,                                 'kit-alarma'],
  [/^Videoportero/i,                               'intercom-kit'],
  [/Bot[oó]n De P[aá]nico|Pulsador De P[aá]nico/i,  'estacion-manual'],
  [/Luz Estrobosc/i,                               'sirena-incendio'],
  [/Panel De Control/i,                            'panel-alarma'],
  [/^(Dvr|Nvr|Xvr|Grabador)/i,                     'grabador'],
  [/^Disco Duro/i,                                 'disco-grabacion'],
  [/^(Camara|Cam |Domo|Flexidome|Minidomo|Microdomo)/i, 'camara'],
  [/^Monitor/i,                                    'monitor-cctv'],
  [/^Video Balun|^Balun/i,                         'balun'],

  [/^(Estacion|Estación).*(Manual|Analogica)/i,    'estacion-manual'],
  [/^Pulsador.*(P[aá]nico|Alarma|Incendio)/i,      'estacion-manual'],
  [/^Detector.*(Humo|Calor|T[eé]rmico|Termico)/i,  'detector-incendio'],
  [/^Base Detector/i,                              'accesorio-incendio'],
  [/^(Sirena|Bocina|Estrobo)/i,                    'sirena'],

  [/^(Central|Panel)/i,                            'panel-alarma'],
  [/^Teclado/i,                                    'teclado-alarma'],
  [/^(Detector|Sensor|Censor)/i,                   'detector-movimiento'],
  [/^Contacto/i,                                   'contacto-magnetico'],
  [/^(Control Acceso|Control De Acceso|Lector|Cerradura)|^Controlador (De )?(Acceso|Puerta)/i, 'control-acceso'],
  [/^(Electrificador|Letrero|Aislador)/i,          'cerco-electrico'],

  [/^(Cable|Cordon|Cordón)/i,                      'cable-red'],
  [/^(Jack|Keystone|Cat ?\d)/i,                    'jack-rj45'],
  [/^(Patch|Panel De Conex)/i,                     'patch-panel'],
  [/^(Placa|Faceplate|Fp,)/i,                      'placa-pared'],
  [/^(Rack|Organizador|Tapa Ciega|Bandeja|Pasador|Manga|Distribuidor|Gabinete|Carril)/i, 'rack'],
  [/^(Switch|Mini Switch|Extensor|Repetidor|Conversor|Bridge|Modulador|Wireless|Terminal|Homekit)/i, 'equipo-red'],
  [/^(Fuente|Power|Transf|Injector|Inyector|Pdu|Regenerador|Capacitor)/i, 'alimentacion'],
  [/^(Parlante|Amplificador|Altavoz|Anillo)|Plena/i,'sonido'],
  [/^(Acoplador|Barril|Cople|Conector|Casquillo|Inserto|Tira|Decorator|Adaptador|Jumper|Plug|Mc\d|Utp )/i, 'conector-datos'],

  [/^(Interruptor|Interrupto|Int\.|Dimmer|Microfluxa|Shutter|Pulsador|Doble Pulsador|Boton|Disp\. Wifi)/i, 'interruptor-inteligente'],
  [/^(Tomacorriente|Toma )/i,                      'tomacorriente-smart'],
  [/^(Hub|Concentrador|Unidad Central|Kit Domotica|Kit Luci|Smart Home|Automation|Auto Premium|Modulo Dlfra|Tarjeta Eva|Tarjeta Ingrid|Tarjeta Vesta)|Smart Home/i, 'hub-domotica'],
  [/Cerradura Inteligente/i,                       'cerradura-inteligente'],
  [/^Kit Intercom|^Kit De Video Timbre/i,          'intercom-kit'],
  [/^(Timbre|Pulsador Inalambrico)/i,              'timbre-inteligente'],
  /* El intercom, por dónde va montado. Ver especificacion-segtec.js: el
     teléfono del apartamento, el monitor del apartamento, la placa del
     portón y los herrajes son cuatro compras distintas y antes caían en
     la misma. El orden importa —«VIDEO INTERCOM MODULO ESTACION PUERTA»
     tiene «video» y «modulo», y es la placa de calle— así que lo más
     específico va primero. */
  [/estacion (de )?puerta|placa de calle|frente de calle|modulo estacion puerta|^Placa/i, 'intercom-placa'],
  [/intercom video|video intercom|^Estacion Interior|estacion interior|monitor.*intercom|intercom.*monitor|videoportero interior/i, 'intercom-monitor'],
  [/^Telefono .*intercom|intercom.*telefono|^Telefono Sprint|^Telefono Trad|^Intercomunicador\b/i, 'intercom-telefono'],
  [/intercom|conserje|montante|soneria|secreto de conversacion|^Frontal Para Teclado|^Marco Soporte/i, 'intercom-accesorio'],

  [/^Mini Caja/i,                                  'soporte-camara'],
  [/^(Soporte|Bracket|Carcasa|Caja|Base|Cubierta|Brazo|Copa|Poste|Sello|Bisel|Display|Programador|Comunicador|Modulo|Módulo|Tarjeta|Configurador|Control Remoto|Llavero|Mando|Receptor|Transmisor|Borne)/i, 'accesorio-alarma']
];

const num = s => { const v = parseFloat(String(s).replace(',', '.')); return isFinite(v) ? v : null; };

/* Las medidas. En este rubro casi todas son numéricas y vienen en el propio
   nombre del producto, que es lo bueno: «2Mp 2.8Mm», «8 Canales», «Cat.6»,
   «28 Zonas». Lo que no está no se inventa. */
function medidasDe(a, familia) {
  const n = T.limpia(a.nombre) + ' ' + T.limpia(a.ref) + ' ' + T.limpia(a.cat3);
  const m = {};

  if (familia === 'kit-cctv') {
    const c = n.match(/kit c[aá]maras?\s*(\d+)/i);
    if (c) m.camaras = num(c[1]);
    if (/bullet/i.test(n)) m.formato = 'bullet';
    else if (/domo/i.test(n)) m.formato = 'domo';
    const mp = n.match(/(\d+(?:\.\d+)?)\s*MP\b/i);
    if (mp) m.resolucion_mp = num(mp[1]);
  }

  if (familia === 'camara') {
    if (/bullet/i.test(n)) m.formato = 'bullet';
    else if (/turret/i.test(n)) m.formato = 'turret';
    else if (/ptz/i.test(n)) m.formato = 'PTZ';
    else if (/ojo de pez|fisheye/i.test(n)) m.formato = 'ojo de pez';
    else if (/domo|flexidome/i.test(n)) m.formato = 'domo';
    const mp = n.match(/(\d+(?:\.\d+)?)\s*MP\b/i);
    if (mp) m.resolucion_mp = num(mp[1]);
    const le = n.match(/(\d+(?:\.\d+)?)\s*Mm\b/i);
    if (le) m.lente_mm = num(le[1]);
    if (/\bip\b|\bnet\b|\bpoe\b/i.test(n)) m.tecnologia = 'IP';
    else if (/hdcvi|hdtvi|analog/i.test(n)) m.tecnologia = 'HDCVI';
    const ir = n.match(/ir\s*(\d+)\s*m/i);
    if (ir) m.alcance_ir_m = num(ir[1]);
  }

  if (familia === 'grabador') {
    const c = n.match(/(\d+)\s*(?:canales|ch\b)/i) || n.match(/\b(4|8|16|32|64)\s*\//);
    if (c) m.canales = num(c[1]);
    if (/^nvr|\bnvr\b/i.test(n)) m.tecnologia = 'NVR';
    else if (/^xvr|\bxvr\b/i.test(n)) m.tecnologia = 'XVR';
    else if (/^dvr|\bdvr\b/i.test(n)) m.tecnologia = 'DVR';
  }

  if (familia === 'disco-grabacion') {
    const t = n.match(/(\d+(?:\.\d+)?)\s*TB\b/i);
    if (t) m.capacidad_tb = num(t[1]);
  }

  if (familia === 'monitor-cctv' || familia === 'intercom-estacion') {
    const p = n.match(/(\d+(?:\.\d+)?)\s*(?:"|''|pulgadas?|”)/i);
    if (p) m.pulgadas = num(p[1]);
  }

  if (familia === 'panel-alarma' || familia === 'panel-incendio') {
    const z = n.match(/(\d+)\s*(?:zonas?|[aá]reas?)/i);
    if (z) m.zonas = num(z[1]);
  }

  if (familia === 'detector-movimiento') {
    const d = n.match(/(\d+)\s*(?:Mt|M)\b/i);
    if (d && num(d[1]) <= 60) m.alcance_m = num(d[1]);
    if (/inal[aá]mbric/i.test(n)) m.enlace = 'inalámbrico';
  }

  if (familia === 'detector-incendio') {
    if (/humo/i.test(n) && /calor|t[eé]rmico/i.test(n)) m.deteccion = 'humo y calor';
    else if (/humo/i.test(n)) m.deteccion = 'humo';
    else if (/calor|t[eé]rmico|termico/i.test(n)) m.deteccion = 'calor';
  }

  if (familia === 'sirena') {
    if (/exterior/i.test(n)) m.ubicacion = 'exterior';
    else if (/interior/i.test(n)) m.ubicacion = 'interior';
    const db = n.match(/(\d+)\s*dB/i);
    if (db) m.potencia_db = num(db[1]);
  }

  if (familia === 'control-acceso') {
    if (/huella|biom[eé]tric/i.test(n)) m.tecnologia = 'huella';
    else if (/prox|mifare|rfid/i.test(n)) m.tecnologia = 'proximidad';
    else if (/teclado/i.test(n)) m.tecnologia = 'teclado';
  }

  if (familia === 'cable-red' || familia === 'jack-rj45' || familia === 'cordon-parcheo') {
    const c = n.match(/Cat\.?\s*(\d)\s*([Aa])?/i);
    if (c) m.categoria = c[1] + (c[2] ? c[2].toUpperCase() : '');
    if (/blindad|stp|ftp/i.test(n)) m.blindaje = 'blindado';
    const l = n.match(/(\d+)\s*'/);
    if (l && familia === 'cordon-parcheo') m.largo_pies = num(l[1]);
    const mt = n.match(/(\d{3})\s*M\b/i);
    if (mt && familia === 'cable-red') m.largo_m = num(mt[1]);
  }

  if (familia === 'patch-panel' || familia === 'placa-pared' || familia === 'equipo-red') {
    const p = n.match(/(\d+)[\s-]*(?:puertos?|port|po\b)/i);
    if (p) m.puertos = num(p[1]);
  }

  if (familia === 'interruptor-inteligente') {
    if (/triple/i.test(n)) m.canales = 3;
    else if (/doble|2 canales/i.test(n)) m.canales = 2;
    else if (/simple|sencill|1 canal/i.test(n)) m.canales = 1;
    if (/con neutro|c \/ neutro/i.test(n)) m.neutro = 'con';
    else if (/sin neutro|s \/ neutro/i.test(n)) m.neutro = 'sin';
  }

  if (familia === 'sensor-domotica') {
    if (/movimiento/i.test(n)) m.mide = 'movimiento';
    else if (/humedad|temp/i.test(n)) m.mide = 'temperatura y humedad';
    else if (/agua|fuga/i.test(n)) m.mide = 'fuga de agua';
    else if (/puerta|ventana/i.test(n)) m.mide = 'apertura';
  }

  if (familia === 'intercom-kit') {
    const ap = n.match(/(\d+)\s*(?:apartamentos?|apart)/i);
    if (ap) m.apartamentos = num(ap[1]);
    m.video = /video|timbre/i.test(n) ? 'si' : 'no';
  }

  if (familia === 'alimentacion') {
    const v = n.match(/(\d+)\s*V(?:dc|ac)?\b/i);
    if (v) m.voltaje_v = num(v[1]);
    const amp = n.match(/(\d+(?:\.\d+)?)\s*A\b/);
    if (amp) m.amperaje_a = num(amp[1]);
  }

  return m;
}

function regla(a) {
  const n = T.limpia(a.nombre);
  if (NO_ES_DE_OBRA.some(re => re.test(n))) return null;

  /* La herramienta de terminación es del instalador, no de la obra. */
  if (/^Herramienta|Turbotool|Z-Tool/i.test(n)) {
    return {
      cat: 'EQU-04', familia: 'herramienta-datos',
      clave: 'herramienta-de-terminacion-de-cableado',
      orden: 900,
      nombre: 'Herramienta de terminación de cableado',
      unidad: 'unidad',
      esp: 'Ponchadora de impacto para jacks y patch panels',
      etapa: 'instalaciones', origen: 'importado',
      alias: 'ponchadora, herramienta de impacto', medidas: {}
    };
  }

  if (!CATEGORIA[a.cat2]) return null;

  const f = FAMILIA.filter(x => x[0].test(n))[0];
  if (!f) return null;

  return ES.item(f[1], medidasDe(a, f[1]));
}

module.exports = { regla };
