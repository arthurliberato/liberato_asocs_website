'use strict';
/* =========================================================
   reglas-max.js — Max Ferretería

   El cuarto comercio, y el más pequeño: 45 artículos de su
   colección MADERAS. Pequeño no quiere decir poco: casi todos
   caen sobre ítems que ya existen, que es donde nace la
   comparación.

   La colección es mixta y la propia extracción lo advierte: solo
   9 de los 45 son madera o paneles; el resto es tubería de PVC,
   cemento y morteros, adhesivos y tinacos. La subcategoría de la
   tienda es inconsistente en el origen —el PEGAFORTE GRIS
   aparece archivado en TUBERIAS— así que aquí manda la familia
   normalizada de la extracción, y sobre ella el nombre.

   LO QUE ESTE COMERCIO RESUELVE
   -----------------------------
   Publica toda su tubería como «x 19», SCH-40 incluido. Con eso
   son dos comercios los que lo dicen y la ficha del catálogo se
   pudo corregir: el tubo de presión de 1/2" tampoco es de 20
   pies.
   ========================================================= */

const PLOM = require('./especificacion-plomeria.js');
const MADERA = require('./especificacion-madera.js');
const BALDOSAS = require('./especificacion-baldosas.js');   // ahí viven las familias de MAT-02

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();
const baja = s => limpia(s).toLowerCase()
  .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i')
  .replace(/[óò]/g, 'o').replace(/[úù]/g, 'u').replace(/ñ/g, 'n');

const MOTIVO = { valor: '' };

/* =========================================================
   Artículos que corresponden a un ítem que ya existe
   ========================================================= */

const MAPEO = {
  /* Cemento y morteros: es el tercer y el cuarto precio de los ítems más
     consultados del catálogo. */
  '0001103178': 'MAT-02-001',                     // CEMENTO GRIS ARGOS 94 LBS = 42.6 kg
  '0001108936': 'MAT-02-003',                     // CEMENTO ARGOS BLANCO 40KGS
  '0001110291': '#MAT-02|cemento-blanco-2',       // CEMENTO BLANCO PURO 2 LBS
  '0001134328': '#MAT-02|cemento-blanco-2',       // CEMENTO BLANCO HARDER 2LB
  '0001110292': '#MAT-02|cemento-blanco-5',       // CEMENTO BLANCO PURO 5 LBS
  '0001008005': 'MAT-02-013',                     // DERRETIDO BLANCO EUROJUNTA 5 KG

  /* «Mezcla para empañete» es el mortero de pañete: 94 lb son los 42.5 kg de
     la funda de obra. */
  '0001013746': 'MAT-02-009',

  /* Adhesivos de cerámica. La ficha no declara la clase C1/C2 —igual que en
     Cima— y el precio la ubica: los dos están en la banda del adhesivo normal,
     muy por debajo del deformable.

     El «SUPER PRO» no entra aquí a propósito: su nombre reclama una gama
     superior, que es exactamente la señal de que puede no ser el adhesivo
     normal. Ahí sí hay que preguntar en vez de deducir del precio. */
  '0001123332': 'MAT-02-007',                     // PEGA FORTE BLANCO 50LBS = 22.7 kg
  '0001123331': '#MAT-02|adhesivo-cementicio-clase-c1-color-gris-kg-22-7',   // PEGON 50LBS
  '0001115450': '#MAT-02|adhesivo-cementicio-clase-c1-color-gris-kg-22-7'    // PEGAFULL GRIS 22.7KG
};

/* Lo que queda fuera, con el motivo dicho por familia. */
const FUERA = {
  'Acabados (estuco)': 'presentación de 35 lb que el catálogo no tiene todavía',
  'Cementos, yeso y morteros': 'presentación que no corresponde a ningún ítem del catálogo'
};

/* =========================================================
   Reglas
   ========================================================= */

/* «1-1/2» es una pulgada y media. Se normaliza con la misma tabla que la
   plomería para que el tubo de Max y el de Cima caigan en la misma fila. */
function comoPulg(txt) {
  const t = String(txt || '').replace('-', ' ');
  const v = PLOM.pulgadas(t);
  return v === null ? '' : PLOM.comoPulgada(v);
}

/* El peso de la presentación. La extracción ya lo trae normalizado en
   «Presentacion 35 lb (15.88 kg)», así que se toma de ahí y se ajusta al
   nominal con la misma tabla que el resto del catálogo. */
function pesoKg(a) {
  const t = limpia(a.ref);
  let m = t.match(/\(([\d.]+)\s*kg\)/i);
  if (!m) m = t.match(/([\d.]+)\s*kg/i);
  return m ? BALDOSAS.aPesoKg(parseFloat(m[1])) : null;
}

const ESPESOR = { '1/8': '1/8"', '1/4': '1/4"', '3/8': '3/8"', '1/2': '1/2"',
                  '5/8': '5/8"', '3/4': '3/4"', '5.5': '5.5 mm', '12': '1/2"', '18': '3/4"' };

