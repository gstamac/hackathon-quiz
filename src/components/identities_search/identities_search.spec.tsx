import React from 'react'

import * as useGetContactsHook from '../../hooks/use_get_contacts_hook'
import * as useSearchIdentitiesHook from '../../hooks/use_search_identities_hook'

import { IdentitiesSearch } from './identities_search'
import {
  GetContactsHookResult,
  SearchIdentitiesHookResult,
} from '../../hooks/interfaces'
import { contactMock } from '../../../tests/mocks/contacts_mock'
import { identityMock } from '../../../tests/mocks/identity_mock'
import { act, render, userEvent, RenderResult } from '../../../tests/test_utils'

jest.mock('../../hooks/use_get_contacts_hook')
jest.mock('../../hooks/use_search_identities_hook')
jest.mock('../../services/api')
jest.mock('../../utils/auth_utils')
jest.useFakeTimers()

describe('IdentitySearch', () => {
  let renderResult: RenderResult

  const handleSearchInputChangeMock: jest.Mock = jest.fn()
  const handleSearchResetMock: jest.Mock = jest.fn()
  const getContactsHookMock: jest.Mock = jest.fn()
  const getContactsHookResult: GetContactsHookResult = {
    contacts: [contactMock],
    hasNextPage: false,
    isContactsLoading: false,
    loadNextPage: () => ({}),
  }
  const useSearchIdentitiesHookMock: jest.Mock = jest.fn()
  const useSearchIdentitiesHookResult: SearchIdentitiesHookResult = {
    handleSearchInputChange: handleSearchInputChangeMock,
    hasNextPage: false,
    identities: [],
    isSearching: false,
    loadNextPage: () => ({}),
    searchText: '',
  }

  beforeEach(() => {
    (useGetContactsHook.useGetContactsHook as jest.Mock) = getContactsHookMock.mockReturnValue(getContactsHookResult);
    (useSearchIdentitiesHook.useSearchIdentitiesHook as jest.Mock) = useSearchIdentitiesHookMock.mockReturnValue(useSearchIdentitiesHookResult)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderPage = (): void => {
    act(() => {
      renderResult = render(<IdentitiesSearch />)
    })
  }

  it('should render identities search component', () => {
    renderPage()

    const identitiesSearch: Element = renderResult.getByTestId('identities-search')
    const myContactsListElement: Element | null = renderResult.queryByText('My contacts')
    const listItemElement: Element | null = renderResult.queryByText(contactMock.gid_name)
    const searchElement: Element | null = renderResult.queryByTestId('search-input')

    expect(identitiesSearch).toBeDefined()
    expect(myContactsListElement).not.toBeNull()
    expect(listItemElement).not.toBeNull()
    expect(searchElement).not.toBeNull()
  })

  it('should render identities search with info message when contacts are empty', () => {
    getContactsHookMock.mockReturnValue({
      ...getContactsHookResult,
      contacts: [],
    })

    renderPage()

    const myContactsListElement: Element | null = renderResult.queryByText('My contacts')
    const listItemElement: Element | null = renderResult.queryByText(contactMock.gid_name)
    const findYourFriendsMessage: Element | null = renderResult.queryByText('Find your friends by searching their name.')

    expect(myContactsListElement).toBeNull()
    expect(listItemElement).toBeNull()
    expect(findYourFriendsMessage).not.toBeNull()
  })

  it('should render identities search with empty list when contacts are undefined', () => {
    getContactsHookMock.mockReturnValue({
      ...getContactsHookResult,
      contacts: undefined,
    })

    renderPage()

    const myContactsListElement: Element | null = renderResult.queryByText('My contacts')
    const listItemElement: Element | null = renderResult.queryByText(contactMock.gid_name)
    const findYourFriendsMessage: Element | null = renderResult.queryByText('Find your friends by searching their name.')

    expect(myContactsListElement).not.toBeNull()
    expect(listItemElement).toBeNull()
    expect(findYourFriendsMessage).toBeNull()
  })

  it('should trigger callbacks on search input interaction', async () => {
    useSearchIdentitiesHookMock.mockReturnValue({
      ...useSearchIdentitiesHookResult,
    })

    const searchText: string = 'user interaction'

    renderPage()

    const searchInputElement: HTMLInputElement = renderResult.getByTestId('search-input') as HTMLInputElement

    expect(searchInputElement).toBeDefined()

    await act(async () => {
      await userEvent.type(searchInputElement, searchText)
    })

    const removeIcon: Element = renderResult.getByAltText('reset search')

    expect(removeIcon).not.toBeNull()
    expect(handleSearchResetMock).not.toHaveBeenCalled()

    act(() => {
      userEvent.click(removeIcon)
    })

    expect(searchInputElement.value).toEqual('')

    expect(handleSearchInputChangeMock).not.toHaveBeenCalled()

    await act(async () => {
      await userEvent.type(searchInputElement, 'input')
    })

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(handleSearchInputChangeMock).toHaveBeenCalledWith('input')
  })

  it('should render my contacts list and globalid directory list items when search text is specified', () => {
    useSearchIdentitiesHookMock.mockReturnValue({
      ...useSearchIdentitiesHookResult,
      identities: [identityMock],
      searchText: 'john',
    })

    renderPage()

    const myContactsListElement: Element | null = renderResult.queryByText('My contacts')
    const globalidDirectoryTitleElement: Element | null = renderResult.queryByText('GlobaliD directory')
    const contactItem: Element | null = renderResult.getAllByText('john')[0]
    const globalidDirectoryListItem: Element | null = renderResult.queryByText(identityMock.gid_name)

    expect(globalidDirectoryTitleElement).not.toBeNull()
    expect(myContactsListElement).not.toBeNull()
    expect(contactItem).not.toBeNull()
    expect(globalidDirectoryListItem).not.toBeNull()
  })

  it('should show list empty message for my contacts list and globalid directory list', () => {
    getContactsHookMock.mockReturnValue({
      ...getContactsHookResult,
      contacts: [],
    })
    useSearchIdentitiesHookMock.mockReturnValue({
      ...useSearchIdentitiesHookResult,
      identities: [],
      searchText: 'searching identities',
    })

    renderPage()

    const myContactsListElement: Element | null = renderResult.queryByText('My contacts')
    const globalidDirectoryTitleElement: Element | null = renderResult.queryByText('GlobaliD directory')
    const noContactsMatches: Element | null = renderResult.queryByText('No matches in my contacts')
    const noGlobalidDirectoryContactsMatches: Element | null = renderResult.queryByText('No matches in GlobaliD directory')

    expect(globalidDirectoryTitleElement).not.toBeNull()
    expect(myContactsListElement).not.toBeNull()
    expect(noContactsMatches).not.toBeNull()
    expect(noGlobalidDirectoryContactsMatches).not.toBeNull()
  })
})
