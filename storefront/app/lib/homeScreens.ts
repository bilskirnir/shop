import {
  parseBool,
  parseStatutParution,
  metaobjectField,
  richTextToPlain,
} from '~/lib/tomeMetafields';
import {resolveAccentColor} from '~/lib/universeAccent';
import type {FanCover} from '~/lib/universeFan';

interface MV {value?: string | null}
interface ProductCover {
  featuredImage?: {url: string; altText?: string | null} | null;
  /** Lien produit → metaobject Auteur (`custom.auteur`) ; nom via le champ `nom`. */
  auteur?: {reference?: {nom?: MV | null} | null} | null;
}
interface ImageRefValue {reference?: {image?: {url?: string | null} | null} | null}
/**
 * Référence portée par un champ de la saga :
 * - `univers_parent` → une Collection (handle/title/couleur/illustration_hero).
 * - `illustration_hero_de_la_saga` → un MediaImage (`image.url`).
 */
interface SagaRef {
  handle?: string | null;
  title?: string | null;
  couleurTheme?: MV | null;
  illustrationHero?: ImageRefValue | null;
  image?: {url?: string | null} | null;
}
interface SagaField {
  key: string;
  value?: string | null;
  references?: {nodes: ProductCover[]} | null;
  reference?: SagaRef | null;
}
/** Un metaobject `saga` (interrogé directement via `metaobjects(type:"saga")`). */
export interface SagaNode {handle: string; fields: SagaField[]}

export interface ScreenWork {
  id: string; handle: string; title: string;
  estUneOeuvreIndependante?: MV | null;
  featuredImage?: {url: string; altText?: string | null} | null;
  teaserCourt?: MV | null;
  statutParution?: MV | null;
  /** Univers du produit (`custom.univers`) → couleur du halo (`custom.couleur`). */
  univers?: {reference?: {couleurTheme?: MV | null} | null} | null;
  /** Auteur du produit (metaobject `custom.auteur` → champ `nom`), affiché « Par … ». */
  auteur?: {reference?: {nom?: MV | null} | null} | null;
}

/** Avis lecteurs saisis à la main (pastille sous l'éventail). */
export interface RatingInfo {
  /** Note moyenne /5 (ex. 4.7). */
  note: number;
  /** Nombre de lecteurs/avis, ou null si non renseigné. */
  readers: number | null;
}

export interface HomeScreen {
  key: string;
  kind: 'saga' | 'oneshot';
  kicker: string;
  title: string;
  lore: string | null;
  /** Auteur de la saga (metaobject Auteur des tomes) — affiché « Par … ». */
  author: string | null;
  accent: string | null;
  covers: FanCover[];
  /** Image de fond optionnelle (illustration hero de la saga, sinon de l'univers). */
  background: string | null;
  /** Avis lecteurs (pastille), posé par la slide accueil. null si absent. */
  rating: RatingInfo | null;
  href: string;
  ctaLabel: string;
}

/**
 * Parse la note + le nombre de lecteurs (chaînes du metaobject). Accepte la
 * virgule ou le point pour la note. Retourne null si la note est absente/invalide
 * (≤ 0) ; le nombre de lecteurs reste optionnel (null si absent/invalide).
 */
export function parseRating(
  noteRaw?: string | null,
  readersRaw?: string | null,
): RatingInfo | null {
  if (!noteRaw) return null;
  const note = parseFloat(String(noteRaw).replace(',', '.'));
  if (!Number.isFinite(note) || note <= 0) return null;
  const readers = readersRaw != null ? parseInt(String(readersRaw), 10) : NaN;
  return {note, readers: Number.isFinite(readers) && readers > 0 ? readers : null};
}

/** Clés réelles du metaobject `saga` (confirmées sur le store live, 2026-06-19). */
const SAGA_KEYS = {
  nom: 'nom',
  synopsis: 'synopsis',
  tomes: 'ordre_des_tomes',
  univers: 'univers_parent',
  hero: 'illustration_hero_de_la_saga',
} as const;

/** Couvertures dans l'ordre EXPLICITE de `ordre_des_tomes` (pas de tri), max 3. */
function coversInOrder(nodes: ProductCover[]): FanCover[] {
  return nodes
    .map((p) =>
      p.featuredImage?.url
        ? {url: p.featuredImage.url, altText: p.featuredImage.altText ?? ''}
        : null,
    )
    .filter((c): c is FanCover => c !== null)
    .slice(0, 3);
}

function field(node: SagaNode, key: string): SagaField | undefined {
  return node.fields.find((f) => f.key === key);
}

