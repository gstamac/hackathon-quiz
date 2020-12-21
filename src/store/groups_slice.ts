/* eslint-disable max-lines */
import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
  Slice,
} from '@reduxjs/toolkit'
import { RootState } from 'RootType'
import {
  FulfilledAction,
  RejectedAction,
  KeyValuePayload,
  GroupsSlice,
  GlobalGroups,
  GroupMembers,
  GroupMemberWithIdentityFields,
  GroupMembersResponse,
  GroupMembersParams,
  GroupDataByFolderType,
  GroupsFolderType,
  FetchGroupsSearchParams,
  FetchGroupsParams,
  GroupDataByType,
  JoinGroupParams,
  RemoveGroupMemberParams,
  ApproveOrRejectInvitationParams,
  InvitationAction,
  FetchGroupsByUUIDsParams,
  FetchGroupsByUUIDsResult,
  ChannelsSlice,
  ChannelWithParticipantsAndParsedMessage,
  AsyncThunkReturnAction,
  FetchChannelProps,
  ThunkAPI,
  SearchGroupsState,
  GroupAction,
  RemoveGroupRoleParams,
  ResignGroupMemberRoleParams,
  GroupRoleMembersParams,
  RoleMembers,
  ManageMemberRoleParams,
} from './interfaces'
import {
  GroupsResponse,
  GroupParams,
  MemberResponse,
  MembersResponse,
  PaginationMetaParams,
  MemberParams,
  InvitationUpdateResponse,
  RolesForMemberParams,
  RolesForMemberResponse,
  PermissionListResponse,
  MembersForRoleResponse,
  AssignmentResponse,
  RoleResponse,
  GroupResponse,
  RoleListItem,
  InvitationLinks,
  InvitationLinkResponse,
  InvitationLinkParams,
  Group,
  GroupUuidParam,
  Member,
} from '@globalid/group-service-sdk'
import {
  getGroups,
  getGroup,
  getMembers,
  removeMembership,
  releaseGroup,
  searchGroups,
  joinGroup,
  approveInvitation,
  rejectInvitation,
  getRolesForMember,
  removeRole,
  getGroupsByUUID,
  getMember,
  getMembersForRole,
  getGroupRoles,
  getGroupPermissions,
  assignRole,
  removeRoleAssignment,
  getInvitationLinks,
  createInvitationLink, removeInvitationLink,
} from '../services/api/groups_api'
import { getIdentitiesList, getIdentityPublic } from '../services/api'
import { Identity } from '@globalid/identity-namespace-service-sdk'
import { setToastError, setToastSuccess } from 'globalid-react-ui'
import {
  ERR_INVITATION_ALREADY_ACCEPTED,
  ERR_INVITATION_ALREADY_REJECTED,
  FETCH_GROUP_MEMBER_ROLES,
  FETCH_GROUP_MEMBERS,
  REMOVE_GROUP_MEMBER_ROLE,
  RESET_STORE_ACTION,
  GROUPS_PER_PAGE,
  GROUP_MEMBERS_PER_PAGE,
  FETCH_GROUP_ROLE_MEMBERS,
  GROUP_ROLE_MEMBERS_PER_PAGE,
  FETCH_GROUP_PERMISSIONS,
  FETCH_ASSIGN_ROLES_TO_GROUP_MEMBER,
  FETCH_UNASSIGN_ROLES_TO_GROUP_MEMBER,
} from '../constants'
import { getString, getStringWithText, handleAddItemMetaUpdate } from '../utils'
import { ThunkDispatch } from './store'
import { fetchChannel } from '../store/channels_slice/channels_slice'
import { getMappedGroupMemberRoles } from './groups_selectors'

export const getFetchingPageKey = (type: string, page?: number): string => `${type}-page-${page ?? 1}`
export const getSearchFetchingPageKey = (myGroups: boolean, text: string, page?: number): string => `${myGroups}-${text}-page-${page ?? 1}`
export const getFetchingInvitationLinksKey = (groupUuid: string): string => `${groupUuid}-fetch-invitation-links`
export const getCreatingInvitationLinkKey = (groupUuid: string): string => `${groupUuid}-create-invitation-link`
export const getDeleteInvitationLinkKey = (groupUuid: string): string => `${groupUuid}-delete-invitation-link`

const initialState: GroupsSlice = {
  isFetching: {},
  groups: {},
  roles: {},
  roleMembers: {},
  members: {},
  memberRoles: {},
  groupPermissions: {},
  invitationLinks: {},
  [GroupsFolderType.MY_GROUPS]: {
    groupUuids: undefined,
    meta: undefined,
  },
  [GroupsFolderType.DISCOVER]: {
    groupUuids: undefined,
    meta: undefined,
  },
  messaging: {
    groupUuids: undefined,
    meta: undefined,
  },
  search: {},
  error: {},
  searchText: undefined,
}

const actionSwitch: {
  [key: string]:
    (uuid: string) => Promise<InvitationUpdateResponse>
} = {
  [InvitationAction.APPROVE]: async (uuid: string) => approveInvitation(uuid),
  [InvitationAction.REJECT]: async (uuid: string) => rejectInvitation(uuid),
}

export const approveOrRejectInvitation = createAsyncThunk(
  'groups/approveOrRejectInvitation',
  async (
    params: ApproveOrRejectInvitationParams,
    thunkAPI
  ): Promise<InvitationUpdateResponse> => {
    thunkAPI.dispatch(setIsFetching({
      key: params.invitationUuid,
      value: true,
    }))

    try {
      const response: InvitationUpdateResponse = await actionSwitch[params.action](params.invitationUuid)

      return response
    } catch (error) {
      const errorMessage: string = error.response?.data?.message

      if (errorMessage && [ERR_INVITATION_ALREADY_ACCEPTED, ERR_INVITATION_ALREADY_REJECTED].includes(errorMessage)) {

        thunkAPI.dispatch(setToastSuccess({
          title: getString('approve-reject-invitation-no-action-needed'),
          message: getString('approve-reject-invitation-no-action-needed-description'),
        }))
      } else {
        thunkAPI.dispatch(setToastError({
          title: getString('approve-reject-invitation-error'),
          message: getString('approve-reject-invitation-error-description'),
        }))
      }

      throw error
    }
  }, {
    condition: (params: ApproveOrRejectInvitationParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups

      return !groupsState.isFetching[params.invitationUuid]
    },
  }
)

export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (
    params: FetchGroupsParams,
    thunkAPI
  ): Promise<GroupsResponse> => {
    thunkAPI.dispatch(setIsFetching({
      key: getFetchingPageKey(params.type, params.queryParams.page),
      value: true,
    }))

    return getGroups(params.type, params.queryParams)
  }, {
    condition: (params: FetchGroupsParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups

      return !groupsState.isFetching[getFetchingPageKey(params.type, params.queryParams.page)]
    },
  }
)

