import * as api from './authentication_api'
import { SCOPE, REDIRECT_URI, CLIENT_ID, CODE_CHALLENGE_METHOD } from '../../constants'
import * as gidCrypto from 'globalid-crypto'
import { deviceKeyManager } from '../../init'
import { privateKeyMock, publicKeyPEMMock } from '../../../tests/mocks/device_key_manager_mocks'
import axios from 'axios'

jest.mock('globalid-crypto')
jest.mock('../../init')
jest.mock('axios')

describe('Authentication api tests', () => {

  const randomBytesMock: jest.Mock = jest.fn()
  const generateKeyPairMock: jest.Mock = jest.fn()
  const axiosGetMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (<jest.Mock> gidCrypto.util.randomBytes) = randomBytesMock;
    (<jest.Mock> deviceKeyManager.generateKeyPair) = generateKeyPairMock;
    (<jest.Mock> axios.get) = axiosGetMock
  })

  describe('getAuthenticationParams', () => {

    it('should return correct authentication parameters', async () => {
      const publicKey: string ='publicKey'

      randomBytesMock.mockReturnValue(Buffer.from('test'))

      expect(await api.getAuthenticationParams(publicKey)).toEqual({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: SCOPE,
        code_challenge: expect.any(String),
        code_challenge_method: CODE_CHALLENGE_METHOD,
        response_type: api.ResponseTypes.code,
        device_public_key: encodeURIComponent(publicKey),
      })
    })
  })

  describe('createAuthenticationRequestWithArgs', () => {
    it('should create auth request with public key', async () => {
      randomBytesMock.mockReturnValue(Buffer.from('test'))
      generateKeyPairMock.mockResolvedValue({
        privateKey: privateKeyMock,
        publicKey: publicKeyPEMMock,
      })

      axiosGetMock.mockResolvedValue({
        data: {
          authentication_request: 'authentication_request',
        },
      })

      expect(await api.createAuthenticationRequestWithArgs()).toEqual('authentication_request')
      expect(axiosGetMock).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/v1/oauth2/auth`, {
        params: {
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          scope: SCOPE,
          code_challenge: expect.any(String),
          code_challenge_method: CODE_CHALLENGE_METHOD,
          response_type: api.ResponseTypes.code,
          device_public_key: encodeURIComponent(publicKeyPEMMock),
        },
        headers: api.headers,
      })
    })
  })
})
