import React from 'react'
import { RemoveRoleDialogProps } from './interfaces'
import { FormDialog } from '../form_dialog'
import { getString } from '../../../../utils'
import { useStyles } from './styles'

export const RemoveRoleDialog: React.FC<RemoveRoleDialogProps> = (
  formDialogProps: RemoveRoleDialogProps
) => {
  const classes = useStyles()

  return <FormDialog
    fieldDefinition={{}}
    formId={'remove-role-dialog'}
    formSubmitButtonText={getString('remove-role-dialog-confirm-action')}
    showCancelButton={true}
    formCancelButtonText={getString('remove-role-dialog-cancel-action')}
    title={getString('remove-role-dialog-title')}
    submitButtonColor={'secondary'}
    {...formDialogProps}
  >
    <div className={classes.removeRoleDialogDescription}>
      {getString('remove-role-dialog-description')}
    </div>
  </FormDialog>
}
