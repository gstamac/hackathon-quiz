import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { ChannelType, ChannelWithParticipantsAndParsedMessage, GidUUID } from '../../../store/interfaces'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { ChannelDetails, GetChannelAvatarParams } from './interfaces'
import { IdentityByUUID } from '../interfaces'
import { getAvatarByChannelType } from '../channel_avatars/get_avatar_by_channel_type'
import { getChannelParticipantsByChannelType } from '../channels_list/channels_list_item_helpers'
import { isBotChannel } from '../channels_list/helpers'
import { getString } from '../../../utils'

const membersText = (channel: ChannelWithParticipantsAndParsedMessage): string =>
  (channel.participants.length === 1) ? getString('member') : getString('members')

const getMembersDescription = (
  channel: ChannelWithParticipantsAndParsedMessage,
  displayName: string,
): string => {
  const numberOfMembers: string = `${channel.members_count} ${membersText(channel)}`

  if (channel.type === ChannelType.GROUP) {
    return numberOfMembers
  }

  return channel.members_count > 1 && channel.type !== ChannelType.PERSONAL ? numberOfMembers : `${displayName}`
}

const getChannelDescription = (
  channel: ChannelWithParticipantsAndParsedMessage,
  firstParticipant: PublicIdentity | undefined
): string | null | undefined => {
  const personalChannelDescription: string =
    (firstParticipant?.display_name !== undefined && firstParticipant?.country_name !== undefined && channel)
      ? `${firstParticipant?.display_name} • ${firstParticipant?.country_name}`
      : ''

  if (isBotChannel(channel)) {
    return firstParticipant?.display_name
  }

  return channel.type === ChannelType.PERSONAL ? personalChannelDescription : channel.description
}

const isFirstParticipantUndefined =
  (firstParticipant: PublicIdentity | undefined, type: ChannelType | undefined): boolean =>
    firstParticipant === undefined && (type === ChannelType.PERSONAL || type === ChannelType.MULTI)

export const useChannelDetails = (
  channelId: string,
  gidUuid: GidUUID,
): ChannelDetails | null => {

  const channel: ChannelWithParticipantsAndParsedMessage | undefined = useSelector((state: RootState) => (
    state.channels.channels?.[channelId]?.channel
  ))

  const membersWithoutUser: GidUUID[] | undefined = channel?.participants?.filter((participantUuid: GidUUID) => participantUuid !== gidUuid)

  const identities: IdentityByUUID | undefined = useSelector((state: RootState) => state.channels.members)

  if (channel === undefined || identities === undefined || membersWithoutUser === undefined) {
    return null
  }

  const [firstParticipant, secondParticipant]: (PublicIdentity | undefined)[] =
    getChannelParticipantsByChannelType(identities, channel?.type as ChannelType, [...membersWithoutUser, gidUuid])

  if (isFirstParticipantUndefined(firstParticipant, channel?.type as ChannelType)) {
    return null
  }

  const getChannelAvatar = (params?: GetChannelAvatarParams): JSX.Element => getAvatarByChannelType({
    channel,
    firstParticipant,
    secondParticipant,
    multiAvatarSize: 54,
    ...params,
  })

  const displayName: string = firstParticipant?.display_name ?? ''
  const groupUuid: GidUUID | null | undefined = channel.group_uuid

  return {
    getChannelAvatar,
    channelType: channel.type as ChannelType,
    description: getChannelDescription(channel, firstParticipant),
    memberUuids: channel.participants,
    members: identities,
    membersDescription: getMembersDescription(channel, displayName),
    title: channel.title ?? '',
    otherMemberIdentity: firstParticipant,
    owner: channel.created_by,
    groupUuid,
    isBotChannel: isBotChannel(channel),
  }
}
