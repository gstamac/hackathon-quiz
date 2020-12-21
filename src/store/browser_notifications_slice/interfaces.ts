import { Builder } from '../interfaces'
import browserNotificationsReducer from '.'

export interface BrowserNotificationsSlice {
  isPromptVisible: boolean
}

export type BrowserNotificationsSliceBuilder = Builder<BrowserNotificationsSlice>

export enum NotificationPermissionType {
  Default = 'default',
  Granted = 'granted',
  Denied = 'denied',
}

export interface StoreTypeMock {
  browserNotifications: ReturnType<typeof browserNotificationsReducer>
}
