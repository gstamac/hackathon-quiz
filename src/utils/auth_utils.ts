import { ThunkDispatch } from '../store'
import axios from 'axios'
import { removeNotificationsSettingFromLocalStorage } from '../store/browser_notifications_slice/helpers'
import { applyInterceptor } from './axios_interceptor'
import {
  ACCESS_TOKEN_COOKIE_KEY,
  CODE_VERIFIER_COOKIE_KEY,
  REFRESH_TOKEN_COOKIE_KEY,
} from '../constants'
import { deviceKeyManager } from '../init'
import { fetchRefreshToken } from '../services/api/authentication_api'
import { AccessTokenResponse } from '../services/api/interfaces'
import { redirectToLogin, redirectToLadningPage } from './router_utils'
import { addToCurrentTime } from './general_utils'
import { RedirectOnSignOut } from './interfaces'
import * as Cookies from 'es-cookie'
import { setLoggedOut } from '../store/identity_slice'

let isSigningOut: boolean = false

export const setExpiresAt = (expires: number): void => {
  localStorage.setItem('expiresAt', addToCurrentTime(expires).toString())
}

export const getExpiredAt = (): number | null => {
  const expiredAt: string | null = localStorage.getItem('expiresAt')

  return expiredAt !== null ? Number(expiredAt) : null
}

export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_COOKIE_KEY, token)
}

export const getAccessToken = (): string | null => (
  localStorage.getItem(ACCESS_TOKEN_COOKIE_KEY)
)

export const removeAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_COOKIE_KEY)
}

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_COOKIE_KEY, token)
}

export const getRefreshToken = (): string | null => (
  localStorage.getItem(REFRESH_TOKEN_COOKIE_KEY)
)

export const removeRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_COOKIE_KEY)
}

export const removeExpiresAt = (): void => {
  localStorage.removeItem('expiresAt')
}

export const setVisited = (visitedHash: string): void => {
  localStorage.setItem('visited', visitedHash)
}
export const getVisited = (): string | null => (
  localStorage.getItem('visited')
)

export const setCodeVerifier = (code_verifier: string): void => {
  localStorage.setItem(CODE_VERIFIER_COOKIE_KEY, code_verifier)
}

export const getCodeVerifier = (): string | undefined => {
  const storedCodeVerifier = localStorage.getItem(CODE_VERIFIER_COOKIE_KEY)

  return storedCodeVerifier !== null ? storedCodeVerifier : undefined
}

export const getMarketingSiteCodeVerifier = (): string | undefined => Cookies.get(CODE_VERIFIER_COOKIE_KEY)

export const removeCodeVerifierCookie = (): void => {
  Cookies.remove(CODE_VERIFIER_COOKIE_KEY)
}

export const removeCodeVerifierLocalStorage = (): void => {
  localStorage.removeItem(CODE_VERIFIER_COOKIE_KEY)
}

export const getAnyCodeVerifier = (): string | undefined => getCodeVerifier() ?? getMarketingSiteCodeVerifier()

export const cleanupPKCECookies = (): void => {
  removeCodeVerifierLocalStorage()
  removeCodeVerifierCookie()
}

const flushAuthDataFromLocalStorage = (): void => {
  removeAccessToken()
  removeRefreshToken()
  removeNotificationsSettingFromLocalStorage()
}

export const signOut = async (
  dispatch: ThunkDispatch,
  redirectOnSignOut?: RedirectOnSignOut,
): Promise<void> => {
  if (!isSigningOut) {
    isSigningOut = true
    cleanupPKCECookies()

    if (redirectOnSignOut === RedirectOnSignOut.LANDING_PAGE) {
      redirectToLadningPage()
    }

    if (redirectOnSignOut === RedirectOnSignOut.LOGIN) {
      await redirectToLogin()
    }

    flushAuthDataFromLocalStorage()

    if (redirectOnSignOut !== RedirectOnSignOut.LOGIN) {
      await deviceKeyManager.flush()
    }
    dispatch(setLoggedOut())
  }
}

export const rotateToken = async (): Promise<string | undefined> => {
  const refresh_token: string | null = getRefreshToken()

  if (refresh_token !== null) {
    const tokenData: AccessTokenResponse | undefined = await fetchRefreshToken(refresh_token)

    if (tokenData !== undefined) {
      setAccessToken(tokenData.access_token)
      setExpiresAt(tokenData.expires_in)
      setRefreshToken(tokenData.refresh_token)
    }

    return tokenData?.access_token
  }
}

export const initUnauthorizedResponseInterceptor = (): void => {
  applyInterceptor(axios, rotateToken)
}
