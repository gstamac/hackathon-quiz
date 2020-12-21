import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MutualContact, PaginationMetaParams } from '@globalid/identity-namespace-service-sdk'
import { META_TOTAL as meta_total, META_PER_PAGE as meta_per_page, META_PAGE as meta_page } from '../constants'
import { ContactsSlice } from './interfaces'

const initialState: ContactsSlice = {
  contacts: undefined,
  fetchingContacts: true,
  meta: {
    total: meta_total,
    page: meta_page,
    per_page: meta_per_page,
  },
}

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setContacts (state: ContactsSlice, action: PayloadAction<MutualContact[] | undefined>) {
      state.contacts = action.payload
    },
    insertContacts (state: ContactsSlice, action: PayloadAction<MutualContact[]>) {
      const contacts: MutualContact[] = state.contacts ? state.contacts : []

      state.contacts = [...contacts, ...action.payload]
    },
    addContact (state: ContactsSlice, action: PayloadAction<MutualContact>) {
      state.contacts = (state.contacts ?? []).concat(action.payload)
      state.meta.total += 1
    },
    removeContacts (state: ContactsSlice) {
      state.contacts = []
      state.meta.total = 0
    },
    removeContactById (state: ContactsSlice, action: PayloadAction<string>) {
      state.contacts = (state.contacts ?? []).filter((contact: MutualContact) => contact.contact_uuid !== action.payload)
      state.meta.total -= 1
    },
    setPaginationMeta (state: ContactsSlice, action: PayloadAction<PaginationMetaParams>) {
      state.meta = action.payload
    },
    setFetchingContacts (state: ContactsSlice, action: PayloadAction<boolean>) {
      state.fetchingContacts = action.payload
    },
  },
})

export const {
  addContact,
  setContacts,
  removeContacts,
  insertContacts,
  removeContactById,
  setPaginationMeta,
  setFetchingContacts,
} = contactsSlice.actions

export default contactsSlice.reducer
