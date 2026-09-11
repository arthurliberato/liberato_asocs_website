'use strict';
/* =========================================================
   especificacion-banos.js — el ítem es la especificación

   Una hoja de 8.5 x 11 es un solo ítem aunque la vendan cinco
   marcas. Lo mismo un inodoro de una pieza elongado: la marca y
   el modelo son de la cotización, no del ítem.

   Aquí vive la tabla canónica de los ítems de baño y la usan los
   dos comercios. Es lo que hace que el precio de Ochoa y el de
   InnovaCentro caigan en la misma fila: no se emparejan nombres
   de producto —eso ya lo probamos y falla—, sino que cada uno
   declara qué especificación tiene delante y la tabla decide el
   ítem.

   LAS MEDIDAS VAN POR SEPARADO
   ----------------------------
   Cada comercio publica lo que quiere: uno da las dimensiones
   del inodoro y otro solo los litros del tanque. Por eso las
   medidas se guardan una por columna en vez de en una frase.
   Las que forman parte de la identidad del ítem —la forma de un
   inodoro, el largo de una barra de seguridad— entran en la
   clave; las demás se registran y se acumulan de todos los
   artículos que caen en el ítem, de modo que la ficha termina
   sabiendo más que cualquiera de sus fuentes.
   ========================================================= */

/* Las familias. `ejes` son las medidas que forman parte de la identidad:
   dos artículos con distinto valor en un eje son ítems distintos. */
