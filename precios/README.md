# precios.ingsliberato.com — base de precios de construcción

Subdominio de **Ingenieros Liberato & Asociados** con una base pública de precios de
referencia de construcción para República Dominicana: materiales, mano de obra,
servicios y alquiler de equipos.

Igual que el sitio principal, es **estático**: HTML, CSS y JavaScript sin dependencias
ni paso de compilación. Esta carpeta es la raíz del subdominio y es autocontenida
(tiene su propio `assets/`, `robots.txt` y `sitemap.xml`), así que se publica sola.

---

## Estructura

```
precios/
  index.html              Portada = el catálogo: filtros, tabla, lista de cotización y,
                          debajo, destacados, las categorías y la descarga en Excel
  proveedores.html        Directorio: solo los comercios con precio confirmado
  quienes-somos.html      La firma (en el menú, en lugar de Metodología)
  metodologia.html        Cómo se arman los precios, conversiones y preguntas frecuentes
                          (fuera del menú; se llega desde el pie y el descargo)
  precio-*.html           28 páginas estáticas, una por categoría   ← GENERADAS
  descargas/              el libro de Excel                        ← GENERADO
  costo-licencias-…html
  assets/
    css/precios.css       Estilos (la paleta de marca, en :root)
    js/
      datos-catalogo.js   Taxonomía e ítems con su precio de referencia
      datos-proveedores.js Directorio de proveedores
      datos-precios.js    Cotizaciones por proveedor            ← se edita a menudo
      datos-demo.js       Datos ficticios de demostración       ← APAGADO (ACTIVO = false)
      app.js              Buscador, filtros y lista de cotización
    img/                  Logotipos (copia de los del sitio principal)
  robots.txt
  sitemap.xml
  vercel.json             Configuración de despliegue del subdominio
```

---

## Ver el sitio localmente

```bash
cd precios
python3 -m http.server 8000
# abrir http://localhost:8000
```

---

## Las páginas de categoría (generadas)

Cada categoría del catálogo tiene su propia página estática, con URL orientada a
búsqueda (`precio-cemento-morteros-aditivos.html`, `precio-varilla-acero.html`,
`precio-tuberia-conexiones-pvc.html`…). Son las páginas pensadas para recibir el tráfico
de Google: traen la tabla de precios ya escrita en el HTML, texto propio de unas 1,300
palabras, preguntas frecuentes con marcado `FAQPage`, migas de pan con `BreadcrumbList`
y los proveedores de esa categoría.

**Estas páginas no se editan a mano: se generan.** Cualquier cambio manual se pierde en
la siguiente corrida.

```bash
node herramientas/generar-categorias.js     # desde la raíz del repositorio
```

El generador:

1. escribe los HTML de categoría en `precios/`;
2. reescribe en `precios/index.html` la rejilla de categorías, los precios destacados y
   las cifras del hero, entre los marcadores `<!-- categorias:inicio -->` y
   `<!-- destacados:inicio -->`, para que esos enlaces y precios existan en el HTML sin
   depender de JavaScript;
3. regenera `precios/sitemap.xml`.

### Cuándo hay que volver a correrlo

- Al cambiar un precio, agregar un ítem o mover una categoría en
  `assets/js/datos-catalogo.js`.
- Al tocar un proveedor en `assets/js/datos-proveedores.js`.
- Al editar el contenido editorial en `herramientas/contenido-categorias.js`.

### Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Precios, ítems y taxonomía | `precios/assets/js/datos-catalogo.js` |
| Slug (URL) de cada categoría | campo `slug` en la lista `categorias` del mismo archivo |
| Familias de especificación compartidas | `herramientas/especificacion-banos.js`, `-segtec.js`, `-baldosas.js`, `-plomeria.js`, `-madera.js` |
| Texto, claves y FAQ de cada página | `herramientas/contenido-categorias.js` |
| Plantilla y maquetación | `herramientas/generar-categorias.js` |

El generador falla si una categoría no tiene contenido editorial, así que al agregar
una categoría nueva hay que agregar también su entrada en
`herramientas/contenido-categorias.js`.

> El sitio publicado sigue siendo estático y sin dependencias. El generador se corre a
> mano cuando cambian los datos, nunca en el despliegue: lo que se sube es HTML plano.

---

## Editar los precios

Todo vive en `assets/js/datos-catalogo.js`. Un ítem se declara así:

```js
it('MAT-04', 'Varilla corrugada 1/2" x 20 pies', 'unidad', 590, 530, 670, {
  esp:    'Grado 60 · ASTM A615 / RTD 458',
  etapa:  'estructura',
  gama:   'estandar',      // economica | estandar | premium
  origen: 'nacional',      // nacional | importado
  itbis:  true,            // el precio ya incluye el 18%
  estado: 'estimado',      // estimado | verificado | tarifario
  medidas: {diametro_pulg: 0.5, largo_pies: 20}   // ejes por los que empareja
});
```

Los tres números son **precio de referencia, mínimo y máximo**. El código
(`MAT-04-002`) se genera solo, correlativo dentro de la categoría.

El mínimo y el máximo alimentan el libro de Excel y el cálculo interno; **no se muestran
en el sitio**, que publica un solo número por ítem. `medidas` es opcional en los ítems
escritos a mano y lo llena solo el importador en los generados.

### Cuando entre una cotización real

Actualizar los tres números y cambiar el ítem a estado verificado:

```js
{ …, estado: 'verificado', fuente: 'Cotización Ferretería X, 12/09/2026', fecha: '2026-09' }
```

La interfaz cambia sola la etiqueta de *Estimado* a *Verificado*: no hay que tocar
nada más. Un ítem sin monto (permisos, licencias) va con `null, null, null` y
`estado: 'tarifario'`.

### Estado actual de los datos

El catálogo publica **1,609 ítems**, todos con precio real: **1,603 con precio de un
comercio** que lo publica y 6 que van según tarifario oficial y no llevan monto. Los ítems
que solo tenían estimación nuestra se retiraron del sitio (ver «Solo se publica lo que tiene
precio real»).

Detrás hay **5,871 cotizaciones** de **nueve comercios**. **242 ítems tienen precio de más
de uno**, 71 tienen tres, 25 tienen cuatro y ocho ya tienen cinco — entre ellos la funda de
cemento gris, que es el precio más consultado del país.

Sustituir las estimaciones que quedan por cotizaciones reales es el trabajo pendiente más
importante, y es la condición de lanzamiento (ver más abajo). Para eso están las dos
herramientas de recolección por tandas y el importador de catálogos de proveedor.

### Frecuencia de actualización sugerida

| Rubro | Cada cuánto |
|---|---|
| Varilla, cemento, cables de cobre, madera | 15–30 días |
| Terminaciones, equipos, herramientas | Trimestral |

---

## El ítem es la especificación, no la marca

Es la regla que ordena todo el catálogo, y la que más código costó.

Un ítem es **una especificación de compra**: inodoro de una pieza, alargado, descarga de
4.8 L. La marca, el modelo y el acabado no lo definen —son atributos de la cotización— y
por eso viven en la nota del precio, no en el nombre del ítem. Igual que una hoja de papel
8½ x 11 es un solo renglón de un presupuesto por más marcas que se vendan de ella.

La primera importación no lo hacía así: cada modelo de cada marca entraba como ítem propio
y el catálogo llegó a 1,851 filas donde el mismo aparato aparecía veinte veces. Un catálogo
así **no se puede comparar**, que es justo lo único que este sitio existe para hacer: con
un ítem por marca nunca hay dos comercios en la misma fila.

Corregido, el catálogo pasó de **1,851 a 812 ítems** y los ítems con precio de más de un
comercio subieron de 26 a **51**. No se perdió ni un precio: las cotizaciones siguen todas
ahí, solo que apiladas sobre la fila que les toca. (Con la extracción de baldosas que entró
después, el catálogo va por 1,018 ítems y 2,641 cotizaciones.)

### Las tablas de especificación

Cada rubro tiene una tabla de familias canónicas que **comparten todos los comercios**. Son
lo que hace que el inodoro de Ochoa y el de InnovaCentro caigan en la misma fila:

| Archivo | Familias |
|---|---|
| `herramientas/especificacion-banos.js` | 28 familias de baño: inodoros por tipo de tanque y descarga, urinarios, lavamanos por montaje, muebles, cabinas, barras de seguridad, duchas, equipamiento de baño público |
| `herramientas/especificacion-segtec.js` | 43 familias de corrientes débiles: cámaras, grabadores, alarma, incendio, cableado, racks, domótica, intercomunicación |
| `herramientas/especificacion-baldosas.js` | 22 familias de piso y revestimiento: baldosa de campo, mosaico, peldaños, perfiles de canto, crucetas y niveladores, adoquines, tejas, adhesivos y morteros, herramienta del instalador |
| `herramientas/especificacion-plomeria.js` | 33 familias de plomería: tubo, conexiones, llaves de paso, desagüe, mangueras, sellado, gas, bombeo, calentadores, tanques y grifería |
| `herramientas/especificacion-madera.js` | 2 familias: pieza de madera aserrada y panel |
| `herramientas/especificacion-electricos.js` | 26 familias eléctricas: bombillos, paneles, salidas, breakers, canalización, extensiones y control |

Cada familia declara su categoría, su unidad, los ejes de medida que la distinguen y cómo
se arma el nombre. Las reglas de cada comercio no inventan nombres: leen el artículo,
deciden a qué familia pertenece, sacan sus medidas y le piden el ítem a la tabla. Dos
comercios distintos con la misma lectura obtienen literalmente la misma clave.

### `medidas` — varias columnas de medida por ítem

El problema práctico: un comercio publica el litraje de descarga del inodoro y el otro
publica las dimensiones de la taza. Si el ítem tuviera una sola medida, no habría por
dónde emparejarlos.

Por eso cada ítem lleva un diccionario `medidas` con **una columna por eje**, y cada
artículo que cae en él aporta las que trae, **siempre que no se contradigan**: si un
artículo declara acabado mate y otro brillante, la medida se cae en vez de publicar como
especificación del ítem lo que dijo una sola de sus fuentes.

```js
it('MAT-24', 'Inodoro de una pieza, alargado, descarga 4.8 L', 'unidad', …, {
  medidas: {descarga_l: 4.8, forma: 'alargado', largo_cm: 70}
});
```

Un comercio que solo publica el litraje empareja por `descarga_l`; el que solo publica el
largo, por `largo_cm`. Las medidas se acumulan: el ítem termina sabiendo más que cualquiera
de sus fuentes por separado. Hoy 393 ítems llevan medidas estructuradas, con `formato`,
`material`, `uso`, `piezas_m2`, `forma`, `ancho_mm`, `resolucion_mp`, `peso_lb`,
`descarga_l`, `lente_mm` y `puertos` entre las más usadas.

Los largos se redondean a los 5 cm más cercanos antes de formar la clave, para que una
barra de «90 cm» y una de «36 pulgadas» sean la misma barra y no dos.

**No todo empareja, y no pasa nada.** Cuando el nivel de detalle de dos comercios no se
toca, cada uno aporta su fila y el catálogo suma cobertura en vez de comparación. Eso es lo
que pasa hoy en sanitarios, donde los dos comercios cargan marcas casi disjuntas —Ochoa
trae Helvex, Cato, Ultra y AML; InnovaCentro, AquaSpa, Baikal, Coco, Corona y Teka— y lo
único que se cruza limpio son las barras de seguridad, que se emparejan por largo.

### Una fila aunque el rango sea ancho

Si dentro de una especificación los precios van de RD$ 4,000 a RD$ 40,000, la fila se
queda igual: el ancho del rango **es** el dato útil. Lo que hace el sitio es no publicarlo
como si fuera un precio.

### Mediana, mínimo y máximo: en el libro, no en el sitio

El sitio muestra **un solo número por ítem**, el precio de referencia. El rango
`RD$ mínimo – RD$ máximo` que antes salía en las tablas se quitó de las páginas de
categoría, del catálogo y de la ficha: en una tabla de 40 filas, un rango ancho se lee como
un error del sitio y no como lo que es.

Quien necesita el detalle lo tiene completo en la hoja **Comparativo** del libro de Excel,
con una columna por proveedor y sus columnas de mínimo, mediana, máximo y dispersión, que
es donde un analista de compras puede auditarlo celda por celda. La ficha del ítem en el
sitio sigue mostrando todas las cotizaciones con su proveedor, su marca y su fecha.

Al quitarlo hubo que corregir el texto que lo prometía: la leyenda del catálogo, la
bajada de la portada y dos párrafos de la metodología decían «su rango mínimo–máximo».
Y de paso cayó una frase que ya era falsa: el aviso de todas las páginas seguía diciendo
que **ninguno** de los precios venía de una cotización, cuando 522 ítems llevan el precio
que el propio comercio publica. El aviso nuevo no lleva cifras, para que no vuelva a
quedarse viejo solo.

