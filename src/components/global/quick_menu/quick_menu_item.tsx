import React, { useRef } from 'react'
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'

import { useStyles } from './styles'
import { QuickMenuItemProps } from './interfaces'
import { ToggledStateResult } from '../../../hooks/interfaces'
import { useToggledState } from '../../../hooks/use_toggled_state'
import { isString } from 'lodash'
import { getString } from '../../../utils'

const getItemContent = (
  content: string | JSX.Element,
  inProgress: boolean
): JSX.Element => inProgress
  ? <ListItemText>{getString('loading')}</ListItemText>
  : isString(content)
    ? <ListItemText>{content}</ListItemText>
    : content

const getIcon = (icon?: JSX.Element): JSX.Element | string => icon
  ? <ListItemIcon>{icon}</ListItemIcon>
  : ''

export const QuickMenuItem: React.FC<QuickMenuItemProps> = (item: QuickMenuItemProps) => {
  const classes = useStyles()

  const menuItemRef: React.RefObject<HTMLLIElement> = useRef<HTMLLIElement>(null)

  const [inProgress, triggerToggle]: ToggledStateResult = useToggledState({
    initialState: false,
    mounted: menuItemRef.current !== null,
    condition: () => !item.disabled,
    command: item.onClick,
  })

  if (item.hidden) {
    return null
  }

  return (<MenuItem
    className={classes.quickMenuItem}
    onClick={triggerToggle}
    disabled={inProgress || item.disabled}
    divider={true}
    disableGutters={true}
    key={item.id}
    ref={menuItemRef}
  >
    {getIcon(item.icon)}
    {getItemContent(item.text, inProgress)}
  </MenuItem>
  )}
