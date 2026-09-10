/* =========================================================
   precios.ingsliberato.com — directorio de proveedores
   Fuente: "Directorio de Proveedores de Materiales de
   Construcción en República Dominicana — v2".

   REGLA DE ORO DEL DIRECTORIO
   ---------------------------
   Solo están los comercios a los que se les confirmó un precio: los que
   tienen cotizaciones en datos-precios.js. Los demás (74 al 09/09/2026)
   se sacaron del sitio y están en herramientas/retirados/ para seguir
   trabajándolos; vuelven en cuanto se les registre una cotización.

   Solo se publica información de contacto disponible públicamente.
   Cuando un dato no se pudo verificar, se deja vacío y se dice en la
   nota; nunca se inventa un teléfono o un correo.

   CAMPO 'canal' Y 'vendeAlPublico'
   --------------------------------
   El precio de referencia del sitio se calcula únicamente con
   proveedores donde vendeAlPublico = true. Los fabricantes de canal
   cerrado (cementeras, siderúrgica, fábricas de pintura) venden vía
   distribuidores: sus anuncios sirven como indicador de tendencia,
   no como precio de calle.

   CÓMO AGREGAR UN PROVEEDOR
   -------------------------
     p('Nombre', {
       tipo:'cadena',            // cadena | fabricante | distribuidor | especializado | mayorista
       canal:'detallista',       // fabricante | mayorista | detallista
       publico:true,             // ¿vende al público?
       cats:['MAT-02','MAT-14'], // categorías del catálogo que cubre
       zonas:['gsd'],            // gsd | cibao | este | sur | nacional
       web:'ochoa.com.do',
       tel:'809-971-8000',
       wa:'8299718000',          // solo dígitos, con el 1 del país
       email:'',
       precios:true,             // ¿publica precios o e-commerce en línea?
       nota:''
     })
   ========================================================= */