---

### Qué va en `esp`, y qué no

`esp` sale en la tabla debajo del nombre, en gris, y en el teléfono cada palabra de más es
un renglón. Solo lleva **lo que el nombre no dice** y hace falta para no equivocarse de
producto: una norma o grado (`Grado 60 · ASTM A615`, `SDR-41`, `600 V`), el material si no
está en el nombre (`Gres porcelánico`), una presentación que el nombre no trae (`Rollo de
2.40 x 40 m`) o una advertencia de compra corta. Nunca una paráfrasis del nombre o de la
familia («Pletina de acero al carbono» bajo «Pletina 1" x 1/8"»), ni una medida que ya está
en el nombre, ni una explicación de cómo se construyó el ítem. Si no queda nada, vacío.

Para los ítems importados, `esp` se define por familia en las tablas de especificación y
en las reglas incrustadas del importador; el 10/09/2026 se revisaron todas con esa regla.

**La tabla ya no tiene ficha desplegable.** Bajo el nombre de cada ítem va un tag por
comercio que lo vende (los que venden al público y en la misma unidad); al pulsarlo, el
precio y la fecha de la fila pasan a ser los de ese comercio, y al volver a pulsarlo regresa
la referencia. La elección vive en el objeto del ítem (`provElegido`), así sobrevive a que
la tabla se vuelva a pintar. `PRECIOS.detalleHTML` queda en la capa de datos sin uso.

**Desde ese mismo día la tabla del sitio no muestra `esp` ni el código**: la fila lleva solo
el nombre, la categoría (o la etapa, en las páginas de categoría), la unidad, el precio y la
última actualización. El código y la especificación siguen en los datos, en la fila que se
copia al portapapeles, en el mensaje de WhatsApp y en el Excel, que es donde un proveedor o
una hoja de cálculo los necesitan.

Lo mismo con el **alcance**: «Material retirado en almacén» es el de casi todo el catálogo,
así que está declarado una vez (`meta.alcanceBase`) y la tabla solo etiqueta el ítem que se
aparta de él. El Excel lo muestra siempre.

## Dos campos que hacen comparables los precios

### `alcance` — qué cubre el precio

Sin esto, dos precios del mismo ítem pueden no ser comparables. Un hormigón de 210 puesto
en obra y otro «con bombeo y colocación incluidos» son el mismo producto y precios muy
distintos; una arena «en mina» y la misma arena puesta en obra, igual.

```js
it('MAT-03', 'Hormigón premezclado 210 kg/cm²', 'm³', 6800, 6200, 7600, {
  alcance: 'Hormigón puesto en obra; no incluye bombeo ni colocación'
});
```

Se muestra bajo el nombre del ítem, aparece en la ficha por proveedor y tiene su propia
columna al copiar a Excel. Cuando dos cotizaciones tengan alcances distintos, se verá.

### `alias` — cómo lo llama el mercado

El catálogo dice «funda 42.5 kg»; la obra dice «94 libras». El buscador también busca en
este campo, así que ambos nombres llegan al mismo ítem.

```js
it('MAT-02', 'Cemento gris portland, funda 42.5 kg', 'funda', 455, 425, 500, {
  alias: '94 libras, 94 lbs, saco de cemento, funda de cemento'
});
```

Es barato de mantener y evita el peor resultado posible de un buscador: que alguien
escriba el nombre correcto de la calle y no encuentre nada.

---

## Requisito de lanzamiento

**El sitio se publica cuando cada ítem tenga al menos un precio real.** Se cumple desde el
09/09/2026 por la vía corta: en vez de esperar a levantar los 263 precios que faltaban, esos
ítems se retiraron del sitio (ver «Qué se retiró del sitio y cómo vuelve», más abajo). Hoy
todo lo publicado lleva el precio de un comercio, o no lleva monto por ser de tarifario.

Conviene tenerlo presente al agregar ítems a mano: cada ítem nuevo es un precio más que
levantar. La excepción son los que entran por `importar-catalogos.js`, que llegan con su
cotización real puesta: esos suman al catálogo sin alejar el lanzamiento.

### Cómo va la cobertura

Cualquiera de las dos herramientas de abajo la imprime al final. La más corta:

```bash
node herramientas/generar-lote-precios.js 0
```

Al 10/09/2026: **1,603 de 1,603 ítems publicados con precio real**. Los otros 6 del
catálogo van según tarifario oficial y no llevan precio por definición, así que no cuentan.
Los 263 retirados no aparecen en esta cuenta: la herramienta de lotes solo recorre lo
publicado, así que para seguir levantando precios hay que partir del Excel de retirados.

### Levantar precios por tandas

La recolección se trabaja en lotes, con dos herramientas que son las dos mitades del
mismo ciclo.

**1. Armar el encargo.**

```bash
node herramientas/generar-lote-precios.js            # los próximos 30 pendientes
node herramientas/generar-lote-precios.js 40         # los próximos 40
node herramientas/generar-lote-precios.js 20 --categoria MAT-04
node herramientas/generar-lote-precios.js 30 --desde 60
```

Escribe `herramientas/lotes/lote-NN.md`: un encargo en Markdown con las reglas de
recolección, el formato de respuesta y la ficha de cada ítem (especificación, unidad,
alias de mercado, qué cubre el precio), más los comercios del directorio que publican
esa categoría en línea. Se pega tal cual en un asistente con navegación, o se reparte
entre quien vaya a llamar a los proveedores.

Dos cosas que hace solo:

- **No repite trabajo.** Excluye los ítems que ya tienen precio real, así que después de
  cargar un lote basta volver a correrlo y el siguiente arranca donde terminó el anterior.
- **Ordena por dificultad.** Primero las categorías que más comercios publican en línea;
  de últimos los agregados, la mano de obra y el alquiler de equipos, que hay que
  preguntar por teléfono.

**2. Cargar la respuesta.** Se guarda la respuesta cruda en un archivo de texto y:

```bash
node herramientas/importar-lote.js respuesta.txt
```

Devuelve por salida estándar las llamadas a `c()` listas para pegar en
`datos-precios.js`, y por error estándar el informe de lo que revisó. **No escribe en
`datos-precios.js` por su cuenta, a propósito:** cada cotización que entra al sitio pasa
antes por la vista de una persona.

| Qué hace | Con qué |
|---|---|
| Rechaza | Código de ítem inexistente · proveedor que no está en el directorio (con sugerencia del más parecido, porque casi siempre es un tilde de menos) · precio que no es número positivo · fecha mal formada · líneas `NO ENCONTRADO` |
| Avisa, pero deja pasar | Precio a más de 3× o menos de 0.35× de la estimación —casi siempre es otra presentación, no un cambio de precio— · proveedor que el directorio no tiene registrado en esa categoría |
| Escribe solo | La nota con el nombre del producto en la tienda · `itbis: false` cuando la ficha declara que no lo incluye · la referencia a `SUPUESTO_ITBIS` cuando la ficha no dice nada |

Después de pegar las cotizaciones hay que **volver a generar las páginas**
(`node herramientas/generar-categorias.js`), porque los precios de las páginas de
categoría se escriben en el HTML.

## Registrar una cotización de proveedor

Esta es la parte que convierte el sitio en una base de precios de verdad. Las
cotizaciones viven en `assets/js/datos-precios.js`, separadas del catálogo: el precio
nunca se guarda en la ficha del ítem, sino aquí, con su proveedor, su fecha y su fuente.

```js
c('MAT-02-001', 'Ferretería Ochoa (8A)', 455, {
  fecha:  '2026-09-05',
  fuente: 'Precio publicado en ochoa.com.do',
  itbis:  true,        // ¿el monto incluye el 18%?
  unidad: 'funda',     // solo si difiere de la del ítem
  nota:   ''           // condiciones, volumen, validez
});
```

El nombre del proveedor debe coincidir **exactamente** con el de
`datos-proveedores.js`. Si no coincide, o si el código del ítem no existe, el generador
falla y dice cuál es el problema. Es a propósito: un error de tipeo no debe llegar
callado a producción.

### Qué pasa al registrar precios

En cuanto un ítem tiene al menos una cotización de un proveedor que **vende al público**,
el sitio deja de mostrar la estimación de arranque y calcula:

| Campo | Cómo se calcula |
|---|---|
| Precio de referencia | Mediana de las cotizaciones válidas |
| Mínimo y máximo | Extremos observados |
| Última actualización | Tramo de días desde la fecha más reciente (≤7, 8–14, 15–30, más de 30), calculado en el navegador al abrir la página |
| Fecha | La más reciente de las cotizaciones |

Antes de comparar, todas las cotizaciones se **normalizan al criterio de ITBIS del
ítem**, así que da igual si un proveedor cotiza con el impuesto incluido y otro sin él.

Los fabricantes de canal cerrado (`publico: false` — cementeras, siderúrgica, fábricas de
pintura) aparecen en la ficha como indicador de tendencia pero **no entran en el
cálculo**, siguiendo la regla del documento de proveedores. Una cotización en una unidad
distinta a la del ítem tampoco promedia: se muestra marcada y fuera del cálculo.

No hay nada más que tocar. La ficha del ítem, la etiqueta de estado, la tabla de
categoría y el sitemap se actualizan solos al correr el generador.

### Estado actual

**5,871 cotizaciones reales cargadas · 1,603 ítems verificados, todos los publicados.**

Dos tandas, todas de precios que los propios comercios publican:

- **08/09/2026** — 9 cotizaciones de Ferremix, Ochoa e InnovaCentro, levantadas a mano.
- **09/09/2026** — once extracciones completas: el catálogo de Ochoa en materiales de
  construcción (398 artículos, 349 con precio), baños (945 / 713), seguridad y tecnología
  (809 / 604) y baldosas (1,334 / 1,226); los departamentos de materiales (118 / 118)
  y de baño (520 / 520) de InnovaCentro; y las colecciones de plomería y baños (862 / 862)
  y materiales (53 / 53) de Ferretería Cima; y las colecciones de maderas (45 / 45), metales
  (27 / 27) y eléctricos (468 / 468) de Max Ferretería. De sus 3,707 artículos aprovechados
  salieron **1,295 ítems nuevos que nacieron verificados** y **201 cotizaciones sobre ítems
  que ya existían**.

Los 263 ítems restantes siguen siendo estimaciones nuestras.

Trece categorías nuevas salieron enteras de esas extracciones y llegaron verificadas
desde el primer día:

| | Categoría | Ítems |
|---|---|---|
| `MAT-19` | Perfiles y tubos de acero | 46 |
| `MAT-20` | Angulares, planchuelas y barras | 64 |
| `MAT-21` | Tolas y láminas de acero | 29 |
| `MAT-22` | Cerramiento perimetral | 43 |
| `MAT-23` | Perfilería de aluminio | 26 |
| `MAT-24` | Inodoros y urinarios | 11 |
| `MAT-25` | Lavamanos y pedestales | 8 |
| `MAT-26` | Muebles y espejos de baño | 8 |
| `MAT-27` | Accesorios de baño | 29 |
| `MAT-28` | Alarmas y control de accesos | 24 |
| `MAT-29` | Detección de incendios | 6 |
| `MAT-30` | Cableado estructurado y redes | 30 |
| `MAT-31` | Domótica e intercomunicadores | 18 |

Las cifras de baños y de seguridad son bajas a propósito: 442 artículos de baño de Ochoa
y 289 de InnovaCentro caben en 63 ítems, y 536 de seguridad en 113, porque **el ítem es la
especificación y no la marca** (ver más abajo). Un inodoro de una pieza alargado de 4.8 L
es una fila, con las siete marcas que lo venden dentro.

`MAT-16` dejó de ser «Sistemas especiales» y pasó a ser «Cámaras y videovigilancia»: sus
cuatro ítems que no eran CCTV se movieron a las categorías nuevas que les corresponden.

El resto se repartió en categorías que ya existían: duchas y grifería en `MAT-09`,
separadores y couplers de varilla en `MAT-04`, zinc de techo en `MAT-07`, polvo de color
para mosaico en `MAT-08`, agregados ensacados en `MAT-01` y presentaciones menudas de
cemento y yeso en `MAT-02`.

## Importar el catálogo de un proveedor

```bash
node herramientas/importar-catalogos.js              # revisar, sin escribir
node herramientas/importar-catalogos.js --listar     # ver los ítems que saldrían
node herramientas/importar-catalogos.js --descartes  # ver qué se quedó fuera y por qué
node herramientas/importar-catalogos.js --claves     # ver las claves de los generados
node herramientas/importar-catalogos.js --escribir   # aplicar
node herramientas/generar-categorias.js          # rehacer las páginas
```

