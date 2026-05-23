import {richTextToPlain} from '~/lib/tomeMetafields';

interface MetafieldValue {
  value?: string | null;
}

export interface IndexCollection {
  handle: string;
  title: string;
  couleurTheme?: MetafieldValue | null;
  genre?: MetafieldValue | null;
  lore?: MetafieldValue | null;
  sagas?: {references?: {nodes: ReadonlyArray<{id: string}>} | null} | null;
  products: {nodes: ReadonlyArray<{id: string}>};
}

export interface UniverseCardProps {
  handle: string;
  name: string;
  genre: string | null;
  citation: string | null;
  stats: string;
  accent: string | null;
  href: string;
}

function firstParagraph(text: string): string | null {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paras.length > 1 ? paras[0] : null;
}

export function buildUniverseIndex(
  collections: ReadonlyArray<IndexCollection>,
  denylist: ReadonlyArray<string>,
): UniverseCardProps[] {
  const deny = new Set(denylist);
  return collections
    .filter((c) => !deny.has(c.handle) && c.products.nodes.length > 0)
    .map((c) => {
      const sagaCount = c.sagas?.references?.nodes.length ?? 0;
      const tomeCount = c.products.nodes.length;
      const stats =
        (sagaCount > 0 ? `${sagaCount} saga${sagaCount > 1 ? 's' : ''} · ` : '') +
        `${tomeCount} tome${tomeCount > 1 ? 's' : ''}`;
      return {
        handle: c.handle,
        name: c.title,
        genre: c.genre?.value?.trim() || null,
        citation: firstParagraph(richTextToPlain(c.lore?.value)),
        stats,
        accent: c.couleurTheme?.value?.trim() || null,
        href: `/collections/${c.handle}`,
      };
    });
}
