# Ingenieros Liberato &amp; Asociados — sitio web

Sitio institucional de **Ingenieros Liberato & Asociados** (construcción, diseño y
supervisión de obras, República Dominicana).

Es un sitio **estático**: HTML, CSS y JavaScript sin dependencias ni paso de compilación.
Se abre con doble clic y se publica subiendo la carpeta a cualquier hosting.

---

## Estructura

```
index.html              Página única con todas las secciones
assets/
  css/styles.css        Estilos y tokens de diseño
  js/main.js            Portafolio, filtros, menú móvil, formulario
  img/
    logo.png            Logotipo completo (fondos claros)
    logo-oscuro.png     Logotipo completo (fondos oscuros)
    isotipo.png         Solo la marca — favicon y filigranas
robots.txt
sitemap.xml
precios/                Subdominio precios.ingsliberato.com (ver precios/README.md)
herramientas/           Generador de las páginas de categoría (no se publica)
vercel.json             Configuración de despliegue del sitio institucional
```

El repositorio contiene **dos sitios** que se publican por separado:

| Sitio | Carpeta a publicar | Dominio |
|---|---|---|
| Sitio institucional | raíz del repositorio | `ingsliberato.com` |
| Base de precios de construcción | `precios/` | `precios.ingsliberato.com` |

La carpeta `precios/` es autocontenida (tiene sus propios `assets/`, `robots.txt` y
`sitemap.xml`), así que se apunta el subdominio directamente a ella. Sus instrucciones
de edición y despliegue están en [`precios/README.md`](precios/README.md).

Las 27 páginas de categoría del subdominio se generan con
`node herramientas/generar-categorias.js`; la carpeta `herramientas/` es solo de
construcción y no forma parte de ninguno de los dos sitios publicados.

Las imágenes del logotipo se extrajeron del portafolio original en PDF y se les
quitó el fondo blanco.

---

## Ver el sitio localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

(Abrir `index.html` directamente también funciona.)

---

## Cómo editar el contenido

### Agregar o modificar proyectos

Todos los proyectos viven en el arreglo `PROJECTS`, al inicio de
`assets/js/main.js`. Agregar una obra es agregar un objeto:

```js
{
  name: 'Nombre del proyecto',
  loc:  'Sector, Provincia',
  desc: 'Una línea describiendo la obra.',
  cat:  ['residencial', 'turistica'],   // una o varias categorías
  icon: 'edificio'
}
```

- **`cat`** — `residencial`, `comercial`, `turistica`, `publica`.
  Un proyecto puede llevar varias; aparecerá en cada filtro correspondiente.
- **`icon`** — `vivienda`, `edificio`, `salud`, `comercio`, `educacion`,
  `patrimonio`, `vial`, `deporte`.

Los filtros, la numeración y las etiquetas se generan solos.

### Cambiar datos de contacto

Aparecen en tres lugares de `index.html`: el bloque `<script type="application/ld+json">`
del `<head>`, la sección `#contacto` y el pie de página. El número de WhatsApp
(`18297939892`) está en los dos enlaces `wa.me`.

### Colores

Están al inicio de `assets/css/styles.css`, en `:root`, y la misma tabla se
repite en `precios/assets/css/precios.css`. Los cinco colores salen del
logotipo:

| Token | Valor | De dónde sale | Uso |
|---|---|---|---|
| `--verde` | `#3f6e22` | Fondo del icono, ampersand del nombre | Botones, estados activos, enlaces, filetes |
| `--marfil` | `#f2efe2` | Barra vertical de la i y la L, papelería | Fondo de las bandas: cabecera, franja, cierre |
| `--ambar` | `#e89019` | Brazo horizontal de la L | Acento: subrayados, iconos, separadores |
| `--rojo` | `#de3b22` | Barra superior, el punto de la i | Alertas y errores de formulario |
| `--ink` | `#1b1e17` | El nombre sobre fondo claro | Todo el texto corriente |

**La página es clara de arriba abajo.** Los tonos oscuros solo pintan texto y
acentos; no hay planchas de fondo. Donde antes había un degradado oscuro —el
hero, las «secciones oscuras», el cierre, el pie, la ficha del fundador— ahora
hay papel, y el peso lo lleva la tinta. El marfil se va templando hacia abajo
(`--marfil` en el cierre, `--marfil-hondo` en el pie) para que la página cierre
sin necesidad de oscurecerse.

#### Lo que el contraste obliga

Dos colores de la marca **no sirven de texto** tal como son, y eso está medido,
no supuesto:

- **Ámbar sobre blanco da 2.5:1.** Rellena y subraya, pero el texto ámbar usa
  `--ambar-700` (`#8a5309`, 7.5:1) y los titulares `--ambar-600` (`#c37813`,
  3.5:1, que es el mínimo de texto grande).
- **Rojo sobre blanco da 4.4:1**, justo por debajo del mínimo. El texto rojo usa
  `--rojo-700` (`#a32b16`, 7.2:1).

El verde de marca sí llega solo (6.1:1 sobre blanco, 5.3:1 sobre marfil).

`--ink-mute` y `--verde-500` se oscurecieron respecto de su primer valor porque
el barrido del navegador los encontró en 4.1 y 3.9 sobre blanco: el peor fondo
que tienen que aguantar es el `--marfil-hondo` del pie.

### Tipografía

| Dónde | Fuente |
|---|---|
| El nombre dentro del logotipo | **Archivo SemiBold (600)**, ya convertido a trazos |
| Títulos del sitio | Jost |
| Texto corrido | Inter |

El logotipo no depende de que Archivo esté instalada porque el nombre va en
contornos; el sitio no la carga. Si en algún momento se quiere alinear la
tipografía del sitio con la de la marca, el cambio es sustituir Jost por
Archivo en el `<link>` de Google Fonts y en la pila de `h1..h4`: es una
decisión de diseño, no un arreglo, y por eso está sin hacer.

#### Cómo se comprueba

`herramientas/auditar-contraste.js` abre cada página, fuerza visibles los
elementos con animación de entrada y mide el contraste real de todo el texto,
buscando el fondo opaco más cercano en el árbol. Da 4.5:1 de mínimo, o 3:1
cuando el texto es grande:

```bash
python3 -m http.server 8123 &
node herramientas/auditar-contraste.js
```

---

## Formulario de contacto

Hoy el formulario **no usa servidor**: valida los campos y abre el cliente de
correo del visitante con el mensaje ya redactado hacia `arthur@ingsliberato.com`.
Funciona en cualquier hosting, pero depende de que la persona tenga un cliente de
correo configurado.

Para recibir los mensajes directamente por correo sin esa dependencia, se puede
conectar un servicio de formularios (Formspree, Web3Forms, Netlify Forms). Con
Formspree, por ejemplo:

1. Crear un formulario en formspree.io y copiar el ID.
2. En `index.html`, poner el destino en la etiqueta del formulario:
   ```html
   <form class="contact-form" id="contact-form" method="POST"
         action="https://formspree.io/f/TU_ID">
   ```
3. En `assets/js/main.js`, dentro del `submit`, quitar el bloque que arma el
   `mailto:` y reemplazar `e.preventDefault()` por un envío normal una vez que la
   validación pasa.

---

## Publicar

### GitHub Pages
En el repositorio: **Settings → Pages → Source: Deploy from a branch**, elegir la
rama y la carpeta `/ (root)`.

### Vercel
Conectar el repositorio. No hay comando de build y el directorio de publicación es la
raíz. Cada push a `main` despliega solo.

**Los dos sitios son dos proyectos de Vercel distintos** sobre el mismo repositorio: uno
con *Root Directory* en la raíz (este sitio) y otro con *Root Directory* en `precios`
(el subdominio). Un proyecto sirve una sola carpeta, por eso no basta con uno.

El `vercel.json` de la raíz hace dos cosas:

- Redirige `ingsliberato.com/precios/*` a `precios.ingsliberato.com/*` con un 301, para
  que la carpeta del subdominio no quede duplicada bajo el dominio principal.
- Cancela el build cuando el commit solo tocó `precios/` o `herramientas/`, para no
  redesplegar este sitio por un cambio que no le afecta.

### Netlify
Arrastrar la carpeta, o conectar el repositorio. No hay comando de build:
directorio de publicación = raíz del proyecto.

### Hosting tradicional (cPanel, FTP)
Subir el contenido de la carpeta a `public_html/`.

Después de publicar en el dominio definitivo, actualizar la URL en `robots.txt`,
`sitemap.xml`, y en las etiquetas `canonical` / `og:*` de `index.html`
(hoy apuntan a `https://ingsliberato.com/`).

---

## Notas técnicas

- Responsive de 320 px en adelante; sin desbordamiento horizontal.
- Accesibilidad: enlace de salto al contenido, navegación por teclado, `aria-*`
  en menú y filtros, foco visible, y respeto a `prefers-reduced-motion`.
- SEO: metadatos Open Graph, datos estructurados `GeneralContractor` en JSON-LD,
  `sitemap.xml` y `robots.txt`.
- Tipografías Jost e Inter desde Google Fonts, con alternativas del sistema si no
  cargan.
- Sin cookies, analítica ni rastreadores.
