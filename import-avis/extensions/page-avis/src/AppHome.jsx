import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';

import {decoder, lireCsv, preparer, regrouper} from './avis.js';

// Page « Avis Bilskirnir » dans l'admin (Applications › Import Avis) : Gautier glisse un CSV d'avis,
// voit l'aperçu ligne par ligne, puis publie. Les avis sont des métaobjets « avis », lus par le thème.
export default async () => {
  render(<Import />, document.body);
};

async function graphql(query, variables = {}) {
  const reponse = await fetch('shopify:admin/api/graphql.json', {method: 'POST', body: JSON.stringify({query, variables})});
  const {data, errors} = await reponse.json();
  if (errors) throw new Error(errors.map((e) => e.message).join(' ; '));
  return data;
}

/** Toutes les pages d'une liste (250 par page) : `connexion` = 'products' ou 'metaobjects', `selection` = champs voulus. */
async function tout(connexion, arguments_, selection) {
  const noeuds = [];
  let apres = null;
  do {
    const data = await graphql(
      `query($apres: String) { ${connexion}(first: 250, after: $apres${arguments_}) {
         nodes { ${selection} } pageInfo { hasNextPage endCursor } } }`,
      {apres},
    );
    noeuds.push(...data[connexion].nodes);
    apres = data[connexion].pageInfo.hasNextPage ? data[connexion].pageInfo.endCursor : null;
  } while (apres);
  return noeuds;
}

async function chargerBoutique() {
  const [produits, avis] = await Promise.all([
    tout('products', ', sortKey: TITLE', 'id handle title'),
    tout('metaobjects', ', type: "avis"', 'handle'),
  ]);
  return {
    livres: produits.map((p) => ({id: p.id, handle: p.handle, titre: p.title})),
    existants: new Set(avis.map((m) => m.handle)),
  };
}

/**
 * Écrit sur chaque livre la liste de ses avis et ses chiffres (custom.avis, avis_nombre, avis_notes, avis_somme),
 * et les chiffres de tout le site sur la boutique. Le thème lit ces champs au lieu de parcourir tous les avis :
 * pas de limite au nombre d'avis de la boutique, moyennes exactes. À relancer après tout changement d'avis.
 */
async function mettreAJourLivres() {
  await creerChampAvis();
  const [avis, produits, {shop}] = await Promise.all([
    tout('metaobjects', ', type: "avis"', 'id livre: field(key: "livre") { value } note: field(key: "note") { value }'),
    tout('products', '', 'id'),
    graphql('{ shop { id } }'),
  ]);
  const {livres, boutique} = regrouper(avis.map((a) => ({
    id: a.id, livreId: a.livre?.value || null, note: a.note?.value ? Number(a.note.value) : null,
  })));

  const chiffres = (proprietaire, c) => [
    {ownerId: proprietaire, namespace: 'custom', key: 'avis_nombre', type: 'number_integer', value: String(c.nombre)},
    {ownerId: proprietaire, namespace: 'custom', key: 'avis_notes', type: 'number_integer', value: String(c.notes)},
    {ownerId: proprietaire, namespace: 'custom', key: 'avis_somme', type: 'number_integer', value: String(c.somme)},
  ];
  const aEcrire = chiffres(shop.id, boutique);
  const aEffacer = [];
  for (const {id} of produits) {
    const c = livres[id];
    if (c) {
      aEcrire.push({ownerId: id, namespace: 'custom', key: 'avis', type: 'list.metaobject_reference', value: JSON.stringify(c.ids)}, ...chiffres(id, c));
    } else {
      aEffacer.push(...['avis', 'avis_nombre', 'avis_notes', 'avis_somme'].map((key) => ({ownerId: id, namespace: 'custom', key})));
    }
  }

  // Shopify accepte 25 champs par envoi.
  for (let i = 0; i < aEcrire.length; i += 25) {
    const data = await graphql(
      `mutation($champs: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $champs) { userErrors { field message } } }`,
      {champs: aEcrire.slice(i, i + 25)},
    );
    const refus = data.metafieldsSet.userErrors;
    if (refus.length) throw new Error(refus.map((e) => e.message).join(' ; '));
  }
  for (let i = 0; i < aEffacer.length; i += 25) {
    await graphql(
      `mutation($champs: [MetafieldIdentifierInput!]!) { metafieldsDelete(metafields: $champs) { userErrors { message } } }`,
      {champs: aEffacer.slice(i, i + 25)},
    );
  }
  return {avis: boutique.nombre, livres: Object.keys(livres).length};
}

