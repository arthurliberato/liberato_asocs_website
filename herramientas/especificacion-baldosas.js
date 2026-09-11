'use strict';
/* =========================================================
   especificacion-baldosas.js — el ítem es la especificación

   Ochoa publica 1,226 baldosas con precio. Casi todas son el
   mismo producto con otro color: «Fronda Musgo» y «Castle
   Light» son las dos cerámica de pared de 20 x 60 cm de PAMESA,
   y en un presupuesto son una sola partida. El color, el
   diseño, la colección y la marca son de la cotización; lo que
   define el ítem es la especificación de compra.

   QUÉ DEFINE UNA BALDOSA
   ----------------------
   Tres cosas, y son las tres que un presupuesto escribe:

     material  cerámica o porcelanato — el que más mueve el precio
     uso       piso, pared, o piso y pared
     formato   60 x 60, 30 x 60, 120 x 60 cm…

   Y tres que NO: el color, el diseño y la marca.

   EL ACABADO NO ENTRA EN LA CLAVE
   -------------------------------
   Mate, brillante, pulido y antideslizante son diferencias
   reales, pero la ficha las declara en 134 redacciones distintas
   y las calla en 382 artículos. Convertirlas en clave partiría
   los ítems según si el comercio se acordó de escribirlo, que es
   la peor razón posible para partir un ítem. Van registradas
   como medida, y solo si todos los artículos del ítem coinciden.

   LA UNIDAD ES EL METRO CUADRADO
   ------------------------------
   La tienda cobra por pieza; la obra compra por metro. La
   referencia trae las dos cosas pegadas —60X602.77MT/2 son
   60 x 60 cm y 2.77 piezas por m²— y de ahí sale el precio por
   metro, que es el único número comparable entre formatos.
   ========================================================= */

/* `ejes` son las medidas que forman parte de la identidad del ítem: dos
   artículos con distinto valor en un eje son ítems distintos. Lo demás se
   registra pero no parte el catálogo. */
