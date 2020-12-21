import { MeetingEndCallback } from './../interfaces'
import { testCustomHook, TestCustomHookType, actHook } from '../../../../tests/test_utils'
import { cleanup } from '@testing-library/react-hooks'
import * as amazonChime from 'amazon-chime-sdk-component-library-react'
import { useMeetingEndRedirect } from './use_meeting_end_redirect'
import { getString } from '../../../utils'

const mockGoBack: jest.Mock = jest.fn()

jest.mock('amazon-chime-sdk-component-library-react')
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    goBack: mockGoBack,
  }),
}))

const getHookResult: TestCustomHookType<MeetingEndCallback, void>
  = testCustomHook(useMeetingEndRedirect, { onMeetingEnd: mockGoBack })

const renderHook = async (): Promise<void> => {
  await actHook(async () => {
    await getHookResult({})
  })
}

describe('useMeetingEndRedirect tests', () => {
  const useNotificationDispatchMock: jest.Mock = jest.fn()
  const useMeetingStatusMock: jest.Mock = jest.fn()

  const notificationDispatchMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (<jest.Mock> amazonChime.useNotificationDispatch) = useNotificationDispatchMock;
    (<jest.Mock> amazonChime.useMeetingStatus) = useMeetingStatusMock
  })

  beforeEach(() => {
    useNotificationDispatchMock.mockReturnValue(notificationDispatchMock)
  })

  afterEach(async () => {
    await cleanup()
    jest.clearAllMocks()
  })

  it('should call dispatch with params to end meeting and redirect back when MeetingStatus is Ended', async () => {
    useMeetingStatusMock.mockReturnValue(amazonChime.MeetingStatus.Ended)

    await renderHook()

    expect(notificationDispatchMock).toHaveBeenCalledTimes(1)
    expect(notificationDispatchMock).toHaveBeenCalledWith({
      type: amazonChime.ActionType.ADD,
      payload: {
        severity: amazonChime.Severity.INFO,
        message: getString('meeting-ended-message'),
        autoClose: true,
        replaceAll: true,
      },
    })
    expect(mockGoBack).toHaveBeenCalledTimes(1)
  })

  it('should not call dispatch and redirect back when MeetingStatus is not Ended', async () => {
    useMeetingStatusMock.mockReturnValue(amazonChime.MeetingStatus.Succeeded)

    await renderHook()

    expect(notificationDispatchMock).toHaveBeenCalledTimes(0)
    expect(mockGoBack).toHaveBeenCalledTimes(0)
  })
})
