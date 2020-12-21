import React from 'react'
import { render, act, RenderResult, cleanup, mockComponentWithChildren } from '../../../../tests/test_utils'
import { DevicePermissionPrompt } from './device_permission_prompt'
import * as useDevicePermissionStatus from '../hooks/use_device_permission_status'
import { DevicePermissionStatus } from '../enums'

jest.mock('../hooks/use_device_permission_status')

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  Modal: mockComponentWithChildren('Modal'),
  ModalBody: mockComponentWithChildren('ModalBody'),
  ModalHeader: mockComponentWithChildren('ModalHeader'),
}))

describe('DevicePermissionPrompt tests', () => {
  let renderResult: RenderResult
  const useDevicePermissionStatusMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (useDevicePermissionStatus.useDevicePermissionStatus as jest.Mock) = useDevicePermissionStatusMock
  })

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  const renderComponent = async (): Promise<void> => {
    await act(async () => {
      renderResult = render(<DevicePermissionPrompt/>)
    })
  }

  it('should render DevicePermissionPrompt component', async () => {
    useDevicePermissionStatusMock.mockReturnValue(DevicePermissionStatus.IN_PROGRESS)

    await renderComponent()

    const modalElement: Element = renderResult.getByTestId('Modal')
    const modalHeaderElement: Element = renderResult.getByTestId('ModalHeader')
    const modalBodyElement: Element = renderResult.getByTestId('ModalBody')

    expect(modalElement).toBeDefined()
    expect(modalHeaderElement).toBeDefined()
    expect(modalBodyElement).toBeDefined()
  })

  it('should render null when provided permission is not in progress', async () => {
    useDevicePermissionStatusMock.mockReturnValue('')

    await renderComponent()

    expect(renderResult.container.firstChild).toBeNull()
  })
})
