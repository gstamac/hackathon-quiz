import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import useAsyncEffect from 'use-async-effect'
import { useInitPubnubEvents } from '../../hooks/use_init_pubnub_events'
import { initializeDeviceKeyManager } from '../messages/helpers'
import { setDocumentTitle, useFolderCounters } from './use_folder_counters'
import { GeneralObject } from '../../utils/interfaces'
import { useBrowserNotificationsPrompt } from './use_browser_notifications_prompt'

export const Initialize: React.FC = () => {
  const isLoggedIn: boolean = useSelector((state: RootState) => state.identity.isLoggedIn)
  const counters: GeneralObject<number> = useSelector((state: RootState) => state.counters.counters)

  useInitPubnubEvents({ isLoggedIn })

  useFolderCounters({ isLoggedIn })

  setDocumentTitle({ counters, isLoggedIn })

  useBrowserNotificationsPrompt({ isLoggedIn })

  useAsyncEffect(async () => {
    await initializeDeviceKeyManager()
  }, [])

  return null
}
