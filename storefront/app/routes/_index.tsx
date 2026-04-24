import {Container} from '~/components/Container';

export function meta() {
  return [{title: 'Bilskirnir — Des récits héroïques, sans compromis'}];
}

export default function Index() {
  return (
    <Container width="reading">
      <div style={{padding: 'var(--bsk-space-16) 0', textAlign: 'center'}}>
        <h1
          style={{
            fontSize: 'var(--bsk-text-3xl)',
            color: 'var(--bsk-fg-primary)',
            marginBottom: 'var(--bsk-space-5)',
          }}
        >
          Des récits héroïques, sans compromis.
        </h1>
        <p style={{color: 'var(--bsk-fg-secondary)'}}>
          Catalogue en préparation.
        </p>
      </div>
    </Container>
  );
}
