import { useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { MutualContact, MutualContacts, PaginationMetaParams } from '@globalid/identity-namespace-service-sdk'
import useAsyncEffect from 'use-async-effect'
import { debounce } from 'lodash'
import { GetContactsHookResult, HandleGetUserContacts } from './interfaces'
import {
  META_PAGE as page,
  META_PER_PAGE as per_page,
  DEBOUNCE_DELAY as debounceDelay,
  META_TOTAL as total,
} from '../constants'
import { getMyContactsList } from '../services/api'
import { RootState } from 'RootType'
import { setContacts, setPaginationMeta, removeContacts, insertContacts, setFetchingContacts } from '../store/contacts_slice'

export const useGetContactsHook = (searchText?: string): GetContactsHookResult => {
  const [isContactsLoading, setIsLoading] = useState(false)

  const dispatch = useDispatch()

  const contacts: MutualContact[] | undefined =
    useSelector((root: RootState) => root.contacts.contacts)

  const meta: PaginationMetaParams | undefined =
    useSelector((root: RootState) => root.contacts.meta)

  const hasNextPage = contacts === undefined ? false : contacts.length < meta?.total

  const handleGetUserContacts = async ({isMounted, text, nextPage}: HandleGetUserContacts): Promise<MutualContacts> => {
    const response: MutualContacts = await getMyContactsList({
      per_page,
      page: nextPage ?? 1,
      text: text,
    })

    if (isMounted && isMounted()) {
      setIsLoading(false)
    }

    return response
  }

  const loadNextPage = async (text?: string, currentPage?: number): Promise<void> => {
    const nextPage = (currentPage ?? 0) + 1

    const response: MutualContacts = await handleGetUserContacts({text, nextPage})

    setIsLoading(false)
    dispatch(insertContacts(response.data))
    dispatch(setPaginationMeta(response.meta))
  }

  const debouncedLoadNextPage = useCallback(debounce(loadNextPage, debounceDelay), [])

  const handleRequestGetSearchResult = async (text?: string): Promise<void> => {
    if (!searchText) {
      return
    }

    dispatch(setPaginationMeta({ page, per_page, total }))
    setIsLoading(true)

    await debouncedLoadNextPage(text, page)
    dispatch(removeContacts())
  }

  useAsyncEffect(async () => {
    await handleRequestGetSearchResult(searchText)
  }, [searchText])

  const handleRequestGetInitialContacts = async (isMounted: () => boolean): Promise<void> => {
    if (searchText) {
      return
    }

    setIsLoading(true)

    debouncedLoadNextPage.cancel()

    const response: MutualContacts = await handleGetUserContacts({isMounted})

    dispatch(setContacts(response.data))

    dispatch(setPaginationMeta(response.meta))
    dispatch(setFetchingContacts(false))

  }

  useAsyncEffect(async (isMounted: () => boolean) => {
    await handleRequestGetInitialContacts(isMounted)
  }, [searchText])

  const handleLoadNextPage = async (): Promise<void> => {
    if (isContactsLoading) {
      return
    }

    await loadNextPage(searchText, meta?.page)
  }

  return {
    contacts,
    loadNextPage: handleLoadNextPage,
    hasNextPage,
    isContactsLoading,
  }
}
