import React from 'react'
import { render, act, RenderResult, cleanup, mockComponentWithChildren } from '../../../../tests/test_utils'
import { MeetingRoster } from './meeting_roster'
import * as navigationProvider from '../providers/navigation_provider'

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('amazon-chime-sdk-component-library-react') as {},
  Roster: mockComponentWithChildren('Roster'),
  RosterHeader: mockComponentWithChildren('RosterHeader'),
  RosterGroup: mockComponentWithChildren('RosterGroup'),
  RosterAttendee: mockComponentWithChildren('RosterAttendee'),
  useRosterState: jest.fn().mockReturnValue({
    roster: {
      attendees: [{ name: 'attendees' }],
    },
  }),
}))

jest.mock('../providers/navigation_provider')

describe('MeetingRoster tests', () => {
  let renderResult: RenderResult
  const navigationProviderMock: jest.Mock = jest.fn()
  const closeRosterMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (navigationProvider.useNavigation as jest.Mock) = navigationProviderMock
  })

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  const renderComponent = async (): Promise<void> => {
    await act(async () => {
      renderResult = render(<MeetingRoster/>)
    })
  }

  it('should render Roster component', async () => {
    navigationProviderMock.mockReturnValue({ closeRoster: closeRosterMock })

    await renderComponent()

    const rosterElement = renderResult.getByTestId('Roster')
    const rosterHeaderElement = renderResult.getByTestId('RosterHeader')
    const rosterGroupElement = renderResult.getByTestId('RosterGroup')

    expect(rosterElement).toBeDefined()
    expect(rosterHeaderElement).toBeDefined()
    expect(rosterGroupElement).toBeDefined()
    expect(navigationProviderMock).toHaveBeenCalled()
  })
})
