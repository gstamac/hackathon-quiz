import _ from 'lodash'

import axios, { AxiosResponse } from 'axios'
import {
  IdentityContactsQueryParams,
  MutualContacts,
} from '@globalid/identity-namespace-service-sdk'
import { addContact, removeContact, init } from '@globalid/contacts-service-sdk'
import { getValidToken } from '../../components/auth'
import { store } from '../../store'
import { addContact as addContactToStore, removeContactById } from '../../store/contacts_slice'
import { API_BASE_URL } from '../../constants'

init(API_BASE_URL)

export const getMyContactsList = async (queryParams: IdentityContactsQueryParams): Promise<MutualContacts> => {
  const token: string = await getValidToken()

  const response: AxiosResponse = await axios.request(
    {
      url: `${API_BASE_URL}/v1/identities/me/contacts`,
      params: queryParams,
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}

export const canAddToContacts = async (gid_name: string): Promise<boolean> => {
  const token: string = await getValidToken()

  const response: AxiosResponse = await axios.request(
    {
      url: `${API_BASE_URL}/v1/identities/me/contacts?gid_name=${gid_name}`,
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return _.isEmpty(response.data.data)
}

export const addToContacts = async (gid_uuid: string, gid_name: string): Promise<void> => {
  const token: string = await getValidToken()

  await addContact(token, { gid_uuid })

  const response: AxiosResponse = await axios.request(
    {
      url: `${API_BASE_URL}/v1/identities/me/contacts?gid_name=${gid_name}`,
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (response.data.data[0] === undefined) {
    throw new Error('ERR_ADDING_CONTACT')
  }

  store.dispatch(addContactToStore(response.data.data[0]))
}

export const removeFromContacts = async (gid_name: string): Promise<void> => {
  const token: string = await getValidToken()

  const response: AxiosResponse = await axios.request(
    {
      url: `${API_BASE_URL}/v1/identities/me/contacts?gid_name=${gid_name}`,
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (response.data.data[0] === undefined) {
    throw new Error('ERR_REMOVING_CONTACT')
  }

  await removeContact(token, { contact_uuid: response.data.data[0].contact_uuid })
  store.dispatch(removeContactById(response.data.data[0].contact_uuid))
}
