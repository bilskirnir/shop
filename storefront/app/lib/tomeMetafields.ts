import type {ReleaseStatus} from '~/components/ReleaseStatusBadge';

/** Parse une valeur metafield 'statut_parution' en un type strict. */
export function parseStatutParution(
  raw: string | null | undefined,
): ReleaseStatus {
  if (raw === 'précommande' || raw === 'annoncé') return raw;
  return 'publié';
}

export function parseNumeroTome(
  raw: string | null | undefined,
): number | null {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
}

export function parseBool(raw: string | null | undefined): boolean {
  return raw === 'true';
}

/** Get a field value from a Metaobject's `fields` array */
export function metaobjectField(
  fields: Array<{key: string; value: string | null}> | undefined,
  key: string,
): string | null {
  return fields?.find((f) => f.key === key)?.value ?? null;
}

/**
 * Convert a Shopify rich-text metafield value (JSON) into plain text.
 * Shopify rich-text format: nested {type, children, value} nodes.
 * Returns paragraphs separated by newlines so consumers can use
 * `white-space: pre-line` to preserve breaks without injecting HTML.
 *
 * Falls through to the raw string if the value is not JSON (e.g. a
 * `single_line_text_field` or `multi_line_text_field`).
 */
export function richTextToPlain(raw: string | null | undefined): string {
  if (!raw) return '';
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return raw; // already plain text
  }
  return walk(parsed).trim();
}

function walk(node: unknown): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(walk).join('');
  if (!node || typeof node !== 'object') return '';
  const obj = node as {type?: string; value?: string; children?: unknown};
  const inner =
    typeof obj.value === 'string'
      ? obj.value
      : obj.children !== undefined
        ? walk(obj.children)
        : '';
  if (obj.type === 'paragraph' || obj.type === 'heading') {
    return inner + '\n\n';
  }
  if (obj.type === 'list-item' || obj.type === 'list_item') {
    return '• ' + inner + '\n';
  }
  return inner;
}
