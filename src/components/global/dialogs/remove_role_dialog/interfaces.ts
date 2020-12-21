import { FormDialogProps } from '../interfaces'

export type RemoveRoleDialogProps = Pick<FormDialogProps, 'onExit' | 'onFormSubmit' | 'open'>

export interface RemoveRoleDialogHookProps {
  groupUuid: string
  roleUuid: string
  roleName: string
}

export interface RemoveRoleDialogHook {
  handleRemoveRoleOnFormSubmit: () => Promise<void>
  isRemoveRoleDialogOpen: boolean
  openRemoveRoleDialog: () => void
  closeRemoveRoleDialog: () => void
}
