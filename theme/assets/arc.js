// Page d'un arc ou d'un livre : la barre d'achat apparaît quand le bloc d'achat du haut a quitté l'écran par le haut.
// Elle s'efface dès qu'un autre bouton d'achat (« Prêt à commencer ? ») ou le pied de page est à l'écran :
// jamais deux boutons à la fois, et jamais posée sur le pied de page.
const achat = document.getElementById('arc-achat');
const barre = document.querySelector('.arc__barre');

if (achat && barre) {
  let achatPasse = false;
  const enVue = new Set();

  const montrer = () => {
    const visible = achatPasse && enVue.size === 0;
    barre.classList.toggle('visible', visible);
    barre.toggleAttribute('inert', !visible);
    barre.setAttribute('aria-hidden', String(!visible));
  };

  new IntersectionObserver(([entree]) => {
    achatPasse = !entree.isIntersecting && entree.boundingClientRect.top < 0;
    montrer();
  }).observe(achat);

  const autres = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => (e.isIntersecting ? enVue.add(e.target) : enVue.delete(e.target)));
    montrer();
  });
  document.querySelectorAll('.arc-appel, .pied').forEach((el) => autres.observe(el));
}
