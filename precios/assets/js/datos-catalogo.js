/* =========================================================
   precios.ingsliberato.com — catálogo maestro de ítems
   Ingenieros Liberato & Asociados

   ESTRUCTURA (4 niveles, según el catálogo maestro):
     Grupo (MAT/MOS/EQU) → Categoría (MAT-04) → Subcategoría → Ítem

   CÓMO AGREGAR O EDITAR UN ÍTEM
   -----------------------------
   Cada ítem se declara con la función it():

     it('MAT-04', 'Varilla corrugada 1/2" x 20 pies', 'unidad', 590, 540, 650, {
       esp:    'Grado 60 · ASTM A615 / RTD 458',   // especificación exacta
       etapa:  'estructura',                        // etapa de obra
       gama:   'estandar',                          // economica | estandar | premium
       origen: 'nacional',                          // nacional | importado
       itbis:  true,                                // el precio ya incluye el 18%
       estado: 'estimado'                           // estimado | verificado | tarifario
     })

   Los tres números son: precio de referencia, mínimo y máximo observados.
   Para un ítem sin precio (permisos, obras a cotización) pasar null en los tres
   y estado:'tarifario'.

   IMPORTANTE — ESTADO DE LOS PRECIOS
   ----------------------------------
   Todos los precios cargados hoy son ESTIMACIONES DE ARRANQUE para poder
   levantar el sitio; ninguno proviene todavía de una cotización formal.
   A medida que entren cotizaciones reales, actualizar el ítem y cambiar
   estado a 'verificado' con fuente y fecha. La interfaz distingue ambos
   estados de forma visible; no hay que tocar nada más.
   ========================================================= */

