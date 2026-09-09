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
  3. Que las columnas que buscan las plantillas sean las que uno cree. Es el
     error caro: si la hoja Catálogo cambia de orden de columnas, la fórmula
     sigue evaluando y trae el dato equivocado.
  4. Que los rangos cubran exactamente las filas con datos, sin sobrar ni faltar.
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
COLUMNAS_CATALOGO = {
    "A": "Código", "D": "Ítem", "E": "Especificación", "H": "Unidad",
    "I": "Etapa de obra", "N": "Precio de referencia (RD$)", "Q": "Incluye ITBIS",
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

    # ---- 3: las columnas del catálogo son las que creen las plantillas ----
    cat = wb["Catálogo"]
    for col, titulo in COLUMNAS_CATALOGO.items():
        real = cat["%s1" % col].value
        if real != titulo:
            falla("Catálogo!%s1 debería ser «%s» y dice «%s»" % (col, titulo, real))

    filas_cat = cat.max_row
    while filas_cat > 1 and cat.cell(row=filas_cat, column=1).value is None:
        filas_cat -= 1
    print("Catálogo: %d ítems (filas 2 a %d)" % (filas_cat - 1, filas_cat))

    # ---- 4: los rangos de las plantillas cubren justo esas filas -------
    for hoja in ("Presupuesto", "Solicitud de cotización"):
        ws = wb[hoja]
        rangos = set()
        for fila in ws.iter_rows():
            for c in fila:
                if isinstance(c.value, str) and "Catálogo" in c.value:
                    rangos.update(re.findall(r"'Catálogo'!\$([A-Z]+)\$(\d+):\$[A-Z]+\$(\d+)", c.value))
        if not rangos:
            falla("%s no busca nada en el catálogo" % hoja)
        for col, desde, hasta in sorted(rangos):
            if int(desde) != 2 or int(hasta) != filas_cat:
                falla("%s busca en Catálogo!%s%s:%s%s y el catálogo va de 2 a %d"
                      % (hoja, col, desde, col, hasta, filas_cat))
            if col not in COLUMNAS_CATALOGO:
                avisos.append("%s busca en la columna %s del catálogo, que no está verificada"
                              % (hoja, col))

    # ---- Resumen por etapa: que sume el rango real del presupuesto ----
    presu = wb["Presupuesto"]
    primera = None
    ultima = None
    for f in range(1, presu.max_row + 1):
        v = presu.cell(row=f, column=7).value
        if isinstance(v, str) and v.startswith("=IF(OR($E"):
            primera = primera or f
            ultima = f
    res = wb["Resumen por etapa"]
    ref = res["B5"].value or ""
    m = re.search(r"\$D\$(\d+):\$D\$(\d+)", ref)
    if not m:
        falla("Resumen por etapa no suma sobre el presupuesto")
    elif (int(m.group(1)), int(m.group(2))) != (primera, ultima):
        falla("Resumen por etapa suma D%s:D%s y el presupuesto va de %d a %d"
              % (m.group(1), m.group(2), primera, ultima))
    else:
        print("Presupuesto: filas %d a %d, y el resumen suma justo ese rango" % (primera, ultima))

    # ---- Que las etapas del resumen existan en el catálogo ------------
    etapas_cat = {cat.cell(row=f, column=9).value for f in range(2, filas_cat + 1)}
    f = 5
    sin_uso = []
    while res.cell(row=f, column=1).value and res.cell(row=f, column=1).value != "Costo directo":
        e = res.cell(row=f, column=1).value
        if e not in etapas_cat:
            sin_uso.append(e)
        f += 1
    if sin_uso:
        avisos.append("etapas del resumen que ningún ítem usa: " + ", ".join(sin_uso))

    # ---- 5: mínimo, mediana y máximo del comparativo -------------------
    comp = wb["Comparativo"]
    encabezados = [comp.cell(row=1, column=i).value for i in range(1, comp.max_column + 1)]
    p1 = 4
    p2 = encabezados.index("Mínimo (RD$)")          # 0-based: la columna anterior es la última de proveedor
    n_prov = p2 - 3
    print("Comparativo: %d proveedores (columnas %s a %s)"
          % (n_prov, get_column_letter(p1), get_column_letter(p2)))

    revisadas = 0
    for f in range(2, comp.max_row + 1):
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
