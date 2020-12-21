import { Identity } from '@globalid/identity-namespace-service-sdk'
import {
  IdentityByUUID,
} from '../interfaces'
import { IdentityListItemProps } from '../../identity_list/interfaces'
import { GidUUID, ChannelType, GidName } from '../../../store/interfaces'
import { ProfilePageTarget } from '../../../utils/interfaces'

export const getChannelMemberListItems = (
  memberUuids: GidUUID[],
  membersByUuid: IdentityByUUID,
  owner: GidUUID | undefined,
  hideOwner?: boolean,
): IdentityListItemProps[] => (
  memberUuids.reduce<Identity[]>((identities: Identity[], memberUuid: GidUUID) => {
    const identity: Identity | undefined = membersByUuid[memberUuid]

    if (identity !== undefined) {
      const isOwner: boolean = identity.gid_uuid === owner

      return [
        ...identities,
        {
          ...identity,
          isOwner,
          hideOwner,
          profilePageTarget: ProfilePageTarget.BLANK,
        },
      ]
    }

    return identities
  }, [])
)

export const getOtherChannelMemberUuidInOneOnOneConversation = (
  loggedInIdentityUuid: GidUUID,
  channelType?: ChannelType,
  memberUuids?: GidUUID[]
): GidUUID | undefined => {
  if (channelType === ChannelType.PERSONAL && memberUuids !== undefined && memberUuids.length === 2) {
    return memberUuids.find((memberUuid: GidUUID) => memberUuid !== loggedInIdentityUuid)
  }

  return undefined
}

export const getGidNamesByChannelType = (type: ChannelType, gidNames: GidName[]): string | null => {
  if (gidNames.length === 0){
    return null
  }

  if (type === ChannelType.PERSONAL || gidNames.length === 1) {
    return gidNames[0]
  }

  if (gidNames.length === 2) {
    return gidNames.join(', ')
  }

  return `${gidNames.splice(0, 2).join(', ')}, ...`
}

export const disableActionLink = (isOneOnOne: boolean, hiddenMembers: boolean): boolean =>
  !isOneOnOne && hiddenMembers

