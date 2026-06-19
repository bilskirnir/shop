import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {SagaScroller} from '~/components/SagaScroller';
import {
  buildHomeScreens,
  type ScreenCollection,
  type ScreenWork,
} from '~/lib/homeScreens';
import {HOME_SAGA_FRAGMENT, TILE_PRODUCT_FRAGMENT} from '~/lib/fragments';

export const meta: Route.MetaFunction = () => [
  {title: 'Bilskirnir — Des récits héroïques, sans compromis'},
];

/** Route immersive : root.tsx masque le Footer global et pose ImmersiveNav overlay. */
export const handle = {immersive: true};

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 20, sortKey: TITLE) {
      nodes { ...HomeSaga }
    }
    products(first: 50) {
      nodes { ...TileProduct }
    }
  }
  ${HOME_SAGA_FRAGMENT}
  ${TILE_PRODUCT_FRAGMENT}
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  return await storefront.query(HOME_QUERY, {cache: storefront.CacheShort()});
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const collections = data.collections.nodes as unknown as ScreenCollection[];
  const works = data.products.nodes as unknown as ScreenWork[];
  const screens = buildHomeScreens(collections, works);
  return <SagaScroller screens={screens} />;
}
