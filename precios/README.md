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
  index.html              Portada: buscador, categorías, precios destacados, canal de venta
  catalogo.html           Catálogo completo con buscador, filtros y lista de cotización
  proveedores.html        Directorio de proveedores filtrable
  metodologia.html        Cómo se arman los precios, conversiones y preguntas frecuentes
  precio-*.html           32 páginas estáticas, una por categoría   ← GENERADAS
  costo-licencias-…html
  assets/
    css/precios.css       Estilos (misma paleta del logotipo)
    js/
      datos-catalogo.js   Taxonomía e ítems con su precio de referencia
      datos-proveedores.js Directorio de proveedores
      datos-precios.js    Cotizaciones por proveedor            ← se edita a menudo
      datos-demo.js       Datos ficticios de demostración       ← temporal, se apaga
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

## Las 32 páginas de categoría (generadas)

Cada categoría del catálogo tiene su propia página estática, con URL orientada a
búsqueda (`precio-cemento-morteros-aditivos.html`, `precio-varilla-acero.html`,
`precio-jornal-mano-de-obra.html`…). Son las páginas pensadas para recibir el tráfico
de Google: traen la tabla de precios ya escrita en el HTML, texto propio de unas 1,300
palabras, preguntas frecuentes con marcado `FAQPage`, migas de pan con `BreadcrumbList`
y los proveedores de esa categoría.

**Estas páginas no se editan a mano: se generan.** Cualquier cambio manual se pierde en
la siguiente corrida.

```bash
node herramientas/generar-categorias.js     # desde la raíz del repositorio
```

El generador:

