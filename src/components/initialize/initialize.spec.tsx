import React from 'react'
import { act, render } from '../../../tests/test_utils'
import { store } from '../../store'
import { setLoggedIn } from '../../store/identity_slice'
import { Initialize } from './initialize'
import { useInitPubnubEvents } from '../../hooks/use_init_pubnub_events'
import { mocked } from 'ts-jest/utils'
import { initializeDeviceKeyManager } from '../messages/helpers'
import { setDocumentTitle, useFolderCounters } from './use_folder_counters'
import { useBrowserNotificationsPrompt } from './use_browser_notifications_prompt'

jest.mock('../messages/helpers')
jest.mock('../../hooks/use_init_pubnub_events')
jest.mock('./use_folder_counters')
jest.mock('./use_browser_notifications_prompt')

describe('Initialize test', () => {
  const useInitPubnubEventsMock: jest.Mock = mocked(useInitPubnubEvents)
  const initializeDeviceKeyManagerMock: jest.Mock = mocked(initializeDeviceKeyManager)
  const useFolderCountersMock: jest.Mock = mocked(useFolderCounters)
  const setDocumentTitleMock: jest.Mock = mocked(setDocumentTitle)
  const useBrowserNotificationsPromptMock: jest.Mock = mocked(useBrowserNotificationsPrompt)

  beforeAll(async () => {
    store.dispatch(setLoggedIn())

    await act(async () => {
      render(<Initialize />)
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render initialize component', () => {
    expect(useInitPubnubEventsMock).toHaveBeenNthCalledWith(1, { isLoggedIn: true })
    expect(initializeDeviceKeyManagerMock).toHaveBeenCalledTimes(1)
    expect(useFolderCountersMock).toHaveBeenCalledWith({ isLoggedIn: true })
    expect(setDocumentTitleMock).toHaveBeenCalledTimes(1)
    expect(useBrowserNotificationsPromptMock).toHaveBeenCalledTimes(1)
  })
})
