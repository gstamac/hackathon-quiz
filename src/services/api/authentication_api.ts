import { generateCodeChallenge } from './../../components/auth/helpers'
import axios, { AxiosResponse } from 'axios'
import { AuthenticationRequestStatus } from 'globalid-react-ui'
import {
  CLIENT_ID,
  REDIRECT_URI,
  CODE_CHALLENGE_METHOD,
  SCOPE,
} from './../../constants'
import { AccessTokenResponse, GrantTypes } from './interfaces'
import { deviceKeyManager } from '../../init'
import { DeviceKeyPair } from '../device_key_manager/interfaces'

export enum ResponseTypes {
  code = 'code',
  token = 'token',
}

export interface AuthenticationParameters {
  redirect_uri: string
  scope: string
  client_id: string
  response_type: ResponseTypes
  document_id?: string[]
  acrc_id?: string | null
  nonce?: string
  state?: string
  code_challenge?: string
  code_challenge_method?: string
  device_public_key?: string
}

interface AuthenticationRequestResponse {
  authentication_request: string
}

export const fetchAccessToken = async (code_verifier: string, authorization_code: string):
  Promise<AccessTokenResponse | undefined> => {
  const response: AxiosResponse = await axios.request(
    {
      data: {
        code: authorization_code,
        client_id: CLIENT_ID,
        code_verifier: code_verifier,
        redirect_uri: process.env.REACT_APP_REDIRECT_URI,
        grant_type: GrantTypes.authorization_code,
      },
      method: 'POST',
      url: `${process.env.REACT_APP_API_BASE_URL}/v1/auth/token`,
    })

  return response.data
}

export const fetchRefreshToken = async (refresh_token: string): Promise<AccessTokenResponse | undefined> => {
  const response: AxiosResponse = await axios.request(
    {
      data: {
        client_id: CLIENT_ID,
        grant_type: GrantTypes.refresh_token,
        refresh_token: refresh_token,
      },
      method: 'POST',
      url: `${process.env.REACT_APP_API_BASE_URL}/v1/auth/token`,
    })

  return response.data
}

export const getAuthenticationParams = async (publicKey: string): Promise<AuthenticationParameters> => ({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  scope: SCOPE,
  code_challenge: await generateCodeChallenge(),
  code_challenge_method: CODE_CHALLENGE_METHOD,
  response_type: ResponseTypes.code,
  device_public_key: encodeURIComponent(publicKey),
})

export const createAuthenticationRequestWithArgs = async (): Promise<string> => {

  const { publicKey }: DeviceKeyPair = await deviceKeyManager.generateKeyPair()

  const argsWithPublicKey: AuthenticationParameters = await getAuthenticationParams(publicKey)

  return createAuthenticationRequest(argsWithPublicKey)
}

export interface Headers {
  [key: string]: string
}

export const headers: Headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

export const createAuthenticationRequest = async (params: AuthenticationParameters): Promise<string> => {
  const response: AxiosResponse<AuthenticationRequestResponse> = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/v1/oauth2/auth`,
    {
      params,
      headers,
    })

  return response.data.authentication_request
}

export const getAuthenticationRequestStatus = async (request_uuid: string): Promise<AuthenticationRequestStatus> => {
  const response: AxiosResponse<AuthenticationRequestStatus> = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/v1/oauth2/auth/authentication_request/${request_uuid}/status`,
    { headers },
  )

  return response.data
}

export const redirectWithAuthCredentials = (oauth_response: string, decoupled_maf_uuid?: string): void => {
  const fullRedirectUrl: string = constructRedirectUrl(oauth_response, decoupled_maf_uuid)

  window.location.href = fullRedirectUrl
}

const constructRedirectUrl = (redirectUrl: string, decoupled_maf_uuid?: string): string => {
  let redirectUri: string = redirectUrl

  if (decoupled_maf_uuid !== undefined) {
    redirectUri += `&decoupled_maf_uuid=${decoupled_maf_uuid}`
  }

  return redirectUri
}
