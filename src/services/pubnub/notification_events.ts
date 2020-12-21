import { MessagesType, ChannelFoldersType } from '../../components/messages/interfaces'
import { ThunkDispatch, store } from '../../store'
import {
  prepareAndFetchFolderCounter,
  decrementChannelCounter,
  incrementChannelCounter,
  fetchFoldersCounters,
} from '../../store/counters_slice'
import { initNotificationSdk } from './notifications'
import {
  ServiceNotification,
  NotificationAction,
  NotificationClientService, JoinMemberPayload,
} from './interfaces'
import { getAccessToken, getString, getUuidFromURL } from '../../utils'
import { getValidToken } from './../../components/auth'
import { isArray, isFunction } from 'lodash'
import {
  upsertAndParseChannelMessages,
  upsertAndParseChannelMessage,
  setChannelMessageDelivered,
  setDelieveredMessage,
  setSeenMessage,
  setTyping,
} from '../../store/messages_slice'
import {
  setChannel,
  setChannelLastMessage,
  fetchChannelsCounters,
  fetchMembers,
} from '../../store/channels_slice/channels_slice'
import {
  setGroup,
  fetchGroupMembers,
  removeGroupFromStore,
  updateGroupMessagingList,
  removeMyGroupAndMessagingChannel,
} from '../../store/groups_slice'
import {
  Message,
  ChannelWithParticipants,
  MessageDelivered as MessageDeliveredSdk,
  MessageSeen,
  Typing,
  Folder,
} from '@globalid/messaging-service-sdk'
import { ChannelWithMembers, GidUUID, ChannelType, MemberByUUID } from '../../store/interfaces'
import PQueue, { DefaultAddOptions } from 'p-queue'
import PriorityQueue from 'p-queue/dist/priority-queue'
import { GroupResponse } from '@globalid/group-service-sdk'
import { setToastSuccess } from 'globalid-react-ui'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { newMessageNotificationHandler, handleBrowserNotification } from '../../utils/notification_handlers'

export let client: NotificationClientService | undefined

const mapChannelToFolder = {
  'PRIMARY': MessagesType.PRIMARY,
  'GROUP': MessagesType.GROUPS,
  'UNKNOWN': MessagesType.OTHER,
}

const dispatch: ThunkDispatch = store.dispatch

export const initNotificationClient = async (): Promise<void> => {
  await getValidToken()

  if (client === undefined) {
    client = await initNotificationSdk()
  }
}

type Callback = (channel: string, notification: ServiceNotification) => Promise<void>

export const subscribe = (callBack: Callback): void => {
  if (client !== undefined) {
    client.subscribe(callBack)
  }
}

export const unsubscribe = (): void => {
  const token: string = <string>getAccessToken()

  if (client !== undefined) {
    client.unsubscribe(token)
  }
}

type NotificationServiceActions = {
  [key in NotificationAction]: Callback | Callback[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const handleNotification = async (_channel: string, _notification: ServiceNotification): Promise<void> => {
}

const handleNewMessageNotification = async (_channel: string, notification: ServiceNotification): Promise<void> => {
  const message: Message = (<Message><unknown>notification.payload)

  await dispatch(upsertAndParseChannelMessage(message))
  await dispatch(setChannelLastMessage({
    key: message.channel_id,
    value: message,
  }))

  const channel: ChannelWithMembers | undefined = store.getState().channels.channels[message.channel_id]
  const channelType: string | undefined = mapChannelToFolder[<never>channel?.channel.type]
  const loggedInIdentityUuid: GidUUID | undefined = getLoggedInIdentityUuid()

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (channelType !== undefined &&
    message.author !== loggedInIdentityUuid &&
    channel?.channel.unread_count === 0 && // one count per channel
    !window.location.pathname.includes(channel.channel.id) // do not increment counter if channel is open
  ) {
    dispatch(incrementChannelCounter(channelType))
  }

  const groupUuid: string | undefined = channel?.channel.group_uuid ?? undefined

  await dispatch(fetchMembers({
    channel_id: message.channel_id,
    member_ids: [message.author],
  }))
  await dispatch(fetchChannelsCounters({ channel_id: message.channel_id, group_uuid: groupUuid }))
  await dispatch(setChannelMessageDelivered(message))
  await dispatch(prepareAndFetchFolderCounter())

  await dispatch(updateGroupMessagingList(message.channel_id))
}

const handleNewChannelCreatedNotification = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const channelWithParticipants: ChannelWithParticipants = (<ChannelWithParticipants><unknown>notification.payload)

  await dispatch(setChannel(channelWithParticipants))
}

const handleDeletedStatusReceivedNotification = async (channel: string, notification: ServiceNotification):
  Promise<void> => {
  const updatedMessages: Message[] = (<Message[]><unknown>notification.payload)

  const channel_id: string | undefined = updatedMessages[0]?.channel_id

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (channel_id !== undefined) {
    await dispatch(upsertAndParseChannelMessages({
      key: channel_id,
      value: updatedMessages,
    }))
    await dispatch(setChannelLastMessage({
      key: channel_id,
      value: updatedMessages[0],
    }))
  }
}

const handleChannelUpdatedNotification = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const channelWithParticipants: ChannelWithParticipants = (<ChannelWithParticipants><unknown>notification.payload)

  await dispatch(setChannel(channelWithParticipants))
}

