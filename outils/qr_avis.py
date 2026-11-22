"""Les QR codes à imprimer à la fin de chaque livre : ils mènent à sa page d'avis (/products/<livre>?view=avis).

Usage : python outils/qr_avis.py [domaine]      (par défaut : bilskirnir-2.myshopify.com)
Écrit un SVG par livre dans docs/qr-avis/ : vectoriel, net à toute taille d'impression.
Un nouveau livre : ajouter son adresse Shopify (handle) dans LIVRES.
"""
import sys
from pathlib import Path

import qrcode
import qrcode.image.svg

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
dossier = Path(__file__).resolve().parent.parent / "docs" / "qr-avis"
dossier.mkdir(parents=True, exist_ok=True)

for livre in LIVRES:
    adresse = f"https://{domaine}/products/{livre}?view=avis"
    # Correction M : le code reste lisible même un peu abîmé ou imprimé petit.
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2)
    qr.add_data(adresse)
    qr.make(fit=True)
    qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(dossier / f"{livre}.svg")
    print(adresse)
