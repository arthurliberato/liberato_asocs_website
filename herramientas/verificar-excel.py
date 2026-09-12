#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verificar-excel.py — revisa el libro antes de publicarlo.

    python3 herramientas/verificar-excel.py

Lo normal sería abrirlo con LibreOffice y dejar que recalcule todo, pero eso
solo prueba que las fórmulas EVALÚAN, no que apunten a donde uno cree: un
rango corrido una fila da un archivo limpio con los números cambiados. Así que
esto comprueba lo otro, que es lo que de verdad se rompe:

  1. Que toda función usada sea de las que Excel entiende sin prefijo. Nada de
     XLOOKUP ni de fórmulas de matriz derramada, que openpyxl escribe sin la
     metadata que necesitan.
  2. Que cada referencia entre hojas nombre una hoja que existe.
  3. Que las columnas del catálogo estén donde uno cree, en el orden que cree.
  4. Que las dos hojas lleven su banda de marca —con el logotipo dentro y
     sitio para él— y estén congeladas bajo ella, y que todo vaya en Calibri.
  5. Que el mínimo, la mediana y el máximo del comparativo den lo mismo que
     calculados aparte sobre las celdas de proveedor de esa fila.
"""

import re
import statistics
import sys
import zipfile
from pathlib import Path

from openpyxl import load_workbook
from openpyxl.utils import column_index_from_string, get_column_letter

RAIZ = Path(__file__).resolve().parent.parent
# Por defecto revisa el libro publicado, pero acepta una ruta: así se
# puede apuntar a una copia rota a propósito y comprobar que las
# comprobaciones de aquí abajo sirven de algo.
LIBRO = Path(sys.argv[1]) if len(sys.argv) > 1 else (
    RAIZ / "precios" / "descargas" / "precios-construccion-rd.xlsx")

# Las que Excel entiende sin prefijo y LibreOffice también.
PERMITIDAS = {
    "IF", "IFERROR", "INDEX", "MATCH", "MIN", "MAX", "MEDIAN", "COUNT",
    "SUM", "SUMIF", "SUMPRODUCT", "OR", "AND", "NOT", "ISNUMBER", "ROUND",
    # COUNTIF e ISNA son de las primeras versiones de Excel y openpyxl las
    # escribe tal cual. Ojo con las de 2013 en adelante —IFNA, IFS—: esas
    # necesitan el prefijo «_xlfn.» y sin él Excel muestra #NAME?.
    "COUNTIF", "ISNA",
}
PROHIBIDAS = {"XLOOKUP", "XMATCH", "SORT", "FILTER", "UNIQUE", "SEQUENCE", "TEXTJOIN", "LET"}

# Qué tiene que haber en cada columna de la hoja Catálogo. Si esto deja de
# cumplirse, las plantillas traen el dato equivocado sin dar error.
# Los encabezados van en la fila 2: la 1 es la banda de marca.
FILA_TITULOS = 2
# La primera fila de datos: dos de encabezado y a la tercera empiezan.
FILA_1 = 3
FUENTE = "Calibri"
HOJAS = ["Catálogo", "Comparativo", "Artículos", "Selección"]
# Las columnas se piden por su TÍTULO. Estaban clavadas por número y se
# corrían solas: primero al entrar «Gama», después al entrar la casilla
# «Agregar». Un número escrito a mano aquí no da error, trae otra cosa.
def columna_por_titulo(ws, titulo, fila=2):
    """El número de columna cuyo encabezado dice exactamente eso."""
    for c in ws[fila]:
        if c.value == titulo:
            return c.column
    raise SystemExit("No encuentro la columna «%s» en la hoja «%s»." % (titulo, ws.title))
# El precio va pegado al ítem: E, F y G son las tres columnas de precio,
# justo a la derecha del nombre. Si alguna se corre, la fórmula del precio
# sin ITBIS —que las nombra por letra— traería otra cosa sin dar error.
COLUMNAS_CATALOGO = {
    "A": "Código", "D": "Ítem", "E": "Precio de referencia (RD$)",
    "F": "Mínimo (RD$)", "G": "Máximo (RD$)", "H": "Rango (RD$)",
    "I": "Económica (RD$)", "J": "Estándar (RD$)",
    "K": "Alta (RD$)", "L": "Premium (RD$)",
    "M": "Precio sin ITBIS (RD$)", "N": "Incluye ITBIS", "O": "Unidad",
    "Q": "Comercios que cotizaron", "R": "Especificación",
}

# Las cuatro de gama, en orden. Una partida que las publique al revés
# —premium más barata que económica— se lee como un error nuestro.
GAMAS = ["I", "J", "K", "L"]

fallos = []
avisos = []


def falla(msg):
    fallos.append(msg)


def main():
    if not LIBRO.exists():
        print("No existe %s. Corre antes: python3 herramientas/generar-excel.py" % LIBRO)
        sys.exit(1)

    wb = load_workbook(LIBRO)          # fórmulas, sin valores
    hojas = set(wb.sheetnames)
    print("Hojas: " + " · ".join(wb.sheetnames))

    # ---- 1 y 2: funciones y referencias entre hojas -------------------
    funciones = set()
    referencias = set()
    total = 0
    for ws in wb.worksheets:
        for fila in ws.iter_rows():
            for c in fila:
                if not isinstance(c.value, str) or not c.value.startswith("="):
                    continue
                total += 1
                funciones.update(re.findall(r"([A-Z_][A-Z0-9_.]*)\s*\(", c.value))
                referencias.update(re.findall(r"'([^']+)'!", c.value))

    print("Fórmulas: %d · funciones distintas: %s" % (total, ", ".join(sorted(funciones))))
    for f in sorted(funciones - PERMITIDAS):
        falla("función fuera de la lista segura: %s" % f)
    for f in sorted(funciones & PROHIBIDAS):
        falla("función que openpyxl no puede escribir bien: %s" % f)
    for r in sorted(referencias - hojas):
        falla("referencia a una hoja que no existe: %s" % r)

    # ---- 3: las columnas del catálogo están donde uno cree ------------
    if wb.sheetnames != HOJAS:
        falla("el libro debería tener solo %s y tiene %s" % (HOJAS, wb.sheetnames))
    cat = wb["Catálogo"]
    for col, titulo in COLUMNAS_CATALOGO.items():
        real = cat["%s%d" % (col, FILA_TITULOS)].value
        if real != titulo:
            falla("Catálogo!%s%d debería ser «%s» y dice «%s»"
                  % (col, FILA_TITULOS, titulo, real))
    for retirada in ("Alcance", "Alias de mercado", "Estado"):
        fila = [c.value for c in cat[FILA_TITULOS]]
        if retirada in fila:
            falla("la columna «%s» debía salir del catálogo y sigue ahí" % retirada)

    # ---- 3 ter: la referencia por gama va en orden ------------------
    # Se publica solo donde la marca separa de verdad, y con la condición
    # de que las gamas queden ordenadas. Si alguna fila sale al revés, la
    # puerta que lo impide en recalcular() se ha roto.
    cols_g = [column_index_from_string(c) for c in GAMAS]
    con_gama = desordenadas = 0
    for r in range(FILA_TITULOS + 1, cat.max_row + 1):
        v = [cat.cell(row=r, column=c).value for c in cols_g]
        v = [x for x in v if isinstance(x, (int, float))]
        if not v:
            continue
        con_gama += 1
        if len(v) < 2:
            falla("Catálogo fila %d: una sola referencia de gama, sin nada "
                  "con que compararla" % r)
        if any(v[i] <= v[i - 1] for i in range(1, len(v))):
            desordenadas += 1
            if desordenadas <= 3:
                falla("Catálogo fila %d: las gamas salen desordenadas (%s)"
                      % (r, ", ".join("%.0f" % x for x in v)))
    print("Catálogo: %d ítems con referencia por gama" % con_gama)

    filas_cat = cat.max_row
    while filas_cat > FILA_TITULOS and cat.cell(row=filas_cat, column=1).value is None:
        filas_cat -= 1
    print("Catálogo: %d ítems (filas %d a %d)"
          % (filas_cat - FILA_TITULOS, FILA_TITULOS + 1, filas_cat))

    # ---- 3 quater: las notas que explican el libro ------------------
    # Cada hoja lleva en A2 una nota flotante que dice para qué sirve, y
    # la primera lleva la guía entera. Lo que puede romperse callado es
    # el TAMAÑO: la caja se dibuja en píxeles y no crece con el texto, así
    # que una guía más larga saldría recortada sin dar ningún error.
    #
    # Y hay que medirlo en el VML, no con openpyxl: openpyxl escribe el
    # tamaño correctamente pero al releer el archivo devuelve siempre el
    # de por defecto, 144x79. Creerle sería dar por buena una caja que no
    # se ha mirado.
    for hoja in HOJAS:
        if wb[hoja]["A2"].comment is None:
            falla("la hoja «%s» no tiene la nota de A2 que explica para qué sirve" % hoja)

    cajas = []
    with zipfile.ZipFile(LIBRO) as z:
        for nombre in sorted(n for n in z.namelist() if n.endswith(".vml")):
            estilo = re.search(r"width:(\d+)px;height:(\d+)px",
                               z.read(nombre).decode("utf-8", "replace"))
            if estilo:
                cajas.append((int(estilo.group(1)), int(estilo.group(2))))
    if len(cajas) != len(HOJAS):
        falla("hay %d cajas de nota dibujadas y %d hojas" % (len(cajas), len(HOJAS)))
    for ancho, alto in cajas:
        if (ancho, alto) == (144, 79):
            falla("una nota se quedó con la caja por defecto: el texto saldrá recortado")
    # La guía es la más larga y necesita la caja más grande de todas.
    if cajas and max(a for _, a in cajas) < 300:
        falla("la caja mayor mide %d px de alto y la guía necesita más de 300"
              % max(a for _, a in cajas))
    print("Notas: %d hojas explicadas · caja mayor %dx%d px"
          % (len(cajas), max(w for w, _ in cajas), max(h for _, h in cajas)))

    # ---- 3 bis: la hoja de artículos --------------------------------
    # Es el dato crudo, una fila por artículo de tienda. Lo que puede
    # romperse callado aquí es que se quede vacía —si el registro deja de
    # traer el nombre del artículo— o que el precio entre como texto, que
    # es lo que inutiliza una hoja hecha para filtrar y sumar.
    art = wb["Artículos"]
    filas_art = art.max_row
    # Se cuenta por una columna que SIEMPRE trae dato. Antes miraba la
    # primera, y el día que la primera pasó a ser la casilla que el usuario
    # rellena —vacía a propósito— la hoja pareció no tener ni una fila.
    col_cuenta = columna_por_titulo(art, "Categoría")
    while filas_art > FILA_TITULOS and art.cell(row=filas_art, column=col_cuenta).value is None:
        filas_art -= 1
    n_art = filas_art - FILA_TITULOS
    if n_art < 1000:
        falla("la hoja de artículos trae %d filas; deberían ser miles" % n_art)
    sin_nombre = sum(1 for r in range(FILA_TITULOS + 1, filas_art + 1)
                     if not art.cell(row=r, column=3).value)
    if sin_nombre:
        falla("%d artículos sin nombre en la hoja de artículos" % sin_nombre)
    no_numero = [r for r in range(FILA_TITULOS + 1, min(filas_art, FILA_TITULOS + 400) + 1)
                 if not isinstance(art.cell(row=r, column=columna_por_titulo(art, "Precio RD$")).value, (int, float))]
    if no_numero:
        falla("el precio de la hoja de artículos entra como texto en %d filas (ej. fila %d)"
              % (len(no_numero), no_numero[0]))
    print("Artículos: %d artículos de tienda (filas %d a %d)"
          % (n_art, FILA_TITULOS + 1, filas_art))

    # ---- 4: la banda de marca y el congelado --------------------------
    for nombre in HOJAS:
        ws = wb[nombre]
        celda = ws.cell(row=1, column=1)
        v = str(celda.value or "")
        if "Ingenieros Liberato" not in v:
            falla("%s no lleva la banda de marca en la fila 1" % nombre)
        if ws.freeze_panes != "A%d" % (FILA_TITULOS + 1):
            falla("%s debería congelarse en A%d y está en %s"
                  % (nombre, FILA_TITULOS + 1, ws.freeze_panes))
        # El logotipo va incrustado; si falta, la banda queda coja y nadie
        # se entera hasta abrir el archivo.
        if len(ws._images) != 1:
            falla("%s debería llevar el logotipo en la banda y tiene %d imágenes"
                  % (nombre, len(ws._images)))
        # El icono mide 22 px con 5 de margen: la fila tiene que darle sitio.
        alto_px = (ws.row_dimensions[1].height or 0) * 4 / 3
        if alto_px < 27:
            falla("%s: la fila 1 mide %.0f px y el logotipo necesita 27"
                  % (nombre, alto_px))
        # Y la sangría tiene que apartar el texto del icono, o se solapan.
        if (celda.alignment.indent or 0) < 4:
            falla("%s: el texto de la banda se montaría sobre el logotipo "
                  "(sangría %s, hacen falta 4)" % (nombre, celda.alignment.indent))

    # ---- 4b: la tipografía --------------------------------------------
    # Calibri, no Arial: es la que fija el ancho de columna del libro, así
    # que si las celdas van en otra, los anchos dejan de cuadrar.
    normal = wb._named_styles["Normal"].font
    if normal.name != FUENTE:
        falla("La fuente por defecto del libro es %s y debería ser %s"
              % (normal.name, FUENTE))
    distintas = set()
    for nombre in HOJAS:
        ws = wb[nombre]
        for fila in ws.iter_rows(min_row=1, max_row=min(ws.max_row, 60)):
            for c in fila:
                if c.value is not None and c.font and c.font.name:
                    distintas.add(c.font.name)
    intrusas = distintas - {FUENTE}
    if intrusas:
        falla("Hay celdas en %s; el libro va todo en %s"
              % (", ".join(sorted(intrusas)), FUENTE))

    # ---- 5: mínimo, mediana y máximo del comparativo -------------------
    comp = wb["Comparativo"]
    encabezados = [comp.cell(row=FILA_TITULOS, column=i).value for i in range(1, comp.max_column + 1)]
    p1 = 4
    p2 = encabezados.index("Mínimo (RD$)")          # 0-based: la columna anterior es la última de proveedor
    n_prov = p2 - 3
    print("Comparativo: %d proveedores (columnas %s a %s)"
          % (n_prov, get_column_letter(p1), get_column_letter(p2)))

    revisadas = 0
    for f in range(FILA_TITULOS + 1, comp.max_row + 1):
        if not comp.cell(row=f, column=1).value:
            break
        valores = [comp.cell(row=f, column=c).value for c in range(p1, p2 + 1)]
        nums = [v for v in valores if isinstance(v, (int, float))]
        for col, fn in ((p2 + 1, min), (p2 + 2, statistics.median), (p2 + 3, max)):
            formula = comp.cell(row=f, column=col).value or ""
            rango = re.search(r"\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)\)$", formula)
            if not rango:
                falla("Comparativo fila %d: no entiendo la fórmula «%s»" % (f, formula))
                continue
            a, fa, b, fb = rango.group(1), int(rango.group(2)), rango.group(3), int(rango.group(4))
            if (column_index_from_string(a), column_index_from_string(b), fa, fb) != (p1, p2, f, f):
                falla("Comparativo fila %d: la fórmula mira %s%d:%s%d y los proveedores están en %s%d:%s%d"
                      % (f, a, fa, b, fb, get_column_letter(p1), f, get_column_letter(p2), f))
        revisadas += 1
        if not nums:
            falla("Comparativo fila %d: sin ningún precio, no debería estar en esta hoja" % f)

    print("Comparativo: %d filas revisadas" % revisadas)

    # ---- los enlaces entre hojas apuntan a donde dicen -----------------
    #
    # El ítem del catálogo lleva al bloque de sus artículos, y el artículo
    # vuelve a la fila de su ítem. Un enlace que apunta a un rango
    # equivocado es peor que no tener enlace: enseña los artículos de otra
    # partida y quien los mira no tiene cómo saberlo.
    #
    # Se comprueban tres cosas: que el destino sea interno (con «location»
    # y sin destino externo), que el rango caiga dentro de la hoja, y que
    # todas sus filas sean del mismo ítem que la fila de origen. Y que los
    # rangos no se pisen entre sí, que es como se vería un bloque mal
    # cortado.
    art = wb["Artículos"]
    # Las columnas se buscan por su TÍTULO, no por un número escrito a
    # mano. Estaban clavadas en 4 y 2, y el día que la hoja «Artículos»
    # ganó una columna delante el verificador acusó a 2.354 enlaces de
    # apuntar al ítem equivocado. El fallo era suyo.
    col_item_cat = columna_por_titulo(cat, "Ítem")
    col_item_art = columna_por_titulo(art, "Ítem del catálogo")
    cubiertas, enlazadas, solapes = {}, 0, 0
    for f in range(FILA_1, cat.max_row + 1):
        c = cat.cell(row=f, column=col_item_cat)
        if not c.hyperlink:
            continue
        enlazadas += 1
        if c.hyperlink.target:
            falla("Catálogo fila %d: el enlace al bloque de artículos sale del libro" % f)
            continue
        destino = (c.hyperlink.location or "")
        m = re.match(r"^'Artículos'!A(\d+):[A-Z]+(\d+)$", destino)
        if not m:
            falla("Catálogo fila %d: el enlace dice «%s» y no es un rango de Artículos"
                  % (f, destino))
            continue
        ini, fin = int(m.group(1)), int(m.group(2))
        if ini < FILA_1 or fin > art.max_row or fin < ini:
            falla("Catálogo fila %d: el enlace señala %d:%d y la hoja llega a %d"
                  % (f, ini, fin, art.max_row))
            continue
        nombre = c.value
        for k in range(ini, fin + 1):
            if art.cell(row=k, column=col_item_art).value != nombre:
                falla("Catálogo fila %d («%s»): el rango %d:%d incluye la fila %d, "
                      "que es de otro ítem" % (f, nombre, ini, fin, k))
                break
            if k in cubiertas:
                solapes += 1
            cubiertas[k] = f
    if solapes:
        falla("hay %d filas de Artículos señaladas por dos ítems del catálogo" % solapes)

    vuelta = sum(1 for f in range(FILA_1, art.max_row + 1)
                 if art.cell(row=f, column=col_item_art).hyperlink)
    for f in range(FILA_1, art.max_row + 1):
        h = art.cell(row=f, column=col_item_art).hyperlink
        if not h:
            continue
        m = re.match(r"^'Catálogo'!A(\d+)$", h.location or "")
        if not m or not (FILA_1 <= int(m.group(1)) <= cat.max_row):
            falla("Artículos fila %d: el enlace de vuelta dice «%s»" % (f, h.location))
            break
        if cat.cell(row=int(m.group(1)), column=col_item_cat).value != \
                art.cell(row=f, column=col_item_art).value:
            falla("Artículos fila %d: el enlace de vuelta lleva a otro ítem" % f)
            break

    print("Enlaces: %d ítems llevan a sus artículos (%d filas) · %d artículos vuelven"
          % (enlazadas, len(cubiertas), vuelta))

    # ---- Informe ------------------------------------------------------
    print("")
    if avisos:
        print("Avisos (%d):" % len(avisos))
        for a in avisos:
            print("  · " + a)
        print("")
    if fallos:
        print("FALLOS (%d):" % len(fallos))
        for x in fallos:
            print("  ✗ " + x)
        sys.exit(1)
    print("Sin fallos. El libro está listo para publicar.")


if __name__ == "__main__":
    main()
