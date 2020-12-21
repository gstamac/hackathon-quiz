import React from 'react'
import { cleanup } from '@testing-library/react'
import { RenderResult, render, userEvent } from '../../../tests/test_utils'
import { act } from 'react-dom/test-utils'
import { getString } from '../../utils/general_utils'
import { store } from '../../store'
import { publicIdentityMock, globalIdIdentityMock } from '../../../tests/mocks/identity_mock'
import { E2eEncryption } from '.'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { removeIdentity } from '../../store/identity_slice'
import * as keystoreApi from '../../services/api/keystore_api'
import { deviceKeyManager } from '../../init'
import { EncryptionStatus } from '../messages/interfaces'
import { keyPair } from '../../../tests/mocks/device_key_manager_mocks'
import { createDeviceMock } from '../../../tests/mocks/keystore_mock'

jest.mock('../../app')

describe('E2E Encryption', () => {
  let renderResult: RenderResult
  let mockgenerateKeyPair: jest.Mock
  let mockgstoreKey: jest.Mock
  let mockcreateNewDevice: jest.Mock
  const mockSetEcryptionStatus: jest.Mock = jest.fn()

  const renderContent = async (identity: PublicIdentity, encryptionStatus: EncryptionStatus): Promise<void> => {
    await act(async () => {
      renderResult = render(<E2eEncryption encryptionStatus={encryptionStatus} setEncryptionStatus={mockSetEcryptionStatus}/>, { identity })
    })
  }

  beforeEach(() => {
    mockgenerateKeyPair = jest.fn()
    mockcreateNewDevice = jest.fn()
    mockgstoreKey = jest.fn();

    (deviceKeyManager.generateKeyPair as jest.Mock) = mockgenerateKeyPair;
    (deviceKeyManager.storeKey as jest.Mock) = mockgstoreKey;
    (keystoreApi.createNewDevice as jest.Mock) = mockcreateNewDevice
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
    store.dispatch(removeIdentity())
  })

  it('Should render the upgrade your account landing page when user is logged in with web client', async () => {
    await renderContent(publicIdentityMock, EncryptionStatus.DISABLED)

    const landingPage: Element = renderResult.getByTestId('e2e_encryption_upgrade')
    const backgroundIcon: Element = renderResult.getByAltText('e2e_encryption_upgrade')
    const title: Element = renderResult.getByText(getString('e2e-encryption-wc-title'))
    const description: Element = renderResult.getByText(getString('e2e-encryption-wc-description').replace('</br>', ''))
    const scanIcon: Element = renderResult.getByAltText('Scan to Download app')

    expect(landingPage).not.toBeNull()
    expect(backgroundIcon).not.toBeNull()
    expect(title).not.toBeNull()
    expect(description).not.toBeNull()
    expect(scanIcon).not.toBeNull()
  })

  it('Should render enable e2e encryption landing page when user is logged in with GlobaliD app', async () => {
    await renderContent(globalIdIdentityMock, EncryptionStatus.DISABLED)

    const landingPage: Element = renderResult.getByTestId('e2e_encryption_enable')
    const backgroundIcon: Element = renderResult.getByAltText('e2e_encryption_enable')
    const title: Element = renderResult.getByText(getString('e2e-encryption-title'))
    const button: Element = renderResult.getByRole('button')

    expect(landingPage).not.toBeNull()
    expect(backgroundIcon).not.toBeNull()
    expect(title).not.toBeNull()
    expect(button).not.toBeNull()
  })

  it('Should render spinner when device_key_manager is still not initialized', async () => {
    await renderContent(globalIdIdentityMock, EncryptionStatus.PENDING)

    const spinner: Element = renderResult.getByTestId('messages')

    expect(spinner).not.toBeNull()
  })

  it('Should call all the functions needed to create a consent and store the keys when user enables e2e encryption', async () => {
    mockcreateNewDevice.mockResolvedValue(createDeviceMock)

    mockgenerateKeyPair.mockResolvedValue(keyPair)

    await renderContent(globalIdIdentityMock, EncryptionStatus.DISABLED)

    const button: Element = renderResult.getByRole('button')

    expect(button).not.toBeNull()

    await act(async () => {
      userEvent.click(button)
    })

    expect(mockgstoreKey).toHaveBeenCalled()
    expect(mockSetEcryptionStatus).toHaveBeenCalled()
  })

  it('Should render resend notification request for enabling e2e encryption', async () => {
    mockcreateNewDevice.mockResolvedValue(createDeviceMock)

    mockgenerateKeyPair.mockResolvedValue(keyPair)

    await renderContent(globalIdIdentityMock, EncryptionStatus.POLLING)

    const landingPage: Element = renderResult.getByTestId('e2e_encryption_accepted')

    const button: Element = renderResult.getByText(getString('e2e-encryption-resend-request-action'))

    await act(async () => {
      userEvent.click(button)
    })

    expect(mockgstoreKey).toHaveBeenCalled()
    expect(mockSetEcryptionStatus).toHaveBeenCalled()
    expect(landingPage).not.toBeNull()
  })

  it('Should show again the enable e2e encryption when enabling e2e encryption fails', async () => {
    mockcreateNewDevice.mockResolvedValue(createDeviceMock)

    mockgenerateKeyPair.mockRejectedValue(new Error())

    await renderContent(globalIdIdentityMock, EncryptionStatus.DISABLED)

    const button: Element = renderResult.getByRole('button')

    expect(button).not.toBeNull()

    await act(async () => {
      userEvent.click(button)
    })

    const landingPage: Element = renderResult.getByTestId('e2e_encryption_enable')

    expect(landingPage).not.toBeNull()
  })
})
