// Le voile de recherche (sections/recherche.liquid).
// La loupe de l'en-tête et la touche « / » l'ouvrent. À chaque frappe, Shopify rend
// sections/recherche-suggestions.liquid pour les mots tapés (recherche prédictive), qu'on pose dans le voile.
// Sans ce script, la loupe mène à la page /search : rien ne casse.
const voile = document.getElementById('recherche');

if (voile) {
  const champ = voile.querySelector('#recherche-champ');
  const accueil = voile.querySelector('[data-accueil]');
  const resultats = voile.querySelector('[data-resultats]');
  let attente;
  let demande;

  // Ouvre le voile ; un autre panneau ouvert (le panier) se ferme d'abord.
  const ouvrir = () => {
    document.querySelectorAll('dialog[open]').forEach((d) => d !== voile && d.close());
    if (!voile.open) voile.showModal();
    champ.select();
  };

  // Montre les résultats de Shopify, ou l'accueil du voile quand on n'en a pas.
  const afficher = (suggestions) => {
    accueil.hidden = Boolean(suggestions);
    resultats.replaceChildren(...(suggestions ? [suggestions] : []));
    voile.setAttribute('style', suggestions?.dataset.halo ?? '');
  };

  const chercher = async () => {
    const mots = champ.value.trim();
    demande?.abort();
    if (mots.length < 2) return afficher(null);

    demande = new AbortController();
    const adresse = new URL(voile.dataset.suggestions, location.origin);
    adresse.search = new URLSearchParams({
      q: mots,
      'resources[type]': 'product',
      'resources[limit]': 10,
      section_id: 'recherche-suggestions',
    });

    try {
      const reponse = await fetch(adresse, { signal: demande.signal });
      if (!reponse.ok) return;
      const page = new DOMParser().parseFromString(await reponse.text(), 'text/html');
      afficher(page.querySelector('.suggestions'));
    } catch {
      // Frappe suivante (requête annulée) ou réseau coupé : on garde ce qui est affiché.
    }
  };

  document.querySelector('.entete__recherche')?.addEventListener('click', (e) => {
    e.preventDefault();
    ouvrir();
  });

  // « / » ouvre la recherche, sauf quand on écrit déjà dans un champ.
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || voile.open || e.target.closest('input, textarea, select, [contenteditable]')) return;
    e.preventDefault();
    ouvrir();
  });

  voile.querySelector('[data-fermer]').addEventListener('click', () => voile.close());

  // Un clic sur le fond du voile (pas sur un lien ou le champ) le ferme.
  voile.addEventListener('click', (e) => {
    if (e.target === voile || e.target.classList.contains('recherche__colonne')) voile.close();
  });

  // On attend une courte pause dans la frappe avant d'interroger Shopify.
  champ.addEventListener('input', () => {
    clearTimeout(attente);
    attente = setTimeout(chercher, 180);
  });
}
