import { GroupResponse } from '@globalid/group-service-sdk'
import { Message } from '@globalid/messaging-service-sdk'
import { RootState } from 'RootType'
import { MessageType } from '../components/messages/messenger_chat/interfaces'
import { ChannelType, ChannelWithParticipantsAndParsedMessage } from '../store/interfaces'
import { getParsedImageMessageContent, getImagesCount } from '../components/messages/messenger_chat/chat_message_cards/image_media_helpers'
import { getString, getStringWithText } from './general_utils'

export const getNotificationTitle = (
  channel: ChannelWithParticipantsAndParsedMessage,
  title: string,
  state: RootState,
): string => {
  const group: GroupResponse | undefined = channel.group_uuid
    ? state.groups.groups[channel.group_uuid]
    : undefined

  if (
    channel.type !== ChannelType.GROUP &&
    group !== undefined
  ) {

    const groupName: string = group.display_name ?? group.gid_name

    return (
      `${groupName}
      ${title}`
    )
  } else if (
    channel.type === ChannelType.GROUP &&
    group !== undefined
  ) {
    return group.display_name ?? group.gid_name
  }

  return title
}

const isCardMessage = (messageType: MessageType): boolean =>
  messageType === MessageType.CARD_DUAL_VIEW ||
  messageType === MessageType.CARD_VIEW ||
  messageType === MessageType.ENCRYPTED_CARD_DUAL_VIEW ||
  messageType === MessageType.ENCRYPTED_CARD_VIEW

const isDeletedMessage = (messageType: MessageType): boolean =>
  messageType === MessageType.DELETED

const isMediaMessage = (messageType: MessageType): boolean =>
  messageType === MessageType.ENCRYPTED_MEDIA ||
  messageType === MessageType.MEDIA ||
  messageType === MessageType.MEDIA_WITH_ENCRYPTED_TEXT ||
  messageType === MessageType.MEDIA_WITH_TEXT

export const getMessageTypeFormatString = (message: Message): string => {
  const messageType: MessageType = <MessageType> message.type

  if (isCardMessage(messageType)) {
    return getString('notification-sent-a-card-text')
  } else if (isDeletedMessage(messageType)) {
    return getString('notification-deleted-a-message')
  } else if (isMediaMessage(messageType)) {
    const messageContent = getParsedImageMessageContent(message.content)

    const imageCount: number = getImagesCount(messageContent, null)

    return getImageMessageString(imageCount)
  } else {
    return getString('notification-sent-a-new-message')
  }
}

const getImageMessageString = (imageCount: number): string => {
  if (imageCount === 0) {
    return getString('notification-sent-a-new-message')
  } else if (imageCount === 1) {
    return getString('notification-sent-an-image')
  } else {
    return getStringWithText('notification-sent-images', [{
      match: 'imageCount', replace: imageCount.toString(),
    }])
  }
}
