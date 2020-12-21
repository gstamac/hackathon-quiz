import { act, cleanup, HookResult } from '@testing-library/react-hooks'
import { useChannelHeader } from './use_channel_header'
import { UseChannelHeaderResponse, ChannelHeaderHookProps } from './interfaces'
import { testCustomHook, TestCustomHookType } from '../../../../tests/test_utils'

describe('useChannelHeader', () => {
  let renderHookResult: HookResult<UseChannelHeaderResponse>

  const getHookResult: TestCustomHookType<ChannelHeaderHookProps, UseChannelHeaderResponse>
    = testCustomHook(useChannelHeader, { channelId: 'channel_id' })

  beforeEach(async () => {
    renderHookResult = (await getHookResult({}))
  })

  afterEach(async () => {
    await cleanup()
    jest.resetAllMocks()
  })

  it('should change state after calling openChannelSettings function', async () => {
    await act(async () => {
      renderHookResult.current.openChannelSettings()
    })

    expect(renderHookResult.current.channelSettingsOpen).toEqual(true)
  })

  it('should change state after calling closeChannelSettings function', async () => {
    await act(async () => {
      renderHookResult.current.closeChannelSettings()
    })
    expect(renderHookResult.current.channelSettingsOpen).toEqual(false)
  })

  it('should change state after calling openMembersSidebar function', async () => {
    await act(async () => {
      renderHookResult.current.openMembersSidebar()
    })
    expect(renderHookResult.current.membersSidebarOpen).toEqual(true)
  })

  it('should change state after calling closeMembersSidebar function', async () => {
    await act(async () => {
      renderHookResult.current.closeMembersSidebar()
    })
    expect(renderHookResult.current.membersSidebarOpen).toEqual(false)
  })
})
