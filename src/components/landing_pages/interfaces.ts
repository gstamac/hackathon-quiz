import { EncryptionStatus, MessagesType } from '../messages/interfaces'

export interface E2eEncryptionProps {
  encryptionStatus: EncryptionStatus
  setEncryptionStatus: (status: EncryptionStatus) => void
}

export interface MessagesProps {
  type: MessagesType
}

export interface GroupChatProps {
  groupUuid?: string
  channelId?: string
}
