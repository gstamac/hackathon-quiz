import { FormDialogProps } from '../interfaces'

export interface RejectInvitationDialogProps extends Pick<FormDialogProps, 'onExit' | 'open'> {
  handleRejectInvitation: () => Promise<void>
}

