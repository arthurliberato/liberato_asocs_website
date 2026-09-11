'use strict';
/* =========================================================
   especificacion-segtec.js — el ítem es la especificación

   Misma idea que en baños: una cámara bullet de 2 MP con lente
   de 2.8 mm es un solo ítem, la venda Dahua o la venda Hikvision.
   La marca y el modelo van en la cotización.

   Aquí los ejes son casi todos numéricos y el propio nombre del
   producto los trae, que es lo bueno de este rubro: «Camara
   Bullet 2Mp 2.8Mm», «NVR 8 Canales», «Cable UTP Cat 6», «Panel
   De Control IP 28 Zonas». Lo que hay que hacer es leerlos bien
   y no dejar que la marca entre en el nombre del ítem.
   ========================================================= */

const FAMILIAS = {
  'camara': {
    cat: 'MAT-16', base: 'Cámara de seguridad', unidad: 'unidad',
    ejes: ['formato', 'resolucion_mp'], etapa: 'estructura', orden: 10,
    alias: 'cámara CCTV, cámara de seguridad'
  },
  'grabador': {
    cat: 'MAT-16', base: 'Grabador de video', unidad: 'unidad',
    ejes: ['tecnologia', 'canales'], etapa: 'estructura', orden: 20,
    alias: 'DVR, NVR, XVR, grabador'
  },
  'disco-grabacion': {
    cat: 'MAT-16', base: 'Disco duro para videovigilancia', unidad: 'unidad',
    ejes: ['capacidad_tb'], etapa: 'estructura', orden: 30,
    alias: 'disco de vigilancia, HDD',
    esp: 'Escritura 24/7 · uno de escritorio no aguanta'
  },
  'monitor-cctv': {
    cat: 'MAT-16', base: 'Monitor para CCTV', unidad: 'unidad',
    ejes: ['pulgadas'], etapa: 'estructura', orden: 40, alias: 'monitor de vigilancia'
  },
  'soporte-camara': {
    cat: 'MAT-16', base: 'Soporte o caja para cámara', unidad: 'unidad',
    ejes: [], etapa: 'estructura', orden: 50, alias: 'bracket, soporte de cámara'
  },
  'balun': {
    cat: 'MAT-16', base: 'Video balun', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 60, alias: 'balun, transceptor de video'
  },

  'kit-cctv': {
    cat: 'MAT-16', base: 'Kit de videovigilancia', unidad: 'juego',
    ejes: ['camaras', 'formato', 'resolucion_mp'], etapa: 'estructura', orden: 5,
    alias: 'kit de cámaras, combo de videovigilancia',
    esp: 'Incluye grabador y disco'
  },
  'kit-alarma': {
    cat: 'MAT-28', base: 'Kit de alarma', unidad: 'juego',
    ejes: [], etapa: 'instalaciones', orden: 5, alias: 'kit de alarma, combo de seguridad'
  },
  'panel-alarma': {
    cat: 'MAT-28', base: 'Panel de alarma', unidad: 'unidad',
    ejes: ['zonas'], etapa: 'instalaciones', orden: 10, alias: 'panel de control, central de alarma'
  },
  'teclado-alarma': {
    cat: 'MAT-28', base: 'Teclado para alarma', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 20, alias: 'teclado de alarma'
  },
  'detector-movimiento': {
    cat: 'MAT-28', base: 'Detector de movimiento', unidad: 'unidad',
    ejes: ['alcance_m'], etapa: 'instalaciones', orden: 30, alias: 'sensor PIR, detector de movimiento'
  },
  'contacto-magnetico': {
    cat: 'MAT-28', base: 'Contacto magnético para puerta o ventana', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 40, alias: 'contacto magnético, sensor de apertura'
  },
  'sirena': {
    cat: 'MAT-28', base: 'Sirena de alarma', unidad: 'unidad',
    ejes: ['ubicacion'], etapa: 'instalaciones', orden: 50, alias: 'sirena, bocina de alarma'
  },
  'control-acceso': {
    cat: 'MAT-28', base: 'Control de acceso', unidad: 'unidad',
    ejes: ['tecnologia'], etapa: 'instalaciones', orden: 60, alias: 'control de acceso, lector'
  },
  'cerco-electrico': {
    cat: 'MAT-28', base: 'Equipo de cerco eléctrico', unidad: 'unidad',
    ejes: [], etapa: 'exteriores', orden: 70, alias: 'electrificador, cerco eléctrico'
  },
  /* LO QUE HABÍA DENTRO DE «ACCESORIO DE SISTEMA DE ALARMA»

     Setenta y dos cotizaciones de RD$ 147 a RD$ 34.654 —doscientas
     treinta y seis veces— y ahí dentro, mezcladas, cinco cosas que no se
     parecen en nada: el soporte de chapa que sujeta una cámara, la caja
     que la aloja, el módulo electrónico que expande el panel, la tapa de
     plástico que cubre un hueco y el control remoto del usuario.

     Se separan por función, que es lo que distingue un presupuesto: los
     soportes y las cajas se cuentan por punto instalado, los módulos por
     capacidad del panel, las cubiertas por hueco y los mandos por
     usuario. Nadie compra un módulo de expansión mirando lo que cuesta
     un bisel. */
  'soporte-montaje': {
    cat: 'MAT-28', base: 'Soporte de montaje para equipo de seguridad', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 78,
    alias: 'soporte, bracket, base de montaje, brazo'
  },
  'caja-equipo': {
    cat: 'MAT-28', base: 'Caja o carcasa para equipo de seguridad', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 79,
    alias: 'caja de conexión, carcasa, gabinete, caja de registro'
  },
  'modulo-panel': {
    cat: 'MAT-28', base: 'Módulo de expansión para panel de alarma', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 80,
    alias: 'módulo de expansión, módulo de zona, módulo multiplex, tarjeta de panel'
  },
  'cubierta-modulo': {
    cat: 'MAT-28', base: 'Cubierta o bisel de módulo', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 81,
    alias: 'cubierta, bisel, módulo ciego, tapa'
  },
  'mando-credencial': {
    cat: 'MAT-28', base: 'Control remoto o credencial de acceso', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 82,
    alias: 'control remoto, llavero, tarjeta de proximidad, badge'
  },
  'accesorio-alarma': {
    cat: 'MAT-28', base: 'Accesorio de sistema de alarma', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 83, alias: 'accesorio de alarma'
  },

  'detector-incendio': {
    cat: 'MAT-29', base: 'Detector para sistema de incendio', unidad: 'unidad',
    ejes: ['deteccion'], etapa: 'instalaciones', orden: 10, alias: 'detector de humo, detector de calor'
  },
  'estacion-manual': {
    cat: 'MAT-29', base: 'Estación manual de incendio', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 20, alias: 'estación manual, pulsador de incendio'
  },
  'sirena-incendio': {
    cat: 'MAT-29', base: 'Sirena o estrobo de incendio', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 30, alias: 'sirena con estrobo, notificación'
  },
  'panel-incendio': {
    cat: 'MAT-29', base: 'Panel de control de incendio', unidad: 'unidad',
    ejes: ['zonas'], etapa: 'instalaciones', orden: 40, alias: 'panel de incendio, central'
  },
  'accesorio-incendio': {
    cat: 'MAT-29', base: 'Accesorio de sistema de incendio', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 50, alias: 'base, caja, módulo de incendio'
  },

  'cable-red': {
    cat: 'MAT-30', base: 'Cable de red', unidad: 'rollo',
    ejes: ['categoria', 'blindaje'], etapa: 'instalaciones', orden: 10,
    alias: 'cable UTP, cable de red'
  },
  'cable-fibra': {
    cat: 'MAT-30', base: 'Cable de fibra óptica', unidad: 'rollo',
    ejes: [], etapa: 'instalaciones', orden: 20, alias: 'fibra óptica'
  },
  'cable-coaxial': {
    cat: 'MAT-30', base: 'Cable coaxial', unidad: 'rollo',
    ejes: [], etapa: 'instalaciones', orden: 30, alias: 'coaxial, RG-6'
  },
  'cable-instalacion': {
    cat: 'MAT-30', base: 'Cable de instalación para sistemas', unidad: 'rollo',
    ejes: [], etapa: 'instalaciones', orden: 40, alias: 'cable de alarma, cable de voceo'
  },
  'jack-rj45': {
    cat: 'MAT-30', base: 'Jack RJ45', unidad: 'unidad',
    ejes: ['categoria', 'blindaje'], etapa: 'instalaciones', orden: 50, alias: 'jack, keystone'
  },
  'cordon-parcheo': {
    cat: 'MAT-30', base: 'Cordón de parcheo', unidad: 'unidad',
    ejes: ['categoria', 'largo_pies'], etapa: 'instalaciones', orden: 60, alias: 'patch cord, cordón'
  },
  'patch-panel': {
    cat: 'MAT-30', base: 'Patch panel', unidad: 'unidad',
    ejes: ['puertos'], etapa: 'instalaciones', orden: 70, alias: 'panel de parcheo'
  },
  'placa-pared': {
    cat: 'MAT-30', base: 'Placa de pared para datos', unidad: 'unidad',
    ejes: ['puertos'], etapa: 'instalaciones', orden: 80, alias: 'faceplate, placa de pared'
  },
  'rack': {
    cat: 'MAT-30', base: 'Rack y accesorios de gabinete', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 90, alias: 'rack, organizador, bandeja'
  },
  'equipo-red': {
    cat: 'MAT-30', base: 'Equipo de red', unidad: 'unidad',
    ejes: ['puertos'], etapa: 'instalaciones', orden: 100, alias: 'switch, PoE, extensor'
  },
  'conector-datos': {
    cat: 'MAT-30', base: 'Conector y accesorio de cableado', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 110, alias: 'conector, acoplador, plug'
  },
  'sonido': {
    cat: 'MAT-30', base: 'Parlante o amplificador de voceo', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 120, alias: 'parlante, voceo, sonido'
  },

  'interruptor-inteligente': {
    cat: 'MAT-31', base: 'Interruptor inteligente', unidad: 'unidad',
    ejes: ['canales', 'neutro'], etapa: 'instalaciones', orden: 10,
    alias: 'interruptor wifi, interruptor inteligente',
    /* Solo cuando el nombre no dice con/sin neutro: los Sonoff sin eje lo exigen. */
    esp: m => m.neutro ? '' : 'Necesita neutro en la caja'
  },
  'tomacorriente-smart': {
    cat: 'MAT-31', base: 'Tomacorriente inteligente', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 20, alias: 'tomacorriente smart, enchufe wifi'
  },
  'sensor-domotica': {
    cat: 'MAT-31', base: 'Sensor de domótica', unidad: 'unidad',
    ejes: ['mide'], etapa: 'instalaciones', orden: 30, alias: 'sensor inteligente, zigbee'
  },
  'hub-domotica': {
    cat: 'MAT-31', base: 'Central de domótica', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 40, alias: 'hub, gateway, central inteligente'
  },
  'cerradura-inteligente': {
    cat: 'MAT-31', base: 'Cerradura inteligente', unidad: 'unidad',
    ejes: [], etapa: 'puertas-ventanas', orden: 50, alias: 'cerradura inteligente, smart lock'
  },
  'intercom-kit': {
    cat: 'MAT-31', base: 'Kit de intercomunicador', unidad: 'juego',
    ejes: ['apartamentos', 'video'], etapa: 'instalaciones', orden: 60,
    alias: 'intercomunicador, videoportero'
  },
  /* LAS CUATRO PIEZAS DE UNA INSTALACIÓN DE INTERCOM

     «Accesorio de intercomunicador» era un cajón: doce cotizaciones de
     RD$ 305 a RD$ 11.520 —treinta y ocho veces— con un teléfono de
     audio, un monitor de video de 7", la placa de calle y los herrajes
     de montaje dentro del mismo ítem. Ninguno de los cuatro se
     presupuesta mirando a los otros tres.

     Se separan como se compran, que es por dónde van montados: el
     teléfono o el monitor en cada apartamento, la placa en el portón,
     y los herrajes y los dispositivos de línea a razón de lo que pida
     la instalación. Un edificio de ocho apartamentos lleva ocho de la
     primera y una de la segunda: mezclarlas es contar ocho placas de
     calle. */
  'intercom-telefono': {
    cat: 'MAT-31', base: 'Teléfono de intercomunicador', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 70,
    esp: 'Unidad interior de audio, una por apartamento',
    alias: 'teléfono de intercom, unidad interior, auricular'
  },
  'intercom-monitor': {
    cat: 'MAT-31', base: 'Monitor de intercomunicador', unidad: 'unidad',
    ejes: ['pulgadas'], etapa: 'instalaciones', orden: 72,
    esp: 'Unidad interior con video, una por apartamento',
    alias: 'monitor de intercom, estación interior, videoportero interior'
  },
  'intercom-placa': {
    cat: 'MAT-31', base: 'Placa de calle de intercomunicador', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 74,
    esp: 'Unidad exterior del portón, una por entrada',
    alias: 'placa de calle, estación de puerta, frente de calle'
  },
  /* Y lo que quedaba en «Accesorio de intercomunicador» son dos cosas
     más: lo que va en la línea —la sonería que suena en otro cuarto, el
     derivador del montante, la unidad de secreto— y el herraje que
     sujeta la placa a la pared. Lo primero se cuenta por vivienda o por
     montante; lo segundo, por entrada. */
  'intercom-linea': {
    cat: 'MAT-31', base: 'Dispositivo de línea de intercomunicador', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 76,
    alias: 'derivador, montante, sonería, unidad de secreto'
  },
  'intercom-montaje': {
    cat: 'MAT-31', base: 'Herraje de montaje de intercomunicador', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 78,
    alias: 'marco, frontal, módulo de montaje, caja de empotrar'
  },
  'intercom-accesorio': {
    cat: 'MAT-31', base: 'Accesorio de intercomunicador', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 80,
    alias: 'accesorio de intercomunicador'
  },
  'timbre-inteligente': {
    cat: 'MAT-31', base: 'Timbre inteligente', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 90, alias: 'timbre wifi, video timbre'
  },

  'alimentacion': {
    cat: 'MAT-30', base: 'Fuente de alimentación para sistemas', unidad: 'unidad',
    ejes: ['voltaje_v'], etapa: 'instalaciones', orden: 130, alias: 'fuente, power supply, PoE'
  }
};

