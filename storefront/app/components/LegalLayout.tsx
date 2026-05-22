import type {ReactNode} from 'react';
import {Container} from './Container';

export function LegalLayout({
  label,
  title,
  updatedLabel,
  children,
}: {
  label?: string | null;
  title: string;
  updatedLabel?: string | null;
  children: ReactNode;
}) {
  return (
    <Container width="reading">
      <div id="top" className="legal-head">
        {label ? <div className="legal-k">{label}</div> : null}
        <h1>{title}</h1>
        {updatedLabel ? <div className="legal-upd">{updatedLabel}</div> : null}
      </div>
      <div className="legal-body">{children}</div>
      <a className="legal-backtop" href="#top">↑ Revenir en haut</a>
      <div style={{height: 'var(--bsk-space-8)'}} />
    </Container>
  );
}
