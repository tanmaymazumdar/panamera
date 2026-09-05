import { startTransition } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router/dom'

import { router } from './router'
import { store } from './store'

import './index.css'

startTransition(() => {
  const root = document.getElementById('root') as HTMLElement

  createRoot(root).render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  )
})
