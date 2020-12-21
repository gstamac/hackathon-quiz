import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { MessageData, ChannelType, MessagePreviewData } from '../../../store/interfaces'
import { Typing, PaginationMetaParams, MessageSeen, Folder } from '@globalid/messaging-service-sdk'
import { IdentityByUUID, MessagesType } from '../interfaces'
import { EntityState } from '@reduxjs/toolkit'
import { useStyles } from './styles'

export type ChatMessageCards = JSX.Element

export interface ChatMessageProps {
  me: PublicIdentity
  channelId: string
  showOwner: boolean | undefined
  isHiddenMember: boolean
}

export enum MessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
  DELETED = 'DELETED',
  ENCRYPTED_TEXT = 'ENCRYPTED_TEXT',
  CARD_VIEW = 'CARD_VIEW',
  ENCRYPTED_CARD_VIEW = 'ENCRYPTED_CARD_VIEW',
  CARD_DUAL_VIEW = 'CARD_DUAL_VIEW',
  ENCRYPTED_CARD_DUAL_VIEW = 'ENCRYPTED_CARD_DUAL_VIEW',
  MEDIA = 'MEDIA',
  ENCRYPTED_MEDIA = 'ENCRYPTED_MEDIA',
  MEDIA_WITH_TEXT = 'MEDIA_WITH_TEXT',
  MEDIA_WITH_ENCRYPTED_TEXT = 'MEDIA_WITH_ENCRYPTED_TEXT',
}

export type MessageCardByTypeMap = (
  prevMessage: MessageData | null ,
  message: MessageData,
  nextMessage: MessageData | null
) => ChatMessageCards

export type ChannelTypeKeys = keyof typeof ChannelType

export interface TypingDetails {
  mappedMessages: ChatMessageCards[]
  identities: IdentityByUUID
  membersWithoutUser: string[]
  channelType: ChannelTypeKeys
  typing: Typing | undefined
  lastMessageTime: string | undefined
}

export interface ChatContainerProps {
  messagesType: MessagesType
  channelId: string
}

export interface SelectorsData {
  typing: Typing | undefined
  messagesEntity: EntityState<MessageData> | undefined
  messageSeen: MessageSeen | null | undefined
  meta: PaginationMetaParams | undefined
  identities: IdentityByUUID | null
  lastMessage: MessagePreviewData | undefined
  channelParticipants: string[] | undefined
  folderId: string | null | undefined
  folders: Folder[]
}

export type classesType = ReturnType<typeof useStyles>

export enum ChannelPermission {
  READONLY = 'READONLY',
}
