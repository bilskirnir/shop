import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import {Footer} from '../Footer';

function renderFooter(props = {}) {
  const Stub = createRoutesStub([{path: '/', Component: () => <Footer {...props} />}]);
  return render(<Stub initialEntries={['/']} />);
}

describe('Footer F3', () => {
  it('rend le wordmark, le CTA newsletter et les reseaux', () => {
    renderFooter();
    expect(screen.getByText('BILSKIRNIR')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /inscrire/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /TikTok/i})).toBeInTheDocument();
  });

  it('ajoute la classe panneau quand asPanel', () => {
    const {container} = renderFooter({asPanel: true});
    expect(container.querySelector('footer')?.className).toContain('bsk-footer--panel');
  });
});
