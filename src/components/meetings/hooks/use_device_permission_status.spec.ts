/* eslint-disable @typescript-eslint/require-await */
import { testCustomHook, TestCustomHookType, actHook } from '../../../../tests/test_utils'
import { useDevicePermissionStatus } from './use_device_permission_status'
import { cleanup, HookResult } from '@testing-library/react-hooks'
import { DevicePermissionStatus } from '../enums'
import * as amazonChime from 'amazon-chime-sdk-component-library-react'

jest.mock('amazon-chime-sdk-component-library-react')

const getHookResult: TestCustomHookType<undefined, string>
  = testCustomHook(useDevicePermissionStatus, undefined)

describe('useDevicePermissionStatus tests', () => {
  let result: HookResult<string>
  // eslint-disable-next-line unicorn/consistent-function-scoping
  let callback: Function = () => undefined

  const useMeetingManagerMock: jest.Mock = jest.fn()
  const subscribeToDevicePermissionStatusMock: jest.Mock = jest.fn()
  const unsubscribeFromDevicePermissionStatusMock: jest.Mock = jest.fn()

  const mockMeetingManagerCallbackWith = (): void => {

    useMeetingManagerMock.mockReturnValue({
      subscribeToDevicePermissionStatus: (cb: Function) => {
        callback = cb
        subscribeToDevicePermissionStatusMock()
      },
      unsubscribeFromDevicePermissionStatus: (cb: Function) => {
        callback = cb
        unsubscribeFromDevicePermissionStatusMock()
      },
    })

  }

  const renderHook = async (): Promise<void> => {
    await actHook(async () => {
      result = (await getHookResult(undefined))
    })
  }

  beforeAll(() => {
    (<jest.Mock> amazonChime.useMeetingManager) = useMeetingManagerMock
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  it('should return DevicePermissionStatus.UNSET when callback in subscribeToDevicePermissionStatus is not called', async () => {
    mockMeetingManagerCallbackWith()

    await renderHook()

    expect(result.current).toEqual(DevicePermissionStatus.UNSET)
    expect(subscribeToDevicePermissionStatusMock).toHaveBeenCalledTimes(1)

    await actHook(async () => {
      await cleanup()
    })

    expect(unsubscribeFromDevicePermissionStatusMock).toHaveBeenCalledTimes(1)
  })

  it('should return DevicePermissionStatus.IN_PROGRESS when callback in subscribeToDevicePermissionStatus is called with DevicePermissionStatus.IN_PROGRESS', async () => {
    mockMeetingManagerCallbackWith()

    await renderHook()

    await actHook(async () => {
      callback(DevicePermissionStatus.IN_PROGRESS)
    })

    expect(result.current).toEqual(DevicePermissionStatus.IN_PROGRESS)
    expect(subscribeToDevicePermissionStatusMock).toHaveBeenCalledTimes(1)

    await actHook(async () => {
      await cleanup()
    })

    expect(unsubscribeFromDevicePermissionStatusMock).toHaveBeenCalledTimes(1)
  })

  it('should return DevicePermissionStatus.DENIED when callback in subscribeToDevicePermissionStatus is called with DevicePermissionStatus.DENIED', async () => {
    mockMeetingManagerCallbackWith()

    await renderHook()

    await actHook(async () => {
      callback(DevicePermissionStatus.DENIED)
    })

    expect(result.current).toEqual(DevicePermissionStatus.DENIED)
    expect(subscribeToDevicePermissionStatusMock).toHaveBeenCalledTimes(1)

    await actHook(async () => {
      await cleanup()
    })

    expect(unsubscribeFromDevicePermissionStatusMock).toHaveBeenCalledTimes(1)
  })

  it('should return DevicePermissionStatus.GRANTED when callback in subscribeToDevicePermissionStatus is called with DevicePermissionStatus.GRANTED', async () => {
    mockMeetingManagerCallbackWith()

    await renderHook()

    await actHook(async () => {
      callback(DevicePermissionStatus.GRANTED)
    })

    expect(result.current).toEqual(DevicePermissionStatus.GRANTED)
    expect(subscribeToDevicePermissionStatusMock).toHaveBeenCalledTimes(1)

    await actHook(async () => {
      await cleanup()
    })

    expect(unsubscribeFromDevicePermissionStatusMock).toHaveBeenCalledTimes(1)
  })

  it('should return DevicePermissionStatus.UNSET when callback in subscribeToDevicePermissionStatus is called with DevicePermissionStatus.UNSET', async () => {
    mockMeetingManagerCallbackWith()

    await renderHook()

    await actHook(async () => {
      callback(DevicePermissionStatus.UNSET)
    })

    expect(result.current).toEqual(DevicePermissionStatus.UNSET)
    expect(subscribeToDevicePermissionStatusMock).toHaveBeenCalledTimes(1)

    await actHook(async () => {
      await cleanup()
    })

    expect(unsubscribeFromDevicePermissionStatusMock).toHaveBeenCalledTimes(1)
  })
})
