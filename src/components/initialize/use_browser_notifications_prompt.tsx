import { ThunkDispatch } from '../../store'
import { UseBrowserNotificationPromptHookProps } from './interfaces'
import { shouldBrowserNotificationPromptBeDisplayed } from '../../store/browser_notifications_slice/helpers'
import { showBrowserNotificationsPrompt } from '../../store/browser_notifications_slice'
import { useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { useDispatch } from 'react-redux'

export const useBrowserNotificationsPrompt = ({ isLoggedIn }: UseBrowserNotificationPromptHookProps): void => {
  const dispatch: ThunkDispatch = useDispatch()

  useEffect(() => {
    if (!isMobile && shouldBrowserNotificationPromptBeDisplayed(isLoggedIn)) {
      dispatch(showBrowserNotificationsPrompt())
    }
  }, [isLoggedIn])
}
