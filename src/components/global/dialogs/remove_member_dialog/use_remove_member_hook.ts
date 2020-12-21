import { useDispatch } from 'react-redux'
import { useBooleanState } from '../../../../hooks/use_boolean_state'
import { BooleanState } from '../../../../hooks/interfaces'
import { ThunkDispatch } from '../../../../store'
import { RemoveMemberHookResult, RemoveMemberHookProps } from './interfaces'
import { removeGroupMember } from '../../../../store/groups_slice'

export const useRemoveMemberHook = (props: RemoveMemberHookProps): RemoveMemberHookResult => {
  const dispatch: ThunkDispatch = useDispatch()
  const [removeMemberDialogOpen, openRemoveMemberDialog, closeRemoveMemberDialog]: BooleanState = useBooleanState(false)

  const handleRemoveMember = async (): Promise<void> => {
    await dispatch(removeGroupMember(props))
    closeRemoveMemberDialog()
  }

  return {
    handleRemoveMember,
    openRemoveMemberDialog,
    removeMemberDialogOpen,
    closeRemoveMemberDialog,
  }
}
