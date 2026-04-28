import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {WorkTile} from '../WorkTile';

const cover = (alt: string) => ({
  url: 'https://example.com/c.jpg',
  altText: alt,
  width: 400,
  height: 600,
});

describe('WorkTile', () => {
  it('variant single rend une couverture seule', () => {
    renderWithRouter(
      <WorkTile
        kind="single"
        href="/products/berserker"
        title="Berserker"
        cover={cover('Berserker')}
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/berserker');
    expect(screen.getByAltText('Berserker')).toBeInTheDocument();
    expect(screen.getByText('Berserker')).toBeInTheDocument();
  });

  it('variant stack rend toutes les couvertures', () => {
    renderWithRouter(
      <WorkTile
        kind="stack"
        href="/collections/au-nom-des-dieux"
        title="Au Nom des Dieux"
        covers={[cover('T1'), cover('T2'), cover('T3')]}
      />,
    );
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('variant stack-many rend les 3 premières + badge +N', () => {
    renderWithRouter(
      <WorkTile
        kind="stack-many"
        href="/collections/saga-x"
        title="Grand Univers"
        covers={[cover('T1'), cover('T2'), cover('T3')]}
        extraCount={4}
      />,
    );
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByText('+4')).toBeInTheDocument();
  });

  it('variant standalone rend cover + pastille typée', () => {
    renderWithRouter(
      <WorkTile
        kind="standalone"
        href="/products/berserker"
        title="Berserker"
        cover={cover('Berserker')}
        pillLabel="ROMAN"
      />,
    );
    expect(screen.getByText('ROMAN')).toBeInTheDocument();
  });

  it('affiche meta optionnelle quand fournie', () => {
    renderWithRouter(
      <WorkTile
        kind="single"
        href="/products/x"
        title="X"
        cover={cover('X')}
        meta="2 tomes · en cours"
      />,
    );
    expect(screen.getByText('2 tomes · en cours')).toBeInTheDocument();
  });
});
