import { getValidToken } from '../../components/auth'
import { GidUUID } from '../../store/interfaces'
import {
  BlockedUser,
  BlockedUserParams,
  PaginationQueryParams,
  BlockedUsersWithPaginationMeta,
  blockUser as blockUserSdk,
  getBlockedUser as getBlockedUserSdk,
  getUserBlocks as getUserBlocksSdk,
  unblockUser as unblockUserSdk,
} from '@globalid/messaging-service-sdk'

export const blockUser = async (userId: GidUUID): Promise<BlockedUser> => {
  const token: string = await getValidToken()

  const parameters: BlockedUserParams = {
    user_id: userId,
  }

  return blockUserSdk(token, parameters)
}

export const getBlockedUser = async (userId: GidUUID): Promise<BlockedUser> => {
  const token: string = await getValidToken()

  const parameters: BlockedUserParams = {
    user_id: userId,
  }

  return getBlockedUserSdk(token, parameters)
}

export const getUserBlocks = async (queryParams: PaginationQueryParams = {}): Promise<BlockedUsersWithPaginationMeta> => {
  const token: string = await getValidToken()

  return getUserBlocksSdk(token, queryParams)
}

export const unblockUser = async (userId: GidUUID): Promise<void> => {
  const token: string = await getValidToken()

  const parameters: BlockedUserParams = {
    user_id: userId,
  }

  return unblockUserSdk(token, parameters)
}
