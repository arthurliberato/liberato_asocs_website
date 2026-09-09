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

/* Para ordenar dentro de la página: primero el equipo principal,
   después lo que lo acompaña. */
const TIPOS = [
  [/^(Camara|Cam |Domo|Flexidome|Minidomo|Microdomo)/i, 'Cámara',            'estructura'],
  [/^(Dvr|Nvr|Xvr|Grabador)/i,                          'Grabador',          'estructura'],
  [/^Disco Duro/i,                                      'Disco de grabación','estructura'],
  [/^(Central|Panel)/i,                                 'Panel de control',  'instalaciones'],
  [/^Teclado/i,                                         'Teclado',           'instalaciones'],
  [/^(Detector|Sensor|Contacto)/i,                      'Detector',          'instalaciones'],
  [/^(Sirena|Bocina|Estrobo)/i,                         'Sirena o bocina',   'instalaciones'],
  [/^(Estacion|Estación|Pulsador|Boton|Botón)/i,        'Estación o pulsador','instalaciones'],
  [/^(Control Acceso|Control De Acceso|Lector|Cerradura)/i, 'Control de acceso','instalaciones'],
  [/^(Kit|Monitor|Telefono|Teléfono|Videoportero)/i,    'Equipo terminal',   'instalaciones'],
  [/^(Cable|Cordon|Cordón)/i,                           'Cable',             'instalaciones'],
  [/^(Jack|Keystone|Cat ?\d|Placa|Faceplate|Fp,|Patch|Plug |Mc\d|Utp |Panel De Conex|Rack|Tapa Ciega|Organizador|Pasador|Bandeja|Manga|Distribuidor|Modulo|Módulo|Acoplador|Adaptador|Jumper|Barril|Cople|Conector|Casquillo|Inserto|Tira|Decorator)/i,
                                                        'Componente de cableado', 'instalaciones'],
  [/^(Parlante|Amplificador|Altavoz)/i,                 'Sonido y voceo',    'instalaciones'],
  [/^(Controlador|Comunicador|Display|Programador|Bisel|Gabinete|Carril)/i,
                                                        'Accesorio de panel','instalaciones'],
  [/^(Interruptor|Interrupto|Tomacorriente|Toma |Int\.|Dimmer|Microfluxa|Shutter)/i,
                                                        'Dispositivo de domótica', 'instalaciones'],
  [/^(Fuente|Power|Transf|Injector|Inyector|Pdu|Regenerador|Capacitor|Bateria|Batería)/i,
                                                        'Alimentación',      'instalaciones'],
  [/^(Soporte|Bracket|Carcasa|Caja|Base|Cubierta|Anillo|Aislador|Poste)/i,
                                                        'Soporte o caja',    'instalaciones'],
  [/^(Electrificador|Letrero)/i,                        'Cerco eléctrico',   'exteriores'],
  [/^(Tarjeta|Configurador|Control Remoto|Llavero|Mando)/i, 'Accesorio de sistema', 'instalaciones'],
  [/^(Video Balun|Balun|Conversor|Switch|Mini Switch|Receptor|Transmisor|Borne|Bridge|Hub Tipo|Concentrador|Unidad Central|Terminal|Modulador|Wireless)/i,
                                                        'Equipo de red',     'instalaciones']
];

function regla(a) {
  const n = T.limpia(a.nombre);
  if (NO_ES_DE_OBRA.some(re => re.test(n))) return null;

  /* La herramienta de terminación es del instalador, no de la obra: va
     con la herramienta menor y no con los materiales del sistema. */
  const cat = /^Herramienta|Turbotool|Z-Tool/i.test(n) ? 'EQU-04' : CATEGORIA[a.cat2];
  if (!cat) return null;

  const t = TIPOS.filter(x => x[0].test(n))[0];
  const tipo = t ? t[1] : 'Otro componente';

  /* El rubro del comercio agrupa bien, pero no siempre: hay cámaras y
     grabadores archivados en domótica, y estaciones de intercom en
     cableado. Cuando el nombre dice claramente qué es, manda el nombre. */
  const catFinal =
    /^(Cámara|Grabador|Disco de grabación)$/.test(tipo) ? 'MAT-16' :
    /intercom|videoportero|conserje/i.test(n) ? 'MAT-31' :
    cat;
  const etapa = t ? t[2] : 'instalaciones';
  const orden = t ? TIPOS.indexOf(t) : TIPOS.length;

  const nombre = T.recorta(T.normaliza(n, ABREV));

  const detalle = [];
  if (a.marca && !/GENERICO/i.test(a.marca)) detalle.push('marca ' + a.marca);
  if (a.cat3) detalle.push(a.cat3);
  if (a.ref) detalle.push('referencia ' + a.ref);

  return {
    cat: catFinal,
    tipo: tipo,
    orden: orden * 1000000 + Math.round(a.precio),
    clave: T.clave(tipo + '-' + nombre),
    nombre: nombre,
    unidad: 'unidad',
    esp: detalle.join(' · '),
    etapa: etapa,
    origen: 'importado',
    alias: ''
  };
}

module.exports = { regla };
