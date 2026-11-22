"""Vérifie les fonctions pures de outils/avis.py : python outils/test_avis.py"""
import tempfile
from pathlib import Path

from avis import fabriquer_handle, lire_csv, verifier

assert fabriquer_handle("Pierre G.", "Des héros attachants") == "pierre-g-des-heros-attachants"
assert fabriquer_handle("", "") == "avis"

# Excel français : points-virgules, encodage Windows.
with tempfile.TemporaryDirectory() as d:
    fichier = Path(d) / "avis.csv"
    fichier.write_bytes("handle;livre;note;titre;texte\n;salvation;5;Épique;Un régal\n".encode("cp1252"))
    lignes = lire_csv(fichier)
    assert lignes == [{"handle": "", "livre": "salvation", "note": "5", "titre": "Épique", "texte": "Un régal"}], lignes

    # Google Sheets : virgules, UTF-8.
    fichier.write_text("livre,note,texte\nberserker,4,\"Bien, vraiment\"\n", encoding="utf-8")
    assert lire_csv(fichier)[0]["texte"] == "Bien, vraiment"

    # Un avis sur deux lignes, entre guillemets, garde son retour à la ligne.
    fichier.write_text('livre;note;texte\nsalvation;5;"Ligne un\nLigne deux"\n', encoding="utf-8")
    assert lire_csv(fichier)[0]["texte"] == "Ligne un\nLigne deux", lire_csv(fichier)

assert verifier({"livre": "salvation", "note": "5", "texte": "ok"}, 2) == []
assert verifier({"livre": "", "note": "6", "texte": ""}, 3) == [
    "ligne 3 : le livre manque", "ligne 3 : note « 6 » : il faut 1 à 5", "ligne 3 : le texte manque"]

print("ok")