interface MessageDelivered extends MessageDeliveredSdk {
  message_uuid: string
}

const handleDeliveryStatusNotification = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const messageDelivered: MessageDelivered = (<MessageDelivered><unknown>notification.payload)

  await Promise.resolve(dispatch(setDelieveredMessage({
    key: messageDelivered.channel_id,
    value: { uuid: messageDelivered.message_uuid },
  })))
}

const handleSeenStatusNotification = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const messageSeen: MessageSeen = (<MessageSeen><unknown>notification.payload)
  const loggedInIdentityUuid: GidUUID | undefined = getLoggedInIdentityUuid()

  if (messageSeen.gid_uuid === loggedInIdentityUuid) {
    const channelWithMemebers: ChannelWithMembers | undefined = store.getState().channels.channels[messageSeen.channel_id]
    const channelType: string | undefined = mapChannelToFolder[<never>channelWithMemebers?.channel.type]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (channelType !== undefined) {
      dispatch(decrementChannelCounter(channelType))
    }

    const uuid: string | null = getUuidFromURL(window.location.pathname)
    const groupUuid: string | undefined = uuid !== null ? uuid : undefined

    await dispatch(fetchChannelsCounters({ channel_id: messageSeen.channel_id, group_uuid: groupUuid }))
    await dispatch(prepareAndFetchFolderCounter())
  }

  await Promise.resolve(dispatch(setSeenMessage({
    key: messageSeen.channel_id,
    value: messageSeen,
  })))
}

const handleTypingNotification = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const typing: Typing = (<Typing><unknown>notification.payload)
  const loggedInIdentityUuid: GidUUID | undefined = getLoggedInIdentityUuid()

  await dispatch(fetchMembers({
    channel_id: typing.channel_id,
    member_ids: [typing.author],
  }))

  if (typing.author !== loggedInIdentityUuid) {
    await Promise.resolve(dispatch(setTyping(typing)))
  }
}

const handleGroupJoinedNotification = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const joinedGroup: GroupResponse = <GroupResponse><unknown>notification.payload

  await Promise.resolve(store.dispatch(setGroup(joinedGroup)))
}

const handleGroupMemberJoinedOrLeftNotification = async (
  channel: string, notification: ServiceNotification
): Promise<void> => {
  const joinedMember: JoinMemberPayload = <JoinMemberPayload><unknown>notification.payload

  await Promise.resolve(store.dispatch(fetchGroupMembers({
    group_uuid: joinedMember.uuid,
    page: 1,
  })))
}

const handleGroupUpdatedNotification = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const groupResponse: GroupResponse = <GroupResponse><unknown>notification.payload

  await Promise.resolve(store.dispatch(setGroup({
    key: groupResponse.uuid,
    value: groupResponse,
  })))
}

const handleGroupDeleteNotification = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const deleteGroupResponse: GroupResponse = <GroupResponse><unknown>notification.payload

  await Promise.resolve(store.dispatch(removeGroupFromStore(deleteGroupResponse.uuid)))
}

const handleGroupLeftNotification = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const leftGroupResponse: GroupResponse = <GroupResponse><unknown>notification.payload

  await Promise.resolve(store.dispatch(removeMyGroupAndMessagingChannel(leftGroupResponse.uuid)))
}

