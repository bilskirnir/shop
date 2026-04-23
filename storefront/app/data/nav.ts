export type NavItem = {
  label: string;
  href: string;
  hasMegaMenu?: boolean;
};

export const PRIMARY_NAV: NavItem[] = [
  {label: 'Œuvres', href: '/collections/all'},
  {label: 'Univers', href: '/collections', hasMegaMenu: true},
  {label: 'Goodies', href: '/collections/goodies'},
  {label: 'La maison', href: '/pages/la-maison'},
];

export const FOOTER_NAV = {
  boutique: [
    {label: 'Œuvres', href: '/collections/all'},
    {label: 'Univers', href: '/collections'},
    {label: 'Goodies', href: '/collections/goodies'},
    {label: 'À paraître', href: '/collections/a-paraitre'},
  ],
  maison: [
    {label: 'Notre mission', href: '/pages/la-maison'},
    {label: 'L’auteur', href: '/pages/la-maison#auteur'},
    {label: 'Contact', href: '/pages/contact'},
    {label: 'Presse', href: '/pages/presse'},
  ],
  info: [
    {label: 'Livraison', href: '/policies/shipping-policy'},
    {label: 'Retours', href: '/policies/refund-policy'},
    {label: 'Mentions légales', href: '/policies/legal-notice'},
    {label: 'CGV', href: '/policies/terms-of-service'},
  ],
};
