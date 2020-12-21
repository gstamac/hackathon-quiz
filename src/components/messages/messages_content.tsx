import React, { useEffect } from 'react'
import { MessagesContentProps, MessagesType, EncryptionStatus } from './interfaces'
import { Messages, GoToGroups, SkeletonPage, E2eEncryption, NoChats } from '../landing_pages'
import { useStyles } from './styles'
import { ChatContainer } from './messenger_chat/chat_container'
import { useSelector } from 'react-redux'
import { getChannelArray } from '../../store/channels_slice/helpers'
import { RootState } from 'RootType'
import { useHistory } from 'react-router-dom'
import { ChannelWithMembers, ChannelsType, GroupDataByFolderType, ChannelType } from '../../store/interfaces'
import { GroupsChat } from '../landing_pages/groups_chat'
import { useHandleChannelLoading } from '../../hooks/use_handle_channel_loading_hook'
import { History } from 'history'
import { BASE_MESSAGES_URL } from '../../constants'
import clsx from 'clsx'

const getMessagingLandingPage = (
  messagesType: MessagesType,
  channelsIds?: string[]
): JSX.Element => !channelsIds ? <SkeletonPage/> :
  channelsIds.length > 0
    ? <Messages type={messagesType}/>
    : messagesType === MessagesType.GROUPS ? <GoToGroups/> : <NoChats/>

const getGroupsContainerOrLandingPage = (
  encryptionStatus: EncryptionStatus,
  setEncryptionStatus: (status: EncryptionStatus) => void,
  messagesType: MessagesType,
  groupIds?: string[],
  channelId?: string,
  groupUuid?: string,
  groupChannelId?: string
): JSX.Element => encryptionStatus === EncryptionStatus.ENABLED ?
  !groupIds ? <SkeletonPage/> :
    groupIds.length > 0
      ? channelId !== undefined
        ? <ChatContainer messagesType={messagesType} channelId={channelId}/>
        : <GroupsChat groupUuid={groupUuid} channelId={groupChannelId}/>
      : <GoToGroups/>
  : <E2eEncryption encryptionStatus={encryptionStatus} setEncryptionStatus={setEncryptionStatus}/>

const getMessageContainerOrLandingPage = (
  messagesType: MessagesType,
  channelsIds?: string[],
  channelId?: string,
): JSX.Element => channelId !== undefined
  ? <ChatContainer messagesType={messagesType} channelId={channelId}/>
  : getMessagingLandingPage(messagesType, channelsIds)

const getMessageContainerOrEncryptionPage = (
  encryptionStatus: EncryptionStatus,
  setEncryptionStatus: (status: EncryptionStatus) => void,
  messagesType: MessagesType,
  channelsIds?: string[],
  channelId?: string,
): JSX.Element =>
  encryptionStatus === EncryptionStatus.ENABLED
    ? getMessageContainerOrLandingPage(messagesType, channelsIds, channelId)
    : <E2eEncryption encryptionStatus={encryptionStatus} setEncryptionStatus={setEncryptionStatus}/>

const getMessageContainer = (
  type: string,
  encryptionStatus: EncryptionStatus,
  setEncryptionStatus: (status: EncryptionStatus) => void,
  channelsIds?: string[],
  groupIds?: string[],
  channelId?: string,
  groupUuid?: string,
  groupChannelId?: string
): JSX.Element => {
  switch (type) {
  case MessagesType.GROUPS:
    return getGroupsContainerOrLandingPage(
      encryptionStatus,
      setEncryptionStatus,
      MessagesType.GROUPS,
      groupIds,
      channelId,
      groupUuid,
      groupChannelId,
    )
  case MessagesType.OTHER:
    return getMessageContainerOrEncryptionPage(
      encryptionStatus,
      setEncryptionStatus,
      MessagesType.OTHER,
      channelsIds,
      channelId,
    )
  case MessagesType.PRIMARY:
    return getMessageContainerOrEncryptionPage(
      encryptionStatus,
      setEncryptionStatus,
      MessagesType.PRIMARY,
      channelsIds,
      channelId,
    )
  default:
    return <GoToGroups/>
  }
}

export const MessagesContent: React.FC<MessagesContentProps> = (props: MessagesContentProps) => {
  const classes = useStyles()
  const { channelId, groupUuid, type, encryptionStatus, setEncryptionStatus } = props

  const history: History = useHistory()

  const fetchTimeoutRunning: boolean = useHandleChannelLoading({ channelId, groupUuid })

  const channels: ChannelsType = useSelector((root: RootState) => root.channels.channels)
  const isListLoading: boolean = useSelector((root: RootState) => root.channels.isFetchingAll)

  const channelIds: string[] | undefined = isListLoading ? undefined : getChannelArray(channels)
    .filter((channel: ChannelWithMembers) => !channel.channel.deleted)
    .map((channel: ChannelWithMembers) => channel.channel.id)

  const groups: GroupDataByFolderType = useSelector((root: RootState) => root.groups.messaging)
  const isGroupsLoading: boolean = useSelector((root: RootState) => root.groups.isFetching.messaging) ?? false

  const groupIds: string[] | undefined = isGroupsLoading ? undefined : groups.groupUuids

  const isChannelIncluded: boolean = (channelId !== undefined && channelIds?.includes(channelId)) ?? false

  const groupChannelId: string | undefined = isListLoading ? undefined : getChannelArray(channels)
    .find((groupChannel: ChannelWithMembers) =>
      groupChannel.channel.type === ChannelType.GROUP && groupChannel.channel.group_uuid === groupUuid)?.channel.id

  const isLoadingGroupChannelList: boolean | undefined = useSelector((root: RootState) =>
    groupUuid !== undefined ? root.channels.isFetching[groupUuid] : undefined)

  useEffect(() => {
    if (groupUuid && !groupChannelId && isLoadingGroupChannelList === false && !fetchTimeoutRunning) {
      history.push(`${BASE_MESSAGES_URL}/${MessagesType.GROUPS}`)
    }
  }, [groupChannelId, isLoadingGroupChannelList])

  useEffect(() => {
    if (!isListLoading && channelIds !== undefined && !isChannelIncluded && !fetchTimeoutRunning && !groupUuid) {
      history.push(`${BASE_MESSAGES_URL}/${type}`)
    }
  }, [isListLoading, isChannelIncluded, fetchTimeoutRunning])

  return (
    <div
      data-testid={'messages_content'}
      className={clsx([classes.fullWidth, 'messages-content'])}
    >
      {getMessageContainer(type, encryptionStatus, setEncryptionStatus, channelIds, groupIds, channelId, groupUuid, groupChannelId)}
    </div>
  )
}
