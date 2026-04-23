import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {Ornament} from '../Ornament';

describe('<Ornament />', () => {
  it('renders three gold diamond glyphs', () => {
    renderWithRouter(<Ornament />);
    const el = screen.getByRole('presentation', {hidden: true});
    expect(el).toHaveTextContent('◈ ◈ ◈');
  });

  it('accepts a custom count', () => {
    renderWithRouter(<Ornament count={5} />);
    expect(screen.getByRole('presentation', {hidden: true})).toHaveTextContent(
      '◈ ◈ ◈ ◈ ◈',
    );
  });

  it('is decorative and hidden from assistive tech', () => {
    renderWithRouter(<Ornament />);
    const el = screen.getByRole('presentation', {hidden: true});
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });
});
