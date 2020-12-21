import React from 'react'
import { MessageContext, TextMessageCardProps } from './interfaces'
import { linkComponentDecorator } from './helpers'
import ReactLinkify from 'react-linkify'
import { MessageContextController } from './message_context_controller'
import { MessageData } from '../../../../store/interfaces'

export const TextMessageCard: React.FC<TextMessageCardProps> = (props: TextMessageCardProps) => {

  const { message }: MessageContext<MessageData> = props.messageContext

  return (
    <MessageContextController {...props} hasOptions>
      <ReactLinkify componentDecorator={linkComponentDecorator}>
        {message.parsedContent}
      </ReactLinkify>
    </MessageContextController>
  )
}
