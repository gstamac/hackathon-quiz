import { actHook, testCustomHook, TestCustomHookType } from '../../../tests/test_utils'
import { useBrowserNotificationsPrompt } from './use_browser_notifications_prompt'
import * as slice from '../../store/browser_notifications_slice'
import * as reactDeviceDetect from 'react-device-detect'

describe('useBrowserNotificationsPrompt', () => {
  const getHookResult: TestCustomHookType<{}, void> =
    testCustomHook(useBrowserNotificationsPrompt, { isLoggedIn: true })

  const showBrowserNotificationsPromptSpy: jest.SpyInstance = jest.spyOn(slice, 'showBrowserNotificationsPrompt')

  afterEach(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should dispatch an action if the user is logged in', async () => {
    await actHook(async () => {
      await getHookResult({})
    })

    expect(showBrowserNotificationsPromptSpy).toHaveBeenCalledTimes(1)
  })

  it('should not dispatch an action if the user is not logged in', async () => {
    await actHook(async () => {
      await getHookResult({ isLoggedIn: false })
    })

    expect(showBrowserNotificationsPromptSpy).not.toHaveBeenCalled()
  })

  it('should not dispatch an action if the user is on a mobile device', async () => {
    // eslint-disable-next-line no-import-assign
    Object.defineProperty(reactDeviceDetect, 'isMobile', { value: true })

    await actHook(async () => {
      await getHookResult({})
    })

    expect(showBrowserNotificationsPromptSpy).not.toHaveBeenCalled()
  })
})
