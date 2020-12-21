import PQueue from 'p-queue'
import { PENDING_DEVICE_ID } from './../../constants'
/* eslint-disable no-restricted-syntax */
import {
  ChannelSecret,
  ParticipantChannelDeviceSecret,
  MessageTemplateEncryptedText,
} from '@globalid/messaging-service-sdk'
import {
  setDeviceKey,
  getDeviceKey,
  DeviceStoreData,
  clearDeviceKey,
  KeyStatus,
  enableEncryptionDBData,
  getDeviceId, setDeviceId, clearDeviceId,
} from '../index_db'
import {
  toUnextractable,
  hexToBytes,
  importChannelSecret,
  randomBytes,
  bytesToHex,
  bytesToBase64,
  getDecodedData,
  encryptRSAWithPublicKey,
} from './helpers'
import {
  AES_SECRET_SIZE,
  RSA_OAEP_ALGORITHM,
  AES_CBC_ALGORITHM,
  AES_CBC_ALGORITHM_WITH_LENGTH,
  AES_CBC_LENGTH, BASE64_ENCODING,
  UTF8_ENCODING,
  RSA_KEY_SIZE,
} from '../../constants'
import { DevicesInfoResponse as DeviceInfo, MyDevicesInfoResponse } from '@globalid/keystore-service-sdk'
import { DeviceKeyPair, IDeviceKeyManager, DeviceKeyManagerErrors } from './interfaces'
import { rsa, util } from 'globalid-crypto'

const subtleCrypto: SubtleCrypto = window.crypto.subtle

const DEVICE_ID_KEY: string = 'deviceId'

export class DeviceKeyManager implements IDeviceKeyManager {

  private deviceId: string | undefined
  private isInitialized: boolean = false
  private queue: PQueue

  constructor (){
    this.queue = new PQueue({ concurrency: 1 })
  }

  init = async (): Promise<void> => {
    const deviceId: string | undefined = await getDeviceId(DEVICE_ID_KEY)

    this.setDeviceId(deviceId)
    this.setIsInitialized()
  }

  generateKeyPair = async (): Promise<DeviceKeyPair> => this.queue.add(async () => {
    try {
      if (!this.isInitialized){
        await this.init()
      }

      if (this.deviceId){
        const keyPair: DeviceStoreData | undefined = await getDeviceKey(this.deviceId)

        if (keyPair){
          return keyPair
        }
      }

      const { publicKey, privateKey } = await rsa.generateKeyPair(RSA_KEY_SIZE)

      const unextractablePrivateKey: CryptoKey = await toUnextractable(privateKey)

      await this.storeKey(PENDING_DEVICE_ID, unextractablePrivateKey, publicKey)

      return {
        privateKey: unextractablePrivateKey,
        publicKey: publicKey,
      }
    } catch (error) {
      throw new Error(DeviceKeyManagerErrors.ERR_GENERATE_KEY_PAIR_FAILURE)
    }
  })

  encryptChannelSecret = async (
    channelSecret: string,
    keyPairUuid: string,
    messagingPublicKey: string
  ): Promise<ChannelSecret> => {
    try {
      const encrypted_secret: string = await encryptRSAWithPublicKey(messagingPublicKey, channelSecret)

      return {
        encrypted_secret,
        header: {
          alg: RSA_OAEP_ALGORITHM,
          kid: keyPairUuid,
        },
      }
    } catch (error) {
      throw new Error(DeviceKeyManagerErrors.ERR_CHANNEL_SECRET_ENCRYPT_FAILURE)
    }
  }

  decryptChannelSecret = async (encryptedChannelSecret: string): Promise<string> => {
    try {
      const cryptoKey: CryptoKey = await this.getDevicePrivateKey()
      const decrypted: ArrayBuffer = await subtleCrypto.decrypt(
        {
          name: RSA_OAEP_ALGORITHM,
        },
        cryptoKey,
        util.base64StringToArrayBuffer(encryptedChannelSecret)
      )

      return util.bufferToString(decrypted)
    } catch (error) {
      throw new Error(DeviceKeyManagerErrors.ERR_CHANNEL_SECRET_DECRYPT_FAILURE)
    }
  }

  encrypt = async (encryptedChannelSecret: string, content: string): Promise<MessageTemplateEncryptedText> => {
    try {
      const encodedContent: ArrayBuffer = Buffer.from(content, UTF8_ENCODING)

      const channelSecret: string = await this.decryptChannelSecret(encryptedChannelSecret)
      const channelSecretKey: CryptoKey = await importChannelSecret(channelSecret)

      const iv: Uint8Array = window.crypto.getRandomValues(new Uint8Array(16))

      const ciphertextBuffer: ArrayBuffer = await subtleCrypto.encrypt(
        {
          name: AES_CBC_ALGORITHM,
          length: AES_CBC_LENGTH,
          iv,
        },
        channelSecretKey,
        encodedContent
      )

      const ciphertext: string = bytesToBase64(ciphertextBuffer)

      return {
        ciphertext,
        encryption_header: {
          enc: AES_CBC_ALGORITHM_WITH_LENGTH,
          iv: bytesToHex(iv),
        },
      }
    } catch (error) {
      throw new Error(DeviceKeyManagerErrors.ERR_ENCRYPT_FAILURE)
    }
  }

