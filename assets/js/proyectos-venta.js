/* =========================================================
   Ingenieros Liberato & Asociados — proyectos en venta

   Los inmuebles en venta de obras en curso. Es otra cosa que el
   portafolio de main.js: aquello cuenta obra ejecutada, esto es una
   oferta comercial y lleva precio, disponibilidad y fecha de entrega.

   REGLA DE LA CASA
   Aquí no se escribe nada que no esté confirmado. Un metraje, un
   precio o una fecha de entrega inventados no son un adorno: son una
   oferta de venta de un inmueble. Lo que no se sabe va en null, y la
   ficha lo dice —«pendiente de confirmar»— en vez de rellenarlo.

   PARA AGREGAR UN PROYECTO
   Basta con añadir un objeto a PROYECTOS_VENTA y correr
   `node herramientas/generar-proyectos-venta.js`, que escribe el
   listado y una página por proyecto.

     slug           el de la URL: proyecto-<slug>.html
     nombre         el comercial. Si aún no lo hay, un descriptivo y
                    nombreProvisional: true, que lo marca en la ficha
     ubicacion      {sector, municipio, provincia}. sector puede ir null
     estado         'preventa' | 'en-construccion' | 'terminado'
     avance         porcentaje de obra, o null
     entrega        'AAAA-MM' estimada, o null
     niveles        número de niveles, o null
     unidades       total de unidades, o null
     tipologias     una por tipo de apartamento:
                      {habitaciones, banos, m2, desde, disponibles}
                    todo salvo `habitaciones` admite null
     desde          {moneda:'USD'|'RD$', monto} o null si no se publica
     politicaPrecio 'desde'        publica «Desde US$ X» por tipología
                    'a-solicitud'  no publica cifra; la pide por contacto
     amenidades     lista de textos, o []
     financiamiento texto, o null
   ========================================================= */
(function (global) {
  'use strict';

  var PROYECTOS_VENTA = [
    {
      slug: 'residencial-santo-domingo-norte',
      nombre: 'Residencial en Santo Domingo Norte',
      nombreProvisional: true,
      ubicacion: { sector: null, municipio: 'Santo Domingo Norte', provincia: 'Santo Domingo' },
      estado: 'en-construccion',
      avance: null,
      entrega: null,
      niveles: 4,
      unidades: 8,
      /* Cuatro niveles, dos apartamentos por nivel: uno de dos
         habitaciones y otro de tres. Es lo confirmado; el metraje, el
         precio y la disponibilidad todavía no. */
      tipologias: [
        { habitaciones: 2, banos: null, m2: null, desde: null, disponibles: null },
        { habitaciones: 3, banos: null, m2: null, desde: null, disponibles: null }
      ],
      politicaPrecio: 'a-solicitud',
      amenidades: [],
      financiamiento: null
    }
  ];

  global.PROYECTOS_VENTA = PROYECTOS_VENTA;

})(typeof window !== 'undefined' ? window : global);

if (typeof module !== 'undefined') module.exports = { PROYECTOS_VENTA: (typeof window !== 'undefined' ? window : global).PROYECTOS_VENTA };
