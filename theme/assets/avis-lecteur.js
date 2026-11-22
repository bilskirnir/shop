// La page d'avis d'un lecteur (sections/avis-lecteur.liquid).
// Les deux étapes du formulaire, le mot sous les étoiles, l'inscription aux sorties, et au retour
// (le merci), le prénom et le texte gardés dans le navigateur pour les recoller sur Amazon.
// Sans ce script, la page montre tout d'un bloc et le formulaire s'envoie pareil.
const page = document.querySelector('.avis-lecteur');
const formulaire = document.getElementById('avis-lecteur');
const MEMOIRE = 'bilskirnir-avis';

const MOTS = ['', 'Pas pour moi', 'Bof', 'Bien', 'Très bien', "Je l'ai dévoré"];

if (page && formulaire) {
  const etapes = [...formulaire.querySelectorAll('[data-etape]')];
  const frise = formulaire.querySelector('.avis-lecteur__frise');

  // Montre une étape et cache l'autre ; la frise suit.
  const montrer = (n) => {
    etapes.forEach((e) => (e.hidden = e.dataset.etape !== String(n)));
    frise?.setAttribute('data-etape', n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (etapes.length) {
    page.classList.add('avis-lecteur--etapes');
    formulaire.querySelectorAll('[data-suivant], [data-retour]').forEach((b) => (b.hidden = false));
    montrer(1);

    const mot = formulaire.querySelector('[data-mot]');
    formulaire.querySelector('[data-etoiles]').addEventListener('change', (e) => {
      mot.textContent = MOTS[parseInt(e.target.value, 10)] || '';
    });

    // « Suivant » attend une note : c'est le seul champ obligatoire de la première étape.
    formulaire.querySelector('[data-suivant]').addEventListener('click', () => {
      const note = formulaire.querySelector('[name="contact[Note]"]:checked');
      if (!note) {
        formulaire.querySelector('[name="contact[Note]"]').reportValidity();
        return;
      }
      montrer(2);
      formulaire.querySelector('#avis-prenom').focus({ preventScroll: true });
    });
    formulaire.querySelector('[data-retour]').addEventListener('click', () => montrer(1));

    // À l'envoi : on garde prénom et texte pour le merci, et on inscrit aux sorties si la case est cochée.
    // L'inscription part dans un cadre caché ; on attend sa réponse (2 s au plus) avant d'envoyer l'avis,
    // sinon le changement de page l'annulerait.
    formulaire.addEventListener('submit', (e) => {
      try {
        sessionStorage.setItem(MEMOIRE, JSON.stringify({
          prenom: formulaire.querySelector('#avis-prenom').value.trim(),
          texte: formulaire.querySelector('#avis-texte').value.trim(),
        }));
      } catch {}

      const inscription = document.getElementById('avis-inscription');
      if (!formulaire.querySelector('[data-inscription]').checked || !inscription || formulaire.dataset.envoi) return;

      e.preventDefault();
      formulaire.dataset.envoi = 'oui';
      inscription.querySelector('[name="contact[email]"]').value = formulaire.querySelector('#avis-email').value;
      const cadre = document.querySelector('iframe[name="avis-cadre"]');
      const continuer = () => formulaire.submit();
      cadre.addEventListener('load', continuer, { once: true });
      setTimeout(continuer, 2000);
      inscription.submit();
    });
  }

  // Le merci : le prénom, et le texte à recoller sur Amazon.
  const merci = formulaire.querySelector('[data-merci]');
  if (merci) {
    let memoire = {};
    try {
      memoire = JSON.parse(sessionStorage.getItem(MEMOIRE)) || {};
    } catch {}

    if (memoire.prenom) merci.querySelector('[data-prenom]').textContent = `, ${memoire.prenom}`;

    const texte = merci.querySelector('[data-texte]');
    const copier = merci.querySelector('[data-copier]');
    if (memoire.texte && texte && copier) {
      texte.textContent = `« ${memoire.texte} »`;
      texte.hidden = false;
      copier.hidden = false;
      copier.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(memoire.texte);
          copier.textContent = 'Copié ✓';
        } catch {
          copier.textContent = 'Sélectionne le texte au-dessus pour le copier';
        }
      });
    }
  }
}
