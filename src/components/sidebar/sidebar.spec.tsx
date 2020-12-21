import React from 'react'
import { render, RenderResult, cleanup, act, matchMedia, userEvent, overrideWindowHeight } from '../../../tests/test_utils'
import { Sidebar } from './sidebar'
import { store } from '../../store'
import { setIdentity } from '../../store/identity_slice'
import { publicIdentityMock } from '../../../tests/mocks/identity_mock'

jest.mock('../layouts/layout_context', () => ({
  ...jest.requireActual<{}>('../layouts/layout_context'),
  useLayoutState: jest.fn().mockReturnValue({
    isLoading: false,
    isLoggedIn: true,
  }),
}))

describe('Sidebar', () => {
  let renderResult: RenderResult
  let navbar: Element | null
  const mobileMaxWidth: number = 420
  const isMobileView = (width: number): boolean => width <= mobileMaxWidth

  beforeEach(() => {
    store.dispatch(setIdentity(publicIdentityMock))
  })

  const sidebarComponent = (
    <Sidebar/>
  )

  const renderSidebar = async (): Promise<void> => {
    await act(async () => {
      renderResult = render(sidebarComponent)
    })
  }

  afterEach(() => {
    cleanup()
  })

  it('Should render the navbar in tablet or desktop viewports', async () => {
    await renderSidebar()
    navbar = renderResult.getByRole('drawer')
    expect(navbar).not.toBeUndefined()
  })

  it('Should render the navbar in mobile viewport', async () => {
    const isMobile: boolean = isMobileView(350)

    matchMedia(isMobile)

    await renderSidebar()

    navbar = renderResult.getByRole('mobile-nav-bar')
    expect(navbar).not.toBeUndefined()
  })

  it('Should open menu on More click', async () => {
    const isMobile: boolean = isMobileView(350)

    matchMedia(isMobile)

    await renderSidebar()

    const moreButton: Element = renderResult.getByText('More')

    act(() => {
      userEvent.click(moreButton)
    })

    const getApp: Element = renderResult.getByText('Get the app')

    expect(getApp).toBeDefined()
  })

  it('Should open menu with disconnect button', async () => {
    const isMobile: boolean = isMobileView(350)

    matchMedia(isMobile)

    await renderSidebar()

    const moreButton: Element = renderResult.getByText('More')

    act(() => {
      userEvent.click(moreButton)
    })

    const disconnectButton: Element = renderResult.getByText('Disconnect')

    expect(disconnectButton).toBeDefined()
  })

  it('Should open sub menu on More and Settings click', async () => {
    const isMobile: boolean = isMobileView(350)

    matchMedia(isMobile)

    await renderSidebar()

    const moreButton: Element = renderResult.getByText('More')

    act(() => {
      userEvent.click(moreButton)
    })

    const settingsButton: Element = renderResult.getByText('Settings')

    act(() => {
      userEvent.click(settingsButton)
    })

    const profileAndNotificationsMenuItem: Element = renderResult.getByText('Profile & Notifications')

    expect(profileAndNotificationsMenuItem).toBeDefined()
  })

  it('Should render sidebar menu without groups and wallet options', async () => {
    matchMedia(false)
    overrideWindowHeight(250)

    await renderSidebar()

    const groupsOption: Element | null = renderResult.queryByText('Groups')
    const walletOption: Element | null = renderResult.queryByText('Wallet')

    expect(groupsOption).toBeNull()
    expect(walletOption).toBeNull()
  })

  it('Should show sidebar quick menu hidden groups and wallet options', async () => {
    const isMobile: boolean = isMobileView(1024)

    matchMedia(isMobile)
    overrideWindowHeight(1000)

    await renderSidebar()

    const options: Element[] = renderResult.getAllByRole('button')

    act(() => {
      userEvent.click(options[3])
    })

    const groupsOption: Element | null = renderResult.queryByText('Groups')
    const walletOption: Element | null = renderResult.queryByText('Wallet')

    expect(groupsOption).not.toBeNull()
    expect(walletOption).not.toBeNull()
  })
})