export const fetchGroupsByUUIDs = createAsyncThunk<FetchGroupsByUUIDsResult, FetchGroupsByUUIDsParams, ThunkAPI>(
  'groups/fetchGroupsByUUIDs',
  async (
    params: FetchGroupsByUUIDsParams,
    { dispatch }
  ): Promise<FetchGroupsByUUIDsResult> => {
    dispatch(setIsFetching({
      key: 'fetchGroupsByUUIDs',
      value: true,
    }))

    const groups: GroupResponse[] = await getGroupsByUUID(params.groupUuids)
    const groupUuids: string[] = groups.map((group: GroupResponse) => group.uuid)

    const totalCount: number = params.meta.total - params.groupUuids.length + groupUuids.length

    return {
      groupUuids,
      groups,
      meta: {
        ...params.meta,
        total: totalCount,
      },
      isJoined: params.isJoined,
    }
  }, {
    condition: (params: FetchGroupsByUUIDsParams, { getState }) => {
      const groupsState: GroupsSlice = getState().groups

      return !groupsState.isFetching[getFetchingPageKey('messaging', params.meta.page)]
    },
  }
)

export const fetchGroupsSearch = createAsyncThunk(
  'groups/fetchGroupsSearch',
  async (
    params: FetchGroupsSearchParams,
    thunkAPI
  ): Promise<GroupsResponse> => {
    const {
      text,
      myGroups,
      page,
    }: FetchGroupsSearchParams = params

    thunkAPI.dispatch(setSearchText(text))

    thunkAPI.dispatch(setIsFetching({
      key: getSearchFetchingPageKey(myGroups, text, page),
      value: true,
    }))

    return searchGroups(
      text,
      myGroups,
      page
    )
  }, {
    condition: (params: FetchGroupsSearchParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups

      const {
        text,
        myGroups,
        page,
      }: FetchGroupsSearchParams = params

      return !groupsState.isFetching[getSearchFetchingPageKey(myGroups, text, page)]
    },
  }
)

export const fetchGroup = createAsyncThunk(
  'groups/fetchGroup',
  async (
    params: GroupParams,
    thunkAPI
  ): Promise<GroupResponse> => {
    thunkAPI.dispatch(setIsFetching({
      key: params.group_uuid,
      value: true,
    }))

    return getGroup(params.group_uuid)
  }, {
    condition: (params: GroupParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups

      return !groupsState.isFetching[params.group_uuid] && groupsState.groups[params.group_uuid] === undefined
    },
  }
)

const getGroupRolesKey = (groupUuid: string): string => `group-roles-${groupUuid}`

export const fetchGroupRoles = createAsyncThunk(
  'groups/fetchGroupRoles',
  async (
    groupUuid: string,
    thunkAPI
  ): Promise<RoleListItem[]> => {
    thunkAPI.dispatch(setIsFetching({
      key: getGroupRolesKey(groupUuid),
      value: true,
    }))

    return (await getGroupRoles(groupUuid)).roles
  }, {
    condition: (groupUuid: string, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups

      return !groupsState.isFetching[getGroupRolesKey(groupUuid)] &&
        groupsState.groups[groupUuid] !== undefined
    },
  }
)

const combineIdentitiesWithGroupMembers = (
  members: MemberResponse[],
  identities: Identity[],
): GroupMemberWithIdentityFields[] => members.map((member: MemberResponse) => {
  const identity: Identity | undefined =
    identities.find((item: Identity) => item.gid_uuid === member.gid_uuid)

  if (identity === undefined) {
    throw new Error('ERR_MEMBER_IDENTITY_NOT_LOADED')
  }

  return {
    ...identity,
    ...member,
    gid_name: identity.gid_name,
    display_name: identity.display_name,
    display_image_url: identity.display_image_url,
  }
})

export const fetchGroupMembers = createAsyncThunk(
  'groups/fetchGroupMembers',
  async (
    params: GroupMembersParams,
    thunkAPI
  ): Promise<GroupMembersResponse> => {
    thunkAPI.dispatch(setIsFetching({
      key: `${params.group_uuid}${FETCH_GROUP_MEMBERS}`,
      value: true,
    }))

    const membersResponse: MembersResponse = await getMembers(params.group_uuid, params.page)
    const gidUuids = membersResponse.data.map((member: MemberResponse) => member.gid_uuid)

    if (gidUuids.length !== 0) {
      const identities: Identity[] = await getIdentitiesList(gidUuids)

      return {
        members: combineIdentitiesWithGroupMembers(membersResponse.data, identities),
        meta: membersResponse.meta,
      }
    }

    return { members: [], meta: membersResponse.meta }
  }, {
    condition: ({ group_uuid, page, hasPermission = true }: GroupMembersParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState>thunkAPI.getState()).groups

      const groupMemberVisibility: Member.MemberVisibility | undefined = groupsState.groups[group_uuid]?.member_visibility

      const notHidden: boolean = groupMemberVisibility !== Member.MemberVisibility.hidden
      const members: GroupMemberWithIdentityFields[] | undefined = groupsState.members[group_uuid]?.members

      const notAlreadyFetched: boolean = (members?.length ?? 0) < page * GROUP_MEMBERS_PER_PAGE

      return notAlreadyFetched && (!groupsState.isFetching[`${group_uuid}${FETCH_GROUP_MEMBERS}`] && (hasPermission || notHidden))
    },
  }
)

export const fetchGroupMember = createAsyncThunk(
  'groups/fetchGroupMember',
  async (
    params: MemberParams,
    thunkAPI
  ): Promise<GroupMemberWithIdentityFields> => {
    thunkAPI.dispatch(setIsFetching({
      key: `${params.group_uuid}-${params.gid_uuid}`,
      value: true,
    }))

    const memberResponse: MemberResponse = await getMember(params)

    const identity: Identity = await getIdentityPublic({ gid_uuid: params.gid_uuid })

    const memberIdentity: GroupMemberWithIdentityFields
      = combineIdentitiesWithGroupMembers([memberResponse], [identity])[0]

    return memberIdentity
  }, {
    condition: (params: MemberParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups

      return !groupsState.isFetching[`${params.group_uuid}-${params.gid_uuid}`]
    },
  }
)

const removeMembershipOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  condition: (params: MemberParams, { getState }: any) => {
    const groupsState: GroupsSlice = (<RootState> getState()).groups

    return !groupsState.isFetching[`${params.group_uuid}${params.gid_uuid}`]
  },
}

const resetRemoveMembershipFetchStatus = (
  state: GroupsSlice,
  action: FulfilledAction<GroupMembersResponse, MemberParams> | RejectedAction<MemberParams>
): void => {
  state.isFetching[`${action.meta.arg.group_uuid}${action.meta.arg.gid_uuid}`] = false
}

export const removeGroupMember = createAsyncThunk(
  'groups/removeGroupMember',
  async ({
    gidName,
    groupName,
    ...params
  }: RemoveGroupMemberParams, { dispatch }): Promise<void> => {
    dispatch(setIsFetching({
      key: `${params.group_uuid}${params.gid_uuid}`,
      value: true,
    }))

    try {
      await removeMembership(params)

      dispatch(setToastSuccess({
        title: getString('remove-member-toast-success-title'),
        message: getString('remove-member-toast-success-description')
          .replace('{user}', gidName)
          .replace('{group}', groupName ?? ''),
      }))
    } catch (error) {
      dispatch(setToastError({
        title: getString('remove-member-toast-failed-title'),
        message: getString('remove-member-toast-failed-description'),
      }))

      throw error
    }

  },
  removeMembershipOptions,
)

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (params: MemberParams, thunkAPI): Promise<void> => {
    thunkAPI.dispatch(setIsFetching({
      key: `${params.group_uuid}${params.gid_uuid}`,
      value: true,
    }))

    try {
      await removeMembership(params)

      thunkAPI.dispatch(setToastSuccess({
        title: getString('leave-group-toast-success-title'),
        message: getString('leave-group-toast-success-description'),
      }))
    } catch (error) {
      thunkAPI.dispatch(setToastError({
        title: getString('leave-group-toast-failed-title'),
        message: getString('leave-group-toast-failed-description'),
      }))

      throw error
    }
  },
  removeMembershipOptions,
)

