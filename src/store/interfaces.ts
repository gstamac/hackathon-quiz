import {
  Identity,
  MutualContact,
  PaginationMetaParams,
  PublicIdentity,
} from '@globalid/identity-namespace-service-sdk'
import { ActionReducerMapBuilder, AnyAction, CaseReducer, EntityState, PayloadAction, SerializedError } from '@reduxjs/toolkit'
import {
  BlockedUser,
  Message,
  MessageSeen,
  Typing,
  ChannelWithParticipants,
  FileToken,
  Folder,
  GetMessagesQueryParams,
  MediaPlacement,
} from '@globalid/messaging-service-sdk'
import {
  GroupResponse,
  GroupUuidParam,
  MemberResponse,
  PaginationQueryParams,
  MemberParams,
  PermissionListItem,
  MembersForRoleParams,
  RoleListItem,
  InvitationLinkResponse,
} from '@globalid/group-service-sdk'
import { RootState, ThunkDispatch } from 'RootType'
import { GeneralObject } from '../utils/interfaces'
import { MessagesType } from '../components/messages/interfaces'
import { Agency, App, Category, GetSingleAppSearchRequests, Type } from '@globalid/attestations-types'
import { MeetingResponse } from '../services/api/interfaces'

export type GidName = string
export type GidUUID = string

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare type NoInfer<T> = [T][T extends any ? 0 : never]
export type Builder<S> = ActionReducerMapBuilder<NoInfer<S>>

export type ExtraReducerFulfilled<R, P, S> = CaseReducer<S, FulfilledAction<R, P>>
export type ExtraReducerRejected<P, S> = CaseReducer<S, RejectedAction<P>>

export type ReducerBuilder<B> = (builder: B) => B

export enum FetchStatus {
  ERROR = 'error',
  PENDING = 'pending',
  SUCCESS = 'success',
}

export interface FetchIdentitiesParameters {
  page: number
  text: string
  per_page?: number
}

export interface IdentitiesLookupResult {
  entries: GidUUID[]
  meta: PaginationMetaParams
}

export interface IdentitiesLookupCollection {
  [key: string]: IdentitiesLookupResult | undefined
}

export interface IdentitiesCollection {
  [key: string]: Identity | undefined
}

export interface IdentitiesState {
  identities: IdentitiesCollection
  search: IdentitiesLookupCollection
  fetchStatusByGidName: {
    [key: string]: FetchStatus | undefined
  }
  fetchStatusByGidUUID: {
    [key: string]: FetchStatus | undefined
  }
  fetchStatusByParameters: {
    [key: string]: FetchStatus | undefined
  }
}

export interface BlockUserParameters {
  gidUuid: GidUUID
  gidName: GidName
}

export interface FetchBlockedUsersParameters {
  page?: number
}

export interface BlockedUsersCollection {
  [key: string]: BlockedUser | undefined
}

export interface MessagingState {
  blockedUsers: BlockedUsersCollection
  blockedUsersFetchStatusByParameters: {
    [key: string]: FetchStatus | undefined
  }
}

export interface IdentitySlice {
  identity?: PublicIdentity
  isLoggedIn: boolean
  hasVisited: boolean
}

export interface ContactsSlice {
  contacts?: MutualContact[]
  fetchingContacts: boolean
  meta: PaginationMetaParams
}

export interface FulfilledAction<PromiseResult, ThunkArg> extends AnyAction {
  type: string
  payload: PromiseResult
  meta: {
    requestId: string
    arg: ThunkArg
  }
}

export interface RejectedAction<ThunkArg> extends AnyAction {
  type: string
  payload: unknown
  error: SerializedError | unknown
  meta: {
    requestId: string
    arg: ThunkArg
    aborted: boolean
    condition: boolean
  }
}

export type AsyncThunkReturnAction<PromiseResult, ThunkArg> =
  FulfilledAction<PromiseResult, ThunkArg> | RejectedAction<ThunkArg>

export interface KeyValuePayload<T> {
  key: string
  value: T
}

export interface UpdateMessage {
  id: string
  changes: Message
}

export interface FetchMessagesParams extends GetMessagesQueryParams{
  channelId: string
  page: number
  per_page: number
}

export interface MessageData extends Omit<Message, 'id' | 'sequence_id'> {
  id?: string
  sequence_id?: number
  errored: boolean
  parsedContent: string | null | undefined
}

