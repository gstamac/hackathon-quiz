import React from 'react'
import { BaseMessageCardProps } from '../interfaces'
import { useCardViewStyles } from './styles'
import { CardViewMessageContent } from './card_view_message_content'
import { MessageTemplateCardView, MessageCardElement } from '@globalid/messaging-service-sdk'
import { MessageData } from '../../../../../store/interfaces'
import { MessageContextController } from '../message_context_controller'
import { isMessageAuthor } from '../../../helpers'

export const CardViewMessageCard: React.FC<BaseMessageCardProps<MessageData>> = (props: BaseMessageCardProps<MessageData>) => {
  const classes = useCardViewStyles({isAuthor: isMessageAuthor(props.me, props.messageContext)})

  const messageContent: MessageTemplateCardView = JSON.parse(props.messageContext.message.content) as MessageTemplateCardView

  const elements: MessageCardElement = messageContent.elements

  return (
    <MessageContextController {...props}>
      <CardViewMessageContent classes={classes} message={props.messageContext.message}{...elements}/>
    </MessageContextController>
  )
}
