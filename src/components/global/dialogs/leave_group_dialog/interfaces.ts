import { FormDialogProps } from '../interfaces'

export type LeaveGroupDialogProps = Pick<FormDialogProps, 'onExit' | 'onFormSubmit' | 'open'>

export interface LeaveGroupDialogHookProps {
  groupUuid: string
}

export interface LeaveGroupDialogHook {
  closeLeaveGroupDialog: () => void
  handleLeaveGroupOnFormSubmit: () => Promise<void>
  leaveGroupDialogOpen: boolean
  openLeaveGroupDialog: () => void
}
