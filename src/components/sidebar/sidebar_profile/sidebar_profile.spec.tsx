import React from 'react'
import { render, RenderResult, cleanup, userEvent } from '../../../../tests/test_utils'
import { act } from 'react-dom/test-utils'
import { SidebarProfile } from './sidebar_profile'
import { publicIdentityMock } from '../../../../tests/mocks/identity_mock'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import * as auth_api from '../../../services/api/authentication_api'
import { getString } from '../../../utils'

jest.mock('../../../services/api/authentication_api')

describe('List', () => {
  const handleDrawerClose: jest.Mock = jest.fn()
  const handleOpenStateMock: jest.Mock = jest.fn()
  let renderResult: RenderResult

  const getProfileCardComponent = (
    user?: PublicIdentity,
    isLoading: boolean = false,
  ): JSX.Element => (
    <SidebarProfile
      user={user}
      isLoading={isLoading}
      handleOpenState={handleOpenStateMock}
      handleDrawerClose={handleDrawerClose}
    />
  )

  beforeAll(() => {
    (auth_api.createAuthenticationRequestWithArgs as jest.Mock) = jest.fn().mockResolvedValue('test_request_uuid')
  })

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  it('Should render the profile card when logged in', async () => {
    await act(async () => {
      renderResult = render(getProfileCardComponent(publicIdentityMock))
    })

    const image: Element = renderResult.getByAltText('avatar')

    expect(image).not.toBeNull()
  })

  it('Should render qr code widget when logged out', async () => {
    await act(async () => {
      renderResult = render(getProfileCardComponent())
    })

    const qrWidget: Element | null = renderResult.container.querySelector('.qr-widget')
    const iosAppIcon: Element | null = renderResult.queryByAltText(getString('ios-app-store'))
    const googlePlayIcon: Element | null = renderResult.queryByAltText(getString('google-play-store'))

    expect(qrWidget).not.toBeNull()
    expect(iosAppIcon).not.toBeNull()
    expect(googlePlayIcon).not.toBeNull()
    expect(auth_api.createAuthenticationRequestWithArgs as jest.Mock).toHaveBeenCalled()
  })

  it('should call handleOpenState when `or get the app` is clicked on qr code', async () => {
    await act(async () => {
      renderResult = render(getProfileCardComponent())
    })

    const linkToAppModal: HTMLElement = renderResult.getByText('or get the app')

    act(() => {
      userEvent.click(linkToAppModal)
    })

    expect(handleOpenStateMock).toHaveBeenCalled()
  })

  it('should render the profile card when isLoading is true', async () => {
    await act(async () => {
      renderResult = render(getProfileCardComponent(undefined, true))
    })

    const profile: HTMLElement | null = renderResult.queryByTestId('profile')

    expect(profile).not.toBeNull()
  })
})
