import { LS_NOTIFICATIONS_DISABLED_KEY, LS_NOTIFICATIONS_DISABLED_VALUE } from '../../constants'
import { NotificationPermissionType } from './interfaces'

export const areBrowserNotificationsDisabledInLocalStorage = (): boolean =>
  localStorage.getItem(LS_NOTIFICATIONS_DISABLED_KEY) === LS_NOTIFICATIONS_DISABLED_VALUE

export const removeNotificationsSettingFromLocalStorage = (): void => {
  localStorage.removeItem(LS_NOTIFICATIONS_DISABLED_KEY)
}

export const disableBrowserNotificationsInLocalStorage = (): void => {
  localStorage.setItem(LS_NOTIFICATIONS_DISABLED_KEY, LS_NOTIFICATIONS_DISABLED_VALUE)
}

export const shouldBrowserNotificationPromptBeDisplayed = (isLoggedIn: boolean): boolean => {
  if (!isNotificationApiSupported() || !isLoggedIn) {
    return false
  }

  const userHasNotUpdatedThePermission: boolean = Notification.permission === NotificationPermissionType.Default
  const userHasNotDismissedThePrompt: boolean =
    localStorage.getItem(LS_NOTIFICATIONS_DISABLED_KEY) !== LS_NOTIFICATIONS_DISABLED_VALUE

  return userHasNotUpdatedThePermission && userHasNotDismissedThePrompt
}

export const isNotificationApiSupported = (): boolean => (<unknown> window.Notification) !== undefined
