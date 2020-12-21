export enum ProfilePageTarget {
  SELF = '_self',
  BLANK = '_blank',
}

export enum RedirectOnSignOut {
  LOGIN = 'LOGIN',
  LANDING_PAGE = 'LANDING_PAGE'
}

export interface NetworkErrorType {
  error_code: string
  error_id: string
  message: string
  request_id: string
  statusCode: number
  uri: string
}

export interface GeneralObject<T> {
  [key: string]: T
}

export interface GoToChannelParams {
  currentPath?: string
  groupUuid?: string
  actionBeforeRedirect?: () => void
}

export interface MatchingStrings {
  match: string
  replace: string
}
