import { MessageEncryptionHeader, MessageTemplateEncryptedText } from '@globalid/messaging-service-sdk'
import { getMediaMessageContent, getEncryptedMediaMessageContent } from './messages_slice'
import {
  messageMediaWithEncryptedTextMock,
  messageMediaWithTextMock,
} from '../../tests/mocks/messages_mock'
import { CommonImageMediaType } from '../components/messages/messenger_chat/chat_message_cards'

jest.mock('../init')

describe('messages helpers tests', () => {

  describe('getMediaMessageContent', () => {
    it('should return media message content', () => {
      expect(getMediaMessageContent(
        messageMediaWithTextMock
      )).toEqual(JSON.parse(messageMediaWithTextMock.content))
    })

    it('should return null if object cannot be parsed', () => {
      const messageContent: string = 'something'

      expect(getMediaMessageContent({ ...messageMediaWithTextMock, content: messageContent }))
        .toBeNull()
    })
  })

  describe('getEncryptedMediaMessageContent', () => {
    it('should return decrypted media message content', () => {
      const encryptionHeader: MessageEncryptionHeader = {
        enc: 'enc',
        iv: 'iv',
      }

      const response: MessageTemplateEncryptedText = {
        encryption_header: encryptionHeader,
        ciphertext: 'ciphertext',
      }

      const content: CommonImageMediaType = JSON.parse(messageMediaWithEncryptedTextMock.content)

      const contentMock: CommonImageMediaType = { ...content, encryption_header: encryptionHeader }

      expect(getEncryptedMediaMessageContent(
        { ...messageMediaWithEncryptedTextMock, content: JSON.stringify(contentMock) }
      )).toEqual(response)
    })

    it('should return null if text is undefined', () => {
      const content: CommonImageMediaType = JSON.parse(messageMediaWithEncryptedTextMock.content)

      const contentMock: CommonImageMediaType = { ...content, text: undefined }

      expect(getEncryptedMediaMessageContent(
        { ...messageMediaWithEncryptedTextMock, content: JSON.stringify(contentMock) }
      )).toBeNull()
    })

    it('should return null if object cannot be parsed', () => {
      const messageContent: string = 'something'

      expect(getEncryptedMediaMessageContent(
        { ...messageMediaWithEncryptedTextMock, content: messageContent }
      )).toBeNull()
    })
  })
})
