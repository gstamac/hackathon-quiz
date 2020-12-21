import {
  getOwnDevices,
  MyDevicesInfoResponse,
  CreateDeviceResponse,
  createDevice,
  searchDevices,
  DevicesSearchBody,
  DevicesInfoResponse,
} from '@globalid/keystore-service-sdk'
import { getValidToken } from '../../components/auth'
import { GidUUID } from '../../store/interfaces'

export const getMyDevices = async (): Promise<MyDevicesInfoResponse[]> => {
  const token: string = await getValidToken()

  return getOwnDevices(token)
}

export const createNewDevice = async (public_key: string): Promise<CreateDeviceResponse> => {
  const token: string = await getValidToken()

  return createDevice(token, { public_key })
}

export const getUsersDevices = async (gidUuids: GidUUID[]): Promise<DevicesInfoResponse[]> => {
  const token: string = await getValidToken()

  const body: DevicesSearchBody = { gid_uuids: gidUuids }

  return searchDevices(body, token)
}
