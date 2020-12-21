import { MyDevicesInfoResponse } from '@globalid/keystore-service-sdk'
import { getMyDevices } from '../services/api/keystore_api'

export const isCurrentDeviceMine = async (deviceId: string | undefined): Promise<boolean> => {
  if (!deviceId) {
    return false
  }

  const myDevices: MyDevicesInfoResponse[] = await getMyDevices()

  return myDevices.some((device: MyDevicesInfoResponse) => device.device_id === deviceId)
}