export const removeGroup = createAsyncThunk(
  'groups/removeGroup',
  async (
    params: GroupParams,
    thunkAPI
  ): Promise<void> => {
    try {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups

      await releaseGroup(params)

      thunkAPI.dispatch(setToastSuccess({
        title: getString('delete-group-success-title'),
        message: getString('delete-group-success-description').replace(
          '{user}',
          `${groupsState.groups[params.group_uuid]?.gid_name}`
        ),
      }))
    } catch (error) {
      thunkAPI.dispatch(setToastError({
        title: getString('delete-group-error-title'),
        message: getString('delete-group-error-description'),
      }))

      throw error
    }
  }
)

export const joinGroupMember = createAsyncThunk(
  'groups/joinGroupMember',
  async (
    params: JoinGroupParams,
    thunkAPI
  ): Promise<void> => {
    try {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups
      const groupGidName: string | undefined = groupsState.groups[params.group_uuid]?.gid_name

      await joinGroup(params.group_uuid, params.is_hidden)

      thunkAPI.dispatch(setToastSuccess({
        title: getString('join-group-toast-success-title'),
        message: getString('join-group-toast-success-description').replace(
          '{group}',
          `${groupGidName}`
        ),
      }))
    } catch (error) {
      thunkAPI.dispatch(setToastError({
        title: getString('join-group-toast-error-title'),
        message: getString('join-group-toast-error-description'),
      }))

      throw error
    }
  }
)

export const fetchGroupMemberRoles = createAsyncThunk(
  'groups/fetchGroupMemberRoles',
  async (
    params: RolesForMemberParams,
    thunkAPI
  ): Promise<RolesForMemberResponse | undefined> => {
    try {
      thunkAPI.dispatch(setIsFetching({
        key: `${params.group_uuid}${params.gid_uuid}${FETCH_GROUP_MEMBER_ROLES}`,
        value: true,
      }))

      const response: RolesForMemberResponse = await getRolesForMember(params)

      return response
    } catch (error) {
      thunkAPI.dispatch(setToastError({
        title: getString('fetch-member-roles-failed-title'),
        message: getString('something-went-wrong'),
      }))

      throw error
    }
  },
  {
    condition: (params: RolesForMemberParams, thunkAPI) => {
      const groupsState = (<RootState> thunkAPI.getState()).groups
      const isFetchingMember: boolean | undefined = groupsState.isFetching[`${params.group_uuid}${params.gid_uuid}${FETCH_GROUP_MEMBER_ROLES}`]

      return !isFetchingMember
    },
  }
)

export const fetchGroupRoleMembers = createAsyncThunk(
  'groups/fetchGroupRoleMembers',
  async (
    params: GroupRoleMembersParams,
    thunkAPI
  ): Promise<RoleMembers> => {
    const { group_uuid, role_uuid, page }: GroupRoleMembersParams = params

    thunkAPI.dispatch(setIsFetching({
      key: `${group_uuid}${role_uuid}${FETCH_GROUP_ROLE_MEMBERS}`,
      value: true,
    }))

    const roleMembersResponse: MembersForRoleResponse = await getMembersForRole({
      group_uuid,
      role_uuid,
    }, page)

    const roleMembersUuids: string[] = roleMembersResponse.members.map((member: MemberResponse) => member.gid_uuid)

    return { members: roleMembersUuids, meta: roleMembersResponse.meta }
  }, {
    condition: ({ group_uuid, role_uuid, page }: GroupRoleMembersParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups

      const roleMembers: string[] | undefined = groupsState.roleMembers[role_uuid]?.members
      const notAlreadyFetched: boolean = (roleMembers?.length ?? 0) < page * GROUP_ROLE_MEMBERS_PER_PAGE

      return notAlreadyFetched && !groupsState.isFetching[`${group_uuid}${role_uuid}${FETCH_GROUP_ROLE_MEMBERS}`]
    },
  }
)

export const removeGroupRole = createAsyncThunk(
  'groups/removeGroupRole',
  async (params: RemoveGroupRoleParams, { dispatch }): Promise<void> => {
    dispatch(setIsFetching({
      key: `${params.groupUuid}${params.roleUuid}${REMOVE_GROUP_MEMBER_ROLE}`,
      value: true,
    }))

    try {
      await removeRole({ group_uuid: params.groupUuid, role_uuid: params.roleUuid })

      dispatch(setToastSuccess({
        title: getString('remove-role-toast-success-title'),
        message: getString('remove-role-toast-success-description').replace('{role}', params.roleName),
      }))
    } catch (error) {
      dispatch(setToastError({
        title: getString('remove-role-toast-error-title'),
        message: getString('remove-role-toast-error-description'),
      }))

      throw error
    }
  },
)

export const removeGroupMemberRoleAssignment = createAsyncThunk(
  'groups/removeGroupMemberRoleAssignment',
  async ({
    roleName,
    isLoggedUserProfile,
    gidName,
    ...params
  }: ResignGroupMemberRoleParams, { dispatch }): Promise<void> => {
    dispatch(setIsFetching({
      key: `${params.groupUuid}${params.gidUuid}${FETCH_UNASSIGN_ROLES_TO_GROUP_MEMBER}`,
      value: true,
    }))
    try {
      await removeRoleAssignment({ group_uuid: params.groupUuid, role_uuid: params.roleUuid, gid_uuid: params.gidUuid })
      await dispatch(fetchGroupMemberRoles({ group_uuid: params.groupUuid, gid_uuid: params.gidUuid }))

      const toastTitle: string = isLoggedUserProfile ? getString('successfully-resigned-role-title') :
        getString('successfully-unassigned-role-title')
      const toastDescription: string = isLoggedUserProfile ?
        getString('successfully-resigned-role-description')
          .replace('{role-name}', roleName) : getString('successfully-unassigned-role-description')
          .replace('{gid-name}', gidName)
          .replace('{role-name}', roleName)

      dispatch(setToastSuccess({
        title: toastTitle,
        message: toastDescription,
      }))
    } catch (error) {
      dispatch(setToastError({
        title: isLoggedUserProfile ? getString('fail-resigned-title') : getString('fail-unassigned-title'),
        message: getString('something-went-wrong'),
      }))

      throw error
    }

  },
)

export const fetchGroupPermissions = createAsyncThunk(
  'groups/fetchGroupPermissions',
  async (
    params: GroupParams,
    thunkAPI
  ): Promise<PermissionListResponse | undefined> => {
    try {
      thunkAPI.dispatch(setIsFetching({
        key: `${params.group_uuid}${FETCH_GROUP_PERMISSIONS}`,
        value: true,
      }))

      const response: PermissionListResponse = await getGroupPermissions(params.group_uuid)

      return response
    } catch (error) {
      thunkAPI.dispatch(setToastError({
        title: getString('fetch-group-permission-failed-title'),
        message: getString('something-went-wrong'),
      }))

      throw error
    }

  }, {
    condition: (params: GroupParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups
      const permissionsLength: number | undefined = groupsState.groupPermissions[params.group_uuid]?.length

      return !groupsState.isFetching[`${params.group_uuid}${FETCH_GROUP_PERMISSIONS}`] && (permissionsLength === undefined || permissionsLength === 0)
    },
  }
)

