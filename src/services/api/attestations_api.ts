import { API_BASE_URL } from './../../constants'
import { App, Category, Type, Agency, GetSingleAppSearchRequests, API } from '@globalid/attestations-types'
import axios, { AxiosResponse } from 'axios'

export const getVerificationApps = async (gid_uuid: string): Promise<App.Model[]> => {
  const response: AxiosResponse = await axios.get(
    `${API_BASE_URL}/v1/identity/${gid_uuid}/attestations/latest`
  )

  return response.data.data
}

export const getVerificationsByAgencies = async (
  app_uuid: string,
  gid_uuid: string
): Promise<GetSingleAppSearchRequests.Response> => {

  const response: AxiosResponse = await axios.get(
    `${API_BASE_URL}/v1/identity/${gid_uuid}/app/${app_uuid}/attestations`
  )

  return response.data
}

export const getAppCategories = async (): Promise<Category.Model[]> => {

  const response: AxiosResponse<Category.Model[]> = await axios.get(
    `${API_BASE_URL}/v1/attestations/agencies/categories`,
  )

  return response.data
}

export const getAppTypes = async (): Promise<Type.Model[]> => {
  const response: AxiosResponse<Type.Model[]> = await axios.get(
    `${API_BASE_URL}/v1/attestations/types`
  )

  return response.data
}

export const getAgencies = async (): Promise<Agency.Model[]> => {
  const response: AxiosResponse<Agency.Model[]> = await axios.get(
    `${API_BASE_URL}/v1/attestations/agencies`
  )

  return response.data
}

export const getVerificationPubKey = async (): Promise<API.V1.Attestations.Publickey.GET.Response> => {
  const response: AxiosResponse<API.V1.Attestations.Publickey.GET.Response> = await axios.get(
    `${API_BASE_URL}/v1/attestations/publickey`
  )

  return response.data
}
