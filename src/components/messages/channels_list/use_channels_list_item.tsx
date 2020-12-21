import { useEffect, useState } from 'react'
import { store } from '../../../store'
import { IdentityByUUID } from '../interfaces'
import { useDispatch, useSelector } from 'react-redux'
import { getFormattedDate } from '../helpers'
import { isNil } from 'lodash'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { ChannelListItemHookResult, LastMessage } from './interfaces'
import { BASE_MESSAGES_URL } from '../../../constants'
import { useHistory, useRouteMatch } from 'react-router-dom'
import useAsyncEffect from 'use-async-effect'
import {
  getLastMessageAuthor,
  getMessageAuthorName,
  getChannelParticipantsByChannelType,
  getLastMessage,
} from './channels_list_item_helpers'
import { getEncryptedChannelSecret } from '../../../store/selectors'
import {
  ChannelWithParticipantsAndParsedMessage,
  ChannelType,
  GidUUID,
} from '../../../store/interfaces'
import { RootState } from 'RootType'
import { getAvatarByChannelType } from '../channel_avatars/get_avatar_by_channel_type'
import { fetchGroup } from '../../../store/groups_slice'
import { useStyles } from './styles'
import { reshapeNumberOfUnreadMessages } from '../../../utils/counter_helpers'
import { pushTo } from '../../../utils'

export const useChannelsListItem = (channel: ChannelWithParticipantsAndParsedMessage | undefined): ChannelListItemHookResult | null => {
  const dispatch = useDispatch()

  const { channelFirstAvatarStyle } = useStyles()

  const history = useHistory()

  const match = useRouteMatch<{ channelId: string, type: string, groupUuid: string }>()

  const identities: IdentityByUUID | null = useSelector((state: RootState) => state.channels.members)

  const [lastMessage, setLastMessage] = useState<string | null>(channel?.message?.parsedContent ?? null)
  const [showAuthor, setShowAuthor] = useState<boolean>(false)

  useEffect(() => {
    if (channel !== undefined && channel.group_uuid) {
      dispatch(fetchGroup({
        group_uuid: channel.group_uuid,
      }))
    }
  }, [])

  useAsyncEffect(async (isMounted: () => boolean) => {
    if (isMounted()) {
      const channelLastMessage: LastMessage = channel === undefined || isNil (channel.message)
        ? { text: null } : await getLastMessage(channel, identities, identity, channelSecret)

      setShowAuthor(channelLastMessage.showAuthor ?? false)
      setLastMessage(channelLastMessage.text)
    }
  }, [channel?.message?.content, channel?.message?.parsedContent, identities])

  const groupUuid: string | null | undefined = channel?.group_uuid
  const showOwner: boolean | undefined = useSelector((state: RootState) => groupUuid ? state.groups?.groups[groupUuid]?.show_owner_name : true)
  const identity: PublicIdentity | undefined = useSelector((root: RootState) => root.identity.identity)

  if (channel === undefined) {
    return null
  }

  const channelSecret: string | undefined = getEncryptedChannelSecret(channel.id)(store.getState())

  const isActiveChannel: boolean = match.params.channelId === channel.id

  const membersWithoutUser: GidUUID[] | undefined = channel?.participants?.filter((participantUuid: GidUUID) => participantUuid !== identity?.gid_uuid)

  const [firstParticipant, secondParticipant]: (PublicIdentity | undefined)[] =
    getChannelParticipantsByChannelType(identities, channel.type as ChannelType, [...membersWithoutUser, identity?.gid_uuid ?? ''])

  const lastMessageAuthor: PublicIdentity | undefined | null = getLastMessageAuthor(identities, channel)

  const hasUnreadMessages: boolean = channel.unread_count === undefined ? false : channel.unread_count > 0
  const unreadCount: string = reshapeNumberOfUnreadMessages(channel.unread_count ?? 0)

  const createdDate: string | null = getFormattedDate(channel.message?.created_at)

  const lastMessageAuthorName: string = showAuthor ? getMessageAuthorName(channel, lastMessageAuthor?.gid_name, showOwner === true) : ''

  const channelAvatar: JSX.Element = getAvatarByChannelType({
    channel,
    firstParticipant,
    secondParticipant,
    channelFirstAvatarStyle,
    multiAvatarSize: 38,
  })

  const handleClick = (): void => {
    const channelLocation: string = match.params.groupUuid ?
      `${BASE_MESSAGES_URL}/${match.params.type}/${match.params.groupUuid}/${channel.id}` :
      `${BASE_MESSAGES_URL}/${match.params.type}/${channel.id}`

    pushTo(history, channelLocation)
  }

  return {
    isActiveChannel,
    hasUnreadMessages,
    unreadMessagesCount: unreadCount,
    messageAuthorName: lastMessageAuthorName,
    lastMessage,
    createdDate,
    title: channel.title,
    avatar: channelAvatar,
    handleClick,
  }
}
