#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generar-excel.py — arma el libro de Excel que se descarga del sitio.

    python3 herramientas/generar-excel.py

Lee el modelo de datos llamando a herramientas/datos-para-excel.js, que es
quien conoce el catálogo, y escribe precios/descargas/precios-construccion-rd.xlsx.
El modelo vive en JavaScript porque es el que lee el sitio; aquí no se
duplica nada, solo se le da forma de libro.

LAS DOS HOJAS

  Catálogo      Todos los ítems con sus campos. Es la hoja de datos contra
                la que busca la otra.
  Comparativo   Un ítem por fila, una columna por comercio, y el mínimo, la
                mediana y el máximo al lado. Es la hoja del comprador: dice
                a quién comprarle y cuánto se gana negociando.

Las dos llevan arriba una banda fina y fija con la marca, y los títulos en
la fila 2 para que los datos empiecen en la 3.

OJO: este archivo todavía carga seis funciones hoja_* que nadie llama
—Léame, Presupuesto, Resumen por etapa, Solicitud de cotización,
Proveedores y Conversiones—, de cuando el libro tenía ocho hojas. Son unas
450 líneas muertas. Se dejan por si alguna vuelve, pero conviene decidirlo:
o vuelven o se borran.
"""

import json
import subprocess
import sys
from pathlib import Path

from openpyxl import Workbook
from openpyxl.drawing.image import Image
from openpyxl.drawing.fill import Blip
from openpyxl.drawing.geometry import PresetGeometry2D
from openpyxl.drawing.picture import PictureFrame
from openpyxl.drawing.spreadsheet_drawing import AnchorMarker, OneCellAnchor
from openpyxl.drawing.xdr import XDRPositiveSize2D
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "precios" / "descargas" / "precios-construccion-rd.xlsx"

# CALIBRI, NO ARIAL
# Arial es una grotesca de trazo cerrado: en una columna de mil filas
# cansa. Calibri es humanista —aperturas abiertas, esquinas redondeadas,
# menos contraste de trazo— y se lee más ligera en tablas largas.
#
# Está en todas partes donde hay Excel: viene con Office desde 2007, en
# Windows y en Mac. Y donde no hay Office, LibreOffice trae Carlito, que
# es métricamente compatible: sustituye sin mover un ancho de columna.
# Ninguna otra opción más ligera que Arial —Trebuchet, Verdana— tiene un
# clon libre con las mismas métricas.
#
# Además arregla una incoherencia vieja: el ancho de columna de openpyxl
# se mide en anchos de carácter de la fuente por defecto del libro, que
# siempre fue Calibri 11, mientras las celdas iban en Arial 10. Los
# anchos y la fuente no coincidían.
FUENTE = "Calibri"
CUERPO = 11          # Calibri 11 ocupa lo que Arial 10

# La paleta del logotipo, la misma del sitio. El libro se mantiene claro:
# el verde solo pinta la banda de firma y la fila de títulos.
VERDE = "3F6E22"        # fondo del icono
VERDE_HONDO = "2C4E18"  # texto verde sobre claro
VERDE_SUAVE = "E2EDD9"  # totales
MARFIL = "F8F6EE"       # zebra
AMBAR_SUAVE = "FDF3E2"  # celdas que el usuario llena
FILETE = "D8D4C4"

TXT = Font(name=FUENTE, size=CUERPO)
TXT_MINI = Font(name=FUENTE, size=CUERPO - 1, color="62685A")
TIT = Font(name=FUENTE, size=CUERPO, bold=True, color="FFFFFF")
H1 = Font(name=FUENTE, size=18, bold=True, color=VERDE_HONDO)
H2 = Font(name=FUENTE, size=CUERPO + 1, bold=True, color=VERDE_HONDO)
ENTRADA = Font(name=FUENTE, size=CUERPO, color="8A5309")

FILL_TIT = PatternFill("solid", fgColor=VERDE)
FILL_ENTRADA = PatternFill("solid", fgColor=AMBAR_SUAVE)
FILL_TOTAL = PatternFill("solid", fgColor=VERDE_SUAVE)
FILL_ZEBRA = PatternFill("solid", fgColor=MARFIL)
FILL_MARCA = PatternFill("solid", fgColor=MARFIL)

BORDE = Border(*[Side(style="thin", color=FILETE)] * 4)

MONEDA = '#,##0.00;[Red]-#,##0.00;"—"'
PORCENTAJE = '0.0%;[Red]-0.0%;"—"'
ENTERO = '#,##0;[Red]-#,##0;"—"'


def datos():
    """El modelo lo sirve Node, que es donde vive."""
    r = subprocess.run(
        ["node", str(RAIZ / "herramientas" / "datos-para-excel.js")],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        sys.stderr.write(r.stderr)
        sys.exit(1)
    return json.loads(r.stdout)


ISOTIPO = RAIZ / "assets" / "img" / "isotipo-180.png"
EMU = 9525          # unidades internas de Office por píxel
ICONO_PX = 22       # el icono dentro de la banda
MARGEN_PX = 5


def marca(ws, n_cols):
    """Banda fina con la marca, fija arriba de la hoja.

    Va el icono, no el bloque entero: en una banda de esta altura el
    nombre dibujado quedaría en tres píxeles de altura de mayúscula, o
    sea ilegible. El icono se lee a 22 px, y el nombre se pone como
    texto de verdad, que además se puede buscar y escalar.

    La banda es de marfil, no verde: el icono lleva su propia plancha
    verde y sobre un fondo del mismo color se perdería.
    """
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=max(2, n_cols))
    c = ws.cell(row=1, column=1,
                value="Ingenieros Liberato & Asociados  ·  precios.ingsliberato.com")
    c.font = Font(name=FUENTE, size=CUERPO - 1, bold=True, color=VERDE_HONDO)
    c.fill = FILL_MARCA
    # La sangría deja hueco al icono: cada nivel vale un ancho de carácter.
    c.alignment = Alignment(vertical="center", horizontal="left", indent=4)
    ws.row_dimensions[1].height = 24

    if ISOTIPO.exists():
        img = Image(str(ISOTIPO))
        img.width = img.height = ICONO_PX
        # Anclado a A1 con desplazamiento propio, para que no se pegue al borde.
        ancla = OneCellAnchor(
            _from=AnchorMarker(col=0, row=0,
                               colOff=MARGEN_PX * EMU, rowOff=MARGEN_PX * EMU),
            ext=XDRPositiveSize2D(ICONO_PX * EMU, ICONO_PX * EMU))
        # openpyxl rotularía la imagen «Picture». Se arma el marco a mano
        # para que el lector de pantalla diga de qué es el logotipo.
        marco = PictureFrame()
        marco.nvPicPr.cNvPr.id = 1
        marco.nvPicPr.cNvPr.name = "Ingenieros Liberato & Asociados"
        marco.nvPicPr.cNvPr.descr = "Logotipo de Ingenieros Liberato & Asociados"
        # openpyxl rellena el identificador al escribir, pero el blip
        # tiene que existir de antemano.
        marco.blipFill.blip = Blip()
        marco.blipFill.blip.cstate = "print"
        marco.spPr.prstGeom = PresetGeometry2D(prst="rect")
        marco.spPr.ln = None
        ancla.pic = marco
        img.anchor = ancla
        ws.add_image(img)


def encabeza(ws, fila, titulos, anchos=None, congelar=True):
    for i, t in enumerate(titulos, start=1):
        c = ws.cell(row=fila, column=i, value=t)
        c.font = TIT
        c.fill = FILL_TIT
        c.alignment = Alignment(vertical="center", wrap_text=True)
        c.border = BORDE
    ws.row_dimensions[fila].height = 30
    if anchos:
        for i, a in enumerate(anchos, start=1):
            ws.column_dimensions[get_column_letter(i)].width = a
    if congelar:
        ws.freeze_panes = ws.cell(row=fila + 1, column=1)


def texto(ws, celda, valor, fuente=TXT, ajuste=False):
    c = ws[celda]
    c.value = valor
    c.font = fuente
    if ajuste:
        c.alignment = Alignment(wrap_text=True, vertical="top")
    return c


# =====================================================================
# 1. Léame
# =====================================================================

def hoja_leame(wb, d):
    ws = wb.create_sheet("Léame")
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 3
    ws.column_dimensions["B"].width = 30
    ws.column_dimensions["C"].width = 90

    t = d["totales"]
    texto(ws, "B2", "Precios de construcción · República Dominicana", H1)
    texto(ws, "B3", "Ingenieros Liberato & Asociados · " + d["sitio"], TXT_MINI)

    filas = [
        ("", ""),
        ("Generado", d["generado"]),
        ("Ítems en el catálogo", t["items"]),
        ("Con precio real de un comercio", "%d de %d" % (t["verificados"], t["conPrecio"])),
        ("Con estimación de arranque", t["estimados"]),
        ("Según tarifario oficial (sin monto)", t["tarifario"]),
        ("Cotizaciones cargadas", t["cotizaciones"]),
        ("Comercios con precio publicado", t["comercios"]),
    ]
    f = 5
    for k, v in filas:
        if k:
            texto(ws, "B%d" % f, k, H2)
            texto(ws, "C%d" % f, v)
        f += 1

    f += 1
    texto(ws, "B%d" % f, "Qué es esto", H2)
    texto(ws, "C%d" % f,
          "Una referencia de mercado, no una oferta. Los precios salen de lo que los propios "
          "comercios publican, con su fuente y su fecha en cada fila. Nadie ha cotizado para "
          "este archivo y ningún proveedor se ha comprometido con estos montos.", TXT, True)
    ws.row_dimensions[f].height = 42
    f += 2

    texto(ws, "B%d" % f, "Los tres estados", H2)
    f += 1
    for k, v in [
        ("Verificado", "Respaldado por el precio que el comercio publica, con fuente y fecha."),
        ("Estimado", "Estimación nuestra de arranque, mientras se levanta la cotización real."),
        ("Tarifario oficial", "No lleva monto: se liquida según un tarifario público (licencias, conexiones)."),
    ]:
        texto(ws, "B%d" % f, k)
        texto(ws, "C%d" % f, v, TXT, True)
        f += 1
    f += 1

    texto(ws, "B%d" % f, "Sobre el ITBIS", H2)
    texto(ws, "C%d" % f,
          "Cada ítem dice si su precio lo incluye. Los materiales de mostrador se registran con "
          "el 18% incluido, como se muestran en tienda; la mano de obra, los subcontratos y el "
          "alquiler de equipo van sin ITBIS. Por eso el presupuesto no aplica un 18% parejo al "
          "final: sumarlo a todo sería cobrarlo dos veces sobre los materiales.", TXT, True)
    ws.row_dimensions[f].height = 56
    f += 2

    texto(ws, "B%d" % f, "Las hojas", H2)
    f += 1
    for k, v in [
        ("Catálogo", "Los ítems con todos sus campos. Es la hoja de datos contra la que buscan las demás."),
        ("Comparativo", "Un ítem por fila y una columna por proveedor, con mínimo, mediana, máximo "
                        "y cuánto se aparta el más caro del más barato."),
        ("Presupuesto", "Escriba el código y la cantidad en las celdas amarillas; lo demás se calcula solo."),
        ("Resumen por etapa", "El presupuesto agrupado por etapa de obra."),
        ("Solicitud de cotización", "Para mandarle a un proveedor: las columnas de precio van vacías "
                                    "y al lado se ve cuánto se aparta de la referencia."),
        ("Proveedores", "A quién pedirle qué, con su contacto."),
        ("Conversiones", "Factores de cubicación de uso diario."),
    ]:
        texto(ws, "B%d" % f, k)
        texto(ws, "C%d" % f, v, TXT, True)
        ws.row_dimensions[f].height = 26
        f += 1
    f += 1

    texto(ws, "B%d" % f, "Actualización", H2)
    texto(ws, "C%d" % f,
          "El sitio se actualiza antes que este archivo. Ante cualquier duda, la versión buena "
          "está en " + d["sitio"] + ".", TXT, True)
    f += 2
    texto(ws, "C%d" % f,
          "Realizamos presupuestos para proyectos y licitaciones. ingsliberato.com", H2)
    return ws


# =====================================================================
# 2. Catálogo
# =====================================================================

# Fuera «Alcance» (lo mismo en 1,471 de 1,522 ítems), «Alias de mercado»
#    (es para el buscador del sitio, no para una hoja) y «Estado» (ya no hay
#    estimaciones: todo lo publicado tiene precio de comercio). 
# El precio va pegado al ítem. Antes había que cruzar seis columnas
# —especificación, unidad, etapa, gama, origen, cotizaciones— para llegar
# de un nombre a su precio, y en una hoja de 2.190 filas eso es
# desplazamiento horizontal en cada consulta. Lo que se viene a buscar
# aquí es cuánto cuesta; el resto es contexto y puede esperar a la
# derecha. Las cinco columnas de precio van juntas, y «Incluye ITBIS» con
# ellas porque sin ese dato las otras cuatro no se pueden comparar.
CAT_COLS = [
    ("Código", 13), ("Grupo", 16), ("Categoría", 26), ("Ítem", 46),
    ("Precio de referencia (RD$)", 15), ("Mínimo (RD$)", 13), ("Máximo (RD$)", 13),
    ("Precio sin ITBIS (RD$)", 15), ("Incluye ITBIS", 11),
    ("Unidad", 12), ("Cotizaciones", 11), ("Comercios que cotizaron", 46),
    ("Especificación", 40), ("Etapa de obra", 20), ("Gama", 11), ("Origen", 11),
    ("Fecha", 11),
]

# Y el orden se declara una sola vez. Los índices estaban escritos a mano
# en la fórmula, en los formatos de número y en el ajuste de texto, así que
# mover una columna era ir a buscarlos de uno en uno; ahora cada sitio pide
# la columna por su nombre.
CAT_IDX = {nombre: i for i, (nombre, _) in enumerate(CAT_COLS, start=1)}


def cat_col(nombre):
    """La letra de columna del catálogo, por el título que lleva encima."""
    return get_column_letter(CAT_IDX[nombre])


# Cómo se lee cada medida y en qué orden van las columnas. Solo salen las
# que de verdad usa el catálogo; el resto va a «Otras medidas».
ETIQUETA_MEDIDA = {
    "forma": "Forma", "montaje": "Montaje", "luz": "Luz", "piezas": "Piezas",
    "largo_cm": "Largo (cm)", "descarga_l": "Descarga (L)", "descarga": "Descarga",
    "agujeros": "Agujeros", "activacion": "Activación", "tipo_papel": "Tipo de papel",
    "largo_mm": "Largo (mm)", "ancho_mm": "Ancho (mm)", "alto_mm": "Alto (mm)",
    "formato": "Formato", "resolucion_mp": "Resolución (MP)", "lente_mm": "Lente (mm)",
    "tecnologia": "Tecnología", "alcance_ir_m": "Alcance IR (m)", "canales": "Canales",
    "capacidad_tb": "Capacidad (TB)", "pulgadas": "Pulgadas", "zonas": "Zonas",
    "alcance_m": "Alcance (m)", "ubicacion": "Ubicación", "potencia_db": "Potencia (dB)",
    "deteccion": "Detección", "categoria": "Categoría de cable", "blindaje": "Blindaje",
    "largo_pies": "Largo (pies)", "largo_m": "Largo (m)", "puertos": "Puertos",
    "neutro": "Neutro", "mide": "Mide", "apartamentos": "Apartamentos", "video": "Video",
    "voltaje_v": "Voltaje (V)", "amperaje_a": "Amperaje (A)", "camaras": "Cámaras",
    "enlace": "Enlace", "capacidad_gal": "Capacidad (gal)", "capacidad_oz": "Capacidad (oz)",
    "peso_kg": "Peso (kg)", "peso_lb": "Peso (lb)", "calibre": "Calibre",
    "tamano": "Tamaño", "uso": "Uso",
}
MINIMO_PARA_COLUMNA = 8


def columnas_medida(items):
    """Las medidas con su propia columna: las que usa una cantidad de ítems
    que justifique una columna. Es el aporte de tener varias medidas por
    separado: si un proveedor solo publica los litros del tanque y otro solo
    las dimensiones, cada dato queda en su columna y el emparejamiento se
    hace con el que ambos declaren."""
    cuenta = {}
    for it in items:
        for k in (it.get("medidas") or {}):
            cuenta[k] = cuenta.get(k, 0) + 1
    elegidas = [k for k in ETIQUETA_MEDIDA if cuenta.get(k, 0) >= MINIMO_PARA_COLUMNA]
    return elegidas, cuenta


def hoja_catalogo(wb, d):
    ws = wb.create_sheet("Catálogo")
    medidas, _ = columnas_medida(d["items"])
    cols = list(CAT_COLS) + [(ETIQUETA_MEDIDA[k], 13) for k in medidas] + [("Otras medidas", 30)]
    marca(ws, len(cols))
    encabeza(ws, 2, [c[0] for c in cols], [c[1] for c in cols])

    # Qué dato del ítem va en cada columna. La columna del precio sin ITBIS
    # no sale de aquí: es una fórmula, y se escribe después.
    DATO = {
        "Código": "codigo", "Grupo": "grupo", "Categoría": "categoria",
        "Ítem": "nombre", "Precio de referencia (RD$)": "ref",
        "Mínimo (RD$)": "min", "Máximo (RD$)": "max", "Unidad": "unidad",
        "Cotizaciones": "cotizaciones", "Comercios que cotizaron": "fuente",
        "Especificación": "esp", "Etapa de obra": "etapa", "Gama": "gama",
        "Origen": "origen", "Fecha": "fecha",
    }
    ENVUELVE = ("Ítem", "Especificación", "Comercios que cotizaron")
    MONEDAS = ("Precio de referencia (RD$)", "Mínimo (RD$)", "Máximo (RD$)",
               "Precio sin ITBIS (RD$)")
    ref_c, itbis_c = cat_col("Precio de referencia (RD$)"), cat_col("Incluye ITBIS")

    for n, it in enumerate(d["items"], start=3):
        for titulo, i in CAT_IDX.items():
            if titulo == "Incluye ITBIS":
                v = "Sí" if it["itbis"] else "No"
            elif titulo == "Precio sin ITBIS (RD$)":
                # El precio sin el impuesto, para quien presupuesta sin ITBIS
                v = '=IF({r}{n}="","",IF({t}{n}="Sí",ROUND({r}{n}/1.18,2),{r}{n}))'.format(
                    r=ref_c, t=itbis_c, n=n)
            else:
                v = it[DATO[titulo]]
            c = ws.cell(row=n, column=i, value=v)
            c.font = TXT
            c.alignment = Alignment(vertical="top", wrap_text=(titulo in ENVUELVE))
        for titulo in MONEDAS:
            ws.cell(row=n, column=CAT_IDX[titulo]).number_format = MONEDA
        ws.cell(row=n, column=CAT_IDX["Cotizaciones"]).number_format = ENTERO

    # Las medidas, una por columna
    base = len(CAT_COLS)
    for n2, it in enumerate(d["items"], start=3):
        med = it.get("medidas") or {}
        for j, k in enumerate(medidas):
            v = med.get(k)
            if v not in (None, ""):
                c = ws.cell(row=n2, column=base + 1 + j, value=v)
                c.font = TXT
        otras = [ETIQUETA_MEDIDA.get(k, k) + ": " + str(med[k])
                 for k in med if k not in medidas and med[k] not in (None, "")]
        if otras:
            c = ws.cell(row=n2, column=base + 1 + len(medidas), value=" · ".join(otras))
            c.font = TXT
            c.alignment = Alignment(vertical="top", wrap_text=True)

    ultima = len(d["items"]) + 2
    ws.auto_filter.ref = "A2:%s%d" % (
        get_column_letter(base + len(medidas) + 1), ultima)
    return ultima


# =====================================================================
# 3. Comparativo por proveedor
# =====================================================================

def hoja_comparativo(wb, d):
    ws = wb.create_sheet("Comparativo")
    provs = d["proveedoresComparativo"]
    n_prov = len(provs)

    cols = ["Código", "Ítem", "Unidad"] + provs + [
        "Mínimo (RD$)", "Mediana (RD$)", "Máximo (RD$)", "Dispersión",
        "Más barato", "Referencia del sitio (RD$)", "Cotizaciones",
    ]
    anchos = [13, 46, 12] + [17] * n_prov + [13, 13, 13, 11, 24, 15, 11]
    marca(ws, len(cols))
    encabeza(ws, 2, cols, anchos)

    p1 = 4                       # primera columna de proveedor
    p2 = 3 + n_prov              # última
    L1, L2 = get_column_letter(p1), get_column_letter(p2)
    cMin, cMed, cMax = [get_column_letter(p2 + i) for i in (1, 2, 3)]
    cDis, cBar, cRef, cCot = [get_column_letter(p2 + i) for i in (4, 5, 6, 7)]

    n = 3
    for it in d["items"]:
        if not it["cotizaciones"]:
            continue
        ws.cell(row=n, column=1, value=it["codigo"]).font = TXT
        c = ws.cell(row=n, column=2, value=it["nombre"])
        c.font = TXT
        c.alignment = Alignment(wrap_text=True, vertical="top")
        ws.cell(row=n, column=3, value=it["unidad"]).font = TXT

        for j, p in enumerate(it["precios"]):
            c = ws.cell(row=n, column=p1 + j, value=(p["precio"] if p else None))
            c.font = TXT
            c.number_format = MONEDA

        rango = "{0}{2}:{1}{2}".format(L1, L2, n)
        vacio = 'COUNT({0})=0'.format(rango)
        ws.cell(row=n, column=p2 + 1, value='=IF({0},"",MIN({1}))'.format(vacio, rango))
        ws.cell(row=n, column=p2 + 2, value='=IF({0},"",MEDIAN({1}))'.format(vacio, rango))
        ws.cell(row=n, column=p2 + 3, value='=IF({0},"",MAX({1}))'.format(vacio, rango))
        ws.cell(row=n, column=p2 + 4,
                value='=IF(OR({0}{1}="",{0}{1}=0),"",({2}{1}-{0}{1})/{0}{1})'.format(cMin, n, cMax))
        ws.cell(row=n, column=p2 + 5,
                value='=IF({0},"",INDEX(${1}$1:${2}$1,MATCH(MIN({3}),{3},0)))'.format(
                    vacio, L1, L2, rango))
        # Dato del modelo, no cálculo de esta hoja: va como valor.
        ws.cell(row=n, column=p2 + 6, value=it["ref"])
        ws.cell(row=n, column=p2 + 7, value=it["cotizaciones"])

        for col, fmt in ((p2 + 1, MONEDA), (p2 + 2, MONEDA), (p2 + 3, MONEDA),
                         (p2 + 4, PORCENTAJE), (p2 + 6, MONEDA), (p2 + 7, ENTERO)):
            cc = ws.cell(row=n, column=col)
            cc.font = TXT
            cc.number_format = fmt
        ws.cell(row=n, column=p2 + 5).font = TXT
        n += 1

    ws.auto_filter.ref = "A2:{0}{1}".format(cCot, n - 1)

    nota = ws.cell(row=n + 1, column=1,
                   value="Cómo leer esta hoja. Cada celda de proveedor trae el precio tal como ese "
                         "comercio lo publica; cuando tiene más de una cotización para el mismo ítem "
                         "—dos marcas, dos presentaciones— se muestra la más baja, que es con la que "
                         "se negocia. El mínimo, la mediana y el máximo se calculan sobre esas celdas. "
                         "La referencia del sitio no: esa normaliza el ITBIS, promedia todas las "
                         "cotizaciones y deja fuera las que vienen en otra presentación. Por eso las "
                         "dos columnas pueden no coincidir, y cuando difieran la comparable es la "
                         "del sitio.")
    nota.font = TXT_MINI
    nota.alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells(start_row=n + 1, start_column=1, end_row=n + 2, end_column=p2 + 7)
    return n - 2


# =====================================================================
# 4. Presupuesto
# =====================================================================

PRESU_FILAS = 300
PRESU_INICIO = 8


def hoja_presupuesto(wb, d, filas_catalogo):
    ws = wb.create_sheet("Presupuesto")
    ws.sheet_view.showGridLines = False

    texto(ws, "A1", "Presupuesto", H1)
    texto(ws, "A2",
          "Escriba el código del ítem en la columna A y la cantidad en la columna E. "
          "Las celdas amarillas son las únicas que se llenan a mano; todo lo demás se calcula.", TXT)
    texto(ws, "A3",
          "Los códigos salen de la hoja Catálogo. La fila 8 va llena como ejemplo: bórrela y empiece ahí.",
          TXT_MINI)

    cols = [("Código", 13), ("Descripción", 46), ("Unidad", 12), ("Etapa de obra", 20),
            ("Cantidad", 12), ("Precio unitario (RD$)", 15), ("Importe (RD$)", 15),
            ("Incluye ITBIS", 11), ("Importe sin ITBIS (RD$)", 16), ("Nota", 30)]
    encabeza(ws, 7, [c[0] for c in cols], [c[1] for c in cols], congelar=False)
    ws.freeze_panes = "A8"

    lookup = ("IFERROR(INDEX('Catálogo'!${col}$2:${col}${fin},"
              "MATCH($A{f},'Catálogo'!$A$2:$A${fin},0)),\"código no encontrado\")")

    for f in range(PRESU_INICIO, PRESU_INICIO + PRESU_FILAS):
        a = ws.cell(row=f, column=1)
        a.font = ENTRADA
        a.fill = FILL_ENTRADA
        a.border = BORDE

        for col, origen in ((2, "D"), (3, "H"), (4, "I")):
            c = ws.cell(row=f, column=col, value='=IF($A{0}="","",{1})'.format(
                f, lookup.format(col=origen, fin=filas_catalogo, f=f)))
            c.font = TXT
        ws.cell(row=f, column=2).alignment = Alignment(wrap_text=True, vertical="top")

        e = ws.cell(row=f, column=5)
        e.font = ENTRADA
        e.fill = FILL_ENTRADA
        e.border = BORDE
        e.number_format = '#,##0.00'

        c = ws.cell(row=f, column=6, value='=IF($A{0}="","",{1})'.format(
            f, lookup.format(col="N", fin=filas_catalogo, f=f)))
        c.font, c.number_format = TXT, MONEDA

        c = ws.cell(row=f, column=7,
                    value='=IF(OR($E{0}="",$F{0}="",NOT(ISNUMBER($F{0}))),"",$E{0}*$F{0})'.format(f))
        c.font, c.number_format = TXT, MONEDA

        c = ws.cell(row=f, column=8, value='=IF($A{0}="","",{1})'.format(
            f, lookup.format(col="Q", fin=filas_catalogo, f=f)))
        c.font = TXT

        c = ws.cell(row=f, column=9,
                    value='=IF($G{0}="","",IF($H{0}="Sí",ROUND($G{0}/1.18,2),$G{0}))'.format(f))
        c.font, c.number_format = TXT, MONEDA

        n = ws.cell(row=f, column=10)
        n.font = ENTRADA
        n.fill = FILL_ENTRADA
        n.border = BORDE

    # Ejemplo, para que se vea el formato esperado
    ejemplo = None
    for it in d["items"]:
        if it["estado"] == "verificado" and it["ref"]:
            ejemplo = it
            break
    if ejemplo:
        ws.cell(row=PRESU_INICIO, column=1, value=ejemplo["codigo"])
        ws.cell(row=PRESU_INICIO, column=5, value=100)
        ws.cell(row=PRESU_INICIO, column=10, value="fila de ejemplo — bórrela")

    ult = PRESU_INICIO + PRESU_FILAS - 1
    t = ult + 2
    bloque = [
        ("Costo directo", '=SUM(G{0}:G{1})'.format(PRESU_INICIO, ult), MONEDA, False),
        ("ITBIS ya contenido en el costo directo",
         '=SUMIF($H${0}:$H${1},"Sí",$G${0}:$G${1})-SUMIF($H${0}:$H${1},"Sí",$I${0}:$I${1})'.format(
             PRESU_INICIO, ult), MONEDA, False),
        ("Costo directo sin ITBIS", '=SUM(I{0}:I{1})'.format(PRESU_INICIO, ult), MONEDA, False),
        ("", None, None, False),
        ("Gastos generales e indirectos (%)", 0.12, PORCENTAJE, True),
        ("Utilidad (%)", 0.10, PORCENTAJE, True),
        ("Gastos generales e indirectos", '=$G${0}*$E${1}'.format(t, t + 4), MONEDA, False),
        ("Utilidad", '=$G${0}*$E${1}'.format(t, t + 5), MONEDA, False),
        ("TOTAL DEL PRESUPUESTO", '=$G${0}+$G${1}+$G${2}'.format(t, t + 6, t + 7), MONEDA, False),
    ]
    for i, (etiqueta, valor, fmt, entrada) in enumerate(bloque):
        f = t + i
        if not etiqueta:
            continue
        c = ws.cell(row=f, column=1, value=etiqueta)
        c.font = H2 if etiqueta.startswith("TOTAL") else Font(name=FUENTE, size=10, bold=True)
        ws.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
        destino = 5 if entrada else 7
        c = ws.cell(row=f, column=destino, value=valor)
        c.number_format = fmt
        if entrada:
            c.font = ENTRADA
            c.fill = FILL_ENTRADA
            c.border = BORDE
        else:
            c.font = H2 if etiqueta.startswith("TOTAL") else TXT
            c.fill = FILL_TOTAL

    texto(ws, "A%d" % (t + 10),
          "El ITBIS no se suma al final: cada precio ya viene como lo cobra el comercio, y los "
          "materiales de mostrador lo traen incluido mientras que la mano de obra y el alquiler "
          "de equipo no. La línea de arriba dice cuánto impuesto va contenido en el costo directo.",
          TXT_MINI, True)
    ws.merge_cells(start_row=t + 10, start_column=1, end_row=t + 11, end_column=10)
    return PRESU_INICIO, ult, t + 8


# =====================================================================
# 5. Resumen por etapa
# =====================================================================

def hoja_resumen(wb, d, presu):
    ini, fin, fila_total = presu
    ws = wb.create_sheet("Resumen por etapa")
    ws.sheet_view.showGridLines = False

    texto(ws, "A1", "Resumen por etapa de obra", H1)
    texto(ws, "A2", "Se llena solo con lo que se escriba en la hoja Presupuesto.", TXT_MINI)

    encabeza(ws, 4, ["Etapa de obra", "Importe (RD$)", "% del costo directo"], [28, 18, 18],
             congelar=False)

    etapas = list(d["etapas"]) + ["Transversal"]
    f = 5
    for e in etapas:
        ws.cell(row=f, column=1, value=e).font = TXT
        c = ws.cell(row=f, column=2,
                    value="=SUMIF('Presupuesto'!$D${0}:$D${1},$A{2},'Presupuesto'!$G${0}:$G${1})".format(
                        ini, fin, f))
        c.font, c.number_format = TXT, MONEDA
        f += 1

    ultima = f - 1
    ws.cell(row=f, column=1, value="Costo directo").font = H2
    c = ws.cell(row=f, column=2, value='=SUM(B5:B{0})'.format(ultima))
    c.font, c.number_format, c.fill = H2, MONEDA, FILL_TOTAL

    for g in range(5, f):
        c = ws.cell(row=g, column=3, value='=IF($B${0}=0,"",B{1}/$B${0})'.format(f, g))
        c.font, c.number_format = TXT, PORCENTAJE

    texto(ws, "A%d" % (f + 2),
          "El costo directo de esta hoja tiene que dar igual al de la hoja Presupuesto. "
          "Si no cuadra, es que hay una etapa escrita distinto.", TXT_MINI, True)
    ws.merge_cells(start_row=f + 2, start_column=1, end_row=f + 3, end_column=3)


# =====================================================================
# 6. Solicitud de cotización
# =====================================================================

RFQ_FILAS = 200
RFQ_INICIO = 9


def hoja_rfq(wb, d, filas_catalogo):
    ws = wb.create_sheet("Solicitud de cotización")
    ws.sheet_view.showGridLines = False

    texto(ws, "A1", "Solicitud de cotización", H1)
    texto(ws, "A2",
          "Escriba el código y la cantidad, imprima o envíe esta hoja, y deje que el proveedor "
          "llene de la columna G en adelante.", TXT)
    texto(ws, "A4", "Proyecto:", H2)
    texto(ws, "A5", "Proveedor:", H2)
    texto(ws, "A6", "Fecha de solicitud:", H2)
    for celda in ("C4", "C5", "C6"):
        c = ws[celda]
        c.font, c.fill, c.border = ENTRADA, FILL_ENTRADA, BORDE
        ws.merge_cells(start_row=c.row, start_column=3, end_row=c.row, end_column=6)

    cols = [("Código", 13), ("Ítem", 44), ("Especificación", 34), ("Unidad", 12),
            ("Cantidad", 11), ("Referencia de mercado (RD$)", 15),
            ("Marca ofertada", 20), ("Precio unitario ofertado (RD$)", 16),
            ("¿Incluye ITBIS?", 12), ("Disponibilidad", 16), ("Plazo de entrega", 16),
            ("Validez de la oferta", 16), ("Diferencia vs. referencia", 14),
            ("Importe ofertado (RD$)", 16), ("Observaciones", 28)]
    encabeza(ws, 8, [c[0] for c in cols], [c[1] for c in cols], congelar=False)
    ws.freeze_panes = "A9"

    lookup = ("IFERROR(INDEX('Catálogo'!${col}$2:${col}${fin},"
              "MATCH($A{f},'Catálogo'!$A$2:$A${fin},0)),\"código no encontrado\")")

    si_no = DataValidation(type="list", formula1='"Sí,No"', allow_blank=True)
    ws.add_data_validation(si_no)

    for f in range(RFQ_INICIO, RFQ_INICIO + RFQ_FILAS):
        for col in (1, 5):
            c = ws.cell(row=f, column=col)
            c.font, c.fill, c.border = ENTRADA, FILL_ENTRADA, BORDE
        ws.cell(row=f, column=5).number_format = '#,##0.00'

        for col, origen in ((2, "D"), (3, "E"), (4, "H")):
            c = ws.cell(row=f, column=col, value='=IF($A{0}="","",{1})'.format(
                f, lookup.format(col=origen, fin=filas_catalogo, f=f)))
            c.font = TXT
            c.alignment = Alignment(wrap_text=True, vertical="top")

        c = ws.cell(row=f, column=6, value='=IF($A{0}="","",{1})'.format(
            f, lookup.format(col="N", fin=filas_catalogo, f=f)))
        c.font, c.number_format = TXT, MONEDA

        for col in (7, 8, 9, 10, 11, 12, 15):
            c = ws.cell(row=f, column=col)
            c.font, c.fill, c.border = ENTRADA, FILL_ENTRADA, BORDE
        ws.cell(row=f, column=8).number_format = MONEDA
        si_no.add(ws.cell(row=f, column=9))

        c = ws.cell(row=f, column=13,
                    value='=IF(OR($F{0}="",$H{0}="",NOT(ISNUMBER($F{0})),NOT(ISNUMBER($H{0}))),"",'
                          '($H{0}-$F{0})/$F{0})'.format(f))
        c.font, c.number_format = TXT, PORCENTAJE

        c = ws.cell(row=f, column=14,
                    value='=IF(OR($E{0}="",$H{0}=""),"",$E{0}*$H{0})'.format(f))
        c.font, c.number_format = TXT, MONEDA

    ult = RFQ_INICIO + RFQ_FILAS - 1
    f = ult + 2
    ws.cell(row=f, column=1, value="Total ofertado").font = H2
    ws.merge_cells(start_row=f, start_column=1, end_row=f, end_column=13)
    c = ws.cell(row=f, column=14, value='=SUM(N{0}:N{1})'.format(RFQ_INICIO, ult))
    c.font, c.number_format, c.fill = H2, MONEDA, FILL_TOTAL

    texto(ws, "A%d" % (f + 2),
          "La columna «Diferencia vs. referencia» compara la oferta con el precio de referencia "
          "del mercado: en negativo, la oferta está por debajo. Sirve para ver de un vistazo "
          "dónde vale la pena negociar y dónde la oferta ya es buena.", TXT_MINI, True)
    ws.merge_cells(start_row=f + 2, start_column=1, end_row=f + 3, end_column=15)


# =====================================================================
# 7. Proveedores
# =====================================================================

def hoja_proveedores(wb, d):
    ws = wb.create_sheet("Proveedores")
    cols = [("Proveedor", 30), ("Tipo", 16), ("Canal", 14), ("Vende al público", 13),
            ("Publica precios", 13), ("Cotizaciones cargadas", 12), ("Zonas", 26),
            ("Categorías que cubre", 60), ("Web", 26), ("Teléfono", 16),
            ("WhatsApp", 16), ("Correo", 26), ("Nota", 50)]
    encabeza(ws, 1, [c[0] for c in cols], [c[1] for c in cols])

    n = 2
    for p in d["proveedores"]:
        if p["demo"]:
            continue
        fila = [p["nombre"], p["tipo"], p["canal"],
                "Sí" if p["publico"] else "No",
                "Sí" if p["precios"] else "No",
                p["cotizaciones"], ", ".join(p["zonas"]), ", ".join(p["cats"]),
                p["web"], p["tel"], p["wa"], p["email"], p["nota"]]
        for i, v in enumerate(fila, start=1):
            c = ws.cell(row=n, column=i, value=v)
            c.font = TXT
            c.alignment = Alignment(vertical="top", wrap_text=(i in (7, 8, 13)))
        ws.cell(row=n, column=6).number_format = ENTERO
        n += 1
    ws.auto_filter.ref = "A1:M%d" % (n - 1)

    c = ws.cell(row=n + 1, column=1,
                value="Los fabricantes de canal cerrado —cementeras, siderúrgica, fábricas de "
                      "pintura— aparecen como indicador de tendencia pero no venden al público: "
                      "no se les pide cotización directa.")
    c.font = TXT_MINI
    c.alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells(start_row=n + 1, start_column=1, end_row=n + 2, end_column=13)


# =====================================================================
# 8. Conversiones
# =====================================================================

def hoja_conversiones(wb, d):
    ws = wb.create_sheet("Conversiones")
    ws.sheet_view.showGridLines = False
    texto(ws, "A1", "Conversiones de uso diario", H1)
    texto(ws, "A2", "Para cubicar sin buscar la libreta.", TXT_MINI)
    encabeza(ws, 4, ["Equivale", "A"], [42, 66], congelar=False)
    for n, c in enumerate(d["conversiones"], start=5):
        a = ws.cell(row=n, column=1, value=c["de"])
        b = ws.cell(row=n, column=2, value=c["a"])
        a.font = b.font = TXT
        b.alignment = Alignment(wrap_text=True, vertical="top")


# =====================================================================

# =====================================================================
# 3. Todos los artículos
# =====================================================================

def hoja_articulos(wb, d):
    """Una fila por artículo de tienda, sin agregar nada.

    El resto del libro trabaja por ítem: una fila por especificación, con
    el precio de referencia y una columna por comercio. Eso es lo que va a
    un presupuesto. Pero debajo de cada ítem hay decenas de artículos
    concretos —esta marca, este modelo, este precio, esta tienda— y así,
    agregados, no se pueden mirar uno por uno.

    Esta hoja los saca todos, como el explorador de interiorismo saca
    todas las fotos: sin mediana, sin comparar, sin columna por comercio.
    Es el dato crudo con pocas columnas, para filtrarlo y ordenarlo en
    Excel como haga falta.
    """
    ws = wb.create_sheet("Artículos")
    cols = [("Categoría", 26), ("Ítem del catálogo", 40), ("Artículo del comercio", 46),
            ("Marca", 18), ("Comercio", 22), ("Unidad", 11), ("Precio RD$", 13),
            ("Fecha", 11), ("Enlace", 52)]
    marca(ws, len(cols))
    encabeza(ws, 2, [c[0] for c in cols], [c[1] for c in cols])

    n = 3
    for a in d["articulos"]:
        fila = [a["categoria"], a["item"], a["articulo"] or a["item"], a["marca"],
                a["comercio"], a["unidad"], a["precio"], a["fecha"], a["url"]]
        for i, v in enumerate(fila, start=1):
            c = ws.cell(row=n, column=i, value=v)
            c.font = TXT
            c.alignment = Alignment(vertical="top")
        ws.cell(row=n, column=7).number_format = MONEDA
        # El enlace va como hipervínculo: es lo que convierte la hoja en una
        # herramienta de compra y no en una lista para mirar.
        if a["url"]:
            c = ws.cell(row=n, column=9)
            c.hyperlink = a["url"]
            c.font = Font(name=FUENTE, size=CUERPO, color="3F6E22", underline="single")
        n += 1

    ws.auto_filter.ref = "A2:I%d" % (n - 1)
    return n - 3


def main():
    d = datos()
    wb = Workbook()
    wb.remove(wb.active)

    # El estilo «Normal» es el que fija la unidad de ancho de columna de
    # todo el libro. Coincidía con Calibri 11 por casualidad; ahora se
    # declara, para que los anchos y la fuente de las celdas sean lo mismo.
    normal = wb._named_styles["Normal"]
    normal.font.name = FUENTE
    normal.font.sz = CUERPO

    # Tres hojas: el catálogo por ítem, el comparativo por comercio y el
    # dato crudo, un artículo de tienda por fila.
    hoja_catalogo(wb, d)
    comparadas = hoja_comparativo(wb, d)
    n_articulos = hoja_articulos(wb, d)

    wb.properties.title = "Precios de construcción · República Dominicana"
    wb.properties.creator = "Ingenieros Liberato & Asociados"
    wb.properties.description = ("Referencia de precios de materiales, mano de obra y equipos "
                                 "en RD. Generada el " + d["generado"] + " desde " + d["sitio"])

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    wb.save(SALIDA)

    print("Escrito %s" % SALIDA.relative_to(RAIZ))
    print("  %d ítems · %d en el comparativo · %d proveedores" % (
        len(d["items"]), comparadas, d["totales"]["comercios"]))
    print("  %d artículos de tienda en la hoja «Artículos»" % n_articulos)
    print("  Ahora conviene revisarlo: python3 herramientas/verificar-excel.py")


if __name__ == "__main__":
    main()