/** Crée une fois la définition du champ produit « Avis » (liste de métaobjets avis), pour qu'il apparaisse dans l'admin. */
async function creerChampAvis() {
  const {product} = await graphql(`{ product: metafieldDefinitions(ownerType: PRODUCT, namespace: "custom", key: "avis", first: 1) { nodes { id } } }`);
  if (product.nodes.length) return;
  // La définition « avis » se lit par un avis existant (metaobjectDefinitionByType demanderait un droit de plus).
  const {metaobjects} = await graphql('{ metaobjects(type: "avis", first: 1) { nodes { definition { id } } } }');
  const metaobjectDefinitionByType = metaobjects.nodes[0]?.definition;
  if (!metaobjectDefinitionByType) throw new Error('aucun avis dans la boutique : publie-en un avant de mettre les livres à jour.');
  const data = await graphql(
    `mutation($definition: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $definition) { userErrors { message } } }`,
    {definition: {
      name: 'Avis (rempli par Import Avis)', namespace: 'custom', key: 'avis', ownerType: 'PRODUCT',
      type: 'list.metaobject_reference', description: "Ne pas modifier : l'application Import Avis le remplit.",
      validations: [{name: 'metaobject_definition_id', value: metaobjectDefinitionByType.id}],
    }},
  );
  const refus = data.metafieldDefinitionCreate.userErrors;
  if (refus.length) throw new Error(`Champ produit « Avis » : ${refus.map((e) => e.message).join(' ; ')}`);
}

async function publier(avis) {
  const champs = {
    livre: avis.livreId, note: avis.note, texte: avis.texte, titre: avis.titre || '',
    auteur: avis.auteur || '', source: avis.source || '', verifie: avis.verifie ? 'true' : 'false',
  };
  const data = await graphql(
    `mutation($handle: MetaobjectHandleInput!, $avis: MetaobjectUpsertInput!) {
       metaobjectUpsert(handle: $handle, metaobject: $avis) { userErrors { message } } }`,
    {
      handle: {type: 'avis', handle: avis.handle},
      avis: {
        fields: Object.entries(champs).filter(([, v]) => v !== '').map(([key, value]) => ({key, value})),
        capabilities: {publishable: {status: 'ACTIVE'}},
      },
    },
  );
  return data.metaobjectUpsert.userErrors.map((e) => e.message);
}

const TON = {'nouveau': 'success', 'mise à jour': 'info', 'erreur': 'critical'};

