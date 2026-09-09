/* =========================================================
   Contenido editorial de las páginas estáticas por categoría.
   Este archivo NO se publica: solo lo lee el generador
   (herramientas/generar-categorias.js) al construir los HTML.

   Por cada categoría del catálogo:
     titulo   → etiqueta <title> (apunte a ~60 caracteres)
     desc     → meta description (~155 caracteres)
     h1       → encabezado visible
     intro    → párrafos de entrada (los primeros del contenido indexable)
     claves   → qué mueve el precio en ese rubro
     faq      → preguntas frecuentes; alimentan también el JSON-LD FAQPage
   ========================================================= */

module.exports = {

'MAT-01': {
  titulo: 'Precio de la arena y la grava en República Dominicana',
  desc: 'Precios de referencia de arena, grava, caliche y piedra en RD, por m³ y por viaje, con lo que hay que saber antes de cotizar en una cantera o acopio.',
  h1: 'Precio de la arena, la grava y los agregados en República Dominicana',
  intro: [
    'Los agregados se venden de dos formas y conviene no mezclarlas: por metro cúbico, cuando se compra el material suelto, y por viaje, cuando se compra el camión completo. Un viaje típico es de 4, 8 o 16 m³, así que el precio por viaje solo se puede comparar con el de otro viaje del mismo volumen.',
    'En este rubro el productor es el canal: se cotiza directo con la cantera o el acopio, no con una ferretería. Y el transporte pesa tanto como el material. Dos obras que compran la misma arena pueden pagar precios muy distintos solo por la distancia a la cantera, sobre todo fuera del Gran Santo Domingo.'
  ],
  claves: [
    ['La distancia manda', 'El flete puede ser una parte grande de lo que se paga. Cotizar siempre con la cantera o el acopio más cercano a la obra antes de comparar precios de material.'],
    ['Viaje o metro cúbico', 'Pedir el precio por m³ y el precio por viaje con el volumen declarado del camión. Es la única forma de comparar dos ofertas.'],
    ['Arena lavada, itabo o fina', 'No son intercambiables. La lavada va a hormigón y pañete, la itabo a mezclas de mampostería y la fina a terminación. Pedir «arena» a secas es cotizar a ciegas.'],
    ['Mucho suplidor informal', 'Es el rubro con más oferta informal del sector. Antes de contratar volumen, validar RNC y capacidad de facturación.']
  ],
  faq: [
    ['¿Cuántos metros cúbicos trae un viaje de arena o grava?',
     'Los camiones más comunes despachan 4, 8 o 16 m³. El volumen no es estándar entre suplidores, así que hay que pedirlo declarado en la cotización: es lo que permite convertir el precio del viaje a precio por m³ y comparar.'],
    ['¿Conviene comprar por metro cúbico o por viaje?',
     'Por viaje casi siempre sale mejor por unidad de volumen, porque el flete se reparte. La compra por m³ tiene sentido en obras pequeñas o cuando no hay espacio de acopio en el solar.']
  ]
},

'MAT-02': {
  titulo: 'Precio del cemento en República Dominicana',
  desc: 'Precio de referencia de la funda de cemento gris de 42.5 kg en RD, más morteros, pegamentos de cerámica y aditivos, con la explicación del canal de venta.',
  h1: 'Precio del cemento, morteros y aditivos en República Dominicana',
  intro: [
    'La funda de cemento gris portland de 42.5 kg es la unidad de referencia del mercado dominicano y probablemente el precio más consultado de toda la construcción. Es también el que más se usa como termómetro: cuando sube la funda, el resto de la obra gris se mueve detrás.',
    'Aquí hay que entender el canal. Las cementeras no venden la funda al público: despachan por distribución y por redes de ferreterías. Eso significa que el anuncio de precio de una cementera es un indicador de tendencia, no el precio de calle; el precio real de compra está en la ferretería o el mayorista, y cambia con el volumen que se lleve.'
  ],
  claves: [
    ['El fabricante no es el vendedor', 'Cemento, morteros y aditivos se compran en el canal detallista y mayorista. Los comunicados de las cementeras sirven para anticipar movimientos de precio, no para cotizar.'],
    ['El volumen cambia el precio', 'La funda suelta y el palé no cuestan lo mismo. Pedir siempre el precio por tramos de cantidad al mayorista.'],
    ['Pegamento correcto por revestimiento', 'Un pegamento de interior no sostiene un porcelanato de gran formato ni aguanta la intemperie. Ahorrar en el pegamento es la causa más común de un piso que se despega.'],
    ['Los aditivos se cotizan aparte', 'Plastificantes, acelerantes, impermeabilizantes de masa y epóxicos de anclaje van por galón, cubeta o cartucho, y no entran en el precio del cemento.']
  ],
  faq: [
    ['¿Por qué el precio que anuncia la cementera no es el que pago en la ferretería?',
     'Porque las cementeras venden por distribución, no al detalle. Entre la fábrica y la obra hay un distribuidor y una ferretería, cada uno con su margen y su costo de transporte. El anuncio del fabricante sirve para saber hacia dónde va el mercado.'],
    ['¿Cuántas fundas de cemento lleva un metro cúbico de hormigón?',
     'Para un hormigón de 210 kg/cm² mezclado en obra se estiman alrededor de 7 fundas por m³, más arena y grava. Es una referencia de cubicación: la dosificación exacta depende del diseño de mezcla.']
  ]
},

'MAT-03': {
  titulo: 'Precio del hormigón premezclado por m³ en RD',
  desc: 'Precio de referencia del hormigón premezclado en República Dominicana por resistencia (180 a 350 kg/cm²), más el servicio de bombeo y lo que cambia la cotización.',
  h1: 'Precio del hormigón premezclado en República Dominicana',
  intro: [
    'El hormigón premezclado se cotiza por metro cúbico y por resistencia. La resistencia se expresa como f\'c en kg/cm²: 210 es lo más común en vivienda, y de ahí para arriba se paga más por cada escalón. Pedir «un precio del hormigón» sin decir la resistencia no permite comparar nada.',
    'A diferencia del cemento en funda, aquí el fabricante sí es el canal: se cotiza directo con la concretera, que despacha a la obra. Conviene pedir cotización a tres o cuatro plantas y comparar no solo el precio por m³, sino la disponibilidad de bomba, el mínimo de despacho y el tiempo de espera del camión en obra.'
  ],
  claves: [
    ['La resistencia define el precio', 'Cada escalón de f\'c cuesta más. Usar la resistencia que pide el cálculo estructural, ni más ni menos.'],
    ['El bombeo va aparte', 'Se cobra por m³ o por jornada y suele tener un mínimo. En obras de varios niveles puede cambiar de forma importante el costo total del vaciado.'],
    ['Mínimo de despacho y espera', 'Casi todas las plantas tienen un volumen mínimo por viaje y cobran la espera del camión más allá de cierto tiempo. Un vaciado mal organizado se paga.'],
    ['Distancia a la planta', 'El hormigón tiene tiempo de vida útil en el camión. Lejos de una planta, el costo sube y las opciones se reducen.']
  ],
  faq: [
    ['¿Conviene premezclado o mezclar el hormigón en obra?',
     'Para volúmenes pequeños y obras sin acceso para el camión, mezclar en sitio sigue teniendo sentido. Para losas, zapatas y cualquier elemento estructural de volumen, el premezclado gana en control de calidad, en rendimiento de la cuadrilla y casi siempre en costo real una vez se cuentan el cemento, los agregados, la mano de obra y el desperdicio.'],
    ['¿El precio del hormigón incluye el bombeo?',
     'No. El bombeo es un servicio aparte que se cotiza por m³ o por jornada, con bomba estacionaria o de pluma según la altura y el acceso. Hay que pedirlo explícito en la cotización.']
  ]
},

'MAT-04': {
  titulo: 'Precio de la varilla en República Dominicana',
  desc: 'Precio de referencia de la varilla corrugada de 3/8", 1/2", 5/8", 3/4" y 1" en RD, en largos de 20 y 30 pies, más mallas, perfiles y tubería estructural.',
  h1: 'Precio de la varilla y el acero de refuerzo en República Dominicana',
  intro: [
    'La varilla corrugada se compra por unidad o por quintal, y ese es el primer punto de confusión al comparar precios: una varilla de 1/2" de 20 pies y una de 30 pies no cuestan lo mismo, y un quintal contiene una cantidad distinta de varillas según el diámetro. Antes de comparar, hay que igualar diámetro, largo y unidad.',
    'El acero sigue al mercado internacional, así que es de los rubros que más se mueve en el año. La varilla al detalle se compra en ferreterías, cadenas y mayoristas; el portal del fabricante es un canal B2B para distribuidores y grandes constructoras, y sus anuncios sirven como indicador de tendencia.'
  ],
  claves: [
    ['Unidad, largo y grado', 'Especificar siempre diámetro, largo (20 o 30 pies) y grado 60 con su norma. Es lo que hace comparable una cotización.'],
    ['Quintal contra unidad', 'Los mayoristas suelen cotizar por quintal y las ferreterías por varilla. Convertir antes de comparar, no después.'],
    ['Traslapes y desperdicio', 'El acero que se compra no es el que queda en la estructura. Los traslapes, los ganchos y los recortes agregan un porcentaje que el cálculo de cubicación debe contemplar.'],
    ['Alambre y separadores', 'El amarre y los separadores no entran en el precio de la varilla y se olvidan con frecuencia en el presupuesto.']
  ],
  faq: [
    ['¿Cuántas varillas trae un quintal?',
     'Depende del diámetro: un quintal rinde aproximadamente 7.4 varillas de 1/2" por 20 pies, y unas 13.3 varillas de 3/8" del mismo largo. Por eso una cotización por quintal y una por unidad solo se comparan después de convertir.'],
    ['¿Varilla de 20 o de 30 pies?',
     'La de 30 pies reduce traslapes en elementos largos y puede bajar el consumo total de acero, pero exige más espacio de acopio y manejo en obra. En viviendas la de 20 pies sigue siendo lo más práctico.']
  ]
},

'MAT-05': {
  titulo: 'Precio del block en República Dominicana',
  desc: 'Precio de referencia del block de hormigón de 4, 5, 6 y 8 pulgadas en RD, por unidad y por millar, más ladrillos, celosías, adoquines y prefabricados.',
  h1: 'Precio del block y los prefabricados en República Dominicana',
  intro: [
    'El block de hormigón se vende por unidad y por millar, y el espesor define tanto el precio como el uso: el de 4" y 5" para divisiones interiores, el de 6" para la mayoría de los muros, y el de 8" cuando el muro trabaja estructuralmente. La norma de referencia local para el block es la NORDOM 461, alineada con la ASTM C90.',
    'La bloquera vende directo, tanto a ferreterías como a constructoras y particulares. Por eso lo primero al presupuestar mampostería es ubicar la fábrica más cercana a la obra: el block es pesado y barato por unidad, así que el transporte se vuelve una parte importante del costo entregado.'
  ],
  claves: [
    ['Comprar por millar', 'La diferencia de precio entre la compra suelta y el millar en fábrica es significativa. En obras de volumen, cotizar por millar y con despacho.'],
    ['El transporte decide', 'Un block más barato a 40 km puede salir más caro que uno más caro al lado de la obra. Comparar siempre precio puesto en obra.'],
    ['Espesor según función', 'Usar 8" donde el muro es estructural y 6" en el resto. Bajar el espesor para ahorrar en un muro que trabaja es un problema, no un ahorro.'],
    ['Calidad y merma', 'Un block mal curado se parte al manipularse. La merma por rotura en descarga y colocación hay que presupuestarla.']
  ],
  faq: [
    ['¿Cuántos blocks lleva un metro cuadrado de muro?',
     'Con el block estándar de 8" x 16" se estiman alrededor de 12.5 unidades por m² de muro, sin contar la merma por rotura y recortes. Es la cifra que se usa para cubicar mampostería antes de pedir precio.'],
    ['¿Block de 4, 6 u 8 pulgadas?',
     'El de 4" y 5" sirve para divisiones interiores livianas, el de 6" es el uso general en muros de vivienda, y el de 8" se emplea cuando el muro tiene función estructural o cuando se necesita más aislamiento y resistencia. La decisión la marca el cálculo, no el precio.']
  ]
},

'MAT-06': {
  titulo: 'Precio de la madera y el plywood de encofrado en RD',
  desc: 'Precios de referencia de madera de pino, cuartones, alfardas, plywood corriente y fenólico de formaleta en República Dominicana, con lo que cambia el costo real.',
  h1: 'Precio de la madera y el encofrado en República Dominicana',
  intro: [
    'Casi toda la madera de encofrado que se usa en el país es pino importado, y se cotiza de dos maneras: por pieza (una tabla, un cuartón, una alfarda de un largo determinado) o por pie tablar, que es la unidad de volumen de la madera. El plywood va por plancha de 4 x 8 pies, y el precio cambia mucho según el espesor y el tipo.',
    'La clave del encofrado no es el precio de compra sino el costo por uso. Una plancha fenólica de formaleta cuesta bastante más que un plywood corriente, pero aguanta muchos más vaciados con mejor acabado. En una obra con repetición de elementos, la plancha cara suele salir más barata al final.'
  ],
  claves: [
    ['Costo por uso, no por plancha', 'Dividir el precio entre la cantidad de usos esperados. Es la única comparación honesta entre plywood corriente y fenólico.'],
    ['Pie tablar contra pieza', 'Un pie tablar equivale a 1" x 12" x 12". Cuando una cotización viene por pie tablar y otra por pieza, convertir antes de decidir.'],
    ['Desmoldante y limpieza', 'El desmoldante alarga la vida de la formaleta y mejora el acabado. Es un consumible que casi nunca aparece en el presupuesto inicial.'],
    ['Tratada para intemperie', 'La madera sin tratar expuesta a la humedad dominicana no dura. Para exteriores y estructuras permanentes, presupuestar madera tratada.']
  ],
  faq: [
    ['¿Cuántos usos da una plancha de plywood de encofrado?',
     'Depende del tipo y del cuidado: un plywood corriente puede dar unos pocos usos antes de perder el acabado, mientras que una plancha fenólica de formaleta está diseñada para muchos más. El desmoldante, la limpieza y el desencofrado cuidadoso son los que más alargan la vida útil.'],
    ['¿Qué es un pie tablar?',
     'Es la unidad de volumen con la que se vende la madera: equivale a una pieza de 1 pulgada de espesor por 12 pulgadas de ancho por 12 pulgadas de largo. Sirve para comparar precios entre piezas de escuadrías distintas.']
  ]
},

'MAT-07': {
  titulo: 'Precio del zinc, el aluzinc y los techos en RD',
  desc: 'Precios de referencia de planchas de zinc y aluzinc por calibre y largo, tejas asfálticas e impermeabilizantes en República Dominicana.',
  h1: 'Precio del zinc, el aluzinc y la impermeabilización en República Dominicana',
  intro: [
    'Las planchas de zinc y aluzinc se cotizan por plancha, y el precio depende de dos cosas: el calibre (el 26 y el 29 son los más comunes) y el largo. Como los fabricantes locales cortan a medida, el largo no está limitado a los comerciales, y ahí hay una decisión de costo: menos traslapes significa menos material perdido y menos puntos de filtración.',
    'En techos y aluzinc a medida el fabricante vende directo, así que cotizar con la fábrica es el canal normal. Y el techo nunca es solo la cubierta: caballetes, caños, tornillos con arandela, sellado y, si aplica, aislamiento, forman parte del mismo presupuesto.'
  ],
  claves: [
    ['Calibre y largo', 'Un calibre más grueso cuesta más y dura más. El largo a medida reduce traslapes: menos filtraciones y menos desperdicio.'],
    ['El sistema completo', 'Presupuestar caballetes, caños, tornillos, sellador y aislamiento junto con las planchas. Solos, los metros de cubierta engañan.'],
    ['Impermeabilizar es por m²', 'Los mantos y las membranas se cotizan por rollo o cubeta, pero se presupuestan por m² de techo, contando solapes y subidas de pretil.'],
    ['Mantenimiento periódico', 'Una impermeabilización no es definitiva. Conviene planificar su revisión antes de que aparezca la filtración.']
  ],
  faq: [
    ['¿Zinc o aluzinc?',
     'El aluzinc, por su recubrimiento de aluminio y zinc, resiste mejor la corrosión que el zinc galvanizado tradicional, algo que pesa en zonas costeras como buena parte del país. Cuesta más por plancha, pero en ambiente salino la diferencia de vida útil suele justificarlo.'],
    ['¿Cada cuánto hay que impermeabilizar un techo?',
     'Depende del sistema aplicado y de la exposición. Lo práctico es revisar el techo al menos una vez al año, antes de la temporada de lluvias, y reparar puntualmente en lugar de esperar a que aparezca la filtración adentro.']
  ]
},

'MAT-08': {
  titulo: 'Precio del piso, la cerámica y el porcelanato en RD',
  desc: 'Precios de referencia por m² de cerámica, porcelanato, piedra natural, vinílico y topes de granito y cuarzo en República Dominicana.',
  h1: 'Precio de la cerámica, el porcelanato y los pisos en República Dominicana',
  intro: [
    'Los revestimientos se venden por pieza y se compran por metro cuadrado, y la primera trampa está ahí: cada formato rinde una cantidad distinta de piezas por m², así que un precio por pieza no dice nada hasta que se convierte. Aquí ya viene convertido: cada precio es por metro cuadrado, con las piezas por metro que declara el propio comercio. La segunda trampa es que el material es apenas una parte del costo: el pegamento correcto, la nivelación, el derretido y la mano de obra suelen sumar tanto como la pieza.',
    'Cada fila es una especificación de compra —cerámica o porcelanato, de piso o de pared, y el formato—, no una marca ni un color. Un mismo renglón puede tener veinte diseños detrás y por eso el rango se abre: en 45 x 45 conviven la cerámica nacional básica y una importada que cuesta cuatro veces más. Ese ancho es el dato, no un error: dice cuánto se puede mover el presupuesto sin cambiar de especificación.'
  ],
  claves: [
    ['Convertir caja a metro cuadrado', 'Pedir siempre el rendimiento en m² por caja. Es el único modo de comparar dos precios.'],
    ['Presupuestar desperdicio', 'Entre un 5% y un 10% adicional según el formato y si hay cortes en diagonal. En gran formato, más.'],
    ['Gran formato exige piso plano', 'Las piezas grandes necesitan nivelación previa y pegamento flexible. Ese costo extra hay que meterlo desde el principio.'],
    ['Comprar el lote completo', 'Los tonos varían entre lotes de producción. Comprar de una vez el total más el desperdicio evita un parche visible después.']
  ],
  faq: [
    ['¿Cuánto desperdicio hay que calcular al comprar cerámica?',
     'Como referencia se suele agregar entre 5% y 10% sobre el área a cubrir, y más cuando el formato es grande, hay muchos cortes o el diseño va en diagonal. También conviene dejar unas piezas de reserva del mismo lote para reparaciones futuras.'],
    ['¿Cerámica o porcelanato?',
     'El porcelanato es más denso, absorbe menos agua y resiste mejor el tránsito y la intemperie; la cerámica cuesta menos y resuelve bien interiores de tránsito moderado. En áreas húmedas, exteriores y espacios de mucho uso, el porcelanato compensa la diferencia.']
  ]
},

'MAT-09': {
  titulo: 'Precio de tuberías, sanitarios y plomería en RD',
  desc: 'Precios de referencia de tubería PVC y CPVC, accesorios, inodoros, lavamanos, grifería, bombas y tinacos en República Dominicana.',
  h1: 'Precio de la plomería y los aparatos sanitarios en República Dominicana',
  intro: [
    'La tubería se vende por tubo de 20 pies y los accesorios por pieza, así que el costo de la instalación hidráulica y sanitaria se arma sumando muchas partidas pequeñas. Es la razón por la que la plomería suele cotizarse «por punto»: cada salida —un lavamanos, un inodoro, una ducha— agrupa tubería, accesorios y mano de obra en una unidad manejable.',
    'El grueso del presupuesto, sin embargo, no está en la tubería sino en los aparatos y la grifería, donde el rango entre una línea económica y una premium es enorme. Los fabricantes locales de tubería venden por distribución; los aparatos y la grifería de marca se consiguen en las cadenas grandes y en los distribuidores especializados.'
  ],
  claves: [
    ['Drenaje y presión son distintos', 'El PVC de drenaje no sirve para agua a presión. Confundirlos es un error caro y peligroso.'],
    ['Agua caliente aparte', 'Las líneas de agua caliente exigen CPVC, PPR o PEX. Presupuestarlas desde el diseño, no cuando ya está el muro cerrado.'],
    ['Contar los puntos', 'Cubicar por cantidad de salidas es más confiable que por metros de tubo, y es como cotiza el plomero.'],
    ['Bombeo y almacenamiento', 'Cisterna, tinaco, bomba y presurizador son parte del sistema y se olvidan con frecuencia en el estimado inicial.']
  ],
  faq: [
    ['¿Por qué la plomería se cotiza por punto y no por metro?',
     'Porque cada salida concentra una cantidad parecida de tubería, accesorios y trabajo, y contarla es mucho más rápido y confiable que medir metros lineales dentro de los muros. El punto incluye la mano de obra de esa salida; los aparatos y la grifería van aparte.'],
    ['¿PVC o CPVC?',
     'El PVC a presión resuelve la línea de agua fría. Para agua caliente hay que usar CPVC, PPR o PEX, porque el PVC común no está hecho para soportar esa temperatura de forma sostenida.']
  ]
},

'MAT-10': {
  titulo: 'Precio de cables y materiales eléctricos en RD',
  desc: 'Precios de referencia de cable THHN, canalización, breakers, paneles, luminarias LED, inversores y paneles solares en República Dominicana.',
  h1: 'Precio de los materiales eléctricos e iluminación en República Dominicana',
  intro: [
    'El cable se vende por rollo de 100 pies y por calibre, y su precio se mueve con el cobre, así que es de los materiales que más varían durante una obra. Igual que en plomería, la instalación eléctrica se cubica y se cotiza por punto o salida, porque cada tomacorriente, interruptor o luminaria concentra una cantidad comparable de cable, canalización, caja y trabajo.',
    'A la instalación tradicional hay que sumarle hoy una partida que antes era opcional: el respaldo de energía. Inversores, baterías, plantas y paneles solares son parte normal del presupuesto residencial dominicano, y pueden pesar tanto como toda la instalación eléctrica básica.'
  ],
  claves: [
    ['El calibre no se improvisa', 'Cada circuito pide su calibre según la carga y la distancia. Bajar el calibre para ahorrar cable es un riesgo de incendio, no una economía.'],
    ['El cobre marca el precio', 'El cable es el material eléctrico más volátil. En obras largas conviene comprarlo por etapas y revisar precio.'],
    ['Cubicar por punto', 'Contar salidas es la forma práctica de estimar. Los tableros, breakers y el respaldo se presupuestan aparte.'],
    ['Respaldo desde el diseño', 'Definir temprano qué circuitos van al inversor evita rehacer el tablero después.']
  ],
  faq: [
    ['¿Por qué el precio del cable eléctrico cambia tanto?',
     'Porque su costo depende directamente del cobre, que cotiza en el mercado internacional y se mueve constantemente. Es normal que entre el inicio y el final de una obra el mismo rollo tenga precios distintos.'],
    ['¿Qué incluye un punto eléctrico?',
     'La salida completa: la canalización, el cable desde el tablero, la caja y la mano de obra de esa salida. El dispositivo final —tomacorriente, interruptor o luminaria—, el tablero y los breakers normalmente se cotizan por separado.']
  ]
},

'MAT-11': {
  titulo: 'Precio de puertas, ventanas y cristales en RD',
  desc: 'Precios de referencia de puertas de madera y metálicas, ventanas de aluminio por pie cuadrado, cristal templado, herrajes y barandales en República Dominicana.',
  h1: 'Precio de puertas, ventanas y cristales en República Dominicana',
  intro: [
    'Esta categoría se fabrica a medida, así que el fabricante es el canal: se cotiza directo con él y con planos o medidas de obra en mano. Las ventanas de aluminio y el cristal se cotizan por pie cuadrado, y las puertas por unidad, lo que hace que dos presupuestos solo sean comparables cuando fijan el mismo sistema, el mismo espesor de cristal y los mismos herrajes.',
    'La diferencia de precio entre una puerta de tambor y una maciza de madera preciosa, o entre una ventana corrediza básica y una proyectada con cristal templado, es de las más grandes del presupuesto de terminación. Conviene decidirla temprano, porque también cambia los vanos y la estructura que los recibe.'
  ],
  claves: [
    ['Se cotiza por pie cuadrado', 'En ventanas y cristal, el p² es la unidad. Pedir el desglose por vano evita sorpresas al medir en obra.'],
    ['El sistema de aluminio importa', 'Los perfiles no son equivalentes entre sí. Comparar sin fijar el sistema es comparar precios de cosas distintas.'],
    ['Herrajes aparte', 'Cerraduras, bisagras, cierrapuertas y topes suelen ir fuera del precio de la puerta, y suman.'],
    ['Zona costera y viento', 'En el litoral conviene revisar el comportamiento del sistema frente a viento y salinidad antes de decidir por precio.']
  ],
  faq: [
    ['¿Por qué las ventanas se cotizan por pie cuadrado?',
     'Porque el costo depende del área de perfil y cristal que lleva cada vano, no de la cantidad de ventanas. Dos ventanas del mismo tipo con áreas distintas cuestan distinto, y el p² es lo que permite presupuestar antes de tener las medidas finales.'],
    ['¿Cristal templado o laminado?',
     'El templado es mucho más resistente al impacto y, si rompe, se fragmenta en pedazos sin filo; el laminado mantiene los fragmentos adheridos a una lámina intermedia, lo que aporta seguridad y aislamiento acústico. La elección depende del uso: barandas y puertas suelen ir templadas.']
  ]
},

'MAT-12': {
  titulo: 'Precio de la pintura en República Dominicana',
  desc: 'Precios de referencia de pintura acrílica, esmaltes, selladores, masilla y pinturas especiales por galón y cubeta de 5 galones en República Dominicana.',
  h1: 'Precio de la pintura y los acabados en República Dominicana',
  intro: [
    'La cubeta de 5 galones es la unidad de compra habitual en obra, y el galón se reserva para retoques y superficies pequeñas. Pero comparar pinturas por su precio de cubeta lleva a decisiones equivocadas: lo que determina el costo real es el rendimiento, es decir, cuántos metros cuadrados cubre y con cuántas manos.',
    'Una pintura económica que necesita tres manos para tapar puede terminar costando más que una premium que resuelve en dos, contando además el jornal del pintor. Las fábricas de pintura venden por distribución, así que el precio de calle está en las cadenas ferreteras y en los distribuidores de marca, donde además hay promociones frecuentes.'
  ],
  claves: [
    ['Rendimiento sobre precio', 'Comparar por metro cuadrado cubierto y por número de manos, no por precio de cubeta.'],
    ['El sellador no es opcional', 'Sobre pañete nuevo, sin sellador la pintura se absorbe y hace falta una mano más. El ahorro es falso.'],
    ['La mano de obra pesa', 'Preparación, masillado y lijado suelen costar más que la pintura misma. Un ahorro en material que agrega una mano no es ahorro.'],
    ['Exterior e interior', 'Las exteriores llevan resistencia a la intemperie. Usar una interior afuera es repintar en poco tiempo.']
  ],
  faq: [
    ['¿Cuánto rinde un galón de pintura?',
     'El rendimiento lo declara el fabricante en la ficha del producto y varía bastante entre gamas y entre tipos de superficie. Un pañete nuevo y poroso absorbe mucho más que una pared ya sellada, así que el rendimiento real en obra siempre es menor al de la ficha.'],
    ['¿Cuántas manos de pintura hay que dar?',
     'Lo normal sobre superficie preparada y sellada son dos manos. Si hace falta una tercera de forma sistemática, casi siempre el problema está en la preparación o en el sellado, no en la pintura.']
  ]
},

'MAT-13': {
  titulo: 'Precio del drywall y los plafones en República Dominicana',
  desc: 'Precios de referencia de planchas de yeso, plancha RH y cementicia, perfilería, plafón acústico, masilla y tornillería en República Dominicana.',
  h1: 'Precio del drywall, los plafones y la construcción liviana en RD',
  intro: [
    'En construcción liviana no se compra un material, se compra un sistema. Una división de drywall necesita plancha, perfilería —parales y canales—, tornillería, masilla de juntas y cinta; cotizar solo la plancha da una idea equivocada del costo. Lo mismo pasa con el plafón acústico, que va acompañado de su suspensión.',
    'La otra decisión que cambia el precio es el tipo de plancha. La regular resuelve interiores secos, la RH (verde) está pensada para ambientes húmedos y la cementicia para zonas de mojado directo y exteriores protegidos. Poner la plancha equivocada en un baño es el error más común y el más caro de corregir.'
  ],
  claves: [
    ['Cotizar el sistema completo', 'Plancha más perfilería más masilla más tornillos. Solo así se compara un presupuesto con otro.'],
    ['La plancha correcta por ambiente', 'Regular en seco, RH en húmedo, cementicia donde hay agua directa. No es un detalle estético.'],
    ['Separación de parales', 'La modulación de la perfilería cambia la cantidad de material y la rigidez del muro. Hay que definirla, no improvisarla.'],
    ['Acabado de juntas', 'El nivel de acabado del masillado determina cuánta masilla y cuánta mano de obra lleva. Es donde se va el tiempo.']
  ],
  faq: [
    ['¿Qué lleva un metro cuadrado de división de drywall?',
     'Plancha en ambas caras, parales y canales de perfilería, tornillería, cinta y masilla de juntas, más el aislamiento si se especifica. Por eso el precio por m² de una división terminada es bastante mayor que el precio de la plancha dividido entre su área.'],
    ['¿Se puede usar drywall en baños?',
     'Sí, siempre que se use la plancha adecuada: RH resistente a la humedad en las zonas húmedas y plancha cementicia donde hay contacto directo con agua, como el área de la ducha antes de revestir. La plancha regular no va en esos puntos.']
  ]
},

'MAT-14': {
  titulo: 'Precio de ferretería, tornillos y fijaciones en RD',
  desc: 'Precios de referencia de clavos, tornillos, tarugos, anclajes, selladores, discos y consumibles de obra en República Dominicana.',
  h1: 'Precio de la ferretería, las fijaciones y los consumibles en RD',
  intro: [
    'Es la categoría que nadie presupuesta y todo el mundo compra. Clavos, tornillos, tarugos, anclajes, selladores, discos de corte y cintas tienen poco valor unitario, pero se consumen durante toda la obra y, sumados, representan una partida real que suele aparecer como «gastos varios» cuando ya se gastó.',
    'La recomendación práctica es tratarlos como lo que son: consumibles asociados a cada partida. Al cubicar encofrado, mampostería o drywall, agregar su consumible correspondiente. Comprar por caja o por libra en lugar de por unidad, y no abaratar los anclajes, que es donde una falla sí tiene consecuencias.'
  ],
  claves: [
    ['Presupuestar por partida', 'Asignar el consumible a la partida que lo usa en lugar de dejarlo en una bolsa de imprevistos.'],
    ['Comprar por caja', 'La compra por unidad en ferretería de barrio es cómoda y cara. Para obra, caja o libra.'],
    ['Los anclajes no se abaratan', 'Un anclaje mal especificado en un elemento que carga es un riesgo estructural, no un ahorro.'],
    ['Control de almacén', 'Es lo que más se pierde en obra. Un control simple de entrega paga su costo rápido.']
  ],
  faq: [
    ['¿Cuánto hay que presupuestar en consumibles de ferretería?',
     'No hay una cifra universal: depende del tipo de obra y de cuánto encofrado, mampostería y construcción liviana tenga. Lo confiable es cubicarlos junto a cada partida —clavos con el encofrado, tornillos con el drywall, discos con los cortes— en vez de estimar un porcentaje global.'],
    ['¿Qué diferencia hay entre un tarugo y un anclaje expansivo?',
     'El tarugo plástico sirve para fijar elementos livianos en pared. El anclaje expansivo metálico está hecho para hormigón y para cargas mayores. Para cualquier elemento que soporte peso o que pueda caer sobre una persona, el tarugo no es suficiente.']
  ]
},

'MAT-15': {
  titulo: 'Precio del aire acondicionado en República Dominicana',
  desc: 'Precios de referencia de equipos split e inverter por BTU, ductos, rejillas, extractores y tubería de cobre en República Dominicana.',
  h1: 'Precio del aire acondicionado y la ventilación en República Dominicana',
  intro: [
    'Los equipos se cotizan por capacidad en BTU, y esa capacidad debe salir de un cálculo de carga térmica, no de una costumbre. Un equipo sobredimensionado enfría rápido, cicla y no seca el ambiente; uno pequeño trabaja permanentemente y se gasta. En el clima dominicano, donde el aire funciona buena parte del año, la eficiencia se paga sola.',
    'El precio del equipo, además, no es el precio de la instalación. La línea de cobre, el aislamiento, el drenaje, la base, el soporte, el circuito eléctrico y la mano de obra van aparte, y en un split residencial pueden representar una parte importante del total. En sistemas con ductos, el ducto se cotiza por pie y las rejillas por unidad.'
  ],
  claves: [
    ['BTU por cálculo', 'Área, orientación, altura de techo, ventanas y ocupación definen la capacidad. No copiar la del vecino.'],
    ['Inverter contra convencional', 'El inverter cuesta más de entrada y consume menos en operación. Con uso intensivo, la diferencia se recupera.'],
    ['La instalación va aparte', 'Cobre, drenaje, soportes y circuito eléctrico son parte del presupuesto y no vienen con el equipo.'],
    ['Mantenimiento programado', 'La limpieza periódica mantiene el consumo y alarga la vida del equipo. Es costo recurrente, no opcional.']
  ],
  faq: [
    ['¿Cuántos BTU necesito?',
     'Se determina con un cálculo de carga térmica que considera el área, la altura del techo, la orientación, el área de ventanas, el aislamiento y la cantidad de personas y equipos. Estimar solo por metros cuadrados es lo que produce equipos mal dimensionados en ambos sentidos.'],
    ['¿El precio del equipo incluye la instalación?',
     'Normalmente no. La tubería de cobre aislada, el drenaje, los soportes, la base, el circuito eléctrico dedicado y la mano de obra se cotizan aparte, y en un split residencial suman una parte relevante del costo final.']
  ]
},

'MAT-16': {
  titulo: 'Precio de las cámaras de seguridad en RD',
  desc: 'Precio de cámaras CCTV bullet, domo, turret y PTZ en República Dominicana, con grabadores, soportes, fuentes y discos de videovigilancia.',
  h1: 'Precio de las cámaras de seguridad y videovigilancia en República Dominicana',
  intro: [
    'La cámara es la parte visible y la más barata de un sistema de videovigilancia. Lo que decide el presupuesto es lo que va detrás: el grabador con la cantidad de canales correcta, el disco dimensionado para los días que se quieran conservar, la fuente de alimentación, el cableado y la canalización. Un sistema de ocho cámaras puede costar el doble que otro con las mismas ocho cámaras, solo por esas decisiones.',
    'La forma de la cámara no es estética, es funcional. La bullet se ve y disuade, y va bien en perímetros. La domo pasa desapercibida y aguanta mejor el vandalismo, por eso domina en interiores comerciales. La turret combina las dos. La PTZ se mueve y hace zoom, cuesta varias veces más y solo se justifica cuando hay alguien mirando o un sistema que la dirija.'
  ],
  claves: [
    ['Canalizar durante la obra gris', 'Dejar tubería y cajas previstas cuesta poco mientras hay pañete abierto. Hacerlo después cuesta el acabado completo.'],
    ['El disco se calcula, no se adivina', 'Los días de grabación que se quieran conservar, por la resolución y la cantidad de cámaras, definen el disco. Pedirlo calculado en la cotización.'],
    ['Disco de videovigilancia, no de escritorio', 'Un disco común no está hecho para escribir 24 horas al día. Los de vigilancia cuestan un poco más y duran años en lugar de meses.'],
    ['PoE ahorra un cableado', 'Alimentar la cámara por el mismo cable de red evita tirar corriente hasta cada punto. Cambia el costo de instalación más que el de los equipos.']
  ],
  faq: [
    ['¿Qué diferencia hay entre una cámara bullet, domo y turret?',
     'La bullet es alargada y visible, ideal para perímetros y disuasión. La domo va dentro de una cúpula, es discreta y más resistente al vandalismo, por eso se usa en interiores comerciales. La turret es una esfera abierta que combina el alcance de la bullet con la discreción de la domo y evita los reflejos del domo en visión nocturna.'],
    ['¿Cuánto disco duro hace falta para un sistema de cámaras?',
     'Depende de la cantidad de cámaras, la resolución, los cuadros por segundo, la compresión y los días que se quieran conservar. Como orden de magnitud, ocho cámaras de 4 MP grabando continuo a 30 días piden varios terabytes. Es un cálculo que el proveedor debe entregar junto con la cotización, no una estimación de última hora.']
  ]
},

'MAT-28': {
  titulo: 'Precio de alarmas y control de acceso en RD',
  desc: 'Precio de paneles de alarma, teclados, detectores de movimiento, lectores de proximidad, cerraduras y cerco eléctrico en República Dominicana.',
  h1: 'Precio de las alarmas y el control de accesos en República Dominicana',
  intro: [
    'Alarma y control de acceso son dos sistemas que comparten cableado, canalización y, muchas veces, el mismo instalador. Se presupuestan por punto: cada puerta con lector, cada ventana con contacto magnético, cada zona con detector de movimiento. Contar los puntos antes de pedir precio es lo que evita que la cotización llegue con la mitad del alcance.',
    'El panel es el corazón y define hasta dónde puede crecer el sistema. Un panel de ocho zonas no se amplía a treinta con un módulo: se cambia. Por eso conviene dimensionarlo por lo que el edificio va a necesitar en cinco años, no por lo que se instala el primer día, sobre todo en proyectos que se entregan por etapas.'
  ],
  claves: [
    ['Se cotiza por punto', 'Cada puerta, ventana y zona es un punto con su detector, su cable y su canalización. El conteo va antes que el precio.'],
    ['El panel define el techo del sistema', 'Cambiar de panel a mitad de camino significa rehacer la programación. Dimensionarlo por el crecimiento previsto.'],
    ['Cableado o inalámbrico', 'El cableado es más confiable y no lleva baterías; el inalámbrico salva la obra terminada. En obra nueva casi siempre gana el cableado.'],
    ['El cerco eléctrico tiene su propia partida', 'Electrificador, aisladores, alambre y señalización van aparte, y la señalización es obligatoria.']
  ],
  faq: [
    ['¿Qué lleva un sistema de alarma completo?',
     'Panel de control, teclado o aplicación para armarlo, detectores de movimiento por zona, contactos magnéticos en puertas y ventanas, sirena interior y exterior, fuente con batería de respaldo y comunicador para avisar afuera. La cantidad de cada cosa sale del conteo de puntos del proyecto.'],
    ['¿Conviene control de acceso con huella o con tarjeta?',
     'La tarjeta o el llavero de proximidad es más rápido, funciona con las manos sucias o con guantes y se reemplaza barato cuando se pierde. La huella no se presta ni se pierde, pero falla más en obra y con manos húmedas. En edificios de oficinas es común combinar los dos.']
  ]
},

'MAT-29': {
  titulo: 'Precio de la detección de incendios en RD',
  desc: 'Precio de detectores de humo y calor, estaciones manuales, sirenas con estrobo, paneles de control y extintores en República Dominicana.',
  h1: 'Precio de la detección y extinción de incendios en República Dominicana',
  intro: [
    'Es la única categoría de sistemas especiales que no es opcional. La detección de incendios se rige por normativa, la revisa el Cuerpo de Bomberos y su aprobación es condición para habilitar la edificación. Eso cambia la lógica del presupuesto: aquí no se elige entre poner o no poner, sino entre resolverlo a tiempo o resolverlo dos veces.',
    'Hay dos familias de sistema y la diferencia se nota en la obra. El convencional agrupa los detectores por zonas y es más económico; el direccionable identifica cuál detector se activó, lo que en un edificio grande es la diferencia entre revisar un piso completo o ir directo al punto. La decisión se toma temprano porque cambia el cableado, no solo los equipos.'
  ],
  claves: [
    ['Lo aprueba Bomberos', 'El sistema tiene que estar diseñado y aprobado, no improvisado. La no objeción del Cuerpo de Bomberos condiciona la habilitación de la obra.'],
    ['Convencional o direccionable', 'La decisión cambia el cableado y el panel, no solo los detectores. Tomarla antes de canalizar.'],
    ['La notificación cuenta tanto como la detección', 'Sirenas y estrobos son parte del sistema y del presupuesto. En áreas ruidosas el estrobo no es opcional.'],
    ['Los extintores llevan mantenimiento', 'Además de la compra, hay recarga y revisión periódica. Es un costo recurrente que conviene dejar dicho desde el principio.']
  ],
  faq: [
    ['¿Qué diferencia hay entre un sistema convencional y uno direccionable?',
     'El convencional divide el edificio en zonas: el panel indica que hay una alarma en la zona 3, y hay que recorrerla para encontrar el punto. El direccionable identifica el detector exacto. El convencional cuesta menos y sirve en edificaciones pequeñas; el direccionable se impone a partir de cierto tamaño porque reduce el tiempo de respuesta.'],
    ['¿Detector de humo o detector de calor?',
     'El de humo detecta antes y es el estándar en pasillos, oficinas y habitaciones. El de calor se usa donde el humo o el vapor son normales —cocinas, calderas, parqueos— porque ahí el de humo daría falsas alarmas todo el día.']
  ]
},

'MAT-30': {
  titulo: 'Precio del cableado estructurado en RD',
  desc: 'Precio de cable UTP y fibra óptica, jacks RJ45, patch panels, racks, placas de pared y cordones de parcheo en República Dominicana.',
  h1: 'Precio del cableado estructurado y las redes en República Dominicana',
  intro: [
    'El cableado estructurado se presupuesta por punto de red, y cada punto es una suma de piezas pequeñas: el cable desde el rack hasta la salida, el jack, la placa de pared, la caja, el puerto del patch panel y el cordón de parcheo en cada extremo. El cable por rollo es la parte visible del costo; las piezas de terminación suelen sumar tanto como él.',
    'La categoría del cable —Cat 5e, Cat 6, Cat 6A— hay que decidirla temprano, porque el cable queda dentro de la pared y cambiarlo después significa romper. Todo lo demás se puede sustituir. La regla práctica: el cable se elige por lo que el edificio va a necesitar dentro de diez años, no por lo que se conecta el primer día.'
  ],
  claves: [
    ['Se cotiza por punto, no por metro', 'Cable, jack, placa, caja, puerto de patch panel y dos cordones. Presupuestar solo el rollo deja fuera la mitad.'],
    ['El cable es lo único que no se cambia', 'Queda dentro de la pared. Elegir la categoría por el horizonte del edificio, no por el uso del primer día.'],
    ['Cobre o fibra', 'El cobre resuelve la distribución dentro del piso. La fibra es para enlaces entre edificios o tramos largos, donde el cobre no llega.'],
    ['El rack ordena o arruina', 'Patch panels, organizadores y bandejas cuestan poco y son la diferencia entre un rack que se puede mantener y uno que no.']
  ],
  faq: [
    ['¿Qué lleva un punto de red completo?',
     'El tramo de cable desde el rack hasta la salida, el jack RJ45, la placa de pared con su caja, un puerto en el patch panel y un cordón de parcheo en cada extremo. Al presupuestar hay que contar las seis cosas: el rollo de cable solo es una parte.'],
    ['¿Cat 6 o Cat 6A?',
     'Cat 6 resuelve con holgura las necesidades de oficina y vivienda de hoy. Cat 6A es blindado, soporta 10 Gbps en tramos completos y cuesta bastante más, en cable y en piezas de terminación. Como el cable queda enterrado en la pared, la pregunta correcta es qué va a necesitar el edificio en diez años.']
  ]
},

'MAT-31': {
  titulo: 'Precio de domótica e intercomunicadores en RD',
  desc: 'Precio de interruptores inteligentes, sensores, hubs, videoporteros e intercomunicadores para apartamentos en República Dominicana.',
  h1: 'Precio de la domótica y los intercomunicadores en República Dominicana',
  intro: [
    'La domótica dejó de ser un lujo y pasó a ser una decisión de instalación eléctrica. El interruptor inteligente que va en la pared necesita neutro en la caja, y esa es la diferencia entre poder instalarlo o no: en la vivienda dominicana tradicional el neutro no llega al interruptor. Definirlo con el electricista antes de cablear cuesta cero; descubrirlo después obliga a soluciones de compromiso.',
    'El intercomunicador es la otra mitad de esta categoría y se presupuesta por apartamento. Un edificio de ocho unidades necesita ocho estaciones interiores, la placa de calle, la fuente y el cableado vertical. Los kits vienen armados por cantidad de apartamentos, y ahí la elección importante es audio o audio y video, porque cambia el cable que hay que dejar en el ducto.'
  ],
  claves: [
    ['El interruptor inteligente pide neutro', 'Hay que preverlo en la caja antes de cerrar la pared. Es la restricción que más veces frustra una instalación de domótica.'],
    ['El intercom se cuenta por apartamento', 'Estación interior por unidad, más la placa de calle, la fuente y el vertical. Los kits ya vienen por cantidad de apartamentos.'],
    ['Audio o audio y video', 'La decisión cambia el cableado del ducto, no solo el equipo. Tomarla antes de tirar el vertical.'],
    ['Cableado o inalámbrico', 'Lo inalámbrico salva una obra terminada, pero depende de baterías y de la cobertura wifi. En obra nueva el cableado sigue ganando.']
  ],
  faq: [
    ['¿Por qué un interruptor inteligente necesita neutro?',
     'Porque necesita alimentarse todo el tiempo, incluso con la luz apagada, para mantener su radio encendida. En la instalación dominicana tradicional al interruptor solo llega la línea viva, así que hay que prever el neutro en la caja durante el cableado. Hay modelos que funcionan sin neutro, pero son más limitados y a veces hacen parpadear los bombillos LED.'],
    ['¿Cómo se presupuesta un intercomunicador para un edificio?',
     'Por cantidad de apartamentos: una estación interior por unidad, más la placa de calle, la fuente de alimentación y el cableado vertical por el ducto. Los kits del mercado vienen armados para 4, 6 u 8 apartamentos; por encima de eso se arma por componentes.']
  ]
},

'MAT-17': {
  titulo: 'Precio de equipos de protección personal (EPP) en RD',
  desc: 'Precios de referencia de cascos, guantes, botas, chalecos, arneses y señalización de obra en República Dominicana.',
  h1: 'Precio del equipo de protección personal y la señalización en RD',
  intro: [
    'El equipo de protección personal es una partida obligatoria del presupuesto de obra, no un extra. Se estima por trabajador y por tiempo de obra, contando la reposición: un casco dura, pero unos guantes se consumen. Sumar la señalización, la cinta de delimitación y los conos, que son los que evitan el accidente antes de que ocurra.',
    'Los distribuidores especializados del rubro trabajan con modelo de cotización B2B: publican catálogo técnico con marcas y certificaciones, pero no precios abiertos. Para el equipo de trabajo en altura conviene además revisar la certificación y, en el caso de arneses y líneas de vida, la recertificación periódica.'
  ],
  claves: [
    ['Estimar por trabajador', 'Dotación inicial más reposición durante el plazo de obra. Es la forma correcta de presupuestarlo.'],
    ['Certificación real', 'El EPP se compra por norma cumplida, no por precio. Un arnés sin certificación no protege.'],
    ['Trabajo en altura aparte', 'Arnés, línea de vida, absorbedor y puntos de anclaje son un sistema completo con su propio costo.'],
    ['Señalización desde el día uno', 'Cinta, conos y señales son de los ítems más baratos del presupuesto y de los que más problemas evitan.']
  ],
  faq: [
    ['¿Cuánto hay que presupuestar de EPP por trabajador?',
     'Depende del oficio y del riesgo: un ayudante necesita casco, guantes, botas y chaleco, mientras que quien trabaja en altura suma arnés y línea de vida. Lo correcto es armar la dotación por oficio y multiplicar por el personal previsto, agregando la reposición del plazo de obra.'],
    ['¿Quién debe pagar el equipo de protección?',
     'La provisión del equipo de protección personal es responsabilidad del empleador y forma parte de los costos indirectos de la obra. Descontarlo del jornal o dejarlo a cuenta del trabajador no es una práctica admisible.']
  ]
},

'MAT-18': {
  titulo: 'Precio de la grama, el paisajismo y el riego en RD',
  desc: 'Precios de referencia de grama natural y artificial por m², tierra vegetal, plantas y sistemas de riego en República Dominicana.',
  h1: 'Precio de la grama, el paisajismo y el riego en República Dominicana',
  intro: [
    'La grama natural se vende por metro cuadrado en alfombra, la tierra vegetal por metro cúbico y las plantas por unidad, pero el costo del área verde terminada casi nunca es la suma de esos precios: la preparación del suelo, el nivelado, el abono y la siembra suelen pesar tanto como el material.',
    'Es también un rubro con mucha oferta informal, sobre todo en grama natural, así que conviene validar con quién se contrata antes de comprometer volumen. Del lado del riego, existen distribuidores especializados con marcas y diseño hidráulico, que es lo que evita que un jardín nuevo se pierda en la primera sequía.'
  ],
  claves: [
    ['Preparar el suelo primero', 'Nivelación, tierra vegetal y abono definen si la grama prende. Sin eso, el material se pierde.'],
    ['Natural o artificial', 'La artificial cuesta más de entrada y no requiere riego ni corte; la natural cuesta menos e implica mantenimiento permanente.'],
    ['El riego se diseña', 'Un sistema por aspersión o goteo necesita diseño hidráulico. Improvisarlo produce zonas secas y consumo alto.'],
    ['Mantenimiento continuo', 'Corte, riego y abono son costo recurrente. Presupuestarlos junto con la siembra.']
  ],
  faq: [
    ['¿Grama natural o artificial?',
     'La natural tiene menor costo inicial pero exige riego, corte y abono de forma permanente. La artificial cuesta bastante más al instalarse y prácticamente no requiere mantenimiento, lo que la hace atractiva en áreas pequeñas, patios de servicio y zonas de difícil riego.'],
    ['¿Cuándo conviene sembrar grama?',
     'Lo más práctico es sembrar antes o durante la temporada de lluvias, para reducir el riego de establecimiento. Si se siembra en seco, hay que garantizar riego constante durante las primeras semanas o el material se pierde.']
  ]
},

'MAT-19': {
  titulo: 'Precio de perfiles y tubos de acero en RD',
  desc: 'Precio por medida de la perfilería cuadrada y rectangular, negra y galvanizada, la tubería negra y las correas tipo Z, en tramos de 20 pies.',
  h1: 'Precio de los perfiles y tubos de acero en República Dominicana',
  intro: [
    'La perfilería es el material de la herrería y de la estructura liviana: portones, rejas, marquesinas, naves, entrepisos metálicos y todo el techo de lámina. Se vende en tramos de 20 pies, que es la unidad completa que factura el suplidor, y el precio cambia con tres cosas al mismo tiempo: la medida de la sección, el espesor de la pared y el acabado.',
    'Ese tercer dato es el que más se pierde al pedir precio por teléfono. Un perfil cuadrado de 1½ x 1½ pulgadas con pared de 1.2 mm y uno de la misma medida con pared de 1.6 mm son dos productos distintos, con dos precios distintos y dos capacidades distintas. Por eso en esta página cada fila trae la pared en milímetros: sin ella, comparar dos cotizaciones es comparar nombres, no materiales.'
  ],
  claves: [
    ['La pared es la mitad del precio', 'A igual medida, subir de 1.2 a 1.6 mm de pared encarece el perfil de forma notable. Pedir siempre la pared en milímetros, no solo «tubo cuadrado de 2 pulgadas».'],
    ['Negro o galvanizado', 'El galvanizado cuesta más y se justifica en exteriores y zonas costeras. En interiores protegidos, el negro pintado suele ser la decisión correcta.'],
    ['La unidad son 20 pies', 'El suplidor factura el tramo completo. Comprar cortado casi siempre sale más caro por pie y, en muchas casas, no admite devolución.'],
    ['El acero se paga al peso', 'Aunque el mostrador cotice por unidad, detrás hay un precio por libra bastante estable dentro de cada familia. Es la mejor forma de detectar una cotización fuera de mercado.']
  ],
  faq: [
    ['¿Qué diferencia hay entre un perfil cuadrado y un tubo negro redondo?',
     'La sección y el uso. El perfil cuadrado o rectangular es más fácil de unir a escuadra y domina en herrería y estructura liviana. El tubo redondo se usa en columnas, postes y estructuras donde importa el comportamiento a torsión. A igual peso, el precio por libra es parecido.'],
    ['¿Por qué me cotizan el perfil por pie si la unidad son 20 pies?',
     'Algunas casas manejan el precio por pie en el sistema, pero facturan la unidad completa de 20 pies. Al comparar precios hay que llevar los dos a la misma base: un precio por pie multiplicado por veinte, o el tramo completo. Si no, la diferencia parece enorme y no lo es.']
  ]
},

'MAT-20': {
  titulo: 'Precio de angulares y planchuelas de hierro en RD',
  desc: 'Precio por medida de angulares, planchuelas y barras lisas de hierro negro en República Dominicana, en barras de 20 pies y con su peso.',
  h1: 'Precio de angulares, planchuelas y barras de hierro en República Dominicana',
  intro: [
    'Es el acero comercial de toda la vida: el angular en L, la planchuela plana —la pletina— y la barra lisa, cuadrada o redonda. Se usa en marcos de puertas y ventanas, rejas, escaleras, refuerzos, bases de equipos y en cualquier detalle que un herrero resuelva soldando. Todo se vende en barras de 20 pies.',
    'La medida es el precio. Un angular de 1 x 1/8 de pulgada y uno de 2 x 1/4 no se parecen en nada: el segundo pesa cuatro veces más y cuesta cuatro veces más. Por eso el listado de abajo va abierto por medida exacta, y no como un renglón genérico de «angular»: en un presupuesto, esa fila genérica es la que después no cuadra.'
  ],
  claves: [
    ['Se paga por libra', 'Dentro de cada familia el precio por libra es casi constante. Un angular que se aparte mucho de ese valor por libra es una cotización que hay que revisar antes de aceptar.'],
    ['La medida completa lleva dos números', 'El ala y el espesor. «Angular de 1 pulgada» no dice nada: hay de 1 x 1/8, 1 x 3/16 y 1 x 1/4, con precios muy distintos.'],
    ['Planchuela no es lo mismo que fleje', 'La planchuela de hierro negro va estructural y soldada. El fleje delgado de ferretería es otro producto y no sustituye a la pletina en un marco cargado.'],
    ['La barra lisa no es varilla', 'La barra redonda lisa no tiene corrugas y no trabaja como refuerzo de hormigón. Para acero de refuerzo, la varilla corrugada grado 60 es lo que corresponde.']
  ],
  faq: [
    ['¿Cuánto pesa un angular de hierro negro?',
     'Depende de la medida: uno de 1 x 1/8 de pulgada pesa alrededor de 16 libras la barra de 20 pies, y uno de 4 x 1/2 pasa de las 250. El peso es el mejor dato para verificar una cotización, porque el mercado del acero comercial se mueve con un precio por libra bastante parejo.'],
    ['¿Puedo usar barra redonda lisa en lugar de varilla corrugada?',
     'No para acero de refuerzo. La corruga es la que genera la adherencia con el hormigón y está normada. La barra lisa se usa en herrería, pasadores, ejes y elementos decorativos.']
  ]
},

'MAT-21': {
  titulo: 'Precio de tolas y láminas de acero en RD',
  desc: 'Precio por espesor de las tolas negras, corrugadas antideslizantes y galvanizadas en República Dominicana, en planchas de 4 x 8 y 4 x 10 pies.',
  h1: 'Precio de las tolas y láminas de acero en República Dominicana',
  intro: [
    'La tola es la plancha de acero, y en obra aparece en más sitios de los que uno espera: tapas de registro, rampas, bases de máquina, refuerzos, tanques, escalones antideslizantes y todo tipo de trabajo de calderería. Se identifica por dos datos, el espesor y la medida de la plancha, y se vende por plancha completa.',
    'Hay tres familias que no se sustituyen entre sí. La tola negra es acero laminado sin recubrimiento, la más común y la más barata por libra. La corrugada trae relieve antideslizante y va en pisos y rampas de tránsito. La galvanizada trae recubrimiento de zinc y es la que aguanta intemperie. Al pedir precio conviene decir cuál de las tres, porque la diferencia es grande.'
  ],
  claves: [
    ['Espesor y medida de plancha', 'Los dos datos juntos. Una tola de 1/8 en 4 x 8 pies y la misma de 1/8 en 5 x 10 son planchas distintas y precios distintos.'],
    ['El peso verifica el precio', 'La plancha se paga al peso. Conocer las libras de la plancha permite comprobar si una cotización está dentro de mercado.'],
    ['Corte y desperdicio', 'Casi nunca se usa la plancha entera. Al presupuestar hay que contar el desperdicio del despiece y, si aplica, el costo de corte del suplidor.'],
    ['Galvanizada para intemperie', 'La tola negra a la intemperie se oxida rápido en clima costero. Si va a quedar expuesta, la galvanizada o un sistema de pintura completo dejan de ser opcionales.']
  ],
  faq: [
    ['¿Cuál es la diferencia entre tola negra, corrugada y galvanizada?',
     'La negra es acero laminado sin recubrimiento, de uso general. La corrugada trae un relieve en relieve para dar agarre y va en pisos, rampas y escalones. La galvanizada lleva recubrimiento de zinc y resiste la intemperie. Se piden por espesor y por medida de plancha.'],
    ['¿En qué medidas viene la plancha?',
     'Las más comunes en el mercado dominicano son 4 x 8 pies, 4 x 10 y 5 x 10, con espesores desde 1/32 hasta 1 pulgada. No todas las combinaciones están disponibles en todo momento: conviene confirmar existencia antes de cerrar un despiece.']
  ]
},

'MAT-22': {
  titulo: 'Precio de la malla ciclónica en República Dominicana',
  desc: 'Precio del rollo de malla ciclónica por calibre y altura, más alambre de púas, telas metálicas y los herrajes de la verja, en RD.',
  h1: 'Precio de la malla ciclónica y el cerramiento perimetral en República Dominicana',
  intro: [
    'Cerrar un solar es de las primeras partidas de cualquier obra y una de las más fáciles de cotizar mal, porque casi nadie pide la malla completa. Una verja no es solo el rollo: son los postes, las abrazaderas, los brazos, las copas terminales y tensoras, el alambre de púas de remate y la mano de obra. Pedir precio de «malla ciclónica» a secas deja fuera la mitad del costo.',
    'El rollo se define por dos datos: el calibre del alambre y la altura. Un rollo calibre 9 de 6 pies y uno calibre 11 de 3 pies son productos distintos, y entre el más caro y el más barato del listado hay más del doble de diferencia. El calibre 9 es más grueso y va en cerramiento definitivo; el 11 se usa en cercas provisionales de obra y divisiones internas.'
  ],
  claves: [
    ['Calibre y altura, siempre juntos', 'Los dos datos determinan el precio. El calibre 9 es el de cerramiento permanente; el 11 aguanta menos y se usa en cercas de obra.'],
    ['La verja no es solo la malla', 'Postes, abrazaderas, brazos, copas y tensores pueden acercarse al costo del rollo. Conviene cotizarlos en la misma partida para no descubrirlos después.'],
    ['Revestida en PVC para la costa', 'La malla galvanizada con revestimiento plástico cuesta más pero dura mucho más en ambiente salino. En primera línea de costa deja de ser un lujo.'],
    ['La tela metálica es otra cosa', 'La tela de cuadrito y la de gallinero se venden por yarda y se piden por calibre y retícula. No sustituyen a la ciclónica en cerramiento perimetral.']
  ],
  faq: [
    ['¿Cuánto mide un rollo de malla ciclónica?',
     'En el mercado dominicano el rollo estándar trae 50 pies de largo, y la altura va de 3 a 8 pies según el uso. La altura es la que se pide primero, porque define cuántos rollos hacen falta para el perímetro y qué largo deben tener los postes.'],
    ['¿Qué diferencia hay entre calibre 9 y calibre 11?',
     'El número indica el grosor del alambre y va al revés: mientras más bajo el calibre, más grueso el alambre. El 9 es más resistente y es el que se usa en cerramiento definitivo; el 11 es más liviano y económico, y se reserva para cercas provisionales de obra o divisiones internas.']
  ]
},

'MAT-23': {
  titulo: 'Precio de los perfiles de aluminio en RD',
  desc: 'Precio por medida de angulares, planchuelas, tubos y molduras de aluminio en República Dominicana, en tramos de 19.20 pies.',
  h1: 'Precio de los perfiles de aluminio en República Dominicana',
  intro: [
    'El aluminio comercial se vende en tramos de 19.20 pies —unos 5.85 metros— y esa es la unidad que se factura. Aparece en marcos de ventana y screen, divisiones, remates, plafones, muebles y todo el trabajo de terminación donde el hierro se oxidaría o pesaría de más.',
    'Es un rubro donde el catálogo del suplidor manda: buena parte de los perfiles se identifican por código de extrusora, no por medida, y dos piezas con el mismo nombre pueden ser dos secciones distintas. En esta página solo entran las medidas que el comercio declara de forma inequívoca; para las que van por código hay que pedir la muestra o el número de pieza.'
  ],
  claves: [
    ['El tramo son 19.20 pies', 'No 20. Al cubicar un marco o una división hay que contar con esa medida, que es la que sale de la extrusora y la que factura el suplidor.'],
    ['El espesor no siempre se declara', 'Dos angulares de la misma medida pueden tener paredes distintas. Si la pieza va a cargar, hay que confirmar el espesor antes de cerrar el precio.'],
    ['Natural o anodizado', 'El aluminio natural es el más barato; anodizado o pintado cuesta más y aguanta mejor la intemperie y el ambiente salino.'],
    ['Se pide por número de pieza', 'En perfilería de ventanería el mercado trabaja con códigos de extrusora. Guardar el número de la pieza usada ahorra tiempo en la próxima compra.']
  ],
  faq: [
    ['¿Por qué el aluminio viene en 19.20 pies y no en 20?',
     'Es la longitud estándar de salida de las extrusoras que abastecen el mercado local, equivalente a 5.85 metros. Conviene tenerlo presente al cubicar: un cálculo hecho con tramos de 20 pies se queda corto.'],
    ['¿El aluminio sirve para elementos estructurales?',
     'Para estructura de obra, no. El aluminio comercial de esta página va en ventanería, divisiones, remates y muebles. Los elementos que cargan se resuelven con acero, que es lo que está en las páginas de perfiles, angulares y tolas.']
  ]
},

'MAT-24': {
  titulo: 'Precio de los inodoros en República Dominicana',
  desc: 'Precio de inodoros de una y dos piezas, tanques, basinetas y urinarios en RD, con marca y modelo, para presupuestar el equipamiento de baños.',
  h1: 'Precio de los inodoros y urinarios en República Dominicana',
  intro: [
    'El inodoro es la partida que más se repite en un proyecto residencial y la que más se subestima al presupuestar, porque el rango es enorme: entre el modelo más económico y uno de gama alta hay cinco o seis veces de diferencia. Multiplicado por la cantidad de baños de un edificio, esa decisión mueve el presupuesto más que muchas partidas de obra gris.',
    'Hay una trampa que conviene conocer: el inodoro de dos piezas casi nunca se vende completo. El comercio factura el tanque por un lado y la basineta por otro, con precios separados. Quien cotiza mirando solo el tanque se queda corto por más de la mitad. En el listado de abajo las dos piezas aparecen por separado, tal como se compran, y cada una dice qué es.'
  ],
  claves: [
    ['Tanque y basineta se suman', 'El inodoro de dos piezas son dos partidas. Verificar siempre que la cotización incluya ambas, y del mismo modelo y color.'],
    ['Una pieza o dos piezas', 'El de una pieza cuesta más pero se instala más rápido y se limpia mejor. El de dos piezas domina en vivienda económica y en obra de volumen.'],
    ['El asiento no siempre viene incluido', 'Algunos modelos lo traen y otros no. Revisar la ficha antes de cerrar el precio, porque el asiento se cotiza aparte.'],
    ['Redondo o elongado', 'El elongado es más cómodo y ocupa unos centímetros más. En baños pequeños el redondo puede ser la única opción que entra.']
  ],
  faq: [
    ['¿Por qué el tanque y la basineta tienen precios separados?',
     'Porque el comercio los vende como piezas independientes: cada una tiene su propio código y su propio precio. Un inodoro de dos piezas completo es la suma de las dos, del mismo modelo y color. Al presupuestar hay que contar las dos líneas.'],
    ['¿Qué diferencia hay entre un inodoro de una pieza y uno de dos?',
     'El de una pieza viene fundido en un solo cuerpo de cerámica: cuesta más, se instala más rápido y no tiene la junta entre tanque y taza, que es donde se acumula la suciedad. El de dos piezas es más económico y es el que domina en vivienda de volumen.']
  ]
},

'MAT-25': {
  titulo: 'Precio de los lavamanos en República Dominicana',
  desc: 'Precio de lavamanos de pedestal, de sobreponer y de empotrar en RD, con marca y modelo, más pedestales y palometas de soporte.',
  h1: 'Precio de los lavamanos y pedestales en República Dominicana',
  intro: [
    'El lavamanos se decide por cómo se monta, y esa decisión arrastra el resto del baño. El de pedestal esconde la tubería y no necesita mueble. El de sobreponer va encima de una cubierta o de un mueble y suele ser el de mayor efecto visual. El de empotrar se instala dentro de la cubierta y pide un tope de granito, mármol o porcelanato que hay que presupuestar aparte.',
    'Igual que con el inodoro, hay piezas que se venden por separado. El pedestal tiene su propio código y su propio precio: un lavamanos de pedestal son dos partidas. Y el de sobreponer sobre pared necesita palometas, que son los soportes metálicos que lo sostienen. Ninguna de las dos cosas viene incluida.'
  ],
  claves: [
    ['El pedestal se cotiza aparte', 'Lavamanos y pedestal son dos códigos distintos. Contar las dos líneas o el presupuesto queda corto.'],
    ['El de empotrar arrastra la cubierta', 'Si el lavamanos va dentro de un tope, ese tope —granito, mármol, porcelanato— es una partida adicional y suele costar más que el aparato.'],
    ['Uno, dos o tres agujeros', 'El número de perforaciones define qué grifería entra. Un lavamanos de un agujero no admite una mezcladora de tres piezas.'],
    ['Con o sin rebosadero', 'El rebosadero cambia el desagüe que hay que comprar. Es un detalle chico que detiene una instalación.']
  ],
  faq: [
    ['¿El precio del lavamanos incluye el pedestal?',
     'No. En el catálogo del comercio son dos artículos con precios distintos, y así aparecen aquí. Un lavamanos de pedestal completo es la suma de los dos, del mismo modelo y color.'],
    ['¿Qué es una palometa y cuándo hace falta?',
     'Es el soporte metálico que se ancla a la pared para sostener un lavamanos que no lleva pedestal ni mueble. Va oculta bajo el aparato y se cotiza por unidad, generalmente en par.']
  ]
},

'MAT-26': {
  titulo: 'Precio de muebles y espejos de baño en RD',
  desc: 'Precio de muebles de baño con lavamanos, botiquines, espejos y cabinas de ducha en República Dominicana, con marca y modelo.',
  h1: 'Precio de los muebles, espejos y botiquines de baño en República Dominicana',
  intro: [
    'Es la partida de terminación del baño y la más visible para el cliente final. El mueble con lavamanos resuelve almacenamiento y desagüe en una sola compra, y por eso ha ido desplazando al lavamanos de pedestal en vivienda de gama media y alta. El botiquín y el espejo completan el conjunto sobre el lavamanos.',
    'A la hora de presupuestar hay dos cosas que conviene fijar temprano: si el mueble viene con el lavamanos incluido o hay que comprarlo aparte, y si el espejo lleva luz. Los espejos y botiquines con LED necesitan una salida eléctrica prevista en la pared, y eso hay que decidirlo antes de que el electricista cierre el pañete, no después.'
  ],
  claves: [
    ['¿Trae lavamanos el mueble?', 'Algunos modelos vienen con la cubierta y el lavamanos incluidos y otros no. Es la diferencia más común entre dos cotizaciones que parecen iguales.'],
    ['El espejo con luz pide instalación eléctrica', 'Un botiquín o espejo LED necesita punto eléctrico previsto. Definirlo antes de cerrar el pañete evita romper pared después.'],
    ['Suspendido o de piso', 'El mueble suspendido despeja el piso y facilita la limpieza, pero exige un anclaje firme y define la altura del desagüe.'],
    ['La cabina cambia la albañilería', 'Una cabina prefabricada tiene medidas fijas. Si se decide después de levantar los muros, casi nunca calza.']
  ],
  faq: [
    ['¿El mueble de baño incluye el lavamanos?',
     'Depende del modelo: unos vienen con la cubierta y el lavamanos y otros se venden solo como mueble. Es lo primero que hay que confirmar al comparar dos precios, porque explica buena parte de la diferencia.'],
    ['¿Qué hay que prever para un espejo o botiquín con luz LED?',
     'Un punto eléctrico en la pared, a la altura del espejo, y protección del circuito del baño. Conviene definirlo en la etapa de instalaciones: dejarlo para el final significa romper pañete y cerámica ya terminados.']
  ]
},

'MAT-27': {
  titulo: 'Precio de los accesorios de baño en RD',
  desc: 'Precio de juegos de accesorios de baño, toalleros, portapapel, barras de seguridad y secadores de manos en República Dominicana.',
  h1: 'Precio de los accesorios de baño en República Dominicana',
  intro: [
    'Es la última partida del baño y la que más veces se olvida en el presupuesto original. Individualmente cada pieza cuesta poco; multiplicada por la cantidad de baños de un proyecto, el juego de accesorios se convierte en una cifra que conviene tener desde el principio y no descubrir al final.',
    'Se compra de dos formas y no dan lo mismo. El juego completo —toallero, portapapel, jabonera y portacepillos de la misma línea— sale más económico y garantiza que todo combine. Las piezas sueltas tienen sentido cuando hay que igualar una línea existente o cuando el proyecto pide algo específico, como las barras de seguridad de un baño accesible.'
  ],
  claves: [
    ['El juego sale mejor que las piezas sueltas', 'Comprar el kit de la misma línea cuesta menos y evita que el acabado de una pieza no combine con el resto.'],
    ['Las barras de seguridad no son un accesorio más', 'En baños accesibles y en proyectos hoteleros y de salud son obligatorias, y su anclaje tiene que resolverse en el muro, no en la cerámica.'],
    ['El acabado tiene que aguantar el ambiente', 'En zona costera el cromo económico se pica. Acero inoxidable o latón con buen acabado cuestan más y duran.'],
    ['Se instalan al final, se deciden al principio', 'El anclaje de un toallero o de una barra depende de dónde quedaron los blocks y las juntas de la cerámica.']
  ],
  faq: [
    ['¿Qué trae un juego de accesorios de baño?',
     'Lo habitual son cuatro a seis piezas de la misma línea: toallero de barra, toallero de anilla, portapapel, jabonera y portacepillos, a veces con gancho. La cantidad viene indicada en el nombre del producto y cambia bastante el precio.'],
    ['¿Cuántas barras de seguridad lleva un baño accesible?',
     'Como mínimo una junto al inodoro y otra en la ducha, con el anclaje resuelto contra el muro y no solo contra la cerámica. En proyectos hoteleros y de salud la cantidad y la posición las fija la normativa del proyecto.']
  ]
},

'MOS-01': {
  titulo: 'Precio del jornal de albañil y mano de obra en RD',
  desc: 'Jornales diarios de referencia de maestro constructor, albañil, ayudante, plomero, electricista, pintor y demás oficios en República Dominicana.',
  h1: 'Precio del jornal y la mano de obra por oficio en República Dominicana',
  intro: [
    'El jornal es el pago diario por oficio y es la base de casi todo presupuesto de obra dominicano. Varía por oficio, por zona y por la demanda del momento: en épocas de mucha construcción, conseguir un buen varillero o un ceramiquero cuesta más que el promedio, simplemente porque hay menos disponibles.',
    'Una precisión importante para presupuestar: la mano de obra normalmente no lleva ITBIS, y el jornal tampoco es el costo total del trabajador. A eso hay que sumarle la seguridad social, el equipo de protección, la supervisión y el tiempo improductivo. Un presupuesto que multiplica jornal por días se queda corto.'
  ],
  claves: [
    ['Jornal contra ajuste', 'Por jornal se paga el día trabajado; por ajuste se paga la partida terminada. El ajuste traslada el riesgo de rendimiento al contratista.'],
    ['La cuadrilla, no el individuo', 'Un albañil rinde con su ayudante. Presupuestar cuadrillas completas da estimados mucho más cercanos a la realidad.'],
    ['La zona cambia el jornal', 'Los polos con mucha obra en marcha presionan los jornales hacia arriba. El promedio nacional no sirve para una obra concreta.'],
    ['Costo real por encima del jornal', 'Seguridad social, EPP, supervisión, herramientas y tiempo perdido son parte del costo de la mano de obra.']
  ],
  faq: [
    ['¿Conviene pagar por jornal o por ajuste?',
     'El jornal da flexibilidad y control de calidad, y funciona bien en trabajos difíciles de medir o que cambian sobre la marcha. El ajuste da certeza de costo por partida y premia el rendimiento, pero exige una medición clara y una supervisión que cuide la calidad, porque el incentivo es terminar rápido.'],
    ['¿El jornal incluye las prestaciones laborales?',
     'No. El jornal es el pago por el día trabajado. La seguridad social y las obligaciones laborales que correspondan según la relación contractual son un costo adicional que el presupuesto de obra debe contemplar aparte.']
  ]
},

'MOS-02': {
  titulo: 'Precio de mano de obra por partida en RD (m², ml, punto)',
  desc: 'Precios unitarios de referencia de ejecución en RD: colocación de blocks, pañete, fino, encofrado, cerámica, pintura y drywall, solo mano de obra.',
  h1: 'Precio de la mano de obra por partida en República Dominicana',
  intro: [
    'Aquí el trabajo se contrata por unidad terminada —metro cuadrado de pañete, metro lineal de zabaleta, punto eléctrico, metro cúbico vaciado— y no por día. Es la forma más usada para subcontratar partidas completas, porque da certeza de costo y traslada el riesgo de rendimiento a quien ejecuta.',
    'Un punto que genera muchos malentendidos: estos precios son solo mano de obra. El material lo pone el dueño de la obra. Cuando un presupuesto de colocación de cerámica parece barato o caro frente a otro, casi siempre la diferencia está en si incluye o no el pegamento, el derretido y los consumibles.'
  ],
  claves: [
    ['Solo mano de obra', 'Salvo que se diga lo contrario, el material corre por cuenta del dueño. Dejarlo escrito evita el conflicto clásico.'],
    ['Definir cómo se mide', 'Si el pañete se mide por cara, si se descuentan vanos, si los cantos van aparte. La medición es la mitad del acuerdo.'],
    ['Andamios y consumibles', 'Aclarar quién pone andamios, agua, energía y consumibles. Son costos reales que alguien tiene que asumir.'],
    ['Avances y retención', 'Pagar contra avance medido y retener un porcentaje hasta la recepción protege a ambas partes.']
  ],
  faq: [
    ['¿El precio por metro cuadrado incluye el material?',
     'En los precios unitarios de ejecución, no: cubren la mano de obra de la partida. El cemento, la arena, el pegamento, la cerámica o la pintura los suministra el dueño de la obra. Siempre debe quedar explícito en el acuerdo qué incluye y qué no.'],
    ['¿Cómo se mide el pañete?',
     'Por metro cuadrado de superficie efectivamente revestida. Lo que hay que acordar de antemano es si se descuentan los vanos de puertas y ventanas y si los cantos y mochetas se pagan aparte por metro lineal, porque ahí se concentra la mayoría de los desacuerdos.']
  ]
},

'MOS-03': {
  titulo: 'Precio del diseño arquitectónico y la supervisión en RD',
  desc: 'Honorarios de referencia de diseño arquitectónico, cálculo estructural, topografía, estudio de suelo, supervisión y tasación en República Dominicana.',
  h1: 'Honorarios de diseño, cálculo y supervisión de obra en RD',
  intro: [
    'Los servicios profesionales se cotizan de tres formas distintas y conviene saber cuál aplica: por metro cuadrado de proyecto, como porcentaje del presupuesto de obra, o por ajuste cerrado. El diseño arquitectónico y el cálculo estructural suelen ir por m²; la supervisión y la gerencia de obra, por porcentaje; los estudios previos, por ajuste.',
    'Es la partida que más se intenta recortar y la que peor se recorta. Un cálculo estructural mal pagado se paga después en acero de más o, mucho peor, en acero de menos. Y una obra sin supervisión independiente pierde en calidad y en control de costos bastante más de lo que costaba supervisarla.'
  ],
  claves: [
    ['Definir el alcance', 'Un anteproyecto no es un juego de planos constructivos. La mitad de los desacuerdos de honorarios nacen de un alcance mal escrito.'],
    ['Estudios previos primero', 'Topografía y estudio de suelo se hacen antes de diseñar la cimentación. Hacerlos después es rediseñar.'],
    ['Porcentaje o ajuste', 'La supervisión por porcentaje sigue el tamaño de la obra; por ajuste mensual da certeza. Cualquiera funciona si el alcance está claro.'],
    ['Profesional habilitado', 'Los planos y las memorias los firma un profesional habilitado. Es requisito para tramitar, no una formalidad.']
  ],
  faq: [
    ['¿Cuánto cuesta el diseño de una casa?',
     'Se cotiza normalmente por metro cuadrado de construcción y varía según el alcance: no es lo mismo un anteproyecto que un juego completo de planos arquitectónicos, estructurales y de instalaciones listos para tramitar y construir. Lo primero al pedir precio es definir hasta dónde llega el trabajo.'],
    ['¿Vale la pena pagar supervisión de obra?',
     'Cuando quien construye no es quien diseñó, la supervisión independiente es la que verifica que lo ejecutado corresponde a los planos y que las cantidades pagadas son las realmente colocadas. En obras de cierto tamaño, lo que detecta suele costar más que sus honorarios.']
  ]
},

'MOS-04': {
  titulo: 'Costo de licencias y permisos de construcción en RD',
  desc: 'Trámites y permisos de construcción en República Dominicana: licencia MOPC, uso de suelo, medio ambiente, bomberos y conexiones de servicios.',
  h1: 'Licencias y permisos de construcción en República Dominicana',
  intro: [
    'Esta es la única categoría del catálogo donde no publicamos montos, y es a propósito. Las licencias, no objeciones y conexiones se liquidan según tarifarios oficiales que dependen del tipo de obra, del costo declarado, de la superficie y de la institución que corresponda. Poner una cifra genérica sería inventar un dato.',
    'Lo que sí se puede decir es cómo presupuestarlo bien: registrar por separado la tasa oficial que se paga a la institución y los honorarios de gestión de quien tramita, porque son dos cosas distintas. Y contar el tiempo, que en trámites suele ser un costo mayor que el monto: una obra parada esperando un permiso paga alquileres, vigilancia y financiamiento.'
  ],
  claves: [
    ['Tasa y honorarios separados', 'La tasa oficial va a la institución; la gestión es un servicio. Mezclarlas impide controlar el presupuesto.'],
    ['Qué aplica a cada obra', 'No todas las obras requieren los mismos permisos. El tipo, la escala y la ubicación definen la lista.'],
    ['El tiempo es costo', 'Los plazos de tramitación se planifican como cualquier otra actividad del programa de obra.'],
    ['Documentación completa', 'La mayoría de los atrasos vienen de expedientes incompletos, no de la institución.']
  ],
  faq: [
    ['¿Por qué no publican un precio de la licencia de construcción?',
     'Porque no existe un precio único: se liquida según el tarifario oficial vigente, en función del tipo de obra, su superficie y su costo declarado, y varía además según la institución y el ayuntamiento que corresponda. Publicar una cifra genérica daría un dato falso.'],
    ['¿Qué permisos necesita una obra en República Dominicana?',
     'Depende del proyecto. Lo habitual incluye la licencia de construcción, el uso de suelo o permiso municipal, y las conexiones de agua y electricidad; según el tipo y la ubicación pueden sumarse la no objeción ambiental, la aprobación del Cuerpo de Bomberos y permisos sectoriales. La lista exacta se define con el proyecto en mano.']
  ]
},

'MOS-05': {
  titulo: 'Precio de demolición, movimiento de tierra y bote en RD',
  desc: 'Precios de referencia de demolición, movimiento de tierra, bote de escombros, fletes, fumigación, limpieza final y vigilancia de obra en RD.',
  h1: 'Precio de demolición, movimiento de tierra y servicios de obra en RD',
  intro: [
    'Son los servicios que abren y cierran la obra, y los que más se subestiman al presupuestar. La demolición se cotiza por metro cuadrado o cúbico, el movimiento de tierra por metro cúbico o por hora de equipo, y el bote de escombros por viaje. Tres unidades distintas para una misma etapa, lo que obliga a cubicar con cuidado.',
    'El error clásico es olvidar el bote. Demoler no incluye retirar: el escombro hay que cargarlo, transportarlo y depositarlo en un vertedero autorizado, y ese costo por viaje suele ser comparable al de la demolición misma. Algo parecido pasa con la limpieza final, que se descubre cuando la obra ya debía entregarse.'
  ],
  claves: [
    ['El bote va aparte', 'Confirmar siempre si la demolición incluye carga, transporte y disposición. Casi nunca es así.'],
    ['El volumen crece al excavar', 'La tierra excavada ocupa más suelta que en banco. Cubicar el bote con ese esponjamiento, no con el volumen teórico.'],
    ['Los accesos condicionan', 'Un solar sin acceso para volquete o retro cambia por completo el método y el precio.'],
    ['Servicios continuos', 'Vigilancia, baños portátiles y limpieza son costos mensuales que corren todo el plazo de obra.']
  ],
  faq: [
    ['¿El precio de la demolición incluye el bote de escombros?',
     'Por lo general no. La demolición cubre tumbar y acopiar; retirar el material implica carga, transporte y disposición en vertedero autorizado, y se cotiza por viaje. Es una de las omisiones más frecuentes en los presupuestos de remodelación.'],
    ['¿Por qué el volumen de tierra a botar es mayor que el excavado?',
     'Porque al removerse, el material se esponja y ocupa más volumen suelto del que tenía en banco. Al calcular la cantidad de viajes hay que trabajar con el volumen suelto, no con el teórico de la excavación.']
  ]
},

'EQU-01': {
  titulo: 'Precio del alquiler de maquinaria pesada en RD',
  desc: 'Tarifas de referencia de alquiler de retroexcavadora, excavadora, minicargador, rodillo, motoniveladora y camión volteo en República Dominicana.',
  h1: 'Precio del alquiler de maquinaria pesada en República Dominicana',
  intro: [
    'La maquinaria pesada se alquila por hora, por día o por mes, normalmente con operador. Antes de comparar tarifas hay que igualar tres cosas que muchas veces quedan fuera: si el operador está incluido, quién pone el combustible y cómo se cobra la movilización del equipo hasta la obra.',
    'La movilización es el costo escondido de esta categoría. Traer una excavadora en lowboy hasta un solar tiene un precio que no depende de las horas que trabaje, así que en trabajos cortos puede pesar más que el alquiler mismo. Por eso conviene agrupar el trabajo de máquina en la menor cantidad de movilizaciones posible.'
  ],
  claves: [
    ['Operador y combustible', 'Preguntarlo siempre y por escrito. Es la diferencia más común entre dos tarifas que parecen iguales.'],
    ['Movilización aparte', 'El traslado del equipo se cobra por separado. En trabajos cortos puede superar el alquiler.'],
    ['Mínimo de horas', 'La mayoría de los alquileres tiene un mínimo facturable por jornada. Planificar el trabajo para aprovecharlo.'],
    ['Rendimiento sobre tarifa', 'Una máquina más grande y más cara por hora puede salir más barata si termina en la mitad del tiempo.']
  ],
  faq: [
    ['¿El alquiler incluye operador y combustible?',
     'El operador suele venir incluido en la maquinaria pesada, pero el combustible con frecuencia corre por cuenta de la obra. Como no es un estándar del mercado, hay que pedir que la cotización lo diga expresamente junto con el mínimo de horas y la movilización.'],
    ['¿Conviene alquilar por hora o por día?',
     'Por hora funciona para trabajos puntuales y cortos, siempre que se respete el mínimo facturable. Cuando el trabajo ocupa la jornada o hay que movilizar el equipo, la tarifa diaria casi siempre resulta más conveniente.']
  ]
},

'EQU-02': {
  titulo: 'Precio del alquiler de equipos de construcción en RD',
  desc: 'Tarifas de referencia de alquiler de mezcladora, vibrador, compactadora, martillo demoledor, hidrolavadora, planta eléctrica y soldadora en RD.',
  h1: 'Precio del alquiler de equipos de construcción en República Dominicana',
  intro: [
    'Mezcladoras, vibradores, compactadoras, martillos demoledores y plantas eléctricas se alquilan por día o por semana, y en obras cortas casi siempre conviene alquilar antes que comprar. El cálculo es simple: si el equipo se va a usar unos pocos días al año, el alquiler gana; si va a estar en uso continuo durante meses, la compra empieza a tener sentido.',
    'Lo que suele quedar fuera de la comparación son los consumibles y el depósito. Discos, electrodos, puntas, combustible y aceite corren normalmente por cuenta de quien alquila, y muchos proveedores piden un depósito en garantía que hay que contemplar en el flujo de caja de la obra.'
  ],
  claves: [
    ['Alquilar o comprar', 'Comparar el alquiler por los días de uso reales contra el precio de compra más su mantenimiento.'],
    ['Consumibles aparte', 'Discos, electrodos, puntas y combustible no vienen con el equipo.'],
    ['Depósito en garantía', 'Es dinero inmovilizado durante el alquiler. Contarlo en el flujo, no solo en el costo.'],
    ['Recibir el equipo probado', 'Verificar funcionamiento y estado al recibir, y dejarlo documentado. Evita cargos al devolver.']
  ],
  faq: [
    ['¿Conviene comprar o alquilar un equipo de construcción?',
     'La regla práctica es comparar el costo de alquiler por los días de uso previstos contra el precio de compra más el mantenimiento y el almacenamiento. Para equipos de uso esporádico, el alquiler es claramente mejor; para los de uso continuo en una empresa constructora, la compra se amortiza.'],
    ['¿Qué incluye el alquiler de un equipo?',
     'Normalmente el equipo funcionando y su mantenimiento básico. Los consumibles, el combustible y el transporte hasta la obra suelen ir por cuenta de quien alquila, y es frecuente que se pida un depósito en garantía.']
  ]
},

'EQU-03': {
  titulo: 'Precio del alquiler de andamios y formaleta en RD',
  desc: 'Tarifas de referencia de alquiler mensual de andamios, puntales metálicos, formaleta y escaleras de obra en República Dominicana.',
  h1: 'Precio del alquiler de andamios, puntales y formaleta en RD',
  intro: [
    'El andamiaje y el apuntalamiento se alquilan por mes: por sección de andamio, por puntal o por metro cuadrado de formaleta. Como el alquiler corre mientras el equipo esté en obra, el costo real no lo determina la tarifa sino el tiempo: un ritmo de obra lento multiplica esta partida sin que nadie lo note hasta la factura.',
    'La formaleta metálica frente a la de madera es una decisión de repetición. Cuando hay muchos elementos iguales, la formaleta metálica da mejor acabado y más ciclos; en obras pequeñas o con geometría irregular, la madera sigue siendo más flexible y más barata.'
  ],
  claves: [
    ['El tiempo es el costo', 'Al alquilarse por mes, cada semana de atraso se paga. Devolver lo que ya no se usa.'],
    ['Transporte y montaje', 'Rara vez están incluidos en la tarifa y pueden ser una parte importante del total.'],
    ['Faltantes al devolver', 'Crucetas, tornillos y accesorios perdidos se cobran. Llevar inventario desde la recepción.'],
    ['Seguridad del montaje', 'Un andamio mal arriostrado es el riesgo más común de la obra. El montaje correcto no es opcional.']
  ],
  faq: [
    ['¿Cuántas secciones de andamio necesito?',
     'Se estima a partir de la altura a cubrir y del frente de trabajo simultáneo, no de la superficie total de la fachada. Conviene dimensionar para el avance real de la cuadrilla y devolver las secciones que ya no se usan, porque el alquiler corre por mes.'],
    ['¿Formaleta metálica o de madera?',
     'La metálica rinde más ciclos y deja mejor acabado, así que compensa cuando hay muchos elementos repetidos. La de madera se adapta mejor a geometrías irregulares y a obras pequeñas, donde el volumen no justifica el alquiler del sistema metálico.']
  ]
},

'EQU-04': {
  titulo: 'Precio de herramientas y equipo menor de obra en RD',
  desc: 'Precios de referencia de carretillas, palas, picos, niveles láser y cintas métricas para obra en República Dominicana.',
  h1: 'Precio de herramientas y equipo menor de construcción en RD',
  intro: [
    'A diferencia del resto del grupo de equipos, esta categoría es de compra y no de alquiler. Son las herramientas que la obra necesita desde el primer día y que se reponen durante todo el plazo: carretillas, palas, picos, cubos, niveles y cintas métricas.',
    'Es una partida pequeña frente al total, pero conviene presupuestarla explícitamente por dos razones. La primera es que se pierde y se rompe, así que hay reposición. La segunda es que la herramienta barata rinde menos y dura menos: una carretilla que se dobla a mitad de obra cuesta el doble, contando el tiempo perdido.'
  ],
  claves: [
    ['Presupuestar la reposición', 'La herramienta menor se pierde y se rompe. Estimar reposición para el plazo completo de la obra.'],
    ['Calidad sobre precio unitario', 'En herramienta de uso diario, lo barato se compra dos veces.'],
    ['Control de almacén', 'Un registro simple de entrega y devolución reduce mucho la pérdida.'],
    ['Medición confiable', 'Niveles y cintas en mal estado producen errores que cuestan mucho más que el instrumento.']
  ],
  faq: [
    ['¿La herramienta menor se alquila o se compra?',
     'Se compra. A diferencia de la maquinaria y los equipos de construcción, el equipo menor tiene un precio de adquisición bajo y un uso continuo durante toda la obra, así que alquilarlo no tiene sentido económico.'],
    ['¿Cuánto dura una herramienta de obra?',
     'Depende del uso y de la calidad, pero en obra la herramienta menor es consumible: se pierde, se presta y se rompe. Lo prudente es presupuestar una reposición razonable a lo largo del plazo en lugar de comprar una sola dotación inicial.']
  ]
}

};
