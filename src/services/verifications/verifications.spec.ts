import { groupMock } from './../../../tests/mocks/group_mocks'
import { globalIdIdentityMock } from './../../../tests/mocks/identity_mock'
import * as verifications from './verifications'
import * as crypto from './crypto'
import * as groupApi from '../api/groups_api'
import * as attestationsApi from '../api/attestations_api'
import { publicIdentityMock } from '../../../tests/mocks/identity_mock'
import { groupVerificationMock } from '../../../tests/mocks/group_mocks'
import { GROUP_ISSUED_VERIFICATION_AGENCY_UUID, GROUP_ISSUED_VERIFICATION_APP_UUID } from '../../constants'
import { Agency, App } from '@globalid/attestations-types'
import { generateMockAgencies } from '../../../tests/mocks/agencies_mock'
import { customValueMock } from '../../../tests/mocks/group_verifications_mocks'

jest.mock('./crypto')
jest.mock('../api/groups_api')
jest.mock('../api/attestations_api')

describe('Verifications Service', () => {
  const createGroupVerificationRequestBodyMock: jest.Mock = jest.fn()
  const createVerificationRequestMock: jest.Mock = jest.fn()
  const getVerificationPubKeyMock: jest.Mock = jest.fn()
  const getAgenciesMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (<jest.Mock>crypto.createGroupVerificationRequestBody) = createGroupVerificationRequestBodyMock;
    (<jest.Mock>groupApi.createVerificationRequest) = createVerificationRequestMock;
    (<jest.Mock>attestationsApi.getVerificationPubKey) = getVerificationPubKeyMock;
    (<jest.Mock>attestationsApi.getAgencies) = getAgenciesMock
    getVerificationPubKeyMock.mockResolvedValue({
      encryption_public_key: 'encryption_public_key',
    })
  })

  it('should call issueGroupVerification function', async () => {
    const agency: Agency.Model = generateMockAgencies(1)[0]
    const app: App.Model = {
      ...<App.Model>agency.apps?.[0],
      uuid: GROUP_ISSUED_VERIFICATION_APP_UUID,
    }

    getAgenciesMock.mockResolvedValue([
      {
        ...agency,
        uuid: GROUP_ISSUED_VERIFICATION_AGENCY_UUID,
        apps: [app],
      },
    ])

    createGroupVerificationRequestBodyMock.mockResolvedValue('verificationsRequestResponse')

    await verifications.issueGroupVerification(
      globalIdIdentityMock,
      groupMock,
      publicIdentityMock,
      groupVerificationMock,
      [],
    )

    expect(getVerificationPubKeyMock).toHaveBeenCalled()
    expect(createGroupVerificationRequestBodyMock).toHaveBeenCalledWith(
      app,
      'encryption_public_key',
      groupVerificationMock,
      globalIdIdentityMock,
      groupMock,
      publicIdentityMock,
      [],
    )
    expect(createVerificationRequestMock).toHaveBeenCalledWith(
      'verificationsRequestResponse',
      groupMock.gid_uuid
    )
  })

  it('should pass customValue to createGroupVerificationRequestBody function when data is provided', async () => {
    const agency: Agency.Model = generateMockAgencies(1)[0]
    const app: App.Model = {
      ...<App.Model>agency.apps?.[0],
      uuid: GROUP_ISSUED_VERIFICATION_APP_UUID,
    }

    getAgenciesMock.mockResolvedValue([
      {
        ...agency,
        uuid: GROUP_ISSUED_VERIFICATION_AGENCY_UUID,
        apps: [app],
      },
    ])

    createGroupVerificationRequestBodyMock.mockResolvedValue('verificationsRequestResponse')

    await verifications.issueGroupVerification(
      globalIdIdentityMock,
      groupMock,
      publicIdentityMock,
      groupVerificationMock,
      [customValueMock],
    )

    expect(createGroupVerificationRequestBodyMock).toHaveBeenCalledWith(
      app,
      'encryption_public_key',
      groupVerificationMock,
      globalIdIdentityMock,
      groupMock,
      publicIdentityMock,
      [customValueMock],
    )
  })

  it('should throw en error AGENCY_HAS_NO_APPS when apps are missing', async () => {
    const agency: Agency.Model = generateMockAgencies(1)[0]

    getAgenciesMock.mockResolvedValue([{ ...agency, apps: undefined }])

    await expect(verifications.issueGroupVerification(
      globalIdIdentityMock,
      groupMock,
      publicIdentityMock,
      groupVerificationMock,
      [],
    )).rejects.toThrow(new Error('AGENCY_HAS_NO_APPS'))
  })

  it('should throw en error AGENCY_APP_MISMATCH when provided wrong app uuid', async () => {
    const agency: Agency.Model = generateMockAgencies(1)[0]

    getAgenciesMock.mockResolvedValue([{
      ...agency,
      uuid: GROUP_ISSUED_VERIFICATION_AGENCY_UUID,
    }])

    await expect(verifications.issueGroupVerification(
      globalIdIdentityMock,
      groupMock,
      publicIdentityMock,
      groupVerificationMock,
      [],
    )).rejects.toThrow(new Error('AGENCY_APP_MISMATCH'))
  })
})
