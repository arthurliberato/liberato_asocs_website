'use strict';
/* =========================================================
   especificacion-electricos.js — el ítem es la especificación

   468 artículos en una sola colección, y los nombres son los
   más abreviados de todo el catálogo: «INT SIMPLE BOTON A. C/LP
   BLANCO 36984». Aquí más que en ningún otro rubro hay que
   decidir qué de ese ruido es especificación y qué es marca,
   color y código interno.

   QUÉ PARTE UN BOMBILLO Y QUÉ NO
   ------------------------------
   No se adivinó: se midió sobre los 69 bombillos del catálogo.

     eje                ítems   con rango > 3x
     potencia sola        26          7
     potencia + color     45          4
     potencia + formato   47          0

   El formato —A60, ST19, G9, MR16— separa productos que cuestan
   muy distinto; la temperatura de color, que uno esperaría que
   pesara, no mueve el precio: el mismo bombillo sale en 30K y en
   65K al mismo número. Así que el formato entra en la clave y la
   temperatura se registra como medida.

   Cuando el comercio no declara el formato, el ítem se queda sin
   él y es otro ítem. No es lo mismo «bombillo LED de 15 W» que
   «bombillo LED A60 de 15 W»: el segundo dice más. Juntarlos
   sería afirmar que son el mismo, y eso no lo sabemos.
   ========================================================= */

