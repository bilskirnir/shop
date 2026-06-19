import {
  parseBool,
  parseNumeroTome,
  parseStatutParution,
  metaobjectField,
  richTextToPlain,
} from '~/lib/tomeMetafields';
import {resolveAccentColor} from '~/lib/universeAccent';
import type {FanCover} from '~/lib/universeFan';

interface MV {value?: string | null}
interface ProductCover {
  featuredImage?: {url: string; altText?: string | null} | null;
  numeroTome?: MV | null;
  statutParution?: MV | null;
}
interface SagaField {
  key: string;
  value?: string | null;
  references?: {nodes: ProductCover[]} | null;
}
export interface SagaNode {id: string; handle: string; fields: SagaField[]}
export interface ScreenCollection {
  id: string; handle: string; title: string;
  estUneOeuvreIndependante?: MV | null;
  lore?: MV | null;
  couleurTheme?: MV | null;
  sagas?: {references?: {nodes: SagaNode[]} | null} | null;
  products: {nodes: ProductCover[]};
}
export interface ScreenWork {
  id: string; handle: string; title: string;
  estUneOeuvreIndependante?: MV | null;
  featuredImage?: {url: string; altText?: string | null} | null;
  teaserCourt?: MV | null;
  statutParution?: MV | null;
}

export interface HomeScreen {
  key: string;
  kind: 'saga' | 'universe' | 'oneshot';
  kicker: string;
  title: string;
  lore: string | null;
  accent: string | null;
  covers: FanCover[];
  href: string;
  ctaLabel: string;
}

const SAGA_KEYS = {nom: 'nom', accroche: 'accroche', lore: 'lore', couleur: 'couleur', tomes: 'tomes'};

/** Trie par n° de tome puis garde les 3 premières couvertures non nulles. */
function coversFrom(nodes: ProductCover[]): FanCover[] {
  const tome = (p: ProductCover) => parseNumeroTome(p.numeroTome?.value) ?? Infinity;
  return [...nodes]
    .sort((a, b) => tome(a) - tome(b))
    .map((p) => (p.featuredImage?.url ? {url: p.featuredImage.url, altText: p.featuredImage.altText ?? ''} : null))
    .filter((c): c is FanCover => c !== null)
    .slice(0, 3);
}

function sagaScreen(u: ScreenCollection, node: SagaNode): HomeScreen | null {
  const refs = node.fields.find((f) => f.key === SAGA_KEYS.tomes)?.references?.nodes ?? [];
  const covers = coversFrom(refs);
  if (covers.length === 0) return null;
  const accent = resolveAccentColor(metaobjectField(node.fields, SAGA_KEYS.couleur), u.couleurTheme?.value);
  const lore = richTextToPlain(
    metaobjectField(node.fields, SAGA_KEYS.lore) ?? metaobjectField(node.fields, SAGA_KEYS.accroche),
  ).trim();
  return {
    key: node.id,
    kind: 'saga',
    kicker: `${u.title} — Saga`,
    title: metaobjectField(node.fields, SAGA_KEYS.nom) ?? node.handle,
    lore: lore || null,
    accent,
    covers,
    href: `/collections/${u.handle}#${node.handle}`,
    ctaLabel: 'Entrer dans la saga',
  };
}

function universeScreen(u: ScreenCollection): HomeScreen | null {
  const covers = coversFrom(u.products.nodes);
  if (covers.length === 0) return null;
  return {
    key: u.id,
    kind: 'universe',
    kicker: 'Univers',
    title: u.title,
    lore: richTextToPlain(u.lore?.value).trim() || null,
    accent: resolveAccentColor(null, u.couleurTheme?.value),
    covers,
    href: `/collections/${u.handle}`,
    ctaLabel: "Explorer l'univers",
  };
}

function workScreen(w: ScreenWork): HomeScreen | null {
  if (!parseBool(w.estUneOeuvreIndependante?.value)) return null;
  if (!w.featuredImage?.url) return null;
  const status = parseStatutParution(w.statutParution?.value);
  return {
    key: w.id,
    kind: 'oneshot',
    kicker: 'Roman indépendant',
    title: w.title,
    lore: richTextToPlain(w.teaserCourt?.value).trim() || null,
    accent: null,
    covers: [{url: w.featuredImage.url, altText: w.featuredImage.altText ?? w.title}],
    href: `/products/${w.handle}`,
    ctaLabel: status === 'précommande' ? 'Précommander' : 'Découvrir le livre',
  };
}

export function buildHomeScreens(
  collections: ReadonlyArray<ScreenCollection>,
  works: ReadonlyArray<ScreenWork>,
): HomeScreen[] {
  const out: HomeScreen[] = [];
  for (const u of collections) {
    if (parseBool(u.estUneOeuvreIndependante?.value)) continue;
    const sagas = u.sagas?.references?.nodes ?? [];
    const sagaScreens = sagas.map((n) => sagaScreen(u, n)).filter((s): s is HomeScreen => s !== null);
    if (sagaScreens.length > 0) out.push(...sagaScreens);
    else {
      const fallback = universeScreen(u);
      if (fallback) out.push(fallback);
    }
  }
  for (const w of works) {
    const s = workScreen(w);
    if (s) out.push(s);
  }
  return out;
}