(function (global) {
  'use strict';

  var lista = [];

  function p(nombre, o) {
    lista.push({
      nombre:  nombre,
      tipo:    o.tipo || 'distribuidor',
      canal:   o.canal || 'detallista',
      publico: o.publico !== false,
      cats:    o.cats || [],
      zonas:   o.zonas || ['gsd'],
      web:     o.web || '',
      tel:     o.tel || '',
      wa:      o.wa || '',
      email:   o.email || '',
      precios: o.precios === true,
      nota:    o.nota || ''
    });
  }

  /* ---------- Cadenas y multicategoría (núcleo para RFQ) ---------- */
  p('Ferretería Ochoa (8A)', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-02','MAT-04','MAT-06','MAT-07','MAT-08','MAT-09','MAT-10','MAT-12','MAT-13','MAT-18'],
    zonas:['gsd','cibao'], web:'ochoa.com.do', tel:'809-971-8000', precios:true,
    nota:'Fundada en 1971. Sucursales en Santiago y Santo Domingo Oeste (Zona Industrial Herrera). E-commerce con precios en RD$ por producto: es la mejor fuente de precio base en línea.'
  });
  p('Ferremix (Grupo Alterra)', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-02','MAT-08','MAT-09','MAT-10','MAT-12','MAT-24','MAT-25','MAT-26','MAT-27','MAT-32','EQU-04'],
    zonas:['gsd'], web:'ferremix.com.do', wa:'18295373000', email:'soporteweb@ferremix.com.do', precios:true,
    nota:'La cadena de mayor expansión reciente. Sucursales Villa Mella (849-507-0003) y Herrera (829-539-0078). Tienda en línea con 8,984 productos y precio por SKU. Es una ferretería general: de sus 21 departamentos solo siete traen partidas de obra. Su ficha no declara si el precio lleva ITBIS.'
  });
  p('Max Ferretería', {
    tipo:'cadena', canal:'detallista',
    /* Las categorías salen de la única colección que se ha extraído. El sitio
       tiene más departamentos; se irán agregando al verificarlos. */
    cats:['MAT-02','MAT-06','MAT-09','MAT-32'],
    zonas:[], web:'maxferreteria.com', precios:true,
    nota:'Tienda en línea con precios de lista en RD$, disponibilidad por artículo y fecha de última actualización del precio en cada ficha. No declara si el precio incluye ITBIS. Ubicación de sucursales sin verificar.'
  });
  p('Ferretería Cima', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-02','MAT-04','MAT-08','MAT-09','MAT-13'],
    /* No se pudo verificar dónde están sus sucursales, así que no se le
       asigna zona: el filtro por zona la deja fuera antes que decir algo que
       no sabemos. Sus precios sí cuentan para la referencia, que depende de
       si vende al público y no de dónde está. */
    zonas:[], web:'ferreteriacima.com.do', precios:true,
    nota:'Tienda en línea con precios de lista en RD$ y disponibilidad por artículo. Su catálogo declara el suplidor o importador de cada producto, dato que casi ningún comercio publica. Ubicación de sucursales sin verificar.'
  });
  p('InnovaCentro (La Innovación)', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-02','MAT-08','MAT-09','MAT-10','MAT-12','MAT-13'],
    zonas:['nacional'], web:'innovacentro.com.do', precios:true,
    nota:'Catálogo en línea con marcas y precios. Maneja Truper, Foset, Total, Pedrollo y Tangit.'
  });
  p('La Ibérica', {
    tipo:'especializado', canal:'detallista',
    cats:['MAT-02','MAT-08','MAT-09','MAT-24','MAT-25','MAT-26','MAT-32'],
    zonas:['gsd'], web:'tienda.laiberica.com.do', precios:true,
    nota:'Tienda especializada en cerámica, porcelanato, baños, grifería y adhesivos, con tienda en línea y precios por artículo. Su web no desglosa el ITBIS. Santo Domingo.'
  });
  p('Tonos y Colores', {
    tipo:'especializado', canal:'detallista',
    cats:['MAT-12','EQU-04'],
    zonas:[], web:'tonosycolores.com', precios:true,
    nota:'Tienda de pintura en línea: Montó, Tropical, Popular, Lanco y Claudette, con el envase de cada presentación y el precio por SKU. Declara que sus precios incluyen ITBIS. Todo su catálogo se publica en oferta sobre el precio de lista. Ubicación de sucursales sin verificar.'
  });
  p('CerArte', {
    tipo:'especializado', canal:'detallista',
    cats:['MAT-02','MAT-08','MAT-09','MAT-24','MAT-25','MAT-26','MAT-27','MAT-32'],
    zonas:[], web:'cerarte.com.do', precios:true,
    nota:'Tienda especializada en cerámica, porcelanato, baños y cocinas, con tienda en línea. Es el único comercio del directorio que declara en cada ficha la unidad de venta, los metros y las piezas por caja, y que el precio publicado no lleva ITBIS. Ubicación de sucursales sin verificar.'
  });
  p('Ferretería MC', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-02','MAT-08','MAT-09','MAT-10','MAT-12'],
    zonas:['gsd'], web:'mc.com.do', precios:false, tel:'809-565-5797', email:'ferreteriamc@gmail.com',
    nota:'Mercantil del Caribe, S.A.S., av. John F. Kennedy km 8½. No publica precios en línea: cotiza por escrito, y su cotización trae el ITBIS en columna aparte. Es la única fuente del catálogo donde el impuesto es un dato y no un supuesto.'
  });

  /* ---------- Diccionarios ---------- */
  var zonas = [
    {codigo:'gsd',      nombre:'Gran Santo Domingo'},
    {codigo:'cibao',    nombre:'Santiago / Cibao'},
    {codigo:'este',     nombre:'Este (Punta Cana, La Romana)'},
    {codigo:'sur',      nombre:'Sur'},
    {codigo:'nacional', nombre:'Cobertura nacional'}
  ];

  var tipos = [
    {codigo:'cadena',       nombre:'Cadena ferretera'},
    {codigo:'fabricante',   nombre:'Fabricante / productor'},
    {codigo:'mayorista',    nombre:'Mayorista'},
    {codigo:'distribuidor', nombre:'Distribuidor'},
    {codigo:'especializado',nombre:'Especializado'}
  ];

  /* Canal real de compra por rubro (del documento de referencia). */
  var canales = [
    {rubro:'Cemento en funda',            canal:'Ferreterías y mayoristas (red Construrama de Cemex)', fabricante:'Indicador de tendencia (anuncios de aumento)'},
    {rubro:'Varilla y acero',             canal:'Ferreterías, cadenas y mayoristas',                   fabricante:'Indicador de tendencia; portal B2B solo canal'},
    {rubro:'Pintura',                     canal:'Cadenas ferreteras y distribuidores de marca',        fabricante:'Indicador de tendencia'},
    {rubro:'Tuberías PVC / CPVC',         canal:'Ferreterías y mayoristas',                            fabricante:'Vía distribución'},
    {rubro:'Hormigón premezclado',        canal:'Directo con la concretera (despacho a obra)',         fabricante:'El fabricante ES el canal'},
    {rubro:'Bloques y prefabricados',     canal:'Directo con la bloquera',                             fabricante:'El fabricante ES el canal'},
    {rubro:'Agregados',                   canal:'Directo con cantera o acopio (por viaje)',            fabricante:'El fabricante ES el canal'},
    {rubro:'Aluzinc y techos a medida',   canal:'Directo con la fábrica',                              fabricante:'El fabricante ES el canal'},
    {rubro:'Puertas y ventanas a medida', canal:'Directo con el fabricante',                           fabricante:'El fabricante ES el canal'}
  ];

  global.PROVEEDORES = {
    lista: lista,
    zonas: zonas,
    tipos: tipos,
    canales: canales,
    meta: {
      fuente: 'Directorio de Proveedores de Materiales de Construcción en República Dominicana — v2',
      aviso: 'Solo se publica información de contacto disponible públicamente. Cuando un dato no pudo verificarse se indica de forma explícita en lugar de inventarlo. Los datos de contacto y la estructura comercial cambian: confirmar antes de cotizar.'
    }
  };

})(window);
