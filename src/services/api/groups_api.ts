import { GeneralObject } from './../../utils/interfaces'
import {
  getGroups as getGroupsSdk,
  getGroup as getGroupSdk,
  getMembers as getMembersSdk,
  getMember as getMemberSdk,
  removeMember as removeMemberSdk,
  releaseGroup as releaseGroupSdk,
  PaginationQueryParams,
  GroupsResponse,
  GroupResponse,
  MembersResponse,
  MemberParams,
  joinToGroup,
  createGroup as createGroupSdk,
  GroupRequest,
  updateGroup,
  UpdateGroupRequest,
  UpdateGroupResponse,
  getIdentityUpdateById,
  IdentityRequest,
  acceptInvitation,
  declineInvitation,
  InvitationUpdateResponse,
  invitation as sendInvitationSdk,
  InvitationRequest,
  InvitationResponse,
  searchGroups as searchGroupsSdk,
  MemberResponse,
  RolesForMemberResponse,
  RolesForMemberParams,
  RoleParams,
  getRolesForMember as getRolesForMemberSdk,
  removeRole as removeRoleSdk,
  getRoles,
  RoleRequest,
  RoleResponse,
  createRole as createRoleSdk,
  updateRole as updateRoleSdk,
  PermissionListResponse,
  removeRoleAssignment as removeRoleAssignmentSdk,
  AssignmentParams,
  MembersForRoleParams,
  MembersForRoleResponse,
  getMembersForRole as getMembersForRoleSdk,
  createRoleAssignment,
  AssignmentResponse,
  getPermissions as getPermissionsSdk,
  createVerification,
  VerificationResponse,
  VerificationRequest,
  updateVerification,
  RolesResponse,
  AssignmentRequest,
  CreateAssignmentParams,
  InvitationLinkResponse,
  InvitationLinks,
  getInvitationLinks as getInvitationLinksSdk,
  createInvitationLink as createInvitationLinkSdk,
  removeInvitationLink as removeInvitationLinkSdk, InvitationLinkParams,
  getVerifications,
  VerificationsResponse,
  getRole as getRoleSdk,
  RoleListItem,
  VerificationParams,
  removeVerification as removeVerificationSdk,
  Member,
  GroupParams,
  CategoryListItem,
  createVerificationRequest as createVerificationRequestSdk,
  CreateVerificationRequestBody,
  CreatedGroupVerificationRequest,
} from '@globalid/group-service-sdk'
import { getValidToken } from '../../components/auth'
import { GROUP_MEMBERS_PER_PAGE, GROUP_ROLE_MEMBERS_PER_PAGE, GROUPS_PER_PAGE, API_BASE_URL } from '../../constants'
import { GroupsFolderType } from '../../store/interfaces'
import { IdentityRequestModel } from '@globalid/identity-namespace-service-sdk'
import pRetry from 'p-retry'
import { waitForIdentityRequestStatus } from './identity_api'
import { UpdatedIdentityValues, IdentityRequestModelStatus, IdentityStatusArgs } from './interfaces'
import Axios, { AxiosResponse } from 'axios'

export const getGroups = async (
  type: GroupsFolderType,
  paginationParams: PaginationQueryParams
): Promise<GroupsResponse> => {
  const token: string = await getValidToken()

  const membershipPosition: Member.MembershipPosition | undefined = type === GroupsFolderType.MY_GROUPS
    ? Member.MembershipPosition.Joined
    : undefined

  return getGroupsSdk(token, {
    membershipPosition,
    ...paginationParams,
  })
}

export const getGroupsByUUID = async (
  group_uuids: string[]
): Promise<GroupResponse[]> => {
  const token: string = await getValidToken()

  return searchGroupsSdk(token, {
    group_uuids,
  })
}

export const getGroup = async (
  group_uuid: string
): Promise<GroupResponse> => {
  const token: string = await getValidToken()

  return getGroupSdk({ group_uuid }, token)
}

export const searchGroups = async (
  text: string,
  myGroups: boolean,
  page: number
): Promise<GroupsResponse> => {
  const token: string = await getValidToken()

  const membershipPosition: Member.MembershipPosition | undefined = myGroups
    ? Member.MembershipPosition.Joined
    : undefined

  return getGroupsSdk(token, {
    text,
    membershipPosition,
    page,
    per_page: GROUPS_PER_PAGE,
  })
}

export const getMembers = async (
  group_uuid: string,
  page: number,
): Promise<MembersResponse> => {
  const token: string = await getValidToken()

  return getMembersSdk(token, { group_uuid }, { page, per_page: GROUP_MEMBERS_PER_PAGE })
}

