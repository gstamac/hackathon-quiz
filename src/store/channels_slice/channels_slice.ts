import { getEncryptedChannelSecret } from '../selectors'
import { createSlice, PayloadAction, createAsyncThunk, Slice, unwrapResult } from '@reduxjs/toolkit'
import {
  ChannelWithParticipants,
  Message,
  CountersWithPaginationMeta,
  Counter,
  Folder,
  GetFoldersQuery,
  FoldersWithPaginationMeta,
  PaginationMetaParams,
  FileToken,
  GetChannelFileTokenParam,
} from '@globalid/messaging-service-sdk'
import { RootState, ThunkAPI, ThunkDispatch } from 'RootType'
import {
  ChannelType,
  FulfilledAction,
  RejectedAction,
  KeyValuePayload,
  MessageData,
  ChannelsSlice,
  ChannelWithMembers,
  ChannelWithParticipantsAndParsedMessage,
  FetchChannelsParams,
  ChannelMembers,
  FetchChannelProps,
  FetchExistingChannelParams,
  LastVisitedFolderState,
} from '../interfaces'
import { Identity, PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { isNil, chain, uniq } from 'lodash'
import { getAvatar } from '../../services/api/avatar_api'
import {
  getChannels,
  getChannelMembers,
  getChannelCounters,
  getFolders,
  getFileToken,
  searchChannels,
  getChannel,
} from '../../services/api/channels_api'
import { areArraysEqual } from '../../utils/general_utils'
import { RESET_STORE_ACTION } from '../../constants'
import { MessagesType } from '../../components/messages/interfaces'
import {
  getChannelStoreKeyFromQueryParam,
  updateChannelUnreadCount,
  shouldFetchFileToken,
  shouldFetchChannel,
  shouldFetchChannels,
  shouldFetchFolders,
  channelToRedux,
  getChannelArray,
  getChannelByParticipants,
  getChannelTitle,
  filterOutFetchedMembers,
  getMemberIdentitesFromStore,
} from './helpers'
import { FetchCountersParams, NonServiceChannelTypes } from './interfaces'
import { getMessageCardContent } from '../../utils'
import { GetChannelParams } from '../../services/api/interfaces'

export const initialState: ChannelsSlice = {
  isFetching: {},
  errors: {},
  channels: {},
  members: {},
  folders: [],
  isFetchingAll: true,
  meta: {},
  fileTokens: {},
  fileTokensFetching: {},
  lastVisitedFolder: {
    folderType: MessagesType.PRIMARY,
    groupUuid: undefined,
    channelId: undefined,
  },
}

export const messageToRedux = async (message: Message, encryptedChannelSecret?: string): Promise<MessageData> => ({
  ...message,
  errored: false,
  parsedContent: await getMessageCardContent(message, encryptedChannelSecret),
})

export const fetchExistingChannel = createAsyncThunk(
  'channels/fetchExistingChannel',
  async ({
    participants,
    groupUuid,
  }: FetchExistingChannelParams, { getState, dispatch }): Promise<ChannelWithParticipants | undefined> => {
    const type = participants.length > 2 ? ChannelType.MULTI : ChannelType.PERSONAL
    const channelFromStore: ChannelWithParticipants | undefined
      = getChannelByParticipants(<RootState>getState(), participants, type, groupUuid)

    const existingChannels: ChannelWithParticipants[] = channelFromStore ?
      [channelFromStore] :
      (await searchChannels({}, {
        participants,
        channelTypes: [
          type,
        ],
        group_uuid: groupUuid,
      })).data.channels

    const foundChannel: ChannelWithParticipants | undefined =
      existingChannels.find((channel: ChannelWithParticipants) =>
        !channel.deleted &&
        areArraysEqual(channel.participants, participants)
      )

    if (foundChannel !== undefined && channelFromStore === undefined) {
      const members: Identity[] = unwrapResult(await dispatch(fetchMembers({
        channel_id: foundChannel.id,
        member_ids: foundChannel.participants.splice(0, 3),
      })))

      const identityGidUuid: string | undefined = (<RootState> getState()).identity.identity?.gid_uuid

      return { ...foundChannel, title: getChannelTitle(foundChannel, identityGidUuid, members) }
    }

    return foundChannel
  })

export const removeChannelIfExistsForParticipants = createAsyncThunk(
  'channels/removeChannelIfExistsForParticipants',
  async ({
    participants,
    groupUuid,
  }: FetchExistingChannelParams, { dispatch }) => {
    const existingChannel: ChannelWithParticipants | undefined
      = <ChannelWithParticipants | undefined>(
        await dispatch(fetchExistingChannel({ participants, groupUuid }))).payload

    if (existingChannel) {
      dispatch(removeChannel(existingChannel))
    }
  })

export const addChannelIfExistsForParticipants = createAsyncThunk(
  'channels/addChannelIfExistsForParticipants',
  async ({
    participants,
    groupUuid,
  }: FetchExistingChannelParams, { dispatch }) => {
    const existingChannel: ChannelWithParticipants | undefined
      = <ChannelWithParticipants | undefined>(
        await dispatch(fetchExistingChannel({ participants, groupUuid }))).payload

    if (existingChannel) {
      dispatch(addChannel(await channelToRedux(existingChannel)))
    }
  })

export const fetchFileToken = createAsyncThunk(
  'channels/fetchFileToken',
  async (props: GetChannelFileTokenParam, thunkAPI): Promise<FileToken> => {
    thunkAPI.dispatch(setFetchingFileToken({
      key: props.channel_id,
      value: true,
    }))

    return getFileToken(props.channel_id)
  }, {
    condition: (props: GetChannelFileTokenParam, thunkAPI) => {
      const { channels }: RootState = <RootState>thunkAPI.getState()

      return shouldFetchFileToken(props.channel_id, channels)
    },
  }
)

export const fetchChannelsCounters = createAsyncThunk(
  'channels/fetchChannelsCounters',
  async (params: FetchCountersParams, thunkAPI) => {
    let page: number = 1

    const allChannelTypes: ChannelType[] = [
      ChannelType.PERSONAL,
      ChannelType.GROUP,
      ChannelType.MULTI,
    ]

    const countersWithMeta: CountersWithPaginationMeta = await getChannelCounters({
      page,
      channelTypes: allChannelTypes,
      group_uuid: params.group_uuid,
    })

    const totalPages: number = countersWithMeta.meta.total / (countersWithMeta.meta.per_page ?? 100)

    let counters: Counter[] = countersWithMeta.data.counters

    page += 1

    while (page <= totalPages) {
      const countersWithMetaPage: CountersWithPaginationMeta = await getChannelCounters({
        page,
        channelTypes: allChannelTypes,
        group_uuid: params.group_uuid,
      })

      counters = [...counters, ...countersWithMetaPage.data.counters]
      page += 1
    }

    thunkAPI.dispatch(setChannelUnreadCounts(counters))
  }
)

export const prepareAndStoreChannel = async (
  channel: ChannelWithParticipants,
  dispatch: ThunkDispatch,
  state: RootState,
): Promise<ChannelWithParticipantsAndParsedMessage> => {
  const members: Identity[] = unwrapResult(await dispatch(fetchMembers({
    channel_id: channel.uuid,
    member_ids: channel.participants.slice(0, 3),
  })))
  const identityGidUuid: string | undefined = state.identity.identity?.gid_uuid

  return channelToRedux({ ...channel, title: getChannelTitle(channel, identityGidUuid, members)})
}

export const retrieveChannel = async (
  channel_id: string,
  dispatch: ThunkDispatch,
  state: RootState,
  params?: GetChannelParams | undefined
): Promise<ChannelWithParticipantsAndParsedMessage> => {
  const channel: ChannelWithParticipants = await getChannel(channel_id, params)

  return prepareAndStoreChannel(channel, dispatch, state)
}

export const fetchChannel = createAsyncThunk(
  'channels/fetchChannel',
  async (props: FetchChannelProps, { dispatch, getState }): Promise<ChannelWithParticipantsAndParsedMessage> => {
    dispatch(setIsFetching({
      key: props.channelId,
      value: true,
    }))
    try {
      const channel: ChannelWithParticipantsAndParsedMessage = await retrieveChannel(
        props.channelId,
        dispatch,
        <RootState> getState(),
        { encrypted: true}
      )

      return channel
    } catch (error) {
      return retrieveChannel(props.channelId, dispatch, <RootState> getState())
    }
  }, {
    condition: ({ channelId, force }: FetchChannelProps, { getState }) => {
      const { channels }: RootState = <RootState> getState()

      return shouldFetchChannel(channelId, force, channels)
    },
  }
)

export const fetchChannels
  = createAsyncThunk<ChannelWithParticipantsAndParsedMessage[], FetchChannelsParams, { state: RootState }>(
    'channels/fetchChannels',
    async (
      queryParams: FetchChannelsParams,
      { dispatch, getState }
    ): Promise<ChannelWithParticipantsAndParsedMessage[]> => {
      const channelStoreKey: string = getChannelStoreKeyFromQueryParam(queryParams)

      const meta: PaginationMetaParams | undefined = getState().channels.meta[channelStoreKey]
      const hasFetchedBefore: boolean = !isNil(meta?.total)

      if (!hasFetchedBefore) {
        dispatch(setIsFetchingAll(true))
      }
      dispatch(setIsFetching({
        key: channelStoreKey,
        value: true,
      }))

      const response = await getChannels({
        channelTypes: queryParams.channelTypes,
        device_id: queryParams.device_id,
        per_page: queryParams.per_page,
        page: queryParams.page,
        folder_ids: queryParams.folder_id ? [queryParams.folder_id] : undefined,
        group_uuid: queryParams.groupUuid,
      })

      dispatch(setMeta({
        key: channelStoreKey,
        value: response.meta,
      }))

      const state: RootState = getState()

      return Promise.all(response.data.channels.map(async (channel: ChannelWithParticipants) =>
        prepareAndStoreChannel(channel, dispatch, state)
      ))
    }, {
      condition: (queryParams: FetchChannelsParams, thunkAPI) => {
        const { channels }: RootState = thunkAPI.getState()

        return shouldFetchChannels(queryParams, channels)
      },
    }
  )

export const isFetchingMembersKey = (channelId: string): string =>
  `members-${channelId}`

export const fetchMembers = createAsyncThunk<Identity[], ChannelMembers, ThunkAPI>(
  'channels/fetchMembers',
  async ({ channel_id, member_ids }: ChannelMembers, { getState, dispatch }): Promise<Identity[]> => {
    dispatch(setIsFetching({
      key: isFetchingMembersKey(channel_id),
      value: true,
    }))

    const membersInStore: string[] | undefined = (<RootState> getState()).channels.channels[channel_id]?.members

    const unFetchedMemberIds: string[] = filterOutFetchedMembers(membersInStore, member_ids)

    if (unFetchedMemberIds.length === 0) {
      return getMemberIdentitesFromStore((<RootState> getState()).channels.members, member_ids)
    }

    const identities: Identity[] = await getChannelMembers(unFetchedMemberIds)

    await Promise.all(identities.map(async (identity: Identity) => {
      if (isNil(identity.display_image_url)) {
        await dispatch(fetchMemberAvatar(identity.gid_uuid))
      }
    }))

    return identities
  },
)

export const fetchFolders = createAsyncThunk(
  'channels/folders',
  async (queryParams: GetFoldersQuery) => {
    const folders: FoldersWithPaginationMeta = await getFolders(queryParams)

    return folders.data.folders
  }, {
    condition: (_queryParams: GetFoldersQuery, thunkAPI) => {
      const { channels }: RootState = <RootState>thunkAPI.getState()

      return shouldFetchFolders(channels)
    },
  }
)

export const fetchMemberAvatar = createAsyncThunk(
  'channels/fetchMemberAvatar',
  async (gid_uuid: string) => getAvatar(gid_uuid)
)

export const setChannels = createAsyncThunk(
  'channels/setChannels',
  async (
    channels: ChannelWithParticipants[], { dispatch, getState }
  ): Promise<ChannelWithParticipantsAndParsedMessage[]> =>
    Promise.all(
      channels.map(async (channel: ChannelWithParticipants): Promise<ChannelWithParticipantsAndParsedMessage> => (
        prepareAndStoreChannel(channel, dispatch, <RootState> getState()))
      )
    )
)

export const setChannel = createAsyncThunk(
  'channels/setChannel',
  async (channel: ChannelWithParticipants, { dispatch, getState }): Promise<ChannelWithParticipantsAndParsedMessage> =>
    prepareAndStoreChannel(channel, dispatch, <RootState> getState())
)

export const setChannelLastMessage = createAsyncThunk(
  'channels/setChannelLastMessage',
  async (payload: KeyValuePayload<Message>, thunkAPI) => {

    const encryptedSecret: string | undefined = getEncryptedChannelSecret(
      payload.value.channel_id
    )(<RootState>thunkAPI.getState())

    return messageToRedux(payload.value, encryptedSecret)
  }
)

export const channelsSlice: Slice<ChannelsSlice> = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setMeta (state: ChannelsSlice, action: PayloadAction<KeyValuePayload<PaginationMetaParams>>) {
      state.meta[action.payload.key] = action.payload.value
    },
    setIsFetchingAll (state: ChannelsSlice, action: PayloadAction<boolean>) {
      state.isFetchingAll = action.payload
    },
    setIsFetching (state: ChannelsSlice, action: PayloadAction<KeyValuePayload<boolean>>) {
      state.isFetching[action.payload.key] = action.payload.value
    },
    setMembers (state: ChannelsSlice, action: PayloadAction<Identity[]>) {
      action.payload.map((identity: Identity) => (
        state.members[identity.gid_uuid] = <PublicIdentity>identity
      ))
    },
    setChannelUnreadCount (state: ChannelsSlice, action: PayloadAction<Counter>) {
      if (state.channels[action.payload.id] !== undefined) {
        (<ChannelWithMembers>state.channels[action.payload.id]).channel.unread_count = action.payload.unread_count
      }
    },
    setChannelUnreadCounts (state: ChannelsSlice, action: PayloadAction<Counter[]>) {
      const counters = action.payload
      const channelArray = getChannelArray(state.channels)

      state.channels = {
        ...state.channels,
        ...chain(channelArray).keyBy('channel.id').mapValues(channel =>
          updateChannelUnreadCount(channel, counters.find(c => c.id === channel.channel.id)?.unread_count)).value(),
      }
    },
    setMemberIds (state: ChannelsSlice, action: PayloadAction<ChannelMembers>) {
      const channel = state.channels[action.payload.channel_id]

      if (channel) {
        channel.members = uniq([...action.payload.member_ids, ...channel.members])
      }
    },
    setFetchingFileToken (state: ChannelsSlice, action: PayloadAction<KeyValuePayload<boolean>>) {
      state.fileTokensFetching[action.payload.key] = action.payload.value
    },
    setFileToken (state: ChannelsSlice, action: PayloadAction<KeyValuePayload<FileToken>>) {
      state.fileTokens[action.payload.key] = action.payload.value
    },
    removeChannel (state: ChannelsSlice, action: PayloadAction<ChannelWithParticipants>) {
      const channel = state.channels[action.payload.id]?.channel

      if (channel) {
        delete state.channels[channel.id]
        const key: string = getChannelStoreKeyFromQueryParam({
          channelTypes: [<NonServiceChannelTypes>channel.type],
          folder_id: channel.folder_id,
        })
        const meta = state.meta[key]

        if (meta) {
          state.meta = {
            ...state.meta,
            [key]: {
              ...meta,
              total: meta.total - 1,
            },
          }
        }
      }
    },
    addChannel (state: ChannelsSlice, action: PayloadAction<ChannelWithParticipantsAndParsedMessage>) {
      const channel = action.payload

      state.channels[channel.id] = { channel, members: [] }
      const key = getChannelStoreKeyFromQueryParam({
        channelTypes: [<NonServiceChannelTypes>channel.type],
        folder_id: channel.folder_id,
      })
      const meta = state.meta[key]

      if (meta) {
        state.meta = {
          ...state.meta,
          [key]: {
            ...meta,
            total: meta.total + 1,
          },
        }
      }
    },
    setLastVisitedFolder (state: ChannelsSlice, action: PayloadAction<LastVisitedFolderState>) {
      state.lastVisitedFolder = action.payload
    },
  },
  extraReducers: {
    [RESET_STORE_ACTION]: (
      state: ChannelsSlice
    ) => {
      Object.assign(state, initialState)
    },
    [fetchChannels.fulfilled.type]: (
      state,
      action: FulfilledAction<ChannelWithParticipantsAndParsedMessage[], FetchChannelsParams>
    ) => {
      state.channels = {
        ...state.channels,
        ...chain(action.payload).keyBy('id').mapValues(channel => ({ channel, members: [] })).value(),
      }
      const channelStoreKey: string = getChannelStoreKeyFromQueryParam(action.meta.arg)

      state.isFetching[channelStoreKey] = false
      state.isFetchingAll = false
    },
    [fetchChannels.rejected.type]: (state, action: RejectedAction<FetchChannelsParams>) => {
      const channelStoreKey: string = getChannelStoreKeyFromQueryParam(action.meta.arg)

      state.isFetching[channelStoreKey] = false
      state.isFetchingAll = false
    },
    [fetchChannel.fulfilled.type]: (
      state,
      action: FulfilledAction<ChannelWithParticipantsAndParsedMessage, FetchChannelProps>
    ) => {
      state.channels[action.meta.arg.channelId] = { channel: action.payload, members: [] }
      state.isFetching[action.meta.arg.channelId] = false
      state.errors[action.meta.arg.channelId] = false
    },
    [fetchChannel.rejected.type]: (state, action: RejectedAction<FetchChannelProps>) => {
      state.isFetching[action.meta.arg.channelId] = false
      state.errors[action.meta.arg.channelId] = true
    },
    [fetchMembers.fulfilled.type]: (state, action: FulfilledAction<Identity[], ChannelMembers>) => {
      const channelId: string = action.meta.arg.channel_id

      action.payload.map((identity: Identity) => (
        state.members[identity.gid_uuid] = <PublicIdentity>identity
      ))
      const channelState: ChannelWithMembers | undefined = state.channels[channelId]

      if (channelState !== undefined) {
        channelState.members = uniq([
          ...channelState.members,
          ...action.payload.map((identity: Identity) => identity.gid_uuid),
        ])
      }
      state.isFetching[isFetchingMembersKey(channelId)] = false
    },
    [fetchMembers.rejected.type]: (state, action: RejectedAction<ChannelMembers>) => {
      const channelId: string = action.meta.arg.channel_id
      const channel: ChannelWithMembers | undefined = state.channels[channelId]

      if (channel) {
        channel.members = []
      }
      state.isFetching[isFetchingMembersKey(channelId)] = false
    },
    [fetchFolders.fulfilled.type]: (state, action: FulfilledAction<Folder[], GetFoldersQuery>) => {
      state.folders = action.payload
    },
    [fetchFolders.rejected.type]: state => {
      state.folders = []
    },
    [fetchMemberAvatar.fulfilled.type]: (state, action: FulfilledAction<string, string>) => {
      const identity: PublicIdentity | undefined = state.members[action.meta.arg]

      if (identity){
        state.members[action.meta.arg] = {
          ...identity,
          display_image_url: action.payload,
        }
      }
    },
    [setChannelLastMessage.fulfilled.type]: (state, action: FulfilledAction<MessageData, KeyValuePayload<Message>>) => {
      const channel_id: string = action.meta.arg.key

      if (state.channels[channel_id] !== undefined) {
        (<ChannelWithMembers>state.channels[channel_id]).channel.message = action.payload
      }
    },
    [setChannels.fulfilled.type]: (
      state,
      action: FulfilledAction<ChannelWithParticipantsAndParsedMessage[], ChannelWithParticipants[]>
    ) => {
      state.channels = {
        ...state.channels,
        ...chain(action.payload).keyBy('id').mapValues(channel => ({ channel, members: [] })).value(),
      }
    },
    [setChannel.fulfilled.type]: (
      state,
      action: FulfilledAction<ChannelWithParticipantsAndParsedMessage, ChannelWithParticipants>
    ) => {
      const newChannel: ChannelWithParticipantsAndParsedMessage = action.payload

      state.channels[action.payload.id] = { channel: newChannel, members: [] }
    },
    [fetchFileToken.fulfilled.type]: (
      state,
      action: FulfilledAction<FileToken, GetChannelFileTokenParam>
    ) => {
      state.fileTokens[action.meta.arg.channel_id] = action.payload
      state.isFetching[action.meta.arg.channel_id] = false
    },
    [fetchFileToken.rejected.type]: (state, action: RejectedAction<GetChannelFileTokenParam>) => {
      state.isFetching[action.meta.arg.channel_id] = false
    },
  },
})

export const {
  setIsFetching,
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
  setLastVisitedFolder,
} = channelsSlice.actions

export default channelsSlice.reducer
