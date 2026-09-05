import { render, type RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createRoutesStub } from 'react-router'

import type { ComponentType, PropsWithChildren } from 'react'
import type { ActionFunction, LoaderFunction } from 'react-router'
import type { Store } from 'redux'

import { configureStore } from '@/store'
import { mockedStore } from '@/tests/mocks/store'

export interface RenderOptions {
  action?: ActionFunction
  loader?: LoaderFunction
  path?: string
  customProps?: Record<string, unknown>
  context?: Record<string, unknown>
}

export const customRender = (
  ui: ComponentType,
  { path = '/', action, loader, customProps, context }: RenderOptions = {},
): RenderResult & { store: Store } => {
  const Comp = createRoutesStub([
    {
      path,
      Component: ui,
      action,
      loader,
    },
  ])
  const store = configureStore(context ?? mockedStore ?? {})
  const Wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>

  // @ts-expect-error type casting issue
  return {
    store,
    ...render(<Comp {...(customProps ?? {})} initialEntries={[path]} />, {
      wrapper: Wrapper,
    }),
  }
}

export * from '@testing-library/react'
