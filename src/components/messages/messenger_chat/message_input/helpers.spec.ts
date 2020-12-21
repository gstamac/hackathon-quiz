import * as messageInputHelpers from './helpers'
import { deviceKeyManager } from '../../../../init'
import { encryptedMessageContentMock } from '../../../../../tests/mocks/device_key_manager_mocks'
import { AddMessagePayload } from '@globalid/messaging-service-sdk'
import { MessageType } from '../interfaces'
import { cleanup } from '../../../../../tests/test_utils'
import { assetImageMock } from '../../../../../tests/mocks/messages_mock'
import moment from 'moment'
import { MessageData } from '../../../../store/interfaces'

jest.mock('moment')
jest.mock('uuid')

describe('Helper functions tests', () => {
  const encryptMock: jest.Mock = jest.fn()
  const utcTimeMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (<jest.Mock>deviceKeyManager.encrypt) = encryptMock;
    (<jest.Mock>moment.utc) = utcTimeMock
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  describe('createMessagePayload', () => {
    it('should return correct create-new-message payload', async () => {
      encryptMock.mockResolvedValue(encryptedMessageContentMock)

      const addMessage: AddMessagePayload =
        await messageInputHelpers.createMessagePayload('message', 'uuid', 'encrypted_secret')

      expect(addMessage).toEqual({
        uuid: 'uuid',
        type: MessageType.ENCRYPTED_TEXT,
        content: JSON.stringify(encryptedMessageContentMock),
        silent: false,
      })

      expect(encryptMock).toHaveBeenCalled()
    })

    it('should return correct create-new-message payload when there is no channel secret', async () => {
      const addMessage: AddMessagePayload =
        await messageInputHelpers.createMessagePayload('message', 'uuid')

      expect(addMessage).toEqual({
        uuid: 'uuid',
        type: MessageType.TEXT,
        content: JSON.stringify({ text: 'message' }),
        silent: false,
      })

      expect(encryptMock).not.toHaveBeenCalled()
    })

    it('should throw an error when ecrypting fails', async () => {
      encryptMock.mockRejectedValue(new Error())

      await expect(messageInputHelpers.createMessagePayload('message', 'uuid', 'encrypted_secret'))
        .rejects.toThrow('ERR_ENCRYPTION')
    })
  })

  describe('createMessageData', () => {
    it('should return correct create-new-message data for redux store', () => {
      utcTimeMock.mockReturnValue({
        toISOString: () => 'date',
      })

      const message: string = 'message'

      const addImage: MessageData =
        messageInputHelpers.createMessageData(message, 'channelId', 'autor')

      expect(addImage).toEqual({
        type: MessageType.TEXT,
        content: '',
        parsedContent: message,
        channel_id: 'channelId',
        sequence_id: undefined,
        author: 'autor',
        deleted: false,
        errored: false,
        delivered: false,
        created_at: 'date',
        uuid: undefined,
      })
    })
  })

  describe('createImagePayload', () => {
    it('should return correct create-new-message payload', () => {

      const addImage: AddMessagePayload =
        messageInputHelpers.createImagePayload(assetImageMock, 'uuid')

      expect(addImage).toEqual({
        uuid: 'uuid',
        type: MessageType.MEDIA,
        content: JSON.stringify({
          list_view_type: 'HORIZONTAL',
          assets: [assetImageMock],
        }),
        silent: false,
      })
    })
  })

  describe('createImageData', () => {
    it('should return correct create-new-message data for redux store', () => {
      utcTimeMock.mockReturnValue({
        toISOString: () => 'date',
      })

      const image: string = 'imageBase64'
      const assetUuid: string = 'assetUuid'

      const addImage: MessageData =
        messageInputHelpers.createImageData(assetUuid, image, 'channelId', 'author')

      expect(addImage).toEqual({
        type: MessageType.MEDIA,
        content: JSON.stringify({ base64: image }),
        parsedContent: JSON.stringify({ assets: [{ uuid: assetUuid, thumbnail: image }]}),
        channel_id: 'channelId',
        sequence_id: undefined,
        author: 'author',
        deleted: false,
        errored: false,
        delivered: false,
        created_at: 'date',
        uuid: undefined,
      })
    })
  })

  describe('trimTextLeftAndRightSideWhiteSpaces', () => {
    it('should trim text left side white spaces', () => {
      expect(messageInputHelpers.trimTextLeftAndRightSideWhiteSpaces('  text')).toEqual('text')
    })

    it('should trim text right side white spaces', () => {
      expect(messageInputHelpers.trimTextLeftAndRightSideWhiteSpaces('text   ')).toEqual('text')
    })

    it('should trim text left/right side white spaces', () => {
      expect(messageInputHelpers.trimTextLeftAndRightSideWhiteSpaces('   text   ')).toEqual('text')
    })
  })
})
