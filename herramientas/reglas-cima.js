'use strict';
/* =========================================================
   reglas-cima.js — Ferretería Cima

   El tercer comercio del catálogo, y el primero que entra
   fuerte en plomería. Trae dos colecciones: PLOMERÍA Y BAÑOS
   (862 artículos) y MATERIALES (53).

   MATERIALES es corto y casi todo cae sobre ítems que ya
   existen, así que va por mapeo declarado a mano, artículo por
   artículo, con su justificación cuando la equivalencia no salta
   a la vista. Ahí está el valor: es el tercer precio del cemento
   y del derretido.

   PLOMERÍA es lo contrario: 862 artículos de los que la mayor
   parte es territorio nuevo. Va por reglas contra la tabla de
   especificación de plomería, más la de baños que ya comparten
   Ochoa e InnovaCentro.

   LO QUE NO ENTRA
   ---------------
   La misma regla de siempre: entra lo que un constructor
   presupuesta e instala, no el repuesto que el dueño de casa
   compra para cambiar una pieza rota. Aquí eso saca 56 repuestos
   de inodoro (peras, balancines, juntas de cera), 37 repuestos
   de grifería y los destupidores.
   ========================================================= */

const PLOM = require('./especificacion-plomeria.js');
const BANOS = require('./especificacion-banos.js');
const BALDOSAS_ESP = require('./especificacion-baldosas.js');

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();
const baja = s => limpia(s).toLowerCase()
  .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i')
  .replace(/[óò]/g, 'o').replace(/[úù]/g, 'u').replace(/ñ/g, 'n');

/* =========================================================
   MATERIALES — mapeo declarado
   ========================================================= */

const MAPEO = {
  /* Cemento y morteros. La funda de cemento gris no declara el peso, pero el
     mismo comercio vende aparte la presentación de 5 lb como «detalle»: la
     funda a secas es la de 42.5 kg, que es la única que se vende por funda en
     el país. El precio de RD$ 600 cae dentro del rango de los otros dos
     comercios (535–655), que lo confirma. */
  '061084': 'MAT-02-001',        // CEMENTO GRIS FUNDA
  '001060': 'MAT-02-003',        // CEMENTO BLANCO FUNDA 40KG
  '001052': 'MAT-02-005',        // MEZCLA JUNTA BLOCK FUNDA 93LBS = 42.2 kg
  '001050': 'MAT-02-009',        // MEZCLA PANETE FUNDA 94LBS = 42.6 kg

  /* «Pegamento cerámica gris 50 lb» son los mismos 22.7 kg del Pegacol de
     Ochoa. La ficha no declara la clase, pero el precio la delata: RD$ 310
     está en la banda del adhesivo normal C1 (Ochoa: 311–523) y muy por debajo
     del deformable C2 (662). */
  '001156': '#MAT-02|adhesivo-cementicio-clase-c1-color-gris-kg-22-7',

  /* Derretido de 5 kg en diez colores: un solo ítem, diez cotizaciones que no
     son idénticas y por eso no se colapsan — van de RD$ 495 a RD$ 525. */
  '020300': 'MAT-02-013', '020302': 'MAT-02-013', '020303': 'MAT-02-013',
  '030020': 'MAT-02-013', '020320': 'MAT-02-013', '030014': 'MAT-02-013',
  '020309': 'MAT-02-013', '030023': 'MAT-02-013', '030024': 'MAT-02-013',
  '098595': 'MAT-02-013',

  /* Alambre de púas calibre 16 en rollo de 250 m, el mismo que ya trae Ochoa. */
  '7861136600945': '#MAT-22|alambre-puas-16-250',
  '465281263088': '#MAT-22|alambre-puas-16-250',

  /* El cemento de detalle, en libras, sí tiene ítem: el catálogo ya trae las
     presentaciones de 2, 5 y 10 libras que trajo InnovaCentro. */
  '7465710056014': '#MAT-02|cemento-blanco-2',   // CEMENTO BLANCO 2LB
  '7465710056021': '#MAT-02|cemento-blanco-5',   // CEMENTO BLANCO 5LB
  '069041': '#MAT-02|cemento-gris-5',            // CEMENTO GRIS DETALLE 5LB
  '7465710056045': '#MAT-02|yeso-en-polvo-blanco-2-lb',   // YESO 2LB

  /* Separadores de cerámica: es lo que en el catálogo de Ochoa se llama
     cruceta, y aquí sí declaran cuántas trae el paquete. */
  '8413797269918': '#MAT-08|cruceta-espesor-mm-1-5-piezas-300',
  '8413797029123': '#MAT-08|cruceta-espesor-mm-1-5-piezas-300',
  '7897451462739': '#MAT-08|cruceta-espesor-mm-1-5-piezas-300',
  '8413797029024': '#MAT-08|cruceta-espesor-mm-3-piezas-200',
  '8413797029031': '#MAT-08|cruceta-espesor-mm-5-piezas-100'
};

