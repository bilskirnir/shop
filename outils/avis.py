"""Les avis des lecteurs, depuis un tableur sur le PC.

    python outils/avis.py exporter avis.csv    # les avis de Shopify → avis.csv (à ouvrir dans Excel)
    python outils/avis.py importer avis.csv    # avis.csv → Shopify : crée les nouveaux, met à jour les autres

Une ligne par avis, colonnes :
    handle   identifiant de l'avis ; laisser vide pour un nouvel avis (il se fabrique depuis l'auteur et le titre)
    livre    l'adresse Shopify du livre, ex. l-eau-et-du-sang-tome-1
    note     1 à 5
    titre, texte, auteur, source (ex. Amazon), verifie (oui / non)
Réimporter le même fichier ne crée pas de doublon : un avis est retrouvé par son handle.

La clé : dans Shopify, Paramètres › Applications › Développer des applications, une application « Import avis »
avec les droits read_products, read_metaobjects et write_metaobjects. Copier son jeton d'accès Admin API dans
outils/.env (jamais commité) :
    SHOPIFY_ADMIN_TOKEN=shpat_...
"""
import csv
import io
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

BOUTIQUE = "bilskirnir-2.myshopify.com"
VERSION_API = "2025-07"
COLONNES = ["handle", "livre", "note", "titre", "texte", "auteur", "source", "verifie"]


# ---------- Fonctions pures (testées dans outils/test_avis.py) ----------

def fabriquer_handle(auteur, titre):
    """« Pierre G. » + « Des héros attachants » → « pierre-g-des-heros-attachants »."""
    texte = unicodedata.normalize("NFD", f"{auteur} {titre}").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", texte).strip("-")[:60] or "avis"


def lire_csv(chemin):
    """Lit un CSV d'Excel : séparateur ; ou , et encodage UTF-8 ou Windows (Excel français), au choix."""
    brut = Path(chemin).read_bytes()
    try:
        texte = brut.decode("utf-8-sig")
    except UnicodeDecodeError:
        texte = brut.decode("cp1252")
    separateur = ";" if texte.split("\n", 1)[0].count(";") >= texte.split("\n", 1)[0].count(",") else ","
    # io.StringIO et pas splitlines() : un texte d'avis sur plusieurs lignes garde ses retours à la ligne.
    lignes = list(csv.DictReader(io.StringIO(texte, newline=""), delimiter=separateur))
    return [{k.strip().lower(): (v or "").replace("\r\n", "\n").strip() for k, v in ligne.items() if k} for ligne in lignes]


def verifier(ligne, rang):
    """Les erreurs d'une ligne, en clair ; liste vide si elle est bonne."""
    erreurs = []
    if not ligne.get("livre"):
        erreurs.append("le livre manque")
    if ligne.get("note") not in {"1", "2", "3", "4", "5"}:
        erreurs.append(f"note « {ligne.get('note')} » : il faut 1 à 5")
    if not ligne.get("texte"):
        erreurs.append("le texte manque")
    return [f"ligne {rang} : {e}" for e in erreurs]


# ---------- Shopify ----------

def jeton():
    env = Path(__file__).with_name(".env")
    if env.exists():
        for ligne in env.read_text(encoding="utf-8").splitlines():
            if ligne.startswith("SHOPIFY_ADMIN_TOKEN="):
                return ligne.split("=", 1)[1].strip()
    sys.exit("Pas de clé : créer outils/.env avec SHOPIFY_ADMIN_TOKEN=... (voir en haut de ce fichier).")


def graphql(requete, variables=None):
    demande = urllib.request.Request(
        f"https://{BOUTIQUE}/admin/api/{VERSION_API}/graphql.json",
        data=json.dumps({"query": requete, "variables": variables or {}}).encode(),
        headers={"Content-Type": "application/json", "X-Shopify-Access-Token": jeton()},
    )
    with urllib.request.urlopen(demande) as reponse:
        donnees = json.load(reponse)
    if donnees.get("errors"):
        sys.exit(f"Shopify refuse : {donnees['errors']}")
    return donnees["data"]


def livres():
    """{handle du livre: id Shopify} pour tous les produits."""
    data = graphql("{ products(first: 250) { nodes { id handle } } }")
    return {p["handle"]: p["id"] for p in data["products"]["nodes"]}


def exporter(chemin):
    data = graphql("""{ metaobjects(type: "avis", first: 250) { nodes {
        handle fields { key value reference { ... on Product { handle } } } } } }""")
    with open(chemin, "w", encoding="utf-8-sig", newline="") as f:
        sortie = csv.DictWriter(f, fieldnames=COLONNES, delimiter=";")
        sortie.writeheader()
        for avis in data["metaobjects"]["nodes"]:
            champs = {c["key"]: c for c in avis["fields"]}
            valeur = lambda cle: (champs.get(cle) or {}).get("value") or ""
            livre = ((champs.get("livre") or {}).get("reference") or {}).get("handle", "")
            sortie.writerow({
                "handle": avis["handle"], "livre": livre, "note": valeur("note"), "titre": valeur("titre"),
                "texte": valeur("texte"), "auteur": valeur("auteur"), "source": valeur("source"),
                "verifie": "oui" if valeur("verifie") == "true" else "non",
            })
    print(f"{len(data['metaobjects']['nodes'])} avis écrits dans {chemin}")


def importer(chemin):
    lignes = lire_csv(chemin)
    erreurs = [e for rang, ligne in enumerate(lignes, start=2) for e in verifier(ligne, rang)]
    ids = livres()
    erreurs += [f"ligne {rang} : livre inconnu « {l['livre']} »" for rang, l in enumerate(lignes, start=2)
                if l.get("livre") and l["livre"] not in ids]
    if erreurs:
        sys.exit("Rien n'est envoyé, à corriger d'abord :\n  " + "\n  ".join(erreurs))

    for ligne in lignes:
        ligne["handle"] = ligne.get("handle") or fabriquer_handle(ligne.get("auteur", ""), ligne.get("titre", ""))
        print(f"  {ligne['handle']} : {ligne['note']}/5 · {ligne['livre']}")
    if input(f"Envoyer ces {len(lignes)} avis dans Shopify ? (o/N) ").strip().lower() != "o":
        sys.exit("Rien n'a été envoyé.")

    for ligne in lignes:
        champs = {
            "livre": ids[ligne["livre"]], "note": ligne["note"], "texte": ligne["texte"],
            "titre": ligne.get("titre", ""), "auteur": ligne.get("auteur", ""), "source": ligne.get("source", ""),
            "verifie": "true" if ligne.get("verifie", "").lower() in {"oui", "vrai", "true", "1"} else "false",
        }
        data = graphql(
            """mutation($handle: MetaobjectHandleInput!, $avis: MetaobjectUpsertInput!) {
                 metaobjectUpsert(handle: $handle, metaobject: $avis) { userErrors { field message } } }""",
            {"handle": {"type": "avis", "handle": ligne["handle"]},
             "avis": {"fields": [{"key": k, "value": v} for k, v in champs.items() if v != ""],
                      "capabilities": {"publishable": {"status": "ACTIVE"}}}},
        )
        problemes = data["metaobjectUpsert"]["userErrors"]
        print(f"  {'refusé' if problemes else 'ok'} {ligne['handle']}" + (f" : {problemes}" if problemes else ""))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")  # la console Windows abîme sinon les accents
    if len(sys.argv) != 3 or sys.argv[1] not in {"exporter", "importer"}:
        sys.exit(__doc__)
    exporter(sys.argv[2]) if sys.argv[1] == "exporter" else importer(sys.argv[2])
