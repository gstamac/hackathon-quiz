import React from 'react'

import { IdentityList } from './identity_list'
import { IdentityListProps } from './interfaces'
import { contactMock } from '../../../tests/mocks/contacts_mock'
import { render, RenderResult } from '../../../tests/test_utils'
import { identityMock } from '../../../tests/mocks/identity_mock'

jest.mock('../../utils/auth_utils')

describe('IdentityList', () => {
  let renderResult: RenderResult
  const loadNextPageMock: jest.Mock = jest.fn()

  const listProps: IdentityListProps = {
    items: [contactMock],
    isLoading: false,
    hasNextPage: false,
    loadNextPage: loadNextPageMock,
    height: 500,
    emptyListMessage: 'emptyListMessage',
    handleBottomSelectionOverlap: true,
  }

  const renderPage = (props: IdentityListProps): void => {
    renderResult = render(<IdentityList {...props} />)
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the IdentityList component', () => {
    renderPage({ ...listProps })

    const displayName: Element | null = renderResult.queryByText(`${contactMock?.display_name as string} •`)
    const countryNameElement: Element | null = renderResult.queryByText(`${contactMock?.country_name as string}`)
    const gidNameElement: Element | null = renderResult.queryByText(contactMock.gid_name)
    const userAvatarElement: Element | null = renderResult.queryByAltText('mutual contacts')

    expect(loadNextPageMock).not.toHaveBeenCalled()
    expect(displayName).not.toBeNull()
    expect(gidNameElement).not.toBeNull()
    expect(countryNameElement).not.toBeNull()
    expect(userAvatarElement).not.toBeNull()
  })

  it('should not render my identity if excluded from the IdentityList', () => {
    renderPage({
      ...listProps,
      items: [identityMock],
      excludeMe: true,
    })

    const gidNameElement: Element | null = renderResult.queryByText(identityMock.gid_name)

    expect(loadNextPageMock).not.toHaveBeenCalled()
    expect(gidNameElement).toBeNull()
  })

  it('should call loadNextPage function when hasNextPage param is true', () => {
    renderPage({ ...listProps, hasNextPage: true })

    const countryNameElement: Element | null = renderResult.queryByText(`${contactMock?.country_name as string}`)
    const gidNameElement: Element | null = renderResult.queryByText(contactMock.gid_name)
    const userAvatarElement: Element | null = renderResult.queryByAltText('mutual contacts')

    expect(gidNameElement).not.toBeNull()
    expect(loadNextPageMock).toHaveBeenCalled()
    expect(countryNameElement).not.toBeNull()
    expect(userAvatarElement).not.toBeNull()
  })

  it('should not call loadNextPage function when hasNextPage param is true and isLoading is true', () => {
    renderPage({ ...listProps, hasNextPage: true, isLoading: true })

    expect(loadNextPageMock).not.toHaveBeenCalled()
  })

  it('should render empty list message when identity list is empty', () => {
    renderPage({ ...listProps, items: [] })

    const displayName: Element | null = renderResult.queryByText(`${contactMock?.display_name as string}`)
    const countryNameElement: Element | null = renderResult.queryByText(`${contactMock?.display_name as string}`)
    const gidNameElement: Element | null = renderResult.queryByText(contactMock.gid_name)
    const emptyListMessageElement: Element | null = renderResult.queryByText(listProps.emptyListMessage)

    expect(displayName).toBeNull()
    expect(emptyListMessageElement).not.toBeNull()
    expect(countryNameElement).toBeNull()
    expect(gidNameElement).toBeNull()
    expect(loadNextPageMock).not.toHaveBeenCalled()
  })

  it('should render loader when items are undefined', () => {
    renderPage({ ...listProps, items: undefined })

    const loader: Element | null = renderResult.queryByTestId('globalid-loader')

    expect(loader).not.toBeNull()
  })
})
