import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { render } from '../../../../../tests/test_utils'
import { NavigationControl } from './navigation_control'
import * as navigation from '.'
import * as navigationProvider from '../../providers/navigation_provider'
import * as meetingRoster from '../meeting_roster'

jest.mock('../../providers/navigation_provider')
jest.mock('../meeting_roster')
jest.mock('.')

describe('Navigation Control tests', () => {
  let renderResult: RenderResult
  const useNavigationMock = jest.fn()

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(
        <NavigationControl/>
      )
    })
  }

  beforeEach(() => {
    (navigationProvider.useNavigation as jest.Mock) = useNavigationMock;
    (meetingRoster.MeetingRoster as jest.Mock) = jest.fn().mockReturnValue(<div>MeetingRoster</div>);
    (navigation.Navigation as jest.Mock) = jest.fn().mockReturnValue(<div>Navigation</div>)
  })
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render navigation bar component', async () => {
    useNavigationMock.mockReturnValue({ showNavbar: true, showRoster: false })
    renderComponent()

    const navbarElement: Element = renderResult.getByText('Navigation')
    const meetingRosterElement: Element | null = renderResult.queryByText('MeetingRoster')

    expect(navbarElement).toBeDefined()
    expect(meetingRosterElement).toBeNull()
  })

  it('should render meeting roster component', async () => {
    useNavigationMock.mockReturnValue({ showNavbar: false, showRoster: true })
    renderComponent()

    const navbarElement: Element | null = renderResult.queryByText('Navigation')
    const meetingRosterElement: Element = renderResult.getByText('MeetingRoster')

    expect(navbarElement).toBeNull()
    expect(meetingRosterElement).toBeDefined()
  })

  it('should render meeting and navigation components', async () => {
    useNavigationMock.mockReturnValue({ showNavbar: true, showRoster: true })
    renderComponent()

    const navbarElement: Element = renderResult.getByText('Navigation')
    const meetingRosterElement: Element = renderResult.getByText('MeetingRoster')

    expect(navbarElement).toBeDefined()
    expect(meetingRosterElement).toBeDefined()
  })
})