const fetchGroupForChannel = async (
  dispatch: ThunkDispatch,
  groupsState: GroupsSlice,
  groupUuid: string
): Promise<string> => {
  const groupIsUndefined: boolean = groupsState.groups[groupUuid] === undefined

  if (groupIsUndefined) {
    await dispatch(fetchGroup({ group_uuid: groupUuid }))
  }

  return groupUuid
}

export const updateGroupMessagingList = createAsyncThunk<string, string, ThunkAPI>(
  'groups/updateGroupMessagingList',
  async (
    channelId: string,
    { getState, dispatch },
  ): Promise<string> => {
    const channelsState: ChannelsSlice = getState().channels
    const groupsState: GroupsSlice = getState().groups

    const channelFromStore: ChannelWithParticipantsAndParsedMessage | undefined = (
      channelsState.channels[channelId]?.channel
    )

    if (channelFromStore !== undefined && channelFromStore.group_uuid) {
      return fetchGroupForChannel(dispatch, groupsState, channelFromStore.group_uuid)
    }

    const fetchChannelAction: AsyncThunkReturnAction<ChannelWithParticipantsAndParsedMessage, FetchChannelProps> = (
      await dispatch(fetchChannel({ channelId: channelId }))
    )

    const fulfilledAction: FulfilledAction<ChannelWithParticipantsAndParsedMessage, FetchChannelProps> = (
      <FulfilledAction<ChannelWithParticipantsAndParsedMessage, FetchChannelProps>> fetchChannelAction
    )

    if (fetchChannelAction.type === fetchChannel.fulfilled.type
      && fulfilledAction.payload.group_uuid
    ) {
      return fetchGroupForChannel(
        dispatch,
        groupsState,
        fulfilledAction.payload.group_uuid
      )
    }

    throw new Error('ERR_NOT_GROUP_CHANNEL')
  }
)

export const assignRolesToGroupMember = createAsyncThunk(
  'groups/assignRolesToGroupMember',
  async (
    params: ManageMemberRoleParams,
    thunkAPI
  ): Promise<AssignmentResponse[]> => {
    thunkAPI.dispatch(setIsFetching({
      key: `${params.groupUuid}${params.gidUuid}${FETCH_ASSIGN_ROLES_TO_GROUP_MEMBER}`,
      value: true,
    }))

    try {
      return Promise.all(params.roleUuids.map(async (roleUuid: string) =>
        assignRole(roleUuid, params.groupUuid, params.gidUuid)
      ))
    } catch (error) {
      thunkAPI.dispatch(setToastError({
        title: getString('roles-not-updated'),
        message: getString('something-went-wrong'),
      }))

      throw error
    }
  },
  {
    condition: (params: ManageMemberRoleParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups
      const isAssigningMembers: boolean | undefined = groupsState.isFetching[`${params.groupUuid}${params.gidUuid}${FETCH_ASSIGN_ROLES_TO_GROUP_MEMBER}`]

      return !isAssigningMembers && params.roleUuids.length > 0
    },
  }
)

export const unassignRolesToGroupMember = createAsyncThunk(
  'groups/unassignRolesToGroupMember',
  async (
    params: ManageMemberRoleParams,
    thunkAPI
  ): Promise<RoleListItem[]> => {
    thunkAPI.dispatch(setIsFetching({
      key: `${params.groupUuid}${params.gidUuid}${FETCH_UNASSIGN_ROLES_TO_GROUP_MEMBER}`,
      value: true,
    }))

    try {
      await Promise.all(params.roleUuids.map(
        async (roleUuid: string) => removeRoleAssignment({
          role_uuid: roleUuid,
          group_uuid: params.groupUuid,
          gid_uuid: params.gidUuid,
        })
      ))

      thunkAPI.dispatch(setToastSuccess({
        title: getString('changes-saved'),
        message: getStringWithText('assigned-changes-saved-description', [
          {
            match: 'user',
            replace: (<RootState> thunkAPI.getState()).identities.identities[params.gidUuid]?.gid_name ?? '',
          },
        ]),
      }))

      const groupsState: GroupsSlice = (<RootState>thunkAPI.getState()).groups
      const roles: RoleListItem[] | undefined = groupsState.memberRoles[`${params.groupUuid}${params.gidUuid}`]

      return roles !== undefined ? roles.filter((role: RoleListItem) => !params.roleUuids.includes(role.uuid)) : []

    } catch (error) {
      thunkAPI.dispatch(setToastError({
        title: getString('roles-not-updated'),
        message: getString('something-went-wrong'),
      }))

      throw error
    }
  },
  {
    condition: (params: ManageMemberRoleParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups
      const isUnassigningMembers: boolean | undefined = groupsState.isFetching[`${params.groupUuid}${params.gidUuid}${FETCH_UNASSIGN_ROLES_TO_GROUP_MEMBER}`]

      return !isUnassigningMembers
    },
  }
)

export const fetchGroupInvitationLinks = createAsyncThunk<InvitationLinks, GroupUuidParam, ThunkAPI>(
  'groups/fetchGroupInvitationLinks',
  async (
    { group_uuid }: GroupUuidParam,
    { dispatch }
  ): Promise<InvitationLinks> => {
    dispatch(setIsFetching({
      key: getFetchingInvitationLinksKey(group_uuid),
      value: true,
    }))

    try {
      const response: InvitationLinks = await getInvitationLinks(group_uuid)

      return response
    } catch (error) {
      dispatch(setToastError({
        title: getString('fetch-group-invitation-links-failed-title'),
        message: getString('something-went-wrong'),
      }))

      throw error
    }
  },
  {
    condition: ({ group_uuid }: GroupUuidParam, { getState }) => {
      const groupsState: GroupsSlice = getState().groups
      const currentGroupLinks: InvitationLinkResponse[] | undefined = groupsState.invitationLinks[group_uuid]

      const hasNotBeenFetched: boolean = currentGroupLinks === undefined

      const fetchStatusKey: string = getFetchingInvitationLinksKey(group_uuid)
      const isNotCurrentlyFetching: boolean = groupsState.isFetching[fetchStatusKey] !== true

      return hasNotBeenFetched && isNotCurrentlyFetching
    },
  }
)

export const createGroupInvitationLink = createAsyncThunk<InvitationLinkResponse, GroupUuidParam, ThunkAPI>(
  'groups/createGroupInvitationLink',
  async (
    { group_uuid }: GroupUuidParam,
    { dispatch }
  ): Promise<InvitationLinkResponse> => {
    dispatch(setIsFetching({
      key: getCreatingInvitationLinkKey(group_uuid),
      value: true,
    }))

    try {
      const response: InvitationLinkResponse = await createInvitationLink(group_uuid)

      return response
    } catch (error) {
      dispatch(setToastError({
        title: getString('create-group-invitation-link-failed-title'),
        message: getString('something-went-wrong'),
      }))

      throw error
    }
  },
  {
    condition: ({ group_uuid }: GroupUuidParam, { getState }) => {
      const groupsState: GroupsSlice = getState().groups
      const currentGroupLinks: InvitationLinkResponse[] | undefined = groupsState.invitationLinks[group_uuid]

      const hasNotBeenCreated: boolean = currentGroupLinks === undefined || currentGroupLinks.length === 0

      const fetchStatusKey: string = getCreatingInvitationLinkKey(group_uuid)
      const isNotCurrentlyCreating: boolean = groupsState.isFetching[fetchStatusKey] !== true

      return hasNotBeenCreated && isNotCurrentlyCreating
    },
  }
)

