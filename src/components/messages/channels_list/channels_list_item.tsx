import React from 'react'
import { useStyles } from './styles'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { ListItemProps, ChannelListItemHookResult } from './interfaces'
import { useChannelsListItem } from './use_channels_list_item'
import { ChannelWithMembers, ChannelWithParticipantsAndParsedMessage } from '../../../store/interfaces'
import { ChannelListCounter } from './channel_list_counter'

export const ChannelListItem: React.FC<ListItemProps> = (props: ListItemProps) => {

  const channelWithLoadedMembers: ChannelWithMembers | undefined = useSelector((state: RootState) => (
    state.channels.channels?.[props.item]
  ))

  const channel: ChannelWithParticipantsAndParsedMessage | undefined = channelWithLoadedMembers?.channel

  const channelListItemData: ChannelListItemHookResult | null = useChannelsListItem(channel)

  const classes = useStyles({
    hasUnreadMessages: channelListItemData?.hasUnreadMessages,
  })

  if (channel === undefined || channelListItemData === null) {
    return null
  }

  const {
    isActiveChannel,
    hasUnreadMessages,
    unreadMessagesCount,
    messageAuthorName,
    lastMessage,
    createdDate,
    title,
    avatar,
    handleClick,
  }: ChannelListItemHookResult = channelListItemData

  const listItem: string = `${classes.listItem} ${isActiveChannel ? classes.selectedListItem : ''}`

  return (
    <div
      key={channel.id}
      className={listItem}
      onClick={handleClick}
    >
      <div className={classes.avatarWrapper}>
        {avatar}
      </div>
      <div
        className={classes.channelInfoWrapper}
        data-testid='channel-info-wrapper'
      >
        <div className={classes.titleWrapperWrapper}>
          <span className={classes.channelDescription}>{title}</span>
          <div>
            {hasUnreadMessages && <ChannelListCounter unreadMessagesCount={unreadMessagesCount} />}
          </div>
        </div>
        <div className={classes.lastMessageWrapper}>
          {lastMessage && <div className={classes.lastMessageWrapper}>
            <span className={classes.lastMessage}><span className={classes.lastMessageAuthor}>{messageAuthorName}</span> {lastMessage}</span>
            <span className={classes.lastMessageDate}> • {createdDate}</span>
          </div>}
        </div>
      </div>
    </div>
  )
}
