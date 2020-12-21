/* eslint-disable prefer-object-spread */
import * as util from '../../../utils'
import { actionByFolder, FilterChannelsType, sortChannelsByDate, isBotChannel } from './helpers'
import { MessagesType, PaginationMetaParams, PaginationMeta } from '../interfaces'
import {
  channelWithBotParticipantMock,
  channelWithParticipantsTypeMulti,
  channelWithParticipantsTypeOther,
  channelWithParticipantsTypePersonal,
  messageWithParsedContent,
  toChannelWithParsedMessage,
  channelWithMoreParticipantsMock,
  deletedChannelMock,
  channelWithoutMessagesMock,
} from '../../../../tests/mocks/channels_mock'
import { ChannelType, ChannelWithParticipantsAndParsedMessage } from '../../../store/interfaces'

jest.mock('../../../utils')

describe('ChannelHelpers', () => {
  const initialMetaParams: PaginationMetaParams = { per_page: 20, total: 0, page: 1 }
  const initialMeta: PaginationMeta = { ...initialMetaParams, isLastPage: true, filteredOneOrMorePage: false }
  const folder_id: string = 'folder_id'

  describe('actionByFolder', () => {
    it('should return empty array with initial meta params when provided empty array', () => {
      const filterFunction: FilterChannelsType = actionByFolder(MessagesType.GROUPS)

      expect(filterFunction([], initialMeta)).toEqual([[], initialMeta])
    })

    it('should return GROUP, PERSONAL and MULTI groups ids by groupUuid for a group', () => {
      const filterFunction: FilterChannelsType = actionByFolder(MessagesType.GROUPS)

      const groupUuid: string = 'groupUuid'

      const result: [string[], PaginationMetaParams] = filterFunction([
        { ...channelWithBotParticipantMock, message: messageWithParsedContent },
        { ...channelWithParticipantsTypePersonal, message: messageWithParsedContent, group_uuid: groupUuid },
        { ...channelWithParticipantsTypeOther, folder_id, message: messageWithParsedContent },
        { ...channelWithParticipantsTypeMulti, message: messageWithParsedContent, group_uuid: groupUuid },
        { ...deletedChannelMock, type: ChannelType.GROUP, group_uuid: groupUuid },
        { ...channelWithoutMessagesMock, type: ChannelType.GROUP, group_uuid: groupUuid },
      ], { ...initialMeta, total: 4 }, groupUuid)

      expect(result[0]).toEqual([channelWithParticipantsTypePersonal.id, channelWithParticipantsTypeMulti.id])
      expect(result[1]).toEqual({ ...initialMeta, total: 4 })
    })

    it('should return PERSONAL and MULTI groups ids by folderId for PRIMARY tab', () => {
      const filterFunction: FilterChannelsType = actionByFolder(MessagesType.PRIMARY)

      const result: [string[], PaginationMetaParams] = filterFunction([
        { ...channelWithBotParticipantMock, message: messageWithParsedContent },
        { ...channelWithParticipantsTypePersonal, folder_id, message: messageWithParsedContent },
        { ...channelWithParticipantsTypeMulti, folder_id, message: messageWithParsedContent },
        { ...deletedChannelMock, type: ChannelType.PERSONAL, folder_id },
        { ...channelWithoutMessagesMock, type: ChannelType.PERSONAL, folder_id },
      ], { ...initialMeta, total: 3 }, folder_id)

      expect(result[0]).toEqual([channelWithParticipantsTypePersonal.id, channelWithParticipantsTypeMulti.id])
      expect(result[1]).toEqual({ ...initialMeta, total: 3 })
    })

    it('should return PERSONAL and MULTI groups ids by folderId for OTHER tab', () => {
      const filterFunction: FilterChannelsType = actionByFolder(MessagesType.OTHER)

      const result: [string[], PaginationMetaParams] = filterFunction([
        { ...channelWithBotParticipantMock, message: messageWithParsedContent },
        { ...channelWithParticipantsTypePersonal, message: messageWithParsedContent },
        { ...channelWithParticipantsTypeOther, folder_id, message: messageWithParsedContent },
        { ...channelWithParticipantsTypeMulti, folder_id, message: messageWithParsedContent },
        { ...deletedChannelMock, type: ChannelType.PERSONAL, folder_id },
        { ...channelWithoutMessagesMock, type: ChannelType.PERSONAL, folder_id },
      ], { ...initialMeta, total: 4 }, folder_id)

      expect(result[0]).toEqual([channelWithParticipantsTypeOther.id, channelWithParticipantsTypeMulti.id])
      expect(result[1]).toEqual({ ...initialMeta, total: 4 })
    })
  })

  describe('sortChannelsByDate', () => {
    const date1: string = '2020-07-21T11:00:55+00:00'
    const date2: string = '2020-07-20T11:00:55+00:00'

    it('should call sortDesc with message created_at dates', () => {
      const firstChannel: ChannelWithParticipantsAndParsedMessage
       = Object.assign({
         message: Object.assign({
           created_at: date1,
         }),
       })
      const secondChannel: ChannelWithParticipantsAndParsedMessage
      = Object.assign({
        message: Object.assign({
          created_at: date2,
        }),
      })

      sortChannelsByDate(firstChannel, secondChannel)
      expect(<jest.Mock> util.sortByDateDesc).toHaveBeenCalledWith(date1, date2)
    })

    it('should call sortDesc with channel updated_at dates', () => {
      const firstChannel: ChannelWithParticipantsAndParsedMessage
       = Object.assign({
         updated_at: date1,
       })
      const secondChannel: ChannelWithParticipantsAndParsedMessage
      = Object.assign({
        updated_at: date2,
      })

      sortChannelsByDate(firstChannel, secondChannel)
      expect(<jest.Mock> util.sortByDateDesc).toHaveBeenCalledWith(date1, date2)
    })

    it('should call sortDesc with channel created_at dates', () => {
      const firstChannel: ChannelWithParticipantsAndParsedMessage
       = Object.assign({
         created_at: date1,
       })
      const secondChannel: ChannelWithParticipantsAndParsedMessage
      = Object.assign({
        created_at: date2,
      })

      sortChannelsByDate(firstChannel, secondChannel)
      expect(<jest.Mock> util.sortByDateDesc).toHaveBeenCalledWith(date1, date2)
    })
  })

  describe('isBotChannel', () => {
    it('should return true if the channel has bots', () => {
      expect(isBotChannel(toChannelWithParsedMessage(channelWithBotParticipantMock))).toEqual(true)
    })

    it('should return false if the channel is without bots', () => {
      expect(isBotChannel(toChannelWithParsedMessage(channelWithMoreParticipantsMock))).toEqual(false)
    })
  })
})
