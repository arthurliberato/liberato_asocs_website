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
      datos-catalogo.js   Taxonomía e ítems con sus precios      ← se edita a menudo
      datos-proveedores.js Directorio de proveedores             ← se edita a menudo
      app.js              Buscador, filtros y lista de cotización
    img/                  Logotipos (copia de los del sitio principal)
  robots.txt
  sitemap.xml
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

### Netlify / Vercel
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

### Después de publicar
Ya todo apunta a `https://precios.ingsliberato.com`. Si el subdominio termina
llamándose distinto, hay que cambiar la URL en:
- las etiquetas `canonical` y `og:url` de las cuatro páginas
- el bloque `application/ld+json` de `index.html`
- `robots.txt` y `sitemap.xml`
- los enlaces del sitio principal (`../index.html`, en la navegación y el pie)

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
