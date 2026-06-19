import {describe, it, expect} from 'vitest';
import {buildHomeScreens, type SagaNode, type ScreenWork} from '../homeScreens';

const cover = (url: string, alt: string) => ({featuredImage: {url, altText: alt}});

function sagaNode(): SagaNode {
  return {
    handle: 'de-leau-et-du-sang',
    fields: [
      {key: 'nom', value: "De l'eau et du sang"},
      {
        key: 'synopsis',
        value:
          '{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","value":"Le silence des dieux."}]}]}',
      },
      {key: 'ordre_des_tomes', references: {nodes: [cover('https://x/t1.jpg', 'T1'), cover('https://x/t2.jpg', 'T2')]}},
      {
        key: 'univers_parent',
        reference: {
          handle: 'au-nom-des-dieux',
          title: 'Au Nom des Dieux',
          couleurTheme: {value: '#8b6b3a'},
          illustrationHero: {reference: {image: {url: 'https://x/banner.webp'}}},
        },
      },
      {key: 'illustration_hero_de_la_saga', reference: null},
    ],
  };
}

const work = (overrides: Partial<ScreenWork> = {}): ScreenWork => ({
  id: 'gid://p/9',
  handle: 'berserker',
  title: 'Berserker',
  estUneOeuvreIndependante: {value: 'true'},
  featuredImage: {url: 'https://x/b.jpg', altText: 'Berserker'},
  teaserCourt: {value: 'La rage.'},
  statutParution: {value: 'publié'},
  ...overrides,
});

describe('buildHomeScreens', () => {
  it('construit un écran saga (titre=nom, lore=synopsis, kicker=univers, CTA)', () => {
    const [s] = buildHomeScreens([sagaNode()], []);
    expect(s.kind).toBe('saga');
    expect(s.title).toBe("De l'eau et du sang");
    expect(s.lore).toBe('Le silence des dieux.');
    expect(s.kicker).toBe('Au Nom des Dieux — Saga');
    expect(s.covers.map((c) => c.altText)).toEqual(['T1', 'T2']);
    expect(s.href).toBe('/collections/au-nom-des-dieux#de-leau-et-du-sang');
    expect(s.ctaLabel).toBe('Entrer dans la saga');
  });

  it("hérite de la couleur d'accent de l'univers parent", () => {
    expect(buildHomeScreens([sagaNode()], [])[0].accent).toBe('#8b6b3a');
  });

  it("expose l'auteur du 1er tome qui en porte un (metaobject Auteur)", () => {
    const n = sagaNode();
    n.fields.find((f) => f.key === 'ordre_des_tomes')!.references!.nodes[0].auteur = {
      reference: {nom: {value: 'Gautier Durieux de Madron'}},
    };
    expect(buildHomeScreens([n], [])[0].author).toBe('Gautier Durieux de Madron');
  });

  it("author null si aucun tome n'a d'auteur", () => {
    expect(buildHomeScreens([sagaNode()], [])[0].author).toBeNull();
  });

  it("utilise l'illustration de la saga si dispo, sinon celle de l'univers", () => {
    expect(buildHomeScreens([sagaNode()], [])[0].background).toBe('https://x/banner.webp');
    const withHero = sagaNode();
    withHero.fields.find((f) => f.key === 'illustration_hero_de_la_saga')!.reference = {
      image: {url: 'https://x/saga-hero.jpg'},
    };
    expect(buildHomeScreens([withHero], [])[0].background).toBe('https://x/saga-hero.jpg');
  });

  it("respecte l'ordre explicite des tomes (pas de tri)", () => {
    const n = sagaNode();
    n.fields.find((f) => f.key === 'ordre_des_tomes')!.references = {
      nodes: [cover('u2', 'B'), cover('u1', 'A')],
    };
    expect(buildHomeScreens([n], [])[0].covers.map((c) => c.altText)).toEqual(['B', 'A']);
  });

  it('exclut une saga sans couverture', () => {
    const empty = sagaNode();
    empty.fields.find((f) => f.key === 'ordre_des_tomes')!.references = {nodes: []};
    expect(buildHomeScreens([empty], [])).toHaveLength(0);
  });

  it('ajoute les one-shots après les sagas', () => {
    expect(buildHomeScreens([sagaNode()], [work()]).map((s) => s.kind)).toEqual([
      'saga',
      'oneshot',
    ]);
  });

  it('CTA Précommander pour un one-shot en précommande', () => {
    expect(
      buildHomeScreens([], [work({statutParution: {value: 'précommande'}})])[0].ctaLabel,
    ).toBe('Précommander');
  });

  it('exclut une œuvre indépendante sans couverture', () => {
    expect(buildHomeScreens([], [work({featuredImage: null})])).toHaveLength(0);
  });
});
