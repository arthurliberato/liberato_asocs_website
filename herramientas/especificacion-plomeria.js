'use strict';
/* =========================================================
   especificacion-plomeria.js — el ítem es la especificación

   La plomería es la partida con más renglones y los más
   pequeños: un baño lleva un inodoro y sesenta conexiones. El
   catálogo de Ferretería Cima trae 862 artículos de plomería, y
   la mayoría son la misma pieza en otra medida: un codo de PVC
   presión de 1/2" y otro de 3/4" son dos partidas distintas, y
   dos codos de 1/2" de marcas distintas son la misma.

   QUÉ DEFINE UNA CONEXIÓN
   -----------------------
   Tres cosas: qué pieza es (codo, tee, niple, reducción…), de
   qué material (PVC presión, PVC drenaje, HG, bronce, cobre,
   CPVC, PPR) y de qué medida. Nada más. La marca y el código del
   fabricante van en la cotización.

   El material no es un detalle: un codo de 1/2" de PVC cuesta
   RD$ 15 y el mismo codo en bronce, RD$ 170. Meterlos en la
   misma fila haría un rango de 11 veces que no dice nada.
   ========================================================= */

/* La red —tubo, conexiones, llaves de paso, desagüe y sellado— vive en su
   propia categoría, MAT-32. Son 378 ítems: dejarlos junto a los inodoros y las
   bombas hacía una página donde el aparato que se busca queda enterrado bajo
   trescientos codos. Los aparatos, la grifería, el bombeo y el gas se quedan
   en MAT-09.

   El campo esp es lo que el nombre NO dice y el comprador necesita: material
   o clase que no está en el nombre, una advertencia de compra corta. Lo que
   solo parafrasea el nombre o explica cómo se armó el ítem no va en pantalla:
   esp queda en ''. */
