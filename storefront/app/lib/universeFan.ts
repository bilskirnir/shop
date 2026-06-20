export interface FanCover {
  url: string;
  altText: string;
  /** Lien vers la fiche produit (couverture cliquable). Absent = couverture décorative. */
  href?: string | null;
}

export interface FanProduct {
  title: string;
  featuredImage?: {url: string; altText?: string | null} | null;
  dateParution?: {value?: string | null} | null;
}

/** Couvertures pour l'éventail : les `max` tomes les plus récemment parus
 * (date ISO `YYYY-MM-DD` décroissante ; sans date → en dernier), sans les
 * produits dépourvus de couverture. */
export function pickFanCovers(products: ReadonlyArray<FanProduct>, max = 3): FanCover[] {
  return products
    .filter((p) => p.featuredImage?.url)
    .map((p) => ({
      url: p.featuredImage!.url,
      altText: p.featuredImage!.altText ?? p.title,
      date: p.dateParution?.value ?? null,
    }))
    .sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    })
    .slice(0, max)
    .map(({url, altText}) => ({url, altText}));
}
