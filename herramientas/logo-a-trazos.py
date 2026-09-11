#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
logo-a-trazos.py — rehace el logotipo en SVG

Escribe los tres archivos de marca en las dos carpetas de assets:

    logo.svg         el bloque horizontal, icono más nombre
    isotipo.svg      solo el icono
    marca-agua.svg   el monograma sin la plancha verde

POR QUÉ TRAZOS Y NO TEXTO
Un SVG cargado con <img> no puede usar las fuentes de la página que lo
incrusta. Un <text> con font-family="Archivo" caería en la fuente del
sistema, distinta en cada máquina, y el bloque cambiaría de ancho. Con los
contornos incrustados el archivo se ve igual en todas partes y no depende
de nada.

El precio es que el nombre no se puede editar a mano: para cambiarlo, se
edita NOMBRE aquí y se vuelve a correr.

POR QUÉ HARFBUZZ
El interletraje de Archivo vive en la tabla GPOS. Sumar anchos de avance
da un texto suelto y desigual; HarfBuzz aplica el kerning que la fuente
manda, que es lo que hace un programa de diseño.

    pip install fonttools brotli uharfbuzz
    python3 herramientas/logo-a-trazos.py
"""

import re
import sys
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINOS = [RAIZ / 'assets' / 'img', RAIZ / 'precios' / 'assets' / 'img']

NOMBRE = 'Ingenieros Liberato & Asociados'
CSS_ARCHIVO = 'https://fonts.googleapis.com/css2?family=Archivo:wght@600'
NAVEGADOR = ('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
             '(KHTML, like Gecko) Chrome/120.0 Safari/537.36')

VERDE, MARFIL, AMBAR, ROJO, TINTA = '#3f6e22', '#f2efe2', '#e89019', '#de3b22', '#1b1e17'

# Geometría, medida sobre el logotipo original y expresada en un icono de
# 200 unidades. El corte de la esquina no es de 45°: baja 43 y retrocede 27.
ICONO, HUECO = 200, 57
ANCHO_CONTENIDO = 5.57 * ICONO      # contenido / icono, medido en el original
CORTE_Y, CORTE_X = 157, 27


def descarga_archivo():
    """El subconjunto latino de Archivo SemiBold, de Google Fonts."""
    pet = urllib.request.Request(CSS_ARCHIVO, headers={'User-Agent': NAVEGADOR})
    css = urllib.request.urlopen(pet, timeout=60).read().decode('utf-8')
    # El CSS trae un bloque por subconjunto; el latino es el que nos toca.
    partes = re.split(r'/\*\s*([\w-]+)\s*\*/', css)
    for i in range(1, len(partes), 2):
        if partes[i].strip() == 'latin':
            m = re.search(r'url\((https://[^)]+\.woff2)\)', partes[i + 1])
            if m:
                return urllib.request.urlopen(m.group(1), timeout=60).read()
    raise SystemExit('El CSS de Google Fonts no trae el subconjunto latino.')


def trazos(woff2, texto=None):
    """Devuelve (d del texto, d del ampersand, ancho, altura de caja alta)."""
    texto = NOMBRE if texto is None else texto
    import uharfbuzz as hb
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.misc.transform import Identity
    import io

    tt = TTFont(io.BytesIO(woff2))
    crudo = io.BytesIO()
    tt.flavor = None
    tt.save(crudo)

    cara = hb.Face(crudo.getvalue())
    buf = hb.Buffer()
    buf.add_str(texto)
    buf.guess_segment_properties()
    hb.shape(hb.Font(cara), buf, {'kern': True, 'liga': True})

    glifos, orden = tt.getGlyphSet(), tt.getGlyphOrder()
    gid_amp = tt.getGlyphID(tt.getBestCmap()[ord('&')])

    x, piezas = 0.0, {'texto': [], 'amp': []}
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        pluma = SVGPathPen(glifos)
        # La y de SVG crece hacia abajo; la de la fuente, hacia arriba.
        tp = TransformPen(pluma, Identity.translate(x + pos.x_offset, pos.y_offset).scale(1, -1))
        glifos[orden[info.codepoint]].draw(tp)
        d = pluma.getCommands()
        if d:
            piezas['amp' if info.codepoint == gid_amp else 'texto'].append(d)
        x += pos.x_advance

    caja_alta = getattr(tt['OS/2'], 'sCapHeight', None) or 686
    return ' '.join(piezas['texto']), ' '.join(piezas['amp']), x, caja_alta


def monograma(escala):
    """Las tres piezas de dentro del icono, con el verde o sin él."""
    e = lambda v: round(v * escala, 2)
    return (
        '  <rect fill="%s" x="%s" y="%s" width="%s" height="%s"/>\n'
        '  <rect fill="%%s" x="%s" y="%s" width="%s" height="%s"/>\n'
        '  <rect fill="%s" x="%s" y="%s" width="%s" height="%s"/>\n'
        % (ROJO, e(58), e(38), e(28), e(22),
           e(58), e(64), e(28), e(52),
           AMBAR, e(58), e(116), e(85), e(24))
    )


# ---------------------------------------------------------------
# PRESUPUESTA
# El catálogo de precios tiene nombre propio, y su marca es hermana
# de la del estudio: la misma plancha verde con la esquina cortada y
# la misma paleta, con una P en lugar de la L. Las medidas están
# tomadas del original y expresadas en el mismo icono de 200.
# ---------------------------------------------------------------

def pe(escala):
    """Las cuatro piezas de la P. El marfil queda parametrizado, igual que
       en el monograma, porque sin plancha verde tiene que volverse verde:
       sobre fondo claro un bloque marfil no se ve."""
    e = lambda v: round(v * escala, 2)
    return (
        '  <rect fill="%s" x="%s" y="%s" width="%s" height="%s"/>\n'      # asta
        '  <rect fill="%%s" x="%s" y="%s" width="%s" height="%s"/>\n'     # alto del ojo
        '  <rect fill="%s" x="%s" y="%s" width="%s" height="%s"/>\n'      # costado
        '  <rect fill="%%s" x="%s" y="%s" width="%s" height="%s"/>\n'     # base del ojo
        % (AMBAR, e(53.4), e(38.0), e(23.8), e(92.6),
           e(77.2), e(38.0), e(32.8), e(22.8),
           ROJO, e(110.0), e(38.0), e(24.0), e(45.4),
           e(77.2), e(83.4), e(56.8), e(22.4))
    )


def main():
    woff2 = descarga_archivo()
    d_texto, d_amp, ancho, caja_alta = trazos(woff2)

    ancho_texto = ANCHO_CONTENIDO - ICONO - HUECO
    escala = ancho_texto / ancho
    base = 100 + (caja_alta * escala) / 2      # caja alta centrada sobre el icono
    total = round(ICONO + HUECO + ancho_texto)

    firma = ('<!-- Ingenieros Liberato & Asociados · %s\n'
             '     Verde #3F6E22 · Marfil #F2EFE2 · Ámbar #E89019 · Rojo #DE3B22 · Tinta #1B1E17\n'
             '     Generado por herramientas/logo-a-trazos.py -->\n')

    logo = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
        'role="img" aria-label="Ingenieros Liberato &amp; Asociados">\n' % (total, ICONO)
        + firma % 'el nombre en Archivo SemiBold (600), convertido a trazos'
        + '  <path fill="%s" d="M0 0h%dv%dL%d %dH0z"/>\n'
          % (VERDE, ICONO, CORTE_Y, ICONO - CORTE_X, ICONO)
        + monograma(1) % MARFIL
        + '  <g transform="translate(%d %.1f) scale(%.5f)">\n' % (ICONO + HUECO, base, escala)
        + '    <path fill="%s" d="%s"/>\n' % (TINTA, d_texto)
        + '    <path fill="%s" d="%s"/>\n' % (VERDE, d_amp)
        + '  </g>\n</svg>\n')

    m = ICONO / 2  # el icono suelto va en un lienzo de 100
    isotipo = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" '
        'role="img" aria-label="Ingenieros Liberato &amp; Asociados">\n'
        + firma % 'solo el icono: favicon y usos cuadrados'
        + '  <path fill="%s" d="M0 0h100v%sL%s 100H0z"/>\n'
          % (VERDE, round(CORTE_Y / 2, 1), round((ICONO - CORTE_X) / 2, 1))
        + monograma(0.5) % MARFIL
        + '</svg>\n')

    agua = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">\n'
        + firma % 'el monograma SIN la plancha verde'
        + '  <!-- Sobre papel un cuadro lleno se lee como un bloque y no como la\n'
          '       marca, así que la marca de agua deja fuera el fondo verde. -->\n'
        + monograma(0.5) % VERDE
        + '</svg>\n')

    # ---------- Presupuesta ----------
    d_pre, _, ancho_pre, _ = trazos(woff2, 'Presupuesta')
    ancho_texto_pre = ANCHO_CONTENIDO - ICONO - HUECO
    escala_pre = (caja_alta * escala) / caja_alta          # mismo cuerpo que el nombre del estudio
    ancho_pre_esc = ancho_pre * escala_pre
    total_pre = round(ICONO + HUECO + ancho_pre_esc)

    firma_pre = ('<!-- Presupuesta · %s\n'
                 '     La marca del catálogo de precios, hermana de la del estudio:\n'
                 '     misma plancha, misma paleta, una P en lugar de la L.\n'
                 '     Generado por herramientas/logo-a-trazos.py -->\n')

    pre_logo = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
        'role="img" aria-label="Presupuesta">\n' % (total_pre, ICONO)
        + firma_pre % 'el icono y el nombre en Archivo SemiBold (600), a trazos'
        + '  <!-- Sin plancha verde: este bloque va al lado del logotipo del\n'
          '       estudio, que sí la lleva, y dos planchas seguidas se leen como\n'
          '       dos marcas peleando. La P suelta, en cambio, se lee como lo que\n'
          '       es: la marca de la casa aplicada al catálogo. -->\n'
        + pe(1) % (VERDE, VERDE)
        + '  <g transform="translate(%d %.1f) scale(%.5f)">\n' % (ICONO + HUECO, base, escala_pre)
        + '    <path fill="%s" d="%s"/>\n' % (TINTA, d_pre)
        + '  </g>\n</svg>\n')

    pre_isotipo = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" '
        'role="img" aria-label="Presupuesta">\n'
        + firma_pre % 'solo el icono: favicon y usos cuadrados'
        + '  <path fill="%s" d="M0 0h100v%sL%s 100H0z"/>\n'
          % (VERDE, round(CORTE_Y / 2, 1), round((ICONO - CORTE_X) / 2, 1))
        + pe(0.5) % (MARFIL, MARFIL)
        + '</svg>\n')

    pre_marca = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">\n'
        + firma_pre % 'la P SIN la plancha verde, para ir junto a un texto'
        + '  <!-- Mismo criterio que marca-agua.svg: sin plancha, el marfil se\n'
          '       vuelve verde, porque sobre fondo claro no se vería. El ojo de\n'
          '       la P lo hace el hueco, no una pieza. -->\n'
        + pe(0.5) % (VERDE, VERDE)
        + '</svg>\n')

    for carpeta in DESTINOS:
        carpeta.mkdir(parents=True, exist_ok=True)
        (carpeta / 'logo.svg').write_text(logo, encoding='utf-8')
        (carpeta / 'isotipo.svg').write_text(isotipo, encoding='utf-8')
        (carpeta / 'marca-agua.svg').write_text(agua, encoding='utf-8')
        (carpeta / 'presupuesta.svg').write_text(pre_logo, encoding='utf-8')
        (carpeta / 'presupuesta-isotipo.svg').write_text(pre_isotipo, encoding='utf-8')
        (carpeta / 'presupuesta-marca.svg').write_text(pre_marca, encoding='utf-8')

    print('Lienzo %d x %d · cuerpo %.1f · caja alta %.1f · base y=%.1f'
          % (total, ICONO, escala * 1000, caja_alta * escala, base))
    print('Presupuesta: lienzo %d x %d' % (total_pre, ICONO))
    print('Escritos logo.svg, isotipo.svg, marca-agua.svg,')
    print('  presupuesta.svg, presupuesta-isotipo.svg y presupuesta-marca.svg en:')
    for c in DESTINOS:
        print('   ' + str(c.relative_to(RAIZ)))
    print('\nFalta rasterizar la vista previa y el icono de iOS, que no aceptan SVG:')
    print('   node herramientas/rasterizar-marca.js')


if __name__ == '__main__':
    try:
        main()
    except ImportError as e:
        print('Falta una dependencia (%s).\n'
              'Instalarlas con:  pip install fonttools brotli uharfbuzz' % e, file=sys.stderr)
        sys.exit(2)
