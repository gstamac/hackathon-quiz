import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Identity,
  PaginationMetaParams,
} from '@globalid/identity-namespace-service-sdk'
import { SearchIdentitiesHookResult } from './interfaces'
import { RootState } from 'RootType'
import { FetchIdentitiesParameters, FetchStatus } from '../store/interfaces'
import { fetchIdentities } from '../store/identities_slice'
import {
  getIdentitiesByText,
  getIdentitiesPaginationMetaByText,
  getIdentityFetchStatusByParameters,
} from '../store/identities_selectors'
import { OPTIMIZED_SEARCH_PER_PAGE } from '../constants'

export const useSearchIdentitiesHook = (): SearchIdentitiesHookResult => {
  const dispatch = useDispatch()

  const [firstPageParameters, setFirstPageParameters] = useState<FetchIdentitiesParameters>({
    page: 1,
    text: '',
  })
  const [hasNextPage, setHasNextPage] = useState<boolean>(false)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<string>('')

  const identities: Identity[] = useSelector((root: RootState) => (
    getIdentitiesByText(root, searchText)
  ))

  const meta: PaginationMetaParams | undefined = useSelector((root: RootState) => (
    getIdentitiesPaginationMetaByText(root, searchText))
  )

  const firstPageFetchStatus: FetchStatus | undefined = useSelector((root: RootState) => (
    getIdentityFetchStatusByParameters(root, firstPageParameters)
  ))

  const fetchFirstPage = (text: string): void => {
    const parameters: FetchIdentitiesParameters = { page: 1, text, per_page: OPTIMIZED_SEARCH_PER_PAGE }

    dispatch(fetchIdentities(parameters))
  }

  const fetchNextPage = (text: string, currentPage?: number): void => {
    if (currentPage === undefined) {
      return
    }
    const nextPage: number = currentPage + 1
    const parameters: FetchIdentitiesParameters = { page: nextPage, text }

    dispatch(fetchIdentities(parameters))
  }

  const loadNextPage = (): void => {
    if (searchText.length === 0 || !hasNextPage) {
      return
    }
    fetchNextPage(searchText, meta?.page)
  }

  const handleSearchRequest = (text: string): void => {
    setSearchText(text)

    if (text.length > 0) {
      fetchFirstPage(text)
      setFirstPageParameters({ page: 1, text })
    }
  }

  useEffect((): void => {
    if (firstPageParameters.text.length > 0 && (firstPageFetchStatus === undefined || firstPageFetchStatus === FetchStatus.PENDING)) {
      setIsSearching(true)
    } else if (isSearching) {
      setIsSearching(false)
    }
  }, [firstPageFetchStatus, firstPageParameters.text])

  useEffect((): void => {
    if (meta !== undefined && identities.length < meta.total) {
      setHasNextPage(true)
    } else if (hasNextPage) {
      setHasNextPage(false)
    }
  }, [identities.length, meta?.total])

  return {
    handleSearchInputChange: handleSearchRequest,
    hasNextPage,
    loadNextPage,
    identities,
    isSearching,
    searchText,
  }
}
