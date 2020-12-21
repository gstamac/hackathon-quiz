import { rsa, util } from 'globalid-crypto'
import { decryptMock, encryptMock, getRandomValuesMock } from '../../../tests/jest_extend'
import * as mocks from '../../../tests/mocks/device_key_manager_mocks'
import { AES_SECRET_SIZE } from '../../constants'
import * as index_db from '../index_db'
import { RSA_KEY_SIZE } from './../../constants'
import * as device_key_manager from './device_key_manager'
import * as helpers from './helpers'
import { DeviceKeyManagerErrors, DeviceKeyPair, IDeviceKeyManager } from './interfaces'

jest.mock('./helpers')
jest.mock('../index_db')
jest.mock('globalid-crypto')

describe('Device key manager tests', () => {

  const deviceId: string = 'deviceId'

  const toUnextractableMock: jest.Mock = jest.fn()
  const getEncodedDataMock: jest.Mock = jest.fn()
  const bytesToBase64Mock: jest.Mock = jest.fn()
  const importChannelSecretMock: jest.Mock = jest.fn()
  const bytesToHexMock: jest.Mock = jest.fn()
  const hexToBytesMock: jest.Mock = jest.fn()
  const randomBytesMock: jest.Mock = jest.fn()
  const getDecodedDataMock: jest.Mock = jest.fn()
  const getEncryptRSAWithPublicKey: jest.Mock = jest.fn()

  const cryptoRSAgenerateKeysMock: jest.Mock = jest.fn()
  const cryptoUtilBase64StringToArrayBuffer: jest.Mock = jest.fn()
  const cryptoUtilBufferToString: jest.Mock = jest.fn()

  const getDeviceKeyMock: jest.Mock = jest.fn()
  const setDeviceKeyMock: jest.Mock = jest.fn()
  const enableEncryptionDBData: jest.Mock = jest.fn()
  const clearDeviceKeyMock: jest.Mock = jest.fn()

  const getDeviceIdMock: jest.Mock = jest.fn()
  const setDeviceIdMock: jest.Mock = jest.fn()
  const clearDeviceIdMock: jest.Mock = jest.fn()

  const mockDecryptSecret = (): void => {
    cryptoUtilBase64StringToArrayBuffer.mockReturnValue(mocks.encryptedChannelSecretBufferMock)
    cryptoUtilBufferToString.mockReturnValue(mocks.decryptedMock)
    decryptMock.mockResolvedValue(mocks.decryptedBufferMock)
  }

  beforeAll(() => {
    (<jest.Mock> helpers.toUnextractable) = toUnextractableMock;
    (<jest.Mock> helpers.getEncodedData) = getEncodedDataMock;
    (<jest.Mock> helpers.bytesToBase64) = bytesToBase64Mock;
    (<jest.Mock> helpers.importChannelSecret) = importChannelSecretMock;
    (<jest.Mock> helpers.bytesToHex) = bytesToHexMock;
    (<jest.Mock> helpers.hexToBytes) = hexToBytesMock;
    (<jest.Mock> helpers.randomBytes) = randomBytesMock;
    (<jest.Mock> helpers.getDecodedData) = getDecodedDataMock;
    (<jest.Mock> helpers.encryptRSAWithPublicKey) = getEncryptRSAWithPublicKey;

    (<jest.Mock> index_db.getDeviceKey) = getDeviceKeyMock;
    (<jest.Mock> index_db.setDeviceKey) = setDeviceKeyMock;
    (<jest.Mock> index_db.enableEncryptionDBData) = enableEncryptionDBData;
    (<jest.Mock> index_db.clearDeviceKey) = clearDeviceKeyMock;

    (<jest.Mock> index_db.getDeviceId) = getDeviceIdMock;
    (<jest.Mock> index_db.setDeviceId) = setDeviceIdMock;
    (<jest.Mock> index_db.clearDeviceId) = clearDeviceIdMock;

    (<jest.Mock> rsa.generateKeyPair) = cryptoRSAgenerateKeysMock;
    (<jest.Mock> util.base64StringToArrayBuffer) = cryptoUtilBase64StringToArrayBuffer;
    (<jest.Mock> util.bufferToString) = cryptoUtilBufferToString
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('flush', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeEach(() => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()
    })

    it('should remove device id after flush', async () => {
      setDeviceKeyMock.mockResolvedValue(undefined)
      clearDeviceKeyMock.mockResolvedValue(undefined)

      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      expect(deviceKeyManager.getDeviceId()).toEqual(deviceId)

      await deviceKeyManager.flush()

      expect(deviceKeyManager.getDeviceId()).toBeUndefined()
    })
  })

  describe('generateKeyPair', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeAll(() => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should generate key pair and return public and private key', async () => {
      toUnextractableMock.mockResolvedValue(mocks.privateKeyUnextractableMock)

      cryptoRSAgenerateKeysMock.mockResolvedValue({
        privateKey: mocks.privateKeyPEMMock,
        publicKey: mocks.publicKeyPEMMock,
      })

      const response: DeviceKeyPair = {
        privateKey: mocks.privateKeyUnextractableMock,
        publicKey: mocks.publicKeyPEMMock,
      }

      expect(await deviceKeyManager.generateKeyPair()).toEqual(response)

      expect(cryptoRSAgenerateKeysMock).toHaveBeenCalledTimes(1)
      expect(cryptoRSAgenerateKeysMock).toHaveBeenCalledWith(RSA_KEY_SIZE)

      expect(toUnextractableMock).toHaveBeenCalledTimes(1)
      expect(toUnextractableMock).toHaveBeenCalledWith(mocks.privateKeyPEMMock)
    })

    it('should throw error when one function rejects', async () => {
      cryptoRSAgenerateKeysMock.mockRejectedValue(new Error())

      await expect(
        deviceKeyManager.generateKeyPair()
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_GENERATE_KEY_PAIR_FAILURE)
    })
  })

  describe('storeKey', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeEach(() => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()
    })

    it('should store private key and set deviceId', async () => {
      setDeviceKeyMock.mockResolvedValue(undefined)

      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      expect(setDeviceKeyMock).toHaveBeenCalledTimes(1)
      expect(setDeviceKeyMock).toHaveBeenCalledWith(deviceId, {
        privateKey: mocks.privateKeyUnextractableMock, encryption: index_db.KeyStatus.DISABLED,
      })

      expect(setDeviceIdMock).toHaveBeenCalledTimes(1)
      expect(setDeviceIdMock).toHaveBeenCalledWith(deviceId, deviceId)

      expect(deviceKeyManager.getDeviceId()).toEqual(deviceId)
    })

    it('should throw error when write to indexdb fails', async () => {
      setDeviceKeyMock.mockRejectedValue(new Error())

      await expect(
        deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_STORE_DEVICE_PRIVATE_KEY_FAILURE)

      expect(deviceKeyManager.getDeviceId()).toBeUndefined()
    })
  })

  describe('getDevicePrivateKey', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeAll(() => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()
    })

    it('should throw error when device id is not defined', async () => {
      await expect(
        deviceKeyManager.getDevicePrivateKey()
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_DEVICE_NOT_E2E_ENABLED)
    })

    it('should get device private key from indexDB', async () => {
      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      getDeviceKeyMock.mockResolvedValue({
        privateKey: mocks.privateKeyUnextractableMock,
      })

      expect(await deviceKeyManager.getDevicePrivateKey()).toEqual(mocks.privateKeyUnextractableMock)

      expect(getDeviceKeyMock).toHaveBeenCalledTimes(1)
      expect(getDeviceKeyMock).toHaveBeenCalledWith(deviceId)
    })

    it('should throw error when write to indexdb fails', async () => {
      getDeviceKeyMock.mockRejectedValue(new Error())

      await expect(
        deviceKeyManager.getDevicePrivateKey()
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_DEVICE_PRIVATE_KEY_NOT_FOUND)
    })
  })

  describe('enableEncryption', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeAll(() => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()
    })

    it('should throw error when device id is not defined', async () => {
      await expect(
        deviceKeyManager.enableEncryption()
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_DEVICE_NOT_E2E_ENABLED)
    })

    it('should enable device key status from indexDB', async () => {
      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      await deviceKeyManager.enableEncryption()

      expect(enableEncryptionDBData).toHaveBeenCalledTimes(1)
      expect(enableEncryptionDBData).toHaveBeenCalledWith(deviceId)
    })

    it('should throw error when write to indexdb fails', async () => {
      enableEncryptionDBData.mockRejectedValue(new Error())

      await expect(
        deviceKeyManager.enableEncryption()
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_DEVICE_PRIVATE_KEY_NOT_FOUND)
    })
  })

  describe('isEncryptionEnabled', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeAll(() => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()
    })

    it('should throw error when device id is not defined', async () => {
      await expect(
        deviceKeyManager.isEncryptionEnabled([])
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_DEVICE_NOT_E2E_ENABLED)
    })

    it('should throw error when device private key wasn\'t found', async () => {
      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      getDeviceKeyMock.mockResolvedValue(undefined)

      await expect(
        deviceKeyManager.isEncryptionEnabled([])
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_DEVICE_PRIVATE_KEY_NOT_FOUND)
    })

    it('should get disabled encryption status from indexDB when the devices are empty', async () => {
      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      getDeviceKeyMock.mockResolvedValue({
        encryption: index_db.KeyStatus.DISABLED,
      })

      expect(await deviceKeyManager.isEncryptionEnabled([])).toEqual(false)

      expect(getDeviceKeyMock).toHaveBeenCalledTimes(1)
      expect(getDeviceKeyMock).toHaveBeenCalledWith(deviceId)
    })

    it('should get enabled encryption status from indexDB when a device is added', async () => {
      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      getDeviceKeyMock.mockResolvedValue({
        encryption: index_db.KeyStatus.ENABLED,
      })

      expect(await deviceKeyManager.isEncryptionEnabled([{ ...mocks.deviceMock, device_id: deviceId }])).toEqual(true)

      expect(getDeviceKeyMock).toHaveBeenCalledTimes(1)
      expect(getDeviceKeyMock).toHaveBeenCalledWith(deviceId)
    })

    it('should throw error when reading from indexdb fails', async () => {
      getDeviceKeyMock.mockRejectedValue(new Error())

      await expect(
        deviceKeyManager.isEncryptionEnabled([{ ...mocks.deviceMock, device_id: deviceId }])
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_DEVICE_PRIVATE_KEY_NOT_FOUND)
    })
  })

  describe('encryptChannelSecret', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeAll(() => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()
    })

    it('should encrypt channel secret with public key', async () => {

      const alg: string = 'RSA-OAEP'

      getEncryptRSAWithPublicKey.mockResolvedValue(mocks.encryptedChannelSecretMock)

      expect(
        await deviceKeyManager.encryptChannelSecret(mocks.channelSecretMock, mocks.keyIdMock, mocks.publicKeyPEMMock)
      ).toEqual({
        encrypted_secret: mocks.encryptedChannelSecretMock,
        header: {
          alg,
          kid: mocks.keyIdMock,
        },
      })

      expect(getEncryptRSAWithPublicKey).toHaveBeenCalledTimes(1)
      expect(getEncryptRSAWithPublicKey).toHaveBeenCalledWith(mocks.publicKeyPEMMock, mocks.channelSecretMock)
    })

    it('should throw error when anything rejects', async () => {
      getEncryptRSAWithPublicKey.mockRejectedValue(new Error())

      await expect(
        deviceKeyManager.encryptChannelSecret(mocks.channelSecretMock, mocks.keyIdMock, mocks.publicKeyPEMMock)
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_CHANNEL_SECRET_ENCRYPT_FAILURE)
    })
  })

  describe('decryptChannelSecret', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeAll(async () => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()

      setDeviceKeyMock.mockResolvedValue(undefined)
      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      getDeviceKeyMock.mockResolvedValue({
        privateKey: mocks.privateKeyUnextractableMock,
      })
    })

    it('should decrypt channel secret with private key', async () => {

      const alg: string = 'RSA-OAEP'

      mockDecryptSecret()

      expect(
        await deviceKeyManager.decryptChannelSecret(mocks.encryptedChannelSecretMock)
      ).toEqual(mocks.decryptedMock)

      expect(getDeviceKeyMock).toHaveBeenCalledTimes(1)
      expect(getDeviceKeyMock).toHaveBeenCalledWith(deviceId)

      expect(decryptMock).toHaveBeenCalledTimes(1)
      expect(decryptMock).toHaveBeenCalledWith(
        {
          name: alg,
        },
        mocks.privateKeyUnextractableMock,
        mocks.encryptedChannelSecretBufferMock
      )
    })

    it('should throw error when anything rejects', async () => {
      decryptMock.mockRejectedValue(new Error())

      await expect(
        deviceKeyManager.decryptChannelSecret(mocks.encryptedChannelSecretMock)
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_CHANNEL_SECRET_DECRYPT_FAILURE)
    })
  })

  describe('encrypt', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeAll(async () => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()

      setDeviceKeyMock.mockResolvedValue(undefined)
      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      getDeviceKeyMock.mockResolvedValue({
        privateKey: mocks.privateKeyUnextractableMock,
      })
    })

    it('should encrypt content with channel secret', async () => {

      const alg: string = 'RSA-OAEP'
      const enc: string = 'AES-256-CBC'
      const name: string = 'AES-CBC'

      encryptMock.mockReset()
      expect(encryptMock).toHaveBeenCalledTimes(0)

      mockDecryptSecret()
      encryptMock.mockResolvedValue(mocks.encodedEncryptedContentMock)
      bytesToBase64Mock.mockReturnValue(mocks.encryptedContentMock)
      importChannelSecretMock.mockResolvedValue(mocks.channelSecretCryptoKeyMock)

      const iv: Uint8Array = new Uint8Array(16)

      getRandomValuesMock.mockReturnValue(iv)

      const hexIV: string = 'hex'

      bytesToHexMock.mockReturnValue(hexIV)

      expect(
        await deviceKeyManager.encrypt(mocks.encryptedChannelSecretMock, mocks.contentMock)
      ).toEqual({
        ciphertext: mocks.encryptedContentMock,
        encryption_header: {
          enc,
          iv: hexIV,
        },
      })

      expect(getDeviceKeyMock).toHaveBeenCalledTimes(1)
      expect(getDeviceKeyMock).toHaveBeenCalledWith(deviceId)

      expect(decryptMock).toHaveBeenCalledTimes(1)
      expect(decryptMock).toHaveBeenCalledWith(
        {
          name: alg,
        },
        mocks.privateKeyUnextractableMock,
        mocks.encryptedChannelSecretBufferMock
      )

      expect(encryptMock).toHaveBeenCalledTimes(1)
      expect(encryptMock).toHaveBeenCalledWith(
        {
          name,
          length: 256,
          iv,
        },
        mocks.channelSecretCryptoKeyMock,
        mocks.encodedContentMock)

      expect(bytesToBase64Mock).toHaveBeenCalledTimes(1)
      expect(bytesToBase64Mock).toHaveBeenCalledWith(mocks.encodedEncryptedContentMock)
    })

    it('should throw error when anything rejects', async () => {
      importChannelSecretMock.mockRejectedValue(new Error())

      await expect(
        deviceKeyManager.encrypt(mocks.encryptedChannelSecretMock, mocks.contentMock)
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_ENCRYPT_FAILURE)
    })
  })

  describe('decrypt', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeAll(async () => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()

      setDeviceKeyMock.mockResolvedValue(undefined)
      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      getDeviceKeyMock.mockResolvedValue({
        privateKey: mocks.privateKeyUnextractableMock,
      })
    })

    it('should decrypt content with channel secret', async () => {

      const alg: string = 'RSA-OAEP'
      const name: string = 'AES-CBC'

      encryptMock.mockReset()
      expect(encryptMock).toHaveBeenCalledTimes(0)

      mockDecryptSecret()
      getDecodedDataMock.mockReturnValue(mocks.decryptedMock)
      importChannelSecretMock.mockResolvedValue(mocks.channelSecretCryptoKeyMock)

      const hexIV: string = 'hex'

      hexToBytesMock.mockReturnValue(hexIV)

      expect(
        await deviceKeyManager.decrypt(mocks.encryptedChannelSecretMock, mocks.encryptedMessageContentMock)
      ).toEqual(mocks.decryptedMock)

      expect(getDeviceKeyMock).toHaveBeenCalledTimes(1)
      expect(getDeviceKeyMock).toHaveBeenCalledWith(deviceId)

      expect(decryptMock).toHaveBeenCalledTimes(2)
      expect(decryptMock).toHaveBeenNthCalledWith(1,
        {
          name: alg,
        },
        mocks.privateKeyUnextractableMock,
        mocks.encryptedChannelSecretBufferMock,
      )
      expect(decryptMock).toHaveBeenNthCalledWith(2,
        {
          name,
          iv: hexIV,
        },
        mocks.channelSecretCryptoKeyMock,
        mocks.encodedEncryptedContentMock,
      )

      expect(getDecodedDataMock).toHaveBeenCalledTimes(1)
      expect(getDecodedDataMock).toHaveBeenCalledWith(mocks.decryptedBufferMock)
    })

    it('should throw error when anything rejects', async () => {
      importChannelSecretMock.mockRejectedValue(new Error())

      await expect(
        deviceKeyManager.decrypt(mocks.encryptedChannelSecretMock, mocks.encryptedMessageContentMock)
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_DECRYPT_FAILURE)
    })
  })

  describe('prepareSecrets', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeAll(async () => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()

      setDeviceKeyMock.mockResolvedValue(undefined)
      await deviceKeyManager.storeKey(deviceId, mocks.privateKeyUnextractableMock)

      getDeviceKeyMock.mockResolvedValue({
        privateKey: mocks.privateKeyUnextractableMock,
      })
    })

    it('should prepare channel secrets for all participants', async () => {
      const iv: Uint8Array = new Uint8Array(16)

      getRandomValuesMock.mockReturnValue(iv)

      const channelSecret: string = 'channelSecret'

      bytesToHexMock.mockReturnValue(channelSecret)
      getEncryptRSAWithPublicKey.mockResolvedValue(mocks.encryptedChannelSecretMock)

      expect(
        await deviceKeyManager.prepareSecrets([mocks.deviceInfoMock, mocks.deviceInfoMock])
      ).toEqual([mocks.participantSecretData, mocks.participantSecretData])

      expect(getEncryptRSAWithPublicKey).toHaveBeenCalledTimes(2)
      expect(getEncryptRSAWithPublicKey)
        .toHaveBeenCalledWith(mocks.deviceInfoMock.messaging_keys.public_key, channelSecret)
    })

    it('should throw error if participant doesn\'t have messaging public key', async () => {

      getEncryptRSAWithPublicKey.mockResolvedValue(mocks.encryptedChannelSecretMock)

      const iv: Uint8Array = new Uint8Array(16)

      getRandomValuesMock.mockReturnValue(iv)

      const channelSecret: string = 'channelSecret'

      bytesToHexMock.mockReturnValue(channelSecret)

      await expect(
        deviceKeyManager.prepareSecrets([mocks.deviceInfoWithoutPublicKeyMock, mocks.deviceInfoMock])
      ).rejects.toThrow(DeviceKeyManagerErrors.ERR_PARTICIPANTS_MISSING_E2E_ENCRYPTION)
    })
  })

  describe('generateRandomSecret', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeAll(() => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()
    })

    it('should generate a channel secret', () => {
      const randomBytes: Uint8Array = new Uint8Array()

      randomBytesMock.mockReturnValue(randomBytes)

      const channelSecret: string = 'channelSecret'

      bytesToHexMock.mockReturnValue(channelSecret)

      expect(deviceKeyManager.generateRandomSecret()).toEqual(channelSecret)

      expect(randomBytesMock).toHaveBeenCalledTimes(1)
      expect(randomBytesMock).toHaveBeenCalledWith(AES_SECRET_SIZE)

      expect(bytesToHexMock).toHaveBeenCalledTimes(1)
      expect(bytesToHexMock).toHaveBeenCalledWith(randomBytes)
    })
  })

  describe('init', () => {
    let deviceKeyManager: IDeviceKeyManager

    beforeEach(() => {
      deviceKeyManager = new device_key_manager.DeviceKeyManager()
    })

    it('should init device id if it was in indexedDB', async () => {
      expect(deviceKeyManager.getDeviceId()).toBeUndefined()

      getDeviceIdMock.mockResolvedValue(deviceId)

      await deviceKeyManager.init()

      expect(deviceKeyManager.getDeviceId()).toEqual(deviceId)
    })

    it('should init device id to undefined if it wasn\'t in indexedDB', async () => {
      expect(deviceKeyManager.getDeviceId()).toBeUndefined()

      getDeviceKeyMock.mockResolvedValue(undefined)

      await deviceKeyManager.init()

      expect(deviceKeyManager.getDeviceId()).toBeUndefined()
    })
  })
})

