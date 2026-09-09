'use strict';
/* =========================================================
   reglas-innovacentro.js — el segundo comercio

   Hasta aquí todo el catálogo venía de Ochoa, y con un solo
   precio por ítem el sitio muestra un número, no un mercado.
   InnovaCentro es el segundo, y por eso lo valioso de su
   catálogo no son los ítems nuevos: son los 40 y pico de
   artículos que caen sobre ítems que YA existen. Ahí es donde
   aparece el rango, la mediana deja de ser un dato suelto y el
   comprador ve con quién le conviene.

   Por eso este archivo es sobre todo un MAPEO declarado a mano,
   artículo por artículo. No hay emparejamiento automático por
   parecido de texto: ya lo probamos y casó «Funda De Arena 55
   Libras» con «Viaje de arena, 16 m³». Cada línea del mapeo se
   miró contra la ficha del ítem y lleva su justificación cuando
   la equivalencia no salta a la vista.

   Lo que no cae en un ítem existente pasa por REGLAS y sale
   como ítem nuevo, con la misma vara que el resto del catálogo:
   entra si la ficha declara la medida.
   ========================================================= */

const T = require('./texto-ochoa.js');

/* Abreviaturas y mayúsculas de este comercio: escribe TODO EN CAJA ALTA. */
const ABREV = [
  [/\bGL\b/g, 'galón'], [/\bOZ\b/g, 'oz'], [/\bLB\b/g, 'lb'], [/\bLBS\b/g, 'lb'],
  [/\bKG\b/g, 'kg'], [/\bMT\b/g, 'm'], [/\bMTS\b/g, 'm'], [/\bMM\b/g, 'mm'],
  [/\bCAL\b\.?/g, 'calibre'], [/\bCAL-/g, 'calibre '],
  [/\bBLCO\b/g, 'blanco'], [/\bPLATFON\b/gi, 'plafón'], [/\bPLAFOND\b/gi, 'plafón'],
  [/\bPUAS\b/g, 'púas'], [/\bEMPAÑETE\b/g, 'empañete'],
  [/\bTRASPARENTE\b/g, 'transparente'], [/\bHIRAULICO\b/gi, 'hidráulico']
];

/* Título legible: el nombre viene en caja alta y en Excel se lee fatal. */
function titulo(a) {
  let t = T.normaliza(a.nombre, ABREV);
  /* Caja alta a capitalización de frase, respetando las siglas y los códigos
     de producto, que sí van en mayúscula. */
  t = t.replace(/[A-ZÁÉÍÓÚÑ]{2,}/g, p => {
    if (/^(PVC|LFT|XS|CB|SM|WE|W|T|MT|OZ|LB|KG)$/.test(p)) return p;
    if (/\d/.test(p)) return p;                       // W-501, CS-605, WE0850105
    return p.charAt(0) + p.slice(1).toLowerCase();
  });
  return T.recorta(t.charAt(0).toUpperCase() + t.slice(1));
}

/* =========================================================
   MAPEO — artículo de InnovaCentro → ítem que ya existe
   ========================================================= */

/* Dos formas de apuntar a un ítem:

     'MAT-02-001'              un ítem escrito a mano en datos-catalogo.js,
                               cuyo código no se mueve nunca;
     '#MAT-22|malla-ciclonica-11-6'
                               un ítem que genera el propio importador, al que
                               hay que apuntar por su clave. Su código SÍ se
                               corre: basta con que entre otro ítem antes en la
                               misma categoría. Apuntarle por código manda las
                               cotizaciones al ítem equivocado sin dar ningún
                               error, y así fue como la malla ciclónica de 6
                               pies terminó cotizada al precio de un tubo.

   Para ver las claves: node herramientas/importar-catalogos.js --claves MAT-22 */