function Import() {
  const [boutique, setBoutique] = useState(null);
  const [probleme, setProbleme] = useState('');
  const [fichier, setFichier] = useState('');
  const [lignes, setLignes] = useState([]);
  const [envoi, setEnvoi] = useState(null); // null, puis {fait, total, refus: [{handle, message}]}
  const [maj, setMaj] = useState(null); // null, 'en cours', {avis, livres} ou {erreur}

  async function relancerLivres() {
    setMaj('en cours');
    try {
      setMaj(await mettreAJourLivres());
    } catch (e) {
      setMaj({erreur: e.message});
    }
  }

  useEffect(() => {
    chargerBoutique().then(setBoutique).catch((e) => setProbleme(`La boutique ne répond pas : ${e.message}`));
  }, []);

  async function deposer(event) {
    const depot = (event.currentTarget.files || [])[0];
    setEnvoi(null);
    setProbleme('');
    if (!depot || !boutique) return;
    try {
      const texte = depot.arrayBuffer ? decoder(new Uint8Array(await depot.arrayBuffer())) : await depot.text();
      const lues = lireCsv(texte);
      if (!lues.length) return setProbleme('Le fichier ne contient aucun avis. Il faut une ligne de titres de colonnes, puis une ligne par avis.');
      if (!('livre' in lues[0]) || !('texte' in lues[0])) return setProbleme('Colonnes introuvables : le fichier doit avoir au moins les colonnes « livre », « note » et « texte ». Pars du modèle.');
      setFichier(depot.name);
      setLignes(preparer(lues, boutique.livres, boutique.existants));
    } catch (e) {
      setProbleme(`Fichier illisible : ${e.message}`);
    }
  }

  async function toutPublier() {
    const aEnvoyer = lignes.filter((l) => l.etat !== 'erreur');
    const suivi = {fait: 0, total: aEnvoyer.length, refus: []};
    setEnvoi({...suivi});
    for (const avis of aEnvoyer) {
      try {
        for (const message of await publier(avis)) suivi.refus.push({handle: avis.handle, message});
      } catch (e) {
        suivi.refus.push({handle: avis.handle, message: e.message});
      }
      suivi.fait++;
      setEnvoi({...suivi});
    }
    await relancerLivres(); // le site lit les avis par livre : sans ça, les nouveaux n'apparaîtraient pas
    setBoutique(await chargerBoutique()); // les avis publiés comptent désormais comme existants
  }

  const majBandeau = maj === 'en cours'
    ? <s-paragraph>Mise à jour des livres…</s-paragraph>
    : maj?.erreur
      ? <s-banner tone="critical">Les livres n'ont pas été mis à jour : {maj.erreur}</s-banner>
      : maj && <s-banner tone="success">Livres à jour : {maj.avis} avis répartis sur {maj.livres} livres. Le site les affiche d'ici quelques minutes.</s-banner>;

  const valides = lignes.filter((l) => l.etat !== 'erreur').length;
  const erreurs = lignes.length - valides;
  const enCours = envoi && envoi.fait < envoi.total;
  const termine = envoi && envoi.fait === envoi.total;

  return (
    <s-page heading="Importer des avis">
      {probleme && <s-banner tone="critical">{probleme}</s-banner>}

      <s-section heading="1. Le fichier">
        <s-stack gap="base">
          <s-paragraph>
            Un tableau Excel enregistré en CSV, une ligne par avis. Colonnes : <s-text type="strong">livre</s-text> (titre ou adresse du livre),{' '}
            <s-text type="strong">note</s-text> (1 à 5), <s-text type="strong">texte</s-text>, puis titre, auteur, source et verifie (oui ou non), facultatifs.
            Réimporter un fichier corrige les avis déjà publiés au lieu de les doubler.
          </s-paragraph>
          <s-paragraph>
            Première ligne du fichier, à recopier telle quelle : <s-text type="strong">livre;note;titre;texte;auteur;source;verifie</s-text>
          </s-paragraph>
          <s-drop-zone label="Dépose ton fichier ici" accept=".csv,text/csv" onChange={deposer} disabled={!boutique || enCours}></s-drop-zone>
          {!boutique && !probleme && <s-paragraph>Chargement des livres de la boutique…</s-paragraph>}
        </s-stack>
      </s-section>

      {lignes.length > 0 && (
        <s-section heading={`2. Vérifier : ${fichier}`}>
          <s-stack gap="base">
            <s-paragraph>
              {valides} avis prêts{erreurs > 0 ? `, ${erreurs} à corriger dans le fichier (ils ne seront pas envoyés)` : ''}.
            </s-paragraph>
            <s-table>
              <s-table-header-row>
                <s-table-header>Livre</s-table-header>
                <s-table-header>Note</s-table-header>
                <s-table-header>Avis</s-table-header>
                <s-table-header>Auteur</s-table-header>
                <s-table-header>État</s-table-header>
              </s-table-header-row>
              <s-table-body>
                {lignes.map((l, i) => (
                  <s-table-row key={i}>
                    <s-table-cell>{l.livreTitre || l.livre || '—'}</s-table-cell>
                    <s-table-cell>{/^[1-5]$/.test(l.note) ? '★'.repeat(+l.note) : l.note || '—'}</s-table-cell>
                    <s-table-cell>{l.titre ? `${l.titre} — ` : ''}{l.texte.length > 90 ? `${l.texte.slice(0, 90)}…` : l.texte}</s-table-cell>
                    <s-table-cell>{[l.auteur, l.source].filter(Boolean).join(' · ') || '—'}</s-table-cell>
                    <s-table-cell>
                      <s-stack gap="small-200">
                        <s-badge tone={TON[l.etat]}>{l.etat}</s-badge>
                        {l.erreurs.map((e) => <s-text tone="critical">{e}</s-text>)}
                      </s-stack>
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>
          </s-stack>
        </s-section>
      )}

      {lignes.length > 0 && (
        <s-section heading="3. Publier">
          <s-stack gap="base">
            {!envoi && (
              <s-button variant="primary" onClick={toutPublier} disabled={valides === 0}>
                Publier {valides} avis sur la boutique
              </s-button>
            )}
            {enCours && <s-paragraph>Envoi en cours : {envoi.fait} / {envoi.total}…</s-paragraph>}
            {termine && envoi.refus.length === 0 && <s-banner tone="success">{envoi.total} avis publiés.</s-banner>}
            {termine && envoi.refus.length > 0 && (
              <s-banner tone="warning">
                {envoi.total - new Set(envoi.refus.map((r) => r.handle)).size} avis publiés, refusés par Shopify :{' '}
                {envoi.refus.map((r) => `${r.handle} (${r.message})`).join(' ; ')}
              </s-banner>
            )}
            {termine && majBandeau}
          </s-stack>
        </s-section>
      )}

      {boutique && !lignes.length && (
        <s-section heading="Un avis changé à la main ?">
          <s-stack gap="base">
            <s-paragraph>
              Si tu ajoutes, corriges ou supprimes un avis dans Contenu › Métaobjets plutôt qu'ici, clique ce bouton pour que le site le prenne en compte.
            </s-paragraph>
            <s-button onClick={relancerLivres} disabled={maj === 'en cours'}>Mettre les livres à jour</s-button>
            {majBandeau}
          </s-stack>
        </s-section>
      )}

      {boutique && (
        <s-section heading="Ce qu'il faut écrire dans la colonne « livre »">
          <s-table>
            <s-table-header-row>
              <s-table-header>Livre</s-table-header>
              <s-table-header>À écrire</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {boutique.livres.map((l) => (
                <s-table-row key={l.handle}>
                  <s-table-cell>{l.titre}</s-table-cell>
                  <s-table-cell>{l.handle}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        </s-section>
      )}
    </s-page>
  );
}
