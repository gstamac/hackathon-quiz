import { FormDialog } from '../../../global'
import React from 'react'
import { getString } from '../../../../utils'
import { useStyles } from './styles'
import { RemoveMemberDialogProps } from './interfaces'

export const RemoveMemberDialog: React.FC<RemoveMemberDialogProps> = ({ gidName, handleRemoveMember, open, onExit }: RemoveMemberDialogProps) => {
  const {
    removeMemberDialogTitle,
    removeMemberDialogDescription,
  } = useStyles()

  return <FormDialog
    fieldDefinition={{}}
    formId='delete-group-dialog'
    formSubmitButtonText={getString('remove-member-dialog-confirm-action')}
    onExit={onExit}
    onFormSubmit={handleRemoveMember}
    open={open}
    showCancelButton={true}
    formCancelButtonText={getString('remove-member-dialog-cancel-action')}
    title={getString('remove-member-dialog-header-title')}
  >
    <div className={removeMemberDialogTitle}>{getString('remove-member-dialog-title').replace('{user}', gidName)}</div>
    <div className={removeMemberDialogDescription}>{getString('remove-member-dialog-description')}</div>
  </FormDialog>
}