  decrypt = async (encryptedChannelSecret: string, encryptedContent: MessageTemplateEncryptedText): Promise<string> => {
    try {
      const encodedEncryptedContent: ArrayBuffer = Buffer.from(encryptedContent.ciphertext, BASE64_ENCODING)

      const channelSecret: string = await this.decryptChannelSecret(encryptedChannelSecret)
      const channelSecretKey: CryptoKey = await importChannelSecret(channelSecret)

      const decodedTextBuffer: ArrayBuffer = await subtleCrypto.decrypt(
        {
          name: AES_CBC_ALGORITHM,
          iv: hexToBytes(encryptedContent.encryption_header.iv),
        },
        channelSecretKey,
        encodedEncryptedContent
      )

      const decodedText: string = getDecodedData(decodedTextBuffer)

      return decodedText
    } catch (error) {
      throw new Error(DeviceKeyManagerErrors.ERR_DECRYPT_FAILURE)
    }
  }

  getDevicePrivateKey = async (): Promise<CryptoKey> => {
    if (this.deviceId === undefined) {
      throw new Error(DeviceKeyManagerErrors.ERR_DEVICE_NOT_E2E_ENABLED)
    }

    try {
      const deviceStoreData: DeviceStoreData = <DeviceStoreData> await getDeviceKey(this.deviceId)

      return deviceStoreData.privateKey
    } catch (error) {
      throw new Error(DeviceKeyManagerErrors.ERR_DEVICE_PRIVATE_KEY_NOT_FOUND)
    }
  }

  storeKey = async (deviceId: string, privateKey: CryptoKey, publicKey: string): Promise<void> => {
    try {
      await setDeviceKey(deviceId, {
        privateKey,
        publicKey,
        encryption: KeyStatus.DISABLED,
      })

      await setDeviceId(DEVICE_ID_KEY, deviceId)

      this.setDeviceId(deviceId)
    } catch (error) {
      throw new Error(DeviceKeyManagerErrors.ERR_STORE_DEVICE_PRIVATE_KEY_FAILURE)
    }
  }

  enableEncryption = async (): Promise<void> => {
    if (this.deviceId === undefined) {
      throw new Error(DeviceKeyManagerErrors.ERR_DEVICE_NOT_E2E_ENABLED)
    }

    try {
      await enableEncryptionDBData(this.deviceId)

    } catch (error) {
      throw new Error(DeviceKeyManagerErrors.ERR_DEVICE_PRIVATE_KEY_NOT_FOUND)
    }
  }

  isEncryptionEnabled = async (devices: MyDevicesInfoResponse[]): Promise<boolean> => {
    if (this.deviceId === undefined) {
      throw new Error(DeviceKeyManagerErrors.ERR_DEVICE_NOT_E2E_ENABLED)
    }

    try {
      const deviceStoreData: DeviceStoreData = <DeviceStoreData> await getDeviceKey(this.deviceId)

      const encryptionStatusEnabled: boolean = deviceStoreData.encryption === KeyStatus.ENABLED &&
        devices.some((device: MyDevicesInfoResponse) => device.device_id === this.deviceId)

      return encryptionStatusEnabled
    } catch (error) {
      throw new Error(DeviceKeyManagerErrors.ERR_DEVICE_PRIVATE_KEY_NOT_FOUND)
    }
  }

  flush = async (): Promise<void> => {
    await clearDeviceKey()
    await clearDeviceId()
    this.setDeviceId(undefined)
  }

  generateRandomSecret = (): string => (
    bytesToHex(randomBytes(AES_SECRET_SIZE))
  )

  prepareSecrets = async (keys: DeviceInfo[]): Promise<ParticipantChannelDeviceSecret[]> => {

    const channelSecret: string = this.generateRandomSecret()

    const secrets: ParticipantChannelDeviceSecret[] = await Promise.all(
      keys.map(async (key: DeviceInfo): Promise<ParticipantChannelDeviceSecret> => {
        if (key.messaging_keys.algorithm_type !== 'rsa') {
          throw new Error(DeviceKeyManagerErrors.ERR_PARTICIPANTS_MISSING_E2E_ENCRYPTION)
        }
        const encryptedChannelSecret: ChannelSecret = await this.encryptChannelSecret(
          channelSecret,
          key.messaging_keys.key_id,
          key.messaging_keys.public_key
        )

        return {
          gid_uuid: key.gid_uuid,
          device_id: key.device_id,
          secret: encryptedChannelSecret,
        }
      })
    )

    if (secrets.length !== keys.length) {
      throw new Error(DeviceKeyManagerErrors.ERR_PARTICIPANTS_MISSING_E2E_ENCRYPTION)
    }

    return secrets
  }

  private setDeviceId = (deviceId: string | undefined): void => {
    this.deviceId = deviceId
  }

  getDeviceId = (): string | undefined => this.deviceId

  private setIsInitialized = (): void => {
    this.isInitialized = true
  }

  getInitialized = (): boolean => this.isInitialized
}
