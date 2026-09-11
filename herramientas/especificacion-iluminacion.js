'use strict';
/* =========================================================
   especificacion-iluminacion.js — la luz, funcional y decorativa

   Son dos cosas distintas y hay que decirlo de entrada, porque
   se compran de manera distinta y por eso el ítem se define
   distinto.

   LA FUNCIONAL SE COMPRA POR ESPECIFICACIÓN
   El ojo de buey, la cinta, la fuente, la campana: se piden por
   potencia, por medida y por grado de protección, igual que un
   breaker por amperaje. Esas familias viven aquí con sus ejes y
   se comparan pieza contra pieza.

   LA DECORATIVA SE COMPRA POR DISEÑO
   Y eso no es una opinión: está medido. De las 952 lámparas
   decorativas de Mundo LED, solo el 1% declara cuántas luces
   lleva, el 20% la potencia y el 36% el zócalo. No hay eje. No
   es que el comercio sea descuidado: es que nadie elige una
   lámpara de comedor por sus vatios. La elige por cómo se ve.

   Es el mismo caso que los accesorios de baño, donde el
   catálogo ya decidió que un toallero suelto «se compra por
   diseño, no por especificación».

   ENTONCES, ¿QUÉ SE PUBLICA?
   El rango, que es lo que un presupuesto necesita de verdad.
   Cuando alguien cubica una vivienda no escribe «lámpara
   modelo DI-378-BK»: escribe una partida de iluminación
   decorativa y le pone un monto por punto. Lo que le hace falta
   es saber cuánto cuesta una lámpara de techo en este mercado.

   Y el mercado contesta con una distribución sorprendentemente
   ordenada. Las 647 lámparas de techo van de RD$ 885 a
   RD$ 125,000 y NO tienen un solo salto mayor de 2.5x entre una
   y la siguiente; las de pared, 1.3x; las de mesa, 1.4x. Es una
   escalera continua, no un revoltijo. La mediana —RD$ 6,000 en
   techo, RD$ 2,600 en pared— es un número que se puede llevar a
   un presupuesto.

   Por eso el ítem decorativo lleva un solo eje, el montaje, y
   por eso su ficha dice en voz alta que se presupuesta por
   rango. Prometer más sería inventar una precisión que el
   producto no tiene.
   ========================================================= */

