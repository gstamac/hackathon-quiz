/* eslint-disable unicorn/filename-case */
declare module 'globalid-crypto' {
  type PbkdfSalt = string | number[] | Uint8Array

  interface KeyPair {
    privateKey: string
    publicKey: string
  }

  namespace crypto {
    namespace aes {
      function encrypt (data: string, password: string): Promise<string>

      function decrypt (data: string, password: string): Promise<string>

      function encryptBuffer (data: ArrayBuffer, password: string): Promise<ArrayBuffer>
    }

    namespace hmac {
      function sha512 (s: string, p: string): Promise<string>
    }

    namespace GID {
      function aesCbcEncryptIdentity (data: string, password: string, iterations: number): Promise<string>

      function aesCbcDecryptIdentity (data: string, password: string, iterations: number): Promise<string>

      function aesCbcDecryptSecurity (data: string, password: string): Promise<string>

      function aesCbcEncryptSecurity (data: string, password: string): Promise<string>
    }

    namespace pbkdf {
      function get (data: string, salt: PbkdfSalt, iterations: number, keySize: number): Promise<string>
    }

    namespace rsa {
      function encrypt (e: string | void, k: string): Promise<string>

      function decrypt (e: string, k: string): Promise<string>

      function generateKeyPair (b?: number): Promise<KeyPair>

      function sign (key: string, data: string): Promise<string>
    }

    namespace util {
      function generateRandomPassword (bytes: number): Promise<string>

      function hashSHA512 (data: string): Promise<string>

      function randomBytes (number: number): Promise<number[]>

      function randomBytes (numBytes: number): Promise<number[]>

      function bytesToHex (bytes: number[]): string

      function hexToBytes (string: string): number[]

      function bytesToString (bytes: number[]): string

      function bytesToUint8Array (bytes: number[]): Uint8Array

      function stringToBytes (str: string): number[]

      function stringToBuffer (str: string): Uint8Array

      function bytesToBase64 (num: number[] | Uint8Array): string

      function arrayBufferToBase64 (ab: ArrayBuffer): string

      function isPemKey (key: string): boolean

      function convertPemToPlain (pem: string): string

      function convertPemToBinary (pem: string): ArrayBufferLike

      function bufferToString (buf: ArrayBuffer, encoding?: string): string

      function base64StringToArrayBuffer (b64str: string): ArrayBufferLike
    }
  }

  export = crypto
}
