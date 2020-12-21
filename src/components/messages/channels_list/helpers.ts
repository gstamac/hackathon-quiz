import { PaginationMeta, MessagesType, PaginationMetaParams } from '../interfaces'
import { sortByDateDesc } from '../../../utils'
import { MESSAGE_BOT_IDENTITY_UUID } from '../../../constants'
import { ChannelWithParticipantsAndParsedMessage, ChannelType } from '../../../store/interfaces'

const placeholderAction: FilterChannelsType = () => [
  [],
  {
    per_page: 0,
    page: 1,
    total: 0,
    filteredOneOrMorePage: false,
    isLastPage: true,
  },
]

export type FilterChannelsType = (
  channels: ChannelWithParticipantsAndParsedMessage[],
  paginationMeta: PaginationMetaParams,
  folderId?: string
) => [string[], PaginationMeta]

const getMetaData = (
  channelsInTab: number,
  participantChannels: number,
  paginationMeta: PaginationMetaParams
): PaginationMeta => {
  const nonParticipantChannels: number = channelsInTab - participantChannels
  const diff: number = paginationMeta.per_page - nonParticipantChannels

  const isLastPage: boolean = paginationMeta.total/paginationMeta.per_page <= paginationMeta.page

  const newPaginationMeta: PaginationMeta = {
    ...paginationMeta,
    filteredOneOrMorePage: diff < 1,
    isLastPage,
  }

  return newPaginationMeta
}

const reduceAndGetChannelsIds = (channels: ChannelWithParticipantsAndParsedMessage[], predicate: Predicate): string[] =>
  channels.reduce<string[]>((filtered: string[], channel: ChannelWithParticipantsAndParsedMessage) => {
    if (predicate(channel)) {
      return [...filtered, channel.id]
    }

    return filtered
  }, [])

const isActiveChannel = (channel: ChannelWithParticipantsAndParsedMessage): boolean =>
  !channel.deleted && channel.message !== undefined

const filterGroupChannels: FilterChannelsType = (
  channels: ChannelWithParticipantsAndParsedMessage[],
  paginationMeta: PaginationMetaParams,
  groupUuid?: string
): [string[], PaginationMeta] => {
  const filteredChannels = channels.filter((channel: ChannelWithParticipantsAndParsedMessage) =>
    (channel.type === ChannelType.MULTI ||
    channel.type === ChannelType.GROUP ||
    channel.type === ChannelType.PERSONAL) &&
    channel.group_uuid === groupUuid)

  const participantChannelIds: string[] =
    reduceAndGetChannelsIds(
      filteredChannels,
      (channel: ChannelWithParticipantsAndParsedMessage) => isActiveChannel(channel)
    )

  return [participantChannelIds, getMetaData(filteredChannels.length, participantChannelIds.length, paginationMeta)]
}

const filterPrimaryOtherChannels: FilterChannelsType = (
  channels: ChannelWithParticipantsAndParsedMessage[],
  paginationMeta: PaginationMetaParams,
  folderId?: string,
): [string[], PaginationMeta] => {
  const channelsInTab = channels.filter((channel: ChannelWithParticipantsAndParsedMessage) =>
    (channel.type === ChannelType.MULTI ||
      channel.type === ChannelType.PERSONAL) &&
    channel.folder_id === folderId &&
    !channel.group_uuid
  )

  const participantChannels: string[] = reduceAndGetChannelsIds(
    channelsInTab,
    (channel: ChannelWithParticipantsAndParsedMessage) => isActiveChannel(channel)
  )

  return [participantChannels, getMetaData(channelsInTab.length, participantChannels.length, paginationMeta)]
}

const folderActionMap: Map<MessagesType, FilterChannelsType> = new Map([
  [MessagesType.GROUPS, filterGroupChannels],
  [MessagesType.PRIMARY, filterPrimaryOtherChannels],
  [MessagesType.OTHER, filterPrimaryOtherChannels],
])

export const actionByFolder = (folderType: MessagesType): FilterChannelsType =>
  folderActionMap.get(folderType) ?? placeholderAction

export const sortChannelsByDate = (
  x: ChannelWithParticipantsAndParsedMessage,
  y: ChannelWithParticipantsAndParsedMessage
): number => {
  const firstDate: string
   = x.message?.created_at ?? x.updated_at ?? x.created_at
  const secondDate: string
   = y.message?.created_at ?? y.updated_at ?? y.created_at

  return sortByDateDesc(firstDate, secondDate)
}

export const isBotChannel = (channel: ChannelWithParticipantsAndParsedMessage): boolean =>
  (channel.type === ChannelType.PERSONAL && channel.participants.includes(MESSAGE_BOT_IDENTITY_UUID))
