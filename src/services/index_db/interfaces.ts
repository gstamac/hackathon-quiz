import Dexie from 'dexie'

export interface DeviceStoreData {
  publicKey: string
  privateKey: CryptoKey
  encryption: KeyStatus
}

export interface DeviceKeyObject<T = DeviceStoreData> {
  id: string
  data: T
}

export interface DeviceIdObject<T = string> {
  id: string
  data: T
}

export enum KeyStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

export type DeviceKeyManagerStore = Dexie.Table<DeviceKeyObject, string>
export type DeviceIdStore = Dexie.Table<DeviceIdObject, string>