const FAMILIAS = {
  /* Un inodoro es de una pieza, de dos piezas o infantil. La forma de la taza
     —redonda o alargada— no lo parte: es la misma partida del presupuesto y
     cada comercio la escribe distinto. Ochoa e InnovaCentro dicen «elongado»,
     Cima dice «alargado», y era la misma palabra abriendo dos ítems. */
  'inodoro-una-pieza': {
    cat: 'MAT-24', base: 'Inodoro de una pieza', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 10,
    alias: 'inodoro, taza de baño, wc, one piece, elongado, alargado, redondo'
  },
  'inodoro-infantil': {
    cat: 'MAT-24', base: 'Inodoro infantil', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 12,
    alias: 'inodoro infantil, inodoro de niño, wc infantil'
  },
  /* Ochoa vende las dos mitades por separado y por eso el catálogo tenía
     tanque y basineta como ítems sueltos. Cima vende el inodoro de dos piezas
     completo, que es otra partida: la que un presupuesto escribe. */
  /* Suspendido no es un acabado del inodoro de piso: va sobre un bastidor
     dentro de la pared, con el tanque empotrado, y eso es otra partida y
     otro trabajo de albañilería. Por eso es familia propia y no una medida
     del de una pieza. */
  'inodoro-suspendido': {
    cat: 'MAT-24', base: 'Inodoro suspendido', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 14,
    alias: 'inodoro suspendido, inodoro de pared, wall hung, colgado'
  },
  'inodoro-dos-piezas': {
    cat: 'MAT-24', base: 'Inodoro de dos piezas', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 15,
    alias: 'inodoro de dos piezas, taza y tanque, wc dos piezas',
    esp: 'Tanque y basineta incluidos'
  },
  'inodoro-tanque': {
    cat: 'MAT-24', base: 'Tanque para inodoro de dos piezas', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 20,
    alias: 'tanque de inodoro, cisterna',
    esp: 'Sin basineta · se compra aparte'
  },
  'inodoro-basineta': {
    cat: 'MAT-24', base: 'Basineta para inodoro de dos piezas', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 30,
    alias: 'basineta, taza, cuerpo del inodoro',
    esp: 'Sin tanque · se compra aparte'
  },
  'inodoro-fluxometro': {
    cat: 'MAT-24', base: 'Taza para fluxómetro', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 40,
    alias: 'taza de fluxómetro, inodoro comercial',
    esp: 'Sin tanque · el fluxómetro va aparte'
  },
  'urinario': {
    cat: 'MAT-24', base: 'Urinario de porcelana', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 50,
    alias: 'orinal, mingitorio, urinario'
  },
  'bide': {
    cat: 'MAT-24', base: 'Bidé', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 60, alias: 'bidé, bidet'
  },
  'kit-instalacion-inodoro': {
    cat: 'MAT-24', base: 'Kit de instalación de inodoro', unidad: 'juego',
    ejes: [], etapa: 'instalaciones', orden: 70,
    alias: 'kit de instalación, cera y tornillos de inodoro'
  },

  'lavamanos': {
    cat: 'MAT-25', base: 'Lavamanos', unidad: 'unidad',
    ejes: ['montaje'], etapa: 'instalaciones', orden: 10,
    alias: 'lavamanos, lavabo, lavatorio'
  },
  'pedestal': {
    cat: 'MAT-25', base: 'Pedestal para lavamanos', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 20,
    alias: 'pedestal, pie de lavamanos',
    esp: 'Sin lavamanos · se compra aparte'
  },
  'palometa': {
    cat: 'MAT-25', base: 'Palometa para lavamanos', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 30,
    alias: 'palometa, soporte de lavamanos, escuadra'
  },
  'conector-desague': {
    cat: 'MAT-25', base: 'Conector de desagüe para lavamanos', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 40, alias: 'conector, yee de desagüe'
  },

  'mueble-bano': {
    cat: 'MAT-26', base: 'Mueble de baño', unidad: 'unidad',
    ejes: ['montaje'], etapa: 'terminacion', orden: 10,
    alias: 'mueble de baño, vanity, gabinete'
  },
  'botiquin': {
    cat: 'MAT-26', base: 'Botiquín de baño', unidad: 'unidad',
    ejes: ['luz'], etapa: 'terminacion', orden: 20,
    alias: 'botiquín, gabinete con espejo'
  },
  'espejo': {
    cat: 'MAT-26', base: 'Espejo de baño', unidad: 'unidad',
    ejes: ['luz'], etapa: 'terminacion', orden: 30, alias: 'espejo de baño'
  },
  'cabina-ducha': {
    cat: 'MAT-26', base: 'Cabina o panel de ducha', unidad: 'unidad',
    ejes: [], etapa: 'terminacion', orden: 40,
    alias: 'cabina de ducha, mampara, panel de ducha'
  },

  /* CUATRO COSAS QUE SE LLAMABAN «BAÑERA»

     Veintiocho cotizaciones de RD$ 9.469 a RD$ 430.700 —cuarenta y cinco
     veces— en un solo ítem sin ejes, y dentro cuatro productos que no se
     presupuestan igual: la bañera de baño, la infantil de 72 cm, la que
     lleva chorros y el jacuzzi, que es otro aparato con su bomba y su
     instalación eléctrica.

     Quien presupuesta un apartamento pone una bañera; quien pone un
     jacuzzi está resolviendo otra cosa, y necesita además una línea
     eléctrica y un desagüe que la bañera no pide. Mezclarlos daba una
     referencia de RD$ 99.105 que no servía para ninguno de los dos. */
  banera: {
    cat: 'MAT-26', base: 'Bañera', unidad: 'unidad',
    /* Y dentro de la bañera a secas queda un corte más, que los propios
       nombres declaran: la exenta —isla, freestanding— se planta en medio
       del baño y pide que la plomería suba por el piso; la empotrada va
       contra la pared y se resuelve como siempre. Entre las dos hay tres
       veces, y es la clase de decisión que se toma antes de picar. */
    /* Y el material, que es el que manda en el precio: acero esmaltado
       RD$ 9.469, acrílica RD$ 82.974 de mediana, carga mineral
       RD$ 195.000. Nueve veces del primero al segundo y dos y media del
       segundo al tercero.

       Va como eje aunque solo lo declaren siete de doce, porque item()
       salta el eje que falta en vez de rechazar la cotización: las que
       no lo dicen se quedan juntas en «Bañera, de empotrar», y eso es
       exactamente lo que son —bañeras de las que no sabemos de qué están
       hechas—. Las fichas no ayudan: las de CerArte hablan de
       «materiales duraderos y resistentes a la humedad», que es prosa de
       venta y no una especificación. */
    ejes: ['montaje', 'material'], etapa: 'terminacion', orden: 42,
    alias: 'bañera, tina, bathtub'
  },
  'banera-infantil': {
    cat: 'MAT-26', base: 'Bañera infantil', unidad: 'unidad',
    ejes: [], etapa: 'terminacion', orden: 43,
    esp: 'Bañera corta, de guardería o baño de niños',
    alias: 'bañera infantil, kiddy, tina de niños'
  },
  'banera-hidromasaje': {
    cat: 'MAT-26', base: 'Bañera de hidromasaje', unidad: 'unidad',
    ejes: [], etapa: 'terminacion', orden: 44,
    esp: 'Lleva bomba y chorros: pide línea eléctrica propia',
    alias: 'bañera de hidromasaje, bañera con chorros, whirlpool'
  },
  jacuzzi: {
    cat: 'MAT-26', base: 'Jacuzzi', unidad: 'unidad',
    ejes: [], etapa: 'terminacion', orden: 45,
    esp: 'Aparato completo con bomba: pide línea eléctrica y desagüe propios',
    alias: 'jacuzzi, spa, tina de hidromasaje'
  },

  'plato-ducha': {
    cat: 'MAT-26', base: 'Plato de ducha', unidad: 'unidad',
    ejes: [], etapa: 'terminacion', orden: 44,
    alias: 'plato de ducha, receptáculo, base de ducha'
  },

  'barra-seguridad': {
    cat: 'MAT-27', base: 'Barra de seguridad', unidad: 'unidad',
    ejes: ['forma', 'largo_cm'], etapa: 'terminacion', orden: 10,
    alias: 'barra de seguridad, agarradera, accesibilidad'
  },
  'juego-accesorios': {
    cat: 'MAT-27', base: 'Juego de accesorios de baño', unidad: 'juego',
    ejes: ['ambito', 'piezas'], etapa: 'terminacion', orden: 20,
    alias: 'juego de accesorios, kit de baño'
  },
  'secador-manos': {
    cat: 'MAT-27', base: 'Secador de manos', unidad: 'unidad',
    ejes: ['ambito', 'activacion'], etapa: 'terminacion', orden: 30,
    alias: 'secador de manos'
  },
  'dispensador-jabon': {
    cat: 'MAT-27', base: 'Dispensador de jabón', unidad: 'unidad',
    ejes: ['ambito', 'activacion'], etapa: 'terminacion', orden: 40,
    alias: 'dispensador de jabón, dosificador'
  },
  'dispensador-papel': {
    cat: 'MAT-27', base: 'Dispensador de papel', unidad: 'unidad',
    ejes: ['ambito', 'tipo_papel'], etapa: 'terminacion', orden: 50,
    alias: 'dispensador de papel, portarrollo comercial'
  },
  'cambiador-bebes': {
    cat: 'MAT-27', base: 'Cambiador de bebés de pared', unidad: 'unidad',
    ejes: [], etapa: 'terminacion', orden: 60,
    alias: 'cambiador de bebés, baño público'
  },

  /* EL CABEZAL DE DUCHA, QUE ERA EL PEOR DEL CATÁLOGO

     166 cotizaciones de RD$ 150 a RD$ 143.568: mil ciento veintinueve
     veces, la mayor dispersión de todas las partidas. Y con razón, porque
     ahí dentro había seis productos distintos y tres hechos que el precio
     sigue.

     PRIMERO, LO QUE NO ES UN CABEZAL FIJO —28 cotizaciones—: la regadera
     eléctrica, que calienta el agua y es un aparato; la ducha de bidé; el
     chorro lateral de cuerpo; la ducha de mano con su soporte, que ya
     tiene partida propia; y la ducha de techo empotrada, que se instala
     en el cielo raso y no en la pared.

     DESPUÉS, LOS TRES EJES, y los tres los declara el nombre:

       el tamaño, que es monótono y manda —2" RD$ 429, 4" RD$ 1.049,
       6" RD$ 1.185, 8" RD$ 2.475, 10" RD$ 5.809, 12" RD$ 7.355—;
       el material, plástico RD$ 505, acero RD$ 1.005, latón RD$ 3.205;
       y si trae brazo, que es lo que duplica el precio del mismo cabezal.

     LA FORMA NO ENTRA. Cuadrado o redondo es una decisión de diseño que
     no mueve el precio, y meterla partiría cada partida en dos por nada.

     DÓNDE QUEDÓ. Las 166 son 50 partidas. La peor sigue siendo la que
     no lleva ningún eje: 44 cotizaciones y 327 veces. No hay eje que
     sacarle, porque sus nombres no declaran nada físico —«Rociador
     Spin», «REGADERA DE DUCHA», «Regadera cuadrada»—; lo que las separa
     es la marca, y eso lo resuelve la gama, que ya está medida sobre
     ellas mismas: la económica en RD$ 562 con 15 cotizaciones y la alta
     en RD$ 22.021 con 20. Eso no es un eje del ítem y por eso va por el
     otro camino, el de la referencia por gama. */
  'ducha-cabezal': {
    cat: 'MAT-09', base: 'Cabezal de ducha', unidad: 'unidad',
    ejes: ['pulgadas', 'material', 'brazo'], etapa: 'instalaciones', orden: 45,
    alias: 'cabezal de ducha, regadera, rociador, ducha fija'
  },
  'ducha-techo': {
    cat: 'MAT-09', base: 'Ducha de techo empotrada', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 46,
    esp: 'Va en el cielo raso: pide la tubería por el entretecho',
    alias: 'ducha de techo, ducha empotrada, lluvia de techo'
  },
  'ducha-lateral': {
    cat: 'MAT-09', base: 'Chorro lateral de ducha', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 47,
    esp: 'Chorro de cuerpo: se instalan varios por ducha',
    alias: 'chorro lateral, jet de cuerpo, ducha lateral'
  },
  'ducha-bide': {
    cat: 'MAT-09', base: 'Ducha higiénica de bidé', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 48,
    alias: 'ducha higiénica, chattaf, ducha de bidé'
  },
  'regadera-electrica': {
    cat: 'MAT-09', base: 'Regadera eléctrica', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 49,
    esp: 'Calienta el agua: pide línea eléctrica propia',
    alias: 'regadera eléctrica, ducha eléctrica, calentador de paso'
  },  'ducha-telefono': {
    cat: 'MAT-09', base: 'Ducha teléfono', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 20, alias: 'ducha de mano, teléfono de ducha'
  },
  'ducha-columna': {
    cat: 'MAT-09', base: 'Columna de ducha', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 30, alias: 'columna de ducha, set de ducha'
  },
  /* La barra deslizable no se presupuesta sola: es parte del conjunto de
     ducha, igual que la columna y el sistema completo. Todo eso es un ítem. */
  'ducha-barra': {
    cat: 'MAT-09', base: 'Columna de ducha', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 40,
    alias: 'columna de ducha, sistema de ducha, barra deslizable, riel'
  },
  'ducha-brazo': {
    cat: 'MAT-09', base: 'Brazo de ducha', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 50, alias: 'brazo de ducha, cuello de ducha'
  },
  'ducha-mezcladora': {
    cat: 'MAT-09', base: 'Mezcladora de ducha', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 60, alias: 'mezcladora, grifería de ducha'
  },

  /* La grifería de aparato se separa por dos cosas y nada más: para qué
     aparato es y si tiene sensor. El número de manijas, el acabado y la línea
     del fabricante son de la cotización, no del ítem. */
  mezcladora: {
    cat: 'MAT-09', base: 'Mezcladora', unidad: 'unidad',
    ejes: ['uso', 'activacion'], etapa: 'instalaciones', orden: 55,
    alias: 'mezcladora, grifo, llave, monocomando, grifería, lavamanos, fregadero'
  },
  'ducha-manguera': {
    cat: 'MAT-09', base: 'Manguera para ducha teléfono', unidad: 'unidad',
    ejes: [], etapa: 'instalaciones', orden: 70, alias: 'manguera de ducha, flexible'
  }
};