function regla(a) {
  const spec = clasificar(a);
  if (spec && spec.clave) {
    const yaP = PLOM.YA_EXISTE[spec.clave];
    if (yaP) return { existente: yaP };
    const yaM = MADERA.YA_EXISTE[spec.clave];
    if (yaM) return { existente: yaM };
  }
  return spec;
}

function clasificar(a) {
  MOTIVO.valor = '';
  const n = baja(a.nombre);
  const fam = a.cat3;

  /* ---- Tubería ---- */
  if (fam === 'Tuberia') {
    /* El nombre pone la medida y la norma en el orden que quiere:
       «TUBO PVC 1-1/2X19 SCH-40» y «TUBO 6X19 SDR-41 PVC». */
    const m = limpia(a.nombre).match(/(\d+(?:-\d+\/\d+|\/\d+)?)\s*[xX]\s*(\d+)/);
    const norma = (limpia(a.nombre).match(/(SDR-?\d+|SCH-?\d+)/i) || [])[1];
    if (!m || !norma) { MOTIVO.valor = 'la ficha no declara el diámetro, el largo o la norma del tubo'; return null; }
    const d = comoPulg(m[1]);
    if (!d) { MOTIVO.valor = 'no se entiende el diámetro del tubo'; return null; }
    return PLOM.item('tubo', {
      material: 'PVC', norma: norma.toUpperCase().replace(/^(SDR|SCH)(\d)/, '$1-$2'),
      diametro: d, largo_pies: parseInt(m[2], 10)
    });
  }

  /* ---- Tinacos ---- */
  if (fam === 'Tinacos y almacenamiento de agua') {
    const m = limpia(a.nombre).match(/(\d+)\s*GLS?\b/i);
    if (!m) { MOTIVO.valor = 'la ficha no declara la capacidad del tinaco'; return null; }
    return PLOM.item('tinaco', { capacidad_gal: parseInt(m[1], 10) });
  }

  /* ---- Madera aserrada ---- */
  if (fam === 'Madera aserrada') {
    const m = limpia(a.nombre).match(/(\d+)\s*[xX]\s*(\d+)\s*[xX]\s*(\d+)/);
    if (!m) { MOTIVO.valor = 'la ficha no declara la escuadría o el largo'; return null; }
    /* Bruta o cepillada: son dos productos con dos precios y el comercio lo
       declara, así que entra en la clave. */
    const acabado = /cep\.?|cepill/.test(n) ? 'cepillada' : /bruto|bruta/.test(n) ? 'bruta' : '';
    if (!acabado) { MOTIVO.valor = 'la ficha no dice si la pieza es bruta o cepillada'; return null; }
    const especie = /amer/.test(n) ? 'pino americano' : /chilen/.test(n) ? 'pino chileno'
                  : /pino/.test(n) ? 'pino' : '';
    if (!especie) { MOTIVO.valor = 'la ficha no declara la especie de la madera'; return null; }
    return MADERA.item('madera-pieza', {
      especie: especie, escuadria: m[1] + '" x ' + m[2] + '"',
      largo_pies: parseInt(m[3], 10), acabado: acabado
    });
  }

  /* ---- Paneles ---- */
  if (fam === 'Paneles y plywood') {
    const material = /mdf/.test(n) ? (/hidrofug/.test(n) ? 'Plywood MDF hidrófugo' : 'Plywood MDF')
                   : /okume/.test(n) ? 'Plywood de okume'
                   : /formaleta/.test(n) ? 'Plywood de formaleta'
                   : /pino/.test(n) ? 'Plywood de pino' : '';
    if (!material) { MOTIVO.valor = 'la ficha no declara el material del panel'; return null; }
    /* El espesor viene en fracción de pulgada, en milímetros o en las dos. */
    let esp = '';
    let m = limpia(a.nombre).match(/(\d+\/\d+)(?!\d)/);
    if (m) esp = ESPESOR[m[1]] || (m[1] + '"');
    if (!esp) { m = limpia(a.nombre).match(/(\d+(?:\.\d+)?)\s*MM/i); if (m) esp = ESPESOR[m[1]] || (m[1] + ' mm'); }
    if (!esp) { MOTIVO.valor = 'la ficha no declara el espesor del panel'; return null; }
    return MADERA.item('panel', { material: material, espesor: esp, formato: '4 x 8 pies' });
  }

  /* ---- Adhesivos ---- */
  if (fam === 'Adhesivos y morteros cola') {
    /* Los que tienen ítem entran por MAPEO. Aquí quedan los que la propia
       extracción marca sin presentación —«PEGAFORTE GRIS» y «PEGAFORTE PRO
       GRE», sin peso ni en el nombre ni en la ficha— y el que reclama una gama
       superior sin declarar la clase. */
    if (/presentacion no/.test(baja(a.ref))) {
      MOTIVO.valor = 'la ficha no declara la presentación';
      return null;
    }
    MOTIVO.valor = 'la ficha no declara la clase del adhesivo y su nombre reclama una gama superior';
    return null;
  }

  /* ---- Yeso y estuco ---- */
  if (fam === 'Cementos, yeso y morteros' && /^yeso/.test(n)) {
    const kg = pesoKg(a);
    if (!kg) { MOTIVO.valor = 'la ficha no declara el peso de la funda de yeso'; return null; }
    return BALDOSAS.item('yeso', { kg: kg });
  }
  if (fam === 'Acabados (estuco)') {
    const kg = pesoKg(a);
    if (!kg) { MOTIVO.valor = 'la ficha no declara el peso de la funda de estuco'; return null; }
    const color = /blanc|blco/.test(n) ? 'blanco' : 'gris';
    return BALDOSAS.item('estuco', { color: color, kg: kg });
  }

  if (FUERA[fam]) { MOTIVO.valor = FUERA[fam]; return null; }
  return undefined;
}

