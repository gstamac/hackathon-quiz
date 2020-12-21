import {
  AssignmentResponse,
  GroupResponse,
  GroupParams,
  PermissionListItem,
  RolesForMemberParams,
  RoleListItem,
} from '@globalid/group-service-sdk'
import { RootState } from 'RootType'
import { FETCH_GROUP_MEMBER_ROLES, FETCH_GROUP_PERMISSIONS } from '../constants'
import { GroupsFolderType, GroupsSlice } from './interfaces'

export const getGroupByUUID = (state: RootState, groupUuid: string): GroupResponse | undefined => (
  state.groups.groups[groupUuid]
)

export const getGroupIsFetchingByUUID = (state: RootState, groupUuid: string): boolean | undefined => (
  state.groups.isFetching[groupUuid]
)

export const getMyGroupsUUIDs = (state: RootState): string[] | undefined => (
  state.groups[GroupsFolderType.MY_GROUPS].groupUuids
)

export const getGroupMemberRolesIsFetchingByUUID = (state: RootState, params: RolesForMemberParams):
  boolean | undefined => state.groups.isFetching[`${params.group_uuid}${params.gid_uuid}${FETCH_GROUP_MEMBER_ROLES}`]

export const getGroupMemberRolesByUUID = (state: RootState, params: RolesForMemberParams):
  RoleListItem[] | undefined => state.groups.memberRoles[`${params.group_uuid}${params.gid_uuid}`]

export const getMappedGroupMemberRoles = (
  state: GroupsSlice,
  roles: AssignmentResponse[],
  groupUuid: string,
  gidUuid: string
): RoleListItem[] => {
  const mappedRoles: RoleListItem[] = roles.reduce<RoleListItem[]>(
    (arr: RoleListItem[], roleResponse: AssignmentResponse) => {
      const assignedRole: RoleListItem | undefined = state.roles[groupUuid]?.find(
        (role: RoleListItem) => role.uuid === roleResponse.role_uuid
      )

      if (assignedRole === undefined) {
        return arr
      }

      return [
        ...arr,
        {
          name: assignedRole.name,
          uuid: assignedRole.uuid,
          group_uuid: assignedRole.group_uuid,
          permissions: assignedRole.permissions,
        },
      ]
    }, [])

  const existingRoles: RoleListItem[] | undefined = state.memberRoles[`${groupUuid}${gidUuid}`]

  if (existingRoles !== undefined) {
    return [...existingRoles, ...mappedRoles]
  }

  return mappedRoles
}

export const getGroupPermissionsByUUID = (
  state: RootState,
  params: GroupParams
): PermissionListItem[] | undefined => (
  state.groups.groupPermissions[params.group_uuid]
)

export const getGroupPermissionsIsFetchingByUUID = (
  state: RootState,
  params: GroupParams
): boolean | undefined => state.groups.isFetching[`${params.group_uuid}${FETCH_GROUP_PERMISSIONS}`]
