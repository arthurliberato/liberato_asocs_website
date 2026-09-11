#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pasa el catálogo completo de Ochoa a la forma que lee el importador.

    python3 herramientas/convertir-ochoa.py Catalogo_Ochoa_...xlsx

Es el mismo formato que traían las cinco extracciones parciales que este
archivo viene a sustituir, de modo que las reglas que ya existen —baños,
seguridad, baldosas— siguen sirviendo sin tocarlas.

Dos detalles del .xlsx que no se pueden aplanar a la ligera: las
categorías van en minúsculas y sin tildes pero CON espacios (y con la
eñe, que ahí es letra y no tilde), porque así las nombran las reglas; y
los campos de la ficha van uno por línea dentro de la celda, que es lo
que aquí se traduce a « | ». Pegarlos sin separador deja el material
valiendo «Pasta blanca cerámica Aplicación» y rompe 447 fichas."""
import json, pathlib, re, sys
from openpyxl import load_workbook

RAIZ = pathlib.Path(__file__).resolve().parent
SALIDA = RAIZ / 'datos-externos' / 'ochoa-completo-2026-09-11.json'
ORIGEN = sys.argv[1] if len(sys.argv) > 1 else None
if not ORIGEN:
    print('Uso: python3 herramientas/convertir-ochoa.py <catálogo.xlsx>')
    sys.exit(1)


def limpia(v):
    if v is None:
        return ''
    return re.sub(r'\s+', ' ', str(v)).strip()


def ficha(v):
    """La ficha, con sus campos separados por « | ».

    En el .xlsx cada campo va en su propia línea dentro de la celda, y
    aplanarlo con limpia() los pega unos a otros: «Material: Pasta blanca
    cerámica Aplicación: Revestimiento interior» deja el material valiendo
    «Pasta blanca cerámica Aplicación», que es exactamente el fallo que ya
    costó 447 fichas mal partidas en la extracción anterior. Las reglas
    parten por « | » antes que por nada, así que el salto de línea se
    traduce a eso y no se toca nada más."""
    if v is None:
        return ''
    campos = [re.sub(r'\s+', ' ', x).strip() for x in str(v).split('\n')]
    return ' | '.join(x for x in campos if x)


def numero(v):
    if v is None or v == '':
        return None
    try:
        return float(str(v).replace(',', ''))
    except ValueError:
        return None


def cat(s):
    """Igual que en las cuatro extracciones que este archivo sustituye:
    minúsculas, sin tildes, con los espacios puestos —y con la eñe, que
    ahí no es una tilde sino una letra: «accesorios de baño»."""
    s = limpia(s).lower()
    for a, b in (('á','a'), ('é','e'), ('í','i'), ('ó','o'), ('ú','u'), ('ü','u')):
        s = s.replace(a, b)
    return s


wb = load_workbook(ORIGEN, read_only=True)
ws = wb['Catálogo']
filas = ws.iter_rows(values_only=True)
cab = [limpia(c) for c in next(filas)]
i = {n: k for k, n in enumerate(cab)}

fuera = []
sin_precio = 0
vistos = set()
dup = 0
for r in filas:
    cod = limpia(r[i['Código']])
    if not cod:
        continue
    precio = numero(r[i['Precio RD$']])
    if precio is None or precio <= 0:
        sin_precio += 1
        continue
    if cod in vistos:
        dup += 1
        continue
    vistos.add(cod)
    a = {
        'codigo': cod,
        'nombre': limpia(r[i['Nombre']]),
        'marca': limpia(r[i['Marca']]),
        'ref': limpia(r[i['Referencia']]),
        'unidad': limpia(r[i['Unidad']]),
        'precio': precio,
        'precioAnterior': numero(r[i['Precio regular RD$']]),
        'descuento': numero(r[i['Descuento']]),
        'cat1': cat(r[i['Categoría']]),
        'cat2': cat(r[i['Subcategoría']]),
        'cat3': cat(r[i['Sub-subcategoría']]),
        'disponibilidad': limpia(r[i['Disponibilidad']]),
        'info': ficha(r[i['Especificaciones']]),
        'url': limpia(r[i['URL producto']]),
        'imagen': limpia(r[i['Foto principal']]),
    }
    fuera.append(a)

with open(SALIDA, 'w', encoding='utf-8') as f:
    json.dump(fuera, f, ensure_ascii=False)

print('artículos con precio: %d' % len(fuera))
print('sin precio (fuera):   %d' % sin_precio)
print('códigos repetidos:    %d' % dup)
print('con foto:             %d' % sum(1 for a in fuera if a['imagen'].startswith('https://')))
print('con ficha:            %d' % sum(1 for a in fuera if a['info']))
print('con marca:            %d' % sum(1 for a in fuera if a['marca'] and a['marca'] != 'OCHOA'))
