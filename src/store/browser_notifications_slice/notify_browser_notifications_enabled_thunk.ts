import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import { setToastSuccess } from 'globalid-react-ui'
import { ExtraReducerFulfilled } from '../interfaces'
import { BrowserNotificationsSlice, BrowserNotificationsSliceBuilder } from './interfaces'
import { getString } from '../../utils'

export const notifyBrowserNotificationsEnabled: AsyncThunk<void, void, {}> = createAsyncThunk(
  'browserNotifications/enableNotifications',
  (_, { dispatch }) => {
    dispatch(setToastSuccess({
      title: getString('browser-notifications-enabled-toast-title'),
      message: getString('browser-notifications-enabled-toast-message'),
    }))
  }
)

const fulfilledReducer: ExtraReducerFulfilled<void, void, BrowserNotificationsSlice> = (
  state: BrowserNotificationsSlice
) => {
  state.isPromptVisible = false
}

export const addEnableBrowserNotificationsReducers = (
  builder: BrowserNotificationsSliceBuilder
): BrowserNotificationsSliceBuilder =>
  builder.addCase(notifyBrowserNotificationsEnabled.fulfilled.type, fulfilledReducer)
