import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { MessageTemplateCardView } from '@globalid/messaging-service-sdk'
import React from 'react'
import { ChannelType, MessageData } from '../../../store/interfaces'
import { IdentityByUUID } from '../interfaces'
import {
  BaseMessageCardProps,
  DeletedMessageCard,
  MessageContext,
  MessageDataParsed,
  SystemMessageCard,
  TextMessageCard,
  TextMessageCardProps,
} from './chat_message_cards'
import { CardViewMessageCard } from './chat_message_cards/card_view_message'
import { MessageCardType } from './chat_message_cards/card_view_message/interfaces'
import { retrieveMessageCardTypeFromButtons } from './chat_message_cards/helpers'
import { ImageMessageCard } from './chat_message_cards/image_message_card'
import { UnsupportedMessageCard } from './chat_message_cards/unsupported_message_card'
import {
  ChatMessageCards,
  MessageCardByTypeMap,
  MessageType,
} from './interfaces'

export const messageCardByType = (
  me: PublicIdentity,
  admin: string | undefined,
  participants: IdentityByUUID,
  messageSeenId: string | undefined,
  channelType: ChannelType,
  showOwner: boolean | undefined,
  encryptedChannelSecret?: string,
  isHiddenMember?: boolean,
): MessageCardByTypeMap => (prevMessage: MessageData | null , message: MessageData, nextMessage: MessageData | null): ChatMessageCards => {
  const author: PublicIdentity | undefined = participants[message.author]

  const messageContext: MessageContext = {
    prevMessage,
    message,
    nextMessage,
  }

  const seen: boolean = messageSeenId !== undefined && messageSeenId === message.id
  const hideOwner: boolean = showOwner !== undefined && !showOwner && ChannelType.GROUP === channelType

  const baseCardProps: BaseMessageCardProps = {
    messageContext,
    me,
    admin,
    author,
    channelType,
    seen,
    hideOwner,
    isHiddenMember,
  }

  const messageCardMap: Map<MessageType, JSX.Element> = new Map([
    [MessageType.SYSTEM, <SystemMessageCard key={message.uuid} text={message.content ? JSON.parse(message.content).text: ''} />],
    [MessageType.MEDIA, <ImageMessageCard key={message.uuid} {...baseCardProps}/>],
    [MessageType.MEDIA_WITH_ENCRYPTED_TEXT, <ImageMessageCard key={message.uuid} encryptedChannelSecret={encryptedChannelSecret} {...baseCardProps}/>],
    [MessageType.MEDIA_WITH_TEXT, <ImageMessageCard key={message.uuid} {...baseCardProps}/>],
    [MessageType.ENCRYPTED_MEDIA, <ImageMessageCard key={message.uuid} encryptedChannelSecret={encryptedChannelSecret} {...baseCardProps}/>],
    [MessageType.CARD_VIEW, <CardViewMessageCardComponent key={message.uuid} message={message} {...baseCardProps}/>],
    [MessageType.TEXT, <TextOrEncryptedTextMessageCard key={message.uuid} message={message} encryptedChannelSecret={encryptedChannelSecret} {...baseCardProps}/>],
    [MessageType.ENCRYPTED_TEXT, <TextOrEncryptedTextMessageCard key={message.uuid} message={message} encryptedChannelSecret={encryptedChannelSecret} {...baseCardProps}/>],
    [MessageType.DELETED, <DeletedMessageCard key={message.uuid} {...baseCardProps}/>],
  ])

  return messageCardMap.get(message.type as MessageType) ?? <UnsupportedMessageCard key={message.uuid} {...baseCardProps}/>
}
type BaseProps = BaseMessageCardProps<MessageData> & {message: MessageData, encryptedChannelSecret?: string}
export const CardViewMessageCardComponent: React.FC<BaseProps> = props => {
  const {message, ...baseCardProps}: BaseProps = props
  const messageContent: MessageTemplateCardView = JSON.parse(message.content) as MessageTemplateCardView

  // console.log(messageContent.elements)
  // const messageCardType: MessageCardType = messageContent.elements.buttons ?
  //   retrieveMessageCardTypeFromButtons(messageContent.elements.buttons) : MessageCardType.UNKNOWN

  return <CardViewMessageCard key={message.uuid} {...baseCardProps} />
}

export const TextOrEncryptedTextMessageCard: React.FC<BaseProps> = props => {
  const {message, messageContext, encryptedChannelSecret ,...baseCardProps} = props

  if (message.parsedContent === null) {
    return <UnsupportedMessageCard messageContext={messageContext} {...baseCardProps}/>
  }

  const textMessageCardContext: MessageContext<MessageDataParsed> = {
    ...messageContext,
    message: message as MessageDataParsed,
  }

  const textMessageCardProps: TextMessageCardProps = {
    ...baseCardProps,
    messageContext: textMessageCardContext,
    encryptedChannelSecret,
  }

  return <TextMessageCard {...textMessageCardProps}/>
}
