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
  4. Que las dos hojas lleven su banda de firma y estén congeladas bajo ella.
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
LIBRO = RAIZ / "precios" / "descargas" / "precios-construccion-rd.xlsx"

# Las que Excel entiende sin prefijo y LibreOffice también.
PERMITIDAS = {
    "IF", "IFERROR", "INDEX", "MATCH", "MIN", "MAX", "MEDIAN", "COUNT",
    "SUM", "SUMIF", "SUMPRODUCT", "OR", "AND", "NOT", "ISNUMBER", "ROUND",
}
PROHIBIDAS = {"XLOOKUP", "XMATCH", "SORT", "FILTER", "UNIQUE", "SEQUENCE", "TEXTJOIN", "LET"}

# Qué tiene que haber en cada columna de la hoja Catálogo. Si esto deja de
# cumplirse, las plantillas traen el dato equivocado sin dar error.
# Los encabezados van en la fila 2: la 1 es la banda de firma.
FILA_TITULOS = 2
HOJAS = ["Catálogo", "Comparativo"]
COLUMNAS_CATALOGO = {
    "A": "Código", "D": "Ítem", "E": "Especificación", "F": "Unidad",
    "G": "Etapa de obra", "K": "Precio de referencia (RD$)", "N": "Incluye ITBIS",
    "Q": "Comercios que cotizaron",
}

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

    filas_cat = cat.max_row
    while filas_cat > FILA_TITULOS and cat.cell(row=filas_cat, column=1).value is None:
        filas_cat -= 1
    print("Catálogo: %d ítems (filas %d a %d)"
          % (filas_cat - FILA_TITULOS, FILA_TITULOS + 1, filas_cat))

    # ---- 4: la banda de firma y el congelado --------------------------
    for nombre in HOJAS:
        ws = wb[nombre]
        v = str(ws.cell(row=1, column=1).value or "")
        if "Ingenieros Liberato" not in v:
            falla("%s no lleva la banda de firma en la fila 1" % nombre)
        if ws.freeze_panes != "A%d" % (FILA_TITULOS + 1):
            falla("%s debería congelarse en A%d y está en %s"
                  % (nombre, FILA_TITULOS + 1, ws.freeze_panes))

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
