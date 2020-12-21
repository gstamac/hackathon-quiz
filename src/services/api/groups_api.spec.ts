import { API_BASE_URL, FIRST_PAGE, GROUP_ROLE_MEMBERS_PER_PAGE } from '../../constants'
import * as groupsApi from './groups_api'
import {
  getRolesForMemberResponseMock,
  getGroupsResponseMock,
  groupMock,
  acceptInvitationResponseMock,
  rejectInvitationResponseMock,
  invitationResponse,
  groupMembersResponse,
  RolesResponseMock,
  roleResponseMock,
  roleRequestMock,
  membersForRoleResponseMock,
  assignmentResponse,
  invitationLinksResponseMock,
  invitationLinkMock,
  groupVerificationMock,
  createGroupVerificationBodyMock,
  permissionsListResponse,
} from '../../../tests/mocks/group_mocks'
import * as group_service_sdk from '@globalid/group-service-sdk'
import * as auth from '../../components/auth'
import { GroupsFolderType } from '../../store/interfaces'
import { categoryMock, verificationsMock } from '../../../tests/mocks/group_verifications_mocks'
import Axios from 'axios'
import { mocked } from 'ts-jest/utils'

jest.mock('../../components/auth')
jest.mock('@globalid/group-service-sdk')
jest.mock('axios')

