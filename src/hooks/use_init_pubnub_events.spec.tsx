import { act, renderHook } from '@testing-library/react-hooks'
import { useInitPubnubEvents } from './use_init_pubnub_events'
import * as notification_events from '../services/pubnub/notification_events'
import { UseInitPubnubEventsProps } from './interfaces'
import { mocked } from 'ts-jest/utils'

jest.mock('../services/pubnub/notification_events')

const render = async (props: UseInitPubnubEventsProps): Promise<void> => {
  await act(async () => {
    renderHook(() => useInitPubnubEvents(props))
  })
}

describe('useInitPubnubEvents', () => {

  const initNotificationClientMock: jest.Mock = mocked(notification_events.initNotificationClient).mockResolvedValue()
  const subscribeMock: jest.Mock = mocked(notification_events.subscribe)

  mocked(notification_events.subscribeCallback).mockResolvedValue()

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should initialize pubnub events when user is logged in', async () => {
    await render({ isLoggedIn: true })

    expect(initNotificationClientMock).toHaveBeenCalled()
    expect(subscribeMock).toHaveBeenCalled()
  })

  it('should not initialize pubnub events when user is not logged in', async () => {
    await render({ isLoggedIn: false })

    expect(initNotificationClientMock).not.toHaveBeenCalled()
    expect(subscribeMock).not.toHaveBeenCalled()
  })
})
