import React from 'react'
import { Provider } from 'react-redux'
import { act, renderHook, HookResult, RenderHookResult } from '@testing-library/react-hooks'
import { useSearchIdentitiesHook } from './use_search_identities_hook'
import { SearchIdentitiesHookResult } from './interfaces'
import * as api from '../services/api'
import { store } from '../store'
import {
  identitiesMock,
  identitiesPage1Mock,
  identitiesPage2Mock,
  identitiesSearchHellMock,
  identityMock,
} from '../../tests/mocks/identity_mock'

jest.mock('../services/api')
jest.mock('../app')

describe('useSearchIdentitiesHook', () => {
  let renderHookResult: RenderHookResult<unknown, SearchIdentitiesHookResult>
  const getIdentitiesLookupMock: jest.Mock = jest.fn()

  const wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element => (
    <Provider store={store}>{children}</Provider>
  )

  beforeEach(async () => {
    (api.getIdentitiesLookup as jest.Mock) = getIdentitiesLookupMock.mockResolvedValue(identitiesMock)

    await act(async () => {
      renderHookResult = renderHook(() => useSearchIdentitiesHook(), { wrapper })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should render use search identities hook', async () => {
    const result: HookResult<SearchIdentitiesHookResult> = renderHookResult.result
    const searchText: string = 'search identities'

    expect(result.current.hasNextPage).toEqual(false)
    expect(result.current.identities).toEqual([])
    expect(result.current.isSearching).toEqual(false)
    expect(result.current.searchText).toEqual('')
    expect(getIdentitiesLookupMock).not.toHaveBeenCalled()

    await act(async () => {
      result.current.handleSearchInputChange(searchText)
    })

    expect(getIdentitiesLookupMock).toHaveBeenCalledWith({
      page: 1,
      per_page: 120,
      status: 'in_use',
      text: searchText,
      type: 'individual',
    })
    expect(result.current.hasNextPage).toEqual(false)
    expect(result.current.identities).toEqual([identityMock])
    expect(result.current.isSearching).toEqual(false)
    expect(result.current.searchText).toEqual(searchText)
  })

  it('should not make any api calls when search text is empty', async () => {
    const result: HookResult<SearchIdentitiesHookResult> = renderHookResult.result

    expect(result.current.hasNextPage).toEqual(false)
    expect(result.current.identities).toEqual([])
    expect(result.current.isSearching).toEqual(false)
    expect(result.current.searchText).toEqual('')
    expect(getIdentitiesLookupMock).not.toHaveBeenCalled()
  })

  it('should not load next page identities when search text is empty', async () => {
    const result: HookResult<SearchIdentitiesHookResult> = renderHookResult.result

    await act(async () => {
      result.current.loadNextPage()
    })

    expect(result.current.searchText).toEqual('')

    expect(result.current.hasNextPage).toEqual(false)
    expect(result.current.identities).toEqual([])
    expect(result.current.isSearching).toEqual(false)
    expect(getIdentitiesLookupMock).not.toHaveBeenCalled()
  })

  it('should load next page identities when search text is not empty', async () => {
    const result: HookResult<SearchIdentitiesHookResult> = renderHookResult.result
    const searchText: string = 'load next page'

    getIdentitiesLookupMock.mockReturnValue(identitiesPage1Mock)

    await act(async () => {
      result.current.handleSearchInputChange(searchText)
    })

    expect(result.current.hasNextPage).toEqual(true)
    expect(result.current.identities).toEqual(identitiesPage1Mock.data)
    expect(result.current.isSearching).toEqual(false)
    expect(getIdentitiesLookupMock).toHaveBeenCalledWith({
      page: 1,
      per_page: 120,
      status: 'in_use',
      text: searchText,
      type: 'individual',
    })

    getIdentitiesLookupMock.mockReturnValue(identitiesPage2Mock)

    await act(async () => {
      result.current.loadNextPage()
    })

    expect(result.current.searchText).toEqual(searchText)
    expect(result.current.hasNextPage).toEqual(false)
    expect(result.current.identities).toEqual([...identitiesPage1Mock.data, ...identitiesPage2Mock.data])
    expect(result.current.isSearching).toEqual(false)
    expect(getIdentitiesLookupMock).toHaveBeenCalledWith({
      page: 2,
      per_page: 50,
      status: 'in_use',
      text: searchText,
      type: 'individual',
    })
  })

  it('should return cached state upon entering search text the second time', async () => {
    const result: HookResult<SearchIdentitiesHookResult> = renderHookResult.result
    const searchTextHell: string = 'hell'
    const searchTextHello: string = 'hello'

    getIdentitiesLookupMock.mockReturnValue(identitiesSearchHellMock)

    await act(async () => {
      result.current.handleSearchInputChange(searchTextHell)
    })

    expect(result.current.identities).toEqual(identitiesSearchHellMock.data)
    expect(result.current.isSearching).toEqual(false)
    expect(getIdentitiesLookupMock).toHaveBeenCalledWith({
      page: 1,
      per_page: 120,
      status: 'in_use',
      text: searchTextHell,
      type: 'individual',
    })

    await act(async () => {
      result.current.handleSearchInputChange(searchTextHello)
    })

    expect(result.current.identities).toEqual(identitiesSearchHellMock.data)
    expect(result.current.isSearching).toEqual(false)
    expect(getIdentitiesLookupMock).toHaveBeenCalledWith({
      page: 1,
      per_page: 120,
      status: 'in_use',
      text: searchTextHello,
      type: 'individual',
    })

    await act(async () => {
      result.current.handleSearchInputChange('')
    })

    expect(result.current.identities).toEqual([])
    expect(result.current.isSearching).toEqual(false)
    expect(result.current.searchText).toEqual('')

    await act(async () => {
      result.current.handleSearchInputChange(searchTextHell)
    })

    expect(result.current.identities).toEqual(identitiesSearchHellMock.data)
    expect(result.current.isSearching).toEqual(false)
    expect(getIdentitiesLookupMock).toHaveBeenCalledTimes(2)
  })
})
