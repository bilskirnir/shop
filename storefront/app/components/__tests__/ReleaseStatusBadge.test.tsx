import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ReleaseStatusBadge} from '../ReleaseStatusBadge';

describe('ReleaseStatusBadge', () => {
  it('rend null pour le statut publié', () => {
    const {container} = render(<ReleaseStatusBadge status="publié" />);
    expect(container.firstChild).toBeNull();
  });

  it('rend "PRÉCO" + date pour précommande', () => {
    render(<ReleaseStatusBadge status="précommande" releaseDate="2026-09-15" />);
    expect(screen.getByText(/PRÉCO/)).toBeInTheDocument();
    expect(screen.getByText(/15 sept\. 2026/)).toBeInTheDocument();
  });

  it('rend "PRÉCO" sans date si releaseDate manquante', () => {
    render(<ReleaseStatusBadge status="précommande" />);
    expect(screen.getByText(/PRÉCO/)).toBeInTheDocument();
  });

  it('rend "À PARAÎTRE" pour annoncé', () => {
    render(<ReleaseStatusBadge status="annoncé" />);
    expect(screen.getByText(/À PARAÎTRE/)).toBeInTheDocument();
  });

  it('applique data-status pour styling CSS', () => {
    render(<ReleaseStatusBadge status="précommande" />);
    expect(screen.getByText(/PRÉCO/).closest('span')).toHaveAttribute('data-status', 'précommande');
  });

  it('variante onImage est positionnée en absolu centré au-dessus de l\'image', () => {
    render(<ReleaseStatusBadge status="précommande" onImage />);
    const el = screen.getByText(/PRÉCO/).closest('span') as HTMLElement;
    expect(el.style.position).toBe('absolute');
    expect(el.style.zIndex).toBe('3');
  });
});