/* Cómo se lee cada eje en el nombre del ítem. */
const ETIQUETA = {
  forma:       v => v,
  uso:         v => 'de ' + (v === 'bano' ? 'baño' : v),
  montaje:     v => 'de ' + v,
  /* «Acrílica» es adjetivo y va sola; las otras dos son sustantivos y
     piden el «de». Sale «Bañera, de empotrar, acrílica» y «Bañera, de
     isla, de carga mineral». */
  material:    v => (v === 'acrílica' ? 'acrílica' : 'de ' + v),
  pulgadas:    v => 'de ' + v + '"',
  /* Las dos se nombran. Se intentó nombrar solo «con brazo» y dejar
     «sin brazo» sin etiqueta, y salieron partidas distintas con el
     mismo nombre: «Cabezal de ducha, de 8\", de acero inoxidable» dos
     veces, una a RD$ 2.450 y otra a RD$ 4.210. El eje separaba y el
     nombre no lo decía. Callar un valor del eje no es lo mismo que no
     tener el eje. */
  brazo:       v => v + ' brazo',
  luz:         v => v === 'led' ? 'con luz LED' : '',
  piezas:      v => v + ' piezas',
  largo_cm:    v => v + ' cm',
  activacion:  v => v === 'sensor' ? 'con sensor' : v === 'boton' ? 'de botón' : '',
  /* El doméstico es el caso corriente y va sin etiqueta; el institucional
     se nombra porque es el que no se espera. */
  ambito:      v => v === 'institucional' ? 'institucional' : '',
  tipo_papel:  v => 'de ' + v
};

