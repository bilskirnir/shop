import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import LaMaison from '../pages.la-maison';

describe('Page "La maison"', () => {
  it('renders the hero headline', () => {
    renderWithRouter(<LaMaison />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /nous éditons des récits héroïques sans compromis/i,
      }),
    ).toBeInTheDocument();
  });

  it('shows the manifesto paragraphs', () => {
    renderWithRouter(<LaMaison />);
    expect(screen.getByText(/le roman héroïque français contemporain/i)).toBeInTheDocument();
    expect(screen.getByText(/bilskirnir édite ce qui manquait/i)).toBeInTheDocument();
  });

  it('renders all four pillars', () => {
    renderWithRouter(<LaMaison />);
    expect(screen.getByRole('heading', {name: /héroïsme sans compromis/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /mythes et racines/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /voix française/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /indépendance éditoriale/i})).toBeInTheDocument();
  });

  it('renders the author block with TikTok link', () => {
    renderWithRouter(<LaMaison />);
    expect(screen.getByText(/gautier durieux de madron/i)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /tiktok/i})).toHaveAttribute(
      'href',
      'https://tiktok.com/@bilskirnir',
    );
  });
});
