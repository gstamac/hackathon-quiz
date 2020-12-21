import {
  channelToRedux, filterOutFetchedMembers, getChannelArray,
  getChannelByParticipants,
  getChannelStoreKeyFromQueryParam,
  getChannelTitle,
  messagePreviewToRedux,
  shouldFetchChannel,
  shouldFetchChannels,
  shouldFetchFileToken,
  shouldFetchFolders,
  updateChannelUnreadCount,
  getMemberIdentitesFromStore,
} from './helpers'
import { initialState } from './channels_slice'
import * as generalUtils from '../../utils/general_utils'
import * as messagesUtils from '../../utils/messages_utils'
import {
  channelWithMoreParticipantsMock,
  channelWithParticipantsTypePersonal,
  fileTokenMock,
  foldersMock,
  membersMock,
  toChannelWithParsedMessage,
} from '../../../tests/mocks/channels_mock'
import {
  ChannelType,
  ChannelWithMembers,
  ChannelWithParticipantsAndParsedMessage,
  FetchChannelsParams,
  MessagePreviewData,
} from '../interfaces'
import { notLastPageMock } from '../../../tests/mocks/group_mocks'
import { identitiesArrayMock } from '../../../tests/mocks/identity_mock'
import { ChannelQueryParams } from './interfaces'
import { channelsTypeMock, channelWithMembersMock } from '../../../tests/mocks/channels_mocks'
import { RootState } from 'RootType'
import { store } from '../store'
import { ChannelWithParticipants, MessagePreview } from '@globalid/messaging-service-sdk'
import { messageMock } from '../../../tests/mocks/messages_mock'
import { mocked } from 'ts-jest/utils'

jest.mock('../../utils/general_utils', () => ({
  ...jest.requireActual<{}>('../../utils/general_utils'),
  hasExpired: jest.fn(),
}))

const mockWindowLocationPathname = (pathname: string): void => {
  Object.defineProperty(global, 'location', {
    value: { pathname },
    writable: true,
  })
}

