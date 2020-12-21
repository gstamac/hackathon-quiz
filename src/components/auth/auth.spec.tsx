import React from 'react'

import * as utils from '../../utils'

import * as helpers from './helpers'

import { RenderResult, act, render, cleanup } from '../../../tests/test_utils'
import { Auth } from './auth'
import { history, store } from '../../store'
import { RedirectOnSignOut } from '../../utils/interfaces'

jest.mock('../../utils')
jest.mock('./helpers')
jest.mock('../../init')

describe('Auth tests', () => {

  let renderResult: RenderResult

  const validateCredentialsMock: jest.Mock = jest.fn()
  const resolveIdentityAndRedirectMock: jest.Mock = jest.fn()
  const signOutMock: jest.Mock = jest.fn()

  const getAuthCodeAndDeviceIdFromQueryParameter: jest.Mock = jest.fn()
  const registerDeviceId: jest.Mock = jest.fn()
  const getAnyCodeVerifierMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (helpers.validateCredentials as jest.Mock) = validateCredentialsMock;
    (helpers.resolveIdentityAndRedirect as jest.Mock) = resolveIdentityAndRedirectMock;
    (utils.signOut as jest.Mock) = signOutMock;
    (helpers.getAuthCodeAndDeviceIdFromQueryParameter as jest.Mock) = getAuthCodeAndDeviceIdFromQueryParameter;
    (helpers.registerDeviceId as jest.Mock) = registerDeviceId;
    (utils.getAnyCodeVerifier as jest.Mock) = getAnyCodeVerifierMock
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  const renderAuth = async (): Promise<void> => {
    await act(async () => {
      renderResult = render(<Auth />)
    })
  }

  it('should call registerDeviceId', async () => {
    await renderAuth()

    expect(registerDeviceId).toHaveBeenCalledTimes(1)
  })

  const expectADSCalls: number = 1

  it('should render loading when auth code is present without device_id and user is not logged in', async () => {
    getAuthCodeAndDeviceIdFromQueryParameter.mockReturnValue({
      authorizationCode: 'authorization_code',
    })
    getAnyCodeVerifierMock.mockReturnValue('code_verifier')

    validateCredentialsMock.mockResolvedValue(false)

    await renderAuth()

    const loadingSplashScreen: HTMLElement = renderResult.getByTestId('loading-splash-screen')

    expect(signOutMock).toHaveBeenCalledTimes(1)
    expect(signOutMock).toHaveBeenCalledWith(store.dispatch, RedirectOnSignOut.LOGIN)

    expect(registerDeviceId).toHaveBeenCalledTimes(expectADSCalls)

    expect(registerDeviceId).toHaveBeenCalledWith(undefined)

    expect(loadingSplashScreen).not.toBeNull()
  })

  it('should render loading when token is present and user is not logged in', async () => {
    getAuthCodeAndDeviceIdFromQueryParameter.mockReturnValue({
      authorizationCode: 'authorization_code',
      deviceId: 'device_id',
    })
    getAnyCodeVerifierMock.mockReturnValue('code_verifier')

    validateCredentialsMock.mockResolvedValue(false)

    await renderAuth()

    const loadingSplashScreen: HTMLElement = renderResult.getByTestId('loading-splash-screen')

    expect(signOutMock).toHaveBeenCalledTimes(1)
    expect(signOutMock).toHaveBeenCalledWith(store.dispatch, RedirectOnSignOut.LOGIN)

    expect(registerDeviceId).toHaveBeenCalledTimes(expectADSCalls)

    expect(registerDeviceId).toHaveBeenCalledWith('device_id')

    expect(loadingSplashScreen).not.toBeNull()
  })

  it('should call signOut when credentials are not valid', async () => {
    validateCredentialsMock.mockResolvedValue(false)

    await renderAuth()

    expect(signOutMock).toHaveBeenCalledTimes(1)
    expect(signOutMock).toHaveBeenCalledWith(store.dispatch, RedirectOnSignOut.LOGIN)
  })

  it('should call resolveIdentityAndRedirect when credentials are valid', async () => {
    validateCredentialsMock.mockResolvedValue(true)

    await renderAuth()

    expect(resolveIdentityAndRedirectMock).toHaveBeenCalledTimes(1)
    expect(resolveIdentityAndRedirectMock).toHaveBeenCalledWith(history)
  })
})
