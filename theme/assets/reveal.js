// Deux effets au défilement de l'accueil, par IntersectionObserver :
// 1. le texte de chaque écran monte une fois à son arrivée ([data-reveal] reçoit is-active) ;
// 2. ce qui est propre à une histoire (.fondu : image de fond, neige) apparaît en fondu tant que son écran
//    passe sous la ligne du milieu de la vue, puis disparaît (is-visible).
// Le CSS fait les transitions. Sans ce script, le texte reste visible et les .fondu restent cachés.
document.documentElement.classList.add('reveal-pret');

const apparition = new IntersectionObserver(
  (entrees) => {
    for (const entree of entrees) {
      if (entree.isIntersecting) {
        entree.target.classList.add('is-active');
        apparition.unobserve(entree.target);
      }
    }
  },
  { threshold: 0.35 }
);

const fondu = new IntersectionObserver(
  (entrees) => {
    for (const entree of entrees) {
      entree.target.querySelectorAll('.fondu').forEach((element) => element.classList.toggle('is-visible', entree.isIntersecting));
    }
  },
  // La « vue » est réduite à sa ligne du milieu : un seul écran à la fois la traverse, quelle que soit sa hauteur.
  // root: document est explicite, sinon le navigateur ignore rootMargin dans un cadre d'un autre domaine
  // (l'aperçu de l'éditeur de thème) et chaque fond déborde sur les écrans voisins.
  { root: document, rootMargin: '-50% 0px -50% 0px' }
);

function observer(racine) {
  racine.querySelectorAll('[data-reveal]').forEach((element) => apparition.observe(element));
  racine.querySelectorAll('.histoire:has(.fondu)').forEach((ecran) => fondu.observe(ecran));
}

observer(document);

// Dans l'éditeur de thème, une section modifiée est ré-affichée : on observe ses nouveaux éléments.
document.addEventListener('shopify:section:load', (event) => observer(event.target));