const FAMILIAS = {
  /* ---- Iluminación ---- */
  /* El formato —A60, ST19, G9— se midió y era lo que más partía el catálogo,
     pero también lo que más cruces impedía: solo 37 de 69 fichas lo declaran,
     y un comercio que no lo escribe nunca casaba con uno que sí. Un bombillo
     LED de 15 W es un bombillo LED de 15 W: misma función, mismo diseño,
     misma dimensión. El formato queda registrado como medida. */
  bombillo: {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 10,
    ejes: ['tecnologia', 'potencia_w'],
    nombre: m => 'Bombillo ' + m.tecnologia + ' de ' + m.potencia_w + ' W',
    esp: '',
    alias: 'bombillo, bombilla, foco, lámpara, LED'
  },
  'panel-led': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 20,
    ejes: ['montaje', 'forma', 'potencia_w'],
    nombre: m => 'Panel LED ' + m.montaje + ' ' + m.forma + ' de ' + m.potencia_w + ' W',
    esp: '',
    alias: 'panel LED, ojo de buey, plafón, luminaria, empotrado'
  },
  'reflector-led': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 30,
    ejes: ['potencia_w'], opcionales: ['alimentacion'],
    nombre: m => 'Reflector LED de ' + m.potencia_w + ' W' +
                 (m.alimentacion === 'solar' ? ', solar' : ''),
    esp: '',
    alias: 'reflector, proyector, foco de exterior'
  },
  'tubo-led': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 40,
    ejes: ['potencia_w'], opcionales: ['largo_pies'],
    nombre: m => 'Tubo LED de ' + m.potencia_w + ' W' + (m.largo_pies ? ', ' + m.largo_pies + ' pies' : ''),
    esp: '',
    alias: 'tubo LED, fluorescente, T8'
  },
  roseta: {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 50,
    ejes: ['tipo'],
    nombre: m => (m.tipo === 'roseta' ? 'Roseta de techo' : m.tipo === 'zocalo' ? 'Zócalo para bombillo'
                : m.tipo === 'fotocelda' ? 'Fotocelda' : 'Portalámparas'),
    esp: '',
    alias: 'roseta, zócalo, socket, portalámparas, fotocelda'
  },

  /* ---- Salidas ---- */
  interruptor: {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 100,
    ejes: ['tipo'],
    nombre: m => 'Interruptor ' + m.tipo,
    esp: '',
    alias: 'interruptor, switch, apagador, breaker de pared'
  },
  tomacorriente: {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 110,
    ejes: ['tipo'],
    nombre: m => 'Tomacorriente ' + m.tipo,
    esp: '',
    alias: 'tomacorriente, toma, enchufe de pared, receptáculo'
  },
  'placa-electrica': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 120,
    ejes: ['tipo'],
    nombre: m => m.tipo,
    /* La placa modular se vende sola; la de huecos y la tapa ciega no engañan. */
    esp: m => /módulos/.test(m.tipo) ? 'Solo la placa · los módulos van aparte' : '',
    alias: 'placa, tapa, plaquita, tapa ciega'
  },
  'enchufe-adaptador': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 130,
    ejes: ['tipo'],
    nombre: m => m.tipo,
    esp: '',
    alias: 'enchufe, clavija, adaptador, espigo'
  },

  /* ---- Protección ---- */
  breaker: {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 200,
    ejes: ['polos', 'amperaje'], opcionales: ['formato'],
    nombre: m => 'Breaker enchufable ' + m.polos + 'P de ' + m.amperaje + ' A' +
                 (m.formato === 'fino' ? ', formato fino' : ''),
    esp: m => m.formato === 'fino' ? 'Ocupa medio espacio · no es intercambiable con el estándar' : '',
    alias: 'breaker, interruptor termomagnético, brekaer'
  },
  /* «CAJA DE BREAKER» Y «PANEL DE BREAKER» SON LA MISMA COSA

     La duda es razonable porque el catálogo publicaba las dos, y la
     prueba de que sobra una está en el número de parte: el TLM1212CCU
     de GE aparece en Bellón como «Caja Breaker 1F 14-24 Circuitos 240V
     125A» a RD$ 6.220 y en Max Ferretería como «PANEL BREAKER GE 14A24
     125AMP» a RD$ 6.160. El TLM812FCUD, igual: RD$ 4.715 y RD$ 4.755.
     Mismo artículo, dos palabras, un 1% de diferencia.

     Lo que las separaba no era el producto sino la lectura: «14A24» es
     como GE escribe «de 14 a 24 circuitos» y no se leía, así que ese
     panel caía en un ítem aparte definido por amperios. Una sola
     familia, y la palabra del comercio da igual.

     EL EJE QUE FALTABA ES LA FASE, no el amperaje. Entre los 42
     circuitos, el monofásico de 225 A cuesta RD$ 11.251 y los
     trifásicos de 200 y 225 A van de RD$ 16.662 a RD$ 22.869. El
     amperaje, en cambio, no separa nada dentro de un mismo tamaño: los
     cinco paneles de 8 espacios son todos de 125 A y van de RD$ 1.145 a
     RD$ 6.205, que es marca y caja, no amperios. Por eso el amperaje no
     entra: metería un eje que no manda y partiría en dos las parejas
     que acabamos de demostrar iguales, porque Max lo declara en un
     panel y no en el otro.

     El trifásico se nombra y el monofásico no, como el «formato fino»
     del breaker: lo corriente va a secas y lo que no se espera se dice. */
  'caja-breaker': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 210,
    ejes: ['espacios'], opcionales: ['fases'],
    nombre: m => 'Panel de breakers' + (m.fases === '3F' ? ' trifásico' : '') +
                 ' de ' + m.espacios + ' espacio' + (Number(m.espacios) === 1 ? '' : 's'),
    esp: 'Solo la caja · los breakers van aparte',
    alias: 'caja de breakers, caja de breaker, panel de breaker, panel eléctrico, tablero'
  },
  'switch-doble-tiro': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 220,
    ejes: ['polos', 'amperaje'],
    nombre: m => 'Switch de doble tiro ' + m.polos + 'P de ' + m.amperaje + ' A',
    esp: '',
    alias: 'switch de doble tiro, transferencia, cuchilla'
  },
  fusible: {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 230,
    ejes: ['amperaje'],
    nombre: m => 'Fusible de ' + m.amperaje + ' A',
    esp: '',
    alias: 'fusible, fisible'
  },
  'protector-voltaje': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 240,
    ejes: ['tipo'],
    nombre: m => m.tipo,
    esp: '',
    alias: 'protector de voltaje, regulador, estabilizador, supresor'
  },
  'luminaria-empotrada': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 25,
    ejes: ['tipo', 'forma'],
    nombre: m => 'Luminaria empotrada ' + m.tipo + ' ' + m.forma,
    esp: 'Sin bombillo · se compra aparte',
    alias: 'lámpara empotrada, dirigible, ojo de buey sin bombillo'
  },
  'lampara-emergencia': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 26,
    ejes: [],
    nombre: 'Lámpara de emergencia recargable',
    esp: '',
    alias: 'lámpara de emergencia, luz de emergencia, recargable'
  },

  /* ---- Canalización ---- */
  'tubo-electrico': {
    cat: 'MAT-10', unidad: 'tubo', etapa: 'instalaciones', orden: 300,
    ejes: ['material', 'medida', 'largo_pies'],
    nombre: m => 'Tubo eléctrico ' + m.material + ' ' + m.medida + ' x ' + m.largo_pies + ' pies',
    esp: '',
    alias: 'tubo eléctrico, EMT, conduit, tubería'
  },
  'tubo-flexible': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 310,
    ejes: ['material', 'medida'],
    nombre: m => 'Tubería flexible ' + m.material + ' ' + m.medida,
    esp: 'La ficha no declara el largo del rollo',
    alias: 'liquid tight, BX, flexible, corrugado'
  },
  canaleta: {
    cat: 'MAT-10', unidad: 'tramo', etapa: 'instalaciones', orden: 320,
    ejes: ['medida'],
    nombre: m => 'Canaleta plástica ' + m.medida,
    esp: '',
    alias: 'canaleta, moldura, ducto plástico'
  },
  'caja-electrica': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 330,
    ejes: ['material', 'forma'], opcionales: ['medida'],
    nombre: m => 'Caja eléctrica ' + m.forma + ' de ' + m.material +
                 (m.medida ? ' ' + m.medida : ''),
    esp: '',
    alias: 'caja eléctrica, caja de salida, octagonal, rectangular'
  },
  'abrazadera-emt': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 340,
    ejes: ['medida'], opcionales: ['huecos'],
    nombre: m => 'Abrazadera para tubo eléctrico ' + m.medida +
                 (m.huecos ? ', ' + m.huecos + ' huecos' : ''),
    esp: '',
    alias: 'abrazadera, grapa de tubo, clamp'
  },
  'abrazadera-plastica': {
    cat: 'MAT-10', unidad: 'paquete', etapa: 'instalaciones', orden: 350,
    ejes: ['largo_pulg'],
    nombre: m => 'Abrazadera plástica de ' + m.largo_pulg + '"',
    esp: 'La ficha no declara cuántas trae el paquete',
    alias: 'abrazadera plástica, tie wrap, amarre, cincho'
  },
  'cinta-aislante': {
    cat: 'MAT-10', unidad: 'rollo', etapa: 'instalaciones', orden: 360,
    ejes: ['medida'],
    nombre: m => 'Cinta aislante ' + m.medida,
    esp: '',
    alias: 'cinta aislante, tape, cinta eléctrica'
  },

  /* ---- Cable ----
     La unidad estuvo abierta hasta que una cotización formal la declaró: el
     alambre se factura POR PIE. El catálogo lo lleva por rollo de 100 pies,
     que es como se compra en obra, y la nota de cada cotización dice de dónde
     sale la conversión. */
  'cable-thhn': {
    cat: 'MAT-10', unidad: 'rollo', etapa: 'instalaciones', orden: 380,
    ejes: ['calibre'],
    nombre: m => 'Cable THHN #' + m.calibre + ', rollo 100 pies',
    esp: 'Cobre · 600 V',
    alias: 'cable THHN, alambre, conductor, cobre'
  },
  'cable-goma': {
    cat: 'MAT-10', unidad: 'rollo', etapa: 'instalaciones', orden: 385,
    ejes: ['calibre', 'conductores'],
    nombre: m => 'Cable de goma ' + m.calibre + ', ' + m.conductores + ' conductores, rollo 100 pies',
    esp: '',
    alias: 'cable de goma, SO, cable flexible, encauchetado'
  },
  'conexion-conduit': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 345,
    ejes: ['tipo', 'medida'],
    nombre: m => (m.tipo === 'codo' ? 'Codo' : m.tipo) + ' conduit de PVC ' + m.medida,
    esp: '',
    alias: 'codo conduit, conduit, canalización eléctrica'
  },

  /* ---- Extensiones ---- */
  'extension-electrica': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 400,
    ejes: ['largo_pies'],
    nombre: m => 'Extensión eléctrica de ' + m.largo_pies + ' pies',
    esp: 'Casi ninguna ficha declara el calibre · ahí está la diferencia',
    alias: 'extensión, alargue, cable de extensión'
  },
  regleta: {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 410,
    ejes: ['salidas'], opcionales: ['supresor'],
    nombre: m => 'Regleta de ' + m.salidas + ' salidas' +
                 (m.supresor === 'si' ? ' con supresor de picos' : ''),
    /* «si» solo cuando la ficha lo dice; sin él no se sabe, y el precio lo delata. */
    esp: m => m.supresor === 'si' ? '' : 'La ficha no declara si trae supresor de picos',
    alias: 'regleta, multitoma, power strip, supresor'
  },

  /* ---- Control ---- */
  'timbre-sensor': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 500,
    ejes: ['tipo'],
    nombre: m => m.tipo,
    esp: '',
    alias: 'timbre, sensor de movimiento, temporizador, fotocelda'
  }
};

