import type {CoverImage} from '~/components/Cover';
import {
  parseBool,
  parseNumeroTome,
  parseStatutParution,
  richTextToPlain,
} from '~/lib/tomeMetafields';

interface MetafieldValue {
  value?: string | null;
}
interface ImageRef {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Données minimales d'un univers (collection) consommées par le slider. */
export interface SlideUniverse {
  id: string;
  handle: string;
  title: string;
  estUneOeuvreIndependante?: MetafieldValue | null;
  lore?: MetafieldValue | null;
  couleurTheme?: MetafieldValue | null;
  illustrationHero?: {reference?: {image?: ImageRef | null} | null} | null;
  products: {
    nodes: ReadonlyArray<{
      featuredImage?: ImageRef | null;
      numeroTome?: MetafieldValue | null;
      statutParution?: MetafieldValue | null;
    }>;
  };
}

/** Données minimales d'une œuvre indépendante (produit) consommées par le slider. */
export interface SlideWork {
  id: string;
  handle: string;
  title: string;
  estUneOeuvreIndependante?: MetafieldValue | null;
  featuredImage?: ImageRef | null;
  teaserCourt?: MetafieldValue | null;
  statutParution?: MetafieldValue | null;
  dateParution?: MetafieldValue | null;
}

export interface SlideImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface SlideCta {
  label: string;
  href: string;
}

export interface HomeSlide {
  key: string;
  kicker: string;
  title: string;
  lore: string | null;
  accent: string | null;
  heroImage: SlideImage | null;
  covers: CoverImage[];
  primary: SlideCta;
  secondary: SlideCta | null;
}

function toCover(img: ImageRef | null | undefined, fallbackAlt: string): CoverImage | null {
  if (!img?.url) return null;
  return {
    url: img.url,
    altText: img.altText ?? fallbackAlt,
    width: img.width ?? 0,
    height: img.height ?? 0,
  };
}

function universeToSlide(u: SlideUniverse): HomeSlide | null {
  if (parseBool(u.estUneOeuvreIndependante?.value)) return null;

  const covers = u.products.nodes
    .slice()
    .sort(
      (a, b) =>
        (parseNumeroTome(a.numeroTome?.value) ?? 9999) -
        (parseNumeroTome(b.numeroTome?.value) ?? 9999),
    )
    .map((p) => toCover(p.featuredImage, u.title))
    .filter((c): c is CoverImage => c !== null)
    .slice(0, 3);

  if (covers.length === 0) return null;

  const tomeCount = u.products.nodes.length;
  const heroRef = u.illustrationHero?.reference?.image;
  const heroImage: SlideImage | null = heroRef?.url
    ? {
        url: heroRef.url,
        altText: heroRef.altText ?? u.title,
        width: heroRef.width ?? 0,
        height: heroRef.height ?? 0,
      }
    : null;
  const href = `/collections/${u.handle}`;

  return {
    key: u.id,
    kicker: `${tomeCount} tome${tomeCount > 1 ? 's' : ''}`,
    title: u.title,
    lore: richTextToPlain(u.lore?.value).trim() || null,
    accent: u.couleurTheme?.value?.trim() || null,
    heroImage,
    covers,
    primary: {label: "Explorer l'univers", href},
    secondary: {label: 'Voir les tomes', href},
  };
}

function workToSlide(w: SlideWork): HomeSlide | null {
  if (!parseBool(w.estUneOeuvreIndependante?.value)) return null;
  const cover = toCover(w.featuredImage, w.title);
  if (!cover) return null;

  const status = parseStatutParution(w.statutParution?.value);
  const href = `/products/${w.handle}`;
  const primary: SlideCta =
    status === 'précommande'
      ? {label: 'Précommander', href}
      : status === 'annoncé'
        ? {label: 'En savoir plus', href}
        : {label: 'Découvrir le livre', href};

  return {
    key: w.id,
    kicker: 'Roman indépendant',
    title: w.title,
    lore: richTextToPlain(w.teaserCourt?.value).trim() || null,
    accent: null, // couleur par livre différée (pas de metafield produit)
    heroImage: null,
    covers: [cover],
    primary,
    secondary: null,
  };
}

/** Univers d'abord (ordre d'entrée), puis œuvres indépendantes. */
export function buildHomeSlides(
  universes: ReadonlyArray<SlideUniverse>,
  works: ReadonlyArray<SlideWork>,
): HomeSlide[] {
  const universeSlides = universes
    .map(universeToSlide)
    .filter((s): s is HomeSlide => s !== null);
  const workSlides = works
    .map(workToSlide)
    .filter((s): s is HomeSlide => s !== null);
  return [...universeSlides, ...workSlides];
}
