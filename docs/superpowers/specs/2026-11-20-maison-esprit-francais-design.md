# Écran « La maison » — esprit français et lettre (design court)

> Validé par Uriel le 20/11/2026. Maquette : `.superpowers/brainstorm/1683-1795179359/content/maison-pc-v4.html` (piste B).

## Pourquoi

Sur PC, la colonne de droite (pilule « à la française » + champ email) faisait pauvre et déséquilibrée face à la gauche. Uriel veut un côté éditorial — l'esprit français — et un vrai CTA d'inscription. L'inscrit reçoit les sorties, mais aussi les dates pour rencontrer la maison (salons, dédicaces) et des coulisses.

## Ce qui est construit (`theme/sections/maison.liquid`)

- **Gauche** : inchangée (logo, surtitre, présentation, salon, cartes personnes).
- **Droite, calée en bas** : « L'esprit français » — surtitre, titre Buenard, engagements en grille 2 colonnes, lien vers la page « à la française » (masqué si aucune page n'est choisie).
- **Dessous, pleine largeur, 40 px plus bas** : bandeau verre « La lettre de la maison » — surtitre, titre, texte à gauche ; champ email + bouton pilule or « Je m'inscris » à droite. Formulaire client Shopify natif, tag `newsletter`, messages succès/erreur conservés.
- **Mobile** : même ordre en une colonne ; bouton or pleine largeur.
- **Éditeur** : tous les textes réglables ; chaque engagement est un bloc (titre + texte). Valeurs par défaut tirées de la maquette `Valeurs-Desktop` (100 % indépendants, Faits et pensés en France, Jamais ennuyeux, Héroïsme et bravoure).

## Approches considérées

- A — carte « lettre » seule à droite, esprit français réduit à un lien : écartée, l'esprit français reste pauvre.
- **B — esprit français à droite + lettre en bandeau pleine largeur : retenue.**
- C — manifeste + petite carte d'inscription : CTA trop discret.

## Laissé au constructeur

Tailles exactes en `clamp()` entre mobile et PC ; la hauteur de l'écran doit continuer à laisser le pied de page visible sur un portable (≈ 800 px).

## Hors périmètre

La page « à la française » elle-même (chantier suivant, d'après `docs/maquette-2026-11-19/Valeurs-Desktop.dc.html`).
