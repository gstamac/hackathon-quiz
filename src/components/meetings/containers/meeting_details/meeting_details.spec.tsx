import React from 'react'
import { render, screen } from '../../../../../tests/test_utils'
import { MeetingDetails } from './meeting_details'
import { getString } from '../../../../utils'
import * as chimeComponentLib from 'amazon-chime-sdk-component-library-react'
import * as appStateProvider from '../../providers/app_state_provider'
import { HeadingProps } from 'amazon-chime-sdk-component-library-react/lib/components/ui/Heading'

jest.mock('../../providers/app_state_provider', () => ({
  useAppState: jest.fn().mockReturnValue({}),
}))

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('amazon-chime-sdk-component-library-react') as {},
  useMeetingManager: jest.fn().mockReturnValue({}),
  Heading: jest.fn().mockImplementation((props: HeadingProps) => <h1>{props.children}</h1>),
}))

const useAppStateHookSpy: jest.SpyInstance = jest.spyOn(appStateProvider, 'useAppState')
const useMeetingManagerHookSpy: jest.SpyInstance = jest.spyOn(chimeComponentLib, 'useMeetingManager')

describe('MeetingDetails', () => {
  const MOCK_MEETING_ID: string = 'random_meeting_id'
  const MOCK_MEETING_REGION_NAME: string = 'random_region_name'

  const renderComponent = (): void => {
    render(<MeetingDetails />)
  }

  it('should render', () => {
    renderComponent()

    const componentTitle: string = getString('meeting-information')

    expect(screen.getByText(componentTitle)).toBeInTheDocument()
  })

  it('should show the meeting ID', () => {

    useAppStateHookSpy.mockReturnValueOnce({ meetingId: MOCK_MEETING_ID })
    renderComponent()

    expect(screen.getByText(new RegExp(MOCK_MEETING_ID))).toBeInTheDocument()
  })

  it('should show the meeting region', () => {
    useMeetingManagerHookSpy.mockReturnValueOnce({ meetingRegion: MOCK_MEETING_REGION_NAME })
    renderComponent()

    expect(screen.getByText(new RegExp(MOCK_MEETING_REGION_NAME))).toBeInTheDocument()
  })
})