const MAPEO = {
  /* --- Cementos. La funda de 94 lb son 42.6 kg: es la misma que el
         mercado llama «de 42.5». --- */
  '023108': 'MAT-02-001',   // Cemento gris Titán 94 lb
  '015794': 'MAT-02-002',   // Cemento blanco 25 kg
  '057367': 'MAT-02-003',   // Cemento blanco 40 kg
  '057347': '#MAT-02|cemento-gris-10',    // Cemento gris 10 lb
  '009121': '#MAT-02|cemento-blanco-2',   // Cemento blanco 2 lb
  '009110': '#MAT-02|cemento-blanco-5',   // Cemento blanco 5 lb

  /* Cal hidratada de 44 lb = 19.96 kg, la misma funda de 20 kg. */
  '026053': 'MAT-02-004',

  /* Mortero de pañete. Dos fabricantes distintos —Titán en 42.5 kg y Forte
     en 94 lb, que son 42.6— despachan la misma funda, así que la ficha del
     ítem se corrigió: decía 40 kg, que era una estimación nuestra sin
     ninguna evidencia detrás. */
  '023111': 'MAT-02-009',   // Mortero pañete Titán 42.5 kg
  '065070': 'MAT-02-009',   // Mortero pañete Forte 94 lb

  /* Estuco de interiores en funda de 35 lb: el mismo que trae Ochoa. Va por
     clave y no por código porque ese ítem también lo genera el importador,
     y su número se corre solo si más adelante entra otro ítem antes. */
  '065073': '#MAT-12|estuco-35',

  /* Pegamento de cerámica blanco en funda de 50 lb = 22.7 kg. */
  '058654': 'MAT-02-007',

  /* --- Plywood. «Corriente» es la plancha de uso general, que el mercado
         despacha en pino o en okumé indistintamente; van al mismo ítem y el
         rango del ítem muestra la diferencia entre las dos maderas. --- */
  '004929': 'MAT-06-005',   // Pino 4x8x1/2
  '025844': 'MAT-06-005',   // Okumé 4x8x1/2
  '025685': 'MAT-06-006',   // Pino 4x8x3/4
  '025846': 'MAT-06-006',   // Okumé 4x8x3/4

  /* --- Techos. El zinc acanalado se nombra por su ancho nominal de 3 pies;
         InnovaCentro declara el ancho útil, 2.7. Es la misma plancha. --- */
  '029919': '#MAT-07|zinc-acanalado-29-3x6',   // Zinc acanalado 6' calibre 29
  '028393': '#MAT-07|zinc-acanalado-34-3x6',   // Zinc acanalado 6' calibre 34

  /* Translúcidas de 2.75 x 6 pies, que es la medida del ítem. El color no
     cambia el precio: las cuatro de Fibraforte están al mismo monto. */
  '033108': '#MAT-07|zinc-translucido-3x6',
  '017574': '#MAT-07|zinc-translucido-3x6',
  '046351': '#MAT-07|zinc-translucido-3x6',
  '046352': '#MAT-07|zinc-translucido-3x6',
  '017576': '#MAT-07|zinc-translucido-3x6',

  /* Plancha de yeso de 1/2" en 4 x 8 pies. */
  '004771': 'MAT-13-001',

  /* Plafón acústico de 2 x 2 pies. */
  '046360': 'MAT-13-006',

  /* --- Cerramiento. Aquí es donde más se compara con Ochoa. --- */
  '028879': '#MAT-22|malla-ciclonica-11-6',        // Malla ciclónica 6x50' calibre 11
  '055382': '#MAT-22|malla-ciclonica-9-6-pvc',     // Malla ciclónica 6x50' calibre 9 revestida
  '036418': '#MAT-22|tubo-malla-1.25-20',          // Tubo galvanizado 1-1/4 x 20'
  '054850': '#MAT-22|tubo-malla-1.5-15',           // Tubo galvanizado 1-1/2 x 15'
  '059298': '#MAT-22|alambre-puas-16-110',         // Alambre de púas calibre 16, rollo de 110 m
  '035335': '#MAT-22|alambre-puas-16-250',         // calibre 16, 250 m — Premium
  '059299': '#MAT-22|alambre-puas-16-250',         // calibre 16, 250 m — Jabalí
  '003852': '#MAT-22|alambre-puas-16-250',         // calibre 16, 250 m — Motto
  '032630': '#MAT-22|accesorio-abrazadera-1.5larga',  // Abrazadera larga 1-1/2"
  '032625': '#MAT-22|accesorio-copa-terminal-1.5',    // Copa terminal 1-1/2"

  /* La copa pasante lleva dos medidas y cada comercio las escribe en el
     orden que quiere: Ochoa «1 1/4 x 1 1/2», InnovaCentro «1-1/2 x 1-1/4».
     Es la misma pieza. */
  '032626': '#MAT-22|accesorio-copa-pasante-1.25x1.5',

  /* «Palometa» es como InnovaCentro llama al brazo del poste. */
  '032628': '#MAT-22|accesorio-brazo-1.5x1.25doble',      // Palometa doble 1-1/2 x 1-1/4
  '032629': '#MAT-22|accesorio-brazo-1.5x1.25sencillo',   // Palometa sencilla 1-1/2 x 1-1/4

  /* --- Aluminio. El tramo de extrusión es el mismo: uno lo escribe 19.20
         pies y el otro lo redondea a 19. --- */
  '032501': '#MAT-23|angulares-0.5x0.5',     // Angular 1/2 x 1/2
  '032502': '#MAT-23|angulares-0.75x0.75',   // Angular 3/4 x 3/4
  '046362': '#MAT-23|angulares-1x0.75',      // Angular 1 x 3/4
  '046363': '#MAT-23|angulares-1.25x1.25'    // Angular 1 1/4 x 1 1/4
};

