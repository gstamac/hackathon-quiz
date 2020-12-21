import { GidUUID } from '../../store/interfaces'

interface SearchTextParameters {
  searchTextExists: boolean
}

export interface IdentitiesSearchProps {
  onSelect?: (gidUuid: GidUUID, selected: boolean) => void
  selectedIdentities?: GidUUID[]
  showSelection?: boolean
  excludeMe?: boolean
  enableSearchFieldAutoFocus?: boolean
}

export interface ListHeightParameters extends SearchTextParameters {
  listItemSize: number
  myContactsCount: number
}

export interface ListHeightResult {
  globalidDirectoryHeight: number
  myContactsHeight: number
}

export interface ShowHideSectionsParameters extends SearchTextParameters {
  isSelectionMode: boolean
  globalidDirectoryExists: boolean
  globalidDirectoryIsSearching: boolean
  myContactsExists: boolean
  myContactsIsLoading: boolean
}

export interface ShowHideSectionsResult {
  showFindYourFriendsMessage: boolean
  showGlobalidDirectoryList: boolean
  showLoader: boolean
  showMyContactsList: boolean
}
