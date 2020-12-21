import {
  Identity,
  MutualContact,
  PublicIdentity,
} from '@globalid/identity-namespace-service-sdk'
import { GidUUID, GroupMemberWithIdentityFields } from '../../store/interfaces'
import { ProfilePageTarget } from '../../utils/interfaces'
import { MemberItemResponse } from '@globalid/group-service-sdk'
import Fuse from 'fuse.js'

export type IdentityAlias = Identity | MutualContact | PublicIdentity | GroupMemberWithIdentityFields

export interface IdentityItem extends
  Identity,
  Omit<MutualContact, 'contact_uuid' | 'gid_name_moderation_status' | 'mutual' | 'status' | 'type'>,
  Omit<PublicIdentity, 'display_name' | 'purpose_personal' | 'purpose_professional' | 'purpose_recreational'>,
  Partial<Omit<MemberItemResponse, 'gid_uuid' | 'gid_name' | 'created_at'>>
{
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  showCheckbox?: boolean
  selectDisabled?: boolean
  isOwner?: boolean
  hideOwner?: boolean
  adornment?: JSX.Element
  adornmentCondition?: (item: IdentityItem) => boolean
  itemDisabled?: (item: IdentityItem) => boolean
  disabledItemTooltip?: string
  roleName?: string
  roleUuid?: string
  matches?: Fuse.FuseResultMatch [] | undefined
}

export interface IdentityListItemProps extends IdentityItem {
  profilePageTarget?: ProfilePageTarget
}

export interface IdentityListProps {
  listClassName?: string
  emptyListMessage: string
  hasNextPage: boolean
  height: number
  isLoading: boolean
  items?: IdentityAlias[]
  loadNextPage: () => void
  onSelect?: (gidUuid: GidUUID, selected: boolean) => void
  selectedIdentities?: GidUUID[]
  showSelection?: boolean
  excludeMe?: boolean
  handleBottomSelectionOverlap?: boolean
  selectDisabled?: boolean
  adornment?: JSX.Element
  adornmentCondition?: (item: IdentityItem) => boolean
  itemDisabled?: (item: IdentityItem) => boolean
  disabledItemTooltip?: string
}

export enum TextType {
  GID_NAME = 'gid_name',
  DISPLAY_NAME = 'display_name',
}