export const getMember = async (
  params: MemberParams
): Promise<MemberResponse> => {
  const token: string = await getValidToken()

  return getMemberSdk(token, params)
}

export const removeMembership = async (
  params: MemberParams,
): Promise<void> => {
  const token: string = await getValidToken()

  return removeMemberSdk(token, params)
}

export const releaseGroup = async (
  params: GroupParams,
): Promise<void> => {
  const token: string = await getValidToken()

  await releaseGroupSdk(token, params)
}

export const createGroup = async (
  body: GroupRequest
): Promise<GroupResponse> => {
  const token: string = await getValidToken()

  return createGroupSdk(token, body)
}

export const joinGroup = async (
  group_uuid: string,
  is_hidden: boolean,
): Promise<void> => {
  const token: string = await getValidToken()

  return joinToGroup(token, { is_hidden }, { group_uuid })
}

export const editGroup = async (
  groupUuid: string,
  body: UpdateGroupRequest,
): Promise<UpdateGroupResponse> => {
  const token: string = await getValidToken()

  const updateGroupResponse: UpdateGroupResponse = await updateGroup(token, { group_uuid: groupUuid }, body)

  const updatedIdentityValues: UpdatedIdentityValues = await (
    updateGroupResponse.update_requests.reduce(
      async (
        updatedValues: Promise<UpdatedIdentityValues>,
        updateRequest: IdentityRequestModel
      ): Promise<UpdatedIdentityValues> => {
        const prevValues: UpdatedIdentityValues = await updatedValues

        const updatedIdentityRequest: IdentityRequest = await waitForIdentityRequestStatus<IdentityRequest>('approved', validateGroupIdentityRequestStatus, {
          access_token: token,
          identity_update_request_uuid: updateRequest.uuid,
          gid_uuid: groupUuid,
        })

        return new Promise((resolve: Function) => resolve({
          ...prevValues,
          [updatedIdentityRequest.field_name]: updatedIdentityRequest.new_value,
        }))
      },
      new Promise((resolve: Function) => resolve({}))
    )
  )

  return {
    ...updateGroupResponse,
    ...updatedIdentityValues,
  }
}

export const getValidationErrorMessage = (property: string): string => (
  `${property}-UPDATE_FAILED`
)

export const validateGroupIdentityRequestStatus = async (
  args: IdentityStatusArgs,
): Promise<IdentityRequest> => {
  const { identity_update_request_uuid, gid_uuid, access_token } = args
  const updatedIdentity: IdentityRequest = await getIdentityUpdateById(access_token, {
    update_request_uuid: identity_update_request_uuid,
    group_uuid: gid_uuid,
  })

  const identityRequestStatus: IdentityRequestModelStatus = updatedIdentity.status

  if (identityRequestStatus === args.status) {
    return updatedIdentity
  } else if (identityRequestStatus === 'rejected') {
    throw new pRetry.AbortError(getValidationErrorMessage(updatedIdentity.field_name))
  }
  throw new Error('KEEP_POOLING')
}

export const approveInvitation = async (
  invitationUuid: string,
): Promise<InvitationUpdateResponse> => {
  const token: string = await getValidToken()

  return acceptInvitation(token, { invitation_uuid: invitationUuid })
}

export const rejectInvitation = async (
  invitationUuid: string,
): Promise<InvitationUpdateResponse> => {
  const token: string = await getValidToken()

  return declineInvitation(token, { invitation_uuid: invitationUuid })
}

export const sendInvitation = async (
  groupUuid: string,
  body: InvitationRequest,
): Promise<InvitationResponse> => {
  const token: string = await getValidToken()

  return sendInvitationSdk(token, body, { group_uuid: groupUuid })
}

export const getRolesForMember = async (params: RolesForMemberParams
): Promise<RolesForMemberResponse> => {
  const token: string = await getValidToken()

  return getRolesForMemberSdk(token, { group_uuid: params.group_uuid, gid_uuid: params.gid_uuid })
}

export const getMembersForRole = async (
  params: MembersForRoleParams,
  page: number,
): Promise<MembersForRoleResponse> => {
  const token: string = await getValidToken()

  return getMembersForRoleSdk(token, params, { page, per_page: GROUP_ROLE_MEMBERS_PER_PAGE })
}

export const getRole = async (
  params: RoleParams
): Promise<RoleListItem> => {
  const token: string = await getValidToken()

  return getRoleSdk(token, { group_uuid: params.group_uuid, role_uuid: params.role_uuid })
}

