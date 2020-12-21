import React from 'react'
import { getMessageContent, getString } from '../../../../utils'
import { getMessageAdornment } from './helpers'
import { BaseMessageCardProps, ChatMessageHooksResponse } from './interfaces'
import { useStyles } from './styles'
import { useChatMessageHooks } from './message_grouping_hooks'
import { MessageTemplateText } from '@globalid/messaging-service-sdk'
import { MessageData } from '../../../../store/interfaces'
import { TimestampTooltip } from '../timestamp_tooltip/timestamp_tooltip'

export const DeletedMessageCard: React.FC<BaseMessageCardProps<MessageData>> = (props: BaseMessageCardProps<MessageData>) => {

  const {
    messageContext,
    me,
    author,
    admin,
    channelType,
    seen,
    hideOwner,
  } = props

  const {
    avatar,
    displayName,
    timestamp,
    timestampString,
    deletedByMe,
    iAmAuthor,
    isLastMessage,
    messageContainerStyle,
  }: ChatMessageHooksResponse = useChatMessageHooks({messageContext, me, author, admin, hideOwner})

  const message: MessageData = messageContext.message

  const showAvatar: boolean = avatar !== null

  const classes = useStyles({
    me: iAmAuthor ?? false,
    deleted: true,
    errorAdornment: !message.delivered,
    renderAvatar: showAvatar,
  })

  const content: MessageTemplateText | null = getMessageContent(message)

  if (content === null) {
    return null
  }

  const contentText: string = deletedByMe
    ? getString('you-deleted-msg')
    : content.text

  return (

    <div className={messageContainerStyle}>
      { timestamp }
      <div className={classes.textMessageContainer}>
        { displayName }
        <div className={classes.textMessageContentWithAdornmentContainer}>
          <TimestampTooltip timestamp={timestampString} messageIsMine={iAmAuthor} showAvatar={showAvatar}>
            <div className={classes.textMessageContentContainer}>
              { avatar }
              <div className={classes.textMessageContent}>
                { contentText }
              </div>
            </div>
          </TimestampTooltip>
          {iAmAuthor && getMessageAdornment({
            message,
            channelType,
            resending: false,
            adornmentStyle: classes.adornmentStyle,
            isLastMessage: isLastMessage,
            seen,
          })}
        </div>
      </div>
    </div>
  )
}
