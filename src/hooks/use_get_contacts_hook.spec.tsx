import React from 'react'
import { Provider } from 'react-redux'
import { act, renderHook, RenderHookResult } from '@testing-library/react-hooks'
import waitForExpect from 'wait-for-expect'
import { GetContactsHookResult } from './interfaces'
import { useGetContactsHook } from './use_get_contacts_hook'
import * as api from '../services/api'
import { store } from '../store'
import { setContacts, setPaginationMeta } from '../store/contacts_slice'
import { contactsServiceResponseMock } from '../../tests/mocks/contacts_mock'

jest.mock('../services/api')

describe('useGetContactsHook', () => {
  let renderHookResult: RenderHookResult<{}, GetContactsHookResult>
  const getMyContactsList: jest.Mock = jest.fn()

  const wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element =>
    <Provider store={store}>{children}</Provider>

  beforeEach(async () => {
    (api.getMyContactsList as jest.Mock) = getMyContactsList.mockResolvedValue(contactsServiceResponseMock)
    await act(async () => {
      store.dispatch(setContacts(contactsServiceResponseMock.data))
      store.dispatch(store.dispatch(setPaginationMeta(contactsServiceResponseMock.meta)))
    })
  })

  it('should return get contacts hook', async () => {

    await act(async () => {
      renderHookResult = renderHook(() => useGetContactsHook(), { wrapper })
    })

    const result = renderHookResult.result

    expect(result.current.contacts).toEqual(contactsServiceResponseMock.data)
    expect(result.current.isContactsLoading).toBe(false)
    expect(result.current.hasNextPage).toStrictEqual(false)
  })

  it('should compare loaded contacts with total count', async () => {
    getMyContactsList.mockResolvedValue({
      ...contactsServiceResponseMock,
      meta: { page: 1, per_page: 10, total: 10 },
    })

    await act(async () => {
      renderHookResult = renderHook(() => useGetContactsHook(), { wrapper })
    })

    const result = renderHookResult.result

    expect(result.current.hasNextPage).toStrictEqual(true)
  })

  it('should call load next page items function', async () => {
    getMyContactsList.mockResolvedValue({
      ...contactsServiceResponseMock,
      meta: { page: 1, per_page: 10, total: 3 },
    })

    await act(async () => {
      renderHookResult = renderHook(() => useGetContactsHook(), { wrapper })
    })

    const current = renderHookResult.result.current

    expect(current.hasNextPage).toStrictEqual(true)

    await act(async () => {
      current.loadNextPage()
    })

    expect(getMyContactsList).toHaveBeenCalledWith({
      page: 1,
      per_page: 50,
      text: undefined,
    })
  })

  it('should load contacts list when search text is available', async () => {
    const searchText: string = 'test'

    await act(async () => {
      renderHookResult = renderHook(() => useGetContactsHook(searchText), { wrapper })
    })

    await waitForExpect(() => expect(getMyContactsList).toHaveBeenCalledWith({
      page: 1,
      per_page: 50,
      text: searchText,
    }))
  })
})
