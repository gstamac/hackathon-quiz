import { verificationAppMock } from './../../../tests/mocks/verification_mocks'
import { API, GetSingleAppSearchRequests } from '@globalid/attestations-types'
import { agencyMock } from './../../../tests/mocks/agencies_mock'
import { API_BASE_URL } from './../../constants'
import { when } from 'jest-when'
import { mocked } from 'ts-jest/utils'
import * as api from './attestations_api'
import axios from 'axios'
import { categoriesMock, typeMock } from '../../../tests/mocks/agencies_mock'

jest.mock('globalid-crypto')
jest.mock('../../init')
jest.mock('axios')

describe('Attesation api tests', () => {
  const axiosGetMock: jest.Mock = mocked(axios.get)

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return latest verification apps when getVerificationApps is called', async () => {
    when(axiosGetMock)
      .calledWith(`${API_BASE_URL}/v1/identity/gid_uuid/attestations/latest`)
      .mockResolvedValue({ data: { data: [verificationAppMock] }})
    expect(await api.getVerificationApps('gid_uuid')).toStrictEqual([verificationAppMock])
  })

  it('should return categories when getAppCategories is called', async () => {
    when(axiosGetMock)
      .calledWith(`${API_BASE_URL}/v1/attestations/agencies/categories`)
      .mockResolvedValue({ data: categoriesMock})
    expect(await api.getAppCategories()).toBe(categoriesMock)
  })

  it('should return verification app getVerificationsByAgencies is called', async () => {
    const app: GetSingleAppSearchRequests.Response = {
      data: {
        attestation_requests: [],
        app: verificationAppMock,
      },
      meta: {
        page: 1,
        per_page: 10,
        total: 10,
      },
    }

    when(axiosGetMock)
      .calledWith(`${API_BASE_URL}/v1/identity/gid_uuid/app/app_uuid/attestations`)
      .mockResolvedValue({ data: app})
    expect(await api.getVerificationsByAgencies('app_uuid', 'gid_uuid')).toBe(app)
  })

  it('should return appTypes when getAppTypes is called', async () => {
    when(axiosGetMock)
      .calledWith(`${API_BASE_URL}/v1/attestations/types`)
      .mockResolvedValue({ data: [typeMock]})
    expect(await api.getAppTypes()).toStrictEqual([typeMock])
  })

  it('should return verification agencies when getAgencies is called', async () => {
    when(axiosGetMock)
      .calledWith(`${API_BASE_URL}/v1/attestations/agencies`)
      .mockResolvedValue({ data: [agencyMock]})
    expect(await api.getAgencies()).toStrictEqual([agencyMock])
  })

  it('should return verification service public key when getVerificationPubKey is called', async () => {
    const publickEncKey: API.V1.Attestations.Publickey.GET.Response = {
      encryption_public_key: 'test',
    }

    when(axiosGetMock)
      .calledWith(`${API_BASE_URL}/v1/attestations/publickey`)
      .mockResolvedValue({ data: publickEncKey})
    expect(await api.getVerificationPubKey()).toBe(publickEncKey)
  })
})
