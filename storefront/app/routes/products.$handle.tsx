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
import {universeAccentStyle} from '~/lib/universeAccent';
import {TomePageTemplate} from '~/components/TomePageTemplate';
import {OneShotPageTemplate} from '~/components/OneShotPageTemplate';
import {TomeAddToCart} from '~/components/TomeAddToCart';
import {RelatedRail, type RelatedItem} from '~/components/RelatedRail';
import type {CoverImage} from '~/components/Cover';
import '~/styles/fiche.css';

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
    images(first: 8) { nodes { url altText width height } }
    options { name optionValues { name } }
    encodedVariantExistence
    encodedVariantAvailability
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    ...TomeMetafields
    couleurTheme: metafield(namespace: "custom", key: "couleur_theme") { value }
    genre: metafield(namespace: "custom", key: "genre") { value }
    ambiance: metafield(namespace: "custom", key: "ambiance") { value }
    format: metafield(namespace: "custom", key: "format") { value }
    nombrePages: metafield(namespace: "custom", key: "nombre_pages") { value }
    isbn: metafield(namespace: "custom", key: "isbn") { value }
    relatedUniverse: metafield(namespace: "custom", key: "univers") {
      reference {
        ... on Collection {
          handle
          title
          couleurTheme: metafield(namespace: "custom", key: "couleur_theme") { value }
          genre: metafield(namespace: "custom", key: "genre") { value }
          products(first: 8) {
            nodes {
              id handle title
              featuredImage { url altText width height }
              priceRange { minVariantPrice { amount currencyCode } }
              statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
            }
          }
        }
      }
    }
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
    standalone: products(first: 12) {
      nodes {
        id handle title
        featuredImage { url altText width height }
        priceRange { minVariantPrice { amount currencyCode } }
        estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
        statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Error('Expected product handle');
  const {product, standalone} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });
  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product, standalone, storeDomain: context.env.PUBLIC_STORE_DOMAIN};
}

function fmtCurrency(amount: string, currency: string) {
  return new Intl.NumberFormat('fr-FR', {style: 'currency', currency}).format(parseFloat(amount));
}

function priceLabelFor(
  status: ReturnType<typeof parseStatutParution>,
  amount: string,
  currency: string,
): string | null {
  if (status === 'précommande') return 'Préco';
  if (status === 'annoncé') return 'À paraître';
  const n = parseFloat(amount);
  return n > 0 ? fmtCurrency(amount, currency) : null;
}

function toCover(
  img: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null | undefined,
  alt: string,
): CoverImage | null {
  if (!img?.url) return null;
  return {url: img.url, altText: img.altText ?? alt, width: img.width ?? 0, height: img.height ?? 0};
}

export default function ProductRoute() {
  const {product, standalone, storeDomain} = useLoaderData<typeof loader>();
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const isStandalone = parseBool(product.estUneOeuvreIndependante?.value);
  const status = parseStatutParution(product.statutParution?.value);
  const currency = selectedVariant?.price.currencyCode ?? 'EUR';
  const priceFormatted = fmtCurrency(selectedVariant?.price.amount ?? '0', currency);

  const cover: CoverImage = toCover(product.featuredImage, product.title) ?? {
    url: '',
    altText: product.title,
    width: 400,
    height: 600,
  };
  const galleryImages = (product.images?.nodes ?? [])
    .map((i) => toCover(i, product.title))
    .filter((c): c is CoverImage => c !== null);

  const description = product.description ?? '';

  const techRows = [
    product.format?.value ? {label: 'Format', value: product.format.value} : null,
    product.nombrePages?.value ? {label: 'Pages', value: product.nombrePages.value} : null,
    product.isbn?.value ? {label: 'ISBN', value: product.isbn.value} : null,
    product.dateParution?.value
      ? {label: 'Parution', value: new Date(product.dateParution.value).toLocaleDateString('fr-FR')}
      : null,
    {label: 'Langue', value: 'Français'},
  ].filter((r): r is {label: string; value: string} => r !== null);

  const purchase = (
    <TomeAddToCart
      variantId={selectedVariant?.id ?? ''}
      available={selectedVariant?.availableForSale ?? false}
      status={status}
      priceFormatted={priceFormatted}
      releaseDate={product.dateParution?.value ?? null}
      storeDomain={storeDomain}
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
    const productColor = product.couleurTheme?.value ?? null;
    const relatedItems: RelatedItem[] = (standalone?.nodes ?? [])
      .filter((p) => parseBool(p.estUneOeuvreIndependante?.value) && p.handle !== product.handle)
      .slice(0, 8)
      .map((p) => ({
        handle: p.handle,
        title: p.title,
        cover: toCover(p.featuredImage, p.title),
        priceLabel: priceLabelFor(
          parseStatutParution(p.statutParution?.value),
          p.priceRange.minVariantPrice.amount,
          p.priceRange.minVariantPrice.currencyCode,
        ),
      }));

    return (
      <div style={universeAccentStyle(productColor)}>
        <OneShotPageTemplate
          title={product.title}
          teaserShort={product.teaserCourt?.value ?? null}
          description={description}
          cover={cover}
          pillLabel="ROMAN"
          ambiance={product.ambiance?.value ?? null}
          techRows={techRows}
          purchaseSlot={purchase}
          relatedSlot={<RelatedRail heading="Autres romans indépendants" items={relatedItems} />}
        />
        {analytics}
      </div>
    );
  }

  const universeRef = product.relatedUniverse?.reference;
  const universeData =
    universeRef && 'handle' in universeRef
      ? {handle: universeRef.handle, title: universeRef.title}
      : {handle: '', title: '—'};
  const universeColor =
    universeRef && 'couleurTheme' in universeRef ? universeRef.couleurTheme?.value ?? null : null;
  const universeProducts =
    universeRef && 'products' in universeRef ? universeRef.products.nodes : [];
  const tomeCount = universeProducts.length;
  const universeKicker =
    universeRef && 'genre' in universeRef && universeRef.genre?.value
      ? `${universeRef.genre.value} · ${tomeCount} tome${tomeCount > 1 ? 's' : ''}`
      : tomeCount > 0
        ? `${tomeCount} tome${tomeCount > 1 ? 's' : ''}`
        : null;

  const relatedItems: RelatedItem[] = universeProducts
    .filter((p) => p.handle !== product.handle)
    .slice(0, 8)
    .map((p) => ({
      handle: p.handle,
      title: p.title,
      cover: toCover(p.featuredImage, p.title),
      priceLabel: priceLabelFor(
        parseStatutParution(p.statutParution?.value),
        p.priceRange.minVariantPrice.amount,
        p.priceRange.minVariantPrice.currencyCode,
      ),
    }));

  const breadcrumbs = [
    {label: 'Accueil', href: '/'},
    ...(universeData.handle
      ? [{label: universeData.title, href: `/collections/${universeData.handle}`}]
      : []),
    {label: product.title},
  ];

  return (
    <div style={universeAccentStyle(universeColor)}>
      <TomePageTemplate
        breadcrumbs={breadcrumbs}
        title={product.title}
        pill={product.genre?.value ?? null}
        tomeLabel={
          product.numeroTome?.value ? `${universeData.title} · Tome ${product.numeroTome.value}` : null
        }
        teaserShort={product.teaserCourt?.value ?? null}
        description={description}
        cover={cover}
        galleryImages={galleryImages}
        universe={universeData}
        universeKicker={universeKicker}
        techRows={techRows}
        purchaseSlot={purchase}
        relatedSlot={<RelatedRail heading="Dans le même univers" items={relatedItems} />}
      />
      {analytics}
    </div>
  );
}
