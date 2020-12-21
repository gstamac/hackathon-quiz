import { FormDialog } from '../../../global'
import React from 'react'
import { getString } from '../../../../utils'
import { useStyles } from './styles'
import { RejectInvitationDialogProps } from './interfaces'

export const RejectInvitationDialog: React.FC<RejectInvitationDialogProps> = ({ handleRejectInvitation, open, onExit }: RejectInvitationDialogProps) => {
  const {
    rejectInvitationDialogTitle,
    rejectInvitationDialogDescription,
  } = useStyles()

  return <FormDialog
    fieldDefinition={{}}
    formId='reject-invitation-dialog'
    formSubmitButtonText={getString('reject-invitation-dialog-accept')}
    onExit={onExit}
    onFormSubmit={handleRejectInvitation}
    open={open}
    showCancelButton={true}
    formCancelButtonText={getString('reject-invitation-dialog-decline')}
    title={getString('reject-invitation-dialog-header')}
  >
    <div className={rejectInvitationDialogTitle}>{getString('reject-invitation-dialog-title')}</div>
    <div className={rejectInvitationDialogDescription}>{getString('reject-invitation-dialog-description')}</div>
  </FormDialog>
}
