/**
 * Découpe un lore en citation (1er paragraphe) + corps (paragraphes suivants).
 * Un seul paragraphe → pas de citation, tout dans `body`.
 */
export function splitLore(text: string): {quote: string | null; body: string} {
  const paras = (text ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paras.length === 0) return {quote: null, body: ''};
  if (paras.length === 1) return {quote: null, body: paras[0]};
  return {quote: paras[0], body: paras.slice(1).join('\n\n')};
}
