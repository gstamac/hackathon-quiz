import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  gameQuizFormOpen: boolean
}

const initialState: UIState = {
  gameQuizFormOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGameQuizFormState (state: UIState, action: PayloadAction<boolean>): void {
      state.gameQuizFormOpen = action.payload
    },
  },
})

export const {
  setGameQuizFormState,
} = uiSlice.actions

export default uiSlice.reducer
