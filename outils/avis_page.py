"""La micro-page des avis : double-cliquer sur « Avis Bilskirnir.bat » (ou python outils/avis_page.py).

Elle tourne sur ce PC seulement (127.0.0.1) et s'ouvre dans le navigateur : la liste des avis de la boutique,
un formulaire pour en ajouter ou en corriger un. Fermer la fenêtre noire arrête la page.
Même clé que avis.py (outils/.env).
"""
import json
import secrets
import sys
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import avis

PAGE = Path(__file__).with_name("avis_page.html")
# Seule la page servie ici connaît ce jeton : un autre site ouvert dans le navigateur ne peut pas écrire d'avis.
JETON = secrets.token_urlsafe(24)


def enregistrer(ligne):
    """Vérifie puis envoie un avis. Renvoie (handle, erreurs)."""
    ligne = {cle: str(ligne.get(cle, "")).strip() for cle in avis.COLONNES}
    erreurs = [e.split(" : ", 1)[1] for e in avis.verifier(ligne, 0)]
    ids = avis.livres()
    if ligne["livre"] and ligne["livre"] not in ids:
        erreurs.append(f"livre inconnu « {ligne['livre']} »")
    if erreurs:
        return None, erreurs
    ligne["handle"] = ligne["handle"] or avis.fabriquer_handle(ligne["auteur"], ligne["titre"])
    return ligne["handle"], [p["message"] for p in avis.envoyer(ligne, ids)]


class Page(BaseHTTPRequestHandler):
    def repondre(self, code, corps, type_="application/json; charset=utf-8"):
        donnees = corps if isinstance(corps, bytes) else json.dumps(corps, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", type_)
        self.send_header("Content-Length", str(len(donnees)))
        self.end_headers()
        self.wfile.write(donnees)

    def appel_shopify(self, fonction):
        # avis.py s'arrête par sys.exit sur un refus de Shopify : ici on renvoie le message à la page.
        try:
            self.repondre(200, fonction())
        except SystemExit as arret:
            self.repondre(502, {"erreurs": [str(arret)]})
        except Exception as erreur:  # réseau coupé, etc.
            self.repondre(502, {"erreurs": [f"Shopify ne répond pas : {erreur}"]})

    def do_GET(self):
        if self.path == "/":
            html = PAGE.read_text(encoding="utf-8").replace("__JETON__", JETON)
            self.repondre(200, html.encode(), "text/html; charset=utf-8")
        elif self.path == "/donnees":
            self.appel_shopify(lambda: {
                "livres": [{"handle": h, "titre": l["titre"]} for h, l in avis.livres().items()],
                "avis": avis.lire_avis(),
            })
        else:
            self.repondre(404, {"erreurs": ["page inconnue"]})

    def do_POST(self):
        if self.path != "/avis" or self.headers.get("X-Jeton") != JETON:
            return self.repondre(403, {"erreurs": ["refusé"]})
        ligne = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")

        def envoi():
            handle, erreurs = enregistrer(ligne)
            return {"handle": handle, "erreurs": erreurs}
        self.appel_shopify(envoi)

    def log_message(self, *args):
        pass  # la fenêtre noire reste lisible


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    avis.jeton()  # sans clé valable, on s'arrête tout de suite avec un message clair
    serveur = ThreadingHTTPServer(("127.0.0.1", 0), Page)
    adresse = f"http://127.0.0.1:{serveur.server_port}/"
    print(f"Les avis Bilskirnir sont ouverts dans ton navigateur : {adresse}")
    print("Ferme cette fenêtre quand tu as fini.")
    webbrowser.open(adresse)
    serveur.serve_forever()
