import { ChannelIdProps } from './../../interfaces'
import { mocked } from 'ts-jest/utils'
import { HookResult, act, cleanup } from '@testing-library/react-hooks'
import { meetingMock } from '../../../../tests/mocks/meetings_mocks'
import { testCustomHook, TestCustomHookType } from '../../../../tests/test_utils'
import * as messagingApi from '../../../services/api/messaging_api'
import { store } from '../../../store'
import { setMeeting } from '../../../store/meetings_slice'
import { UseVideoCallResponse } from './interfaces'
import { useInitVideoCall } from './use_init_video_call'

jest.mock('../../../services/api/messaging_api')

describe('useInitVideoCall', () => {
  let createMeetingMock: jest.Mock = jest.fn()
  let renderHookResult: HookResult<UseVideoCallResponse>
  const openMock: jest.Mock = jest.fn()

  window.open = openMock

  const getHookResult: TestCustomHookType<ChannelIdProps, UseVideoCallResponse>
  = testCustomHook(useInitVideoCall, { channelId: 'channel_id' })

  beforeEach(async () => {
    renderHookResult = await getHookResult({})
  })

  afterEach(async () => {
    await cleanup()
    jest.resetAllMocks()
  })

  beforeAll(() => {
    createMeetingMock = mocked(messagingApi.createMeeting)

    store.dispatch(setMeeting({
      key: 'meeting_id',
      value: meetingMock,
    }))
  })

  it('should create new meeting and open new window', async () => {
    createMeetingMock.mockResolvedValue(meetingMock)

    await act(async () => {
      await renderHookResult.current.initiateVideoCallCallback()
    })

    expect(createMeetingMock).toHaveBeenCalledWith('channel_id')
    expect(openMock).toHaveBeenCalledWith('/app/messages/channel_id/meetings/meeting_id')
  })

  it('should open new window when no new meeting was created', async () => {
    createMeetingMock.mockResolvedValue(undefined)

    await act(async () => {
      await renderHookResult.current.initiateVideoCallCallback()
    })

    expect(createMeetingMock).toHaveBeenCalledWith('channel_id')
    expect(openMock).not.toHaveBeenCalledWith('/app/messages/channel_id/meetings/meeting_id')
  })
})
