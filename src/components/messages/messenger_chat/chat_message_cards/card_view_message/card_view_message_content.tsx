/* eslint-disable complexity */
import { ButtonState } from 'globalid-react-ui'
import React, { useEffect, useRef, useState } from 'react'
import CameraIcon from '../../../../../assets/icons/camera-grey.svg'
import GroupIcon from '../../../../../assets/icons/group_icon.svg'
import GameIcon from '../../../../../assets/icons/quiz.svg'
import mobileIcon from '../../../../../assets/icons/mobile-icon-white.svg'
import { RejectInvitationDialog } from '../../../../global/dialogs/reject_invitation_dialog'
import { retrieveMessageCardTypeFromButtons } from '../helpers'
import { CardViewMessageButtonsWrapper } from './card_view_message_buttons_wrapper'
import { ButtonElementsState, ButtonTypes, CardViewMessageContentProps, MessageCardType } from './interfaces'
import { useCardViewMessage } from './use_card_view_message'
import ReactHTMLParser from 'react-html-parser'
const useInterval = (callback: ()=>void, delay: number): void => {
  const savedCallback = useRef<()=>void>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    const id = setInterval(() => {
      // @ts-ignore
      savedCallback.current()
    }, delay)

    return () => clearInterval(id)
  }, [delay])
}

export const CardViewMessageContent: React.FC<CardViewMessageContentProps> = ({
  icon,
  title_text,
  primary_text,
  secondary_text,
  buttons,
  classes,
  message,
  disabled,
  countdown_seconds,
}: CardViewMessageContentProps) => {
  const { handleClickToButtons, buttonElementsState, closeRejectInvitationDialog, rejectInvitationDialogOpen, handleRejectInvitation } = useCardViewMessage(message)

  const messageCardType: MessageCardType = buttons || icon?.type ? retrieveMessageCardTypeFromButtons(buttons, icon?.type): MessageCardType.UNKNOWN

  const [counter, setCounter] = useState(countdown_seconds ?? 0)

  useEffect(() => {
    if (countdown_seconds){
      setCounter(countdown_seconds)
    }
  }, [countdown_seconds])

  useInterval(() => {
    if (counter !== 0)
    {setCounter(counter - 1)}
  }, 1000)

  const rightSideIconMap = {
    [MessageCardType.GROUP_INVITATION]: GroupIcon,
    [MessageCardType.MEETING_INVITATION]: CameraIcon,
    [MessageCardType.GAME]: GameIcon,
    [MessageCardType.UNKNOWN]: mobileIcon,
  }

  const iconAltTextMap = {
    [MessageCardType.GROUP_INVITATION]: 'group-icon',
    [MessageCardType.MEETING_INVITATION]: 'camera-icon',
    [MessageCardType.GAME]: 'game-icon',
    [MessageCardType.UNKNOWN]: 'mobile-icon',
  }

  const rightSideIcon: string = icon?.url ? icon.url : rightSideIconMap[messageCardType]

  const buttonStates: ButtonElementsState = disabled ? {
    [ButtonTypes.PRIMARY]: ButtonState.DISABLED,
    [ButtonTypes.SECONDARY]: ButtonState.DISABLED,
    [ButtonTypes.ADDITIONAL]: ButtonState.DISABLED,
  } : buttonElementsState

  return (
    <div className={classes.cardViewMessageContent}>
      <div className={classes.cardViewIconWrapper}>
      {counter !== 0 && <div style={{width: '-webkit-fill-available'}} className={classes.primaryText}>{counter} seconds</div>}
      {icon && <div className={classes.cardViewIcon}>
          <img src={rightSideIcon} alt={iconAltTextMap[messageCardType]} />
        </div>}
      </div>
      {title_text && <div>
        <span className={classes.titleAndSecondaryText}>{ReactHTMLParser(title_text)}</span>
      </div>}
      {primary_text && <div>
        <span className={classes.primaryText}>{ReactHTMLParser(primary_text)}</span>
      </div>}
      {secondary_text && <div>
        <span className={classes.titleAndSecondaryText}>{ReactHTMLParser(secondary_text)}</span>
      </div>}

      <CardViewMessageButtonsWrapper classes={classes} buttons={buttons} onClick={handleClickToButtons}
        buttonElementsState={buttonStates} />

      <RejectInvitationDialog
        open={rejectInvitationDialogOpen}
        onExit={closeRejectInvitationDialog}
        handleRejectInvitation={handleRejectInvitation}
      />
    </div>
  )
}
