import { History } from 'history'
import { generateCodeChallenge } from '../components/auth'
import { ProfilePageTarget } from './interfaces'
import {
  APP_PUBLIC_URL,
  BASE_MESSAGES_URL,
  CODE_CHALLENGE_METHOD,
  WEB_CLIENT_LOGIN_URL,
  CLIENT_ID,
  REDIRECT_URI,
  RESPONSE_TYPE_CODE,
  SCOPE,
} from '../constants'
import { GidName, LastVisitedFolderState } from '../store/interfaces'
import { MessagesType } from '../components/messages/interfaces'
import { deviceKeyManager } from '../init'
import { DeviceKeyPair } from '../services/device_key_manager/interfaces'

export const pushTo = (history: History, path: string): void => {
  history.push(path)
}

export const openInNewTab = (uri: string): void => {
  window.open(uri, '_blank')
}

export const redirectTo = (uri: string): void => {
  window.location.href = uri
}

export const redirectToLadningPage = (): void => {
  redirectTo('/')
}

export const prepareAndStoreAuthCredentials = async (): Promise<string> => {
  const codeChallenge: string = await generateCodeChallenge()

  const { publicKey }: DeviceKeyPair = await deviceKeyManager.generateKeyPair()

  return (
    `?client_id=${CLIENT_ID}` +
    `&response_type=${RESPONSE_TYPE_CODE}` +
    `&scope=${SCOPE}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=${CODE_CHALLENGE_METHOD}` +
    `&device_public_key=${window.encodeURIComponent(publicKey)}`
  )
}

export const redirectToLogin = async (): Promise<void> => {
  const authParams: string = await prepareAndStoreAuthCredentials()

  redirectTo(`${WEB_CLIENT_LOGIN_URL}${authParams}&login=true`)
}

export const redirectToSignUp = async (): Promise<void> => {
  const authParams: string = await prepareAndStoreAuthCredentials()

  redirectTo(`${WEB_CLIENT_LOGIN_URL}${authParams}&login=false`)
}

export const redirectToGroups = (): void => {
  window.open('https://groups.global.id/', '_blank')
}

export const getUrlParts = (url: string): string[] => {
  const protoParts = url.split('://')
  let uriWithoutProtocol = protoParts.length === 1 ? protoParts[0] : protoParts[1]

  uriWithoutProtocol = removeConsecutiveSlashes(uriWithoutProtocol)
  const uriParts = uriWithoutProtocol.split('/')

  if (uriParts[0] === '') {
    return uriParts.slice(1)
  }

  return uriParts
}

const getAppropriateRegEx = (url: string): RegExp => {
  const withProtocol = /([^:\s])\/+/g
  const standalonePath = /([\w\s]|.?)\/\/+/g

  return url.startsWith('/') ? standalonePath : withProtocol
}

const removeConsecutiveSlashes = (url: string): string => {
  const slashRegEx = getAppropriateRegEx(url)

  const withoutTrailingSlashes = url.replace(slashRegEx, '$1/')

  // Remove any trailing slash, even if there are parameters.
  return withoutTrailingSlashes.replace(/\/(\?|&|#[^!]|$)/g, '$1')
}

export const getBaseUrlFromEnv = (): string => APP_PUBLIC_URL ? `/${getUrlParts(APP_PUBLIC_URL).slice(1).join('/')}` : '/'

export const navigateToProfilePage = (
  history: History,
  gidName: GidName,
  profilePageTarget?: ProfilePageTarget
): void => {
  const profileUri: string = `/${gidName}`

  if (profilePageTarget === undefined || profilePageTarget === ProfilePageTarget.SELF) {
    pushTo(history, profileUri)
  } else {
    window.open(profileUri, ProfilePageTarget.BLANK)
  }
}

export const navigateToChannelPage = (
  history: History,
  type: MessagesType,
  channelId: string,
): void => {
  history.push(`${BASE_MESSAGES_URL}/${type}/${channelId}`)
}

export const getUuidFromURL = (url: string): string | null => {
  const reg: RegExp = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g
  const result: RegExpExecArray | null = reg.exec(url)

  return result !== null ? result[0] : null
}

export const getLastVisitedMessagesUrl = ({ folderType, groupUuid, channelId }: LastVisitedFolderState): string => (
  `${BASE_MESSAGES_URL}/${folderType}${groupUuid ? `/${groupUuid}`: ''}${channelId ? `/${channelId}`: ''}`
)
