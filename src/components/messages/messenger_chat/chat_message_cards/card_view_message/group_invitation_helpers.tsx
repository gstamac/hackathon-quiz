import { ThunkDispatch } from '../../../../../store'
import { approveOrRejectInvitation } from '../../../../../store/groups_slice'
import { InvitationAction } from '../../../../../store/interfaces'
import { MessageTemplateButtonItem } from '@globalid/messaging-service-sdk'
import { rejectOrApproveAction } from '../helpers'
import { SetStateAction, Dispatch } from 'react'
import { getUuidFromURL } from '../../../../../utils'

export const handleRejectInvitation = async (
  invitationUuid: string,
  dispatch: ThunkDispatch,
  closeRejectInvitationDialog: () => void
): Promise<void> => {
  await dispatch(approveOrRejectInvitation({
    invitationUuid,
    action: InvitationAction.REJECT,
  }))

  closeRejectInvitationDialog()
}

export const handleInvitationButtonClick = async (
  button: MessageTemplateButtonItem,
  setInvitationUuid: Dispatch<SetStateAction<string>>,
  dispatch: ThunkDispatch,
  openRejectInvitationDialog: () => void
): Promise<void> => {
  const action: InvitationAction = rejectOrApproveAction(button.cta_link)
  const uuid: string | null = getUuidFromURL(button.cta_link)

  if (uuid === null){
    return
  }

  setInvitationUuid(uuid)

  if (action === InvitationAction.APPROVE) {
    await dispatch(approveOrRejectInvitation({
      invitationUuid: uuid,
      action: action,
    }))
  } else {
    openRejectInvitationDialog()
  }
}
