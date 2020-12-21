import { store, ThunkDispatch } from '../../../store'
import { useGetChannelsHook } from './use_get_channels_hook'
import { GetChannelsHook, GetChannelsHookProps } from './interfaces'
import { act, cleanup, HookResult } from '@testing-library/react-hooks'
import { getChannels, getChannelMembers } from '../../../services/api/channels_api'
import {
  channelsWithPaginationMetaMock,
  channelWithParticipantsTypePersonal,
  channelWithParticipantsTypeOther,
  channelWithParticipantsTypeGroup,
  foldersMock,
  channelWithBotParticipantMock,
} from '../../../../tests/mocks/channels_mock'
import { setIsFetchingAll, setChannels, setMeta } from '../../../store/channels_slice/channels_slice'
import { ChannelWithParticipants } from '@globalid/messaging-service-sdk/interfaces'
import { MessagesType } from '../interfaces'
import { ChannelType } from '../../../store/interfaces'
import { testCustomHook } from '../../../../tests/test_utils'
import { mocked } from 'ts-jest/utils'
import { identitiesArrayMock } from '../../../../tests/mocks/identity_mock'

jest.mock('../../../services/api/channels_api')

describe('useGetChannelsHook', () => {
  let hookResult: HookResult<GetChannelsHook>
  const getChannelsMock = mocked(getChannels)
  const getMembersMock = mocked(getChannelMembers)

  const channels: ChannelWithParticipants[] = channelsWithPaginationMetaMock.data.channels

  const renderHook: (props: Partial<GetChannelsHookProps>) => Promise<HookResult<GetChannelsHook>> = testCustomHook(useGetChannelsHook, {
    folderType: MessagesType.GROUPS,
    folders: foldersMock,
  })

  beforeEach(async () => {
    getChannelsMock.mockResolvedValue(channelsWithPaginationMetaMock)
    getMembersMock.mockResolvedValue(identitiesArrayMock)
    await act(async () => {
      await (store.dispatch as ThunkDispatch)(setChannels(channels))
      store.dispatch(setIsFetchingAll(false))
    })
  })

  afterEach(async () => {
    await cleanup()
    jest.clearAllMocks()
  })

  describe('Group Channels', () => {
    it('should get channels from api excluding the bot channels', async () => {
      getChannelsMock.mockResolvedValue({
        ...channelsWithPaginationMetaMock,
        meta: { page: 1, per_page: 10, total: 1 },
      })

      await act(async () => {
        hookResult = await renderHook({ groupUuid: 'groupUuid' })
      })

      const result: GetChannelsHook = hookResult.current

      expect(getChannelsMock).toHaveBeenCalled()
      expect(result.channelsIds).toEqual([channelWithParticipantsTypeGroup.id])
      expect(result.areChannelsLoading).toBe(false)
      expect(result.hasNextPage).toStrictEqual(false)
    })

    it('should compare loaded channels with total count', async () => {
      getChannelsMock.mockResolvedValue({
        ...channelsWithPaginationMetaMock,
        meta: { page: 1, per_page: 10, total: 30 },
      })
      store.dispatch(setMeta({
        key: 'GROUP',
        value: { page: 1, per_page: 10, total: 30 },
      }))
      await act(async () => {
        hookResult = await renderHook({})
      })

      const result: GetChannelsHook = hookResult.current

      expect(result.hasNextPage).toStrictEqual(true)
    })

    it('should call load next page function', async () => {
      getChannelsMock.mockResolvedValue({
        ...channelsWithPaginationMetaMock,
        meta: { page: 1, per_page: 10, total: 10 },
      })

      store.dispatch(setMeta({
        key: 'GROUP',
        value: { page: 1, per_page: 10, total: 50 },
      }))

      await act(async () => {
        hookResult = await renderHook({})
      })

      const result: GetChannelsHook = hookResult.current

      expect(result.hasNextPage).toStrictEqual(true)

      await act(async () => {
        result.loadNextPage()
      })

      expect(getChannelsMock).toHaveBeenCalledWith({
        'channelTypes': [ChannelType.GROUP, ChannelType.MULTI, ChannelType.PERSONAL],
        'page': 2,
        'per_page': 20,
      })
    })
  })

  describe('Primary Channels Tab', () => {
    it('should get primary channels with bot channels', async () => {
      store.dispatch(setMeta({
        key: foldersMock[0].id,
        value: { page: 1, per_page: 10, total: 3 },
      }))

      await act(async () => {
        hookResult = await renderHook({ folderType: MessagesType.PRIMARY })
      })

      const result: GetChannelsHook = hookResult.current

      expect(getChannelsMock).not.toHaveBeenCalled()
      expect(result.channelsIds).toContain(channelWithParticipantsTypePersonal.id)
      expect(result.channelsIds).toContain(channelWithBotParticipantMock.id)
      expect(result.areChannelsLoading).toStrictEqual(false)
      expect(result.hasNextPage).toStrictEqual(false)
    })

    it('should compare loaded channels with primary channels total count', async () => {
      store.dispatch(setMeta({
        key: foldersMock[0].id,
        value: { page: 1, per_page: 10, total: 30 },
      }))

      await act(async () => {
        hookResult = await renderHook({ folderType: MessagesType.PRIMARY })
      })

      const result: GetChannelsHook = hookResult.current

      expect(result.hasNextPage).toStrictEqual(true)
    })

    it('should call load next page function for primary channels', async () => {
      store.dispatch(setMeta({
        key: foldersMock[0].id,
        value: { page: 1, per_page: 10, total: 30 },
      }))

      await act(async () => {
        hookResult = await renderHook({ folderType: MessagesType.PRIMARY })
      })

      const result: GetChannelsHook = hookResult.current

      expect(result.hasNextPage).toStrictEqual(true)

      await act(async () => {
        result.loadNextPage()
      })

      expect(getChannelsMock).toHaveBeenCalledWith({
        'folder_ids': [foldersMock[0].id],
        'channelTypes': [ChannelType.PERSONAL, ChannelType.MULTI],
        'page': 2,
        'per_page': 20,
      })
    })
  })

  describe('Other Channels Tab', () => {
    it('should get other channels with bot channels', async () => {
      store.dispatch(setMeta({
        key: foldersMock[1].id,
        value: { page: 1, per_page: 10, total: 1 },
      }))

      await act(async () => {
        hookResult = await renderHook({ folderType: MessagesType.OTHER })
      })

      const result: GetChannelsHook = hookResult.current

      expect(getChannelsMock).not.toHaveBeenCalled()
      expect(result.channelsIds).toEqual([channelWithParticipantsTypeOther.id])
      expect(result.areChannelsLoading).toStrictEqual(false)
      expect(result.hasNextPage).toStrictEqual(false)
    })

    it('should compare loaded channels with other channels total count', async () => {
      store.dispatch(setMeta({
        key: foldersMock[1].id,
        value: { page: 1, per_page: 10, total: 30 },
      }))

      await act(async () => {
        hookResult = await renderHook({ folderType: MessagesType.OTHER })
      })

      const result: GetChannelsHook = hookResult.current

      expect(result.hasNextPage).toStrictEqual(true)
    })

    it('should call load next page function for other channels', async () => {
      store.dispatch(setMeta({
        key: foldersMock[1].id,
        value: { page: 1, per_page: 10, total: 50 },
      }))

      await act(async () => {
        hookResult = await renderHook({ folderType: MessagesType.OTHER })
      })

      const result: GetChannelsHook = hookResult.current

      expect(result.hasNextPage).toStrictEqual(true)

      await act(async () => {
        result.loadNextPage()
      })

      expect(getChannelsMock).toHaveBeenCalledWith({
        folder_ids: ['24701'],
        device_id: undefined,
        channelTypes: [ChannelType.PERSONAL, ChannelType.MULTI],
        page: 2,
        per_page: 20,
      })
    })
  })
})
