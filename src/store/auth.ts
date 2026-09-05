import { createSelector } from 'reselect'

import type { Action, Dispatch } from 'redux'

import { BASE_API_URL } from '@/globals'

const ACTION_TYPE = {
  LOADING: 'LOADING',
  SET_AUTH: 'SET_AUTH',
}

const initialState = {
  loader: false,
  user: {},
}

export const selectors = {
  getAuthLoader: createSelector([({ auth }) => auth.loader], (authLoader) => authLoader),

  authUser: createSelector([({ auth }) => auth.user], (authUser) => authUser),
}

export const actions = {
  signIn:
    (formData: FormData) =>
    async (dispatch: Dispatch): Promise<void> => {
      dispatch({ type: ACTION_TYPE.LOADING })

      let res = await fetch(BASE_API_URL, {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        res = await res.json()
      }

      dispatch({
        type: ACTION_TYPE.SET_AUTH,
        data: (res as unknown as { data: unknown }).data,
      })
    },
}

export const reducers = (state = initialState, action: Action) => {
  switch (action.type) {
    case ACTION_TYPE.LOADING:
      return { ...state, loader: true }

    case ACTION_TYPE.SET_AUTH:
      return {
        ...state,
        loader: false,
        user: (action as unknown as { data: unknown }).data,
      }

    default:
      return state
  }
}
