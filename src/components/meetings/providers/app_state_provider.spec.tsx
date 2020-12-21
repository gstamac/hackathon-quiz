import { cleanup, RenderResult } from '@testing-library/react'
import React from 'react'
import { render, userEvent, act } from '../../../../tests/test_utils'
import { AppStateContext, AppStateProvider } from './app_state_provider'
import { AppStateValue } from './interfaces'

describe('AppStateProvider tests', () => {
  let renderResult: RenderResult

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(<AppStateProvider>
        <div data-testid='ChildComponent' />
      </AppStateProvider>
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

  it('should get theme from localStorage', async () => {
    renderComponent()

    expect(localStorage.getItem).toHaveBeenCalledWith('theme')
  })

  it('should toggle theme', async () => {
    const TestComponent = (): JSX.Element => {
      const { theme, toggleTheme }: AppStateValue = React.useContext(AppStateContext) as AppStateValue

      return (
        <>
          <div>{theme}</div>
          <button onClick={toggleTheme}>ToggleTheme</button>
        </>
      )
    }

    const wrapper = render(<AppStateProvider>
      <TestComponent />
    </AppStateProvider>
    )

    expect(wrapper.getByText('light')).toBeDefined()

    userEvent.click(wrapper.getByText('ToggleTheme'))

    expect(wrapper.getByText('dark')).toBeDefined()
  })

  it('should set app meeting info', async () => {
    const TestComponent = (): JSX.Element => {
      const { meetingId, localUserName, region, setAppMeetingInfo }: AppStateValue = React.useContext(AppStateContext) as AppStateValue

      return (
        <>
          <div>{meetingId}</div>
          <div>{localUserName}</div>
          <div>{region}</div>
          <button onClick={() => setAppMeetingInfo('newMeetingId', 'newLocalUserName', 'newRegion')}>setAppMeetingInfo
          </button>
        </>
      )
    }

    const wrapper = render(<AppStateProvider>
      <TestComponent />
    </AppStateProvider>
    )

    expect(wrapper.queryByText('meetingId')).toBeNull()
    expect(wrapper.queryByText('region')).toBeNull()

    await act(async () => {
      userEvent.click(wrapper.getByText('setAppMeetingInfo'))
    })

    expect(wrapper.getByText('newMeetingId')).toBeDefined()
    expect(wrapper.getByText('newLocalUserName')).toBeDefined()
    expect(wrapper.getByText('newRegion')).toBeDefined()
  })
})
