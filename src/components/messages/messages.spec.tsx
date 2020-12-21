import React from 'react'
import { foldersResponseMock } from '../../../tests/mocks/channels_mock'

import * as keystore_api from '../../services/api/keystore_api'
import * as helpers from './helpers'
import * as channels_api from '../../services/api/channels_api'

import { cleanup, RenderResult } from '@testing-library/react'
import { render, userEvent, act } from '../../../tests/test_utils'
import { deviceKeyManager } from '../../init'
import { globalIdIdentityMock } from '../../../tests/mocks/identity_mock'
import { createDeviceMock } from '../../../tests/mocks/keystore_mock'
import { keyPair } from '../../../tests/mocks/device_key_manager_mocks'
import { EncryptionStatus } from './interfaces'
import { Messages } from './messages'
import { BASE_MESSAGES_URL } from '../../constants'

jest.mock('../../services/api/channels_api')
jest.mock('./helpers')
jest.mock('../../services/api/keystore_api')

const { statusMatcher } = jest.requireActual('./helpers')

describe('Messages Component', () => {
  let renderResult: RenderResult

  const initDeviceKeyManagerMock: jest.Mock = jest.fn()
  const mockgenerateKeyPair: jest.Mock = jest.fn()
  const mockcreateNewDevice: jest.Mock = jest.fn()
  const mockstoreKey: jest.Mock = jest.fn()
  const handleConsentFromCookieMock: jest.Mock = jest.fn()
  const checkEncryptionAllowedDevicesMock: jest.Mock = jest.fn()
  const getFoldersMock: jest.Mock = jest.fn();

  (deviceKeyManager.init as jest.Mock) = initDeviceKeyManagerMock;
  (deviceKeyManager.generateKeyPair as jest.Mock) = mockgenerateKeyPair;
  (deviceKeyManager.storeKey as jest.Mock) = mockstoreKey;
  (keystore_api.createNewDevice as jest.Mock) = mockcreateNewDevice;
  (helpers.handleConsentFromCookie as jest.Mock) = handleConsentFromCookieMock;
  (helpers.statusMatcher as jest.Mock) = statusMatcher;
  (helpers.checkEncryptionAllowedDevices as jest.Mock) = checkEncryptionAllowedDevicesMock.mockResolvedValue(EncryptionStatus.KEY_MANAGER_INITIALIZED);
  (channels_api.getFolders as jest.Mock) = getFoldersMock.mockResolvedValue(foldersResponseMock)

  const renderComponent = async (): Promise<void> => {
    await act(async () => {
      renderResult = render(<Messages />, {
        historyPath: `${BASE_MESSAGES_URL}/t`,
        path: `${BASE_MESSAGES_URL}/:type?`,
        identity: globalIdIdentityMock,
      })
    })
  }

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render the Messages component and check for devices with enabled e2e encryption', async () => {
    await renderComponent()

    const channels_wrapper: Element | null = renderResult.getByTestId('channels_wrapper')
    const messages_content: Element | null = renderResult.getByTestId('messages_content')

    expect(channels_wrapper).not.toBeNull()
    expect(messages_content).not.toBeNull()
    expect(checkEncryptionAllowedDevicesMock).toHaveBeenCalled()
  })

  it('Should call polling function when user clicks a button for enabling e2e encryption', async () => {
    await renderComponent()

    mockcreateNewDevice.mockResolvedValue(createDeviceMock)
    mockgenerateKeyPair.mockResolvedValue(keyPair)

    const enable_button: Element = renderResult.getByText('Enable')

    await act(async () => {
      userEvent.click(enable_button)
    })

    expect(handleConsentFromCookieMock).toHaveBeenCalled()
  })
})
