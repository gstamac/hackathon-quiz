export enum NotificationAction {
  NewChannelCreated = 'NEW_CHANNEL_CREATED',
  NewMessage = 'NEW_MESSAGE_RECEIVED',
  SeenStatus = 'SEEN_STATUS_RECEIVED',
  DeliveryStatus = 'DELIVERY_STATUS_RECEIVED',
  UserBlocked = 'USER_BLOCKED',
  UserUnblocked = 'USER_UNBLOCKED',
  ChannelUpdated = 'CHANNEL_UPDATED',
  DeletedStatusReceived = 'DELETED_STATUS_RECEIVED',
  TypingNotificationReceived = 'TYPING_NOTIFICATION_RECEIVED',
  FolderChanged = 'FOLDER_CHANGED',
  GroupJoined = 'GROUP_JOINED',
  GroupLeft = 'GROUP_LEFT',
  GroupMemberJoined = 'GROUP_MEMBER_JOINED',
  GroupMemberLeft = 'GROUP_MEMBER_LEFT',
  GroupUpdated = 'GROUP_UPDATED',
  GroupDeleted = 'GROUP_DELETED',
}

export interface ServiceNotification {
  action: NotificationAction
  sender: string
  payload: Record<string, unknown>
}

export interface Config {
  access_token: string
}

export interface NotificationClientService {
  subscribe (callback: (channel: string, notification: ServiceNotification) => Promise<void>): string

  unsubscribe (token: string): boolean
}

export interface JoinMemberPayload {
  uuid: string
  gid_uuid: string
}
