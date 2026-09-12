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
  '046363': '#MAT-23|angulares-1.25x1.25',   // Angular 1 1/4 x 1 1/4
  /* Faltaba, y se notaba: el mismo angular de 1 x 1 salía en dos partidas
     —RD$ 750 aquí y RD$ 633 en Ochoa— sin compararse con nada, y el
     nombre delataba el fallo porque llevaba la medida en crudo,
     «Angular de aluminio, 1X1"X19'», en vez de escrita. */
  '032503': '#MAT-23|angulares-1x1'          // Angular 1 x 1
};

/* Artículos que se dejan fuera a conciencia, con el motivo:

   Ninguno por ahora. Los 118 artículos del departamento son materiales de
   obra; no hay aquí la mezcla con artículos de consumo que sí tienen los
   catálogos de baños y de seguridad. */

/* =========================================================
   Ítems nuevos
   ========================================================= */

/* Los grupos donde el artículo se identifica por su uso y su presentación,
   no por su marca. «Aditivo impermeabilizante de 1 galón» es un solo ítem
   aunque lo vendan Cano, Lanco y Weco: la marca va en la cotización y el
   rango de la ficha enseña cuánto se mueve el precio según cuál se elija. */
const USOS = [
  [/IMPERMEABILIZANTE|SILBOND|CB-606|CB-610|CB-1052/i, 'impermeabilizante'],
  [/TEXTURIZADO/i,                                     'texturizado'],
  [/FIBRA|MACROFIBRA/i,                                'fibra de refuerzo'],
  [/PRIMER|EPOXICO/i,                                  'primer epóxico'],
  [/ANCLAJE|GROUT/i,                                   'de anclaje'],
  [/AUTONIVELANTE/i,                                   'autonivelante'],
  [/HIRAULICO|HIDRAULICO/i,                            'hidráulico'],
  [/PAÑETE|EMPAÑETE/i,                                 'de pañete'],
  [/CERAMICA|PORCELANATO/i,                            'para cerámica'],
  [/BLANCO/i,                                          'blanco'],
  [/GRIS/i,                                            'gris']
];

/* La presentación: lo que de verdad distingue dos filas de la misma cosa. */
function presentacion(a) {
  const t = T.limpia((a.capacidad || '') + ' ' + (a['tamaño'] || '') + ' ' + a.nombre);
  let m = t.match(/(\d+(?:[.,]\d+)?)\s*\/?\s*(\d)?\s*(GL|GAL[OÓ]N)/i);
  if (m) return { texto: (m[2] ? m[1] + '/' + m[2] : m[1]) + ' galón', capacidad_gal: m[2] ? +m[1] / +m[2] : +m[1] };
  m = t.match(/(\d+(?:[.,]\d+)?)\s*OZ/i);
  if (m) return { texto: m[1] + ' oz', capacidad_oz: +m[1] };
  m = t.match(/(\d+(?:[.,]\d+)?)\s*KG/i);
  if (m) return { texto: m[1] + ' kg', peso_kg: parseFloat(m[1].replace(',', '.')) };
  m = t.match(/(\d+(?:[.,]\d+)?)\s*LBS?\b/i);
  if (m) return { texto: m[1] + ' lb', peso_lb: parseFloat(m[1].replace(',', '.')) };
  return null;
}

const uso = n => (USOS.filter(u => u[0].test(n))[0] || [null, ''])[1];

