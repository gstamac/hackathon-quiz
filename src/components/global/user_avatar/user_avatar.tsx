import React from 'react'
import clsx from 'clsx'
import { Avatar } from '@material-ui/core'
import { AvatarVariant, GeneralAvatar } from '../general_avatar'
import { UserAvatarProps } from './interfaces'
import { useStyles } from './styles'

export const UserAvatar: React.FC<UserAvatarProps> = ({
  className,
  gidUuid,
  imageUrl,
}: UserAvatarProps) => {
  const classes = useStyles()

  return (
    <Avatar className={clsx(classes.userAvatar, className)}>
      <GeneralAvatar
        className={classes.userAvatarImage}
        key={gidUuid}
        image_url={imageUrl}
        uuid={gidUuid} variant={AvatarVariant.Circle}
      />
    </Avatar>
  )
}
