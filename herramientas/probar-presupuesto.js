/* =========================================================
   probar-presupuesto.js — ¿sirve el catálogo para presupuestar?

   El auditor mira si los precios se sostienen. Esto mira otra cosa: si
   con el catálogo entero delante se puede presupuestar un edificio de
   verdad. Se hizo el ejercicio con una torre de ocho niveles y el
   resultado no fue el número: fue la lista de lo que falta.

   USO
     node herramientas/probar-presupuesto.js

   QUÉ PASÓ AL HACERLO, QUE ES PARA LO QUE SIRVE ESTE ARCHIVO

   1. EL CATÁLOGO NO SE PUEDE CONSULTAR POR CÓDIGO, Y ES LO ÚNICO QUE
      ENSEÑA. La primera versión de este script pedía cada ítem por su
      código, porque es lo que se lee en el Excel y en la web. Seis de
      veinticuatro códigos ya no apuntaban a lo que yo creía: se mueven
      en cada importación, cuando entran ítems nuevos.

      Uno de ellos, el del alambre de amarre, cayó en «Malla
      electrosoldada D2.3, rollo» a RD$ 18.253. El presupuesto pidió
      2.528 rollos de malla y sumó RD$ 46 millones —el 84% del total— y
      NADA AVISÓ. La cifra salió redonda, ordenada y completamente
      falsa.

      Por eso aquí se busca por el nombre exacto y se exige la unidad.
      Si el catálogo devuelve una unidad distinta de la que la partida
      espera, la línea no entra y se dice en voz alta. Un presupuesto
      que se equivoca en silencio es peor que uno que no se puede
      hacer.

   2. HAY OCHO ÍTEMS DUPLICADOS, y presupuestar los encuentra porque
      hay que elegir uno. Tres son el mismo tubo escrito dos veces,
      «drenaje» y «DRENAJE», con 46% de diferencia de precio entre los
      dos. El de 60 x 60 son 52 cotizaciones del mismo porcelanato
      partidas en dos partidas de 30 y 22. La comprobación va abajo.

   3. LO QUE EL CATÁLOGO NO TIENE ES EL ESQUELETO DEL EDIFICIO. Se
      pueden presupuestar los acabados, las instalaciones y los
      aparatos con mucho detalle —2.356 ítems—, y no se puede
      presupuestar ni un metro cúbico de hormigón, ni un bloque, ni un
      metro cúbico de arena a granel. Hay arena, pero en funda de 55
      libras: para el pañete de esta torre harían falta 7.226 fundas.

      Tampoco hay puertas, ventanas, ascensor, planta eléctrica,
      movimiento de tierra ni una sola línea de mano de obra.

   4. EL NÚMERO QUE SALE NO ES UN PRESUPUESTO Y NO HAY QUE LLAMARLO
      ASÍ. Es la parte del material que el catálogo sabe poner precio.

   EL EDIFICIO ES UN SUPUESTO DEL EJERCICIO, no un proyecto real: 22 x
   16 m de planta, ocho niveles, 2,90 m de altura, cuatro apartamentos
   por nivel. Los rendimientos —0,32 m³ de hormigón por m² construido,
   85 kg de acero por m³, 12,5 bloques por m²— son los de uso corriente
   en edificación de hormigón armado en el país, y están escritos en
   cada línea para que se puedan discutir.
   ========================================================= */

const { execFileSync } = require('child_process');
const path = require('path');

