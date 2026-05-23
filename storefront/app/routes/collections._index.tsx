import {useLoaderData} from 'react-router';
import type {Route} from './+types/collections._index';
import {Container} from '~/components/Container';
import {UniverseCard} from '~/components/UniverseCard';
import {buildUniverseIndex, type IndexCollection} from '~/lib/universeIndex';
import {UNIVERSE_INDEX_FRAGMENT} from '~/lib/fragments';
import '~/styles/univers.css';

export const meta: Route.MetaFunction = () => [{title: 'Nos univers — Bilskirnir'}];

const TECHNICAL_HANDLES = ['all', 'goodies', 'a-paraitre', 'frontpage'];

const COLLECTIONS_INDEX_QUERY = `#graphql
  query CollectionsIndex($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 50, sortKey: TITLE) {
      nodes { ...UniverseIndexCard }
    }
  }
  ${UNIVERSE_INDEX_FRAGMENT}
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(COLLECTIONS_INDEX_QUERY, {
    cache: context.storefront.CacheShort(),
  });
  const universes = buildUniverseIndex(
    data.collections.nodes as unknown as IndexCollection[],
    TECHNICAL_HANDLES,
  );
  return {universes};
}

export default function Collections() {
  const {universes} = useLoaderData<typeof loader>();
  return (
    <>
      <header
        style={{
          textAlign: 'center',
          padding: 'var(--bsk-space-10) var(--bsk-space-5) var(--bsk-space-6)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--bsk-text-xs)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--bsk-accent-gold)',
            marginBottom: 'var(--bsk-space-2)',
          }}
        >
          Les mondes de la maison
        </div>
        <h1
          style={{
            fontFamily: 'var(--bsk-font-display)',
            fontWeight: 800,
            fontSize: 'var(--bsk-text-2xl)',
            letterSpacing: '-0.02em',
            color: 'var(--bsk-fg-primary)',
          }}
        >
          Nos univers
        </h1>
        <p style={{color: 'var(--bsk-fg-secondary)', marginTop: 'var(--bsk-space-3)'}}>
          Entrez dans les mondes que nous éditons.
        </p>
      </header>

      <Container width="content">
        {universes.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--bsk-fg-secondary)',
              padding: 'var(--bsk-space-10) 0',
            }}
          >
            Nos univers arrivent bientôt.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--bsk-space-6)',
              padding: 'var(--bsk-space-2) 0 var(--bsk-space-12)',
            }}
          >
            {universes.map((u) => (
              <UniverseCard key={u.handle} {...u} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
