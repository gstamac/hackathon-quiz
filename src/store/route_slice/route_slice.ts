import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RouteSlice } from './interfaces'

const initialState: RouteSlice = {
  redirectTo: undefined,
}

export const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    setRedirectToUrl (state: RouteSlice, action: PayloadAction<string | undefined>) {
      state.redirectTo = action.payload
    },
  },
})
