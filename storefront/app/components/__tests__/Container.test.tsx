import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {Container} from '../Container';

describe('<Container />', () => {
  it('renders children', () => {
    renderWithRouter(
      <Container>
        <p>Inside</p>
      </Container>,
    );
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('applies the requested width variant', () => {
    const {container} = renderWithRouter(
      <Container width="reading">
        <p>Inside</p>
      </Container>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.maxWidth).toBe('var(--bsk-width-reading)');
  });

  it('defaults to content width', () => {
    const {container} = renderWithRouter(<Container>x</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.maxWidth).toBe('var(--bsk-width-content)');
  });
});
