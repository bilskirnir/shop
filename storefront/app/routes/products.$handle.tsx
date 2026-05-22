import {useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {TOME_METAFIELDS_FRAGMENT} from '~/lib/fragments';
import {parseBool, parseStatutParution} from '~/lib/tomeMetafields';
import {TomePageTemplate} from '~/components/TomePageTemplate';
import {OneShotPageTemplate} from '~/components/OneShotPageTemplate';
import {TomeAddToCart} from '~/components/TomeAddToCart';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.product.title ?? ''} — Bilskirnir`},
  {rel: 'canonical', href: `/products/${data?.product.handle ?? ''}`},
];

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    id
    title
    price { amount currencyCode }
    compareAtPrice { amount currencyCode }
    image { id url altText width height }
    selectedOptions { name value }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    description
    featuredImage { url altText width height }
    options {
      name
      optionValues { name }
    }
    encodedVariantExistence
    encodedVariantAvailability
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    ...TomeMetafields
    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${TOME_METAFIELDS_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Error('Expected product handle');
  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });
  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product};
}

export default function ProductRoute() {
  const {product} = useLoaderData<typeof loader>();
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const isStandalone = parseBool(product.estUneOeuvreIndependante?.value);
  const status = parseStatutParution(product.statutParution?.value);
  const fmt = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: selectedVariant?.price.currencyCode ?? 'EUR',
  });
  const priceFormatted = fmt.format(
    parseFloat(selectedVariant?.price.amount ?? '0'),
  );

  const cover = product.featuredImage
    ? {
        url: product.featuredImage.url,
        altText: product.featuredImage.altText ?? product.title,
        width: product.featuredImage.width ?? 0,
        height: product.featuredImage.height ?? 0,
      }
    : {url: '', altText: product.title, width: 400, height: 600};

  // Use plain `description` (Shopify natural plain-text output) instead of
  // `descriptionHtml`. If formatted rich text in synopsis is needed, Plan 3+
  // will add a renderer.
  const description = product.description ?? '';

  const purchase = (
    <TomeAddToCart
      variantId={selectedVariant?.id ?? ''}
      available={selectedVariant?.availableForSale ?? false}
      status={status}
      priceFormatted={priceFormatted}
      releaseDate={product.dateParution?.value ?? null}
    />
  );

  const analytics = (
    <Analytics.ProductView
      data={{
        products: [
          {
            id: product.id,
            title: product.title,
            price: selectedVariant?.price.amount ?? '0',
            vendor: product.vendor,
            variantId: selectedVariant?.id ?? '',
            variantTitle: selectedVariant?.title ?? '',
            quantity: 1,
          },
        ],
      }}
    />
  );

  if (isStandalone) {
    return (
      <>
        <OneShotPageTemplate
          title={product.title}
          teaserShort={product.teaserCourt?.value ?? null}
          description={description}
          cover={cover}
          pillLabel="ROMAN"
          purchaseSlot={purchase}
        />
        {analytics}
      </>
    );
  }

  const universe = product.univers?.reference;
  const universeData =
    universe && 'handle' in universe
      ? {handle: universe.handle, title: universe.title}
      : {handle: '', title: '—'};
  const breadcrumbs = [
    {label: 'Accueil', href: '/'},
    ...(universe && 'handle' in universe
      ? [{label: universe.title, href: `/collections/${universe.handle}`}]
      : []),
    {label: product.title},
  ];

  return (
    <>
      <TomePageTemplate
        breadcrumbs={breadcrumbs}
        title={product.title}
        teaserShort={product.teaserCourt?.value ?? null}
        description={description}
        cover={cover}
        universe={universeData}
        purchaseSlot={purchase}
      />
      {analytics}
    </>
  );
}
