import { delay } from './delay'
const delayedMethod = async (): Promise<boolean> => {
  await delay(1000)

  return true
}

describe('delay', () => {
  it('should resolve a promise after a specified time', async () => {
    expect(await delayedMethod()).toBe(true)
  })
})

