import { AxiosError } from 'axios'
import crypto from 'crypto'

import * as utils from '../../utils'
import * as api from '../../services/api'
import { store } from '../../store/store'
import {
  getTokenDataFromHash,
  handleAuthentication,
  handleIdentityVisit,
  getAuthCodeAndDeviceIdFromQueryParameter, generateCodeChallenge, validateToken, getValidToken, retrieveMyIdentity,
} from './helpers'
import { publicIdentityMock, tokenValid, expiresAtValid } from '../../../tests/mocks/identity_mock'
import { RedirectOnSignOut } from '../../utils/interfaces'
import { deviceKeyManager } from '../../init'
import { util } from 'globalid-crypto'

jest.mock('../../utils')
jest.mock('../../services/api')
jest.mock('crypto')
jest.mock('../../init')

const getCreateHashMock = (mockHash: string): {
  update: () => {
      digest: () => string
  }
} => ({
  update: function () {
    return {
      digest: function () {
        return mockHash
      },
    }
  },
})

describe('Auth helpers tests', () => {
  const getAccesTokenMock: jest.Mock = jest.fn()
  const getExpiredAtMock: jest.Mock = jest.fn()
  const getVisitedMock: jest.Mock = jest.fn().mockReturnValue('test')
  const setVisitedMock: jest.Mock = jest.fn()
  const createHashMock: jest.Mock = jest.fn().mockReturnValue(getCreateHashMock('test'))
  const deviceKeyManagerflushMock: jest.Mock = jest.fn()
  const setCodeVerifierMock: jest.Mock = jest.fn()
  const randomBytesMock: jest.Mock = jest.fn()
  const rotateTokenMock: jest.Mock = jest.fn().mockResolvedValueOnce('token.refresh_token')
  const signoutMock: jest.Mock = jest.fn()
  const getRefreshTokenMock: jest.Mock = jest.fn()
  const getMyIdentityMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (<jest.Mock> utils.getAccessToken) = getAccesTokenMock;
    (<jest.Mock> utils.getExpiredAt) = getExpiredAtMock;
    (<jest.Mock> utils.getVisited) = getVisitedMock;
    (<jest.Mock> utils.setVisited) = setVisitedMock;
    (<jest.Mock> crypto.createHash) = createHashMock;
    (<jest.Mock> deviceKeyManager.flush) = deviceKeyManagerflushMock;
    (<jest.Mock> utils.setCodeVerifier) = setCodeVerifierMock;
    (<jest.Mock> util.randomBytes) = randomBytesMock;
    (<jest.Mock> utils.rotateToken) = rotateTokenMock;
    (<jest.Mock> utils.getRefreshToken) = getRefreshTokenMock;
    (<jest.Mock> utils.signOut) = signoutMock;
    (<jest.Mock> api.getMyIdentity) = getMyIdentityMock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getTokenFromHash', () => {
    it('should return null when there is no token in the query string', () => {
      expect(getTokenDataFromHash('#test=notatoken&expires_in=7200&state=corona')).toBeNull()
    })

    it('should return null when there is no expires_in in the query string', () => {
      expect(getTokenDataFromHash('#test=notatoken&expires=7200&state=corona')).toBeNull()
    })

    it('should return token when token is in the query string', () => {
      expect(getTokenDataFromHash('#token=token&expires_in=7200&state=corona')).toEqual({
        token: 'token',
        expiresIn: 7200,
      })
    })

    it('should return token when token is in middle the query string', () => {
      expect(getTokenDataFromHash('#something=something&token=token&expires_in=7200&state=corona')).toEqual({
        token: 'token',
        expiresIn: 7200,
      })
    })
  })

  describe('validateToken', () => {
    it('should return true when cookie contains valid token', async () => {
      getAccesTokenMock.mockReturnValue('mock.valid-token')
      getExpiredAtMock.mockReturnValue(expiresAtValid)

      const isValidToken: boolean = await validateToken()

      expect(isValidToken).toEqual(true)
    })

    it('should call tryRotateToken when force flag is passed', async () => {
      getAccesTokenMock.mockReturnValue('mock.valid-token')
      getExpiredAtMock.mockReturnValue(expiresAtValid)

      await validateToken(true)

      expect(rotateTokenMock).toHaveBeenCalled()
    })

    it('should return false when cookie does contain token', async () => {
      getAccesTokenMock.mockReturnValue(null)
      getRefreshTokenMock.mockReturnValue(null)
      const isValidToken: boolean = await validateToken()

      expect(isValidToken).toEqual(false)
    })

    it('should return false when cookie doesn\'t contain expiredAt', async () => {
      getExpiredAtMock.mockReturnValue(undefined)
      const isValidToken: boolean = await validateToken()

      expect(isValidToken).toEqual(false)
    })

    it('should call rotateToken when token is not valid', async () => {
      getAccesTokenMock.mockReturnValue('invalid-token')
      getExpiredAtMock.mockReturnValue(expiresAtValid)
      await validateToken()

      expect(rotateTokenMock).toHaveBeenCalled()
    })

    it('should return false when cookie doesn\'t contain valid token and rotateToken returns undefined', async () => {
      getAccesTokenMock.mockReturnValue('invalid-token')
      rotateTokenMock.mockResolvedValueOnce(undefined)
      const isValidToken: boolean = await validateToken()

      expect(isValidToken).toEqual(false)
    })

    it('should return false when token expired and rotateToken returns undefined', async () => {
      getAccesTokenMock.mockReturnValue('mock.valid-token')
      rotateTokenMock.mockResolvedValueOnce(undefined)
      getExpiredAtMock.mockReturnValue(0)

      const isValidToken: boolean = await validateToken()

      expect(isValidToken).toEqual(false)
    })

    it('should return false when rotateToken fails', async () => {
      getAccesTokenMock.mockReturnValue('invalid-token')
      getExpiredAtMock.mockReturnValue(expiresAtValid)
      rotateTokenMock.mockRejectedValueOnce('error')
      const isValid: boolean = await validateToken()

      expect(isValid).toBe(false)
    })
  })

  describe('handleAuthentication', () => {
    beforeEach(() => {
      (<jest.Mock> utils.getAccessToken) = getAccesTokenMock
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should call get identity function when the identity object is empty', async () => {
      getAccesTokenMock.mockReturnValue(tokenValid)
      getExpiredAtMock.mockReturnValue(expiresAtValid)
      getMyIdentityMock.mockResolvedValue(publicIdentityMock)

      await handleAuthentication(RedirectOnSignOut.LANDING_PAGE)

      expect(getMyIdentityMock).toHaveBeenCalled()
    })

    it('should not call getIdentity function when the identity object is not empty', async () => {
      getAccesTokenMock.mockReturnValue(tokenValid)
      await handleAuthentication(RedirectOnSignOut.LANDING_PAGE, publicIdentityMock)

      expect(getMyIdentityMock).not.toHaveBeenCalled()
    })
  })

  describe('handleIdentityVisit', () => {
    it('should not set cookie for visited if identity gid_name hash has been found in cookie', async () => {
      await handleIdentityVisit(publicIdentityMock)

      expect(setVisitedMock).not.toHaveBeenCalled()
    })

    it('should set cookie for visited if identity gid_name hash has not been found in cookie and should flush keys', async () => {
      (<jest.Mock> crypto.createHash) = jest.fn().mockReturnValue(getCreateHashMock('test2'))

      await handleIdentityVisit(publicIdentityMock)

      expect(setVisitedMock).toHaveBeenCalledWith('test2')

      const hasVisited: boolean = store.getState().identity.hasVisited

      expect(hasVisited).toBe(false)

      expect(deviceKeyManagerflushMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getAuthCodeAndDeviceIdFromQueryParameter', () => {
    it('should return null when there is no authorization code in the query string', () => {
      expect(getAuthCodeAndDeviceIdFromQueryParameter('?test=notatoken&state=corona')).toBeNull()
    })

    it('should return authorization code when authorization code is in the query string', () => {
      expect(getAuthCodeAndDeviceIdFromQueryParameter('?code=authorization_code&state=corona')).toEqual({
        authorizationCode: 'authorization_code',
        deviceId: undefined,
      })
    })

    it('should return authorization code when authorization_code is in middle the query string', () => {
      expect(getAuthCodeAndDeviceIdFromQueryParameter('?something=something&code=authorization_code&state=corona')).toEqual({
        authorizationCode: 'authorization_code',
        deviceId: undefined,
      })
    })

    it('should return authorization code when device_id is in the query string', () => {
      expect(getAuthCodeAndDeviceIdFromQueryParameter('?something=something&code=authorization_code&state=corona&device_id=device_id')).toEqual({
        authorizationCode: 'authorization_code',
        deviceId: 'device_id',
      })
    })
  })
  describe('generateCodeChallenge', () => {
    randomBytesMock.mockImplementation(() => 'random_string')
    beforeEach(async () => {
      await generateCodeChallenge()
    })

    it('should set code verifier cookie', () => {
      expect(setCodeVerifierMock).toHaveBeenCalled()
    })

  })
  describe('getValidToken', () => {
    it('should return token if its valid', async () => {
      getAccesTokenMock.mockReturnValue(tokenValid)
      getExpiredAtMock.mockReturnValue(expiresAtValid)
      expect(await getValidToken()).toEqual(tokenValid)
    })

    it('shouldn\'t refresh page if token is invalid', async () => {
      const location: Location = window.location

      delete window.location
      window.location = {
        ...location,
        reload: jest.fn(),
      }
      getExpiredAtMock.mockReturnValue(expiresAtValid)
      getAccesTokenMock.mockReturnValue('')

      await getValidToken()
      expect(window.location.reload).not.toHaveBeenCalledWith()
    })

    it('should sign out user if rotate token fails', async () => {
      getAccesTokenMock.mockReturnValue(null)
      rotateTokenMock.mockRejectedValueOnce('')
      await getValidToken()
      expect(signoutMock).toHaveBeenCalled()
    })
  })

  describe('retrieveMyIdentity', () => {
    it('should return public identity', async () => {
      expect(await retrieveMyIdentity()).toBe(publicIdentityMock)
    })
    it('should not call signOut when there is a normal error', async () => {
      getMyIdentityMock.mockRejectedValue(new Error('test_error'))
      await retrieveMyIdentity()
      expect(signoutMock).not.toHaveBeenCalled()
    })
    it('should call signOut when there is a network error and 401 or 400 status', async () => {
      const networkError: Partial<AxiosError> = {
        isAxiosError: true,
        response: {
          status: 401,
        },
      }

      getMyIdentityMock.mockRejectedValue(networkError)
      await retrieveMyIdentity()
      getMyIdentityMock.mockRejectedValue({
        ...networkError,
        response: {
          status: 400,
        },
      })
      await retrieveMyIdentity()
      expect(signoutMock).toHaveBeenCalledTimes(2)
    })
  })
})

