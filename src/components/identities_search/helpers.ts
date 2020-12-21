import {
  ListHeightParameters,
  ListHeightResult,
  ShowHideSectionsParameters,
  ShowHideSectionsResult,
} from './interfaces'

export const getListHeight = ({
  listItemSize,
  myContactsCount,
  searchTextExists,
}: ListHeightParameters): ListHeightResult => {
  const divider: number = 2
  const browserWindowHeight: number = window.outerHeight

  const halfOfBrowserWindowHeight: number = browserWindowHeight / divider
  const myContactsTotalHeight: number = myContactsCount * listItemSize
  const myContactsFitsInBrowserWindow: boolean = myContactsTotalHeight < halfOfBrowserWindowHeight
  const myContactsHeight: number = myContactsFitsInBrowserWindow ? myContactsTotalHeight : halfOfBrowserWindowHeight

  return {
    myContactsHeight: searchTextExists ? myContactsHeight : browserWindowHeight,
    globalidDirectoryHeight: halfOfBrowserWindowHeight,
  }
}

export const getShowFindYourFriendsMessage = (
  showLoader: boolean,
  globalidDirectoryExists: boolean,
  myContactsExists: boolean,
  searchTextExists: boolean,
  isSelectionMode: boolean,
): boolean => !showLoader && !searchTextExists && !globalidDirectoryExists && !myContactsExists && !isSelectionMode

export const getShowMyContactsList = (
  showLoader: boolean,
  myContactsExists: boolean,
  searchTextExists: boolean,
  isSelectionMode: boolean,
): boolean => !showLoader && (isSelectionMode ? true : (searchTextExists || myContactsExists))

export const getShowGlobalidDirectoryList = (
  showLoader: boolean,
  globalidDirectoryExists: boolean,
  searchTextExists: boolean,
): boolean => !showLoader && searchTextExists && globalidDirectoryExists

export const getShowOrHideSections = ({
  globalidDirectoryExists,
  globalidDirectoryIsSearching,
  myContactsExists,
  myContactsIsLoading,
  searchTextExists,
  isSelectionMode,
}: ShowHideSectionsParameters): ShowHideSectionsResult => {
  const showLoader: boolean = globalidDirectoryIsSearching || myContactsIsLoading

  const showFindYourFriendsMessage: boolean = getShowFindYourFriendsMessage(
    showLoader,
    globalidDirectoryExists,
    myContactsExists,
    searchTextExists,
    isSelectionMode,
  )

  const showMyContactsList: boolean = getShowMyContactsList(
    showLoader,
    myContactsExists,
    searchTextExists,
    isSelectionMode,
  )

  const showGlobalidDirectoryList: boolean = getShowGlobalidDirectoryList(
    showLoader,
    globalidDirectoryExists,
    searchTextExists,
  )

  return {
    showLoader,
    showMyContactsList,
    showGlobalidDirectoryList,
    showFindYourFriendsMessage,
  }
}
