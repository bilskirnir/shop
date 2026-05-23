import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {Container} from '~/components/Container';
import {Ornament} from '~/components/Ornament';
import {CatalogueSection} from '~/components/CatalogueSection';
import {
  buildCatalogue,
  type CatalogueProduct,
  type CatalogueUniverse,
} from '~/lib/catalogue';
import {todaySeed} from '~/lib/seededShuffle';
import {TILE_PRODUCT_FRAGMENT, UNIVERSE_RAIL_FRAGMENT} from '~/lib/fragments';
import '~/styles/catalogue.css';

export const meta: Route.MetaFunction = () => [{title: 'Œuvres — Bilskirnir'}];

const CATALOGUE_QUERY = `#graphql
  query Catalogue($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 100) {
      nodes { ...TileProduct }
    }
    collections(first: 30, sortKey: TITLE) {
      nodes { ...UniverseRailCard }
    }
  }
  ${TILE_PRODUCT_FRAGMENT}
  ${UNIVERSE_RAIL_FRAGMENT}
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(CATALOGUE_QUERY, {
    cache: context.storefront.CacheShort(),
  });
  const sections = buildCatalogue(
    data.products.nodes as unknown as CatalogueProduct[],
    data.collections.nodes as unknown as CatalogueUniverse[],
    todaySeed(),
  );
  return {sections};
}

export default function Catalogue() {
  const {sections} = useLoaderData<typeof loader>();

  return (
    <Container width="content">
      <header className="cat-head">
        <div className="cat-k">Le catalogue</div>
        <h1 className="cat-h1">Œuvres</h1>
        <p className="cat-sub">Toutes les œuvres de la maison, par univers</p>
      </header>

      {sections.length === 0 ? (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--bsk-fg-secondary)',
            padding: 'var(--bsk-space-10) 0',
          }}
        >
          Le catalogue arrive bientôt.
        </p>
      ) : (
        sections.map((s, i) => (
          <div key={s.key}>
            <CatalogueSection name={s.name} accent={s.accent} href={s.href} tomes={s.tomes} />
            {i < sections.length - 1 ? <Ornament /> : null}
          </div>
        ))
      )}
    </Container>
  );
}