describe('Channels Slice Helpers', () => {
  const hasExpiredMock = mocked(generalUtils.hasExpired)

  describe('getChannelTitle', () => {
    const identityGidUuid: string | undefined = undefined

    it('should return channel\'s title if it has one', () => {
      const results: string | null | undefined =
        getChannelTitle(channelWithMoreParticipantsMock, identityGidUuid, identitiesArrayMock)

      expect(results).toEqual(channelWithMoreParticipantsMock.title)
    })

    it('should return title for multi-person channel', () => {
      const results: string | null | undefined = getChannelTitle(
        { ...channelWithMoreParticipantsMock, title: undefined },
        identityGidUuid,
        identitiesArrayMock,
      )

      expect(results).toContain('stage2')
      expect(results).toContain('random')
    })

    it('should return title for personal channel', () => {
      const results: string | null | undefined = getChannelTitle(
        { ...channelWithParticipantsTypePersonal, title: undefined },
        identityGidUuid,
        identitiesArrayMock,
      )

      expect(results).toContain('stage2')
    })

    it('should return null when parameters aren\'t valid', () => {
      const results: string | null | undefined = getChannelTitle(
        { ...channelWithParticipantsTypePersonal, title: undefined },
        identityGidUuid,
        [],
      )

      expect(results).toBeNull()
    })
  })

  describe('updateChannelUnreadCount', () => {
    const channelMock: ChannelWithMembers = {
      ...channelWithMembersMock,
      channel: {
        ...channelWithMembersMock.channel,
        unread_count: 10,
      },
    }

    const channelId: string = channelMock.channel.id

    it('should set unread_count to 0 if the channel is open', () => {
      mockWindowLocationPathname(`test_${channelId}`)
      const result: ChannelWithMembers = updateChannelUnreadCount(channelMock, 15)

      expect(result.channel.unread_count).toBe(0)
    })

    it('should set unread_count to 0 if the channel is open and there are no unread messages', () => {
      mockWindowLocationPathname('test')
      const result = updateChannelUnreadCount(channelMock, undefined)

      expect(result.channel.unread_count).toBe(0)
    })

    it('should return the same unread_count if the channel is not open and there are unread messages', () => {
      mockWindowLocationPathname('test')
      const result = updateChannelUnreadCount(channelMock, 20)

      expect(result.channel.unread_count).toBe(20)
    })
  })

  describe('getChannelStoreKeyFromQueryParam', () => {
    const defaultParams: ChannelQueryParams = {
      folder_id: 'folderId',
      groupUuid: 'groupUuid',
      channelTypes: ['PERSONAL'],
    }

    it('should return folder_id, all params defined', () => {
      const params: ChannelQueryParams = {
        ... defaultParams,
      }
      const result: string = getChannelStoreKeyFromQueryParam(params)

      expect(result).toBe('folderId')
    })
    it('should return folder_id, params without groupUUid', () => {
      const params: ChannelQueryParams = {
        folder_id: 'folderId',
        channelTypes: ['PERSONAL'],
      }
      const result: string = getChannelStoreKeyFromQueryParam(params)

      expect(result).toBe('folderId')
    })
    it('should return groupUuid, params with folderId null', () => {
      const params: ChannelQueryParams = {
        ... defaultParams,
        folder_id: null,
      }
      const result: string = getChannelStoreKeyFromQueryParam(params)

      expect(result).toBe('groupUuid')
    })
    it('should return channelType if folderId is null and groupUuid is missing', () => {
      const params: ChannelQueryParams = {
        folder_id: null,
        channelTypes: ['PERSONAL'],
      }
      const result: string = getChannelStoreKeyFromQueryParam(params)

      expect(result).toBe('PERSONAL')
    })
    it('should return empty string when only channel type is specified and there is more then one item in array', () => {
      const params: ChannelQueryParams = {
        channelTypes: ['PERSONAL', 'GROUP', 'MULTI']}
      const result: string = getChannelStoreKeyFromQueryParam(params)

      expect(result).toBe('')
    })
  })

  describe('getChannelArray', () => {
    it('should return ChannelWithMembers array from ChannelsType object', () => {
      const result: ChannelWithMembers[] = getChannelArray(channelsTypeMock)

      expect(result).toHaveLength(1)
      expect(result).toEqual([channelWithMembersMock])
    })
  })

  describe('getChannelByParticipants', () => {
    const state: RootState = store.getState()

    const mockChannel: ChannelWithParticipantsAndParsedMessage =
      toChannelWithParsedMessage({
        ...channelWithMoreParticipantsMock,
        type: ChannelType.GROUP,
        participants: ['mock_participant_1', 'mock_participant_2', 'mock_participant_3'],
        group_uuid: 'mockGroupUuid_1',
      })

    const mockState: RootState = {
      ...state,
      channels: {
        ...state.channels,
        channels: {
          [mockChannel.id]: {
            channel: mockChannel,
            members: [],
          },
        },
      },
    }

    it('should return a channel if it finds one with the provided participants, type and group_uuid', () => {
      const result: ChannelWithParticipants | undefined =
        getChannelByParticipants(
          mockState,
          mockChannel.participants,
          <ChannelType> mockChannel.type,
          <string> mockChannel.group_uuid
        )

      expect(result?.id).toBe(mockChannel.id)
    })

    it('should return undefined if it can\'t find a channel with the provided participants', () => {
      const result: ChannelWithParticipants | undefined =
        getChannelByParticipants(
          mockState,
          ['mock_participant_1', 'mock_participant_2'],
          <ChannelType> mockChannel.type,
          <string> mockChannel.group_uuid
        )

      expect(result).toBeUndefined()
    })

    it('should return undefined if it can\'t find a channel with the provided type', () => {
      const result: ChannelWithParticipants | undefined =
        getChannelByParticipants(
          mockState,
          mockChannel.participants,
          ChannelType.PERSONAL,
          <string> mockChannel.group_uuid
        )

      expect(result).toBeUndefined()
    })

    it('should return undefined if it can\'t find a channel with the provided group_uuid', () => {
      const result: ChannelWithParticipants | undefined =
        getChannelByParticipants(
          mockState,
          mockChannel.participants,
          <ChannelType> mockChannel.type,
          'mockGroupUuid_2'
        )

      expect(result).toBeUndefined()
    })
  })

  describe('channelToRedux', () => {
    it('should return the same object if the channel message is undefined', async () => {
      const mockChannel: ChannelWithParticipants = {
        ...channelWithMoreParticipantsMock,
        message: undefined,
      }

      const result: ChannelWithParticipantsAndParsedMessage = await channelToRedux(mockChannel)

      expect(result).toEqual(mockChannel)
    })

    it('should call messagePreviewToRedux and update the message if defined', async () => {
      const mockAlteredMessage: string = 'altered_message'

      jest
        .spyOn(messagesUtils, 'getMessageCardContent')
        .mockResolvedValue(mockAlteredMessage)

      const mockChannel: ChannelWithParticipants = {
        ...channelWithMoreParticipantsMock,
        message: messageMock,
      }

      const result: ChannelWithParticipantsAndParsedMessage = await channelToRedux(mockChannel)

      expect(result).toEqual({
        ...mockChannel,
        message: {
          ...mockChannel.message,
          parsedContent: mockAlteredMessage,
        },
      })
    })
  })

  describe('messagePreviewToRedux', () => {
    it('should return object with parsed message as null', async () => {
      const messagePreviewMock: MessagePreview = messageMock
      const resultMock: MessagePreviewData = {
        ...messagePreviewMock,
        parsedContent: null,
      }

      jest
        .spyOn(messagesUtils, 'getMessageCardContent')
        .mockResolvedValue(null)

      const result: MessagePreviewData = await messagePreviewToRedux(messagePreviewMock)

      expect(result).toEqual(resultMock)
      expect(messagesUtils.getMessageCardContent).toHaveBeenCalled()
    })

    it('should return object with parsed message', async () => {
      const messagePreviewMock: MessagePreview = messageMock
      const encryptedChannelSecretMock: string = 'encryptedSecret'
      const resultMock: MessagePreviewData = {
        ...messagePreviewMock,
        parsedContent: 'mocked parsed message',
      }

      jest
        .spyOn(messagesUtils, 'getMessageCardContent')
        .mockResolvedValue('mocked parsed message')

      const result: MessagePreviewData = await messagePreviewToRedux(messagePreviewMock, encryptedChannelSecretMock)

      expect(result).toEqual(resultMock)
      expect(messagesUtils.getMessageCardContent).toHaveBeenCalled()
    })
  })

  describe('shouldFetchFileToken', () => {
    it('should return true when fetching is not already in progress and fileTokens weren\'t already fetched', () => {
      const results: boolean = shouldFetchFileToken('channelId', initialState)

      expect(results).toEqual(true)
    })

    it('should return true when fileToken was already fetched but has expired', () => {
      hasExpiredMock.mockReturnValue(true)

      const results: boolean = shouldFetchFileToken(
        'channelId',
        { ...initialState, fileTokens: { 'channelId': fileTokenMock }},
      )

      expect(results).toEqual(true)
    })

    it('should return false when fileToken was already fetched but hasn\'t expired', () => {
      hasExpiredMock.mockReturnValue(false)

      const results: boolean = shouldFetchFileToken(
        'channelId',
        { ...initialState, fileTokens: { 'channelId': fileTokenMock }},
      )

      expect(results).toEqual(false)
    })

    it('should return false when fileToken fetching is already in progress', () => {
      const results: boolean = shouldFetchFileToken(
        'channelId',
        { ...initialState, fileTokensFetching: { 'channelId': true }},
      )

      expect(results).toEqual(false)
    })
  })

  describe('shouldFetchChannel', () => {
    it('should return true when fetching is not already in progress and channel wasn\'t already fetched', () => {
      const results: boolean = shouldFetchChannel('channelId', false, initialState)

      expect(results).toEqual(true)
    })

    it('should return true when there was an error fetching channel', () => {

      const results: boolean = shouldFetchChannel(
        'channelId',
        false,
        { ...initialState, errors: { 'channelId': true }}
      )

      expect(results).toEqual(true)
    })

    it('should return true when fetch is being forced', () => {
      const results: boolean = shouldFetchChannel('channelId', true, initialState)

      expect(results).toEqual(true)
    })

    it('should return false when channel fetching is already in progress', () => {
      const results: boolean = shouldFetchChannel(
        'channelId',
        false,
        { ...initialState, isFetching: { 'channelId': true }}
      )

      expect(results).toEqual(false)
    })
  })

  describe('shouldFetchChannels', () => {
    const queryParams: FetchChannelsParams= {
      channelTypes: ['PERSONAL'],
      per_page: 20,
      page: 1,
    }

    it('should return true when fetching is not already in progress and channels weren\'t already fetched', () => {
      const results: boolean = shouldFetchChannels(queryParams, initialState)

      expect(results).toEqual(true)
    })

    it('should return true when all channels weren\'t already fetched', () => {

      const results: boolean = shouldFetchChannels(
        queryParams,
        { ...initialState, meta: { 'PERSONAL': notLastPageMock }},
      )

      expect(results).toEqual(true)
    })

    it('should return false when all channels were already fetched', () => {

      const results: boolean = shouldFetchChannels(
        { ...queryParams, page: 2 },
        { ...initialState, meta: { 'PERSONAL': { ...notLastPageMock, total: 20 } }},
      )

      expect(results).toEqual(false)
    })

    it('should return false when channels fetching is already in progress', () => {

      const results: boolean = shouldFetchChannels(
        queryParams,
        { ...initialState, isFetching: { 'PERSONAL': true }},
      )

      expect(results).toEqual(false)
    })
  })

  describe('shouldFetchFolders', () => {
    it('should return true when there are none folders fetched', () => {
      const results: boolean = shouldFetchFolders(
        { ...initialState, folders: [] }
      )

      expect(results).toEqual(true)
    })

    it('should return false when there are folders fetched', () => {
      const results: boolean = shouldFetchFolders(
        { ...initialState, folders: foldersMock },
      )

      expect(results).toEqual(false)
    })
  })

  describe('filterOutFetchedMembers', () => {
    it('should filter already fetched members from the initial list', () => {
      const fetchedMembers: string[] = ['1', '2', '3']
      const membersToFetch: string[] = ['1', '2', '3', '4', '5']

      expect(filterOutFetchedMembers(fetchedMembers, membersToFetch)).toEqual(['4', '5'])
    })

    it('should return all members to fetch when members in store are undefined', () => {
      const membersToFetch: string[] = ['1', '2', '3', '4', '5']

      expect(filterOutFetchedMembers(undefined, membersToFetch)).toEqual(membersToFetch)
    })
  })

  describe('getMemberIdentitesFromStore', () => {
    it('should return array of selected identities from store', () => {
      const membersToGetFromStore: string[] = [
        '6196ffd4-d433-49d2-a658-6ca9122ffe32',
        '78efe212-f61e-4adc-8429-5ac5a543fe88',
      ]

      expect(getMemberIdentitesFromStore(membersMock, membersToGetFromStore)).toEqual([
        membersMock[membersToGetFromStore[0]],
        membersMock[membersToGetFromStore[1]],
      ])
    })
  })
})