export interface MessagesSlice {
  isFetching: {
    [key: string]: boolean | undefined
  }
  messages: {
    [key: string]: EntityState<MessageData> | undefined
  }
  errors: {
    [key: string]: boolean | undefined
  }
  meta: {
    [key: string]: PaginationMetaParams | undefined
  }
  message_seen: {
    [key: string]: MessageSeen | undefined | null
  }
  last_message_seen: {
    [key: string]: MessageSeen | undefined
  }
  typing: {
    [key: string]: Typing | undefined
  }
}

export enum GroupsFolderType {
  MY_GROUPS = 'my_groups',
  DISCOVER = 'discover',
}

export interface GlobalGroups {
  [key: string]: GroupResponse | undefined
}

export interface GroupRoles {
  [key: string]: RoleListItem[] | undefined
}

export interface GroupDataByFolderType {
  groupUuids: string[] | undefined
  meta: PaginationMetaParams | undefined
}

export interface GroupMembersParams extends GroupUuidParam {
  hasPermission?: boolean
  page: number
}

export interface GroupMemberWithIdentityFields extends MemberResponse, Identity {
  showOwnerTag?: boolean
}

export interface GroupMembersResponse {
  members: GroupMemberWithIdentityFields[]
  meta: PaginationMetaParams
}

export interface GroupMembers {
  [key: string]: GroupMembersResponse | undefined
}

export type MemberRoles = GeneralObject<RoleListItem[] | undefined>
export type GroupPermissions = GeneralObject<PermissionListItem[] | undefined>
export type GroupInvitationLinks = GeneralObject<InvitationLinkResponse[] | undefined>

export interface RoleMembers {
  members: string[]
  meta: PaginationMetaParams
}

export interface GroupsBySearchText {
  [key: string]: SearchGroupsState | undefined
}

export interface GroupRoleMembers {
  [key: string]: RoleMembers | undefined
}

export interface SearchGroupsState {
  myGroups?: GroupDataByFolderType
  global?: GroupDataByFolderType
}

export interface ApproveOrRejectInvitationParams {
  action: InvitationAction
  invitationUuid: string
}

export interface GroupsSlice {
  isFetching: {
    [key: string]: boolean | undefined
  }
  error: {
    [key: string]: boolean | undefined
  }
  roles: GroupRoles
  roleMembers: GroupRoleMembers
  memberRoles: MemberRoles
  groupPermissions: GroupPermissions
  invitationLinks: GroupInvitationLinks
  groups: GlobalGroups
  members: GroupMembers
  [GroupsFolderType.MY_GROUPS]: GroupDataByFolderType
  [GroupsFolderType.DISCOVER]: GroupDataByFolderType
  messaging: GroupDataByFolderType
  search: GroupsBySearchText
  searchText: string | undefined
}

export interface RemoveGroupMemberParams extends MemberParams {
  gidName: GidName
  groupName: string | undefined
}

export interface SeenMessagesParams {
  channel_id: string
  identityUuid: string
}

export interface Participant {
  gidName: GidName
  gidUuid: GidUUID
  imageUrl?: string
}

export interface MessageDataWithPaginationMeta {
  messages: MessageData[]
  message_seen: MessageSeen | null
  meta: PaginationMetaParams
}

export interface GroupChannel {
  isFetching: boolean
  identities: string[]
}

export interface Groups {
  [key: string]: GroupChannel
}

export interface GroupIdentitiesSlice {
  currentChannelId: string
  groups: Groups
  identities: { [key: string]: PublicIdentity }
}

export type MessagePreviewData = Omit<MessageData, 'channel_id' | 'delivered' | 'errored'>

export interface ChannelWithParticipantsAndParsedMessage extends Omit<ChannelWithParticipants, 'message'> {
  message: MessagePreviewData | undefined
}

export interface ChannelWithMembers {
  channel: ChannelWithParticipantsAndParsedMessage
  members: string[]
}

export type ChannelsType = {
  [key: string]: ChannelWithMembers | undefined
}

export type MemberByUUID = GeneralObject<PublicIdentity | undefined>

export interface FetchChannelsParams {
  channelTypes: ('PERSONAL' | 'MULTI' | 'GROUP')[]
  device_id?: string
  per_page: number
  page: number
  folder_id?: string
  groupUuid?: string
}

export interface ChannelsSlice {
  isFetching: {
    [key: string]: boolean | undefined
  }
  errors: {
    [key: string]: boolean | undefined
  }
  channels: ChannelsType
  members: MemberByUUID
  folders: Folder[]
  isFetchingAll: boolean
  meta: {
    [key: string]: PaginationMetaParams | undefined
  }
  fileTokens: { [key: string]: FileToken | undefined }
  fileTokensFetching: { [key: string]: boolean | undefined }
  lastVisitedFolder: LastVisitedFolderState
}

