import type {CoverImage} from '~/components/WorkTile';
import type {TomeCardProps} from '~/components/TomeCard';
import {parseBool, parseNumeroTome, parseStatutParution} from '~/lib/tomeMetafields';
import {seededShuffle} from '~/lib/seededShuffle';

interface MetafieldValue {
  value?: string | null;
}
interface ImageRef {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface CatalogueProduct {
  id: string;
  handle: string;
  title: string;
  featuredImage?: ImageRef | null;
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  univers?: {reference?: {handle: string; title: string} | null} | null;
  numeroTome?: MetafieldValue | null;
  statutParution?: MetafieldValue | null;
  dateParution?: MetafieldValue | null;
  estUneOeuvreIndependante?: MetafieldValue | null;
}

export interface CatalogueUniverse {
  handle: string;
  title: string;
  couleurTheme?: MetafieldValue | null;
  estUneOeuvreIndependante?: MetafieldValue | null;
}

export interface CatalogueSectionData {
  key: string;
  name: string;
  accent: string | null;
  href: string | null;
  tomes: TomeCardProps[];
}

function toCover(img: ImageRef | null | undefined, alt: string): CoverImage | null {
  if (!img?.url) return null;
  return {url: img.url, altText: img.altText ?? alt, width: img.width ?? 0, height: img.height ?? 0};
}

function toTomeCard(p: CatalogueProduct): TomeCardProps | null {
  const cover = toCover(p.featuredImage, p.title);
  if (!cover) return null;
  const fmt = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: p.priceRange.minVariantPrice.currencyCode || 'EUR',
  });
  return {
    handle: p.handle,
    title: p.title,
    cover,
    status: parseStatutParution(p.statutParution?.value),
    releaseDate: p.dateParution?.value ?? null,
    tomeNumber: parseNumeroTome(p.numeroTome?.value),
    priceFormatted: fmt.format(parseFloat(p.priceRange.minVariantPrice.amount)),
  };
}

export function buildCatalogue(
  products: ReadonlyArray<CatalogueProduct>,
  universes: ReadonlyArray<CatalogueUniverse>,
  seed: number,
): CatalogueSectionData[] {
  const universeMap = new Map(universes.map((u) => [u.handle, u]));

  const byUniverse = new Map<string, CatalogueProduct[]>();
  const standalone: CatalogueProduct[] = [];
  const orphans: CatalogueProduct[] = [];

  for (const p of products) {
    if (parseBool(p.estUneOeuvreIndependante?.value)) {
      standalone.push(p);
      continue;
    }
    const uh = p.univers?.reference?.handle ?? null;
    if (uh) {
      const list = byUniverse.get(uh) ?? [];
      list.push(p);
      byUniverse.set(uh, list);
    } else {
      orphans.push(p);
    }
  }

  const universeSections: CatalogueSectionData[] = [];
  for (const [handle, list] of byUniverse) {
    const tomes = list
      .slice()
      .sort(
        (a, b) =>
          (parseNumeroTome(a.numeroTome?.value) ?? 9999) -
          (parseNumeroTome(b.numeroTome?.value) ?? 9999),
      )
      .map(toTomeCard)
      .filter((t): t is TomeCardProps => t !== null);
    if (tomes.length === 0) continue;
    const u = universeMap.get(handle);
    universeSections.push({
      key: handle,
      name: u?.title ?? list[0].univers?.reference?.title ?? handle,
      accent: u?.couleurTheme?.value?.trim() || null,
      href: `/collections/${handle}`,
      tomes,
    });
  }

  const sections = seededShuffle(universeSections, seed);

  const standaloneTomes = seededShuffle(standalone, seed)
    .map(toTomeCard)
    .filter((t): t is TomeCardProps => t !== null);
  if (standaloneTomes.length > 0) {
    sections.push({key: '__indep', name: 'Romans indépendants', accent: null, href: null, tomes: standaloneTomes});
  }

  const orphanTomes = orphans.map(toTomeCard).filter((t): t is TomeCardProps => t !== null);
  if (orphanTomes.length > 0) {
    sections.push({key: '__autres', name: 'Autres œuvres', accent: null, href: null, tomes: orphanTomes});
  }

  return sections;
}