La fuente es `herramientas/datos-externos/ochoa-AAAA-MM-DD.json`, la extracción del
catálogo tal como la publica el comercio. **Queda versionada en el repositorio** para que
cualquiera pueda repetir la importación y ver de dónde salió cada número.

Lee las dos extracciones de `herramientas/datos-externos/` en una sola corrida y escribe
entre marcadores: `ochoa:items` en `datos-catalogo.js` y
`ochoa:cotizaciones` en `datos-precios.js`. Todo lo que hay entre ellos se reescribe
entero en cada corrida, así que no se edita a mano. Correrla dos veces seguidas deja los
archivos idénticos.

### Cómo decide qué entra

**1. `MAPEO`** — artículos que corresponden a un ítem que ya existe. Se declaran a mano,
uno por uno. No hay emparejamiento automático por parecido de texto: lo probamos y casó
«Funda De Arena 55 Libras» con «Viaje de arena, 16 m³».

**2. `REGLAS`** — familias completas donde la ficha del comercio declara la medida
exacta. De cada artículo sale un ítem nuevo del catálogo, ya verificado.

Cada rubro trae su propio criterio, y por eso hay un juego de reglas por comercio. En
materiales de construcción el artículo se identifica por su medida, y la regla la busca
en la ficha. En baños y en seguridad se identifica por marca y modelo, y hay que decidir
dos cosas: **si el artículo le sirve o no a un constructor**, y **a qué especificación del
catálogo corresponde** una vez que se le quita la marca.

Cada archivo responde una pregunta distinta:

| Archivo | Qué decide |
|---|---|
| dentro de `importar-catalogos.js` | Ochoa · materiales: cuál es la medida exacta del artículo |
| `reglas-banos.js` | Ochoa · baños: si es equipamiento de obra o repuesto de consumidor, y a qué especificación corresponde |
| `reglas-segtec.js` | Ochoa · seguridad: si es sistema del edificio o accesorio de computadora, y a qué especificación corresponde |
| `reglas-innovacentro.js` | InnovaCentro: a qué ítem del catálogo corresponde cada artículo, en materiales y en baño |
| `reglas-baldosas.js` | Ochoa · baldosas: qué es cada artículo una vez que se le quita la marca y el color, y cómo se pasa su precio a metro cuadrado |
| `reglas-cima.js` | Cima: mapeo a mano en materiales, reglas en plomería, y qué es repuesto de consumidor |
| `reglas-max.js` | Max Ferretería: mapeo a mano en cemento y adhesivos, reglas en tubo, madera, paneles y tinacos |
| `reglas-max-electricos.js` | Max Ferretería · eléctricos: la colección más grande y la de nombres más abreviados |
| `reglas-mc.js` | Ferretería MC: dos cotizaciones formales, con el ITBIS declarado |
| `especificacion-banos.js` | La tabla de familias de baño, **compartida por los dos comercios** |
| `especificacion-segtec.js` | Lo mismo para corrientes débiles |
| `especificacion-baldosas.js` | Lo mismo para pisos, revestimientos y sus morteros |

Todos comparten `texto-ochoa.js`, que expande las abreviaturas del comercio y separa
las medidas pegadas para que el nombre quede legible sin inventarle nada.

La división importa: las **reglas** son de cada comercio, porque cada uno escribe distinto;
las **especificaciones** son del catálogo, y por eso las comparten. Un comercio nuevo trae
un archivo de reglas nuevo y no toca las tablas.

### La regla de los baños: equipamiento sí, repuesto no

Entra lo que un constructor presupuesta e instala como parte de la obra, y queda fuera el
repuesto que compra el dueño de casa para cambiar una pieza rota.

Un inodoro entra. Una tapa de inodoro no. Tampoco una manecilla, una pera, un flotador ni
un juego de tornillos de tanque. No es que sean malos productos: es que nadie los pone en
un presupuesto de obra, y cada fila que no se usa le quita claridad a las que sí. De los
713 artículos con precio de la extracción de baños de Ochoa, 271 se quedaron fuera por esa
regla, y 231 de los 520 de InnovaCentro.

La única excepción es el kit de instalación de inodoro, que sí es de obra: es lo que el
plomero compra por cada aparato que monta.

Ojo con las categorías del comercio, que no son de fiar para decir **qué** es un artículo:
hay espejos dentro de «muebles de baños», botiquines LED dentro de «espejos» y barras de
seguridad dentro de «secador de manos». Por eso la familia se decide por el nombre del
producto, que sí es consistente.

Donde sí sirven es para decir **cómo se instala**, una vez que el nombre ya resolvió la
familia. «Lavamanos Bali Blanco» no dice si va sobre pedestal, sobreponer, empotrar o a la
pared, pero la subcategoría del comercio sí, y es lo que permitió partir los 61 lavamanos
de InnovaCentro en las mismas cuatro especificaciones que ya tenía Ochoa.

**Los accesorios entran solo como juego.** Un constructor presupuesta «juego de
accesorios de baño» por cada baño del proyecto, no un toallero Milano y un portapapel
Lugano por separado: eso es una decisión de decoración que además llena la página de
variantes de la misma cosa en distintos acabados. Se quedan las barras de seguridad,
porque en baños accesibles y en obra hotelera y de salud son una partida obligatoria con
su propio anclaje, y el equipamiento de baño público —secador de manos y dispensadores
automáticos—, que se compra por cantidad de baños igual que un inodoro.

### El segundo comercio, y por qué cambia todo

Hasta InnovaCentro todo el catálogo venía de Ochoa, y con un solo precio por ítem el sitio
muestra un número, no un mercado. De los 118 artículos de su departamento de materiales
entran los 118, pero lo valioso no son los ítems nuevos: son los **47 artículos que caen
sobre ítems que ya existían**. Ahí la mediana deja de ser un dato suelto, el comparativo
del libro tiene dos columnas que comparar y el comprador ve con quién le conviene.

Hoy hay **242 ítems con precio de más de un comercio**, 71 con tres y 25 con cuatro. El
más consultado de todos ya tiene mercado: la funda de cemento gris de 42.5 kg va de
RD$ 535 a RD$ 655 entre Ferremix, Max, Cima e InnovaCentro.

Su departamento de baño (520 artículos, 289 aprovechados) aporta menos comparación de la
esperada y más cobertura: los dos comercios cargan marcas casi disjuntas, así que lo que
entra son sobre todo especificaciones nuevas. Lo que sí se cruza limpio son las barras de
seguridad, que se emparejan por largo, y ahí el rango aparece de una.

Por eso `reglas-innovacentro.js` es sobre todo un **mapeo declarado a mano**, artículo por
artículo, con su justificación cuando la equivalencia no salta a la vista: que la funda de
94 libras son los mismos 42.5 kg, que el zinc acanalado se nombra por su ancho nominal de
3 pies aunque el útil sea 2.7, que «palometa» es como InnovaCentro llama al brazo del
poste, o que la copa pasante lleva dos medidas y cada comercio las escribe en el orden que
quiere.

### El tercer comercio y la categoría que hubo que partir

Ferretería Cima entra con dos colecciones: **plomería y baños** (862 artículos) y
**materiales** (53). Es el primero que carga fuerte en plomería, y con él la partida más
larga de una obra deja de ser una estimación nuestra.

Las dos colecciones se trabajan al revés una de la otra, y eso dice algo del método:

- **Materiales es corta y casi todo cae sobre ítems que ya existen**, así que va por mapeo
  declarado a mano, artículo por artículo. Ahí está el valor: es el tercer precio del
  cemento gris, del mortero de pañete y del alambre de púas. De sus 53 artículos entran 22,
  y los 31 restantes se quedan fuera con el motivo dicho por familia — los clavos, por
  ejemplo, porque a RD$ 97 el nombre no dice si es la libra o la caja.
- **Plomería es larga y casi todo es territorio nuevo**, así que va por reglas contra una
  tabla de especificación nueva, `especificacion-plomeria.js`. Entran 637 de 862.

#### En una conexión, el material es identidad

Una conexión queda definida por tres cosas: qué pieza es (codo, tee, niple, reducción,
tapón…), de qué material y de qué medida. El material no es un detalle de acabado: el mismo
codo de 1/2" cuesta RD$ 15 en PVC y RD$ 170 en bronce. Meterlos en la misma fila daría un
rango de once veces que no dice nada, así que son dos ítems.

En la rejilla de piso la decisión es la contraria, y por la misma razón bien aplicada: entre
aluminio e inoxidable el precio casi no se mueve —RD$ 401 contra RD$ 368— y la mitad de las
fichas ni lo declara. Ahí el material va como medida, no como clave. La regla no es «el
material siempre parte el ítem»: es que **un eje entra en la clave cuando mueve el precio y
el comercio lo declara**.

#### MAT-32, la categoría nueva

Con Cima dentro, `MAT-09` pasaba de 22 a 437 ítems, y 375 de ellos eran tubo y conexiones.
Una página así entierra el inodoro que alguien vino a buscar bajo trescientos codos. Se
partió en dos:

| | Categoría | Qué lleva |
|---|---|---|
| `MAT-09` | Plomería, sanitarios y gas | Aparatos, grifería, duchas, calentadores, bombeo, tanques y gas |
| `MAT-32` | Tubería y conexiones | Tubo, conexiones, llaves de paso, desagüe, mangueras y sellado |

Los siete ítems de red que estaban en `MAT-09` desde el principio —los tubos, el codo y la
llave de paso— se mudaron con ellos, y las cotizaciones escritas a mano que los
referenciaban se renumeraron a mano también. Es el mismo riesgo que el importador ya vigila
para los ítems generados: mover un ítem corre los códigos de los que venían detrás.

#### El PVC sanitario es de 19 pies, ya no hay duda

Era una de las dos cosas pendientes de verificar. Ochoa lo factura por pies con un mínimo
de 19; Cima publica toda su línea SDR-41 y SDR-26 como «x 19». **Dos comercios
independientes, cuatro diámetros**, y ninguno vende el tramo de 20 pies que decía nuestra
ficha. La especificación de `MAT-32-001` a `003` se corrigió a 19 pies, y las dos
cotizaciones de Ochoa que estaban marcadas «en otra unidad» —visibles pero fuera del
cálculo— ya cuentan.

#### Lo que Cima deja fuera

La misma regla de siempre: entra lo que un constructor presupuesta e instala, no el repuesto
que el dueño de casa compra para cambiar una pieza rota. Eso saca 94 artículos entre
repuestos de inodoro (peras, balancines, juntas de cera, válvulas de descarga) y de
grifería, 16 accesorios sueltos de decoración —el toallero y el organizador de ducha, no el
juego completo de cinco piezas, que sí entra— y 7 destupidores.

El resto de los descartes son fichas incompletas, cada una con su motivo: 41 conexiones que
no declaran el material, 7 tubos de cobre que no declaran el largo del rollo, 5 calentadores
que no dicen si son de gas o eléctricos y 3 inodoros cuyo nombre no dice si son de una o de
dos piezas, que son dos partidas con precios muy distintos.

### Max Ferretería: 45 artículos, y por qué valen tanto como 800

El cuarto comercio es el más pequeño de todos —45 artículos de una sola colección— y es el
que más movió la aguja donde importa. De los 45 entran 41, y **17 caen sobre ítems que ya
existían**. Ahí está la diferencia entre un catálogo grande y uno comparable.

Con él, cinco ítems pasan a tener **cuatro precios de cuatro comercios distintos**, entre
ellos la funda de cemento gris de 42.5 kg, que es el precio que todo el mundo pregunta
primero.

La colección se llama MADERAS y es mixta: la propia extracción advierte que solo 9 de los
45 son madera o paneles, y que la subcategoría de la tienda es inconsistente en el origen
—el PEGAFORTE GRIS aparece archivado en TUBERIAS—. Por eso la regla se apoya en la familia
normalizada que trae la extracción y, sobre ella, en el nombre.

#### Bruta o cepillada es especificación

En la madera hubo que agregar un eje que el catálogo no tenía: **si la pieza va bruta o
cepillada**. Son dos productos con dos precios, y en este mismo comercio el 2x4x12 bruto
sale a RD$ 860 y el cepillado a RD$ 635 — al revés de lo que uno esperaría, que es
exactamente por qué hay que leerlo de la ficha en vez de suponerlo.

Nuestro «Cuartón de pino 2x4x12» no lo declaraba. Se resolvió como se resuelven estos
casos: en la obra el cuartón que se pide sin apellido es el bruto, así queda dicho en el
mapeo, y el ítem pasó de estimado a verificado.

#### El SCH-40 también es de 19 pies