/* Grupo del comercio → cómo se llama el ítem y dónde va. */
const GRUPOS = {
  'ADITIVOS PARA CONCRETOS':        ['MAT-02', 'estructura',  'Aditivo para hormigón',        'aditivo, impermeabilizante de mezcla'],
  'CEMENTOS':                       ['MAT-02', 'estructura',  'Cemento',                      'cemento'],
  'MORTEROS':                       ['MAT-02', 'terminacion', 'Mortero',                      'mortero, mezcla'],
  'YESO':                           ['MAT-02', 'terminacion', 'Yeso en polvo',                'yeso'],
  'PEGAMENTOS PARA CERAMICA':       ['MAT-02', 'pisos',       'Pegamento de cerámica',        'pegamento de cerámica, mortero cola'],
  'DERRETIDOS DE PISOS':            ['MAT-02', 'pisos',       'Derretido para cerámica',      'derretido, grout, fragua'],
  'PLANCHAS DE PLYWOOD':            ['MAT-06', 'estructura',  'Plywood',                      'plywood, plancha de madera'],
  'CARTON PIEDRA':                  ['MAT-13', 'terminacion', 'Cartón piedra',                'cartón piedra'],
  'PLANCHAS TIPO TEJAS':            ['MAT-07', 'techos',      'Plancha tipo teja de fibra',   'teja de fibra'],
  'CABALLETES PARA TECHOS':         ['MAT-07', 'techos',      'Caballete de fibra para techo','caballete, cumbrera'],
  'PLANCHAS TRANSLUCIDAS':          ['MAT-07', 'techos',      'Plancha translúcida',          'plancha translúcida'],
  'PLAFONES':                       ['MAT-13', 'terminacion', 'Plafón',                       'plafón'],
  'ANGULAR PARA PLATFON':           ['MAT-13', 'terminacion', 'Angular para plafón',          'perfilería de plafón, T-grid'],
  'CROSS TEE PLATFOND':             ['MAT-13', 'terminacion', 'Cross tee para plafón',        'perfilería de plafón, T-grid'],
  'MAIN TEE PLAFON':                ['MAT-13', 'terminacion', 'Main tee para plafón',         'perfilería de plafón, T-grid'],
  'DURMIENTE PARA PLAFON':          ['MAT-13', 'terminacion', 'Durmiente para plafón',        'durmiente, perfilería'],
  'PARALES PARA PLAFON':            ['MAT-13', 'terminacion', 'Paral para plafón',            'paral, stud, perfilería'],
  'PANELES DE YESO Y ACCESORIOS':   ['MAT-13', 'terminacion', 'Plancha de yeso',              'plancha de yeso, drywall'],
  'ANGULARES PERFORADOS':           ['MAT-20', 'estructura',  'Angular perforado',            'angular perforado'],
  'PRODUCTOS DE ALUMINIO':          ['MAT-23', 'puertas-ventanas', 'Angular de aluminio',     'angular de aluminio'],
  'MALLAS CICLONICAS Y ACCESORIOS': ['MAT-22', 'exteriores',  'Accesorio de malla ciclónica', 'accesorio de verja'],
  'ALAMBRES DE PUAS':               ['MAT-22', 'exteriores',  'Alambre de púas',              'alambre de púas'],
  'ALAMBRES DE TRINCHERAS':         ['MAT-22', 'exteriores',  'Alambre de trinchera',         'alambre de trinchera'],
  'PROTECCION PARA VERJAS':         ['MAT-22', 'exteriores',  'Protección de verja',          'puya, protección de verja'],
  'PLANCHAS DE ZINC ACANALADAS':    ['MAT-07', 'techos',      'Zinc acanalado',               'plancha de zinc'],
  '':                               ['MAT-18', 'exteriores',  'Asfalto en frío',              'asfalto en frío, bacheo']
};

const UNIDADES = { UND: 'unidad', FDA: 'funda', ROLLOS: 'rollo' };