/* ÁMBITO: DOMÉSTICO O INSTITUCIONAL
   Un dispensador de jabón de AquaSpa cuesta RD$ 500 y uno de TORK para un
   baño público RD$ 1,900: no son el mismo artículo aunque se llamen igual.
   Lo que los separa no es la marca en sí, sino a qué baño van, y eso se
   lee en la marca institucional, en la capacidad y en las señas del nombre.

   «Inox» y «mural» entraron después, de mirar los que se colaban: el
   dispensador mural de acero inoxidable de RD$ 6,500 es el de un baño
   público, y la lista solo reconocía «acero inoxidable» escrito entero.

   Vive aquí y no en las reglas de cada comercio para que los seis usen el
   mismo criterio; si cada uno decidiera por su cuenta, el mismo artículo
   caería en partidas distintas según quién lo venda. */
const MARCA_INSTITUCIONAL =
  /\btork\b|cumberland|kimberly|\bscott\b|georgia.?pacific|\brubbermaid\b|\bbobrick\b|\bfamilia\b/;
const SENA_INSTITUCIONAL =
  /institucional|comercial|industrial|alta velocidad|\bturbo\b|secamanos|\bjumbo\b|bano publico|elec\.? ?bat|electronic|acero inoxidable|\binox\b|\bmural\b/;

