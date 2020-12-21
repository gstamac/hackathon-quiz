import { getChannelMemberListItems, getOtherChannelMemberUuidInOneOnOneConversation, getGidNamesByChannelType, disableActionLink } from './helpers'
import { IdentityByUUID } from '../interfaces'
import { publicIdentityMock } from '../../../../tests/mocks/identity_mock'
import { IdentityListItemProps } from '../../identity_list/interfaces'
import { ProfilePageTarget } from '../../../utils/interfaces'
import { GidUUID, ChannelType } from '../../../store/interfaces'

const members: IdentityByUUID = {
  'participant_1': {...publicIdentityMock, gid_uuid: 'participant_1'},
  'participant_2': {...publicIdentityMock, gid_uuid: 'participant_2'},
}

describe('ChannelHeader helpers', () => {

  describe('getChannelMemberListItems', () => {
    it('should return an array of members', () => {
      const identityListItems: IdentityListItemProps[] = getChannelMemberListItems(['participant_1', 'participant_3'], members, 'participant_1')

      expect(identityListItems).toHaveLength(1)
      expect(identityListItems).toEqual([{ ...publicIdentityMock, gid_uuid: 'participant_1', profilePageTarget: ProfilePageTarget.BLANK, isOwner: true }])
    })

    it('should return an array of members with hideOwner set to true', () => {
      const identityListItems: IdentityListItemProps[] = getChannelMemberListItems(['participant_1', 'participant_3'], members, 'participant_1', true)

      expect(identityListItems).toHaveLength(1)
      expect(identityListItems).toEqual([{ ...publicIdentityMock, gid_uuid: 'participant_1', profilePageTarget: ProfilePageTarget.BLANK, isOwner: true, hideOwner: true }])
    })

    it('should return empty array when there are no uuids provided', () => {
      const groupsFilterFunction: IdentityListItemProps[] = getChannelMemberListItems([], members, 'participant_1')

      expect(groupsFilterFunction).toHaveLength(0)
    })
  })

  describe('getOtherChannelMemberUuidInOneOnOneConversation', () => {
    it('should return uuid of other member from oneOnOne conversation', () => {
      const channelMembersUuid: GidUUID | undefined =
        getOtherChannelMemberUuidInOneOnOneConversation('my_uuid', ChannelType.PERSONAL, ['my_uuid', 'uuid'])

      expect(channelMembersUuid).toEqual('uuid')
    })

    it('should return undefined when channel type is not provided', () => {
      const channelMemberUuid: GidUUID | undefined = getOtherChannelMemberUuidInOneOnOneConversation('uuid')

      expect(channelMemberUuid).toBeUndefined()
    })
  })

  describe('getGidNamesByChannelType', () => {
    it('should return null when gidNames array is empty', () => {
      const gidNamesString: string | null = getGidNamesByChannelType(ChannelType.PERSONAL, [])

      expect(gidNamesString).toBeNull()
    })

    it('should return gidNames array first element when channel type is MULTI but gidNames arr length equals to 1', () => {
      const gidNamesString: string | null = getGidNamesByChannelType(ChannelType.MULTI, ['first_user'])

      expect(gidNamesString).toEqual('first_user')
    })

    it('should return gidNames array first element when channel type is PERSONAL', () => {
      const gidNamesString: string | null = getGidNamesByChannelType(ChannelType.MULTI, ['first_user'])

      expect(gidNamesString).toEqual('first_user')
    })

    it('should return gidNames array joined elements when array length equals to 2', () => {
      const gidNamesString: string | null = getGidNamesByChannelType(ChannelType.MULTI, ['first_user', 'second_user'])

      expect(gidNamesString).toEqual('first_user, second_user')
    })

    it('should add 3 dots string to gidNames array joined elements when array length more then 2', () => {
      const gidNamesString: string | null = getGidNamesByChannelType(ChannelType.MULTI, ['first_user', 'second_user', 'third_user'])

      expect(gidNamesString).toEqual('first_user, second_user, ...')
    })
  })

  describe('disableActionLink', () => {
    it('should disable actionlink when channel is not personal and is readonly', () => {
      const disableAction: boolean = disableActionLink(false, true)

      expect(disableAction).toBe(true)
    })

    it('should not disable actionlink when channel is personal and readonly', () => {
      const disableAction: boolean = disableActionLink(true, true)

      expect(disableAction).toBe(false)
    })

    it('should not disable actionlink when channel is neither personal nor readonly', () => {
      const disableAction: boolean = disableActionLink(false, false)

      expect(disableAction).toBe(false)
    })
  })
})
