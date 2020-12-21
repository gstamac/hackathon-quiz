import React from 'react'
import { ChannelMultiAvatar } from './channel_multi_avatar'
import { ChannelAvatar } from './channel_avatar'
import { GetAvatarsByChannelTypeHookProps } from './interfaces'
import { ChannelType } from '../../../store/interfaces'
import { AvatarVariant } from '../../global/general_avatar'

export const getAvatarByChannelType = (props: GetAvatarsByChannelTypeHookProps): JSX.Element => {
  const {
    channel,
    firstParticipant,
    secondParticipant,
    avatarClassName,
    avatarWrapperClassName,
    channelFirstAvatarStyle,
    multiAvatarSize,
    multiAvatarBGColor,
  } = props

  const channelType: ChannelType = (channel.type === ChannelType.MULTI && channel.participants.length === 1)
    ? ChannelType.PERSONAL
    : channel.type as ChannelType

  const getMultiAvatar = (): JSX.Element => <ChannelMultiAvatar
    firstAvatar={{
      uuid: firstParticipant?.gid_uuid,
      image_url: firstParticipant?.display_image_url,
    }}
    secondAvatar={{
      uuid: secondParticipant?.gid_uuid,
      image_url: secondParticipant?.display_image_url,
    }}
    avatarWrapperClassName={avatarWrapperClassName}
    channelFirstAvatarStyle={channelFirstAvatarStyle}
    multiAvatarSize={multiAvatarSize}
    multiAvatarBGColor={multiAvatarBGColor}
  />

  const getPersonAvatar = (): JSX.Element => <ChannelAvatar
    title={channel.title}
    image_url={firstParticipant?.display_image_url}
    uuid={firstParticipant?.gid_uuid}
    variant={AvatarVariant.Circle}
    className={avatarClassName}
  />

  const getGroupAvatar = (): JSX.Element => <ChannelAvatar
    title={channel.title}
    image_url={channel.image_url}
    uuid={channel.group_uuid ?? channel.uuid}
    variant={AvatarVariant.Rounded}
    className={avatarClassName}
  />

  const avatarChannelTypeMap: Map<ChannelType, JSX.Element> = new Map<ChannelType, JSX.Element>([
    [ChannelType.GROUP, getGroupAvatar()],
    [ChannelType.MULTI, getMultiAvatar()],
    [ChannelType.PERSONAL, getPersonAvatar()],
  ])

  return avatarChannelTypeMap.get(channelType) as JSX.Element
}
