import { useEffect, useCallback } from 'react'
import { ChannelWithParticipantsAndParsedMessage, AsyncThunkReturnAction, FetchChannelProps } from '../store/interfaces'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from 'RootType'
import { fetchChannel } from '../store/channels_slice/channels_slice'
import { useHistory, useRouteMatch, match as Match } from 'react-router-dom'
import { Folder } from '@globalid/messaging-service-sdk'
import { goToChannel, getRouteFolderType } from '../utils/channel_helpers'
import { History } from 'history'
import { ThunkDispatch } from '../store'
import { FETCH_CHANNEL_TIMEOUT, BASE_MESSAGES_URL } from '../constants'
import { HandleChannelLoadingParams } from './interfaces'
import { debounce } from '@material-ui/core'
import { useBooleanState } from './use_boolean_state'
import { pushTo } from '../utils'

// eslint-disable-next-line max-lines-per-function
export const useHandleChannelLoading = ({ channelId, groupUuid }: HandleChannelLoadingParams): boolean => {

  const storeChannel: ChannelWithParticipantsAndParsedMessage | undefined = useSelector(
    (state: RootState) => channelId ? state.channels.channels[channelId]?.channel : undefined
  )

  const history: History = useHistory()

  const dispatch: ThunkDispatch = useDispatch()

  const match: Match = useRouteMatch()

  const folders: Folder[] = useSelector((state: RootState) => state.channels.folders)

  const [isDebounced, setIsDebounced, setClearedDebounce] = useBooleanState(false)

  const debounceFetch = useCallback(debounce(async (channelToFetch: string): Promise<void> => {
    const action: AsyncThunkReturnAction<ChannelWithParticipantsAndParsedMessage, FetchChannelProps> = (
      await dispatch(fetchChannel({ channelId: channelToFetch }))
    )

    if (action.type === fetchChannel.fulfilled.type && action.payload) {
      const channel: ChannelWithParticipantsAndParsedMessage = <ChannelWithParticipantsAndParsedMessage> action.payload

      goToChannel(
        history,
        channelToFetch,
        getRouteFolderType(folders, channel.folder_id, groupUuid),
        { currentPath: match.path, groupUuid }
      )
    } else {
      const redirectTo: string = groupUuid !== undefined
        ? `${BASE_MESSAGES_URL}/g/${groupUuid}`
        : history.location.pathname.replace(channelId ?? '', '')

      pushTo(history, redirectTo)
    }
  }, FETCH_CHANNEL_TIMEOUT), [folders.length])

  useEffect(() => {
    if (storeChannel !== undefined && !isDebounced) {
      goToChannel(
        history,
        storeChannel.id,
        getRouteFolderType(folders, storeChannel.folder_id, groupUuid),
        { currentPath: match.path, groupUuid }
      )
    }
  }, [storeChannel])

  useEffect(() => {
    if (storeChannel?.id === undefined && channelId !== undefined && (groupUuid !== undefined || folders.length > 0)) {
      // eslint-disable-next-line no-void
      void debounceFetch(channelId)
      setIsDebounced()
    } else {
      debounceFetch.clear()
      setClearedDebounce()

      if (storeChannel !== undefined) {
        goToChannel(
          history,
          storeChannel.id,
          getRouteFolderType(folders, storeChannel.folder_id, groupUuid),
          { currentPath: match.path, groupUuid }
        )
      }
    }
  }, [storeChannel?.id, channelId, folders])

  useEffect(() => () => {
    debounceFetch.clear()
    setClearedDebounce()
  }, [])

  return isDebounced
}
