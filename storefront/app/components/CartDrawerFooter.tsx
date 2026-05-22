import {ShopPayButton} from '@shopify/hydrogen-react';

export interface CartShopPayLine {
  id: string;
  quantity: number;
}

export function CartDrawerFooter({
  subtotalAmount,
  currencyCode,
  checkoutUrl,
  lines,
  storeDomain,
}: {
  subtotalAmount: string;
  currencyCode: string;
  checkoutUrl?: string;
  lines: CartShopPayLine[];
  storeDomain?: string | null;
}) {
  const subtotal = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode || 'EUR',
  }).format(parseFloat(subtotalAmount || '0'));

  return (
    <div className="bsk-cart-foot">
      <div className="bsk-cart-subtotal">
        <span className="l">Sous-total</span>
        <span className="v">{subtotal}</span>
      </div>
      <div className="bsk-cart-shipnote">Frais de port et taxes calculés au paiement.</div>
      {checkoutUrl ? (
        <a className="bsk-cart-checkout" href={checkoutUrl} target="_self">
          Passer au paiement
        </a>
      ) : null}
      {storeDomain && lines.length > 0 ? (
        <ShopPayButton
          variantIdsAndQuantities={lines.map((l) => ({id: l.id, quantity: l.quantity}))}
          storeDomain={storeDomain}
          width="100%"
        />
      ) : null}
    </div>
  );
}
