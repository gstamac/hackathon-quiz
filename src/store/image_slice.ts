import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ImageSlice, ImageData } from './interfaces'

const initialState: ImageSlice = {
  image: undefined,
}

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setFullImageView (state: ImageSlice, action: PayloadAction<ImageData | undefined>) {
      state.image = action.payload
    },
  },
})

export const {
  setFullImageView,
} = imageSlice.actions

export default imageSlice.reducer