const limpia = s => (s === 0 ? '0' : String(s === undefined || s === null ? '' : s).trim());

function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia eléctrica desconocida: ' + familia);
  medidas = medidas || {};

  const claves = [familia];
  for (let i = 0; i < f.ejes.length; i++) {
    const v = limpia(medidas[f.ejes[i]]);
    if (!v) return null;                       // sin el eje no hay ítem
    claves.push(f.ejes[i] + '-' + v);
  }
  /* Los ejes opcionales sí entran en la clave cuando el comercio los declara:
     no es lo mismo un bombillo LED de 15 W que uno A60 de 15 W. El segundo
     dice más, y juntarlos sería afirmar que son el mismo. */
  (f.opcionales || []).forEach(eje => {
    const v = limpia(medidas[eje]);
    if (v) claves.push(eje + '-' + v);
  });

  return {
    cat: f.cat,
    familia: familia,
    clave: claves.join('-').toLowerCase()
             .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
             .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
             .replace(/"/g, 'pulg').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
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

/* Especificaciones que el catálogo ya tenía escritas a mano. */
const YA_EXISTE = {
  'tubo-electrico-material-emt-medida-1-2pulg-largo-pies-10': 'MAT-10-004',
  'tubo-electrico-material-pvc-medida-1-2pulg-largo-pies-10': 'MAT-10-005',
  'interruptor-tipo-sencillo': 'MAT-10-008',
  'tomacorriente-tipo-doble-polarizado': 'MAT-10-007',
  'breaker-polos-1-amperaje-20': 'MAT-10-009'
};

module.exports = { FAMILIAS, item, YA_EXISTE };
