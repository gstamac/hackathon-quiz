import { ThunkDispatch } from './store'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { setToastSuccess, setToastError } from 'globalid-react-ui'
import * as groupsApi from '../services/api/groups_api'
import {
  groupMock,
  invitationLinkMock,
  invitationLinksResponseMock,
  joinedWithMultipleMembersGroupResponseMock,
  membersForRoleResponseMock,
  multipleGroupMembersResponse,
  roleResponseMock,
} from '../../tests/mocks/group_mocks'
import { getString } from '../utils'
import { GroupsFolderType, GroupsSlice } from './interfaces'
import groupsReducer, {
  createGroupInvitationLink,
  fetchGroupInvitationLinks,
  fetchGroupRoleMembers,
  getCreatingInvitationLinkKey,
  getFetchingInvitationLinksKey,
  joinGroupMember,
  leaveGroup,
  removeGroupMember,
  removeGroupMemberRoleAssignment,
} from './groups_slice'
import { Middleware } from '@reduxjs/toolkit'
import { FETCH_GROUP_ROLE_MEMBERS } from '../constants'
import { publicIdentityMock } from '../../tests/mocks/identity_mock'
import { Group } from '@globalid/group-service-sdk'

interface StoreType {
  groups: ReturnType<typeof groupsReducer>
}

const middlewares: Middleware[] = [thunk]
const mockStore = configureStore<StoreType,ThunkDispatch>(middlewares)

jest.mock('../services/api/groups_api')

