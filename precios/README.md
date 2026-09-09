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
  precio-*.html           27 páginas estáticas, una por categoría   ← GENERADAS
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

## Las 27 páginas de categoría (generadas)

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

**Los 253 ítems están cargados como `estimado`.** Son estimaciones de arranque para
poder publicar el sitio; ninguna proviene todavía de una cotización formal, y el sitio
lo dice de forma visible en todas las páginas. Sustituirlos por cotizaciones reales
es el trabajo pendiente más importante.

Arranque recomendado: los **100–150 ítems de alta rotación** (obra gris más
instalaciones básicas) y expandir por categoría según la demanda que muestren las
búsquedas.

### Frecuencia de actualización sugerida

| Rubro | Cada cuánto |
|---|---|
| Varilla, cemento, cables de cobre, madera | 15–30 días |
| Terminaciones, equipos, herramientas | Trimestral |

---

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

**9 cotizaciones reales cargadas**, de tres comercios, tomadas de los precios que ellos
mismos publican en sus tiendas en línea el 08/09/2026: Ferremix, Ferretería Ochoa e
InnovaCentro. Siete ítems pasaron de *Estimado* a **Verificado**; los otros dos son tubos
de PVC que quedan fuera del cálculo por una diferencia de presentación (ver abajo). Los
244 ítems restantes siguen siendo estimaciones nuestras.

Nunca se inventa un precio para atribuírselo a una empresa real: cada cotización tiene su
fuente y su fecha, y lo que no se pudo verificar simplemente no se carga.

### El ITBIS de esta primera tanda

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
  generador: eso rehace las 27 páginas de categoría, la portada y el `sitemap.xml`;
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

- Las 27 páginas de categoría son las que persiguen el tráfico de búsqueda; la portada y
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
