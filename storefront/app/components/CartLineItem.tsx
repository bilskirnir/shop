import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {useAside} from './Aside';
import {dedicaceFromAttributes} from '~/lib/cartAttributes';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

function formatMoney(amount?: string, currency?: string) {
  if (!amount) return '';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency || 'EUR',
  }).format(parseFloat(amount));
}

export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const dedicace = dedicaceFromAttributes(line.attributes);
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  return (
    <li className="bsk-cart-line">
      {image?.url ? (
        <img src={image.url} alt={image.altText ?? product.title} loading="lazy" />
      ) : null}

      <div className="bsk-cart-line-main">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => layout === 'aside' && close()}
          style={{textDecoration: 'none'}}
        >
          <p className="bsk-cart-line-title">{product.title}</p>
        </Link>

        {dedicace ? <div className="bsk-cart-ded">Dédicace : « {dedicace} »</div> : null}

        <div className="bsk-cart-line-foot">
          <CartLineQuantity line={line} />
          <span className="bsk-cart-price">
            {formatMoney(line.cost?.totalAmount?.amount, line.cost?.totalAmount?.currencyCode)}
          </span>
        </div>
        <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
      </div>

      {lineItemChildren ? (
        <div>
          <p id={childrenLabelId} className="sr-only">
            Articles liés à {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId}>
            {lineItemChildren.map((childLine) => (
              <CartLineItem childrenMap={childrenMap} key={childLine.id} line={childLine} layout={layout} />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="bsk-qty">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button aria-label="Diminuer la quantité" disabled={quantity <= 1 || !!isOptimistic} name="decrease-quantity" value={prevQuantity}>
          −
        </button>
      </CartLineUpdateButton>
      <span>{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button aria-label="Augmenter la quantité" name="increase-quantity" value={nextQuantity} disabled={!!isOptimistic}>
          +
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

function CartLineRemoveButton({lineIds, disabled}: {lineIds: string[]; disabled: boolean}) {
  return (
    <CartForm fetcherKey={getUpdateKey(lineIds)} route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{lineIds}}>
      <button className="bsk-cart-remove" disabled={disabled} type="submit">
        Retirer
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({children, lines}: {children: React.ReactNode; lines: CartLineUpdateInput[]}) {
  const lineIds = lines.map((line) => line.id);
  return (
    <CartForm fetcherKey={getUpdateKey(lineIds)} route="/cart" action={CartForm.ACTIONS.LinesUpdate} inputs={{lines}}>
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
