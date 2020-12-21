import { Identity, MutualContact } from '@globalid/identity-namespace-service-sdk'
import { ProfilePageTarget } from '../utils/interfaces'

export type BooleanState = [
  boolean,
  () => void,
  () => void,
]

export interface GetContactsHookResult {
  contacts?: MutualContact[] | undefined
  hasNextPage: boolean
  isContactsLoading: boolean
  loadNextPage: () => void
}

export enum IdentityMenuOption {
  ADD_OR_REMOVE_CONTACT = 'ADD_OR_REMOVE_CONTACT',
  BLOCK_OR_UNBLOCK_USER = 'BLOCK_OR_UNBLOCK_USER',
  REPORT_USER = 'REPORT_USER',
  REQUEST_VOUCH = 'REQUEST_VOUCH',
  SEND_MESSAGE = 'SEND_MESSAGE',
  SEND_MONEY = 'SEND_MONEY',
  VIEW_PROFILE = 'VIEW_PROFILE',
}

export interface IdentityMenuOptionsParameters {
  identity: Identity | undefined
  onClick?: () => void
  open: boolean
  options?: IdentityMenuOption[]
  profilePageTarget?: ProfilePageTarget
}

export interface SearchIdentitiesHookResult {
  handleSearchInputChange: (value: string) => void
  hasNextPage: boolean
  identities: Identity[] | undefined
  isSearching: boolean
  loadNextPage: () => void
  searchText: string
}

export type ToggledStateResult = [boolean, () => Promise<void>]

export interface ToggledStateProps {
  initialState: boolean
  mounted?: boolean
  condition?: () => boolean
  command?: UFn<void>
}

export interface HandleGetUserContacts {
  isMounted?: () => boolean
  text?: string
  nextPage?: number
}

export interface HandleChannelLoadingParams {
  channelId?: string
  groupUuid?: string
}

export interface WindowSize {
  width?: number
  height?: number
}

export interface UseInitPubnubEventsProps {
  isLoggedIn: boolean
}
