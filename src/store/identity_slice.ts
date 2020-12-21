import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { IdentitySlice } from './interfaces'

const initialState: IdentitySlice = {
  identity: undefined,
  isLoggedIn: false,
  hasVisited: true,
}

const identitySlice = createSlice({
  name: 'identity',
  initialState,
  reducers: {
    setLoggedIn (state: IdentitySlice) {
      state.isLoggedIn = true
    },
    setLoggedOut (state: IdentitySlice) {
      state.isLoggedIn = false
      state.identity = undefined
    },
    setIdentity (state: IdentitySlice, action: PayloadAction<PublicIdentity>) {
      state.identity = action.payload
    },
    updateIdentityDisplayName (state: IdentitySlice, action: PayloadAction<string>) {
      if (state.identity !== undefined) {
        state.identity.display_name = action.payload
      }
    },
    updateIdentityDescription (state: IdentitySlice, action: PayloadAction<string>) {
      if (state.identity !== undefined) {
        state.identity.description = action.payload
      }
    },
    updateIdentity (state: IdentitySlice, action: PayloadAction<Partial<PublicIdentity>>) {
      if (state.identity !== undefined) {
        state.identity = {
          ...state.identity,
          ...action.payload,
        }
      }
    },
    removeIdentity (state: IdentitySlice) {
      state.identity = undefined
    },
    setProfilePrivacy (state: IdentitySlice, action: PayloadAction<boolean>) {
      if (state.identity !== undefined) {
        state.identity.is_private = action.payload
      }
    },
    setHasVisited (state: IdentitySlice, action: PayloadAction<boolean>){
      state.hasVisited = action.payload
    },
  },
})

export const {
  setLoggedIn,
  setLoggedOut,
  setIdentity,
  updateIdentityDisplayName,
  updateIdentityDescription,
  updateIdentity,
  removeIdentity,
  setProfilePrivacy,
  setHasVisited,
} = identitySlice.actions

export default identitySlice.reducer
