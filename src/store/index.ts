import { composeWithDevTools } from '@redux-devtools/extension'
import { applyMiddleware, legacy_createStore as createStore } from 'redux'
import { withExtraArgument } from 'redux-thunk'

import { rootReducer } from './reducers'
// import { apiMiddleware } from './api'

export const configureStore = (preloadedState = {}) => {
  const thunkMiddleware = withExtraArgument()
  const middlewares = applyMiddleware(thunkMiddleware /*, apiMiddleware */)
  const enhancer = composeWithDevTools(middlewares)

  return createStore(rootReducer, preloadedState, enhancer)
}

export const store = configureStore()
