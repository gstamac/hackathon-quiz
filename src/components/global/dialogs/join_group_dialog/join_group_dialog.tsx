import React from 'react'
import { Switch } from 'globalid-react-ui'
import { JoinGroupDialogProps } from './interfaces'
import { useStyles } from './styles'
import { FormDialog } from '../form_dialog'
import { getString } from '../../../../utils'

export const JoinGroupDialog: React.FC<JoinGroupDialogProps> = ({
  groupName = 'group',
  switchFieldId,
  ...formDialogProps
}: JoinGroupDialogProps) => {
  const {
    joinGroupDialogTitle,
    joinGroupDialogDescription,
    joinGroupDialogSwitchWrapper,
    joinGroupDialogInputSwitch,
  } = useStyles()

  const joinGroupDialogSubtitle: string = getString('join-group-dialog-subtitle').replace('{group}', groupName)

  return (
    <FormDialog
      title={getString('join-group-title')}
      formSubmitButtonText={getString('join-group-button')}
      showCancelButton={true}
      {...formDialogProps}
    >
      <div className={joinGroupDialogTitle}>{joinGroupDialogSubtitle}</div>
      <div className={joinGroupDialogSwitchWrapper}>
        <div className={joinGroupDialogDescription}>
          {getString('join-group-visibility-description')}
        </div>
        <div className={joinGroupDialogInputSwitch}>
          <Switch fieldId={switchFieldId}/>
        </div>
      </div>
    </FormDialog>
  )
}