const handleFolderChangeNotification = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const channelWithParticipants: ChannelWithParticipants = <ChannelWithParticipants><unknown>notification.payload
  const isMulti: boolean = channelWithParticipants.type === ChannelType.MULTI
  const loggedInIdentityUuid: GidUUID | undefined = getLoggedInIdentityUuid()
  const folders: Folder[] = store.getState().channels.folders
  const primaryFolderId: string | undefined =
    folders.find((folder: Folder) => folder.type === ChannelFoldersType.GENERAL)?.id
  const otherFolderId: string | undefined =
    folders.find((folder: Folder) => folder.type === ChannelFoldersType.UNKNOWN)?.id
  const displayName: string | undefined = channelWithParticipants.title && isMulti
    ? channelWithParticipants.title
    : undefined

  await dispatch(setChannel(channelWithParticipants))

  const chatNames: string = getMembers(
    channelWithParticipants.participants,
    loggedInIdentityUuid,
    displayName,
  )

  const folderName: string = channelWithParticipants.folder_id === primaryFolderId ? getString('button-group-primary') : getString('button-group-other')

  if (primaryFolderId !== undefined && otherFolderId !== undefined) {
    await dispatch(fetchFoldersCounters({
      [MessagesType.PRIMARY]: primaryFolderId,
      [MessagesType.OTHER]: otherFolderId,
    }))
  }

  const toastMessage: string = channelWithParticipants.type === ChannelType.MULTI
    ? getString('folder-changed-notification-multi-description')
    : getString('folder-changed-notification-description')

  dispatch(setToastSuccess({
    title: getString('folder-changed-notification-title').replace('{folder}', folderName),
    message: toastMessage.replace('{folder}', folderName).replace('{name}', chatNames),
  }))
}

const notificationServiceActions: NotificationServiceActions = {
  [NotificationAction.NewChannelCreated]: handleNewChannelCreatedNotification,
  [NotificationAction.NewMessage]: [
    handleNewMessageNotification,
    handleBrowserNotification(newMessageNotificationHandler),
  ],
  [NotificationAction.UserBlocked]: handleNotification,
  [NotificationAction.UserUnblocked]: handleNotification,
  [NotificationAction.SeenStatus]: handleSeenStatusNotification,
  [NotificationAction.DeliveryStatus]: handleDeliveryStatusNotification,
  [NotificationAction.ChannelUpdated]: handleChannelUpdatedNotification,
  [NotificationAction.DeletedStatusReceived]: handleDeletedStatusReceivedNotification,
  [NotificationAction.TypingNotificationReceived]: handleTypingNotification,
  [NotificationAction.FolderChanged]: handleFolderChangeNotification,
  [NotificationAction.GroupJoined]: handleGroupJoinedNotification,
  [NotificationAction.GroupLeft]: handleGroupLeftNotification,
  [NotificationAction.GroupMemberJoined]: handleGroupMemberJoinedOrLeftNotification,
  [NotificationAction.GroupMemberLeft]: handleGroupMemberJoinedOrLeftNotification,
  [NotificationAction.GroupUpdated]: handleGroupUpdatedNotification,
  [NotificationAction.GroupDeleted]: handleGroupDeleteNotification,
}

const callbackQueue: PQueue<PriorityQueue, DefaultAddOptions> = new PQueue({ concurrency: 1 })

export const subscribeCallback = async (channel: string, notification: ServiceNotification): Promise<void> => {
  const notificationServiceAction: Callback | Callback[] = notificationServiceActions[notification.action]

  if (isFunction(notificationServiceAction)) {
    await callbackQueue.add(async () => notificationServiceAction(channel, notification))
  } else if (isArray(notificationServiceAction)) {
    await callbackQueue.addAll(notificationServiceAction.map((actionCallback: Callback) => (
      async () => actionCallback(channel, notification)
    )))
  }
}

const getLoggedInIdentityUuid = (): string | undefined => store.getState().identity.identity?.gid_uuid

const getMembersNamesString = (firstMember?: PublicIdentity, secondMember?: PublicIdentity): string => (
  `${firstMember?.gid_name ?? ''}${secondMember !== undefined ? `, ${secondMember.gid_name}` : ''}`
)

const getMembers = (
  participants: GidUUID[],
  gidUuid: GidUUID | undefined,
  displayName: string | undefined
): string => {
  if (displayName !== undefined) {
    return displayName
  }

  const membersWithoutUser: string[] = participants.filter((participantUuid: GidUUID) => participantUuid !== gidUuid)
  const members: MemberByUUID = store.getState().channels.members

  const firstMember: PublicIdentity | undefined = members[membersWithoutUser[0]]
  const secondMember: PublicIdentity | undefined = members[membersWithoutUser[1]]

  return getMembersNamesString(firstMember, secondMember)
}
