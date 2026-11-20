// Page d'un arc : la barre d'achat apparaît quand le bloc d'achat du haut a quitté l'écran par le haut,
// et disparaît quand on y revient (inutile d'avoir deux boutons à l'écran).
const achat = document.getElementById('arc-achat');
const barre = document.querySelector('.arc__barre');

if (achat && barre) {
  new IntersectionObserver(([entree]) => {
    const visible = !entree.isIntersecting && entree.boundingClientRect.top < 0;
    barre.classList.toggle('visible', visible);
    barre.toggleAttribute('inert', !visible);
    barre.setAttribute('aria-hidden', String(!visible));
  }).observe(achat);
}
