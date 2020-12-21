import {
  IdentityByUUID,
} from '../interfaces'
import { RightSidebarProps } from '../../global/right_sidebar/interfaces'
import { ChannelType, GidUUID } from '../../../store/interfaces'
import { InternalFormData } from 'globalid-react-ui'
import { Identity } from '@globalid/identity-namespace-service-sdk'

export interface ChannelDetails {
  getChannelAvatar: (params?: GetChannelAvatarParams) => JSX.Element
  channelType: ChannelType
  description?: string | null
  memberUuids: GidUUID[]
  members: IdentityByUUID
  membersDescription: string
  title: string
  otherMemberIdentity?: Identity
  owner?: GidUUID | undefined
  groupUuid: GidUUID | undefined | null
  isBotChannel: boolean
}

export interface ChannelHeaderProps {
  channelId: string
  gidUuid: GidUUID
  showOwner: boolean | undefined
  readOnly: boolean
  hiddenMembers: boolean
}

export interface ChannelHeaderBarProps {
  channelAvatar: JSX.Element | undefined
  isGroup: boolean
  onOptionsClick: () => void
  settings: JSX.Element
  settingsRef: React.RefObject<HTMLDivElement>
  subtitle: string | null
  title: string
  channelId: string
  showVideoCall: boolean
}

export interface ChannelMembersSidebarProps extends Pick<RightSidebarProps, 'onExit' | 'open'> {
  channelId: string
  memberUuids: GidUUID[]
  owner?: GidUUID | undefined
  showOwner?: boolean
  channelType: ChannelType
}

export interface UpdateChannelHookProps {
  channelId: string
}

export interface UpdateChannelHook {
  onChannelUpdate: (formData: InternalFormData) => Promise<void>
  openChannelEditDialog: () => void
  closeChannelEditDialog: () => void
  editChannelOpen: boolean
}

export interface UseChannelHeaderResponse {
  openChannelSettings: () => void
  openMembersSidebar: () => void
  closeMembersSidebar: () => void
  closeChannelSettings: () => void
  channelSettingsOpen: boolean
  membersSidebarOpen: boolean
}

export interface GetChannelAvatarParams {
  avatarClassName?: string
  avatarWrapperClassName?: string
  badgePositionClassName?: string
}

export interface ChannelHeaderHookProps {
  channelId: string
}

export interface UseFetchMembersParams {
  memberUuids: string[]
  open: boolean
  channelId: string
}

export interface UseFetchMembersResult {
  members: IdentityByUUID
  isLoading: boolean
  isFetching: boolean
}
