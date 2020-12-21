import {
  AddMessagePayload,
  CountersWithPaginationMeta,
  deleteMessages,
  getCounters,
  GetCountersQuery,
  getMessages,
  getSubscriptionsV2,
  Message,
  MessageSeen,
  MessagesWithPaginationMeta,
  MessageTemplateEncryptedText,
  sendTypingNotification as sendTypingNotificationSdk,
  setMessageDelivered as setMessageDeliveredSdk,
  setMessageSeen as setMessageSeenSdk,
  SubscriptionPaginationQueryParams,
  PaginationQueryParams,
  GroupCountersWithPaginationMeta,
  getGroupSpecificCounters as getGroupSpecificCountersSdk,
  GroupCounter,
  getGroupCounters,
  getCallUser,
  CallUserBody,
  ResponseOfCall,
  createCall,
} from '@globalid/messaging-service-sdk'
import { MessageDelivered, SubscriptionsWithPaginationMeta } from '@globalid/messaging-service-sdk/interfaces'
import { getValidToken } from '../../components/auth'
import { MessageContent } from '../../components/messages/messenger_chat/chat_message_cards'
import { getPayloadType } from '../../components/messages/messenger_chat/message_input/helpers'
import { deviceKeyManager } from '../../init'
import { MeetingResponse } from './interfaces'

export const getChannelMessages = async (
  channel_id: string,
  queryParams: PaginationQueryParams
): Promise<MessagesWithPaginationMeta> => {
  const token: string = await getValidToken()

  return getMessages(token, { channel_id }, queryParams)
}

export const getSubscriptions = async (query: SubscriptionPaginationQueryParams):
  Promise<SubscriptionsWithPaginationMeta> => {
  const token: string = await getValidToken()

  return getSubscriptionsV2(token, query)
}

export const deleteMessageFromChannel = async (ids: string[]): Promise<Message[]> => {
  const token: string = await getValidToken()

  return deleteMessages(token, { ids })
}

export const setMessageSeen = async (message_id: string): Promise<MessageSeen> => {
  const token: string = await getValidToken()

  return setMessageSeenSdk(token, { message_id })
}

export const sendTypingNotification = async (channelId: string): Promise<void> => {
  const token: string = await getValidToken()

  await sendTypingNotificationSdk(token, { channel_id: channelId })
}

export const setMessageDelivered = async (message_id: string): Promise<MessageDelivered> => {
  const token: string = await getValidToken()

  return setMessageDeliveredSdk(token, { message_id })
}

export const fetchCounters = async (query: GetCountersQuery):
  Promise<CountersWithPaginationMeta> => {
  const token: string = await getValidToken()

  return getCounters(token, query)
}

export const fetchGroupCounters = async (query: PaginationQueryParams):
  Promise<GroupCountersWithPaginationMeta> => {
  const token: string = await getValidToken()

  return <GroupCountersWithPaginationMeta> <unknown> getGroupCounters(token, query)
}

export const getGroupSpecificCounters = async (groupUuid: string):
  Promise<GroupCounter> => {
  const token: string = await getValidToken()

  const counters: GroupCounter =
    <GroupCounter> <unknown> await getGroupSpecificCountersSdk(token, { group_uuid: groupUuid })

  return counters
}

export const createMessagePayload = async (
  message: string,
  messageUuid: string,
  encryptedChannelSecret?: string,
): Promise<AddMessagePayload> =>
  (
    {
      uuid: messageUuid,
      type: getPayloadType(encryptedChannelSecret),
      content: JSON.stringify(await createMessageContent(message, encryptedChannelSecret)),
      silent: false,
    }
  )

export const createMessageContent = async (message: string, encryptedChannelSecret?: string):
  Promise<MessageContent | MessageTemplateEncryptedText> => {
  if (!encryptedChannelSecret) {
    return {
      text: message,
    }
  }

  try {
    return await deviceKeyManager.encrypt(encryptedChannelSecret, message)
  } catch (err) {
    throw new Error('ERR_ENCRYPTION')
  }
}

export const getMeeting = async (
  meetingId: string,
  channelId: string
): Promise<MeetingResponse> => {
  const token: string = await getValidToken()
  const response: CallUserBody = await getCallUser(token, { call_uuid: meetingId, channel_id: channelId})

  return mapToMeetingReponse(response)
}

export const createMeeting = async (
  channelId: string
): Promise<MeetingResponse> => {
  const token: string = await getValidToken()

  const response: ResponseOfCall = await createCall(token, { channel_id: channelId })

  return mapToMeetingReponse(response)
}

const mapToMeetingReponse = (response: CallUserBody | ResponseOfCall): MeetingResponse => {
  const { meeting_id, media_region, media_placement, attendee } = response

  return {
    meetingId: meeting_id,
    mediaRegion: media_region,
    mediaPlacement: media_placement,
    attendee,
  }
}