Quedó abierto en la importación anterior: Cima publicaba toda su línea a 19 pies, SCH-40
incluido, pero era el único que lo decía. Max publica sus trece tubos igual. **Dos
comercios**, y la ficha de `MAT-32-004` se corrigió.

Es la segunda vez que pasa lo mismo con el mismo producto, y confirma la regla: no se
cambia una especificación con la evidencia de un comercio, pero tampoco se archiva la
discrepancia — se deja anotada y se espera al segundo.

#### Dónde se paró la deducción

Tres adhesivos de este comercio no declaran su clase C1 o C2. Dos entraron igual, porque su
precio los ubica sin ambigüedad en la banda del adhesivo normal y su nombre no reclama otra
cosa. El tercero, «PEGA FORTE SUPER PRO», se quedó fuera: **su propio nombre reclama una
gama superior**, que es justo la señal de que puede no ser el adhesivo normal. Deducir del
precio sirve para confirmar lo que el nombre ya sugiere; no para contradecirlo.

Los otros tres descartes son fichas incompletas que la propia extracción ya marcaba: dos
adhesivos sin presentación y un tubo de PPR sin largo.

### Un precio sin unidad no es un precio

La colección de metales de Max Ferretería es el caso más limpio de la regla, y llegó con el
diagnóstico hecho: **la tienda deja vacío el campo de unidad de venta en toda la ficha.** En
clavos, alambre de amarre y electrodos —17 de 27 artículos— no se sabe si los RD$ 60 son por
libra, por unidad o por paquete.

Se quedan los 17 fuera. Asumir «por libra» no habría dejado un dato dudoso: habría
contaminado la comparación contra Ochoa y Cima, que sí declaran la unidad, y el error sería
invisible porque el número se ve perfectamente normal. Es una pregunta corta al vendedor y
desbloquea media colección.

Otros dos descartes de la misma familia: el angular de aluminio a RD$ 95 no dice si son 12 o
20 pies, y sin eso el precio no dice nada.

De 27 artículos entran 8. Y esos 8 valen la extracción entera.

#### Lo que apareció al juntarlos: el alambre de púas

`MAT-22-014` —alambre de púas calibre 16, rollo de 250 metros— es hoy el ítem con más
cotizaciones del catálogo: **diez precios de cuatro comercios**, y van de RD$ 1,885 a
RD$ 3,785. **El doble, por la misma especificación.**

Lo interesante no es el rango sino lo que se ve al ordenarlo por marca:

| Marca | Comercio | Precio |
|---|---|---|
| Jabalí | InnovaCentro | RD$ 1,885 |
| Cebú | Ochoa | RD$ 2,108 |
| Aiwa | Ochoa | RD$ 2,336 |
| Corvi | Max | RD$ 2,390 |
| — | Cima | RD$ 2,663 |
| Premium | InnovaCentro | RD$ 2,730 |
| — | Cima | RD$ 2,905 |
| — | Ochoa | RD$ 3,440 |
| **Motto** | **InnovaCentro** | **RD$ 3,770** |
| **Motto** | **Max** | **RD$ 3,785** |

Motto es el más caro en los dos comercios que lo venden, y con **0.4% de diferencia entre
ellos**. Eso descarta que sea el margen de una tienda: es el precio de la marca. La pregunta
que queda es de producto —si el calibre real o el número de púas por metro difiere— y esa
hay que hacerla al suplidor, pero el catálogo ya la dejó planteada con evidencia de dos
comercios independientes.

Es exactamente para lo que existe este sitio.

#### El área del zinc es nominal

Una plancha de 3 x 6 pies no cubre 18 pie²: el traslape se come entre un 15% y un 20%.
Quedó dicho en las claves de la página de techos, porque cubicar por el área nominal deja la
obra corta y es un error que se comete solo.

### Los eléctricos: cuando el eje se mide en vez de suponerse

468 artículos, la colección más grande que ha entrado de un solo comercio y la de nombres
más abreviados del catálogo: «INT SIMPLE BOTON A. C/LP BLANCO 36984». Entran 303 en 150
ítems nuevos, más 37 cotizaciones sobre ítems que ya existían.

#### Qué parte un bombillo: se midió, no se supuso

Había que elegir los ejes de la clave y las dos candidatas eran obvias: la potencia y la
temperatura de color. En vez de decidirlo por intuición se probaron las tres combinaciones
sobre los 69 bombillos del catálogo:

| Ejes | Ítems | Con rango > 3x |
|---|---|---|
| potencia sola | 26 | 7 |
| potencia + temperatura de color | 45 | 4 |
| **potencia + formato** | **47** | **0** |

El **formato** —A60, ST19, G9, MR16— separa productos que cuestan muy distinto. La
temperatura de color, que uno esperaría que pesara, no mueve el precio: el mismo bombillo
sale en 30K y en 65K al mismo número. Así que el formato entra en la clave y la temperatura
se registra como medida.

Es la misma prueba que se hizo con las baldosas y con las rejillas de piso, y ya es la regla
de la casa: **un eje entra en la clave cuando mueve el precio y el comercio lo declara**, y
eso se comprueba contando, no opinando.

#### Ejes opcionales: cuando no declararlo es también una especificación

32 de los 69 bombillos no dicen su formato. No se pueden juntar con los que sí lo dicen —eso
sería afirmar que son el mismo producto— así que «Bombillo LED de 15 W» y «Bombillo LED A60
de 15 W» son dos ítems. El segundo dice más. Es la primera familia del catálogo con un eje
**opcional**: entra en la clave cuando existe, y su ausencia no descarta el artículo.

#### Lo que sí se pudo leer sin adivinar

19 bombillos no declaran su tecnología, pero la potencia la delata: un bombillo decorativo
de 25 W o más en formato G16, R20, torpedo o G40 **no existe en LED**. Es incandescente, y
eso se puede leer de la ficha en vez de suponerlo. Los 4 que quedaron fuera son los que no
tienen ni potencia ni formato que los ubique.

#### La extensión eléctrica, y el calibre que nadie publica

El hallazgo llegó con el archivo y el catálogo lo confirma con más evidencia. Puesto en una
sola fila, `MAT-10-158` —extensión eléctrica de 50 pies— tiene cuatro precios:

| | Precio |
|---|---|
| Genérica naranja | RD$ 725 |
| Voltech (16 AWG) | RD$ 965 |
| Centurion, **AWG 14** | RD$ 1,695 |
| Stanley amarilla | RD$ 2,990 |

**4.1 veces por el mismo largo.** Y ahí se ve por qué el calibre importa: la Centurion sí lo
declara —14 AWG, más grueso que los 16 del Voltech— y eso explica una parte del salto. Lo
que no explica es la Stanley, que está un 76% por encima de la de calibre 14 declarado y no
publica el suyo.

La ficha del ítem lo dice y la página de eléctricos lo dice en sus claves: **preguntar el
AWG antes de comparar extensiones**. Sin ese dato, el ahorro que parece obvio puede ser un
cable más fino.

#### El hueco de las unidades, por tercera vez

Es el tercer archivo de esta ferretería con el mismo problema, y ya no es un descuido
puntual: la tienda deja vacío el campo de unidad de venta en toda su ficha. En cables y
alambres eso es definitivo —RD$ 16 por un THHN No. 12 solo tiene sentido por pie, pero no lo
dice— y los 27 artículos de esa familia quedan fuera.

Con maderas, metales y eléctricos van **44 artículos de Max descartados por lo mismo**. Una
sola pregunta al comercio los desbloquea todos.

### Cuántos ítems se pueden comparar, y por qué no son más

Con cinco comercios cargados solo 83 ítems tienen precio de más de uno, y eso es poco. La
pregunta obvia es si el catálogo está partido demasiado fino. Se midió, y la respuesta es
que **una parte sí y la mayor parte no**.

#### La parte que sí: ejes que no eran especificación

Tres cortes se estaban haciendo por diferencias que no son de compra, y se quitaron:

- **La forma de la taza del inodoro.** «Elongado» y «alargado» son la misma palabra: Ochoa
  e InnovaCentro escriben una y Cima la otra, y eso abría dos ítems donde hay uno. Un
  inodoro es de una pieza, de dos piezas o infantil, y nada más. Los cuatro ítems de una
  pieza pasaron a ser **uno con tres comercios y 60 cotizaciones**.
- **El número de manijas de la grifería.** Monocomando, de dos manijas y de cuatro pulgadas
  eran tres ítems. La grifería se separa por dos cosas: para qué aparato es —baño o
  fregadero— y si tiene sensor. El acabado y la línea del fabricante son de la cotización.
- **El conjunto de ducha.** La columna, el sistema completo y la barra deslizable son la
  misma partida.

Y un cuarto que era un error de lectura, no de criterio: el perfil de canto salía con
medidas de «7712 mm» y «3048.5 mm» porque la expresión leía el código del artículo pegado a
la referencia. Un perfil de canto va de 6 a 30 mm; ahora se rechaza lo que no quepa ahí.

#### La parte que no: cada comercio trajo un departamento distinto

Este es el número que explica todo lo demás:

| | |
|---|---|
| Familias donde coinciden dos comercios o más | **25** |
| Familias con un solo comercio | **118** |
| Ítems dentro de esas 118 familias | **861** |

No hay eje que quitar que los cruce: **el otro comercio sencillamente no está**. Las
familias con más ítems sin comparar lo dicen solas:

| Ítems | Único comercio | Familia |
|---|---|---|
| 268 | Cima | conexiones de plomería |
| 130 | Ochoa | baldosas |
| 35 | Cima | mangueras |
| 31 | Max | bombillos |
| 21 | Cima | llaves de paso |
| 18 | Ochoa | cámaras |
| 11 | Max | extensiones eléctricas |
| 11 | Max | breakers |

Los tres comercios venden conexiones de PVC; solo tenemos las de uno. Los tres venden
cerámica; solo tenemos las de otro. **Lo que mueve este número no es reagrupar: es traer el
mismo departamento de un segundo comercio.**

#### Ojo con el número que se mira

Agrupar bien puede **bajar** la cuenta de «ítems con más de un precio» y mejorar el
catálogo al mismo tiempo: los cuatro inodoros de una pieza incluían dos que ya cruzaban, y
al fundirse en uno la cuenta baja de dos a uno. El indicador que no engaña es otro:

**el 54% de las cotizaciones ya cae sobre un ítem comparable** — 3,192 de 5,871.

### Una cotización formal: 134 líneas que valieron más que 468

Ferretería MC no publica precios en línea; los cotiza por escrito. Sus dos cotizaciones
—CZ27094 y CZ27096, emitidas a nombre nuestro— trajeron 134 líneas, y de esas **51 cayeron
sobre ítems que ya existían**. Los ítems con precio de más de un comercio pasaron de **83 a
131 de un golpe**.

Es la prueba de lo que decía la sección anterior: **lo que mueve ese número no es
reagrupar, es cubrir el mismo departamento dos veces.** Las 468 fichas de eléctricos de Max
sumaron un cruce; estas 134 líneas sumaron 48, porque caen justo sobre los angulares, los
perfiles, las mallas y los accesorios de cerramiento que ya teníamos de Ochoa.

#### El ITBIS deja de ser un supuesto

Todas las demás fuentes son precios de mostrador en línea, y de ahí sale la nota que
acompaña a cada cotización: «la ficha no declara ITBIS; se asume incluido». Una cotización
formal no deja lugar a eso: trae la columna de precio, la de ITBIS y la de total.

Estas 124 cotizaciones entran con **`itbis: false` porque el documento lo dice**, y el sitio
las normaliza antes de compararlas. Se ve en el angular de 1" x 1/8": Ochoa lo publica a
RD$ 560 con impuesto incluido y MC lo cotiza a RD$ 580 sin impuesto —RD$ 684 con él—, y la
referencia sale de los dos números ya llevados al mismo criterio.

#### El cable se vende por pie: pregunta cerrada

Era el hueco abierto en las tres colecciones de Max, que no publican unidad de venta. La
cotización de MC pone la unidad en su propia columna: **PI, pie**. Un THHN #12 a RD$ 13.68
el pie.

Con eso, los RD$ 16 del THHN #12 de Max dejan de ser un misterio: son por pie, y el orden de
magnitud coincide. El catálogo lleva el cable por rollo de 100 pies, que es como se compra
en obra, así que la cotización se multiplica por 100 y la nota lo deja dicho.

#### Lo que una cotización real enseña sobre dónde parte un ítem

Es un comercio itemizando de verdad, no una ficha de e-commerce, y confirma línea por línea
los ejes que el catálogo ya usaba:

| Lo que abre una línea nueva | Evidencia en la cotización |
|---|---|
| **La norma del tubo** | «TUBO PVC 1 1/2X19» aparece tres veces: SDR41 a RD$ 337.80, SDR26 a RD$ 496.60 y SCH40 a RD$ 898.00 |
| **Drenaje o presión** | «REDUCCION BUSHING PVC 2x1/2» aparece dos veces: drenaje a RD$ 12.26, presión a RD$ 26.14 |
| **La pared del tubo** | «PERFIL CUADRADO GALV 1 1/2x20» aparece dos veces: 1.2 mm a RD$ 642.80 y 1.6 mm a RD$ 810 |
| **Corta o larga** | «ABRAZADERA P/MALLA 1 1/2"» aparece dos veces, CORTA y LARGA |

Y lo contrario también, que es lo que costaba fijar:

| Lo que NO abre una línea nueva | Evidencia |
|---|---|
| **El color** | El THHN se cotiza #10 blanco, #12 amarillo, #14 blanco, #2 negro. El color va en la descripción y nunca abre una línea: lo que la abre es el calibre |
| **La marca** | La misma unión universal de 1" está cotizada con ERA y con AQUAVITA. Lo que las separa no es la marca sino la cédula: SCH80 contra SCH40 |

Es exactamente el modelo del catálogo, escrito por un comercio que no lo conocía.

#### Y una trampa que ya conocíamos, otra vez

La copa pasante lleva dos medidas y cada comercio las escribe en el orden que quiere: Ochoa
pone «1 1/4 x 1 1/2» y MC «1 1/2 x 1 1/4». Es la misma pieza. Ya había pasado con
InnovaCentro; ahora las dos medidas se ordenan de menor a mayor antes de formar la clave, de
modo que no vuelva a pasar con el próximo comercio.

Diez líneas quedaron fuera, todas por lo mismo y todas dichas: siete son medidas que el
comercio del que salió esa familia no vende —un angular de 1 1/2 x 1/8, un perfil de 4x4 en
2.2 mm— y crearlas es trabajo del importador de esa familia, no de un mapeo. Las otras tres
son una copa de barandal, que el catálogo no tiene.

### Nunca apuntes por código a un ítem generado

El mapeo admite dos formas y la diferencia importa:

```js
'023108': 'MAT-02-001',                    // ítem escrito a mano: su código no se mueve
'028879': '#MAT-22|malla-ciclonica-11-6',  // ítem generado: se apunta por clave
```

El código de un ítem generado **sí se corre**: basta con que entre otro ítem antes en la
misma categoría. Apuntarle por código manda las cotizaciones al ítem equivocado **sin dar
ningún error**, y así fue como en la primera pasada la malla ciclónica de 6 pies terminó
cotizada al precio de un tubo. El importador ahora lo rechaza y dice qué clave usar; con
`--claves` se listan todas.

### La regla de seguridad y tecnología: sistema del edificio sí, tienda de computadoras no

Ese catálogo mezcla dos negocios bajo los mismos estantes. Por un lado los sistemas de
corrientes débiles de un edificio —CCTV, alarma, detección de incendio, control de
acceso, cableado estructurado, intercomunicación, domótica de pared—, que son partidas de
obra con su canalización, su cableado y su instalador. Por otro la tienda de
computadoras: hubs USB, cargadores de laptop, memorias, cables HDMI de 1.8 metros,
soportes de monitor. Lo primero entra, lo segundo no: 68 artículos de 604 se quedaron
fuera por eso.

La frontera pide cuidado en los dos sentidos. Un «cable de audio» de 1.8 metros con
conectores RCA es de escritorio, pero uno declarado como AWG 16/4 es cable de instalación
para un sistema de voceo, y entra. Un adaptador USB no es de obra, pero un adaptador de
fibra óptica va en el patch panel y sí lo es.

Aquí las categorías del comercio sí sirven para agrupar, así que la categoría sale de
ellas y el filtro del nombre. Con dos excepciones, donde manda el nombre: hay cámaras y
grabadores archivados en domótica, y estaciones de intercomunicador archivadas en
cableado.

Hay una regla por familia, y cada una sabe leer la forma en que ese rubro escribe su
medida: los angulares la traen en la descripción («1-1/2 X 1/8 pulgadas»), la perfilería
la reparte entre la descripción y el nombre (la pared en milímetros), y el cerramiento la
lleva entera en la referencia (`C-096X50` es calibre 9, 6 pies de alto, rollo de 50).

La medida se busca primero en la descripción y, si no está, en la referencia del
fabricante: `3/4X11/2X20` es un perfil de 3/4 x 1 1/2 pulgadas en 20 pies. Eso rescató una
docena de artículos que la descripción dejaba mudos.

Un detalle del oficio que hubo que enseñarle al lector de medidas: el comercio escribe los
números mixtos pegados, y «11/2» es una pulgada y media, no once medios. La regla que los
separa sin romper las fracciones de verdad es que si la fracción tal cual sale mayor que 1
es un mixto, porque en este oficio nadie escribe fracciones impropias. Así «11/4» queda en
1 1/4 y «15/16» se mantiene como quince dieciseisavos.

La regla devuelve `null` cuando la ficha **no** declara la medida, y entonces el artículo
no entra. Es la mayor parte de lo que se descarta, y es deliberado: «Malla Ciclónica
3.43Mm» aparece cuatro veces con precios de RD$ 5,223 a RD$ 13,273 y el nombre no dice la
altura del rollo. Una fila así en un presupuesto es peor que ninguna fila.

### Las baldosas: 1,226 precios en 206 filas

Es la extracción más grande y la que mejor muestra por qué el ítem es la especificación.
Ochoa publica 1,334 baldosas, 1,226 con precio, y casi todas son el mismo producto en otro
color: «Fronda Musgo» y «Castle Light» son las dos cerámica de pared de 20 x 60 de PAMESA,
y en un presupuesto son una sola partida.

Una baldosa queda definida por tres cosas, que son las tres que un presupuesto escribe:
**material** (cerámica o porcelanato), **uso** (piso, pared, o piso y pared) y **formato**.
El color, el diseño, la colección y la marca no definen nada: van en la cotización.

El acabado se queda fuera de la clave a propósito. Mate, brillante, pulido y antideslizante
son diferencias reales, pero la ficha las escribe de 134 maneras distintas y las calla en
382 artículos. Convertirlas en clave partiría los ítems según si el comercio se acordó de
escribirlo, que es la peor razón posible para partir un ítem. Van registradas como medida,
y solo cuando todos los artículos del ítem coinciden.

Con eso, 1,150 artículos entran en 206 ítems de baldosas y sus vecinos, y el catálogo pasó
de 812 a 1,018.

#### El precio va por metro cuadrado

La tienda cobra por pieza y la obra compra por metro. La referencia trae las dos cosas
pegadas —`60X602.77MT/2` son 60 x 60 cm y 2.77 piezas por m²— y de ahí sale el precio por
metro, que es el único número comparable entre formatos. La nota de cada cotización deja
dicho el precio por pieza y las piezas por metro, para que se pueda rehacer la cuenta.

Dónde termina el ancho y empieza el factor no se puede saber leyendo: `45X455.0MT/2` se
lee igual como «45 x 4 con 55 piezas» que como «45 x 45 con 5 piezas». Se resuelve con
geometría: la lectura buena es la que cuadra con 10000 / (largo × ancho), y una baldosa de
campo no mide menos de 5 cm de lado.

Dos trampas más, cada una descubierta por un número que no cuadraba:

- **La pieza no siempre es rectangular.** En un hexágono el rectángulo que lo encierra
  miente: 23.2 x 26.8 daría 16.07 piezas por metro y las que hacen falta son 21.62, porque
  los hexágonos se traban. Cuando ninguna lectura cuadra con la geometría se acepta la del
  comercio, siempre que esté en el mismo orden de magnitud. Y cuando el comercio no declara
  el factor, el artículo no entra: calcularlo del formato daría un precio 34% bajo.
- **Hay referencias mal escritas.** `50.8X50.3.86MT/2` perdió un 8, y se deja leer como
  «50.3 con 6 piezas» partiendo un decimal por la mitad: un precio por metro 55% más alto.
  Las dos mitades tienen que ser números completos.

La prueba de que todo esto quedó bien es que el propio comercio publica su precio por metro
cuadrado en 980 de las baldosas: **las 980 coinciden con el que sale de aquí**, hasta el
centavo. Y de paso quedaron recuperadas 20 baldosas que su extracción había dejado sin
precio por metro por ese mismo problema de lectura.

#### El formato se ajusta al nominal

Cada fábrica declara su medida real —30, 30.3, 30.5, 31, 31.5— y son todas el mismo
formato: la obra las pide como «30 x 60». Sin ajustarlas, el catálogo saca seis ítems donde
hay uno y se pierde justo la comparación que se busca.

El ajuste lleva su propia trampa, y costó una vuelta descubrirla: con una lista larga de
medidas el redondeo empieza a **inventar**. Un 52 x 17 real terminaba llamándose
«50 x 17.5 cm», que no lo vende nadie. La lista se dejó corta, solo con los formatos que el
mercado nombra, y lo que no cae dentro del 5% de uno de ellos se queda con su medida real.
Así el 58 x 32 de CEDASA sigue siendo 58 x 32, que es como se vende.

#### Los precios de liquidación no son referencia

23 artículos están rebajados más del 50%, y uno llega al 99%: un mosaico que lista a
RD$ 599.52 y se vende a RD$ 4.54. Es un precio real, pero no es una referencia de mercado —
nadie presupuesta una obra con saldo de almacén—, y si entrara arrastraría la mediana de su
formato hacia abajo. Se descartan y el informe dice por qué.

El corte en 50% no es una opinión: el catálogo tiene 239 artículos rebajados hasta 40%
—promociones normales, la mayoría entre 10% y 30%—, luego un hueco de casi nada, y después
esos 23 entre 50% y 99%.

#### Un solo precio cuando el comercio repite

El derretido Eurojunta sale en 16 colores y los 16 cuestan RD$ 323.12. Bajo el modelo de
especificación son **un** precio: publicarlos 16 veces llenaría la ficha de filas idénticas
y le daría a ese comercio 16 votos en la mediana frente al único de otro. El importador
colapsa las cotizaciones que comparten ítem, comercio y precio, y la nota dice cuántos
artículos hay detrás.

#### Lo que no era una baldosa

El comercio archiva bajo «baldosas» cosas que el presupuesto busca en otro lado, y cada una
se mandó a su categoría: los adhesivos, derretidos, estucos y hormigón seco a
`MAT-02` (cemento y morteros), las tejas y los caballetes a `MAT-07` (techos), y las
cortadoras, discos y llanas a `EQU-04` (herramientas). En pisos se quedaron, además de las
baldosas, los mosaicos en malla, los peldaños, los perfiles de canto, las crucetas y
niveladores y los adoquines.

Se quedaron fuera 75 artículos, todos con su razón dicha: 23 por precio de liquidación, 16
perfiles que no declaran material ni medida, 15 repuestos de corte sin medida, 6 cortadoras
que no dicen su largo de corte, 5 crucetas que no dicen cuántas trae la funda —la misma
cruceta de 2 mm aparece a RD$ 52.30 y a RD$ 12,274.78, así que sin ese dato el precio no
dice nada—, 5 herramientas de Milwaukee que son de plomería y no de cerámica, y 5 más entre
piezas de decoración suelta y fichas incompletas.

Y uno que ni siquiera cuenta como descarte: un taco metálico archivado bajo «pavimentos»,
que no es de este rubro. Para eso la regla distingue entre *no entra* y *no es de aquí*.

#### Las cuatro baldosas del principio

`MAT-08-001` a `MAT-08-004` eran estimaciones nuestras escritas con el nombre de la calle:
«Cerámica nacional 33 x 33», «Porcelanato mate 60 x 60». Se reescribieron con el nombre de
su especificación para que la extracción cayera encima en vez de duplicarlas, y tres de las
cuatro pasaron a verificadas —el porcelanato de 60 x 60 con 31 cotizaciones—. La cuarta, el
porcelanato de 80 x 80, sigue estimada porque Ochoa no lo vende.

### El campo que hace posible todo esto

El nombre del artículo muchas veces se calla la medida —«Alambre Liso Galvanizado», sin
más— pero **la referencia del fabricante sí la trae**: `C-18ROLLO/GDE.`. Lo mismo con las
mallas electrosoldadas, donde `W2.3X2.3100X100` declara el calibre del alambre y la
retícula que el nombre no menciona. Sin ese campo, la mitad de las correspondencias
serían suposiciones nuestras; con él son datos del comercio, y por eso la referencia
queda escrita en la nota de cada cotización, visible en el sitio.

### Cómo valida los precios

