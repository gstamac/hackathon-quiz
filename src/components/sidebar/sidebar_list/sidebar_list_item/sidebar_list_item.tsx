import React from 'react'
import { ListItem } from '@material-ui/core'
import { SidebarListItemContent } from './sidebar_list_item_content'
import { SideBarListItemProps } from './interfaces'
import { Skeleton } from '../../../global/skeletons'
import { useStyles } from './style'
import { LinkComponentWrapper } from './link_wrapper'
import { useIsMobileOrTabletView } from '../../../global/helpers'
import clsx from 'clsx'

export const SidebarListItem: React.FC<SideBarListItemProps> = (
  props: SideBarListItemProps,
) => {
  const { option, openSideBar, inset, ...rest } = props

  const isMobileOrTablet: boolean = useIsMobileOrTabletView()

  const classes = useStyles()

  const listItemContent = <SidebarListItemContent
    option={option}
    expand={openSideBar}
    inset={inset}
  />

  return (
    <Skeleton
      component='span'
      className={clsx({ [classes.mobileSkeleton]: isMobileOrTablet, [classes.skeleton]: !isMobileOrTablet })}
    >
      <ListItem disableGutters {...rest} button disableTouchRipple>
        <LinkComponentWrapper {...option}>
          {listItemContent}
        </LinkComponentWrapper>
      </ListItem>
    </Skeleton>
  )
}
