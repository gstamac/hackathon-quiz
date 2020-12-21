import { DeviceKeyManagerErrors } from './interfaces'
import {
  AES_CBC_ALGORITHM,
  AES_CBC_LENGTH,
  BASE64_ENCODING,
  RAW_CRPYTO_KEY_FORMAT,
  UTF8_ENCODING,
  HEX_LENGTH,
  PKCS8_CRPYTO_KEY_FORMAT,
  RSA_OAEP_ALGORITHM,
  SHA_1_HASH,
  SPKI_CRPYTO_KEY_FORMAT,
} from '../../constants'

import { util } from 'globalid-crypto'

const subtleCrypto: SubtleCrypto = window.crypto.subtle

export const textDecoderUtf8: TextDecoder = new TextDecoder(UTF8_ENCODING)
export const textEncoder: TextEncoder = new TextEncoder()

export const bytesToHex = (bytesArray: Uint8Array): string => {
  const hex: string[] = []

  bytesArray.forEach((byte: number): void => {
    hex.push(byte.toString(HEX_LENGTH).padStart(2, '0'))
  })

  return hex.join('')
}
export const hexToBytes = (hexString: string): Uint8Array => (
  Uint8Array.from(Buffer.from(hexString, 'hex'))
)

export const base64ToBytes = (base64: string): Uint8Array => (
  Uint8Array.from(Buffer.from(base64))
)

export const bytesToBase64 = (bytes: ArrayBuffer): string => (
  Buffer.from(bytes).toString(BASE64_ENCODING)
)

export const randomBytes = (bytes: number): Uint8Array => (
  Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(bytes)))
)

export const getEncodedData = (data: string): Uint8Array => textEncoder.encode(data)

export const getDecodedData = (data: ArrayBuffer): string => textDecoderUtf8.decode(data)

export const importChannelSecret = async (channelSecret: string): Promise<CryptoKey> => {

  const channelSecretBuffer: Uint8Array = hexToBytes(channelSecret)

  return subtleCrypto.importKey(
    RAW_CRPYTO_KEY_FORMAT,
    channelSecretBuffer,
    {
      name: AES_CBC_ALGORITHM,
      length: AES_CBC_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  )
}

export const toUnextractable = async (key: string): Promise<CryptoKey> => {
  if (!util.isPemKey(key)) {
    throw new Error(DeviceKeyManagerErrors.INVALID_KEY)
  }
  const privateKey: ArrayBufferLike = util.convertPemToBinary(key)

  const cryptoKey: CryptoKey = await subtleCrypto.importKey(
    PKCS8_CRPYTO_KEY_FORMAT,
    privateKey,
    {
      hash: {
        name: SHA_1_HASH,
      },
      name: RSA_OAEP_ALGORITHM,
    },
    false,
    ['decrypt']
  )

  return cryptoKey
}

export const encryptRSAWithPublicKey = async (key: string, data: string): Promise<string> => {
  if (!util.isPemKey(key)) {
    throw new Error(DeviceKeyManagerErrors.INVALID_KEY)
  }

  const publicKey: ArrayBufferLike = util.convertPemToBinary(key)

  const cryptoKey: CryptoKey = await subtleCrypto.importKey(
    SPKI_CRPYTO_KEY_FORMAT,
    publicKey,
    {
      name: RSA_OAEP_ALGORITHM,
      hash: SHA_1_HASH,
    } ,
    false,
    ['encrypt']
  )

  const encrypted: ArrayBuffer = await subtleCrypto.encrypt(
    {
      name: RSA_OAEP_ALGORITHM,
    },
    cryptoKey,
    util.stringToBuffer(data)
  )

  return util.arrayBufferToBase64(encrypted)
}
