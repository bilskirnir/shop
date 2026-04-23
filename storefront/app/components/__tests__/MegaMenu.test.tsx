import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {MegaMenu, type UniverseItem} from '../MegaMenu';

const universes: UniverseItem[] = [
  {
    id: '1',
    handle: 'au-nom-des-dieux',
    title: 'Au Nom des Dieux',
    isStandalone: false,
  },
  {
    id: '2',
    handle: 'romans-independants',
    title: 'Romans indépendants',
    isStandalone: true,
  },
];

describe('<MegaMenu />', () => {
  it('renders the "Univers en cours" section with non-standalone universes', () => {
    renderWithRouter(<MegaMenu universes={universes} />);
    const inProgress = screen.getByRole('region', {name: /univers en cours/i});
    expect(inProgress).toHaveTextContent('Au Nom des Dieux');
    expect(inProgress).not.toHaveTextContent('Romans indépendants');
  });

  it('renders the "Romans indépendants" section with standalone bucket', () => {
    renderWithRouter(<MegaMenu universes={universes} />);
    const standalone = screen.getByRole('region', {name: /romans indépendants/i});
    expect(standalone).toHaveTextContent('Romans indépendants');
  });

  it('links each universe to its collection page', () => {
    renderWithRouter(<MegaMenu universes={universes} />);
    const link = screen.getByRole('link', {name: 'Au Nom des Dieux'});
    expect(link).toHaveAttribute('href', '/collections/au-nom-des-dieux');
  });

  it('shows an empty-state message when there are no universes', () => {
    renderWithRouter(<MegaMenu universes={[]} />);
    expect(screen.getByText(/bientôt/i)).toBeInTheDocument();
  });
});
