import {useHideOnScroll} from '~/hooks/useHideOnScroll';

/**
 * Barre de navigation « intelligente » : transparente en haut de page,
 * masquée au scroll vers le bas, réapparaît avec un fond solide (flou + bordure)
 * au scroll vers le haut. Standard sur toutes les pages.
 */
export function SmartNav({children}: {children: React.ReactNode}) {
  const {solid, hidden} = useHideOnScroll(
    typeof window !== 'undefined' ? window : null,
  );
  return (
    <nav
      data-solid={solid}
      data-hidden={hidden}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--bsk-space-4) var(--bsk-space-5)',
        transition:
          'transform .35s var(--bsk-ease), background .3s, border-color .3s',
        transform: hidden ? 'translateY(-104%)' : 'none',
        background: solid ? 'rgba(19,20,25,.94)' : 'transparent',
        backdropFilter: solid ? 'blur(12px)' : undefined,
        borderBottom: `1px solid ${
          solid ? 'var(--bsk-border-subtle)' : 'transparent'
        }`,
      }}
    >
      {children}
    </nav>
  );
}
