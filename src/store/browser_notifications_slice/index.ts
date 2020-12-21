import { browserNotificationsSlice } from './browser_notifications_store'
export { notifyBrowserNotificationsEnabled } from './notify_browser_notifications_enabled_thunk'
export { notifyBrowserNotificationsDisabled } from './notify_browser_notifications_disabled_thunk'

export const { showBrowserNotificationsPrompt } = browserNotificationsSlice.actions

export default browserNotificationsSlice.reducer