const FAMILIAS = {
  baldosa: {
    cat: 'MAT-08', unidad: 'm²', etapa: 'pisos', orden: 10,
    ejes: ['material', 'uso', 'formato'],
    nombre: m => (m.material === 'porcelanato' ? 'Porcelanato' : 'Cerámica') +
                 ' de ' + m.uso + ', ' + m.formato,
    /* Material, uso y formato van en el nombre; color, diseño y marca son
       de la cotización. No queda nada que la pantalla deba repetir. */
    esp: '',
    alias: 'piso, cerámica, porcelanato, baldosa, azulejo, revestimiento, loza'
  },

  mosaico: {
    cat: 'MAT-08', unidad: 'm²', etapa: 'pisos', orden: 20,
    ejes: ['formato'],
    nombre: m => 'Mosaico cerámico en malla, ' + m.formato,
    esp: '',
    alias: 'mosaico, malla, veneciano, pastilla'
  },

  peldano: {
    cat: 'MAT-08', unidad: 'unidad', etapa: 'pisos', orden: 30,
    ejes: ['formato'],
    nombre: m => 'Peldaño cerámico recto, ' + m.formato,
    esp: '',
    alias: 'peldaño, escalón, nariz de escalón'
  },

  'set-huella': {
    cat: 'MAT-08', unidad: 'juego', etapa: 'pisos', orden: 40,
    ejes: ['largo_cm'],
    nombre: m => 'Set de huella y contrahuella, ' + m.largo_cm + ' cm',
    esp: '',
    alias: 'huella y contrahuella, set de escalón'
  },

  'borde-peldano': {
    cat: 'MAT-08', unidad: 'unidad', etapa: 'pisos', orden: 50,
    ejes: ['largo_cm'],
    nombre: m => 'Borde para peldaño, ' + m.largo_cm + ' cm',
    esp: '',
    alias: 'borde de peldaño, nariz'
  },

  rodapie: {
    cat: 'MAT-08', unidad: 'ml', etapa: 'pisos', orden: 60,
    ejes: ['material'],
    nombre: m => 'Rodapié de ' + m.material,
    esp: '',
    alias: 'rodapié, zócalo, guardapolvo'
  },

  'perfil-canto': {
    cat: 'MAT-08', unidad: 'unidad', etapa: 'pisos', orden: 70,
    ejes: ['tipo', 'material', 'medida_mm'],
    nombre: m => ETIQUETA_PERFIL[m.tipo] + ' de ' + m.material +
                 (m.medida_mm ? ', ' + m.medida_mm + ' mm' : ''),
    /* La unidad es el tramo: 2.5 m en listelos, peldaños y juntas, 2.6 m
       en los esquineros de canto. */
    esp: 'Tramo de 2.5 a 2.6 m',
    alias: 'perfil, listelo metálico, esquinero, remate, junta de dilatación'
  },

  cruceta: {
    cat: 'MAT-08', unidad: 'funda', etapa: 'pisos', orden: 80,
    ejes: ['espesor_mm', 'piezas'],
    nombre: m => 'Cruceta para cerámica ' + m.espesor_mm + ' mm, funda de ' + m.piezas,
    esp: '',
    alias: 'cruceta, separador, crucetilla'
  },

  'nivelador-ceramica': {
    cat: 'MAT-08', unidad: 'funda', etapa: 'pisos', orden: 90,
    ejes: ['pieza', 'espesor_mm'],
    nombre: m => (m.pieza === 'calzo' ? 'Calzo' : m.pieza === 'cuna' ? 'Cuña' : 'Clip') +
                 ' de nivelación para cerámica' + (m.espesor_mm ? ' ' + m.espesor_mm + ' mm' : ''),
    /* Los mm del calzo y del clip son la junta que dejan, no el espesor de
       la pieza, y ninguno de los dos aprieta solo: la cuña se compra aparte. */
    esp: m => m.pieza === 'cuna' ? 'Aprieta calzos y clips de cualquier junta'
                                 : 'La medida es la junta · la cuña va aparte',
    alias: 'nivelador, calzo, cuña, clip de nivelación'
  },

  /* El vinilo se compra por metro como la baldosa y compite con ella en la
     misma partida, así que vive aquí y no en un rubro aparte. El espesor es
     lo que separa el residencial del comercial. */
  'piso-vinilico': {
    cat: 'MAT-08', unidad: 'm²', etapa: 'pisos', orden: 90,
    ejes: ['uso', 'espesor_mm'],
    /* El eje del uso estaba en la clave pero no salía en el nombre, y con una
       sola fuente no se notaba. Al entrar el deck de exterior sí: la tabla de
       WPC de 25 mm que va a la intemperie se llamaba «Piso vinílico, 25 mm»,
       igual que el SPC de una sala. Ni es vinilo ni es de interior. */
    nombre: m => (m.uso === 'pared' ? 'Panel de vinil para pared, '
                : m.uso === 'exterior' ? 'Deck de WPC para exterior, '
                : 'Piso vinílico, ') + m.espesor_mm + ' mm',
    esp: m => m.uso === 'exterior' ? 'Tabla de madera plástica, para intemperie' : '',
    alias: 'vinil, vinílico, spc, lvt, wpc, deck, piso flotante, panel de vinil'
  },

  adoquin: {
    cat: 'MAT-08', unidad: 'm²', etapa: 'exteriores', orden: 100,
    ejes: ['tipo'],
    nombre: m => 'Adoquín de hormigón tipo ' + m.tipo,
    esp: '',
    alias: 'adoquín, pavimento de exterior, acera'
  },

  teja: {
    cat: 'MAT-07', unidad: 'm²', etapa: 'techos', orden: 200,
    ejes: ['material', 'piezas_m2'],
    nombre: m => 'Teja de ' + m.material + ', ' + m.piezas_m2 + ' piezas por m²',
    esp: '',
    alias: 'teja, techo de teja, cubierta, teja gravillada'
  },

  'caballete-teja': {
    cat: 'MAT-07', unidad: 'unidad', etapa: 'techos', orden: 210,
    ejes: ['pieza', 'material'],
    nombre: m => (m.pieza === 'final' ? 'Final de caballete' : 'Caballete') +
                 ' para teja de ' + m.material,
    esp: '',
    alias: 'caballete, cumbrera, remate de techo'
  },

  /* La cortadora se separa del resto porque su largo de corte SÍ es
     identidad: una manual de 20 pulgadas cuesta RD$ 2,857 y una de 100 cm,
     RD$ 35,818. En los discos y las cuchillas no hay tal medida y meterla
     como eje solo dejaría fuera al que no la declara. */
  'cortadora-ceramica': {
    cat: 'EQU-04', unidad: 'unidad', etapa: 'preliminares', orden: 300,
    ejes: ['tipo', 'corte_cm'],
    nombre: m => ETIQUETA_HERRAMIENTA[m.tipo] + ', corte de ' + m.corte_cm + ' cm',
    esp: '',
    alias: 'cortadora, cortadora de cerámica, máquina de cortar'
  },

  'herramienta-ceramica': {
    cat: 'EQU-04', unidad: 'unidad', etapa: 'preliminares', orden: 310,
    ejes: ['tipo'],
    nombre: m => ETIQUETA_HERRAMIENTA[m.tipo],
    esp: '',
    alias: 'herramienta de cerámica, llana, ventosa, alicate'
  },

  /* Cuchillas, discos y rodeles se separan por su medida: sin ella la fila
     junta un disco de RD$ 205 con uno de RD$ 3,880 y no sirve de nada. */
  'repuesto-corte': {
    cat: 'EQU-04', unidad: 'unidad', etapa: 'preliminares', orden: 320,
    ejes: ['tipo', 'medida'],
    nombre: m => ETIQUETA_HERRAMIENTA[m.tipo] + ', ' + m.medida,
    esp: '',
    alias: 'disco, rodel, cuchilla, repuesto de cortadora'
  },

  /* ---- Morteros y adhesivos: van a la categoría de cemento, que es
     donde el presupuesto los busca, no en pisos. ---- */

  'adhesivo-cementicio': {
    cat: 'MAT-02', unidad: 'funda', etapa: 'pisos', orden: 400,
    ejes: ['clase', 'color', 'kg'],
    nombre: m => 'Adhesivo cementicio ' + m.clase.toUpperCase() + ' ' + m.color +
                 ', funda ' + m.kg + ' kg',
    /* La clase va en el nombre; lo que el comprador necesita es saber que el
       C1 no sirve para porcelanato. */
    esp: m => m.clase === 'c2'
      ? 'Adherencia mejorada · porcelanato, gran formato y exteriores'
      : 'Adherencia normal · cerámica de interiores, no porcelanato',
    alias: 'pegamento de cerámica, adhesivo, pegacol, cemento cola'
  },

  'adhesivo-pasta': {
    cat: 'MAT-02', unidad: 'unidad', etapa: 'pisos', orden: 410,
    ejes: ['presentacion'],
    nombre: m => 'Adhesivo en pasta para cerámica, ' + m.presentacion,
    esp: 'Acrílico · solo interiores',
    alias: 'adhesivo en pasta, vinalit, pega de cerámica lista'
  },

  derretido: {
    cat: 'MAT-02', unidad: 'funda', etapa: 'pisos', orden: 420,
    ejes: ['kg'],
    nombre: m => 'Derretido para cerámica, funda ' + m.kg + ' kg',
    /* El color no cambia el precio: el mismo producto sale en 16 tonos. */
    esp: '',
    alias: 'derretido, grout, fragua, junta de cerámica'
  },

  'mortero-panete': {
    cat: 'MAT-02', unidad: 'funda', etapa: 'pisos', orden: 430,
    ejes: ['kg'],
    nombre: m => 'Mortero predosificado de pañete, funda ' + m.kg + ' kg',
    esp: '',
    alias: 'readymix, mezcla lista, pañete, mortero de revestimiento'
  },

  estuco: {
    cat: 'MAT-02', unidad: 'funda', etapa: 'pisos', orden: 440,
    ejes: ['color', 'kg'],
    nombre: m => 'Estuco ' + m.color + ', funda ' + m.kg + ' kg',
    esp: '',
    alias: 'estuco, masilla de pared'
  },

  'masilla-revestimiento': {
    cat: 'MAT-02', unidad: 'funda', etapa: 'pisos', orden: 450,
    ejes: ['kg'],
    nombre: m => 'Masilla para revestimiento, funda ' + m.kg + ' kg',
    /* La ficha (Pegacol Panel, CS IV, EN 998-1) la describe como mortero de
       terminación sobre paneles, no como pega. */
    esp: 'Cementicia · sobre paneles de fibrocemento y drywall',
    alias: 'masilla, pegacol panel'
  },

  yeso: {
    cat: 'MAT-02', unidad: 'funda', etapa: 'terminacion', orden: 455,
    ejes: ['kg'],
    nombre: m => 'Yeso en funda de ' + m.kg + ' kg',
    esp: '',
    alias: 'yeso, escayola, plafón de yeso'
  },

  'hormigon-seco': {
    cat: 'MAT-02', unidad: 'funda', etapa: 'estructura', orden: 460,
    ejes: ['resistencia', 'lb'],
    nombre: m => 'Hormigón seco premezclado ' + m.resistencia + ' kg/cm², funda ' + m.lb + ' lb',
    esp: '',
    alias: 'hormigón seco, concreto en funda, mezcla lista de hormigón'
  }
};