const FAMILIAS = {
  /* ---- Decorativa: el montaje es todo lo que hay ---- */
  'lampara-decorativa': {
    cat: 'MAT-33', unidad: 'unidad', etapa: 'terminacion', orden: 10,
    ejes: ['montaje'],
    nombre: m => 'Lámpara decorativa ' + ETIQUETA_MONTAJE[m.montaje],
    esp: 'Se presupuesta por rango: la pieza se elige por diseño y el catálogo no la compara modelo a modelo',
    alias: 'lámpara, luminaria decorativa, colgante, aplique, plafón, iluminación de interiores'
  },

  /* ---- Funcional: aquí sí hay especificación ---- */
  'ojo-de-buey': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 55,
    ejes: ['tipo', 'potencia_w'],
    nombre: m => 'Ojo de buey ' + m.tipo + ' de ' + m.potencia_w + ' W',
    esp: '',
    alias: 'ojo de buey, downlight, empotrado, spot'
  },
  'base-ojo-de-buey': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 56,
    ejes: ['forma', 'medida_pulg'],
    nombre: m => 'Base para ojo de buey ' + m.forma + ' de ' + m.medida_pulg + '"',
    esp: 'Va sin el módulo de luz',
    alias: 'base de ojo de buey, aro, marco de empotrar'
  },
  'cinta-led': {
    cat: 'MAT-10', unidad: 'rollo', etapa: 'instalaciones', orden: 57,
    ejes: ['tipo', 'metros'],
    nombre: m => 'Cinta LED ' + m.tipo + ', rollo de ' + m.metros + ' m',
    esp: '',
    alias: 'cinta LED, tira LED, manguera LED'
  },
  'perfil-led': {
    cat: 'MAT-10', unidad: 'tramo', etapa: 'instalaciones', orden: 58,
    ejes: ['montaje', 'largo_m'],
    nombre: m => 'Perfil de aluminio para cinta LED, ' + m.montaje + ', ' + m.largo_m + ' m',
    esp: '',
    alias: 'perfil de aluminio, canal LED, difusor'
  },
  'fuente-led': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 59,
    ejes: ['potencia_w'],
    nombre: m => 'Fuente de poder para LED de ' + m.potencia_w + ' W',
    esp: '',
    alias: 'fuente, driver, transformador LED, power supply'
  },
  /* LA CAMPANA, Y LO QUE NO LO ES

     «Campana LED industrial de 100 W» eran cinco cotizaciones de RD$
     1.500 a RD$ 14.500, casi diez veces, y dentro había tres cosas
     distintas y un eje sin nombrar.

     EL EJE ES EL DRIVER. La campana sin driver es la carcasa con el
     LED y nada más: la fuente se compra aparte y el catálogo ya la
     tiene como partida propia. A 100 W, sin driver RD$ 1.500 y con
     driver RD$ 3.700; a 200 W, sin driver RD$ 2.500 cuando la de 150
     con driver cuesta RD$ 6.365. Se nombra la que no lo trae, que es
     la que no se espera.

     LO QUE NO ES CAMPANA: la de selector de vatios no es de 100 W ni
     de 150 ni de 200 sino las tres, y meterla en una de ellas era
     elegir por el comercio; y la canopy es la luminaria plana de
     marquesina o gasolinera, no la campana de nave. */
  'campana-led': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 60,
    ejes: ['potencia_w'], opcionales: ['driver'],
    nombre: m => 'Campana LED industrial de ' + m.potencia_w + ' W' +
                 (m.driver === 'sin' ? ', sin driver' : ''),
    esp: m => m.driver === 'sin'
      ? 'Para nave, taller o techo alto · la fuente va aparte'
      : 'Para nave, taller o techo alto',
    alias: 'campana, high bay, luminaria industrial'
  },
  'campana-led-selector': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 61,
    ejes: [],
    nombre: 'Campana LED industrial con selector de potencia',
    esp: 'La potencia se elige en el equipo · no es una partida de vatios fijos',
    alias: 'campana selector de watts, high bay ajustable'
  },
  'luminaria-canopy': {
    cat: 'MAT-10', unidad: 'unidad', etapa: 'instalaciones', orden: 62,
    ejes: ['potencia_w'],
    nombre: m => 'Luminaria LED canopy de ' + m.potencia_w + ' W',
    esp: 'Plafón plano de marquesina o estación de servicio',
    alias: 'canopy, luminaria de marquesina, gasolinera'
  }
};

/* El colgante entra en «de techo» a propósito. Una tienda lo llama plafón,
   otra colgante y una tercera «pendant»; separarlos por la palabra que use
   cada una dejaría a Mundo LED y a Luminatti sin un solo ítem en común, que
   es justo lo que hace falta comparar: el mercado local contra el importado
   de diseño. */
const ETIQUETA_MONTAJE = {
  techo: 'de techo',
  pared: 'de pared',
  mesa: 'de mesa',
  pie: 'de pie'
};

const limpia = s => (s === 0 ? '0' : String(s === undefined || s === null ? '' : s).trim());

function item(familia, medidas) {
  const f = FAMILIAS[familia];
  if (!f) throw new Error('familia de iluminación desconocida: ' + familia);
  medidas = medidas || {};
  const claves = [familia];
  for (let i = 0; i < f.ejes.length; i++) {
    const v = limpia(medidas[f.ejes[i]]);
    if (!v) return null;
    claves.push(f.ejes[i] + '-' + v);
  }
  /* Los ejes opcionales entran en la clave solo cuando el comercio los
     declara: una campana que dice «sin driver» no es la misma que una
     que no dice nada, y juntarlas sería afirmar que sí. */
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

module.exports = { FAMILIAS, item, ETIQUETA_MONTAJE };
