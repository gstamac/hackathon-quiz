import { channelSecretMock, publicKeyPEMBufferMock, encryptedChannelSecretBufferMock, encodedChannelSecretMock } from './../../../tests/mocks/device_key_manager_mocks'
import { DeviceKeyManagerErrors } from './interfaces'
import * as device_key_helpers from './helpers'
import { getRandomValuesMock, importKeyMock, encryptMock } from '../../../tests/jest_extend'
import { publicKeyPEMMock, privateKeyPEMMock, privateKeyPEMBufferMock , encryptedChannelSecretMock} from '../../../tests/mocks/device_key_manager_mocks'
import { util } from 'globalid-crypto'

jest.mock('globalid-crypto')

describe('Helper tests', () => {

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Should convert from base64 to bytes and vice versa', () => {
    const simpleText: string = 'Hello World!'

    const convertedBytes: Uint8Array = device_key_helpers.base64ToBytes(simpleText)

    expect(convertedBytes).toBeDefined()
    const expectedBytes = Uint8Array.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])

    expect(convertedBytes).toEqual(expectedBytes)

    const convertedBase64: string = device_key_helpers.bytesToBase64(convertedBytes)

    expect(convertedBase64).toBeDefined()
    expect(atob(convertedBase64)).toBe(simpleText)
  })

  it('Should encode and decode', () => {
    const text: string = 'test'

    const encoded: Uint8Array = device_key_helpers.getEncodedData(text)
    const expectedEncode: Uint8Array = Uint8Array.from([116, 101, 115, 116])

    expect(encoded).toEqual(expectedEncode)

    const decoded: string = device_key_helpers.getDecodedData(encoded)

    expect(decoded).toBe(text)
  })

  it('Should convert from hex string to bytes and vice versa', () => {
    const hexString: string = '68656c6c6f20776f726c64'

    const bytes: Uint8Array = device_key_helpers.hexToBytes(hexString)

    expect(bytes).toBeDefined()
    const expectedBytes: Uint8Array = Uint8Array.from([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100])

    expect(bytes).toEqual(expectedBytes)

    const hex: string = device_key_helpers.bytesToHex(bytes)

    expect(hex).toBeDefined()
    expect(hex).toBe(hexString)
  })

  it('Should generate Uint8Array with random values', () => {
    const byteNumber: number = 5
    const mockRandom: Uint8Array = (new Uint8Array(byteNumber)).map(() => Math.floor(Math.random() * 100))

    getRandomValuesMock.mockReturnValue(mockRandom)

    const bytes: Uint8Array = device_key_helpers.randomBytes(byteNumber)

    expect(bytes).toBeDefined()
    bytes.forEach((value: number) => {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(99)
    })
  })

  describe('Importing keys', () => {
    const mockCriptoKey: CryptoKey = {
      algorithm: { 'name': 'SHA-256' },
      extractable: true,
      type: 'public',
      usages: ['encrypt', 'decrypt'],
    }

    beforeEach(() => {
      importKeyMock.mockResolvedValue(mockCriptoKey)
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('Should import channel secret to crypto', async () => {
      const channelSecret: string = 'secret'

      const retrievedCryptoKey: CryptoKey = await device_key_helpers.importChannelSecret(channelSecret)

      expect(retrievedCryptoKey).toBe(mockCriptoKey)

      expect(importKeyMock.mock.calls).toHaveLength(1)
      expect(importKeyMock.mock.calls[0][0]).toBe('raw')
      expect(importKeyMock.mock.calls[0][1]).toBeDefined()
      expect(importKeyMock.mock.calls[0][2]).toMatchObject({'length': 256, 'name': 'AES-CBC'})
      expect(importKeyMock.mock.calls[0][3]).toBe(false)
      expect(importKeyMock.mock.calls[0][4][0]).toBe('encrypt')
      expect(importKeyMock.mock.calls[0][4][1]).toBe('decrypt')
    })
  })

  describe('Extracting keys', () => {
    const mockCriptoKey: CryptoKey = {
      algorithm: { 'name': 'SHA-256' },
      extractable: true,
      type: 'public',
      usages: ['encrypt', 'decrypt'],
    }

    const cryptoUtilIsPem: jest.Mock = jest.fn()
    const cryptoUtilConvertPemToBinary: jest.Mock = jest.fn()
    const cryptoUtilArrayBufferToBase64: jest.Mock = jest.fn()
    const cryptoUtilStringToBuffer: jest.Mock = jest.fn()

    beforeEach(() => {
      (<jest.Mock> util.isPemKey) = cryptoUtilIsPem;
      (<jest.Mock> util.convertPemToBinary) = cryptoUtilConvertPemToBinary;
      (<jest.Mock> util.arrayBufferToBase64) = cryptoUtilArrayBufferToBase64;
      (<jest.Mock> util.stringToBuffer) = cryptoUtilStringToBuffer
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    describe('toUnextractable', () => {

      it('Should make private key unextractable and export crypto key', async () => {
        cryptoUtilIsPem.mockReturnValue(true)
        importKeyMock.mockResolvedValue(mockCriptoKey)
        cryptoUtilConvertPemToBinary.mockReturnValue(privateKeyPEMBufferMock)
        const key: CryptoKey = await device_key_helpers.toUnextractable(privateKeyPEMMock)

        expect(key).toBe(mockCriptoKey)
      })

      it('Should throw error when private key is not pem format', async () => {
        cryptoUtilIsPem.mockReturnValue(false)
        await expect(
          device_key_helpers.toUnextractable(privateKeyPEMMock)
        ).rejects.toThrow(DeviceKeyManagerErrors.INVALID_KEY)
      })
    })

    describe('encryptRSAWithPublicKey', () => {

      it('Should encrypt secret with provided public key', async () => {
        cryptoUtilIsPem.mockReturnValue(true)
        importKeyMock.mockResolvedValue(mockCriptoKey)
        encryptMock.mockResolvedValue(encryptedChannelSecretBufferMock)
        cryptoUtilConvertPemToBinary.mockReturnValue(publicKeyPEMBufferMock)
        cryptoUtilArrayBufferToBase64.mockReturnValue(encryptedChannelSecretMock)
        cryptoUtilStringToBuffer.mockReturnValue(encodedChannelSecretMock)
        const encrypted_secret: string
         = await device_key_helpers.encryptRSAWithPublicKey(publicKeyPEMMock, channelSecretMock)

        expect(encrypted_secret).toBe(encryptedChannelSecretMock)
      })

      it('Should throw error when private key is not pem format', async () => {
        cryptoUtilIsPem.mockReturnValue(false)
        await expect(
          device_key_helpers.encryptRSAWithPublicKey(publicKeyPEMMock, channelSecretMock)
        ).rejects.toThrow(DeviceKeyManagerErrors.INVALID_KEY)
      })
    })
  })
})
