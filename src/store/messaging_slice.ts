import { chain } from 'lodash'

import {
  PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import {
  BlockedUser,
  BlockedUsersWithPaginationMeta,
} from '@globalid/messaging-service-sdk'
import {
  setToastError,
  setToastSuccess,
} from 'globalid-react-ui'
import {
  BlockUserParameters,
  FetchBlockedUsersParameters,
  FetchStatus,
  KeyValuePayload,
  MessagingState,
  FulfilledAction,
  RejectedAction,
} from './interfaces'
import {
  createKeyFromBlockedUsersParameters,
  getBlockedUsersFetchStatusByParameters,
} from './messaging_selectors'
import {
  blockUser as blockUserApi,
  unblockUser as unblockUserApi,
  getUserBlocks,
} from '../services/api/block_users_api'
import { getString } from '../utils/general_utils'
import { RootState } from 'RootType'

const initialState: MessagingState = {
  blockedUsers: {},
  blockedUsersFetchStatusByParameters: {},
}

export const blockUser = createAsyncThunk(
  'messaging/blockUser',
  async (parameters: BlockUserParameters, { dispatch }): Promise<BlockedUser> => {
    try {
      const blockedUser: BlockedUser = await blockUserApi(parameters.gidUuid)

      dispatch(setToastSuccess({
        title: getString('user-blocked-title'),
        message: getString('user-blocked-description').replace('{user}', parameters.gidName),
      }))

      return blockedUser
    } catch (error) {
      dispatch(setToastError({
        title: getString('user-blocked-title-failed'),
        message: getString('user-blocked-description-failed').replace('{user}', parameters.gidName),
      }))

      throw error
    }
  }
)

export const unblockUser = createAsyncThunk(
  'messaging/unblockUser',
  async (parameters: BlockUserParameters, { dispatch }): Promise<void> => {
    try {
      await unblockUserApi(parameters.gidUuid)

      dispatch(setToastSuccess({
        title: getString('user-unblocked-title'),
        message: getString('user-unblocked-description').replace('{user}', parameters.gidName),
      }))

    } catch (error) {
      dispatch(setToastError({
        title: getString('user-unblocked-title-failed'),
        message: getString('user-unblocked-description-failed').replace('{user}', parameters.gidName),
      }))

      throw error
    }
  }
)

export const fetchBlockedUsers = createAsyncThunk(
  'messaging/fetchBlockedUsers',
  async (parameters: FetchBlockedUsersParameters = {}, { dispatch }): Promise<BlockedUsersWithPaginationMeta> => {
    dispatch(setBlockedUsersFetchStatusByParameters({
      key: createKeyFromBlockedUsersParameters(parameters),
      value: FetchStatus.PENDING,
    }))

    return getUserBlocks({
      ...parameters,
      per_page: 1000,
    })
  },
  {
    condition: (parameters: FetchBlockedUsersParameters = {}, { getState }): boolean => {
      const state: RootState = <RootState>getState()

      const fetchStatus: FetchStatus | undefined = getBlockedUsersFetchStatusByParameters(state, parameters)

      if (fetchStatus === FetchStatus.PENDING || fetchStatus === FetchStatus.SUCCESS) {
        return false
      }

      return true
    },
  }
)

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    setBlockedUsersFetchStatusByParameters (
      state: MessagingState,
      action: PayloadAction<KeyValuePayload<FetchStatus>>
    ): void {
      state.blockedUsersFetchStatusByParameters[action.payload.key] = action.payload.value
    },
  },
  extraReducers: {
    [blockUser.fulfilled.type]: (
      state: MessagingState,
      action: FulfilledAction<BlockedUser, BlockUserParameters>
    ): void => {
      const parameters: BlockUserParameters = action.meta.arg

      state.blockedUsers[parameters.gidUuid] = action.payload
    },
    [unblockUser.fulfilled.type]: (
      state: MessagingState,
      action: FulfilledAction<BlockedUser, BlockUserParameters>
    ): void => {
      const parameters: BlockUserParameters = action.meta.arg

      delete state.blockedUsers[parameters.gidUuid]
    },
    [fetchBlockedUsers.fulfilled.type]: (
      state: MessagingState,
      action: FulfilledAction<BlockedUsersWithPaginationMeta, FetchBlockedUsersParameters | undefined>
    ): void => {
      const parameters: FetchBlockedUsersParameters = action.meta.arg ?? {}

      state.blockedUsers = {
        ...state.blockedUsers,
        ...chain(action.payload.data.blocked_users).keyBy('user_id').mapValues(blockedUser => blockedUser).value(),
      }
      const key: string = createKeyFromBlockedUsersParameters(parameters)

      state.blockedUsersFetchStatusByParameters[key] = FetchStatus.SUCCESS
    },
    [fetchBlockedUsers.rejected.type]: (
      state: MessagingState,
      action: RejectedAction<FetchBlockedUsersParameters | undefined>
    ): void => {
      const parameters: FetchBlockedUsersParameters = action.meta.arg ?? {}
      const key: string = createKeyFromBlockedUsersParameters(parameters)

      state.blockedUsersFetchStatusByParameters[key] = FetchStatus.ERROR
    },
  },
})

export const {
  setBlockedUsersFetchStatusByParameters,
} = messagingSlice.actions

export default messagingSlice.reducer