const ETIQUETA = {
  formato:       v => v,
  camaras:       v => v + ' cámaras',
  resolucion_mp: v => v + ' MP',
  tecnologia:    v => v,
  canales:       v => v + ' canales',
  capacidad_tb:  v => v + ' TB',
  pulgadas:      v => v + '"',
  zonas:         v => v + ' zonas',
  alcance_m:     v => 'alcance ' + v + ' m',
  ubicacion:     v => 'de ' + v,
  deteccion:     v => 'de ' + v,
  categoria:     v => 'Cat ' + v,
  blindaje:      v => v === 'blindado' ? 'blindado' : '',
  largo_pies:    v => v + ' pies',
  puertos:       v => v + ' puertos',
  neutro:        v => v === 'con' ? 'con neutro' : v === 'sin' ? 'sin neutro' : '',
  mide:          v => 'de ' + v,
  apartamentos:  v => v + ' apartamentos',
  video:         v => v === 'si' ? 'con video' : 'solo audio',
  voltaje_v:     v => v + ' V'
};

const limpia = s => String(s || '').trim();

function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia de seguridad desconocida: ' + familia);
  medidas = medidas || {};

  const partes = [];
  const claves = [familia];
  f.ejes.forEach(eje => {
    const v = limpia(medidas[eje]);
    if (!v) return;
    claves.push(eje + '-' + v);
    const t = ETIQUETA[eje] ? ETIQUETA[eje](v) : v;
    if (t) partes.push(t);
  });

  return {
    cat: f.cat,
    familia: familia,
    clave: claves.join('-').toLowerCase().replace(/[^a-z0-9.]+/g, '-'),
    orden: f.orden,
    nombre: f.base + (partes.length ? ' ' + partes.join(' ') : ''),
    unidad: f.unidad,
    esp: typeof f.esp === 'function' ? f.esp(medidas) : (f.esp || ''),
    etapa: f.etapa,
    origen: 'importado',
    alias: f.alias,
    medidas: medidas
  };
}

module.exports = { FAMILIAS, item };
