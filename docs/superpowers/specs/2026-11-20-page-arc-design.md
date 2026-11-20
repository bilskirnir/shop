# Page Arc — design court

> 20/11/2026. Maquettes validées : `docs/maquette-2026-11-19/Arc.dc.html` (mobile) et `Arc-Desktop.dc.html`.

## Pourquoi

Le visiteur arrive de TikTok sans connaître les romans. L'accueil lui donne envie d'une histoire ; la page Arc doit l'amener à **prendre l'arc complet** (cadeau + livraison offerte), avec le Livre 1 seul en repli.

## Où vit la page

**La page web du métaobjet `saga`** (capacité « Pages web » de la définition, modèle `templates/metaobject/saga.json`). Toute saga créée a sa page, sans rien dupliquer ; l'accueil y mène déjà (`saga.system.url`).

Écarté : une collection par arc — l'ordre des livres et les textes vivraient à deux endroits, et les univers sont déjà des collections.

## Contenu (de haut en bas, comme la maquette)

1. **En-tête** : surtitre (« 2 livres · Le commencement », même calcul que l'accueil), titre, synopsis, « Écrit par » + auteur, note Amazon (réglages du thème existants), pastilles `tags`. Couvertures en éventail et halo à la couleur de la saga.
2. **Achat** : somme des prix des tomes (« 51 € »), phrase d'offre (réglage, défaut « L'arc complet, livraison offerte et un décapsuleur en cadeau. »), bouton or **« Prendre l'arc complet »** qui ajoute tous les tomes au panier en un envoi, lien « ou Livre 1 · 25 € » vers la fiche du livre 1.
3. **Les livres, dans l'ordre** : numéro, couverture, titre, prix, lien vers la fiche.
4. **Dans le même univers…** : les autres sagas du même `univers_parent`, avec « N livres · mention_de_lecture », lien vers leur page.

Une saga d'un seul livre n'a pas de page Arc : l'accueil mène déjà directement à la fiche du livre.

## Composants

La logique commune à l'écran Histoire de l'accueil (surtitre, auteur, couleur du halo) devient un seul snippet réutilisé par les deux, au lieu d'être recopiée.

## Hors code (admin, Uriel)

- Activer **Pages web** sur la définition Saga (préfixe d'adresse : `saga`).
- Produit **Décapsuleur** + réduction automatique « Achetez X, obtenez Y » qui l'offre avec un arc complet.
- La livraison offerte vient de la règle existante « dès 40 € ».

## Hors périmètre

Fiche Livre et panier (pages suivantes) ; le bouton mène pour l'instant à la page panier native.
