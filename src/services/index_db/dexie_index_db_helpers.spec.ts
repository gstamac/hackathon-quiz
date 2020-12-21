import { WebAppDB } from './dexie_index_db'
import {
  clearDeviceId,
  clearDeviceKey, enableEncryptionDBData, getDeviceId,
  getDeviceKey,
  openDeviceIdStoreConnection,
  openDeviceKeyManagerStoreConnection, setDeviceId, setDeviceKey,
} from './dexie_index_db_helpers'
import { DeviceStoreData, KeyStatus } from './interfaces'

jest.mock('./dexie_index_db')

describe('Dexie index db tests', () => {

  const openStoreMock: jest.Mock = jest.fn()
  const getDeviceKeyManagerStoreMock: jest.Mock = jest.fn()
  const putDeviceKeyManagerStoreMock: jest.Mock = jest.fn()
  const clearDeviceKeyManagerStoreMock: jest.Mock = jest.fn()
  const updateDeviceKeyManagerStoreMock: jest.Mock = jest.fn()
  const getDeviceIdStoreMock: jest.Mock = jest.fn()
  const putDeviceIdStoreMock: jest.Mock = jest.fn()
  const clearDeviceIdStoreMock: jest.Mock = jest.fn()
  const updateDeviceIdStoreMock: jest.Mock = jest.fn()

  const deviceKeyManagerStoreMock = {
    get: getDeviceKeyManagerStoreMock,
    put: putDeviceKeyManagerStoreMock,
    clear: clearDeviceKeyManagerStoreMock,
    update: updateDeviceKeyManagerStoreMock,
  }

  const deviceIdStoreMock = {
    get: getDeviceIdStoreMock,
    put: putDeviceIdStoreMock,
    clear: clearDeviceIdStoreMock,
    update: updateDeviceIdStoreMock,
  }

  const deviceStoreDataMock = {
    privateKey: {},
    encryption: KeyStatus.DISABLED,
  }

  beforeEach(() => {
    WebAppDB.mockImplementation(() => ({
      open: openStoreMock,
      DeviceKeyManagerStore: deviceKeyManagerStoreMock,
      DeviceIdStore: deviceIdStoreMock,
    }))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('openDeviceKeyManagerStoreConnection', () => {
    it('should return deviceKeyManager store', async () => {
      const result = await openDeviceKeyManagerStoreConnection()

      expect(openStoreMock).toHaveBeenCalled()
      expect(result).toEqual(deviceKeyManagerStoreMock)
    })
  })

  describe('getDeviceKey', () => {
    it('should get DeviceKey', async () => {
      await getDeviceKey('device_id')
      expect(getDeviceKeyManagerStoreMock).toHaveBeenCalledWith('device_id')
    })
  })

  describe('setDeviceKey', () => {
    it('should set DeviceKey', async () => {
      await setDeviceKey('device_id', <DeviceStoreData> deviceStoreDataMock)
      expect(putDeviceKeyManagerStoreMock).toHaveBeenCalledWith({ id: 'device_id', data: deviceStoreDataMock })
    })
  })

  describe('clearDeviceKey', () => {
    it('should clear deviceKey', async () => {
      await clearDeviceKey()
      expect(clearDeviceKeyManagerStoreMock).toHaveBeenCalled()
    })
  })

  describe('enableEncryptionDBData', () => {
    it('should enable encryption', async () => {
      await enableEncryptionDBData('device_id')
      expect(updateDeviceKeyManagerStoreMock).toHaveBeenCalledWith(
        'device_id', { data: { 'encryption': 'enabled' } })
    })
  })

  describe('openDeviceIdStoreConnection', () => {
    it('should return deviceId store', async () => {
      const result = await openDeviceIdStoreConnection()

      expect(openStoreMock).toHaveBeenCalled()
      expect(result).toEqual(deviceIdStoreMock)
    })
  })

  describe('getDeviceId', () => {
    it('should get deviceId', async () => {
      await getDeviceId('device_id')
      expect(getDeviceIdStoreMock).toHaveBeenCalledWith('device_id')
    })
  })

  describe('setDeviceId', () => {
    it('should set deviceId', async () => {
      await setDeviceId('device_id', 'device_id_mock')
      expect(putDeviceIdStoreMock).toHaveBeenCalledWith({id: 'device_id',data:'device_id_mock'})
    })
  })

  describe('clearDeviceId', () => {
    it('should clear deviceId', async () => {
      await clearDeviceId()
      expect(clearDeviceIdStoreMock).toHaveBeenCalled()
    })
  })

})

