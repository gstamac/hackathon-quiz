import * as auth_utils from './auth_utils'
import * as general_utils from './general_utils'
import * as authentication_api from '../services/api/authentication_api'

import { tokenDataMock } from '../../tests/mocks/token_mock'
import { cleanup } from '../../tests/test_utils'
import { deviceKeyManager } from '../init'
import * as identity_slice from '../store/identity_slice'
import { RedirectOnSignOut } from './interfaces'
import { USE_ADS } from '../constants'

jest.mock('../components/auth/helpers')
jest.mock('../services/api')
jest.mock('../init')
jest.mock('../store')

describe('Auth utils tests', () => {
  const deviceKeyManagerflushMock: jest.Mock = jest.fn()
  const fetchRefreshTokenMock: jest.Mock = jest.fn()
  const addToCurrentTimeMock: jest.Mock = jest.fn()
  const dispatchMock: jest.Mock = jest.fn()
  const setLoggedOutMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (<jest.Mock> deviceKeyManager.flush) = deviceKeyManagerflushMock;
    (<jest.Mock> authentication_api.fetchRefreshToken) = fetchRefreshTokenMock;
    (<jest.Mock> general_utils.addToCurrentTime) = addToCurrentTimeMock;
    (<jest.Mock> identity_slice.setLoggedOut) = setLoggedOutMock
    auth_utils.setAccessToken('')
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  describe('getToken', () => {
    it('should return null if token is not set', () => {
      auth_utils.removeAccessToken()
      expect(auth_utils.getAccessToken()).toBeNull()
    })

    it('should return token if token is set', () => {
      auth_utils.setAccessToken('token')

      expect(auth_utils.getAccessToken()).toEqual('token')
    })
  })

  describe('setToken', () => {
    it('should set assigned token', () => {
      auth_utils.setAccessToken('my_special_token')

      expect(auth_utils.getAccessToken()).toEqual('my_special_token')
    })
  })

  describe('signOut', () => {
    it('should remove token and flush keys', async () => {
      auth_utils.setAccessToken('token')
      auth_utils.setRefreshToken('refresh_token')

      expect(auth_utils.getAccessToken()).toEqual('token')

      await auth_utils.signOut(dispatchMock)

      expect(auth_utils.getAccessToken()).toBeNull()
      expect(auth_utils.getRefreshToken()).toBeNull()

      expect(deviceKeyManagerflushMock).toHaveBeenCalled()
      expect(dispatchMock).toHaveBeenCalled()
      expect(setLoggedOutMock).toHaveBeenCalled()
    })
    it('should be blocked second time when isSigningOut is already true', async () => {
      await auth_utils.signOut(dispatchMock)

      expect(deviceKeyManagerflushMock).not.toHaveBeenCalled()
      expect(dispatchMock).not.toHaveBeenCalled()
      expect(setLoggedOutMock).not.toHaveBeenCalled()
    })

    if (USE_ADS) {
      it('should not call deviceKeyManagerflushMock when redirecting to login', async () => {
        auth_utils.setAccessToken('token')
        auth_utils.setRefreshToken('refresh_token')

        expect(auth_utils.getAccessToken()).toEqual('token')

        await auth_utils.signOut(dispatchMock, RedirectOnSignOut.LOGIN)

        expect(deviceKeyManagerflushMock).not.toHaveBeenCalled()
      })
    }
  })

  describe('rotateToken', () => {
    it('should fetch new token data', async () => {
      auth_utils.setRefreshToken('refresh_token')
      fetchRefreshTokenMock.mockResolvedValue(tokenDataMock)
      addToCurrentTimeMock.mockImplementation(() => 123456)

      await auth_utils.rotateToken()

      expect(auth_utils.getAccessToken()).toEqual(tokenDataMock.access_token)
      expect(auth_utils.getRefreshToken()).toEqual(tokenDataMock.refresh_token)
      expect(auth_utils.getExpiredAt()).toEqual(123456)
    })
  })
})