/* =========================================================
   METALES — la colección donde la tienda no dice la unidad
   =========================================================

   Es el caso más limpio de «un precio sin unidad no es un precio». La ficha
   deja vacío el campo de unidad de venta en toda la tienda, y en clavos,
   alambre de amarre y electrodos —17 de 27 artículos— no se sabe si los
   RD$ 60 son por libra, por unidad o por paquete. Asumir «por libra»
   contaminaría la comparación contra Ochoa y Cima, que sí la declaran.

   Quedan fuera los 17, con el motivo dicho. Es una pregunta corta al vendedor
   y desbloquea media colección. */

const MAPEO_METALES = {
  /* Alambre de púas C-16 en rollo de 250 m: dos marcas en el mismo ítem, y
     ahí aparece lo que un índice de precios existe para mostrar. Corvi a
     RD$ 2,390 y Motto a RD$ 3,785 por la misma especificación: 58% de
     diferencia. Vale confirmar si el calibre real o el número de púas difiere;
     si no, es diferencia de marca pura. */
  '0001117049': '#MAT-22|alambre-puas-16-250',   // ALAMBRE PUAS PREMIUM CORVI 250 M C-16
  '0001007285': '#MAT-22|alambre-puas-16-250',   // ALAMBRE PUAS MOTTO C-16 250 MTS

  /* Zinc de 3 x 6 pies. Ojo al presupuestar: esa área es nominal y el área
     útil de cubierta baja entre 15% y 20% por el traslape. */
  '0001003275': '#MAT-07|zinc-acanalado-34-3x6',       // ZINC ACAN. 3X6 C-34
  '0001130482': '#MAT-07|zinc-translucido-3x6',        // ZINC TRANSLUCIDO BLANCO 3X6
  '0001130481': '#MAT-07|zinc-translucido-3x6',        // ZINC TRANSLUCIDO AZUL 3X6

  '0001003267': '#MAT-02|yeso-en-polvo-blanco-2-lb'   // YESO PURO 2 LBS
};

/* Familias enteras que no entran, con el motivo. */
const FUERA_METALES = {
  'Clavos y grapas': 'la tienda no declara la unidad de venta: no se sabe si el precio es por libra, por unidad o por paquete',
  'Alambre de amarre galvanizado': 'la tienda no declara la unidad de venta: no se sabe si el precio es por libra, por unidad o por paquete',
  'Electrodos de soldadura': 'la tienda no declara la unidad de venta: no se sabe si el precio es por libra, por unidad o por paquete',
  'Perfiles de aluminio': 'la ficha no publica el largo del perfil, y sin él el precio no dice nada'
};

function reglaMetales(a) {
  MOTIVO.valor = '';
  const n = baja(a.nombre);
  const fam = a.cat3;

  if (FUERA_METALES[fam]) { MOTIVO.valor = FUERA_METALES[fam]; return null; }

  /* Tapa de cisterna. La ficha no declara el material, pero los dos formatos
     y los dos precios son los de las tapas de aluminio que Cima sí declara
     —30x30 a RD$ 4,503 contra 4,745, y 24x24 a RD$ 3,313 contra 3,795—, y en
     el país la tapa de cisterna de ese precio es de aluminio. Queda dicho aquí
     por si alguien la encuentra de otro material. */
  if (fam === 'Tapas de cisterna') {
    const m = limpia(a.nombre).match(/(\d+)\s*[xX]\s*(\d+)/);
    if (!m) { MOTIVO.valor = 'la ficha no declara la medida de la tapa'; return null; }
    return PLOM.item('tapa-cisterna', {
      material: 'aluminio', medida: m[1] + ' x ' + m[2] + ' pulgadas'
    });
  }

  /* El yeso y el zinc entran por MAPEO; lo que llegue aquí es de una familia
     sin regla. */
  return undefined;
}

module.exports = { MAPEO, FUERA, MAPEO_METALES, FUERA_METALES, MOTIVO, regla, reglaMetales };
