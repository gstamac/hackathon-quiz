import React from 'react'
import { BaseMessageCardProps } from '../interfaces'
import { useCardViewStyles } from './styles'
import { CardViewMessageContent } from './card_view_message_content'
import { MessageCardElement } from '@globalid/messaging-service-sdk'
import { MessageData } from '../../../../../store/interfaces'
import { MessageContextController } from '../message_context_controller'
import { isMessageAuthor } from '../../../helpers'
import { MessageTemplateCardViewExt } from './interfaces'

export const CardViewMessageCard: React.FC<BaseMessageCardProps<MessageData>> = (props: BaseMessageCardProps<MessageData>) => {
  const classes = useCardViewStyles({isAuthor: isMessageAuthor(props.me, props.messageContext)})

  const messageContent: MessageTemplateCardViewExt = JSON.parse(props.messageContext.message.content) as MessageTemplateCardViewExt

  const elements: MessageCardElement = messageContent.elements

  return (
    <MessageContextController disabled={messageContent.disabled} {...props}>
      <CardViewMessageContent disabled={messageContent.disabled} countdown_seconds={messageContent.countdown_seconds} classes={classes} message={props.messageContext.message}{...elements}/>
    </MessageContextController>
  )
}
