import type {ReactNode} from 'react';

// Temporary passthrough. Task 14 replaces this with a proper Header+Footer wrap
// reading from the root loader. Keeping the shape permissive so root.tsx
// continues to compile until then.
type PageLayoutProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

export function PageLayout({children}: PageLayoutProps) {
  return <>{children}</>;
}
