import {describe, it, expect} from 'vitest';
import {buildCatalogue, type CatalogueProduct, type CatalogueUniverse} from '../catalogue';

const img = (n: string) => ({url: `https://x/${n}.webp`, altText: n, width: 800, height: 1170});
const price = (a: string) => ({minVariantPrice: {amount: a, currencyCode: 'EUR'}});

function tome(handle: string, univHandle: string | null, numero: string | null, standalone = false): CatalogueProduct {
  return {
    id: `gid://p/${handle}`,
    handle,
    title: handle,
    featuredImage: img(handle),
    priceRange: price('18.90'),
    univers: univHandle ? {reference: {handle: univHandle, title: univHandle}} : null,
    numeroTome: numero ? {value: numero} : null,
    statutParution: {value: 'publié'},
    dateParution: null,
    estUneOeuvreIndependante: {value: standalone ? 'true' : 'false'},
  };
}

const universes: CatalogueUniverse[] = [
  {handle: 'andd', title: 'Au Nom des Dieux', couleurTheme: {value: '#2f8a78'}, estUneOeuvreIndependante: {value: 'false'}},
  {handle: 'fracture', title: 'Fracture', couleurTheme: {value: '#46638f'}, estUneOeuvreIndependante: {value: 'false'}},
];

describe('buildCatalogue', () => {
  it('groupe par univers, trie les tomes, ajoute accent + lien', () => {
    const products = [tome('t2', 'andd', '2'), tome('t1', 'andd', '1')];
    const sections = buildCatalogue(products, universes, 1);
    const andd = sections.find((s) => s.key === 'andd')!;
    expect(andd.name).toBe('Au Nom des Dieux');
    expect(andd.accent).toBe('#2f8a78');
    expect(andd.href).toBe('/collections/andd');
    expect(andd.tomes.map((t) => t.handle)).toEqual(['t1', 't2']);
  });

  it('section Romans indépendants pour les œuvres indépendantes', () => {
    const products = [tome('berserker', null, null, true)];
    const sections = buildCatalogue(products, universes, 1);
    const indep = sections.find((s) => s.name === 'Romans indépendants')!;
    expect(indep.accent).toBeNull();
    expect(indep.href).toBeNull();
    expect(indep.tomes.map((t) => t.handle)).toEqual(['berserker']);
  });

  it('section Autres œuvres pour produit sans univers ni flag', () => {
    const sections = buildCatalogue([tome('orphan', null, null, false)], universes, 1);
    expect(sections.find((s) => s.name === 'Autres œuvres')).toBeTruthy();
  });

  it("univers d'abord, puis indépendants, puis autres", () => {
    const products = [tome('orphan', null, null), tome('b', null, null, true), tome('t1', 'andd', '1')];
    const names = buildCatalogue(products, universes, 1).map((s) => s.name);
    expect(names[0]).toBe('Au Nom des Dieux');
    expect(names.indexOf('Romans indépendants')).toBeLessThan(names.indexOf('Autres œuvres'));
  });

  it('rotation : ordre déterministe par graine (stable même graine)', () => {
    const products = [tome('a1', 'andd', '1'), tome('f1', 'fracture', '1')];
    const order = (seed: number) =>
      buildCatalogue(products, universes, seed)
        .filter((s) => s.href)
        .map((s) => s.key);
    expect(order(123)).toEqual(order(123));
    expect(order(123).slice().sort()).toEqual(['andd', 'fracture']);
  });

  it('exclut un univers sans produit ; ignore les produits sans couverture', () => {
    const noImg = {...tome('x', 'andd', '1'), featuredImage: null};
    const sections = buildCatalogue([noImg], universes, 1);
    expect(sections.find((s) => s.key === 'fracture')).toBeUndefined();
    expect(sections.find((s) => s.key === 'andd')).toBeUndefined();
  });
});
