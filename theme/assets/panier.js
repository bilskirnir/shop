// Le panier en tiroir (sections/panier.liquid).
// Les formulaires d'ajout et de quantité passent par l'API Ajax de Shopify ; la réponse rapporte le tiroir
// redessiné par Shopify (paramètre « sections »), qu'on remet en place avant de l'ouvrir.
// Sans ce script, les mêmes formulaires mènent à la page /cart : rien ne casse.
const tiroir = document.getElementById('panier');

if (tiroir) {
  // Remplace le contenu du tiroir par celui que Shopify vient de rendre, et met le compteur de l'en-tête à jour.
  const remplacer = (html) => {
    const neuf = new DOMParser().parseFromString(html, 'text/html').querySelector('.panier__contenu');
    tiroir.querySelector('.panier__contenu').replaceWith(neuf);

    const compte = Number(neuf.dataset.compte);
    const icone = document.querySelector('.entete__panier');
    let bulle = icone?.querySelector('.entete__compteur');
    if (icone && !bulle && compte > 0) {
      bulle = Object.assign(document.createElement('span'), { className: 'entete__compteur' });
      bulle.setAttribute('aria-hidden', 'true');
      icone.append(bulle);
    }
    if (bulle) bulle.textContent = compte;
    if (bulle && compte === 0) bulle.remove();
    icone?.querySelector('.visually-hidden')?.replaceChildren(`Panier, ${compte} article${compte > 1 ? 's' : ''}`);
  };

  // Ouvre le tiroir ; un autre panneau ouvert (le synopsis d'un livre) se ferme d'abord.
  const ouvrir = () => {
    document.querySelectorAll('dialog[open]').forEach((d) => d !== tiroir && d.close());
    if (!tiroir.open) tiroir.showModal();
  };

  // Un clic sur l'icône du panier ouvre le tiroir au lieu d'aller sur /cart.
  document.querySelector('.entete__panier')?.addEventListener('click', (e) => {
    e.preventDefault();
    ouvrir();
  });

  // Un clic sur le fond (hors du tiroir) le ferme.
  tiroir.addEventListener('click', (e) => {
    if (e.target === tiroir) tiroir.close();
  });

  document.addEventListener('submit', async (e) => {
    const formulaire = e.target;
    const action = formulaire.getAttribute('action') || '';
    if (!/\/cart\/(add|change)$/.test(action)) return;

    e.preventDefault();
    const donnees = new FormData(formulaire, e.submitter);
    donnees.append('sections', 'panier');

    try {
      const reponse = await fetch(`${action}.js`, {
        method: 'POST',
        body: donnees,
        headers: { Accept: 'application/json' },
      });
      if (!reponse.ok) throw new Error(reponse.status);
      const panier = await reponse.json();
      remplacer(panier.sections.panier);
      ouvrir();
    } catch {
      // En cas d'échec (stock épuisé, réseau…), on laisse Shopify traiter le formulaire normalement.
      formulaire.submit();
    }
  });
}
