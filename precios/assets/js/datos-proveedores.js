/* =========================================================
   precios.ingsliberato.com — directorio de proveedores
   Fuente: "Directorio de Proveedores de Materiales de
   Construcción en República Dominicana — v2".

   REGLA DE ORO DEL DIRECTORIO
   ---------------------------
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
    cats:['MAT-02','MAT-04','MAT-06','MAT-07','MAT-08','MAT-09','MAT-10','MAT-11','MAT-12','MAT-13','MAT-14','MAT-15','MAT-18'],
    zonas:['gsd','cibao'], web:'ochoa.com.do', tel:'809-971-8000', precios:true,
    nota:'Fundada en 1971. Sucursales en Santiago y Santo Domingo Oeste (Zona Industrial Herrera). E-commerce con precios en RD$ por producto: es la mejor fuente de precio base en línea.'
  });
  p('Ferremix (Grupo Alterra)', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-02','MAT-04','MAT-06','MAT-08','MAT-09','MAT-10','MAT-12','MAT-14','MAT-17'],
    zonas:['gsd'], web:'ferremix.com.do', wa:'18295373000', email:'soporteweb@ferremix.com.do', precios:true,
    nota:'La cadena de mayor expansión reciente. Sucursales Villa Mella (849-507-0003) y Herrera (829-539-0078). Tienda en línea con precios en RD$.'
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
    cats:['MAT-02','MAT-04','MAT-08','MAT-09','MAT-11','MAT-13'],
    /* No se pudo verificar dónde están sus sucursales, así que no se le
       asigna zona: el filtro por zona la deja fuera antes que decir algo que
       no sabemos. Sus precios sí cuentan para la referencia, que depende de
       si vende al público y no de dónde está. */
    zonas:[], web:'ferreteriacima.com.do', precios:true,
    nota:'Tienda en línea con precios de lista en RD$ y disponibilidad por artículo. Su catálogo declara el suplidor o importador de cada producto, dato que casi ningún comercio publica. Ubicación de sucursales sin verificar.'
  });
  p('InnovaCentro (La Innovación)', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-02','MAT-08','MAT-09','MAT-10','MAT-12','MAT-13','MAT-14'],
    zonas:['nacional'], web:'innovacentro.com.do', precios:true,
    nota:'Catálogo en línea con marcas y precios. Maneja Truper, Foset, Total, Pedrollo y Tangit.'
  });
  p('Plaza Lama', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-08','MAT-10','MAT-12','MAT-14'],
    zonas:['nacional'], web:'plazalama.com.do', precios:true,
    nota:'Tienda por departamentos con área de ferretería, pintura y eléctricos, y tienda en línea.'
  });
  p('Ferretería MC', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-02','MAT-08','MAT-09','MAT-10','MAT-12','MAT-14'],
    zonas:['gsd'], web:'mc.com.do', precios:false,
    nota:'Catálogo en línea sin precios: hay que pedirlos. Departamento de terminación: cerámica de piso y pared, porcelanato y molduras. Lista de precios solicitada, pendiente de respuesta.'
  });
  p('Ferretería Gigante', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-01','MAT-06','MAT-08','MAT-09','MAT-10','MAT-12','MAT-14'],
    zonas:['gsd'], web:'ferreteriagigante.com', wa:'18298841828', precios:true,
    nota:'Precios en línea. Cotiza por WhatsApp.'
  });
  p('Almacenes Unidos', {
    tipo:'cadena', canal:'detallista',
    cats:['MAT-07','MAT-09','MAT-12','MAT-14'],
    zonas:['gsd','este'], web:'unidosrd.com', tel:'809-472-6911', email:'info@almacenesunidos.net',
    nota:'Fundada en 1964, origen mayorista ferretero. Tiendas en Av. J.F. Kennedy esq. Winston Churchill, Av. Sarasota esq. Pedro A. Bobea (Bella Vista) y Punta Cana. Acepta solicitudes de cotización por WhatsApp o con un vendedor, sin visitar tienda.'
  });
  p('Ferretería Bellón', {
    tipo:'cadena', canal:'detallista', cats:['MAT-09','MAT-10','MAT-12','MAT-14'], zonas:['gsd'],
    nota:'Cadena familiar consolidada, multicategoría. Datos de contacto no verificados públicamente.'
  });
  p('Ferretería Haché', {
    tipo:'cadena', canal:'detallista', cats:['MAT-09','MAT-10','MAT-12','MAT-14'], zonas:['gsd','cibao'],
    nota:'Cadena multicategoría con presencia en Santiago y la capital. Datos de contacto no verificados públicamente.'
  });
  p('Würth Dominicana', {
    tipo:'distribuidor', canal:'mayorista', cats:['MAT-14','MAT-17'], zonas:['nacional'],
    web:'wurth.com.do', tel:'809-562-7777', precios:true,
    nota:'Proveedor premium de fijaciones y consumibles industriales, con tienda en línea. También maneja línea de EPP.'
  });

  /* ---------- MAT-01 Agregados ---------- */
  p('Agregados Comerciales (by Consthera)', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-01'], zonas:['gsd','este'],
    web:'agregadoscomerciales.com',
    nota:'Agregados basálticos (grava 3/4" y 1/2", arena, gravilla) según ASTM C-33, con capacidad de hasta 80,000 m³ mensuales. Contacto vía formulario web; teléfono directo no verificado públicamente.'
  });
  p('Arenas y Gravas Santo Domingo', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-01'], zonas:['gsd'],
    web:'arenasygravassantodomingo.com',
    nota:'Arena, grava y transporte propio (mulas, volquetas, cargador). Enfoque en entregas a obra.'
  });
  p('AgreAtlántico (Hormigones del Atlántico)', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-01','MAT-03'], zonas:['cibao'],
    nota:'División industrial de explotación de canteras y producción de agregados. Cobertura regional.'
  });
  p('Bluewave Agregados', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-01'], zonas:['este'],
    nota:'Planta en Punta Cana. Arena triturada, grava, gravilla, base/sub-base y roca de voladura.'
  });
  p('Minería & Construcciones', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-01'], zonas:['cibao'],
    nota:'Productor con sede en Santiago. Agregados para hormigón hidráulico y asfáltico, base y sub-base para carreteras.'
  });

  /* ---------- MAT-02 Cemento ---------- */
  p('Cemex Dominicana', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-02','MAT-03'], zonas:['nacional'],
    web:'cemexdominicana.com',
    nota:'Líder de mercado; adquirido por Cementos Progreso por US$950 millones en agosto de 2024. Capacidad anual de 2.6 millones de toneladas, planta en San Pedro de Macorís y cinco plantas de concreto. Marca Cementos Titán. La funda se vende vía su red de distribución Construrama (30+ ferreterías): úsese como indicador de tendencia, no como precio de calle.'
  });
  p('Cementos Cibao', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-02','MAT-03','MAT-05'], zonas:['cibao','nacional'],
    web:'cementoscibao.com',
    nota:'Fundada el 25 de octubre de 1964, capital dominicano. Segunda mayor productora de cemento gris tipo Portland Mixto, con capacidad instalada de 1,700,000 toneladas anuales. Planta integrada, tres plantas de concreto (Cibao Mix) y fábrica de blocks en Santiago. El premezclado y los prefabricados sí se cotizan directo.'
  });
  p('Domicem', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-02'], zonas:['nacional'],
    nota:'Planta en Sabana Grande de Palenque, San Cristóbal. Tras su segunda línea (22 nov 2023, US$130M) alcanzó más de 2.1 millones de TM de clínker y casi 3 millones de TM de cemento anuales. Del grupo italiano Colacem.'
  });
  p('Argos Dominicana', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-02'], zonas:['nacional'],
    nota:'Capital colombiano. Planta en Nigua, San Cristóbal. Anteriormente Cemento Colón.'
  });
  p('Sika Dominicana', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-02','MAT-07','MAT-12'], zonas:['nacional'],
    web:'dom.sika.com',
    nota:'Aditivos, morteros técnicos, pegamentos, impermeabilizantes y recubrimientos. Amplia red de distribuidores.'
  });

  /* ---------- MAT-03 Hormigón premezclado ---------- */
  p('Concretos Tecnológicos', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-03'], zonas:['nacional'],
    web:'concretostecnologicos.com',
    nota:'Despacho directo a obra en todo el país. Resistencias F\'c 210-350 kg/cm², servicio de bombeo y calidad NORDOM. Cotiza por WhatsApp.'
  });
  p('Hormigones del Atlántico', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-01','MAT-03'], zonas:['cibao'],
    nota:'Productor de hormigón y agregados con cobertura regional.'
  });

  /* ---------- MAT-04 Acero ---------- */
  p('Gerdau Metaldom', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-04'], zonas:['nacional'],
    web:'metaldom.com', precios:true,
    nota:'Fabricante líder del sector acero. En 2024 INICIA adquirió el 100% de las acciones (transacción base de US$325 millones, anunciada el 17/01/2024). Superó el millón de toneladas vendidas y fue la primera compañía del país con Declaración Ambiental de Producto para la varilla corrugada. Dos plantas (La Isabela y Parque Industrial Duarte). Varilla RTD 458 / ASTM A615. Portal B2B solo para canal; el catálogo técnico en PDF es público (no trae precios).'
  });
  p('CORVI', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-04','MAT-09'], zonas:['nacional'],
    web:'corvi.do',
    nota:'Más de 20 años. Tubosistemas y productos derivados del alambrón de acero, además de tubería PVC, polipropileno y polietileno.'
  });

  /* ---------- MAT-05 Bloques y prefabricados ---------- */
  p('Prefhorvisa Dominicana', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-05'], zonas:['sur'],
    web:'prefhorvisard.com',
    nota:'Matriz española, planta en Baní (Peravia). Blocks de concreto con maquinaria Besser, norma ASTM/UNE. Vende a ferreterías, constructoras y particulares.'
  });
  p('SANMA', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-05'], zonas:['nacional'],
    web:'sanmard.com',
    nota:'Especializado en prefabricados estructurales de concreto, con experiencia europea.'
  });
  p('Grupo Ventmar', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-05'], zonas:['sur'],
    web:'ventmar.com.do',
    nota:'Fábrica de blocks en el sur, con producción de 8,000 a 10,000 bloques por día.'
  });

  /* ---------- MAT-06 Madera ---------- */
  p('Maderas La Universal', {
    tipo:'especializado', canal:'detallista', cats:['MAT-06'], zonas:['gsd'],
    web:'maderaslauniversal.com.do',
    nota:'Dos sucursales en Santo Domingo, una en Av. Máximo Gómez esq. Av. de los Mártires. Pino americano, maderas preciosas, plywood, MDF, laminados y pinturas para madera.'
  });
  p('Maderera Mario', {
    tipo:'especializado', canal:'detallista', cats:['MAT-06'], zonas:['gsd'],
    web:'madereramario.com',
    nota:'Más de 50 años, en Villa Consuelo. Pino normal y tratado, plywood, MDF hidrófugo, andiroba, robles, caoba y puertas de polimetal.'
  });
  p('Valiente Fernández', {
    tipo:'especializado', canal:'detallista', cats:['MAT-06'], zonas:['gsd'],
    web:'valientefernandez.net',
    nota:'Distrito Nacional. Maderas importadas, contrachapados Film Face para encofrado y madera para apuntalar.'
  });

  /* ---------- MAT-07 Techos ---------- */
  p('Aluzinc Cadimex', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-07'], zonas:['cibao'],
    web:'aluzincadimex.com',
    nota:'Sede en Santiago, fábrica de 3,590 m². Aluzinc acanalado, tipo teja española, caños y caballetes en varios colores. Fabricación a medida.'
  });
  p('Proaluzinc (CGM Industrial)', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-07'], zonas:['gsd','cibao'],
    web:'proaluzinc.com.do',
    nota:'Opera desde Santiago y Santo Domingo. Aluzinc, techos, Metaldeck y accesorios.'
  });
  p('Mega Techo', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-07'], zonas:['nacional'],
    nota:'Más de 25 años fabricando techos en aluzinc, zinc, metaldeck y correas.'
  });
  p('Rooftec', {
    tipo:'distribuidor', canal:'detallista', cats:['MAT-07','MAT-09'], zonas:['gsd','este'],
    nota:'Almacenes en Santo Domingo y Punta Cana. Tejas, shingles, paneles sándwich, impermeabilizantes, aislantes y tuberías PPR/PEX.'
  });
  p('Tejar del Rey', {
    tipo:'distribuidor', canal:'detallista', cats:['MAT-07'], zonas:['nacional'],
    nota:'Tejas y techos, con varias sucursales y red de distribuidores nacional.'
  });

  /* ---------- MAT-08 Pisos y revestimientos ---------- */
  p('Cerarte', {
    tipo:'especializado', canal:'detallista', cats:['MAT-08','MAT-09'], zonas:['gsd','cibao','este'],
    web:'cerarte.com.do', precios:true,
    nota:'Alta gama. Tiendas en Santo Domingo, Santiago y Punta Cana. Tienda en línea (shop.cerarte.com.do) con precios "Desde RD$". Cerámica y porcelanato importado de Italia, España, Brasil y EAU, piedras naturales, aparatos de baño, grifería y cocinas. División B2B: Cerarte Proyecto.'
  });
  p('Cerámica Import', {
    tipo:'especializado', canal:'detallista', cats:['MAT-08','MAT-09'], zonas:['cibao'],
    web:'ceramicaimport.com', precios:true,
    nota:'Importador de alta gama en Santiago. Catálogo en línea con filtros y comparador. Porcelanato, cerámica, sanitarios, muebles de baño y grifería.'
  });

  /* ---------- MAT-09 Plomería ---------- */
  p('Grupo Powerplastic', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-09'], zonas:['nacional'],
    web:'grupopowerplastic.com',
    nota:'Planta de 55,000 m², norma ASTM. Tuberías y accesorios PVC; exporta al Caribe. Se cotiza vía ferreterías y mayoristas.'
  });
  p('Plastigama Wavin', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-09'], zonas:['nacional'],
    nota:'Marca de tuberías PVC/CPVC/PPR y accesorios, con catálogos técnicos disponibles. Se distribuye vía ferreterías.'
  });

  /* ---------- MAT-10 Electricidad ---------- */
  p('Eurosuplidores', {
    tipo:'distribuidor', canal:'mayorista', cats:['MAT-10'], zonas:['gsd','este'],
    web:'eurosuplidores.com',
    nota:'Más de 20 años. Cobertura Santo Domingo, Bávaro y Punta Cana. Materiales eléctricos, breakers, iluminación y energía renovable / paneles solares. Catálogo descargable y atención por WhatsApp.'
  });
  p('Suplidores del Caribe', {
    tipo:'distribuidor', canal:'mayorista', cats:['MAT-10'], zonas:['gsd'],
    web:'suplidoresdelcaribe.com', tel:'809-221-2424', wa:'18092212424',
    nota:'Importador en Villa Juana. Cable THHN, cable URD, tubería EMT/IMC y fittings. Cotiza por WhatsApp; envío gratis en Santo Domingo.'
  });
  p('JJ Electric', {
    tipo:'distribuidor', canal:'mayorista', cats:['MAT-10'], zonas:['nacional'],
    web:'jjelectricsa.com', tel:'809-688-6166',
    nota:'Sucursales en varias plazas. Alta y media tensión, cables, fittings, iluminación, transformadores y protección. Cotización formal; envío nacional en 48 horas.'
  });
  p('AEC Dominicana', {
    tipo:'mayorista', canal:'mayorista', cats:['MAT-10'], zonas:['gsd'],
    tel:'809-412-1406',
    nota:'Mayorista en Paseo de los Locutores 48, Santo Domingo. Abastece concesionarias eléctricas, industrias y distribuidores.'
  });
  p('Dismaelec', {
    tipo:'distribuidor', canal:'detallista', cats:['MAT-10'], zonas:['gsd'],
    web:'dismaelec.com',
    nota:'Material eléctrico residencial e industrial desde el año 2000.'
  });

  /* ---------- MAT-11 Puertas, ventanas y cristales ---------- */
  p('Ventus Grupo Corporativo', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-11'], zonas:['cibao','nacional'],
    web:'ventus.com.do',
    nota:'Fabricante e instalador en Santiago con cobertura nacional. Aluminio, cristal y acero: ventanas, fachadas, muro cortina, puertas y barandas. Sistemas M100, P65, P92 y C70.'
  });
  p('Cristalados', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-11'], zonas:['gsd'],
    web:'cristalados.com', tel:'809-379-1799',
    nota:'Más de 25 años, en Santo Domingo Oeste. Puertas, ventanas, laminados, espejos y cristales templados. Fabricación a medida.'
  });
  p('ProGlass', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-11'], zonas:['gsd'],
    web:'proglass.com.do',
    nota:'Ventanas corredizas de aluminio y cristal, vidrio templado, puertas polimetálicas y screen.'
  });
  p('PuertasYVentanasRD', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-11'], zonas:['nacional'],
    web:'puertasyventanasrd.com', tel:'809-415-2955', email:'info@puertasyventanasrd.com',
    nota:'Línea mayorista. Aluminio, PVC, shutters, polimetal y ventanas contra huracanes.'
  });
  p('Industria Ventcord', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-11'], zonas:['gsd'],
    web:'ventcord.com',
    nota:'Más de 20 años fabricando en Santo Domingo.'
  });

  /* ---------- MAT-12 Pintura ---------- */
  p('Pinturas Tropical', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-12'], zonas:['nacional'],
    web:'pinturastropical.com.do',
    nota:'Líder del mercado dominicano con más de 40 años. Fabricada por Pisos & Techados Torginol (Grupo Corripio desde 1981). Pinturas arquitectónicas, esmaltes, barnices y lacas. Carta de colores en línea; alianzas con Ameron PCG y Resene. Marca hermana: King. Se compra en ferreterías y distribuidores.'
  });
  p('Pinturas Popular', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-12'], zonas:['nacional'],
    web:'pinturaspopular.com',
    nota:'Amplia distribución en ferreterías.'
  });
  p('Industrias Tucán', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-12','MAT-07'], zonas:['nacional'],
    nota:'Pinturas, recubrimientos arquitectónicos e industriales, impermeabilizantes anticorrosivos y productos para madera.'
  });

  /* ---------- MAT-13 Construcción liviana ---------- */
  p('Procontratista', {
    tipo:'mayorista', canal:'mayorista', cats:['MAT-08','MAT-10','MAT-13','MAT-15'], zonas:['nacional'],
    web:'procontratista.com', tel:'809-472-4479', wa:'18094724479', email:'ventas@procontratista.com', precios:true,
    nota:'Mayorista especializado en construcción ligera, "El Amigo del Constructor": modelo de suplidor puro, no compite con sus clientes contratistas. Centro de distribución en Av. República de Colombia No. 35, Los Peralejos, y red de unas 10 tiendas (Santo Domingo, Santiago, La Romana, Bávaro, La Vega, Puerto Plata). Sheetrock, plafones, Densglass, Durock, PVC, stucco, aislamientos, revestimientos, fachadas, pisos, iluminación, divisiones y línea de aire acondicionado. Candidato a proveedor primario de la categoría.'
  });
  p('Cielos Acústicos', {
    tipo:'especializado', canal:'detallista', cats:['MAT-08','MAT-10','MAT-13'], zonas:['gsd','este'],
    web:'cielosacusticos.com', tel:'809-732-2368', email:'ventas@cielosacusticos.com', precios:false,
    nota:'Distribuidor de Panel Rey en RD. Sucursales en Av. Charles Sumner #35 y #20 (Los Prados), Av. Charles de Gaulle (Cancino), Urb. Las Américas y Carretera Higüey-Miches. Plafones acústicos, revestimientos, pisos, techos, fachadas, iluminación, divisiones acústicas móviles y herramientas. Publica catálogos, no precios.'
  });
  p('Industrias Gueca (PANELROCK)', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-13'], zonas:['nacional'],
    web:'industriasgueca.com',
    nota:'Se presenta como la primera fábrica de drywall de República Dominicana. Paneles de yeso, masillas y yeso de construcción y agrícola. Cotiza por WhatsApp.'
  });
  p('Panel Rey', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-13'], zonas:['nacional'],
    web:'panelrey.com',
    nota:'Fabricante mexicano con presencia y distribución en RD (paneles de yeso, sistemas de fuego y acústica). Aliado local: Cielos Acústicos.'
  });
  p('Novomat', {
    tipo:'distribuidor', canal:'detallista', cats:['MAT-13'], zonas:['gsd'],
    web:'novomat.com.do',
    nota:'Plafones de PVC, fibra mineral, yeso y metálicos.'
  });

  /* ---------- MAT-14 Ferretería ---------- */
  p('Torniacero', {
    tipo:'especializado', canal:'mayorista', cats:['MAT-14'], zonas:['gsd'],
    nota:'Especializado en tornillería, niples y pernos, con fabricación propia.'
  });

  /* ---------- MAT-15 Climatización ---------- */
  p('Refripartes', {
    tipo:'mayorista', canal:'mayorista', cats:['MAT-15'], zonas:['nacional'],
    web:'refripartes.com',
    nota:'Mayorista HVACR con más de 17 sucursales en todo el país. Marca propia TGM; equipos de A/A, refrigeración, fittings de bronce y cobre, y abanicos. Amplio inventario.'
  });
  p('Inaire', {
    tipo:'mayorista', canal:'mayorista', cats:['MAT-15'], zonas:['nacional'],
    nota:'Mayorista e importador. Marcas Greenflow, Lennox y Daikin. Instalación y mantenimiento.'
  });
  p('ComfortStar', {
    tipo:'distribuidor', canal:'mayorista', cats:['MAT-15'], zonas:['nacional'],
    web:'comfortstar.com.do',
    nota:'Equipos de A/A, refrigeración y ventilación para uso residencial, comercial e industrial.'
  });
  p('RefriMorel', {
    tipo:'distribuidor', canal:'detallista', cats:['MAT-15'], zonas:['nacional'],
    web:'refrimorel.com',
    nota:'Distribuidor autorizado de Lennox, LG, Daikin, Milexus y Comfortmaster.'
  });
  p('Carrier Dominicana', {
    tipo:'fabricante', canal:'fabricante', publico:false, cats:['MAT-15'], zonas:['nacional'],
    web:'carrier.com.do',
    nota:'Marca y distribución de aire acondicionado comercial y residencial.'
  });

  /* ---------- MAT-16 Sistemas especiales ---------- */
  p('CGT (CGT DO SRL)', {
    tipo:'distribuidor', canal:'mayorista', cats:['MAT-16'], zonas:['nacional'],
    web:'cgt.do',
    nota:'Distribuidor e instalador con cobertura nacional (despacho vía Caribe Tours, Metro, BM Cargo y Vimenpaq). Marcas Hikvision, HiLook, UNV y EPCOM. Precios de distribuidor por volumen y kits.'
  });
  p('Segumart', {
    tipo:'mayorista', canal:'mayorista', cats:['MAT-16'], zonas:['nacional'],
    web:'segumart.com', precios:true,
    nota:'Mayorista de CCTV con catálogo de precios (acceso por registro). Cámaras IP, DVR e importación directa.'
  });
  p('Data Import', {
    tipo:'distribuidor', canal:'mayorista', cats:['MAT-16'], zonas:['nacional'],
    web:'dataimport.com',
    nota:'Cámaras CCTV/IP y kits.'
  });
  p('CEMSEGURIDAD', {
    tipo:'distribuidor', canal:'detallista', cats:['MAT-16'], zonas:['gsd','cibao'],
    web:'cemseguridad.com',
    nota:'Distribuidor e integrador con sucursales en Santo Domingo, Santiago y Santo Domingo Este. CCTV, alarmas, control de acceso, portones y domótica.'
  });
  p('Seguricentro', {
    tipo:'mayorista', canal:'mayorista', cats:['MAT-16'], zonas:['nacional'],
    nota:'Mayorista de seguridad electrónica, con formación técnica y soporte a integradores.'
  });

  /* ---------- MAT-17 Seguridad industrial ---------- */
  p('EQUIP, SRL', {
    tipo:'especializado', canal:'mayorista', cats:['MAT-17'], zonas:['nacional'],
    web:'equip.com.do', tel:'809-563-9898', wa:'18293447774', email:'cotizaciones@equiprd.com',
    nota:'Más de 20 años en seguridad y salud ocupacional. Marcas Honeywell, Ansell, Dräger, Showa, Protecta, HexArmor, Ergodyne, Safety Jogger y RAE Systems. Catálogo en línea sin precios (modelo de cotización B2B). Centro de entrenamiento y taller de calibración.'
  });
  p('UST (Expertos en Seguridad y Salud Laboral)', {
    tipo:'distribuidor', canal:'mayorista', cats:['MAT-17'], zonas:['gsd','nacional'],
    web:'ust.com.do', tel:'809-683-2321', email:'ventas@ust.com.do',
    nota:'Calle Mario García Alvarado No. 17, Ens. Quisqueya, Santo Domingo. EPP y señalización vial. Entrega en 48 horas con flota propia.'
  });
  p('Equipro, SRL', {
    tipo:'distribuidor', canal:'mayorista', cats:['MAT-17'], zonas:['sur'],
    web:'equipro.com.do', tel:'829-547-0808', email:'info@equipro.com.do',
    nota:'Enfocado en zonas francas, desde la Zona Franca de Nigua, San Cristóbal. Marcas 3M Fall Protection, Moldex, Microgard y HyTest. Taller de calibración y recertificación.'
  });
  p('SOS Protección Integral', {
    tipo:'especializado', canal:'detallista', cats:['MAT-17'], zonas:['gsd'],
    web:'sosintegral.com', tel:'809-331-0000', email:'info@sosintegral.com', precios:true,
    nota:'Zona Industrial de Herrera, Santo Domingo Oeste. Tienda en línea de EPP.'
  });
  p('Deinsa', {
    tipo:'distribuidor', canal:'mayorista', cats:['MAT-17'], zonas:['gsd'],
    web:'deinsa.com.do', tel:'809-363-1000', email:'info@deinsa.com.do',
    nota:'Seguridad industrial, en la Zona Industrial de Herrera.'
  });

  /* ---------- MAT-18 Exteriores y paisajismo ---------- */
  p('Irrigación Dominicana (IRRIDOM)', {
    tipo:'especializado', canal:'detallista', cats:['MAT-18'], zonas:['gsd','nacional'],
    web:'irrigaciondominicana.com.do', tel:'809-245-5045',
    nota:'Distribuidor autorizado Hunter en RD, en Av. Quinto Centenario, Distrito Nacional. Diseño hidráulico, goteo y aspersión; atiende áreas verdes, viveros y agrícola. Correo no verificado públicamente.'
  });
  p('Green Garden Corp.', {
    tipo:'especializado', canal:'detallista', publico:false, cats:['MAT-18'], zonas:['nacional'],
    web:'greengardencorp.com', email:'info@greengardencorp.com',
    nota:'Más de 30 años y 1,200 proyectos en RD, Barbados y México. Paisajismo, áreas verdes y campos de golf; siembra de grama, palmas y riego automatizado. Modelo B2B (hoteles y desarrolladoras). Teléfono no publicado abiertamente.'
  });
  p('Realturf República Dominicana', {
    tipo:'fabricante', canal:'fabricante', cats:['MAT-18'], zonas:['gsd','cibao','este'],
    web:'realturf.com',
    nota:'Fabricante e instalador de grama artificial residencial, comercial y deportiva. Garantía de hasta 10 años. Contacto vía formulario.'
  });
  p('Viverde', {
    tipo:'especializado', canal:'detallista', cats:['MAT-18'], zonas:['gsd'],
    web:'viverde.com.do',
    nota:'Vivero de frutales y ornamentales, con catálogo de plantas disponible. Contacto no verificado en fuentes públicas.'
  });
  p('Jardín Botánico Nacional (Vivero)', {
    tipo:'especializado', canal:'detallista', cats:['MAT-18'], zonas:['gsd'],
    web:'jbn.gob.do',
    nota:'Vivero público en Santo Domingo con ornamentales, frutales y forestales a precios económicos.'
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
