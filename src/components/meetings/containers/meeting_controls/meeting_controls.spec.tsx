import React from 'react'
import { render, act, RenderResult, cleanup, mockComponentWithChildren } from '../../../../../tests/test_utils'
import { MeetingControls } from './meeting_controls'
import * as navigationProvider from '../../providers/navigation_provider'
import { mocked } from 'ts-jest/utils'
import * as chime from 'amazon-chime-sdk-component-library-react'

jest.mock('../../providers/navigation_provider')

jest.mock('../end_meeting_control', () => ({
  EndMeetingControl: mockComponentWithChildren('EndMeetingControl'),
}))

jest.mock('../layout_control', () => ({
  LayoutControl: mockComponentWithChildren('LayoutControl'),
}))

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  ControlBar: mockComponentWithChildren('ControlBar'),
  AudioInputControl: mockComponentWithChildren('AudioInputControl'),
  VideoInputControl: mockComponentWithChildren('VideoInputControl'),
  ContentShareControl: mockComponentWithChildren('ContentShareControl'),
  AudioOutputControl: mockComponentWithChildren('AudioOutputControl'),
  ControlBarButton: mockComponentWithChildren('ControlBarButton'),
  Dots: mockComponentWithChildren('Dots'),
  useUserActivityState: jest.fn().mockReturnValue({ isUserActive: true }),
  useLocalVideo: jest.fn(),
}))

describe('MeetingControls tests', () => {
  let renderResult: RenderResult
  const useLocalVideoMock: jest.Mock = mocked(chime.useLocalVideo)
  const useNavigationMock: jest.Mock = mocked(navigationProvider.useNavigation)

  beforeEach(() => {
    useNavigationMock.mockReturnValue({})
    useLocalVideoMock.mockReturnValue({
      toggleVideo: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    cleanup()
  })

  const renderComponent = async (): Promise<void> => {
    await act(async () => {
      renderResult = render(<MeetingControls onMeetingEnd={jest.fn()}/>)
    })
  }

  it('should render MeetingControls component', async () => {
    await renderComponent()

    const controlBarElement: Element = renderResult.getByTestId('ControlBar')
    const audioInputControlElement: Element = renderResult.getByTestId('AudioInputControl')
    const videoInputControlElement: Element = renderResult.getByTestId('VideoInputControl')
    const audioOutputControlElement: Element = renderResult.getByTestId('AudioOutputControl')
    const controlBarButtonElement: Element = renderResult.getByTestId('ControlBarButton')
    const contentShareControlElement: Element = renderResult.getByTestId('ContentShareControl')

    expect(controlBarElement).toBeDefined()
    expect(audioInputControlElement).toBeDefined()
    expect(videoInputControlElement).toBeDefined()
    expect(audioOutputControlElement).toBeDefined()
    expect(controlBarButtonElement).toBeDefined()
    expect(useNavigationMock).toHaveBeenCalled()
    expect(useLocalVideoMock).toHaveBeenCalled()
    expect(contentShareControlElement).toBeDefined()
  })
})
