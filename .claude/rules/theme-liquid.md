# Thème Liquid (`theme/`) — pièges payés

> Écrit le 20/11/2026, pendant le chantier de l'accueil.

## `shopify theme dev` rate des envois sans prévenir

Trois fois dans la même session : un fichier modifié n'est jamais envoyé, ou un fichier neuf arrive **vide** sur le thème de dev (envoyé pendant son écriture). Le rendu ment alors en silence.

**Comment faire :** après chaque modification, vérifier dans le journal du serveur la ligne `Synced » update <fichier>`, ou chercher la nouvelle classe dans `curl http://127.0.0.1:9292/`. En cas de doute, envoyer à la main sur le thème de dev :
`shopify theme push --store bilskirnir-2 --theme 200840675715 --path theme --only <fichier>`.
Ne pas écrire un fichier neuf avec un heredoc pendant que le serveur tourne sans vérifier sa taille côté serveur (`shopify theme pull --only`).

## Ne jamais écraser les réglages d'Uriel sur le thème non publié

Uriel règle l'accueil dans l'éditeur du thème non publié (200840970627). Un `theme push` y envoie toujours avec :
`--ignore "templates/*.json" --ignore "config/settings_data.json" --ignore "sections/*-group.json"`.
Pour modifier ces fichiers, d'abord `shopify theme pull --only` puis fusionner.

## Liquid et données Shopify (vérifié par sonde)

- Un réglage `metaobject` dans un template JSON prend le **handle seul** (`"fracture"`, pas `"saga.fracture"`).
- `saga.ordre_des_tomes.value` se parcourt en boucle mais **ne s'indexe pas** : `[0]` et `.first` sont vides.
- La vitrine est protégée par mot de passe : `theme dev` demande `--store-password`.
