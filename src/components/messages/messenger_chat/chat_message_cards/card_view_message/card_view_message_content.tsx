import React from 'react'
import CameraIcon from '../../../../../assets/icons/camera-grey.svg'
import GroupIcon from '../../../../../assets/icons/group_icon.svg'
import mobileIcon from '../../../../../assets/icons/mobile-icon-white.svg'
import { RejectInvitationDialog } from '../../../../global/dialogs/reject_invitation_dialog'
import { retrieveMessageCardTypeFromButtons } from '../helpers'
import { CardViewMessageButtonsWrapper } from './card_view_message_buttons_wrapper'
import { CardViewMessageContentProps, MessageCardType } from './interfaces'
import { useCardViewMessage } from './use_card_view_message'

export const CardViewMessageContent: React.FC<CardViewMessageContentProps> = ({ icon, title_text, primary_text, secondary_text, buttons, classes, channelId }: CardViewMessageContentProps) => {
  const { handleClickToButtons, buttonElementsState, closeRejectInvitationDialog, rejectInvitationDialogOpen, handleRejectInvitation } = useCardViewMessage(channelId)

  const messageCardType: MessageCardType = buttons ? retrieveMessageCardTypeFromButtons(buttons): MessageCardType.UNKNOWN

  const rightSideIconMap = {
    [MessageCardType.GROUP_INVITATION]: GroupIcon,
    [MessageCardType.MEETING_INVITATION]: CameraIcon,
    [MessageCardType.UNKNOWN]: mobileIcon,
  }

  const iconAltTextMap = {
    [MessageCardType.GROUP_INVITATION]: 'group-icon',
    [MessageCardType.MEETING_INVITATION]: 'camera-icon',
    [MessageCardType.UNKNOWN]: 'mobile-icon',
  }

  const rightSideIcon: string = icon?.url ? icon.url : rightSideIconMap[messageCardType]

  return (
    <div className={classes.cardViewMessageContent}>
      {icon && <div className={classes.cardViewIconWrapper}>
        <div className={classes.cardViewIcon}>
          <img src={rightSideIcon} alt={iconAltTextMap[messageCardType]} />
        </div>
      </div>}
      {title_text && <div>
        <span className={classes.titleAndSecondaryText}>{title_text}</span>
      </div>}
      {primary_text && <div>
        <span className={classes.primaryText}>{primary_text}</span>
      </div>}
      {secondary_text && <div>
        <span className={classes.titleAndSecondaryText}>{secondary_text}</span>
      </div>}

      <CardViewMessageButtonsWrapper classes={classes} buttons={buttons} onClick={handleClickToButtons}
        buttonElementsState={buttonElementsState} />

      <RejectInvitationDialog
        open={rejectInvitationDialogOpen}
        onExit={closeRejectInvitationDialog}
        handleRejectInvitation={handleRejectInvitation}
      />
    </div>
  )
}
