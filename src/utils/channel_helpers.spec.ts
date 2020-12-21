import { DevicesInfoResponse } from '@globalid/keystore-service-sdk'
import { getDeviceInfoMock } from './../../tests/mocks/device_key_manager_mocks'
import { channelWithSecretMock } from './../../tests/mocks/channels_mock'
import { ChannelWithParticipants } from '@globalid/messaging-service-sdk'
import { History } from 'history'
import * as uuid4 from 'uuid'
import { foldersMock } from '../../tests/mocks/channels_mock'
import { getChannelResponseMock } from '../../tests/mocks/channels_mocks'
import {
  deviceInfoMock,
  participantSecretData,
} from '../../tests/mocks/device_key_manager_mocks'
import { MessagesType } from '../components/messages/interfaces'
import { BASE_MESSAGES_URL } from '../constants'
import { deviceKeyManager } from '../init'
import * as channelsApi from '../services/api/channels_api'
import * as keystoreApi from '../services/api/keystore_api'
import { history } from '../store'
import { ChannelType } from '../store/interfaces'
import {
  createChannelWithUserDeviceSecrets,
  createConversation,
  getRouteFolderType,
  goToChannel,
} from './channel_helpers'
import * as channels_slice from '../store/channels_slice/channels_slice'

jest.mock('../services/api/channels_api')
jest.mock('../init')
jest.mock('../services/api/keystore_api')
jest.mock('uuid')

