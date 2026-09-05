import { createBrowserRouter, Outlet } from 'react-router'

const Root = () => <Outlet />

export const router = createBrowserRouter([
  {
    children: [
      {
        path: 'login',
        lazy: () => import('./pages/login'),
      },
    ],
    path: '/',
    Component: Root,
  },
])
