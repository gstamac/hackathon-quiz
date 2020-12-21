import React from 'react'
import { useTheme, Theme } from '@material-ui/core'
import { useStyles } from './styles'
import { ChannelHeaderBarProps } from './interfaces'
import { OptionsIcon } from '../../global/icons/options_icon'
import { InitVideoCall } from '../../global/init_video_call'

export const ChannelHeaderBar: React.FC<ChannelHeaderBarProps> = ({
  channelAvatar,
  isGroup,
  onOptionsClick,
  settings,
  settingsRef,
  subtitle,
  title,
  channelId,
  showVideoCall,
}: ChannelHeaderBarProps) => {
  const theme: Theme = useTheme()
  const classes = useStyles()

  return (
    <>
      <div className={classes.headerWrapper}>
        <div className={classes.infoField}>
          <span className={classes.aliasText}>
            <div className={classes.icon}>{isGroup && channelAvatar}</div>
            <div className={isGroup ? classes.title : ''}>{title}</div>
          </span>
          <span className={`${classes.participantsText}${isGroup ? ` ${classes.participantsTextMargin}` : ''}`}>
            {subtitle}
          </span>
        </div>
        <div
          className={`${classes.settingsIcon}`}
        >
          {showVideoCall && <InitVideoCall channelId={channelId} />}
          <div
            className={classes.iconWrapper}
            data-testid='channel-options-button'
            onClick={onOptionsClick}
            ref={settingsRef}
          >
            {OptionsIcon(theme.palette.customColors.lightGrey)}
          </div>
        </div>
      </div>
      {settings}
    </>
  )
}
