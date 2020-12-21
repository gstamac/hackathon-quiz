import React from 'react'
import { useSystemMessageStyles } from './styles'
import { MessageTemplateText } from '@globalid/messaging-service-sdk'

export const SystemMessageCard: React.FC<MessageTemplateText> = (props: MessageTemplateText) => {

  const {
    text,
  } = props

  const classes = useSystemMessageStyles()

  return (
    <div className={`${classes.systemMessageContainer} system`}>
      <div className={classes.systemMessageContent}>
        {text}
      </div>
    </div>
  )
}
