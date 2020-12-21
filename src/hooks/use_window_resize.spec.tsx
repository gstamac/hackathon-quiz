import { useWindowSize } from './use_window_resize'
import { overrideWindowHeight, testCustomHook, TestCustomHookType } from './../../tests/test_utils'
import { WindowSize } from './interfaces'

describe('Use Window Resize', () => {
  const getHookResult: TestCustomHookType<void, WindowSize>
    = testCustomHook(useWindowSize, {})

  it('should return window inner height and width', async () => {
    const result = await getHookResult()
    const state: WindowSize = result.current

    expect(state.width).toBe(window.innerWidth)
    expect(state.height).toBe(window.innerHeight)
  })

  it('should return resized window inner height', async () => {
    overrideWindowHeight(300)

    const result = await getHookResult()
    const state: WindowSize = result.current

    expect(state.height).toBe(300)
  })
})
