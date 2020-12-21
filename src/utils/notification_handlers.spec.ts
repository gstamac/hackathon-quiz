import { NotificationPermissionType } from '../store/browser_notifications_slice/interfaces'
import {
  handleBrowserNotification,
  handleRequestPermission,
  newMessageNotificationHandler,
} from './notification_handlers'
import { newMessageNotificationMock } from '../../tests/mocks/notifications_mock'
import { getMockStoreCreator } from '../../tests/test_utils'
import channelReducer from '../store/channels_slice/channels_slice'
import identityReducer from '../store/identity_slice'
import { messageDataMock, messageMock } from '../../tests/mocks/messages_mock'
import { oneOnOneChannelMock } from '../../tests/mocks/channels_mock'
import { MessagesType } from '../components/messages/interfaces'
import { ChannelWithParticipantsAndParsedMessage } from '../store/interfaces'
import * as store from '../store'
import { mocked } from 'ts-jest/utils'
import { publicIdentityMock } from '../../tests/mocks/identity_mock'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { getMessageTypeFormatString, getNotificationTitle } from './notification_utils'
import { MockStoreCreator } from 'redux-mock-store'
import {
  areBrowserNotificationsDisabledInLocalStorage, isNotificationApiSupported,
} from '../store/browser_notifications_slice/helpers'

jest.mock('../store')
jest.mock('./notification_utils')
jest.mock('../store/browser_notifications_slice/helpers')

interface StoreType {
  channels: ReturnType<typeof channelReducer>
  identity: ReturnType<typeof identityReducer>
}

interface MockStoreParams {
  channelId: string
  channel?: ChannelWithParticipantsAndParsedMessage
  identity?: PublicIdentity
}

const mockStore: MockStoreCreator<StoreType, store.ThunkDispatch> = getMockStoreCreator<StoreType>()

const mockChannelStore = ({
  channelId,
  channel,
  identity,
}: MockStoreParams): void => {
  const mockedStore = mockStore({
    channels: {
      channels: {
        [channelId]: channelId && channel ? {
          channel,
          members: [],
        } : undefined,
      },
      isFetching: {},
      errors: {},
      members: {},
      folders: [],
      isFetchingAll: true,
      meta: {},
      fileTokens: {},
      fileTokensFetching: {},
      lastVisitedFolder: {
        folderType: MessagesType.PRIMARY,
        groupUuid: undefined,
        channelId: undefined,
      },
    },
    identity: {
      isLoggedIn: true,
      hasVisited: true,
      identity,
    },
  })

  // eslint-disable-next-line no-import-assign
  Object.defineProperty(store, 'store', {
    value: mockedStore,
  })
}