/* El esquinero, el listelo de terminación y el remate separador hacen lo
   mismo —rematar el canto de la cerámica— y se instalan igual. Van juntos. El
   perfil de peldaño y la junta de dilatación no: uno protege la nariz del
   escalón y el otro absorbe movimiento. */
const ETIQUETA_PERFIL = {
  canto: 'Perfil de canto',
  peldano: 'Perfil de peldaño',
  dilatacion: 'Junta de dilatación'
};

const ETIQUETA_HERRAMIENTA = {
  'cortadora-manual': 'Cortadora manual de cerámica',
  'cortadora-electrica': 'Cortadora eléctrica de cerámica',
  'disco': 'Disco diamantado para cortadora',
  'rodel': 'Rodel de repuesto para cortadora',
  'cuchilla': 'Cuchilla de repuesto para cortadora',
  'llana': 'Llana dentada',
  'aplicador': 'Aplicador de mortero',
  'ventosa': 'Ventosa para piezas lisas',
  'alicate': 'Alicate para nivelación de cerámica',
  'kit-nivelacion': 'Kit de nivelación de cerámica'
};

const limpia = s => (s === 0 ? '0' : String(s || '').trim());

/* Construye el ítem. `medidas` trae todo lo que el comercio declaró; los ejes
   de la familia salen de ahí y entran en la clave, el resto queda registrado
   para que el catálogo sepa por dónde emparejar con el próximo comercio. */