describe('Groups API', () => {
  const getGroupsMock = mocked(group_service_sdk.getGroups)
  const searchGroupsMock = mocked(group_service_sdk.searchGroups)
  const getGroupMock = mocked(group_service_sdk.getGroup)
  const createGroupMock = mocked(group_service_sdk.createGroup)
  const joinToGroupMock = mocked(group_service_sdk.joinToGroup)
  const approveInvitationMock = mocked(group_service_sdk.acceptInvitation)
  const rejectInvitationMock = mocked(group_service_sdk.declineInvitation)
  const sendInvitationMock = mocked(group_service_sdk.invitation)
  const getRolesForMemberMock = mocked(group_service_sdk.getRolesForMember)
  const removeRoleMock = mocked(group_service_sdk.removeRole)
  const getMemberMock = mocked(group_service_sdk.getMember)
  const getGroupRolesMock = mocked(group_service_sdk.getRoles)
  const createRoleMock = mocked(group_service_sdk.createRole)
  const updateRoleMock = mocked(group_service_sdk.updateRole)
  const getGroupPermissionsMock = mocked(group_service_sdk.getPermissions)
  const getMembersForRoleMock = mocked(group_service_sdk.getMembersForRole)
  const createVerificationMock = mocked(group_service_sdk.createVerification)
  const updateVerificationMock = mocked(group_service_sdk.updateVerification)
  const getVerificationsMock = mocked(group_service_sdk.getVerifications)
  const removeVerificationMock = mocked(group_service_sdk.removeVerification)
  const createRoleAssignmentMock = mocked(group_service_sdk.createRoleAssignment)
  const removeRoleAssignmentMock = mocked(group_service_sdk.removeRoleAssignment)
  const getInvitationLinksMock = mocked(group_service_sdk.getInvitationLinks)
  const createInvitationLinkMock = mocked(group_service_sdk.createInvitationLink)
  const removeInvitationLinkMock = mocked(group_service_sdk.removeInvitationLink)
  const axiosRequestMock = mocked(Axios.request)

  const getValidTokenMock = mocked(auth.getValidToken)

  const token: string = 'token'

  beforeEach(() => {
    getValidTokenMock.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getGroups', () => {
    it('should return my groups data', async () => {
      getGroupsMock.mockResolvedValue(getGroupsResponseMock)

      const getGroupResponse: group_service_sdk.GroupsResponse =
        await groupsApi.getGroups(GroupsFolderType.MY_GROUPS, {})

      expect(getGroupResponse).toEqual(getGroupsResponseMock)
      expect(getGroupsMock).toHaveBeenCalledTimes(1)
      expect(getGroupsMock).toHaveBeenCalledWith(token, {
        membershipPosition: group_service_sdk.Member.MembershipPosition.Joined,
      })
    })

    it('should return all groups data', async () => {
      getGroupsMock.mockResolvedValue(getGroupsResponseMock)

      const getGroupResponse: group_service_sdk.GroupsResponse =
        await groupsApi.getGroups(GroupsFolderType.DISCOVER, {})

      expect(getGroupResponse).toEqual(getGroupsResponseMock)
      expect(getGroupsMock).toHaveBeenCalledTimes(1)
      expect(getGroupsMock).toHaveBeenCalledWith(token, {})
    })
  })

  describe('getGroupsByUUID', () => {
    it('should return my groups data by uuids', async () => {
      searchGroupsMock.mockResolvedValue([groupMock])

      const getGroupResponse: group_service_sdk.GroupResponse[] =
        await groupsApi.getGroupsByUUID([groupMock.uuid])

      expect(getGroupResponse).toEqual([groupMock])
      expect(searchGroupsMock).toHaveBeenCalledTimes(1)
      expect(searchGroupsMock).toHaveBeenCalledWith(token, {
        group_uuids: [groupMock.uuid],
      })
    })
  })

  describe('getGroup', () => {
    it('should return group', async () => {
      getGroupMock.mockResolvedValue(groupMock)

      const getGroupResponse: group_service_sdk.GroupResponse =
        await groupsApi.getGroup(groupMock.gid_uuid)

      expect(getGroupResponse).toEqual(groupMock)
      expect(getGroupMock).toHaveBeenCalledTimes(1)
      expect(getGroupMock).toHaveBeenCalledWith({
        group_uuid: groupMock.gid_uuid,
      }, token)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(groupsApi.getGroup(groupMock.gid_uuid)).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('createGroup', () => {

    const body: group_service_sdk.GroupRequest = {
      gid_name: 'gid_name',
      gid_uuid: 'gid_uuid',
      description: 'description',
      logo: undefined,
      display_name: 'display_name',
      group_visibility: group_service_sdk.Group.GroupVisibility.visible,
      member_visibility: group_service_sdk.Member.MemberVisibility.anyone,
      membership_type: group_service_sdk.Member.MembershipType.open,
    }

    it('should return group', async () => {
      createGroupMock.mockResolvedValue(groupMock)

      const createGroupResponse: group_service_sdk.GroupResponse =
        await groupsApi.createGroup(body)

      expect(createGroupResponse).toEqual(groupMock)
      expect(createGroupMock).toHaveBeenCalledTimes(1)
      expect(createGroupMock).toHaveBeenCalledWith(token, body)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(groupsApi.createGroup(body)).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('searchGroups', () => {
    const text: string = 'text'

    it('should return my groups data with text search', async () => {
      getGroupsMock.mockResolvedValue(getGroupsResponseMock)

      const searchGroupResponse: group_service_sdk.GroupsResponse =
        await groupsApi.searchGroups(text, true, 1)

      expect(searchGroupResponse).toEqual(getGroupsResponseMock)
      expect(getGroupsMock).toHaveBeenCalledTimes(1)
      expect(getGroupsMock).toHaveBeenCalledWith(token, {
        text,
        membershipPosition: group_service_sdk.Member.MembershipPosition.Joined,
        page: 1,
        per_page: 20,
      })
    })

    it('should return all groups data with text search', async () => {
      getGroupsMock.mockResolvedValue(getGroupsResponseMock)

      const searchGroupResponse: group_service_sdk.GroupsResponse =
        await groupsApi.searchGroups(text, false, 1)

      expect(searchGroupResponse).toEqual(getGroupsResponseMock)
      expect(getGroupsMock).toHaveBeenCalledTimes(1)
      expect(getGroupsMock).toHaveBeenCalledWith(token, {
        text,
        page: 1,
        per_page: 20,
      })
    })
  })

  describe('joinGroup', () => {
    it('should join a group', async () => {
      getGroupMock.mockResolvedValue(groupMock)
      const isHiddenMock: boolean = false

      const joinGroupResponse: void = await groupsApi.joinGroup(groupMock.uuid, isHiddenMock)

      expect(joinGroupResponse).toBeUndefined()
      expect(joinToGroupMock).toHaveBeenCalledTimes(1)
      expect(joinToGroupMock).toHaveBeenCalledWith(token, { is_hidden: isHiddenMock }, { group_uuid: groupMock.uuid })
    })

    it('should join a group as hidden member', async () => {
      getGroupMock.mockResolvedValue(groupMock)
      const isHiddenMock: boolean = true

      const joinGroupResponse: void = await groupsApi.joinGroup(groupMock.uuid, isHiddenMock)

      expect(joinGroupResponse).toBeUndefined()
      expect(joinToGroupMock).toHaveBeenCalledTimes(1)
      expect(joinToGroupMock).toHaveBeenCalledWith(token, { is_hidden: isHiddenMock }, { group_uuid: groupMock.uuid })
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))
      const isHiddenMock: boolean = false

      await expect(groupsApi.joinGroup(groupMock.uuid, isHiddenMock)).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('approveInvitation', () => {
    it('should approve an invitation to a group', async () => {
      approveInvitationMock.mockResolvedValue(acceptInvitationResponseMock)

      const approveInvitationResponse: group_service_sdk.InvitationUpdateResponse =
        await groupsApi.approveInvitation(acceptInvitationResponseMock.uuid)

      expect(approveInvitationResponse).toEqual(approveInvitationResponse)
      expect(approveInvitationMock).toHaveBeenCalledTimes(1)
      expect(approveInvitationMock).toHaveBeenCalledWith(token, { invitation_uuid: acceptInvitationResponseMock.uuid })
    })
  })

  describe('rejectInvitation', () => {
    it('should reject an invitation to a group', async () => {
      rejectInvitationMock.mockResolvedValue(rejectInvitationResponseMock)

      const rejectInvitationResponse: group_service_sdk.InvitationUpdateResponse =
        await groupsApi.rejectInvitation(rejectInvitationResponseMock.uuid)

      expect(rejectInvitationResponse).toEqual(rejectInvitationResponse)
      expect(rejectInvitationMock).toHaveBeenCalledTimes(1)
      expect(rejectInvitationMock).toHaveBeenCalledWith(token, { invitation_uuid: acceptInvitationResponseMock.uuid })
    })
  })

  describe('sendInvitation', () => {
    it('should send an invitation for a group to a new member', async () => {
      sendInvitationMock.mockResolvedValue(invitationResponse)

      const sendInvitationResponse: group_service_sdk.InvitationResponse =
        await groupsApi.sendInvitation(
          invitationResponse.data[0].group_uuid,
          { message: invitationResponse.data[0].message, recipient_uuid: invitationResponse.data[0].recipient_uuid })

      expect(sendInvitationResponse).toEqual(invitationResponse)
      expect(sendInvitationMock).toHaveBeenCalledTimes(1)
      expect(sendInvitationMock).toHaveBeenCalledWith(
        token,
        { message: invitationResponse.data[0].message, recipient_uuid: invitationResponse.data[0].recipient_uuid },
        { group_uuid: invitationResponse.data[0].group_uuid })
    })
  })

  describe('getMember', () => {
    it('should get group member', async () => {
      getMemberMock.mockResolvedValue(groupMembersResponse.data[0])

      const getMemberResult: group_service_sdk.MemberResponse =
        await groupsApi.getMember({ group_uuid: invitationResponse.data[0].group_uuid, gid_uuid: 'gid_uuid' })

      expect(getMemberResult).toEqual(groupMembersResponse.data[0])
      expect(getMemberMock).toHaveBeenCalledTimes(1)
      expect(getMemberMock).toHaveBeenCalledWith(token, {
        group_uuid: invitationResponse.data[0].group_uuid,
        gid_uuid: 'gid_uuid',
      })
    })
  })

  describe('getRolesForMember', () => {
    it('should fetch group member roles', async () => {
      getRolesForMemberMock.mockResolvedValue(getRolesForMemberResponseMock)

      const getRolesForMemberResponse: group_service_sdk.RolesForMemberResponse =
        await groupsApi.getRolesForMember({
          group_uuid: 'group_uuid',
          gid_uuid: 'gid_uuid',
        })

      expect(getRolesForMemberResponse).toEqual(getRolesForMemberResponseMock)
      expect(getRolesForMemberMock).toHaveBeenCalledTimes(1)
      expect(getRolesForMemberMock).toHaveBeenCalledWith(
        token,
        {
          group_uuid: 'group_uuid',
          gid_uuid: 'gid_uuid',
        })
    })
  })

  describe('removeRole', () => {
    it('should remove a group role', async () => {
      removeRoleMock.mockResolvedValue()

      await groupsApi.removeRole(
        {
          group_uuid: 'group_uuid',
          role_uuid: 'role_uuid',
        })

      expect(removeRoleMock).toHaveBeenCalledTimes(1)
      expect(removeRoleMock).toHaveBeenCalledWith(
        token,
        {
          group_uuid: 'group_uuid',
          role_uuid: 'role_uuid',
        })
    })
  })

  describe('getGroupRoles', () => {
    it('should get group roles', async () => {
      getGroupRolesMock.mockResolvedValue(RolesResponseMock)

      expect(await groupsApi.getGroupRoles('group_uuid'))
        .toEqual(RolesResponseMock)

      expect(getGroupRolesMock).toHaveBeenCalledTimes(1)
      expect(getGroupRolesMock).toHaveBeenCalledWith(
        token,
        {
          group_uuid: 'group_uuid',
        },
        {
          with_member_counts: true,
        })
    })
  })

  describe('createRole', () => {
    it('should create a group role', async () => {
      createRoleMock.mockResolvedValue(roleResponseMock)

      expect(await groupsApi.createRole('group_uuid', roleRequestMock))
        .toEqual(roleResponseMock)

      expect(createRoleMock).toHaveBeenCalledTimes(1)
      expect(createRoleMock).toHaveBeenCalledWith(
        token,
        { group_uuid: 'group_uuid' },
        roleRequestMock,
      )
    })
  })

  describe('updateRole', () => {
    it('should update a group role', async () => {
      updateRoleMock.mockResolvedValue()

      await groupsApi.updateRole('group_uuid', 'role_uuid', roleRequestMock)

      expect(updateRoleMock).toHaveBeenCalledTimes(1)
      expect(updateRoleMock).toHaveBeenCalledWith(
        token,
        {
          group_uuid: 'group_uuid',
          role_uuid: 'role_uuid',
        },
        roleRequestMock,
      )
    })
  })

  describe('getGroupPermissions', () => {
    it('should get group permissions', async () => {
      getGroupPermissionsMock.mockResolvedValue(permissionsListResponse)

      expect(await groupsApi.getGroupPermissions('group_uuid'))
        .toEqual(permissionsListResponse)

      expect(getGroupPermissionsMock).toHaveBeenCalledTimes(1)
      expect(getGroupPermissionsMock).toHaveBeenCalledWith(
        {
          group_uuid: 'group_uuid',
        }, token)
    })
  })

  describe('getMembersForRole', () => {
    it('should get group role members', async () => {
      getMembersForRoleMock.mockResolvedValue(membersForRoleResponseMock)

      expect(await groupsApi.getMembersForRole({group_uuid: 'group_uuid', role_uuid: 'role_uuid'}, FIRST_PAGE))
        .toEqual(membersForRoleResponseMock)

      expect(getMembersForRoleMock).toHaveBeenCalledTimes(1)
      expect(getMembersForRoleMock).toHaveBeenCalledWith(
        token,
        { group_uuid: 'group_uuid', role_uuid: 'role_uuid' },
        { page: 1, 'per_page': GROUP_ROLE_MEMBERS_PER_PAGE },
      )
    })
  })

  describe('assignRole', () => {
    it('should assign a role to the user', async () => {
      createRoleAssignmentMock.mockResolvedValue(assignmentResponse)

      expect(await groupsApi.assignRole(assignmentResponse.role_uuid, 'groupUuid', assignmentResponse.gid_uuid))
        .toEqual(assignmentResponse)

      expect(createRoleAssignmentMock).toHaveBeenCalledTimes(1)
      expect(createRoleAssignmentMock).toHaveBeenCalledWith(
        token,
        {
          group_uuid: 'groupUuid',
          role_uuid: assignmentResponse.role_uuid,
        },
        {
          gid_uuid: assignmentResponse.gid_uuid,
        }
      )
    })
  })

  describe('removeRoleAssignment', () => {
    it('should remove a role from the user', async () => {
      removeRoleAssignmentMock.mockResolvedValue()

      await groupsApi.removeRoleAssignment({
        role_uuid: assignmentResponse.role_uuid,
        group_uuid: 'groupUuid',
        gid_uuid: assignmentResponse.gid_uuid,
      })

      expect(removeRoleAssignmentMock).toHaveBeenCalledTimes(1)
      expect(removeRoleAssignmentMock).toHaveBeenCalledWith('token',
        {
          role_uuid: assignmentResponse.role_uuid,
          group_uuid: 'groupUuid',
          gid_uuid: assignmentResponse.gid_uuid,
        }
      )
    })
  })

  describe('getInvitationLinks', () => {
    it('should return the current group\'s invitation links', async () => {
      getInvitationLinksMock.mockResolvedValue(invitationLinksResponseMock)
      const mockGroupUuid = 'mockGroupUuid'

      expect(await groupsApi.getInvitationLinks(mockGroupUuid)).toEqual(invitationLinksResponseMock)
      expect(getInvitationLinksMock).toHaveBeenCalledTimes(1)
      expect(getInvitationLinksMock).toHaveBeenCalledWith(token, { group_uuid: mockGroupUuid }, {})
    })
  })

  describe('createInvitationLink', () => {
    it('should create a group invitation link', async () => {
      createInvitationLinkMock.mockResolvedValue(invitationLinkMock)
      const mockGroupUuid = 'mockGroupUuid'

      expect(await groupsApi.createInvitationLink(mockGroupUuid)).toEqual(invitationLinkMock)
      expect(createInvitationLinkMock).toHaveBeenCalledTimes(1)
      expect(createInvitationLinkMock).toHaveBeenCalledWith(token, { group_uuid: mockGroupUuid })
    })
  })
  describe('removeInvitationLink', () => {
    it('should remove a group invitation link', async () => {
      removeInvitationLinkMock.mockResolvedValue()

      await groupsApi.removeInvitationLink(
        {
          uuid: 'uuid',
          group_uuid: 'gid_uuid',
          short_link_id: 'short_link_id',
        })

      expect(removeInvitationLinkMock).toHaveBeenCalledTimes(1)
      expect(removeInvitationLinkMock).toHaveBeenCalledWith(
        token,
        {
          uuid: 'uuid',
          group_uuid: 'gid_uuid',
          short_link_id: 'short_link_id',
        })
    })
  })

  describe('createGroupVerification', () => {
    const groupUuid: string = 'groupUuid'

    it('should create group verification', async () => {
      createVerificationMock.mockResolvedValue(groupVerificationMock)

      expect(await groupsApi.createGroupVerification(
        groupUuid,
        createGroupVerificationBodyMock
      )).toEqual(groupVerificationMock)

      expect(createVerificationMock).toHaveBeenCalledTimes(1)
      expect(createVerificationMock).toHaveBeenCalledWith(
        'token',
        { group_uuid: groupUuid },
        createGroupVerificationBodyMock,
      )
    })
  })

  describe('editGroupVerification', () => {
    const groupUuid: string = 'groupUuid'

    it('should edit group verification', async () => {
      updateVerificationMock.mockResolvedValue()

      await groupsApi.editGroupVerification(
        groupUuid,
        groupVerificationMock
      )

      const {
        uuid: verification_uuid,
        ...body
      }: group_service_sdk.VerificationResponse = groupVerificationMock

      expect(updateVerificationMock).toHaveBeenCalledTimes(1)
      expect(updateVerificationMock).toHaveBeenCalledWith(
        { group_uuid: groupUuid, verification_uuid },
        body,
        'token',
      )
    })
  })

  describe('getGroupVerifications', () => {
    const groupUuid: string = 'uuid'

    it('should get group verifications', async () => {
      getVerificationsMock.mockResolvedValue({data: [verificationsMock[groupUuid]]})

      expect(await groupsApi.getGroupVerifications(
        groupUuid,
      )).toStrictEqual({data: [verificationsMock[groupUuid]]})

      expect(getVerificationsMock).toHaveBeenCalledTimes(1)
      expect(getVerificationsMock).toHaveBeenCalledWith(
        { group_uuid: groupUuid },
        'token',
      )
    })
  })

  describe('removeVerification', () => {
    it('should remove group verification', async () => {
      removeVerificationMock.mockResolvedValue()

      await groupsApi.removeGroupVerification(groupMock.gid_uuid, groupVerificationMock.uuid)

      expect(removeVerificationMock).toHaveBeenCalledTimes(1)
      expect(removeVerificationMock).toHaveBeenCalledWith({
        group_uuid: groupMock.gid_uuid,
        verification_uuid: groupVerificationMock.uuid,
      }, token)
    })
  })

  describe('getGroupVerificationCategories', () => {
    it('should get group verification categories', async () => {
      axiosRequestMock.mockResolvedValue({ data: { data:[categoryMock] } })

      expect(await groupsApi.getGroupVerificationCategories(groupMock.gid_uuid)).toEqual([categoryMock])

      expect(axiosRequestMock).toHaveBeenCalledTimes(1)
      expect(axiosRequestMock).toHaveBeenCalledWith({
        headers: groupsApi.authenticatedHeaders(token),
        method: 'GET',
        url: `${API_BASE_URL}/v1/groups/${groupMock.gid_uuid}/categories`,
      })
    })
  })
})

