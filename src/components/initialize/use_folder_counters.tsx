import useAsyncEffect from 'use-async-effect'
import { ThunkDispatch } from '../../store'
import { fetchFolders } from '../../store/channels_slice/channels_slice'
import { prepareAndFetchFolderCounter } from '../../store/counters_slice'
import { setDocumentTitleProps, useFolderCountersProps } from './interfaces'
import { reshapeNumberOfUnreadMessages, getNumberOfUnreadMessages } from '../../utils/counter_helpers'
import { getString } from '../../utils'
import { useDispatch } from 'react-redux'

export const useFolderCounters = ({ isLoggedIn }: useFolderCountersProps): void => {
  const dispatch: ThunkDispatch = useDispatch()

  useAsyncEffect(async () => {
    if (isLoggedIn) {
      await dispatch(fetchFolders({}))

      await dispatch(prepareAndFetchFolderCounter())
    }
  }, [isLoggedIn])
}

export const setDocumentTitle = ({ counters, isLoggedIn }: setDocumentTitleProps): void => {
  if (isLoggedIn) {
    const unreadMessagesCounter: string = reshapeNumberOfUnreadMessages(getNumberOfUnreadMessages(counters))
    const counterPrefix: string = unreadMessagesCounter ? `(${unreadMessagesCounter}) ` : ''

    document.title = getString('meta-title').replace('{number}', counterPrefix)
  }
}
