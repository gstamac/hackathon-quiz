import { cleanup, RenderResult } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, userEvent } from '../../../../tests/test_utils'
import { NavigationContextType } from './interfaces'
import { NavigationContext, NavigationProvider } from './navigation_provider'

const mockLeaveMeeting: jest.Mock = jest.fn()

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('amazon-chime-sdk-component-library-react') as {},
  useMeetingManager: () => ({ leave: mockLeaveMeeting }),
}))

jest.mock('react-router-dom', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('react-router-dom') as {},
  useLocation: jest.fn().mockReturnValue({ pathname: 'meeting' }),
}))

describe('NavigationProvider tests', () => {
  let renderResult: RenderResult

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(<NavigationProvider>
        <div data-testid='ChildComponent' />
      </NavigationProvider>
      )
    })
  }

  afterEach(() => {
    cleanup()
  })

  it('should render child component', async () => {
    renderComponent()

    const component: Element = renderResult.getByTestId('ChildComponent')

    expect(component).toBeDefined()
  })

  it('should open and toggle rooster', async () => {
    const TestComponent = (): JSX.Element => {
      const { showRoster, toggleRoster, openRoster }: NavigationContextType
      = React.useContext(NavigationContext) as NavigationContextType

      return (
        <>
          <div>{showRoster === true ? 'shown' : 'hidden'}</div>
          <button onClick={toggleRoster}>ToggleRoster</button>
          <button onClick={openRoster}>OpenRoster</button>
        </>
      )
    }

    const wrapper = render(<NavigationProvider>
      <TestComponent />
    </NavigationProvider>
    )

    expect(wrapper.getByText('shown')).toBeDefined()

    userEvent.click(wrapper.getByText('ToggleRoster'))

    expect(wrapper.getByText('hidden')).toBeDefined()

    userEvent.click(wrapper.getByText('OpenRoster'))

    expect(wrapper.getByText('shown')).toBeDefined()

  })

  it('should open and close navbar', async () => {
    const TestComponent = (): JSX.Element => {
      const { showNavbar, openNavbar, closeNavbar }: NavigationContextType
       = React.useContext(NavigationContext) as NavigationContextType

      return (
        <>
          <div>{showNavbar === true ? 'shown' : 'hidden'}</div>
          <button onClick={openNavbar}>OpenNavbar</button>
          <button onClick={closeNavbar}>CloseNavbar</button>
        </>
      )
    }

    const wrapper = render(<NavigationProvider>
      <TestComponent />
    </NavigationProvider>
    )

    expect(wrapper.getByText('shown')).toBeDefined()

    userEvent.click(wrapper.getByText('CloseNavbar'))

    expect(wrapper.getByText('hidden')).toBeDefined()

    userEvent.click(wrapper.getByText('OpenNavbar'))

    expect(wrapper.getByText('shown')).toBeDefined()

  })

  it('should hide navbar and roster on smaller screen', async () => {
    const TestComponent = (): JSX.Element => {
      const { showNavbar, showRoster }: NavigationContextType
       = React.useContext(NavigationContext) as NavigationContextType

      return (
        <>
          <div>{showNavbar === true ? 'navbarShown' : 'navbarHidden'}</div>
          <div>{showRoster === true ? 'rosterShown' : 'rosterHidden'}</div>
        </>
      )
    }

    global.innerWidth = 500

    global.dispatchEvent(new Event('resize'))

    const wrapper = render(<NavigationProvider>
      <TestComponent />
    </NavigationProvider>
    )

    expect(wrapper.getByText('navbarHidden')).toBeDefined()

    expect(wrapper.getByText('rosterHidden')).toBeDefined()
  })

  it('should call meeting manager leave function', async () => {

    expect(mockLeaveMeeting).toBeDefined()
  })

})
