import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import type {HomeQuery} from 'storefrontapi.generated';
import {Container} from '~/components/Container';
import {WorkTile, type WorkTileProps} from '~/components/WorkTile';
import {Ornament} from '~/components/Ornament';
import {ReleaseStatusBadge} from '~/components/ReleaseStatusBadge';
import {
  TILE_PRODUCT_FRAGMENT,
  UNIVERSE_CARD_FRAGMENT,
} from '~/lib/fragments';
import {
  parseBool,
  parseStatutParution,
} from '~/lib/tomeMetafields';

export const meta: Route.MetaFunction = () => [
  {title: 'Bilskirnir — Des récits héroïques, sans compromis'},
];

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 20, sortKey: TITLE) {
      nodes {
        ...UniverseCard
        products(first: 6, sortKey: BEST_SELLING) {
          nodes { ...TileProduct }
        }
      }
    }
    products(first: 50) {
      nodes { ...TileProduct }
    }
  }
  ${UNIVERSE_CARD_FRAGMENT}
  ${TILE_PRODUCT_FRAGMENT}
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const data = await storefront.query(HOME_QUERY, {
    cache: storefront.CacheShort(),
  });
  return data;
}

type CollectionNode = HomeQuery['collections']['nodes'][number];
type ProductNode = HomeQuery['products']['nodes'][number];

function buildTilesFromUniverses(
  collections: CollectionNode[],
): WorkTileProps[] {
  return collections
    .filter((c) => !parseBool(c.estUneOeuvreIndependante?.value))
    .map<WorkTileProps | null>((c) => {
      const tomes = c.products.nodes;
      if (tomes.length === 0) return null;
      const covers = tomes
        .map((t) => t.featuredImage)
        .filter((i): i is NonNullable<typeof i> => !!i)
        .map((i) => ({
          url: i.url,
          altText: i.altText ?? c.title,
          width: i.width ?? 0,
          height: i.height ?? 0,
        }));
      if (covers.length === 0) return null;
      const href = `/collections/${c.handle}`;
      const meta = `${tomes.length} tome${tomes.length > 1 ? 's' : ''}`;
      if (covers.length === 1) {
        return {kind: 'single', href, title: c.title, cover: covers[0], meta};
      }
      if (covers.length <= 3) {
        return {kind: 'stack', href, title: c.title, covers, meta};
      }
      return {
        kind: 'stack-many',
        href,
        title: c.title,
        covers: covers.slice(0, 3),
        extraCount: covers.length - 3,
        meta,
      };
    })
    .filter((x): x is WorkTileProps => x !== null);
}

function buildStandaloneTiles(products: ProductNode[]): WorkTileProps[] {
  return products
    .filter((p) => parseBool(p.estUneOeuvreIndependante?.value))
    .filter((p): p is ProductNode & {featuredImage: NonNullable<ProductNode['featuredImage']>} =>
      Boolean(p.featuredImage),
    )
    .map<WorkTileProps>((p) => ({
      kind: 'standalone',
      href: `/products/${p.handle}`,
      title: p.title,
      cover: {
        url: p.featuredImage.url,
        altText: p.featuredImage.altText ?? p.title,
        width: p.featuredImage.width ?? 0,
        height: p.featuredImage.height ?? 0,
      },
      pillLabel: 'ROMAN',
    }));
}

function selectUpcoming(products: ProductNode[]): ProductNode[] {
  return products
    .filter((p) => {
      const s = parseStatutParution(p.statutParution?.value);
      return s === 'précommande' || s === 'annoncé';
    })
    .slice(0, 6);
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const collections = data.collections.nodes;
  const allProducts = data.products.nodes;

  const universeTiles = buildTilesFromUniverses(collections);
  const standaloneTiles = buildStandaloneTiles(allProducts);
  const allTiles = [...universeTiles, ...standaloneTiles];
  const upcoming = selectUpcoming(allProducts);

  return (
    <>
      <Container width="full">
        <div
          style={{
            padding: 'var(--bsk-space-10) 0 var(--bsk-space-6)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--bsk-font-serif)',
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-md)',
              color: 'var(--bsk-fg-secondary)',
            }}
          >
            Des récits héroïques, sans compromis.
          </p>
        </div>
      </Container>

      <Container width="full">
        <section
          aria-label="Œuvres au catalogue"
          style={{
            padding: 'var(--bsk-space-8) 0',
            background: 'var(--bsk-bg-gradient-warm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 'var(--bsk-space-8)',
              overflowX: 'auto',
              padding: 'var(--bsk-space-6) var(--bsk-space-8)',
              scrollSnapType: 'x mandatory',
            }}
          >
            {allTiles.map((tile) => (
              <div
                key={tile.href}
                style={{scrollSnapAlign: 'start', flex: '0 0 auto'}}
              >
                <WorkTile {...tile} />
              </div>
            ))}
          </div>
        </section>
      </Container>

      {upcoming.length > 0 && (
        <Container width="content">
          <section style={{padding: 'var(--bsk-space-12) 0'}}>
            <h2
              style={{
                fontFamily: 'var(--bsk-font-serif)',
                fontSize: 'var(--bsk-text-xl)',
                textAlign: 'center',
                marginBottom: 'var(--bsk-space-6)',
                color: 'var(--bsk-fg-primary)',
              }}
            >
              À paraître
            </h2>
            <Ornament />
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 'var(--bsk-space-6) 0 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--bsk-space-5)',
              }}
            >
              {upcoming.map((p) => {
                const status = parseStatutParution(p.statutParution?.value);
                return (
                  <li
                    key={p.id}
                    style={{
                      padding: 'var(--bsk-space-4)',
                      border: '1px solid var(--bsk-border-subtle)',
                      borderRadius: '4px',
                    }}
                  >
                    <Link
                      to={`/products/${p.handle}`}
                      style={{
                        textDecoration: 'none',
                        color: 'var(--bsk-fg-primary)',
                        fontFamily: 'var(--bsk-font-serif)',
                      }}
                    >
                      {p.title}
                    </Link>
                    <div style={{marginTop: 'var(--bsk-space-2)'}}>
                      <ReleaseStatusBadge
                        status={status}
                        releaseDate={p.dateParution?.value ?? null}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </Container>
      )}

      <Container width="content">
        <section style={{padding: 'var(--bsk-space-12) 0'}}>
          <h2
            style={{
              fontFamily: 'var(--bsk-font-serif)',
              fontSize: 'var(--bsk-text-xl)',
              textAlign: 'center',
              marginBottom: 'var(--bsk-space-6)',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            Les valeurs de la maison
          </h2>
          <Ornament />
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              marginTop: 'var(--bsk-space-6)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--bsk-space-6)',
              textAlign: 'center',
            }}
          >
            {[
              {icon: '⚔', title: 'Héroïsme sans compromis'},
              {icon: '🏛', title: 'Mythes et racines'},
              {icon: '🇫🇷', title: 'Une voix française'},
              {icon: '✒', title: 'Indépendance éditoriale'},
            ].map((p) => (
              <li
                key={p.title}
                style={{padding: 'var(--bsk-space-5)'}}
              >
                <div
                  style={{
                    fontSize: 'var(--bsk-text-2xl)',
                    marginBottom: 'var(--bsk-space-3)',
                  }}
                >
                  {p.icon}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--bsk-font-serif)',
                    fontSize: 'var(--bsk-text-lg)',
                    color: 'var(--bsk-fg-primary)',
                  }}
                >
                  {p.title}
                </h3>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
