import { CountersWithPaginationMeta, Folder, GroupCountersWithPaginationMeta, GroupCounter } from '@globalid/messaging-service-sdk'
import { createAsyncThunk, createSlice, PayloadAction, Slice, unwrapResult } from '@reduxjs/toolkit'
import { RootState } from 'RootType'
import {
  ChannelFoldersCounters,
  ChannelFoldersIds,
  ChannelFoldersType,
  MessagesType,
} from '../components/messages/interfaces'
import { fetchCounters } from '../services/api'
import { ChannelType, CountersSlice, FulfilledAction, KeyValueObject, ThunkAPI } from './interfaces'

const initialState: CountersSlice = {
  isFetchingAll: false,
  isFetchingPrimaryCounter: false,
  isFetchingGroupsCounter: false,
  isFetchingOtherCounter: false,
  counters: {},
  groupUnreadChannelCounters: {},
}

export const prepareAndFetchFolderCounter = createAsyncThunk<void, undefined, ThunkAPI>(
  'counters/prepareAndFetchFolderCounter',
  async (_, { getState, dispatch }) => {
    const folders: Folder[] = getState().channels.folders
    const primaryFolderId: string | undefined = folders.find(folder => folder.type === ChannelFoldersType.GENERAL)?.id
    const otherFolderId: string | undefined = folders.find(folder => folder.type === ChannelFoldersType.UNKNOWN)?.id

    if (primaryFolderId !== undefined && otherFolderId !== undefined) {
      const fetchFoldersCountersPayload: ChannelFoldersIds = {
        [MessagesType.PRIMARY]: primaryFolderId,
        [MessagesType.OTHER]: otherFolderId,
      }

      await dispatch(fetchFoldersCounters(fetchFoldersCountersPayload))
    }
  }
)

export const fetchFoldersCounters = createAsyncThunk<void, ChannelFoldersIds,ThunkAPI>(
  'counters/fetchFoldersCounters',
  async (folderIds: ChannelFoldersIds, { dispatch }) => {
    await dispatch(fetchPrimaryFolderCounter(folderIds[MessagesType.PRIMARY]))
    await dispatch(fetchOtherFolderCounter(folderIds[MessagesType.OTHER]))

  }, {
    condition: (_arg: ChannelFoldersIds, thunkAPI) => {
      const {
        counters: countersState,
      }: RootState = thunkAPI.getState()

      return !countersState.isFetchingAll
    },
  }
)
export const fetchPrimaryFolderCounter = createAsyncThunk(
  'counters/fetchPrimaryFolderCounter',
  async (primaryFolderId: string) => {
    const primaryCounter: CountersWithPaginationMeta = await fetchCounters({
      folder_ids: [primaryFolderId],
      channelTypes: [ChannelType.PERSONAL, ChannelType.MULTI],
    })

    return primaryCounter.meta.total
  }, {
    condition: (arg: string, thunkAPI) => {
      const {
        counters: countersState,
      }: RootState = <RootState> thunkAPI.getState()

      return !countersState.isFetchingPrimaryCounter
    },
  }
)

export const filterGroupsTotalUnread = (
  fetchedGroupCounters: GroupCounter[],
  fetchedGroupUuids: string[],
  totalUnread: number,
): number => fetchedGroupCounters.reduce<number>((count: number, groupCounter: GroupCounter) => {
  if (!fetchedGroupUuids.includes(groupCounter.group_uuid)) {
    return count - groupCounter.unread_channel_count
  }

  return count
}, totalUnread)

export const filterGroupCounters = (
  fetchedGroupCounters: GroupCounter[],
  fetchedGroupUuids: string[],
): GroupCounter[] => fetchedGroupCounters.filter((counter: GroupCounter) => (
  fetchedGroupUuids.includes(counter.group_uuid)
))

export const fetchOtherFolderCounter = createAsyncThunk(
  'counters/fetchOtherFolderCounter',
  async (otherFolderId: string) => {

    const otherCounter: CountersWithPaginationMeta = await fetchCounters({
      folder_ids: [otherFolderId],
      channelTypes: [ChannelType.PERSONAL, ChannelType.MULTI],
    })

    return otherCounter.meta.total
  }, {
    condition: (arg: string, thunkAPI) => {
      const {
        counters: countersState,
      }: RootState = <RootState> thunkAPI.getState()

      return !countersState.isFetchingOtherCounter
    },
  }
)
const countersSlice: Slice<CountersSlice> = createSlice({
  name: 'counters',
  initialState,
  reducers: {
    setIsFetchingAll (state: CountersSlice, action: PayloadAction<boolean>) {
      state.isFetchingAll = action.payload
    },
    incrementChannelCounter (state: CountersSlice, action: PayloadAction<MessagesType>) {
      state.counters[action.payload] += 1
    },
    decrementChannelCounter (state: CountersSlice, action: PayloadAction<MessagesType>) {
      if (state.counters[action.payload] > 0) {
        state.counters[action.payload] -= 1
      }
    },
  },
  extraReducers: {
    [fetchFoldersCounters.fulfilled.type]: state => {
      state.isFetchingAll = false
    },
    [fetchFoldersCounters.rejected.type]: state => {
      state.counters = {}
      state.isFetchingAll = false
    },
    [fetchPrimaryFolderCounter.fulfilled.type]: (state, action:
      FulfilledAction<number, ChannelFoldersCounters>) => {
      state.counters[MessagesType.PRIMARY] = action.payload
      state.isFetchingPrimaryCounter = false
    },
    [fetchPrimaryFolderCounter.rejected.type]: state => {
      state.counters[MessagesType.PRIMARY] = 0
      state.isFetchingPrimaryCounter = false
    },
    [fetchOtherFolderCounter.fulfilled.type]: (state, action:
      FulfilledAction<number, ChannelFoldersCounters>) => {
      state.counters[MessagesType.OTHER] = action.payload
      state.isFetchingOtherCounter = false
    },
    [fetchOtherFolderCounter.rejected.type]: state => {
      state.counters[MessagesType.OTHER] = 0
      state.isFetchingOtherCounter = false
    },
  },
})

export const {
  setIsFetching,
  incrementChannelCounter,
  decrementChannelCounter,
  setMembers,
  setMemberIds,
  setChannelUnreadCount,
  setChannelUnreadCounts,
  setIsFetchingAll,
  setMeta,
  removeChannel,
  addChannel,
  setFetchingFileToken,
  setFileToken,
} = countersSlice.actions

export default countersSlice.reducer
