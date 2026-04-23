import type {ReactNode} from 'react';

const WIDTH_MAP = {
  reading: 'var(--bsk-width-reading)',
  content: 'var(--bsk-width-content)',
  full: 'var(--bsk-width-full)',
} as const;

export type ContainerWidth = keyof typeof WIDTH_MAP;

export function Container({
  children,
  width = 'content',
  as: Tag = 'div',
}: {
  children: ReactNode;
  width?: ContainerWidth;
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer' | 'nav';
}) {
  return (
    <Tag
      style={{
        maxWidth: WIDTH_MAP[width],
        marginInline: 'auto',
        paddingInline: 'var(--bsk-space-5)',
        width: '100%',
      }}
    >
      {children}
    </Tag>
  );
}
