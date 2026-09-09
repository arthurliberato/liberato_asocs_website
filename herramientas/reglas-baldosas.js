'use strict';
/* =========================================================
   reglas-baldosas.js — Ochoa · baldosas

   Qué decide este archivo: qué es cada artículo del catálogo de
   baldosas y a qué especificación corresponde una vez que se le
   quita la marca, el color y el nombre de la colección.

   Las tres cosas que hubo que resolver:

   1. LAS CATEGORÍAS DEL COMERCIO NO DICEN QUÉ ES UN ARTÍCULO.
      Hay porcelanato archivado en «ceramica», cerámica archivada
      en «porcelanato», crucetas en «herramientas» y listelos de
      aluminio en «esquineros». La familia sale del nombre y de
      la ficha; la categoría solo se usa como último recurso.

   2. LA REFERENCIA TRAE TRES NÚMEROS PEGADOS.
      60X602.77MT/2 son 60 x 60 cm y 2.77 piezas por metro
      cuadrado. Dónde termina el ancho y empieza el factor no se
      puede saber leyendo: 45X455.0MT/2 se puede leer como
      45 x 4 con 55 piezas/m², o como 45 x 45 con 5 piezas/m². Se
      resuelve con geometría: la lectura buena es la que cuadra
      con 10000 / (largo × ancho). La extracción del comercio se
      equivocó en esos casos y aquí quedan recuperados.

   3. HAY PRECIOS DE LIQUIDACIÓN.
      23 artículos están rebajados más del 50%, y uno llega al
      99%: un mosaico de RD$ 599.52 a RD$ 4.54. Es un precio
      real, pero no es una referencia de mercado: nadie
      presupuesta una obra con saldo de almacén. Se descartan y
      se dice por qué.
   ========================================================= */

const ESP = require('./especificacion-baldosas.js');

/* Rebaja a partir de la cual el precio deja de ser una referencia. El corte
   no es una opinión: el catálogo tiene 239 artículos rebajados hasta 40% —
   promociones normales, la mayoría entre 10% y 30%— y luego un hueco, y
   después 23 artículos entre 50% y 99%. */
const LIQUIDACION = 0.5;

const limpia = s => String(s || '').replace(/\s+/g, ' ').trim();
const baja = s => limpia(s).toLowerCase()
  .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i')
  .replace(/[óò]/g, 'o').replace(/[úù]/g, 'u').replace(/ñ/g, 'n');

/* ---------------------------------------------------------
   La ficha: «Dimensiones: 60 x 60 cmTipo de producto: Baldosa…»
   Un solo párrafo sin puntuación, con las claves pegadas al valor
   anterior. Se corta justo antes de cada «Clave:».
   --------------------------------------------------------- */
const CORTE = /(?<=[a-záéíóúñ0-9%²)\.])(?=[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [a-záéíóúñ0-9²]+){0,3}:)/;

function ficha(a) {
  const t = limpia(a.info);
  const o = {};
  if (!t) return o;
  t.split(CORTE).forEach(trozo => {
    const i = trozo.indexOf(':');
    if (i > 0) o[baja(trozo.slice(0, i))] = limpia(trozo.slice(i + 1));
  });
  return o;
}

/* ---------------------------------------------------------
   Formato y piezas por metro cuadrado
   --------------------------------------------------------- */

/* Lee la referencia tipo 60X602.77MT/2 probando dónde parte el ancho del
   factor y quedándose con la lectura que cuadra con la geometría. */
