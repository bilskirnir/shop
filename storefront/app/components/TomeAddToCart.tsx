import {useState, useCallback} from 'react';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {DedicaceField, type DedicaceState} from './DedicaceField';
import type {ReleaseStatus} from './ReleaseStatusBadge';

export interface TomeAddToCartProps {
  variantId: string;
  available: boolean;
  status: ReleaseStatus;
  priceFormatted: string;
  releaseDate?: string | null;
}

export function TomeAddToCart({
  variantId,
  available,
  status,
  priceFormatted,
  releaseDate,
}: TomeAddToCartProps) {
  const [dedicace, setDedicace] = useState<DedicaceState>({
    activated: false,
    name: '',
  });
  const handleDedicaceChange = useCallback((s: DedicaceState) => setDedicace(s), []);

  if (status === 'annoncé') {
    return (
      <div
        style={{
          padding: 'var(--bsk-space-5)',
          border: '1px solid var(--bsk-border-subtle)',
          background: 'var(--bsk-bg-raised)',
          borderRadius: '2px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-xs)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--bsk-fg-secondary)',
            marginBottom: 'var(--bsk-space-3)',
          }}
        >
          À PARAÎTRE
        </p>
        <p
          style={{
            fontFamily: 'var(--bsk-font-serif)',
            fontStyle: 'italic',
            color: 'var(--bsk-fg-secondary)',
          }}
        >
          Ce titre est annoncé sans date de sortie. Le formulaire de
          notification sera disponible prochainement.
        </p>
      </div>
    );
  }

  const ctaLabel =
    status === 'précommande' ? 'Précommander' : 'Ajouter au panier';

  const lineAttributes: Array<{key: string; value: string}> = [];
  if (dedicace.activated) {
    lineAttributes.push({key: '_dedicace_activee', value: 'true'});
    if (dedicace.name.trim()) {
      lineAttributes.push({key: 'Dédicace', value: dedicace.name.trim()});
    }
  }

  const lines: OptimisticCartLineInput[] = [
    {
      merchandiseId: variantId,
      quantity: 1,
      attributes: lineAttributes,
    },
  ];

  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--bsk-font-serif)',
          fontSize: 'var(--bsk-text-2xl)',
          color: 'var(--bsk-fg-primary)',
          marginBottom: 'var(--bsk-space-4)',
        }}
      >
        {priceFormatted}
      </p>
      {status === 'précommande' && releaseDate && (
        <p
          style={{
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-sm)',
            color: 'var(--bsk-accent-gold)',
            marginBottom: 'var(--bsk-space-4)',
            letterSpacing: 'var(--bsk-tracking-wide)',
          }}
        >
          Sortie prévue : {new Date(releaseDate).toLocaleDateString('fr-FR')}
        </p>
      )}
      <DedicaceField onChange={handleDedicaceChange} />
      <CartForm
        route="/cart"
        inputs={{lines}}
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher) => (
          <button
            type="submit"
            disabled={!available || fetcher.state !== 'idle'}
            style={{
              width: '100%',
              padding: 'var(--bsk-space-4)',
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-sm)',
              fontWeight: 'var(--bsk-weight-semibold)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-bg-base)',
              background: available
                ? 'var(--bsk-accent-gold)'
                : 'var(--bsk-fg-muted)',
              border: 'none',
              borderRadius: '2px',
              cursor: available ? 'pointer' : 'not-allowed',
            }}
          >
            {fetcher.state !== 'idle' ? '…' : ctaLabel}
          </button>
        )}
      </CartForm>
    </div>
  );
}
