import {useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import type {CollectionQuery} from 'storefrontapi.generated';
import {Container} from '~/components/Container';
import {UniverseHero} from '~/components/UniverseHero';
import {SagaSection} from '~/components/SagaSection';
import {TomeCard} from '~/components/TomeCard';
import {Ornament} from '~/components/Ornament';
import {UNIVERSE_DETAIL_FRAGMENT} from '~/lib/fragments';
import {
  metaobjectField,
  parseNumeroTome,
  parseStatutParution,
  richTextToPlain,
} from '~/lib/tomeMetafields';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.collection.title ?? 'Univers'} — Bilskirnir`},
];

const COLLECTION_QUERY = `#graphql
  query Collection($country: CountryCode, $language: LanguageCode, $handle: String!)
    @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      ...UniverseDetail
    }
  }
  ${UNIVERSE_DETAIL_FRAGMENT}
` as const;

export async function loader({context, params}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Response('Missing handle', {status: 400});
  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    variables: {handle},
  });
  if (!collection) throw new Response('Not found', {status: 404});
  return {collection};
}

type Collection = NonNullable<CollectionQuery['collection']>;
type ProductNode = Collection['products']['nodes'][number];

function toTomeCardProps(p: ProductNode) {
  const status = parseStatutParution(p.statutParution?.value);
  const fmt = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: p.priceRange.minVariantPrice.currencyCode,
  });
  const cover = p.featuredImage
    ? {
        url: p.featuredImage.url,
        altText: p.featuredImage.altText ?? p.title,
        width: p.featuredImage.width ?? 0,
        height: p.featuredImage.height ?? 0,
      }
    : {url: '', altText: p.title, width: 400, height: 600};
  return {
    handle: p.handle,
    title: p.title,
    cover,
    status,
    releaseDate: p.dateParution?.value ?? null,
    tomeNumber: parseNumeroTome(p.numeroTome?.value),
    priceFormatted: fmt.format(parseFloat(p.priceRange.minVariantPrice.amount)),
  };
}

export default function CollectionRoute() {
  const {collection} = useLoaderData<typeof loader>();

  const heroImageRef = collection.illustrationHero?.reference?.image;
  const heroImage = heroImageRef
    ? {
        url: heroImageRef.url,
        altText: heroImageRef.altText ?? collection.title,
        width: heroImageRef.width ?? 0,
        height: heroImageRef.height ?? 0,
      }
    : null;
  const themeColor = collection.couleurTheme?.value ?? null;
  const lore = richTextToPlain(collection.lore?.value);
  const sagaNodes = collection.sagas?.references?.nodes ?? [];
  const products = collection.products.nodes;

  // Group products by saga.handle
  const productsBySaga = new Map<string, ProductNode[]>();
  const standaloneProducts: ProductNode[] = [];
  for (const p of products) {
    const sagaHandle = p.saga?.reference?.handle ?? null;
    if (sagaHandle) {
      const existing = productsBySaga.get(sagaHandle) ?? [];
      existing.push(p);
      productsBySaga.set(sagaHandle, existing);
    } else {
      standaloneProducts.push(p);
    }
  }

  const stats = `${
    sagaNodes.length > 0
      ? `${sagaNodes.length} saga${sagaNodes.length > 1 ? 's' : ''} · `
      : ''
  }${products.length} tome${products.length > 1 ? 's' : ''}`;

  return (
    <>
      <UniverseHero
        title={collection.title}
        heroImage={heroImage}
        themeColor={themeColor}
        lore={lore}
        stats={stats}
      />
      <Container width="content">
        {sagaNodes.length > 0 ? (
          <>
            {sagaNodes.map((saga, i) => {
              const nom = metaobjectField(saga.fields, 'nom') ?? '';
              const synopsis = richTextToPlain(
                metaobjectField(saga.fields, 'synopsis'),
              );
              const tomes = (productsBySaga.get(saga.handle) ?? [])
                .map(toTomeCardProps)
                .sort((a, b) => (a.tomeNumber ?? 0) - (b.tomeNumber ?? 0));
              return (
                <div key={saga.id}>
                  <SagaSection nom={nom} synopsis={synopsis} tomes={tomes} />
                  {i < sagaNodes.length - 1 && <Ornament />}
                </div>
              );
            })}
            {standaloneProducts.length > 0 && (
              <section style={{padding: 'var(--bsk-space-12) 0'}}>
                <h2
                  style={{
                    fontFamily: 'var(--bsk-font-serif)',
                    fontSize: 'var(--bsk-text-xl)',
                    textAlign: 'center',
                    color: 'var(--bsk-fg-primary)',
                    marginBottom: 'var(--bsk-space-6)',
                  }}
                >
                  Hors saga
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--bsk-space-6)',
                  }}
                >
                  {standaloneProducts.map(toTomeCardProps).map((t) => (
                    <TomeCard key={t.handle} {...t} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section style={{padding: 'var(--bsk-space-12) 0'}}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--bsk-space-6)',
              }}
            >
              {products
                .map(toTomeCardProps)
                .sort((a, b) => (a.tomeNumber ?? 0) - (b.tomeNumber ?? 0))
                .map((t) => (
                  <TomeCard key={t.handle} {...t} />
                ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
