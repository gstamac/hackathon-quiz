import React from 'react'
import { useMultiAvatarStyles } from './styles'
import { MultiAvatarProps } from './interfaces'
import { AvatarVariant, GeneralAvatar } from '../../global/general_avatar'
import clsx from 'clsx'

export const ChannelMultiAvatar: React.FC<MultiAvatarProps> = ({
  firstAvatar,
  secondAvatar,
  avatarWrapperClassName,
  channelFirstAvatarStyle,
  multiAvatarSize,
  multiAvatarBGColor,
}: MultiAvatarProps) => {

  const classes = useMultiAvatarStyles({
    size: multiAvatarSize,
    color: multiAvatarBGColor,
  })

  return (
    <div className={`${avatarWrapperClassName ?? classes.avatarWrapper}`}>
      <GeneralAvatar
        {...secondAvatar}
        className={clsx(classes.channelSecondAvatarPosition, classes.channelMultiAvatar)}
        variant={AvatarVariant.Circle}
      />
      <GeneralAvatar
        {...firstAvatar}
        className={clsx(channelFirstAvatarStyle, classes.channelFirstAvatarPosition, classes.channelFrontMultiAvatar)}
        variant={AvatarVariant.Circle}
      />
    </div>
  )
}