describe('Groups reducer', () => {
  const joinGroupMock: jest.Mock = jest.fn()
  const removeMembershipMock: jest.Mock = jest.fn()
  const getRoleMembersMock: jest.Mock = jest.fn()
  const removeRoleAssignmentMock: jest.Mock = jest.fn()
  const getGroupInvitationLinksMock: jest.Mock = jest.fn()
  const createGroupInvitationLinkMock: jest.Mock = jest.fn()

  const initialState: GroupsSlice = {
    searchText: undefined,
    isFetching: {},
    groups: {},
    roles: {},
    roleMembers: {},
    groupPermissions: {},
    invitationLinks: {},
    members: {},
    memberRoles: {},
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
  }

  const initialStateWithGroup: GroupsSlice = {
    ...initialState,
    groups: {
      [groupMock.uuid]: {
        ...groupMock,
        is_joined: false,
      },
    },
  }

  const initialStateWithGroupContainingMultipleMembers: GroupsSlice = {
    ...initialState,
    groups: {
      [joinedWithMultipleMembersGroupResponseMock.uuid]: joinedWithMultipleMembersGroupResponseMock,
    },
    members: {
      [joinedWithMultipleMembersGroupResponseMock.uuid]: multipleGroupMembersResponse,
    },
    roleMembers: {
      [joinedWithMultipleMembersGroupResponseMock.uuid]: {
        members: [publicIdentityMock.gid_uuid],
        meta: {
          page: 1,
          per_page: 20,
          total: 1,
        },
      },
    },
    [GroupsFolderType.MY_GROUPS]: {
      groupUuids: [joinedWithMultipleMembersGroupResponseMock.uuid, 'another-group-uuid'],
      meta: {
        total: 2,
        page: 1,
        per_page: 20,
      },
    },
  }

  beforeAll(() => {
    (<jest.Mock>groupsApi.joinGroup) = joinGroupMock;
    (<jest.Mock>groupsApi.removeMembership) = removeMembershipMock;
    (<jest.Mock>groupsApi.getMembersForRole) = getRoleMembersMock;
    (<jest.Mock>groupsApi.removeRoleAssignment) = removeRoleAssignmentMock;
    (<jest.Mock>groupsApi.getInvitationLinks) = getGroupInvitationLinksMock;
    (<jest.Mock>groupsApi.createInvitationLink) = createGroupInvitationLinkMock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns the initial state correctly', () => {
    const reducer = groupsReducer(undefined, { type: undefined })

    expect(reducer).toEqual(initialState)
  })

  describe('joinGroupMember', () => {

    it('executes actions and update state upon successfully joining a group', async () => {
      joinGroupMock.mockResolvedValue({})

      const groupUuid: string = groupMock.uuid
      const gidUuid: string = 'gid-uuid-of-member-joining'
      const isHidden: boolean = false

      const store = mockStore({
        groups: initialStateWithGroup,
      })

      const finalAction = await store.dispatch(joinGroupMember({
        group_uuid: groupUuid,
        gid_uuid: gidUuid,
        is_hidden: isHidden,
      }))

      expect(joinGroupMock).toHaveBeenCalledWith(groupUuid, isHidden)

      const actions = store.getActions()

      expect(actions[0].type).toEqual(joinGroupMember.pending.type)
      expect(actions[1].type).toEqual(setToastSuccess.type)
      expect(actions[1].payload).toEqual({
        title: getString('join-group-toast-success-title'),
        message: getString('join-group-toast-success-description')
          .replace('{group}', groupMock.gid_name),
      })
      expect(actions[2].type).toEqual(joinGroupMember.fulfilled.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroup,
        groups: {
          [groupUuid]: {
            ...groupMock,
            is_joined: true,
          },
        },
        [GroupsFolderType.MY_GROUPS]: {
          groupUuids: [groupUuid],
          meta: {
            total: 1,
          },
        },
        messaging: {
          groupUuids: [groupUuid],
          meta: {
            total: 1,
          },
        },
      })
    })

    it('executes actions and state remains upon failing to join a group', async () => {
      joinGroupMock.mockRejectedValue({})

      const groupUuid: string = groupMock.uuid
      const gidUuid: string = 'gid-uuid-of-member-joining'
      const isHidden: boolean = false

      const store = mockStore({
        groups: initialStateWithGroup,
      })

      const finalAction = await store.dispatch(joinGroupMember({
        group_uuid: groupUuid,
        gid_uuid: gidUuid,
        is_hidden: isHidden,
      }))

      expect(joinGroupMock).toHaveBeenCalledWith(groupUuid, isHidden)

      const actions = store.getActions()

      expect(actions[0].type).toEqual(joinGroupMember.pending.type)
      expect(actions[1].type).toEqual(setToastError.type)
      expect(actions[1].payload).toEqual({
        title: getString('join-group-toast-error-title'),
        message: getString('join-group-toast-error-description'),
      })
      expect(actions[2].type).toEqual(joinGroupMember.rejected.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual(initialStateWithGroup)
    })
  })

  describe('leaveGroup', () => {

    it('executes actions and update state upon successfully leaving group', async () => {
      removeMembershipMock.mockResolvedValue({})

      const groupUuid: string = joinedWithMultipleMembersGroupResponseMock.uuid
      const memberUuid: string = multipleGroupMembersResponse.members[4].gid_uuid

      const store = mockStore({
        groups: initialStateWithGroupContainingMultipleMembers,
      })

      const finalAction = await store.dispatch(leaveGroup({
        group_uuid: groupUuid,
        gid_uuid: memberUuid,
      }))

      expect(removeMembershipMock).toHaveBeenCalledWith({
        group_uuid: groupUuid,
        gid_uuid: memberUuid,
      })

      const actions = store.getActions()
      const fetchStatusKey: string = `${groupUuid}${memberUuid}`

      expect(actions[0].type).toEqual(leaveGroup.pending.type)
      expect(actions[1].payload).toEqual({
        key: fetchStatusKey,
        value: true,
      })
      expect(actions[2].type).toEqual(setToastSuccess.type)
      expect(actions[2].payload).toEqual({
        title: getString('leave-group-toast-success-title'),
        message: getString('leave-group-toast-success-description'),
      })
      expect(actions[3].type).toEqual(leaveGroup.fulfilled.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroupContainingMultipleMembers,
        isFetching: {
          [fetchStatusKey]: false,
        },
        groups: {
          [groupUuid]: {
            ...joinedWithMultipleMembersGroupResponseMock,
            is_joined: false,
          },
        },
        members: {
          [groupUuid]: {
            members: [
              ...multipleGroupMembersResponse.members.slice(0, 4),
            ],
            meta: {
              ...multipleGroupMembersResponse.meta,
              total: 4,
            },
          },
        },
        [GroupsFolderType.MY_GROUPS]: {
          groupUuids: ['another-group-uuid'],
          meta: {
            total: 1,
            page: 1,
            per_page: 20,
          },
        },
        messaging: {
          groupUuids: [],
          meta: {
            total: 0,
          },
        },
      })
    })

    it('executes actions and update state upon successfully leaving hidden group', async () => {
      removeMembershipMock.mockResolvedValue({})

      const groupUuid: string = joinedWithMultipleMembersGroupResponseMock.uuid
      const memberUuid: string = multipleGroupMembersResponse.members[4].gid_uuid

      const store = mockStore({
        groups: {
          ...initialStateWithGroupContainingMultipleMembers,
          groups: {
            [groupUuid]: {
              ...joinedWithMultipleMembersGroupResponseMock,
              group_visibility: Group.GroupVisibility.hidden,
            },
          },
        },
      })

      const finalAction = await store.dispatch(leaveGroup({
        group_uuid: groupUuid,
        gid_uuid: memberUuid,
      }))

      expect(removeMembershipMock).toHaveBeenCalledWith({
        group_uuid: groupUuid,
        gid_uuid: memberUuid,
      })

      const actions = store.getActions()
      const isFetchingKey: string = `${groupUuid}${memberUuid}`

      expect(actions[0].type).toEqual(leaveGroup.pending.type)
      expect(actions[1].payload).toEqual({
        key: isFetchingKey,
        value: true,
      })
      expect(actions[2].type).toEqual(setToastSuccess.type)
      expect(actions[2].payload).toEqual({
        title: getString('leave-group-toast-success-title'),
        message: getString('leave-group-toast-success-description'),
      })
      expect(actions[3].type).toEqual(leaveGroup.fulfilled.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroupContainingMultipleMembers,
        isFetching: {
          [isFetchingKey]: false,
        },
        groups: {},
        members: {},
        [GroupsFolderType.MY_GROUPS]: {
          groupUuids: ['another-group-uuid'],
          meta: {
            total: 1,
            page: 1,
            per_page: 20,
          },
        },
        messaging: {
          groupUuids: [],
          meta: {
            total: 0,
          },
        },
      })
    })

    it('executes actions and state remains upon failing to leave group', async () => {
      removeMembershipMock.mockRejectedValue({})

      const groupUuid: string = joinedWithMultipleMembersGroupResponseMock.uuid
      const memberUuid: string = multipleGroupMembersResponse.members[4].gid_uuid

      const store = mockStore({
        groups: initialStateWithGroupContainingMultipleMembers,
      })

      const finalAction = await store.dispatch(leaveGroup({
        group_uuid: groupUuid,
        gid_uuid: memberUuid,
      }))

      expect(removeMembershipMock).toHaveBeenCalledWith({
        group_uuid: groupUuid,
        gid_uuid: memberUuid,
      })

      const actions = store.getActions()
      const fetchStatusKey: string = `${groupUuid}${memberUuid}`

      expect(actions[0].type).toEqual(leaveGroup.pending.type)
      expect(actions[1].payload).toEqual({
        key: fetchStatusKey,
        value: true,
      })
      expect(actions[2].type).toEqual(setToastError.type)
      expect(actions[2].payload).toEqual({
        title: getString('leave-group-toast-failed-title'),
        message: getString('leave-group-toast-failed-description'),
      })
      expect(actions[3].type).toEqual(leaveGroup.rejected.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroupContainingMultipleMembers,
        isFetching: {
          [fetchStatusKey]: false,
        },
      })
    })
  })

  describe('removeGroupMember', () => {

    it('executes actions and update state upon successfully removing member from group', async () => {
      removeMembershipMock.mockResolvedValue({})

      const gidName: string = 'Baraba'
      const groupName: string = 'Je bela cesta'
      const groupUuid: string = joinedWithMultipleMembersGroupResponseMock.uuid
      const memberUuid: string = multipleGroupMembersResponse.members[4].gid_uuid

      const store = mockStore({
        groups: initialStateWithGroupContainingMultipleMembers,
      })

      const finalAction = await store.dispatch(removeGroupMember({
        group_uuid: groupUuid,
        gid_uuid: memberUuid,
        gidName,
        groupName,
      }))

      expect(removeMembershipMock).toHaveBeenCalledWith({
        group_uuid: groupUuid,
        gid_uuid: memberUuid,
      })

      const actions = store.getActions()
      const fetchStatusKey: string = `${groupUuid}${memberUuid}`

      expect(actions[0].type).toEqual(removeGroupMember.pending.type)
      expect(actions[1].payload).toEqual({
        key: fetchStatusKey,
        value: true,
      })
      expect(actions[2].type).toEqual(setToastSuccess.type)
      expect(actions[2].payload).toEqual({
        title: getString('remove-member-toast-success-title'),
        message: getString('remove-member-toast-success-description')
          .replace('{user}', gidName)
          .replace('{group}', groupName),
      })
      expect(actions[3].type).toEqual(removeGroupMember.fulfilled.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroupContainingMultipleMembers,
        isFetching: {
          [fetchStatusKey]: false,
        },
        members: {
          [groupUuid]: {
            members: [
              ...multipleGroupMembersResponse.members.slice(0, 4),
            ],
            meta: {
              ...multipleGroupMembersResponse.meta,
              total: 4,
            },
          },
        },
      })
    })

    it('executes actions and state remains upon failing to remove member from group', async () => {
      removeMembershipMock.mockRejectedValue({})

      const gidName: string = 'Baraba'
      const groupName: string = 'Je bela cesta'
      const groupUuid: string = joinedWithMultipleMembersGroupResponseMock.uuid
      const memberUuid: string = multipleGroupMembersResponse.members[4].gid_uuid

      const store = mockStore({
        groups: initialStateWithGroupContainingMultipleMembers,
      })

      const finalAction = await store.dispatch(removeGroupMember({
        group_uuid: groupUuid,
        gid_uuid: memberUuid,
        gidName,
        groupName,
      }))

      expect(removeMembershipMock).toHaveBeenCalledWith({
        group_uuid: groupUuid,
        gid_uuid: memberUuid,
      })

      const actions = store.getActions()
      const fetchStatusKey: string = `${groupUuid}${memberUuid}`

      expect(actions[0].type).toEqual(removeGroupMember.pending.type)
      expect(actions[1].payload).toEqual({
        key: fetchStatusKey,
        value: true,
      })
      expect(actions[2].type).toEqual(setToastError.type)
      expect(actions[2].payload).toEqual({
        title: getString('remove-member-toast-failed-title'),
        message: getString('remove-member-toast-failed-description'),
      })
      expect(actions[3].type).toEqual(removeGroupMember.rejected.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroupContainingMultipleMembers,
        isFetching: {
          [fetchStatusKey]: false,
        },
      })
    })
  })

  describe('fetchGroupRoleMembers', () => {

    it('executes actions and update state upon successfully getting group role members', async () => {
      getRoleMembersMock.mockResolvedValue(membersForRoleResponseMock)

      const groupUuid: string = groupMock.uuid
      const roleUuid: string = roleResponseMock.uuid

      const store = mockStore({
        groups: initialStateWithGroupContainingMultipleMembers,
      })

      const finalAction = await store.dispatch(fetchGroupRoleMembers({
        group_uuid: groupUuid,
        role_uuid: roleUuid,
        page: 1,
      }))

      expect(getRoleMembersMock).toHaveBeenCalledWith({
        group_uuid: groupUuid,
        role_uuid: roleUuid,
      }, 1)

      const actions = store.getActions()
      const fetchStatusKey: string = `${groupUuid}${roleUuid}${FETCH_GROUP_ROLE_MEMBERS}`

      expect(actions[0].type).toEqual(fetchGroupRoleMembers.pending.type)
      expect(actions[1].payload).toEqual({
        key: fetchStatusKey,
        value: true,
      })
      expect(actions[2].type).toEqual(fetchGroupRoleMembers.fulfilled.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroupContainingMultipleMembers,
        isFetching: {
          [fetchStatusKey]: false,
        },
        roleMembers: {
          [joinedWithMultipleMembersGroupResponseMock.uuid]: {
            members: [publicIdentityMock.gid_uuid],
            meta: {
              page: 1,
              per_page: 20,
              total: 1,
            },
          },
          [roleUuid]: {
            members: [membersForRoleResponseMock.members[0].gid_uuid],
            meta: {
              page: 1,
              per_page: 20,
              total: 1,
            },
          },
        },
      })
    })

    it('executes actions and state remains upon failing to get group role members', async () => {
      getRoleMembersMock.mockRejectedValue({})

      const groupUuid: string = groupMock.uuid
      const roleUuid: string = roleResponseMock.uuid

      const store = mockStore({
        groups: initialStateWithGroupContainingMultipleMembers,
      })

      const finalAction = await store.dispatch(fetchGroupRoleMembers({
        group_uuid: groupUuid,
        role_uuid: roleUuid,
        page: 1,
      }))

      expect(getRoleMembersMock).toHaveBeenCalledWith({
        group_uuid: groupUuid,
        role_uuid: roleUuid,
      }, 1)

      const actions = store.getActions()
      const fetchStatusKey: string = `${groupUuid}${roleUuid}${FETCH_GROUP_ROLE_MEMBERS}`

      expect(actions[0].type).toEqual(fetchGroupRoleMembers.pending.type)
      expect(actions[1].payload).toEqual({
        key: fetchStatusKey,
        value: true,
      })
      expect(actions[2].type).toEqual(fetchGroupRoleMembers.rejected.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroupContainingMultipleMembers,
        isFetching: {
          [fetchStatusKey]: false,
        },
      })
    })
  })

  describe('removeGroupMemberRoleAssignment', () => {
    it('executes actions and update state upon successfully removing group members role', async () => {
      removeRoleAssignmentMock.mockResolvedValue({})
      const groupUuid: string = groupMock.uuid
      const roleUuid: string = roleResponseMock.uuid
      const roleName: string = roleResponseMock.name
      const gidUuid: string = publicIdentityMock.gid_uuid

      const store = mockStore({
        groups: initialStateWithGroupContainingMultipleMembers,
      })

      await store.dispatch(removeGroupMemberRoleAssignment({
        gidUuid,
        roleUuid,
        groupUuid,
        roleName,
        gidName: 'gidName',
        isLoggedUserProfile: true,
      }))

      expect(removeRoleAssignmentMock).toHaveBeenCalledWith({
        group_uuid: groupUuid,
        role_uuid: roleUuid,
        gid_uuid: gidUuid,
      })
    })
  })

  describe('fetchGroupInvitationLinks', () => {
    const groupUuid: string = groupMock.uuid

    it('executes actions and updates state upon successfully fetching a group\'s invitation links', async () => {
      getGroupInvitationLinksMock.mockResolvedValue(invitationLinksResponseMock)
      const store = mockStore({
        groups: initialStateWithGroup,
      })

      const finalAction = await store.dispatch(fetchGroupInvitationLinks({
        group_uuid: groupUuid,
      }))

      expect(getGroupInvitationLinksMock).toHaveBeenCalledWith(groupUuid)

      const actions = store.getActions()
      const fetchStatusKey = getFetchingInvitationLinksKey(groupUuid)

      expect(actions[0].type).toEqual(fetchGroupInvitationLinks.pending.type)
      expect(actions[1].payload).toEqual({
        key: fetchStatusKey,
        value: true,
      })
      expect(actions[2].type).toEqual(fetchGroupInvitationLinks.fulfilled.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroup,
        isFetching: {
          [fetchStatusKey]: false,
        },
        invitationLinks: {
          [groupUuid]: invitationLinksResponseMock.invitation_links,
        },
      })
    })

    it('executes actions and state remains upon failing to fetch a group\'s invitation links', async () => {
      getGroupInvitationLinksMock.mockRejectedValue({})

      const store = mockStore({
        groups: initialStateWithGroup,
      })

      const finalAction = await store.dispatch(fetchGroupInvitationLinks({
        group_uuid: groupUuid,
      }))

      expect(getGroupInvitationLinksMock).toHaveBeenCalledWith(groupUuid)

      const actions = store.getActions()
      const fetchStatusKey = getFetchingInvitationLinksKey(groupUuid)

      expect(actions[0].type).toEqual(fetchGroupInvitationLinks.pending.type)
      expect(actions[1].payload).toEqual({
        key: fetchStatusKey,
        value: true,
      })
      expect(actions[2].type).toEqual(setToastError.type)
      expect(actions[3].type).toEqual(fetchGroupInvitationLinks.rejected.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroup,
        isFetching: {
          [fetchStatusKey]: false,
        },
      })
    })

    it('should not initiate a request if the links have already been successfully fetched', async () => {
      const mockInitialStateWithLinks: GroupsSlice = {
        ...initialStateWithGroup,
        invitationLinks: {
          [groupUuid]: invitationLinksResponseMock.invitation_links,
        },
      }

      const store = mockStore({
        groups: mockInitialStateWithLinks,
      })

      await store.dispatch(fetchGroupInvitationLinks({
        group_uuid: groupUuid,
      }))

      expect(getGroupInvitationLinksMock).not.toHaveBeenCalled()
      expect(store.getActions()).toEqual([])
    })

    it('should not initiate a request if the links are already being fetched', async () => {
      const mockInitialStateWithLinks: GroupsSlice = {
        ...initialStateWithGroup,
        isFetching: {
          [getFetchingInvitationLinksKey(groupUuid)]: true,
        },
      }

      const store = mockStore({
        groups: mockInitialStateWithLinks,
      })

      await store.dispatch(fetchGroupInvitationLinks({
        group_uuid: groupUuid,
      }))

      expect(getGroupInvitationLinksMock).not.toHaveBeenCalled()
      expect(store.getActions()).toEqual([])
    })
  })

  describe('createGroupInvitationLink', () => {
    const groupUuid: string = groupMock.uuid

    it('executes actions and updates state upon successfully creating a group invitation link', async () => {
      createGroupInvitationLinkMock.mockResolvedValue(invitationLinkMock)
      const store = mockStore({
        groups: initialStateWithGroup,
      })

      const finalAction = await store.dispatch(createGroupInvitationLink({
        group_uuid: groupUuid,
      }))

      expect(createGroupInvitationLinkMock).toHaveBeenCalledWith(groupUuid)

      const actions = store.getActions()
      const fetchStatusKey = getCreatingInvitationLinkKey(groupUuid)

      expect(actions[0].type).toEqual(createGroupInvitationLink.pending.type)
      expect(actions[1].payload).toEqual({
        key: fetchStatusKey,
        value: true,
      })
      expect(actions[2].type).toEqual(createGroupInvitationLink.fulfilled.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroup,
        isFetching: {
          [fetchStatusKey]: false,
        },
        invitationLinks: {
          [groupUuid]: [invitationLinkMock],
        },
      })
    })

    it('executes actions and state remains upon failing to create a group invitation link', async () => {
      createGroupInvitationLinkMock.mockRejectedValue({})

      const store = mockStore({
        groups: initialStateWithGroup,
      })

      const finalAction = await store.dispatch(createGroupInvitationLink({
        group_uuid: groupUuid,
      }))

      expect(createGroupInvitationLinkMock).toHaveBeenCalledWith(groupUuid)

      const actions = store.getActions()
      const fetchStatusKey = getCreatingInvitationLinkKey(groupUuid)

      expect(actions[0].type).toEqual(createGroupInvitationLink.pending.type)
      expect(actions[1].payload).toEqual({
        key: fetchStatusKey,
        value: true,
      })
      expect(actions[2].type).toEqual(setToastError.type)
      expect(actions[3].type).toEqual(createGroupInvitationLink.rejected.type)

      const reducer = groupsReducer(store.getState().groups, finalAction)

      expect(reducer).toEqual({
        ...initialStateWithGroup,
        isFetching: {
          [fetchStatusKey]: false,
        },
      })
    })

    it('should not initiate a request if a link already exists in state', async () => {
      const mockInitialStateWithLinks: GroupsSlice = {
        ...initialStateWithGroup,
        invitationLinks: {
          [groupUuid]: invitationLinksResponseMock.invitation_links,
        },
      }

      const store = mockStore({
        groups: mockInitialStateWithLinks,
      })

      await store.dispatch(createGroupInvitationLink({
        group_uuid: groupUuid,
      }))

      expect(createGroupInvitationLinkMock).not.toHaveBeenCalled()
      expect(store.getActions()).toEqual([])
    })

    it('should not initiate a request if a link is already being created', async () => {
      const mockInitialStateWithLinks: GroupsSlice = {
        ...initialStateWithGroup,
        isFetching: {
          [getCreatingInvitationLinkKey(groupUuid)]: true,
        },
      }

      const store = mockStore({
        groups: mockInitialStateWithLinks,
      })

      await store.dispatch(createGroupInvitationLink({
        group_uuid: groupUuid,
      }))

      expect(createGroupInvitationLinkMock).not.toHaveBeenCalled()
      expect(store.getActions()).toEqual([])
    })
  })
})
