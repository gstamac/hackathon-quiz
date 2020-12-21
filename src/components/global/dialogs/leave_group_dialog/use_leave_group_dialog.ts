import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { Identity } from '@globalid/identity-namespace-service-sdk'
import { LeaveGroupDialogHook, LeaveGroupDialogHookProps } from './interfaces'
import { useBooleanState } from '../../../../hooks/use_boolean_state'
import { BooleanState } from '../../../../hooks/interfaces'
import { ThunkDispatch } from '../../../../store'
import { leaveGroup } from '../../../../store/groups_slice'

export const useLeaveGroupDialog = ({
  groupUuid,
}: LeaveGroupDialogHookProps): LeaveGroupDialogHook => {
  const dispatch: ThunkDispatch = useDispatch()

  const [leaveGroupDialogOpen, openLeaveGroupDialog, closeLeaveGroupDialog]: BooleanState = useBooleanState(false)
  const loggedInIdentity: Identity | undefined = useSelector((state: RootState) => state.identity.identity)

  const handleLeaveGroupOnFormSubmit = async (): Promise<void> => {
    if (loggedInIdentity !== undefined) {
      await dispatch(leaveGroup({
        group_uuid: groupUuid,
        gid_uuid: loggedInIdentity.gid_uuid,
      }))
    }
    closeLeaveGroupDialog()
  }

  return {
    closeLeaveGroupDialog,
    handleLeaveGroupOnFormSubmit,
    leaveGroupDialogOpen,
    openLeaveGroupDialog,
  }
}
