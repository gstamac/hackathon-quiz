import { Message } from '@globalid/messaging-service-sdk'
import { isNil } from 'lodash'
import { RootState } from 'RootType'
import { ServiceNotification } from '../services/pubnub/interfaces'
import { store } from '../store'
import { ChannelWithParticipantsAndParsedMessage } from '../store/interfaces'
import { getMessageTypeFormatString, getNotificationTitle } from './notification_utils'
import { NotificationPermissionType } from '../store/browser_notifications_slice/interfaces'
import { setRedirectToUrl } from '../store/route_slice'
import { BASE_MESSAGES_URL } from '../constants'
import { MessagesType } from '../components/messages/interfaces'
import { getRouteFolderType } from './channel_helpers'
import {
  areBrowserNotificationsDisabledInLocalStorage,
  isNotificationApiSupported,
} from '../store/browser_notifications_slice/helpers'

type NotificationCallback = (
  channel: string,
  notification: ServiceNotification,
) => Promise<void>

const isRequestPermissionPromiseSupported = async (): Promise<boolean> => {
  try {
    await Notification.requestPermission().then()
  } catch (error) {
    return false
  }

  return true
}

export const handleRequestPermission = async (
  callback: (permission: NotificationPermission) => Promise<void>
): Promise<void> => {
  if (await isRequestPermissionPromiseSupported()) {
    const permission: NotificationPermission = await Notification.requestPermission()

    await callback(permission)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await Notification.requestPermission(callback)
  }
}

export const emptyNotificationCallback: NotificationCallback = async () =>
  new Promise(resolve => resolve())

export const handleBrowserNotification = (
  callback: NotificationCallback
): NotificationCallback => async (
  channel: string,
  notification: ServiceNotification,
): Promise<void> => {
  if (
    isNotificationApiSupported() &&
    Notification.permission === NotificationPermissionType.Granted &&
    !areBrowserNotificationsDisabledInLocalStorage()
  ) {
    await callback(channel, notification)
  }
}

export const newMessageNotificationHandler = async (
  _channelAlias: string,
  notification: ServiceNotification,
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<void> => {
  const message: Message = (<Message><unknown>notification.payload)

  const channelId: string = message.channel_id

  const state: RootState = store.getState()

  const channel: ChannelWithParticipantsAndParsedMessage | undefined =
    state.channels.channels[channelId]?.channel

  const messageAuthor: string = notification.sender

  const notificationFromLoggedInUser: boolean =
    state.identity.identity?.gid_name === messageAuthor

  if (
    channel !== undefined &&
    !isNil(channel.title) &&
    !notificationFromLoggedInUser
  ) {
    const folderId = channel.folder_id ? channel.folder_id : ''
    const groupUuid: string | undefined = channel.group_uuid ?? undefined

    const title: string = getNotificationTitle(channel, channel.title, state)
    const redirectTo: string = groupUuid !== undefined
      ? `${BASE_MESSAGES_URL}/${MessagesType.GROUPS}/${groupUuid}/${channelId}`
      : `${BASE_MESSAGES_URL}/${getRouteFolderType(state.channels.folders, folderId)}/${channelId}`

    const browserNotification = new Notification(title, {
      body: `${messageAuthor} ${getMessageTypeFormatString(message)}`,
      icon: '/globalid_logo.png',
      tag: message.uuid,
    })

    browserNotification.onclick = event => {
      store.dispatch(setRedirectToUrl(redirectTo))
      event.preventDefault() // prevent the browser from focusing on Notification's tab
      window.focus()
    }
  }
}
