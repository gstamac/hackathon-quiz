import * as messaging_api from '../services/api/messaging_api'
import {
  getChannelMessagesResponseMock,
  messageDataMock,
  messageSeenMock,
  messageDelieveredMock,
  imageFileMock,
  assetImageMock,
} from '../../tests/mocks/messages_mock'
import * as messaging_service_sdk from '@globalid/messaging-service-sdk'
import * as auth from '../components/auth'
import * as file_service_api from '../services/api/file_service_api'
import * as messages_utils from '../utils/messages_utils'
import { MessageContent } from '../components/messages/messenger_chat/chat_message_cards'
import {
  decryptedMock,
  encryptedChannelSecretMock,
  encryptedMessageContentMock,
} from '../../tests/mocks/device_key_manager_mocks'
import * as device_key_manager_instance from '../init'
import * as general_utils from '../utils/general_utils'
import { MessageType } from '../components/messages/messenger_chat/interfaces'
import { MessageData } from '../store/interfaces'
import { mocked } from 'ts-jest/utils'

jest.mock('../components/auth')
jest.mock('../utils/general_utils')
jest.mock('../services/api/file_service_api')
jest.mock('@globalid/messaging-service-sdk')
jest.mock('../init')

describe('Messaging', () => {
  const getChannelMessagesMock = mocked(messaging_service_sdk.getMessages)
  const getValidTokenMock = mocked(auth.getValidToken)
  const sendMessageMock = mocked(messaging_service_sdk.sendMessage)
  const setMessageSeenMock = mocked(messaging_service_sdk.setMessageSeen)
  const setMessageDeliveredMock = mocked(messaging_service_sdk.setMessageDelivered)
  const uploadImageMock = mocked(file_service_api.uploadImage)
  const validateObjectKeysMock = mocked(general_utils.validateObjectKeys)

  const channel_id: string = '8d259467-3796-4d98-990e-452ced2791e1'
  const token: string = 'token'

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getChannelMessages', () => {
    it('should return channel data', async () => {
      getValidTokenMock.mockResolvedValue(token)
      getChannelMessagesMock.mockResolvedValue(getChannelMessagesResponseMock)

      const channelMessages: messaging_service_sdk.MessagesWithPaginationMeta =
        await messaging_api.getChannelMessages(channel_id, {
          page: undefined,
          per_page: 50,
        })

      expect(channelMessages).toEqual(getChannelMessagesResponseMock)
      expect(getChannelMessagesMock).toHaveBeenCalledTimes(1)
      expect(getChannelMessagesMock).toHaveBeenCalledWith(token, { channel_id }, {
        page: undefined,
        per_page: 50,
      })
    })

    it('should reject when api rejects', async () => {
      const error: Error = new Error()

      getChannelMessagesMock.mockRejectedValue(error)

      await expect(messaging_api.getChannelMessages(channel_id, {
        page: undefined,
        per_page: 50,
      })).rejects.toThrow(error)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(messaging_api.getChannelMessages(channel_id, {
        page: undefined,
        per_page: 50,
      })).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('sendMessage', () => {

    it('should return true on sending message success', async () => {
      getValidTokenMock.mockResolvedValue(token)
      sendMessageMock.mockResolvedValue([<messaging_service_sdk.Message> messageDataMock])

      const returned = await messages_utils.sendMessageToChannel(
        messageDataMock.parsedContent, messageDataMock.channel_id, messageDataMock.author)

      expect(returned).toBe(true)
      expect(sendMessageMock).toHaveBeenCalledTimes(1)
    })

    it('should return false on sending message fail', async () => {
      sendMessageMock.mockRejectedValue('ERROR')

      const returned = await messages_utils.sendMessageToChannel(
        messageDataMock.parsedContent,
        messageDataMock.channel_id,
        messageDataMock.author
      )

      expect(returned).toBe(false)
      expect(sendMessageMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('setMessageSeen', () => {
    const messageId: string = messageSeenMock.id

    it('should return messageSeen', async () => {
      getValidTokenMock.mockResolvedValue(token)
      setMessageSeenMock.mockResolvedValue(messageSeenMock)

      expect(await messaging_api.setMessageSeen(messageId)).toEqual(messageSeenMock)
      expect(setMessageSeenMock).toHaveBeenCalledTimes(1)
      expect(setMessageSeenMock).toHaveBeenCalledWith(token, { message_id: messageId })
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(messaging_api.setMessageSeen(messageId)).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('setMessageDelivered', () => {
    const messageId: string = messageSeenMock.id

    it('should return messageSeen', async () => {
      getValidTokenMock.mockResolvedValue(token)
      setMessageDeliveredMock.mockResolvedValue(messageDelieveredMock)

      expect(await messaging_api.setMessageDelivered(messageId)).toEqual(messageDelieveredMock)
      expect(setMessageDeliveredMock).toHaveBeenCalledTimes(1)
      expect(setMessageDeliveredMock).toHaveBeenCalledWith(token, { message_id: messageId })
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(messaging_api.setMessageDelivered(messageId)).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('sendImageMessage', () => {
    it('should return true on sending image message success', async () => {
      getValidTokenMock.mockResolvedValue(token)
      sendMessageMock.mockResolvedValue([<messaging_service_sdk.Message> messageDataMock])
      uploadImageMock.mockResolvedValue(assetImageMock)

      const returned = await messages_utils.sendImageToChannel(
        imageFileMock, messageDataMock.channel_id, messageDataMock.author)

      expect(returned).toEqual(expect.any(String))
      expect(sendMessageMock).toHaveBeenCalledTimes(1)
      expect(uploadImageMock).toHaveBeenCalledTimes(1)
    })

    it('should return false when sending message fails', async () => {
      sendMessageMock.mockRejectedValue('ERROR')
      uploadImageMock.mockResolvedValue(assetImageMock)

      const returned = await messages_utils.sendImageToChannel(
        imageFileMock, messageDataMock.channel_id, messageDataMock.author)

      expect(returned).toBeUndefined()
      expect(sendMessageMock).toHaveBeenCalledTimes(1)
      expect(uploadImageMock).toHaveBeenCalledTimes(1)
    })

    it('should return false when uploading image fails', async () => {
      uploadImageMock.mockRejectedValue('ERROR')

      const returned = await messages_utils.sendImageToChannel(
        imageFileMock,
        messageDataMock.channel_id,
        messageDataMock.author
      )

      expect(returned).toBeUndefined()
      expect(sendMessageMock).toHaveBeenCalledTimes(0)
      expect(uploadImageMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getMessageContent', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should return parsed content object', () => {
      validateObjectKeysMock.mockReturnValue(undefined)
      const messageContent: MessageContent = {
        text: 'test content',
      }

      expect(messages_utils.getMessageContent({
        ...messageDataMock,
        content: JSON.stringify(messageContent),
      })).toEqual(messageContent)
    })

    it('should return null when wrong object is parsed', () => {
      validateObjectKeysMock.mockImplementationOnce(() => { throw new Error('ERR_WRONG_PARSED_CONTENT') })
      const messageContent: object = {
        wrong_field: 'test content',
      }

      expect(messages_utils.getMessageContent({
        ...messageDataMock,
        content: JSON.stringify(messageContent),
      })).toBeNull()
    })

    it('should return null if object cannot be parsed', () => {
      validateObjectKeysMock.mockImplementationOnce(() => { throw new Error('ERR_WRONG_PARSED_CONTENT') })
      const messageContent: string = 'unparsable object string'

      expect(messages_utils.getMessageContent({
        ...messageDataMock,
        content: messageContent,
      })).toBeNull()
    })
  })

  describe('getEncryptedMessageContent', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should return parsed content object', () => {
      validateObjectKeysMock.mockReturnValue(undefined)
      expect(messages_utils.getEncryptedMessageContent({
        ...messageDataMock,
        content: JSON.stringify(encryptedMessageContentMock),
      })).toEqual(encryptedMessageContentMock)
    })

    it('should return null when wrong object is parsed', () => {
      validateObjectKeysMock.mockImplementationOnce(() => { throw new Error('ERR_WRONG_PARSED_CONTENT') })
      const messageContent: object = {
        wrong_field: 'test content',
      }

      expect(messages_utils.getEncryptedMessageContent({
        ...messageDataMock,
        content: JSON.stringify(messageContent),
      })).toBeNull()
    })

    it('should return null if object cannot be parsed', () => {
      validateObjectKeysMock.mockImplementationOnce(() => { throw new Error('ERR_WRONG_PARSED_CONTENT') })
      const messageContent: string = 'unparsable object string'

      expect(messages_utils.getEncryptedMessageContent({
        ...messageDataMock,
        content: messageContent,
      })).toBeNull()
    })
  })

  describe('getMessageCardContent', () => {
    jest
      .spyOn(device_key_manager_instance.deviceKeyManager, 'decrypt')
      .mockResolvedValue(decryptedMock)

    it('should return text content', async () => {
      validateObjectKeysMock.mockReturnValue(undefined)
      const messageContent: MessageContent = {
        text: 'test content',
      }

      expect(await messages_utils.getMessageCardContent({
        ...messageDataMock,
        content: JSON.stringify(messageContent),
      })).toEqual(messageContent.text)
    })

    it('should return text content when message type is DELETED', async () => {
      validateObjectKeysMock.mockReturnValue(undefined)
      const messageContent: MessageContent = {
        text: 'deleted message test content',
      }

      expect(await messages_utils.getMessageCardContent({
        ...messageDataMock,
        type: MessageType.DELETED,
        content: JSON.stringify(messageContent),
      })).toEqual(messageContent.text)
    })

    it('should return text content when message type is SYSTEM', async () => {
      validateObjectKeysMock.mockReturnValue(undefined)
      const messageContent: MessageContent = {
        text: 'system message test content',
      }

      expect(await messages_utils.getMessageCardContent({
        ...messageDataMock,
        type: MessageType.SYSTEM,
        content: JSON.stringify(messageContent),
      })).toEqual(messageContent.text)
    })

    it('should return null if object cannot be parsed', async () => {
      validateObjectKeysMock.mockImplementationOnce(() => { throw new Error('ERR_WRONG_PARSED_CONTENT') })

      const messageContent: string = 'unparsable object string'

      expect(await messages_utils.getMessageCardContent({
        ...messageDataMock,
        content: messageContent,
      })).toBeNull()
    })

    it('should return decrypted text content', async () => {
      validateObjectKeysMock.mockReturnValue(undefined)
      const message: MessageData = {
        ...messageDataMock,
        type: MessageType.ENCRYPTED_TEXT,
        content: JSON.stringify(encryptedMessageContentMock),
      }

      expect(await messages_utils.getMessageCardContent(
        message,
        encryptedChannelSecretMock,
      )).toEqual(decryptedMock)
    })
  })
})

