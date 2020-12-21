import { getAvatar } from './avatar_api'
import { avatarMock, avatarBinary } from '../../../tests/mocks/avatar_mocks'
import axios, { CancelToken } from 'axios'

jest.mock('axios')

describe('Avatar', () => {
  describe('getAvatar', () => {

    const cancelTokenMock: CancelToken = {
      throwIfRequested: jest.fn(),
      promise: new Promise(jest.fn()),
    }

    const axiosGetMock: jest.Mock = jest.fn()

    beforeEach(() => {
      (<jest.Mock> axios.get) = axiosGetMock
    })

    it('Should get generated dynamic avatar for the privided uuid', async () => {
      axiosGetMock.mockResolvedValue({
        data: avatarBinary,
      })

      const uuid: string = '8d259467-3796-4d98-990e-452ced2791e1'

      const avatar: string = await getAvatar(uuid, cancelTokenMock)

      expect(avatar).toEqual(avatarMock)
      expect(axiosGetMock).toHaveBeenCalledTimes(1)
      expect(axiosGetMock).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/v1/avatar/${uuid}`, {
        cancelToken: cancelTokenMock,
        responseType: 'arraybuffer',
      })
    })
  })
})

jest.unmock('axios')
