// Deux effets au défilement de l'accueil, par IntersectionObserver :
// 1. le texte de chaque écran monte une fois à son arrivée ([data-reveal] reçoit is-active) ;
// 2. l'image de fond d'une histoire (.histoire__fond) apparaît en fondu tant que son écran
//    passe sous la ligne du milieu de la vue, puis disparaît (is-visible).
// Le CSS fait les transitions. Sans ce script, le texte reste visible et les fonds restent cachés.
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
      entree.target.querySelector('.histoire__fond').classList.toggle('is-visible', entree.isIntersecting);
    }
  },
  // La « vue » est réduite à sa ligne du milieu : un seul écran à la fois la traverse, quelle que soit sa hauteur.
  { rootMargin: '-50% 0px -50% 0px' }
);

function observer(racine) {
  racine.querySelectorAll('[data-reveal]').forEach((element) => apparition.observe(element));
  racine.querySelectorAll('.histoire__fond').forEach((fond) => fondu.observe(fond.closest('.histoire')));
}

observer(document);

// Dans l'éditeur de thème, une section modifiée est ré-affichée : on observe ses nouveaux éléments.
document.addEventListener('shopify:section:load', (event) => observer(event.target));