const FAMILIAS = {
  /* ---- Tubería ---- */
  tubo: {
    cat: 'MAT-32', unidad: 'tubo', etapa: 'instalaciones', orden: 10,
    ejes: ['material', 'norma', 'diametro', 'largo_pies'],
    nombre: m => 'Tubo ' + m.material + (m.norma ? ' ' + m.norma : '') +
                 ' ' + m.diametro + ' x ' + m.largo_pies + ' pies',
    /* Material, norma, diámetro y largo ya van en el nombre. */
    esp: m => '',
    alias: 'tubo, tubería, PVC, CPVC, drenaje, presión'
  },
  'llave-tanque-gas': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 145,
    ejes: ['medida'],
    nombre: m => 'Llave para tanque de gas ' + m.medida,
    esp: '',
    alias: 'llave de tanque de gas, válvula de gas'
  },

  /* ---- Conexiones ---- */
  conexion: {
    cat: 'MAT-32', unidad: 'unidad', etapa: 'instalaciones', orden: 20,
    ejes: ['tipo', 'material', 'medida'],
    nombre: m => ETIQUETA_CONEXION[m.tipo] + ' de ' + m.material + ' ' + m.medida,
    esp: '',
    alias: 'conexión, accesorio, fitting, codo, tee, niple, reducción'
  },

  /* ---- Válvulas y llaves ---- */
  'llave-paso': {
    cat: 'MAT-32', unidad: 'unidad', etapa: 'instalaciones', orden: 30,
    ejes: ['tipo', 'material', 'medida'],
    nombre: m => 'Llave de paso ' + m.tipo + ' de ' + m.material + ' ' + m.medida,
    esp: '',
    alias: 'llave de paso, válvula, llave de bola, llave angular'
  },
  cheque: {
    cat: 'MAT-32', unidad: 'unidad', etapa: 'instalaciones', orden: 40,
    ejes: ['medida'],
    nombre: m => 'Válvula de retención (cheque) ' + m.medida,
    esp: '',
    alias: 'cheque, válvula de retención, check'
  },
  'valvula-cisterna': {
    cat: 'MAT-32', unidad: 'unidad', etapa: 'instalaciones', orden: 50,
    ejes: ['medida'],
    nombre: m => 'Válvula de cisterna con flotante ' + m.medida,
    esp: '',
    alias: 'válvula de cisterna, flotante, boya de cisterna'
  },

  /* ---- Desagüe ---- */
  'rejilla-piso': {
    cat: 'MAT-32', unidad: 'unidad', etapa: 'instalaciones', orden: 60,
    /* El material no entra en la clave: la mitad de las fichas no lo dice y
       entre aluminio e inoxidable el precio casi no se mueve. */
    ejes: ['medida'],
    nombre: m => 'Rejilla de piso ' + m.medida,
    esp: '',
    alias: 'rejilla, sumidero, coladera de piso'
  },
  sifon: {
    cat: 'MAT-32', unidad: 'unidad', etapa: 'instalaciones', orden: 70,
    ejes: ['uso', 'material', 'medida'],
    nombre: m => 'Sifón de ' + m.material + ' para ' + m.uso + ' ' + m.medida,
    esp: '',
    alias: 'sifón, trampa, P-trap'
  },
  'boquilla-desague': {
    cat: 'MAT-32', unidad: 'unidad', etapa: 'instalaciones', orden: 80,
    ejes: ['uso', 'material'],
    nombre: m => 'Boquilla de desagüe de ' + m.material + ' para ' + m.uso,
    esp: '',
    alias: 'boquilla, desagüe, cedazo'
  },

  /* ---- Mangueras ---- */
  manguera: {
    cat: 'MAT-32', unidad: 'unidad', etapa: 'instalaciones', orden: 90,
    ejes: ['uso', 'medida'],
    nombre: m => 'Manguera para ' + m.uso + ' ' + m.medida,
    esp: '',
    alias: 'manguera, flexible, acometida'
  },

  /* ---- Sellado ---- */
  teflon: {
    cat: 'MAT-32', unidad: 'rollo', etapa: 'instalaciones', orden: 100,
    ejes: ['medida'],
    nombre: m => 'Cinta de teflón ' + m.medida,
    esp: '',
    alias: 'teflón, cinta de rosca, PTFE'
  },
  'cinta-plomero': {
    cat: 'MAT-32', unidad: 'rollo', etapa: 'instalaciones', orden: 110,
    ejes: ['medida'],
    nombre: m => 'Cinta de plomero ' + m.medida,
    esp: '',
    alias: 'cinta de plomero, fleje, perforada'
  },
  'cemento-pvc': {
    cat: 'MAT-32', unidad: 'envase', etapa: 'instalaciones', orden: 120,
    ejes: ['presentacion'],
    nombre: m => 'Cemento solvente para PVC, ' + m.presentacion,
    esp: '',
    alias: 'cemento PVC, pega de tubo, solvente'
  },

  /* ---- Gas ---- */
  'regulador-gas': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 130,
    ejes: ['tipo'],
    nombre: m => 'Regulador de gas ' + m.tipo,
    esp: '',
    alias: 'regulador de gas, GLP'
  },
  'pigtail-gas': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 140,
    ejes: [],
    nombre: 'Pig tail para conexión de gas',
    /* La manguera para gas va del regulador a la estufa; esta, del tanque al regulador. */
    esp: 'Del tanque al regulador',
    alias: 'pig tail, conexión de gas'
  },

  /* ---- Bombeo y almacenamiento ---- */
  'bomba-agua': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 150,
    ejes: ['tipo', 'hp'],
    nombre: m => 'Bomba ' + m.tipo + ' de ' + m.hp + ' HP',
    esp: '',
    alias: 'bomba, presurizadora, ladrona, centrífuga'
  },
  'tanque-presurizado': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 160,
    ejes: ['litros'],
    nombre: m => 'Tanque presurizado de ' + m.litros + ' litros',
    esp: '',
    alias: 'tanque presurizado, hidroneumático'
  },
  'interruptor-bomba': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 170,
    ejes: ['rango'],
    nombre: m => 'Interruptor automático de presión ' + m.rango + ' PSI',
    esp: '',
    alias: 'interruptor de presión, presostato, automático de bomba'
  },
  'flotante-electrico': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 175,
    ejes: [],
    nombre: 'Interruptor de flotante eléctrico',
    esp: '',
    alias: 'flotante eléctrico, interruptor de nivel, boya eléctrica'
  },
  'control-bomba': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 176,
    ejes: ['medida'],
    nombre: m => 'Control automático de bomba ' + m.medida,
    esp: '',
    alias: 'control automático, press control'
  },
  'llave-empotrar': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 275,
    ejes: ['medida'],
    nombre: m => 'Llave de empotrar para baño ' + m.medida,
    esp: '',
    alias: 'llave de empotrar, llave de pared, llave de ducha'
  },
  'llave-bebedero': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 276,
    ejes: [],
    nombre: 'Llave de bebedero',
    esp: 'Plástico',
    alias: 'llave de bebedero, llave plástica'
  },
  manometro: {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 180,
    ejes: ['psi', 'tipo'],
    nombre: m => 'Manómetro ' + m.tipo + ' de ' + m.psi + ' PSI',
    esp: 'El de glicerina aguanta la vibración de la bomba',
    alias: 'manómetro, medidor de presión'
  },
  calentador: {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 190,
    ejes: ['energia', 'capacidad'],
    nombre: m => 'Calentador de agua ' + m.energia + ' de ' + m.capacidad,
    /* Galones = tanque de acumulación; litros por minuto = de paso. En kW no se sabe. */
    esp: m => /galon/.test(m.capacidad) ? 'De acumulación'
            : /minuto/.test(m.capacidad) ? 'De paso' : '',
    alias: 'calentador, calentón, boiler, termo'
  },
  cisterna: {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 200,
    ejes: ['material', 'capacidad_gal'],
    nombre: m => 'Cisterna de ' + m.material + ' de ' + m.capacidad_gal + ' galones',
    esp: '',
    alias: 'cisterna, tanque de agua, reserva'
  },
  tinaco: {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 210,
    ejes: ['capacidad_gal'],
    nombre: m => 'Tinaco de ' + m.capacidad_gal + ' galones',
    /* La ficha no declara el material: no se afirma. */
    esp: '',
    alias: 'tinaco, tanque elevado, tanque de techo'
  },
  'tapa-cisterna': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 220,
    ejes: ['material', 'medida'],
    nombre: m => 'Tapa de cisterna de ' + m.material + ' ' + m.medida,
    /* La ficha no dice si trae marco: no se afirma. */
    esp: '',
    alias: 'tapa de cisterna, registro'
  },
  'boya-cisterna': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 230,
    ejes: ['medida_mm'],
    nombre: m => 'Boya para válvula de cisterna, ' + m.medida_mm + ' mm',
    esp: '',
    alias: 'boya, flotador'
  },

  /* ---- Cocina ---- */
  fregadero: {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 240,
    ejes: ['pozos', 'medida'],
    nombre: m => 'Fregadero de ' + (m.pozos === 1 ? 'un pozo' : m.pozos + ' pozos') +
                 (m.medida ? ', ' + m.medida : ''),
    /* La ficha no declara el material: no se afirma. */
    esp: '',
    alias: 'fregadero, lavaplatos, pantry'
  },

  /* ---- Grifería ---- */
  'mezcladora-lavamanos': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 250,
    ejes: ['tipo'],
    nombre: m => 'Mezcladora de lavamanos ' + m.tipo,
    esp: '',
    alias: 'mezcladora de lavamanos, grifo, llave de lavamanos'
  },
  'mezcladora-fregadero': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 260,
    ejes: ['tipo'],
    nombre: m => 'Mezcladora de fregadero ' + m.tipo,
    esp: '',
    alias: 'mezcladora de fregadero, grifo de cocina'
  },
  'llave-lavamanos': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 270,
    ejes: [],
    nombre: 'Llave sencilla de lavamanos',
    esp: '',
    alias: 'llave de lavamanos, grifo sencillo'
  },
  'llave-lavadero': {
    cat: 'MAT-09', unidad: 'unidad', etapa: 'instalaciones', orden: 280,
    ejes: [],
    nombre: 'Llave de lavadero o jardín',
    esp: '',
    alias: 'llave de jardín, llave de manguera, lavadero'
  }
};

