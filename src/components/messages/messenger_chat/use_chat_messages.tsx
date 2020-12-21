import { MessageSeen, PaginationMetaParams, Typing, Folder } from '@globalid/messaging-service-sdk'
import React, { useCallback, useEffect, useState } from 'react'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { messagesSelectors, resetTyping } from '../../../store/messages_slice'
import { RootState } from 'RootType'
import { useDispatch, useSelector } from 'react-redux'
import { EntityState } from '@reduxjs/toolkit'
import { ChannelType, MessageData, MessagePreviewData } from '../../../store/interfaces'
import { getEncryptedChannelSecret } from '../../../store/selectors'
import { messageCardByType } from './get_messages_card_by_type'
import { IdentityByUUID } from '../interfaces'
import { ChatMessageCards, MessageCardByTypeMap, TypingDetails, SelectorsData, classesType } from './interfaces'
import { debounce, pickBy } from 'lodash'
import { ChatBeginningCard } from './chat_message_cards'
import { getChannelBeginningText } from './chat_message_cards/helpers'
import { addBottomCards } from './helpers'
import { getGidNamesByChannelType } from '../channel_header/helpers'
import { getChannelParticipantsByChannelType } from '../channels_list/channels_list_item_helpers'
import { useStyles } from './styles'

const useSelectorsData = (channel_id: string): SelectorsData => {
  const typing: Typing | undefined = useSelector((state: RootState) => (
    state.messages.typing[channel_id]
  ))

  const messagesEntity: EntityState<MessageData> | undefined = useSelector((state: RootState) => (
    state.messages.messages[channel_id]
  ))

  const messageSeen: MessageSeen | null | undefined = useSelector((state: RootState) => (
    state.messages.message_seen[channel_id]
  ))

  const meta: PaginationMetaParams | undefined = useSelector((state: RootState) => (
    state.messages.meta[channel_id]
  ))

  const loadedIdentities: IdentityByUUID | null = useSelector((state: RootState) => (
    state.channels.members
  ))

  const channelParticipants: string[] | undefined = useSelector((state: RootState) => (
    state.channels.channels?.[channel_id]?.channel.participants
  ))

  const identities: IdentityByUUID | null = pickBy(loadedIdentities, (_value: PublicIdentity | undefined, key: string) => channelParticipants?.includes(key))

  const lastMessage: MessagePreviewData | undefined = useSelector((state: RootState) => (
    state.channels.channels?.[channel_id]?.channel.message
  ))

  const folderId: string | null | undefined = useSelector((state: RootState) => (
    state.channels.channels?.[channel_id]?.channel.folder_id
  ))

  const folders: Folder[] = useSelector((state: RootState) => state.channels.folders)

  return {
    typing,
    messagesEntity,
    messageSeen,
    meta,
    identities,
    lastMessage,
    channelParticipants,
    folderId,
    folders,
  }
}

export const useChatMessages = (
  channelId: string,
  channelType: ChannelType | undefined,
  me: PublicIdentity,
  admin: string | undefined,
  isEncrypted: boolean,
  showOwner: boolean | undefined,
  isHiddenMember: boolean,
): ChatMessageCards[] | null => {

  const dispatch = useDispatch()
  const classes: classesType = useStyles()
  const [lastMessageTime, setLastMessageTime] = useState<string | undefined>(undefined)

  const { typing, messagesEntity, messageSeen, meta, identities, lastMessage, channelParticipants, folderId, folders } = useSelectorsData(channelId)

  const encryptedChannelSecret: string | undefined = useSelector(getEncryptedChannelSecret(channelId))

  useEffect(() => {
    if (lastMessage && lastMessage.author !== me.gid_uuid) {
      setLastMessageTime(lastMessage.created_at)
    }
  }, [lastMessage?.author, lastMessage?.created_at])

  const debouncedEndTypingAnimation = useCallback(debounce(() => {
    dispatch(resetTyping({
      channelId,
    }))
  }, 7000), [])

  useEffect(() => {
    debouncedEndTypingAnimation()
  }, [typing])

  if (
    messagesEntity === undefined ||
    meta === undefined ||
    channelParticipants === undefined ||
    identities === null ||
    messageSeen === undefined ||
    channelType === undefined
  ) {
    return null
  }

  const membersWithoutUser: string[] = channelParticipants?.filter((uuid: string) => uuid !== me.gid_uuid)

  const getBeginningOfHistoryText = (): string => {
    const [firstParticipant, secondParticipant] = getChannelParticipantsByChannelType(identities, channelType, membersWithoutUser)

    const displayNames: string[] = [firstParticipant?.gid_name, secondParticipant?.gid_name, me.gid_name].filter((name: string | undefined) => name !== undefined) as string[]

    const displayNamesString: string | null = getGidNamesByChannelType(channelType, displayNames)

    return getChannelBeginningText(channelType, displayNamesString)
  }

  const beginningChatText: string = getBeginningOfHistoryText()

  const beginningOfHistoryMessage = (): JSX.Element => <ChatBeginningCard isEncrypted={isEncrypted} text={beginningChatText}/>
  const currentLoaded: number = (meta.page ?? 1) * (meta.per_page ?? 20)

  const messages: MessageData[] = messagesSelectors.selectAll(messagesEntity)

  const mapMessageCallback: MessageCardByTypeMap = messageCardByType(me, admin, identities, messageSeen?.message_id, channelType, showOwner, encryptedChannelSecret, isHiddenMember)

  const mappedMessages: ChatMessageCards[] = getMappedMessages(messages, mapMessageCallback)

  const typingDetails: TypingDetails = {
    mappedMessages,
    identities,
    membersWithoutUser,
    channelType,
    typing,
    lastMessageTime,
  }

  if (currentLoaded >= meta.total) {
    return [
      ...addBottomCards(typingDetails, folderId, folders, classes),
      beginningOfHistoryMessage(),
    ]
  }

  return addBottomCards(typingDetails, folderId, folders, classes)
}

const getMappedMessages = (messages: MessageData[], mapMessageCallback: MessageCardByTypeMap): ChatMessageCards[] => messages.reduce<ChatMessageCards[]>((
  messageElementArray: ChatMessageCards[],
  currentMessage: MessageData,
  currentIndex: number,
  messagesArray: MessageData[],
) => {
  const nextIndex: number = currentIndex - 1
  const prevIndex: number = currentIndex + 1
  const nextMessage: MessageData | null = nextIndex >= 0 ? messagesArray[nextIndex] : null
  const prevMessage: MessageData | null = messagesArray.length > prevIndex ? messagesArray[prevIndex] : null

  return [...messageElementArray, mapMessageCallback(prevMessage, currentMessage, nextMessage)]
}, [])
