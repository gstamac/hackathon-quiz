import { getCodeVerifier } from './../../utils/auth_utils'
import { isAxiosError } from './../../utils/general_utils'
import { util } from 'globalid-crypto'
import { FetchBlockedUsersParameters } from './../../store/interfaces'
import { BlockedUsersWithPaginationMeta } from '@globalid/messaging-service-sdk'
import { deviceKeyManager } from '../../init'
import { store } from './../../store/store'
import {
  getAccessToken,
  getExpiredAt,
  getVisited,
  setCodeVerifier,
  rotateToken,
  getRefreshToken,
  setAccessToken,
  setExpiresAt,
  setRefreshToken,
  cleanupPKCECookies,
  pushTo,
  removeConsentUuid,
  signOut,
  setVisited,
} from '../../utils'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { getMyIdentity } from '../../services/api'
import { RedirectOnSignOut } from '../../utils/interfaces'
import { setHasVisited, setLoggedIn } from '../../store/identity_slice'
import { fetchBlockedUsers } from '../../store/messaging_slice'
import { createHash, Hash } from 'crypto'
import { AsyncThunkAction } from '@reduxjs/toolkit'
import PQueue from 'p-queue'
import { AccessTokenResponse } from '../../services/api/interfaces'
import { fetchAccessToken } from '../../services/api/authentication_api'
import { History } from 'history'
import { PENDING_DEVICE_ID } from '../../constants'
import { DeviceStoreData, getDeviceKey } from '../../services/index_db'
import { initializeDeviceKeyManager } from '../messages/helpers'
import { AuthQueryParams } from './interfaces'
import { isCurrentDeviceMine } from '../../utils/device_helpers'

export const TOKEN_REGEX: RegExp = /token=(.*)/
export const AUTHORIZATION_CODE_REGEX: RegExp = /code=(.*)/
export const DEVICE_ID_REGEX: RegExp = /device_id=(.*)/
export const EXPIRES_IN_REGEX: RegExp = /expires_in=(.*)/
export const MEETING_ID_REGEX: RegExp = /\/call\/(.*)/

export interface TokenData {
  token: string
  expiresIn: number
}

