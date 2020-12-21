import { WebAppDB } from './dexie_index_db'

describe('WebAppDB Class test', () => {

  it('should get get an instance of class WebAppDB', () => {
    const db: WebAppDB = new WebAppDB()

    expect(db).toBeDefined()
    expect(db.DeviceKeyManagerStore).toBeDefined()
    expect(db.DeviceIdStore).toBeDefined()
  })
})
