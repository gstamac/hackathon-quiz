import { Dispatch } from '@reduxjs/toolkit'
import { setToastSuccess, setToastError } from 'globalid-react-ui'
import { addToContacts, canAddToContacts, removeFromContacts } from '../services/api'
import { getString } from './general_utils'

export const userExistsInContacts = async (gid_name: string): Promise<boolean> => {
  const userNotInContacts: boolean = await canAddToContacts(gid_name)

  return !userNotInContacts
}

export const addUserToContacts = async (dispatcher: Dispatch, gid_uuid: string, gid_name: string): Promise<boolean> => {
  try {
    await addToContacts(gid_uuid, gid_name)

    dispatcher(setToastSuccess({
      title: getString('contact-added-title'),
      message: `${gid_name}${getString('contact-added-description')}`,
    }))

    return true
  } catch (error) {
    dispatcher(setToastError({
      title: getString('contact-added-title-failed'),
      message: `${gid_name}${getString('contact-added-description-failed')}`,
    }))
  }

  return false
}

export const removeUserFromContacts = async (dispatcher: Dispatch, gid_name: string): Promise<boolean> => {
  try {
    await removeFromContacts(gid_name)

    dispatcher(setToastSuccess({
      title: getString('contact-removed-title'),
      message: `${gid_name}${getString('contact-removed-description')}`,
    }))

    return true
  } catch (error) {
    dispatcher(setToastError({
      title: getString('contact-removed-title-failed'),
      message: `${gid_name}${getString('contact-removed-description-failed')}`,
    }))
  }

  return false
}
