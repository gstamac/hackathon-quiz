import { LS_NOTIFICATIONS_DISABLED_KEY, LS_NOTIFICATIONS_DISABLED_VALUE } from '../../constants'
import * as helpers from './helpers'
import { NotificationPermissionType } from './interfaces'
import { $enum } from 'ts-enum-util'

type MockPermissionApi = { permission: NotificationPermission } | undefined

const setMockNotificationApi = (definition: MockPermissionApi): void => {
  const mockNotificationApi: MockPermissionApi = definition

  global.Notification = <typeof Notification> mockNotificationApi
}

describe('removeNotificationsSettingFromLocalStorage', () => {
  afterEach(() => {
    localStorage.removeItem(LS_NOTIFICATIONS_DISABLED_KEY)
  })

  it('should remove the value in localStorage', () => {
    helpers.removeNotificationsSettingFromLocalStorage()
    expect(localStorage.removeItem).toHaveBeenCalledWith(LS_NOTIFICATIONS_DISABLED_KEY)
  })
})

describe('disableBrowserNotificationsInLocalStorage', () => {
  afterEach(() => {
    localStorage.removeItem(LS_NOTIFICATIONS_DISABLED_KEY)
  })

  it('should store the correct value in localStorage', () => {
    helpers.disableBrowserNotificationsInLocalStorage()
    expect(localStorage.setItem).toHaveBeenCalledWith(LS_NOTIFICATIONS_DISABLED_KEY, LS_NOTIFICATIONS_DISABLED_VALUE)
  })
})

describe('shouldBrowserNotificationPromptBeDisplayed', () => {
  afterEach(() => {
    localStorage.removeItem(LS_NOTIFICATIONS_DISABLED_KEY)
  })

  it('should return false if the browser doesnt support the Notification API', () => {
    setMockNotificationApi(undefined)
    expect(helpers.shouldBrowserNotificationPromptBeDisplayed(true)).toBe(false)
  })

  it('should return false if the user is not logged in', () => {
    setMockNotificationApi(undefined)
    expect(helpers.shouldBrowserNotificationPromptBeDisplayed(false)).toBe(false)
  })

  it('should return true if the user hasnt updated the permission or dismissed the prompt', () => {
    setMockNotificationApi({ permission: NotificationPermissionType.Default })
    expect(helpers.shouldBrowserNotificationPromptBeDisplayed(true)).toBe(true)
  })

  it('should return false if the user has granted the permission', () => {
    setMockNotificationApi({ permission: NotificationPermissionType.Granted })
    expect(helpers.shouldBrowserNotificationPromptBeDisplayed(true)).toBe(false)
  })

  it('should return false if the user has denied the permission', () => {
    setMockNotificationApi({ permission: NotificationPermissionType.Denied })
    expect(helpers.shouldBrowserNotificationPromptBeDisplayed(true)).toBe(false)
  })

  it('should return false if the user has dissmissed the prompt', () => {
    localStorage.setItem(LS_NOTIFICATIONS_DISABLED_KEY, LS_NOTIFICATIONS_DISABLED_VALUE)

    $enum(NotificationPermissionType).forEach(type => {
      setMockNotificationApi({ permission: type })
      expect(helpers.shouldBrowserNotificationPromptBeDisplayed(true)).toBe(false)
    })
  })
})

describe('isNotificationApiSupported', () => {
  it('should return true/false based on whether the browser supports the Notification API', () => {
    setMockNotificationApi({ permission: NotificationPermissionType.Default })
    expect(helpers.isNotificationApiSupported()).toBe(true)

    setMockNotificationApi(undefined)
    expect(helpers.isNotificationApiSupported()).toBe(false)
  })
})
