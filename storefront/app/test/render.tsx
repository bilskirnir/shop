import type {ReactElement} from 'react';
import {render, type RenderOptions} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router';

export function renderWithRouter(
  ui: ReactElement,
  {route = '/', ...options}: {route?: string} & Omit<RenderOptions, 'wrapper'> = {},
) {
  const router = createMemoryRouter([{path: '*', element: ui}], {
    initialEntries: [route],
  });
  return render(<RouterProvider router={router} />, options);
}