const ETIQUETA_CONEXION = {
  codo: 'Codo',
  'codo-45': 'Codo de 45°',
  'codo-90': 'Codo de 90°',
  codoniple: 'Codo niple',
  tee: 'Tee',
  'tee-reducida': 'Tee reducida',
  cruz: 'Cruz',
  yee: 'Yee',
  niple: 'Niple',
  'niple-reductor': 'Niple reductor',
  reduccion: 'Reducción',
  'reduccion-bushing': 'Reducción bushing',
  tapon: 'Tapón',
  'tapon-macho': 'Tapón macho',
  'tapon-hembra': 'Tapón hembra',
  adaptador: 'Adaptador',
  'adaptador-macho': 'Adaptador macho',
  'adaptador-hembra': 'Adaptador hembra',
  union: 'Unión',
  'union-universal': 'Unión universal',
  coupling: 'Coupling',
  terminal: 'Terminal',
  abrazadera: 'Abrazadera',
  anilla: 'Anilla',
  fitting: 'Fitting',
  tuerca: 'Tuerca',
  junta: 'Junta'
};

const limpia = s => (s === 0 ? '0' : String(s === undefined || s === null ? '' : s).trim());

function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia de plomería desconocida: ' + familia);
  medidas = medidas || {};

  const claves = [familia];
  for (let i = 0; i < f.ejes.length; i++) {
    const v = limpia(medidas[f.ejes[i]]);
    /* Sin el eje no hay ítem: un codo sin medida no se puede presupuestar. */
    if (!v) return null;
    claves.push(f.ejes[i] + '-' + v);
  }

  return {
    cat: f.cat,
    familia: familia,
    clave: claves.join('-').toLowerCase()
             .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
             .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
             .replace(/"/g, 'pulg').replace(/°/g, 'gr')
             .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    orden: f.orden,
    nombre: typeof f.nombre === 'function' ? f.nombre(medidas) : f.nombre,
    unidad: f.unidad,
    esp: typeof f.esp === 'function' ? f.esp(medidas) : (f.esp || ''),
    etapa: f.etapa,
    origen: 'importado',
    alias: f.alias,
    medidas: medidas
  };
}