function deLaReferencia(ref) {
  const t = String(ref || '').toUpperCase().replace(/\s/g, '');
  /* El ancho y el factor vienen pegados y los dos pueden traer decimales:
     50.8X50.83.86MT/2 son 50.8 x 50.8 cm con 3.86 piezas por m². Se toma la
     tira entera y abajo se prueba dónde parte. */
  const m = t.match(/^(\d+(?:\.\d+)?)X([\d.]+)MT/);
  if (!m) return null;
  const largo = parseFloat(m[1]), resto = m[2];
  const candidatos = [];
  for (let i = 1; i < resto.length; i++) {
    const b = resto.slice(0, i), u = resto.slice(i);
    /* Las dos mitades tienen que ser números completos. Sin esto, una
       referencia mal escrita —50.8X50.3.86, que perdió un 8— se deja leer
       como «50.3 con 6 piezas» partiendo un decimal por la mitad, y sale un
       precio por metro un 55% más alto. */
    if (!/^\d+(?:\.\d+)?$/.test(b) || !/^\d+(?:\.\d+)?$/.test(u)) continue;
    const ancho = parseFloat(b), piezas = parseFloat(u);
    if (!(ancho > 0) || !(piezas > 0)) continue;
    /* Una baldosa de campo no mide menos de 5 cm de lado: eso descarta la
       lectura «45 x 4 con 55 piezas» sin tener que confiar en el margen. */
    if (ancho < 5 || largo < 5) continue;
    const teorico = 10000 / (largo * ancho);
    candidatos.push({ largo, ancho, piezas, razon: piezas / teorico });
  }
  if (!candidatos.length) return null;

  /* Lo normal: el factor del comercio y la geometría coinciden dentro del 12%
     —la diferencia es la junta— y esa lectura es la buena. */
  const exactos = candidatos.filter(c => Math.abs(c.razon - 1) < 0.12);
  if (exactos.length) {
    exactos.sort((p, q) => Math.abs(p.razon - 1) - Math.abs(q.razon - 1));
    return exactos[0];
  }

  /* Cuando ninguna cuadra, la pieza no es rectangular. En un hexágono el
     rectángulo que lo encierra miente: las piezas se traban y hacen falta un
     tercio más de las que dice el área. Se acepta el factor del comercio
     mientras esté en el mismo orden de magnitud que la geometría, y entre
     varias lecturas gana la más cercana. */
  const razonables = candidatos.filter(c => c.razon > 0.5 && c.razon < 1.6);
  if (!razonables.length) return null;
  razonables.sort((p, q) => Math.abs(p.razon - 1) - Math.abs(q.razon - 1));
  return razonables[0];
}

/* Sin factor: la referencia solo trae las dos medidas (33X120, 69.5X3). */
function medidasSueltas(ref) {
  const t = String(ref || '').toUpperCase().replace(/\s/g, '');
  const m = t.match(/^(\d+(?:\.\d+)?)X(\d+(?:\.\d+)?)(?![\d.])/);
  if (!m) return null;
  return { largo: parseFloat(m[1]), ancho: parseFloat(m[2]) };
}

/* La ficha también declara el formato, y cuando lo hace manda ella. */
function deLaFicha(f) {
  const d = f['dimensiones'] || f['formato'] || '';
  const m = d.match(/(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)\s*cm/);
  if (!m) return null;
  return { largo: parseFloat(m[1].replace(',', '.')), ancho: parseFloat(m[2].replace(',', '.')) };
}

function piezasPorM2(f) {
  const v = f['unidades necesarias por m2'] || f['unidades necesarias por m²'] ||
            f['piezas por metro cuadrado'] || '';
  const m = String(v).match(/(\d+(?:[.,]\d+)?)/);
  return m ? parseFloat(m[1].replace(',', '.')) : null;
}

/* ---------------------------------------------------------
   Material y uso
   --------------------------------------------------------- */

function material(a, f) {
  const t = baja((f['material'] || '') + ' ' + (f['tipo de producto'] || ''));
  if (/porcelan|gres/.test(t)) return 'porcelanato';
  if (/ceramic|pasta|barro|arcilla/.test(t)) {
    /* El nombre gana cuando la ficha dice «baldosa cerámica» de un producto
       que se llama a sí mismo porcelánico: la ficha usa «cerámica» como
       nombre genérico del rubro. */
    return /\bporc\b|porcelan/.test(baja(a.nombre)) ? 'porcelanato' : 'ceramica';
  }
  if (/\bporc\b|porcelan/.test(baja(a.nombre))) return 'porcelanato';
  if (a.cat3 === 'porcelanato') return 'porcelanato';
  return 'ceramica';
}

function uso(a, f) {
  const t = baja([f['uso recomendado'], f['tipo de producto'], f['uso'], f['aplicacion']].join(' '));
  const piso = /piso|pavimento|suelo/.test(t);
  const pared = /pared|revestimiento|muro|azulejo/.test(t);
  if (piso && pared) return 'piso y pared';
  if (piso) return 'piso';
  if (pared) return 'pared';
  /* La ficha calló. Aquí sí sirve la categoría del comercio: separa su
     catálogo en pavimentos y revestimientos, y en eso es consistente. */
  if (a.cat2 === 'pavimentos') return 'piso';
  if (a.cat2 === 'revestimientos') return 'pared';
  return null;
}

