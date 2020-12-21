import { GeneralObject } from '../../utils/interfaces'

export interface useFolderCountersProps {
  isLoggedIn: boolean
}

export interface setDocumentTitleProps {
  counters: GeneralObject<number>
  isLoggedIn: boolean
}

export interface UseBrowserNotificationPromptHookProps {
  isLoggedIn: boolean
}
