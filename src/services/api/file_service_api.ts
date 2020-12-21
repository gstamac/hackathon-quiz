import axios, { AxiosResponse } from 'axios'
import { getValidToken } from '../../components/auth'
import { MediaAsset } from '@globalid/messaging-service-sdk'
import { API_BASE_URL } from '../../constants'

export const uploadImage = async (assetUuid: string, channel_id: string, image: File): Promise<MediaAsset> => {
  const token: string = await getValidToken()

  const formData: FormData = new FormData()
  const blob = new Blob([image], { type: image.type })

  formData.append('image', blob, image.name)
  formData.append('uuid', assetUuid)
  formData.append('channel_id', channel_id)

  const response: AxiosResponse<MediaAsset> = await axios.post(
    `${API_BASE_URL}/v1/asset`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data
}

export const deleteImageAsset = async (assetId: string): Promise<void> => {
  const token: string = await getValidToken()

  await axios.delete(
    `${API_BASE_URL}/v1/asset/${assetId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    },
  )
}
