import browserNotificationsReducer, { showBrowserNotificationsPrompt } from '.'
import { getMockStoreCreator } from '../../../tests/test_utils'
import { MockStoreEnhanced } from 'redux-mock-store'
import { ThunkDispatch } from '../store'
import { AnyAction } from '@reduxjs/toolkit'
import { BrowserNotificationsSlice, StoreTypeMock } from './interfaces'

const mockStore = getMockStoreCreator<StoreTypeMock>()

describe('showBrowserNotificationsPrompt', () => {
  const initialState: StoreTypeMock = {
    browserNotifications: {
      isPromptVisible: false,
    },
  }

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should execute actions & update state upon being called', () => {
    const store: MockStoreEnhanced<StoreTypeMock, ThunkDispatch> = mockStore(initialState)

    const action: AnyAction = store.dispatch(showBrowserNotificationsPrompt())

    const actions: AnyAction[] = store.getActions()

    expect(actions[0]).toBeActionType(showBrowserNotificationsPrompt)

    const state: BrowserNotificationsSlice =
      browserNotificationsReducer(store.getState().browserNotifications, action)

    expect(state).toEqual({
      isPromptVisible: true,
    })
  })
})
