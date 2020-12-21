import React from 'react'
import { mocked } from 'ts-jest/utils'
import { render, RenderResult } from '../../../../tests/test_utils'
import { MeetingsProps } from '../interfaces'
import { useAppState } from '../providers/app_state_provider'
import { MeetingHandler } from './meeting_handler'

jest.mock('../providers/app_state_provider')

jest.mock('../../global/overlay', () => ({
  Overlay: jest.fn().mockReturnValue(<div data-testid='overlay'></div>),
}))

jest.mock('../views', () => ({
  Meeting: jest.fn().mockReturnValue(<div data-testid='meeting'></div>),
}))

describe('MeetingHandler', () => {
  const useAppMock: jest.Mock = mocked(useAppState)

  const initialProps: MeetingsProps = {
    onNoMeetingRedirect: jest.fn(),
    handleMeetingRequest: jest.fn(),
    getAttendeeCallback: jest.fn(),
    onMeetingEnd: jest.fn(),
  }

  it('should render Overlay when meetingId from useAppState is null', () => {
    useAppMock.mockReturnValue({
      meetingId: null,
    })
    const renderResult: RenderResult = render(<MeetingHandler {...initialProps} />)
    const meeting: Element | null = renderResult.queryByTestId('meeting')
    const overlay: Element | null = renderResult.queryByTestId('overlay')

    expect(overlay).not.toBeNull()
    expect(meeting).toBeNull()
  })

  it('should render Meeting when meetingId from useAppState has a value - meeting already loaded', () => {
    useAppMock.mockReturnValue({
      meetingId: 'some-meet-uuid',
    })
    const renderResult: RenderResult = render(<MeetingHandler {...initialProps} />)
    const meeting: Element | null = renderResult.queryByTestId('meeting')
    const overlay: Element | null = renderResult.queryByTestId('overlay')

    expect(overlay).toBeNull()
    expect(meeting).not.toBeNull()
  })
})
