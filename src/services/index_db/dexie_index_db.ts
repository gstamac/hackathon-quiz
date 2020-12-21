import Dexie from 'dexie'

import { DeviceIdStore, DeviceKeyManagerStore } from './interfaces'

// eslint-disable-next-line no-restricted-syntax
export class WebAppDB extends Dexie {
  DeviceKeyManagerStore: DeviceKeyManagerStore
  DeviceIdStore: DeviceIdStore

  constructor () {
    super('WebAppDB')

    this.version(0.2).stores({
      DeviceKeyManagerStore: 'id',
      DeviceIdStore: 'id',
    })

    this.DeviceKeyManagerStore = this.table('DeviceKeyManagerStore')
    this.DeviceIdStore = this.table('DeviceIdStore')
  }
}

