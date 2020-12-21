import React, {useEffect } from 'react'
import { PaginationMetaParams } from '@globalid/messaging-service-sdk'
import { useChatMessages } from './use_chat_messages'
import { useStyles } from './styles'
import { ChatInfiniteScroll, GlobalidLoader } from '../../global'
import { RootState } from 'RootType'
import { useSelector, useDispatch } from 'react-redux'
import { fetchChannelMessages, setMessagesSeenAndDelieveredForChannel } from '../../../store/messages_slice'
import { ChatMessageProps, ChatMessageCards } from './interfaces'
import { setChannelUnreadCount } from '../../../store/channels_slice/channels_slice'
import { ChannelType, ChannelWithParticipantsAndParsedMessage } from '../../../store/interfaces'
import { INITIAL_MESSAGES_COUNT, MESSAGES_PER_PAGE } from '../../../constants'
import { areChannelSecretsPresent } from '../../../store/selectors'

export const ChatMessages: React.FC<ChatMessageProps> = (props: ChatMessageProps) => {

  const classes = useStyles()

  const dispatch = useDispatch()

  const {
    me,
    channelId,
    showOwner,
    isHiddenMember,
  } = props

  const channel: ChannelWithParticipantsAndParsedMessage | undefined =
    useSelector((state: RootState) => state.channels.channels[channelId]?.channel)

  const isEncrypted: boolean =
    useSelector((state: RootState) => areChannelSecretsPresent(state)(channelId))

  const admin: string | undefined = channel?.type === ChannelType.GROUP ? channel?.created_by : undefined

  const chatMessages: ChatMessageCards[] | null = useChatMessages(
    channelId,
    channel?.type as ChannelType | undefined,
    me,
    admin,
    isEncrypted,
    showOwner,
    isHiddenMember,
  )

  const meta: PaginationMetaParams | undefined = useSelector((state: RootState) => (
    state.messages.meta[channelId]
  ))

  const isFetching: boolean | undefined = useSelector((state: RootState) => (
    state.messages.isFetching[channelId]
  ))

  const checkMessagesAsSeenAndDelivered = (): void => {
    dispatch(setMessagesSeenAndDelieveredForChannel({ channel_id: channelId, identityUuid: me.gid_uuid }))
    dispatch(setChannelUnreadCount({ id: channelId, unread_count: 0 }))
  }

  useEffect(() => {
    checkMessagesAsSeenAndDelivered()
  })

  const loadChannelMessages = (page: number): void => {
    dispatch(fetchChannelMessages({
      channelId,
      page: page,
      per_page: MESSAGES_PER_PAGE,
    }))
  }

  useEffect(() => {
    if (meta?.total !== 0 && channel && !isFetching) {
      loadChannelMessages(1)
    }
  }, [JSON.stringify(channel)])

  if (chatMessages === null || meta === undefined) {
    return <div className={classes.centerLoader}>
      <GlobalidLoader/>
    </div>
  }

  const currentPage: number = meta?.page ?? 1
  const allPages: number = meta.total / (meta.per_page ?? 20)

  const hasNextPage: boolean = allPages > currentPage

  const onNextPageLoad = async (): Promise<void> => {
    loadChannelMessages(currentPage + 1)
  }

  return <ChatInfiniteScroll
    className={classes.messagesContainer}
    hasNextPage={hasNextPage}
    onNextPageLoad={onNextPageLoad}
    isFetching={isFetching ?? false}
    listItems={chatMessages}
    initialItemCount={INITIAL_MESSAGES_COUNT}
    reversed
  />
}
