/* eslint-disable @typescript-eslint/require-await */
import { testCustomHook, TestCustomHookType, actHook } from '../../../../tests/test_utils'
import { cleanup, HookResult } from '@testing-library/react-hooks'
import { UseToggle } from './interfaces'
import { useToggle } from './use_toggle'

const getHookResult: TestCustomHookType<boolean, UseToggle>
  = testCustomHook<boolean, UseToggle>(useToggle, false)

describe('UseToggle tests', () => {

  let result: HookResult<UseToggle>

  const renderHook = async (initialValue: boolean): Promise<void> => {
    await actHook(async () => {
      result = await getHookResult(initialValue)
    })
  }

  afterEach(async () => {
    await cleanup()
    jest.clearAllMocks()
  })

  it('should return value initialized to false and callback for toggle', async () => {
    await renderHook(false)

    expect(result.current.isActive).toEqual(false)
    expect(result.current.toggle).toEqual(expect.any(Function))
  })

  it('should return value initialized to true and callback for toggle', async () => {
    await renderHook(true)

    expect(result.current.isActive).toEqual(true)
    expect(result.current.toggle).toEqual(expect.any(Function))
  })

  it('should toggle state when toggle function is called', async () => {
    await renderHook(true)

    expect(result.current.isActive).toEqual(true)

    await actHook(async () => {
      result.current.toggle()
    })

    expect(result.current.isActive).toEqual(false)

    await actHook(async () => {
      result.current.toggle()
    })

    expect(result.current.isActive).toEqual(true)
  })
})
