import { isCurrentDeviceMine } from './device_helpers'
import { devicesMock } from '../../tests/mocks/keystore_mock'
import * as keystoreApi from '../services/api/keystore_api'

describe('Device helpers tests', () => {
  const getMyDevicesMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (keystoreApi.getMyDevices as jest.Mock) = getMyDevicesMock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('isCurrentDeviceMine', () => {
    it('should return true when provided deviceId belongs to one of my devices', async () => {
      getMyDevicesMock.mockReturnValue(devicesMock)

      expect(await isCurrentDeviceMine('device_id')).toEqual(true)
    })

    it('should return false when provided deviceId doesn\'t belong to one of my devices', async () => {
      getMyDevicesMock.mockReturnValue([])

      expect(await isCurrentDeviceMine('device_id')).toEqual(false)
    })

    it('should return false when provided deviceId is undefined', async () => {
      expect(await isCurrentDeviceMine(undefined)).toEqual(false)
      expect(getMyDevicesMock).not.toHaveBeenCalled()
    })
  })
})
