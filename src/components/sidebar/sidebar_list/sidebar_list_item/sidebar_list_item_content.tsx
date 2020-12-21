import React from 'react'
import { ListItemText, SvgIcon } from '@material-ui/core'
import { useStyles } from './style'
import { SidebarListItemContentProps } from './interfaces'
import NotificationMark from '../../../../assets/icons/notification_mark.svg'
import { getString } from '../../../../utils'

export const SidebarListItemContent: React.FC<SidebarListItemContentProps> = ({
  option,
  inset,
}: SidebarListItemContentProps) => {
  const { icon, postIcon, text } = option
  const classes = useStyles()
  const { listItemIcon, notificationMark, notificationMarkWrapper } = classes

  return (
    <>
      {option.notificationMark && <div className={notificationMarkWrapper} data-testid='notification mark'>
        <img className={notificationMark} src={NotificationMark} alt={getString('notification-mark')}/>
      </div>}
      {icon && <SvgIcon component={icon} />}
      <ListItemText
        className={`${icon ? listItemIcon : ''}`}
        inset={inset}
        disableTypography
      >
        {text}
      </ListItemText>
      {postIcon && <div className={classes.postIcon}>
        <SvgIcon component={postIcon} />
      </div>}
    </>
  )
}
