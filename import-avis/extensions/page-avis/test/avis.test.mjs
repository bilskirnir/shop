// node extensions/page-avis/test/avis.test.mjs
import assert from 'node:assert/strict';
import {decoder, lireCsv, fabriquerHandle, trouverLivre, preparer} from '../src/avis.js';

// Excel français : points-virgules, Windows-1252, fin de ligne Windows.
const excel = new Uint8Array([...'livre;note;texte\r\nsalvation;5;Épique\r\n'].map((c) => (c === 'É' ? 0xc9 : c.charCodeAt(0))));
assert.deepEqual(lireCsv(decoder(excel)), [{livre: 'salvation', note: '5', texte: 'Épique'}]);

// UTF-8 avec BOM, virgules, guillemets, texte sur deux lignes, guillemet doublé.
const utf8 = new TextEncoder().encode('﻿livre,note,texte\nberserker,4,"Bien, ""vraiment""\nsuper"\n\n');
assert.deepEqual(lireCsv(decoder(utf8)), [{livre: 'berserker', note: '4', texte: 'Bien, "vraiment"\nsuper'}]);

assert.equal(fabriquerHandle('Pierre G.', 'Des héros attachants'), 'pierre-g-des-heros-attachants');
assert.equal(fabriquerHandle('', ''), 'avis');

const livres = [{id: 'gid://1', handle: 'salvation', titre: 'Salvation'}];
assert.equal(trouverLivre('SALVATION', livres).id, 'gid://1');
assert.equal(trouverLivre('salvation', livres).id, 'gid://1');
assert.equal(trouverLivre('inconnu', livres), undefined);

const [bon, maj, faux, double] = preparer([
  {livre: 'Salvation', note: '5', texte: 'Top', auteur: 'Ana', titre: 'Waouh', verifie: 'oui'},
  {handle: 'deja-la', livre: 'salvation', note: '4', texte: 'Bien'},
  {livre: 'x', note: '7', texte: ''},
  {livre: 'salvation', note: '5', texte: 'Encore', auteur: 'Ana', titre: 'Waouh'},
], livres, new Set(['deja-la']));
assert.equal(bon.etat, 'nouveau');
assert.equal(bon.handle, 'ana-waouh');
assert.equal(bon.verifie, true);
assert.equal(maj.etat, 'mise à jour');
assert.deepEqual(faux.erreurs, ['livre inconnu « x »', 'note « 7 » : il faut 1 à 5', 'le texte manque']);
assert.equal(double.etat, 'erreur');

console.log('ok');
