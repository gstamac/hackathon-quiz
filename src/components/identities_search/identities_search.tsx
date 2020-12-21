import React, { PropsWithChildren } from 'react'
import {
  getListHeight,
  getShowOrHideSections,
} from './helpers'
import {
  IdentitiesSearchProps,
  ListHeightParameters,
  ListHeightResult,
  ShowHideSectionsParameters,
  ShowHideSectionsResult,
} from './interfaces'
import { useStyles } from './styles'
import { ListHeader } from '../global/list_header'
import { ListInfoMessage } from '../global/list_info_message'
import { GlobalidLoader } from '../global/loading'
import { SearchInput } from '../global/search_input'
import { GetContactsHookResult, SearchIdentitiesHookResult } from '../../hooks/interfaces'
import { useGetContactsHook } from '../../hooks/use_get_contacts_hook'
import { useSearchIdentitiesHook } from '../../hooks/use_search_identities_hook'
import { IdentityList } from '../identity_list'
import { getString } from '../../utils'
import { IDENTITY_LIST_ITEM_SIZE } from '../../constants'
import { optimizeIdentitiesSearchResults } from '../../services/fuse/fuse'

export const IdentitiesSearch: React.FC<PropsWithChildren<IdentitiesSearchProps>> = ({
  children,
  onSelect,
  selectedIdentities = [],
  showSelection = false,
  excludeMe = false,
  enableSearchFieldAutoFocus = false,
}: PropsWithChildren<IdentitiesSearchProps>) => {
  const classes = useStyles()

  const {
    handleSearchInputChange,
    hasNextPage: hasNextIdentitiesPage,
    loadNextPage: loadNextIdentitiesPage,
    identities,
    isSearching,
    searchText,
  }: SearchIdentitiesHookResult = useSearchIdentitiesHook()

  const {
    contacts,
    hasNextPage,
    loadNextPage,
    isContactsLoading,
  }: GetContactsHookResult = useGetContactsHook(searchText)

  const searchTextExists: boolean = searchText.length !== 0

  const listHeightParameters: ListHeightParameters = {
    listItemSize: IDENTITY_LIST_ITEM_SIZE,
    myContactsCount: contacts?.length ?? 0,
    searchTextExists,
  }

  const {
    globalidDirectoryHeight,
    myContactsHeight,
  }: ListHeightResult = getListHeight(listHeightParameters)

  const showOrHideSectionsParameters: ShowHideSectionsParameters = {
    isSelectionMode: showSelection,
    globalidDirectoryExists: (identities !== undefined && identities?.length !== 0) || searchTextExists,
    globalidDirectoryIsSearching: isSearching,
    myContactsIsLoading: isContactsLoading,
    myContactsExists: !(contacts?.length === 0),
    searchTextExists,
  }

  const {
    showFindYourFriendsMessage,
    showGlobalidDirectoryList,
    showLoader,
    showMyContactsList,
  }: ShowHideSectionsResult = getShowOrHideSections(showOrHideSectionsParameters)

  return (
    <div className={classes.identitiesSearch} data-testid='identities-search'>
      <SearchInput onDebounceCallback={handleSearchInputChange} autoFocus={enableSearchFieldAutoFocus} />

      {children}

      {showFindYourFriendsMessage && <ListInfoMessage message={getString('find-your-friends')} />}

      {showLoader &&
        <div className={classes.loaderWrapper}>
          <GlobalidLoader/>
        </div>
      }

      {showMyContactsList && <>
        <ListHeader title={getString('my-contacts')}/>
        <IdentityList
          emptyListMessage={!searchTextExists ? getString('find-your-friends') : getString('no-contacts-matches')}
          hasNextPage={hasNextPage}
          height={myContactsHeight}
          isLoading={isContactsLoading}
          items={optimizeIdentitiesSearchResults(contacts, searchText)}
          loadNextPage={loadNextPage}
          onSelect={onSelect}
          selectedIdentities={selectedIdentities}
          showSelection={showSelection}
        />
      </>}

      {showGlobalidDirectoryList && <>
        <ListHeader title={getString('globalid-directory')}/>
        <IdentityList
          emptyListMessage={getString('no-globalid-directory-matches')}
          hasNextPage={hasNextIdentitiesPage}
          height={globalidDirectoryHeight}
          isLoading={isContactsLoading}
          items={optimizeIdentitiesSearchResults(identities, searchText)}
          loadNextPage={loadNextIdentitiesPage}
          onSelect={onSelect}
          selectedIdentities={selectedIdentities}
          showSelection={showSelection}
          excludeMe={excludeMe}
          handleBottomSelectionOverlap
        />
      </>}
    </div>
  )
}
