import { mocked } from 'ts-jest/utils'
import { CreateVerificationRequestBody } from './../api/interfaces'
import * as crypto from './crypto'
import { appType, generateMockAgencies } from '../../../tests/mocks/agencies_mock'
import { Agency, App, AppType } from '@globalid/attestations-types'
import { groupVerificationMock, groupMock } from '../../../tests/mocks/group_mocks'
import { publicIdentityMock, globalIdIdentityMock } from '../../../tests/mocks/identity_mock'
import { aes, hmac, rsa, util } from 'globalid-crypto'
import { verifyAllWhenMocksCalled, when } from 'jest-when'
import { customValueMock } from '../../../tests/mocks/group_verifications_mocks'

jest.mock('globalid-crypto')
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}))

describe('Verifications crypto tests', () => {
  describe('createGroupVerificationRequestBody', () => {
    const rsaEncryptMock = mocked(rsa.encrypt)
    const hmacSHA512Mock = mocked(hmac.sha512)
    const aesEncryptMock = mocked(aes.encrypt)
    const agency: Agency.Model = generateMockAgencies(1)[0]
    const app: App.Model = <App.Model>agency.apps?.[0]
    const appTypes: AppType.Model[] = [{ ...appType, app_uuid: app.uuid, max_att_number: 1 }]

    it('should create group verifications request when app types are not empty', async () => {
      jest.spyOn(util, 'bytesToHex').mockImplementation().mockReturnValue('randomPass')

      when(hmacSHA512Mock).calledWith(`${appType.type?.type}-${app.agency_uuid}`, 'randomPass').mockResolvedValue('rootHash')

      when(hmacSHA512Mock).calledWith('test-uuid', 'rootHash').mockResolvedValue('salt')

      when(rsaEncryptMock).calledWith(publicIdentityMock.public_encryption_key, 'randomPass').mockResolvedValue('password')

      const piiValue: string = JSON.stringify({
        issuing_member_gid_name: globalIdIdentityMock.gid_name,
        issuing_member_gid_uuid: globalIdIdentityMock.gid_uuid,
        issuing_group_gid_uuid: groupMock.gid_uuid,
        issuing_group_gid_name: groupMock.gid_name,
        group_verification_type_uuid: groupVerificationMock.uuid,
        group_verification_type_name: groupVerificationMock.name,
        group_verification_type_description: groupVerificationMock.description,
        group_verification_category: groupVerificationMock.category,
        data: [customValueMock],
      })

      when(hmacSHA512Mock).calledWith(piiValue, 'salt').mockResolvedValue('dataHash')

      when(rsaEncryptMock).calledWith('encryption_public_key', 'randomPass').mockResolvedValue('pii_pass')

      const piiStringifyed: string = JSON.stringify({
        'test-uuid': piiValue,
      })

      when(aesEncryptMock).calledWith(piiStringifyed, 'randomPass').mockResolvedValue('pii_prepared')

      const response: CreateVerificationRequestBody = await crypto.createGroupVerificationRequestBody(
        { ...app, app_types: appTypes},
        'encryption_public_key',
        groupVerificationMock,
        globalIdIdentityMock,
        groupMock,
        publicIdentityMock,
        [customValueMock],
      )

      expect(response.app_uuid).toBe(app.uuid)
      expect(response.attestations[0]).toStrictEqual({
        data_hash: 'dataHash',
        public_attestor_note: '',
        public_data: groupVerificationMock.name,
        related_attestations: '',
        salt_idx: 0,
        type: appType.type?.type,
        uuid: 'test-uuid',
      })

      expect(response.root_hashes).toStrictEqual({
        [`${appType.type?.type}`]: ['rootHash'],
      })

      expect(response.root_passwords).toStrictEqual({
        [`${appType.type?.type}`]: ['password'],
      })

      expect(response.salts).toStrictEqual({
        [`${appType.type?.type}`]: ['salt'],
      })

      expect(response.tracking_id).toBe('test-uuid')
      expect(response.attestee_uuid).toBe(publicIdentityMock.gid_uuid)

      expect(response.pii).toBe('pii_prepared')

      expect(response.pii_pass).toBe('pii_pass')

      verifyAllWhenMocksCalled()
    })

    it('should throw NO_APP_TYPES error when no appTypes are present', async () => {
      await expect(crypto.createGroupVerificationRequestBody(
        { ...app, app_types: undefined},
        'encryption_public_key',
        groupVerificationMock,
        globalIdIdentityMock,
        groupMock,
        publicIdentityMock,
        [],
      )).rejects.toThrow(new Error('NO_APP_TYPES'))
    })

    it('should throw ERR_FAILED_GENERATING_ROOT_HASH error when generateRootHash fails', async () => {
      jest.spyOn(util, 'bytesToHex').mockImplementation(() => { throw new Error('test')})
      await expect(crypto.createGroupVerificationRequestBody(
        { ...app, app_types: appTypes},
        'encryption_public_key',
        groupVerificationMock,
        globalIdIdentityMock,
        groupMock,
        publicIdentityMock,
        [],
      )).rejects.toThrow(new Error('ERR_FAILED_GENERATING_ROOT_HASH'))
    })
  })
})