export const getTokenDataFromHash = (hash: string): TokenData | null => {
  const paramArray = hash.replace(/#/, '').split(/&/)

  const queryParams: RegExp[] = [TOKEN_REGEX, EXPIRES_IN_REGEX]

  const [token, expiresIn] = queryParams.map((regex: RegExp) => {
    const paramMatch: string | undefined = paramArray.find((param: string) => regex.test(param))

    if (paramMatch === undefined) {
      return undefined
    }

    return paramMatch.replace(regex, (_match: string, capture: string) => capture)
  })

  if (token === undefined || expiresIn === undefined) {
    return null
  }

  return {
    token,
    expiresIn: Number(expiresIn),
  }
}

let isRefresing: boolean = false

const queue = new PQueue({ concurrency: 1 })

const tryToRotateToken = async (): Promise<boolean> => {
  try {
    isRefresing = true
    const newAccessToken: string | undefined = await rotateToken()

    return newAccessToken !== undefined
  } catch {
    return false
  } finally {
    isRefresing = false
  }
}

export const validateToken = async (forceRefresh?: boolean): Promise<boolean> => {
  const validateTokenRegex: RegExp = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/

  const refresh_token: string | null = getRefreshToken()
  const accessToken: string | null = getAccessToken()
  const expiredAt: number | null = getExpiredAt()

  if ((accessToken === null || expiredAt === null) && refresh_token === null) {
    return false
  }

  const expired: boolean = expiredAt ? new Date().getTime() > expiredAt : true
  const isValidToken: boolean = accessToken ? validateTokenRegex.test(accessToken) && !expired : false

  if (isRefresing) {
    return queue.add(async () => Promise.resolve(true))
  }

  if (!isValidToken || forceRefresh) {
    return queue.add(tryToRotateToken)
  }

  return isValidToken
}

export const handleAuthentication = async (
  redirect: RedirectOnSignOut,
  identity?: PublicIdentity
): Promise<PublicIdentity | undefined> => {
  await getValidToken()

  if (identity === undefined) {
    return retrieveMyIdentity(redirect)
  }
}

export const loadIdentity = async (identity?: PublicIdentity | undefined): Promise<PublicIdentity | undefined> => {

  const hasValidToken: boolean = await validateToken()

  if (hasValidToken && identity === undefined) {
    store.dispatch(setLoggedIn())

    return retrieveMyIdentity()
  }
}

export const resolveIdentityAndRedirect = async (
  history: History
): Promise<void> => {
  const identity: PublicIdentity | undefined = await handleAuthentication(RedirectOnSignOut.LOGIN)

  if (identity !== undefined) {
    await handleIdentityVisit(identity)
    cleanupPKCECookies()
    pushTo(history, '/app/messages')
  }
}

export const registerDeviceId = async (deviceId: string | undefined): Promise<void> => {
  await initializeDeviceKeyManager()
  const currentDeviceId: string | undefined = deviceKeyManager.getDeviceId()

  if (deviceId !== undefined && currentDeviceId === PENDING_DEVICE_ID) {
    const pendingDeviceStoreData: DeviceStoreData | undefined = await getDeviceKey(PENDING_DEVICE_ID)

    if (pendingDeviceStoreData !== undefined) {
      await deviceKeyManager.flush()

      await deviceKeyManager.storeKey(deviceId, pendingDeviceStoreData.privateKey, pendingDeviceStoreData.publicKey)
      await deviceKeyManager.enableEncryption()
    }
  }
}

export const validateCredentials = async (
  authorizationCode: string | undefined,
  codeVerifier: string | undefined,
): Promise<boolean> => {

  const hasValidToken: boolean = await validateToken(true)

  if (hasValidToken) {
    return true
  }
  if (codeVerifier && authorizationCode !== undefined) {
    try {
      await initializeTokens(codeVerifier, authorizationCode)

      return true
    } catch {
      return false
    }
  }

  return false
}

export const retrieveMyIdentity = async (
  redirect?: RedirectOnSignOut
): Promise<PublicIdentity | undefined> => {
  try {
    const myIdentity: PublicIdentity = await getMyIdentity()

    store.dispatch<AsyncThunkAction<BlockedUsersWithPaginationMeta, FetchBlockedUsersParameters | undefined, {}>>
    (fetchBlockedUsers())

    return myIdentity
  } catch (error) {
    if (isAxiosError(error) && (
      error.response?.status === 400 ||
      error.response?.status === 401
    )) {
      await signOut(store.dispatch, redirect)
    }
  }
}

export const handleIdentityVisit = async (identity: PublicIdentity): Promise<void> => {
  const gidNameHash: string = getIdentityHash(identity)

  if (!isVisitStored(gidNameHash)) {
    setVisited(gidNameHash)
    store.dispatch(setHasVisited(false))
    removeConsentUuid()

    if (!await isCurrentDeviceMine(deviceKeyManager.getDeviceId())) {
      await deviceKeyManager.flush()
    }
  }
}

const getIdentityHash = (identity: PublicIdentity): string => {
  const hash: Hash = createHash('sha256')

  return hash.update(identity.gid_name).digest('hex')
}

const isVisitStored = (identityHash: string): boolean => {
  const visited: string | null = getVisited()

  return visited === identityHash
}

const generateCodeVerifier = async (): Promise<string> => {
  const codeVerifier: Buffer = Buffer.from(await util.randomBytes(32))
  const codeVerifierBase64: string = base64URLEncode(codeVerifier)

  setCodeVerifier(codeVerifierBase64)

  return codeVerifierBase64
}

export const sha256 = (challengeCode: string): Buffer => createHash('sha256')
  .update(challengeCode)
  .digest()

const base64URLEncode = (str: Buffer): string => str.toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '')

export const generateCodeChallenge = async (): Promise<string> => {
  const codeVerifier: string = getCodeVerifier() ?? await generateCodeVerifier()

  const codeChallenge: string = base64URLEncode(sha256(codeVerifier))

  return codeChallenge
}

export const getAuthCodeAndDeviceIdFromQueryParameter = (queryParameters: string): AuthQueryParams | null => {
  const paramArray = queryParameters.replace('?', '').split(/&/)

  const queryParams: RegExp[] = [AUTHORIZATION_CODE_REGEX, DEVICE_ID_REGEX]

  const [authorizationCode, deviceId] = queryParams.map((regex: RegExp) => {
    const paramMatch: string | undefined = paramArray.find((param: string) => regex.test(param))

    if (paramMatch === undefined) {
      return undefined
    }

    return paramMatch.replace(regex, (_match: string, capture: string) => capture)
  })

  if (authorizationCode === undefined) {
    return null
  }

  return {
    authorizationCode,
    deviceId,
  }
}

export const getValidToken = async (): Promise<string> => {
  const isValidToken: boolean = await validateToken()

  if (isValidToken) {
    const token: string | null = getAccessToken()

    if (token !== null) {
      return token
    }
  }
  await signOut(store.dispatch, RedirectOnSignOut.LOGIN)

  return ''
}

export const initializeTokens = async (
  codeVerifier: string,
  authorizationCode: string
): Promise<void> => {
  const tokenData: AccessTokenResponse | undefined = await fetchAccessToken(codeVerifier, authorizationCode)

  const currentToken: string | null = getAccessToken()

  if (tokenData !== undefined && tokenData.access_token !== currentToken) {
    setAccessToken(tokenData.access_token)
    setExpiresAt(tokenData.expires_in)
    setRefreshToken(tokenData.refresh_token)
  }
}
