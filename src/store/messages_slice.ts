import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
  createEntityAdapter,
  EntityAdapter,
  EntityState,
  Slice,
} from '@reduxjs/toolkit'
import {
  MessagesWithPaginationMeta,
  Message,
  MessageSeen,
  Typing,
  MessageTemplateEncryptedText,
  MessageContent,
  MessagePreview,
  MessageTemplateMediaWithEncryptedText,
  MessageTemplateMedia,
} from '@globalid/messaging-service-sdk'
import { getChannelMessages, setMessageDelivered, setMessageSeen } from '../services/api'
import { RootState } from 'RootType'
import { validateObjectKeys, getEncryptedMessageContent, getMessageCardContent } from '../utils'
import {
  FetchMessagesParams,
  SeenMessagesParams,
  FulfilledAction,
  RejectedAction,
  MessagesSlice,
  KeyValuePayload,
  MessageData,
  MessageDataWithPaginationMeta,
  MessagePreviewData,
  ThunkAPI,
  FetchMembersFromMessagesParams,
} from './interfaces'
import { deviceKeyManager } from '../init'
import { getEncryptedChannelSecret } from './selectors'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { uniq } from 'lodash'
import { fetchMembers } from './channels_slice/channels_slice'

const MessagesSliceState: MessagesSlice = {
  isFetching: {},
  messages: {},
  errors: {},
  meta: {},
  message_seen: {},
  last_message_seen: {},
  typing: {},
}

const encryptedTextMessageContentValidationKeys: string[] = ['ciphertext', 'encryption_header']
const mediaMessageContentValidationKeys: string[] = ['text', 'assets', 'list_view_type']

export const getMediaMessageContent = (message: MessageContent): MessageTemplateMedia | null => {
  try {
    const parsedContent: MessageTemplateMedia = JSON.parse(message.content)

    validateObjectKeys(parsedContent, mediaMessageContentValidationKeys)

    return parsedContent
  } catch (error) {
    return null
  }
}

export const messageToRedux = async (message: Message, encryptedChannelSecret?: string): Promise<MessageData> => ({
  ...message,
  errored: false,
  parsedContent: await getMessageCardContent(message, encryptedChannelSecret),
})

export const messagePreviewToRedux = async (
  messagePreview: MessagePreview,
  encryptedChannelSecret?: string
): Promise<MessagePreviewData> => ({
  ...messagePreview,
  parsedContent: await getMessageCardContent(messagePreview, encryptedChannelSecret),
})

export const getEncryptedMediaMessageContent = (message: MessageContent): MessageTemplateEncryptedText | null => {
  try {
    const parsedMediaContent: MessageTemplateMediaWithEncryptedText = JSON.parse(message.content)

    if (parsedMediaContent.text !== undefined) {
      const parsedContent: MessageTemplateEncryptedText = {
        ciphertext: parsedMediaContent.text.ciphertext,
        encryption_header: parsedMediaContent.encryption_header,
      }

      validateObjectKeys(parsedContent, encryptedTextMessageContentValidationKeys)

      return parsedContent
    }

    return null
  } catch (error) {
    return null
  }
}

const getMembersFromMessages = (messages: Message[]): string[] => uniq(
  messages.map((message: Message) => message.author)
)

const fetchMembersFromMessages = async ({
  dispatch,
  channelId,
  messages,
  channelParticipants,
}: FetchMembersFromMessagesParams): Promise<void> => {
  const messageAuthors: string[] = getMembersFromMessages(messages)
  const messageAuthorsFromParticipants = messageAuthors.filter((author: string) => (
    channelParticipants !== undefined && channelParticipants.includes(author)
  ))

  await dispatch(fetchMembers({
    channel_id: channelId,
    member_ids: messageAuthorsFromParticipants,
  }))
}

