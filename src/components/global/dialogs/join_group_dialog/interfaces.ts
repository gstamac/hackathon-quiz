import { FieldDefinition, InternalFormData } from 'globalid-react-ui'
import { FormDialogProps } from '../interfaces'

export interface JoinGroupDialogProps extends Pick<FormDialogProps,
  'fieldDefinition' | 'formId' | 'onExit' | 'onFormSubmit' | 'open'
> {
  groupName?: string
  switchFieldId: string
}

export interface JoinGroupDialogHookProps {
  groupUuid: string
  isGroupOwner: boolean
  onJoin?: () => void
}

export interface JoinGroupDialogHook {
  closeJoinGroupDialog: () => void
  handleJoinGroupOnFormSubmit: (formData: InternalFormData) => Promise<void>
  joinGroupDialogFieldDefinition: FieldDefinition
  joinGroupDialogFormId: string
  joinGroupDialogOpen: boolean
  joinGroupDialogSwitchFieldId: string
  openJoinGroupDialog: () => void
}