(function (global) {
  'use strict';

  var items = [];
  var contadores = {};

  function it(cat, nombre, unidad, ref, min, max, o) {
    o = o || {};
    contadores[cat] = (contadores[cat] || 0) + 1;
    var n = contadores[cat] < 10 ? '00' + contadores[cat]
          : contadores[cat] < 100 ? '0' + contadores[cat]
          : '' + contadores[cat];
    items.push({
      codigo:  cat + '-' + n,
      nombre:  nombre,
      cat:     cat,
      unidad:  unidad,
      esp:     o.esp || '',
      etapa:   o.etapa || '',
      gama:    o.gama || 'estandar',
      origen:  o.origen || 'nacional',
      itbis:   o.itbis !== false,
      estado:  o.estado || 'estimado',
      fuente:  o.fuente || 'Estimación de arranque — pendiente de cotización',
      fecha:   o.fecha || '2026-09',
      nota:    o.nota || '',
      ref: ref, min: min, max: max
    });
  }

  /* ===================== MAT-01 · Agregados y áridos ===================== */
  it('MAT-01', 'Arena lavada', 'm³', 1150, 950, 1450, {esp:'Lavada de río, para hormigón y pañete', etapa:'estructura'});
  it('MAT-01', 'Arena gruesa (itabo)', 'm³', 980, 800, 1250, {esp:'Para mezclas de mampostería', etapa:'mamposteria', gama:'economica'});
  it('MAT-01', 'Arena fina', 'm³', 1280, 1050, 1600, {esp:'Para terminación y fino', etapa:'terminacion'});
  it('MAT-01', 'Grava 3/4"', 'm³', 1320, 1100, 1650, {esp:'Triturada, ASTM C-33', etapa:'estructura'});
  it('MAT-01', 'Gravilla 3/8"', 'm³', 1380, 1150, 1700, {esp:'Triturada, para losas finas', etapa:'estructura'});
  it('MAT-01', 'Caliche / material de préstamo', 'm³', 650, 500, 850, {esp:'Relleno compactable', etapa:'movimiento-tierra', gama:'economica'});
  it('MAT-01', 'Piedra bola para mampostería', 'm³', 1450, 1200, 1800, {esp:'Muros de contención y cimientos', etapa:'cimentacion'});
  it('MAT-01', 'Polvo de piedra', 'm³', 1080, 900, 1350, {esp:'Base y sub-base', etapa:'movimiento-tierra'});
  it('MAT-01', 'Viaje de arena lavada, 16 m³', 'viaje', 17500, 14500, 21000, {esp:'Incluye transporte en volquete', etapa:'estructura'});
  it('MAT-01', 'Viaje de grava 3/4", 16 m³', 'viaje', 19800, 16500, 24000, {esp:'Incluye transporte en volquete', etapa:'estructura'});

  /* ============ MAT-02 · Cemento, morteros, pegamentos y aditivos ============ */
  it('MAT-02', 'Cemento gris portland, funda 42.5 kg', 'funda', 455, 425, 500, {esp:'Portland mixto tipo IP, NORDOM 2', etapa:'estructura'});
  it('MAT-02', 'Cemento blanco, funda 25 kg', 'funda', 1250, 1050, 1500, {esp:'Para terminación y derretido', etapa:'terminacion', origen:'importado'});
  it('MAT-02', 'Cal hidratada, funda 25 kg', 'funda', 390, 330, 470, {esp:'Para morteros de pañete', etapa:'terminacion', gama:'economica'});
  it('MAT-02', 'Mortero predosificado de pañete, funda 40 kg', 'funda', 440, 380, 520, {esp:'Listo para mezclar con agua', etapa:'terminacion'});
  it('MAT-02', 'Mortero autonivelante, funda 20 kg', 'funda', 1180, 950, 1450, {esp:'Nivelación de pisos antes de revestir', etapa:'pisos', origen:'importado'});
  it('MAT-02', 'Pegamento de cerámica interior, funda 25 kg', 'funda', 385, 320, 470, {esp:'Uso interior, piso y pared', etapa:'pisos', gama:'economica'});
  it('MAT-02', 'Pegamento flexible para porcelanato, funda 25 kg', 'funda', 680, 560, 850, {esp:'Clase C2, gran formato y exteriores', etapa:'pisos', gama:'premium'});
  it('MAT-02', 'Derretido (grout) con arena, funda 5 kg', 'funda', 340, 270, 430, {esp:'Juntas de 3 mm en adelante', etapa:'pisos'});
  it('MAT-02', 'Aditivo plastificante, galón', 'galón', 1450, 1150, 1850, {esp:'Reductor de agua para hormigón', etapa:'estructura', origen:'importado'});
  it('MAT-02', 'Impermeabilizante integral para mezcla, galón', 'galón', 1350, 1050, 1700, {esp:'Aditivo de masa', etapa:'techos', origen:'importado'});
  it('MAT-02', 'Epóxico de anclaje, cartucho 585 ml', 'cartucho', 3100, 2400, 3900, {esp:'Anclaje químico de varilla', etapa:'estructura', gama:'premium', origen:'importado'});

  /* ===================== MAT-03 · Hormigón premezclado ===================== */
  it('MAT-03', 'Hormigón premezclado 180 kg/cm²', 'm³', 6300, 5700, 7100, {esp:'F\'c 180, revenimiento 4"-6"', etapa:'estructura', itbis:false});
  it('MAT-03', 'Hormigón premezclado 210 kg/cm²', 'm³', 6800, 6200, 7600, {esp:'F\'c 210 — el más usado en vivienda', etapa:'estructura', itbis:false});
  it('MAT-03', 'Hormigón premezclado 240 kg/cm²', 'm³', 7300, 6700, 8200, {esp:'F\'c 240', etapa:'estructura', itbis:false});
  it('MAT-03', 'Hormigón premezclado 280 kg/cm²', 'm³', 7900, 7200, 8800, {esp:'F\'c 280', etapa:'estructura', itbis:false});
  it('MAT-03', 'Hormigón premezclado 350 kg/cm²', 'm³', 8900, 8100, 9900, {esp:'F\'c 350, elementos de alta exigencia', etapa:'estructura', gama:'premium', itbis:false});
  it('MAT-03', 'Hormigón bombeable 210 kg/cm²', 'm³', 7400, 6700, 8300, {esp:'Diseñado para bombeo', etapa:'estructura', itbis:false});
  it('MAT-03', 'Servicio de bombeo de hormigón', 'm³', 1150, 900, 1500, {esp:'Bomba estacionaria o pluma; verificar mínimo por jornada', etapa:'estructura', itbis:false});
  it('MAT-03', 'Relleno fluido (mortero de relleno)', 'm³', 5200, 4500, 6000, {esp:'Relleno de zanjas y vacíos', etapa:'movimiento-tierra', itbis:false});

  /* ================= MAT-04 · Acero de refuerzo y metales ================= */
  it('MAT-04', 'Varilla corrugada 3/8" x 20 pies', 'unidad', 335, 300, 385, {esp:'Grado 60 · ASTM A615 / RTD 458', etapa:'estructura'});
  it('MAT-04', 'Varilla corrugada 1/2" x 20 pies', 'unidad', 590, 530, 670, {esp:'Grado 60 · ASTM A615 / RTD 458', etapa:'estructura'});
  it('MAT-04', 'Varilla corrugada 5/8" x 20 pies', 'unidad', 930, 840, 1060, {esp:'Grado 60 · ASTM A615', etapa:'estructura'});
  it('MAT-04', 'Varilla corrugada 3/4" x 20 pies', 'unidad', 1340, 1200, 1520, {esp:'Grado 60 · ASTM A615', etapa:'estructura'});
  it('MAT-04', 'Varilla corrugada 1" x 20 pies', 'unidad', 2380, 2150, 2700, {esp:'Grado 60 · ASTM A615', etapa:'estructura'});
  it('MAT-04', 'Varilla corrugada 1/2" x 30 pies', 'unidad', 885, 800, 1010, {esp:'Grado 60, largo comercial 30\'', etapa:'estructura'});
  it('MAT-04', 'Malla electrosoldada 6x6 10/10', 'plancha', 2650, 2300, 3100, {esp:'Plancha 2.20 x 6.00 m', etapa:'estructura'});
  it('MAT-04', 'Alambre dulce de amarre', 'lb', 62, 52, 78, {esp:'Calibre 16 para amarre de acero', etapa:'estructura'});
  it('MAT-04', 'Angular 1 1/2" x 1/8" x 20 pies', 'unidad', 1480, 1250, 1780, {esp:'Perfil L de acero negro', etapa:'estructura'});
  it('MAT-04', 'Tubo estructural cuadrado 2" x 2" x 1/8" x 20 pies', 'unidad', 3950, 3400, 4600, {esp:'Tubería estructural negra', etapa:'estructura'});
  it('MAT-04', 'Plancha galvanizada calibre 22, 4 x 8 pies', 'plancha', 4200, 3600, 5000, {esp:'Lámina lisa galvanizada', etapa:'estructura', origen:'importado'});
  it('MAT-04', 'Perfil canal C 6" x 20 pies', 'unidad', 5400, 4600, 6400, {esp:'Canal estructural de acero', etapa:'estructura'});

  /* ============= MAT-05 · Bloques, ladrillos y prefabricados ============= */
  it('MAT-05', 'Bloque de hormigón 4"', 'unidad', 29, 25, 34, {esp:'8" x 16", ASTM C90 / NORDOM 461', etapa:'mamposteria'});
  it('MAT-05', 'Bloque de hormigón 5"', 'unidad', 34, 29, 40, {esp:'8" x 16"', etapa:'mamposteria'});
  it('MAT-05', 'Bloque de hormigón 6"', 'unidad', 39, 34, 46, {esp:'8" x 16"', etapa:'mamposteria'});
  it('MAT-05', 'Bloque de hormigón 8"', 'unidad', 53, 46, 62, {esp:'8" x 16", muros estructurales', etapa:'mamposteria'});
  it('MAT-05', 'Bloque de hormigón 6", millar', 'millar', 37500, 33000, 44000, {esp:'Compra por millar en fábrica, sin transporte', etapa:'mamposteria'});
  it('MAT-05', 'Ladrillo de arcilla', 'unidad', 29, 23, 38, {esp:'Ladrillo rojo tradicional', etapa:'mamposteria'});
  it('MAT-05', 'Celosía / bloque calado ornamental', 'unidad', 92, 70, 130, {esp:'Ventilación y fachadas', etapa:'mamposteria'});
  it('MAT-05', 'Adoquín de hormigón', 'm²', 1180, 950, 1500, {esp:'Espesor 6 cm, tránsito peatonal y liviano', etapa:'exteriores'});
  it('MAT-05', 'Vigueta prefabricada pretensada', 'ml', 780, 640, 980, {esp:'Para losa aligerada con block de techo', etapa:'estructura'});
  it('MAT-05', 'Tapa de registro de hormigón', 'unidad', 2500, 1900, 3300, {esp:'Con marco, tránsito peatonal', etapa:'instalaciones'});

  /* ==================== MAT-06 · Madera y encofrado ==================== */
  it('MAT-06', 'Tabla de pino 1" x 12" x 12 pies', 'unidad', 1150, 950, 1450, {esp:'Pino americano bruto para encofrado', etapa:'estructura', origen:'importado'});
  it('MAT-06', 'Cuartón de pino 2" x 4" x 12 pies', 'unidad', 690, 570, 870, {esp:'Pino bruto, apuntalamiento', etapa:'estructura', origen:'importado'});
  it('MAT-06', 'Alfarda de pino 2" x 6" x 12 pies', 'unidad', 1030, 850, 1300, {esp:'Pino bruto', etapa:'estructura', origen:'importado'});
  it('MAT-06', 'Madera de pino bruto', 'pie tablar', 78, 62, 98, {esp:'Precio por pie tablar, compra suelta', etapa:'estructura', origen:'importado'});
  it('MAT-06', 'Plywood corriente 1/2", 4 x 8 pies', 'plancha', 1680, 1400, 2050, {esp:'Uso general y encofrado sencillo', etapa:'estructura', origen:'importado', gama:'economica'});
  it('MAT-06', 'Plywood corriente 3/4", 4 x 8 pies', 'plancha', 2650, 2200, 3200, {esp:'Uso general', etapa:'estructura', origen:'importado'});
  it('MAT-06', 'Plywood fenólico de formaleta 5/8" (Film Face)', 'plancha', 3950, 3300, 4800, {esp:'Cara fenólica, varios usos de encofrado', etapa:'estructura', origen:'importado', gama:'premium'});
  it('MAT-06', 'Madera tratada 2" x 4" x 12 pies', 'unidad', 1180, 950, 1480, {esp:'Tratada para intemperie', etapa:'exteriores', origen:'importado'});
  it('MAT-06', 'Desmoldante para formaleta', 'galón', 1180, 950, 1500, {esp:'Facilita el desencofrado', etapa:'estructura'});

  /* ================= MAT-07 · Techos e impermeabilización ================= */
  it('MAT-07', 'Zinc acanalado calibre 26, 10 pies', 'plancha', 1780, 1500, 2150, {esp:'Galvanizado ondulado', etapa:'techos', gama:'economica'});
  it('MAT-07', 'Aluzinc calibre 26, 12 pies', 'plancha', 2480, 2100, 3000, {esp:'Acanalado, fabricación a medida disponible', etapa:'techos'});
  it('MAT-07', 'Aluzinc tipo teja española, 12 pies', 'plancha', 3200, 2700, 3900, {esp:'Perfil teja, colores', etapa:'techos', gama:'premium'});
  it('MAT-07', 'Teja asfáltica (shingle), paquete 3.1 m²', 'paquete', 2350, 1950, 2900, {esp:'Arquitectónica, garantía de fábrica', etapa:'techos', origen:'importado'});
  it('MAT-07', 'Lámina de policarbonato alveolar 6 mm', 'plancha', 4600, 3800, 5600, {esp:'Traslúcida, 2.10 x 5.80 m', etapa:'techos', origen:'importado'});
  it('MAT-07', 'Lona asfáltica, rollo 10 m²', 'rollo', 5900, 4900, 7200, {esp:'Manto autoprotegido para techo', etapa:'techos'});
  it('MAT-07', 'Manto líquido acrílico, cubeta 5 gal', 'cubeta', 4400, 3600, 5400, {esp:'Impermeabilizante elastomérico', etapa:'techos'});
  it('MAT-07', 'Impermeabilizante cementicio, funda 25 kg', 'funda', 1650, 1300, 2050, {esp:'Cisternas, plateas y sótanos', etapa:'techos'});
  it('MAT-07', 'Silicón de techo, galón', 'galón', 1550, 1250, 1950, {esp:'Sellado de tornillos y traslapes', etapa:'techos'});
  it('MAT-07', 'Aislante foil doble burbuja, rollo 100 pies²', 'rollo', 3900, 3200, 4800, {esp:'Barrera radiante bajo cubierta', etapa:'techos', origen:'importado'});

  /* =================== MAT-08 · Pisos y revestimientos =================== */
  it('MAT-08', 'Cerámica nacional 33 x 33 cm', 'm²', 590, 450, 780, {esp:'Piso interior tránsito medio', etapa:'pisos', gama:'economica'});
  it('MAT-08', 'Cerámica de pared 25 x 40 cm', 'm²', 720, 560, 950, {esp:'Baños y cocinas', etapa:'pisos'});
  it('MAT-08', 'Porcelanato mate 60 x 60 cm', 'm²', 1280, 980, 1700, {esp:'Rectificado, tránsito residencial', etapa:'pisos', origen:'importado'});
  it('MAT-08', 'Porcelanato gran formato 80 x 80 cm', 'm²', 2450, 1900, 3200, {esp:'Rectificado, importado', etapa:'pisos', gama:'premium', origen:'importado'});
  it('MAT-08', 'Mármol importado', 'm²', 5200, 3800, 7500, {esp:'Plancha pulida, espesor 2 cm', etapa:'pisos', gama:'premium', origen:'importado'});
  it('MAT-08', 'Coralina dominicana', 'm²', 2100, 1600, 2900, {esp:'Piedra natural local, exteriores y piscinas', etapa:'exteriores'});
  it('MAT-08', 'Granito fundido / terrazo', 'm²', 1950, 1500, 2600, {esp:'Fundido y pulido en sitio', etapa:'pisos'});
  it('MAT-08', 'Piso vinílico SPC con click', 'm²', 1480, 1150, 1950, {esp:'Núcleo rígido, resistente al agua', etapa:'pisos', origen:'importado'});
  it('MAT-08', 'Deck de WPC para exteriores', 'm²', 3400, 2700, 4400, {esp:'Madera plástica, terrazas y piscinas', etapa:'exteriores', gama:'premium', origen:'importado'});
  it('MAT-08', 'Zócalo de porcelanato 8 cm', 'ml', 240, 180, 330, {esp:'A juego con el piso', etapa:'pisos'});
  it('MAT-08', 'Tope de granito natural instalado', 'pie lineal', 4400, 3400, 5800, {esp:'Espesor 2 cm, incluye pulido de canto', etapa:'terminacion', gama:'premium', origen:'importado'});
  it('MAT-08', 'Tope de cuarzo instalado', 'pie lineal', 6800, 5200, 8900, {esp:'Cuarzo de ingeniería', etapa:'terminacion', gama:'premium', origen:'importado'});

  /* ================ MAT-09 · Plomería, sanitarios y gas ================ */
  it('MAT-09', 'Tubo PVC drenaje 4" x 20 pies', 'tubo', 1280, 1050, 1600, {esp:'SDR-41 sanitario', etapa:'instalaciones'});
  it('MAT-09', 'Tubo PVC drenaje 2" x 20 pies', 'tubo', 540, 440, 680, {esp:'SDR-41 sanitario', etapa:'instalaciones'});
  it('MAT-09', 'Tubo PVC drenaje 6" x 20 pies', 'tubo', 2450, 2000, 3050, {esp:'SDR-41 sanitario', etapa:'instalaciones'});
  it('MAT-09', 'Tubo PVC presión 1/2" SCH-40 x 20 pies', 'tubo', 360, 290, 450, {esp:'Agua fría a presión', etapa:'instalaciones'});
  it('MAT-09', 'Tubo CPVC 1/2" x 20 pies', 'tubo', 780, 620, 990, {esp:'Agua caliente', etapa:'instalaciones', origen:'importado'});
  it('MAT-09', 'Codo PVC 90° de 4"', 'unidad', 285, 220, 370, {esp:'Drenaje sanitario', etapa:'instalaciones'});
  it('MAT-09', 'Llave de paso de 1/2"', 'unidad', 520, 400, 700, {esp:'Bronce o PVC según marca', etapa:'instalaciones'});
  it('MAT-09', 'Inodoro de una pieza, gama económica', 'unidad', 8500, 6500, 11500, {esp:'Con asiento y accesorios', etapa:'instalaciones', gama:'economica', origen:'importado'});
  it('MAT-09', 'Inodoro de una pieza, gama premium', 'unidad', 28000, 20000, 42000, {esp:'Marca de línea alta', etapa:'instalaciones', gama:'premium', origen:'importado'});
  it('MAT-09', 'Lavamanos de sobreponer', 'unidad', 6200, 4500, 9000, {esp:'Porcelana', etapa:'instalaciones', origen:'importado'});
  it('MAT-09', 'Mezcladora de lavamanos', 'unidad', 5400, 3500, 8500, {esp:'Monomando cromado', etapa:'instalaciones', origen:'importado'});
  it('MAT-09', 'Calentador eléctrico 10 galones', 'unidad', 12500, 9800, 16500, {esp:'Con termostato', etapa:'instalaciones', origen:'importado'});
  it('MAT-09', 'Bomba centrífuga 1 HP', 'unidad', 14500, 11000, 19500, {esp:'Para cisterna a tinaco', etapa:'instalaciones', origen:'importado'});
  it('MAT-09', 'Tinaco de 450 galones', 'unidad', 16500, 13000, 21000, {esp:'Polietileno tricapa', etapa:'instalaciones'});
  it('MAT-09', 'Trampa de grasa prefabricada', 'unidad', 9500, 7000, 13000, {esp:'Cocinas residenciales', etapa:'instalaciones'});

  /* =============== MAT-10 · Electricidad e iluminación =============== */
  it('MAT-10', 'Cable THHN #12, rollo 100 pies', 'rollo', 2450, 1950, 3100, {esp:'Cobre, 600 V', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Cable THHN #10, rollo 100 pies', 'rollo', 3800, 3100, 4800, {esp:'Cobre, 600 V', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Cable THHN #8, rollo 100 pies', 'rollo', 6200, 5000, 7800, {esp:'Cobre, 600 V', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Tubo EMT 1/2" x 10 pies', 'tubo', 480, 380, 620, {esp:'Canalización metálica', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Tubo PVC eléctrico 1/2" x 10 pies', 'tubo', 195, 150, 260, {esp:'Canalización empotrada', etapa:'instalaciones'});
  it('MAT-10', 'Caja eléctrica 2 x 4', 'unidad', 95, 70, 130, {esp:'Metálica o PVC', etapa:'instalaciones'});
  it('MAT-10', 'Tomacorriente doble polarizado', 'unidad', 380, 260, 550, {esp:'15 A, con placa', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Interruptor sencillo', 'unidad', 320, 220, 480, {esp:'Con placa', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Breaker enchufable 20 A', 'unidad', 780, 600, 1050, {esp:'1 polo, marca de línea', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Panel eléctrico de 12 espacios con main', 'unidad', 9500, 7500, 12500, {esp:'Monofásico 120/240 V', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Bombillo LED 9 W', 'unidad', 220, 150, 330, {esp:'Rosca E27, luz blanca o cálida', etapa:'instalaciones', gama:'economica', origen:'importado'});
  it('MAT-10', 'Ojo de buey LED 6" empotrado', 'unidad', 850, 600, 1250, {esp:'Panel LED con driver', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Inversor 3 kVA con cargador', 'unidad', 48000, 38000, 62000, {esp:'Onda pura, respaldo residencial', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Batería de gel 200 Ah', 'unidad', 32000, 25000, 42000, {esp:'Ciclo profundo para inversor', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Panel solar 550 W', 'unidad', 14500, 11500, 19000, {esp:'Monocristalino', etapa:'instalaciones', origen:'importado'});
  it('MAT-10', 'Varilla copperweld 5/8" x 8 pies', 'unidad', 1450, 1150, 1850, {esp:'Puesta a tierra', etapa:'instalaciones', origen:'importado'});

  /* ========= MAT-11 · Puertas, ventanas, cristales y herrajes ========= */
  it('MAT-11', 'Puerta de tambor (MDF) con marco', 'unidad', 8500, 6500, 11500, {esp:'Interior, 32" x 80", sin herrajes', etapa:'puertas-ventanas', gama:'economica'});
  it('MAT-11', 'Puerta de madera preciosa maciza', 'unidad', 42000, 30000, 65000, {esp:'Caoba o roble, fabricación a medida', etapa:'puertas-ventanas', gama:'premium'});
  it('MAT-11', 'Puerta metálica de seguridad', 'unidad', 26000, 19000, 38000, {esp:'Con cerradura multipunto', etapa:'puertas-ventanas'});
  it('MAT-11', 'Portón de garaje corredizo', 'm²', 12500, 9000, 18000, {esp:'Hierro, sin motor', etapa:'puertas-ventanas'});
  it('MAT-11', 'Ventana corrediza de aluminio con cristal', 'pie²', 1450, 1100, 1950, {esp:'Aluminio natural, cristal 5 mm', etapa:'puertas-ventanas'});
  it('MAT-11', 'Ventana proyectada de aluminio', 'pie²', 1850, 1400, 2500, {esp:'Con brazos y screen', etapa:'puertas-ventanas'});
  it('MAT-11', 'Cristal templado 10 mm', 'pie²', 1750, 1350, 2350, {esp:'Instalado, sin herrajes', etapa:'puertas-ventanas', gama:'premium', origen:'importado'});
  it('MAT-11', 'Cerradura de pomo', 'unidad', 1450, 950, 2200, {esp:'Interior, acabado satinado', etapa:'puertas-ventanas', origen:'importado'});
  it('MAT-11', 'Cerradura digital con huella', 'unidad', 12500, 8500, 19000, {esp:'Biométrica con clave y tarjeta', etapa:'puertas-ventanas', gama:'premium', origen:'importado'});
  it('MAT-11', 'Barandal de acero inoxidable con cristal', 'ml', 14500, 11000, 20000, {esp:'Instalado, escaleras y balcones', etapa:'terminacion', gama:'premium'});
  it('MAT-11', 'Verja de hierro para ventana', 'm²', 3800, 2800, 5200, {esp:'Fabricada e instalada, con pintura', etapa:'puertas-ventanas'});

  /* ============= MAT-12 · Pintura y acabados de superficie ============= */
  it('MAT-12', 'Pintura acrílica mate, cubeta 5 gal (económica)', 'cubeta', 5200, 4200, 6500, {esp:'Interior, rendimiento estándar', etapa:'pintura', gama:'economica'});
  it('MAT-12', 'Pintura acrílica satinada, cubeta 5 gal', 'cubeta', 8900, 7000, 11500, {esp:'Interior/exterior lavable', etapa:'pintura'});
  it('MAT-12', 'Pintura acrílica premium, cubeta 5 gal', 'cubeta', 14500, 11000, 19000, {esp:'Alta cobertura y durabilidad', etapa:'pintura', gama:'premium'});
  it('MAT-12', 'Esmalte base aceite, galón', 'galón', 2400, 1900, 3100, {esp:'Metal y madera', etapa:'pintura'});
  it('MAT-12', 'Sellador de muro, cubeta 5 gal', 'cubeta', 4800, 3800, 6100, {esp:'Base para pintura sobre pañete', etapa:'pintura'});
  it('MAT-12', 'Masilla / empaste, cubeta 5 gal', 'cubeta', 3600, 2800, 4700, {esp:'Nivelación de superficies', etapa:'pintura'});
  it('MAT-12', 'Pintura epóxica de piso, galón', 'galón', 5400, 4200, 7000, {esp:'Dos componentes, tránsito pesado', etapa:'pintura', gama:'premium', origen:'importado'});
  it('MAT-12', 'Pintura de tráfico, galón', 'galón', 2900, 2300, 3800, {esp:'Señalización vial y parqueos', etapa:'exteriores'});

  /* ============ MAT-13 · Plafones y construcción liviana ============ */
  it('MAT-13', 'Plancha de yeso regular 1/2", 4 x 8 pies', 'plancha', 1080, 880, 1350, {esp:'Sheetrock estándar', etapa:'terminacion'});
  it('MAT-13', 'Plancha de yeso RH (verde) 1/2", 4 x 8 pies', 'plancha', 1450, 1150, 1850, {esp:'Resistente a la humedad', etapa:'terminacion'});
  it('MAT-13', 'Plancha cementicia 1/2", 3 x 5 pies', 'plancha', 2100, 1700, 2700, {esp:'Durock / fibrocemento, áreas húmedas', etapa:'terminacion', origen:'importado'});
  it('MAT-13', 'Paral (stud) 3 5/8" x 10 pies', 'unidad', 480, 380, 620, {esp:'Perfilería galvanizada', etapa:'terminacion'});
  it('MAT-13', 'Canal (track) 3 5/8" x 10 pies', 'unidad', 450, 350, 580, {esp:'Perfilería galvanizada', etapa:'terminacion'});
  it('MAT-13', 'Plafón acústico 2 x 2 pies', 'plancha', 620, 480, 820, {esp:'Fibra mineral, con suspensión aparte', etapa:'terminacion', origen:'importado'});
  it('MAT-13', 'Plafón de PVC', 'm²', 950, 750, 1250, {esp:'Machihembrado, áreas húmedas', etapa:'terminacion', origen:'importado'});
  it('MAT-13', 'Masilla de juntas, cubeta 5 gal', 'cubeta', 2400, 1900, 3100, {esp:'Compuesto para juntas de yeso', etapa:'terminacion'});
  it('MAT-13', 'Cinta de papel para juntas, rollo 250 pies', 'rollo', 320, 240, 430, {esp:'Refuerzo de juntas', etapa:'terminacion'});
  it('MAT-13', 'Tornillo drywall 1", caja 1 lb', 'caja', 280, 210, 380, {esp:'Punta fina, cabeza trompeta', etapa:'terminacion'});

  /* ========== MAT-14 · Ferretería, fijaciones y consumibles ========== */
  it('MAT-14', 'Clavo de 2 1/2"', 'lb', 78, 60, 100, {esp:'Con cabeza, para encofrado', etapa:'estructura'});
  it('MAT-14', 'Tornillo autoperforante 1", caja 100 uds', 'caja', 420, 320, 560, {esp:'Punta broca para metal', etapa:'terminacion'});
  it('MAT-14', 'Tarugo plástico 1/4" con tornillo, 100 uds', 'caja', 380, 290, 500, {esp:'Fijación en pared', etapa:'terminacion'});
  it('MAT-14', 'Anclaje expansivo 3/8" x 3"', 'unidad', 95, 70, 130, {esp:'Cuña metálica para hormigón', etapa:'estructura', origen:'importado'});
  it('MAT-14', 'Silicón acético transparente, tubo', 'tubo', 420, 320, 560, {esp:'Sellado de vidrios y sanitarios', etapa:'terminacion', origen:'importado'});
  it('MAT-14', 'Sellador de poliuretano, tubo', 'tubo', 850, 650, 1150, {esp:'Juntas estructurales y fachadas', etapa:'terminacion', gama:'premium', origen:'importado'});
  it('MAT-14', 'Disco de corte de metal 4 1/2"', 'unidad', 145, 100, 210, {esp:'Para esmeriladora angular', etapa:'estructura'});
  it('MAT-14', 'Pegamento PVC, 1/4 galón', 'unidad', 780, 600, 1050, {esp:'Para tubería a presión y drenaje', etapa:'instalaciones'});
  it('MAT-14', 'Malla de seguridad naranja, rollo 50 m', 'rollo', 2400, 1850, 3200, {esp:'Delimitación de obra', etapa:'preliminares'});

  /* ================= MAT-15 · Climatización y ventilación ================= */
  it('MAT-15', 'Aire acondicionado split inverter 12,000 BTU', 'unidad', 42000, 33000, 55000, {esp:'Seer alto, incluye kit básico', etapa:'instalaciones', origen:'importado'});
  it('MAT-15', 'Aire acondicionado split inverter 24,000 BTU', 'unidad', 72000, 58000, 92000, {esp:'Seer alto', etapa:'instalaciones', origen:'importado'});
  it('MAT-15', 'Ducto flexible aislado 8"', 'pie', 380, 290, 500, {esp:'Con aislamiento térmico', etapa:'instalaciones', origen:'importado'});
  it('MAT-15', 'Rejilla de retorno 20 x 20"', 'unidad', 3200, 2400, 4300, {esp:'Aluminio con filtro', etapa:'instalaciones', origen:'importado'});
  it('MAT-15', 'Extractor de baño', 'unidad', 2600, 1900, 3600, {esp:'Con ducto de 4"', etapa:'instalaciones', origen:'importado'});
  it('MAT-15', 'Tubería de cobre 1/4" aislada, rollo 50 pies', 'rollo', 9800, 7800, 12500, {esp:'Línea de refrigeración', etapa:'instalaciones', origen:'importado'});

  /* ==================== MAT-16 · Sistemas especiales ==================== */
  it('MAT-16', 'Cámara IP domo 4 MP', 'unidad', 4200, 3200, 5800, {esp:'PoE, visión nocturna', etapa:'instalaciones', origen:'importado'});
  it('MAT-16', 'NVR de 8 canales', 'unidad', 12500, 9500, 17000, {esp:'Sin disco duro', etapa:'instalaciones', origen:'importado'});
  it('MAT-16', 'Cable UTP Cat 6, rollo 305 m', 'rollo', 9500, 7500, 12500, {esp:'Cobre puro, interior', etapa:'instalaciones', origen:'importado'});
  it('MAT-16', 'Detector de humo fotoeléctrico', 'unidad', 2800, 2100, 3900, {esp:'Direccionable o convencional', etapa:'instalaciones', origen:'importado'});
  it('MAT-16', 'Extintor ABC de 10 lb', 'unidad', 4200, 3200, 5600, {esp:'Con soporte y señalización', etapa:'instalaciones'});
  it('MAT-16', 'Videoportero con monitor', 'unidad', 11500, 8500, 16000, {esp:'Residencial, un monitor', etapa:'instalaciones', origen:'importado'});

  /* ============ MAT-17 · Seguridad industrial y señalización ============ */
  it('MAT-17', 'Casco de seguridad', 'unidad', 950, 700, 1350, {esp:'Clase E con suspensión', etapa:'preliminares', origen:'importado'});
  it('MAT-17', 'Guantes de trabajo', 'unidad', 320, 220, 460, {esp:'Par, uso general', etapa:'preliminares', origen:'importado'});
  it('MAT-17', 'Botas de seguridad con puntera', 'unidad', 4200, 3200, 5800, {esp:'Par, puntera de acero o composite', etapa:'preliminares', origen:'importado'});
  it('MAT-17', 'Chaleco reflectivo', 'unidad', 480, 350, 680, {esp:'Alta visibilidad', etapa:'preliminares', origen:'importado'});
  it('MAT-17', 'Arnés de cuerpo completo', 'unidad', 6800, 5000, 9500, {esp:'Con línea de vida y absorbedor', etapa:'preliminares', gama:'premium', origen:'importado'});
  it('MAT-17', 'Cinta de peligro, rollo 300 m', 'rollo', 850, 620, 1200, {esp:'Delimitación de área', etapa:'preliminares'});

  /* ==================== MAT-18 · Exteriores y paisajismo ==================== */
  it('MAT-18', 'Grama natural San Agustín en alfombra', 'm²', 320, 240, 450, {esp:'Suministro, sin siembra', etapa:'exteriores'});
  it('MAT-18', 'Tierra negra vegetal', 'm³', 1450, 1150, 1900, {esp:'Cribada, para jardinería', etapa:'exteriores'});
  it('MAT-18', 'Palma areca de 2 m', 'unidad', 2400, 1700, 3400, {esp:'En funda, lista para siembra', etapa:'exteriores'});
  it('MAT-18', 'Grama artificial 40 mm', 'm²', 1650, 1250, 2300, {esp:'Instalada, uso residencial', etapa:'exteriores', origen:'importado'});
  it('MAT-18', 'Sistema de riego por aspersión (kit residencial)', 'kit', 32000, 24000, 45000, {esp:'Aspersores, válvulas y programador', etapa:'exteriores', origen:'importado'});

  /* ============== MOS-01 · Mano de obra por oficio (jornal) ============== */
  var jornal = {etapa:'', gama:'estandar', itbis:false, nota:'Jornal diario; la mano de obra normalmente no lleva ITBIS.'};
  function j(n, ref, min, max, esp) { it('MOS-01', n, 'día', ref, min, max, {esp:esp, itbis:false, nota:jornal.nota}); }
  j('Maestro constructor', 2900, 2300, 3800, 'Dirige el frente de obra');
  j('Albañil', 1850, 1500, 2400, 'Oficial de mampostería y terminación');
  j('Ayudante / peón', 1150, 950, 1450, 'Apoyo general de obra');
  j('Carpintero de obra (encofrador)', 2050, 1650, 2600, 'Formaleta y apuntalamiento');
  j('Carpintero de terminación / ebanista', 2600, 2000, 3400, 'Puertas, closets y muebles');
  j('Varillero (armador de acero)', 2050, 1650, 2600, 'Armado y amarre de refuerzo');
  j('Plomero', 2300, 1800, 3000, 'Instalación sanitaria y a presión');
  j('Electricista', 2450, 1900, 3200, 'Instalación eléctrica residencial');
  j('Pintor', 1850, 1500, 2400, 'Preparación y aplicación');
  j('Ceramiquero', 2300, 1800, 3000, 'Colocación de piso y pared');
  j('Plafonero / drywallero', 2300, 1800, 3000, 'Plafones y divisiones livianas');
  j('Soldador / herrero', 2600, 2000, 3400, 'Estructuras metálicas y verjas');
  j('Operador de equipo pesado', 2900, 2300, 3800, 'Retro, excavadora o rodillo');

  /* ============ MOS-02 · Subcontratos por partida (ejecución) ============ */
  it('MOS-02', 'Colocación de bloques', 'm²', 380, 300, 500, {esp:'Solo mano de obra, muro de 6"', etapa:'mamposteria', itbis:false});
  it('MOS-02', 'Fraguache y pañete', 'm²', 430, 340, 560, {esp:'Solo mano de obra, ambas caras se cotizan aparte', etapa:'terminacion', itbis:false});
  it('MOS-02', 'Fino de techo', 'm²', 330, 260, 430, {esp:'Solo mano de obra', etapa:'terminacion', itbis:false});
  it('MOS-02', 'Cantos y mochetas', 'ml', 190, 140, 260, {esp:'Solo mano de obra', etapa:'terminacion', itbis:false});
  it('MOS-02', 'Zabaleta', 'ml', 160, 120, 220, {esp:'Solo mano de obra', etapa:'terminacion', itbis:false});
  it('MOS-02', 'Encofrado de losa', 'm²', 680, 520, 900, {esp:'Mano de obra de formaleta y apuntalamiento', etapa:'estructura', itbis:false});
  it('MOS-02', 'Armado de acero de refuerzo', 'qq', 1280, 980, 1700, {esp:'Corte, doblado y amarre', etapa:'estructura', itbis:false});
  it('MOS-02', 'Vaciado de hormigón', 'm³', 950, 750, 1250, {esp:'Colocación, vibrado y curado', etapa:'estructura', itbis:false});
  it('MOS-02', 'Colocación de cerámica', 'm²', 480, 380, 620, {esp:'Solo mano de obra', etapa:'pisos', itbis:false});
  it('MOS-02', 'Colocación de porcelanato gran formato', 'm²', 780, 600, 1050, {esp:'Solo mano de obra, nivelación incluida', etapa:'pisos', itbis:false});
  it('MOS-02', 'Instalación eléctrica por punto', 'punto', 980, 750, 1300, {esp:'Solo mano de obra, por salida', etapa:'instalaciones', itbis:false});
  it('MOS-02', 'Instalación sanitaria por punto', 'punto', 1650, 1250, 2200, {esp:'Solo mano de obra, por salida', etapa:'instalaciones', itbis:false});
  it('MOS-02', 'Pintura (dos manos + sellador)', 'm²', 240, 180, 320, {esp:'Solo mano de obra', etapa:'pintura', itbis:false});
  it('MOS-02', 'Instalación de plafón / drywall', 'm²', 880, 680, 1150, {esp:'Solo mano de obra, incluye masillado', etapa:'terminacion', itbis:false});
  it('MOS-02', 'Instalación de puertas', 'unidad', 1900, 1400, 2600, {esp:'Marco, hoja y herrajes', etapa:'puertas-ventanas', itbis:false});
  it('MOS-02', 'Techado: estructura y cubierta', 'm²', 1650, 1250, 2200, {esp:'Solo mano de obra, cubierta metálica', etapa:'techos', itbis:false});
  it('MOS-02', 'Impermeabilización de techo', 'm²', 780, 600, 1050, {esp:'Solo mano de obra, sistema líquido', etapa:'techos', itbis:false});

  /* ================== MOS-03 · Servicios profesionales ================== */
  it('MOS-03', 'Diseño arquitectónico', 'm²', 1150, 800, 1800, {esp:'Anteproyecto y planos constructivos', etapa:'preliminares', itbis:false});
  it('MOS-03', 'Cálculo estructural', 'm²', 480, 350, 700, {esp:'Memoria y planos estructurales', etapa:'preliminares', itbis:false});
  it('MOS-03', 'Diseño eléctrico y sanitario', 'm²', 420, 300, 620, {esp:'Planos de instalaciones', etapa:'preliminares', itbis:false});
  it('MOS-03', 'Topografía y deslinde de solar', 'ajuste', 45000, 30000, 75000, {esp:'Varía fuerte por superficie y ubicación', etapa:'preliminares', itbis:false});
  it('MOS-03', 'Estudio de suelo (por perforación)', 'ajuste', 32000, 22000, 48000, {esp:'Sondeo SPT; mínimo suele ser 2-3 perforaciones', etapa:'preliminares', itbis:false});
  it('MOS-03', 'Supervisión y gerencia de obra', '%', 7, 5, 12, {esp:'Porcentaje del presupuesto de obra', etapa:'preliminares', itbis:false, nota:'El valor es un porcentaje, no un monto en RD$.'});
  it('MOS-03', 'Presupuesto y cubicación', 'ajuste', 35000, 20000, 60000, {esp:'Análisis de costos unitarios por partida', etapa:'preliminares', itbis:false});
  it('MOS-03', 'Tasación de inmueble', 'ajuste', 18000, 12000, 30000, {esp:'Informe de tasación', etapa:'preliminares', itbis:false});

  /* ==================== MOS-04 · Trámites y permisos ==================== */
  it('MOS-04', 'Licencia de construcción (MOPC)', 'ajuste', null, null, null, {esp:'Se liquida según el tarifario oficial vigente y el costo de la obra', etapa:'preliminares', estado:'tarifario', itbis:false, fuente:'Tarifario oficial MOPC', nota:'Registrar por separado la tasa oficial y los honorarios de gestión.'});
  it('MOS-04', 'Permiso municipal / uso de suelo', 'ajuste', null, null, null, {esp:'Según ayuntamiento correspondiente', etapa:'preliminares', estado:'tarifario', itbis:false, fuente:'Tarifario del ayuntamiento'});
  it('MOS-04', 'No objeción de Medio Ambiente', 'ajuste', null, null, null, {esp:'Aplica según tipo y escala del proyecto', etapa:'preliminares', estado:'tarifario', itbis:false, fuente:'Tarifario Ministerio de Medio Ambiente'});
  it('MOS-04', 'Conexión de agua (CAASD / INAPA)', 'ajuste', null, null, null, {esp:'Según diámetro de acometida y zona', etapa:'instalaciones', estado:'tarifario', itbis:false, fuente:'Tarifario de la prestadora'});
  it('MOS-04', 'Conexión eléctrica (distribuidora)', 'ajuste', null, null, null, {esp:'Según carga contratada', etapa:'instalaciones', estado:'tarifario', itbis:false, fuente:'Tarifario de la distribuidora'});
  it('MOS-04', 'Aprobación del Cuerpo de Bomberos', 'ajuste', null, null, null, {esp:'Sistemas de detección y extinción', etapa:'preliminares', estado:'tarifario', itbis:false, fuente:'Tarifario del Cuerpo de Bomberos'});

  /* ================= MOS-05 · Servicios de obra y logística ================= */
  it('MOS-05', 'Demolición de mampostería', 'm²', 850, 600, 1200, {esp:'Incluye acopio, no incluye bote', etapa:'preliminares', itbis:false});
  it('MOS-05', 'Movimiento de tierra (corte y nivelación)', 'm³', 480, 350, 700, {esp:'Con equipo, en sitio', etapa:'movimiento-tierra', itbis:false});
  it('MOS-05', 'Bote de escombros', 'viaje', 6500, 4800, 9000, {esp:'Volquete, incluye vertedero autorizado', etapa:'preliminares', itbis:false});
  it('MOS-05', 'Flete de materiales dentro del Gran Santo Domingo', 'viaje', 4800, 3500, 7000, {esp:'Camión mediano', etapa:'preliminares', itbis:false});
  it('MOS-05', 'Fumigación y control de termitas', 'm²', 180, 130, 260, {esp:'Tratamiento de suelo previo al vaciado', etapa:'preliminares', itbis:false});
  it('MOS-05', 'Limpieza final de obra', 'm²', 220, 160, 320, {esp:'Entrega lista para habitar', etapa:'limpieza', itbis:false});
  it('MOS-05', 'Vigilancia de obra', 'mes', 32000, 25000, 45000, {esp:'Un puesto de 12 horas', etapa:'preliminares', itbis:false});
  it('MOS-05', 'Alquiler de baño portátil', 'mes', 9500, 7000, 13000, {esp:'Incluye mantenimiento semanal', etapa:'preliminares', itbis:false});

  /* ================= EQU-01 · Maquinaria pesada (alquiler) ================= */
  it('EQU-01', 'Retroexcavadora (retropala)', 'día', 13500, 10000, 18000, {esp:'Con operador; combustible suele ir aparte', etapa:'movimiento-tierra', itbis:false});
  it('EQU-01', 'Excavadora de oruga 20 t', 'día', 24000, 18000, 32000, {esp:'Con operador', etapa:'movimiento-tierra', itbis:false});
  it('EQU-01', 'Minicargador (Bobcat)', 'día', 11500, 8500, 15500, {esp:'Con operador', etapa:'movimiento-tierra', itbis:false});
  it('EQU-01', 'Motoniveladora', 'día', 26000, 19000, 35000, {esp:'Con operador', etapa:'movimiento-tierra', itbis:false});
  it('EQU-01', 'Rodillo compactador vibratorio', 'día', 14500, 11000, 19500, {esp:'Con operador', etapa:'movimiento-tierra', itbis:false});
  it('EQU-01', 'Camión volteo', 'día', 15500, 11500, 21000, {esp:'Con chofer; también se contrata por viaje', etapa:'movimiento-tierra', itbis:false});
  it('EQU-01', 'Camión grúa', 'día', 22000, 16000, 30000, {esp:'Con operador', etapa:'estructura', itbis:false});
  it('EQU-01', 'Telehandler (manipulador telescópico)', 'día', 19000, 14000, 26000, {esp:'Con operador', etapa:'estructura', itbis:false});
  it('EQU-01', 'Camión cisterna de agua', 'viaje', 5200, 3800, 7500, {esp:'Suministro de agua a obra', etapa:'preliminares', itbis:false});

  /* ==================== EQU-02 · Equipos de construcción ==================== */
  it('EQU-02', 'Mezcladora de concreto (trompo), alquiler', 'día', 1650, 1200, 2300, {esp:'1 saco, eléctrica o de gasolina', etapa:'estructura', itbis:false});
  it('EQU-02', 'Vibrador de hormigón, alquiler', 'día', 1450, 1000, 2100, {esp:'Con manguera', etapa:'estructura', itbis:false});
  it('EQU-02', 'Compactadora tipo rana, alquiler', 'día', 2300, 1700, 3200, {esp:'Compactación de zanjas', etapa:'movimiento-tierra', itbis:false});
  it('EQU-02', 'Cortadora de pisos, alquiler', 'día', 2800, 2000, 3900, {esp:'Con disco diamantado aparte', etapa:'pisos', itbis:false});
  it('EQU-02', 'Martillo demoledor, alquiler', 'día', 3200, 2400, 4500, {esp:'Eléctrico, con puntas', etapa:'preliminares', itbis:false});
  it('EQU-02', 'Hidrolavadora, alquiler', 'día', 2400, 1700, 3400, {esp:'Limpieza de superficies', etapa:'limpieza', itbis:false});
  it('EQU-02', 'Planta eléctrica portátil, alquiler', 'día', 4200, 3000, 6000, {esp:'5-8 kVA, sin combustible', etapa:'preliminares', itbis:false});
  it('EQU-02', 'Soldadora, alquiler', 'día', 2600, 1900, 3600, {esp:'Sin electrodos', etapa:'estructura', itbis:false});
  it('EQU-02', 'Bomba de achique, alquiler', 'día', 2200, 1600, 3100, {esp:'Sumergible, drenaje de excavaciones', etapa:'cimentacion', itbis:false});

  /* =========== EQU-03 · Andamiaje, apuntalamiento y formaleta =========== */
  it('EQU-03', 'Sección de andamio (marco + cruceta), alquiler', 'mes', 950, 700, 1350, {esp:'Por sección, no incluye transporte', etapa:'estructura', itbis:false});
  it('EQU-03', 'Puntal metálico telescópico, alquiler', 'mes', 320, 230, 450, {esp:'Por unidad, 1.80-3.20 m', etapa:'estructura', itbis:false});
  it('EQU-03', 'Formaleta metálica de muro, alquiler', 'm²', 750, 550, 1050, {esp:'Por m² por mes', etapa:'estructura', itbis:false});
  it('EQU-03', 'Escalera de andamio, alquiler', 'mes', 850, 600, 1200, {esp:'Acceso vertical', etapa:'estructura', itbis:false});

  /* ================= EQU-04 · Herramientas y equipo menor ================= */
  it('EQU-04', 'Carretilla de obra', 'unidad', 3400, 2600, 4600, {esp:'Bandeja metálica, goma neumática', etapa:'preliminares'});
  it('EQU-04', 'Pala cuadrada', 'unidad', 780, 580, 1080, {esp:'Con cabo de madera', etapa:'preliminares'});
  it('EQU-04', 'Pico', 'unidad', 950, 700, 1300, {esp:'Con cabo', etapa:'preliminares'});
  it('EQU-04', 'Nivel láser autonivelante', 'unidad', 12500, 8500, 18000, {esp:'Líneas cruzadas, alcance interior', etapa:'preliminares', origen:'importado'});
  it('EQU-04', 'Cinta métrica 8 m', 'unidad', 620, 450, 880, {esp:'Con freno y clip', etapa:'preliminares', origen:'importado'});

  /* ========================= TAXONOMÍA ========================= */

  var grupos = [
    {codigo:'MAT', nombre:'Materiales', desc:'Todo lo que se compra e incorpora a la obra.'},
    {codigo:'MOS', nombre:'Mano de obra y servicios', desc:'Jornales, subcontratos por partida, servicios profesionales y trámites.'},
    {codigo:'EQU', nombre:'Equipos y maquinaria', desc:'Alquiler de maquinaria, equipos, andamiaje y herramienta menor.'}
  ];

  var categorias = [
    {codigo:'MAT-01', grupo:'MAT', nombre:'Agregados y áridos',                  desc:'Arena, grava, caliche, piedra y polvo de piedra.', slug:'precio-arena-grava-agregados'},
    {codigo:'MAT-02', grupo:'MAT', nombre:'Cemento, morteros y aditivos',        desc:'Cemento, cal, pegamentos, derretido y aditivos.', slug:'precio-cemento-morteros-aditivos'},
    {codigo:'MAT-03', grupo:'MAT', nombre:'Hormigón premezclado',                desc:'Por resistencia, variantes y servicio de bombeo.', slug:'precio-hormigon-premezclado'},
    {codigo:'MAT-04', grupo:'MAT', nombre:'Acero de refuerzo y metales',         desc:'Varillas, mallas, perfilería y planchas.', slug:'precio-varilla-acero'},
    {codigo:'MAT-05', grupo:'MAT', nombre:'Bloques y prefabricados',             desc:'Bloques, ladrillos, adoquines y prefabricados.', slug:'precio-blocks-prefabricados'},
    {codigo:'MAT-06', grupo:'MAT', nombre:'Madera y encofrado',                  desc:'Pino de encofrado, plywood y maderas tratadas.', slug:'precio-madera-plywood-encofrado'},
    {codigo:'MAT-07', grupo:'MAT', nombre:'Techos e impermeabilización',         desc:'Zinc, aluzinc, tejas, mantos y aislamientos.', slug:'precio-zinc-aluzinc-techos'},
    {codigo:'MAT-08', grupo:'MAT', nombre:'Pisos y revestimientos',              desc:'Cerámica, porcelanato, piedra natural y topes.', slug:'precio-ceramica-porcelanato-pisos'},
    {codigo:'MAT-09', grupo:'MAT', nombre:'Plomería, sanitarios y gas',          desc:'Tuberías, accesorios, aparatos, grifería y bombas.', slug:'precio-plomeria-sanitarios'},
    {codigo:'MAT-10', grupo:'MAT', nombre:'Electricidad e iluminación',          desc:'Cables, canalización, paneles, luminarias y respaldo.', slug:'precio-materiales-electricos'},
    {codigo:'MAT-11', grupo:'MAT', nombre:'Puertas, ventanas y cristales',       desc:'Puertas, ventanas de aluminio, cristales y herrajes.', slug:'precio-puertas-ventanas-cristales'},
    {codigo:'MAT-12', grupo:'MAT', nombre:'Pintura y acabados',                  desc:'Acrílicas, esmaltes, selladores y especiales.', slug:'precio-pintura'},
    {codigo:'MAT-13', grupo:'MAT', nombre:'Plafones y construcción liviana',     desc:'Yeso, perfilería, plafones y consumibles de drywall.', slug:'precio-plafones-drywall'},
    {codigo:'MAT-14', grupo:'MAT', nombre:'Ferretería y fijaciones',             desc:'Clavos, tornillos, anclajes, selladores y abrasivos.', slug:'precio-ferreteria-fijaciones'},
    {codigo:'MAT-15', grupo:'MAT', nombre:'Climatización y ventilación',         desc:'Equipos de A/A, ductos, rejillas y refrigeración.', slug:'precio-aire-acondicionado-ventilacion'},
    {codigo:'MAT-16', grupo:'MAT', nombre:'Sistemas especiales',                 desc:'CCTV, redes, detección de incendio y control de acceso.', slug:'precio-camaras-cctv-sistemas-especiales'},
    {codigo:'MAT-17', grupo:'MAT', nombre:'Seguridad industrial y señalización', desc:'EPP y señalización de obra.', slug:'precio-equipos-seguridad-industrial'},
    {codigo:'MAT-18', grupo:'MAT', nombre:'Exteriores y paisajismo',             desc:'Grama, tierra, plantas y riego.', slug:'precio-grama-paisajismo-riego'},
    {codigo:'MOS-01', grupo:'MOS', nombre:'Mano de obra por oficio',             desc:'Jornales diarios por oficio.', slug:'precio-jornal-mano-de-obra'},
    {codigo:'MOS-02', grupo:'MOS', nombre:'Subcontratos por partida',            desc:'Precio unitario de ejecución, solo mano de obra.', slug:'precio-mano-de-obra-por-partida'},
    {codigo:'MOS-03', grupo:'MOS', nombre:'Servicios profesionales',             desc:'Diseño, cálculo, topografía, supervisión y tasación.', slug:'precio-honorarios-diseno-supervision'},
    {codigo:'MOS-04', grupo:'MOS', nombre:'Trámites y permisos',                 desc:'Licencias, no objeciones y conexiones de servicios.', slug:'costo-licencias-permisos-construccion'},
    {codigo:'MOS-05', grupo:'MOS', nombre:'Servicios de obra y logística',       desc:'Demolición, movimiento de tierra, bote, fletes y limpieza.', slug:'precio-demolicion-movimiento-tierra-bote'},
    {codigo:'EQU-01', grupo:'EQU', nombre:'Maquinaria pesada',                   desc:'Alquiler con operador.', slug:'precio-alquiler-maquinaria-pesada'},
    {codigo:'EQU-02', grupo:'EQU', nombre:'Equipos de construcción',             desc:'Equipos de obra en alquiler.', slug:'precio-alquiler-equipos-construccion'},
    {codigo:'EQU-03', grupo:'EQU', nombre:'Andamiaje y formaleta',               desc:'Andamios, puntales y formaleta en alquiler.', slug:'precio-alquiler-andamios-formaleta'},
    {codigo:'EQU-04', grupo:'EQU', nombre:'Herramientas y equipo menor',         desc:'Herramienta de compra.', slug:'precio-herramientas-construccion'}
  ];

  var etapas = [
    {codigo:'preliminares',      nombre:'Preliminares'},
    {codigo:'movimiento-tierra', nombre:'Movimiento de tierra'},
    {codigo:'cimentacion',       nombre:'Cimentación'},
    {codigo:'estructura',        nombre:'Estructura'},
    {codigo:'mamposteria',       nombre:'Mampostería'},
    {codigo:'terminacion',       nombre:'Terminación de superficies'},
    {codigo:'pisos',             nombre:'Pisos'},
    {codigo:'techos',            nombre:'Techos'},
    {codigo:'instalaciones',     nombre:'Instalaciones'},
    {codigo:'puertas-ventanas',  nombre:'Puertas y ventanas'},
    {codigo:'pintura',           nombre:'Pintura'},
    {codigo:'exteriores',        nombre:'Exteriores'},
    {codigo:'limpieza',          nombre:'Limpieza'}
  ];

  /* Conversiones de unidad útiles en obra. */
  var conversiones = [
    {de:'1 funda de cemento gris',        a:'42.5 kg (aprox. 0.0283 m³ de volumen suelto)'},
    {de:'1 quintal (qq) de acero',        a:'100 lb ≈ 45.36 kg'},
    {de:'1 qq de varilla 1/2" x 20 pies', a:'≈ 7.4 varillas'},
    {de:'1 qq de varilla 3/8" x 20 pies', a:'≈ 13.3 varillas'},
    {de:'1 m³ de arena o grava',          a:'≈ 35.3 pies³'},
    {de:'1 viaje de volquete',            a:'4, 8 o 16 m³ según el camión'},
    {de:'1 m² de muro de bloques 6"',     a:'≈ 12.5 bloques de 8" x 16"'},
    {de:'1 m³ de hormigón 210 kg/cm²',    a:'≈ 7 fundas de cemento + 0.55 m³ arena + 0.85 m³ grava'},
    {de:'1 pie² (p²)',                    a:'0.0929 m²'},
    {de:'1 pie tablar',                   a:'1" x 12" x 12" de madera'}
  ];

  global.CATALOGO = {
    meta: {
      moneda: 'RD$',
      itbis: 0.18,
      regionBase: 'Gran Santo Domingo',
      actualizado: '2026-09',
      aviso: 'Los precios publicados hoy son estimaciones de arranque para referencia general; ninguno proviene todavía de una cotización formal. No sustituyen una cotización del proveedor.'
    },
    grupos: grupos,
    categorias: categorias,
    etapas: etapas,
    conversiones: conversiones,
    items: items
  };

})(window);
