export interface CartAttribute {
  key: string;
  value?: string | null;
}

/** Extrait la note de dédicace d'une ligne panier (clé « Dédicace »). */
export function dedicaceFromAttributes(
  attributes: ReadonlyArray<CartAttribute> | null | undefined,
): string | null {
  if (!attributes) return null;
  const found = attributes.find((a) => a.key === 'Dédicace');
  const value = found?.value?.trim();
  return value ? value : null;
}