describe('Notification handlers', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('handleRequestPermission', () => {
    const callbackMock: jest.Mock = jest.fn()

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should use the promise return version of requestPermission if supported', async () => {
      Object.defineProperty(global, 'Notification', {
        value: {
          requestPermission:
            jest.fn()
              .mockResolvedValueOnce(NotificationPermissionType.Granted)
              .mockResolvedValueOnce(NotificationPermissionType.Granted),
        },
      })

      await handleRequestPermission(callbackMock)
      expect(callbackMock).toHaveBeenCalledTimes(1)
      expect(callbackMock).toHaveBeenCalledWith(NotificationPermissionType.Granted)
    })

    it('should use the deprecated callback if the promise return version is not supported', async () => {
      Object.defineProperty(global, 'Notification', {
        value: {
          requestPermission: jest.fn(),
        },
      })

      await handleRequestPermission(callbackMock)

      expect(Notification.requestPermission).toHaveBeenCalledWith(callbackMock)
    })
  })

  describe('handleBrowserNotification', () => {
    const areBrowserNotificationsDisabledInLocalStorageMock = mocked(areBrowserNotificationsDisabledInLocalStorage)

    it('should return passed callback when user has notification permission', async () => {
      const isNotificationApiSupportedMock = mocked(isNotificationApiSupported).mockReturnValue(true)

      Object.defineProperty(global, 'Notification', {
        value: {
          requestPermission: jest.fn(),
          permission: NotificationPermissionType.Granted,
        },
      })
      areBrowserNotificationsDisabledInLocalStorageMock.mockReturnValue(false)

      const callback: jest.Mock = jest.fn()

      const handler = handleBrowserNotification(callback)

      await handler('channelAlias', newMessageNotificationMock)

      expect(isNotificationApiSupportedMock).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('channelAlias', newMessageNotificationMock)
    })

    it('should not call the function if browser does not support notifications', async () => {
      const isNotificationApiSupportedMock = mocked(isNotificationApiSupported).mockReturnValue(false)

      const callback: jest.Mock = jest.fn()

      const handler = handleBrowserNotification(callback)

      await handler('channelAlias', newMessageNotificationMock)

      expect(isNotificationApiSupportedMock).toHaveBeenCalled()
      expect(callback).not.toHaveBeenCalled()
      expect(callback).not.toHaveBeenCalledWith('channelAlias', newMessageNotificationMock)
    })

    it('should return empty callback when user doesn\'t have notification permission', async () => {
      Object.defineProperty(global, 'Notification', {
        value: {
          requestPermission: jest.fn(),
          permission: NotificationPermissionType.Default,
        },
      })
      areBrowserNotificationsDisabledInLocalStorageMock.mockReturnValue(false)

      const callback: jest.Mock = jest.fn()

      const handler = handleBrowserNotification(callback)

      await handler('channelAlias', newMessageNotificationMock)

      expect(callback).toHaveBeenCalledTimes(0)
    })

    it('should return empty callback when user has disabled notifications', async () => {
      Object.defineProperty(global, 'Notification', {
        value: {
          requestPermission: jest.fn(),
          permission: NotificationPermissionType.Default,
        },
      })
      areBrowserNotificationsDisabledInLocalStorageMock.mockReturnValue(true)

      const callback: jest.Mock = jest.fn()

      const handler = handleBrowserNotification(callback)

      await handler('channelAlias', newMessageNotificationMock)

      expect(callback).toHaveBeenCalledTimes(0)
    })
  })

  describe('newMessageNotificationHandler', () => {

    const notificationConstructor: jest.Mock = jest.fn()
    const getMessageTypeFormatStringMock = mocked(getMessageTypeFormatString)
    const getNotificationTitleMock = mocked(getNotificationTitle)

    const channelMock: ChannelWithParticipantsAndParsedMessage = {
      ...oneOnOneChannelMock,
      message: messageDataMock,
    }

    beforeEach(() => {
      Object.defineProperty(global, 'Notification', {
        value: notificationConstructor,
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should call Notification constructor with title and content when channel' +
      'is defined with title and sender is not logged in user', async () => {

      mockChannelStore({
        channelId: messageMock.channel_id,
        channel: channelMock,
        identity: publicIdentityMock,
      })

      getMessageTypeFormatStringMock.mockReturnValue('sent a new message')
      getNotificationTitleMock.mockReturnValue('Channel title')

      await newMessageNotificationHandler('channelAlias', newMessageNotificationMock)

      expect(notificationConstructor).toHaveBeenCalledWith(
        'Channel title',
        {
          body: 'sender sent a new message',
          icon: '/globalid_logo.png',
          tag: messageMock.uuid,
        }
      )
    })

    it('should not call Notification constructor when sender is logged in user', async () => {

      mockChannelStore({
        channelId: messageMock.channel_id,
        channel: channelMock,
        identity: {
          ...publicIdentityMock,
          gid_name: newMessageNotificationMock.sender,
        },
      })

      await newMessageNotificationHandler('channelAlias', newMessageNotificationMock)

      expect(notificationConstructor).not.toHaveBeenCalled()
    })

    it('should not call Notification constructor when channel is no defined', async () => {

      mockChannelStore({
        channelId: messageMock.channel_id,
        channel: undefined,
        identity: publicIdentityMock,
      })

      await newMessageNotificationHandler('channelAlias', newMessageNotificationMock)

      expect(notificationConstructor).not.toHaveBeenCalled()
    })
  })
})