/* Lo que queda fuera de MATERIALES, y por qué. Se dice por familia porque el
   comercio la trae declarada y así el informe explica en vez de callar. */
const FUERA_MATERIALES = {
  'Clavos': 'el nombre no declara la unidad: a RD$ 97 podría ser la libra o la caja',
  'Mallas y telas': 'la ficha no declara el alto del rollo, y sin eso una tela metálica no se puede presupuestar',
  'Colorantes / polvo de mosaico': 'la ficha no declara la presentación ni el grado del pigmento',
  'Soldadura': 'no corresponde a ninguna categoría del catálogo todavía',
  'Fijaciones': 'la ficha no declara la unidad de venta',

  'Alambres': 'el nombre no declara la unidad de venta',
  'Cemento': 'presentación que no corresponde a ningún ítem del catálogo'
};

/* Las equivalencias con los ítems escritos a mano viven en la tabla de
   especificación, no aquí: son del catálogo, no de este comercio. Ojo con una
   trampa de este caso: nuestra ficha del tubo dice «drenaje» porque es como se
   pide en la obra, y su especificación es el SDR-41. El PVC que Cima llama
   «DRENAJE» a secas es otro producto, más barato —RD$ 1,001 contra RD$ 1,695
   en el mismo diámetro— y va en su propio ítem. */

/* =========================================================
   PLOMERÍA — reglas
   ========================================================= */

const MOTIVO = { valor: '' };

/* Rubros enteros que no son de obra: son la pieza que el dueño de casa compra
   para cambiar una que se rompió. Misma regla que sacó las tapas de inodoro
   del catálogo de Ochoa. */
const FUERA_PLOMERIA = {
  'Repuestos de inodoro': 'repuesto de consumidor, no partida de obra',
  'Repuestos de griferia': 'repuesto de consumidor, no partida de obra',
  'Herramientas y limpieza': 'artículo de limpieza doméstica, no equipo de obra'
};

/* Accesorios de baño: entran los juegos completos y el botiquín; el toallero
   suelto y el organizador de ducha son decoración. */
const ACCESORIO_SUELTO =
  /^(toallero|portapapel|papelera|sujetajabon|jabonera|organizador|percha|gancho|repisa|cepillera|dispensador de vaso|porta)/;

/* ---------------------------------------------------------
   Medidas
   --------------------------------------------------------- */

/* Cómo se lee el nombre de una conexión —de qué pieza es, de qué material,
   de qué medida— vive en la tabla de especificación y no aquí: es una
   propiedad del accesorio, no de quién lo vende. Estas líneas existen para
   que el resto del archivo siga llamándolas por su nombre de siempre. */
const numerosDe = PLOM.numerosDe;
const medidaPulg = PLOM.medidaPulg;
const materialDe = PLOM.materialDe;
const tipoConexion = PLOM.tipoConexion;
const medidaConexion = PLOM.medidaConexion;

/* ---------------------------------------------------------
   La regla
   --------------------------------------------------------- */

function regla(a) {
  const spec = clasificar(a);
  if (spec && spec.clave && PLOM.YA_EXISTE[spec.clave]) return { existente: PLOM.YA_EXISTE[spec.clave] };
  return spec;
}

