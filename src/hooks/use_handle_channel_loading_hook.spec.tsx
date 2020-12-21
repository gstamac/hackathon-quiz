import { store } from '../store'
import { useHandleChannelLoading } from './use_handle_channel_loading_hook'
import { groupChannelMock, foldersResponseMock } from '../../tests/mocks/channels_mock'
import * as channelsApi from '../services/api/channels_api'
import * as channelHelpers from '../utils/channel_helpers'
import { setChannel, fetchFolders } from '../store/channels_slice/channels_slice'
import { RESET_STORE_ACTION } from '../constants'
import { testCustomHook, TestCustomHookType, actHook } from '../../tests/test_utils'
import { HandleChannelLoadingParams } from './interfaces'

jest.mock('../services/api/channels_api')
jest.mock('../utils/channel_helpers')
jest.mock('@reduxjs/toolkit', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('@reduxjs/toolkit') as {},
  unwrapResult: jest.fn().mockReturnValue([]),
}))
jest.useFakeTimers()

const getHookResult: TestCustomHookType<HandleChannelLoadingParams, boolean> = (
  testCustomHook(useHandleChannelLoading, { channelId: groupChannelMock.id }, {
    path: '/test/:channel_id',
    historyPath: `/test/${groupChannelMock.id}`,
  })
)

describe('useHandleChannelLoading hook tests', () => {

  const getChannelMock: jest.Mock = jest.fn()
  const getFoldersMock: jest.Mock = jest.fn()
  const goToChannelMock: jest.Mock = jest.fn()
  const clearTimeoutMock: jest.Mock = jest.fn()

  beforeAll(async () => {
    (channelsApi.getChannel as jest.Mock) = getChannelMock;
    (channelsApi.getFolders as jest.Mock) = getFoldersMock;
    (channelHelpers.goToChannel as jest.Mock) = goToChannelMock;
    (clearTimeout as jest.Mock) = clearTimeoutMock
    clearTimeoutMock.mockClear()

    getFoldersMock.mockResolvedValue(foldersResponseMock)

    store.dispatch({ type: RESET_STORE_ACTION })
    await store.dispatch<any>(fetchFolders({ page: 1, per_page: 20 }))
  })

  beforeEach(() => {
    getChannelMock.mockResolvedValue(groupChannelMock)
    clearTimeoutMock.mockClear()
  })

  afterEach(async () => {
    jest.resetAllMocks()
    clearTimeoutMock.mockClear()
    await actHook(async () => {
      store.dispatch({ type: RESET_STORE_ACTION })
    })

  })

  it('should fetch channel after 1 second if the channel is undefined', async () => {

    await getHookResult({})

    expect(getChannelMock).toHaveBeenCalledTimes(0)

    await actHook(async () => {
      jest.runAllTimers()
    })

    expect(getChannelMock).toHaveBeenCalledTimes(1)
  })

  it('should cancel timeout and redirect when channel becomes defined', async () => {

    await getHookResult({})

    expect(getChannelMock).toHaveBeenCalledTimes(0)
    expect(clearTimeoutMock).toHaveBeenCalledTimes(1)

    await actHook(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await store.dispatch<any>(setChannel(groupChannelMock))
    })

    await actHook(async () => {
      jest.runAllTimers()
    })

    expect(clearTimeoutMock).toHaveBeenCalledTimes(2)
    expect(goToChannelMock).toHaveBeenCalledTimes(2)
  })

  it('should not fetch channel or set timeout when channel is already defined',async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await store.dispatch<any>(setChannel(groupChannelMock))

    await getHookResult({})

    expect(getChannelMock).toHaveBeenCalledTimes(0)

    await actHook(async () => {
      jest.runAllTimers()
    })

    expect(clearTimeout).toHaveBeenCalledTimes(1)
    expect(goToChannelMock).toHaveBeenCalledTimes(2)
  })
})