/* ---------------------------------------------------------
   Medidas de plomería

   El oficio escribe las pulgadas como fracción y las pega sin
   espacios: «1/2», «11/2» (que es una y media, no once medios),
   «1.5», «25mm». Se normalizan a una sola forma para que el codo de
   «1.5» y el de «1 1/2» sean el mismo ítem, que es lo que son.
   --------------------------------------------------------- */

const FRACCION = { 0.125: '1/8', 0.25: '1/4', 0.375: '3/8', 0.5: '1/2', 0.625: '5/8',
                   0.75: '3/4', 0.875: '7/8' };

/* Ninguna pieza de este catálogo mide más de diez pies. Por encima de ahí
   lo que se leyó no es una medida sino el SKU interno del comercio, que
   viene pegado al nombre y sin nada que lo distinga de un número: «SIFON PVC
   SENCILLO 1.1/2 35376», «TEFLON CTF-1/2 ROLLO 12520», «Adaptador Plástico
   Llave Hembra/Macho Orbit 67750». Los tres publicaron un sifón de 35,376
   pulgadas al lado de la medida buena que el nombre sí traía.

   El tope va aquí, en el módulo, y no en las reglas de cada comercio: es el
   mismo error en tres tiendas distintas y va a volver en la cuarta. */
const TOPE_PULGADAS = 120;

function comoPulgada(v) {
  if (!(v > 0) || v > TOPE_PULGADAS) return '';
  const entero = Math.floor(v + 1e-9);
  const resto = Math.round((v - entero) * 1000) / 1000;
  const fr = FRACCION[resto];
  if (resto && !fr) return (Math.round(v * 100) / 100) + '"';
  if (entero && fr) return entero + ' ' + fr + '"';
  if (fr) return fr + '"';
  return entero + '"';
}

/* Lee una medida suelta y devuelve pulgadas como número. Devuelve null si el
   texto no es una medida. */
function pulgadas(t) {
  const s = String(t || '').trim();
  let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);      // «1 1/2»
  if (m) return parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
  m = s.match(/^(\d+)\s*\/\s*(\d+)$/);                  // «1/2» o «11/2»
  if (m) {
    const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
    if (!b) return null;
    /* «11/2» es una pulgada y media: si la fracción sale mayor que 1 es un
       número mixto, porque en este oficio nadie escribe fracciones impropias.
       La misma regla que ya usaban los angulares de Ochoa. */
    if (a / b > 1 && m[1].length > 1) {
      const ent = parseInt(m[1].slice(0, m[1].length - 1), 10);
      const num = parseInt(m[1].slice(-1), 10);
      if (num / b < 1) return ent + num / b;
    }
    return a / b;
  }
  m = s.match(/^(\d+(?:\.\d+)?)$/);
  if (m) return parseFloat(m[1]);
  return null;
}

/* Especificaciones que el catálogo ya tenía escritas a mano. Vive aquí y no en
   las reglas de un comercio porque es una propiedad del catálogo: cualquier
   comercio que declare esta misma especificación tiene que caer en ese ítem, no
   crear uno nuevo al lado. */
