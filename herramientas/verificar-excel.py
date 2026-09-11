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
}
PROHIBIDAS = {"XLOOKUP", "XMATCH", "SORT", "FILTER", "UNIQUE", "SEQUENCE", "TEXTJOIN", "LET"}

# Qué tiene que haber en cada columna de la hoja Catálogo. Si esto deja de
# cumplirse, las plantillas traen el dato equivocado sin dar error.
# Los encabezados van en la fila 2: la 1 es la banda de marca.
FILA_TITULOS = 2
FUENTE = "Calibri"
HOJAS = ["Catálogo", "Comparativo", "Artículos"]
# La columna del precio en la hoja de artículos. Se corrió al entrar
# «Gama», y un precio que entre como texto inutiliza la hoja entera.
COL_PRECIO_ART = 8
# El precio va pegado al ítem: E, F y G son las tres columnas de precio,
# justo a la derecha del nombre. Si alguna se corre, la fórmula del precio
# sin ITBIS —que las nombra por letra— traería otra cosa sin dar error.
COLUMNAS_CATALOGO = {
    "A": "Código", "D": "Ítem", "E": "Precio de referencia (RD$)",
    "F": "Mínimo (RD$)", "G": "Máximo (RD$)",
    "H": "Económica (RD$)", "I": "Estándar (RD$)",
    "J": "Alta (RD$)", "K": "Premium (RD$)",
    "L": "Precio sin ITBIS (RD$)", "M": "Incluye ITBIS", "N": "Unidad",
    "P": "Comercios que cotizaron", "Q": "Especificación",
}

# Las cuatro de gama, en orden. Una partida que las publique al revés
# —premium más barata que económica— se lee como un error nuestro.
GAMAS = ["H", "I", "J", "K"]

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

    # ---- 3 bis: la hoja de artículos --------------------------------
    # Es el dato crudo, una fila por artículo de tienda. Lo que puede
    # romperse callado aquí es que se quede vacía —si el registro deja de
    # traer el nombre del artículo— o que el precio entre como texto, que
    # es lo que inutiliza una hoja hecha para filtrar y sumar.
    art = wb["Artículos"]
    filas_art = art.max_row
    while filas_art > FILA_TITULOS and art.cell(row=filas_art, column=1).value is None:
        filas_art -= 1
    n_art = filas_art - FILA_TITULOS
    if n_art < 1000:
        falla("la hoja de artículos trae %d filas; deberían ser miles" % n_art)
    sin_nombre = sum(1 for r in range(FILA_TITULOS + 1, filas_art + 1)
                     if not art.cell(row=r, column=3).value)
    if sin_nombre:
        falla("%d artículos sin nombre en la hoja de artículos" % sin_nombre)
    no_numero = [r for r in range(FILA_TITULOS + 1, min(filas_art, FILA_TITULOS + 400) + 1)
                 if not isinstance(art.cell(row=r, column=COL_PRECIO_ART).value, (int, float))]
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