function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia de baldosas desconocida: ' + familia);
  medidas = medidas || {};

  const claves = [familia];
  for (let i = 0; i < f.ejes.length; i++) {
    const v = limpia(medidas[f.ejes[i]]);
    /* Sin el eje no hay ítem: publicar «cerámica de piso» sin decir el
       formato es exactamente la fila que no sirve para presupuestar. */
    if (!v) return null;
    claves.push(f.ejes[i] + '-' + v);
  }

  return {
    cat: f.cat,
    familia: familia,
    clave: claves.join('-').toLowerCase()
             .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
             .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
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

/* Los formatos que el mercado nombra. Cada fábrica declara su medida real
   —30, 30.3, 30.5, 31— y son todas el mismo formato: la obra las pide como
   «30 x 60». Sin esto el catálogo saca seis ítems donde hay uno, y se pierde
   justo la comparación que se busca. */
/* La lista es corta a propósito: solo los formatos que el mercado nombra. Si
   se le agregan medidas de fábrica —32, 17.5, 62.5— el ajuste empieza a
   inventar: un 52 x 17 termina llamándose «50 x 17.5», que no lo vende nadie.
   Lo que no cae cerca de un nominal se queda con su medida real. */
const FORMATOS_CM = [5, 7.5, 10, 15, 20, 25, 30, 33, 40, 45, 50, 55, 58,
                     60, 75, 80, 90, 100, 120, 160, 240];

/* Al 5% entran las variantes de fábrica del mismo formato —30.3, 30.5, 31,
   31.5 son todas «30»— y se queda fuera el 32, que sí es un formato propio. */
const TOLERANCIA_FORMATO = 0.05;

function aFormatoCm(v) {
  if (!(v > 0)) return null;
  let mejor = null;
  FORMATOS_CM.forEach(f => {
    const e = Math.abs(f - v) / v;
    if (e <= TOLERANCIA_FORMATO && (!mejor || e < mejor.e)) mejor = { f: f, e: e };
  });
  return mejor ? mejor.f : Math.round(v * 10) / 10;
}

/* Lo mismo para el peso de la funda: 94 libras son 42.638 kg y la funda se
   llama «42.5». */
const PESOS_KG = [1, 2, 5, 10, 14, 20, 22.7, 25, 40, 42.5, 50];

function aPesoKg(v) {
  if (!(v > 0)) return null;
  let mejor = null;
  PESOS_KG.forEach(f => {
    const e = Math.abs(f - v) / v;
    if (e <= 0.03 && (!mejor || e < mejor.e)) mejor = { f: f, e: e };
  });
  return mejor ? mejor.f : Math.round(v * 10) / 10;
}

/* El formato como lo escribe la obra: el lado mayor primero. */
function formato(a, b) {
  const x = aFormatoCm(Math.max(a, b)), y = aFormatoCm(Math.min(a, b));
  if (!x || !y) return '';
  return x + ' x ' + y + ' cm';
}

/* EL SUELO DEL METRO CUADRADO

   Ochoa publica catorce baldosas a 50, 100, 150 y 200 pesos el metro
   cuadrado. No son gangas: son marcadores de precio de su sistema. Se ve
   al ordenar sus 857 baldosas por precio —el método de siempre, medir en
   vez de opinar—: esas catorce se agolpan en esos cuatro valores, luego
   hay un salto de x1.62 y desde RD$ 324 en adelante los precios forman un
   continuo en el que ningún escalón pasa de x1.03.

   Y no es cosa de un comercio. Puestos uno al lado del otro los seis que
   venden baldosa, el mínimo es 355 en CerArte, 389 en Ferremix, 494 en
   Bellón, 4.167 en Hogardeco; los únicos por debajo de 300 son esas
   catorce de Ochoa y un mosaico suelto de La Ibérica. Por debajo del
   suelo de mercado no hay baldosas: hay marcadores.

   Importa porque una sola de estas hunde la partida entera. El auditor
   ve «entre RD$ 50 y RD$ 1,238 no hay nada» y retira el ítem completo,
   así que catorce marcadores se llevan por delante los precios buenos de
   trescientas baldosas que sí sirven.

   Vive aquí y no en las reglas de cada comercio por lo mismo que el
   formato: es una propiedad de la baldosa, no de quién la vende. */
const SUELO_M2 = 300;

function precioDeMarcador(precioM2) {
  return !(precioM2 > 0) || precioM2 < SUELO_M2;
}

module.exports = { FAMILIAS, item, formato, aFormatoCm, aPesoKg, precioDeMarcador,
                   SUELO_M2, FORMATOS_CM, ETIQUETA_PERFIL, ETIQUETA_HERRAMIENTA };
