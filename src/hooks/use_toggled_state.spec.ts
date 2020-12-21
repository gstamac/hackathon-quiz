import { getUseStateMock } from './../../tests/mocks/use_state_mock'

import { useToggledState } from './use_toggled_state'

import { testCustomHook, TestCustomHookType } from './../../tests/test_utils'
import { act } from '@testing-library/react-hooks'

import {
  ToggledStateProps,
  ToggledStateResult,
} from './interfaces'

describe('Use Toggled State', () => {
  const defaultProps: ToggledStateProps = {
    initialState: true,
    mounted: true,
  }
  const getHookResult: TestCustomHookType<ToggledStateProps, ToggledStateResult>
   = testCustomHook(useToggledState, defaultProps)

  it('should return state and trigger state toggle method', async () => {
    const result = await getHookResult({
      mounted: undefined,
    })
    const [state, toggleState]: ToggledStateResult = result.current

    expect(state).toBe(defaultProps.initialState)
    expect(toggleState).not.toBeUndefined()
  })

  it('should call passed command when toggledState method is called and condition is evaluated as true', async () => {
    const mockCommand: jest.Mock = jest.fn()

    const result = await getHookResult({
      command: mockCommand,
      condition: () => true,
    })
    const [, toggleState]: ToggledStateResult = result.current

    await act(async () => {
      await toggleState()
    })
    const [newState]: ToggledStateResult = result.current

    expect(newState).toBe(true)
    expect(mockCommand).toHaveBeenCalled()
  })
  it('shouldn\'t call passed command when toggledState method is called and condition is evaluated as false', async () => {
    const mockCommand: jest.Mock = jest.fn()

    const result = await getHookResult({
      command: mockCommand,
      condition: () => false,
    })
    const [, toggleState]: ToggledStateResult = result.current

    await act(async () => {
      await toggleState()
    })

    expect(mockCommand).not.toHaveBeenCalled()
  })
  it('should toggle state when toggleState method is called', async () => {
    const mockCommand: jest.Mock = jest.fn()

    const [setState, _useStateMock]: jest.Mock[] = getUseStateMock()

    const result = await getHookResult({
      command: mockCommand,
      condition: () => true,
    })

    const [, toggleState]: ToggledStateResult = result.current

    await act(async () => {
      await toggleState()
    })

    expect(setState).toHaveBeenCalledTimes(2)
    expect(setState.mock.calls[0][0]).toBe(!defaultProps.initialState)
    expect(setState.mock.calls[1][0]).toBe(defaultProps.initialState)
  })

  it('should reset state back to initial state when error has accured while executing command', async () => {
    const mockCommand: jest.Mock = jest.fn().mockRejectedValue('test')

    const result = await getHookResult({
      command: mockCommand,
      condition: () => true,
    })

    const [, toggleState]: ToggledStateResult = result.current

    await act(async () => {
      await toggleState()
    })

    const [newState]: ToggledStateResult = result.current

    expect(newState).toBe(defaultProps.initialState)
  })

  it('should not finish toggle of state when component becomes unmounted', async () => {
    const mockCommand: jest.Mock = jest.fn()

    const [setState, _useStateMock]: jest.Mock[] = getUseStateMock()

    const result = await getHookResult({
      mounted: false,
      command: mockCommand,
      condition: () => true,
    })

    const [, toggleState]: ToggledStateResult = result.current

    await act(async () => {
      await toggleState()
    })

    expect(setState).toHaveBeenCalledTimes(1)
    expect(setState.mock.calls[0][0]).toBe(!defaultProps.initialState)
  })
})
