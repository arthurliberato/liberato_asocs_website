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
```

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

Están al inicio de `assets/css/styles.css`, en `:root`. La paleta sale del
logotipo oficial:

| Token | Valor | Uso |
|---|---|---|
| `--navy` | `#254d76` | Azul del logotipo, botones, títulos |
| `--blue` | `#78a8ff` | Acento, enlaces, íconos |
| `--blue-200` | `#b1d3ff` | Detalles claros |
| `--navy-900` / `--navy-800` | `#0b1f38` / `#0d2440` | Fondos oscuros |

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

### Netlify / Vercel
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
