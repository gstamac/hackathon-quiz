import { HookResult } from '@testing-library/react-hooks'
import { getMockStoreCreator, testCustomHook, TestCustomHookType } from '../../../../tests/test_utils'
import channelsReducer from '../../../store/channels_slice/channels_slice'
import { UseFetchMembersParams, UseFetchMembersResult } from './interfaces'
import { useFetchMembers } from './use_fetch_members'
import * as store from '../../../store'
import { getChannelMembers } from '../../../services/api/channels_api'
import { MessagesType } from '../interfaces'
import { groupChannelMock, membersMock, toChannelWithParsedMessage } from '../../../../tests/mocks/channels_mock'
import { mocked } from 'ts-jest/utils'

jest.mock('../../../store')
jest.mock('../../../services/api/channels_api')

interface StoreTypeMock {
  channels: ReturnType<typeof channelsReducer>
}

const createMockedStore = getMockStoreCreator<StoreTypeMock>()

describe('useFetchMembers', () => {

  const memberUuids: string[] = ['uuid1', 'uuid2', 'uuid3']

  const getChannelMembersMock = mocked(getChannelMembers)

  const defaultParams: UseFetchMembersParams = {
    memberUuids,
    open: true,
    channelId: 'channelId',
  }

  const defaultChannelsStore: ReturnType<typeof channelsReducer> = {
    isFetching: {},
    errors: {},
    channels: {},
    members: {},
    folders: [],
    isFetchingAll: true,
    meta: {},
    fileTokens: {},
    fileTokensFetching: {},
    lastVisitedFolder: {
      folderType: MessagesType.PRIMARY,
      groupUuid: undefined,
      channelId: undefined,
    },
  }

  const mockStore = (state?: Partial<ReturnType<typeof channelsReducer>>): void => {
    const mockedStore = createMockedStore({
      channels: {
        ...defaultChannelsStore,
        ...state,
      },
    })

    // eslint-disable-next-line no-import-assign
    Object.defineProperty(store, 'store', {
      value: mockedStore,
    })
  }

  const getHookResult: TestCustomHookType<UseFetchMembersParams, UseFetchMembersResult>
    = testCustomHook(useFetchMembers, defaultParams)

  it('should return isFethcing true when isFetching is true in store', async () => {
    mockStore({
      isFetching: {
        ['members-channelId']: true,
      },
    })

    const result: HookResult<UseFetchMembersResult> = await getHookResult({})

    expect(result.current.isFetching).toEqual(true)
  })

  it('should return isLoading true when number of fetched members is 0', async () => {
    mockStore({
      channels: {
        channelId: {
          channel: toChannelWithParsedMessage(groupChannelMock),
          members: [],
        },
      },
    })

    const result: HookResult<UseFetchMembersResult> = await getHookResult({})

    expect(result.current.isFetching).toEqual(false)
    expect(result.current.isLoading).toEqual(true)
  })

  it('should return members from store', async () => {
    mockStore({
      members: membersMock,
    })

    const result: HookResult<UseFetchMembersResult> = await getHookResult({})

    expect(result.current.members).toEqual(membersMock)
  })

  it('should dispatch fetchMembers when open is true and all members are not yet fetched', async () => {
    mockStore({
      members: membersMock,
    })

    await getHookResult({})

    expect(getChannelMembersMock).toHaveBeenCalledTimes(1)
  })
})
