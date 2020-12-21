import { ChannelType } from '../../store/interfaces'
import {
  getChannelMessagesResponseMock,
  messageSeenMock,
  messageDelieveredMock, getCountersResponseMock,
} from '../../../tests/mocks/messages_mock'
import * as messaging_service_sdk from '@globalid/messaging-service-sdk'
import * as auth from '../../components/auth'
import * as file_service_api from './file_service_api'
import * as messaging_api from './messaging_api'
import { getGroupCountersResponseMock } from '../../../tests/mocks/counter_mocks'

jest.mock('../../components/auth')
jest.mock('../../utils')
jest.mock('./file_service_api')
jest.mock('@globalid/messaging-service-sdk')

describe('Messaging', () => {
  const getChannelMessagesMock: jest.Mock = jest.fn()
  const getValidTokenMock: jest.Mock = jest.fn()
  const sendMessageMock: jest.Mock = jest.fn()
  const setMessageSeenMock: jest.Mock = jest.fn()
  const setMessageDeliveredMock: jest.Mock = jest.fn()
  const uploadImageMock: jest.Mock = jest.fn()
  const getCountersMock: jest.Mock = jest.fn()
  const getGroupCountersMock: jest.Mock = jest.fn()

  const channel_id: string = '8d259467-3796-4d98-990e-452ced2791e1'

  const token: string = 'token'

  beforeAll(() => {
    (<jest.Mock> messaging_service_sdk.getMessages) = getChannelMessagesMock;
    (<jest.Mock> auth.getValidToken) = getValidTokenMock;
    (<jest.Mock> messaging_service_sdk.sendMessage) = sendMessageMock;
    (<jest.Mock> messaging_service_sdk.setMessageSeen) = setMessageSeenMock;
    (<jest.Mock> messaging_service_sdk.setMessageDelivered) = setMessageDeliveredMock;
    (<jest.Mock> file_service_api.uploadImage) = uploadImageMock;
    (<jest.Mock> messaging_service_sdk.getCounters) = getCountersMock;
    (<jest.Mock> messaging_service_sdk.getGroupCounters) = getGroupCountersMock
  })

  beforeEach(() => {
    getValidTokenMock.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getChannelMessages', () => {
    it('should return channel data', async () => {
      getValidTokenMock.mockReturnValue(token)

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

      await expect(messaging_api.getChannelMessages(channel_id, {})).rejects.toThrow(error)
    })

    it('should signout when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(null)

      await expect(messaging_api.getChannelMessages(channel_id, {})).rejects.not.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('setMessageSeen', () => {

    const messageId: string = messageSeenMock.id

    it('should return messageSeen', async () => {
      getValidTokenMock.mockReturnValue(token)

      setMessageSeenMock.mockResolvedValue(messageSeenMock)

      expect(await messaging_api.setMessageSeen(messageId)).toEqual(messageSeenMock)
      expect(setMessageSeenMock).toHaveBeenCalledTimes(1)
      expect(setMessageSeenMock).toHaveBeenCalledWith(token, { message_id: messageId })
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(null)

      await expect(messaging_api.setMessageSeen(messageId)).rejects.not.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('setMessageDelivered', () => {

    const messageId: string = messageSeenMock.id

    it('should return messageSeen', async () => {
      getValidTokenMock.mockReturnValue(token)

      setMessageDeliveredMock.mockResolvedValue(messageDelieveredMock)

      expect(await messaging_api.setMessageDelivered(messageId)).toEqual(messageDelieveredMock)
      expect(setMessageDeliveredMock).toHaveBeenCalledTimes(1)
      expect(setMessageDeliveredMock).toHaveBeenCalledWith(token, { message_id: messageId })
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(null)

      await expect(messaging_api.setMessageDelivered(messageId)).rejects.not.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('fetchCounters', () => {
    it('should return counters data', async () => {
      getValidTokenMock.mockReturnValue(token)

      getCountersMock.mockResolvedValue(getCountersResponseMock)
      expect(await messaging_api.fetchCounters({ channelTypes: [ChannelType.GROUP] })).toEqual(getCountersResponseMock)
      expect(getCountersMock).toHaveBeenCalledTimes(1)
      expect(getCountersMock).toHaveBeenCalledWith(token, { channelTypes: [ChannelType.GROUP]})
    })

    it('should reject when api rejects', async () => {
      const error: Error = new Error()

      getCountersMock.mockRejectedValue(error)

      await expect(messaging_api.fetchCounters({})).rejects.toThrow(error)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(messaging_api.fetchCounters({})).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('fetchGroupCounters', () => {
    it('should return group counters data', async () => {
      getValidTokenMock.mockReturnValue(token)

      getGroupCountersMock.mockResolvedValue(getGroupCountersResponseMock)
      expect(await messaging_api.fetchGroupCounters({ page: 1, per_page: 20 })).toEqual(getGroupCountersResponseMock)
      expect(getGroupCountersMock).toHaveBeenCalledTimes(1)
      expect(getGroupCountersMock).toHaveBeenCalledWith(token, { page: 1, per_page: 20 })
    })

    it('should reject when api rejects', async () => {
      const error: Error = new Error()

      getGroupCountersMock.mockRejectedValue(error)

      await expect(messaging_api.fetchGroupCounters({})).rejects.toThrow(error)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(messaging_api.fetchGroupCounters({})).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

})
