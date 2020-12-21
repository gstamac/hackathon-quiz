import React from 'react'

import * as helpers from '../global/helpers'
import * as router_utils from '../../utils/router_utils'

import { IdentityResponse } from '@globalid/identity-namespace-service-types'
import { cleanup, fireEvent, getByText } from '@testing-library/react'
import { IdentityListItem } from './identity_list_item'
import { IdentityListItemProps } from './interfaces'
import { contactMock } from '../../../tests/mocks/contacts_mock'
import { act, render, userEvent, RenderResult } from '../../../tests/test_utils'
import { getString } from '../../utils'

jest.mock('../../utils/router_utils')
jest.mock('../global/helpers')

describe('IdentityListItem', () => {
  let renderResult: RenderResult

  const renderPage = (props: IdentityListItemProps): void => {
    act(() => {
      renderResult = render(<IdentityListItem {...props} />)
    })
  }

  const itemDescription: string = `${contactMock?.country_name as string}`
  const isMobileViewMock: jest.Mock = jest.fn()
  const isMobileOrTabletViewMock: jest.Mock = jest.fn()
  const navigateToProfilePageMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (helpers.useIsMobileOrTabletView as jest.Mock) = isMobileOrTabletViewMock.mockReturnValue(false);
    (router_utils.navigateToProfilePage as jest.Mock) = navigateToProfilePageMock
  })

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  it('should render the IdentityListItem component', () => {
    renderPage({ ...contactMock })

    const countryName: Element | null = renderResult.queryByText(itemDescription)
    const settingsImg: Element | null = renderResult.queryByAltText('settings')
    const addToContactsImg: Element | null = renderResult.queryByAltText('mutual contacts')
    const displayImage: Element | null = renderResult.queryByAltText('avatar')
    const gidName: Element | null = renderResult.queryByText(contactMock.gid_name)

    expect(countryName).not.toBeNull()
    expect(settingsImg).not.toBeVisible()
    expect(addToContactsImg).not.toBeNull()
    expect(gidName).not.toBeNull()
    expect(displayImage).not.toBeNull()
  })

  it('should show settings icon on hovering IdentityListItem component', () => {
    renderPage({ ...contactMock })

    const settingsIcon = renderResult.getByAltText('settings')

    expect(settingsIcon).not.toBeVisible()

    fireEvent.click(settingsIcon)
    expect(settingsIcon).toBeVisible()
  })

  it('should render the IdentityListItem component with an enabled webclient user', () => {
    renderPage({ ...contactMock, signup_type: IdentityResponse.IdentitySignupType.Localid, showCheckbox: true })

    const displayImage: Element | null = renderResult.queryByAltText('avatar')
    const gidName: Element | null = renderResult.queryByText(contactMock.gid_name)

    expect(gidName).not.toBeNull()
    expect(displayImage).not.toBeNull()

    const listItem: Element | null = renderResult.queryByTestId('identity-list-item')

    act(() => {
      fireEvent.mouseEnter(listItem as Element)
    })

    const tooltipHeading: Element | null = renderResult.queryByText(getString('tooltip-webclient-user-only-heading'))

    expect(tooltipHeading).toBeNull()
  })

  it('should render the IdentityListItem component with owner tag', () => {
    renderPage({ ...contactMock, isOwner: true })

    const name: Element = renderResult.getByText('johndoe')
    const tag: Element = renderResult.getByText(`${getString('group-owner')}`)

    expect(name).toBeDefined()
    expect(tag).toBeDefined()
  })

  it('should navigate to profile page upon clicking IdentityListItem', () => {
    renderPage({ ...contactMock })

    const identityListItem: Element = renderResult.getByTestId('identity-list-item')

    expect(navigateToProfilePageMock).not.toHaveBeenCalled()

    act(() => {
      userEvent.click(identityListItem)
    })

    expect(navigateToProfilePageMock).toHaveBeenCalled()
  })

  it('should show user settings upon clicking IdentityListItem on mobile', () => {
    isMobileViewMock.mockReturnValue(true)
    isMobileOrTabletViewMock.mockReturnValue(true)

    renderPage({ ...contactMock })

    const identityListItem: Element = renderResult.getByTestId('identity-list-item')

    act(() => {
      userEvent.click(identityListItem)
    })

    const userSettings: HTMLElement = renderResult.getByRole('presentation')
    const userSettingsTitle: Element = getByText(userSettings, 'People')

    expect(userSettingsTitle).toBeDefined()

    expect(navigateToProfilePageMock).not.toHaveBeenCalled()
  })

  it('should not show owner tag if owner is hidden', () => {
    renderPage({ ...contactMock, isOwner: true, hideOwner: true })

    const name: Element = renderResult.getByText('johndoe')
    const ownerTag: Element | null = renderResult.queryByText(getString('group-owner'))

    expect(name).toBeDefined()
    expect(ownerTag).toBeNull()
  })

  it('should render adornment if assigned', () => {
    renderPage({ ...contactMock, adornment: <div data-testid='adornment'/>, adornmentCondition: () => true })

    const adornment: Element = renderResult.getByTestId('adornment')

    expect(adornment).toBeDefined()
  })

  it('should render the disabled IdentityListItem component with custom tooltip message', () => {
    renderPage({ ...contactMock, showCheckbox: true, itemDisabled: () => true, disabledItemTooltip: 'disabledItemTooltip' })

    const displayImage: Element | null = renderResult.queryByAltText('avatar')
    const gidName: Element | null = renderResult.queryByText(contactMock.gid_name)

    expect(gidName).not.toBeNull()
    expect(displayImage).not.toBeNull()

    const listItem: Element | null = renderResult.queryByTestId('identity-list-item')

    act(() => {
      fireEvent.mouseEnter(listItem as Element)
    })

    const tooltipHeading: Element | null = renderResult.queryByText('disabledItemTooltip')

    expect(tooltipHeading).toBeVisible()

    act(() => {
      fireEvent.mouseLeave(listItem as Element)
    })

    expect(tooltipHeading).not.toBeVisible()
  })
})
