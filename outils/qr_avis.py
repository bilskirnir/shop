"""Les QR codes à imprimer à la fin de chaque livre : ils mènent à sa page d'avis (/products/<livre>?view=avis).

Usage : python outils/qr_avis.py [domaine]      (par défaut : bilskirnir-2.myshopify.com)
Écrit un SVG et un PNG (2000 px, 6 cm à 850 dpi) par livre dans docs/qr-avis/ : modules arrondis, logo (logo.svg)
au centre sur fond blanc. Le PNG est rendu par Edge, pour qu'il soit identique au SVG (le logo y est une image SVG).
Un nouveau livre : ajouter son adresse Shopify (handle) dans LIVRES.
"""
import base64
import subprocess
import sys
from pathlib import Path

import qrcode

LIVRES = [
    "l-eau-et-du-sang-tome-1",
    "de-leau-et-du-sang-tome-2",
    "fracture-tome-1",
    "fracture-tome-2",
    "salvation",
    "au-nom-des-dieux-crepuscule-dun-monde-livre-1-le-reveil",
    "au-nom-des-dieux-crepuscule-dun-monde-livre-2-linvasion",
    "berserker",
    "parmi-ces-mondes-ici-bas",
    "guide-d-ecriture-creer-des-personnages-emblematiques",
]

domaine = sys.argv[1] if len(sys.argv) > 1 else "bilskirnir-2.myshopify.com"
racine = Path(__file__).resolve().parent.parent
dossier = racine / "docs" / "qr-avis"
dossier.mkdir(parents=True, exist_ok=True)
logo = "data:image/svg+xml;base64," + base64.b64encode((racine / "logo.svg").read_bytes()).decode()

MARGE = 3      # zone de silence, en modules (4 recommandés, 3 tient sur papier blanc)
PX = 2000      # côté du PNG
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
LOGO = 0.24    # côté du carré du logo / côté du code : 6 % de surface masquée, la correction H en tolère 30


def svg_qr(adresse):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
    qr.add_data(adresse)
    qr.make(fit=True)
    m = qr.get_matrix()
    n = len(m)
    cote = round(n * LOGO) | 1          # impair : centré sur la grille
    debut = (n - cote) // 2
    yeux = [(0, 0), (n - 7, 0), (0, n - 7)]

    def dans_oeil(x, y):
        return any(ox <= x < ox + 7 and oy <= y < oy + 7 for ox, oy in yeux)

    def au_centre(x, y):
        return debut - 1 <= x <= debut + cote and debut - 1 <= y <= debut + cote

    t = n + 2 * MARGE
    o = MARGE
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {t} {t}" width="{PX}" height="{PX}">',
           f'<rect width="{t}" height="{t}" rx="{MARGE}" fill="#fff"/>']
    for y in range(n):
        for x in range(n):
            if m[y][x] and not dans_oeil(x, y) and not au_centre(x, y):
                out.append(f'<rect x="{x + o + .06}" y="{y + o + .06}" width=".88" height=".88" rx=".34"/>')
    for ox, oy in yeux:
        out.append(f'<rect x="{ox + o + .5}" y="{oy + o + .5}" width="6" height="6" rx="1.8" fill="none" stroke="#000"/>')
        out.append(f'<rect x="{ox + o + 2}" y="{oy + o + 2}" width="3" height="3" rx=".9"/>')
    c = debut + o - 1
    out.append(f'<rect x="{c}" y="{c}" width="{cote + 2}" height="{cote + 2}" rx="1.6" fill="#fff"/>')
    out.append(f'<image href="{logo}" x="{c + .7}" y="{c + .7}" width="{cote + .6}" height="{cote + .6}"/>')
    out.append("</svg>")
    return "\n".join(out)


for livre in LIVRES:
    adresse = f"https://{domaine}/products/{livre}?view=avis"
    svg = dossier / f"{livre}.svg"
    svg.write_text(svg_qr(adresse), encoding="utf-8")
    subprocess.run([EDGE, "--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                    f"--window-size={PX},{PX}", f"--screenshot={dossier / f'{livre}.png'}", svg.as_uri()],
                   check=True, capture_output=True)
    print(adresse)
