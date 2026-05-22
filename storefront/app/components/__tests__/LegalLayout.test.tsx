import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {LegalLayout} from '../LegalLayout';

describe('LegalLayout', () => {
  it('rend label, titre et children dans .legal-body', () => {
    const {container} = renderWithRouter(
      <LegalLayout label="Informations légales" title="CGU">
        <h2>Objet</h2>
        <p>Texte.</p>
      </LegalLayout>,
    );
    expect(screen.getByText('Informations légales')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 1, name: 'CGU'})).toBeInTheDocument();
    expect(container.querySelector('.legal-body h2')?.textContent).toBe('Objet');
  });

  it('affiche la date si fournie + lien revenir en haut', () => {
    renderWithRouter(
      <LegalLayout title="X" updatedLabel="Dernière mise à jour : 23 mai 2026">
        <p>c</p>
      </LegalLayout>,
    );
    expect(screen.getByText(/Dernière mise à jour/)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Revenir en haut/i})).toBeInTheDocument();
  });
});
