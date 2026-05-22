import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {Ornament} from '../Ornament';

describe('<Ornament />', () => {
  it('rend un ✦ doré (séparateur spec)', () => {
    renderWithRouter(<Ornament />);
    const el = screen.getByRole('presentation', {hidden: true});
    expect(el).toHaveTextContent('✦');
  });

  it('accepte plusieurs glyphes via count', () => {
    renderWithRouter(<Ornament count={3} />);
    expect(screen.getByRole('presentation', {hidden: true})).toHaveTextContent(
      '✦ ✦ ✦',
    );
  });

  it("est décoratif et masqué aux lecteurs d'écran", () => {
    renderWithRouter(<Ornament />);
    expect(screen.getByRole('presentation', {hidden: true})).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
