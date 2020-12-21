import React from 'react'
import { render, act, RenderResult, cleanup } from '../../../../tests/test_utils'
import { NoMeetingRedirect } from './no_meeting_redirect'
import * as amazonChime from 'amazon-chime-sdk-component-library-react'
import * as appStateProvider from '../providers/app_state_provider'
import { Route } from 'react-router-dom'
import { history } from '../../../store'
import { JoinInfo, MeetingsProps } from '../interfaces'
import { mocked } from 'ts-jest/utils'
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js'

jest.mock('amazon-chime-sdk-component-library-react')
jest.mock('../providers/app_state_provider')

describe('NoMeetingRedirect tests', () => {
  let renderResult: RenderResult
  const onNoMeetingRedirectMock: jest.Mock = jest.fn()
  const handleMeetingRequestMock: jest.Mock = jest.fn()
  const getAttendeeCallbackMock: jest.Mock = jest.fn().mockResolvedValue({ name: 'name' })
  const useMeetingManagerMock: jest.Mock = mocked(amazonChime.useMeetingManager)
  const useNotificationDispatchMock: jest.Mock = mocked(amazonChime.useNotificationDispatch)
  const useAppStateMock: jest.Mock = mocked(appStateProvider.useAppState)
  const setAppMeetingInfoMock: jest.Mock = jest.fn()
  const initializeMeetingSessionMock: jest.Mock = jest.fn()
  const useMeetingManagerStartMock: jest.Mock = jest.fn()

  const props: MeetingsProps = {
    onNoMeetingRedirect: onNoMeetingRedirectMock,
    handleMeetingRequest: handleMeetingRequestMock,
    getAttendeeCallback: getAttendeeCallbackMock,
    onMeetingEnd: jest.fn(),
  }

  beforeEach(() => {
    useAppStateMock.mockReturnValue({ setAppMeetingInfo: setAppMeetingInfoMock })
    useNotificationDispatchMock.mockReturnValue(() => jest.fn())
  })

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  const renderComponent = async (): Promise<void> => {
    await act(async () => {
      renderResult = render(
        <Route path={'/app/messages/:channelId?/meetings/:meetingId?'}>
          <NoMeetingRedirect {...props}>
            <div>Meeting</div>
          </NoMeetingRedirect>
        </Route>
      )
    })
    history.push('/app/messages/channelId/meetings/meetingId')
  }

  it('should render provided children component', async () => {
    useMeetingManagerMock.mockReturnValue({ getAttendee: '' })
    await renderComponent()

    const childElement: Element = renderResult.getByText('Meeting')

    expect(childElement).toBeDefined()
  })

  it('should call initializeMeetingSession function when meetingSession and meeting id is provided', async () => {
    useMeetingManagerMock.mockReturnValue({
      getAttendee: '',
      meetingSession: false,
      initializeMeetingSession: initializeMeetingSessionMock,
      start: useMeetingManagerStartMock,
    })

    getAttendeeCallbackMock.mockResolvedValue({ name: 'name' })

    const joinInfoReponse: JoinInfo = {
      attendee: {
        AttendeeId: 'AttendeeId',
        ExternalUserId: 'ExternalUserId',
      },
      meeting: {
        ExternalMeetingId: 'string',
        MediaPlacement: {
          AudioFallbackUrl: 'string',
          AudioHostUrl: 'string',
          ScreenDataUrl: 'string',
          ScreenSharingUrl: 'string',
          ScreenViewingUrl: 'string',
          SignalingUrl: 'string',
          TurnControlUrl: 'string',
        },
        MediaRegion: 'string',
        MeetingId: 'string',
        Title: 'string',
      },
    }

    const config: MeetingSessionConfiguration = new MeetingSessionConfiguration(joinInfoReponse.meeting, joinInfoReponse.attendee)

    config.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = true

    handleMeetingRequestMock.mockResolvedValue(joinInfoReponse)

    await renderComponent()

    expect(getAttendeeCallbackMock).toHaveBeenCalledWith('AttendeeId', 'ExternalUserId')
    expect(JSON.stringify(initializeMeetingSessionMock.mock.calls[0][0]))
      .toBe(JSON.stringify(config))
    expect(useMeetingManagerStartMock).toHaveBeenCalled()
    expect(setAppMeetingInfoMock).toHaveBeenCalled()
  })

  it('should call onNoMeetingRedirect function when handleMeetingRequest failed', async () => {
    useMeetingManagerMock.mockReturnValue({
      getAttendee: '',
      meetingSession: false,
      join: initializeMeetingSessionMock,
      start: useMeetingManagerStartMock,
    })

    handleMeetingRequestMock.mockRejectedValue({})

    await renderComponent()

    expect(getAttendeeCallbackMock).not.toHaveBeenCalled()
    expect(onNoMeetingRedirectMock).toHaveBeenCalled()
  })

  it('should call onNoMeetingRedirect and dispatch function when meetingSession is true', async () => {
    useMeetingManagerMock.mockReturnValue({
      getAttendee: '',
      meetingSession: true,
      join: initializeMeetingSessionMock,
      start: useMeetingManagerStartMock,
    })
    useNotificationDispatchMock.mockReturnValue(useNotificationDispatchMock)

    await renderComponent()

    expect(useNotificationDispatchMock).toHaveBeenCalled()
    expect(onNoMeetingRedirectMock).toHaveBeenCalled()
  })
})
