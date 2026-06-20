// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/cart
export const CART_QUERY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
  fragment CartLine on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height

        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
    parentRelationship {
      parent {
        id
      }
    }
  }
  fragment CartLineComponent on ComponentizableCartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height
        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
    lineComponents {
      ...CartLine
    }
  }
  fragment CartApiQuery on Cart {
    updatedAt
    id
    appliedGiftCards {
      id
      lastCharacters
      amountUsed {
        ...Money
      }
    }
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: $numCartLines) {
      nodes {
        ...CartLine
      }
      nodes {
        ...CartLineComponent
      }
    }
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
      totalDutyAmount {
        ...Money
      }
      totalTaxAmount {
        ...Money
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
` as const;

const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
` as const;

export const HEADER_QUERY = `#graphql
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
    seuilLivraisonOfferte: metafield(namespace: "cart", key: "seuil_livraison_offerte") { value }
    paliersCadeaux: metafield(namespace: "cart", key: "paliers_cadeaux") { value }
  }
  query Header(
    $country: CountryCode
    $headerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop {
      ...Shop
    }
    menu(handle: $headerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
` as const;

export const FOOTER_QUERY = `#graphql
  query Footer(
    $country: CountryCode
    $footerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
` as const;

export const UNIVERSE_CARD_FRAGMENT = `#graphql
  fragment UniverseCard on Collection {
    id
    handle
    title
    estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") {
      value
    }
  }
` as const;

export const MEGA_MENU_QUERY = `#graphql
  query MegaMenu($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 20, sortKey: TITLE) {
      nodes {
        ...UniverseCard
      }
    }
  }
  ${UNIVERSE_CARD_FRAGMENT}
` as const;

export const TOME_METAFIELDS_FRAGMENT = `#graphql
  fragment TomeMetafields on Product {
    univers: metafield(namespace: "custom", key: "univers") {
      reference {
        ... on Collection {
          id handle title
          couleurTheme: metafield(namespace: "custom", key: "couleur") { value }
        }
      }
    }
    saga: metafield(namespace: "custom", key: "saga") {
      reference {
        ... on Metaobject {
          id handle
          fields { key value }
        }
      }
    }
    numeroTome: metafield(namespace: "custom", key: "numero_tome") { value }
    statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
    dateParution: metafield(namespace: "custom", key: "date_parution") { value }
    teaserCourt: metafield(namespace: "custom", key: "teaser_court") { value }
    estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
  }
` as const;

export const TILE_PRODUCT_FRAGMENT = `#graphql
  fragment TileProduct on Product {
    id
    handle
    title
    featuredImage { url altText width height }
    priceRange { minVariantPrice { amount currencyCode } }
    auteur: metafield(namespace: "custom", key: "auteur") {
      reference {
        ... on Metaobject {
          nom: field(key: "nom") { value }
        }
      }
    }
    ...TomeMetafields
  }
  ${TOME_METAFIELDS_FRAGMENT}
` as const;

export const UNIVERSE_RAIL_FRAGMENT = `#graphql
  fragment UniverseRailCard on Collection {
    id
    handle
    title
    couleurTheme: metafield(namespace: "custom", key: "couleur") { value }
    estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
  }
` as const;

export const UNIVERSE_INDEX_FRAGMENT = `#graphql
  fragment UniverseIndexCard on Collection {
    id
    handle
    title
    couleurTheme: metafield(namespace: "custom", key: "couleur") { value }
    genre: metafield(namespace: "custom", key: "genre") { value }
    lore: metafield(namespace: "custom", key: "lore") { value }
    estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
    sagas: metafield(namespace: "custom", key: "sagas") {
      references(first: 10) { nodes { ... on Metaobject { id } } }
    }
    products(first: 50) { nodes { id } }
  }
` as const;

export const UNIVERSE_DETAIL_FRAGMENT = `#graphql
  fragment UniverseDetail on Collection {
    id
    handle
    title
    illustrationHero: metafield(namespace: "custom", key: "illustration_hero") {
      reference {
        ... on MediaImage { image { url altText width height } }
      }
    }
    lore: metafield(namespace: "custom", key: "lore") { value }
    genre: metafield(namespace: "custom", key: "genre") { value }
    couleurTheme: metafield(namespace: "custom", key: "couleur") { value }
    sagas: metafield(namespace: "custom", key: "sagas") {
      references(first: 10) {
        nodes {
          ... on Metaobject {
            id handle
            fields { key value reference { ... on MediaImage { image { url altText width height } } } }
          }
        }
      }
    }
    estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
    products(first: 50) {
      nodes { ...TileProduct }
    }
  }
  ${TILE_PRODUCT_FRAGMENT}
` as const;

/**
 * Metaobject `accueil` = UNE slide par entrée (l'ordre des entrées = l'ordre des
 * slides). Champs : `saga` (réf. saga) OU `produit` (réf. produit), plus
 * `image_de_fond` (réf. MediaImage) optionnelle qui prime sur l'image de la
 * saga/du produit, et `note_moyenne` (décimal /5) + `nombre_lecteurs` (entier)
 * pour la pastille d'avis saisie à la main. Pensé pour accueillir à terme
 * d'autres champs propres à la slide (ex. macaron « nouveauté »). Si aucune
 * slide ne donne d'écran → automatique. Réutilise HomeSaga + TileProduct.
 */
export const HOME_ACCUEIL_FRAGMENT = `#graphql
  fragment HomeAccueil on Metaobject {
    handle
    fond: field(key: "image_de_fond") {
      reference { ... on MediaImage { image { url } } }
    }
    note: field(key: "note_moyenne") { value }
    lecteurs: field(key: "nombre_lecteurs") { value }
    saga: field(key: "saga") {
      reference { ... on Metaobject { ...HomeSaga } }
    }
    produit: field(key: "produit") {
      reference { ... on Product { ...TileProduct } }
    }
  }
` as const;

/**
 * Fragment du metaobject `saga` (interrogé directement via `metaobjects(type:"saga")`).
 * Clés réelles : `nom`, `synopsis` (rich text), `ordre_des_tomes` (liste produits),
 * `univers_parent` (collection), `illustration_hero_de_la_saga` (image — souvent non
 * exposée pour l'instant → repli sur l'illustration_hero de l'univers parent).
 */
export const HOME_SAGA_FRAGMENT = `#graphql
  fragment HomeSaga on Metaobject {
    handle
    fields {
      key
      value
      references(first: 8) {
        nodes {
          ... on Product {
            handle
            featuredImage { url altText }
            auteur: metafield(namespace: "custom", key: "auteur") {
              reference {
                ... on Metaobject {
                  nom: field(key: "nom") { value }
                }
              }
            }
          }
        }
      }
      reference {
        ... on Collection {
          handle
          title
          couleurTheme: metafield(namespace: "custom", key: "couleur") { value }
          illustrationHero: metafield(namespace: "custom", key: "illustration_hero") {
            reference { ... on MediaImage { image { url } } }
          }
        }
        ... on MediaImage {
          image { url }
        }
      }
    }
  }
` as const;
