import { ChannelSecret, ParticipantChannelSecret, MessageTemplateEncryptedText } from '@globalid/messaging-service-sdk'
import { DevicesInfoResponse as DeviceInfo, MyDevicesInfoResponse } from '@globalid/keystore-service-sdk'

export interface IDeviceKeyManager {
  generateKeyPair(): Promise<DeviceKeyPair>
  storeKey(
    deviceId: string,
    privateKey: CryptoKey,
    publicKey: string,
  ): Promise<void>
  encryptChannelSecret(
    channelSecret: string,
    keyId: string,
    messagingPublicKey: string
  ): Promise<ChannelSecret>
  decryptChannelSecret(encryptedChannelSecret: string): Promise<string>
  flush(): Promise<void>
  encrypt(
    encryptedChannelSecret: string,
    content: string
  ): Promise<MessageTemplateEncryptedText>
  decrypt(
    encryptedChannelSecret: string,
    encryptedContent: MessageTemplateEncryptedText
  ): Promise<string>
  prepareSecrets(keys: DeviceInfo[]): Promise<ParticipantChannelSecret[]>
  getDeviceId(): string | undefined
  getDevicePrivateKey(): Promise<CryptoKey>
  isEncryptionEnabled(devices: MyDevicesInfoResponse[]): Promise<boolean>
  enableEncryption(): Promise<void>
  generateRandomSecret(): string
  init(): Promise<void>
}

export interface MessageContent {
  text: string
}

export enum DeviceKeyManagerErrors {
  'ERR_GENERATE_KEY_PAIR_FAILURE' = 'ERR_GENERATE_KEY_PAIR_FAILURE',
  'ERR_CHANNEL_SECRET_DECRYPT_FAILURE' = 'ERR_CHANNEL_SECRET_DECRYPT_FAILURE',
  'ERR_CHANNEL_SECRET_ENCRYPT_FAILURE' = 'ERR_CHANNEL_SECRET_ENCRYPT_FAILURE',
  'ERR_DECRYPT_FAILURE' = 'ERR_DECRYPT_FAILURE',
  'ERR_ENCRYPT_FAILURE' = 'ERR_ENCRYPT_FAILURE',
  'ERR_PARTICIPANTS_MISSING_E2E_ENCRYPTION' = 'ERR_PARTICIPANTS_MISSING_E2E_ENCRYPTION',
  'ERR_DEVICE_NOT_E2E_ENABLED' = 'ERR_DEVICE_NOT_E2E_ENABLED',
  'ERR_STORE_DEVICE_PRIVATE_KEY_FAILURE' = 'ERR_STORE_DEVICE_PRIVATE_KEY_FAILURE',
  'ERR_DEVICE_PRIVATE_KEY_NOT_FOUND' = 'ERR_DEVICE_PRIVATE_KEY_NOT_FOUND',
  'INVALID_KEY' = 'INVALID_KEY',
}

export interface DeviceKeyPair {
  privateKey: CryptoKey
  publicKey: string
}
