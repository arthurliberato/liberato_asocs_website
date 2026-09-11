'use strict';
/* =========================================================
   gama-comercios.js — la gama que declara una persona

   SE EDITA A MANO, al contrario que gama-marcas.js.

   La gama la decide la marca, y eso está medido: ver
   herramientas/medir-gama.js. Pero la marca solo alcanza al 60% de
   las cotizaciones, porque seis comercios no la publican en su
   ficha. Donde no llega la medición y sí llega el criterio de
   alguien que conoce el mercado, se declara aquí.

   CÓMO SE NOMBRA EL PRODUCTO

   La llave es el NOMBRE DE LA PARTIDA, no la familia de la tabla de
   especificación. Se probó primero con la familia y se quedaban
   fuera trece de veintinueve adhesivos: hay reglas que construyen el
   ítem sin declararla y artículos que entran por mapeo directo, sin
   pasar por regla ninguna. El nombre existe siempre y por los dos
   caminos, y además es lo que se lee al revisar: quien escriba una
   entrada aquí mira la misma columna del Excel que la comprobará.

   QUÉ PIDE UNA ENTRADA

   Un producto, una gama por defecto y los comercios que se salen de
   ella. No vale declarar un comercio entero: casi ninguno vende de
   una sola gama —Ochoa despacha TILBY a RD$ 2.702 y HELVEX a
   RD$ 11.147— y decir que un comercio «es caro» sin más es la clase
   de atajo que este catálogo evita.

   Y pide el número que la sostiene, escrito al lado. No porque haga
   falta para que funcione, sino porque dentro de seis meses alguien
   —quizá quien la escribió— va a querer saber si sigue siendo
   verdad.

   DECLARAR NO ES MEDIR

   El resto del catálogo deja la gama en blanco donde no se pudo
   medir; aquí se rellena porque alguien afirma que en este producto
   lo normal es esto. Si mañana entra una marca de gama alta que
   nadie declaró, saldrá como estándar hasta que alguien lo note. Ese
   es el precio de declarar, y se paga a sabiendas.

   QUIÉN GANA

   Esta tabla, cuando aplica. Es más estrecha que la de marcas: allí
   se mide la mediana de una marca en todo el catálogo, y aquí se
   habla de un comercio en un producto. Lo estrecho manda sobre lo
   ancho.
   ========================================================= */

const PRODUCTOS = [
  {
    /* La pega de cerámica de obra —Pegacol, Pegafull, Pegatod, Weco— es
       producto corriente y se compra por precio. Lo que se sale de ahí
       son los adhesivos de importación. */
    nombre: /^(adhesivo cementicio|adhesivo en pasta|pegamento de cer[aá]mica)/i,
    porDefecto: 'estandar',
    comercios: {
      /* Los de La Ibérica son MAPEI —Ultraflex, Granirapid— y Pegafix,
         no la pega de obra corriente. Se ve dentro de la misma partida:
         en «Adhesivo cementicio C2 gris, funda 22.7 kg» su Ultraflex va
         a RD$ 1.829 contra RD$ 662 y RD$ 691 de Ochoa, 2,6 veces. Y por
         kilo, su Pegafix C1 sale a RD$ 35,4 contra los RD$ 13,7 de los
         demás: otra vez 2,6. Sus nueve cotizaciones van de RD$ 885 a
         RD$ 4.785 cuando ningún otro comercio pasa de RD$ 1.939. */
      'La Ibérica': 'alta'
    }
  }
];

function gamaDeclarada(comercio, nombreItem) {
  if (!nombreItem) return '';
  for (let i = 0; i < PRODUCTOS.length; i++) {
    const p = PRODUCTOS[i];
    if (!p.nombre.test(nombreItem)) continue;
    return (p.comercios && p.comercios[comercio]) || p.porDefecto || '';
  }
  return '';
}

module.exports = { PRODUCTOS, gamaDeclarada };
