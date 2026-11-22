# Page « Importer des avis »

Page de l'admin Shopify (Applications › Import Avis), hébergée par Shopify, sans serveur.
Gautier y glisse un CSV d'avis, vérifie l'aperçu, puis publie : chaque ligne devient un métaobjet `avis`.

- `src/avis.js` : lecture du CSV (Excel français ou UTF-8, `;` ou `,`) et vérification des lignes.
- `src/AppHome.jsx` : la page (zone de dépôt, aperçu, publication via l'API Admin).
- Tests : `node extensions/page-avis/test/avis.test.mjs`.
- Publier une nouvelle version : `npx shopify app deploy` depuis `import-avis/` (CLI locale 5.0.1).

Modèle de fichier : `docs/modele-avis.csv` (Shopify refuse les `.csv` dans les ressources d'une application).
