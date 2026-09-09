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
    alias: 'cámara CCTV, cámara de seguridad',
    esp: 'Cámara de circuito cerrado para videovigilancia'
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
    esp: 'Disco pensado para escribir las 24 horas; uno de escritorio no aguanta'
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
    esp: 'Cámaras, grabador y disco en un solo paquete'
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
  'accesorio-alarma': {
    cat: 'MAT-28', base: 'Accesorio de sistema de alarma', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 80, alias: 'módulo, tarjeta, control remoto de alarma'
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
    esp: 'Necesita neutro en la caja: hay que preverlo antes de cerrar la pared'
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
  'intercom-estacion': {
    cat: 'MAT-31', base: 'Estación de intercomunicador', unidad: 'unidad',
    ejes: ['pulgadas'], etapa: 'instalaciones', orden: 70, alias: 'monitor de intercom, estación interior'
  },
  'intercom-accesorio': {
    cat: 'MAT-31', base: 'Accesorio de intercomunicador', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 80, alias: 'módulo, cubierta, fuente de intercom'
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
    esp: f.esp || '',
    etapa: f.etapa,
    origen: 'importado',
    alias: f.alias,
    medidas: medidas
  };
}

module.exports = { FAMILIAS, item };