function sagaScreen(node: SagaNode): HomeScreen | null {
  const tomeNodes = field(node, SAGA_KEYS.tomes)?.references?.nodes ?? [];
  const covers = coversInOrder(tomeNodes);
  if (covers.length === 0) return null;

  // Auteur : 1er tome qui en porte un (metaobject Auteur via custom.auteur → champ nom).
  const author =
    tomeNodes.map((t) => t.auteur?.reference?.nom?.value?.trim()).find(Boolean) ?? null;
  const univers = field(node, SAGA_KEYS.univers)?.reference ?? null;
  const lore = richTextToPlain(metaobjectField(node.fields, SAGA_KEYS.synopsis)).trim();

  // Fond : illustration de la saga si dispo, sinon celle de l'univers parent.
  const sagaHero = field(node, SAGA_KEYS.hero)?.reference?.image?.url ?? null;
  const universHero = univers?.illustrationHero?.reference?.image?.url ?? null;

  return {
    key: node.handle,
    kind: 'saga',
    kicker: univers?.title ? `${univers.title} — Saga` : 'Saga',
    title: metaobjectField(node.fields, SAGA_KEYS.nom) ?? node.handle,
    lore: lore || null,
    author,
    // pas de champ couleur sur la saga → on hérite de la couleur de l'univers parent
    accent: resolveAccentColor(null, univers?.couleurTheme?.value),
    covers,
    background: sagaHero ?? universHero,
    rating: null,
    href: univers?.handle
      ? `/collections/${univers.handle}#${node.handle}`
      : '/collections/all',
    ctaLabel: 'Entrer dans la saga',
  };
}

function workScreen(w: ScreenWork, requireFlag = true): HomeScreen | null {
  // En mode AUTO on exige le flag « œuvre indépendante » ; en mode CURATÉ (l'admin
  // l'a explicitement ajouté à l'accueil) on l'affiche quoi qu'il arrive.
  if (requireFlag && !parseBool(w.estUneOeuvreIndependante?.value)) return null;
  if (!w.featuredImage?.url) return null;
  const status = parseStatutParution(w.statutParution?.value);
  return {
    key: w.id,
    kind: 'oneshot',
    kicker: 'Roman indépendant',
    title: w.title,
    lore: richTextToPlain(w.teaserCourt?.value).trim() || null,
    author: w.auteur?.reference?.nom?.value?.trim() || null,
    // halo = couleur de l'univers du produit (comme la saga hérite du sien)
    accent: resolveAccentColor(null, w.univers?.reference?.couleurTheme?.value),
    covers: [{url: w.featuredImage.url, altText: w.featuredImage.altText ?? w.title}],
    background: null,
    rating: null,
    href: `/products/${w.handle}`,
    ctaLabel: status === 'précommande' ? 'Précommander' : 'Découvrir le livre',
  };
}

/** AUTO : sagas (metaobjects) d'abord, puis one-shots (œuvres indépendantes flaggées). */
export function buildHomeScreens(
  sagas: ReadonlyArray<SagaNode>,
  works: ReadonlyArray<ScreenWork>,
): HomeScreen[] {
  const out: HomeScreen[] = [];
  for (const s of sagas) {
    const screen = sagaScreen(s);
    if (screen) out.push(screen);
  }
  for (const w of works) {
    const screen = workScreen(w);
    if (screen) out.push(screen);
  }
  return out;
}

/** Une entrée du metaobject `accueil` = une slide (réf. saga OU réf. produit). */
export interface AccueilSlide {
  saga?: {reference?: SagaNode | null} | null;
  produit?: {reference?: ScreenWork | null} | null;
  /** Fond optionnel de la slide (`image_de_fond`) : prime sur l'image saga/produit. */
  fond?: {reference?: {image?: {url?: string | null} | null} | null} | null;
  /** Note moyenne (`note_moyenne`) et nombre de lecteurs (`nombre_lecteurs`). */
  note?: MV | null;
  lecteurs?: MV | null;
}

/**
 * CURATÉ : une slide par entrée du metaobject `accueil`, dans l'ordre des entrées.
 * Chaque slide pointe vers une saga ou un produit (one-shot affiché même sans le
 * flag « œuvre indépendante », puisque l'admin l'a explicitement placé là).
 */
export function buildCuratedScreens(
  slides: ReadonlyArray<AccueilSlide>,
): HomeScreen[] {
  const out: HomeScreen[] = [];
  for (const slide of slides) {
    const screen = slide.saga?.reference
      ? sagaScreen(slide.saga.reference)
      : slide.produit?.reference
        ? workScreen(slide.produit.reference, false)
        : null;
    if (!screen) continue;
    // Le fond posé sur la slide prime ; sinon on garde l'image saga/produit.
    const slideBg = slide.fond?.reference?.image?.url ?? null;
    if (slideBg) screen.background = slideBg;
    // Avis lecteurs : portés par la slide (saisis à la main).
    screen.rating = parseRating(slide.note?.value, slide.lecteurs?.value);
    out.push(screen);
  }
  return out;
}