export const deleteGroupInvitationLink = createAsyncThunk(
  'groups/deleteGroupInvitationLink',
  async (
    params: InvitationLinkParams,
    thunkAPI
  ): Promise<void> => {
    thunkAPI.dispatch(setIsFetching({
      key: getDeleteInvitationLinkKey(params.group_uuid),
      value: true,
    }))

    try {
      await removeInvitationLink(params)

      thunkAPI.dispatch(setToastSuccess({
        title: getString('invitation-link-deleted'),
      }))
    } catch (error) {
      thunkAPI.dispatch(setToastError({
        title: getString('delete-invitation-link-failed-title'),
        message: getString('something-went-wrong'),
      }))

      throw error
    }
  },
  {
    condition: (params: InvitationLinkParams, thunkAPI) => {
      const groupsState: GroupsSlice = (<RootState> thunkAPI.getState()).groups
      const currentGroupLinks: InvitationLinkResponse[] | undefined = groupsState.invitationLinks[params.group_uuid]
      const isDeleteingLink: boolean | undefined = groupsState.isFetching[getDeleteInvitationLinkKey(params.group_uuid)]

      return (currentGroupLinks && currentGroupLinks.length > 0) || !isDeleteingLink
    },
  }
)

const concatGroupUuid = (state: string[], uuid: string): string[] => {
  if (state.includes(uuid)) {
    return state
  }

  return [...state, uuid]
}

const concatMembers = (
  baseList: GroupMemberWithIdentityFields[],
  list: GroupMemberWithIdentityFields[]
): GroupMemberWithIdentityFields[] => {
  const filteredNewList: GroupMemberWithIdentityFields[] = list.filter((member: GroupMemberWithIdentityFields) => (
    !baseList.some((existingMember: GroupMemberWithIdentityFields) => member.gid_uuid === existingMember.gid_uuid)
  ))

  return [...baseList, ...filteredNewList]
}

const getGroupDataByType = (
  groups: GroupResponse[],
  initialValue: GroupDataByType
): GroupDataByType => groups.reduce((
  groupDataByType: GroupDataByType,
  group: GroupResponse,
): GroupDataByType => ({
  groups: {
    ...groupDataByType.groups,
    [group.uuid]: group,
  },
  groupUuids: concatGroupUuid(groupDataByType.groupUuids, group.uuid),
}), initialValue)

const setGroupIsJoined = (
  group: GroupResponse | undefined,
  is_joined: boolean,
): GroupResponse | undefined => (
  group !== undefined ? {
    ...group,
    is_joined,
  } : undefined
)

const removeMembersByUuid = (groupUuid: string, { [groupUuid]: _, ...members }: GroupMembers): GroupMembers => members
const removeGroupByUuid = (groupUuid: string, { [groupUuid]: _, ...groups }: GlobalGroups): GlobalGroups => groups

const removeMemberFromGroup = (
  response: GroupMembersResponse | undefined,
  groupUuid: string,
  memberUuid: string
): GroupMembersResponse => {
  const members: GroupMemberWithIdentityFields[] | undefined = response?.members
  const meta: PaginationMetaParams | undefined = response?.meta
  const filteredMembers: GroupMemberWithIdentityFields[] | undefined =
    members?.filter((member: GroupMemberWithIdentityFields) => member.gid_uuid !== memberUuid)

  return {
    members: filteredMembers !== undefined ? [...filteredMembers] : [],
    meta: {
      ...meta,
      total: meta?.total !== undefined && meta.total > 0 ? meta.total - 1 : 0,
    },
  }
}

const removeGroupForFolderTypeByUuid = (groupData: GroupDataByFolderType, groupUuid: string): GroupDataByFolderType => {
  const groupUuids: string[] | undefined = groupData.groupUuids
  const meta: PaginationMetaParams | undefined = groupData.meta
  const filteredGroupUuids: string[] | undefined = groupUuids?.filter((uuid: string) => uuid !== groupUuid)

  return {
    groupUuids: filteredGroupUuids !== undefined ? [...filteredGroupUuids] : [],
    meta: {
      ...meta,
      total: meta?.total !== undefined && meta.total > 0 ? meta.total - 1 : 0,
    },
  }
}

const addGroupForFolderTypeByUuid = (groupData: GroupDataByFolderType, groupUuid: string): GroupDataByFolderType => {
  const groupUuids: string[] | undefined = groupData.groupUuids
  const meta: PaginationMetaParams | undefined = groupData.meta

  return {
    groupUuids: groupUuids !== undefined ? [groupUuid, ...groupUuids] : [groupUuid],
    meta: {
      ...meta,
      total: meta?.total !== undefined ? meta.total + 1 : 1,
    },
  }
}

const addNonIncludedGroupToFolderStart = (
  state: GroupsSlice,
  group: GroupResponse,
  groupFolder: GroupsFolderType
): void => {
  if (groupNotIncluded(state[groupFolder].groupUuids, group.uuid)) {
    state[groupFolder].groupUuids =
      addGroupToStart(group.uuid, state[groupFolder].groupUuids)
  }
}

const addNonIncludedGroupToListEnd = (
  groupData: GroupDataByFolderType,
  group: GroupResponse,
): GroupDataByFolderType => {
  if (groupNotIncluded(groupData.groupUuids, group.uuid) && groupData.meta !== undefined) {
    const groupUuids: string[] = concatGroupUuid(groupData.groupUuids ?? [], group.uuid)

    const meta: PaginationMetaParams = handleAddItemMetaUpdate(groupData.meta, GROUPS_PER_PAGE)

    return {
      groupUuids,
      meta,
    }
  }

  return groupData
}

const handleRemoveMyGroup = (state: GroupsSlice, groupUuid: string): void => {
  state[GroupsFolderType.MY_GROUPS] = removeGroupForFolderTypeByUuid(state[GroupsFolderType.MY_GROUPS], groupUuid)
}

const handleRemoveGroup = (state: GroupsSlice, groupUuid: string, updateDiscoveryTab: boolean): void => {
  state.messaging = removeGroupForFolderTypeByUuid(state.messaging, groupUuid)
  handleRemoveMyGroup(state, groupUuid)

  state.groupPermissions[groupUuid] = []

  if (updateDiscoveryTab) {
    state.members = removeMembersByUuid(groupUuid, state.members)
    state.groups = removeGroupByUuid(groupUuid, state.groups)
    state[GroupsFolderType.DISCOVER] = removeGroupForFolderTypeByUuid(state[GroupsFolderType.DISCOVER], groupUuid)
  }
}

const groupNotIncluded = (groupUuids: string[] | undefined, groupUuid: string): boolean =>
  groupUuids === undefined || !groupUuids.includes(groupUuid)

const addGroupToStart = (groupUuid: string, groupUuids: string[] | undefined): string[] =>
  [groupUuid, ...groupUuids ?? []]

const filterGroupOut = (groupUuid: string, groupUuids: string[] | undefined): string[] | undefined =>
  groupUuids?.filter((uuid: string) => uuid !== groupUuid)

