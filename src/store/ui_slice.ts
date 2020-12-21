import { GeneralObject } from './../utils/interfaces'
import { KeyValuePayload } from './interfaces'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  gameFormOpen: GeneralObject<boolean>
}

const initialState: UIState = {
  gameFormOpen: {},
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openGameForm (state: UIState, action: PayloadAction<KeyValuePayload<boolean>>): void {
      state.gameFormOpen = {
        [action.payload.key]: action.payload.value,
      }
    },
    closeGameForm (state: UIState): void {
      state.gameFormOpen = {}
    },
  },
})

export const {
  openGameForm,
  closeGameForm,
} = uiSlice.actions

export default uiSlice.reducer
