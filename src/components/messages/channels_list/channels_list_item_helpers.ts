import {
  MessageTemplateCardView,
  MessageTemplateEncryptedText,
  MessageTemplateMedia,
  MessageTemplateMediaWithEncryptedText,
  MessageTemplateText,
} from '@globalid/messaging-service-sdk'
import { deviceKeyManager } from '../../../init'
import { getEncryptedMediaMessageContent, getMediaMessageContent } from '../../../store/messages_slice'
import { IdentityByUUID } from '../interfaces'
import {
  getString,
  getStringWithText,
  getEncryptedMessageContent,
  getMessageContent,
} from '../../../utils'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { ChannelWithParticipantsAndParsedMessage, ChannelType, MessagePreviewData } from '../../../store/interfaces'
import { MessageType } from '../messenger_chat/interfaces'
import { LastMessage, MediaAssetType } from './interfaces'

export const getMessageAuthorName = (
  channel: ChannelWithParticipantsAndParsedMessage,
  gidName: string | undefined,
  showOwner: boolean,
): string => {
  const lastMessageAuthorName: string = gidName ?? ''

  if (channel.message?.type !== MessageType.SYSTEM) {
    if (channel.type === ChannelType.GROUP) {
      return `${lastMessageAuthorName}${channel.created_by === channel.message?.author && showOwner
        ? ` ${getString('group-owner')}:`
        : ':'}`
    }

    if (channel.type === ChannelType.MULTI || channel.message?.type === MessageType.CARD_VIEW) {
      return `${lastMessageAuthorName}:`
    }
  }

  return ''
}

export const getChannelParticipant = (
  identities: IdentityByUUID | null,
  participantUuid: string | undefined
): PublicIdentity | undefined => {
  if (!identities || !participantUuid) {
    return undefined
  }

  return identities[participantUuid]
}

export const getChannelParticipantsByChannelType = (
  identities: IdentityByUUID | null,
  type: ChannelType,
  participants: string[]
): (PublicIdentity | undefined)[] => {
  if (type === ChannelType.MULTI) {
    const firstParticipant: PublicIdentity | undefined = getChannelParticipant(identities, participants[0])
    const secondParticipant: PublicIdentity | undefined = getChannelParticipant(identities, participants[1])

    return [firstParticipant, secondParticipant]
  }

  if (type === ChannelType.PERSONAL) {
    const firstParticipant: PublicIdentity | undefined = getChannelParticipant(identities, participants[0])

    return [firstParticipant]
  }

  return []
}

export const getLastMessageAuthor = (
  identities: IdentityByUUID | null,
  channel: ChannelWithParticipantsAndParsedMessage
): PublicIdentity | undefined =>
  (channel.type === ChannelType.MULTI || channel.type === ChannelType.GROUP || channel.type === ChannelType.PERSONAL)
    ? getChannelParticipant(identities, channel.message?.author)
    : undefined

export const getImageTextBasedOnAuthorAssetsAndText = (
  message: MessagePreviewData,
  content: MessageTemplateMediaWithEncryptedText | MessageTemplateMedia | null,
  text: string | null,
  identities: IdentityByUUID,
  identity: PublicIdentity | undefined
): string => {
  const isAuthorLoggedInIdentity: boolean = message.author === identity?.gid_uuid

  if (isAuthorLoggedInIdentity && !text && content && content.assets.length > 0) {
    return content.assets.length === 1 ? getString('you-sent-image') : getString('you-sent-images')
  }

  const author: PublicIdentity | undefined = getChannelParticipant(identities, message.author)

  if (author && content && content.assets.length > 0) {
    return content.assets.length === 1 ?
      getStringWithText('user-sent-image', [{ match: 'user', replace: author.gid_name }])
      :
      getStringWithText('user-sent-images', [{ match: 'user', replace: author.gid_name }])
  }

  return ''
}

