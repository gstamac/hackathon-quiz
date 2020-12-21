import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { Meeting } from '.'
import { render } from '../../../../../tests/test_utils'
import * as UseMeetingEndRedirect from '../../hooks/use_meeting_end_redirect'
import * as NavigationProvider from '../../providers/navigation_provider'

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  UserActivityProvider: jest.fn().mockImplementation(({children}) => (
    <div data-testid='UserActivityProvider'>{children}</div>)
  ),
  VideoTileGrid: jest.fn().mockReturnValue(
    <div data-testid='VideoTileGrid' />
  ),
}))

jest.mock('../../containers/meeting_details', () => ({
  MeetingDetails: jest.fn().mockReturnValue(<div data-testid='MeetingDetails' />),
}))
jest.mock('../../containers/meeting_controls', () => ({
  MeetingControls: jest.fn().mockReturnValue(<div data-testid='MeetingControls' />),
}))
jest.mock('../../containers/navigation/navigation_control', () => ({
  NavigationControl: jest.fn().mockReturnValue(<div data-testid='NavigationControl' />),
}))
jest.mock('../../containers/device_permission_prompt', () => ({
  DevicePermissionPrompt: jest.fn().mockReturnValue(<div data-testid='DevicePermissionPrompt' />),
}))

jest.mock('../../providers/app_state_provider', () => ({
  useAppState: jest.fn().mockReturnValue(() => ({ layout: 'test'})),
}))

describe('Meetings - meeting view test', () => {
  let renderResult: RenderResult

  const useNavigationMock: jest.Mock = jest.fn()
  const useMeetingEndRedirectMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (NavigationProvider.useNavigation as jest.Mock) = useNavigationMock.mockReturnValue({ showNavbar: true, showRoster: true });
    (UseMeetingEndRedirect.useMeetingEndRedirect as jest.Mock) = useMeetingEndRedirectMock

    renderComponent()
  })

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(<Meeting onMeetingEnd={jest.fn()}/>)
    })
  }

  afterEach(() => {
    cleanup()
  })

  it('should render Meeting component', async () => {
    const component: Element = renderResult.getByTestId('UserActivityProvider')

    expect(component).toBeDefined()
  })

  it('should render Meeting component with mocked child components', async () => {
    const userActivityProvider: Element = renderResult.getByTestId('UserActivityProvider')
    const videoTileGrid: Element = renderResult.getByTestId('VideoTileGrid')
    const navigationControl: Element = renderResult.getByTestId('NavigationControl')
    const meetingControls: Element = renderResult.getByTestId('MeetingControls')
    const devicePermissionPrompt: Element = renderResult.getByTestId('DevicePermissionPrompt')

    expect(userActivityProvider).toBeDefined()
    expect(videoTileGrid).toBeDefined()
    expect(navigationControl).toBeDefined()
    expect(meetingControls).toBeDefined()
    expect(devicePermissionPrompt).toBeDefined()
  })

  it('should check if hooks are called', async () => {
    expect(useNavigationMock).toHaveBeenCalled()
    expect(useMeetingEndRedirectMock).toHaveBeenCalled()
  })
})