export interface FetchChannelProps {
  channelId: string
  force?: boolean
}

export interface ChannelMembers {
  channel_id: string
  member_ids: string[]
}

export interface FetchExistingChannelParams {
  participants: string[]
  groupUuid?: string
}

export enum ChannelType {
  'SERVICE' = 'SERVICE',
  'PRESENCE' = 'PRESENCE',
  'PERSONAL' = 'PERSONAL',
  'MULTI' = 'MULTI',
  'GROUP' = 'GROUP'
}

export enum GroupAction {
  LEAVE = 'leave',
  JOIN = 'join',
}

export interface ImageData {
  title?: string
  thumbnail: string
  original: string
}

export interface ImageSlice {
  image?: ImageData
}

export interface FetchGroupsSearchParams {
  text: string
  myGroups: boolean
  page: number
  keepFetchedGroups?: boolean
}

export interface FetchGroupsParams {
  type: GroupsFolderType
  queryParams: PaginationQueryParams
}

export interface GroupDataByType {
  groups: GlobalGroups
  groupUuids: string[]
}

export interface JoinGroupParams {
  group_uuid: string
  gid_uuid: string
  is_hidden: boolean
}

export enum InvitationAction {
  APPROVE = 'approve',
  REJECT = 'reject'
}

export interface KeyValueObject<T> {
  [key: string]: T
}

export interface CountersSlice {
  isFetchingAll: boolean
  isFetchingPrimaryCounter: boolean
  isFetchingGroupsCounter: boolean
  isFetchingOtherCounter: boolean
  counters: KeyValueObject<number>
  groupUnreadChannelCounters: KeyValueObject<number>
}

export interface FetchGroupsByUUIDsParams {
  groupUuids: string[]
  meta: PaginationMetaParams
  isJoined: boolean
}

export interface FetchGroupsByUUIDsResult {
  groupUuids: string[]
  groups: GroupResponse[]
  meta: PaginationMetaParams
  isJoined: boolean
}

export interface FetchGroupsFolderCounterParams {
  page: number
  per_page?: number
}

export type ThunkAPI = { state: RootState }

export interface RemoveGroupRoleParams {
  roleName: string
  groupUuid: string
  roleUuid: string
}

export interface ResignGroupMemberRoleParams extends RemoveGroupRoleParams {
  gidUuid: string
  gidName: string
  isLoggedUserProfile: boolean
}

export interface GroupRoleMembersParams extends MembersForRoleParams {
  page: number
}

export interface ManageMemberRoleParams {
  gidUuid: string
  groupUuid: string
  roleUuids: string[]
}

export interface LastVisitedFolderState {
  folderType: MessagesType
  groupUuid: string | undefined
  channelId: string | undefined
}

export interface AgencyVerificationsParams {
  gidUuid: string
  verificationUuid: string
}

export interface VerificationsUuidParams {
  gidUuid: string
}

export interface VerificationsSlice {
  isFetching: {
    [key: string]: boolean | undefined
  }
  latestVerifications: {
    [key: string]: App.Model[] | undefined
  }
  agencyVerifications: {
    [key: string]: GetSingleAppSearchRequests.Response | undefined
  }
  types: Type.Model[] | undefined
  categories: Category.Model[] | undefined
  agencies: Agency.Model[] | undefined
}

export interface MeetingDetails {
  meetingId: string
  mediaPlacement: MediaPlacement
}

export interface MeetingsSlice {
  isFetching: GeneralObject<boolean | undefined>
  meetings: GeneralObject<MeetingResponse | undefined>
}

export interface CreateMeetingParams {
  channelId: string
}

export interface GetMeetingParams {
  meetingId: string
  channelId: string
}

export enum CreateMeetingError {
  ERR_TOO_MANY_CALLS = 'ERR_TOO_MANY_CALLS' ,
}

export type CreateMeetingAction =
  PayloadAction<MeetingResponse, string, { arg: CreateMeetingParams, requestId: string }, never> |
  PayloadAction<unknown, string, {
    arg: CreateMeetingParams
    requestId: string
    aborted: boolean
    condition: boolean
  }, SerializedError>

export type FetchMeetingAction =
  PayloadAction<MeetingResponse, string, { arg: GetMeetingParams, requestId: string }, never> |
  PayloadAction<unknown, string, {
    arg: GetMeetingParams
    requestId: string
    aborted: boolean
    condition: boolean
  }, SerializedError>

export interface FetchMembersFromMessagesParams {
  dispatch: ThunkDispatch
  channelId: string
  messages: Message[]
  channelParticipants: string[] | undefined
}