// eslint-disable-next-line complexity,max-lines-per-function
export const getLastMessage = async (
  channel: ChannelWithParticipantsAndParsedMessage,
  identities: IdentityByUUID,
  identity: PublicIdentity | undefined,
  encryptedChannelSecret?: string,
): Promise<LastMessage> => {
  try {
    const message: MessagePreviewData | undefined = channel.message

    const isMultiOrGroupChannel: boolean = channel.type === ChannelType.GROUP || channel.type === ChannelType.MULTI
    const isLoggedInIdentityMessageAuthor: boolean = message?.author === identity?.gid_uuid

    if (encryptedChannelSecret !== undefined && message?.type === MessageType.ENCRYPTED_TEXT) {
      const encryptedContent: MessageTemplateEncryptedText | null = getEncryptedMessageContent(message)

      return (encryptedContent === null) ?
        { text: null}
        :
        { text: await deviceKeyManager.decrypt(encryptedChannelSecret, encryptedContent), showAuthor: true }
    }

    if (encryptedChannelSecret !== undefined && message?.type === MessageType.MEDIA_WITH_ENCRYPTED_TEXT) {
      const encryptedContent: MessageTemplateEncryptedText | null = getEncryptedMediaMessageContent(message)

      const content: MessageTemplateMediaWithEncryptedText = JSON.parse(message.content)

      if (content.assets.length > 0 && content.assets[0].type === MediaAssetType.IMAGE) {
        const decryptedText: string | null = (encryptedContent === null) ?
          null : await deviceKeyManager.decrypt(encryptedChannelSecret, encryptedContent)

        const imageInfoText: string = getImageTextBasedOnAuthorAssetsAndText(
          message,
          content,
          decryptedText,
          identities,
          identity
        )

        return decryptedText?.length ? { text: decryptedText, showAuthor: true }: { text: imageInfoText }
      }
    }

    if (message?.type === MessageType.MEDIA_WITH_TEXT) {
      const content: MessageTemplateMedia | null = getMediaMessageContent(message)

      if (content && content.assets.length > 0 && content.assets[0].type === MediaAssetType.IMAGE) {
        const imageInfoText: string = getImageTextBasedOnAuthorAssetsAndText(
          message,
          content,
          content.text ?? null,
          identities,
          identity
        )

        return content.text?.length ?
          { text: content.text, showAuthor: true } : { text: imageInfoText }
      }
    }

    if (message?.type === MessageType.TEXT ||
      message?.type === MessageType.DELETED ||
      message?.type === MessageType.SYSTEM) {
      const content: MessageTemplateText | null = getMessageContent(message)

      const isDeletedByMe: boolean = message.deleted_by ? message.deleted_by === identity?.gid_name : false

      if (isDeletedByMe) {
        return { text: getString('you-deleted-msg') }
      }

      return (content === null) ?
        { text: null }
        :
        { text: content.text, showAuthor: isMultiOrGroupChannel && message.type !== MessageType.DELETED }
    }

    const mediaContent: MessageTemplateMedia | undefined =
      message?.type === MessageType.MEDIA ? JSON.parse(message.content) : undefined

    const isImageAsset: boolean | undefined =
      mediaContent && mediaContent.assets.length > 0 && mediaContent.assets[0].type === MediaAssetType.IMAGE
    const isImageSentByMe: boolean = (isImageAsset ?? false) && isLoggedInIdentityMessageAuthor

    const author: PublicIdentity | undefined = getChannelParticipant(identities, message?.author)

    const cardViewContent: MessageTemplateCardView | undefined =
      message?.type === MessageType.CARD_VIEW ? JSON.parse(message.content) : undefined

    if (cardViewContent !== undefined) {
      return { text: cardViewContent.text }
    }

    if (isImageAsset && author !== undefined) {
      return isImageSentByMe ?
        { text: getString('you-sent-image')}
        :
        { text: getStringWithText('user-sent-image',[{ match: 'user', replace: author.gid_name}]) }
    }

    return { text: null }
  } catch (error) {
    return { text: null }
  }
}
