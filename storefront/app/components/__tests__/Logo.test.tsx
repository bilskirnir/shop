import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Logo} from '../Logo';

describe('Logo', () => {
  it("rend l'emblème avec un alt accessible", () => {
    render(<Logo />);
    expect(screen.getByRole('img', {name: /bilskirnir/i})).toBeInTheDocument();
  });
});
