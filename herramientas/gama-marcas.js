'use strict';
/* =========================================================
   gama-marcas.js — GENERADO. No se edita a mano.

     node herramientas/medir-gama.js --escribir

   De qué gama es cada marca, medido sobre el registro entero:
   cada cotización como múltiplo de la mediana de su partida, y
   la mediana de esos múltiplos por marca. El método, los
   umbrales y por qué los cortes son una convención y no una
   frontera, en la cabecera de medir-gama.js.

   Medido el 2026-09-11 sobre 9424 cotizaciones.
   ========================================================= */

var GAMA_MARCAS = {
  "SPC": 'economica',   /* x0.18 · 22 cotizaciones */
  "IKELITE": 'economica',   /* x0.28 · 75 cotizaciones */
  "AQUINA": 'economica',   /* x0.33 · 21 cotizaciones */
  "HOME DELIGHT": 'economica',   /* x0.34 · 81 cotizaciones */
  "HOME DECOR": 'economica',   /* x0.34 · 17 cotizaciones */
  "Foset": 'economica',   /* x0.53 · 168 cotizaciones */
  "AQUASPA": 'economica',   /* x0.57 · 99 cotizaciones */
  "770 LIGHTS": 'economica',   /* x0.59 · 74 cotizaciones */
  "TILBY-GR": 'economica',   /* x0.63 · 150 cotizaciones */
  "SOHO LIGHTS": 'economica',   /* x0.63 · 15 cotizaciones */
  "ULTRA": 'economica',   /* x0.71 · 74 cotizaciones */
  "EMBRAMACO": 'estandar',   /* x0.77 · 19 cotizaciones */
  "COCO": 'estandar',   /* x0.84 · 42 cotizaciones */
  "POINTER": 'estandar',   /* x0.85 · 15 cotizaciones */
  "GTSHOWER": 'estandar',   /* x0.88 · 27 cotizaciones */
  "PORCELAMIKA PERÚ": 'estandar',   /* x0.89 · 15 cotizaciones */
  "INEX": 'estandar',   /* x0.89 · 115 cotizaciones */
  "CATO": 'estandar',   /* x0.90 · 90 cotizaciones */
  "Truper": 'estandar',   /* x0.92 · 35 cotizaciones */
  "HALCON": 'estandar',   /* x0.93 · 40 cotizaciones */
  "CEDASA": 'estandar',   /* x0.93 · 30 cotizaciones */
  "ATRIUM": 'estandar',   /* x0.98 · 25 cotizaciones */
  "BALDOCER": 'estandar',   /* x0.99 · 35 cotizaciones */
  "HISPANIA": 'estandar',   /* x0.99 · 42 cotizaciones */
  "PAMESA": 'estandar',   /* x1.00 · 131 cotizaciones */
  "UNDEFASA": 'estandar',   /* x1.00 · 190 cotizaciones */
  "PORTOBELLO": 'estandar',   /* x1.00 · 50 cotizaciones */
  "EXAGRES": 'estandar',   /* x1.00 · 23 cotizaciones */
  "PRISSMACER": 'estandar',   /* x1.01 · 24 cotizaciones */
  "AQUALIA": 'estandar',   /* x1.01 · 279 cotizaciones */
  "SALONI": 'estandar',   /* x1.05 · 205 cotizaciones */
  "TOGAMA": 'estandar',   /* x1.10 · 42 cotizaciones */
  "ARGENTA": 'estandar',   /* x1.12 · 76 cotizaciones */
  "VIVES AZULEJOS Y GRES": 'estandar',   /* x1.22 · 21 cotizaciones */
  "AML": 'estandar',   /* x1.26 · 66 cotizaciones */
  "HELVEX": 'alta',   /* x1.94 · 168 cotizaciones */
  "TOTO": 'alta',   /* x2.05 · 19 cotizaciones */
  "NOKEN": 'alta',   /* x2.55 · 29 cotizaciones */
  "GROHE": 'alta',   /* x2.62 · 104 cotizaciones */
  "DURAVIT": 'alta',   /* x2.72 · 15 cotizaciones */
  "Carabelatienda": 'alta',   /* x3.06 · 21 cotizaciones */
  "Vigo Lighting Group": 'alta',   /* x3.10 · 31 cotizaciones */
  "RAMÓN SOLER": 'alta',   /* x3.27 · 36 cotizaciones */
  "SALGAR": 'alta',   /* x3.68 · 15 cotizaciones */
  "GESSI SPA": 'premium',   /* x6.12 · 49 cotizaciones */
  "IB RUBINETTERIE": 'premium'   /* x10.22 · 30 cotizaciones */
};

if (typeof module !== 'undefined') module.exports = GAMA_MARCAS;
if (typeof window !== 'undefined') window.GAMA_MARCAS = GAMA_MARCAS;
