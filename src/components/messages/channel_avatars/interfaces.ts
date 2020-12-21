import { GeneralAvatarProps } from '../../global/general_avatar/interfaces'
import { ChannelWithParticipantsAndParsedMessage } from '../../../store/interfaces'
import { PublicIdentity, Identity } from '@globalid/identity-namespace-service-sdk'

export interface MultiAvatarProps {
  firstAvatar: GeneralAvatarProps
  secondAvatar: GeneralAvatarProps
  avatarWrapperClassName?: string
  channelFirstAvatarStyle?: string
  multiAvatarSize?: number
  multiAvatarBGColor?: string
}

export interface GetAvatarsByChannelTypeHookProps {
  channel: ChannelWithParticipantsAndParsedMessage
  firstParticipant?: PublicIdentity | Identity
  secondParticipant?: PublicIdentity | Identity
  avatarClassName?: string
  avatarWrapperClassName?: string
  channelFirstAvatarStyle?: string
  multiAvatarSize?: number
  multiAvatarBGColor?: string
}
