import { Folder } from '@globalid/messaging-service-sdk'
import { History } from 'history'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { RootState } from 'RootType'
import { BASE_MESSAGES_URL } from '../../constants'
import { fetchFoldersCounters } from '../../store/counters_slice'
import { getString } from '../../utils'
import { ButtonGroup } from '../global/button_group'
import { GroupButton } from '../global/button_group/interfaces'
import { ChannelFoldersIds, ChannelFoldersType, MessagesType } from './interfaces'
import { reshapeNumberOfUnreadMessages } from '../../utils/counter_helpers'

export const ChannelFolders: React.FC = () => {
  const history: History<History> = useHistory()
  const match = useRouteMatch<{ type: string }>()
  const dispatch = useDispatch()

  const folders: Folder[] = useSelector((state: RootState) => state.channels.folders)

  const counters: { [key: string]: number }
    = useSelector((state: RootState) => state.counters.counters)

  const primaryFolderId: string | undefined = folders.find((folder: Folder) => folder.type === ChannelFoldersType.GENERAL)?.id
  const otherFolderId: string | undefined = folders.find((folder: Folder) => folder.type === ChannelFoldersType.UNKNOWN)?.id

  useEffect(() => {
    if (primaryFolderId !== undefined && otherFolderId !== undefined) {
      fetchFoldersCount()
    }
  }, [primaryFolderId, otherFolderId])

  const primaryCount: string = reshapeNumberOfUnreadMessages(counters[MessagesType.PRIMARY])
  const otherCount: string = reshapeNumberOfUnreadMessages(counters[MessagesType.OTHER])

  const fetchFoldersCount = (): void => {
    dispatch(fetchFoldersCounters({
      [MessagesType.PRIMARY]: primaryFolderId,
      [MessagesType.OTHER]: otherFolderId,
    } as ChannelFoldersIds))
  }

  const onButtonClick = (messageType: string): void => {
    fetchFoldersCount()
    history.push(`${BASE_MESSAGES_URL}/${messageType}`)
  }

  const buttons: GroupButton[] = [
    {
      label: getString('button-group-primary'),
      onClick: () => onButtonClick(MessagesType.PRIMARY),
      counter: primaryCount,
    },
    {
      label: getString('button-group-other'),
      onClick: () => onButtonClick(MessagesType.OTHER),
      counter: otherCount,
    },
  ]

  const buttonSwitch: {
    [key: string]: number
  } = {
    [MessagesType.PRIMARY]: 0,
    [MessagesType.OTHER]: 1,
  }

  const getActiveButton = (): number => (
    buttonSwitch[match.params.type]
  )

  return (
    <ButtonGroup buttons={buttons} active={getActiveButton()} />
  )
}
