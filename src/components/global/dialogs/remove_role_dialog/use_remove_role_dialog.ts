import { RemoveRoleDialogHookProps, RemoveRoleDialogHook } from './interfaces'
import { useBooleanState } from '../../../../hooks/use_boolean_state'
import { BooleanState } from '../../../../hooks/interfaces'
import { useDispatch } from 'react-redux'
import { removeGroupRole } from '../../../../store/groups_slice'
import { ThunkDispatch } from '../../../../store'

export const useRemoveRoleDialog = (params: RemoveRoleDialogHookProps): RemoveRoleDialogHook => {
  const dispatch: ThunkDispatch = useDispatch()

  const [isRemoveRoleDialogOpen, openRemoveRoleDialog, closeRemoveRoleDialog]: BooleanState = useBooleanState(false)

  const handleRemoveRoleOnFormSubmit = async (): Promise<void> => {
    await dispatch(removeGroupRole(params))
  }

  return {
    handleRemoveRoleOnFormSubmit,
    isRemoveRoleDialogOpen,
    openRemoveRoleDialog,
    closeRemoveRoleDialog,
  }
}
