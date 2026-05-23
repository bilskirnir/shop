import {useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import type {CollectionQuery} from 'storefrontapi.generated';
import {Container} from '~/components/Container';
import {UniverseHero} from '~/components/UniverseHero';
import {SagaSection} from '~/components/SagaSection';
import {TomeCard} from '~/components/TomeCard';
import {Ornament} from '~/components/Ornament';
import {UniverseRail, type UniverseRailItem} from '~/components/UniverseRail';
import {UNIVERSE_DETAIL_FRAGMENT, UNIVERSE_RAIL_FRAGMENT} from '~/lib/fragments';
import {universeAccentStyle} from '~/lib/universeAccent';
import {pickFanCovers} from '~/lib/universeFan';
import {
  metaobjectField,
  parseBool,
  parseNumeroTome,
  parseStatutParution,
  richTextToPlain,
} from '~/lib/tomeMetafields';
import '~/styles/univers.css';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.collection.title ?? 'Univers'} — Bilskirnir`},
];

const COLLECTION_QUERY = `#graphql
  query Collection($country: CountryCode, $language: LanguageCode, $handle: String!)
    @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      ...UniverseDetail
    }
    otherUniverses: collections(first: 20, sortKey: TITLE) {
      nodes { ...UniverseRailCard }
    }
  }
  ${UNIVERSE_DETAIL_FRAGMENT}
  ${UNIVERSE_RAIL_FRAGMENT}
` as const;

export async function loader({context, params}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Response('Missing handle', {status: 400});
  const {collection, otherUniverses} = await context.storefront.query(
    COLLECTION_QUERY,
    {variables: {handle}},
  );
  if (!collection) throw new Response('Not found', {status: 404});
  return {collection, otherUniverses};
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
  const {collection, otherUniverses} = useLoaderData<typeof loader>();

  const themeColor = collection.couleurTheme?.value ?? null;
  const genre = collection.genre?.value ?? null;
  const lore = richTextToPlain(collection.lore?.value);
  const fanCovers = pickFanCovers(collection.products.nodes);

  const sagaNodes = collection.sagas?.references?.nodes ?? [];
  const products = collection.products.nodes;

  const productsBySaga = new Map<string, ProductNode[]>();
  for (const p of products) {
    const sagaHandle = p.saga?.reference?.handle ?? null;
    if (sagaHandle) {
      const existing = productsBySaga.get(sagaHandle) ?? [];
      existing.push(p);
      productsBySaga.set(sagaHandle, existing);
    }
  }

  const stats = `${
    sagaNodes.length > 0
      ? `${sagaNodes.length} saga${sagaNodes.length > 1 ? 's' : ''} · `
      : ''
  }${products.length} tome${products.length > 1 ? 's' : ''}`;

  const railItems: UniverseRailItem[] = (otherUniverses?.nodes ?? [])
    .filter((c) => c.handle !== collection.handle)
    .map((c) => ({
      handle: c.handle,
      title: c.title,
      kicker: parseBool(c.estUneOeuvreIndependante?.value)
        ? 'Roman indépendant'
        : 'Univers',
      accent: c.couleurTheme?.value ?? null,
    }));

  return (
    <div style={universeAccentStyle(themeColor)}>
      <UniverseHero
        title={collection.title}
        genre={genre}
        lore={lore}
        stats={stats}
        fanCovers={fanCovers}
      />

      <Container width="content">
        {sagaNodes.length > 0 ? (
          <>
            {sagaNodes.map((saga, i) => {
              const nom = metaobjectField(saga.fields, 'nom') ?? '';
              const type = metaobjectField(saga.fields, 'type');
              const synopsis = richTextToPlain(metaobjectField(saga.fields, 'synopsis'));
              const tomes = (productsBySaga.get(saga.handle) ?? [])
                .map(toTomeCardProps)
                .sort((a, b) => (a.tomeNumber ?? 0) - (b.tomeNumber ?? 0));
              return (
                <div key={saga.id}>
                  <SagaSection nom={nom} type={type} synopsis={synopsis} tomes={tomes} />
                  {i < sagaNodes.length - 1 ? <Ornament /> : null}
                </div>
              );
            })}
          </>
        ) : (
          <section style={{padding: 'var(--bsk-space-10) 0'}}>
            <div className="saga-grid">
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

      <Ornament />
      <Container width="content">
        <UniverseRail items={railItems} />
      </Container>
    </div>
  );
}
