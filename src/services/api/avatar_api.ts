import {
  AxiosResponse,
  default as axios,
  CancelToken,
} from 'axios'
import { API_BASE_URL } from '../../constants'

export const getAvatar = async (uuid: string, cancelToken?: CancelToken): Promise<string> => {

  const response: AxiosResponse<string> =
    await axios.get(`${API_BASE_URL}/v1/avatar/${uuid}`,{
      cancelToken,
      responseType: 'arraybuffer',
    })

  return `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`
}
