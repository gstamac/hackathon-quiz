import React from 'react'
import { render, mockComponentWithChildren } from '../../../tests/test_utils'
import { cleanup, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { Meetings } from '.'
import { MeetingsProps } from './interfaces'

jest.mock('./providers/app_state_provider', () => ({
  AppStateProvider: mockComponentWithChildren('AppStateProvider'),
}))

jest.mock('./theme', () => ({
  Theme: mockComponentWithChildren('Theme'),
}))

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  NotificationProvider: mockComponentWithChildren('NotificationProvider'),
  MeetingProvider: mockComponentWithChildren('MeetingProvider'),
}))

jest.mock('./containers/notifications', () => ({
  Notifications: jest.fn().mockReturnValue(<div data-testid='Notifications' />),
}))

jest.mock('./providers/error_provider', () => ({
  ErrorProvider: mockComponentWithChildren('ErrorProvider'),
}))

jest.mock('./providers/navigation_provider', () => ({
  NavigationProvider: mockComponentWithChildren('NavigationProvider'),
}))

jest.mock('./containers/no_meeting_redirect', () => ({
  NoMeetingRedirect: mockComponentWithChildren('NoMeetingRedirect'),
}))

jest.mock('./containers/meeting_handler', () => ({
  MeetingHandler: jest.fn().mockReturnValue(<div data-testid='MeetingHandler' />),
}))

describe('Meetings', () => {
  let renderResult: RenderResult

  const props: MeetingsProps = {
    getAttendeeCallback: jest.fn(),
    handleMeetingRequest: jest.fn(),
    onNoMeetingRedirect: jest.fn(),
    onMeetingEnd: jest.fn(),
  }

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(<Meetings { ...props }/>)
    })
  }

  beforeEach(() => {
    renderComponent()
  })

  afterEach(() => {
    cleanup()
  })

  it('should render Meetings component with mocked child components in the right hierarchy', () => {
    const appStateProvider: Element = renderResult.getByTestId('AppStateProvider')

    expect(appStateProvider).toBeDefined()

    const theme: Element = renderResult.getByTestId('Theme')

    expect(theme).toBeDefined()
    expect(appStateProvider.children[0].getAttribute('data-testId')).toEqual('Theme')

    const notificationProvider: Element = renderResult.getByTestId('NotificationProvider')

    expect(notificationProvider).toBeDefined()
    expect(theme.children[0].getAttribute('data-testId')).toEqual('NotificationProvider')

    const notifications: Element = renderResult.getByTestId('Notifications')

    expect(notifications).toBeDefined()
    expect(notificationProvider.children[0].getAttribute('data-testId')).toEqual('Notifications')

    const errorProvider: Element = renderResult.getByTestId('ErrorProvider')

    expect(errorProvider).toBeDefined()
    expect(notificationProvider.children[1].getAttribute('data-testId')).toEqual('ErrorProvider')

    const meetingProvider: Element = renderResult.getByTestId('MeetingProvider')

    expect(meetingProvider).toBeDefined()
    expect(errorProvider.children[0].getAttribute('data-testId')).toEqual('MeetingProvider')

    const navigationProvider: Element = renderResult.getByTestId('NavigationProvider')

    expect(navigationProvider).toBeDefined()
    expect(meetingProvider.children[0].getAttribute('data-testId')).toEqual('NavigationProvider')

    const noMeetingRedirect: Element = renderResult.getByTestId('NoMeetingRedirect')

    expect(noMeetingRedirect).toBeDefined()
    expect(navigationProvider.children[0].getAttribute('data-testId')).toEqual('NoMeetingRedirect')

    const meetingHandler: Element = renderResult.getByTestId('MeetingHandler')

    expect(meetingHandler).toBeDefined()
    expect(noMeetingRedirect.children[0].getAttribute('data-testId')).toEqual('MeetingHandler')

  })
})
