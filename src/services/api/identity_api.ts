import {
  getIdentityForUser,
  PublicIdentity,
  createIdentityUpdate,
  IdentityUpdateRequiredBody,
  IdentityUpdateResponse,
  IdentityRequestModel,
  Image,
  uploadImage,
  Identity,
  getIdentityUpdateById,
  updatePrivateIdentityState,
} from '@globalid/identity-namespace-service-sdk'
import { getValidToken } from '../../components/auth'
import { store } from '../../store'
import { setIdentity, setLoggedIn, updateIdentity, setProfilePrivacy } from '../../store/identity_slice'
import { delay } from '../../utils'
import axios, { AxiosResponse } from 'axios'

import pRetry from 'p-retry'
import { IdentityRequestModelStatus, IdentityStatusArgs, ValidateRequestStatusFunction } from './interfaces'
import { API_BASE_URL } from '../../constants'

// eslint-disable-next-line no-restricted-syntax
export class PhotoRejectedError extends Error {
  constructor (message: string) {
    super(message)
  }
}

export const getMyIdentity = async (): Promise<PublicIdentity> => {
  const token: string = await getValidToken()

  const identity: PublicIdentity = await getIdentityForUser(token)

  store.dispatch(setIdentity(identity))
  store.dispatch(setLoggedIn())

  return identity
}

export const updateIdentityRequest
  = async (gid_uuid: string, data: IdentityUpdateRequiredBody): Promise<IdentityRequestModel> => {
    const token: string = await getValidToken()

    const identityResponse: IdentityUpdateResponse = await createIdentityUpdate(data, { gid_uuid }, token)

    const updatedIdentity: IdentityRequestModel | undefined
      = identityResponse.data.length > 0 ? identityResponse.data[0] : undefined

    if (updatedIdentity === undefined) {
      throw new Error('ERR_IDENTITY_NOT_UPDATED')
    }

    if (updatedIdentity.moderation_response) {
      throw new Error(updatedIdentity.moderation_response)
    }

    return updatedIdentity
  }

export const waitForIdentityRequestStatus = async <T> (
  status: IdentityRequestModelStatus,
  pollingFunction: ValidateRequestStatusFunction<T>,
  args: IdentityStatusArgs,
): Promise<T> => {
  args.status = status

  return pRetry(async () => pollingFunction(args), {
    retries: 5,
    onFailedAttempt: async () => {
      await delay(5000)
    },
  })
}

export const validateIdentityRequestStatus = async (
  args: IdentityStatusArgs,
): Promise<IdentityRequestModel> => {
  const { identity_update_request_uuid, gid_uuid, access_token } = args
  const updatedIdentity: IdentityRequestModel
    = await getIdentityUpdateById({ identity_update_request_uuid, gid_uuid }, access_token)
  const identitiyRequestStatus: IdentityRequestModelStatus = updatedIdentity.status

  if (identitiyRequestStatus === args.status) {
    return updatedIdentity
  } else if (identitiyRequestStatus === 'rejected') {
    throw new pRetry.AbortError('UPDATE_FAILED')
  }
  throw new Error('KEEP_POOLING')
}

export const poolForIdentityUpdate = async (identityRequest: IdentityRequestModel): Promise<void> => {
  const token: string = await getValidToken()

  const updatedIdentity = await waitForIdentityRequestStatus<IdentityRequestModel>('approved', validateIdentityRequestStatus, {
    access_token: token,
    identity_update_request_uuid: identityRequest.uuid,
    gid_uuid: identityRequest.gid_uuid,
  })

  store.dispatch(updateIdentity({
    [updatedIdentity.field_name]: updatedIdentity.new_value,
  }))
}

export const updateCroppedProfileImage = async (gid_uuid: string, croppedImage: string): Promise<Image> => {
  const token: string = await getValidToken()

  const response: Image = await uploadImage(token, { gid_uuid }, {
    data: croppedImage,
  })

  if (response.status === 'approved' && response.is_main_image) {
    store.dispatch(updateIdentity({
      display_image_url: response.url,
    }))

    return response
  } else if (response.status === 'rejected' && response.reject_reason) {
    throw new PhotoRejectedError(response.reject_reason)
  } else {
    throw new Error('ERR_IMAGE_NOT_UPDATED')
  }
}

export const getIdentityNameByUuid = async (uuid: string): Promise<string | null> => {
  const response: AxiosResponse<Identity> = await axios.get<Identity>(
    `${API_BASE_URL}/v1/identities/${uuid}`
  )

  return response.data.gid_name
}

export const setPrivateIdentityState = async (isPrivate: boolean): Promise<void> => {
  const token: string = await getValidToken()

  await updatePrivateIdentityState(token, { is_private: isPrivate })
  store.dispatch(setProfilePrivacy(isPrivate))
}

export const getIdentitiesList = async (uuids: string[]): Promise<Identity[]> => {
  const response: AxiosResponse<Identity[]> = await axios.post<Identity[]>(
    `${API_BASE_URL}/v1/identities/list`,
    { gid_uuid: uuids }
  )

  return response.data
}