function ambito(texto) {
  const t = String(texto || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (MARCA_INSTITUCIONAL.test(t) || SENA_INSTITUCIONAL.test(t)) return 'institucional';
  /* Un litro de jabón no se pone en un baño de casa. */
  const ml = t.match(/(\d[\d.]*)\s*ml\b/);
  if (ml && parseFloat(ml[1]) >= 800) return 'institucional';
  const l = t.match(/(\d[\d.]*)\s*(?:l|lt|litros?)\b/);
  if (l && parseFloat(l[1]) >= 0.8) return 'institucional';
  return 'domestico';
}

/* CÓMO SE ACCIONA LA GRIFERÍA

   Cada comercio lo decidía por su cuenta con la misma expresión suelta
   —/sensor|electronic|automatic|temporizad/— y esa expresión tiene un
   agujero: «automático» no siempre habla del grifo. Bellón vende una
   «Llave Mezcladora Lavamanos C/Desagüe Automático» por RD$ 1,225; lo
   automático ahí es el desagüe, y la llave entraba en «Mezcladora, de
   baño, con sensor» como la más barata de la partida, a una quinta parte
   de la mediana.

   La palabra la tiene que reclamar el aparato, no lo que cuelgue de él;
   así que antes de buscar los indicios se tacha el desagüe. Vive aquí, al
   lado de ambito(), por la misma razón que ambito(): si lo decide cada
   comercio, el mismo artículo cae en partidas distintas según quién lo
   venda. */
const ACCIONADO =
  /sensor|electronic|infrarroj|automatic|temporizad|timer|pressmatic|bacteria.?free/;

function activacion(texto) {
  const t = String(texto || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/desague\s+automatic\w*/g, ' ');
  return ACCIONADO.test(t) ? 'sensor' : 'manual';
}

/* QUÉ CABEZAL DE DUCHA ES, Y DE QUÉ

   Devuelve la familia y sus medidas de una vez, porque las cinco
   decisiones se toman sobre el mismo nombre y separarlas obligaría a
   cada comercio a repetirlas. Ver la nota de 'ducha-cabezal'.

   El orden importa, como siempre: «REGADERA MANUAL C / SOPORTE FIJO»
   lleva «fijo» y es de mano; «DUCHA DE EMPOTRAR REDONDO» lleva
   «redondo» y es de techo. Lo específico primero. */
function cabezalDeDucha(texto) {
  const t = String(texto || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (/electric|\d\s*tempe/.test(t)) return { familia: 'regadera-electrica', medidas: {} };
  if (/bidet?\b|higienic|chattaf/.test(t)) return { familia: 'ducha-bide', medidas: {} };
  if (/lateral/.test(t)) return { familia: 'ducha-lateral', medidas: {} };
  if (/d ?\/ ?techo|de techo|empotrar|empotrada/.test(t)) return { familia: 'ducha-techo', medidas: {} };
  /* La de mano ya tiene partida propia desde antes. */
  if (/manual|\bman\.|telefono|c ?\/? ?sopo?rte|con soporte|c ?\/ ?extension/.test(t)) {
    return { familia: 'ducha-telefono', medidas: {} };
  }

  return { familia: 'ducha-cabezal', medidas: {
    pulgadas: pulgadasDeCabezal(t),
    material: materialDeCabezal(t),
    brazo: brazoDeCabezal(t)
  } };
}

/* El tamaño del plato, en pulgadas. El comercio lo escribe «8''», «8\"»,
   «2-1/2"» y «2 1/2"», y las dos últimas son el mismo cabezal: se
   normalizan a una sola forma o la partida se parte en dos por un guion.
   HELVEX lo escribe con dos acentos agudos —«REGADERA 7´´ CHORRO FIJO»,
   «REGADERA 10´´ CHORRO FIJO ROSE GOLD»—, que no son comillas pero
   valen por ellas: sin esa marca esas tres cotizaciones, dos de ellas
   de más de RD$ 26.000, se quedaban en el montón sin medida.

   Sin marca de pulgada no se da por bueno un número suelto: «Regadera
   5 funciones» lleva un 5 que no son pulgadas, y «DUCHA S/BRAZO 722»
   lleva un modelo.

   MILÍMETROS. Cuatro fichas declaran el plato en milímetros —«300 X
   300 MM», «D.220mm», «190 MM»— y se convierten, redondeando a la
   pulgada: 300 mm son 11,8" y se publican como 12". El redondeo es una
   convención nuestra y aquí queda dicha; lo que no es convención es el
   dato, que la ficha sí lo declara. Se exige la unidad escrita, y por
   eso «TEMPESTA 210» no entra: 210 es el nombre del modelo, aunque
   GROHE lo derive del diámetro. */
function pulgadasDeCabezal(t) {
  let n = 0;

  /* Primero la pulgada, que es como lo escribe la mayoría. */
  const m = t.match(/(\d{1,2})(?:\s*[-\s]\s*(\d)\s*\/\s*(\d))?\s*(?:''|´´|"|\u201d|pulg)/);
  const ancho = t.match(/plato ancho (?:de )?(\d{1,2})\b/);
  if (m) {
    n = parseInt(m[1], 10) + (m[2] ? parseInt(m[2], 10) / parseInt(m[3], 10) : 0);
  } else if (ancho) {
    /* HELVEX tiene dos «plato ancho» y solo a una le puso las marcas:
       «REGADERA PLATO ANCHO DE 10´´ CH FIJO CR» y «REGADERA PLATO ANCHO
       7». El número suelto detrás de «plato ancho» es el plato, y la
       prueba es el precio: la de 7 queda en RD$ 7.055 junto a la otra
       de 7" en RD$ 7.147. */
    n = parseInt(ancho[1], 10);
  } else {
    /* Luego el milímetro. «300 X 300 MM» es el lado de un plato
       cuadrado y «D.220mm» el diámetro de uno redondo; van al mismo
       eje porque la forma no define el ítem. */
    const mm = t.match(/(\d{2,3})\s*(?:x\s*\d{2,3}\s*)?m ?m\b/);
    if (!mm) return '';
    n = Math.round(parseInt(mm[1], 10) / 25.4);
  }

  if (!(n >= 1.5 && n <= 24)) return '';
  const ent = Math.floor(n), fr = n - ent;
  const FRACCION = { 0.25: ' 1/4', 0.5: ' 1/2', 0.75: ' 3/4' };
  return String(ent) + (fr ? (FRACCION[fr] || '') : '');
}

function materialDeCabezal(t) {
  if (/laton|bronce/.test(t)) return 'latón';
  if (/acero inox|inoxiable|inoxidable|\bacero\b|\bsatin\b/.test(t)) return 'acero inoxidable';
  if (/zamak/.test(t)) return 'zamak';
  if (/plastic|\babs\b/.test(t)) return 'plástico';
  return '';
}

/* «Con brazo» es el cabezal más el tubo que lo separa de la pared, y a
   veces el chapetón: casi el doble que el mismo cabezal solo. Cuando el
   nombre no dice nada, no se supone —hay comercios que nunca lo
   escriben. */
function brazoDeCabezal(t) {
  if (/c ?\/ ?bra?zo|con bra?zo|y chapeton|c ?\/ ?cubre ?falta|\bbr y? ?chap/.test(t)) return 'con';
  if (/s ?\/ ?bra?zo|sin bra?zo/.test(t)) return 'sin';
  return '';
}

/* CUÁL DE LAS CUATRO BAÑERAS

   El nombre lo dice en las cuatro, y por eso la decisión vive aquí y no
   en la regla de cada comercio: seis las clasifican y los seis mandaban
   todo al mismo ítem.

   El orden importa. «Bañera Hidromasaje Cataluña» lleva las dos
   palabras y es una bañera con chorros, no un jacuzzi; el jacuzzi se
   llama jacuzzi a secas. Y lo infantil se pregunta primero de todo,
   porque una bañera infantil con chorros seguiría siendo infantil. */
function tipoDeBanera(texto) {
  const t = String(texto || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (/\bkiddy\b|infantil|\binfante\b|\bninos?\b|\bbebe\b/.test(t)) return 'banera-infantil';
  if (/hidromasaje|whirlpool|c\/? ?chorros|con chorros/.test(t)) return 'banera-hidromasaje';
  if (/\bjacuzzi\b|\bspa\b/.test(t)) return 'jacuzzi';
  return 'banera';
}

/* Y si es bañera a secas, cómo se planta. «Isla» y «freestanding» son la
   misma palabra en dos idiomas; «corner» va contra dos paredes y se
   resuelve como una empotrada. Cuando el nombre no lo dice, es empotrada:
   es lo corriente, y una exenta siempre se anuncia como tal porque es
   justo lo que se está vendiendo. */
/* DE QUÉ ESTÁ HECHA

   Lo dice el nombre en siete de doce y la ficha en ninguna. Se reconocen
   tres materiales porque son los tres que el mercado dominicano separa
   por precio, y en ese orden.

   «Stonex» entra como carga mineral y no como material aparte: es el
   nombre que Roca le da a su resina de carga mineral, y La Ibérica vende
   las dos cosas —«ONA Corner Stonex» y «Alaior Carga Mineral»— al mismo
   nivel de precio. Dejarlas separadas sería partir una partida por una
   marca comercial. */
function materialDeBanera(texto) {
  const t = String(texto || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/acero esmaltado|acero porcelanizado/.test(t)) return 'acero esmaltado';
  if (/stonex|carga mineral|solid ?surface/.test(t)) return 'carga mineral';
  if (/acrilic/.test(t)) return 'acrílica';
  if (/hierro fundido/.test(t)) return 'hierro fundido';
  if (/fibra de vidrio|fiberglass/.test(t)) return 'fibra de vidrio';
  return '';                      // la ficha no lo dice: no se inventa
}

function montajeDeBanera(texto) {
  const t = String(texto || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  /* Los valores se eligen para que encajen con la etiqueta del eje, que
     antepone «de»: sale «Bañera, de isla» y «Bañera, de empotrar», que es
     como se piden. Con «exenta» y «empotrada» salía «Bañera, de exenta». */
  return /\bisla\b|freestanding|free standing|\bexenta\b|c\/? ?patas|con patas/.test(t)
    ? 'isla' : 'empotrar';
}

/* ¿LA MEZCLADORA SOLA, O EL JUEGO COMPLETO?

   «Mezcladora de ducha» es la válvula que va en la pared. «Columna de
   ducha» es el conjunto: válvula, cabezal y teléfono. Son dos partidas
   y entre ellas hay tres veces —6.297 contra 18.845—, así que colar una
   en la otra corre la referencia de las dos.

   Se colaban por un fallo de orden: la regla probaba primero si el
   nombre decía «termostat» y mandaba a mezcladora, de modo que «SISTEMA
   D/DUCHA C/TERMOSTATO C/CABEZAL Y DUCHA D/MANO» —que es un sistema
   entero— nunca llegaba a la línea que preguntaba por «sistema». Trece
   cotizaciones de CerArte y La Ibérica, con mediana de RD$ 18.853: el
   precio exacto de la partida a la que pertenecen, que es la prueba de
   que ahí van.

   Dos maneras de delatarse: el nombre lo dice —sistema, columna, set— o
   lo enumera, trayendo a la vez el cabezal y el teléfono. Ninguna pieza
   suelta trae las dos.

   Y una trampa que hay que mirar de cerca: «S/Set de Ducha» es SIN el
   set y «C/Set de Ducha» es CON él. La misma mezcladora Manacor sale a
   RD$ 2.950 sin y a RD$ 12.500 con. Una barra que se lee como la otra
   cuesta cuatro veces. */
const DICE_JUEGO = /\bsistema\b|\bcolumna\b|\bequipo\b|\bkit\b/;
const CABEZAL = /cabezal|\bcbz\b|regadera|rainshower/;
const TELEFONO = /d ?\/ ?mano|de mano|telefono|\btel\b/;

function esJuegoDeDucha(texto) {
  const t = String(texto || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  /* Lo que viene SIN el set no es el set. Se tacha antes de mirar nada
     más, porque si no «s/set de ducha» cuenta como set. */
  const sinExtras = t.replace(/\bs ?\/ ?(set|juego|kit|accesorio\w*)/g, ' ');

  if (DICE_JUEGO.test(sinExtras)) return true;
  if (/\bc ?\/ ?(set|juego|kit) de ducha|\bcon set de ducha/.test(sinExtras)) return true;
  /* O lo enumera: trae el cabezal y el teléfono a la vez. */
  return CABEZAL.test(sinExtras) && TELEFONO.test(sinExtras);
}

const limpia = s => String(s || '').trim();

/* Construye el ítem. `medidas` trae todo lo que el comercio declaró; los
   ejes de la familia salen de ahí y entran en la clave, el resto queda
   registrado. */
function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia de baño desconocida: ' + familia);
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
    clave: claves.join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    orden: f.orden,
    nombre: f.base + (partes.length ? ', ' + partes.join(', ') : ''),
    unidad: f.unidad,
    esp: f.esp || '',
    etapa: f.etapa,
    origen: 'importado',
    alias: f.alias,
    medidas: medidas
  };
}

/* Redondeo de largos a los 5 cm, para que 90 cm y 36 pulgadas —que son
   91.4— sean la misma barra, que es lo que son en la obra. */
function aCm(valor, unidad) {
  let cm = null;
  if (unidad === 'pulg') cm = valor * 2.54;
  else if (unidad === 'mm') cm = valor / 10;
  else if (unidad === 'cm') cm = valor;
  if (cm === null || !isFinite(cm)) return null;
  return Math.round(cm / 5) * 5;
}

module.exports = { FAMILIAS, item, ambito, activacion, esJuegoDeDucha, tipoDeBanera, montajeDeBanera, materialDeBanera, cabezalDeDucha, aCm };