/* El acabado, para registrarlo como medida. Se normaliza a cuatro palabras
   porque la ficha lo escribe de 134 maneras. */
function acabado(f) {
  const t = baja((f['acabado superficial'] || '') + ' ' + (f['superficie'] || '') + ' ' + (f['acabado'] || ''));
  if (!t.trim()) return '';
  if (/antidesliz/.test(t)) return 'antideslizante';
  if (/pulid/.test(t)) return 'pulido';
  if (/brillo|brillante/.test(t)) return 'brillante';
  if (/mate|natural|satinad/.test(t)) return 'mate';
  return '';
}

function espesorMm(f) {
  const t = String(f['espesor'] || f['espesor aproximado'] || '');
  const cm = t.match(/(\d+(?:[.,]\d+)?)\s*cm/);
  if (cm) return Math.round(parseFloat(cm[1].replace(',', '.')) * 10);
  const nums = t.match(/\d+(?:[.,]\d+)?/g);
  if (!nums) return null;
  const v = nums.map(n => parseFloat(n.replace(',', '.')));
  /* «8 - 10 mm» es un rango de fábrica: se registra el promedio, redondeado,
     porque lo que importa es distinguir 8 de 20, no 8 de 8.5. */
  return Math.round(v.reduce((s, n) => s + n, 0) / v.length);
}

/* ---------------------------------------------------------
   Piezas por funda, para las crucetas y los niveladores
   --------------------------------------------------------- */
function piezasPorFunda(a) {
  const t = limpia(a.nombre + ' ' + a.ref).toUpperCase();
  let m = t.match(/(\d{2,4})\s*(?:UDS|UNIDADES|PCS|PZAS|PIEZAS)/);
  if (m) return parseInt(m[1], 10);
  m = t.match(/\((\d{2,4})\s*PCS\)/);
  return m ? parseInt(m[1], 10) : null;
}

/* La medida de un repuesto de corte, en la unidad en que la escribe el
   comercio: «18 mm» o «10"». No se convierte, porque un disco de 10 pulgadas
   se pide así y llamarlo «254 mm» no lo aclara.

   El número tiene que venir suelto: en la referencia «0194610MM» el 10 está
   pegado al código del artículo 01946 y leerlo sería adivinar. */
