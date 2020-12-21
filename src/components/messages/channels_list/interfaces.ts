import { ChannelType } from '../../../store/interfaces'
import { Folder } from '@globalid/messaging-service-sdk'
import { MessagesType } from '../interfaces'

export interface GetChannelsHook {
  channelsIds?: string[]
  loadNextPage: () => void
  hasNextPage: boolean
  areChannelsLoading: boolean
}

export interface GetChannelsHookProps {
  folderType: MessagesType
  folders: Folder[]
  groupUuid?: string
}

export interface ListItemProps {
  item: string
}

export interface ListCounterProps {
  unreadMessagesCount: string
}

export interface ChannelListProps {
  folders: Folder[]
  folderType: MessagesType
  groupUuid?: string
}

export interface ChannelListItemHookResult {
  isActiveChannel: boolean
  hasUnreadMessages: boolean
  unreadMessagesCount: string
  messageAuthorName?: string
  lastMessage: string | null
  createdDate: string | null
  title: string | undefined | null
  avatar?: JSX.Element
  handleClick: () => void
}

export interface FetchChannelsParams {
  device_id?: string
  folder_id?: string
  channelTypes: (ChannelType.PERSONAL | ChannelType.MULTI | ChannelType.GROUP)[]
}

export enum MediaAssetType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export interface LastMessage {
  text: string | null
  showAuthor?: boolean
}
