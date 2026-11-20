// Indicateur de l'accueil : un point par écran, collé au bord droit.
// Le point de l'écran en cours s'étire, à la couleur de son histoire (--teinte, sinon l'or).
// Les points se construisent depuis les écrans présents (.ecran[data-nom]) : ajouter, retirer
// ou déplacer une histoire dans l'éditeur suffit. Styles : base.css (« Indicateur de l'accueil »).

const indicateur = document.createElement('nav');
indicateur.className = 'indicateur';
indicateur.setAttribute('aria-label', "Écrans de l'accueil");
document.body.append(indicateur);

// L'écran en cours est celui qui traverse la ligne du milieu de la vue (même principe que reveal.js).
const suivi = new IntersectionObserver(
  (entrees) => {
    for (const entree of entrees) {
      if (!entree.isIntersecting) continue;
      indicateur.querySelectorAll('a').forEach((point) => {
        const actif = point.ecran === entree.target;
        point.classList.toggle('actif', actif);
        point.toggleAttribute('aria-current', actif);
      });
    }
  },
  { root: document, rootMargin: '-50% 0px -50% 0px' }
);

function construire() {
  suivi.disconnect();
  indicateur.replaceChildren();

  for (const ecran of document.querySelectorAll('.ecran[data-nom]')) {
    const point = document.createElement('a');
    point.href = '#' + ecran.closest('.shopify-section').id;
    point.ecran = ecran;
    point.innerHTML = '<span></span>';
    point.firstChild.textContent = ecran.dataset.nom;
    const teinte = getComputedStyle(ecran).getPropertyValue('--teinte').trim();
    if (teinte) point.style.setProperty('--point', teinte);
    indicateur.append(point);
    suivi.observe(ecran);
  }
}

construire();

// Dans l'éditeur de thème, les sections se rechargent, s'ajoutent ou se déplacent.
for (const evenement of ['shopify:section:load', 'shopify:section:unload', 'shopify:section:reorder']) {
  document.addEventListener(evenement, () => requestAnimationFrame(construire));
}
