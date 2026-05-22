import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {SmartNav} from '../SmartNav';

describe('SmartNav', () => {
  it('rend ses enfants dans une <nav>', () => {
    render(
      <SmartNav>
        <span>contenu</span>
      </SmartNav>,
    );
    expect(screen.getByText('contenu')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
