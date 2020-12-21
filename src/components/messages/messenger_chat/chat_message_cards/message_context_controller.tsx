import React, { PropsWithChildren } from 'react'
import {
  ChatMessageHooksResponse,
  MessageStateHookResult,
  BaseMessageCardProps,
  MessageContext,
} from './interfaces'
import { useStyles } from './styles'
import { getMessageAdornment } from './helpers'
import { useChatMessageHooks } from './message_grouping_hooks'
import { useMessageState } from './use_message_state'
import { TimestampTooltip } from '../timestamp_tooltip/timestamp_tooltip'
import { MessageData } from '../../../../store/interfaces'

export const MessageContextController: React.FC<PropsWithChildren<BaseMessageCardProps>> = ({
  messageContext,
  me,
  author,
  admin,
  channelType,
  encryptedChannelSecret,
  seen,
  hideOwner,
  isHiddenMember,
  children,
  hasOptions,
} : PropsWithChildren<BaseMessageCardProps>) => {

  const {
    iAmAuthor,
    avatar,
    displayName,
    timestamp,
    timestampString,
    messageContainerStyle,
    isLastMessage,
  }: ChatMessageHooksResponse = useChatMessageHooks({ messageContext, me, author, admin, hideOwner })

  const { message }: MessageContext<MessageData> = messageContext

  const {
    showUserSettingsIcon,
    hideUserSettingsIcon,
    optionsIcon,
    resendingCircularProgress,
    resendMessage,
    resendingMessage: resending,
    quickMenu,
    deleteMessageDialog,
  }: MessageStateHookResult = useMessageState({
    iAmAuthor,
    message,
    encryptedChannelSecret,
    isHiddenMember,
    hasOptions,
  })

  const showAvatar: boolean = avatar !== null

  const classes = useStyles({
    me: iAmAuthor,
    deleted: message.deleted,
    errorAdornment: resendMessage !== undefined,
    resending,
    renderAvatar: showAvatar,
  })

  return (
    <div onMouseEnter={showUserSettingsIcon} onMouseLeave={hideUserSettingsIcon}
      className={messageContainerStyle}>
      {timestamp}
      <div className={classes.textMessageContainer}>
        {displayName}
        <div className={classes.textMessageContentWithAdornmentContainer}>
          <div className={classes.settingsWrapper}>
            {optionsIcon}
            <TimestampTooltip timestamp={timestampString} messageIsMine={iAmAuthor} showAvatar={showAvatar}>
              <div className={classes.textMessageContentContainer}>
                {avatar}
                <div className={classes.textMessageContent} onClick={resendMessage}>
                  {resendingCircularProgress}
                  {children}
                </div>
              </div>
            </TimestampTooltip>
          </div>
          {iAmAuthor && getMessageAdornment({
            message,
            channelType,
            resending,
            adornmentStyle: classes.adornmentStyle,
            isLastMessage: isLastMessage,
            seen,
            onRetry: resendMessage,
          })}
        </div>
        {quickMenu}
        {deleteMessageDialog}
      </div>
    </div>
  )
}