const updateSearchResults = (
  state: SearchGroupsState | undefined,
  groupUuid: string,
  action: GroupAction
): GroupDataByFolderType | undefined => {
  if (state) {
    const searchMyGroups: GroupDataByFolderType = {
      groupUuids: action === GroupAction.JOIN ?
        addGroupToStart(groupUuid, state.myGroups?.groupUuids) :
        filterGroupOut(groupUuid, state.myGroups?.groupUuids),
      meta: state.myGroups?.meta,
    }

    return searchMyGroups
  }
}

const groupsSlice: Slice<GroupsSlice> = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setSearchText (state: GroupsSlice, action: PayloadAction<string>) {
      state.searchText = action.payload
    },
    setIsFetching (state: GroupsSlice, action: PayloadAction<KeyValuePayload<boolean>>) {
      state.isFetching[action.payload.key] = action.payload.value
    },
    setGroup (state: GroupsSlice, action: PayloadAction<KeyValuePayload<GroupResponse>>) {
      state.groups[action.payload.key] = action.payload.value
    },
    setGroupRoles (state: GroupsSlice, action: PayloadAction<KeyValuePayload<RoleListItem[]>>) {
      state.roles[action.payload.key] = action.payload.value
    },
    addGroupRole (state: GroupsSlice, action: PayloadAction<KeyValuePayload<RoleListItem>>) {
      state.roles[action.payload.key] = (state.roles[action.payload.key] ?? []).concat(action.payload.value)
    },
    updateGroupRole (state: GroupsSlice, action: PayloadAction<KeyValuePayload<RoleListItem>>) {
      const updatedRole: RoleListItem = action.payload.value

      state.roles[action.payload.key] =
        (state.roles[action.payload.key] ?? [])
          .map((role: RoleListItem) => role.uuid === updatedRole.uuid ? updatedRole : role)
    },
    setGroupForFolders (
      state: GroupsSlice,
      action: PayloadAction<{ group: GroupResponse, groupFolderTypes: GroupsFolderType[] }>
    ) {
      state.groups[action.payload.group.uuid] = action.payload.group

      action.payload.groupFolderTypes
        .forEach((groupFolderType: GroupsFolderType) =>
          addNonIncludedGroupToFolderStart(state, action.payload.group, groupFolderType))

      state.messaging = addNonIncludedGroupToListEnd(state.messaging, action.payload.group)
    },
    removeGroupFromStore (state: GroupsSlice, action: PayloadAction<string>) {
      handleRemoveGroup(state, action.payload, true)
    },
    removeMyGroupAndMessagingChannel (state: GroupsSlice, action: PayloadAction<string>) {
      handleRemoveGroup(state, action.payload, false)
      state.messaging = removeGroupForFolderTypeByUuid(state.messaging, action.payload)
    },
  },
  extraReducers: {
    [RESET_STORE_ACTION]: (
      state: GroupsSlice
    ) => {
      Object.assign(state, initialState)
    },
    [approveOrRejectInvitation.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<InvitationUpdateResponse, ApproveOrRejectInvitationParams>
    ) => {
      state.isFetching[action.meta.arg.invitationUuid] = false

      const isApproveAction: boolean = action.meta.arg.action === InvitationAction.APPROVE

      if (isApproveAction && groupNotIncluded(state[GroupsFolderType.MY_GROUPS].groupUuids, action.payload.group_uuid)) {
        state[GroupsFolderType.MY_GROUPS].groupUuids =
          addGroupToStart(action.payload.group_uuid, state[GroupsFolderType.MY_GROUPS].groupUuids)
      }
    },
    [approveOrRejectInvitation.rejected.type]: (
      state: GroupsSlice,
      action: RejectedAction<ApproveOrRejectInvitationParams>
    ) => {
      state.isFetching[action.meta.arg.invitationUuid] = false
    },
    [fetchGroups.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<GroupsResponse, FetchGroupsParams>
    ) => {

      const {
        groups,
        groupUuids,
      }: GroupDataByType = getGroupDataByType(action.payload.data, {
        groups: state.groups,
        groupUuids: state[action.meta.arg.type].groupUuids ?? [],
      })

      state.groups = groups
      state[action.meta.arg.type] = {
        groupUuids,
        meta: action.payload.meta,
      }

      state.isFetching[getFetchingPageKey(action.meta.arg.type, action.meta.arg.queryParams.page)] = false
      state.error[action.meta.arg.type] = false
    },
    [fetchGroups.rejected.type]: (state: GroupsSlice, action: RejectedAction<FetchGroupsParams>) => {
      state.isFetching[getFetchingPageKey(action.meta.arg.type, action.meta.arg.queryParams.page)] = false
      state.error[action.meta.arg.type] = true
    },
    [fetchGroupRoles.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<RoleListItem[], string>
    ) => {
      state.roles[action.meta.arg] = action.payload
      state.isFetching[getGroupRolesKey(action.meta.arg)] = false
    },
    [fetchGroupRoles.rejected.type]: (state: GroupsSlice, action: RejectedAction<string>) => {
      state.isFetching[getGroupRolesKey(action.meta.arg)] = false
    },
    [fetchGroupsByUUIDs.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<FetchGroupsByUUIDsResult, FetchGroupsByUUIDsParams>
    ) => {
      const { groups: _groups, groupUuids, meta, isJoined }: FetchGroupsByUUIDsResult = action.payload

      const groups: GlobalGroups = _groups.reduce((
        globalGroups: GlobalGroups,
        group: GroupResponse,
      ): GlobalGroups => ({
        ...globalGroups,
        [group.uuid]: { ...group, is_joined: group.is_joined ?? isJoined },
      }), state.groups)

      state.groups = groups
      state.messaging = {
        groupUuids: groupUuids.reduce(concatGroupUuid, state.messaging.groupUuids ?? []),
        meta,
      }

      state.isFetching.fetchGroupsByUUIDs = false
      state.error.fetchGroupsByUUIDs = false
    },
    [fetchGroupsByUUIDs.rejected.type]: (state: GroupsSlice, _action: RejectedAction<FetchGroupsByUUIDsParams>) => {
      state.isFetching.fetchGroupsByUUIDs = false
      state.error.fetchGroupsByUUIDs = true
    },
    [fetchGroup.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<GroupResponse, GroupParams>
    ) => {
      state.groups[action.meta.arg.group_uuid] = action.payload
      state.isFetching[action.meta.arg.group_uuid] = false
    },
    [fetchGroup.rejected.type]: (state: GroupsSlice, action: RejectedAction<GroupParams>) => {
      state.isFetching[action.meta.arg.group_uuid] = false
    },
    [fetchGroupMembers.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<GroupMembersResponse, GroupParams>
    ) => {
      const data: GroupMembersResponse = {
        members: [],
        meta: {
          total: 0,
        },
      }

      if (action.payload.meta.page === 1) {
        data.meta = action.payload.meta
        data.members = action.payload.members
      } else {
        const existingMembers: GroupMemberWithIdentityFields[] = state.members[action.meta.arg.group_uuid]?.members ?? []

        data.meta = action.payload.meta
        data.members = concatMembers(existingMembers, action.payload.members)
      }
      state.members[action.meta.arg.group_uuid] = data
      state.isFetching[`${action.meta.arg.group_uuid}${FETCH_GROUP_MEMBERS}`] = false
    },
    [fetchGroupMembers.rejected.type]: (state: GroupsSlice, action: RejectedAction<GroupParams>) => {
      state.isFetching[`${action.meta.arg.group_uuid}${FETCH_GROUP_MEMBERS}`] = false
    },
    [fetchGroupMember.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<GroupMemberWithIdentityFields, MemberParams>
    ) => {
      const { group_uuid, gid_uuid }: MemberParams = action.meta.arg
      const data: GroupMembersResponse = state.members[group_uuid] ?? {
        members: [],
        meta: {
          total: 0,
        },
      }

      data.members = concatMembers(data.members, [action.payload])

      state.members[group_uuid] = data

      state.isFetching[`${group_uuid}-${gid_uuid}`] = false
    },
    [fetchGroupMember.rejected.type]: (state: GroupsSlice, action: RejectedAction<MemberParams>) => {
      const { group_uuid, gid_uuid }: MemberParams = action.meta.arg

      state.isFetching[`${group_uuid}-${gid_uuid}`] = false
    },
    [leaveGroup.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<GroupMembersResponse, MemberParams>
    ) => {
      const groupUuid: string = action.meta.arg.group_uuid
      const memberUuid: string = action.meta.arg.gid_uuid

      const searchText: string | undefined = state.searchText

      if (searchText) {
        const searchResult: SearchGroupsState | undefined = state.search[searchText]

        const updatedSearchResults: GroupDataByFolderType | undefined =
          updateSearchResults(searchResult, groupUuid, GroupAction.LEAVE)

        state.search[searchText] = {
          ...state.search[searchText],
          myGroups: updatedSearchResults,
        }
      }

      if (state.groups[groupUuid]?.group_visibility === Group.GroupVisibility.hidden) {
        state.groups = removeGroupByUuid(groupUuid, state.groups)
        state.members = removeMembersByUuid(groupUuid, state.members)
      } else {
        state.groups[groupUuid] = setGroupIsJoined(state.groups[groupUuid], false)
        state.members[groupUuid] = removeMemberFromGroup(state.members[groupUuid], groupUuid, memberUuid)
      }
      state[GroupsFolderType.MY_GROUPS] = removeGroupForFolderTypeByUuid(state[GroupsFolderType.MY_GROUPS], groupUuid)
      state.messaging = removeGroupForFolderTypeByUuid(state.messaging, groupUuid)

      resetRemoveMembershipFetchStatus(state, action)
    },
    [leaveGroup.rejected.type]: resetRemoveMembershipFetchStatus,
    [removeGroupMember.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<GroupMembersResponse, MemberParams>
    ) => {
      const groupUuid: string = action.meta.arg.group_uuid
      const memberUuid: string = action.meta.arg.gid_uuid

      state.members[groupUuid] = removeMemberFromGroup(state.members[groupUuid], groupUuid, memberUuid)

      resetRemoveMembershipFetchStatus(state, action)
    },
    [removeGroupMember.rejected.type]: resetRemoveMembershipFetchStatus,
    [removeGroup.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<void, GroupParams>
    ) => {
      handleRemoveGroup(state, action.meta.arg.group_uuid, true)
    },
    [fetchGroupsSearch.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<GroupsResponse, FetchGroupsSearchParams>
    ) => {
      const {
        myGroups: searchMyGroups,
        page,
        text,
      }: FetchGroupsSearchParams = action.meta.arg

      const fetchingGroupsUuids: string[] | undefined = action.meta.arg.keepFetchedGroups ?
        searchMyGroups
          ? state.search[text]?.myGroups?.groupUuids
          : state.search[text]?.global?.groupUuids
        : undefined

      const {
        groups,
        groupUuids,
      }: GroupDataByType = getGroupDataByType(action.payload.data, {
        groups: state.groups,
        groupUuids: fetchingGroupsUuids ?? [],
      })

      const searchGroupMeta: GroupDataByFolderType = {
        groupUuids,
        meta: action.payload.meta,
      }

      state.groups = groups

      if (searchMyGroups) {
        state.search[text] = {
          ...state.search[text],
          myGroups: searchGroupMeta,
        }
      } else {
        state.search[text] = {
          ...state.search[text],
          global: searchGroupMeta,
        }
      }

      const searchKey: string = getSearchFetchingPageKey(searchMyGroups, text, page)

      state.isFetching[searchKey] = false
      state.error[searchKey] = false
    },
    [fetchGroupsSearch.rejected.type]: (state: GroupsSlice, action: RejectedAction<FetchGroupsSearchParams>) => {
      const {
        myGroups: searchMyGroups,
        page,
        text,
      }: FetchGroupsSearchParams = action.meta.arg

      const searchKey: string = getSearchFetchingPageKey(searchMyGroups, text, page)

      state.isFetching[searchKey] = false
      state.error[searchKey] = true
    },
    [joinGroupMember.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<RolesForMemberResponse, JoinGroupParams>
    ) => {
      const groupUuid: string = action.meta.arg.group_uuid

      const searchText: string | undefined = state.searchText

      if (searchText) {
        const searchResult: SearchGroupsState | undefined = state.search[searchText]

        const updatedSearchResults: GroupDataByFolderType | undefined =
          updateSearchResults(searchResult, groupUuid, GroupAction.JOIN)

        state.search[searchText] = {
          ...state.search[searchText],
          myGroups: updatedSearchResults,
        }
      }

      state.groups[groupUuid] = setGroupIsJoined(state.groups[groupUuid], true)
      state[GroupsFolderType.MY_GROUPS] = addGroupForFolderTypeByUuid(state[GroupsFolderType.MY_GROUPS], groupUuid)
      state.messaging = addGroupForFolderTypeByUuid(state.messaging, groupUuid)
    },
    [updateGroupMessagingList.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<string, string>
    ) => {
      state.messaging.groupUuids = [
        action.payload,
        ...state.messaging.groupUuids?.filter((groupUuid: string) => groupUuid !== action.payload) ?? [],
      ]
    },
    [fetchGroupMemberRoles.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<RolesForMemberResponse, RolesForMemberParams>
    ) => {
      const { group_uuid, gid_uuid }: RolesForMemberParams = action.meta.arg

      state.memberRoles[`${group_uuid}${gid_uuid}`] = action.payload.roles

      state.isFetching[`${group_uuid}${gid_uuid}${FETCH_GROUP_MEMBER_ROLES}`] = false
    },
    [fetchGroupMemberRoles.rejected.type]: (state: GroupsSlice, action: RejectedAction<RolesForMemberParams>) => {
      const { group_uuid, gid_uuid }: RolesForMemberParams = action.meta.arg

      state.memberRoles[`${group_uuid}${gid_uuid}`] = []
      state.isFetching[`${group_uuid}${gid_uuid}${FETCH_GROUP_MEMBER_ROLES}`] = false
    },
    [fetchGroupPermissions.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<PermissionListResponse, GroupParams>
    ) => {
      const { group_uuid }: GroupParams = action.meta.arg

      state.groupPermissions[group_uuid] = action.payload.data
      state.isFetching[`${action.meta.arg.group_uuid}${FETCH_GROUP_PERMISSIONS}`] = false
    },
    [fetchGroupPermissions.rejected.type]: (state: GroupsSlice, action: RejectedAction<GroupParams>) => {
      const { group_uuid }: GroupParams = action.meta.arg

      state.groupPermissions[group_uuid] = []
      state.isFetching[`${action.meta.arg.group_uuid}${FETCH_GROUP_PERMISSIONS}`] = false
    },
    [removeGroupRole.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<void, RemoveGroupRoleParams>
    ) => {
      const groupUuid: string = action.meta.arg.groupUuid
      const roleUuid: string = action.meta.arg.roleUuid

      state.roles[groupUuid] = (state.roles[groupUuid] ?? [])
        .filter((role: RoleListItem) => role.uuid !== roleUuid)
      state.isFetching[`${groupUuid}${roleUuid}${REMOVE_GROUP_MEMBER_ROLE}`] = false
    },
    [removeGroupRole.rejected.type]: (
      state: GroupsSlice,
      action: RejectedAction<RemoveGroupRoleParams>
    ) => {
      const groupUuid: string = action.meta.arg.groupUuid
      const roleUuid: string = action.meta.arg.roleUuid

      state.isFetching[`${groupUuid}${roleUuid}${REMOVE_GROUP_MEMBER_ROLE}`] = false
    },
    [fetchGroupRoleMembers.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<RoleMembers, GroupRoleMembersParams>
    ) => {
      const data: RoleMembers = {
        members: [],
        meta: {
          total: 0,
        },
      }

      const { group_uuid, role_uuid }: GroupRoleMembersParams = action.meta.arg

      if (action.payload.meta.page === 1) {
        data.meta = action.payload.meta
        data.members = action.payload.members
      } else {
        const existingRoleMembers: string[] = state.roleMembers[role_uuid]?.members ?? []

        data.meta = action.payload.meta
        data.members = [...existingRoleMembers, ...action.payload.members]
      }

      state.roleMembers[role_uuid] = data

      state.isFetching[`${group_uuid}${role_uuid}${FETCH_GROUP_ROLE_MEMBERS}`] = false
    },
    [fetchGroupRoleMembers.rejected.type]: (state: GroupsSlice, action: RejectedAction<GroupRoleMembersParams>) => {
      const { group_uuid, role_uuid }: GroupRoleMembersParams = action.meta.arg

      state.isFetching[`${group_uuid}${role_uuid}${FETCH_GROUP_ROLE_MEMBERS}`] = false
    },
    [removeGroupMemberRoleAssignment.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<void, ResignGroupMemberRoleParams>
    ) => {
      const gidUuid: string = action.meta.arg.gidUuid
      const groupUuid: string = action.meta.arg.groupUuid
      const roleUuid: string = action.meta.arg.roleUuid
      const members: string[] | undefined = state.roleMembers[roleUuid]?.members
      const meta: PaginationMetaParams | undefined = state.roleMembers[roleUuid]?.meta

      if (members !== undefined && meta !== undefined && meta.total > 0) {
        state.roleMembers[roleUuid] = {
          members: members.filter((memberUuid: string) => memberUuid !== gidUuid),
          meta: {
            ...meta,
            total: meta.total - 1,
          },
        }
      }

      state.isFetching[`${groupUuid}${gidUuid}${FETCH_UNASSIGN_ROLES_TO_GROUP_MEMBER}`] = false
    },
    [removeGroupMemberRoleAssignment.rejected.type]: (
      state: GroupsSlice, action: RejectedAction<ResignGroupMemberRoleParams>
    ) => {
      const { groupUuid, gidUuid }: ResignGroupMemberRoleParams = action.meta.arg

      state.isFetching[`${groupUuid}${gidUuid}${FETCH_UNASSIGN_ROLES_TO_GROUP_MEMBER}`] = false
    },
    [assignRolesToGroupMember.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<AssignmentResponse[], ManageMemberRoleParams>
    ) => {

      const { groupUuid, gidUuid }: ManageMemberRoleParams = action.meta.arg

      state.memberRoles[`${groupUuid}${gidUuid}`] = getMappedGroupMemberRoles(
        state,
        action.payload,
        groupUuid,
        gidUuid,
      )

      state.isFetching[`${groupUuid}${gidUuid}${FETCH_ASSIGN_ROLES_TO_GROUP_MEMBER}`] = false
    },
    [assignRolesToGroupMember.rejected.type]: (state: GroupsSlice, action: RejectedAction<ManageMemberRoleParams>) => {
      const { groupUuid, gidUuid }: ManageMemberRoleParams = action.meta.arg

      state.isFetching[`${groupUuid}${gidUuid}${FETCH_ASSIGN_ROLES_TO_GROUP_MEMBER}`] = false
    },
    [unassignRolesToGroupMember.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<RoleResponse[], ManageMemberRoleParams>
    ) => {
      const { groupUuid, gidUuid }: ManageMemberRoleParams = action.meta.arg

      state.memberRoles[`${groupUuid}${gidUuid}`] = action.payload

      state.isFetching[`${groupUuid}${gidUuid}${FETCH_UNASSIGN_ROLES_TO_GROUP_MEMBER}`] = false
    },
    [unassignRolesToGroupMember.rejected.type]: (state: GroupsSlice, action: RejectedAction<ManageMemberRoleParams>) => {
      const { groupUuid, gidUuid }: ManageMemberRoleParams = action.meta.arg

      state.isFetching[`${groupUuid}${gidUuid}${FETCH_UNASSIGN_ROLES_TO_GROUP_MEMBER}`] = false
    },
    [fetchGroupInvitationLinks.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<InvitationLinks, GroupUuidParam>
    ) => {
      state.invitationLinks[action.meta.arg.group_uuid] = action.payload.invitation_links
      state.isFetching[getFetchingInvitationLinksKey(action.meta.arg.group_uuid)] = false
    },
    [fetchGroupInvitationLinks.rejected.type]: (
      state: GroupsSlice,
      action: RejectedAction<GroupUuidParam>
    ) => {
      state.isFetching[getFetchingInvitationLinksKey(action.meta.arg.group_uuid)] = false
    },
    [createGroupInvitationLink.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<InvitationLinkResponse, GroupUuidParam>
    ) => {
      state.invitationLinks[action.meta.arg.group_uuid] = [action.payload]
      state.isFetching[getCreatingInvitationLinkKey(action.meta.arg.group_uuid)] = false
    },
    [createGroupInvitationLink.rejected.type]: (
      state: GroupsSlice,
      action: RejectedAction<GroupUuidParam>
    ) => {
      state.isFetching[getCreatingInvitationLinkKey(action.meta.arg.group_uuid)] = false
    },
    [deleteGroupInvitationLink.fulfilled.type]: (
      state: GroupsSlice,
      action: FulfilledAction<void, InvitationLinkParams>
    ) => {
      state.invitationLinks[action.meta.arg.group_uuid] = []
      state.isFetching[getDeleteInvitationLinkKey(action.meta.arg.group_uuid)] = false
    },
    [deleteGroupInvitationLink.rejected.type]: (
      state: GroupsSlice,
      action: RejectedAction<InvitationLinkParams>
    ) => {
      state.isFetching[getDeleteInvitationLinkKey(action.meta.arg.group_uuid)] = false
    },
  },
})

export const {
  setIsFetching,
  setGroup,
  removeMyGroupAndMessagingChannel,
  setGroupForFolders,
  setGroupRoles,
  removeGroupFromStore,
  setSearchText,
  addGroupRole,
  updateGroupRole,
} = groupsSlice.actions

export default groupsSlice.reducer