function regla(a) {
  if (MAPEO[a.codigo]) return { existente: MAPEO[a.codigo] };

  const g = GRUPOS[a.cat3];
  if (!g) return null;
  const [cat, etapa, base, alias] = g;

  const n = T.limpia(a.nombre);
  const u = uso(n);
  const p = presentacion(a);

  /* Sin presentación no hay ítem: «pegamento de cerámica» a secas no se
     puede presupuestar ni comparar con nada. */
  const tam = T.limpia(a['tamaño'] || '');
  const cal = T.limpia(a.calibre || '').replace(/^Calibre\s*/i, '');
  const medida = tam + (cal && tam.toLowerCase().indexOf(cal.toLowerCase()) < 0 ? ' calibre ' + cal : '');
  if (!p && !medida) return null;

  /* El uso solo se agrega si no está ya dicho en el nombre base: si no,
     salen cosas como «Derretido para cerámica para cerámica». */
  const partes = [base];
  if (u && base.toLowerCase().indexOf(u.toLowerCase()) < 0) partes.push(u);
  /* Y la medida suelta tampoco se repite si ya viene dentro del tamaño. */
  const cola = p ? p.texto
    : (medida.replace(/\s+/g, ' ').split(' ').filter((x, i, arr) => arr.indexOf(x) === i).join(' '));

  const medidas = {};
  if (p) Object.keys(p).forEach(k => { if (k !== 'texto') medidas[k] = p[k]; });
  if (a.calibre) medidas.calibre = T.limpia(a.calibre).replace(/^Calibre\s*/i, '');
  if (a['tamaño']) medidas.tamano = T.limpia(a['tamaño']);
  if (u) medidas.uso = u;

  const nombre = partes.join(' ') + (cola ? ', ' + cola : '');

  return {
    cat: cat,
    /* La clave tiene que salir de LO MISMO que el nombre. Salía de
       `base + u`, y el nombre omite el uso cuando la base ya lo dice, así
       que «Derretido para cerámica» con uso declarado y sin declarar daban
       el mismo nombre y dos claves: dos partidas llamadas igual. */
    clave: T.clave(partes.join(' ') + '-' + cola + '-' + (medidas.calibre || '')),
    orden: 500,
    nombre: T.recorta(nombre),
    unidad: UNIDADES[a.unidad] || 'unidad',
    esp: '',
    etapa: etapa,
    origen: 'importado',
    alias: alias,
    medidas: medidas
  };
}

module.exports = { MAPEO, regla, titulo };

/* =========================================================
   BAÑOS

   Aquí no hay casi nada que mapear a mano, y es a propósito. El
   ítem es la especificación, así que basta con que este comercio
   diga qué especificación tiene delante y la tabla compartida
   —especificacion-banos.js— decide en qué fila cae, junto a la
   de Ochoa. Los nombres de producto no se comparan nunca.

   Este comercio lo pone fácil: publica columnas estructuradas.
   «Tipo» trae Elongada o Redonda en los inodoros y Tope,
   Pedestal, Pared o Empotrar en los lavamanos, que es justo el
   eje que define el ítem. Ochoa eso hay que sacárselo del nombre.

   El criterio de entrada es el mismo de siempre: equipamiento de
   obra sí, repuesto de consumidor y menaje no, y los accesorios
   solo como juego.
   ========================================================= */

const EB = require('./especificacion-banos.js');

/* Grupo del comercio → familia de la tabla. Los inodoros se resuelven por
   el nombre, porque el grupo INODOROS mezcla el aparato completo con el
   tanque y la taza sueltos. */
const FAMILIA_BANOS = {
  'INODOROS FLUXOMETRO':       'inodoro-fluxometro',
  'ORINALES':                  'urinario',
  'BIDETS':                    'bide',
  'LAVAMANOS':                 'lavamanos',
  'MUEBLES PARA EL BAÑO':      'mueble-bano',
  'BOTIQUINES':                'botiquin',
  'ESPEJOS DE BANO':           'espejo',
  'PANELES PARA DUCHA':        'cabina-ducha',
  'BARRAS DE SEGURIDAD BANERA Y DUCHA': 'barra-seguridad',
  'SECADORES DE MANO':         'secador-manos',
  'DISPENSADORES DE JABON':    'dispensador-jabon',
  'DISPENSADORES DE PAPEL':    'dispensador-papel',
  'JUEGO DE ACCESORIOS PARA BANO': 'juego-accesorios'
};

/* Lo que se queda fuera, y por qué. Escrito grupo por grupo en vez de con
   un descarte silencioso, para que se pueda discutir. */
