import React from 'react'
import { useStyles } from './styles'
import messagesBackgroundIcon from '../../assets/icons/messages-background.svg'
import { GroupChatProps } from './interfaces'
import { getString } from '../../utils'
import { GroupResponse } from '@globalid/group-service-sdk'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { ChatInformation, MessagesType } from '../messages/interfaces'
import { useChatContainer } from '../messages/messenger_chat/use_chat_container'
import { ChannelHeader } from '../messages/channel_header'
import { GlobalidLoader } from '../global'
import useAsyncEffect from 'use-async-effect'
import { store } from '../../store'
import { fetchChannels } from '../../store/channels_slice/channels_slice'
import { ChannelType } from '../../store/interfaces'
import clsx from 'clsx'
import _ from 'lodash'

export const GroupsChat: React.FC<GroupChatProps> = ({ groupUuid, channelId }: GroupChatProps) => {
  const classes = useStyles()

  const {
    contentWrapper,
    backgroundPicExtra,
    comingSoon,
    centerLoader,
    paddingTopGroupChat,
  } = classes

  const group: GroupResponse | undefined = useSelector((root: RootState) => groupUuid !== undefined ? root.groups.groups[groupUuid] : undefined)
  const chatInformation: ChatInformation | null = useChatContainer(MessagesType.GROUPS, channelId ?? '')

  useAsyncEffect(async () => {
    if (groupUuid && channelId === undefined) {
      store.dispatch(fetchChannels({
        groupUuid,
        channelTypes: [ChannelType.GROUP],
        page: 1,
        per_page: 1,
      }))
    }
  }, [])

  if (groupUuid && channelId === undefined) {
    return <div className={centerLoader}>
      <GlobalidLoader/>
    </div>
  }

  const descriptionText: string = group !== undefined ?
    getString('select-group-channel').replace('{GROUP}', group.display_name ?? group.gid_name) :
    getString('select-group-chatting')

  return (
    <div className={classes.chatContainer}>
      {groupUuid && chatInformation && channelId &&
      <ChannelHeader
        channelId={channelId}
        gidUuid={chatInformation.identity.gid_uuid}
        {...chatInformation}
      />}
      <div data-testid={'groups_chat'} className={clsx(contentWrapper, _.isUndefined(groupUuid) && paddingTopGroupChat)}>
        <img
          className={backgroundPicExtra}
          src={messagesBackgroundIcon}
          alt='Background icon'
        />
        <span className={comingSoon}>
          {descriptionText}
        </span>
      </div>
    </div>
  )
}
