import React from 'react'
import { LeaveGroupDialogProps } from './interfaces'
import { useStyles } from './styles'
import { FormDialog } from '../form_dialog'
import { getString } from '../../../../utils'

export const LeaveGroupDialog: React.FC<LeaveGroupDialogProps> = (
  formDialogProps: LeaveGroupDialogProps
) => {
  const classes = useStyles()

  return (
    <FormDialog
      fieldDefinition={{}}
      formId={'leave-group-dialog'}
      formSubmitButtonText={getString('leave-group-dialog-confirm-action')}
      showCancelButton={true}
      title={getString('leave-group-dialog-title')}
      {...formDialogProps}
    >
      <div className={classes.leaveGroupDialogDescription}>
        {getString('leave-group-dialog-description')}
      </div>
    </FormDialog>
  )
}
