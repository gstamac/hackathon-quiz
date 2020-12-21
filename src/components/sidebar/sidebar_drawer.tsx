import React from 'react'
import { Drawer } from '@material-ui/core'
import { useStyles } from './styles'
import clsx from 'clsx'
import { LayoutState, useLayoutState } from '../layouts/layout_context'

export interface SidebarDrawerProps {
  isMobileOrTablet: boolean
  openSideBar: boolean
  isLoading: boolean
  isLoggedIn: boolean
}
export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isLoggedIn,
  isMobileOrTablet,
  children,
  openSideBar,
  isLoading,
}: React.PropsWithChildren<SidebarDrawerProps>) => {
  const layoutState: LayoutState | undefined = useLayoutState()

  const {
    drawerOpen,
    drawerClose,
    toolbar,
    mobileOrTabletToolbar,
    drawer,
  } = useStyles({
    transition: !isLoading,
    isLoggedIn,
    isBrowserNotificationsPromptVisible: layoutState?.isBrowserNotificationsPromptVisible,
  })

  const clsxClasses = isMobileOrTablet ? {
    [drawerOpen]: openSideBar,
    [drawerClose]: !openSideBar,
    [mobileOrTabletToolbar]: openSideBar,
  } : {
    [toolbar]: true,
  }

  const paper = clsx(clsxClasses)

  return (
    <>
      <Drawer
        variant='permanent'
        className={drawer}
        role='drawer'
        transitionDuration={0}
        classes={{
          paper,
        }}
      >
        {children}
      </Drawer>
    </>
  )
}