export const removeRole = async (
  params: RoleParams
): Promise<void> => {
  const token: string = await getValidToken()

  return removeRoleSdk(token, { group_uuid: params.group_uuid, role_uuid: params.role_uuid })
}

export const removeRoleAssignment = async (params: AssignmentParams
): Promise<void> => {
  const token: string = await getValidToken()

  return removeRoleAssignmentSdk(token, {
    group_uuid: params.group_uuid,
    role_uuid: params.role_uuid,
    gid_uuid: params.gid_uuid,
  })
}

export const createRole = async (
  groupUuid: string,
  body: RoleRequest
): Promise<RoleResponse> => {
  const token: string = await getValidToken()

  return createRoleSdk(token, { group_uuid: groupUuid }, body)
}

export const updateRole = async (
  groupUuid: string,
  roleUuid: string,
  body: RoleRequest
): Promise<void> => {
  const token: string = await getValidToken()

  await updateRoleSdk(token, { group_uuid: groupUuid, role_uuid: roleUuid }, body)
}

export const getGroupPermissions = async (
  groupUuid: string,
): Promise<PermissionListResponse> => {
  const token: string = await getValidToken()

  return getPermissionsSdk({ group_uuid: groupUuid }, token)
}

export const getGroupRoles = async (
  groupUuid: string,
): Promise<RolesResponse> => {
  const token: string = await getValidToken()

  return getRoles(token, {group_uuid: groupUuid}, { with_member_counts: true })
}

export const assignRole = async (
  roleUuid: string,
  groupUuid: string,
  loggedInUserGidUuid: string
): Promise<AssignmentResponse> => {
  const token: string = await getValidToken()

  const params: CreateAssignmentParams = {
    role_uuid: roleUuid,
    group_uuid: groupUuid,
  }

  const body: AssignmentRequest = {
    gid_uuid: loggedInUserGidUuid,
  }

  return createRoleAssignment(token, params, body)
}

export const getInvitationLinks = async (
  groupUuid: string,
): Promise<InvitationLinks> => {
  const token: string = await getValidToken()

  return getInvitationLinksSdk(token, { group_uuid: groupUuid }, {})
}

export const createInvitationLink = async (
  groupUuid: string,
): Promise<InvitationLinkResponse> => {
  const token: string = await getValidToken()

  return createInvitationLinkSdk(token, { group_uuid: groupUuid })
}

export const removeInvitationLink = async (params: InvitationLinkParams): Promise<void> => {
  const token: string = await getValidToken()

  return removeInvitationLinkSdk(token, params)
}

export const createGroupVerification = async (
  groupUuid: string,
  body: VerificationRequest
): Promise<VerificationResponse> => {
  const token: string = await getValidToken()

  return createVerification(token, { group_uuid: groupUuid }, body)
}

export const editGroupVerification = async (
  groupUuid: string,
  {
    uuid: verification_uuid,
    ...body
  }: VerificationResponse
): Promise<void> => {
  const token: string = await getValidToken()

  return updateVerification({ group_uuid: groupUuid, verification_uuid }, body, token)
}

export const getGroupVerifications = async (
  groupUuid: string
): Promise<VerificationsResponse> => {
  const token: string = await getValidToken()

  return getVerifications({ group_uuid: groupUuid }, token)
}

export const removeGroupVerification = async (
  groupUuid: string,
  verificationUuid: string,
): Promise<void> => {
  const token: string = await getValidToken()

  const params: VerificationParams = {
    group_uuid: groupUuid,
    verification_uuid: verificationUuid,
  }

  return removeVerificationSdk(params, token)
}

export const createVerificationRequest = async (
  args: CreateVerificationRequestBody,
  group_uuid: string,
): Promise<CreatedGroupVerificationRequest> => {
  const token: string = await getValidToken()

  return createVerificationRequestSdk(token, args, { group_uuid })
}

export const getGroupVerificationCategories = async (group_uuid: string): Promise<CategoryListItem[]> => {
  const token: string = await getValidToken()
  const axiosResponse: AxiosResponse<{ data: CategoryListItem[] }> = await Axios.request<{ data: CategoryListItem[] }>({
    headers: authenticatedHeaders(token),
    method: 'GET',
    url: `${API_BASE_URL}/v1/groups/${group_uuid}/categories`,
  })

  return axiosResponse.data.data
}

export const authenticatedHeaders = (accessToken: string): GeneralObject<string> => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
})
