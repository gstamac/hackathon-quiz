import { RouteSlice } from './interfaces'
import routeReducer, { setRedirectToUrl } from '.'
import { getMockStoreCreator } from '../../../tests/test_utils'
import { MockStoreCreator, MockStoreEnhanced } from 'redux-mock-store'
import { ThunkDispatch } from '..'
import { AnyAction } from '@reduxjs/toolkit'

interface StoreType {
  routing: ReturnType<typeof routeReducer>
}

const mockStore: MockStoreCreator<StoreType, ThunkDispatch> = getMockStoreCreator<StoreType>()

describe('Route slice tests', () => {
  const initialState: StoreType = {
    routing: {
      redirectTo: undefined,
    },
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('setRedirectToUrl', () => {
    it('should set redirectTo url in the state', () => {
      const store: MockStoreEnhanced<StoreType, ThunkDispatch> = mockStore(initialState)

      store.dispatch(setRedirectToUrl('redirect-to'))

      const actions: AnyAction[] = store.getActions()

      expect(actions[0]).toBeActionType(setRedirectToUrl)

      const state: RouteSlice = routeReducer(store.getState().routing, actions[0])

      expect(state).toEqual({
        ...initialState.routing,
        redirectTo: 'redirect-to',
      })
    })
  })
})
