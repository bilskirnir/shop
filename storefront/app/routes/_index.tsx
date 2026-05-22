import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import type {HomeQuery} from 'storefrontapi.generated';
import {UniverseSlider} from '~/components/UniverseSlider';
import {
  buildHomeSlides,
  type SlideUniverse,
  type SlideWork,
} from '~/lib/homeSlides';
import {HOME_UNIVERSE_FRAGMENT, TILE_PRODUCT_FRAGMENT} from '~/lib/fragments';
import '~/styles/home.css';

export const meta: Route.MetaFunction = () => [
  {title: 'Bilskirnir — Des récits héroïques, sans compromis'},
];

/** Route immersive : root.tsx masque le Footer et pose ImmersiveNav. */
export const handle = {immersive: true};

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 20, sortKey: TITLE) {
      nodes { ...HomeUniverse }
    }
    products(first: 50) {
      nodes { ...TileProduct }
    }
  }
  ${HOME_UNIVERSE_FRAGMENT}
  ${TILE_PRODUCT_FRAGMENT}
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const data = await storefront.query(HOME_QUERY, {
    cache: storefront.CacheShort(),
  });
  return data;
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const universes = data.collections.nodes as unknown as SlideUniverse[];
  const works = data.products.nodes as unknown as SlideWork[];
  const slides = buildHomeSlides(universes, works);

  return <UniverseSlider slides={slides} />;
}
