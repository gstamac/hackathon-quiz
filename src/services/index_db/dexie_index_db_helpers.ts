import { WebAppDB } from './dexie_index_db'
import {
  DeviceIdObject,
  DeviceIdStore,
  DeviceKeyManagerStore,
  DeviceKeyObject,
  DeviceStoreData,
  KeyStatus,
} from './interfaces'

export const openDeviceKeyManagerStoreConnection = async (): Promise<DeviceKeyManagerStore> => {
  const db = new WebAppDB()
  const store: DeviceKeyManagerStore = db.DeviceKeyManagerStore

  await db.open()

  return store
}
export const getDeviceKey = async (id: string): Promise<DeviceStoreData | undefined> => {
  const store: DeviceKeyManagerStore = await openDeviceKeyManagerStoreConnection()
  const result: DeviceKeyObject | undefined = await store.get(id)

  return result?.data
}
export const setDeviceKey = async (id: string, data: DeviceStoreData): Promise<void> => {
  const store: DeviceKeyManagerStore = await openDeviceKeyManagerStoreConnection()

  await store.put({ data, id })
}
export const clearDeviceKey = async (): Promise<void> => {
  const store: DeviceKeyManagerStore = await openDeviceKeyManagerStoreConnection()

  await store.clear()
}
export const enableEncryptionDBData = async (id: string): Promise<void> => {
  const store: DeviceKeyManagerStore = await openDeviceKeyManagerStoreConnection()
  const data = await store.get(id)

  await store.update(id, {
    ...data,
    data: { ...data?.data, encryption: KeyStatus.ENABLED },
  })
}
export const openDeviceIdStoreConnection = async (): Promise<DeviceIdStore> => {
  const db = new WebAppDB()
  const store: DeviceIdStore = db.DeviceIdStore

  await db.open()

  return store
}
export const getDeviceId = async (id: string): Promise<string | undefined> => {
  const store = await openDeviceIdStoreConnection()
  const result: DeviceIdObject | undefined = await store.get(id)

  return result?.data
}
export const setDeviceId = async (id: string, data: string): Promise<void> => {
  const store = await openDeviceIdStoreConnection()

  await store.put({ data, id })
}
export const clearDeviceId = async (): Promise<void> => {
  const store = await openDeviceIdStoreConnection()

  await store.clear()
}
