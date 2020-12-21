import { addBottomCards } from './helpers'
import { typingDetailsMock } from '../../../../tests/mocks/messages_mock'
import * as date from 'date-fns'
import React from 'react'
import { TypingMessageCard } from './chat_message_cards/typing_message_card'
import { ChannelType } from '../../../store/interfaces'
import { foldersMock } from '../../../../tests/mocks/channels_mock'
import { ChatMessageCards, classesType } from './interfaces'
import { ChannelFoldersType } from '../interfaces'

jest.mock('date-fns')

describe('Messenger_Chat/Helpers tests' , () => {
  const isAfterMock: jest.Mock = jest.fn()
  const isBeforeMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (date.isAfter as jest.Mock) = isAfterMock;
    (date.isBefore as jest.Mock) = isBeforeMock
  })

  describe('addBottomCards', () => {
    it('Should return mappedMessage when typing is undefined', () => {
      expect(addBottomCards(
        { ...typingDetailsMock, typing: undefined},
        undefined,
        foldersMock,
        {} as classesType,
      )).toEqual(typingDetailsMock.mappedMessages)
    })

    it('Should return mappedMessage when participant cannot be found', () => {
      expect(addBottomCards(
        { ...typingDetailsMock, membersWithoutUser: [] },
        undefined,
        foldersMock,
        {} as classesType,
      )).toEqual(typingDetailsMock.mappedMessages)
    })

    it('Should return mappedMessage when typing has expired', () => {
      expect(addBottomCards(
        { ...typingDetailsMock, membersWithoutUser: ['participant_2'] },
        undefined,
        foldersMock,
        {} as classesType,
      )).toEqual(typingDetailsMock.mappedMessages)
    })

    it('Should return mappedMessage when channel is not of type PERSONAL', () => {
      expect(addBottomCards(
        {
          ...typingDetailsMock,
          channelType: ChannelType.GROUP,
        },
        undefined,
        foldersMock,
        {} as classesType,
      )).toEqual(typingDetailsMock.mappedMessages)
    })

    it('Should return mappedMessage with bottom text for changing folders in multi chat', () => {
      const result: ChatMessageCards[] = addBottomCards(
        {
          ...typingDetailsMock,
          channelType: ChannelType.MULTI,
        },
        foldersMock[0].id,
        [{...foldersMock[0], type: ChannelFoldersType.UNKNOWN}],
        {} as classesType,
      )

      expect(result).toHaveLength(2)
    })

    it('Should return mappedMessage with bottom text for changing folders in 1on1 chat', () => {
      const result: ChatMessageCards[] = addBottomCards(
        {
          ...typingDetailsMock,
          channelType: ChannelType.PERSONAL,
        },
        foldersMock[0].id,
        [{...foldersMock[0], type: ChannelFoldersType.UNKNOWN}],
        {} as classesType,
      )

      expect(result).toHaveLength(2)
    })

    it('Should return mappedMessages with typingCard', () => {
      isAfterMock.mockReturnValue(true)
      isBeforeMock.mockReturnValue(true)

      const typingCardMock: JSX.Element = <TypingMessageCard key={'typing-card'} avatar={'display_image_url'} />

      expect(addBottomCards(typingDetailsMock, undefined, foldersMock, {} as classesType)).toEqual([typingCardMock, ...typingDetailsMock.mappedMessages])
    })
  })
})