const YA_EXISTE = {
  'tubo-material-pvc-norma-sdr-41-diametro-4pulg-largo-pies-19': 'MAT-32-001',
  'tubo-material-pvc-norma-sdr-41-diametro-2pulg-largo-pies-19': 'MAT-32-002',
  'tubo-material-pvc-norma-sdr-41-diametro-6pulg-largo-pies-19': 'MAT-32-003',
  'tubo-material-pvc-norma-sch-40-diametro-1-2pulg-largo-pies-19': 'MAT-32-004',
  'conexion-tipo-codo-90-material-pvc-drenaje-medida-4pulg': 'MAT-32-006'
};

/* =========================================================
   CÓMO SE LEE EL NOMBRE DE UNA CONEXIÓN

   De qué pieza es —codo, tee, niple, reducción—, de qué material y de qué
   medida. Estaba escrito dentro de las reglas de Cima, que fue el primer
   comercio de plomería que entró; pero un codo de PVC de 3/4 se llama
   igual lo venda quien lo venda, así que vive aquí, al lado de la familia
   que construye. Ochoa trae 551 tuberías y accesorios de PVC y los lee con
   esto mismo, sin copiar una línea.

   El texto llega ya en minúsculas y sin tildes: cada comercio lo normaliza
   a su manera antes de llamar.
   ========================================================= */

const limpiaN = s => String(s || '').replace(/\s+/g, ' ').trim();

const bajaN = s => limpiaN(s).toLowerCase()
  .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i')
  .replace(/[óò]/g, 'o').replace(/[úù]/g, 'u').replace(/ñ/g, 'n');

/* Saca las medidas sueltas de un nombre: «CODO PVC PRESION 3/4 x 90» da
   ['3/4', '90']. Se ignoran los códigos de fabricante, que vienen pegados a
   letras o guiones. */
function numerosDe(nombre) {
  const t = limpiaN(nombre).replace(/,/g, ' ');
  const salida = [];
  const re = /(?:^|[\s(])(\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+(?:\.\d+)?)(?=$|[\s)xX×'"\u201d]|mm|MM)/g;
  let m;
  while ((m = re.exec(t)) !== null) salida.push(m[1].trim());
  return salida;
}

function medidaPulg(txt) {
  const v = pulgadas(txt);
  return v === null ? '' : comoPulgada(v);
}

/* ---------------------------------------------------------
   Conexiones
   --------------------------------------------------------- */

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
  [/mangue/, 'manguera'],
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
  if (/^terminal/.test(n)) return 'terminal';
  if (/^abrazadera/.test(n)) return 'abrazadera';
  if (/^anilla/.test(n)) return 'anilla';
  if (/^fitting/.test(n)) return 'fitting';
  if (/^tuerca/.test(n)) return 'tuerca';
  if (/^junta/.test(n)) return 'junta';
  return '';
}

/* La medida de una conexión: una sola («1/2») o dos, cuando reduce
   («4 x 2»). El ángulo del codo NO va en la medida: ya está en el tipo. */
function medidaConexion(a, tipo) {
  const nums = numerosDe(a.nombre).filter(v => {
    if (/^codo/.test(bajaN(a.nombre)) && (v === '90' || v === '45')) return false;
    return true;
  });
  if (/mm/i.test(a.nombre)) {
    const mm = limpiaN(a.nombre).match(/(\d+)\s*mm/gi);
    if (mm) return mm.map(x => x.replace(/\s*mm/i, '') + ' mm').join(' x ');
  }
  const pulg = nums.map(medidaPulg).filter(Boolean);
  if (!pulg.length) return '';
  /* Los niples llevan diámetro por largo («1/2 x 2») y los dos importan. En
     las reducciones son los dos diámetros. En todo lo demás basta el primero. */
  if (pulg.length >= 2 && /reduc|niple|yee|tee-reducida|fitting|adaptador/.test(tipo + ' ' + bajaN(a.nombre))) {
    return pulg[0] + ' x ' + pulg[1];
  }
  return pulg[0];
}


module.exports = { FAMILIAS, item, comoPulgada, pulgadas, YA_EXISTE, ETIQUETA_CONEXION, TOPE_PULGADAS,
                   numerosDe, medidaPulg, materialDe, tipoConexion, medidaConexion };
