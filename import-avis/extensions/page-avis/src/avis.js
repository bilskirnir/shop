// Logique pure de l'import d'avis : lecture du CSV, vérification des lignes. Testée par test/avis.test.mjs.
// Mêmes règles que outils/avis.py (colonnes, handle fabriqué depuis l'auteur et le titre, notes 1 à 5).

export const COLONNES = ['handle', 'livre', 'note', 'titre', 'texte', 'auteur', 'source', 'verifie'];

/** Décode le fichier : UTF-8, sinon Windows-1252 (le « CSV » d'Excel en français). */
export function decoder(octets) {
  try {
    return new TextDecoder('utf-8', {fatal: true}).decode(octets).replace(/^﻿/, '');
  } catch {
    return new TextDecoder('windows-1252').decode(octets);
  }
}

/** Lit un CSV (séparateur ; ou ,) en lignes {colonne: valeur}. Gère les guillemets et les retours à la ligne dans un texte. */
export function lireCsv(texte) {
  const premiere = texte.split('\n', 1)[0];
  const sep = (premiere.match(/;/g) || []).length >= (premiere.match(/,/g) || []).length ? ';' : ',';
  const rangees = [];
  let rangee = [], champ = '', guillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (guillemets) {
      if (c === '"' && texte[i + 1] === '"') { champ += '"'; i++; }
      else if (c === '"') guillemets = false;
      else champ += c;
    } else if (c === '"') guillemets = true;
    else if (c === sep) { rangee.push(champ); champ = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texte[i + 1] === '\n') i++;
      rangee.push(champ); rangees.push(rangee); rangee = []; champ = '';
    } else champ += c;
  }
  if (champ !== '' || rangee.length) { rangee.push(champ); rangees.push(rangee); }

  const [entete = [], ...donnees] = rangees.filter((r) => r.some((v) => v.trim() !== ''));
  const cles = entete.map((c) => c.trim().toLowerCase());
  return donnees.map((r) => Object.fromEntries(cles.filter(Boolean).map((cle) => [cle, (r[cles.indexOf(cle)] || '').replace(/\r\n/g, '\n').trim()])));
}

/** « Pierre G. » + « Des héros attachants » → « pierre-g-des-heros-attachants ». */
export function fabriquerHandle(auteur, titre) {
  const texte = `${auteur} ${titre}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return texte.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '') || 'avis';
}

/** Retrouve un livre par son adresse (handle) ou par son titre exact, sans tenir compte des majuscules. */
export function trouverLivre(valeur, livres) {
  const v = valeur.trim().toLowerCase();
  return livres.find((l) => l.handle === v) || livres.find((l) => l.titre.trim().toLowerCase() === v);
}

/**
 * Ce que l'application écrit sur chaque livre et sur la boutique, à partir de tous les avis publiés.
 * `avis` : [{id, livreId, note}] (note : nombre 1 à 5, ou null). Renvoie {livres: {idLivre: chiffres}, boutique: chiffres},
 * où chiffres = {ids: [ids des avis], nombre, notes (avis notés), somme (des notes)}.
 * Le thème en tire les moyennes exactes (somme / notes), y compris pour une saga (en additionnant ses tomes).
 */
export function regrouper(avis) {
  const vide = () => ({ids: [], nombre: 0, notes: 0, somme: 0});
  const livres = {};
  const boutique = vide();
  for (const a of avis) {
    const cibles = a.livreId ? [(livres[a.livreId] ||= vide()), boutique] : [boutique];
    for (const c of cibles) {
      if (c !== boutique) c.ids.push(a.id);
      c.nombre++;
      if (a.note) { c.notes++; c.somme += a.note; }
    }
  }
  return {livres, boutique};
}

/**
 * Prépare chaque ligne pour l'envoi : livre retrouvé, handle, nouveau ou mise à jour, erreurs en clair.
 * `livres` : [{id, handle, titre}] ; `existants` : handles des avis déjà dans la boutique.
 */
export function preparer(lignes, livres, existants) {
  const vus = new Set();
  return lignes.map((ligne) => {
    const erreurs = [];
    const livre = ligne.livre ? trouverLivre(ligne.livre, livres) : null;
    if (!ligne.livre) erreurs.push('le livre manque');
    else if (!livre) erreurs.push(`livre inconnu « ${ligne.livre} »`);
    if (!['1', '2', '3', '4', '5'].includes(ligne.note)) erreurs.push(ligne.note ? `note « ${ligne.note} » : il faut 1 à 5` : 'la note manque');
    if (!ligne.texte) erreurs.push('le texte manque');

    const handle = ligne.handle || fabriquerHandle(ligne.auteur || '', ligne.titre || '');
    if (vus.has(handle)) erreurs.push('même auteur et même titre qu\'une autre ligne du fichier');
    vus.add(handle);

    return {
      ...ligne, handle, livreId: livre?.id, livreTitre: livre?.titre,
      verifie: ['oui', 'vrai', 'true', '1', 'x'].includes((ligne.verifie || '').toLowerCase()),
      etat: erreurs.length ? 'erreur' : existants.has(handle) ? 'mise à jour' : 'nouveau',
      erreurs,
    };
  });
}