/* Artículos que se dejan fuera a conciencia, con el motivo:

   Ninguno por ahora. Los 118 artículos del departamento son materiales de
   obra; no hay aquí la mezcla con artículos de consumo que sí tienen los
   catálogos de baños y de seguridad. */

/* =========================================================
   Ítems nuevos
   ========================================================= */

/* Los derretidos se agrupan a propósito. InnovaCentro tiene trece en funda
   de 10 libras que solo se diferencian por el color, y el color casi no
   mueve el precio. Un presupuesto dice «derretido, funda de 10 lb» y no
   «derretido Sierra Snow»: van todos al mismo ítem y el rango de la ficha
   enseña la diferencia entre marcas. */
const DERRETIDO = {
  cat: 'MAT-02',
  clave: 'derretido-ceramica-10lb',
  nombre: 'Derretido para cerámica, funda de 10 libras',
  unidad: 'funda',
  esp: 'Fragua en polvo para juntas de cerámica y porcelanato · funda de 10 libras',
  etapa: 'pisos',
  origen: 'importado',
  alias: 'derretido, grout, fragua',
  orden: 500
};

/* Igual con el pegamento gris de 50 libras, que es la presentación estándar
   del mercado y la que se presupuesta. */
const PEGA_GRIS = {
  cat: 'MAT-02',
  clave: 'pegamento-ceramica-gris-50lb',
  nombre: 'Pegamento de cerámica gris, funda 22.7 kg (50 lb)',
  unidad: 'funda',
  esp: 'Adhesivo cementicio gris para cerámica · funda de 50 libras',
  etapa: 'pisos',
  alias: 'pegamento de cerámica, mortero cola, pega',
  orden: 510
};

