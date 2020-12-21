import React from 'react'
import { ContactsWrapper } from './contacts_wrapper'
import {
  GetContactsHookResult,
  SearchIdentitiesHookResult,
} from '../../hooks/interfaces'
import * as useGetContactsHook from '../../hooks/use_get_contacts_hook'
import * as useSearchIdentitiesHook from '../../hooks/use_search_identities_hook'
import { act, render, RenderResult } from '../../../tests/test_utils'

jest.mock('../../hooks/use_get_contacts_hook')
jest.mock('../../hooks/use_search_identities_hook')
jest.mock('../../services/api')

describe('ContactsWrapper', () => {
  let renderResult: RenderResult

  const getContactsHookMock: jest.Mock = jest.fn()
  const getContactsHookResult: GetContactsHookResult = {
    contacts: [],
    hasNextPage: false,
    isContactsLoading: false,
    loadNextPage: () => ({}),
  }
  const useSearchIdentitiesHookMock: jest.Mock = jest.fn()
  const useSearchIdentitiesHookResult: SearchIdentitiesHookResult = {
    handleSearchInputChange: () => ({}),
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

  const renderPage = (): void => {
    act(() => {
      renderResult = render(<ContactsWrapper/>)
    })
  }

  it('should render the people identities search component', () => {
    renderPage()

    const identitiesSearch: Element = renderResult.getByTestId('identities-search')

    expect(identitiesSearch).toBeDefined()
  })
})
