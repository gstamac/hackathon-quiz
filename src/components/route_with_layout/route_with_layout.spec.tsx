import * as React from 'react'
import { MainLayout } from '../layouts'
import { RouteWithLayout } from './route_with_layout'
import { render, cleanup, getMockStoreCreator } from '../../../tests/test_utils'
import * as auth from '../auth'
import { RedirectOnSignOut } from '../../utils/interfaces'
import { store } from '../../store'
import { RootState } from 'RootType'
import { getString } from '../../utils'

jest.mock('../auth')

describe('Private route component', () => {
  const MockComponent: React.FC = () => <div>mock-component-text</div>

  beforeEach(() => {
    (auth.useUserAuthentication as jest.Mock).mockReturnValue([true, true])
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  describe('MainLayout', () => {
    it('should render nothing when prop component does not exist', () => {
      const renderResult = render(
        <RouteWithLayout exact path={'/test'} layout={MainLayout}/>,
        {
          historyPath: '/test',
        },
      )
      const text = renderResult.queryByText('mock-component-text')

      expect(text).toBeNull()
    })

    it('should render dashboard layout with test component', () => {
      const renderResult = render(
        <RouteWithLayout exact path={'/test'} layout={MainLayout} component={MockComponent}/>,
        {
          historyPath: '/test',
        },
      )
      const text = renderResult.getByText('mock-component-text')

      expect(text).not.toBeNull()
    })

    it('should call userAuthenticationHook function with isPrivate true when isPrivate prop exist', () => {
      render(
        <RouteWithLayout exact path={'/test'} layout={MainLayout} component={MockComponent} isPrivate/>
      )

      expect(auth.useUserAuthentication).toHaveBeenCalledTimes(1)
      expect(auth.useUserAuthentication).toHaveBeenCalledWith({ isPrivate: true, redirectOnSignOut: RedirectOnSignOut.LANDING_PAGE })
    })

    it('should call userAuthenticationHook function with isPrivate false when isPrivate prop does not exist', () => {
      render(
        <RouteWithLayout exact path={'/test'} layout={MainLayout} component={MockComponent} />
      )

      expect(auth.useUserAuthentication).toHaveBeenCalledTimes(1)
      expect(auth.useUserAuthentication).toHaveBeenCalledWith({ isPrivate: false, redirectOnSignOut: RedirectOnSignOut.LANDING_PAGE })
    })

    it('should render layout with header and test component', () => {
      const headerTitle: string = 'Test Header Title'
      const renderResult = render(
        <RouteWithLayout
          exact
          path={'/test'}
          layout={MainLayout}
          layoutProps={{
            headerTitle,
            headerFullwidth: true,
          }}
          component={MockComponent}
        />,
        {
          historyPath: '/test',
        },
      )
      const text = renderResult.getByText('mock-component-text')
      const title = renderResult.getByText(headerTitle)

      expect(text).not.toBeNull()
      expect(title).not.toBeNull()
    })

    it('should render the browser notifications prompt if enabled', () => {
      const mockStore = getMockStoreCreator<RootState>()

      const initialState: RootState = {
        ...store.getState(),
        browserNotifications: {
          isPromptVisible: true,
        },
      }

      const renderResult = render(
        <RouteWithLayout
          exact
          path={'/test'}
          layout={MainLayout}
          component={MockComponent}
        />,
        {
          mockedStore: mockStore(initialState),
          historyPath: '/test',
        }
      )

      const promptTitle: string = getString('browser-notifications-prompt-title')

      expect(renderResult.getByText(promptTitle)).toBeInTheDocument()
    })

    it('should not render the browser notifications prompt if disabled', () => {
      const mockStore = getMockStoreCreator<RootState>()

      const initialState: RootState = {
        ...store.getState(),
        browserNotifications: {
          isPromptVisible: false,
        },
      }

      const renderResult = render(
        <RouteWithLayout
          exact
          path={'/test'}
          layout={MainLayout}
          component={MockComponent}
        />,
        {
          mockedStore: mockStore(initialState),
          historyPath: '/test',
        }
      )

      const promptTitle: string = getString('browser-notifications-prompt-title')

      expect(renderResult.queryByText(promptTitle)).toBeNull()
    })
  })
})
