import {describe, it, expect} from 'vitest';
import {buildHomeScreens, type ScreenCollection, type ScreenWork} from '../homeScreens';

const cover = (n: number) => ({featuredImage: {url: `https://x/t${n}.jpg`, altText: `T${n}`}, numeroTome: {value: String(n)}});

const sagaNode = () => ({
  id: 'gid://m/1', handle: 'eau-et-sang',
  fields: [
    {key: 'nom', value: "De l'Eau et du Sang", references: null},
    {key: 'accroche', value: "L'arc fondateur", references: null},
    {key: 'couleur', value: '#2fb6c4', references: null},
    {key: 'tomes', value: null, references: {nodes: [cover(2), cover(1)]}},
  ],
});

const universe = (overrides: Partial<ScreenCollection> = {}): ScreenCollection => ({
  id: 'gid://c/1', handle: 'au-nom-des-dieux', title: 'Au Nom des Dieux',
  estUneOeuvreIndependante: {value: 'false'},
  lore: {value: 'Quand les dieux se sont tus.'},
  couleurTheme: {value: '#114b45'},
  sagas: {references: {nodes: [sagaNode()]}},
  products: {nodes: [cover(1), cover(2)]},
  ...overrides,
});

const work = (overrides: Partial<ScreenWork> = {}): ScreenWork => ({
  id: 'gid://p/9', handle: 'berserker', title: 'Berserker',
  estUneOeuvreIndependante: {value: 'true'},
  featuredImage: {url: 'https://x/b.jpg', altText: 'Berserker'},
  teaserCourt: {value: 'La rage, et la neige.'},
  statutParution: {value: 'publié'},
  ...overrides,
});

describe('buildHomeScreens', () => {
  it('produit un écran par saga (nom, lore, accent saga, couvertures triées, CTA univers)', () => {
    const [s] = buildHomeScreens([universe()], []);
    expect(s.kind).toBe('saga');
    expect(s.title).toBe("De l'Eau et du Sang");
    expect(s.accent).toBe('#2fb6c4');
    expect(s.covers.map((c) => c.altText)).toEqual(['T1', 'T2']);
    expect(s.href).toBe('/collections/au-nom-des-dieux#eau-et-sang');
    expect(s.ctaLabel).toBe('Entrer dans la saga');
  });

  it("retombe sur 1 écran collection si pas de saga (accent = couleur d'univers)", () => {
    const u = universe({sagas: null});
    const [s] = buildHomeScreens([u], []);
    expect(s.kind).toBe('universe');
    expect(s.title).toBe('Au Nom des Dieux');
    expect(s.accent).toBe('#114b45');
    expect(s.covers).toHaveLength(2);
    expect(s.href).toBe('/collections/au-nom-des-dieux');
  });

  it("hérite de la couleur univers si la saga n'a pas de couleur", () => {
    const node = sagaNode();
    node.fields = node.fields.filter((f) => f.key !== 'couleur');
    const u = universe({sagas: {references: {nodes: [node]}}});
    expect(buildHomeScreens([u], [])[0].accent).toBe('#114b45');
  });

  it('produit un écran one-shot par œuvre indépendante avec couverture', () => {
    const [s] = buildHomeScreens([], [work()]);
    expect(s.kind).toBe('oneshot');
    expect(s.kicker).toBe('Roman indépendant');
    expect(s.covers).toHaveLength(1);
    expect(s.href).toBe('/products/berserker');
    expect(s.ctaLabel).toBe('Découvrir le livre');
  });

  it('exclut une œuvre indépendante sans couverture et un univers sans couverture', () => {
    expect(buildHomeScreens([], [work({featuredImage: null})])).toHaveLength(0);
    const empty = universe({sagas: null, products: {nodes: []}});
    expect(buildHomeScreens([empty], [])).toHaveLength(0);
  });

  it('ordonne sagas/univers avant one-shots', () => {
    const screens = buildHomeScreens([universe()], [work()]);
    expect(screens.map((s) => s.kind)).toEqual(['saga', 'oneshot']);
  });

  it('CTA « Précommander » pour une œuvre en précommande', () => {
    const [s] = buildHomeScreens([], [work({statutParution: {value: 'précommande'}})]);
    expect(s.ctaLabel).toBe('Précommander');
  });

  it('ordonne les couvertures sans numéro de tome en dernier (tri déterministe)', () => {
    const node = sagaNode();
    const tomes = node.fields.find((f) => f.key === 'tomes')!;
    tomes.references!.nodes = [
      {featuredImage: {url: 'https://x/sans.jpg', altText: 'sans'}, numeroTome: {value: null}},
      {featuredImage: {url: 'https://x/t1.jpg', altText: 'T1'}, numeroTome: {value: '1'}},
    ];
    const u = universe({sagas: {references: {nodes: [node]}}});
    expect(buildHomeScreens([u], [])[0].covers.map((c) => c.altText)).toEqual(['T1', 'sans']);
  });
});
