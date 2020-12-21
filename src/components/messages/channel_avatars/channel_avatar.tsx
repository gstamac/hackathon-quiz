import React from 'react'
import { useStyles } from '../channels_list/styles'
import { GeneralAvatar, GeneralAvatarProps } from '../../global/general_avatar'

export const ChannelAvatar: React.FC<GeneralAvatarProps> = (props: GeneralAvatarProps) => {
  const classes = useStyles()

  return <GeneralAvatar {...props} className={classes.channelAvatar} />
}
