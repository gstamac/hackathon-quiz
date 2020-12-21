import { act, renderHook, HookResult, RenderHookResult } from '@testing-library/react-hooks'
import { useBooleanState } from './use_boolean_state'
import { BooleanState } from './interfaces'

const getHookResult = async (
  initialState: boolean
): Promise<HookResult<BooleanState>> => {
  let renderHookResult: RenderHookResult<{}, BooleanState>

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    renderHookResult = renderHook(() => useBooleanState(initialState))
  })

  return renderHookResult.result
}

describe('useBooleanState', () => {

  it('should be false on initialization', async () => {
    const result: HookResult<BooleanState> = await getHookResult(false)
    const [boolean]: BooleanState = result.current

    expect(boolean).toBe(false)
  })

  it('should be true on initialization', async () => {
    const result: HookResult<BooleanState> = await getHookResult(true)
    const [boolean]: BooleanState = result.current

    expect(boolean).toBe(true)
  })

  it('should change value upon calling true/false methods', async () => {
    const result: HookResult<BooleanState> = await getHookResult(false)
    const [boolean, setTrue, setFalse]: BooleanState = result.current

    expect(boolean).toBe(false)

    await act(() => {
      setTrue()
    })

    expect(result.current[0]).toBe(true)

    await act(() => {
      setFalse()
    })

    expect(result.current[0]).toBe(false)
  })
})
