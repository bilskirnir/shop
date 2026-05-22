import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {TechSpecs} from '../TechSpecs';

describe('TechSpecs', () => {
  it('rend les lignes label/valeur', () => {
    render(<TechSpecs rows={[{label: 'Pages', value: '412'}, {label: 'Langue', value: 'Français'}]} />);
    expect(screen.getByText('Pages')).toBeInTheDocument();
    expect(screen.getByText('412')).toBeInTheDocument();
    expect(screen.getByText('Langue')).toBeInTheDocument();
  });
  it('ne rend rien si aucune ligne', () => {
    const {container} = render(<TechSpecs rows={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