const FUERA_BANOS = {
  'TAPAS PARA INODOROS':        'repuesto de consumidor',
  'ALFOMBRAS PARA LA BANERA':   'textil, no obra',
  'CORTINAS DE BANO':           'textil, no obra',
  'BARRAS DE CORTINA DE BANO':  'menaje',
  'JUEGO DE ARGOLLAS PARA CORTINAS': 'menaje',
  'BALANZAS DE BANO':           'menaje',
  'CEPILLOS DE BANO':           'menaje',
  'DESTUPIDORES':               'menaje',
  'ORGANIZADORES':              'menaje',
  'VASOS PARA CEPILLOS':        'menaje',
  'PORTA VASOS DE BANO':        'menaje',
  'PLATO DE VIDRIO PARA JABONERA': 'menaje',
  'TABURETES DE BAÑO':          'menaje',
  'ESQUINEROS PARA BANO':       'menaje',
  /* Estos cinco son piezas sueltas: por la regla de los accesorios solo
     entra el juego completo. */
  'JABONERAS':                  'pieza suelta de decoración',
  'PORTA PAPELES DE BANO':      'pieza suelta de decoración',
  'TOALLEROS PARA BANO':        'pieza suelta de decoración',
  'GANCHOS PARA ROPA Y TOALLA': 'pieza suelta de decoración',
  'REPISAS DE CRISTAL':         'pieza suelta de decoración'
};

const numero = s => { const v = parseFloat(String(s).replace(',', '.')); return isFinite(v) ? v : null; };

