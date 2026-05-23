import {useEffect, useRef, useState} from 'react';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import type {FetcherWithComponents} from 'react-router';
import {ShopPayButton} from '@shopify/hydrogen-react';
import {DedicaceField, type DedicaceState} from './DedicaceField';
import type {ReleaseStatus} from './ReleaseStatusBadge';
import {useAside} from './Aside';

export interface TomeAddToCartProps {
  variantId: string;
  available: boolean;
  status: ReleaseStatus;
  priceFormatted: string;
  releaseDate?: string | null;
  storeDomain?: string | null;
}

/** Enfant du render-prop CartForm : hooks autorisés ici (toast au succès). */
function AddButton({
  fetcher,
  available,
  label,
  onAdd,
}: {
  fetcher: FetcherWithComponents<unknown>;
  available: boolean;
  label: string;
  onAdd: () => void;
}) {
  const [showToast, setShowToast] = useState(false);
  const prev = useRef(fetcher.state);
  useEffect(() => {
    if (prev.current !== 'idle' && fetcher.state === 'idle' && fetcher.data) {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 1800);
      prev.current = fetcher.state;
      return () => clearTimeout(t);
    }
    prev.current = fetcher.state;
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <button
        type="submit"
        onClick={onAdd}
        disabled={!available || fetcher.state !== 'idle'}
        style={{
          flex: 1,
          padding: '14px',
          fontFamily: 'var(--bsk-font-sans)',
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '0.03em',
          color: '#231603',
          height: '46px',
          background: available
            ? 'linear-gradient(135deg, var(--bsk-accent-gold), var(--bsk-accent-gold-dim))'
            : 'var(--bsk-fg-muted)',
          border: 'none',
          borderRadius: 'var(--bsk-radius)',
          cursor: available ? 'pointer' : 'not-allowed',
        }}
      >
        {fetcher.state !== 'idle' ? '…' : label}
      </button>
      <div className={`fiche-toast${showToast ? ' is-show' : ''}`} role="status" aria-live="polite">
        Ajouté au panier ✓
      </div>
    </>
  );
}

export function TomeAddToCart({
  variantId,
  available,
  status,
  priceFormatted,
  releaseDate,
  storeDomain,
}: TomeAddToCartProps) {
  const [dedicace, setDedicace] = useState<DedicaceState>({activated: false, name: ''});
  const [quantity, setQuantity] = useState(1);
  const {open} = useAside();

  if (status === 'annoncé') {
    return (
      <div
        style={{
          padding: 'var(--bsk-space-5)',
          border: '1px solid var(--bsk-border-subtle)',
          background: 'var(--bsk-bg-raised)',
          borderRadius: 'var(--bsk-radius)',
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
        <p style={{fontStyle: 'italic', color: 'var(--bsk-fg-secondary)'}}>
          Ce titre est annoncé sans date de sortie. Le formulaire de notification sera disponible
          prochainement.
        </p>
      </div>
    );
  }

  if (!available) {
    return (
      <div>
        <p
          style={{
            fontFamily: 'var(--bsk-font-display)',
            fontWeight: 700,
            fontSize: 'var(--bsk-text-xl)',
            color: 'var(--bsk-fg-primary)',
            margin: '6px 0 18px',
          }}
        >
          {priceFormatted}
        </p>
        <div
          style={{
            padding: 'var(--bsk-space-5)',
            border: '1px solid var(--bsk-border-subtle)',
            background: 'var(--bsk-bg-raised)',
            borderRadius: 'var(--bsk-radius)',
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
            Épuisé
          </p>
          <p style={{fontStyle: 'italic', color: 'var(--bsk-fg-secondary)'}}>
            Ce titre est momentanément en rupture de stock. Il sera bientôt de retour.
          </p>
        </div>
      </div>
    );
  }

  const ctaLabel = status === 'précommande' ? 'Précommander' : 'Ajouter au panier';

  const lineAttributes: Array<{key: string; value: string}> = [];
  if (dedicace.activated) {
    lineAttributes.push({key: '_dedicace_activee', value: 'true'});
    if (dedicace.name.trim()) {
      lineAttributes.push({key: 'Dédicace', value: dedicace.name.trim()});
    }
  }
  const lines: OptimisticCartLineInput[] = [
    {merchandiseId: variantId, quantity, attributes: lineAttributes},
  ];

  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--bsk-font-display)',
          fontWeight: 700,
          fontSize: 'var(--bsk-text-xl)',
          color: 'var(--bsk-fg-primary)',
          margin: '6px 0 18px',
        }}
      >
        {priceFormatted}
      </p>
      {status === 'précommande' && releaseDate ? (
        <p style={{fontSize: 'var(--bsk-text-sm)', color: 'var(--bsk-accent-gold)', marginBottom: 'var(--bsk-space-4)'}}>
          Sortie prévue : {new Date(releaseDate).toLocaleDateString('fr-FR')}
        </p>
      ) : null}

      <DedicaceField onChange={setDedicace} />

      <div style={{display: 'flex', gap: '12px', marginBottom: '12px'}}>
        <div style={{display: 'flex', alignItems: 'center', border: '1px solid var(--bsk-border-subtle)', borderRadius: 'var(--bsk-radius)', overflow: 'hidden', height: '46px'}}>
          <button
            type="button"
            aria-label="diminuer la quantité"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            style={{width: 42, height: 44, background: 'transparent', border: 'none', color: 'var(--bsk-fg-primary)', fontSize: 18, cursor: 'pointer'}}
          >
            −
          </button>
          <span style={{width: 34, textAlign: 'center', fontWeight: 600, color: 'var(--bsk-fg-primary)'}}>{quantity}</span>
          <button
            type="button"
            aria-label="augmenter la quantité"
            onClick={() => setQuantity((q) => q + 1)}
            style={{width: 42, height: 44, background: 'transparent', border: 'none', color: 'var(--bsk-fg-primary)', fontSize: 18, cursor: 'pointer'}}
          >
            +
          </button>
        </div>
        <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
          {(fetcher: FetcherWithComponents<unknown>) => (
            <AddButton
              fetcher={fetcher}
              available={available}
              label={ctaLabel}
              onAdd={() => open('cart')}
            />
          )}
        </CartForm>
      </div>

      {storeDomain && variantId ? (
        <div style={{marginBottom: '12px'}}>
          <ShopPayButton
            variantIdsAndQuantities={[{id: variantId, quantity}]}
            storeDomain={storeDomain}
            width="100%"
          />
        </div>
      ) : null}

      <a
        href="#"
        style={{display: 'block', textAlign: 'center', color: 'var(--bsk-accent-gold)', fontSize: '13px', textDecoration: 'none', padding: '6px'}}
      >
        Lire un extrait (10 pages) →
      </a>
    </div>
  );
}
