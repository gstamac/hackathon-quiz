import * as auth from '../../components/auth'
import * as messaging_service_sdk from '@globalid/messaging-service-sdk'
import * as block_users_api from './block_users_api'

jest.mock('../../components/auth')
jest.mock('@globalid/messaging-service-sdk')
jest.mock('../../init')

describe('Blocked Users API', () => {
  const blockUserMock: jest.Mock = jest.fn()
  const getBlockedUserMock: jest.Mock = jest.fn()
  const getUserBlocksMock: jest.Mock = jest.fn()
  const unblockUserMock: jest.Mock = jest.fn()
  const getTokenMock: jest.Mock = jest.fn()
  const token: string = 'token'

  beforeAll(() => {
    (<jest.Mock> messaging_service_sdk.blockUser) = blockUserMock;
    (<jest.Mock> messaging_service_sdk.getBlockedUser) = getBlockedUserMock;
    (<jest.Mock> messaging_service_sdk.getUserBlocks) = getUserBlocksMock;
    (<jest.Mock> messaging_service_sdk.unblockUser) = unblockUserMock;
    (<jest.Mock> auth.getValidToken) = getTokenMock
  })

  beforeEach(() => {
    getTokenMock.mockReturnValue(token)
  })

  it('should call blockUser api', async () => {
    await block_users_api.blockUser('test')
    expect(blockUserMock).toHaveBeenCalledWith(token, { user_id: 'test' })
  })

  it('should call getBlockedUser api', async () => {
    await block_users_api.getBlockedUser('test')
    expect(getBlockedUserMock).toHaveBeenCalledWith(token, { user_id: 'test' })
  })

  it('should call getUserBlocks api', async () => {
    await block_users_api.getUserBlocks({ per_page: 100 })
    expect(getUserBlocksMock).toHaveBeenCalledWith(token, { per_page: 100 })
  })

  it('should call unblockUser api', async () => {
    await block_users_api.unblockUser('test')
    expect(unblockUserMock).toHaveBeenCalledWith(token, { user_id: 'test' })
  })
})
