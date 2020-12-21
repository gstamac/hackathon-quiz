import {
  ChannelType,
  ChannelWithMembers,
  ChannelWithParticipantsAndParsedMessage,
  GidUUID,
  MessagePreviewData,
  ChannelsSlice,
  FetchChannelsParams,
  ChannelsType,
  MemberByUUID,
} from '../interfaces'
import { isNil, uniq } from 'lodash'
import { ChannelQueryParams } from './interfaces'
import {
  ChannelWithParticipants,
  MessagePreview,
} from '@globalid/messaging-service-sdk'
import {
  areArraysEqual,
  getMessageCardContent,
  hasExpired,
} from '../../utils'
import { getEncryptedChannelSecretFromChannel } from '../selectors'
import { RootState } from 'RootType'
import { getObjectValues } from '../../components/global/helpers'
import { Identity, PublicIdentity } from '@globalid/identity-namespace-service-sdk'

export const getChannelTitle = (
  channel: ChannelWithParticipants,
  identityGidUuid: string | undefined,
  members: Identity[]
): string | null | undefined => {
  if (channel.title) {
    return channel.title
  }

  const membersWithoutUser: string[] = channel.participants.filter(
    (gid_uuid: string) => identityGidUuid !== gid_uuid
  )
  const firstParticipant = membersWithoutUser.length > 0 ? members.find(
    (member: Identity) => member.gid_uuid === membersWithoutUser[0]
  ) : undefined
  const secondParticipant = membersWithoutUser.length > 1 ? members.find(
    (member: Identity) => member.gid_uuid === membersWithoutUser[1]
  ) : undefined

  if (channel.type === ChannelType.MULTI && !isNil(firstParticipant)) {
    const addDotsString: string = membersWithoutUser.length > 1 ? ', ...' : ''
    const secondParticipantGidName: string = !isNil(secondParticipant) ? `, ${secondParticipant.gid_name}${addDotsString}` : ''

    return `${firstParticipant.gid_name} ${secondParticipantGidName}`
  }

  if (channel.type === ChannelType.PERSONAL && !isNil(firstParticipant)) {
    return firstParticipant.gid_name
  }

  return null
}

export const updateChannelUnreadCount = (
  channelWithMembers: ChannelWithMembers,
  count?: number,
): ChannelWithMembers => {
  const members: string[] = channelWithMembers.members
  const channel: ChannelWithParticipantsAndParsedMessage = channelWithMembers.channel

  const isChannelOpen: boolean = window.location.pathname.includes(channel.id)
  const updatedUnreadCount: number = isChannelOpen ? 0 : count ?? 0

  return {
    members,
    channel: {
      ...channel,
      unread_count: updatedUnreadCount,
    },
  }
}

export const getChannelStoreKeyFromQueryParam = (
  queryParams: ChannelQueryParams
): string => {
  if (!isNil(queryParams.folder_id)) {
    return queryParams.folder_id
  }
  if (!isNil(queryParams.groupUuid)) {
    return queryParams.groupUuid
  }

  return queryParams.channelTypes.length === 1 ? queryParams.channelTypes[0] : ''
}

const matchChannelByParticipantsAndGroupUuid = (
  channel: ChannelWithParticipantsAndParsedMessage,
  gidUuids: GidUUID[],
  type: ChannelType,
  groupUuid?: string,
): boolean => (
  channel.type === type && areArraysEqual(gidUuids, channel.participants) && channel.group_uuid === groupUuid
)

export const getChannelArray = (channels: ChannelsType): ChannelWithMembers[] =>
  getObjectValues<ChannelsType, ChannelWithMembers>(channels)

export const getChannelByParticipants = (
  state: RootState,
  gidUuids: GidUUID[],
  type: ChannelType,
  groupUuid?: string,
): ChannelWithParticipants | undefined => (
  (<ChannelWithParticipants | undefined> getChannelArray(state.channels.channels).find(
    x => matchChannelByParticipantsAndGroupUuid(x.channel, gidUuids, type, groupUuid))?.channel
  )
)

export const channelToRedux = async (
  channel: ChannelWithParticipants
): Promise<ChannelWithParticipantsAndParsedMessage> => {

  if (!channel.message) {
    return ({
      ...channel,
      message: undefined,
    })
  }

  const messagePreview:MessagePreviewData = await messagePreviewToRedux(
    channel.message,
    getEncryptedChannelSecretFromChannel(channel.id)(channel),
  )

  return ({
    ...channel,
    message: messagePreview,
  })
}

export const messagePreviewToRedux = async (
  messagePreview: MessagePreview,
  encryptedChannelSecret?: string
): Promise<MessagePreviewData> => ({
  ...messagePreview,
  parsedContent: await getMessageCardContent(messagePreview, encryptedChannelSecret),
})

export const shouldFetchFileToken = (
  channelId: string,
  channels: ChannelsSlice,
): boolean =>
  !channels.fileTokensFetching[channelId] &&
  (channels.fileTokens[channelId] === undefined || hasExpired(channels.fileTokens[channelId]?.expires_in))

export const shouldFetchChannel = (
  channelId: string,
  force: boolean | undefined,
  channels: ChannelsSlice,
): boolean =>
  !!(force ||
  !channels.isFetching[channelId] &&
  (channels.channels[channelId] === undefined || channels.errors[channelId]))

export const shouldFetchChannels = (
  queryParams: FetchChannelsParams,
  channels: ChannelsSlice,
): boolean => {
  const channelStoreKey: string = getChannelStoreKeyFromQueryParam(queryParams)
  const isFetchingAll: boolean = channels.isFetchingAll
  const isFetching: boolean = channels.isFetching[channelStoreKey] ?? false
  const total: number = channels.meta[channelStoreKey]?.total ?? 0
  const isNotAtTheEndOfItems: boolean = (queryParams.page - 1) * queryParams.per_page < total

  return (!isFetching || !isFetchingAll) && (isNotAtTheEndOfItems || total === 0)
}

export const shouldFetchFolders = (
  channels: ChannelsSlice,
): boolean => !(channels.folders.length > 0)

export const filterOutFetchedMembers = (membersInStore: string[] | undefined, membersToFetch: string[]): string[] =>
  membersInStore !== undefined
    ? membersToFetch.filter((memberToFetch: string) => !membersInStore.includes(memberToFetch))
    : membersToFetch

export const getMemberIdentitesFromStore = (membersStore: MemberByUUID, memberUuids: string[]): PublicIdentity[] => {
  const membersFromStore: PublicIdentity[] = uniq(memberUuids)
    .reduce((members: PublicIdentity[], memberUuid: string): PublicIdentity[] => {
      const member: PublicIdentity | undefined = membersStore[memberUuid]

      if (member !== undefined) {
        return [...members, member]
      }

      return members
    }, [])

  return membersFromStore
}
