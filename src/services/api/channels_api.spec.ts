import { AddChannelBody } from '@globalid/messaging-service-sdk/interfaces'
import { participantSecretData } from '../../../tests/mocks/device_key_manager_mocks'
import * as channels_api from './channels_api'
import * as messaging_service_sdk from '@globalid/messaging-service-sdk'
import * as auth from '../../components/auth'

import {
  channelWithMoreParticipantsMock,
  multiChannelWithThreeMembersMock,
  fileTokenMock,
} from '../../../tests/mocks/channels_mock'
import {
  get1on1ChannelResponseMock,
  getChannelResponseMock,
  getChannelsResponseMock,
} from '../../../tests/mocks/channels_mocks'
import { deviceKeyManager } from '../../init'

jest.mock('../../components/auth')
jest.mock('@globalid/messaging-service-sdk')
jest.mock('../../init')

describe('Channels API', () => {
  const getChannelMock: jest.Mock = jest.fn()
  const getChannelsMock: jest.Mock = jest.fn()
  const getValidTokenMock: jest.Mock = jest.fn()
  const getDeviceIdMock: jest.Mock = jest.fn()
  const getFileTokenMock: jest.Mock = jest.fn()

  const leaveChannelMock: jest.Mock = jest.fn()
  const createMultiDeviceChannelMock: jest.Mock = jest.fn()
  const createChannelMock: jest.Mock = jest.fn()

  const channel_id: string = '8d259467-3796-4d98-990e-452ced2791e1'
  const token: string = 'token'

  beforeAll(() => {
    (<jest.Mock> messaging_service_sdk.getChannel) = getChannelMock;
    (<jest.Mock> messaging_service_sdk.getChannels) = getChannelsMock;
    (<jest.Mock> messaging_service_sdk.getChannelFileToken) = getFileTokenMock;

    (<jest.Mock> auth.getValidToken) = getValidTokenMock;

    (<jest.Mock> deviceKeyManager.getDeviceId) = getDeviceIdMock;

    (<jest.Mock> messaging_service_sdk.leaveChannel) = leaveChannelMock;
    (<jest.Mock> messaging_service_sdk.createMultiDeviceChannel) = createMultiDeviceChannelMock;
    (<jest.Mock> messaging_service_sdk.createChannel) = createChannelMock
  })

  beforeEach(() => {
    getValidTokenMock.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getChannel', () => {
    it('should return encrypted channel data', async () => {
      const device_id: string = '4ea7545c-ba98-415c-8477-80d0e72e47ca'

      getDeviceIdMock.mockReturnValue(device_id)
      getChannelMock.mockResolvedValue(getChannelResponseMock)

      const channel: messaging_service_sdk.ChannelWithParticipants = await channels_api.getChannel(channel_id, {
        encrypted: true,
      })

      expect(channel).toEqual(getChannelResponseMock)
      expect(getChannelMock).toHaveBeenCalledTimes(1)
      expect(getChannelMock).toHaveBeenCalledWith(token, { channel_id }, { device_id })
    })
    it('should return channel data', async () => {
      const device_id: string = '4ea7545c-ba98-415c-8477-80d0e72e47ca'

      getDeviceIdMock.mockReturnValue(device_id)
      getChannelMock.mockResolvedValue(getChannelResponseMock)

      const channel: messaging_service_sdk.ChannelWithParticipants = await channels_api.getChannel(channel_id, {
        encrypted: false,
      })

      expect(channel).toEqual(getChannelResponseMock)
      expect(getChannelMock).toHaveBeenCalledTimes(1)
      expect(getChannelMock).toHaveBeenCalledWith(token, { channel_id }, { device_id: undefined })
    })

    it('should reject when api rejects', async () => {
      const error: Error = new Error()

      getChannelMock.mockRejectedValue(error)

      await expect(channels_api.getChannel(channel_id)).rejects.toThrow(error)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(channels_api.getChannel(channel_id)).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('getChannels', () => {
    it('should return channel data', async () => {
      getChannelsMock.mockResolvedValue(getChannelsResponseMock())

      const channels: messaging_service_sdk.ChannelsWithPaginationMeta
        = await channels_api.getChannels({ channelTypes: ['PERSONAL', 'MULTI', 'GROUP'] })

      expect(channels).toEqual(getChannelsResponseMock())
      expect(getChannelsMock).toHaveBeenCalledTimes(1)

      const expectedPayload = {
        channelTypes: ['PERSONAL', 'MULTI', 'GROUP'],
        page: undefined,
      }

      expect(getChannelsMock).toHaveBeenCalledWith(token, expectedPayload)
    })

    it('should reject when api rejects', async () => {
      const error: Error = new Error()

      getChannelsMock.mockRejectedValue(error)

      await expect(channels_api.getChannels({ channelTypes: [] })).rejects.toThrow(error)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(channels_api.getChannels({ channelTypes: [] })).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('createChannelE2EE', () => {
    const createChannelE2EEBody: messaging_service_sdk.AddChannelWithDevicesBody = {
      participants: ['gid_uuid2'],
      exposed: true,
      type: 'PERSONAL',
      secrets: [participantSecretData],
      uuid: 'uuid',
    }

    it('should return an encrypted channel response', async () => {
      createMultiDeviceChannelMock.mockReturnValue(get1on1ChannelResponseMock)

      const returned = await channels_api.createChannelE2EE(createChannelE2EEBody)

      expect(returned).toBe(get1on1ChannelResponseMock)
      expect(returned.secret).toBeDefined()
      expect(createMultiDeviceChannelMock).toHaveBeenCalledTimes(1)
      expect(createMultiDeviceChannelMock).toHaveBeenCalledWith(token, createChannelE2EEBody)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(channels_api.createChannelE2EE(createChannelE2EEBody)).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('createChannel', () => {
    const createChannelBody: AddChannelBody = {
      participants: ['1676e58f-7596-4e95-a8ac-9c23ad72e44d', '63c838da-2941-4f90-b23d-46f73f16a020'],
      exposed: true,
      type: 'MULTI',
      uuid: 'a1a86364-75ae-409d-9f11-bddab5317d5b',
    }

    it('should return a channel response', async () => {
      createChannelMock.mockReturnValue(getChannelResponseMock)

      const returned = await channels_api.createChannel(createChannelBody)

      expect(returned).toBe(getChannelResponseMock)
      expect(createChannelMock).toHaveBeenCalledTimes(1)
      expect(createChannelMock).toHaveBeenCalledWith(token, createChannelBody)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(channels_api.createChannel(createChannelBody)).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('leaveChannel', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return a response with deleted prop set to true if the leaving of channel succeeded', async () => {
      leaveChannelMock.mockResolvedValue({ ...multiChannelWithThreeMembersMock, deleted: true })

      const returned = await channels_api.leaveFromChannel(channelWithMoreParticipantsMock.id)

      expect(returned.deleted).toBe(true)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(channels_api.leaveFromChannel(channel_id)).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('getFileToken', () => {
    it('should return fileToken', async () => {
      getFileTokenMock.mockResolvedValue(fileTokenMock)

      const fileToken: messaging_service_sdk.FileToken = await channels_api.getFileToken(channel_id)

      expect(fileToken).toEqual(fileTokenMock)
      expect(getFileTokenMock).toHaveBeenCalledTimes(1)
      expect(getFileTokenMock).toHaveBeenCalledWith(token, { channel_id })
    })

    it('should reject when api rejects', async () => {
      const error: Error = new Error()

      getFileTokenMock.mockRejectedValue(error)

      await expect(channels_api.getFileToken(channel_id)).rejects.toThrow(error)
    })

    it('should reject when token is not present', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(channels_api.getFileToken(channel_id)).rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })
})