describe('Channel helpers tests', () => {
  const getUsersDevicesMock: jest.Mock = jest.fn()
  const prepareSecretsMock: jest.Mock = jest.fn()
  const createChannelE2EEMock: jest.Mock = jest.fn()
  const createChannelMock: jest.Mock = jest.fn()
  const uuidMock: jest.Mock = jest.fn()
  const historyMock: History = {
    ...history,
    push: jest.fn(),
  }

  beforeEach(() => {
    (<jest.Mock>deviceKeyManager.prepareSecrets) = prepareSecretsMock.mockResolvedValue([participantSecretData]);
    (<jest.Mock>keystoreApi.getUsersDevices) = getUsersDevicesMock.mockResolvedValue([deviceInfoMock]);
    (<jest.Mock>channelsApi.createChannelE2EE) = createChannelE2EEMock.mockResolvedValue(getChannelResponseMock);
    (<jest.Mock>channelsApi.createChannel) = createChannelMock.mockResolvedValue(getChannelResponseMock);
    (<jest.Mock>uuid4.v4) = uuidMock.mockReturnValue('uuid')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('#createChannelWithUserDeviceSecrets', () => {
    it('should create encrypted channel', async () => {
      const devicesMock = [getDeviceInfoMock('gid_uuid2'), getDeviceInfoMock('gid_uuid1')];

      (<jest.Mock>keystoreApi.getUsersDevices) = getUsersDevicesMock.mockResolvedValue(devicesMock)
      const response: ChannelWithParticipants = await createChannelWithUserDeviceSecrets(['gid_uuid2'], 'gid_uuid1', ChannelType.PERSONAL)

      expect(getUsersDevicesMock).toHaveBeenCalledWith(['gid_uuid2', 'gid_uuid1'])
      expect(prepareSecretsMock).toHaveBeenCalledWith(devicesMock)
      expect(createChannelE2EEMock).toHaveBeenCalledWith({
        participants: ['gid_uuid2'],
        exposed: true,
        type: 'PERSONAL',
        secrets: [participantSecretData],
        uuid: 'uuid',
      })
      expect(response).toStrictEqual(getChannelResponseMock)
    })

    it('should non-encrypted create channel when not all participants have associated devices', async () => {
      (<jest.Mock>keystoreApi.getUsersDevices)
      = getUsersDevicesMock.mockResolvedValue([deviceInfoMock])
      const response: ChannelWithParticipants = await createChannelWithUserDeviceSecrets(['gid_uuid2', 'gid_uuid3'], 'gid_uuid1', ChannelType.MULTI)

      expect(getUsersDevicesMock).toHaveBeenCalledWith(['gid_uuid2', 'gid_uuid3', 'gid_uuid1'])
      expect(prepareSecretsMock).toHaveBeenCalledWith([deviceInfoMock])
      expect(createChannelMock).toHaveBeenCalledWith(expect.objectContaining({
        participants: ['gid_uuid2', 'gid_uuid3'],
        exposed: true,
        type: 'MULTI',
        uuid: 'uuid',
      }))
      expect(response).toStrictEqual(getChannelResponseMock)
    })
  })

  describe('getRouteFolderType', () => {
    it('should return folderType `PRIMARY` from a group from default folder', () => {
      const folderType: MessagesType = getRouteFolderType(foldersMock, foldersMock[0].id)

      expect(folderType).toEqual(MessagesType.PRIMARY)
    })

    it('should return folderType `OTHER` from a group from unknown folder', () => {
      const folderType: MessagesType = getRouteFolderType(foldersMock, foldersMock[1].id)

      expect(folderType).toEqual(MessagesType.OTHER)
    })

    it('should return folderType `PRIMARY` when folder id is undefined', () => {
      const folderType: MessagesType = getRouteFolderType(foldersMock, undefined)

      expect(folderType).toEqual(MessagesType.PRIMARY)
    })

    it('should return folderType `PRIMARY` when folder id is not in folders', () => {
      const folderType: MessagesType = getRouteFolderType(foldersMock, 'unknown')

      expect(folderType).toEqual(MessagesType.PRIMARY)
    })

    it('should return folderType `GROUPS` when channel type is `GROUP`', () => {
      const folderType: MessagesType = getRouteFolderType(foldersMock, 'unknown')

      expect(folderType).toEqual(MessagesType.PRIMARY)
    })
  })

  describe('goToChannel', () => {
    const channelId: string = 'test'

    const actionBeforeRedirectMock: jest.Mock = jest.fn()

    it('should redirect to channel', () => {
      goToChannel(historyMock, channelId, MessagesType.PRIMARY)

      expect(historyMock.push).toHaveBeenCalledTimes(1)
      expect(actionBeforeRedirectMock).toHaveBeenCalledTimes(0)
    })

    it('should redirect to channel and call a function before redirect', () => {
      goToChannel(historyMock, channelId, MessagesType.PRIMARY, {
        actionBeforeRedirect: actionBeforeRedirectMock,
      })

      expect(historyMock.push).toHaveBeenCalledTimes(1)
      expect(actionBeforeRedirectMock).toHaveBeenCalledTimes(1)
    })

    it('should redirect to channel when current path is not the same as new one', () => {
      goToChannel(historyMock, channelId, MessagesType.PRIMARY, {
        currentPath: 'test',
      })

      expect(historyMock.push).toHaveBeenCalledTimes(1)
      expect(actionBeforeRedirectMock).toHaveBeenCalledTimes(0)
    })

    it('should redirect to channel and call a function before redirect when current path is not the same as new one', () => {
      goToChannel(historyMock, channelId, MessagesType.PRIMARY, {
        actionBeforeRedirect: actionBeforeRedirectMock,
        currentPath: 'test',
      })

      expect(historyMock.push).toHaveBeenCalledTimes(1)
      expect(actionBeforeRedirectMock).toHaveBeenCalledTimes(1)
    })

    it('should not redirect to channel when current path is the same as new one', () => {
      goToChannel(historyMock, channelId, MessagesType.PRIMARY, {
        currentPath: `${BASE_MESSAGES_URL}/${MessagesType.PRIMARY}/${channelId}`,
      })

      expect(historyMock.push).toHaveBeenCalledTimes(0)
      expect(actionBeforeRedirectMock).toHaveBeenCalledTimes(0)
    })

    it('should not redirect to channel and call a function before redirect when current path is the same as new one', () => {
      goToChannel(historyMock, channelId, MessagesType.PRIMARY, {
        actionBeforeRedirect: actionBeforeRedirectMock,
        currentPath: `${BASE_MESSAGES_URL}/${MessagesType.PRIMARY}/${channelId}`,
      })

      expect(historyMock.push).toHaveBeenCalledTimes(0)
      expect(actionBeforeRedirectMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('createConversation', () => {
    const dispatchMock: jest.Mock = jest.fn().mockImplementation((arg: object) => ({
      payload: arg,
    }))

    const fetchExistingChannelMock: jest.Mock = jest.fn()
    const setChannelMock: jest.Mock = jest.fn()

    jest.mock('../store/channels_slice/channels_slice');

    (<jest.Mock> channels_slice.fetchExistingChannel) = fetchExistingChannelMock;
    (<jest.Mock> channels_slice.setChannel) = setChannelMock

    it('Should create new encrypted chat', async () => {
      const deviceInfoMocks: DevicesInfoResponse[] = [getDeviceInfoMock('gid_uuid1'), getDeviceInfoMock('my_uuid')];

      (<jest.Mock>keystoreApi.getUsersDevices) = getUsersDevicesMock.mockResolvedValue(deviceInfoMocks)
      fetchExistingChannelMock.mockReturnValue(undefined)

      setChannelMock.mockReturnValue(channelWithSecretMock)
      await createConversation(
        ['gid_uuid1'],
        'my_uuid',
        foldersMock,
        dispatchMock,
        historyMock
      )

      expect(createChannelE2EEMock).toHaveBeenCalledWith(expect.objectContaining({
        uuid: expect.any(String),
        participants: ['gid_uuid1'],
        type: 'PERSONAL',
        exposed: true,
      }))

      expect(historyMock.push).toHaveBeenCalledTimes(1)
    })

    it('Should create new unencrypted chat channel', async () => {
      fetchExistingChannelMock.mockReturnValue(undefined)

      setChannelMock.mockReturnValue(channelWithSecretMock)
      await createConversation(
        ['gid_uuid1', 'gid_uuid2'],
        'my_uuid',
        foldersMock,
        dispatchMock,
        historyMock
      )

      expect(createChannelMock).toHaveBeenCalledWith(expect.objectContaining({
        uuid: expect.any(String),
        participants: ['gid_uuid1', 'gid_uuid2', 'my_uuid'],
        type: 'MULTI',
        exposed: true,
      }))
    })

    it('should not create a channel when channel already exist', async () => {
      fetchExistingChannelMock.mockReturnValue(channelWithSecretMock)

      await createConversation(
        ['gid_uuid1'],
        'my_uuid',
        foldersMock,
        dispatchMock,
        historyMock
      )

      expect(createChannelE2EEMock).not.toHaveBeenCalled()
    })
  })
})
