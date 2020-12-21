import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { MessagesType, UseChatContainerResponse } from '../interfaces'
import { ChannelWithParticipantsAndParsedMessage, GroupMemberWithIdentityFields } from '../../../store/interfaces'
import { ChannelPermission } from './interfaces'
import { ChannelPermission as ChannelPermissionSdk} from '@globalid/messaging-service-sdk'
import useAsyncEffect from 'use-async-effect'
import { fetchGroupMember } from '../../../store/groups_slice'
import { ThunkDispatch } from '../../../store'
import { Member } from '@globalid/group-service-sdk'

export const useChatContainer = (type: MessagesType, channel_id: string): UseChatContainerResponse => {

  const dispatch: ThunkDispatch = useDispatch()

  const identity: PublicIdentity | undefined = useSelector((state: RootState) => (
    state.identity.identity
  ))

  const channel: ChannelWithParticipantsAndParsedMessage | undefined =
    useSelector((state: RootState) => state.channels.channels[channel_id]?.channel)

  const groupUuid: string | null | undefined = channel?.group_uuid

  useAsyncEffect(async () => {
    if (groupUuid && identity?.gid_uuid){
      await dispatch(fetchGroupMember({group_uuid: groupUuid, gid_uuid: identity?.gid_uuid}))
    }
  }, [groupUuid, identity?.gid_uuid])

  const members: GroupMemberWithIdentityFields[] | undefined=
    useSelector((state: RootState) => state.groups.members[groupUuid ?? '']?.members)

  const groupMember: GroupMemberWithIdentityFields | undefined = members?.find((member: GroupMemberWithIdentityFields) => member.gid_uuid === identity?.gid_uuid)

  const showOwner: boolean | undefined = useSelector((state: RootState) => groupUuid
    ? state.groups.groups[groupUuid]?.show_owner_name
    : undefined
  )

  const readOnly: boolean =
    channel?.permissions?.some((permission: ChannelPermissionSdk) =>
      permission.name === ChannelPermission.READONLY && permission.value) ?? false

  const hiddenMembers: boolean = useSelector((state: RootState) => (
    groupUuid ?
      state.groups.groups[groupUuid]?.member_visibility === Member.MemberVisibility.hidden &&
      state.groups.groups[groupUuid]?.owner_uuid !== identity?.gid_uuid
      : false
  ))

  if (identity === undefined) {
    return null
  }

  return {
    identity,
    showOwner,
    readOnly: readOnly,
    isHiddenMember: groupMember ? groupMember.is_hidden : false,
    hiddenMembers,
  }
}
