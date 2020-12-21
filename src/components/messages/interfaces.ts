import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import * as messaging_sdk from '@globalid/messaging-service-sdk'

export interface MessagesContentProps {
  channelId?: string
  groupUuid?: string
  type: MessagesType
  encryptionStatus: EncryptionStatus
  setEncryptionStatus: (status: EncryptionStatus) => void
}

export interface ChannelsWrapperProps {
  folderType: MessagesType
  encryptionStatus: EncryptionStatus
  groupUuid?: string
  channelId?: string
}

export interface ChannelCreateProps {
  onCreate: () => void
}

export enum MessagesType {
  PRIMARY = 't',
  GROUPS = 'g',
  OTHER = 'm',
}

export enum ChannelFoldersType {
  GENERAL= 'GENERAL',
  UNKNOWN= 'UNKNOWN',
}

export enum EncryptionStatus {
  DISABLED,
  ENABLED,
  PENDING,
  POLLING,
  KEY_MANAGER_INITIALIZED,
}

export type IdentityByUUID = {
  [key: string]: PublicIdentity | undefined
}

export interface ChatInformation {
  identity: PublicIdentity
  showOwner: boolean | undefined
  readOnly: boolean
  hiddenMembers: boolean
  isHiddenMember: boolean
}

export type UseChatContainerResponse = ChatInformation | null

export interface ChannelFoldersCounters {
  [MessagesType.PRIMARY]: number
  [MessagesType.GROUPS]: number
  [MessagesType.OTHER]: number
}

export interface ChannelFoldersIds {
  [MessagesType.PRIMARY]: string
  [MessagesType.GROUPS]?: string
  [MessagesType.OTHER]: string
}

export interface ChannelFolderProps {
  counters: ChannelFoldersCounters
}

export interface PaginationMetaParams extends Omit<messaging_sdk.PaginationMetaParams, 'per_page' | 'page'> {
  page: number
  per_page: number
}

export interface PaginationMeta extends PaginationMetaParams {
  filteredOneOrMorePage: boolean
  isLastPage: boolean
}

export interface AddGroupChannelHookProps {
  groupUuid: string | undefined
}

export interface AddGroupChannelHookResults {
  addChannelDisabled: boolean
}

export interface UseMessagesResponse {
  encryptionStatus: EncryptionStatus
  type: string
  groupUuid: string | undefined
  channelId: string | undefined
  setEncryptionStatus: React.Dispatch<React.SetStateAction<EncryptionStatus>>
}
