import React from 'react'
import {
  BaseMessageCardProps,
  ChatMessageHooksResponse,
  UseImageMessageCardHooksResponse,
  MessageDataParsed,
  MessageMediaType,
  MessageStateHookResult,
} from './interfaces'

import { useChatMessageHooks } from './message_grouping_hooks'
import { getMessageAdornment } from './helpers'

import { useImageMessageCard } from './use_image_message_card'
import { ImageMessageCardComponent } from './image_message_card_components'
import { MessageData } from '../../../../store/interfaces'
import { TimestampTooltip } from '../timestamp_tooltip/timestamp_tooltip'
import { useMessageState } from './use_message_state'

export const ImageMessageCard: React.FC<BaseMessageCardProps<MessageData>> = (props: BaseMessageCardProps<MessageData>) => {

  const {
    messageContext,
    me,
    author,
    admin,
    channelType,
    seen,
    hideOwner,
    encryptedChannelSecret,
    isHiddenMember,
  } = props

  const {
    messageContainerStyle,
    avatar,
    timestamp,
    timestampString,
    displayName,
    iAmAuthor,
    isLastMessage,
  }: ChatMessageHooksResponse = useChatMessageHooks({messageContext, me, author, admin, hideOwner})
  const isMessageMine: boolean = iAmAuthor ?? false
  const message: MessageDataParsed = messageContext.message as MessageDataParsed

  const showAvatar: boolean = avatar !== null

  const {
    classes,
    adornmentProps,
    componentProps,
  }: UseImageMessageCardHooksResponse = useImageMessageCard({
    message,
    type: message.type as MessageMediaType,
    isMessageMine,
    encryptedChannelSecret,
    renderAvatar: showAvatar,
  })

  const {
    quickMenu,
    deleteMessageDialog,
    optionsIcon,
    showUserSettingsIcon,
    hideUserSettingsIcon,
  }: MessageStateHookResult = useMessageState({
    iAmAuthor: iAmAuthor,
    message: messageContext.message,
    encryptedChannelSecret,
    isHiddenMember,
    hasOptions: true,
  })

  return (
    <div className={messageContainerStyle} onMouseEnter={showUserSettingsIcon} onMouseLeave={hideUserSettingsIcon}>
      { timestamp }
      <div className={classes.textMessageContainer}>
        { displayName }
        <div className={classes.imageMessageContentWithAdornmentContainer}>
          <div className={classes.settingsWrapper}>
            {optionsIcon}
            <TimestampTooltip timestamp={timestampString} messageIsMine={iAmAuthor} showAvatar={showAvatar}>
              <div className={classes.imageMessageContentContainer}>
                { avatar }
                <ImageMessageCardComponent {...componentProps} />
              </div>
            </TimestampTooltip>
          </div>
          { (componentProps.isLoadingError || isMessageMine) && getMessageAdornment({
            message,
            channelType,
            resending: adornmentProps.resending,
            adornmentStyle: classes.adornmentStyle,
            isLastMessage: isLastMessage,
            seen,
            onRetry: adornmentProps.onAdornmentClick,
            errorMessage: adornmentProps.errorMessage,
          })}
        </div>
        {quickMenu}
        {deleteMessageDialog}
      </div>
    </div>
  )
}
