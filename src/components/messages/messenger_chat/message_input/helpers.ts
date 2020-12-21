import { createMessageContent } from '../../../../services/api'
import { MediaListViewType } from '../chat_message_cards'
import { AddMessagePayload, MediaAsset, MessageTemplateMedia } from '@globalid/messaging-service-sdk'
import { MessageType } from '../interfaces'
import { ResendMessageMeta } from '../../../../services/api/interfaces'
import { MessageData, GidUUID } from '../../../../store/interfaces'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

const createImageContent = (image: MediaAsset): MessageTemplateMedia => ({
  list_view_type: getMediaViewType(image),
  assets: [image],
})

export const getPayloadType = (encryptedChannelSecret?: string): Exclude<MessageType, MessageType.SYSTEM> =>
  (encryptedChannelSecret === undefined ? MessageType.TEXT : MessageType.ENCRYPTED_TEXT)

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

export const createImagePayload = (
  image: MediaAsset,
  messageUuid: string,
): AddMessagePayload =>
  ({
    uuid: messageUuid,
    type: MessageType.MEDIA,
    content: JSON.stringify(createImageContent(image)),
    silent: false,
  })

export const createMessageData = (
  message: string,
  channelId: string,
  author: GidUUID,
  resendingMeta?: ResendMessageMeta,
  encryptedChannelSecret?: string,
): MessageData => ({
  type: getPayloadType(encryptedChannelSecret),
  content: '',
  parsedContent: message,
  ...createBaseMessageBodyData(channelId, author, resendingMeta),
})

export const createImageData = (
  assetUuid: string,
  imageBase64: string,
  channelId: string,
  author: GidUUID,
  resendingMeta?: ResendMessageMeta,
): MessageData => ({
  type: MessageType.MEDIA,
  content: JSON.stringify({ base64: imageBase64 }),
  parsedContent: JSON.stringify({ assets: [{ uuid: assetUuid, thumbnail: imageBase64 }]}),
  ...createBaseMessageBodyData(channelId, author, resendingMeta),
})

const createBaseMessageBodyData = (
  channel_id: string,
  author: string,
  resendingMeta?: ResendMessageMeta,
): Omit<MessageData, 'type' | 'content' | 'parsedContent'> => {
  const messageUuid: string = resendingMeta ? resendingMeta.uuid : uuidv4()

  return {
    uuid: messageUuid,
    channel_id,
    sequence_id: undefined,
    author,
    deleted: false,
    errored: false,
    delivered: false,
    created_at: moment.utc().toISOString(),
  }
}

export const getMediaViewType = (image: MediaAsset): MediaListViewType =>
  (image.meta.dimensions.width >= image.meta.dimensions.height ? MediaListViewType.Horizontal : MediaListViewType.Vertical)

export const trimTextLeftAndRightSideWhiteSpaces = (text: string): string => text.replace(/^[\s]+|[\s]+$/g, '')
