import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {Footer} from '../Footer';

describe('<Footer />', () => {
  it('shows the newsletter headline', () => {
    renderWithRouter(<Footer />);
    expect(
      screen.getByRole('heading', {name: /restez dans l['’]univers/i}),
    ).toBeInTheDocument();
  });

  it('renders a newsletter email input', () => {
    renderWithRouter(<Footer />);
    const input = screen.getByLabelText(/adresse email/i);
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
  });

  it('links to all three policy columns', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByRole('link', {name: /livraison/i})).toHaveAttribute(
      'href',
      '/policies/shipping-policy',
    );
    expect(screen.getByRole('link', {name: /cgv/i})).toHaveAttribute(
      'href',
      '/policies/terms-of-service',
    );
  });

  it('shows the copyright line', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText(/bilskirnir\. éditeur indépendant/i)).toBeInTheDocument();
  });
});
