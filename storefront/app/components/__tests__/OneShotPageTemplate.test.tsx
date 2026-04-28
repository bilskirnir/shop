import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {OneShotPageTemplate} from '../OneShotPageTemplate';

const baseProps = {
  title: 'Berserker',
  teaserShort: "Nice, été. La chaleur est la même qu'avant.",
  description: 'Atmosphere du livre.\n\nUn huis-clos.',
  cover: {
    url: 'https://x/c.jpg',
    altText: 'Berserker',
    width: 400,
    height: 600,
  },
  pillLabel: 'ROMAN' as const,
  purchaseSlot: <div data-testid="purchase">CTA</div>,
};

describe('OneShotPageTemplate', () => {
  it('rend la pastille typée', () => {
    renderWithRouter(<OneShotPageTemplate {...baseProps} />);
    expect(screen.getByText(/ROMAN INDÉPENDANT/)).toBeInTheDocument();
  });

  it('rend titre, teaser, cover, purchase', () => {
    renderWithRouter(<OneShotPageTemplate {...baseProps} />);
    expect(screen.getByRole('heading', {name: 'Berserker'})).toBeInTheDocument();
    expect(screen.getByText(/chaleur/)).toBeInTheDocument();
    expect(screen.getByAltText('Berserker')).toBeInTheDocument();
    expect(screen.getByTestId('purchase')).toBeInTheDocument();
  });

  it('rend le synopsis dans la section atmosphère', () => {
    renderWithRouter(<OneShotPageTemplate {...baseProps} />);
    expect(screen.getByText(/Atmosphere du livre/)).toBeInTheDocument();
    expect(screen.getByText(/L'atmosphère du livre/)).toBeInTheDocument();
  });
});