1. escribe los 27 HTML en `precios/`;
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
  estado: 'estimado'       // estimado | verificado | tarifario
});
```

Los tres números son **precio de referencia, mínimo y máximo**. El código
(`MAT-04-002`) se genera solo, correlativo dentro de la categoría.

### Cuando entre una cotización real

Actualizar los tres números y cambiar el ítem a estado verificado:

```js
{ …, estado: 'verificado', fuente: 'Cotización Ferretería X, 12/09/2026', fecha: '2026-09' }
```

La interfaz cambia sola la etiqueta de *Estimado* a *Verificado*: no hay que tocar
nada más. Un ítem sin monto (permisos, licencias) va con `null, null, null` y
`estado: 'tarifario'`.

### Estado actual de los datos

El catálogo tiene **581 ítems**. De ellos, **287 ya llevan un precio real** de un comercio
que lo publica; 288 siguen siendo estimaciones de arranque y 6 van según tarifario oficial
y no llevan precio. El sitio distingue los tres estados de forma visible en todas las
páginas.

Sustituir las estimaciones que quedan por cotizaciones reales es el trabajo pendiente más
importante, y es la condición de lanzamiento (ver más abajo). Para eso están las dos
herramientas de recolección por tandas y el importador de catálogos de proveedor.

### Frecuencia de actualización sugerida

| Rubro | Cada cuánto |
|---|---|
| Varilla, cemento, cables de cobre, madera | 15–30 días |
| Terminaciones, equipos, herramientas | Trimestral |

---

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

**El sitio se publica cuando cada ítem tenga al menos un precio real.** Mientras tanto los
montos son estimaciones nuestras y el sitio lo dice en todas las páginas.

Conviene tenerlo presente al agregar ítems a mano: cada ítem nuevo es un precio más que
levantar. La excepción son los que entran por `importar-ochoa.js`, que llegan con su
cotización real puesta: esos suman al catálogo sin alejar el lanzamiento.

### Cómo va la cobertura

Cualquiera de las dos herramientas de abajo la imprime al final. La más corta:

```bash
node herramientas/generar-lote-precios.js 0
```

Al 09/09/2026: **287 de 575 ítems con precio real**. Los otros 6 del catálogo van según
tarifario oficial y no llevan precio por definición, así que no cuentan.

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
| Estado | Pasa de *Estimado* a *Verificado* |
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

**329 cotizaciones reales cargadas · 287 ítems verificados de 575.**

Tres tandas, todas de precios que los propios comercios publican:

- **08/09/2026** — 9 cotizaciones de Ferremix, Ochoa e InnovaCentro, levantadas a mano.
- **09/09/2026** — extracción completa del catálogo de construcción de Ochoa: 398
  artículos, 349 con precio. De ahí salieron 8 cotizaciones sobre ítems que ya existían
  y **273 ítems nuevos que nacieron verificados**, con su precio real en lugar de una
  estimación nuestra.

Los 288 ítems restantes siguen siendo estimaciones nuestras.

Cinco categorías nuevas salieron enteras de esa extracción y llegaron verificadas desde
el primer día:

| | Categoría | Ítems |
|---|---|---|
| `MAT-19` | Perfiles y tubos de acero | 46 |
| `MAT-20` | Angulares, planchuelas y barras | 62 |
| `MAT-21` | Tolas y láminas de acero | 29 |
| `MAT-22` | Cerramiento perimetral | 41 |
| `MAT-23` | Perfilería de aluminio | 24 |

El resto se repartió en categorías que ya existían: separadores y couplers de varilla en
`MAT-04`, zinc de techo en `MAT-07`, polvo de color para mosaico en `MAT-08`, agregados
ensacados en `MAT-01` y presentaciones menudas de cemento y yeso en `MAT-02`.

## Importar el catálogo de un proveedor

```bash
node herramientas/importar-ochoa.js              # revisar, sin escribir
node herramientas/importar-ochoa.js --escribir   # aplicar
node herramientas/generar-categorias.js          # rehacer las páginas
```

La fuente es `herramientas/datos-externos/ochoa-AAAA-MM-DD.json`, la extracción del
catálogo tal como la publica el comercio. **Queda versionada en el repositorio** para que
cualquiera pueda repetir la importación y ver de dónde salió cada número.

La herramienta escribe entre marcadores: `ochoa:items` en `datos-catalogo.js` y
`ochoa:cotizaciones` en `datos-precios.js`. Todo lo que hay entre ellos se reescribe
entero en cada corrida, así que no se edita a mano. Correrla dos veces seguidas deja los
archivos idénticos.

### Cómo decide qué entra

**1. `MAPEO`** — artículos que corresponden a un ítem que ya existe. Se declaran a mano,
uno por uno. No hay emparejamiento automático por parecido de texto: lo probamos y casó
«Funda De Arena 55 Libras» con «Viaje de arena, 16 m³».

**2. `REGLAS`** — familias completas donde la ficha del comercio declara la medida
exacta. De cada artículo sale un ítem nuevo del catálogo, ya verificado.

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

**Los tubos de PVC vienen en 19 pies, no en 20.** Ochoa vende el SDR-41 de 4" y de 2" en
presentación de 19 pies y factura por pies con un mínimo de 19, que equivale a una unidad.
La ficha de nuestros ítems `MAT-09-001` y `MAT-09-002` dice 20 pies. Es probable que el
error sea nuestro —19 pies es la presentación comercial habitual del PVC sanitario en el
país—, pero no se cambia la especificación del catálogo con la evidencia de un solo
comercio. Mientras tanto las cotizaciones se registran con `unidad: 'tubo de 19 pies'`, de
modo que el sitio las muestra y explica por qué no promedian.

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

## Filtro «Mis proveedores»

Un visitante que ya trabaja con ciertos proveedores puede seleccionarlos y ver los precios
calculados **solo con las cotizaciones de ellos**. Se selecciona de dos formas:

- desde el botón **Mis proveedores** de la barra de herramientas, que abre un panel con
  buscador y casillas;
- desde el directorio, con el botón **Trabajar solo con este** de cada tarjeta.

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
no está en el HTML de las 31 páginas. Es una función puramente interactiva que no necesita
estar en el HTML para los buscadores, y así no hay que regenerar el sitio para tocarla.

Las páginas de categoría traen la ficha de cada ítem escrita en el HTML —eso sí lo ve un
buscador—, pero al abrirla se regenera desde los datos para reflejar el filtro y el
interruptor de ITBIS del momento.

## Modo demostración (temporal)

`assets/js/datos-demo.js` carga **8 proveedores y 31 cotizaciones ficticias** sobre 14
ítems, para poder ver el sitio funcionando como funcionará cuando haya cotizaciones
reales: la ficha por proveedor llena, el recálculo de la referencia, la normalización de
ITBIS y el copiado a Excel con varias filas.

**Nada de eso es real.** Todos los proveedores llevan `(demo)` en el nombre y una etiqueta
morada, hay una barra de aviso en todas las páginas, y los ítems afectados quedan marcados
como **Demostración**, nunca como *Verificado*: un dato inventado no se presenta como
comprobado.

Los proveedores ficticios **no aparecen** en el directorio ni en los contadores de la
portada, que siguen mostrando las 79 empresas reales.

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
  generador: eso rehace las 32 páginas de categoría, la portada y el `sitemap.xml`;
- las etiquetas `canonical` y `og:url` de `catalogo.html`, `proveedores.html` y
  `metodologia.html`, y el bloque `application/ld+json` de `index.html`, que se
  mantienen a mano;
- `robots.txt`;
- los enlaces del sitio principal (`../index.html`, en la navegación y el pie) y la
  redirección del `vercel.json` de la raíz.

---

## Notas técnicas

- **La lista de cotización** se guarda en `localStorage` del visitante, se comparte
  entre páginas y se envía por WhatsApp al `18297939892` o se copia como texto.
- **Los filtros viven en la URL** (`catalogo.html?cat=MAT-05&etapa=techos`), así que
  cualquier vista se puede compartir o enlazar.
- **Búsqueda sin acentos:** "albanil" encuentra "Albañil".
- **ITBIS:** el interruptor "Ver sin ITBIS" descuenta el 18% solo de los ítems que lo
  traen incluido; nunca se lo suma a la mano de obra, que no lo lleva.
- Responsive de 320 px en adelante, sin desbordamiento horizontal.
- Accesibilidad: enlace de salto, navegación por teclado, `aria-*` en menú, filtros y
  panel lateral, foco visible y respeto a `prefers-reduced-motion`.
- Sin cookies, analítica ni rastreadores.

## Notas de SEO

- Las 32 páginas de categoría son las que persiguen el tráfico de búsqueda; la portada y
  el catálogo interactivo funcionan como concentradores.
- `catalogo.html?cat=MAT-05` sigue funcionando para compartir una vista filtrada, pero
  ya no está en el `sitemap.xml`: la versión indexable de esa categoría es
  `precio-blocks-prefabricados.html`, y todos los enlaces internos apuntan allí.
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
