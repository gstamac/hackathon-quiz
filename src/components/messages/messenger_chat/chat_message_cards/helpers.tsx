import { MessageTemplateButtonItem } from '@globalid/messaging-service-sdk'
import { Dispatch } from '@reduxjs/toolkit'
import React, { ReactElement } from 'react'
import ReactHtmlParser from 'react-html-parser'
import { match } from 'react-router-dom'
import { ChannelType, InvitationAction } from '../../../../store/interfaces'
import { getString } from '../../../../utils'
import { MessagesType } from '../../interfaces'
import { ConversationType } from '../delete_message/interfaces'
import { MessageType } from '../interfaces'
import { MessageCardType } from './card_view_message/interfaces'
import { GetMessageAdornmentParams } from './interfaces'

export const getMessageAdornment = ({ message,
  channelType,
  resending,
  adornmentStyle,
  isLastMessage,
  seen,
  onRetry,
  errorMessage,
}: GetMessageAdornmentParams): JSX.Element | null => {
  if (errorMessage) {
    return <div className={adornmentStyle} onClick={onRetry}>{errorMessage}</div>
  }

  if (resending) {
    return <div className={adornmentStyle}>{getString('msg-resending')}</div>
  }

  if (message.errored && message.type !== MessageType.MEDIA && !message.parsedContent?.includes('data:image')) {
    return <div className={adornmentStyle} onClick={onRetry}>{getString('msg-not-delivered')}</div>
  }

  const isDeliveredPersonalLastMessage: boolean = channelType === ChannelType.PERSONAL && message.delivered && isLastMessage

  if (isDeliveredPersonalLastMessage) {
    return seen
      ? <div className={adornmentStyle}>{getString('msg-seen')}</div>
      : <div className={adornmentStyle}>{getString('msg-delivered')}</div>
  }

  return null
}

const perfectUrlRegex: RegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/

export const parseContentWithLinks = (text: string): ReactElement[] => ReactHtmlParser(text.replace(perfectUrlRegex, (capture: string) => (
  `<a data-testid=${capture} href='${capture}' target='_blank'>${capture}</a>`
)))

export const toastHandler = (dispatcher: Dispatch, toastSetter: Function, title: string, message_description?: string): void => {
  dispatcher(toastSetter({
    title: title,
    message: message_description,
  }))
}

export const getConversationTypeFromUrl = (matcher: match<{ type: string }>): string => {
  const buttonSwitch: {
    [key: string]: string
  } = {
    [MessagesType.PRIMARY]: ConversationType.PRIMARY,
    [MessagesType.GROUPS]: ConversationType.GROUP,
    [MessagesType.OTHER]: ConversationType.OTHER,
  }

  return buttonSwitch[matcher.params.type]
}

export const linkComponentDecorator = (href: string, text: string, key: number): JSX.Element => (
  <a href={href} key={key} target='_blank' rel='noopener noreferrer'>
    {text}
  </a>
)

const getChatBeginningText = (name?: string | null): string => `${getString('beginning-history-person-chat-message')} ${name ?? ''}`

const channelTypeBeginningTextMap = new Map<ChannelType, (names?: string | null) => string>([
  [ChannelType.GROUP, () => getString('beginning-history-group-chat-message')],
  [ChannelType.PERSONAL, getChatBeginningText],
  [ChannelType.MULTI, getChatBeginningText],
])

export const getChannelBeginningText = (channelType: ChannelType, combinedGidNames: string | null): string => channelTypeBeginningTextMap.get(channelType)?.(combinedGidNames) ?? ''

const cardTypeToSubstring: { [key: string]: string } = {
  [MessageCardType.GROUP_INVITATION]: 'groups/invitation',
  [MessageCardType.MEETING_INVITATION]: '/call/',
}

export const checkMessageCardType = (buttons: MessageTemplateButtonItem[], messageCardType: string): boolean =>
  !!buttons?.every((button: MessageTemplateButtonItem) => button.cta_link.includes(cardTypeToSubstring[messageCardType]))

export const retrieveMessageCardTypeFromButtons = (buttons: MessageTemplateButtonItem[]): MessageCardType => {
  const type: MessageCardType | undefined =
    Object.values(MessageCardType).find((messageCardType: MessageCardType) => checkMessageCardType(buttons, messageCardType))

  return type ?? MessageCardType.UNKNOWN
}

export const retrieveMessageCardTypeFromLink = (link: string): MessageCardType => {
  const type: MessageCardType | undefined =
    Object.values(MessageCardType).find((messageCardType: MessageCardType) => link.includes(cardTypeToSubstring[messageCardType]))

  return type ?? MessageCardType.UNKNOWN
}

export const rejectOrApproveAction = (link: string): InvitationAction => {
  if (link.includes('accept')) {
    return InvitationAction.APPROVE
  }

  return InvitationAction.REJECT
}
