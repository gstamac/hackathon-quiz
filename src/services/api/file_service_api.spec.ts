import * as file_service_api from './file_service_api'
import * as auth from '../../components/auth'

import { imageFileMock, assetImageMock } from '../../../tests/mocks/messages_mock'
import axios from 'axios'
import { MediaAsset } from '@globalid/messaging-service-sdk'

jest.mock('../../components/auth')
jest.mock('axios')

describe('File Service', () => {
  const getValidTokenMock: jest.Mock = jest.fn()
  const deleteAxiosMock: jest.Mock = jest.fn()

  const channel_id: string = '8d259467-3796-4d98-990e-452ced2791e1'
  const token: string = 'token'

  beforeAll(() => {
    (<jest.Mock> axios.post).mockResolvedValue({ data: assetImageMock });
    (<jest.Mock> axios.delete) = deleteAxiosMock;
    (<jest.Mock> auth.getValidToken) = getValidTokenMock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('uploadImage', () => {
    it('should upload an image and return its response', async () => {
      getValidTokenMock.mockReturnValue(token)

      const imageAsset: MediaAsset =
        await file_service_api.uploadImage(assetImageMock.uuid, channel_id, imageFileMock)

      expect(imageAsset).toEqual(assetImageMock)
    })

    it('should throw an error when token does not exist', async () => {
      getValidTokenMock.mockRejectedValue(new Error('ERR_UNAUTHORIZED'))

      await expect(file_service_api.uploadImage(assetImageMock.uuid, channel_id, imageFileMock))
        .rejects.toThrow('ERR_UNAUTHORIZED')
    })
  })

  describe('deleteImageAsset', () => {
    it('should call axios delete method', async () => {
      getValidTokenMock.mockReturnValue(token)

      await file_service_api.deleteImageAsset(assetImageMock.uuid)

      expect(deleteAxiosMock).toHaveBeenCalled()
    })
  })
})