/* Dónde cae cada grupo del comercio y con qué etapa de obra. */
const GRUPOS = {
  'ADITIVOS PARA CONCRETOS':        ['MAT-02', 'estructura', 'aditivo para hormigón'],
  'CEMENTOS':                       ['MAT-02', 'estructura', 'cemento'],
  'MORTEROS':                       ['MAT-02', 'terminacion', 'mortero'],
  'YESO':                           ['MAT-02', 'terminacion', 'yeso en polvo'],
  'PEGAMENTOS PARA CERAMICA':       ['MAT-02', 'pisos', 'pegamento de cerámica'],
  'DERRETIDOS DE PISOS':            ['MAT-02', 'pisos', 'derretido, grout'],
  'PLANCHAS DE PLYWOOD':            ['MAT-06', 'estructura', 'plywood, plancha de madera'],
  'CARTON PIEDRA':                  ['MAT-13', 'terminacion', 'cartón piedra'],
  'PLANCHAS TIPO TEJAS':            ['MAT-07', 'techos', 'teja de fibra, plancha tipo teja'],
  'CABALLETES PARA TECHOS':         ['MAT-07', 'techos', 'caballete, cumbrera'],
  'PLANCHAS TRANSLUCIDAS':          ['MAT-07', 'techos', 'plancha translúcida'],
  'PLAFONES':                       ['MAT-13', 'terminacion', 'plafón'],
  'ANGULAR PARA PLATFON':           ['MAT-13', 'terminacion', 'perfilería de plafón, T-grid'],
  'CROSS TEE PLATFOND':             ['MAT-13', 'terminacion', 'perfilería de plafón, T-grid'],
  'MAIN TEE PLAFON':                ['MAT-13', 'terminacion', 'perfilería de plafón, T-grid'],
  'DURMIENTE PARA PLAFON':          ['MAT-13', 'terminacion', 'durmiente, perfilería de plafón'],
  'PARALES PARA PLAFON':            ['MAT-13', 'terminacion', 'paral, stud, perfilería'],
  'PANELES DE YESO Y ACCESORIOS':   ['MAT-13', 'terminacion', 'plancha de yeso, drywall'],
  'ANGULARES PERFORADOS':           ['MAT-20', 'estructura', 'angular perforado'],
  'PRODUCTOS DE ALUMINIO':          ['MAT-23', 'puertas-ventanas', 'angular de aluminio'],
  'MALLAS CICLONICAS Y ACCESORIOS': ['MAT-22', 'exteriores', 'malla ciclónica, verja'],
  'ALAMBRES DE PUAS':               ['MAT-22', 'exteriores', 'alambre de púas'],
  'ALAMBRES DE TRINCHERAS':         ['MAT-22', 'exteriores', 'alambre de trinchera'],
  'PROTECCION PARA VERJAS':         ['MAT-22', 'exteriores', 'protección de verja, puya'],
  'PLANCHAS DE ZINC ACANALADAS':    ['MAT-07', 'techos', 'plancha de zinc'],
  '':                               ['MAT-18', 'exteriores', 'asfalto en frío']
};

let orden = 0;

function regla(a) {
  if (MAPEO[a.codigo]) return { existente: MAPEO[a.codigo] };

  const n = T.limpia(a.nombre);

  /* Los dos agrupados, antes que la regla general. */
  if (/^DERRETIDO/i.test(n) && /10 ?LB/i.test(n)) return Object.assign({}, DERRETIDO);
  if (/^PEGAMENTO CERAMICA (PEGA ?TOD|PEGATOD|PEGA FORTE)/i.test(n)) return Object.assign({}, PEGA_GRIS);

  const g = GRUPOS[a.cat3];
  if (!g) return null;
  const [cat, etapa, alias] = g;

  /* La ficha tiene que decir de qué tamaño es. Sin eso no se presupuesta. */
  const medida = [a.capacidad, a.tamaño, a.calibre].filter(Boolean).join(' · ');
  if (!medida) return null;

  const detalle = [];
  if (a.marca) detalle.push('marca ' + a.marca);
  if (a.material) detalle.push(a.material.toLowerCase());
  if (medida) detalle.push(medida);
  if (a.acabado) detalle.push(a.acabado.toLowerCase());

  const UNIDADES = { UND: 'unidad', FDA: 'funda', ROLLOS: 'rollo' };

  orden += 1;
  return {
    cat: cat,
    clave: T.clave(a.cat3 + '-' + a.nombre),
    orden: orden,
    nombre: titulo(a),
    unidad: UNIDADES[a.unidad] || 'unidad',
    esp: detalle.join(' · '),
    etapa: etapa,
    origen: 'importado',
    alias: alias
  };
}

module.exports = { MAPEO, regla, titulo };
