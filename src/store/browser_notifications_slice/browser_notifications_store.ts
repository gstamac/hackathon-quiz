import { BrowserNotificationsSlice, BrowserNotificationsSliceBuilder } from './interfaces'
import { createSlice } from '@reduxjs/toolkit'
import { addReducers } from '../reducer_builder'
import { addEnableBrowserNotificationsReducers } from './notify_browser_notifications_enabled_thunk'
import { addDisableBrowserNotificationsReducers } from './notify_browser_notifications_disabled_thunk'

const initialState: BrowserNotificationsSlice = {
  isPromptVisible: false,
}

export const browserNotificationsSlice = createSlice({
  name: 'browserNotifications',
  initialState,
  reducers: {
    showBrowserNotificationsPrompt (state: BrowserNotificationsSlice) {
      state.isPromptVisible = true
    },
  },
  extraReducers: (builder: BrowserNotificationsSliceBuilder) => (
    addReducers<BrowserNotificationsSliceBuilder>(builder, [
      addEnableBrowserNotificationsReducers,
      addDisableBrowserNotificationsReducers,
    ])
  ),
})
