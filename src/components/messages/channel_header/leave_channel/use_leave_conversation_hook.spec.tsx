import { RenderHookResult, act, renderHook, cleanup } from '@testing-library/react-hooks'
import { useLeaveConversationHook } from './use_leave_conversation_hook'
import * as api from '../../../../services/api/channels_api'
import * as helpers from '../../messenger_chat/chat_message_cards/helpers'
import { LeaveChannelHook, LeaveChannelHookProps } from './interfaces'
import { channelWithOneParticipantMock } from '../../../../../tests/mocks/channels_mock'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from '../../../../store'

jest.mock('../../../../services/api/channels_api')
jest.mock('../../messenger_chat/chat_message_cards/helpers')

const wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element => <Provider store={store}>{children}</Provider>

describe('useLeaveConversationHook', () => {
  const leaveFromChannelMock: jest.Mock = jest.fn()
  const toastHandlerMock: jest.Mock = jest.fn()
  let renderHookResult: RenderHookResult<LeaveChannelHookProps, LeaveChannelHook>

  beforeEach(async () => {
    (api.leaveFromChannel as jest.Mock) = leaveFromChannelMock.mockResolvedValue(channelWithOneParticipantMock);
    (helpers.toastHandler as jest.Mock) = toastHandlerMock.mockReturnValue(undefined)

    await act(async () => {
      renderHookResult = renderHook(() => useLeaveConversationHook({ channelId: 'channel_id' }), { wrapper })
    })
  })

  afterEach(async () => {
    await cleanup()
    jest.resetAllMocks()
  })

  it('should leave conversation by calling handleLeaveChannel function', async () => {
    await act(async () => {
      await renderHookResult.result.current.handleLeaveChannel()
    })
    expect(leaveFromChannelMock).toHaveBeenCalledWith('channel_id')
    expect(toastHandlerMock).toHaveBeenCalled()
  })

  it('should change dialog state by calling openLeaveChannelDialog function', async () => {
    await act(async () => {
      renderHookResult.result.current.openLeaveChannelDialog()
    })
    expect(renderHookResult.result.current.leaveChannelDialogOpen).toEqual(true)
  })

  it('should change dialog state by calling closeLeaveChannelDialog function', async () => {
    await act(async () => {
      renderHookResult.result.current.closeLeaveChannelDialog()
    })
    expect(renderHookResult.result.current.leaveChannelDialogOpen).toEqual(false)
  })
})
