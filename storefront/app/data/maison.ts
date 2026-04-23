// Editorial content for /pages/la-maison
// ⚠️ À relire et valider avec Gautier avant publication.

export const MAISON_HERO = {
  headline: 'Nous éditons des récits héroïques sans compromis.',
  subhead:
    'L’héroïsme, la bravoure, le sacrifice. Une voix française, sans concession, pour réenchanter le roman populaire.',
};

export const MAISON_MANIFESTO = [
  'Le roman héroïque français contemporain a été abandonné par l’édition dominante. Entre les romans introspectifs primés et les blockbusters traduits, il n’y a plus grand-chose pour les lecteurs qui cherchent du souffle, de la chair, des enjeux plus grands que soi.',
  'Bilskirnir édite ce qui manquait. Des univers longs, des sagas denses, des personnages qui ne s’excusent pas d’exister. Une voix française qui assume ses racines nordiques autant que méditerranéennes.',
];

export type Pillar = {icon: string; title: string; body: string};

export const MAISON_PILLARS: Pillar[] = [
  {
    icon: '⚔',
    title: 'Héroïsme sans compromis',
    body: 'Des personnages qui agissent, choisissent, échouent parfois. Pas d’antihéros désabusés pour le confort moderne.',
  },
  {
    icon: '🏛',
    title: 'Mythes et racines',
    body: 'Nos récits puisent dans les mythologies vivantes — nordique, gréco-romaine, celte. Ce qui a nourri mille ans de littérature occidentale.',
  },
  {
    icon: '🇫🇷',
    title: 'Une voix française',
    body: 'Écrits en France, imprimés en France, pensés depuis une sensibilité qui n’a pas à emprunter ses codes ailleurs.',
  },
  {
    icon: '✒',
    title: 'Indépendance éditoriale',
    body: 'Maison indépendante, modèle direct-au-lecteur. Pas de distributeur qui dicte, pas de comité qui lisse.',
  },
];

export const MAISON_AUTHOR = {
  name: 'Gautier Durieux de Madron',
  photoAlt: 'Portrait de Gautier Durieux de Madron',
  photoUrl: '/images/gautier.jpg', // placeholder — real asset added later
  bio: 'Auteur français. Fondateur de Bilskirnir. Construit depuis 2021 l’univers d’Au Nom des Dieux et ses sagas parallèles. ~140 000 lecteurs sur TikTok.',
  links: [
    {label: 'TikTok', href: 'https://tiktok.com/@bilskirnir'},
    {label: 'Instagram', href: 'https://instagram.com/bilskirnir'},
  ],
};