export const fetchChannelMessages = createAsyncThunk<MessageDataWithPaginationMeta, FetchMessagesParams, ThunkAPI>(
  'messages/fetchChannelMessages',
  async (
    {channelId, page, per_page}: FetchMessagesParams,
    { dispatch, getState }
  ): Promise<MessageDataWithPaginationMeta> => {
    dispatch(setIsFetching({
      key: channelId,
      value: true,
    }))

    const channelParticipants: string[] | undefined = getState().channels.channels[channelId]?.channel.participants

    const messagesWithPaginationMeta: MessagesWithPaginationMeta = await getChannelMessages(
      channelId,
      { page, per_page }
    )

    await fetchMembersFromMessages({
      dispatch,
      channelId,
      messages: messagesWithPaginationMeta.data.messages,
      channelParticipants,
    })

    const encryptedSecret: string | undefined = getEncryptedChannelSecret(
      channelId
    )(getState())

    return {
      messages: await Promise.all(
        messagesWithPaginationMeta.data.messages
          .map(async (message: Message) => messageToRedux(message, encryptedSecret))
      ),
      message_seen: messagesWithPaginationMeta.data.message_seen,
      meta: messagesWithPaginationMeta.meta,
    }
  }, {
    condition: (params: FetchMessagesParams, thunkAPI) => {
      const messagesState: MessagesSlice = (thunkAPI.getState()).messages

      const channel_id: string = params.channelId
      const messages: EntityState<MessageData> | undefined= messagesState.messages[channel_id]
      const totalFetchedMessages: number = messages ? messagesSelectors.selectAll(messages).length: 0

      const channelTotal: number | undefined = messagesState.meta[channel_id]?.total

      return !messagesState.isFetching[channel_id]
      && (totalFetchedMessages < params.page * params.per_page)
      && (channelTotal ? (totalFetchedMessages < channelTotal): true)
    },
  }
)

export const setChannelMessages = createAsyncThunk(
  'messages/setChannelMessages',
  async (
    setMessagesParams: KeyValuePayload<MessagesWithPaginationMeta>,
    thunkAPI,
  ): Promise<MessageDataWithPaginationMeta> => {
    const encryptedSecret: string | undefined = getEncryptedChannelSecret(
      setMessagesParams.key
    )(<RootState>thunkAPI.getState())

    return {
      messages: await Promise.all(
        setMessagesParams.value.data.messages.map(async (message: Message) => messageToRedux(message, encryptedSecret))
      ),
      message_seen: setMessagesParams.value.data.message_seen,
      meta: setMessagesParams.value.meta,
    }
  },
)

export const parseChannelMessage = async (
  message: Message,
  encryptedSecret?: string,
): Promise<MessageData> => {
  const encryptedContent: MessageTemplateEncryptedText | null = getEncryptedMessageContent(message)

  const messageData: MessageData = await messageToRedux(message)

  if (encryptedSecret === undefined || encryptedContent === null) {
    return messageData
  }

  const decryptedMessageContent: string = await deviceKeyManager.decrypt(encryptedSecret, encryptedContent)

  return {
    ...messageData,
    parsedContent: decryptedMessageContent,
  }

}

export const upsertAndParseChannelMessage = createAsyncThunk(
  'messages/upsertAndParseChannelMessage',
  async (message: Message, thunkAPI): Promise<MessageData> => {

    const encryptedSecret: string | undefined = getEncryptedChannelSecret(
      message.channel_id,
    )(<RootState>thunkAPI.getState())

    return parseChannelMessage(message, encryptedSecret)
  },
)

export const upsertAndParseChannelMessages = createAsyncThunk(
  'messages/upsertAndParseChannelMessages',
  async (payload: KeyValuePayload<Message[]>, thunkAPI): Promise<MessageData[]> => {

    const encryptedSecret: string | undefined = getEncryptedChannelSecret(payload.key)(<RootState>thunkAPI.getState())

    return Promise.all(payload.value.map(async (message: Message) => parseChannelMessage(message, encryptedSecret)))
  },
)

const getLastMessage = (
  channel_id: string,
  identityUuid: string,
  messagesState: MessagesSlice
): MessageData | undefined => {
  const messages = <EntityState<MessageData>>messagesState.messages[channel_id]
  const messagesData = messagesSelectors.selectAll(messages)
  const filteredMessages
    = messagesData
      .filter(message => message.id !== undefined && message.author !== identityUuid)

  return filteredMessages.length > 0 ?
    filteredMessages.reduce<MessageData>((prev: MessageData, current: MessageData) => (
      prev.sequence_id && current.sequence_id ?
        (prev.sequence_id > current.sequence_id) ?
          prev : current : prev),
    filteredMessages[0]
    ) : undefined
}

