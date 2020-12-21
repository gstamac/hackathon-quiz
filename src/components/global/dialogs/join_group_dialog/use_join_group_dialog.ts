/* eslint-disable max-lines-per-function */
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { Identity } from '@globalid/identity-namespace-service-sdk'
import {
  FieldDefinition,
  InternalFormData,
  partiallyUpdateValueObject,
  FormRecord,
} from 'globalid-react-ui'
import { JoinGroupDialogHook, JoinGroupDialogHookProps } from './interfaces'
import { useBooleanState } from '../../../../hooks/use_boolean_state'
import { BooleanState } from '../../../../hooks/interfaces'
import { ThunkDispatch } from '../../../../store'
import { fetchGroupMembers, joinGroupMember } from '../../../../store/groups_slice'

export const useJoinGroupDialog = ({
  groupUuid,
  isGroupOwner,
  onJoin,
}: JoinGroupDialogHookProps): JoinGroupDialogHook => {
  const dispatch: ThunkDispatch = useDispatch()
  const [joinGroupDialogOpen, openJoinGroupDialog, closeJoinGroupDialog]: BooleanState = useBooleanState(false)
  const loggedInIdentity: Identity | undefined = useSelector((state: RootState) => state.identity.identity)

  const formId: string = 'join-group-dialog'
  const switchFieldId: string = 'shown'

  const joinGroupDialogFieldDefinition: FieldDefinition = {
    [switchFieldId]: [],
  }

  const form: FormRecord | undefined = <FormRecord | undefined>useSelector((state: RootState) => state.form.forms[formId])
  const formValueIsReset =
    form?.has_mounted &&
    form.form_data?.values[switchFieldId]?.has_changed !== true &&
    form.form_data?.values[switchFieldId]?.value !== false

  useEffect(() => {
    partiallyUpdateValueObject(formId, switchFieldId, {
      value: true,
      has_changed: true,
    })
  }, [formValueIsReset])

  const handleJoinGroupOnFormSubmit = async (formData: InternalFormData): Promise<void> => {
    const isShown: boolean = <boolean>formData.values[switchFieldId].value
    const isHidden: boolean = !isShown

    if (loggedInIdentity !== undefined) {
      const result = await dispatch(joinGroupMember({
        gid_uuid: loggedInIdentity.gid_uuid,
        group_uuid: groupUuid,
        is_hidden: isHidden,
      }))

      closeJoinGroupDialog()

      const failedToJoin: boolean = 'error' in result

      if (!failedToJoin) {
        await dispatch(fetchGroupMembers({
          group_uuid: groupUuid,
          hasPermission: isGroupOwner,
          page: 1,
        }))

        if (onJoin !== undefined) {
          onJoin()
        }
      }
    }

    closeJoinGroupDialog()
  }

  return {
    closeJoinGroupDialog,
    handleJoinGroupOnFormSubmit,
    joinGroupDialogFieldDefinition,
    joinGroupDialogFormId: formId,
    joinGroupDialogOpen,
    joinGroupDialogSwitchFieldId: switchFieldId,
    openJoinGroupDialog,
  }
}