function clasificar(a) {
  MOTIVO.valor = '';
  const n = baja(a.nombre);
  const cat = a.cat3;

  if (FUERA_PLOMERIA[cat]) { MOTIVO.valor = FUERA_PLOMERIA[cat]; return null; }

  /* ---- Tubería ---- */
  if (cat === 'Tuberia') {
    /* «TUBO PVC SDR-41 4 x 19» y «TUBO PVC DRENAJE 4 X 19»: entre el material
       y la medida puede venir la norma o el uso, y los dos son parte de la
       especificación. La tubería de cobre se vende por rollo y su ficha no
       declara el largo, así que no entra. */
    const m = limpia(a.nombre).match(
      /^TUBO\s+(PVC|CPVC|PPR)\s*(SDR-?\d+|SCH-?\d+|DRENAJE|PRESION)?\s*([\d./ ]+?)\s*[xX]\s*(\d+)/i);
    if (!m) { MOTIVO.valor = 'la ficha no declara el diámetro o el largo del tubo'; return null; }
    const d = medidaPulg(m[3]);
    if (!d) { MOTIVO.valor = 'no se entiende el diámetro del tubo'; return null; }
    return PLOM.item('tubo', {
      material: m[1].toUpperCase(), norma: (m[2] || '').toUpperCase(),
      diametro: d, largo_pies: parseInt(m[4], 10)
    });
  }

  /* ---- Conexiones ---- */
  if (cat === 'Conexiones y accesorios') {
    /* Un perfil de canto de cerámica archivado en conexiones: el comercio lo
       puso donde no va, y su ítem vive en la tabla de baldosas. */
    if (/^perfiles? pvc p\s*\/\s*cera/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*[xX]\s*(\d+)/);
      if (!m) { MOTIVO.valor = 'la ficha no declara la medida del perfil'; return null; }
      return BALDOSAS_ESP.item('perfil-canto', { tipo: 'canto', material: 'PVC', medida_mm: parseInt(m[1], 10) });
    }
    const tipo = tipoConexion(n);
    if (!tipo) { MOTIVO.valor = 'no se reconoce qué pieza de conexión es'; return null; }
    const material = materialDe(n);
    if (!material) { MOTIVO.valor = 'la ficha no declara el material de la conexión'; return null; }
    const medida = medidaConexion(a, tipo);
    if (!medida) { MOTIVO.valor = 'la ficha no declara la medida de la conexión'; return null; }
    return PLOM.item('conexion', { tipo: tipo, material: material, medida: medida });
  }

  /* ---- Válvulas ---- */
  if (cat === 'Valvuleria y llaves de paso') {
    if (/^cheque/.test(n)) {
      const md = medidaPulg((numerosDe(a.nombre)[0] || ''));
      if (!md) { MOTIVO.valor = 'la ficha no declara la medida del cheque'; return null; }
      return PLOM.item('cheque', { medida: md });
    }
    if (/valvula cisterna|valvula de cisterna/.test(n)) {
      const md = medidaPulg((numerosDe(a.nombre)[0] || ''));
      if (!md) { MOTIVO.valor = 'la ficha no declara la medida de la válvula'; return null; }
      return PLOM.item('valvula-cisterna', { medida: md });
    }
    if (/^llave lavadero|^llave jardin|^llave manguera/.test(n)) return PLOM.item('llave-lavadero', {});
    if (/^llave tanque gas|^llave gas/.test(n)) {
      const md = medidaPulg((numerosDe(a.nombre)[0] || ''));
      if (!md) { MOTIVO.valor = 'la ficha no declara la medida de la llave de gas'; return null; }
      return PLOM.item('llave-tanque-gas', { medida: md });
    }
    /* La válvula de doble descarga es del tanque del inodoro: repuesto. */
    if (/^valvula (doble )?descarga|^valvula salida|^valvula entrada/.test(n)) {
      MOTIVO.valor = 'repuesto de consumidor, no partida de obra'; return null;
    }
    if (/^llave|^valvula/.test(n)) {
      const tipo = /bola/.test(n) ? 'de bola' : /angular/.test(n) ? 'angular'
                 : /compuerta|cu[nñ]a/.test(n) ? 'de compuerta' : /r\s*\/\s*m|rosca/.test(n) ? 'de rosca macho' : '';
      if (!tipo) { MOTIVO.valor = 'la ficha no declara el tipo de llave'; return null; }
      const material = materialDe(n) || 'metal';
      const md = medidaPulg((numerosDe(a.nombre)[0] || ''));
      if (!md) { MOTIVO.valor = 'la ficha no declara la medida de la llave'; return null; }
      return PLOM.item('llave-paso', { tipo: tipo, material: material, medida: md });
    }
    MOTIVO.valor = 'no se reconoce qué pieza de valvulería es';
    return null;
  }

  /* ---- Desagüe ---- */
  if (cat === 'Desagues, sifones y rejillas') {
    if (/^rejilla/.test(n)) {
      const nums = numerosDe(a.nombre);
      if (!nums.length) { MOTIVO.valor = 'la ficha no declara la medida de la rejilla'; return null; }
      const medida = nums.length >= 2 && /x/i.test(a.nombre)
        ? nums[0] + ' x ' + nums[1] + ' cm' : medidaPulg(nums[0]);
      if (!medida) { MOTIVO.valor = 'no se entiende la medida de la rejilla'; return null; }
      /* En la rejilla el material NO es identidad, al revés que en la
         conexión: la de aluminio de 4 pulgadas cuesta RD$ 401 y la de
         inoxidable RD$ 368, y la mitad de las fichas ni lo dice. Se registra
         como medida cuando lo declaran. «SUS304» es acero inoxidable. */
      const material = /inoxidable|inox|sus\s*304|ss\s*304/.test(n) ? 'acero inoxidable'
                     : /aluminio/.test(n) ? 'aluminio' : /bronce/.test(n) ? 'bronce'
                     : /pvc|plast/.test(n) ? 'PVC' : '';
      const med = { medida: medida };
      if (material) med.material = material;
      return PLOM.item('rejilla-piso', med);
    }
    if (/^sifon/.test(n)) {
      const uso = /fregadero/.test(n) ? 'fregadero' : /lavaman/.test(n) ? 'lavamanos'
                : /lavadero/.test(n) ? 'lavadero' : 'desagüe';
      const material = /cromad/.test(n) ? 'metal cromado' : /pvc/.test(n) ? 'PVC'
                     : /plast/.test(n) ? 'plástico' : '';
      const md = medidaPulg((numerosDe(a.nombre)[0] || ''));
      if (!material || !md) { MOTIVO.valor = 'la ficha no declara el material o la medida del sifón'; return null; }
      return PLOM.item('sifon', { uso: uso, material: material, medida: md });
    }
    if (/^boquilla|^cedazo|^desagua/.test(n)) {
      const uso = /fregadero/.test(n) ? 'fregadero' : /lavaman/.test(n) ? 'lavamanos'
                : /lavadero/.test(n) ? 'lavadero' : /banera|tina/.test(n) ? 'bañera' : '';
      const material = /metal|bronce|inox/.test(n) ? 'metal' : /pvc|plast/.test(n) ? 'plástico' : '';
      if (!uso || !material) { MOTIVO.valor = 'la ficha no declara para qué aparato es la boquilla'; return null; }
      return PLOM.item('boquilla-desague', { uso: uso, material: material });
    }
    MOTIVO.valor = 'pieza suelta de desagüe que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Mangueras ---- */
  if (cat === 'Mangueras') {
    /* La manguera de ducha teléfono ya tiene ítem en el catálogo, compartido
       con Ochoa: no se crea otro. */
    if (/ducha telefono|ducha tel\b/.test(n)) return BANOS.item('ducha-manguera', {});
    const uso = /jardin/.test(n) ? 'jardín' : /lavaman/.test(n) ? 'lavamanos'
              : /inodoro/.test(n) ? 'inodoro' : /mezc/.test(n) ? 'mezcladora'
              : /calentador/.test(n) ? 'calentador' : /bomba/.test(n) ? 'bomba'
              : /estufa|gas/.test(n) ? 'gas' : /lavadora/.test(n) ? 'lavadora'
              : /transparente/.test(n) ? 'uso general, transparente' : '';
    if (!uso) { MOTIVO.valor = 'la ficha no declara para qué es la manguera'; return null; }
    const nums = numerosDe(a.nombre);
    if (!nums.length) { MOTIVO.valor = 'la ficha no declara la medida de la manguera'; return null; }
    const medida = nums.length >= 2 && /x/i.test(a.nombre)
      ? medidaPulg(nums[0]) + ' x ' + nums[1] + (/jardin/.test(n) ? ' pies' : ' pulgadas')
      : medidaPulg(nums[0]) || nums[0];
    return PLOM.item('manguera', { uso: uso, medida: medida });
  }

  /* ---- Sellado ---- */
  if (cat === 'Sellado y pegamento') {
    if (/^teflon/.test(n)) {
      const md = medidaPulg((numerosDe(a.nombre)[0] || ''));
      if (!md) { MOTIVO.valor = 'la ficha no declara el ancho del teflón'; return null; }
      return PLOM.item('teflon', { medida: md });
    }
    if (/^cinta plomero/.test(n)) {
      const nums = numerosDe(a.nombre);
      if (nums.length < 2) { MOTIVO.valor = 'la ficha no declara el ancho y el largo de la cinta'; return null; }
      return PLOM.item('cinta-plomero', { medida: medidaPulg(nums[0]) + ' x ' + nums[1] + ' pies' });
    }
    if (/^cemento pvc|^cemento p\s*\/\s*pvc/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+(?:\.\d+)?)\s*(oz|gal|ml|l)\b/i);
      if (!m) { MOTIVO.valor = 'la ficha no declara la presentación del cemento PVC'; return null; }
      return PLOM.item('cemento-pvc', { presentacion: m[1] + ' ' + m[2].toLowerCase() });
    }
    MOTIVO.valor = 'sellador que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Gas ---- */
  if (cat === 'Gas') {
    if (/^pig/.test(n)) return PLOM.item('pigtail-gas', {});
    if (/^regulador/.test(n)) {
      const tipo = /doble tanque/.test(n) ? 'de doble tanque'
                 : /tuberia/.test(n) ? 'para tubería'
                 : /grande/.test(n) ? 'grande' : /pequen/.test(n) ? 'pequeño' : '';
      if (!tipo) { MOTIVO.valor = 'la ficha no declara el tipo de regulador'; return null; }
      return PLOM.item('regulador-gas', { tipo: tipo });
    }
    MOTIVO.valor = 'accesorio de gas que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Bombeo ---- */
  if (cat === 'Bombas y presurizacion') {
    if (/^bomba/.test(n)) {
      const tipo = /presurizadora|presur/.test(n) ? 'presurizadora' : /ladron|ladro\b/.test(n) ? 'ladrona'
                 : /centrifug/.test(n) ? 'centrífuga' : /sumergible/.test(n) ? 'sumergible'
                 : /cisterna/.test(n) ? 'de cisterna' : '';
      const m = limpia(a.nombre).match(/(\d+\s*\/\s*\d+|\d+(?:\.\d+)?)\s*HP/i);
      if (!tipo || !m) { MOTIVO.valor = 'la ficha no declara el tipo o la potencia de la bomba'; return null; }
      const hp = m[1].replace(/\s+/g, '');
      return PLOM.item('bomba-agua', { tipo: tipo, hp: hp });
    }
    if (/^tanque presurizado/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*L\b/i);
      if (!m) { MOTIVO.valor = 'la ficha no declara la capacidad del tanque'; return null; }
      return PLOM.item('tanque-presurizado', { litros: parseInt(m[1], 10) });
    }
    if (/^interruptor flota|^flotante/.test(n)) return PLOM.item('flotante-electrico', {});
    if (/^control automatico/.test(n)) {
      const md = medidaPulg((numerosDe(a.nombre)[0] || ''));
      if (!md) { MOTIVO.valor = 'la ficha no declara la medida del control automático'; return null; }
      return PLOM.item('control-bomba', { medida: md });
    }
    if (/^interruptor/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*-\s*(\d+)/);
      if (!m) { MOTIVO.valor = 'la ficha no declara el rango de presión del interruptor'; return null; }
      return PLOM.item('interruptor-bomba', { rango: m[1] + '–' + m[2] });
    }
    if (/^manometro/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*PSI/i);
      if (!m) { MOTIVO.valor = 'la ficha no declara la escala del manómetro'; return null; }
      return PLOM.item('manometro', { psi: parseInt(m[1], 10), tipo: /glicerina/.test(n) ? 'de glicerina' : 'seco' });
    }
    MOTIVO.valor = 'accesorio de bombeo que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Calentadores ---- */
  if (cat === 'Calentadores') {
    if (!/^calentador/.test(n)) { MOTIVO.valor = 'repuesto de calentador, no partida de obra'; return null; }
    const energia = /gas/.test(n) ? 'a gas' : /elec/.test(n) ? 'eléctrico' : '';
    let cap = '';
    let m = limpia(a.nombre).match(/(\d+)\s*GLS?\b/i);
    if (m) cap = m[1] + ' galones';
    if (!cap) { m = limpia(a.nombre).match(/(\d+)\s*LTS?\b/i); if (m) cap = m[1] + ' litros por minuto'; }
    if (!cap) { m = limpia(a.nombre).match(/(\d+(?:\.\d+)?)\s*KW\b/i); if (m) cap = m[1] + ' kW'; }
    if (!energia || !cap) { MOTIVO.valor = 'la ficha no declara la energía o la capacidad del calentador'; return null; }
    return PLOM.item('calentador', { energia: energia, capacidad: cap });
  }

  /* ---- Tanques ---- */
  if (cat === 'Tanques y cisternas') {
    if (/^tanque cisterna|^cisterna/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*gls?\b/i);
      if (!m) { MOTIVO.valor = 'la ficha no declara la capacidad de la cisterna'; return null; }
      /* «FV» es como el comercio abrevia fibra de vidrio. Y «VERDE» no
         es un color de adorno: es otra línea del mismo tanque y cuesta
         casi el doble. A igual capacidad, 42 gls RD$ 7.487 y RD$
         14.217; 60 gls RD$ 10.496 y RD$ 15.482. Juntarlas dejaba dos
         partidas con el doble de dispersión y ningún eje que lo
         explicara. */
      let material = /fibra|\bfv\b/.test(n) ? 'fibra de vidrio' : /polietil|plast/.test(n) ? 'polietileno' : '';
      if (!material) { MOTIVO.valor = 'la ficha no declara el material de la cisterna'; return null; }
      if (/\bverde\b/.test(n)) material += ' verde';
      return PLOM.item('cisterna', { material: material, capacidad_gal: parseInt(m[1], 10) });
    }
    if (/^tinaco/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*gls?\b/i);
      if (!m) { MOTIVO.valor = 'la ficha no declara la capacidad del tinaco'; return null; }
      return PLOM.item('tinaco', { capacidad_gal: parseInt(m[1], 10) });
    }
    if (/^tapa cisterna/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*[xX]\s*(\d+)/);
      if (!m) { MOTIVO.valor = 'la ficha no declara la medida de la tapa'; return null; }
      const material = /aluminio/.test(n) ? 'aluminio' : /hierro|acero/.test(n) ? 'acero' : 'aluminio';
      return PLOM.item('tapa-cisterna', { material: material, medida: m[1] + ' x ' + m[2] + ' pulgadas' });
    }
    if (/^boya/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*mm/i);
      if (!m) { MOTIVO.valor = 'la ficha no declara el diámetro de la boya'; return null; }
      return PLOM.item('boya-cisterna', { medida_mm: parseInt(m[1], 10) });
    }
    MOTIVO.valor = 'accesorio de tanque que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Fregaderos ---- */
  if (cat === 'Fregaderos') {
    const pozos = /doble/.test(n) ? 2 : /triple/.test(n) ? 3 : /sencillo|^fregadero bar/.test(n) ? 1 : 0;
    if (!pozos) { MOTIVO.valor = 'la ficha no declara cuántos pozos tiene el fregadero'; return null; }
    const m = limpia(a.nombre).match(/(\d+)\s*[xX]\s*(\d+)/);
    return PLOM.item('fregadero', {
      pozos: pozos, medida: m ? m[1] + ' x ' + m[2] + ' pulgadas' : 'medida estándar'
    });
  }

  /* ---- Grifería ---- */
  if (cat === 'Griferia y mezcladoras') {
    /* La grifería se separa por dos cosas: para qué aparato es y si tiene
       sensor. El número de manijas y el acabado son de la cotización. */
    if (/^llave bebedero/.test(n)) return PLOM.item('llave-bebedero', {});
    if (/^mezcladora ducha|^mezcladora de ducha|^llave bano empotrar|^llave empotrar/.test(n)) {
      return BANOS.item('ducha-mezcladora', {});
    }
    if (/^mezcladora|^llave|^grifo|^grifer/.test(n)) {
      const uso = /frega|lavadero|jardin|manguera|pared multiple|cocina/.test(n) ? 'fregadero' : 'bano';
      const act = BANOS.activacion(n);
      return BANOS.item('mezcladora', { uso: uso, activacion: act });
    }
    MOTIVO.valor = 'pieza de grifería que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Duchas ---- */
  if (cat === 'Duchas y banera') {
    if (/^ducha telefono|regadera.*telefono/.test(n)) return BANOS.item('ducha-telefono', {});
    if (/^sistema ducha|^columna/.test(n)) return (function () { const c = BANOS.juegoDeDucha(n); return BANOS.item(c.familia, c.medidas); })();
    if (/^soporte ducha/.test(n)) return BANOS.item('ducha-brazo', {});
    if (/^ducha|^regadera/.test(n)) {
      /* Qué cabezal es y de qué lo dice la tabla, que lo decide igual
         para los seis comercios. Las tres ramas que había aquí —con
         brazo, sin brazo y lo demás— devolvían las tres el mismo ítem. */
      const c = BANOS.cabezalDeDucha(n);
      return BANOS.item(c.familia, c.medidas);
    }
    MOTIVO.valor = 'accesorio de ducha que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Sanitarios ---- */
  if (cat === 'Sanitarios') {
    if (/^inodoro/.test(n)) {
      if (/1\s*pza|1\s*pieza|una pieza|monopieza/.test(n)) {
        return BANOS.item('inodoro-una-pieza', {});
      }
      if (/2\s*pieza|dos pieza/.test(n)) {
        return BANOS.item('inodoro-dos-piezas', {});
      }
      /* «INODORO BLANCO CON TAPA» sin más: el comercio no dice si es de una o
         de dos piezas, y son dos partidas con precios distintos. */
      MOTIVO.valor = 'la ficha no dice si el inodoro es de una o de dos piezas';
      return null;
    }
    if (/^lavamanos/.test(n)) {
      if (/c\s*\/\s*mueble|con mueble/.test(n)) return BANOS.item('mueble-bano', { montaje: 'piso' });
      const montaje = /pedestal/.test(n) ? 'pedestal' : /empotr/.test(n) ? 'empotrar'
                    : /pared|colgar/.test(n) ? 'pared' : 'sobreponer';
      return BANOS.item('lavamanos', { montaje: montaje });
    }
    if (/^palometa/.test(n)) return BANOS.item('palometa', {});
    if (/^bidet|^bide\b/.test(n)) return BANOS.item('bide', {});
    if (/^urinario/.test(n)) return BANOS.item('urinario', {});
    MOTIVO.valor = 'aparato sanitario que la ficha no describe lo bastante';
    return null;
  }

  /* ---- Accesorios de baño ---- */
  if (cat === 'Accesorios de bano') {
    if (/^botiquin/.test(n)) return BANOS.item('botiquin', { luz: /led|luz/.test(n) ? 'led' : '' });
    if (/^accesorio bano/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*\/\s*1/);
      if (!m) { MOTIVO.valor = 'la ficha no declara cuántas piezas trae el juego'; return null; }
      return BANOS.item('juego-accesorios',
        { ambito: BANOS.ambito(n), piezas: parseInt(m[1], 10) });
    }
    if (/^barra (de )?seguridad|^agarradera/.test(n)) {
      const m = limpia(a.nombre).match(/(\d+)\s*(?:cm|')/i);
      if (!m) { MOTIVO.valor = 'la ficha no declara el largo de la barra'; return null; }
      return BANOS.item('barra-seguridad', { forma: 'recta', largo_cm: BANOS.aCm(parseInt(m[1], 10), 'cm') });
    }
    if (ACCESORIO_SUELTO.test(n)) {
      MOTIVO.valor = 'pieza suelta de decoración: solo entran los juegos completos';
      return null;
    }
    MOTIVO.valor = 'accesorio de baño que la ficha no describe lo bastante';
    return null;
  }

  return undefined;                       // categoría sin regla, ni se cuenta
}

module.exports = { MAPEO, FUERA_MATERIALES, FUERA_PLOMERIA, MOTIVO, regla };