export const setMessagesSeenAndDelieveredForChannel = createAsyncThunk(
  'messages/setMessagesSeenAndDelieveredForChannel',
  async (params: SeenMessagesParams, thunkAPI) => {

    thunkAPI.dispatch(setIsFetching({
      key: `${params.channel_id}-seen-${params.identityUuid}`,
      value: true,
    }))

    const identityState: PublicIdentity | undefined = (<RootState>thunkAPI.getState()).identity.identity

    const messagesState: MessagesSlice = (<RootState>thunkAPI.getState()).messages
    const lastMessage = getLastMessage(params.channel_id, params.identityUuid, messagesState)

    if (lastMessage) {
      if (!lastMessage.delivered && lastMessage.author !== identityState?.gid_uuid) {
        await setMessageDelivered(<string>lastMessage.id)
      }

      const lastMessageSeen = await setMessageSeen(<string>lastMessage.id)

      thunkAPI.dispatch(setLastMessageSeen(lastMessageSeen))
    }

    thunkAPI.dispatch(setIsFetching({
      key: `${params.channel_id}-seen-${params.identityUuid}`,
      value: false,
    }))
  }, {
    condition: (params: SeenMessagesParams, thunkAPI) => {
      const messagesState: MessagesSlice = (<RootState>thunkAPI.getState()).messages

      const lastMessage: MessageData | undefined = getLastMessage(params.channel_id, params.identityUuid, messagesState)
      const lastMessageSeen: MessageSeen | undefined = messagesState.last_message_seen[params.channel_id]

      const wasLastMessageSeen = lastMessageSeen !== undefined ? lastMessageSeen.message_id === lastMessage?.id : false

      const isFetching: boolean | undefined = messagesState.isFetching[`${params.channel_id}-seen-${params.identityUuid}`]

      return messagesState.messages[params.channel_id] !== undefined && !wasLastMessageSeen && !isFetching
    },
  }
)

export const setChannelMessageDelivered = createAsyncThunk(
  'messages/setChannelMessageDelivered',
  async (message: Message, thunkAPI) => {

    const identityState: PublicIdentity | undefined = (<RootState>thunkAPI.getState()).identity.identity

    if (message.author !== identityState?.gid_uuid) {
      await setMessageDelivered(message.id)
    }
  },
)

const messagesAdapter: EntityAdapter<MessageData> = createEntityAdapter<MessageData>({
  selectId: (message: MessageData) => message.uuid,
  sortComparer: (a: MessageData, b: MessageData) => Date.parse(b.created_at) - Date.parse(a.created_at),
})

