import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {SagaScroller} from '~/components/SagaScroller';
import {
  buildHomeScreens,
  buildCuratedScreens,
  type AccueilSlide,
  type SagaNode,
  type ScreenWork,
} from '~/lib/homeScreens';
import {
  HOME_ACCUEIL_FRAGMENT,
  HOME_SAGA_FRAGMENT,
  TILE_PRODUCT_FRAGMENT,
} from '~/lib/fragments';

export const meta: Route.MetaFunction = () => [
  {title: 'Bilskirnir — Des récits héroïques, sans compromis'},
];

/** Route immersive : root.tsx masque le Footer global et pose ImmersiveNav overlay. */
export const handle = {immersive: true};

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    accueil: metaobjects(type: "accueil", first: 30) {
      nodes { ...HomeAccueil }
    }
    sagas: metaobjects(type: "saga", first: 20) {
      nodes { ...HomeSaga }
    }
    products(first: 50) {
      nodes { ...TileProduct }
    }
  }
  ${HOME_ACCUEIL_FRAGMENT}
  ${HOME_SAGA_FRAGMENT}
  ${TILE_PRODUCT_FRAGMENT}
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  return await storefront.query(HOME_QUERY, {cache: storefront.CacheShort()});
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  // Curaté : chaque entrée du metaobject « accueil » = une slide (saga ou produit),
  // dans l'ordre. Si ça donne au moins un écran → curaté, sinon automatique.
  const slides = (data.accueil?.nodes ?? []) as unknown as AccueilSlide[];
  const curated = buildCuratedScreens(slides);
  const screens =
    curated.length > 0
      ? curated
      : buildHomeScreens(
          data.sagas.nodes as unknown as SagaNode[],
          data.products.nodes as unknown as ScreenWork[],
        );
  return <SagaScroller screens={screens} />;
}