function modelo() {
  return JSON.parse(execFileSync('node', [path.join(__dirname, 'datos-para-excel.js')],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
}
const m = modelo();
const porCodigo = new Map(m.items.map(i => [i.codigo, i]));

/* ---------- el edificio (supuestos del ejercicio, no un proyecto real) ---------- */
const P = { largo: 22, ancho: 16, niveles: 8, altura: 2.90, apt: 4 };
P.planta = P.largo * P.ancho;                    // 352 m²
P.construida = P.planta * P.niveles;             // 2 816 m²
P.apartamentos = P.apt * P.niveles;              // 32
P.perimetro = 2 * (P.largo + P.ancho);           // 76 m
P.fachada = P.perimetro * P.altura * P.niveles;  // 1 763 m²
P.vanos = P.fachada * 0.20;                      // 20% de aberturas
P.muroExt = P.fachada - P.vanos;
P.muroInt = P.construida * 0.90;
P.muros = P.muroExt + P.muroInt;
P.panetear = P.muros * 2 + P.construida;         // dos caras + cielos
P.pisos = P.construida * 0.85;                   // descontando muros
P.banos = P.apartamentos * 1.5;                  // 48
P.salidas = P.apartamentos * 30 + 200;           // eléctricas, con comunes

const L = [];   // líneas con precio
const F = [];   // lo que no se puede presupuestar

/* SE BUSCA POR NOMBRE Y SE EXIGE LA UNIDAD.

   La primera versión de este script pedía los ítems por su código, que
   es lo que el catálogo enseña. Seis de veinticuatro códigos ya no
   apuntaban a lo que yo creía —se mueven en cada importación— y uno de
   ellos, el del alambre de amarre, cayó en «Malla electrosoldada D2.3,
   rollo» a RD$ 18.253: 2.528 rollos, RD$ 46 millones, el 84% del
   presupuesto. Nada avisó.

   Por eso aquí se busca por el nombre exacto y además se comprueba la
   unidad: si la que devuelve el catálogo no es la que la partida espera,
   la línea no entra y se dice. */
function linea(grupo, concepto, nombre, unidadEsperada, cantidad, nota) {
  const cand = m.items.filter(i => i.nombre === nombre);
  if (!cand.length) {
    F.push({ grupo, concepto, cantidad, unidad: unidadEsperada,
             motivo: 'no hay ningún ítem que se llame «' + nombre + '»' });
    return;
  }
  if (cand.length > 1) {
    F.push({ grupo, concepto, cantidad, unidad: unidadEsperada,
             motivo: cand.length + ' ítems distintos se llaman «' + nombre + '» (' +
                     cand.map(c => c.codigo + ' a ' + Math.round(c.ref)).join(', ') + ')' });
    return;
  }
  const it = cand[0];
  if (it.unidad !== unidadEsperada) {
    F.push({ grupo, concepto, cantidad, unidad: unidadEsperada,
             motivo: '«' + nombre + '» se vende por ' + it.unidad + ' y la partida lo pide por ' + unidadEsperada });
    return;
  }
  L.push({ grupo, concepto, item: it.nombre, codigo: it.codigo, unidad: it.unidad, cantidad,
           precio: it.ref, total: cantidad * it.ref, nota: nota || '' });
}
/* Para los casos en que el nombre no alcanza y la elección es a
   propósito. Se deja aparte del camino normal para que se vea. */
function lineaCodigo(grupo, concepto, codigo, unidadEsperada, cantidad, nota) {
  const it = porCodigo.get(codigo);
  if (!it || it.unidad !== unidadEsperada) {
    F.push({ grupo, concepto, cantidad, unidad: unidadEsperada, motivo: 'el código ' + codigo + ' ya no sirve' });
    return;
  }
  L.push({ grupo, concepto, item: it.nombre, codigo: it.codigo, unidad: it.unidad, cantidad,
           precio: it.ref, total: cantidad * it.ref, nota: nota || '' });
}

function falta(grupo, concepto, cantidad, unidad, motivo) {
  F.push({ grupo, concepto, cantidad: cantidad, unidad, motivo });
}

/* ---------- 1. ESTRUCTURA ---------- */
const hormigon = P.construida * 0.32;                    // m³, 0,32 m³/m² construido
falta('Estructura', 'Hormigón premezclado 210 kg/cm²', Math.round(hormigon), 'm³',
      'el catálogo solo tiene hormigón seco en funda de 66 lb, que es para reparaciones');

const aceroKg = hormigon * 85;                           // 85 kg/m³
const VAR = [['1/2"', 0.50, 6.06], ['3/8"', 0.30, 3.40], ['3/4"', 0.20, 13.62]];
VAR.forEach(([cod, parte, kgPorVarilla]) => {
  linea('Estructura', 'Acero de refuerzo ' + cod, 'Varilla corrugada ' + cod + ' x 20 pies', 'unidad',
        Math.ceil(aceroKg * parte / kgPorVarilla),
        Math.round(parte * 100) + '% del acero · ' + kgPorVarilla + ' kg por varilla');
});
linea('Estructura', 'Alambre de amarre', 'Alambre galvanizado calibre 18, para varillas', 'lb', Math.ceil(aceroKg * 0.015 * 2.2), '1,5% del peso del acero');

const encofrado = P.construida * 2.2;                    // m² de contacto
linea('Estructura', 'Encofrado: plywood', 'Plywood de formaleta 3/4", 4 x 8 pies', 'plancha', Math.ceil(encofrado / 2.97 / 8), '2,97 m²/plancha · 8 usos');
linea('Estructura', 'Encofrado: cuartones', 'Cuartón de pino 2" x 4" x 12 pies', 'unidad', Math.ceil(encofrado * 3 / 3.66 / 8), '3 m de cuartón por m² · 8 usos');

/* ---------- 2. MAMPOSTERÍA ---------- */
falta('Mampostería', 'Bloque de hormigón 6"', Math.round(P.muros * 12.5), 'unidad',
      'el catálogo no tiene bloques: cero ítems');
linea('Mampostería', 'Mortero de pega', 'Mortero para pegar bloques, funda 42.5 kg', 'funda', Math.ceil(P.muros * 12.5 / 25), '1 funda pega 25 bloques');

/* ---------- 3. PAÑETE ---------- */
const morteroM3 = P.panetear * 0.015;
linea('Terminación', 'Pañete: cemento', 'Cemento gris portland, funda 42.5 kg', 'funda', Math.ceil(morteroM3 * 7.5), 'mortero 1:4 · 7,5 fundas por m³');
falta('Terminación', 'Pañete: arena a granel', Math.round(morteroM3 * 0.9), 'm³',
      'solo hay arena en funda de 55 lb (≈0,02 m³): harían falta unas ' + Math.round(morteroM3 * 0.9 / 0.02) + ' fundas');

/* ---------- 4. PISOS Y REVESTIMIENTOS ---------- */
/* El catálogo publica DOS partidas con este mismo nombre —MAT-08-003
   con 30 cotizaciones de Ochoa y MAT-08-158 con 22 de CerArte y La
   Ibérica— porque una guarda además el largo y el ancho en centímetros
   y la otra solo el formato. Son 52 cotizaciones del mismo porcelanato
   partidas en dos. Se presupuesta con la de más cotizaciones y queda
   anotado. */
lineaCodigo('Pisos', 'Porcelanato de piso 60 x 60', 'MAT-08-003', 'm²', Math.ceil(P.pisos),
            'el catálogo lo tiene duplicado: se toma el de 30 cotizaciones');
linea('Pisos', 'Adhesivo cementicio', 'Adhesivo cementicio C1 gris, funda 22.7 kg', 'funda', Math.ceil(P.pisos * 5 / 22.7), '5 kg/m² · funda de 22,7 kg');
linea('Pisos', 'Derretido', 'Derretido para cerámica, funda 22.7 kg', 'funda', Math.ceil(P.pisos * 0.3 / 22.7), '0,3 kg/m²');

/* ---------- 5. PINTURA ---------- */
linea('Terminación', 'Pintura acrílica, dos manos', 'Pintura acrílica, cubeta de 5 galones', 'envase',
      Math.ceil(P.panetear * 2 / 10 / 5), 'rendimiento 10 m²/galón · cubeta de 5');

/* ---------- 6. INSTALACIÓN ELÉCTRICA ---------- */
linea('Eléctrica', 'Cable THHN #12', 'Cable THHN #12, rollo 100 pies', 'rollo', Math.ceil(P.salidas * 25 / 30.48), '25 m por salida · rollo de 100 pies');
linea('Eléctrica', 'Tubo EMT 1/2"', 'Tubo EMT 1/2" x 10 pies', 'tubo', Math.ceil(P.salidas * 10 / 3.05), '10 m por salida · tubo de 10 pies');
linea('Eléctrica', 'Panel de breakers por apartamento', 'Panel de breakers de 12 espacios', 'unidad', P.apartamentos, 'uno de 12 espacios por apartamento');
linea('Eléctrica', 'Breaker 1P de 20 A', 'Breaker enchufable 1P de 20 A', 'unidad', P.apartamentos * 8, '8 circuitos por apartamento');
linea('Eléctrica', 'Interruptor sencillo', 'Interruptor sencillo', 'unidad', P.apartamentos * 12, '');
linea('Eléctrica', 'Tomacorriente doble', 'Tomacorriente doble', 'unidad', P.apartamentos * 18, '');

/* ---------- 7. PLOMERÍA ---------- */
linea('Plomería', 'Tubo PVC drenaje 4"', 'Tubo PVC drenaje 4" x 19 pies', 'tubo', Math.ceil(P.banos * 6 / 5.79), '6 m por baño · tubo de 19 pies');
linea('Plomería', 'Tubo PVC presión 1/2"', 'Tubo PVC presión 1/2" SCH-40 x 19 pies', 'tubo', Math.ceil(P.banos * 18 / 5.79), '18 m por baño');
linea('Plomería', 'Codo de 90° de PVC presión 1/2"', 'Codo de 90° de PVC presión 1/2"', 'unidad', P.banos * 14, '');
linea('Plomería', 'Tee de PVC presión 1/2"', 'Tee de PVC presión 1/2"', 'unidad', P.banos * 8, '');

/* ---------- 8. APARATOS SANITARIOS ---------- */
linea('Sanitarios', 'Inodoro de una pieza', 'Inodoro de una pieza', 'unidad', P.banos, '');
linea('Sanitarios', 'Lavamanos de pedestal', 'Lavamanos, de pedestal', 'unidad', P.banos, '');
linea('Sanitarios', 'Mezcladora de ducha', 'Mezcladora de ducha', 'unidad', P.banos, '');
linea('Sanitarios', 'Mezcladora de lavamanos', 'Mezcladora, de baño', 'unidad', P.banos, '');
linea('Sanitarios', 'Fregadero de dos pozos', 'Fregadero de 2 pozos, 33 x 19 pulgadas', 'unidad', P.apartamentos, 'uno por cocina');

/* ---------- 9. LO QUE NO ESTÁ ---------- */
falta('Preliminares', 'Movimiento de tierra (excavación y relleno)', Math.round(P.planta * 1.2), 'm³', 'el catálogo no tiene movimiento de tierra');
falta('Puertas y ventanas', 'Ventana de aluminio y vidrio', Math.round(P.vanos), 'm²', 'el catálogo no tiene ventanas');
falta('Puertas y ventanas', 'Puerta de paso', P.apartamentos * 5, 'unidad', 'el catálogo no tiene puertas');
falta('Equipos', 'Ascensor para 8 niveles', 1, 'unidad', 'el catálogo no tiene ascensores de edificio');
falta('Equipos', 'Planta eléctrica de emergencia', 1, 'unidad', 'el catálogo no tiene plantas eléctricas');
falta('Mano de obra', 'Toda la mano de obra', 1, 'global', 'el catálogo es de materiales: no tiene un solo precio de mano de obra');
falta('Trámites', 'Licencias y permisos', 6, 'trámite', 'los seis ítems de MOS-04 existen pero su precio es 0');

/* ---------- salida ---------- */
const pesos = n => 'RD$ ' + Math.round(n).toLocaleString('en-US');
const grupos = {};
L.forEach(l => { grupos[l.grupo] = (grupos[l.grupo] || 0) + l.total; });
const total = L.reduce((s, l) => s + l.total, 0);

console.log('TORRE DE 8 NIVELES · ' + P.construida.toLocaleString('en-US') + ' m² construidos · ' +
            P.apartamentos + ' apartamentos');
console.log('Presupuesto de MATERIALES contra el catálogo publicado\n');
let g = '';
L.forEach(l => {
  if (l.grupo !== g) { g = l.grupo; console.log('── ' + g.toUpperCase()); }
  console.log('   ' + l.concepto.padEnd(34) + String(Math.round(l.cantidad)).padStart(7) + ' ' +
    (l.unidad || '').padEnd(9) + pesos(l.precio).padStart(11) + pesos(l.total).padStart(15));
});
console.log('\n' + '─'.repeat(78));
Object.entries(grupos).sort((a, b) => b[1] - a[1]).forEach(([k, v]) =>
  console.log('   ' + k.padEnd(34) + pesos(v).padStart(18) + ('  ' + (v / total * 100).toFixed(1) + '%').padStart(9)));
console.log('   ' + 'TOTAL DE LO QUE SÍ SE PUEDE PRESUPUESTAR'.padEnd(34) + pesos(total).padStart(18));
console.log('   ' + 'por m² construido'.padEnd(34) + pesos(total / P.construida).padStart(18));

console.log('\n' + '═'.repeat(78));
console.log('LO QUE EL CATÁLOGO NO PUEDE PRESUPUESTAR (' + F.length + ' partidas)\n');
F.forEach(f => {
  console.log('   ' + f.grupo.padEnd(18) + f.concepto);
  console.log('   ' + ' '.repeat(18) + String(f.cantidad).padStart(9) + ' ' + (f.unidad || '') + '  →  ' + f.motivo);
});

/* ---------- los duplicados que estorban al presupuestar ---------- */
const norm = t => String(t).toLowerCase().replace(/\s+/g, ' ').trim();
const porNombre = {};
m.items.forEach(i => { (porNombre[norm(i.nombre)] = porNombre[norm(i.nombre)] || []).push(i); });
const dup = Object.values(porNombre).filter(v => v.length > 1);
console.log('\n' + '═'.repeat(78));
console.log('ÍTEMS CON EL MISMO NOMBRE (' + dup.length + ' pares)\n');
console.log('Presupuestar los encuentra porque hay que elegir uno, y el nombre');
console.log('no da con qué elegir.\n');
dup.forEach(v => console.log('   ' + v.map(x => x.codigo + ' ' + pesos(x.ref) +
  ' (' + (x.todas || []).length + ' cot)').join('   vs   ') + '\n   ' + ' '.repeat(4) + '«' + v[0].nombre + '»'));