El acero se vende al peso: dentro de una familia, el precio por libra es casi constante.
Los angulares de Ochoa dan **RD$ 35.00 por libra clavados en 15 de 21 medidas**. Eso da
una prueba objetiva: se calcula la mediana de RD$/lb de la familia y se rechaza lo que se
aparte más del 35%.

Ojo con la unidad. Algunos artículos se cotizan **por pie**, y la unidad completa son 20
pies, como dice la propia nota de facturación de Ochoa. Sin esa corrección, un angular de
20.20 lb parece costar RD$ 1.93 la libra en vez de RD$ 38.66, y se descartaría un precio
perfectamente bueno. La nota de esas cotizaciones lo deja dicho.

En la extracción del 09/09/2026 la validación rechazó dos precios: una tola galvanizada a
RD$ 48.11 la libra y una tola negra a RD$ 9.33, contra los RD$ 26.80 de su familia.

La prueba solo se aplica donde el peso **es** el precio, que son las familias de acero
comercial. En el polvo de color para mosaico el precio depende del pigmento y del grado
—el verde industrial vale casi el triple que el amarillo comercial— y aplicarla ahí
rechazaría precios perfectamente buenos. La lista de familias que se validan está
declarada en `VALIDA_POR_LIBRA`, dentro del importador.

El peso también verifica el espesor. Una plancha de 4 x 8 pies pesa unas 40.8 libras por
cada 1/32" de espesor, y por eso el peso va en la especificación de cada tola: fue lo que
confirmó que el raro «1/22"» del catálogo de Ochoa es un espesor real —0.045", el
equivalente a 1.15 mm— y no un error de tipeo.

### El ITBIS de estas tandas

Ninguna de esas fichas declara si el precio incluye el impuesto. Se registran con
`itbis: true` porque en República Dominicana el precio de mostrador al consumidor se
muestra con el ITBIS incluido, pero **es un supuesto nuestro, no un dato de la ficha**, y
así queda dicho en la nota de cada cotización, visible en el sitio. Al confirmarlo con el
comercio, basta con ajustar la nota o el valor.

### Dos cosas pendientes de verificar

**Los tubos de PVC vienen en 19 pies, no en 20 — resuelto.** Se sostuvo sin cambiar la
ficha mientras solo lo decía un comercio. Con Cima ya lo dicen dos, en cuatro diámetros, y
la especificación se corrigió: ver «El PVC sanitario es de 19 pies» más arriba. Queda como
ejemplo de la regla: no se cambia el catálogo con la evidencia de un solo comercio, pero
tampoco se ignora — se registra la discrepancia a la vista y se espera al segundo.

**Las grapas para alambre de púas de Max.** El nombre dice 1x10 y el código interno de la
tienda dice 1x9. El artículo está fuera igual, porque tampoco declara la unidad de venta,
pero si algún día entra hay que preguntar el calibre primero.

**Los 44 artículos de Max sin unidad de venta.** 17 de metales —clavos, alambre de amarre y
electrodos— y 27 de eléctricos —cables y alambres—. La cotización de MC ya despejó la mitad
de la duda: el cable se factura por pie. Falta confirmar clavos, alambre de amarre y
electrodos, que se venden por libra o por caja.

**El extractor de tornillos de Max.** «JUEG EXTRACTOR DE TORNILLOS TRUPER14512» tiene el
enlace interno de una regleta USB: el nombre y el producto pueden no coincidir. Está fuera
igual, por ser herramienta suelta.

**La pintura de Ochoa está retenida.** «Pintura Acrílica Superior 5 GL» aparece a
RD$ 983.41, unos RD$ 197 por galón. Es nueve veces menos que nuestra estimación y resulta
inverosímil para una cubeta de cinco galones: o la ficha cotiza por galón, o es otra
presentación. No se carga hasta confirmarlo en tienda. Queda comentada en
`datos-precios.js` con la explicación.

### Cuando conviven datos reales y de demostración

Un dato real siempre gana a uno ficticio. En cuanto un ítem tiene una cotización de
verdad, las de demostración dejan de promediar y **ni siquiera se muestran**: ver un
precio real al lado de uno inventado confunde más de lo que enseña. Lo mismo aplica al
copiado a Excel, para que lo que se copia sea lo que se ve.

---

## El directorio: nueve comercios, todos con precio confirmado

Desde el 09/09/2026 el directorio publica solo los comercios a los que se les confirmó
un precio, es decir, los que tienen cotizaciones en `datos-precios.js`. Los otros 74 que
había (ferreterías, fabricantes, mayoristas y especializados de los que solo se conocían
los datos de contacto) están en `herramientas/retirados/retirados-del-sitio.xlsx` y
vuelven al directorio en cuanto se les registre una cotización.

Lo que sigue describe cómo era el directorio antes de ese recorte y sigue siendo útil para
volver a cargarlo. De sus 80 entradas, **14 publicaban precios o tenían tienda en línea**, y
solo esas sirven para extraer un catálogo sin pedir cotización. Cinco están cargadas, más una
sexta —Ferretería MC— que no publica precios pero sí cotiza por escrito.

| | Proveedor | Cotizaciones |
|---|---|---|
| ✔ | Ferretería Ochoa (8A) | 2,288 |
| ✔ | Ferretería Cima | 644 |
| ✔ | InnovaCentro (La Innovación) | 351 |
| ✔ | Max Ferretería | 352 |
| ✔ | Ferretería MC (por cotización) | 124 |
| ✔ | Ferremix (Grupo Alterra) | 2 |
| | Plaza Lama, Ferretería Gigante, Würth Dominicana, Gerdau Metaldom, Cerarte, Cerámica Import, Procontratista, Segumart, SOS Protección Integral | — |

Segumart está en la lista pero exige registro para ver precios, y no se entra a secciones
que piden cuenta.

### El campo `precios` hay que verificarlo a mano

Es el campo del directorio que más se equivoca, porque un catálogo en línea no es lo mismo
que un catálogo con precios. Al revisarlo con el cliente cayeron tres de dieciséis:

- **Ferretería Americana** no existe. Se eliminó del directorio.
- **Ferretería MC** tiene catálogo en línea pero sin precios; hay que pedirlos. **Se
  pidieron y llegaron**: dos cotizaciones formales que ya están cargadas. Queda con
  `precios: false` porque no los publica, pero es la mejor fuente del catálogo — es la
  única donde el ITBIS viene declarado.
- **Cielos Acústicos** publica catálogos, no precios. Igual.

Los otros trece no se pudieron comprobar desde aquí —el entorno de desarrollo no tiene
salida a internet— así que siguen como estaban. **Conviene revisarlos uno por uno antes de
publicar el sitio**, porque el número de la portada sale de ese campo.

### Los ocho proveedores de demostración no cuentan

La portada anunciaba «87 proveedores en el directorio»: los reales más los ocho
ficticios del modo demostración. Un número de portada no puede salir de datos inventados,
ni siquiera mientras la demo está encendida, así que el generador ahora los excluye de las
cifras del hero igual que ya los excluía de las tarjetas de cada categoría.

---

## CerArte: el segundo precio de las baldosas

Al 10/09/2026 entra **CerArte** (cerarte.com.do), tienda especializada en cerámica,
porcelanato, baños y cocinas: 1,926 variantes publicadas, 1,050 aprovechadas, **936
cotizaciones**. Es el primer comercio que le hace segunda voz a Ochoa en baldosas, que era
el hueco más grande del catálogo: MAT-08 pasa de 0 a **39 ítems con dos comercios**.

Su ficha declara tres cosas que casi ningún comercio publica y que aquí valen oro: la
**unidad de venta** de cada línea (m² o unidad), los **metros y las piezas por caja**, y que
el **precio publicado no lleva ITBIS**. Lo último se registra como dato (`itbis: false` en
la fuente, con su propia nota) en vez de suponerse.

### El uso de la baldosa se midió antes de decidir

En 434 de sus 883 baldosas no dice si la pieza es de piso o de pared. Antes de tirarlas o de
adivinar se midió si ese eje mueve el precio, con el método de los bombillos:

| Ejes | Buckets | Con rango > 3x |
|---|---|---|
| material + uso + formato | 71 | **4** |
| material + formato | 64 | 10 |
| solo formato | 53 | 11 |

Y dentro de un mismo (material, formato) la mediana cambia hasta **1.9x** de un uso a otro:
la cerámica de 60 x 120 de pared vale RD$ 2,067/m² y la de piso RD$ 1,082/m². El eje se gana
su sitio, así que las 353 que no lo declaran quedan fuera con ese motivo escrito. Tampoco se
dedujo del formato: 60 x 120 y 60 x 60 están genuinamente repartidos entre piso, pared y
ambos, y solo seis formatos son unánimes.

### Cuatro familias nuevas

`inodoro-suspendido` (va sobre bastidor dentro de la pared, con el tanque empotrado: es otra
partida y otra albañilería), `banera`, `plato-ducha` y `piso-vinilico`. La primera se aparta
de la regla de agrupación de inodoros —una pieza, dos piezas o infantil— porque la
diferencia no es de diseño sino de instalación.

## La Ibérica y Tonos y Colores

Dos comercios más el 10/09/2026, los dos especializados.

**La Ibérica** (tienda.laiberica.com.do) es el tercer comercio de baldosas: 1,522 artículos
publicados, 687 aprovechados, **575 cotizaciones**. Cubre lo mismo que CerArte —cerámica,
porcelanato, baños, grifería, adhesivos y complementos de colocación— y trae la medida y la
presentación en columnas propias, lo que ahorra adivinarlas dentro del nombre. Su web no
desglosa el ITBIS, así que va con el supuesto de mostrador.

Declara el uso de la baldosa en solo 87 de sus 478 piezas: las otras viven en «CERAMICA» y
«DECORADO», que mezclan formatos de piso y de pared. Se les aplica la misma regla que a
CerArte y quedan fuera con el motivo escrito.

**Tonos y Colores** (tonosycolores.com) es la primera tienda de pintura del directorio, y
llena la categoría más vacía: MAT-12 tenía **un solo ítem** —un estuco— y ahora tiene 22.
131 SKU aprovechados de 236, **88 cotizaciones**.

Trae dos datos que casi nadie publica: que sus precios **llevan ITBIS** —se registra como
dato, no como supuesto, y para eso el importador distingue ahora los tres casos: lo declara
incluido, lo declara aparte, o se calla— y el envase de cada SKU en columna propia.

Todo su catálogo está «en oferta», con un 27% de descuento medio. Cuando el 100% del
catálogo está rebajado, el precio de oferta **es** el de calle y el «regular» es el de lista:
se carga el vigente y la nota lo dice. No es el caso de una liquidación puntual —esas sí se
dejan fuera, como las 23 baldosas rebajadas de Ochoa—, porque aquí no hay un precio sin
rebaja con el que comparar.

### La pintura como partida

`especificacion-pintura.js` define dos familias. `pintura` se identifica por **tipo** (acrílica,
esmalte, anticorrosiva, epóxica, de tráfico, para piscina, aislante térmica, impermeabilizante,
primer, masilla para sheetrock, masilla para exterior) y **envase** (el galón, la cubeta de
cinco, el de 750 ml…), porque el precio por galón cambia con el envase y mezclarlos daría una
mediana sin sentido. El color es de la cotización, como en la baldosa. El acabado va como
medida y no como clave: 128 de 236 artículos no lo declaran, y partir ítems según si el
comercio se acordó de escribirlo es la peor razón posible para partirlos.

Un detalle de la ficha que costó dos artículos: en este catálogo el sufijo «-3» del SKU es la
cubeta de cinco galones (32 de 34 lo confirman). Cuando además la presentación dice un galón,
la ficha se contradice y el precio no entra.

Queda un rango ancho que vigilar: `Pintura acrílica, galón` va de RD$ 374 (Acritex, línea
económica) a RD$ 5,298 (Montó Nature), 14x. Es el mercado, no un error de agrupación —marca
económica contra premium del mismo producto—, pero conviene volver a mirarlo cuando entre un
segundo comercio de pintura.

## Ferremix: 12,583 filas, y el nombre roto

El 10/09/2026 entra el catálogo completo de **Ferremix** (ferremix.com.do). Ferremix ya
estaba en el directorio con dos precios levantados a mano; ahora es fuente completa: 12,583
filas, 8,984 productos, **550 cotizaciones** sobre 135 ítems.

Es el catálogo más extenso y el más sucio del directorio, y las dos cosas están
relacionadas.

### El nombre está roto; el slug no

La columna «Producto» viene con letras comidas en cientos de artículos: «Ceramia» por
cerámica, «Boma» por bomba, «Tomacorriene», «Bomillo», «Lave», «Valula», «Dispensaor e».
Escribir expresiones contra eso sería clasificar mal en silencio.

Pero el **slug de la URL** trae el nombre que el propio comercio escribió, bien:

| Columna «Producto» | Slug de la URL |
|---|---|
| Boma periférica para agua de 1/2 hp | `bomba-periferica-1-2hp-altura-max-30m-uso-agricola` |
| Ceramia hibrida 26 oz meguiars | `ceramica-hibrida-26-oz-meguiars` |

Las reglas leen los dos: el slug para saber **qué** es la pieza y el nombre original para las
**medidas**, porque el slug convierte las barras en espacios y «1/2» se vuelve «1 2». De 382
artículos con «lave» por «llave», el slug lo trae bien en 343.

### De 21 departamentos, siete

Solo plomería, baños y grifería, electricidad, iluminación, pinturas, pisos y materiales de
construcción tienen partidas de obra. Herramientas (1,667), hogar y decoración (836),
automotriz, tornillería, jardinería, maquinaria, cerrajería, protección personal y los 2,920
artículos que la propia tienda deja «sin departamento» quedan fuera enteros: es una
ferretería general, no una lista de materiales. Se descartan además 1,836 agotados.

### Lo que el precio delató

Tres clasificaciones erróneas salieron a la luz porque abrían el rango del ítem de forma
imposible, y se corrigieron en las reglas, no con un filtro de precio:

- **Piezas sueltas del aparato** —cartucho, aireador, puño, vástago, cuello de repuesto,
  pichorro, chapetón— caían en el ítem del aparato completo. «Mezcladora, de baño» iba de
  RD$ 49 a RD$ 83,000; ahora arranca en RD$ 340.
- **Las tapas** de interruptor y tomacorriente son la placa, no el aparato: son dos partidas
  y se llevan diez veces de precio. «Interruptor doble» pasó de RD$ 39–4,515 a RD$ 45–429.
- **Los paquetes**: «Juego de 2 bombillos 110w» es un precio por dos. Cualquier artículo cuyo
  nombre diga «juego/set/pack/combo de N» queda fuera con ese motivo.

### Lo que trajo

La pintura deja de tener un solo comercio: **6 ítems de MAT-12 ya se comparan**, y el galón
de acrílica tiene RD$ 375–430 de Ferremix contra RD$ 374–1,485 de Tonos y Colores. En
eléctricos, MAT-10 sube a 204 ítems con 21 comparables.

## Filtro «Mis proveedores»

Un visitante que ya trabaja con ciertos proveedores puede seleccionarlos y ver los precios
calculados **solo con las cotizaciones de ellos**, y la tabla se queda con los ítems que
ellos cotizan. Se selecciona de tres formas:

- desde los chips **Proveedor** de la barra del catálogo (uno por comercio; admiten varios);
- desde el botón **Mis proveedores** del directorio, que abre un panel con buscador y casillas;
- desde el directorio, con el botón **Trabajar solo con este** de cada tarjeta.

La barra del catálogo filtra además por **categoría** y **etapa** (chips de una sola
elección, con menú «+N» para las que no caben) y por **rango de precio** (dos campos, mínimo
y máximo, sobre el precio que se ve: con ITBIS o sin él según el interruptor). Todo va en la
URL (`?cat=MAT-04&min=400&max=500`) salvo la selección de proveedores, que se guarda en el
navegador. La antigua «gama» (económica, estándar, premium) dejó de ser filtro.

La selección se guarda en el navegador (`localStorage`), se comparte entre páginas y no
sale del equipo del visitante.

### Qué cambia cuando hay filtro activo

| | Sin filtro | Con filtro |
|---|---|---|
| Precio de referencia | Mediana de todas las cotizaciones | Mediana solo de las de sus proveedores |
| Etiqueta del ítem | Estimado / Verificado / Demostración | Añade **sus proveedores** |
| Ítem sin cotización de ellos | — | Vuelve a la referencia general y avisa: **sin cotización suya** |
| Ficha por proveedor | Todas las cotizaciones | Las suyas resaltadas con la etiqueta **suyo** |
| Copiado a Excel | Proveedor: «Referencia del mercado» | Proveedor: «Referencia de sus proveedores» |

Arriba de cada página aparece una barra azul que dice con cuántos proveedores se está
filtrando y cuántos ítems tienen cotización de ellos, con enlaces para cambiar la
selección o quitarla.

Un ítem sin cotizaciones de los proveedores elegidos **no se queda sin precio**: vuelve a
su referencia general y se marca, que es más útil que un hueco.

### Nota de implementación

La interfaz del filtro (botón, panel y barra) la inyecta `app.js` en tiempo de ejecución,
no está en el HTML de las 41 páginas. Es una función puramente interactiva que no necesita
estar en el HTML para los buscadores, y así no hay que regenerar el sitio para tocarla.

Las páginas de categoría traen la ficha de cada ítem escrita en el HTML —eso sí lo ve un
buscador—, pero al abrirla se regenera desde los datos para reflejar el filtro y el
interruptor de ITBIS del momento.

## Modo demostración (apagado)

**Está apagado desde el 09/09/2026** (`ACTIVO = false` en `assets/js/datos-demo.js`): un
sitio que solo publica precios reales no puede cargar precios inventados. Se deja el
archivo por si hace falta enseñar una función con datos ficticios; lo que sigue describe
qué hace cuando está encendido.

`assets/js/datos-demo.js` carga **8 proveedores y 31 cotizaciones ficticias** sobre 14
ítems, para poder ver el sitio funcionando como funcionará cuando haya cotizaciones
reales: la ficha por proveedor llena, el recálculo de la referencia, la normalización de
ITBIS y el copiado a Excel con varias filas.

**Nada de eso es real.** Todos los proveedores llevan `(demo)` en el nombre y una etiqueta
morada, hay una barra de aviso en todas las páginas, y los ítems afectados quedan marcados
como **Demostración**, nunca como *Verificado*: un dato inventado no se presenta como
comprobado.

Los proveedores ficticios **no aparecen** en el directorio, que sigue mostrando las
80 empresas reales.

### Qué demuestra cada caso

| Ítem | Qué muestra |
|---|---|
| Cemento (`MAT-02-001`) | Tres cotizaciones que promedian, una de ellas cotizada **sin ITBIS** que se normaliza antes de comparar, más un fabricante de canal cerrado que se muestra pero **no** entra en el cálculo |
| Arena lavada (`MAT-01-001`) | Una cotización **por viaje** cuando el ítem se mide en m³: se muestra marcada y queda fuera del cálculo por no coincidir la unidad |
| Colocación de bloques (`MOS-02-001`) | Mano de obra, que no lleva ITBIS |
| Aluzinc (`MAT-07-002`) | Un ítem con una sola cotización |

### Cómo apagarlo

Abrir `assets/js/datos-demo.js`, poner `ACTIVO` en `false`, y regenerar:

```bash
node herramientas/generar-categorias.js
```

Todo vuelve a su estado real de inmediato: los proveedores ficticios desaparecen, los 14
ítems regresan a su precio estimado y la barra de aviso deja de mostrarse. Para eliminarlo
del todo, borrar el archivo y su etiqueta `<script>` del generador y de las cuatro páginas
escritas a mano.

> **Antes de publicar el sitio de cara al público, apáguelo.** Sirve para revisar y para
> enseñarle a alguien cómo va a funcionar, no para estar en producción: aunque todo esté
> marcado, son precios inventados en una página de precios.

## Descargar el libro de Excel

El sitio ofrece `precios/descargas/precios-construccion-rd.xlsx`, un libro de **dos hojas**
con todo el catálogo. Es un **archivo estático commiteado al repositorio**: la página solo
tiene un enlace. No se arma en el navegador ni hace falta cargar una librería para eso, que
es lo que mantiene el sitio sin dependencias en tiempo de ejecución.

```bash
python3 herramientas/generar-excel.py     # arma el libro
python3 herramientas/verificar-excel.py   # lo revisa antes de publicar
```

`generar-excel.py` no conoce el catálogo: se lo pide a `herramientas/datos-para-excel.js`,
que es JavaScript porque es el mismo modelo que lee el sitio. El modelo no se duplica.

**El libro no carga `datos-demo.js`.** Las cotizaciones de demostración existen para que se
vea cómo funcionará el sitio, y un archivo que circula por correo no es lugar para precios
ficticios.

### Las dos hojas

| Hoja | Para qué |
|---|---|
| **Catálogo** | Los ítems con sus campos, más una columna por cada eje de medida que use al menos ocho ítems (litros de descarga, ancho en mm, resolución en MP…) y una columna de sobra con el resto. |
| **Comparativo** | Un ítem por fila, una columna por comercio, y mínimo, mediana, máximo, dispersión y cuál es el más barato. |

Las dos llevan en la fila 1 una **banda fina con la firma** y se congelan bajo los
encabezados, que van en la fila 2. Antes había ocho hojas —Léame, Presupuesto, Resumen por
etapa, Solicitud de cotización, Proveedores y Conversiones—: eran plantillas de trabajo, y
quien cubica ya tiene las suyas. El libro se quedó con lo que solo este sitio puede dar.

De la hoja **Catálogo** salieron tres columnas: «Alcance» (decía lo mismo en 1,471 de 1,522
ítems), «Alias de mercado» (existe para el buscador del sitio, no para una hoja) y «Estado»
(ya no hay estimaciones: todo lo publicado tiene precio de comercio). Y «Fuente» dejó de ser
un conteo —«4 cotizaciones de proveedores»— para ser **los nombres de los comercios que
cotizaron el ítem**, que es lo que se necesita para auditar un número.

### Por qué la mediana del libro puede no coincidir con la del sitio

En el **Comparativo**, el mínimo, la mediana y el máximo se calculan con fórmulas sobre las
celdas de proveedor que están a la vista, que es lo que un comprador espera poder auditar.
El precio de referencia del sitio se calcula distinto: normaliza el ITBIS al criterio del
ítem, promedia **todas** las cotizaciones —no solo la más baja de cada comercio— y deja
fuera las que vienen en otra presentación. Las dos columnas están juntas en la hoja y la
nota al pie lo explica, para que la diferencia se entienda en vez de parecer un error.

### El ITBIS no se suma al final

Es el error más fácil de cometer al armar un presupuesto con estos datos. Cada precio viene
como lo cobra el comercio: los materiales de mostrador ya traen el 18% incluido y la mano
de obra, los subcontratos y el alquiler de equipo no. Aplicar un 18% parejo al total
cobraría el impuesto dos veces sobre los materiales. Por eso la plantilla no lo hace: suma
el costo directo tal cual y muestra aparte, con `SUMIF`, cuánto impuesto va contenido en
ese total.

### Cómo se verifica

Lo normal sería abrir el libro con LibreOffice y dejar que recalcule, pero eso solo prueba
que las fórmulas **evalúan**: un rango corrido una fila da un archivo limpio con los números
cambiados. `verificar-excel.py` comprueba lo otro, que es lo que de verdad se rompe:

- que toda función usada sea de las que Excel entiende sin prefijo, sin `XLOOKUP` ni
  fórmulas de matriz derramada, que openpyxl escribe sin la metadata que necesitan;
- que cada referencia entre hojas nombre una hoja que existe;
- que las columnas que buscan las plantillas sean las que uno cree —si el Catálogo cambia
  de orden de columnas, la fórmula sigue evaluando y trae el dato equivocado—;
- que los rangos cubran exactamente las filas con datos;
- que el mínimo, la mediana y el máximo del comparativo miren justo las celdas de proveedor
  de su fila.

### Cuándo hay que regenerarlo

Cada vez que cambien los precios o el catálogo, junto con el generador de páginas:

```bash
node herramientas/generar-categorias.js
python3 herramientas/generar-excel.py
python3 herramientas/verificar-excel.py
```

Requiere `openpyxl` (`pip install openpyxl`). El resto del repositorio sigue sin
dependencias.

## Copiar a Excel

Cada precio tiene un botón de copiar y todo se copia como **TSV** (valores separados por
tabulaciones), que es lo que Excel, Google Sheets y Numbers reparten en columnas al pegar.

| Botón | Qué copia |
|---|---|
| El de cada fila de la tabla | La fila de referencia de ese ítem |
| El de cada fila del detalle | Esa cotización de proveedor |
| **Copiar ítem completo** | La referencia más todas las cotizaciones del ítem |
| **Copiar tabla** | Todo lo que se está viendo, con encabezados y respetando los filtros |

Las columnas son siempre las mismas catorce:

```
Código · Ítem · Especificación · Categoría · Unidad · Proveedor · Precio ·
Mínimo · Máximo · Moneda · ITBIS incluido · Estado · Fecha · Fuente
```

Dos decisiones que hacen que esto sea usable de verdad en una hoja de cálculo:

- **Los montos van como número plano** (`1180`, no `RD$ 1,180`), sin símbolo ni separador
  de miles. Es lo único que Excel reconoce como número en vez de como texto. La moneda va
  en su propia columna.
