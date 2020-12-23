import { useState } from 'react'
import { MessageTemplateButtonItem } from '@globalid/messaging-service-sdk'
import { ButtonElementsState, ButtonTypes, UseCardViewMessageHookResult, MessageCardType, MessageTemplateCardViewExt } from './interfaces'
import { ButtonState, setToastError, setToastSuccess } from 'globalid-react-ui'
import { retrieveMessageCardTypeFromLink } from '../helpers'
import { useBooleanState } from '../../../../../hooks/use_boolean_state'
import { BooleanState } from '../../../../../hooks/interfaces'
import { useDispatch } from 'react-redux'
import { ThunkDispatch } from '../../../../../store'
import { handleRejectInvitation as handleRejectInvitationHelper, handleInvitationButtonClick } from './group_invitation_helpers'
import { handleMeetingButtonClick } from './meeting_helpers'
import { postAnswer } from '../../../../../services/api/game_api'
import { isAxiosError, storeMessage } from '../../../../../utils'
import { MessageData } from '../../../../../store/interfaces'
export const handleAnswerClick = async (
  button: MessageTemplateButtonItem,
  message: MessageData,
  dispatch: ThunkDispatch,
): Promise<void> => {
  try {
    const link = button.cta_link

    updateCard(message)
    await postAnswer(link)
    dispatch(setToastSuccess({
      title: 'Your answer has been sent!',
    }))
  } catch (error) {
    if (isAxiosError(error))
    {
      dispatch(setToastError({
        title: error.response?.data.message,
      }))
    }
  }
}

const updateCard = (message: MessageData): void => {
  const content: MessageTemplateCardViewExt = JSON.parse(message.content)

  const newContent: MessageTemplateCardViewExt = {
    ...content,
    elements: {
      ...content.elements,
      disabled: true,
      buttons: content.elements.buttons?.map(x=>({
        ...x,
        mode: 'ADDITIONAL'
      })) ?? []
    }
  }

  const newMessage: MessageData = {
    ...message,
    content: JSON.stringify(newContent),
  }

  storeMessage(message.channel_id, newMessage)
}

export const useCardViewMessage = (message: MessageData): UseCardViewMessageHookResult => {
  const [rejectInvitationDialogOpen, openRejectInvitationDialog, closeRejectInvitationDialog]: BooleanState = useBooleanState(false)
  const [invitationUuid, setInvitationUuid] = useState<string>('')

  const dispatch: ThunkDispatch = useDispatch()

  const [buttonElementsState, setButtonState] = useState<ButtonElementsState>({
    [ButtonTypes.PRIMARY]: ButtonState.DEFAULT,
    [ButtonTypes.SECONDARY]: ButtonState.DEFAULT,
    [ButtonTypes.ADDITIONAL]: ButtonState.DEFAULT,
  })

  const cardTypeToActionMap: {
    [key: string]:
    (button: MessageTemplateButtonItem) => Promise<void>
  } = {
    [MessageCardType.GROUP_INVITATION]:  async (button: MessageTemplateButtonItem) =>
      handleInvitationButtonClick(button, setInvitationUuid, dispatch, openRejectInvitationDialog),
    [MessageCardType.MEETING_INVITATION]:  async (button: MessageTemplateButtonItem) =>
      handleMeetingButtonClick(message.channel_id, button, dispatch),
    [MessageCardType.GAME]:  async (button: MessageTemplateButtonItem) =>
      handleAnswerClick(button, message, dispatch),
  }

  const handleClickToButtons = async (button: MessageTemplateButtonItem): Promise<void> => {
    setButtonState((prev: ButtonElementsState) => ({
      ...prev,
      [button.mode]: ButtonState.INPROGRESS,
    }))

    const messageCardType: MessageCardType = retrieveMessageCardTypeFromLink(button.cta_link)

    await cardTypeToActionMap[messageCardType](button)

    setButtonState((prev: ButtonElementsState) => ({
      ...prev,
      [button.mode]: ButtonState.DEFAULT,
    }))
  }

  return {
    handleClickToButtons,
    buttonElementsState,
    handleRejectInvitation: async () => handleRejectInvitationHelper(invitationUuid, dispatch, closeRejectInvitationDialog),
    openRejectInvitationDialog,
    closeRejectInvitationDialog,
    rejectInvitationDialogOpen,
  }
}