const messagesSlice: Slice<MessagesSlice> = createSlice({
  name: 'messages',
  initialState: MessagesSliceState,
  reducers: {
    removeChannelMessages (state: MessagesSlice, action: PayloadAction<string>) {
      state.messages[action.payload] = undefined
      state.meta[action.payload] = undefined
      state.isFetching[action.payload] = undefined
      state.errors[action.payload] = undefined
    },
    setIsFetching (state: MessagesSlice, action: PayloadAction<KeyValuePayload<boolean>>) {
      state.isFetching[action.payload.key] = action.payload.value
    },
    removeChannelMessage (state: MessagesSlice, action: PayloadAction<KeyValuePayload<string>>) {
      const channel_id: string = action.payload.key

      state.messages[channel_id] = messagesAdapter.removeOne(
        <EntityState<MessageData>>state.messages[channel_id],
        action.payload.value,
      )
    },
    setFailedChannelMessage (state: MessagesSlice, action: PayloadAction<KeyValuePayload<{ uuid: string }>>) {
      const channel_id: string = action.payload.key

      state.messages[channel_id] = messagesAdapter.updateOne(
        <EntityState<MessageData>>state.messages[channel_id],
        {
          id: action.payload.value.uuid,
          changes: {
            errored: true,
          },
        }
      )
    },
    setDelieveredMessage (state: MessagesSlice, action: PayloadAction<KeyValuePayload<{ uuid: string }>>) {
      const channel_id: string = action.payload.key

      if (state.messages[channel_id]) {
        state.messages[channel_id] = messagesAdapter.updateOne(
        <EntityState<MessageData>>state.messages[channel_id],
        {
          id: action.payload.value.uuid,
          changes: {
            delivered: true,
          },
        })
      }
    },
    setSeenMessage (state: MessagesSlice, action: PayloadAction<KeyValuePayload<MessageSeen>>) {
      const channel_id: string = action.payload.key

      state.message_seen[channel_id] = action.payload.value
    },
    addChannelMessage (state: MessagesSlice, action: PayloadAction<KeyValuePayload<MessageData>>) {
      if (state.messages[action.payload.key] !== undefined) {
        state.messages[action.payload.key] = messagesAdapter.upsertOne(
          <EntityState<MessageData>>state.messages[action.payload.key],
          action.payload.value,
        )
      } else {
        const initialMessagesState = messagesAdapter.getInitialState()

        state.messages[action.payload.key] = messagesAdapter.upsertOne(
          initialMessagesState,
          action.payload.value
        )
      }
    },
    setLastMessageSeen (state: MessagesSlice, action: PayloadAction<MessageSeen>) {
      state.last_message_seen[action.payload.channel_id] = action.payload
    },
    setTyping (state: MessagesSlice, action: PayloadAction<Typing>) {
      state.typing[action.payload.channel_id] = action.payload
    },
    resetTyping (state: MessagesSlice, action: PayloadAction<{channelId: string}>) {
      delete state.typing[action.payload.channelId]
    },
  },
  extraReducers: {
    [fetchChannelMessages.fulfilled.type]: (
      state: MessagesSlice,
      action: FulfilledAction<MessageDataWithPaginationMeta, FetchMessagesParams>
    ) => {
      const channel_id: string = action.meta.arg.channelId

      if (state.messages[channel_id] !== undefined) {

        state.messages[channel_id] = messagesAdapter.upsertMany(
          <EntityState<MessageData>>state.messages[channel_id],
          action.payload.messages
        )

        state.meta[channel_id] = action.payload.meta
      } else {
        const initialMessagesState = messagesAdapter.getInitialState()

        state.messages[channel_id] = messagesAdapter.addMany(initialMessagesState, action.payload.messages)

        state.meta[channel_id] = action.payload.meta
      }
      state.message_seen = {
        ...state.message_seen,
        [channel_id]: action.payload.message_seen,
      }
      state.isFetching[channel_id] = false
      state.errors[channel_id] = false
    },
    [fetchChannelMessages.rejected.type]: (state: MessagesSlice, action: RejectedAction<FetchMessagesParams>) => {
      state.isFetching[action.meta.arg.channelId] = false
      state.errors[action.meta.arg.channelId] = true
    },
    [upsertAndParseChannelMessage.fulfilled.type]: (
      state: MessagesSlice,
      action: FulfilledAction<MessageData, Message>
    ) => {
      const channel_id: string = action.payload.channel_id

      if (state.messages[channel_id] !== undefined) {
        state.messages[channel_id] = messagesAdapter.upsertOne(
          <EntityState<MessageData>>state.messages[channel_id],
          action.payload
        )
      } else {
        const initialMessagesState = messagesAdapter.getInitialState()

        state.messages[channel_id] = messagesAdapter.upsertOne(
          initialMessagesState,
          action.payload
        )
      }
    },
    [upsertAndParseChannelMessages.fulfilled.type]: (
      state: MessagesSlice,
      action: FulfilledAction<MessageData[], KeyValuePayload<Message[]>>
    ) => {
      const channel_id: string = action.meta.arg.key

      if (state.messages[channel_id] !== undefined) {
        state.messages[channel_id] = messagesAdapter.upsertMany(
          <EntityState<MessageData>>state.messages[channel_id],
          action.payload
        )
      } else {
        const initialMessagesState = messagesAdapter.getInitialState()

        state.messages[channel_id] = messagesAdapter.upsertMany(
          initialMessagesState,
          action.payload
        )
      }
    },
    [setChannelMessages.fulfilled.type]: (
      state: MessagesSlice,
      action: FulfilledAction<MessageDataWithPaginationMeta, KeyValuePayload<MessagesWithPaginationMeta>>
    ) => {
      const channel_id: string = action.meta.arg.key

      if (state.messages[channel_id] !== undefined) {

        state.messages[channel_id] = messagesAdapter.upsertMany(
          <EntityState<MessageData>>state.messages[channel_id],
          action.payload.messages
        )

        state.meta[channel_id] = action.payload.meta
      } else {
        const initialMessagesState = messagesAdapter.getInitialState()

        state.messages[channel_id] = messagesAdapter.addMany(initialMessagesState, action.payload.messages)

        state.meta[channel_id] = action.payload.meta
      }
      state.message_seen = {
        ...state.message_seen,
        [channel_id]: action.payload.message_seen,
      }
      state.isFetching[channel_id] = false
      state.errors[channel_id] = false
    },
  },
})

export const {
  setLastMessageSeen,
  setIsFetching,
  addChannelMessage,
  setFailedChannelMessage,
  removeChannelMessage,
  removeChannelMessages,
  setTyping,
  resetTyping,
  setDelieveredMessage,
  setSeenMessage,
} = messagesSlice.actions

export default messagesSlice.reducer

export const messagesSelectors = messagesAdapter.getSelectors()
