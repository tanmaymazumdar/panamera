import { combineReducers } from 'redux'

import { reducers as auth } from './auth'

export const rootReducer = combineReducers({
  auth,
})
