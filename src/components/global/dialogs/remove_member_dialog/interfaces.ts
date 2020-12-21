import { RemoveGroupMemberParams } from '../../../../store/interfaces'
import { FormDialogProps } from '../interfaces'

export interface RemoveMemberDialogProps extends Pick<FormDialogProps, 'onExit' | 'open'> {
  handleRemoveMember: () => Promise<void>
  gidName: string
}

export type RemoveMemberHookProps = RemoveGroupMemberParams

export interface RemoveMemberHookResult {
  openRemoveMemberDialog: () => void
  closeRemoveMemberDialog: () => void
  handleRemoveMember: () => Promise<void>
  removeMemberDialogOpen: boolean
}
