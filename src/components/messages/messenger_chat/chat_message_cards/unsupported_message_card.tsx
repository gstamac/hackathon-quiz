import React from 'react'
import { getMessageAdornment } from './helpers'
import { ChatMessageHooksResponse, UnsupportedMessageCardProps, MessageDataParsed, MessageStateHookResult } from './interfaces'
import { useChatMessageHooks } from './message_grouping_hooks'
import { useMessageState } from './use_message_state'
import { unsupportedMessageStyles } from './styles'
import { getString } from '../../../../utils'
import mobileIconWhite from '../../../../assets/icons/mobile-icon-white.svg'
import mobileIconBlue from '../../../../assets/icons/mobile-icon-blue.svg'
import { TimestampTooltip } from '../timestamp_tooltip'

export const UnsupportedMessageCard: React.FC<UnsupportedMessageCardProps> = ({
  admin,
  author,
  me,
  messageContext,
  channelType,
  seen,
  hideOwner,
}: UnsupportedMessageCardProps) => {
  const {
    iAmAuthor,
    avatar,
    timestamp,
    timestampString,
    displayName,
    messageContainerStyle,
    isLastMessage,
  }: ChatMessageHooksResponse = useChatMessageHooks({ messageContext, me, author, admin, hideOwner })

  const message = messageContext.message as MessageDataParsed

  const {
    resendMessage,
  }: MessageStateHookResult = useMessageState({
    iAmAuthor: iAmAuthor,
    message: messageContext.message,
  })

  const showAvatar: boolean = avatar !== null

  const classes = unsupportedMessageStyles({
    me: iAmAuthor,
    deleted: message.deleted,
    errorAdornment: resendMessage !== undefined,
    renderAvatar: showAvatar,
  })

  const mobileIcon: string = iAmAuthor ? mobileIconBlue : mobileIconWhite

  return (
    <div className={messageContainerStyle}>
      {timestamp}
      <div className={classes.textMessageContainer}>
        {displayName}
        <div className={classes.textMessageContentWithAdornmentContainer}>
          <TimestampTooltip timestamp={timestampString} messageIsMine={iAmAuthor} showAvatar={showAvatar}>
            <div className={classes.textMessageContentContainer}>
              {avatar}
              <div className={classes.messageContent}>
                <div className={classes.messageHeader}>
                  <span className={classes.messageHeaderText}>
                    {getString('unsupported-message-type')}
                  </span>
                  <img src={mobileIcon} alt='mobile-icon'/>
                </div>
                <div className={classes.messageTip}>
                  {getString('unsupported-message-type-tip')}
                </div>
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
