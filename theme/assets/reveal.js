// Fait monter le texte de chaque écran quand il arrive à l'écran : on pose la classe is-active,
// le CSS (base.css, « Apparitions ») fait la transition. Sans ce script, tout reste simplement visible.
document.documentElement.classList.add('reveal-pret');

const observateur = new IntersectionObserver(
  (entrees) => {
    for (const entree of entrees) {
      if (entree.isIntersecting) {
        entree.target.classList.add('is-active');
        observateur.unobserve(entree.target);
      }
    }
  },
  { threshold: 0.35 }
);

document.querySelectorAll('[data-reveal]').forEach((element) => observateur.observe(element));
