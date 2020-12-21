import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import { setToastSuccess } from 'globalid-react-ui'
import { ExtraReducerFulfilled } from '../interfaces'
import { BrowserNotificationsSlice, BrowserNotificationsSliceBuilder } from './interfaces'
import { getString } from '../../utils'

export const notifyBrowserNotificationsDisabled: AsyncThunk<void, void, {}> = createAsyncThunk(
  'browserNotifications/disableNotifications',
  (_, { dispatch }) => {
    dispatch(setToastSuccess({
      title: getString('browser-notifications-disabled-toast-title'),
      message: getString('browser-notifications-disabled-toast-message'),
    }))
  }
)

const fulfilledReducer: ExtraReducerFulfilled<void, void, BrowserNotificationsSlice> = (
  state: BrowserNotificationsSlice
) => {
  state.isPromptVisible = false
}

export const addDisableBrowserNotificationsReducers = (
  builder: BrowserNotificationsSliceBuilder
): BrowserNotificationsSliceBuilder =>
  builder.addCase(notifyBrowserNotificationsDisabled.fulfilled.type, fulfilledReducer)