function medidasBano(a, familia) {
  const n = T.limpia(a.nombre);
  const tipo = T.limpia(a.tipo || '').toLowerCase();
  const m = {};

  if (/^inodoro/.test(familia)) {
    if (/elong|alarg/.test(tipo) || /elong|alarg/i.test(n)) m.forma = 'elongado';
    else if (/redond/.test(tipo) || /redond/i.test(n)) m.forma = 'redondo';
    const l = n.match(/(\d[.,]?\d?)\s*(?:LPD|LTS?|L)\b/i);
    if (l) { const v = numero(l[1]); if (v && v >= 3 && v <= 12) m.descarga_l = v; }
    const act = T.limpia(a.activador_descarga || '').toLowerCase();
    if (/boton|bot[oó]n|push/.test(act)) m.descarga = 'push button';
    else if (/palanca|balancin/.test(act)) m.descarga = 'palanca';
  }

  if (familia === 'lavamanos') {
    if (/tope|sobrepon/.test(tipo)) m.montaje = 'sobreponer';
    else if (/pedestal/.test(tipo)) m.montaje = 'pedestal';
    else if (/empotr/.test(tipo)) m.montaje = 'empotrar';
    else if (/pared/.test(tipo)) m.montaje = 'pared';
  }

  if (familia === 'mueble-bano') {
    if (/pared/.test(tipo)) m.montaje = 'pared';
    else if (/piso/.test(tipo)) m.montaje = 'piso';
  }

  if (familia === 'botiquin' || familia === 'espejo') {
    if (/\bled\b/i.test(n)) m.luz = 'led';
  }

  if (familia === 'barra-seguridad') {
    if (/tipo l|\ben l\b|\bl\b(?!\w)/i.test(n)) m.forma = 'en L';
    else if (/abatible/i.test(n)) m.forma = 'abatible';
    else if (/curva/i.test(n)) m.forma = 'curva';
    else m.forma = 'recta';
    const g = T.limpia(a.largo || a['tamaño'] || '');
    let c = (g + ' ' + n).match(/(\d+(?:[.,]\d+)?)\s*cm\b/i);
    if (c) m.largo_cm = EB.aCm(numero(c[1]), 'cm');
    if (!m.largo_cm) { c = (g + ' ' + n).match(/(\d+)\s*(?:"|''|pulg)/i); if (c) m.largo_cm = EB.aCm(numero(c[1]), 'pulg'); }
  }

  if (familia === 'juego-accesorios') {
    const p = n.match(/\b(\d)\s*\/\s*1\b/) || n.match(/\b(\d)\s*en\s*1\b/i) || n.match(/(\d)\s*(?:Pzas?|piezas?)\b/i);
    if (p) m.piezas = +p[1];
  }

  /* El ámbito lo decide la tabla de especificación, no cada comercio:
     si cada uno lo decidiera, el mismo artículo caería en partidas
     distintas según quién lo venda. */
  if (['juego-accesorios', 'secador-manos', 'dispensador-jabon', 'dispensador-papel'].indexOf(familia) >= 0) {
    m.ambito = EB.ambito(n);
  }

  if (familia === 'secador-manos' || familia === 'dispensador-jabon') {
    if (/sensor|autom[aá]tic/i.test(n)) m.activacion = 'sensor';
    else if (/bot[oó]n|manual|palanca/i.test(n)) m.activacion = 'boton';
  }

  if (familia === 'dispensador-papel') {
    if (/toalla/i.test(n)) m.tipo_papel = 'toalla';
    else if (/higienico|higi[eé]nico|jumbo|servilleta/i.test(n)) m.tipo_papel = 'papel higiénico';
  }

  /* Dimensiones declaradas, para que otro proveedor pueda emparejar por ahí
     aunque no publique el tipo. */
  const dim = T.limpia(a['tamaño'] || '') || n;
  const d = dim.match(/(\d{2,4})\s*[xX]\s*(\d{2,4})\s*[xX]\s*(\d{2,4})\s*(mm|cm)?/i);
  if (d) {
    const u = (d[4] || (numero(d[1]) > 200 ? 'mm' : 'cm')).toLowerCase();
    const fx = u === 'mm' ? 1 : 10;
    m.largo_mm = numero(d[1]) * fx; m.ancho_mm = numero(d[2]) * fx; m.alto_mm = numero(d[3]) * fx;
  }
  const an = T.limpia(a.ancho || '').match(/(\d+(?:[.,]\d+)?)\s*cm/i);
  if (an && !m.ancho_mm) m.ancho_mm = numero(an[1]) * 10;

  return m;
}

function reglaBanos(a) {
  const n = T.limpia(a.nombre);
  let familia = FAMILIA_BANOS[a.cat3];

  /* El grupo INODOROS mezcla el aparato completo con el tanque y la taza
     sueltos, y nueve artículos vienen sin grupo. En los dos casos manda el
     nombre. */
  if (!familia || a.cat3 === 'INODOROS' || !a.cat3) {
    if (/^INODORO/i.test(n)) familia = 'inodoro-una-pieza';
    else if (/^TANQUE/i.test(n)) familia = 'inodoro-tanque';
    else if (/^TAZA/i.test(n)) familia = a.cat3 === 'INODOROS FLUXOMETRO' || /FLUXOMETRO/i.test(n)
      ? 'inodoro-fluxometro' : 'inodoro-basineta';
    else if (/CAMBIADOR.*PARED/i.test(n)) familia = 'cambiador-bebes';
    else familia = FAMILIA_BANOS[a.cat3];
  }

  /* La silla de baño y la silla de inodoro son ayudas técnicas portátiles,
     no equipamiento anclado a la obra. */
  if (/^SILLA/i.test(n)) return null;

  /* El grupo «MUEBLES PARA EL BAÑO» de esta tienda trae también espejos y
     repisas, y el nombre lo dice aunque el grupo no: un espejo de RD$ 1,140
     entraba en la partida del mueble, cuyo siguiente precio son RD$ 8,615.
     Manda el nombre, como en el grupo de los inodoros. */
  if (familia === 'mueble-bano') {
    if (/^ESPEJO/i.test(n)) familia = 'espejo';
    else if (/^BOTIQU[IÍ]N/i.test(n)) familia = 'botiquin';
    else if (/^REPISA|^TOALLERO|^ORGANIZADOR/i.test(n)) return null;
  }

  if (!familia) return null;

  /* El panel se resuelve en la tabla, que decide si es recinto o vidrio
     y le saca la medida del nombre: «PANEL BAÑO AQUASPA WS-1/80F 80X190
     CM RAYAS» es una mampara de 80 × 190. */
  if (familia === 'cabina-ducha') {
    const c = EB.cabinaDeDucha(n);
    return EB.item(c.familia, c.medidas);
  }

  return EB.item(familia, medidasBano(a, familia));
}

module.exports.reglaBanos = reglaBanos;
module.exports.FUERA_BANOS = FUERA_BANOS;
