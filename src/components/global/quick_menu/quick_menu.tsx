import React from 'react'
import clsx from 'clsx'
import {
  List,
} from '@material-ui/core'
import {
  QuickMenuItemProps,
  QuickMenuProps,
} from './interfaces'
import { useStyles } from './styles'
import { useIsMobileOrTabletView } from '../helpers'
import { BottomDrawer } from '../bottom_drawer'
import { GlobalidLoader } from '../loading/globalid_loader'
import { Popover } from '../popover'
import { QuickMenuItem } from './quick_menu_item'

export const QuickMenu: React.FC<QuickMenuProps> = ({
  className,
  compact = false,
  items,
  onClose,
  open,
  title = '',
  ...properties
}: QuickMenuProps) => {
  const classes = useStyles()

  const getContent = (): JSX.Element => (items === undefined ?
    <div className={classes.quickMenuLoaderWrapper}>
      <GlobalidLoader />
    </div>
    :
    <List
      disablePadding={true}
    >
      {items.map((item: QuickMenuItemProps) => <QuickMenuItem key={item.id} {...item}/>)}
    </List>
  )

  const createQuickMenu = (): JSX.Element => (
    <Popover
      className={clsx(
        classes.quickMenuRoot,
        {[classes.quickMenuCompactRoot]: compact},
        className
      )}
      compact={compact}
      onClose={onClose}
      open={open}
      {...properties}
    >
      {getContent()}
    </Popover>
  )

  const createQuickMenuForMobile = (): JSX.Element => (
    <BottomDrawer
      className={clsx(classes.quickMenuRoot, className)}
      onClose={onClose}
      open={open}
      title={title}
    >
      {getContent()}
    </BottomDrawer>
  )

  return useIsMobileOrTabletView() ? createQuickMenuForMobile() : createQuickMenu()
}
