import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { render } from '../../../../../tests/test_utils'
import { Navigation } from '.'
import * as navigationProvider from '../../providers/navigation_provider'
import * as appStateProvider from '../../providers/app_state_provider'

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('amazon-chime-sdk-component-library-react') as {},
  Navbar: jest.fn().mockReturnValue(<div data-testid='Navbar'></div>),
  NavbarHeader: jest.fn().mockReturnValue(<div data-testid='NavbarHeader'></div>),
  Attendees: jest.fn().mockReturnValue(<div data-testid='Attendees'></div>),
  Eye: jest.fn().mockReturnValue(<div data-testid='Eye'></div>),
  Information: jest.fn().mockReturnValue(<div data-testid='Information'></div>),
  NavbarItem: jest.fn().mockReturnValue(<div data-testid='NavbarItem'></div>),
}))

jest.mock('../../providers/navigation_provider')
jest.mock('../../providers/app_state_provider')

describe('Navigation tests', () => {
  let renderResult: RenderResult
  const useNavigationMock = jest.fn()
  const useAppStateMock = jest.fn()

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(
        <Navigation/>
      )
    })
  }

  beforeAll(() => {
    (navigationProvider.useNavigation as jest.Mock) = useNavigationMock.mockReturnValue({});
    (appStateProvider.useAppState as jest.Mock) = useAppStateMock.mockReturnValue({})
  })
  afterEach(() => {
    cleanup()
  })

  it('should render navigation bar', async () => {
    renderComponent()

    const navbar: Element = renderResult.getByTestId('Navbar')

    expect(navbar).toBeDefined()
  })
})