- **Se copia lo que se ve.** Si el interruptor *Ver sin ITBIS* está activo, el monto
  copiado ya viene sin el impuesto y la columna «ITBIS incluido» dice `No`.

El separador decimal es el punto, que es la convención dominicana. Si abre el archivo en
un Excel configurado con locale de España, revise que no interprete el punto como
separador de miles.

## Editar los proveedores

En `assets/js/datos-proveedores.js`, con la misma lógica:

```js
p('Ferretería Ochoa (8A)', {
  tipo:'cadena', canal:'detallista', publico:true,
  cats:['MAT-02','MAT-04'], zonas:['gsd','cibao'],
  web:'ochoa.com.do', tel:'809-971-8000', wa:'', email:'', precios:true,
  nota:'…'
});
```

**Regla del directorio:** solo se publica información de contacto disponible
públicamente. Si un teléfono o correo no se puede verificar, se deja vacío y se dice
en la nota; nunca se inventa. La tarjeta muestra sola el aviso de "sin datos de
contacto verificados".

`publico: false` marca a los fabricantes de canal cerrado (cementeras, siderúrgica,
fábricas de pintura). El precio de referencia del sitio se calcula solo con
proveedores que venden al público.

---

## Qué se retiró del sitio y cómo vuelve

El 09/09/2026 se aplicó la regla de lanzamiento por la vía corta: **solo se publica lo que
tiene precio real**. Salieron del sitio:

| | Cuántos | Dónde están |
|---|---|---|
| Ítems que solo tenían estimación nuestra | 263 de 1,638 | `herramientas/retirados/retirados-del-sitio.xlsx`, hoja «Ítems», con la estimación, su mínimo y su máximo |
| Categorías que quedaron sin ningún ítem | 13 de 41 | hoja «Categorías»; sus páginas se borraron y redirigen a `/` |
| Proveedores sin un solo precio confirmado | 74 de 80 | hoja «Proveedores», con los contactos públicos que se tenían |

Quedan **1,609 ítems** (1,603 con precio de comercio y 6 de tarifario oficial), **28
categorías** y **9 comercios** (Ochoa, Cima, Max, InnovaCentro, MC, Ferremix, CerArte,
La Ibérica y Tonos y Colores).

El libro lo escribe `herramientas/exportar-retirados.py` a partir del estado de los datos
en ese momento; se corre **antes** de retirar nada. No hace falta volver a correrlo salvo
que se retire otra tanda.

### Cómo está hecho el retiro en los datos

- **Los ítems retirados siguen en `datos-catalogo.js`**, con `retirado:true` y los tres
  precios en `null`. Es a propósito: la función `it()` numera los ítems por orden de
  aparición, así que borrar una línea correría los códigos de todos los ítems siguientes de
  su categoría y dejaría a las cotizaciones apuntando al ítem equivocado. Un ítem retirado
  reserva su código, no se publica y no lleva precio (está en el Excel). Salen en
  `CATALOGO.retirados`, no en `CATALOGO.items`.
- **Las 13 categorías se quitaron de la lista `categorias`**, y de las listas `cats` de
  los seis proveedores. Su contenido editorial sigue en `contenido-categorias.js`, listo.
- **Los 74 proveedores se borraron de `datos-proveedores.js`**: ahí no hay códigos que
  cuidar, y el Excel tiene todo lo que había.
- El modo demostración se apagó.

### Para que un ítem vuelva

1. Registrar su cotización real en `datos-precios.js` (ver «Registrar una cotización»).
2. En `datos-catalogo.js`, quitar `retirado:true` de su línea y poner los tres números
   (referencia, mínimo, máximo); la referencia la recalcula el sitio con la mediana.
3. Si su categoría estaba retirada: devolverla a `categorias`, quitar su redirección de
   `vercel.json` y volver a poner la categoría en los proveedores que la cubren.
4. `node herramientas/generar-categorias.js` y `python3 herramientas/generar-excel.py`.

Los ítems que entran por `importar-catalogos.js` no pasan por esto: llegan con su precio.

---

## Publicar el subdominio

El contenido a publicar es **esta carpeta**, no la raíz del repositorio.

### Vercel

El subdominio necesita **su propio proyecto de Vercel**, separado del sitio principal:
un proyecto sirve una sola carpeta raíz, así que el proyecto de `ingsliberato.com` no
puede servir también este subdominio.

En *Add New → Project*, importar el mismo repositorio y configurar:

| Campo | Valor |
|---|---|
| **Root Directory** | `precios` |
| Framework Preset | Other |
| Build Command | vacío (override) |
| Output Directory | vacío |
| Install Command | vacío |

Después, en *Settings → Domains*, agregar `precios.ingsliberato.com` y crear el registro
DNS que indique Vercel. A partir de ahí, cada push a `main` despliega solo.

El archivo `vercel.json` de esta carpeta ya deja fijado lo importante:

- **`cleanUrls: false`** — es deliberado y no conviene cambiarlo. Con *Clean URLs*
  activado, Vercel redirige `precio-varilla-acero.html` a `precio-varilla-acero`, y como
  los `canonical` y el `sitemap.xml` usan la extensión `.html`, cada URL indexable
  quedaría detrás de un redirect. Si algún día se quieren URLs sin `.html`, hay que
  cambiar también el generador para que canonical y sitemap coincidan.
- **`ignoreCommand`** — cancela el build cuando el commit no tocó esta carpeta, para que
  un cambio en el sitio principal no redespliegue el subdominio.

### Netlify
Conectar el repositorio y configurar:
- **Directorio de publicación:** `precios`
- **Comando de build:** ninguno
- Agregar el dominio personalizado `precios.ingsliberato.com`.

### cPanel / FTP
Crear el subdominio en cPanel apuntando a `public_html/precios/` y subir ahí el
contenido de esta carpeta.

### DNS
Un registro `CNAME` de `precios` hacia el host que sirva el sitio (o `A` hacia la IP
del servidor si es hosting tradicional).

### Si el subdominio cambia de nombre
Hoy todo apunta a `https://precios.ingsliberato.com`. Si termina llamándose distinto,
hay que cambiar la URL en:

- la constante `SITIO` de `herramientas/generar-categorias.js` y volver a correr el
  generador: eso rehace las 41 páginas de categoría, la portada y el `sitemap.xml`;
- las etiquetas `canonical` y `og:url` de `index.html`, `proveedores.html` y
  `metodologia.html`, y el bloque `application/ld+json` de `index.html`, que se
  mantienen a mano;
- `robots.txt`;
- los enlaces del sitio principal (`../index.html`, en la navegación y el pie) y la
  redirección del `vercel.json` de la raíz.

---

## La paleta

Los cinco colores salen del logotipo y están en `:root`, al inicio de
`assets/css/precios.css`, con los mismos nombres que en el dominio principal
(`--verde`, `--marfil`, `--ambar`, `--rojo`, `--ink`). La tabla completa y las
reglas de contraste están en el [README de la raíz](../README.md#colores).

Dos cosas propias del subdominio:

- **La página es clara de arriba abajo.** La franja de servicios, el cierre y el
  pie eran planchas oscuras; ahora son marfil, y el pie cierra con
  `--marfil-hondo`. Los tonos oscuros solo pintan texto y acentos.
- **La rampa de frescura usa el verde de la marca.** Los cuatro tramos de
  «Última actualización» eran un verde esmeralda que no tenía nada que ver con
  el resto; ahora bajan por la escala del verde de marca, del sólido al casi
  blanco:

  | Tramo | Fondo | Texto | Contraste |
  |---|---|---|---|
  | Últimos 7 días | `--verde` | blanco | 6.1:1 |
  | 8–14 días | `--verde-200` | `--verde-900` | 8.9:1 |
  | 15–30 días | `--verde-100` | `--verde-700` | 5.7:1 |
  | Más de 30 días | `--verde-50` | `#67745b` | 4.5:1 |

El contraste de todo el texto se comprueba con
`node herramientas/auditar-contraste.js`, que mide en el navegador en vez de
confiar en la hoja de estilo.

### El logotipo

`assets/img/` lleva tres piezas en SVG y dos rasterizadas:

| Archivo | Para qué |
|---|---|
| `logo.svg` | El bloque horizontal: icono más nombre. Cabecera y pie |
| `isotipo.svg` | Solo el icono. Favicon y usos cuadrados |
| `marca-agua.svg` | El monograma **sin** la plancha verde. Sobre papel, un cuadro lleno se lee como un bloque y no como la marca |
| `og.png` | La vista previa de 1200×630 que piden WhatsApp y las redes, que no aceptan SVG |
| `apple-touch-icon.png` | iOS tampoco acepta SVG para el icono de pantalla de inicio |

El nombre dentro de `logo.svg` va con `textLength` y
`lengthAdjust="spacingAndGlyphs"`: así el bloque mide lo mismo aunque la
máquina que lo abra no tenga Inter instalada.

## Notas técnicas

- **La lista de cotización** se guarda en `localStorage` del visitante, se comparte
  entre páginas y se envía por WhatsApp al `18297939892` o se copia como texto.
- **Los filtros viven en la URL** (`/?cat=MAT-05&etapa=techos`), así que cualquier
  vista se puede compartir o enlazar. Al reescribirla, `app.js` conserva los parámetros
  que no son suyos (`utm_*`, `fbclid`…) y normaliza la ruta a `./`, para que
  `/index.html` no aparezca nunca en la barra de direcciones.
- **Búsqueda sin acentos:** "albanil" encuentra "Albañil".
- **ITBIS:** el interruptor "Ver sin ITBIS" descuenta el 18% solo de los ítems que lo
  traen incluido; nunca se lo suma a la mano de obra, que no lo lleva.
- Responsive de 320 px en adelante, sin desbordamiento horizontal.
- Accesibilidad: enlace de salto, navegación por teclado, `aria-*` en menú, filtros y
  panel lateral, foco visible y respeto a `prefers-reduced-motion`.
- Sin cookies, analítica ni rastreadores.

## Notas de SEO

- Las páginas de categoría son las que persiguen el tráfico de búsqueda; la portada
  (que es el catálogo) funciona como concentrador: la rejilla de categorías y los diez
  destacados que el generador escribe debajo de la tabla son los únicos enlaces y precios
  que un buscador ve en la raíz, porque la tabla se sirve vacía y la pinta `app.js`.
- `/?cat=MAT-05` sigue funcionando para compartir una vista filtrada, pero no está en el
  `sitemap.xml`: la versión indexable de esa categoría es `precio-blocks-prefabricados.html`,
  y todos los enlaces internos apuntan allí.
- **Las 13 páginas de categoría retiradas el 09/09/2026** (`precio-blocks-prefabricados.html`,
  `precio-jornal-mano-de-obra.html`, `precio-hormigon-premezclado.html`…) redirigen a `/`
  con un 308 en `precios/vercel.json`. Estaban en el sitemap y pueden estar indexadas. Cuando
  una categoría vuelva con precios reales, hay que quitar su redirección antes de regenerar,
  porque la regla de Vercel gana al archivo.
- **`/catalogo.html` redirige a `/` con un 308 declarado en `precios/vercel.json`.** El
  catálogo vivió en esa URL, está indexada y hay enlaces externos; Vercel reenvía la
  cadena de consulta, así que `/catalogo.html?cat=MAT-05` cae en `/?cat=MAT-05`. La
  redirección no se quita nunca: Google sigue pidiendo URLs viejas durante años. Ningún
  enlace interno debe apuntar a `catalogo.html` (comprobación:
  `grep -rn 'catalogo\.html' precios herramientas/generar-categorias.js` solo debe dar
  el `vercel.json` y este README).
- Si se cambia el `slug` de una categoría, la URL anterior queda muerta. Al hacerlo hay
  que dejar una redirección 301 en el hosting hacia la nueva.
- No usamos marcado `Product` ni `Offer` en los precios, y es deliberado: no son ofertas
  de venta de un comerciante identificado, sino referencias de mercado. Declararlas como
  ofertas sería incorrecto ante Google y ante quien lee.

---

## Contenido duplicado bajo el dominio principal

El sitio institucional se publica desde la raíz del repositorio, así que esta carpeta
quedaría accesible también en `ingsliberato.com/precios/`. El `vercel.json` de la raíz
redirige esa ruta al subdominio con un 301 permanente, de modo que la URL duplicada no
existe. En un hosting sin esa redirección, los `canonical` de las páginas siguen
resolviendo el problema para los buscadores.

Efecto secundario a tener presente: esa redirección también actúa en los *preview
deployments* del proyecto raíz. Para revisar cambios de este subdominio antes de
publicar hay que usar el preview del proyecto de `precios`, no el de la raíz.