function medidaCorte(a) {
  const t = limpia(a.nombre + ' ' + a.ref);
  let m = t.match(/(?:^|[\s(.])(\d{1,3}(?:\.\d+)?)\s*[Mm][Mm]/);
  if (m) return m[1] + ' mm';
  m = t.match(/(?:^|[\s(.])(\d{1,2})\s*(?:''|\u201d)/);
  if (m) return m[1] + '"';
  return null;
}

function espesorCruceta(a) {
  const m = limpia(a.nombre).match(/(\d+(?:\.\d+)?)\s*[Mm][Mm]/);
  return m ? parseFloat(m[1]) : null;
}

/* El peso de la funda. La ficha lo declara en «Presentación», que es el campo
   cuyo trabajo es decirlo; la referencia a veces lo contradice —el Pegacol
   Blanco trae 20KG en la referencia y «Fundas de 50 lb» en la ficha— y en ese
   caso manda la ficha. */
function presentacionKg(f, a) {
  const t = limpia(f['presentacion'] || '') || limpia(a.ref);
  let m = t.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (m) return ESP.aPesoKg(parseFloat(m[1].replace(',', '.')));
  m = t.match(/(\d+(?:[.,]\d+)?)\s*(?:lb|libras?)/i);
  if (m) return ESP.aPesoKg(parseFloat(m[1].replace(',', '.')) * 0.4536);
  return null;
}

/* ---------------------------------------------------------
   Las familias, decididas por el nombre
   --------------------------------------------------------- */

/* Decoración suelta: el listelo y la cenefa cerámicos son una decisión de
   decorador, no una partida de obra. Misma regla que sacó los toalleros del
   catálogo de baños. */
const DECORACION = /^(listelo|list\.?\s*(club|dcer|dv))/;

function familia(a, f) {
  const n = baja(a.nombre);

  if (/^set\s+huella|huella\s*\/?\s*c\s*\/?\s*huella|huella\s*\/\s*contra/.test(n)) return 'set-huella';
  if (/^borde\s*p\s*\/?\s*pelda/.test(n)) return 'borde-peldano';
  if (/pelda[nñ]o/.test(n) && !/perfil|perf\./.test(n)) return 'peldano';
  if (/rodapie/.test(n)) return 'rodapie';
  if (/mosaico/.test(n)) return 'mosaico';

  if (/^cruceta|^crucetas/.test(n)) return 'cruceta';
  if (/calzo|cu[nñ]a|clip.*nivel|nivelador|brida nivel/.test(n)) return 'nivelador-ceramica';
  if (/kit de nivelaci/.test(n)) return 'herramienta-ceramica';

  if (/^adoquin/.test(n)) return 'adoquin';
  if (/^teja/.test(n)) return 'teja';
  if (/caballete/.test(n)) return 'caballete-teja';

  if (/^cortadora|^cortador\b/.test(n)) return 'cortadora-ceramica';
  if (/^disco|^rodel|^cuchilla|^cucihlla|^llana|^aplicador|^ventosa|^alicate|^base el|^bomba|^cable de tambor|^kit fijacion/.test(n))
    return 'herramienta-ceramica';

  /* Morteros y adhesivos: el comercio los archiva bajo baldosas, pero un
     presupuesto los busca en cemento y morteros. */
  if (/^adhesivo|^pegacol|^cemento p\s*\/\s*ceramica/.test(n)) return 'adhesivo';
  if (/^eurojunta|derretido/.test(n)) return 'derretido';
  if (/^readymix|mezcla lista/.test(n)) return 'mortero-panete';
  if (/estuco/.test(n)) return 'estuco';
  if (/masilla/.test(n)) return 'masilla-revestimiento';
  if (/^hormigon seco/.test(n)) return 'hormigon-seco';

  if (/^esquiner|^perfil|^perf\.|^remate|^junta de dilat|^list\.?\s*(aluminio|alum|ac\.)|listelo (de|u) (aluminio|acero)|listelo aluminio/.test(n))
    return 'perfil-canto';

  if (DECORACION.test(n)) return null;                 // decoración suelta

  /* Todo lo demás en las familias de baldosa es baldosa de campo. */
  if (a.cat3 === 'ceramica' || a.cat3 === 'ceramicas' || a.cat3 === 'porcelanato' ||
      a.cat3 === 'marmol para revestimientos' || a.cat3 === 'cenefas') return 'baldosa';
  return undefined;                                     // familia sin regla
}

/* ---------------------------------------------------------
   Perfiles de canto: tipo, material y medida
   --------------------------------------------------------- */
function specPerfil(a) {
  const n = baja(a.nombre);
  const tipo = /junta de dilat/.test(n) ? 'dilatacion'
             : /remate|separador/.test(n) ? 'separador'
             : /pelda/.test(n) ? 'peldano'
             : /esquiner/.test(n) ? 'esquinero'
             : 'listelo';
  const mat = /ac\.?\s*inox|acero inox/.test(n) ? 'acero inoxidable'
            : /alum|alu\b/.test(n) ? 'aluminio'
            : /pvc/.test(n) ? 'PVC'
            : /fibra veg/.test(n) ? 'fibra vegetal'
            : '';
  if (!mat) return null;
  /* La medida es el ala visible del perfil, en milímetros. La ficha la
     escribe de dos formas: «8.5 Mm» o «12X12» (ala por ala), y en el segundo
     caso la primera es la que se ve. */
  const t = limpia(a.nombre + ' ' + a.ref);
  let medida = null;
  let m = t.match(/(\d+(?:\.\d+)?)\s*[Mm][Mm]/);
  if (m) medida = parseFloat(m[1]);
  if (!medida) {
    m = limpia(a.nombre).match(/(?:^|\s)(\d{1,2}(?:\.\d)?)\s*[xX]\s*(\d{1,2})(?!\d)/);
    if (m) medida = parseFloat(m[1]);
  }
  /* Sin medida no hay ítem: un esquinero de 8.5 mm y uno de 12 mm no son la
     misma partida, y el precio se mueve con ella. */
  if (!medida) return null;
  return ESP.item('perfil-canto', { tipo: tipo, material: mat, medida_mm: medida });
}

/* ---------------------------------------------------------
   La regla
   --------------------------------------------------------- */

/* Especificaciones que el catálogo ya tenía escritas a mano. Son ítems que
   nacieron como estimación nuestra y que esta extracción convierte en
   verificados: el ítem no se duplica, se le pone precio. */
const YA_EXISTE = {
  'derretido-kg-5': 'MAT-02-013',                              // Derretido (grout) con arena, funda 5 kg
  'mortero-panete-kg-42-5': 'MAT-02-009',                      // Mortero predosificado de pañete, funda 42.5 kg
  'adhesivo-cementicio-clase-c1-color-blanco-kg-22-7': 'MAT-02-007',  // Pegamento de cerámica blanco, funda 22.7 kg
  /* Las cuatro baldosas con las que arrancó el catálogo. Estaban escritas con
     el nombre de la calle —«cerámica nacional», «porcelanato mate»— y ahora
     llevan el nombre de su especificación, para que esta extracción caiga
     encima en vez de duplicarlas. */
  'baldosa-material-ceramica-uso-piso-formato-33-x-33-cm': 'MAT-08-001',
  'baldosa-material-ceramica-uso-pared-formato-40-x-25-cm': 'MAT-08-002',
  'baldosa-material-porcelanato-uso-piso-formato-60-x-60-cm': 'MAT-08-003',
  'baldosa-material-porcelanato-uso-piso-formato-80-x-80-cm': 'MAT-08-004'
};

/* Motivo del descarte, para que el informe diga qué se quedó fuera y por qué
   en vez de una sola frase para todo. */
const MOTIVO = { valor: '' };

function regla(a) {
  const spec = clasificar(a);
  if (spec && YA_EXISTE[spec.clave]) {
    /* El importador se encarga: la cotización va al ítem que ya existe y no
       se crea uno nuevo con el mismo nombre. */
    return { existente: YA_EXISTE[spec.clave], factorUnidad: spec.factorUnidad };
  }
  return spec;
}

function clasificar(a) {
  MOTIVO.valor = '';
  const f = ficha(a);

  /* Un saldo de almacén no es una referencia de mercado. */
  if (typeof a.descuento === 'number' && a.descuento >= LIQUIDACION) {
    MOTIVO.valor = 'precio de liquidación, rebajado más del ' + Math.round(LIQUIDACION * 100) + '%';
    return null;
  }

  const fam = familia(a, f);
  if (fam === undefined) return undefined;              // familia sin regla, ni se cuenta
  if (fam === null) { MOTIVO.valor = 'pieza suelta de decoración'; return null; }

  if (fam === 'baldosa') {
    const porRef = deLaReferencia(a.ref);
    const enFicha = deLaFicha(f);
    const dim = enFicha || (porRef && { largo: porRef.largo, ancho: porRef.ancho });
    if (!dim) { MOTIVO.valor = 'la ficha no declara el formato'; return null; }

    const u = uso(a, f);
    if (!u) { MOTIVO.valor = 'la ficha no dice si es de piso o de pared'; return null; }

    /* Las piezas por metro cuadrado. Manda el factor que el comercio imprime
       en su propia referencia: 58X583.01MT2 dice 3.01, mientras la geometría
       pura da 2.973 —la diferencia es la junta— y es contra el 3.01 que la
       tienda factura.

       Lo que NO se hace es calcularlo del formato cuando el comercio no lo
       declara. En una baldosa hexagonal el rectángulo que la encierra miente:
       23.2 x 26.8 daría 16.07 piezas por metro y las que hacen falta son
       21.62, porque los hexágonos se traban. Sin el factor declarado, el
       artículo no entra. */
    const piezas = (porRef && porRef.piezas) || piezasPorM2(f) || a.unidadesM2;
    if (!(piezas > 0)) { MOTIVO.valor = 'la ficha no declara cuántas piezas lleva el metro cuadrado'; return null; }

    const medidas = {
      material: material(a, f),
      uso: u,
      formato: ESP.formato(dim.largo, dim.ancho),
      largo_cm: ESP.aFormatoCm(Math.max(dim.largo, dim.ancho)),
      ancho_cm: ESP.aFormatoCm(Math.min(dim.largo, dim.ancho)),
      piezas_m2: Math.round(piezas * 100) / 100
    };
    const ac = acabado(f); if (ac) medidas.acabado = ac;
    const es = espesorMm(f); if (es) medidas.espesor_mm = es;

    const spec = ESP.item('baldosa', medidas);
    if (spec) spec.factorUnidad = { veces: piezas, nota: 'La tienda cotiza por pieza; van ' +
      medidas.piezas_m2 + ' piezas por m² según su propia referencia' };
    return spec;
  }

  if (fam === 'mosaico') {
    const porRef = deLaReferencia(a.ref);
    const dim = deLaFicha(f) || (porRef && { largo: porRef.largo, ancho: porRef.ancho });
    if (!dim) { MOTIVO.valor = 'la ficha no declara el formato de la malla'; return null; }
    const piezas = (porRef && porRef.piezas) || piezasPorM2(f) || a.unidadesM2;
    if (!(piezas > 0)) { MOTIVO.valor = 'la ficha no declara cuántas mallas lleva el metro cuadrado'; return null; }
    const spec = ESP.item('mosaico', {
      formato: ESP.formato(dim.largo, dim.ancho),
      largo_cm: ESP.aFormatoCm(Math.max(dim.largo, dim.ancho)),
      ancho_cm: ESP.aFormatoCm(Math.min(dim.largo, dim.ancho)),
      piezas_m2: Math.round(piezas * 100) / 100
    });
    if (spec) spec.factorUnidad = { veces: piezas, nota: 'La tienda cotiza por malla; van ' +
      (Math.round(piezas * 100) / 100) + ' mallas por m²' };
    return spec;
  }

  if (fam === 'peldano') {
    const dim = deLaFicha(f) || medidasSueltas(a.ref);
    if (!dim) { MOTIVO.valor = 'la ficha no declara la medida del peldaño'; return null; }
    return ESP.item('peldano', {
      formato: ESP.formato(dim.largo, dim.ancho),
      largo_cm: ESP.aFormatoCm(Math.max(dim.largo, dim.ancho)),
      ancho_cm: ESP.aFormatoCm(Math.min(dim.largo, dim.ancho))
    });
  }

  if (fam === 'set-huella' || fam === 'borde-peldano') {
    const t = limpia(a.ref).toUpperCase().replace(/\s/g, '');
    let largo = null;
    const m = t.match(/^(\d+(?:\.\d+)?)(M|MX|X)/);
    if (m) largo = parseFloat(m[1]) * (m[2] === 'M' || m[2] === 'MX' ? 100 : 1);
    if (!largo) { MOTIVO.valor = 'la ficha no declara el largo'; return null; }
    return ESP.item(fam, { largo_cm: Math.round(largo) });
  }

  if (fam === 'rodapie') {
    const mat = /marmol|crema marfil|travertin/.test(baja(a.nombre + ' ' + a.cat2)) ? 'mármol' : 'cerámica';
    return ESP.item('rodapie', { material: mat });
  }

  if (fam === 'perfil-canto') {
    const spec = specPerfil(a);
    if (!spec) MOTIVO.valor = 'la ficha no declara el material o la medida del perfil';
    return spec;
  }

  if (fam === 'cruceta') {
    const esp = espesorCruceta(a), piezas = piezasPorFunda(a);
    if (!esp) { MOTIVO.valor = 'la ficha no declara el espesor de la cruceta'; return null; }
    if (!piezas) {
      /* Sin saber cuántas trae la funda, el precio no dice nada: la misma
         cruceta de 2 mm aparece a RD$ 52.30 y a RD$ 12,274.78. */
      MOTIVO.valor = 'la ficha no declara cuántas crucetas trae el empaque';
      return null;
    }
    return ESP.item('cruceta', { espesor_mm: esp, piezas: piezas });
  }

  if (fam === 'nivelador-ceramica') {
    const n = baja(a.nombre);
    const pieza = /calzo/.test(n) ? 'calzo' : /cu[nñ]a/.test(n) ? 'cuna' : 'clip';
    const esp = espesorCruceta(a);
    /* La cuña no tiene espesor: es la pieza que aprieta, y sirve para
       cualquier junta. Va con 0, que aquí quiere decir «no aplica». En el
       calzo y el clip el espesor SÍ es la identidad y sin él no hay ítem. */
    if (pieza === 'cuna') return ESP.item('nivelador-ceramica', { pieza: pieza, espesor_mm: 0 });
    if (!esp) { MOTIVO.valor = 'la ficha no declara el espesor del nivelador'; return null; }
    return ESP.item('nivelador-ceramica', { pieza: pieza, espesor_mm: esp });
  }

  if (fam === 'adoquin') {
    const n = baja(a.nombre);
    const tipo = /raqueta/.test(n) ? 'raqueta' : /flecha/.test(n) ? 'flecha'
               : /cuad/.test(n) ? 'cuadrado' : /ladrillo|2x4x8/.test(n) ? 'ladrillo' : '';
    if (!tipo) { MOTIVO.valor = 'la ficha no declara el tipo de adoquín'; return null; }
    /* El nombre trae las piezas por metro: «Adoquin Tipo Raqueta 38.25 / Mt2». */
    const m = limpia(a.nombre).match(/(\d+(?:\.\d+)?)\s*\/?\s*Mt2/i);
    if (!m) { MOTIVO.valor = 'la ficha no declara cuántos adoquines lleva el metro cuadrado'; return null; }
    const piezas = parseFloat(m[1]);
    const spec = ESP.item('adoquin', { tipo: tipo, piezas_m2: piezas });
    if (spec) spec.factorUnidad = { veces: piezas, nota: 'La tienda cotiza por pieza; van ' +
      piezas + ' adoquines por m² según su propio nombre de artículo' };
    return spec;
  }

  if (fam === 'teja') {
    const n = baja(a.nombre);
    const mat = /acero|gravi/.test(n) ? 'acero gravillado' : 'cerámica';
    /* Un techo se presupuesta por metro cuadrado, y eso es justo lo que la
       referencia declara: TERRACOTA2MT/2 son 2 tejas por m², 10.5MT/2TGMP
       son 10.5. El formato de la pieza cambia con cada modelo; las piezas
       por metro, no. */
    const m = String(a.ref || '').toUpperCase().match(/(\d+(?:\.\d+)?)\s*MT\s*\/?\s*2/);
    if (!m) { MOTIVO.valor = 'la ficha no declara cuántas tejas lleva el metro cuadrado'; return null; }
    const piezas = parseFloat(m[1]);
    const spec = ESP.item('teja', { material: mat, piezas_m2: piezas });
    if (spec) spec.factorUnidad = { veces: piezas, nota: 'La tienda cotiza por teja; van ' +
      piezas + ' tejas por m² según su propia referencia' };
    return spec;
  }

  if (fam === 'caballete-teja') {
    const n = baja(a.nombre);
    const pieza = /^final/.test(n) ? 'final' : 'caballete';
    /* Un final de caballete cerámico cuesta RD$ 2,198 y uno de acero
       gravillado, RD$ 131. No son la misma partida. */
    const mat = /acero|gravi|duna/.test(n) ? 'acero gravillado' : 'cerámica';
    return ESP.item('caballete-teja', { pieza: pieza, material: mat });
  }

  if (fam === 'cortadora-ceramica') {
    const n = baja(a.nombre);
    const tipo = /electric|dc-250|ts-66|m18/.test(n) ? 'cortadora-electrica' : 'cortadora-manual';
    /* El largo de corte está en el nombre, en centímetros o en pulgadas. */
    let corte = null;
    const cm = limpia(a.nombre).match(/(\d+(?:\.\d+)?)\s*cms?\b/i);
    if (cm) corte = Math.round(parseFloat(cm[1]));
    if (!corte) {
      const pu = limpia(a.nombre + ' ' + a.ref).match(/(\d{2})\s*(?:''|\u201d|pulg)/);
      if (pu) corte = Math.round(parseFloat(pu[1]) * 2.54);
    }
    if (!corte) { MOTIVO.valor = 'la ficha no declara el largo de corte de la cortadora'; return null; }
    return ESP.item('cortadora-ceramica', { tipo: tipo, corte_cm: corte });
  }

  if (fam === 'herramienta-ceramica') {
    const n = baja(a.nombre);
    const tipo = /^kit de nivelaci/.test(n) ? 'kit-nivelacion'
               : /^disco/.test(n) ? (/rodel/.test(n) ? 'rodel' : 'disco')
               : /^rodel/.test(n) ? 'rodel'
               : /^cuchilla|^cucihlla/.test(n) ? 'cuchilla'
               : /^llana/.test(n) ? 'llana'
               : /^aplicador/.test(n) ? 'aplicador'
               : /^ventosa/.test(n) ? 'ventosa'
               : /^alicate/.test(n) ? 'alicate'
               : null;
    if (!tipo) {
      /* Bombas, cables de tambor y bases pasacable de Milwaukee: son
         herramienta de obra, pero de plomería y electricidad, y este
         catálogo no trae con qué describirlas. */
      MOTIVO.valor = 'herramienta que no es de instalación de cerámica';
      return null;
    }
    if (tipo === 'disco' || tipo === 'rodel' || tipo === 'cuchilla') {
      const md = medidaCorte(a);
      if (!md) { MOTIVO.valor = 'la ficha no declara la medida del repuesto de corte'; return null; }
      return ESP.item('repuesto-corte', { tipo: tipo, medida: md });
    }
    return ESP.item('herramienta-ceramica', { tipo: tipo });
  }

  /* ---------------------------------------------------------
     Morteros y adhesivos
     --------------------------------------------------------- */

  if (fam === 'adhesivo') {
    const n = baja(a.nombre);
    /* El adhesivo en pasta se vende por galón y por cuarto, no por funda. */
    if (/vinalit|galon|acrilic/.test(n + ' ' + baja(a.unidad) + ' ' + baja(f['tipo de producto']))) {
      const pres = baja(a.unidad) === 'galon' ? 'galón' : baja(a.unidad) === '1/4' ? 'cuarto de galón' : '';
      if (!pres) { MOTIVO.valor = 'la ficha no declara la presentación del adhesivo en pasta'; return null; }
      return ESP.item('adhesivo-pasta', { presentacion: pres });
    }
    const kg = presentacionKg(f, a);
    if (!kg) { MOTIVO.valor = 'la ficha no declara el peso de la funda'; return null; }
    /* La clase la declara la propia ficha: «Adherencia inicial a 28 días
       (C2)» o «Normativa: C1T». Es la diferencia entre un adhesivo normal y
       uno deformable para porcelanato, y es lo que mueve el precio. */
    const t = limpia(a.info);
    const clase = /\(C2\)|C2\b|EUROFLEX/i.test(t + ' ' + a.nombre) ? 'c2' : 'c1';
    const color = /blanc/.test(baja((f['color'] || '') + ' ' + a.nombre)) ? 'blanco' : 'gris';
    return ESP.item('adhesivo-cementicio', { clase: clase, color: color, kg: kg });
  }

  if (fam === 'derretido') {
    const kg = presentacionKg(f, a);
    if (!kg) { MOTIVO.valor = 'la ficha no declara el peso de la funda'; return null; }
    return ESP.item('derretido', { kg: kg });
  }

  if (fam === 'mortero-panete') {
    const kg = presentacionKg(f, a);
    if (!kg) { MOTIVO.valor = 'la ficha no declara el peso de la funda'; return null; }
    return ESP.item('mortero-panete', { kg: kg });
  }

  if (fam === 'estuco' || fam === 'masilla-revestimiento') {
    const kg = presentacionKg(f, a);
    if (!kg) { MOTIVO.valor = 'la ficha no declara el peso de la funda'; return null; }
    if (fam === 'estuco') {
      const color = /blanc/.test(baja((f['color'] || '') + ' ' + a.nombre)) ? 'blanco' : 'gris';
      return ESP.item('estuco', { color: color, kg: kg });
    }
    return ESP.item('masilla-revestimiento', { kg: kg });
  }

  if (fam === 'hormigon-seco') {
    const m = limpia(a.nombre).match(/(\d{3})\s*Kg/i);
    const lb = limpia(a.nombre).match(/(\d{2,3})\s*(?:L\b|Libras)/i);
    if (!m || !lb) { MOTIVO.valor = 'la ficha no declara la resistencia o el peso'; return null; }
    return ESP.item('hormigon-seco', { resistencia: parseInt(m[1], 10), lb: parseInt(lb[1], 10) });
  }

  return undefined;
}

module.exports = { regla, MOTIVO, YA_EXISTE, ficha, deLaReferencia, LIQUIDACION };
