import axios, { AxiosResponse } from 'axios'
import {
  GetIdentityPublicParams,
  Identities,
  IdentitiesListQuery,
  Identity,
} from '@globalid/identity-namespace-service-sdk'
import { getAccessToken } from '../../utils'

export const getIdentityPublic = async (params: GetIdentityPublicParams): Promise<Identity> => {
  const token: string | null = getAccessToken()
  const response: AxiosResponse = await axios.request({
    url: `${process.env.REACT_APP_API_BASE_URL}/v1/identities/${params.gid_uuid}`,
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export const getIdentitiesLookup = async (queryParams: IdentitiesListQuery): Promise<Identities> => {
  const response: AxiosResponse = await axios.request({
    url: `${process.env.REACT_APP_API_BASE_URL}/v2/identities`,
    params: queryParams,
    method: 'get',
  })

  return response.data
}
