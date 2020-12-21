import { Message } from '@globalid/messaging-service-sdk'
import { RootState } from 'RootType'
import { channelWithMoreParticipantsMock } from '../../tests/mocks/channels_mock'
import { groupMock } from '../../tests/mocks/group_mocks'
import { messageDataMock, messageMock } from '../../tests/mocks/messages_mock'
import { MessageType } from '../components/messages/messenger_chat/interfaces'
import { store } from '../store'
import { ChannelType, ChannelWithParticipantsAndParsedMessage } from '../store/interfaces'
import { getMessageTypeFormatString, getNotificationTitle } from './notification_utils'

const getMediaContent = (imageCount: number): string => JSON.stringify({
  assets: Array.from({ length: imageCount }, (_, i) => i).map((i: number) => i),
})

const getMessage = (messageType: MessageType, content: string = messageMock.content): Message => ({
  ...messageMock,
  type: messageType,
  content,
})

describe('Notification utils tests', () => {

  describe('getNotificationTitle', () => {
    const oneOnOneChannel: ChannelWithParticipantsAndParsedMessage = {
      ...channelWithMoreParticipantsMock,
      type: ChannelType.PERSONAL,
      message: messageDataMock,
    }

    const multiChannel: ChannelWithParticipantsAndParsedMessage = {
      ...channelWithMoreParticipantsMock,
      type: ChannelType.MULTI,
      message: messageDataMock,
    }

    const groupChannel: ChannelWithParticipantsAndParsedMessage = {
      ...channelWithMoreParticipantsMock,
      type: ChannelType.GROUP,
      group_uuid: groupMock.uuid,
      message: messageDataMock,
    }

    const state: RootState = {
      ...store.getState(),
      groups: {
        ...store.getState().groups,
        groups: {
          [groupMock.uuid]: groupMock,
        },
      },
    }

    const title: string = 'Corona, snow, snowman, ...'
    const titleWithGroupName: string =
      `${groupMock.display_name ?? groupMock.gid_name}
      Corona, snow, snowman, ...`

    it('should return only channel title when channel type is 1ON1 and not within a Group', () => {
      expect(getNotificationTitle(oneOnOneChannel, title, state)).toEqual(title)
    })

    it('should return only channel title when channel type is MULTI and not within a Group', () => {
      expect(getNotificationTitle(multiChannel, title, state)).toEqual(title)
    })

    it('should return only channel title with group title when channel type is 1ON1 and withing a Group', () => {
      expect(getNotificationTitle({
        ...oneOnOneChannel,
        group_uuid: groupMock.uuid,
      }, title, state)).toEqual(titleWithGroupName)
    })

    it('should return only channel title with group title when channel type is MULTI and withing a Group', () => {
      expect(getNotificationTitle({
        ...multiChannel,
        group_uuid: groupMock.uuid,
      }, title, state)).toEqual(titleWithGroupName)
    })

    it('should return only group name when channel type is GROUP', () => {
      expect(getNotificationTitle(groupChannel, title, state)).toEqual(groupMock.display_name)
    })
  })

  describe('getMessageTypeFormatString', () => {

    it('should return string for a card message notification when message is a card', () => {
      expect(getMessageTypeFormatString(getMessage(MessageType.CARD_VIEW))).toEqual('sent a card text')
    })

    it('should return string for a deleted message notification when message is deleted', () => {
      expect(getMessageTypeFormatString(getMessage(MessageType.DELETED))).toEqual('deleted a message')
    })

    it('should return string for a single media message notification when message is a single image', () => {
      expect(getMessageTypeFormatString(getMessage(
        MessageType.MEDIA,
        getMediaContent(1)
      ))).toEqual('sent an image')
    })

    it('should return string for a multiple media message notification when message includes multiple images', () => {
      expect(getMessageTypeFormatString(getMessage(
        MessageType.MEDIA,
        getMediaContent(4)
      ))).toEqual('sent 4 images')
    })

    it('should return string for a new message notification when message is media type but does not include images', () => {
      expect(getMessageTypeFormatString(getMessage(
        MessageType.MEDIA,
        getMediaContent(0)
      ))).toEqual('sent a new message')
    })

    it('should return string for a new message notification when message is text', () => {
      expect(getMessageTypeFormatString(getMessage(
        MessageType.TEXT,
        getMediaContent(0)
      ))).toEqual('sent a new message')
    })
  })
})
