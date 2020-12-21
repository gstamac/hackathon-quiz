import { RedirectOnSignOut } from './../../utils/interfaces'

export interface UserAuthenticationHookProps {
  isPrivate: boolean
  redirectOnSignOut: RedirectOnSignOut
}

export interface AuthQueryParams {
  authorizationCode: string
  deviceId?: string
}
