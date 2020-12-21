import { mocked } from 'ts-jest/utils'
import * as notificationEvents from './notification_events'
import * as notificationsSdk from './notifications'
import * as authValidators from '../../components/auth'
import * as utils from '../../utils'

jest.mock('../api/messaging_api')
jest.mock('pubsub-js')
jest.mock('pubnub')
jest.mock('./notifications')
jest.mock('../../components/auth')
jest.mock('../../utils')

describe('Notification Service', () => {
  const notificationsSdkMock = mocked(notificationsSdk.initNotificationSdk)
  const getValidTokenTokenMock= mocked(authValidators.getValidToken)
  const getTokenMock = mocked(<jest.Mock> utils.getAccessToken)
  const subscribeMock: jest.Mock = jest.fn()
  const unsubscribeMock: jest.Mock = jest.fn()

  beforeEach(() => {
    notificationsSdkMock.mockResolvedValue({
      subscribe: subscribeMock,
      unsubscribe: unsubscribeMock,
    })
    getValidTokenTokenMock.mockResolvedValue('access_token')
    getTokenMock.mockReturnValue('token')
  })

  it('should init notification sdk', async () => {
    expect(notificationEvents.client).toBeUndefined()
    await notificationEvents.initNotificationClient()
    expect(notificationsSdkMock).toHaveBeenCalled()
    expect(getValidTokenTokenMock).toHaveBeenCalled()
  })

  it('should be able to call pubnub subscribe function after pubnub initialization', () => {
    const handler = jest.fn()

    notificationEvents.subscribe(handler)
    expect(subscribeMock).toHaveBeenCalled()
  })
  it('should be able to call pubnub unsubscribe function after pubnub initialization', () => {
    notificationEvents.unsubscribe()
    expect(unsubscribeMock).toHaveBeenCalled()
    expect(getTokenMock).toHaveBeenCalledTimes(1)
  })
})
